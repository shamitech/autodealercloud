<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SiteSettings extends Model
{
    use HasFactory;

    protected $table = 'site_settings';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        // Business Information
        'business_name',
        'tagline',
        'description',
        'phone',
        'phone_secondary',
        'email',
        'address',
        'city',
        'state',
        'zip',
        'country',
        // Branding
        'logo_url',
        'logo_alt_text',
        'favicon_url',
        // Colors
        'primary_color',
        'secondary_color',
        'accent_color',
        'text_color',
        'background_color',
        'header_bg_color',
        'header_text_color',
        'footer_bg_color',
        'footer_text_color',
        // Typography
        'heading_font',
        'body_font',
        'heading_font_weight',
        'body_font_weight',
        'base_font_size',
        // Social Media
        'facebook_url',
        'instagram_url',
        'youtube_url',
        'twitter_url',
        'linkedin_url',
        'tiktok_url',
        'ebay_url',
        // Business Hours
        'business_hours',
        // SEO
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image_url',
        // Analytics
        'google_analytics_id',
        'google_tag_manager_id',
        'facebook_pixel_id',
        // Custom Code
        'custom_head_code',
        'custom_body_start_code',
        'custom_body_end_code',
    ];

    protected $casts = [
        'business_hours' => 'array',
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
     * Get default business hours structure
     */
    public static function getDefaultBusinessHours(): array
    {
        return [
            'monday' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
            'tuesday' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
            'wednesday' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
            'thursday' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
            'friday' => ['open' => '09:00', 'close' => '18:00', 'closed' => false],
            'saturday' => ['open' => '09:00', 'close' => '12:00', 'closed' => false],
            'sunday' => ['open' => null, 'close' => null, 'closed' => true],
        ];
    }

    /**
     * Generate CSS variables from settings
     */
    public function getCssVariables(): string
    {
        return "
            :root {
                --primary-color: {$this->primary_color};
                --secondary-color: {$this->secondary_color};
                --accent-color: {$this->accent_color};
                --text-color: {$this->text_color};
                --background-color: {$this->background_color};
                --header-bg-color: {$this->header_bg_color};
                --header-text-color: {$this->header_text_color};
                --footer-bg-color: {$this->footer_bg_color};
                --footer-text-color: {$this->footer_text_color};
                --heading-font: '{$this->heading_font}', sans-serif;
                --body-font: '{$this->body_font}', sans-serif;
                --heading-font-weight: {$this->heading_font_weight};
                --body-font-weight: {$this->body_font_weight};
                --base-font-size: {$this->base_font_size};
            }
        ";
    }
}
