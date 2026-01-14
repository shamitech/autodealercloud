<?php

namespace App\Http\Controllers\Api;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TenantValidationController extends Controller
{
    /**
     * Check if a tenant exists by subdomain (public endpoint, no auth required)
     */
    public function checkExists(Request $request)
    {
        $subdomain = $request->query('subdomain');

        if (!$subdomain) {
            return response()->json(['exists' => false], 400);
        }

        $tenant = Tenant::where('slug', $subdomain)
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
