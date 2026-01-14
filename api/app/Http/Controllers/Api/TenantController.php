<?php

namespace App\Http\Controllers\Api;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    /**
     * Get all tenants (admin only)
     */
    public function index()
    {
        return response()->json([
            'data' => Tenant::all(),
        ]);
    }

    /**
     * Get a specific tenant
     */
    public function show(Tenant $tenant)
    {
        return response()->json([
            'data' => $tenant->load('domains'),
        ]);
    }

    /**
     * Create a new tenant (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subdomain' => 'required|string|max:50|unique:tenants,domain',
            'plan' => 'nullable|string|in:starter,professional,enterprise',
        ]);

        // Create tenant with domain based on subdomain
        $tenantData = [
            'name' => $validated['name'],
            'domain' => $validated['subdomain'] . '.autodealercloud.com',
            'slug' => $validated['subdomain'],
            'status' => 'active',
            'plan' => $validated['plan'] ?? 'starter',
        ];

        $tenant = Tenant::create($tenantData);

        // Create a user for this tenant with admin role
        $tenant->users()->create([
            'name' => $validated['name'] . ' Admin',
            'email' => $validated['email'],
            'password' => bcrypt(Str::random(16)),
            'role' => 'admin',
            'is_active' => true,
        ]);

        return response()->json([
            'data' => $tenant,
            'message' => 'Tenant created successfully',
        ], 201);
    }

    /**
     * Update a tenant
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'plan' => 'sometimes|string|in:starter,professional,enterprise',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        // Don't allow changing subdomain/domain directly
        $updateData = array_filter([
            'name' => $validated['name'] ?? null,
            'status' => $validated['status'] ?? null,
            'plan' => $validated['plan'] ?? null,
        ]);

        $tenant->update($updateData);

        return response()->json([
            'data' => $tenant,
            'message' => 'Tenant updated successfully',
        ]);
    }

    /**
     * Delete a tenant
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return response()->json(null, 204);
    }

    /**
     * Get current tenant
     */
    public function current(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        return response()->json([
            'data' => $tenant->load('domains'),
        ]);
    }
}
