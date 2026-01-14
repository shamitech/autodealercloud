<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Test route - check current tenant
Route::middleware(['identify-tenant'])->get('/tenant', function (Request $request) {
    $tenant = $request->attributes->get('tenant');
    return response()->json([
        'tenant' => $tenant,
        'tenant_id_from_config' => config('app.tenant_id'),
    ]);
});
