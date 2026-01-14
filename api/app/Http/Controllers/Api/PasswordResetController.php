<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class PasswordResetController extends Controller
{
    /**
     * Request password reset - sends email with reset link
     */
    public function requestReset(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            // Don't reveal if email exists for security
            return response()->json(['message' => 'If an account exists, a password reset link will be sent.']);
        }

        // Generate reset token
        $token = PasswordResetToken::generateToken($user->id);

        // Build reset URL - adjust domain based on tenant context
        $resetUrl = $this->buildResetUrl($user, $token);

        // Send email
        Mail::to($user->email)->send(new PasswordResetMail($user, $token, $resetUrl));

        return response()->json(['message' => 'Password reset link sent to your email.']);
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Verify token
        $user = PasswordResetToken::verifyToken($validated['token']);

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Delete used token
        PasswordResetToken::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }

    /**
     * Build reset URL based on user/tenant context
     */
    private function buildResetUrl(User $user, string $token): string
    {
        $baseUrl = config('app.frontend_url') ?? 'https://dashboard.autodealercloud.com';

        // If user belongs to a tenant (not platform admin)
        if ($user->tenant_id) {
            $tenant = $user->tenant;
            if ($tenant) {
                $baseUrl = "https://{$tenant->slug}.autodealercloud.com";
            }
        }

        return "{$baseUrl}/reset-password?token={$token}";
    }
}
