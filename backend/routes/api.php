<?php

use Illuminate\Support\Facades\Route;

Route::middleware('api')
    ->prefix('admin')
    ->group(base_path('routes/admin.php'));


// <?php

// use Illuminate\Support\Facades\Route;

// require __DIR__.'/admin.php';
// require __DIR__.'/student.php';

// Route::prefix('student')->group(function () {
//     Route::post('login', [\App\Http\Controllers\Api\Student\AuthController::class, 'login']);
//     Route::post('register', [\App\Http\Controllers\Api\Student\AuthController::class, 'register']);
    
//     Route::middleware(['auth:student'])->group(function () {
//         Route::post('logout', [\App\Http\Controllers\Api\Student\AuthController::class, 'logout']);
//         Route::get('me', [\App\Http\Controllers\Api\Student\AuthController::class, 'me']);
//     });
// });