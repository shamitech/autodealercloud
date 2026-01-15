<?php

namespace App\Http\Controllers\Api\Auth;

use App\Models\User;
use App\Services\AuthorizationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;

class TenantAuthController extends Controller
{
    /**
     * Handle tenant user registration
     */
    public function register(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where(function ($query) use ($tenant) {
                    return $query->where('tenant_id', $tenant->id);
                }),
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'member', // Default role
            'is_active' => true,
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Handle tenant user login
     */
    public function login(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('tenant_id', $tenant->id)
            ->where('email', $validated['email'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'error' => 'The provided credentials are invalid.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'error' => 'Your account is inactive.',
            ], 403);
        }

        // Record login
        $user->update(['last_login_at' => now()]);

        // Create API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Handle platform user login (for dashboard - no tenant context)
     */
    public function platformLogin(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'error' => 'The provided credentials are invalid.',
                ], 401);
            }

            // SECURITY: Platform login only allows users with no tenant_id (platform admins)
            if ($user->tenant_id) {
                return response()->json([
                    'error' => 'Access denied. This account belongs to a tenant and cannot access the platform.',
                ], 403);
            }

            // Also check role - must be superadmin or admin
            if (!in_array($user->role, ['superadmin', 'admin'])) {
                return response()->json([
                    'error' => 'Access denied. You do not have permission to access the platform.',
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'debug' => class_basename($e),
            ], 500);
        }
    }
            ], 500);
        }
    }

    /**
     * Handle tenant user logout
     */
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Handle platform user logout
     */
    public function platformLogout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated platform user
     */
    public function platformMe(Request $request)
    {
        $user = $request->user();

        // SECURITY: Platform endpoint can only be accessed by platform admins (no tenant_id)
        if (!$user || $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Get authenticated user for current tenant
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $tenant = $request->attributes->get('tenant');

        if (!$tenant || !$user || $user->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Get user permissions
     */
    public function permissions(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'role' => $user->role,
            'role_description' => AuthorizationService::getRoleDescription($user->role),
            'permissions' => AuthorizationService::getPermissions($user),
        ]);
    }
}
