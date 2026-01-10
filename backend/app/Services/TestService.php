<?php

namespace App\Services;

use App\Models\Test;
use App\Models\Question;
use App\Models\Admin;
use Illuminate\Support\Facades\DB;

class TestService
{
    public function getAllTests($filters = [], $perPage = 15)
    {
        $query = Test::query();

        if (!empty($filters['search'])) {
            $query->where('title', 'like', "%{$filters['search']}%")
                  ->orWhere('description', 'like', "%{$filters['search']}%");
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['age_group']) && $filters['age_group'] !== 'all') {
            $query->where('age_group', $filters['age_group']);
        }

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function createTest(array $data, Admin $admin)
    {
        DB::beginTransaction();

        try {
            $testId = 'TEST' . date('Ym') . strtoupper(substr(md5(uniqid()), 0, 6));

            $test = Test::create([
                'test_id' => $testId,
                'title' => $data['title'],
                'slug' => $this->generateSlug($data['title']),
                'description' => $data['description'] ?? null,
                'type' => $data['type'],
                'category' => $data['category'],
                'age_group' => $data['age_group'],
                'duration' => $data['duration'] ?? null,
                'total_questions' => $data['total_questions'] ?? 0,
                'passing_score' => $data['passing_score'] ?? 60,
                'max_attempts' => $data['max_attempts'] ?? 1,
                'price' => $data['price'] ?? 0,
                'is_free' => $data['is_free'] ?? ($data['price'] == 0),
                'is_active' => $data['is_active'] ?? true,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'settings' => $data['settings'] ?? null
            ]);

            DB::commit();
            return $test;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateTest(Test $test, array $data)
    {
        DB::beginTransaction();

        try {
            if (isset($data['title'])) {
                $data['slug'] = $this->generateSlug($data['title'], $test->id);
            }

            if (isset($data['price'])) {
                $data['is_free'] = $data['price'] == 0;
            }

            $test->update($data);

            DB::commit();
            return $test;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteTest(Test $test)
    {
        DB::beginTransaction();

        try {
            $test->questions()->detach();
            $test->delete();

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function addQuestionsToTest(Test $test, array $questionIds)
    {
        $existingQuestionIds = $test->questions()->pluck('questions.id')->toArray();
        $newQuestionIds = array_diff($questionIds, $existingQuestionIds);

        if (!empty($newQuestionIds)) {
            $maxOrder = $test->questions()->max('test_questions.order') ?? 0;

            foreach ($newQuestionIds as $questionId) {
                $test->questions()->attach($questionId, [
                    'order' => ++$maxOrder,
                    'marks' => 1
                ]);
            }

            $test->update(['total_questions' => $test->questions()->count()]);
        }

        return count($newQuestionIds);
    }

    public function removeQuestionsFromTest(Test $test, array $questionIds)
    {
        $detached = $test->questions()->detach($questionIds);

        if ($detached > 0) {
            $test->update(['total_questions' => $test->questions()->count()]);
        }

        return $detached;
    }

    public function reorderTestQuestions(Test $test, array $questionOrder)
    {
        foreach ($questionOrder as $item) {
            $test->questions()->updateExistingPivot($item['question_id'], [
                'order' => $item['order'],
                'marks' => $item['marks'] ?? 1
            ]);
        }
    }

    public function importQuestionsFromCsv(Test $test, $csvData, $filters = [])
    {
        $lines = explode("\n", trim($csvData));
        if (count($lines) < 2) {
            throw new \Exception("CSV must have a header row and at least one data row");
        }

        $headers = str_getcsv(strtolower($lines[0]));
        $questionIndex = array_search('question', $headers);
        $categoryIndex = array_search('category', $headers);
        $ageGroupIndex = array_search('age_group', $headers);
        $difficultyIndex = array_search('difficulty', $headers);

        if ($questionIndex === false) {
            throw new \Exception("CSV must contain 'question' column");
        }

        $imported = 0;
        $skipped = 0;
        $questionIds = [];

        for ($i = 1; $i < count($lines); $i++) {
            $values = str_getcsv($lines[$i]);
            if (count($values) < 1) continue;

            $questionText = $values[$questionIndex] ?? '';
            $category = $values[$categoryIndex] ?? null;
            $ageGroup = $values[$ageGroupIndex] ?? null;
            $difficulty = $values[$difficultyIndex] ?? null;

            if (empty($questionText)) {
                $skipped++;
                continue;
            }

            $query = Question::where('question', 'like', "%{$questionText}%");

            if ($category && !empty($filters['category_filter'])) {
                $query->where('category', $filters['category_filter']);
            } elseif ($category) {
                $query->where('category', $category);
            }

            if ($ageGroup && !empty($filters['age_group_filter'])) {
                $query->where('age_group', $filters['age_group_filter']);
            } elseif ($ageGroup) {
                $query->where('age_group', $ageGroup);
            }

            if ($difficulty && !empty($filters['difficulty_filter'])) {
                $query->where('difficulty', $filters['difficulty_filter']);
            } elseif ($difficulty) {
                $query->where('difficulty', $difficulty);
            }

            $question = $query->first();

            if ($question && !in_array($question->id, $questionIds)) {
                $questionIds[] = $question->id;
                $imported++;
            } else {
                $skipped++;
            }
        }

        if (!empty($questionIds)) {
            $this->addQuestionsToTest($test, $questionIds);
        }

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'question_ids' => $questionIds
        ];
    }

    public function exportTestQuestions(Test $test)
    {
        $questions = $test->questions()
            ->orderBy('test_questions.order')
            ->get(['questions.id', 'question', 'category', 'age_group', 'difficulty', 'options', 'explanation']);

        $csvContent = "question,category,age_group,difficulty,option_a,option_b,option_c,option_d,correct_answer,explanation\n";

        foreach ($questions as $question) {
            $options = json_decode($question->options, true);
            $correctAnswer = '';

            foreach ($options as $option) {
                if ($option['is_correct']) {
                    $correctAnswer = $option['id'];
                    break;
                }
            }

            $csvContent .= '"' . str_replace('"', '""', $question->question) . '",';
            $csvContent .= '"' . $question->category . '",';
            $csvContent .= '"' . $question->age_group . '",';
            $csvContent .= '"' . $question->difficulty . '",';
            $csvContent .= '"' . str_replace('"', '""', $options[0]['text'] ?? '') . '",';
            $csvContent .= '"' . str_replace('"', '""', $options[1]['text'] ?? '') . '",';
            $csvContent .= '"' . str_replace('"', '""', $options[2]['text'] ?? '') . '",';
            $csvContent .= '"' . str_replace('"', '""', $options[3]['text'] ?? '') . '",';
            $csvContent .= '"' . $correctAnswer . '",';
            $csvContent .= '"' . str_replace('"', '""', $question->explanation ?? '') . '"';
            $csvContent .= "\n";
        }

        return $csvContent;
    }

    public function getTestStatistics(Test $test)
    {
        $attempts = $test->attempts()->where('status', 'completed')->get();

        $totalAttempts = $attempts->count();
        $averageScore = $totalAttempts > 0 ? $attempts->avg('percentage') : 0;
        $completionRate = $totalAttempts > 0 ? ($attempts->where('status', 'completed')->count() / $totalAttempts) * 100 : 0;

        $scoreDistribution = [
            '0-40' => $attempts->where('percentage', '<', 40)->count(),
            '40-60' => $attempts->whereBetween('percentage', [40, 60])->count(),
            '60-80' => $attempts->whereBetween('percentage', [60, 80])->count(),
            '80-100' => $attempts->where('percentage', '>=', 80)->count()
        ];

        $recentAttempts = $attempts->sortByDesc('completed_at')->take(10);

        return [
            'total_attempts' => $totalAttempts,
            'average_score' => round($averageScore, 2),
            'completion_rate' => round($completionRate, 2),
            'score_distribution' => $scoreDistribution,
            'passing_rate' => $totalAttempts > 0 ? ($attempts->where('percentage', '>=', $test->passing_score)->count() / $totalAttempts) * 100 : 0,
            'recent_attempts' => $recentAttempts,
            'questions_count' => $test->questions()->count(),
            'active_students' => $attempts->pluck('student_id')->unique()->count()
        ];
    }

    public function bulkDeleteTests(array $testIds)
    {
        $deleted = 0;

        foreach ($testIds as $testId) {
            $test = Test::find($testId);
            if ($test) {
                $this->deleteTest($test);
                $deleted++;
            }
        }

        return $deleted;
    }

    public function bulkUpdateStatus(array $testIds, $status)
    {
        return Test::whereIn('id', $testIds)->update(['status' => $status]);
    }

    private function generateSlug($title, $excludeId = null)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $originalSlug = $slug;
        $counter = 1;

        $query = Test::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
            
            $query = Test::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}