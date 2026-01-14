<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <p>Hi {{ $user->name }},</p>
            
            <p>We received a request to reset the password for your AutoDealerCloud account. Click the button below to reset your password.</p>
            
            <p style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Reset Password</a>
            </p>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #2563eb;">
                {{ $resetUrl }}
            </p>
            
            <p>This link will expire in 24 hours.</p>
            
            <p>If you didn't request a password reset, you can ignore this email.</p>
            
            <div class="footer">
                <p>© {{ date('Y') }} AutoDealerCloud. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
