<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Admin;
use Illuminate\Http\Request;

class ActivityLogService
{
    public static function log(
        Admin $admin,
        string $action,
        string $description,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $changes = null,
        ?Request $request = null
    ): ActivityLog {
        return ActivityLog::create([
            'admin_id' => $admin->id,
            'action' => $action,
            'description' => $description,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'changes' => $changes,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent()
        ]);
    }

    public static function logDashboardAccess(Admin $admin, Request $request): ActivityLog
    {
        return self::log(
            $admin,
            'dashboard_access',
            'Accessed admin dashboard',
            null,
            null,
            ['page' => 'dashboard'],
            $request
        );
    }

    public static function logCacheClear(Admin $admin, Request $request): ActivityLog
    {
        return self::log(
            $admin,
            'cache_clear',
            'Cleared dashboard cache',
            null,
            null,
            null,
            $request
        );
    }

    public static function getRecentActivities(int $limit = 10)
    {
        return ActivityLog::with('admin')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}