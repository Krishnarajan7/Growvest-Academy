<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getDashboardStats()
    {
        return [
            'total_students' => $this->getTotalStudents(),
            'total_questions' => $this->getTotalQuestions(),
            'total_revenue' => $this->getTotalRevenue(),
            'active_tests' => $this->getActiveTests(),
            'revenue_chart' => $this->getRevenueChartData(),
            'student_growth' => $this->getStudentGrowthData(),
            'question_statistics' => $this->getQuestionStatistics(),
            'recent_activities' => $this->getRecentActivities(),
            'top_performing_tests' => $this->getTopPerformingTests(),
            'system_health' => $this->getSystemHealth()
        ];
    }

    public function getRevenueAnalytics($period = 'month', $startDate = null, $endDate = null)
    {
        return $this->getRevenueChartData($period, $startDate, $endDate);
    }

    public function getRevenueChartData($period = 'month', $startDate = null, $endDate = null)
    {
        $query = DB::table('transactions')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as revenue')
            );

        // Handle different periods
        if ($period === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($period === 'week') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($period === 'year') {
            $query->where('created_at', '>=', now()->subYear());
        } elseif ($period === 'custom' && $startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } else {
            // Default: last 30 days (month)
            $query->where('created_at', '>=', now()->subDays(30));
        }

        $revenueData = $query->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'labels' => $revenueData->pluck('date'),
            'datasets' => [
                [
                    'label' => 'Transactions',
                    'data' => $revenueData->pluck('revenue'),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)'
                ]
            ]
        ];
    }

    private function getTotalStudents()
    {
        // SAFE: Use count() only - assumes all students are considered active if no status column
        // Change to ->where('is_active', true) if you have that column
        return DB::table('students')->count();
    }

    private function getTotalQuestions()
    {
        return DB::table('questions')->count();
    }

    private function getTotalRevenue()
    {
        // SAFE: Return transaction count instead of sum(total_amount) until proper columns exist
        return DB::table('transactions')->count();
    }

    private function getActiveTests()
    {
        return DB::table('tests')
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->count();
    }

    private function getStudentGrowthData()
    {
        $growthData = DB::table('students')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(60))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $cumulative = 0;
        $cumulativeData = $growthData->map(function ($item) use (&$cumulative) {
            $cumulative += $item->count;
            return [
                'date' => $item->date,
                'count' => $cumulative
            ];
        });

        return [
            'labels' => $cumulativeData->pluck('date'),
            'datasets' => [
                [
                    'label' => 'Student Growth',
                    'data' => $cumulativeData->pluck('count'),
                    'borderColor' => 'rgb(16, 185, 129)',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)'
                ]
            ]
        ];
    }

    private function getQuestionStatistics()
    {
        return [
            'by_type' => DB::table('questions')
                ->whereNotNull('type')
                ->select('type', DB::raw('COUNT(*) as count'))
                ->groupBy('type')
                ->get(),
            'by_difficulty' => DB::table('questions')
                ->whereNotNull('difficulty')
                ->select('difficulty', DB::raw('COUNT(*) as count'))
                ->groupBy('difficulty')
                ->get(),
            'by_subject' => DB::table('questions')
                ->whereNotNull('category')
                ->select('category', DB::raw('COUNT(*) as count'))
                ->groupBy('category')
                ->get()
        ];
    }

    private function getRecentActivities()
    {
        return DB::table('activity_logs')
            ->join('admins', 'activity_logs.admin_id', '=', 'admins.id')
            ->select(
                'activity_logs.*',
                'admins.name as admin_name',
                'admins.email as admin_email'
            )
            ->orderBy('activity_logs.created_at', 'desc')
            ->limit(10)
            ->get();
    }

    private function getTopPerformingTests()
    {
        return DB::table('tests')
            ->select(
                'id',
                'title',
                'total_attempts',
                'average_score',
                'completion_rate'
            )
            ->where('total_attempts', '>', 0)
            ->orderBy('average_score', 'desc')
            ->limit(5)
            ->get();
    }

    private function getSystemHealth()
    {
        return [
            'server_uptime' => @exec('uptime -p') ?: 'Unknown',
            'disk_usage' => $this->getDiskUsage(),
            'memory_usage' => $this->getMemoryUsage(),
            'active_sessions' => DB::table('personal_access_tokens')->count(),
            'last_backup' => $this->getLastBackupDate()
        ];
    }

    public function getDiskUsage()
    {
        try {
            $total = disk_total_space('/');
            $free = disk_free_space('/');
            $used = $total - $free;
            
            return [
                'total' => $this->formatBytes($total),
                'used' => $this->formatBytes($used),
                'free' => $this->formatBytes($free),
                'percentage' => $total > 0 ? round(($used / $total) * 100, 2) : 0
            ];
        } catch (\Exception $e) {
            return [
                'total' => 'N/A',
                'used' => 'N/A',
                'free' => 'N/A',
                'percentage' => 0
            ];
        }
    }

    private function getMemoryUsage()
    {
        try {
            if (function_exists('shell_exec')) {
                $memory = shell_exec('free -m');
                $lines = explode("\n", $memory);
                if (isset($lines[1])) {
                    $mem = preg_split('/\s+/', $lines[1]);
                    $total = $mem[1] ?? 0;
                    $used = $mem[2] ?? 0;
                    
                    return [
                        'total' => $total . ' MB',
                        'used' => $used . ' MB',
                        'percentage' => $total > 0 ? round(($used / $total) * 100, 2) : 0
                    ];
                }
            }
        } catch (\Exception $e) {
            // Ignore errors
        }
        
        return [
            'total' => 'N/A',
            'used' => 'N/A',
            'percentage' => 0
        ];
    }

    private function getLastBackupDate()
    {
        $backupPath = storage_path('app/backups');
        if (file_exists($backupPath)) {
            $files = scandir($backupPath);
            $backupFiles = array_filter($files, function ($file) {
                return pathinfo($file, PATHINFO_EXTENSION) === 'zip';
            });
            
            if (!empty($backupFiles)) {
                rsort($backupFiles);
                $lastBackup = $backupFiles[0];
                return date('Y-m-d H:i:s', filemtime($backupPath . '/' . $lastBackup));
            }
        }
        
        return 'No backups found';
    }

    public function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}