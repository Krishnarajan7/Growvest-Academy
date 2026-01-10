<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\Question;
use App\Services\TestService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    protected $testService;

    public function __construct(TestService $testService)
    {
        $this->testService = $testService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'category', 'age_group', 'type', 'status', 'is_active']);

        $tests = $this->testService->getAllTests($filters, $perPage);

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed tests list',
            'Test',
            null,
            ['filters' => $filters],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $tests
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:quiz,exam,practice,assessment',
            'category' => 'required|string|max:100',
            'age_group' => 'required|string|max:50',
            'duration' => 'nullable|integer|min:1',
            'total_questions' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'in:draft,published,archived',
            'settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $test = $this->testService->createTest($request->all(), $request->user());

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created new test',
            'Test',
            $test->id,
            ['title' => $test->title, 'category' => $test->category],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Test created successfully',
            'data' => $test
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $test = Test::with(['questions', 'attempts.student'])
            ->findOrFail($id);

        ActivityLogService::log(
            $request->user(),
            'view',
            'Viewed test details',
            'Test',
            $test->id,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $test
        ]);
    }

    public function update(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:quiz,exam,practice,assessment',
            'category' => 'sometimes|required|string|max:100',
            'age_group' => 'sometimes|required|string|max:50',
            'duration' => 'nullable|integer|min:1',
            'total_questions' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'max_attempts' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'in:draft,published,archived',
            'settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $test->toArray();
        $test = $this->testService->updateTest($test, $request->all());
        $newData = $test->toArray();

        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated test',
            'Test',
            $test->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Test updated successfully',
            'data' => $test
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $test = Test::findOrFail($id);
        $testData = $test->toArray();

        $this->testService->deleteTest($test);

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted test',
            'Test',
            $id,
            ['title' => $testData['title']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Test deleted successfully'
        ]);
    }

    public function addQuestions(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:questions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $added = $this->testService->addQuestionsToTest($test, $request->question_ids);

        ActivityLogService::log(
            $request->user(),
            'add_questions',
            'Added questions to test',
            'Test',
            $test->id,
            ['count' => $added],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "{$added} questions added to test",
            'data' => $test->fresh(['questions'])
        ]);
    }

    public function removeQuestions(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:questions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $removed = $this->testService->removeQuestionsFromTest($test, $request->question_ids);

        ActivityLogService::log(
            $request->user(),
            'remove_questions',
            'Removed questions from test',
            'Test',
            $test->id,
            ['count' => $removed],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "{$removed} questions removed from test"
        ]);
    }

    public function reorderQuestions(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'question_order' => 'required|array',
            'question_order.*.question_id' => 'required|exists:questions,id',
            'question_order.*.order' => 'required|integer|min:0',
            'question_order.*.marks' => 'nullable|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $this->testService->reorderTestQuestions($test, $request->question_order);

        ActivityLogService::log(
            $request->user(),
            'reorder_questions',
            'Reordered test questions',
            'Test',
            $test->id,
            ['count' => count($request->question_order)],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Question order updated successfully'
        ]);
    }

    public function importQuestionsFromCsv(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'csv_data' => 'required|string',
            'category_filter' => 'nullable|string',
            'age_group_filter' => 'nullable|string',
            'difficulty_filter' => 'nullable|in:easy,medium,hard'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->testService->importQuestionsFromCsv(
                $test,
                $request->csv_data,
                $request->only(['category_filter', 'age_group_filter', 'difficulty_filter'])
            );

            ActivityLogService::log(
                $request->user(),
                'import_questions_csv',
                'Imported questions to test from CSV',
                'Test',
                $test->id,
                ['imported' => $result['imported'], 'skipped' => $result['skipped']],
                $request
            );

            return response()->json([
                'success' => true,
                'message' => "Import completed: {$result['imported']} imported, {$result['skipped']} skipped",
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 400);
        }
    }

    public function exportTestQuestions(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $csvContent = $this->testService->exportTestQuestions($test);

        $fileName = 'test_' . $test->slug . '_questions_' . date('Y_m_d_His') . '.csv';
        $filePath = storage_path('app/exports/' . $fileName);

        if (!file_exists(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        file_put_contents($filePath, $csvContent);

        ActivityLogService::log(
            $request->user(),
            'export_questions',
            'Exported test questions to CSV',
            'Test',
            $test->id,
            ['question_count' => $test->questions()->count()],
            $request
        );

        return response()->download($filePath)->deleteFileAfterSend(true);
    }

    public function getTestStatistics(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $statistics = $this->testService->getTestStatistics($test);

        ActivityLogService::log(
            $request->user(),
            'view_statistics',
            'Viewed test statistics',
            'Test',
            $test->id,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $statistics
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'test_ids' => 'required|array|min:1',
            'test_ids.*' => 'exists:tests,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $deleted = $this->testService->bulkDeleteTests($request->test_ids);

        ActivityLogService::log(
            $request->user(),
            'bulk_delete',
            'Bulk deleted tests',
            'Test',
            null,
            ['count' => $deleted, 'test_ids' => $request->test_ids],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "{$deleted} tests deleted successfully"
        ]);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'test_ids' => 'required|array|min:1',
            'test_ids.*' => 'exists:tests,id',
            'status' => 'required|in:draft,published,archived'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $updated = $this->testService->bulkUpdateStatus($request->test_ids, $request->status);

        ActivityLogService::log(
            $request->user(),
            'bulk_update_status',
            'Bulk updated test status',
            'Test',
            null,
            ['count' => $updated, 'status' => $request->status],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "Status updated for {$updated} tests"
        ]);
    }

    public function getFilters()
{
    $categories = DB::table('questions')
        ->select('category', DB::raw('COUNT(*) as count'))
        ->groupBy('category')
        ->orderBy('category')
        ->get();

    $ageGroups = DB::table('questions')
        ->select('age_group', DB::raw('COUNT(*) as count'))
        ->groupBy('age_group')
        ->orderBy('age_group')
        ->get();

    return response()->json([
        'success' => true,
        'data' => [
            'categories' => $categories,
            'age_groups' => $ageGroups,
            'types' => ['quiz', 'exam', 'practice', 'assessment'],
            'statuses' => ['draft', 'published', 'archived'],
            'difficulties' => ['easy', 'medium', 'hard']
        ]
    ]);
}

}