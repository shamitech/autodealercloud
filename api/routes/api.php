<?php

use App\Http\Controllers\Api\DomainController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\UserController;
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

// Admin routes for tenant management
Route::prefix('admin')->group(function () {
    Route::apiResource('tenants', TenantController::class);
});

// Tenant routes (require tenant context)
Route::middleware(['identify-tenant'])->group(function () {
    Route::get('/tenant/current', [TenantController::class, 'current']);
    Route::apiResource('domains', DomainController::class);
    Route::post('domains/{domain}/verify', [DomainController::class, 'verify']);
    
    // User management routes
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/record-login', [UserController::class, 'recordLogin']);
});
