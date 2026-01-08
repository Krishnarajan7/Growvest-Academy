<?php

use Illuminate\Support\Facades\Route;

Route::middleware('api')
    ->prefix('admin')
    ->group(base_path('routes/admin.php'));
