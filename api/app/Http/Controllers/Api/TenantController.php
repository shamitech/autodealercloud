<?php

namespace App\Http\Controllers\Api;

use App\Models\PasswordResetToken;
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
            'subdomain' => 'required|string|max:50|regex:/^[a-z0-9-]+$/|unique:tenants,slug',
            'plan' => 'nullable|string|in:starter,professional,enterprise',
        ], [
            'subdomain.unique' => 'This subdomain is already taken. Please choose another.',
            'subdomain.regex' => 'Subdomain can only contain lowercase letters, numbers, and hyphens.',
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

        // Create a user for this tenant with admin role (with random temporary password)
        $adminUser = $tenant->users()->create([
            'name' => $validated['name'] . ' Admin',
            'email' => $validated['email'],
            'password' => bcrypt(Str::random(16)),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Generate password reset token
        $resetToken = PasswordResetToken::generateToken($adminUser->id);
        $resetUrl = "https://{$validated['subdomain']}.autodealercloud.com/reset-password?token={$resetToken}";

        // Send password reset email via SendGrid
        $this->sendPasswordResetEmail($adminUser->email, $adminUser->name, $resetUrl);

        return response()->json([
            'data' => $tenant,
            'message' => 'Tenant created successfully. Password reset link sent to admin email.',
        ], 201);
    }

    /**
     * Send password reset email via SendGrid
     */
    private function sendPasswordResetEmail($toEmail, $toName, $resetUrl)
    {
        $apiKey = env('SENDGRID_API_KEY');
        if (!$apiKey) {
            \Log::warning("SendGrid API key not configured");
            return;
        }

        $htmlBody = view('emails.password-reset', [
            'name' => $toName,
            'resetUrl' => $resetUrl,
        ])->render();

        $payload = [
            'personalizations' => [
                [
                    'to' => [
                        ['email' => $toEmail, 'name' => $toName]
                    ]
                ]
            ],
            'from' => [
                'email' => env('MAIL_FROM_ADDRESS', 'noreply@autodealercloud.com'),
                'name' => env('MAIL_FROM_NAME', 'AutoDealerCloud')
            ],
            'subject' => 'Reset Your Password',
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => $htmlBody
                ]
            ]
        ];

        $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            \Log::info("Password reset email sent to {$toEmail}");
        } else {
            \Log::error("Failed to send password reset email to {$toEmail}: HTTP {$httpCode} - {$error}");
        }
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
