<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\AgeGroup;
use App\Services\QuestionService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    protected $questionService;

    public function __construct(QuestionService $questionService)
    {
        $this->questionService = $questionService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'category', 'age_group', 'difficulty', 'is_active', 'sort_by', 'sort_direction']);

        $questions = $this->questionService->getAllQuestions($filters, $perPage);

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed questions list',
            'Question',
            null,
            ['filters' => $filters],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $questions,
            'filters' => $filters
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:1000',
            'category' => 'required|string|max:100',
            'age_group' => 'required|string|max:50',
            'difficulty' => 'required|in:easy,medium,hard',
            'options' => 'required|array|min:4|max:4',
            'options.*.id' => 'required|in:a,b,c,d',
            'options.*.text' => 'required|string|max:500',
            'options.*.is_correct' => 'required|boolean',
            'explanation' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'order' => 'integer'
        ]);

        // Validate exactly one correct answer
        $options = $request->input('options', []);
        $correctCount = collect($options)->where('is_correct', true)->count();
        if ($correctCount !== 1) {
            $validator->errors()->add('options', 'Exactly one option must be marked as correct.');
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $question = $this->questionService->createQuestion($request->all(), $request->user());

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created new question',
            'Question',
            $question->id,
            ['category' => $question->category, 'difficulty' => $question->difficulty],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Question created successfully',
            'data' => $question->load(['creator', 'updater'])
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $question = Question::with(['creator', 'updater'])->findOrFail($id);

        // Increment view count
        $question->incrementViewCount();

        ActivityLogService::log(
            $request->user(),
            'view',
            'Viewed question details',
            'Question',
            $question->id,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }

    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'question' => 'sometimes|required|string|max:1000',
            'category' => 'sometimes|required|string|max:100',
            'age_group' => 'sometimes|required|string|max:50',
            'difficulty' => 'sometimes|required|in:easy,medium,hard',
            'options' => 'sometimes|array|min:4|max:4',
            'options.*.id' => 'sometimes|required|in:a,b,c,d',
            'options.*.text' => 'sometimes|required|string|max:500',
            'options.*.is_correct' => 'sometimes|required|boolean',
            'explanation' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer'
        ]);

        // Validate exactly one correct answer if options are provided
        if ($request->has('options')) {
            $correctCount = collect($request->options)->where('is_correct', true)->count();
            if ($correctCount !== 1) {
                $validator->errors()->add('options', 'Exactly one option must be marked as correct.');
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $question->toArray();
        $question = $this->questionService->updateQuestion($question, $request->all(), $request->user());
        $newData = $question->toArray();

        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated question',
            'Question',
            $question->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => $question->load(['creator', 'updater'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $questionData = $question->toArray();

        $this->questionService->deleteQuestion($question);

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted question',
            'Question',
            $id,
            ['question' => $questionData['question']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }

    public function duplicate(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $duplicate = $this->questionService->duplicateQuestion($question, $request->user());

        ActivityLogService::log(
            $request->user(),
            'duplicate',
            'Duplicated question',
            'Question',
            $duplicate->id,
            ['original_id' => $question->id],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Question duplicated successfully',
            'data' => $duplicate
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $oldStatus = $question->is_active;
        $newStatus = !$oldStatus;

        $question->update(['is_active' => $newStatus]);

        ActivityLogService::log(
            $request->user(),
            'toggle_status',
            'Toggled question status',
            'Question',
            $question->id,
            ['from' => $oldStatus, 'to' => $newStatus],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Question status updated',
            'data' => $question
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'exists:questions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $deleted = $this->questionService->bulkDeleteQuestions($request->question_ids);

        ActivityLogService::log(
            $request->user(),
            'bulk_delete',
            'Bulk deleted questions',
            'Question',
            null,
            ['count' => $deleted, 'question_ids' => $request->question_ids],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "{$deleted} questions deleted successfully"
        ]);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'exists:questions,id',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = $this->questionService->bulkUpdateStatus(
            $request->question_ids,
            $request->status
        );

        ActivityLogService::log(
            $request->user(),
            'bulk_update_status',
            'Bulk updated question status',
            'Question',
            null,
            ['count' => $updated, 'status' => $request->status],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "Status updated for {$updated} questions"
        ]);
    }

    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_data' => 'required|string',
            'file_type' => 'sometimes|in:csv,json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->questionService->importFromCsv($request->csv_data, $request->user());

            ActivityLogService::log(
                $request->user(),
                'import',
                'Imported questions from CSV',
                'Question',
                null,
                ['imported' => $result['imported'], 'failed' => $result['failed']],
                $request
            );

            $response = [
                'success' => true,
                'message' => "Import completed: {$result['imported']} imported, {$result['failed']} failed",
                'imported' => $result['imported'],
                'failed' => $result['failed']
            ];

            if (!empty($result['errors'])) {
                $response['errors'] = $result['errors'];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 400);
        }
    }

    public function export(Request $request)
    {
        $filters = $request->only(['category', 'age_group', 'difficulty', 'is_active']);
        $questions = $this->questionService->exportQuestions($filters);

        $csvFileName = 'questions_export_' . date('Y_m_d_His') . '.csv';
        $csvPath = storage_path('app/exports/' . $csvFileName);

        // Create directory if not exists
        if (!file_exists(dirname($csvPath))) {
            mkdir(dirname($csvPath), 0755, true);
        }

        $handle = fopen($csvPath, 'w');
        
        // Add CSV headers matching the frontend template
        fputcsv($handle, [
            'question',
            'category',
            'age_group',
            'difficulty',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_answer',
            'explanation'
        ]);

        // Add data rows
        foreach ($questions as $question) {
            $options = $question->options;
            $correctAnswer = $question->correct_answer;
            
            fputcsv($handle, [
                $question->question,
                $question->category,
                $question->age_group,
                $question->difficulty,
                $question->getOptionText('a'),
                $question->getOptionText('b'),
                $question->getOptionText('c'),
                $question->getOptionText('d'),
                $correctAnswer,
                $question->explanation
            ]);
        }

        fclose($handle);

        ActivityLogService::log(
            $request->user(),
            'export',
            'Exported questions to CSV',
            'Question',
            null,
            ['count' => $questions->count(), 'filters' => $filters],
            $request
        );

        return response()->download($csvPath)->deleteFileAfterSend(true);
    }

    public function downloadTemplate()
    {
        $template = "question,category,age_group,difficulty,option_a,option_b,option_c,option_d,correct_answer,explanation\n";
        $template .= "\"What is 2 + 2?\",\"general-maths\",\"6-8\",\"easy\",\"3\",\"4\",\"5\",\"6\",\"b\",\"2 + 2 equals 4\"\n";
        $template .= "\"What is the capital of France?\",\"general-knowledge\",\"9-11\",\"medium\",\"London\",\"Paris\",\"Berlin\",\"Madrid\",\"b\",\"Paris is the capital of France\"";

        $fileName = 'questions_template.csv';
        $filePath = storage_path('app/templates/' . $fileName);

        if (!file_exists(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        file_put_contents($filePath, $template);

        return response()->download($filePath)->deleteFileAfterSend(true);
    }

    public function statistics(Request $request)
    {
        $stats = $this->questionService->getQuestionStatistics();

        ActivityLogService::log(
            $request->user(),
            'view_statistics',
            'Viewed question statistics',
            'Question',
            null,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getFilters()
    {
        $categories = QuestionCategory::where('is_active', true)
            ->orderBy('order')
            ->get(['name', 'slug', 'color']);

        $ageGroups = AgeGroup::where('is_active', true)
            ->orderBy('order')
            ->get(['name', 'slug', 'min_age', 'max_age']);

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
                'age_groups' => $ageGroups,
                'difficulties' => [
                    ['value' => 'easy', 'label' => 'Easy'],
                    ['value' => 'medium', 'label' => 'Medium'],
                    ['value' => 'hard', 'label' => 'Hard']
                ],
                'sort_options' => [
                    ['value' => 'created_at', 'label' => 'Creation Date'],
                    ['value' => 'updated_at', 'label' => 'Last Updated'],
                    ['value' => 'difficulty', 'label' => 'Difficulty'],
                    ['value' => 'view_count', 'label' => 'Most Viewed'],
                    ['value' => 'attempt_count', 'label' => 'Most Attempted']
                ]
            ]
        ]);
    }
}