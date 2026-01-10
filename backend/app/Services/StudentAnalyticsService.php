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
            'overall_stats' => $this->getOverallStats(),
            'category_performance' => $this->getCategoryPerformance(),
            'age_group_performance' => $this->getAgeGroupPerformance(),
            'top_performers' => $this->getTopPerformers(),
            'monthly_trends' => $this->getMonthlyTrends(),
            'recent_tests' => $this->getRecentTests()
        ];

        if ($studentId) {
            $analytics['student_details'] = $this->getStudentDetails($studentId);
            $analytics['student_performance'] = $this->getStudentPerformance($studentId);
            $analytics['student_category_scores'] = $this->getStudentCategoryScores($studentId);
            $analytics['student_test_history'] = $this->getStudentTestHistory($studentId);
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
        $avgScore = $totalTests > 0 ? $attempts->avg('percentage') : 0;

        $categoryScores = [];
        foreach ($attempts as $attempt) {
            $test = Test::find($attempt->test_id);
            if ($test) {
                $category = $test->category;
                if (!isset($categoryScores[$category])) {
                    $categoryScores[$category] = [
                        'total_score' => 0,
                        'count' => 0
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
            'student_id' => $student->id,
            'student_name' => $student->first_name . ' ' . $student->last_name,
            'age_group' => $student->ageGroup?->name . ' years' ?? 'Unknown',
            'tests_completed' => $totalTests,
            'avg_score' => round($avgScore, 2),
            'performance_badge' => $performanceBadge,
            'category_scores' => $categoryAverages,
            'last_test_date' => $attempts->count() > 0 ? $attempts->sortByDesc('completed_at')->first()->completed_at->format('M j, Y') : 'No tests taken'
        ];
    }

    public function getCategoryPerformance()
    {
        $categories = ['spoken-english', 'physics', 'general-maths', 'basic-computer', 'general-knowledge', 'public-speaking'];
        
        $categoryData = [];
        
        foreach ($categories as $category) {
            $attempts = TestAttempt::whereHas('test', function($query) use ($category) {
                $query->where('category', $category);
            })
            ->where('status', 'completed')
            ->get();

            $avgScore = $attempts->count() > 0 ? $attempts->avg('percentage') : 0;
            
            $categoryData[] = [
                'id' => $category,
                'name' => $this->getCategoryName($category),
                'color' => $this->getCategoryColor($category),
                'average' => round($avgScore, 2),
                'test_count' => $attempts->count(),
                'student_count' => $attempts->pluck('student_id')->unique()->count()
            ];
        }

        return $categoryData;
    }

    public function getAgeGroupPerformance()
    {
        $ageGroups = ['6-8', '9-11', '12-14', '15-16'];
        
        $ageGroupData = [];
        
        foreach ($ageGroups as $ageGroup) {
            $students = Student::whereHas('ageGroup', function ($q) use ($ageGroup) {
                    $q->where('name', $ageGroup);
                })
                ->where('status', 'active')
                ->count();

            $attempts = TestAttempt::whereHas('student.ageGroup', function ($q) use ($ageGroup) {
                    $q->where('name', $ageGroup);
                })
                ->where('status', 'completed')
                ->get();

            $avgScore = $attempts->count() > 0 ? $attempts->avg('percentage') : 0;
            
            $ageGroupData[] = [
                'age_group' => $ageGroup . ' years',
                'avg_score' => round($avgScore, 2),
                'students' => $students,
                'test_count' => $attempts->count()
            ];
        }

        return $ageGroupData;
    }

    public function getTopPerformers($limit = 10)
    {
        $topPerformers = DB::table('test_attempts')
            ->select(
                'students.id',
                DB::raw('CONCAT(students.first_name, " ", students.last_name) as name'),
                'age_groups.name as age_group',
                DB::raw('COUNT(test_attempts.id) as tests_completed'),
                DB::raw('AVG(test_attempts.percentage) as avg_score')
            )
            ->join('students', 'test_attempts.student_id', '=', 'students.id')
            ->leftJoin('age_groups', 'students.age_group_id', '=', 'age_groups.id')
            ->where('test_attempts.status', 'completed')
            ->where('students.status', 'active')
            ->groupBy('students.id', 'students.first_name', 'students.last_name', 'age_groups.name')
            ->having('tests_completed', '>', 0)
            ->orderBy('avg_score', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'age' => $student->age_group ? $student->age_group . ' years' : 'Unknown',
                    'tests_completed' => $student->tests_completed,
                    'avg_score' => round($student->avg_score, 2),
                    'last_test' => $this->getLastTestDate($student->id)
                ];
            });

        return $topPerformers;
    }

    public function getMonthlyTrends($months = 6)
    {
        $endDate = now();
        $startDate = now()->subMonths($months);
        
        $monthlyData = [];
        
        for ($i = $months; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $attempts = TestAttempt::where('status', 'completed')
                ->whereBetween('completed_at', [$monthStart, $monthEnd])
                ->get();

            $avgScore = $attempts->count() > 0 ? $attempts->avg('percentage') : 0;
            
            $monthlyData[] = [
                'month' => $monthStart->format('M'),
                'avgScore' => round($avgScore, 2),
                'test_count' => $attempts->count(),
                'student_count' => $attempts->pluck('student_id')->unique()->count()
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
                        'count' => 0
                    ];
                }
                $categoryScores[$category]['total_score'] += $attempt->percentage;
                $categoryScores[$category]['count']++;
            }
        }

        $result = [];
        foreach ($categoryScores as $category => $data) {
            $result[] = [
                'subject' => $this->getShortCategoryName($category),
                'score' => round($data['total_score'] / $data['count'], 2),
                'fullMark' => 100
            ];
        }

        return $result;
    }

    public function getStudentTestHistory($studentId, $limit = 10)
    {
        $attempts = TestAttempt::where('student_id', $studentId)
            ->where('status', 'completed')
            ->with(['test'])
            ->orderBy('completed_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($attempt) {
                return [
                    'test_name' => $attempt->test->title ?? 'Unknown Test',
                    'category' => $attempt->test->category ?? 'Unknown',
                    'score' => round($attempt->percentage, 2),
                    'correct_answers' => $attempt->correct_answers,
                    'total_questions' => $attempt->total_questions,
                    'time_spent' => $this->formatTime($attempt->time_spent),
                    'completed_at' => $attempt->completed_at->format('M j, Y H:i'),
                    'is_passed' => $attempt->percentage >= ($attempt->test->passing_score ?? 60)
                ];
            });

        return $attempts;
    }

    public function getStudentsByFilters($filters = [])
    {
        $query = Student::query();

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                  ->orWhere('last_name', 'like', "%{$filters['search']}%")
                  ->orWhere('username', 'like', "%{$filters['search']}%")
                  ->orWhere('student_code', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['age_group']) && $filters['age_group'] !== 'all') {
            $ageGroup = str_replace(' years', '', $filters['age_group']);
            $query->whereHas('ageGroup', function($q) use ($ageGroup) {
                $q->where('name', $ageGroup);
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['account_type'])) {
            $query->where('account_type', $filters['account_type']);
        }

        $students = $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);

        return $students->through(function($student) {
            $performance = $this->getStudentPerformance($student->id);
            
            return [
                'id' => $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'age_group' => $student->ageGroup?->name . ' years' ?? 'Unknown',
                'username' => $student->username,
                'student_code' => $student->student_code,
                'status' => $student->status,
                'account_type' => $student->account_type,
                'tests_completed' => $performance['tests_completed'],
                'avg_score' => $performance['avg_score'],
                'performance_badge' => $performance['performance_badge'],
                'last_test_date' => $performance['last_test_date'],
                'created_at' => $student->created_at->format('Y-m-d')
            ];
        });
    }

    private function getOverallStats()
    {
        $totalStudents = Student::where('status', 'active')->count();
        
        $attempts = TestAttempt::where('status', 'completed')->get();
        
        $totalTests = $attempts->count();
        $avgScore = $totalTests > 0 ? $attempts->avg('percentage') : 0;
        
        $activeStudents = $attempts->pluck('student_id')->unique()->count();
        $testsPerStudent = $totalStudents > 0 ? round($totalTests / $totalStudents, 1) : 0;

        return [
            'total_students' => $totalStudents,
            'active_test_takers' => $activeStudents,
            'total_tests_taken' => $totalTests,
            'avg_score_overall' => round($avgScore, 2),
            'tests_per_student' => $testsPerStudent
        ];
    }

    private function getRecentTests()
    {
        $recentTests = TestAttempt::where('status', 'completed')
            ->with(['test', 'student'])
            ->orderBy('completed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($attempt) {
                return [
                    'student_name' => $attempt->student->first_name . ' ' . $attempt->student->last_name,
                    'test_name' => $attempt->test->title ?? 'Unknown',
                    'category' => $attempt->test->category ?? 'Unknown',
                    'score' => round($attempt->percentage, 2),
                    'completed_at' => $attempt->completed_at->diffForHumans()
                ];
            });

        return $recentTests;
    }

    private function getStudentDetails($studentId)
    {
        $student = Student::findOrFail($studentId);

        return [
            'id' => $student->id,
            'student_id' => $student->student_id,
            'student_code' => $student->student_code,
            'first_name' => $student->first_name,
            'last_name' => $student->last_name,
            'username' => $student->username,
            'email' => $student->email,
            'parent_email' => $student->parent_email,
            'parent_phone' => $student->parent_phone,
            'age_group' => $student->ageGroup?->name ?? 'Not set',
            'date_of_birth' => $student->date_of_birth,
            'gender' => $student->gender,
            'country' => $student->country,
            'status' => $student->status,
            'account_type' => $student->account_type,
            'created_at' => $student->created_at->format('Y-m-d'),
            'last_login' => $student->last_login_at ? $student->last_login_at->format('Y-m-d H:i') : 'Never'
        ];
    }

    private function getCategoryName($category)
    {
        $names = [
            'spoken-english' => 'Spoken English',
            'physics' => 'Physics',
            'general-maths' => 'Mathematics',
            'basic-computer' => 'Computer Basics',
            'general-knowledge' => 'General Knowledge',
            'public-speaking' => 'Public Speaking'
        ];
        
        return $names[$category] ?? $category;
    }

    private function getShortCategoryName($category)
    {
        $names = [
            'spoken-english' => 'English',
            'physics' => 'Physics',
            'general-maths' => 'Maths',
            'basic-computer' => 'Computer',
            'general-knowledge' => 'GK',
            'public-speaking' => 'Speaking'
        ];
        
        return $names[$category] ?? $category;
    }

    private function getCategoryColor($category)
    {
        $colors = [
            'spoken-english' => '#6366f1', // indigo
            'physics' => '#0ea5e9',       // sky
            'general-maths' => '#10b981', // emerald
            'basic-computer' => '#8b5cf6', // violet
            'general-knowledge' => '#f59e0b', // amber
            'public-speaking' => '#ec4899', // pink
        ];
        
        return $colors[$category] ?? '#6b7280';
    }

    private function getPerformanceBadge($score)
    {
        if ($score >= 90) return ['label' => 'Outstanding', 'color' => 'emerald'];
        if ($score >= 80) return ['label' => 'Excellent', 'color' => 'blue'];
        if ($score >= 70) return ['label' => 'Good', 'color' => 'amber'];
        return ['label' => 'Needs Work', 'color' => 'red'];
    }

    private function getLastTestDate($studentId)
    {
        $lastAttempt = TestAttempt::where('student_id', $studentId)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->first();

        return $lastAttempt ? $lastAttempt->completed_at->format('M j, Y') : 'No tests taken';
    }

    private function formatTime($seconds)
    {
        if (!$seconds) return 'N/A';
        
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $seconds = $seconds % 60;
        
        if ($hours > 0) {
            return sprintf('%dh %dm', $hours, $minutes);
        } elseif ($minutes > 0) {
            return sprintf('%dm %ds', $minutes, $seconds);
        } else {
            return sprintf('%ds', $seconds);
        }
    }
}