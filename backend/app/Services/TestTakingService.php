<?php

namespace App\Services;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TestTakingService
{
    public function startTest($testId, $studentId)
    {
        DB::beginTransaction();
        
        try {
            $test = Test::findOrFail($testId);
            $student = Student::findOrFail($studentId);
            
            $existingAttempt = TestAttempt::where('test_id', $testId)
                ->where('student_id', $studentId)
                ->where('status', 'in_progress')
                ->first();
            
            if ($existingAttempt) {
                return $existingAttempt;
            }
            
            $attemptCount = TestAttempt::where('test_id', $testId)
                ->where('student_id', $studentId)
                ->count();
            
            if ($attemptCount >= $test->max_attempts) {
                throw new \Exception('Maximum attempts reached for this test');
            }
            
            $attempt = TestAttempt::create([
                'attempt_id' => 'ATT' . time() . rand(1000, 9999),
                'test_id' => $testId,
                'student_id' => $studentId,
                'attempt_number' => $attemptCount + 1,
                'started_at' => now(),
                'total_questions' => $test->total_questions,
                'status' => 'in_progress'
            ]);
            
            DB::commit();
            return $attempt;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function getTestQuestions($testId)
    {
        $test = Test::with(['questions' => function($query) {
            $query->select('questions.id', 'question', 'options', 'difficulty')
                  ->orderBy('test_questions.order');
        }])->findOrFail($testId);
        
        $questions = $test->questions->map(function($question) {
            return [
                'id' => $question->id,
                'question' => $question->question,
                'options' => $question->options,
                'difficulty' => $question->difficulty
            ];
        });
        
        return [
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'duration' => $test->duration,
                'total_questions' => $test->total_questions
            ],
            'questions' => $questions
        ];
    }
    
    public function submitAnswer($attemptId, $questionId, $selectedOption)
    {
        DB::beginTransaction();
        
        try {
            $attempt = TestAttempt::findOrFail($attemptId);
            
            if ($attempt->status !== 'in_progress') {
                throw new \Exception('Test attempt is not in progress');
            }
            
            $question = DB::table('questions')->find($questionId);
            
            if (!$question) {
                throw new \Exception('Question not found');
            }
            
            $options = json_decode($question->options, true);
            $isCorrect = false;
            
            foreach ($options as $option) {
                if ($option['id'] === $selectedOption && $option['is_correct']) {
                    $isCorrect = true;
                    break;
                }
            }
            
            DB::table('test_answers')->updateOrInsert(
                [
                    'attempt_id' => $attemptId,
                    'question_id' => $questionId
                ],
                [
                    'selected_option' => $selectedOption,
                    'is_correct' => $isCorrect,
                    'updated_at' => now()
                ]
            );
            
            DB::commit();
            
            return [
                'is_correct' => $isCorrect,
                'correct_answer' => $this->getCorrectAnswer($options)
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function completeTest($attemptId, $answers)
    {
        DB::beginTransaction();
        
        try {
            $attempt = TestAttempt::findOrFail($attemptId);
            
            if ($attempt->status !== 'in_progress') {
                throw new \Exception('Test attempt is not in progress');
            }
            
            $totalQuestions = $attempt->total_questions;
            $correctAnswers = 0;
            $questionsAttempted = 0;
            
            foreach ($answers as $answer) {
                $question = DB::table('questions')->find($answer['question_id']);
                
                if ($question) {
                    $options = json_decode($question->options, true);
                    $isCorrect = false;
                    
                    foreach ($options as $option) {
                        if ($option['id'] === $answer['selected_option'] && $option['is_correct']) {
                            $isCorrect = true;
                            $correctAnswers++;
                            break;
                        }
                    }
                    
                    DB::table('test_answers')->updateOrInsert(
                        [
                            'attempt_id' => $attemptId,
                            'question_id' => $answer['question_id']
                        ],
                        [
                            'selected_option' => $answer['selected_option'],
                            'is_correct' => $isCorrect,
                            'updated_at' => now()
                        ]
                    );
                    
                    $questionsAttempted++;
                }
            }
            
            $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
            
            $attempt->update([
                'completed_at' => now(),
                'time_spent' => now()->diffInSeconds($attempt->started_at),
                'questions_attempted' => $questionsAttempted,
                'correct_answers' => $correctAnswers,
                'score' => $correctAnswers,
                'percentage' => round($score, 2),
                'status' => 'completed',
                'answers' => json_encode($answers)
            ]);
            
            $this->updateTestStatistics($attempt->test_id);
            
            DB::commit();
            
            return $attempt;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function getTestResult($attemptId)
    {
        $attempt = TestAttempt::with(['test', 'student'])
            ->findOrFail($attemptId);
        
        $answers = DB::table('test_answers')
            ->join('questions', 'test_answers.question_id', '=', 'questions.id')
            ->where('attempt_id', $attemptId)
            ->select(
                'test_answers.*',
                'questions.question',
                'questions.options',
                'questions.explanation'
            )
            ->get();
        
        $test = $attempt->test;
        $isPassed = $attempt->percentage >= $test->passing_score;
        
        return [
            'attempt' => $attempt,
            'answers' => $answers,
            'test' => $test,
            'is_passed' => $isPassed,
            'result_summary' => [
                'total_questions' => $attempt->total_questions,
                'questions_attempted' => $attempt->questions_attempted,
                'correct_answers' => $attempt->correct_answers,
                'score' => $attempt->score,
                'percentage' => $attempt->percentage,
                'time_spent' => $attempt->time_spent,
                'passing_score' => $test->passing_score,
                'status' => $attempt->status
            ]
        ];
    }
    
    public function getStudentAttempts($studentId, $filters = [])
    {
        $query = TestAttempt::with(['test'])
            ->where('student_id', $studentId)
            ->orderBy('created_at', 'desc');
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (!empty($filters['test_id'])) {
            $query->where('test_id', $filters['test_id']);
        }
        
        return $query->paginate($filters['per_page'] ?? 15);
    }
    
    public function getAvailableTests($studentId, $filters = [])
    {
        $query = Test::where('is_active', true)
            ->where('status', 'published')
            ->where(function($q) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            });
        
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        
        if (!empty($filters['age_group'])) {
            $query->where('age_group', $filters['age_group']);
        }
        
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (isset($filters['is_free'])) {
            $query->where('is_free', filter_var($filters['is_free'], FILTER_VALIDATE_BOOLEAN));
        }
        
        $tests = $query->orderBy('created_at', 'desc')->get();
        
        return $tests->map(function($test) use ($studentId) {
            $attemptCount = TestAttempt::where('test_id', $test->id)
                ->where('student_id', $studentId)
                ->count();
            
            $canAttempt = $attemptCount < $test->max_attempts;
            
            return [
                'id' => $test->id,
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'type' => $test->type,
                'category' => $test->category,
                'age_group' => $test->age_group,
                'duration' => $test->duration,
                'total_questions' => $test->total_questions,
                'price' => $test->price,
                'is_free' => $test->is_free,
                'attempt_count' => $attemptCount,
                'max_attempts' => $test->max_attempts,
                'can_attempt' => $canAttempt,
                'average_score' => $test->average_score,
                'completion_rate' => $test->completion_rate,
                'total_attempts' => $test->total_attempts
            ];
        });
    }
    
    private function getCorrectAnswer($options)
    {
        foreach ($options as $option) {
            if ($option['is_correct']) {
                return $option['id'];
            }
        }
        return null;
    }
    
    private function updateTestStatistics($testId)
    {
        $test = Test::find($testId);
        
        if ($test) {
            $attempts = TestAttempt::where('test_id', $testId)
                ->where('status', 'completed')
                ->get();
            
            if ($attempts->count() > 0) {
                $totalAttempts = $attempts->count();
                $averageScore = $attempts->avg('percentage');
                $completionRate = ($attempts->where('status', 'completed')->count() / $totalAttempts) * 100;
                
                $test->update([
                    'total_attempts' => $totalAttempts,
                    'average_score' => round($averageScore, 2),
                    'completion_rate' => round($completionRate, 2)
                ]);
            }
        }
    }
}