<?php

use App\Http\Controllers\Api\Student\TestTakingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:student'])->group(function () {
    Route::prefix('tests')->group(function () {
        Route::get('/available', [TestTakingController::class, 'getAvailableTests']);
        Route::post('/{testId}/start', [TestTakingController::class, 'startTest']);
        Route::get('/{testId}/questions', [TestTakingController::class, 'getTestQuestions']);
        Route::post('/attempts/{attemptId}/submit-answer', [TestTakingController::class, 'submitAnswer']);
        Route::post('/attempts/{attemptId}/complete', [TestTakingController::class, 'completeTest']);
        Route::get('/attempts/{attemptId}/result', [TestTakingController::class, 'getTestResult']);
        Route::get('/attempts', [TestTakingController::class, 'getStudentAttempts']);
        Route::get('/attempts/{attemptId}/details', [TestTakingController::class, 'getAttemptDetails']);
    });
});