<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\QuestionController;
use App\Http\Controllers\Api\Student\StudentQuestionController;
use App\Http\Controllers\Api\PublicMediaController;
use App\Http\Controllers\Api\PublicProductController;


Route::middleware('api')
    ->prefix('admin')
    ->group(base_path('routes/admin.php'));
Route::middleware('api')
    ->group(base_path('routes/student.php'));

Route::get('/super-kids/categories', [QuestionController::class, 'getSuperKidsCategories']);

Route::prefix('public')->group(function () {
    Route::get('/media', [PublicMediaController::class, 'index']);
    Route::get('/media/{media}', [PublicMediaController::class, 'show']);

    Route::get('/products', [PublicProductController::class, 'index']);
    Route::get('/products/{slug}', [PublicProductController::class, 'show']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get(
        '/student/questions/by-category/{slug}',
        [StudentQuestionController::class, 'getByCategory']
    );
});
