<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PageBlock extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'page_id',
        'block_type',
        'order',
        'content',
        'settings',
        'is_visible',
        'mobile_visible',
        'desktop_visible',
    ];

    protected $casts = [
        'content' => 'array',
        'settings' => 'array',
        'is_visible' => 'boolean',
        'mobile_visible' => 'boolean',
        'desktop_visible' => 'boolean',
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
     * Get the page that owns the block
     */
    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Scope to visible blocks
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Get default content structure for a block type
     */
    public static function getDefaultContent(string $blockType): array
    {
        $defaults = [
            'hero' => [
                'title' => 'Welcome to Our Dealership',
                'subtitle' => 'Your trusted automotive partner',
                'background_image' => null,
                'background_video' => null,
                'overlay_opacity' => 50,
                'text_alignment' => 'center',
                'height' => 'large',
                'buttons' => [
                    ['text' => 'View Inventory', 'url' => '/inventory', 'style' => 'primary'],
                ],
            ],
            'text' => [
                'content' => '<p>Enter your content here...</p>',
                'alignment' => 'left',
            ],
            'image' => [
                'url' => null,
                'alt' => '',
                'caption' => '',
                'link_url' => null,
                'size' => 'full',
            ],
            'image_gallery' => [
                'images' => [],
                'columns' => 3,
                'lightbox' => true,
            ],
            'video' => [
                'type' => 'youtube', // youtube, vimeo, url
                'video_id' => '',
                'url' => '',
                'autoplay' => false,
                'muted' => true,
            ],
            'button' => [
                'text' => 'Click Here',
                'url' => '/',
                'style' => 'primary',
                'size' => 'medium',
                'alignment' => 'center',
                'open_in_new_tab' => false,
            ],
            'spacer' => [
                'height' => '50px',
                'mobile_height' => '25px',
            ],
            'divider' => [
                'style' => 'solid',
                'width' => '100%',
                'color' => '#e5e7eb',
            ],
            'featured_inventory' => [
                'title' => 'Featured Inventory',
                'count' => 6,
                'filter' => 'featured',
                'columns' => 3,
                'show_view_all' => true,
            ],
            'inventory_grid' => [
                'title' => '',
                'filter' => [],
                'columns' => 3,
                'count' => 12,
                'show_pagination' => true,
                'show_filters' => true,
            ],
            'inventory_carousel' => [
                'title' => 'Our Inventory',
                'filter' => [],
                'count' => 8,
                'autoplay' => true,
                'autoplay_speed' => 5000,
            ],
            'category_cards' => [
                'title' => 'Browse By Category',
                'categories' => [],
                'columns' => 4,
                'show_count' => true,
            ],
            'brand_logos' => [
                'title' => 'Our Partners',
                'logos' => [],
                'columns' => 6,
                'grayscale' => false,
            ],
            'contact_form' => [
                'title' => 'Contact Us',
                'fields' => ['name', 'email', 'phone', 'message'],
                'submit_text' => 'Send Message',
                'success_message' => 'Thank you! We will get back to you soon.',
            ],
            'map' => [
                'title' => 'Find Us',
                'address' => '',
                'latitude' => null,
                'longitude' => null,
                'zoom' => 15,
                'height' => '400px',
            ],
            'business_hours' => [
                'title' => 'Business Hours',
                'show_current_status' => true,
            ],
            'testimonials' => [
                'title' => 'What Our Customers Say',
                'testimonials' => [],
                'layout' => 'carousel',
                'show_rating' => true,
            ],
            'team_members' => [
                'title' => 'Meet Our Team',
                'members' => [],
                'columns' => 4,
            ],
            'faq' => [
                'title' => 'Frequently Asked Questions',
                'items' => [],
                'style' => 'accordion',
            ],
            'cta_banner' => [
                'title' => 'Ready to Find Your Dream Vehicle?',
                'subtitle' => 'Contact us today for the best deals',
                'button_text' => 'Get Started',
                'button_url' => '/contact',
                'background_color' => null,
            ],
            'newsletter' => [
                'title' => 'Subscribe to Our Newsletter',
                'subtitle' => 'Stay updated with our latest offers',
                'button_text' => 'Subscribe',
                'placeholder' => 'Enter your email',
            ],
            'promo_banner' => [
                'title' => 'Special Offer',
                'content' => '',
                'image' => null,
                'link_url' => null,
                'expires_at' => null,
            ],
            'html' => [
                'html' => '',
            ],
            'embed' => [
                'url' => '',
                'height' => '400px',
                'width' => '100%',
            ],
            'columns' => [
                'columns' => 2,
                'gap' => '24px',
                'children' => [],
            ],
            'container' => [
                'max_width' => '1200px',
                'padding' => '24px',
                'children' => [],
            ],
        ];

        return $defaults[$blockType] ?? [];
    }

    /**
     * Get default settings for a block type
     */
    public static function getDefaultSettings(string $blockType): array
    {
        return [
            'padding_top' => '40px',
            'padding_bottom' => '40px',
            'padding_left' => '0',
            'padding_right' => '0',
            'margin_top' => '0',
            'margin_bottom' => '0',
            'background_color' => null,
            'background_image' => null,
            'css_classes' => '',
            'css_id' => '',
        ];
    }
}
