<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function getStats(Request $request)
    {
        ActivityLogService::logDashboardAccess($request->user(), $request);
        
        $stats = Cache::remember('admin_dashboard_stats', 300, function () {
            return $this->dashboardService->getDashboardStats();
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
            'timestamp' => now()->toISOString()
        ]);
    }

    public function getQuickStats()
    {
        $quickStats = Cache::remember('admin_quick_stats', 60, function () {
            return [
                'total_students' => DB::table('students')->count(),
                'total_questions' => DB::table('questions')->count(),
                'total_revenue' => DB::table('transactions')->count(),
                'pending_approvals' => DB::table('questions')
                    ->where('is_active', false)
                    ->count()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $quickStats
        ]);
    }

    public function getRevenueAnalytics(Request $request)
    {
        $request->validate([
            'period' => 'in:today,week,month,year,custom',
            'start_date' => 'date|required_if:period,custom',
            'end_date' => 'date|required_if:period,custom|after_or_equal:start_date'
        ]);

        $period = $request->input('period', 'month');
        
        $revenueData = $this->dashboardService->getRevenueChartData(
            $period,
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json([
            'success' => true,
            'period' => $period,
            'data' => $revenueData
        ]);
    }

   public function getStudentAnalytics()
{
    $analytics = Cache::remember('student_analytics', 300, function () {

        $monthly = DB::table('students')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%b") as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderByRaw('MIN(created_at)')
            ->limit(7)
            ->get();

        return [
            'growth_rate' => $this->calculateGrowthRate('students'),

            // 🔑 FRONTEND CHART DATA
            'student_growth' => $monthly->map(fn ($row) => [
                'month' => $row->month,
                'students' => $row->count,
            ]),

            'active_vs_inactive' => [
                'active' => DB::table('students')->count(),
                'inactive' => 0
            ]
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $analytics
    ]);
}


public function getWeeklyActivity()
{
    $data = collect(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])->map(function ($day) {
        return [
            'day' => $day,
            'enrollments' => rand(1, 10),
            'completions' => rand(0, 8),
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $data
    ]);
}


    public function getQuestionAnalytics()
{
    $analytics = Cache::remember('question_analytics', 300, function () {
        return [
            // 🔑 THIS MATCHES FRONTEND
            'by_subject' => DB::table('questions')
                ->whereNotNull('type')
                ->select(
                    DB::raw('COALESCE(type, "Unknown") as category'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('type')
                ->get(),

            'difficulty_distribution' => DB::table('questions')
                ->select('difficulty', DB::raw('COUNT(*) as count'))
                ->groupBy('difficulty')
                ->get(),

            'status_overview' => [
                'active' => DB::table('questions')->where('is_active', true)->count(),
                'inactive' => DB::table('questions')->where('is_active', false)->count(),
            ],
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $analytics
    ]);
}


    public function getSystemMetrics()
    {
        $metrics = [
            'server' => [
                'load_average' => sys_getloadavg(),
                'uptime' => exec('uptime -p'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version()
            ],
            'database' => [
                'connection' => DB::connection()->getPdo() ? 'Connected' : 'Disconnected',
                'size' => $this->getDatabaseSize(),
                'tables' => count(DB::select('SHOW TABLES'))
            ],
            'cache' => [
                'driver' => config('cache.default'),
                'status' => Cache::get('health_check') === 'ok' ? 'Healthy' : 'Issues'
            ],
            'storage' => $this->dashboardService->getDiskUsage()
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics
        ]);
    }

    public function getRecentActivity()
    {
        $activities = DB::table('activity_logs')
            ->join('admins', 'activity_logs.admin_id', '=', 'admins.id')
            ->select(
                'activity_logs.id',
                'activity_logs.description',
                'activity_logs.action',
                'activity_logs.model_type',
                'activity_logs.model_id',
                'activity_logs.created_at',
                'admins.name as admin_name',
                'admins.profile_image as admin_image'
            )
            ->orderBy('activity_logs.created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    public function clearCache(Request $request)
    {
        ActivityLogService::logCacheClear($request->user(), $request);
        
        Cache::forget('admin_dashboard_stats');
        Cache::forget('admin_quick_stats');
        Cache::forget('student_analytics');
        Cache::forget('question_analytics');

        return response()->json([
            'success' => true,
            'message' => 'Dashboard cache cleared successfully'
        ]);
    }

    private function calculateGrowthRate($table)
    {
        $currentPeriod = DB::table($table)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $previousPeriod = DB::table($table)
            ->whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])
            ->count();

        if ($previousPeriod == 0) {
            return $currentPeriod > 0 ? 100 : 0;
        }

        return round((($currentPeriod - $previousPeriod) / $previousPeriod) * 100, 2);
    }

    private function getDatabaseSize()
    {
        $databaseName = config('database.connections.mysql.database');
        $size = DB::select("
            SELECT SUM(data_length + index_length) as size
            FROM information_schema.TABLES
            WHERE table_schema = ?
        ", [$databaseName]);

        $bytes = $size[0]->size ?? 0;
        return $this->dashboardService->formatBytes($bytes);
    }
}