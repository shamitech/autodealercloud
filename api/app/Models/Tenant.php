<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tenant extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'slug',
        'name',
        'domain',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    /**
     * Get the domains for this tenant
     */
    public function domains()
    {
        return $this->hasMany(Domain::class);
    }

    /**
     * Get users for this tenant
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Find tenant by slug
     */
    public static function findBySlug($slug)
    {
        return static::where('slug', $slug)->first();
    }

    /**
     * Find tenant by domain
     */
    public static function findByDomain($domain)
    {
        // Check if domain matches main tenant domain
        $tenant = static::where('domain', $domain)->first();

        if ($tenant) {
            return $tenant;
        }

        // Check custom domains
        $customDomain = Domain::where('domain', $domain)
            ->whereNotNull('verified_at')
            ->first();

        return $customDomain?->tenant;
    }
}
