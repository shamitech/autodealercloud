<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;

class IdentifyTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $tenant = $this->resolveTenant($request);

        if (!$tenant) {
            return response()->json(['error' => 'Tenant not found'], 404);
        }

        // Store tenant in request and config
        $request->attributes->set('tenant', $tenant);
        config(['app.tenant_id' => $tenant->id]);

        return $next($request);
    }

    /**
     * Resolve the tenant from the request
     */
    private function resolveTenant(Request $request): ?Tenant
    {
        $host = $request->getHost();

        // Try to get subdomain
        $subdomain = $this->getSubdomain($host);

        if ($subdomain && $subdomain !== 'www') {
            // Find tenant by subdomain slug
            return Tenant::findBySlug($subdomain);
        }

        // Try to find tenant by full domain (including custom domains)
        return Tenant::findByDomain($host);
    }

    /**
     * Extract subdomain from host
     */
    private function getSubdomain(string $host): ?string
    {
        $parts = explode('.', $host);

        // If we have more than 2 parts, first part is subdomain
        if (count($parts) > 2) {
            return $parts[0];
        }

        return null;
    }
}
