<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  $roles
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, string $roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $allowedRoles = explode('|', $roles);

        if (!in_array($user->role, $allowedRoles)) {
            return response()->json([
                'error' => 'Forbidden: Insufficient permissions',
                'required_roles' => $allowedRoles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
