<?php

use App\Http\Controllers\Api\Auth\TenantAuthController;
use App\Http\Controllers\Api\DomainController;
use App\Http\Controllers\Api\LightspeedController;
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

// Platform auth routes (for dashboard - no tenant context required)
Route::prefix('platform')->group(function () {
    Route::post('login', [TenantAuthController::class, 'platformLogin']);
    
    // Protected platform routes (require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [TenantAuthController::class, 'platformLogout']);
        Route::get('me', [TenantAuthController::class, 'me']);
        
        // Tenant management (platform admin only)
        Route::apiResource('tenants', TenantController::class);
        
        // Stats endpoint
        Route::get('stats', function () {
            return response()->json([
                'total_tenants' => Tenant::count(),
                'active_tenants' => Tenant::where('status', 'active')->count(),
                'pending_tenants' => Tenant::where('status', 'pending')->count(),
            ]);
        });
    });
});

// Test route (no middleware)
Route::get('/platform-test', function () {
    return ['message' => 'Platform test OK'];
});

// Admin routes for tenant management
Route::prefix('admin')->group(function () {
    Route::apiResource('tenants', TenantController::class);
});

// Tenant auth routes (public)
Route::middleware(['identify-tenant'])->prefix('auth')->group(function () {
    Route::post('register', [TenantAuthController::class, 'register']);
    Route::post('login', [TenantAuthController::class, 'login']);
    Route::post('logout', [TenantAuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [TenantAuthController::class, 'me'])->middleware('auth:sanctum');
    Route::get('permissions', [TenantAuthController::class, 'permissions'])->middleware('auth:sanctum');
});

// Tenant routes (require tenant context)
Route::middleware(['identify-tenant'])->group(function () {
    Route::get('/tenant/current', [TenantController::class, 'current'])->middleware('auth:sanctum');
    
    // Domain management - Admin only
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('domains', DomainController::class, ['only' => ['index', 'store', 'show', 'update', 'destroy']]);
        Route::post('domains/{domain}/verify', [DomainController::class, 'verify']);
    });
    
    // User management - Admin only
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
        Route::post('users/{user}/record-login', [UserController::class, 'recordLogin']);
    });
    
    // Lightspeed integration routes
    Route::post('lightspeed/connect', [LightspeedController::class, 'connect'])->middleware('auth:sanctum');
    Route::get('lightspeed/status', [LightspeedController::class, 'status'])->middleware('auth:sanctum');
    Route::post('lightspeed/sync-products', [LightspeedController::class, 'syncProducts'])->middleware(['auth:sanctum', 'role:admin|editor']);
    Route::get('lightspeed/products', [LightspeedController::class, 'products'])->middleware('auth:sanctum');
    Route::get('lightspeed/products/{product}', [LightspeedController::class, 'show'])->middleware('auth:sanctum');
    Route::post('lightspeed/disconnect', [LightspeedController::class, 'disconnect'])->middleware('auth:sanctum');
});
