<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get all users for the current tenant
     */
    public function index(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        return response()->json([
            'data' => User::where('tenant_id', $tenant->id)->get(),
        ]);
    }

    /**
     * Create a new user in the current tenant
     */
    public function store(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where(function ($query) use ($tenant) {
                    return $query->where('tenant_id', $tenant->id);
                }),
            ],
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,editor,viewer,member',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'data' => $user,
        ], 201);
    }

    /**
     * Get a specific user
     */
    public function show(Request $request, User $user)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant || $user->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Update a user
     */
    public function update(Request $request, User $user)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant || $user->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'role' => 'in:admin,editor,viewer,member',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Delete a user
     */
    public function destroy(Request $request, User $user)
    {
        $tenant = $request->attributes->get('tenant');

        if (!$tenant || $user->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->delete();

        return response()->json(null, 204);
    }

    /**
     * Record user last login
     */
    public function recordLogin(User $user)
    {
        $user->update(['last_login_at' => now()]);

        return response()->json([
            'data' => $user,
        ]);
    }
}
