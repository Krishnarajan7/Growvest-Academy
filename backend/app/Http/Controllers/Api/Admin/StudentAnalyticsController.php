<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\StudentAnalyticsService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class StudentAnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(StudentAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function getAnalytics(Request $request)
    {
        $studentId = $request->query('student_id');
        
        $analytics = $this->analyticsService->getStudentAnalytics($studentId);

        ActivityLogService::log(
            $request->user(),
            'view_analytics',
            'Viewed student analytics',
            'Analytics',
            null,
            ['student_id' => $studentId],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $analytics
        ]);
    }

    public function getStudentPerformance(Request $request, $studentId)
    {
        $performance = $this->analyticsService->getStudentPerformance($studentId);

        ActivityLogService::log(
            $request->user(),
            'view_student_performance',
            'Viewed student performance',
            'Analytics',
            $studentId,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }

    public function getCategoryPerformance(Request $request)
    {
        $performance = $this->analyticsService->getCategoryPerformance();

        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }

    public function getAgeGroupPerformance(Request $request)
    {
        $performance = $this->analyticsService->getAgeGroupPerformance();

        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }

    public function getTopPerformers(Request $request)
    {
        $limit = $request->query('limit', 10);
        $performers = $this->analyticsService->getTopPerformers($limit);

        return response()->json([
            'success' => true,
            'data' => $performers
        ]);
    }

    public function getMonthlyTrends(Request $request)
    {
        $months = $request->query('months', 6);
        $trends = $this->analyticsService->getMonthlyTrends($months);

        return response()->json([
            'success' => true,
            'data' => $trends
        ]);
    }

    public function getStudentCategoryScores(Request $request, $studentId)
    {
        $scores = $this->analyticsService->getStudentCategoryScores($studentId);

        ActivityLogService::log(
            $request->user(),
            'view_student_category_scores',
            'Viewed student category scores',
            'Analytics',
            $studentId,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $scores
        ]);
    }

    public function getStudentTestHistory(Request $request, $studentId)
    {
        $limit = $request->query('limit', 10);
        $history = $this->analyticsService->getStudentTestHistory($studentId, $limit);

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function getStudentsList(Request $request)
    {
        $filters = $request->only(['search', 'age_group', 'status', 'account_type', 'per_page']);
        
        $students = $this->analyticsService->getStudentsByFilters($filters);

        ActivityLogService::log(
            $request->user(),
            'view_students_list',
            'Viewed students list with filters',
            'Analytics',
            null,
            ['filters' => $filters],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $students,
            'filters' => $filters
        ]);
    }

    public function exportStudentReport(Request $request, $studentId)
    {
        $student = \App\Models\Student::findOrFail($studentId);
        
        $performance = $this->analyticsService->getStudentPerformance($studentId);
        $categoryScores = $this->analyticsService->getStudentCategoryScores($studentId);
        $testHistory = $this->analyticsService->getStudentTestHistory($studentId, 20);

        $csvContent = "Student Performance Report\n";
        $csvContent .= "==========================\n\n";
        $csvContent .= "Student: {$performance['student_name']}\n";
        $csvContent .= "Age Group: {$performance['age_group']}\n";
        $csvContent .= "Total Tests Completed: {$performance['tests_completed']}\n";
        $csvContent .= "Average Score: {$performance['avg_score']}%\n";
        $csvContent .= "Performance: {$performance['performance_badge']['label']}\n";
        $csvContent .= "Last Test: {$performance['last_test_date']}\n\n";
        
        $csvContent .= "Category Scores:\n";
        $csvContent .= "----------------\n";
        if (!empty($performance['category_scores'])) {
            foreach ($performance['category_scores'] as $category => $score) {
                $categoryName = $this->getCategoryNameForExport($category);
                $csvContent .= "{$categoryName}: {$score}%\n";
            }
        }
        
        $csvContent .= "\nRecent Test History:\n";
        $csvContent .= "--------------------\n";
        foreach ($testHistory as $test) {
            $csvContent .= "{$test['test_name']} ({$test['category']}): {$test['score']}% - {$test['completed_at']}\n";
        }

        $fileName = "student_report_{$student->student_code}_" . date('Y_m_d') . '.txt';
        $filePath = storage_path('app/reports/' . $fileName);

        if (!file_exists(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        file_put_contents($filePath, $csvContent);

        ActivityLogService::log(
            $request->user(),
            'export_student_report',
            'Exported student performance report',
            'Analytics',
            $studentId,
            ['student_name' => $performance['student_name']],
            $request
        );

        return response()->download($filePath)->deleteFileAfterSend(true);
    }

    private function getCategoryNameForExport($category)
    {
        $names = [
            'spoken-english' => 'Spoken English',
            'phonics-song' => 'Phonics Song',
            'general-maths' => 'Mathematics',
            'basic-computer' => 'Computer Basics',
            'general-knowledge' => 'General Knowledge',
            'public-speaking' => 'Public Speaking'
        ];
        
        return $names[$category] ?? ucwords(str_replace('-', ' ', $category));
    }
}