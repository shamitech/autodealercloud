<?php

namespace App\Http\Controllers\Api;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

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
            'slug' => 'required|string|unique:tenants|max:50',
            'domain' => 'nullable|string|unique:tenants',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $tenant = Tenant::create($validated);

        return response()->json([
            'data' => $tenant,
        ], 201);
    }

    /**
     * Update a tenant
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'domain' => 'nullable|string|unique:tenants,domain,' . $tenant->id,
            'status' => 'in:active,inactive,suspended',
        ]);

        $tenant->update($validated);

        return response()->json([
            'data' => $tenant,
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
