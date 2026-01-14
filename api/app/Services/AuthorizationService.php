<?php

namespace App\Services;

use App\Models\User;

class AuthorizationService
{
    /**
     * Define role hierarchy - higher roles inherit lower role permissions
     */
    private const ROLE_HIERARCHY = [
        'admin' => ['admin', 'editor', 'viewer', 'member'],
        'editor' => ['editor', 'viewer', 'member'],
        'viewer' => ['viewer', 'member'],
        'member' => ['member'],
    ];

    /**
     * Check if user has required role
     */
    public static function hasRole(User $user, string|array $roles): bool
    {
        $requiredRoles = is_array($roles) ? $roles : [$roles];
        return in_array($user->role, $requiredRoles);
    }

    /**
     * Check if user has permission based on role hierarchy
     */
    public static function hasPermissionLevel(User $user, string $requiredRole): bool
    {
        $allowedRoles = self::ROLE_HIERARCHY[$user->role] ?? [];
        return in_array($requiredRole, $allowedRoles);
    }

    /**
     * Get available actions for user role
     */
    public static function getPermissions(User $user): array
    {
        $permissions = [
            'admin' => [
                'manage_users' => true,
                'manage_domains' => true,
                'connect_lightspeed' => true,
                'sync_products' => true,
                'view_products' => true,
                'manage_settings' => true,
            ],
            'editor' => [
                'manage_users' => false,
                'manage_domains' => false,
                'connect_lightspeed' => true,
                'sync_products' => true,
                'view_products' => true,
                'manage_settings' => false,
            ],
            'viewer' => [
                'manage_users' => false,
                'manage_domains' => false,
                'connect_lightspeed' => false,
                'sync_products' => false,
                'view_products' => true,
                'manage_settings' => false,
            ],
            'member' => [
                'manage_users' => false,
                'manage_domains' => false,
                'connect_lightspeed' => false,
                'sync_products' => false,
                'view_products' => false,
                'manage_settings' => false,
            ],
        ];

        return $permissions[$user->role] ?? [];
    }

    /**
     * Check if user can perform an action
     */
    public static function can(User $user, string $action): bool
    {
        $permissions = self::getPermissions($user);
        return $permissions[$action] ?? false;
    }

    /**
     * Get role description
     */
    public static function getRoleDescription(string $role): string
    {
        $descriptions = [
            'admin' => 'Full access to all features',
            'editor' => 'Can manage products and content',
            'viewer' => 'Read-only access to products',
            'member' => 'Limited access',
        ];

        return $descriptions[$role] ?? 'Unknown role';
    }
}
