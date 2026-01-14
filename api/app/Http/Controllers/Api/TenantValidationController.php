<?php

namespace App\Http\Controllers\Api;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TenantValidationController extends Controller
{
    /**
     * Check if a tenant exists by subdomain (public endpoint, no auth required)
     * Uses fresh query builder to ensure we always read from database
     */
    public function checkExists(Request $request)
    {
        $subdomain = $request->query('subdomain');

        if (!$subdomain) {
            return response()->json(['exists' => false], 400);
        }

        // Query fresh from DB without any caching layers
        $tenant = Tenant::query()
            ->where('slug', $subdomain)
            ->where('status', 'active')
            ->first();

        return response()->json([
            'exists' => !!$tenant,
            'tenant' => $tenant ? [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
            ] : null,
        ]);
    }
}
