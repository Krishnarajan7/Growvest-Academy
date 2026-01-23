<?php

namespace App\Services;

use App\Models\Student;
use App\Models\TestAttempt;
use App\Models\Test;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StudentAnalyticsService
{
    public function getStudentAnalytics($studentId = null)
    {
        $analytics = [
            'overall_stats'        => $this->getOverallStats(),
            'category_performance' => $this->getCategoryPerformance(),
            'age_group_performance'=> $this->getAgeGroupPerformance(),
            'top_performers'       => $this->getTopPerformers(),
            'monthly_trends'       => $this->getMonthlyTrends(),
            'recent_tests'         => $this->getRecentTests()
        ];

        if ($studentId) {
            $analytics['student_details']         = $this->getStudentDetails($studentId);
            $analytics['student_performance']     = $this->getStudentPerformance($studentId);
            $analytics['student_category_scores'] = $this->getStudentCategoryScores($studentId);
            $analytics['student_test_history']    = $this->getStudentTestHistory($studentId);
        }

        return $analytics;
    }

    public function getStudentPerformance($studentId)
    {
        $student = Student::findOrFail($studentId);

        $attempts = TestAttempt::where('student_id', $studentId)
            ->where('status', 'completed')
            ->get();

        $totalTests = $attempts->count();
        $avgScore   = $totalTests > 0 ? $attempts->avg('percentage') : 0;

        $categoryScores = [];
        foreach ($attempts as $attempt) {
            $test = Test::find($attempt->test_id);
            if ($test) {
                $category = $test->category;
                if (!isset($categoryScores[$category])) {
                    $categoryScores[$category] = [
                        'total_score' => 0,
                        'count'       => 0
                    ];
                }
                $categoryScores[$category]['total_score'] += $attempt->percentage;
                $categoryScores[$category]['count']++;
            }
        }

        $categoryAverages = [];
        foreach ($categoryScores as $category => $data) {
            $categoryAverages[$category] = round($data['total_score'] / $data['count'], 2);
        }

        $performanceBadge = $this->getPerformanceBadge($avgScore);

        return [
            'student_id'         => $student->id,
            'student_name'       => $student->first_name . ' ' . $student->last_name,
            'age_group'          => $student->ageGroup?->name . ' years' ?? 'Unknown',
            'tests_completed'    => $totalTests,
            'avg_score'          => round($avgScore, 2),
            'performance_badge'  => $performanceBadge,
            'category_scores'    => $categoryAverages,
            'last_test_date'     => $attempts->count() > 0
                ? $attempts->sortByDesc('completed_at')->first()->completed_at->format('M j, Y')
                : 'No tests taken'
        ];
    }

    public function getCategoryPerformance()
    {
        return TestAttempt::where('status', 'completed')
            ->get()
            ->groupBy(fn($a) => $a->result_details['category'] ?? 'Unknown')
            ->map(function ($attempts, $category) {
                return [
                    'id'          => $category,
                    'name'        => ucwords(str_replace('-', ' ', $category)),
                    'color'       => $this->getCategoryColor($category),
                    'average'     => round($attempts->avg('percentage') ?? 0, 2),
                    'test_count'  => $attempts->count(),
                    'student_count' => $attempts
                        ->pluck('result_details.student_name')
                        ->unique()
                        ->count(),
                ];
            })
            ->values();
    }

    public function getAgeGroupPerformance()
    {
        return TestAttempt::where('status', 'completed')
            ->get()
            ->groupBy(fn($a) => $this->resolveAgeGroup($a->result_details['age'] ?? null))
            ->map(function ($attempts, $ageGroup) {
                return [
                    'age_group'   => $ageGroup,
                    'avg_score'   => round($attempts->avg('percentage') ?? 0, 2),
                    'students'    => $attempts
                        ->pluck('result_details.student_name')
                        ->unique()
                        ->count(),
                    'test_count'  => $attempts->count(),
                ];
            })
            ->values();
    }

    public function getTopPerformers($limit = 10)
    {
        return TestAttempt::where('status', 'completed')
            ->get()
            ->groupBy('result_details.student_name')
            ->map(function ($attempts, $name) {
                return [
                    'name'            => $name,
                    'age'             => $attempts->first()->result_details['age'] ?? 'Unknown',
                    'tests_completed' => $attempts->count(),
                    'avg_score'       => round($attempts->avg('percentage'), 2),
                ];
            })
            ->sortByDesc('avg_score')
            ->take($limit)
            ->values();
    }

    public function getMonthlyTrends($months = 6)
    {
        $endDate   = now();
        $startDate = now()->subMonths($months);
        $monthlyData = [];

        for ($i = $months; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd   = now()->subMonths($i)->endOfMonth();

            $attempts = TestAttempt::where('status', 'completed')
                ->whereBetween('completed_at', [$monthStart, $monthEnd])
                ->get();

            $avgScore = $attempts->count() > 0 ? $attempts->avg('percentage') : 0;

            $monthlyData[] = [
                'month'        => $monthStart->format('M'),
                'avgScore'     => round($avgScore, 2),
                'test_count'   => $attempts->count(),
                'student_count'=> $attempts->pluck('result_details.student_name')->filter()->unique()->count()
            ];
        }

        return $monthlyData;
    }

    public function getStudentCategoryScores($studentId)
    {
        $attempts = TestAttempt::where('student_id', $studentId)
            ->where('status', 'completed')
            ->with(['test'])
            ->get();

        $categoryScores = [];

        foreach ($attempts as $attempt) {
            if ($attempt->test) {
                $category = $attempt->test->category;
                if (!isset($categoryScores[$category])) {
                    $categoryScores[$category] = [
                        'total_score' => 0,
                        'count'       => 0
                    ];
                }
                $categoryScores[$category]['total_score'] += $attempt->percentage;
                $categoryScores[$category]['count']++;
            }
        }

        $result = [];
        foreach ($categoryScores as $category => $data) {
            $result[] = [
                'subject'  => $this->getShortCategoryName($category),
                'score'    => round($data['total_score'] / $data['count'], 2),
                'fullMark' => 100
            ];
        }

        return $result;
    }

    public function getStudentTestHistory($studentId, $limit = 10)
    {
        return TestAttempt::where('student_id', $studentId)
            ->where('status', 'completed')
            ->with(['test'])
            ->orderBy('completed_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($attempt) {
                return [
                    'test_name'       => $attempt->test->title ?? 'Unknown Test',
                    'category'        => $attempt->test->category ?? 'Unknown',
                    'score'           => round($attempt->percentage, 2),
                    'correct_answers' => $attempt->correct_answers,
                    'total_questions' => $attempt->total_questions,
                    'time_spent'      => $this->formatTime($attempt->time_spent),
                    'completed_at'    => $attempt->completed_at->format('M j, Y H:i'),
                    'is_passed'       => $attempt->percentage >= ($attempt->test->passing_score ?? 60)
                ];
            });
    }

    public function getStudentsByFilters($filters = [])
    {
        $attempts = TestAttempt::where('status', 'completed')->get();

        $students = $attempts
            ->groupBy(fn($a) => $a->result_details['student_name'] ?? 'Unknown')
            ->map(function ($attempts, $name) {

                $age = $attempts->first()->result_details['age'] ?? null;

                // category-wise avg
                $categoryScores = $attempts
                    ->groupBy(fn($a) => $a->result_details['category'] ?? 'unknown')
                    ->map(fn($g) => round($g->avg('percentage'), 2));

                return [
                    'id'              => md5($name), // frontend key
                    'name'            => $name,
                    'age'             => $age ?? 'Unknown',
                    'tests_completed' => $attempts->count(),
                    'avg_score'       => round($attempts->avg('percentage'), 2),

                    // category columns — IMPORTANT: keys must match frontend
                    'spokenEnglish'   => $categoryScores['spoken-english']   ?? null,
                    'phonicsSong'     => $categoryScores['phonics-song']     ?? null,
                    'maths'           => $categoryScores['general-maths']    ?? null,
                    'computer'        => $categoryScores['basic-computer']   ?? null,
                    'gk'              => $categoryScores['general-knowledge'] ?? null,
                    'publicSpeaking'  => $categoryScores['public-speaking']  ?? null,
                ];
            })
            ->values();

        return $students;
    }

    // ────────────────────────────────────────────────
    //              Private Helper Methods
    // ────────────────────────────────────────────────

    private function getOverallStats()
    {
        $attempts = TestAttempt::where('status', 'completed')->get();
        $uniqueStudents = $attempts->pluck('result_details.student_name')->filter()->unique()->count();
        $totalTests = $attempts->count();

        return [
            'total_students'     => $uniqueStudents,
            'active_test_takers' => $uniqueStudents,
            'total_tests_taken'  => $totalTests,
            'avg_score_overall'  => round($attempts->avg('percentage') ?? 0, 2),
            'tests_per_student'  => $uniqueStudents > 0 ? round($totalTests / $uniqueStudents, 1) : 0
        ];
    }

    private function getRecentTests()
    {
        return TestAttempt::where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'student_name' => $a->result_details['student_name'] ?? 'Guest',
                'test_name'    => 'Quick Test',
                'category'     => $a->result_details['category'] ?? 'Unknown',
                'score'        => round($a->percentage, 2),
                'completed_at' => $a->completed_at->diffForHumans(),
            ]);
    }

    private function getStudentDetails($studentId)
    {
        $student = Student::findOrFail($studentId);

        return [
            'id'            => $student->id,
            'student_id'    => $student->student_id,
            'student_code'  => $student->student_code,
            'first_name'    => $student->first_name,
            'last_name'     => $student->last_name,
            'username'      => $student->username,
            'email'         => $student->email,
            'parent_email'  => $student->parent_email,
            'parent_phone'  => $student->parent_phone,
            'age_group'     => $student->ageGroup?->name ?? 'Not set',
            'date_of_birth' => $student->date_of_birth,
            'gender'        => $student->gender,
            'country'       => $student->country,
            'status'        => $student->status,
            'account_type'  => $student->account_type,
            'created_at'    => $student->created_at->format('Y-m-d'),
            'last_login'    => $student->last_login_at
                ? $student->last_login_at->format('Y-m-d H:i')
                : 'Never'
        ];
    }

    private function getCategoryName($category)
    {
        $names = [
            'spoken-english'     => 'Spoken English',
            'phonics-song'       => 'Phonics Song',
            'general-maths'      => 'Mathematics',
            'basic-computer'     => 'Computer Basics',
            'general-knowledge'  => 'General Knowledge',
            'public-speaking'    => 'Public Speaking'
        ];

        return $names[$category] ?? $category;
    }

    private function getShortCategoryName($category)
    {
        $names = [
            'spoken-english'     => 'English',
            'phonics-song'       => 'Phonics',
            'general-maths'      => 'Maths',
            'basic-computer'     => 'Computer',
            'general-knowledge'  => 'GK',
            'public-speaking'    => 'Speaking'
        ];

        return $names[$category] ?? $category;
    }

    private function getCategoryColor($category)
    {
        $colors = [
            'spoken-english'     => '#6366f1',   // indigo
            'phonics-song'       => '#0ea5e9',   // sky blue (was previously physics)
            'general-maths'      => '#10b981',   // emerald
            'basic-computer'     => '#8b5cf6',   // violet
            'general-knowledge'  => '#f59e0b',   // amber
            'public-speaking'    => '#ec4899',   // pink
        ];

        return $colors[$category] ?? '#6b7280';
    }

    private function getPerformanceBadge($score)
    {
        if ($score >= 90) return ['label' => 'Outstanding', 'color' => 'emerald'];
        if ($score >= 80) return ['label' => 'Excellent',   'color' => 'blue'];
        if ($score >= 70) return ['label' => 'Good',        'color' => 'amber'];
        return ['label' => 'Needs Work', 'color' => 'red'];
    }

    private function formatTime($seconds)
    {
        if (!$seconds) return 'N/A';

        $hours   = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm', $hours, $minutes);
        }
        if ($minutes > 0) {
            return sprintf('%dm %ds', $minutes, $seconds);
        }
        return sprintf('%ds', $seconds);
    }

    private function resolveAgeGroup($age)
    {
        if (!$age) return 'Unknown';
        if ($age <= 8)  return '6-8 years';
        if ($age <= 11) return '9-11 years';
        if ($age <= 14) return '12-14 years';
        return '15-16 years';
    }
}