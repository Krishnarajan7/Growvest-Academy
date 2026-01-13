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

// Tests
use App\Http\Controllers\Api\Admin\TestController;

// 
use App\Http\Controllers\Api\Admin\StudentAnalyticsController;



/*
|--------------------------------------------------------------------------
| PUBLIC API ROUTES
|--------------------------------------------------------------------------
*/
Route::get('/super-kids/categories', [QuestionController::class, 'getSuperKidsCategories']);

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

    // Student Management Routes
Route::prefix('students')->middleware(['auth:admin'])->group(function () {
    Route::get('/', [StudentController::class, 'index']);
    Route::get('/filters', [StudentController::class, 'getFilters']);
    Route::get('/statistics', [StudentController::class, 'statistics']);
    Route::get('/{id}', [StudentController::class, 'show']);
    Route::post('/', [StudentController::class, 'store']);
    Route::put('/{id}', [StudentController::class, 'update']);
    Route::delete('/{id}', [StudentController::class, 'destroy']);
    Route::delete('/{id}/force', [StudentController::class, 'forceDelete']);
    Route::post('/{id}/restore', [StudentController::class, 'restore']);
    
    // Bulk Operations
    Route::post('/bulk-create', [StudentController::class, 'bulkCreate']);
    Route::post('/bulk-delete', [StudentController::class, 'bulkDelete']);
    Route::post('/bulk-update-status', [StudentController::class, 'bulkUpdateStatus']);
    Route::post('/bulk-update-account-type', [StudentController::class, 'bulkUpdateAccountType']);
    
    // Password Management
    Route::post('/{id}/reset-password', [StudentController::class, 'resetPassword']);
    Route::get('/{id}/login-credentials', [StudentController::class, 'getLoginCredentials']);
    
    // Import/Export
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
    Route::post('/', [QuestionController::class, 'store']);
    Route::post('/import', [QuestionController::class, 'import']);
    Route::get('/export', [QuestionController::class, 'export']);
    Route::get('/download-template', [QuestionController::class, 'downloadTemplate']);
    Route::post('/bulk-delete', [QuestionController::class, 'bulkDelete']);
    Route::post('/bulk-update-status', [QuestionController::class, 'bulkUpdateStatus']);

    Route::prefix('age-groups')->group(function () {
        Route::get('/', [AgeGroupController::class, 'index']);
        Route::post('/', [AgeGroupController::class, 'store']);
        Route::put('/{id}', [AgeGroupController::class, 'update']);
        Route::delete('/{id}', [AgeGroupController::class, 'destroy']);
    });

    Route::prefix('categories')->group(function () {
        Route::get('/', [QuestionCategoryController::class, 'index']);
        Route::post('/', [QuestionCategoryController::class, 'store']);
        Route::put('/{id}', [QuestionCategoryController::class, 'update']);
        Route::delete('/{id}', [QuestionCategoryController::class, 'destroy']);
    });

    Route::get('/{id}', [QuestionController::class, 'show']);
    Route::put('/{id}', [QuestionController::class, 'update']);
    Route::delete('/{id}', [QuestionController::class, 'destroy']);
    Route::post('/{id}/duplicate', [QuestionController::class, 'duplicate']);
    Route::post('/{id}/toggle-status', [QuestionController::class, 'toggleStatus']);
});


    // Test Management Routes
Route::prefix('tests')->middleware(['auth:admin'])->group(function () {
    Route::get('/', [TestController::class, 'index']);
    Route::get('/filters', [TestController::class, 'getFilters']);
    Route::get('/{id}', [TestController::class, 'show']);
    Route::get('/{id}/statistics', [TestController::class, 'getTestStatistics']);
    Route::post('/', [TestController::class, 'store']);
    Route::put('/{id}', [TestController::class, 'update']);
    Route::delete('/{id}', [TestController::class, 'destroy']);
    
    // Question Management
    Route::post('/{id}/add-questions', [TestController::class, 'addQuestions']);
    Route::post('/{id}/remove-questions', [TestController::class, 'removeQuestions']);
    Route::post('/{id}/reorder-questions', [TestController::class, 'reorderQuestions']);
    
    // Import/Export
    Route::post('/{id}/import-questions-csv', [TestController::class, 'importQuestionsFromCsv']);
    Route::get('/{id}/export-questions', [TestController::class, 'exportTestQuestions']);
    
    // Bulk Operations
    Route::post('/bulk-delete', [TestController::class, 'bulkDelete']);
    Route::post('/bulk-update-status', [TestController::class, 'bulkUpdateStatus']);
});


    // Student Analytics Routes
Route::prefix('analytics/students')->middleware(['auth:admin'])->group(function () {
    Route::get('/', [StudentAnalyticsController::class, 'getAnalytics']);
    Route::get('/performance', [StudentAnalyticsController::class, 'getCategoryPerformance']);
    Route::get('/age-groups', [StudentAnalyticsController::class, 'getAgeGroupPerformance']);
    Route::get('/top-performers', [StudentAnalyticsController::class, 'getTopPerformers']);
    Route::get('/monthly-trends', [StudentAnalyticsController::class, 'getMonthlyTrends']);
    Route::get('/list', [StudentAnalyticsController::class, 'getStudentsList']);
    
    // Individual Student Analytics
    Route::prefix('{studentId}')->group(function () {
        Route::get('/', [StudentAnalyticsController::class, 'getStudentPerformance']);
        Route::get('/category-scores', [StudentAnalyticsController::class, 'getStudentCategoryScores']);
        Route::get('/test-history', [StudentAnalyticsController::class, 'getStudentTestHistory']);
        Route::get('/export-report', [StudentAnalyticsController::class, 'exportStudentReport']);
    });
});

});
