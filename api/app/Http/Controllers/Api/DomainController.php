<?php

namespace App\Http\Controllers\Api;

use App\Models\Domain;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DomainController extends Controller
{
    /**
     * Get all domains for a tenant or all domains (if no tenant context)
     */
    public function index(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        // If no tenant context, return all domains (for platform admin)
        if (!$tenant) {
            return response()->json([
                'data' => Domain::all(),
            ]);
        }

        return response()->json([
            'data' => $tenant->domains,
        ]);
    }

    /**
     * Add a custom domain to a tenant
     */
    public function store(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'domain' => 'required|string|unique:domains|max:255',
        ]);

        $domain = Domain::create([
            'tenant_id' => $tenant->id,
            'domain' => $validated['domain'],
        ]);

        return response()->json([
            'data' => $domain,
        ], 201);
    }

    /**
     * Verify a domain ownership
     */
    public function verify(Request $request, Domain $domain)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant || $domain->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // In a real application, you would verify DNS records here
        // For now, we'll just mark it as verified
        $domain->markVerified();

        return response()->json([
            'data' => $domain,
            'message' => 'Domain verified successfully',
        ]);
    }

    /**
     * Delete a domain
     */
    public function destroy(Request $request, Domain $domain)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant || $domain->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $domain->delete();

        return response()->json(null, 204);
    }
}
