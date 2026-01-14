<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, BelongsToTenant;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'tenant_id',
        'lightspeed_id',
        'name',
        'sku',
        'description',
        'category',
        'manufacturer',
        'price',
        'cost',
        'quantity',
        'image_url',
        'lightspeed_data',
        'last_synced_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'quantity' => 'integer',
        'lightspeed_data' => 'json',
        'last_synced_at' => 'datetime',
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
     * Get the tenant for this product
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope to get products by Lightspeed ID
     */
    public function scopeByLightspeedId($query, $lightspeedId)
    {
        return $query->where('lightspeed_id', $lightspeedId);
    }

    /**
     * Scope to get products by SKU
     */
    public function scopeBySku($query, $sku)
    {
        return $query->where('sku', $sku);
    }
}
