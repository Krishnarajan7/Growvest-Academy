<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\QuestionController;
use App\Http\Controllers\Api\Student\StudentQuestionController;


Route::middleware('api')
    ->prefix('admin')
    ->group(base_path('routes/admin.php'));
Route::middleware('api')
    ->group(base_path('routes/student.php'));

Route::get('/super-kids/categories', [QuestionController::class, 'getSuperKidsCategories']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get(
        '/student/questions/by-category/{slug}',
        [StudentQuestionController::class, 'getByCategory']
    );
});
