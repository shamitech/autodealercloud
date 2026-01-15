<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SoldProductSettings extends Model
{
    use HasFactory;

    protected $table = 'sold_product_settings';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        // Behavior
        'sold_behavior',
        // Sold page settings
        'sold_page_title',
        'sold_page_message',
        'show_sold_badge',
        'sold_badge_text',
        'sold_badge_color',
        // Similar products
        'show_similar_on_sold',
        'similar_count_on_sold',
        'similar_matching',
        // SEO
        'keep_sold_indexed',
        'add_sold_schema',
        'days_before_noindex',
        'add_canonical_to_category',
        // Redirect
        'redirect_page_id',
        'redirect_url',
        // Notifications
        'notify_on_sold_visit',
        'notification_email',
        // Archive
        'auto_delete_after_days',
        'show_in_sold_gallery',
    ];

    protected $casts = [
        'show_sold_badge' => 'boolean',
        'show_similar_on_sold' => 'boolean',
        'keep_sold_indexed' => 'boolean',
        'add_sold_schema' => 'boolean',
        'add_canonical_to_category' => 'boolean',
        'notify_on_sold_visit' => 'boolean',
        'show_in_sold_gallery' => 'boolean',
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
     * Get the tenant that owns the settings
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the redirect page
     */
    public function redirectPage()
    {
        return $this->belongsTo(Page::class, 'redirect_page_id');
    }

    /**
     * Handle a sold product request
     * Returns the action to take and associated data
     */
    public function handleSoldProduct(array $product): array
    {
        switch ($this->sold_behavior) {
            case 'sold_page':
                return [
                    'action' => 'show_sold_page',
                    'status' => 200,
                    'data' => [
                        'title' => $this->sold_page_title,
                        'message' => $this->sold_page_message,
                        'product' => $product,
                        'show_similar' => $this->show_similar_on_sold,
                        'similar_count' => $this->similar_count_on_sold,
                    ],
                ];

            case 'redirect_category':
                return [
                    'action' => 'redirect',
                    'status' => 301,
                    'url' => '/inventory?category=' . ($product['category'] ?? ''),
                ];

            case 'redirect_homepage':
                return [
                    'action' => 'redirect',
                    'status' => 301,
                    'url' => '/',
                ];

            case 'redirect_inventory':
                return [
                    'action' => 'redirect',
                    'status' => 301,
                    'url' => '/inventory',
                ];

            case 'archive':
            default:
                return [
                    'action' => 'show_archived',
                    'status' => 200,
                    'data' => [
                        'product' => $product,
                        'show_badge' => $this->show_sold_badge,
                        'badge_text' => $this->sold_badge_text,
                        'badge_color' => $this->sold_badge_color,
                        'show_similar' => $this->show_similar_on_sold,
                        'similar_count' => $this->similar_count_on_sold,
                        'noindex' => !$this->keep_sold_indexed,
                    ],
                ];
        }
    }

    /**
     * Get JSON-LD schema for sold product
     */
    public function getSoldProductSchema(array $product): array
    {
        if (!$this->add_sold_schema) {
            return [];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product['title'] ?? '',
            'description' => $product['description'] ?? '',
            'offers' => [
                '@type' => 'Offer',
                'availability' => 'https://schema.org/OutOfStock',
                'price' => $product['price'] ?? 0,
                'priceCurrency' => 'USD',
            ],
        ];
    }

    /**
     * Check if product page should be noindexed based on age
     */
    public function shouldNoindex(\DateTime $soldDate): bool
    {
        if ($this->keep_sold_indexed && $this->days_before_noindex > 0) {
            $daysSinceSold = $soldDate->diff(new \DateTime())->days;
            return $daysSinceSold >= $this->days_before_noindex;
        }
        return !$this->keep_sold_indexed;
    }
}
