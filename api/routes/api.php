<?php

use App\Http\Controllers\Api\Auth\TenantAuthController;
use App\Http\Controllers\Api\DomainController;
use App\Http\Controllers\Api\LightspeedController;
use App\Http\Controllers\Api\MediaLibraryController;
use App\Http\Controllers\Api\NavigationController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductSettingsController;
use App\Http\Controllers\Api\SiteSettingsController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\TenantValidationController;
use App\Http\Controllers\Api\UserController;
use App\Models\Tenant;
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
        Route::get('me', [TenantAuthController::class, 'platformMe']);
        
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
        
        // Activity endpoint
        Route::get('activity', function () {
            return response()->json([
                'data' => []
            ]);
        });
        
        // Platform domains (for system administration)
        Route::get('domains', [DomainController::class, 'index']);
    });
});

// Direct domains endpoint (falls back to all domains if no tenant context)
Route::middleware('auth:sanctum')->get('domains', [DomainController::class, 'index']);

// Test route (no middleware)
Route::get('/platform-test', function () {
    return ['message' => 'Platform test OK'];
});

// Tenant validation (public, no auth required)
Route::get('tenant/check', [TenantValidationController::class, 'checkExists']);

// Password reset routes (public, no auth required)
Route::prefix('password')->group(function () {
    Route::post('request-reset', [PasswordResetController::class, 'requestReset']);
    Route::post('reset', [PasswordResetController::class, 'resetPassword']);
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
    
    // ====================
    // Website Builder / CMS Routes
    // ====================
    
    // Site Settings
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('site-settings', [SiteSettingsController::class, 'show']);
        Route::put('site-settings', [SiteSettingsController::class, 'update']);
        Route::post('site-settings/logo', [SiteSettingsController::class, 'uploadLogo']);
        Route::post('site-settings/favicon', [SiteSettingsController::class, 'uploadFavicon']);
        Route::get('site-settings/fonts', [SiteSettingsController::class, 'getFonts']);
    });
    
    // Public CSS variables (no auth required for storefront)
    Route::get('site-settings/css', [SiteSettingsController::class, 'getCssVariables']);
    
    // Pages (Admin)
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('pages', PageController::class);
        Route::post('pages/{page}/duplicate', [PageController::class, 'duplicate']);
        Route::put('pages/{page}/blocks', [PageController::class, 'updateBlocks']);
        Route::get('pages/block-types', [PageController::class, 'getBlockTypes']);
    });
    
    // Pages (Public - for storefront rendering)
    Route::get('public/pages/homepage', [PageController::class, 'getHomepage']);
    Route::get('public/pages/{slug}', [PageController::class, 'getBySlug']);
    
    // Navigation (Admin)
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('navigation', NavigationController::class);
        Route::post('navigation/reorder', [NavigationController::class, 'reorder']);
        Route::post('navigation/bulk-save', [NavigationController::class, 'bulkSave']);
    });
    
    // Navigation (Public)
    Route::get('public/navigation', [NavigationController::class, 'getPublicNavigation']);
    
    // Product Display Settings
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('product-settings/display', [ProductSettingsController::class, 'getDisplaySettings']);
        Route::put('product-settings/display', [ProductSettingsController::class, 'updateDisplaySettings']);
        Route::get('product-settings/sold', [ProductSettingsController::class, 'getSoldSettings']);
        Route::put('product-settings/sold', [ProductSettingsController::class, 'updateSoldSettings']);
        Route::get('product-settings/filters', [ProductSettingsController::class, 'getDefaultFilters']);
        Route::get('product-settings/sold/preview', [ProductSettingsController::class, 'previewSoldBehavior']);
    });
    
    // Media Library
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('media', MediaLibraryController::class);
        Route::delete('media/bulk-destroy', [MediaLibraryController::class, 'bulkDestroy']);
        Route::get('media-folders', [MediaLibraryController::class, 'getFolders']);
        Route::post('media-folders', [MediaLibraryController::class, 'createFolder']);
        Route::post('media/move', [MediaLibraryController::class, 'moveToFolder']);
    });
});
