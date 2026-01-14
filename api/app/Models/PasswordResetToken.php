<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PasswordResetToken extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'token',
        'created_at',
        'expires_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function generateToken(string $userId): string
    {
        // Delete old tokens for this user
        self::where('user_id', $userId)->delete();

        $token = Str::random(64);

        self::create([
            'user_id' => $userId,
            'token' => $token,
            'created_at' => now(),
            'expires_at' => now()->addHours(24), // Token valid for 24 hours
        ]);

        return $token;
    }

    public static function verifyToken(string $token): ?User
    {
        $resetToken = self::where('token', $token)
            ->where('expires_at', '>', now())
            ->first();

        if (!$resetToken) {
            return null;
        }

        return $resetToken->user;
    }
}
