<?php

use Illuminate\Support\Facades\Route;

// AUTH
use App\Http\Controllers\Api\Admin\AuthController;

// DASHBOARD
use App\Http\Controllers\Api\Admin\DashboardController;

// STUDENTS
use App\Http\Controllers\Api\Admin\StudentController;

// MEDIA
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\MediaCategoryController;
use App\Http\Controllers\Api\Admin\MediaAlbumController;

// QUESTIONS
use App\Http\Controllers\Api\Admin\QuestionController;
use App\Http\Controllers\Api\Admin\QuestionCategoryController;
use App\Http\Controllers\Api\Admin\AgeGroupController;

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
| These routes are loaded via routes/api.php
| Prefix: /api/admin
*/

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::put('profile', [AuthController::class, 'updateProfile']);
    Route::post('change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('stats', [DashboardController::class, 'getStats']);
        Route::get('quick-stats', [DashboardController::class, 'getQuickStats']);
        Route::get('revenue-analytics', [DashboardController::class, 'getRevenueAnalytics']);
        Route::get('student-analytics', [DashboardController::class, 'getStudentAnalytics']);
        Route::get('question-analytics', [DashboardController::class, 'getQuestionAnalytics']);
        Route::get('system-metrics', [DashboardController::class, 'getSystemMetrics']);
        Route::get('recent-activity', [DashboardController::class, 'getRecentActivity']);
        Route::post('clear-cache', [DashboardController::class, 'clearCache']);
    });

    // Students
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::get('/filters', [StudentController::class, 'getFilters']);
        Route::get('/statistics', [StudentController::class, 'statistics']);
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::post('/', [StudentController::class, 'store']);
        Route::put('/{id}', [StudentController::class, 'update']);
        Route::delete('/{id}', [StudentController::class, 'destroy']);
        Route::delete('/{id}/force', [StudentController::class, 'forceDelete']);
        Route::post('/{id}/restore', [StudentController::class, 'restore']);
        Route::post('/bulk-delete', [StudentController::class, 'bulkDelete']);
        Route::post('/bulk-update-status', [StudentController::class, 'bulkUpdateStatus']);
        Route::post('/bulk-update-account-type', [StudentController::class, 'bulkUpdateAccountType']);
        Route::post('/import', [StudentController::class, 'import']);
        Route::get('/export', [StudentController::class, 'export']);
    });

    // Media
    Route::prefix('media')->group(function () {
        Route::get('/', [MediaController::class, 'index']);
        Route::post('/upload', [MediaController::class, 'store']);
        Route::post('/upload-from-url', [MediaController::class, 'uploadFromUrl']);
        Route::get('/statistics', [MediaController::class, 'statistics']);
        Route::get('/usage', [MediaController::class, 'getUsageByDate']);
        Route::get('/{id}', [MediaController::class, 'show']);
        Route::put('/{id}', [MediaController::class, 'update']);
        Route::delete('/{id}', [MediaController::class, 'destroy']);
        Route::get('/{id}/download', [MediaController::class, 'download']);
        Route::post('/{id}/generate-thumbnail', [MediaController::class, 'generateThumbnail']);
        Route::post('/{id}/optimize', [MediaController::class, 'optimize']);
        Route::post('/{id}/move-storage', [MediaController::class, 'moveToStorage']);
        Route::post('/bulk-delete', [MediaController::class, 'bulkDelete']);

        // Media Categories
        Route::prefix('categories')->group(function () {
            Route::get('/', [MediaCategoryController::class, 'index']);
            Route::post('/', [MediaCategoryController::class, 'store']);
            Route::put('/{id}', [MediaCategoryController::class, 'update']);
            Route::delete('/{id}', [MediaCategoryController::class, 'destroy']);
            Route::post('/reorder', [MediaCategoryController::class, 'reorder']);
        });

        // Media Albums
        Route::prefix('albums')->group(function () {
            Route::get('/', [MediaAlbumController::class, 'index']);
            Route::post('/', [MediaAlbumController::class, 'store']);
            Route::get('/{id}', [MediaAlbumController::class, 'show']);
            Route::put('/{id}', [MediaAlbumController::class, 'update']);
            Route::delete('/{id}', [MediaAlbumController::class, 'destroy']);
            Route::post('/{id}/add-media', [MediaAlbumController::class, 'addMedia']);
            Route::post('/{id}/remove-media', [MediaAlbumController::class, 'removeMedia']);
            Route::post('/{id}/reorder-media', [MediaAlbumController::class, 'reorderMedia']);
        });
    });

    // Questions
    Route::prefix('questions')->group(function () {
        Route::get('/', [QuestionController::class, 'index']);
        Route::get('/filters', [QuestionController::class, 'getFilters']);
        Route::get('/statistics', [QuestionController::class, 'statistics']);
        Route::get('/{id}', [QuestionController::class, 'show']);
        Route::post('/', [QuestionController::class, 'store']);
        Route::put('/{id}', [QuestionController::class, 'update']);
        Route::delete('/{id}', [QuestionController::class, 'destroy']);
        Route::post('/{id}/duplicate', [QuestionController::class, 'duplicate']);
        Route::post('/{id}/toggle-status', [QuestionController::class, 'toggleStatus']);
        Route::post('/bulk-delete', [QuestionController::class, 'bulkDelete']);
        Route::post('/bulk-update-status', [QuestionController::class, 'bulkUpdateStatus']);
        Route::post('/import', [QuestionController::class, 'import']);
        Route::get('/export', [QuestionController::class, 'export']);
        Route::get('/download-template', [QuestionController::class, 'downloadTemplate']);

        Route::prefix('categories')->group(function () {
            Route::get('/', [QuestionCategoryController::class, 'index']);
            Route::post('/', [QuestionCategoryController::class, 'store']);
            Route::put('/{id}', [QuestionCategoryController::class, 'update']);
            Route::delete('/{id}', [QuestionCategoryController::class, 'destroy']);
        });

        Route::prefix('age-groups')->group(function () {
            Route::get('/', [AgeGroupController::class, 'index']);
            Route::post('/', [AgeGroupController::class, 'store']);
            Route::put('/{id}', [AgeGroupController::class, 'update']);
            Route::delete('/{id}', [AgeGroupController::class, 'destroy']);
        });
    });
});
