<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Services\TestTakingService;
use Illuminate\Http\Request;
use App\Models\Test;
use App\Models\Question;

use App\Models\QuestionCategory;
use App\Models\TestAttempt;
use Illuminate\Support\Facades\Validator;

class TestTakingController extends Controller
{
    protected $testTakingService;
    
    public function __construct(TestTakingService $testTakingService)
    {
        $this->testTakingService = $testTakingService;
    }
    
    public function getAvailableTests(Request $request)
    {
        $filters = $request->only(['category', 'age_group', 'type', 'is_free']);
        $studentId = $request->user()->id;
        
        $tests = $this->testTakingService->getAvailableTests($studentId, $filters);
        
        return response()->json([
            'success' => true,
            'data' => $tests
        ]);
    }
    
    public function startTest(Request $request, $testId)
    {
        $studentId = $request->user()->id;
        
        try {
            $attempt = $this->testTakingService->startTest($testId, $studentId);
            
            return response()->json([
                'success' => true,
                'message' => 'Test started successfully',
                'data' => $attempt
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    public function getTestQuestions(Request $request, $testId)
    {
        try {
            $questions = $this->testTakingService->getTestQuestions($testId);
            
            return response()->json([
                'success' => true,
                'data' => $questions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    public function submitAnswer(Request $request, $attemptId)
    {
        $validator = Validator::make($request->all(), [
            'question_id' => 'required|exists:questions,id',
            'selected_option' => 'required|in:a,b,c,d'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $result = $this->testTakingService->submitAnswer(
                $attemptId,
                $request->question_id,
                $request->selected_option
            );
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    public function completeTest(Request $request, $attemptId)
    {
        $validator = Validator::make($request->all(), [
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'required|in:a,b,c,d'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $attempt = $this->testTakingService->completeTest($attemptId, $request->answers);
            
            return response()->json([
                'success' => true,
                'message' => 'Test completed successfully',
                'data' => $attempt
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    public function getTestResult(Request $request, $attemptId)
    {
        try {
            $result = $this->testTakingService->getTestResult($attemptId);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    public function getStudentAttempts(Request $request)
    {
        $studentId = $request->user()->id;
        $filters = $request->only(['status', 'test_id', 'per_page']);
        
        $attempts = $this->testTakingService->getStudentAttempts($studentId, $filters);
        
        return response()->json([
            'success' => true,
            'data' => $attempts
        ]);
    }
    
    public function getAttemptDetails(Request $request, $attemptId)
    {
        $studentId = $request->user()->id;
        
        $attempt = TestAttempt::where('id', $attemptId)
            ->where('student_id', $studentId)
            ->firstOrFail();
        
        $result = $this->testTakingService->getTestResult($attemptId);
        
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
    public function getTestByCategory(string $slug)
{
    $questions = Question::where('category', $slug)
        ->where('is_active', true)
        ->get()
        ->map(function ($q) {

            $correctOption = null;

            // options is stored as JSON
            $rawOptions = is_string($q->options)
                ? json_decode($q->options, true)
                : $q->options;

            $options = collect($rawOptions)->map(function ($opt) use (&$correctOption) {

                if (!empty($opt['is_correct'])) {
                    $correctOption = $opt['id']; // a / b / c / d
                }

                return [
                    'id' => $opt['id'],
                    'text' => $opt['text'],
                ];
            })->values();

            return [
                'id' => $q->id,
                'question' => $q->question,
                'options' => $options,
                'correct_option' => $correctOption,
            ];
        });

    return response()->json($questions);
}
    public function quickSave(Request $request)
{
    $data = $request->validate([
        'student_name' => 'required|string',
        'age' => 'required|integer',
        'category' => 'required|string',
        'total_questions' => 'required|integer',
        'correct_answers' => 'required|integer',
        'percentage' => 'required|numeric',
        'answers' => 'required|array',
    ]);

    $student = $request->user();

    $attempt = TestAttempt::create([
        'test_id' => null,                 // category-based test
        'student_id' => $student->id,      
        'attempt_number' => 1,
        'started_at' => now(),
        'completed_at' => now(),
        'time_spent' => null,
        'total_questions' => $data['total_questions'],
        'questions_attempted' => count($data['answers']),
        'correct_answers' => $data['correct_answers'],
        'percentage' => $data['percentage'],
        'score' => $data['percentage'],
        'status' => 'completed',
        'answers' => $data['answers'],
        'result_details' => [
            'student_name' => $data['student_name'],
            'age' => $data['age'],
            'category' => $data['category'],
        ],
    ]);

    return response()->json([
        'success' => true,
        'attempt_id' => $attempt->id,
    ]);
}



}