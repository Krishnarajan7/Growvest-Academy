<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\AgeGroup;
use App\Models\Admin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QuestionService
{
    public function getAllQuestions($filters = [], $perPage = 15)
    {
        $query = Question::with(['creator', 'updater']);

        // Apply filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['age_group']) && $filters['age_group'] !== 'all') {
            $query->where('age_group', $filters['age_group']);
        }

        if (!empty($filters['difficulty']) && $filters['difficulty'] !== 'all') {
            $query->where('difficulty', $filters['difficulty']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Apply sorting
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }

    public function createQuestion(array $data, Admin $admin)
    {
        DB::beginTransaction();

        try {
            // Format options correctly
            $options = [];
            foreach ($data['options'] as $index => $option) {
                $options[] = [
                    'id' => $option['id'],
                    'text' => $option['text'],
                    'is_correct' => $option['is_correct'] ?? false
                ];
            }

            $question = Question::create([
                'question' => $data['question'],
                'explanation' => $data['explanation'] ?? null,
                'category' => $data['category'],
                'age_group' => $data['age_group'],
                'difficulty' => $data['difficulty'],
                'options' => $options,
                'is_active' => $data['is_active'] ?? true,
                'order' => $data['order'] ?? 0,
                'created_by' => $admin->id,
                'updated_by' => $admin->id
            ]);

            // Update category and age group counts
            $this->updateCategoryCount($data['category']);
            $this->updateAgeGroupCount($data['age_group']);

            DB::commit();
            return $question;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateQuestion(Question $question, array $data, Admin $admin)
    {
        DB::beginTransaction();

        try {
            $oldCategory = $question->category;
            $oldAgeGroup = $question->age_group;

            // Format options if provided
            if (isset($data['options'])) {
                $options = [];
                foreach ($data['options'] as $option) {
                    $options[] = [
                        'id' => $option['id'],
                        'text' => $option['text'],
                        'is_correct' => $option['is_correct'] ?? false
                    ];
                }
                $data['options'] = $options;
            }

            $data['updated_by'] = $admin->id;
            $question->update($data);

            // Update counts if category or age group changed
            if ($oldCategory !== $question->category) {
                $this->updateCategoryCount($oldCategory);
                $this->updateCategoryCount($question->category);
            }

            if ($oldAgeGroup !== $question->age_group) {
                $this->updateAgeGroupCount($oldAgeGroup);
                $this->updateAgeGroupCount($question->age_group);
            }

            DB::commit();
            return $question;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteQuestion(Question $question)
    {
        DB::beginTransaction();

        try {
            $category = $question->category;
            $ageGroup = $question->age_group;

            $question->delete();

            // Update counts
            $this->updateCategoryCount($category);
            $this->updateAgeGroupCount($ageGroup);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function bulkDeleteQuestions(array $questionIds)
    {
        $deleted = 0;
        
        foreach ($questionIds as $questionId) {
            $question = Question::find($questionId);
            if ($question) {
                $this->deleteQuestion($question);
                $deleted++;
            }
        }

        return $deleted;
    }

    public function bulkUpdateStatus(array $questionIds, bool $status)
    {
        return Question::whereIn('id', $questionIds)->update(['is_active' => $status]);
    }

    public function duplicateQuestion(Question $question, Admin $admin)
    {
        $newQuestion = $question->replicate();
        $newQuestion->question = $question->question . ' (Copy)';
        $newQuestion->created_by = $admin->id;
        $newQuestion->updated_by = $admin->id;
        $newQuestion->view_count = 0;
        $newQuestion->attempt_count = 0;
        $newQuestion->correct_count = 0;
        $newQuestion->save();

        $this->updateCategoryCount($newQuestion->category);
        $this->updateAgeGroupCount($newQuestion->age_group);

        return $newQuestion;
    }

    public function importFromCsv($csvData, Admin $admin)
    {
        $lines = explode("\n", trim($csvData));
        $headers = str_getcsv(strtolower($lines[0]));
        
        $imported = 0;
        $failed = 0;
        $errors = [];

        // Find column indices
        $questionIndex = array_search('question', $headers);
        $categoryIndex = array_search('category', $headers);
        $ageGroupIndex = array_search('age_group', $headers);
        $difficultyIndex = array_search('difficulty', $headers);
        $optionAIndex = array_search('option_a', $headers);
        $optionBIndex = array_search('option_b', $headers);
        $optionCIndex = array_search('option_c', $headers);
        $optionDIndex = array_search('option_d', $headers);
        $correctIndex = array_search('correct_answer', $headers);
        $explanationIndex = array_search('explanation', $headers);

        // Validate required columns
        if ($questionIndex === false || $categoryIndex === false) {
            throw new \Exception("CSV must contain 'question' and 'category' columns");
        }

        for ($i = 1; $i < count($lines); $i++) {
            try {
                $values = str_getcsv($lines[$i]);
                
                if (count($values) < 3) {
                    throw new \Exception("Row {$i}: Insufficient data");
                }

                // Extract values
                $questionText = $values[$questionIndex] ?? '';
                $category = $values[$categoryIndex] ?? 'general-knowledge';
                $ageGroup = $values[$ageGroupIndex] ?? '9-11';
                $difficulty = strtolower($values[$difficultyIndex] ?? 'medium');
                $optionA = $values[$optionAIndex] ?? '';
                $optionB = $values[$optionBIndex] ?? '';
                $optionC = $values[$optionCIndex] ?? '';
                $optionD = $values[$optionDIndex] ?? '';
                $correctAnswer = strtolower($values[$correctIndex] ?? 'a');
                $explanation = $values[$explanationIndex] ?? null;

                // Validate required fields
                if (empty($questionText)) {
                    throw new \Exception("Row {$i}: Question text is required");
                }

                // Validate options
                $options = [];
                $optionData = [
                    ['id' => 'a', 'text' => $optionA],
                    ['id' => 'b', 'text' => $optionB],
                    ['id' => 'c', 'text' => $optionC],
                    ['id' => 'd', 'text' => $optionD]
                ];

                foreach ($optionData as $index => $option) {
                    if (empty($option['text'])) {
                        throw new \Exception("Row {$i}: Option {$option['id']} is required");
                    }
                    $options[] = [
                        'id' => $option['id'],
                        'text' => $option['text'],
                        'is_correct' => $option['id'] === $correctAnswer
                    ];
                }

                // Validate at least one correct option
                if (!in_array($correctAnswer, ['a', 'b', 'c', 'd'])) {
                    throw new \Exception("Row {$i}: Correct answer must be a, b, c, or d");
                }

                // Create question
                $this->createQuestion([
                    'question' => $questionText,
                    'category' => $category,
                    'age_group' => $ageGroup,
                    'difficulty' => in_array($difficulty, ['easy', 'medium', 'hard']) ? $difficulty : 'medium',
                    'options' => $options,
                    'explanation' => $explanation,
                    'is_active' => true
                ], $admin);

                $imported++;

            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Row {$i}: " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'failed' => $failed,
            'errors' => $errors
        ];
    }

    public function exportQuestions($filters = [])
    {
        $query = Question::query();

        // Apply filters
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['age_group']) && $filters['age_group'] !== 'all') {
            $query->where('age_group', $filters['age_group']);
        }

        if (!empty($filters['difficulty']) && $filters['difficulty'] !== 'all') {
            $query->where('difficulty', $filters['difficulty']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->get();
    }

    public function getQuestionStatistics()
    {
        $total = Question::count();
        $active = Question::where('is_active', true)->count();
        $inactive = $total - $active;

        // By category
        $categories = QuestionCategory::where('is_active', true)->get();
        $byCategory = [];
        foreach ($categories as $category) {
            $byCategory[$category->slug] = [
                'name' => $category->name,
                'color' => $category->color,
                'count' => Question::where('category', $category->slug)->count()
            ];
        }

        // By age group
        $ageGroups = AgeGroup::where('is_active', true)->get();
        $byAgeGroup = [];
        foreach ($ageGroups as $ageGroup) {
            $byAgeGroup[$ageGroup->slug] = [
                'name' => $ageGroup->name,
                'count' => Question::where('age_group', $ageGroup->slug)->count()
            ];
        }

        // By difficulty
        $byDifficulty = [
            'easy' => Question::where('difficulty', 'easy')->count(),
            'medium' => Question::where('difficulty', 'medium')->count(),
            'hard' => Question::where('difficulty', 'hard')->count()
        ];

        // Recent activity
        $recentQuestions = Question::with('creator')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'by_category' => $byCategory,
            'by_age_group' => $byAgeGroup,
            'by_difficulty' => $byDifficulty,
            'recent_questions' => $recentQuestions,
            'total_views' => Question::sum('view_count'),
            'total_attempts' => Question::sum('attempt_count'),
            'success_rate' => $total > 0 ? round(Question::sum('correct_count') / Question::sum('attempt_count') * 100, 2) : 0
        ];
    }

    private function updateCategoryCount($categorySlug)
    {
        $category = QuestionCategory::where('slug', $categorySlug)->first();
        if ($category) {
            $category->updateQuestionCount();
        }
    }

    private function updateAgeGroupCount($ageGroupSlug)
    {
        $ageGroup = AgeGroup::where('slug', $ageGroupSlug)->first();
        if ($ageGroup) {
            $ageGroup->updateQuestionCount();
        }
    }
}