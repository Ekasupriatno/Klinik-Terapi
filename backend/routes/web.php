<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Klinik Terapi API',
        'status' => 'online',
        'version' => '1.0.0',
        'api_docs' => url('/api'),
    ]);
});
