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
            foreach ($data['options'] as $option) {
                $options[] = [
                    'id' => $option['id'],
                    'text' => $option['text'],
                    'is_correct' => $option['is_correct'] ?? false
                ];
            }

            $question = Question::create([
                'question'     => $data['question'],
                'explanation'  => $data['explanation'] ?? null,
                'category'     => $data['category'],
                'age_group'    => $data['age_group'],
                'difficulty'   => $data['difficulty'],
                'options'      => $options,
                'is_active'    => $data['is_active'] ?? true,
                'order'        => $data['order'] ?? 0,
                'created_by'   => $admin->id,
                'updated_by'   => $admin->id
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

    /**
     * Bulk import questions from CSV content
     *
     * @param string $csvContent Raw CSV string (usually from file_get_contents)
     * @param Admin $admin
     * @return array [imported, failed, errors]
     * @throws \Exception
     */
    public function importFromCsv($csvContent, Admin $admin)
    {
        DB::beginTransaction();

        $imported = 0;
        $failed = 0;
        $errors = [];

        try {
            $lines = explode("\n", trim($csvContent));
            if (count($lines) < 2) {
                throw new \Exception("CSV file is empty or contains only headers");
            }

            $headers = str_getcsv(strtolower($lines[0]));

            // Find column indices
            $questionIndex    = array_search('question', $headers);
            $categoryIndex    = array_search('category', $headers);
            $ageGroupIndex    = array_search('age_group', $headers);
            $difficultyIndex  = array_search('difficulty', $headers);
            $optionAIndex     = array_search('option_a', $headers);
            $optionBIndex     = array_search('option_b', $headers);
            $optionCIndex     = array_search('option_c', $headers);
            $optionDIndex     = array_search('option_d', $headers);
            $correctIndex     = array_search('correct_answer', $headers);
            $explanationIndex = array_search('explanation', $headers);

            // Required columns
            if ($questionIndex === false || $categoryIndex === false) {
                throw new \Exception("CSV must contain at least 'question' and 'category' columns");
            }

            for ($i = 1; $i < count($lines); $i++) {
                $row = trim($lines[$i]);
                if (empty($row)) continue;

                $values = str_getcsv($row);

                if (count($values) < 3) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": Insufficient data";
                    continue;
                }

                // Extract values with fallback
                $questionText = trim($values[$questionIndex] ?? '');
                $categorySlug = trim($values[$categoryIndex] ?? '');
                $ageGroupSlug = trim($values[$ageGroupIndex] ?? '');
                $difficulty   = strtolower(trim($values[$difficultyIndex] ?? 'medium'));
                $optionA      = trim($values[$optionAIndex] ?? '');
                $optionB      = trim($values[$optionBIndex] ?? '');
                $optionC      = trim($values[$optionCIndex] ?? '');
                $optionD      = trim($values[$optionDIndex] ?? '');
                $correct      = strtolower(trim($values[$correctIndex] ?? 'a'));
                $explanation  = trim($values[$explanationIndex] ?? '') ?: null;

                // Required validation
                if (empty($questionText)) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": Question text is required";
                    continue;
                }

                // Prevent duplicates by exact question text
                if (Question::where('question', $questionText)->exists()) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": Duplicate question skipped (already exists)";
                    continue;
                }

                // Validate category exists
                if (empty($categorySlug) || !QuestionCategory::where('slug', $categorySlug)->exists()) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": Invalid or missing category '{$categorySlug}'";
                    continue;
                }

                // Validate age group exists
                if (!empty($ageGroupSlug) && !AgeGroup::where('slug', $ageGroupSlug)->exists()) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": Invalid age group '{$ageGroupSlug}'";
                    continue;
                }

                // Validate options
                $optionsData = [
                    ['id' => 'a', 'text' => $optionA],
                    ['id' => 'b', 'text' => $optionB],
                    ['id' => 'c', 'text' => $optionC],
                    ['id' => 'd', 'text' => $optionD],
                ];

                $options = [];
                $hasEmptyOption = false;

                foreach ($optionsData as $opt) {
                    if (empty($opt['text'])) {
                        $hasEmptyOption = true;
                        break;
                    }
                    $options[] = [
                        'id' => $opt['id'],
                        'text' => $opt['text'],
                        'is_correct' => $opt['id'] === $correct
                    ];
                }

                if ($hasEmptyOption) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": All four options are required";
                    continue;
                }

                // Validate correct answer
                if (!in_array($correct, ['a', 'b', 'c', 'd'])) {
                    $failed++;
                    $errors[] = "Row " . ($i + 1) . ": Correct answer must be a, b, c or d";
                    continue;
                }

                // Create the question
                $this->createQuestion([
                    'question'    => $questionText,
                    'category'    => $categorySlug,
                    'age_group'   => $ageGroupSlug ?: null, // allow null if not provided
                    'difficulty'  => in_array($difficulty, ['easy', 'medium', 'hard']) ? $difficulty : 'medium',
                    'options'     => $options,
                    'explanation' => $explanation,
                    'is_active'   => true,
                ], $admin);

                $imported++;
            }

            DB::commit();

            return [
                'imported' => $imported,
                'failed'   => $failed,
                'errors'   => $errors
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function exportQuestions($filters = [])
    {
        $query = Question::query();

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

        $categories = QuestionCategory::where('is_active', true)->get();
        $byCategory = [];
        foreach ($categories as $cat) {
            $byCategory[$cat->slug] = [
                'name'  => $cat->name,
                'color' => $cat->color,
                'count' => Question::where('category', $cat->slug)->count()
            ];
        }

        $ageGroups = AgeGroup::where('is_active', true)->get();
        $byAgeGroup = [];
        foreach ($ageGroups as $age) {
            $byAgeGroup[$age->slug] = [
                'name'  => $age->name,
                'count' => Question::where('age_group', $age->slug)->count()
            ];
        }

        $byDifficulty = [
            'easy'   => Question::where('difficulty', 'easy')->count(),
            'medium' => Question::where('difficulty', 'medium')->count(),
            'hard'   => Question::where('difficulty', 'hard')->count(),
        ];

        $recentQuestions = Question::with('creator')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $totalAttempts = Question::sum('attempt_count');
        $totalCorrect = Question::sum('correct_count');

        return [
            'total'            => $total,
            'active'           => $active,
            'inactive'         => $inactive,
            'by_category'      => $byCategory,
            'by_age_group'     => $byAgeGroup,
            'by_difficulty'    => $byDifficulty,
            'recent_questions' => $recentQuestions,
            'total_views'      => Question::sum('view_count'),
            'total_attempts'   => $totalAttempts,
            'success_rate'     => $totalAttempts > 0 ? round(($totalCorrect / $totalAttempts) * 100, 2) : 0,
        ];
    }

    private function updateCategoryCount($categorySlug)
    {
        if (!$categorySlug) return;

        $category = QuestionCategory::where('slug', $categorySlug)->first();
        if ($category) {
            $category->updateQuestionCount();
        }
    }

    private function updateAgeGroupCount($ageGroupSlug)
    {
        if (!$ageGroupSlug) return;

        $ageGroup = AgeGroup::where('slug', $ageGroupSlug)->first();
        if ($ageGroup) {
            $ageGroup->updateQuestionCount();
        }
    }
}