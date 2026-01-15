<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'status',
        'is_homepage',
        'page_type',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image_url',
        'noindex',
        'nofollow',
        'show_in_nav',
        'nav_order',
        'show_in_footer',
        'footer_order',
        'template',
        'full_width',
        'show_header',
        'show_footer',
    ];

    protected $casts = [
        'is_homepage' => 'boolean',
        'noindex' => 'boolean',
        'nofollow' => 'boolean',
        'show_in_nav' => 'boolean',
        'show_in_footer' => 'boolean',
        'full_width' => 'boolean',
        'show_header' => 'boolean',
        'show_footer' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
            // Auto-generate slug if not provided
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title);
            }
        });

        // When setting a page as homepage, unset other homepages
        static::saving(function ($model) {
            if ($model->is_homepage && $model->isDirty('is_homepage')) {
                Page::where('tenant_id', $model->tenant_id)
                    ->where('id', '!=', $model->id)
                    ->where('is_homepage', true)
                    ->update(['is_homepage' => false]);
            }
        });
    }

    /**
     * Get the tenant that owns the page
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the blocks for this page
     */
    public function blocks()
    {
        return $this->hasMany(PageBlock::class)->orderBy('order');
    }

    /**
     * Get navigation items pointing to this page
     */
    public function navigationItems()
    {
        return $this->hasMany(NavigationItem::class);
    }

    /**
     * Scope to published pages only
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope to get pages for navigation
     */
    public function scopeForNavigation($query)
    {
        return $query->where('show_in_nav', true)->orderBy('nav_order');
    }

    /**
     * Scope to get pages for footer
     */
    public function scopeForFooter($query)
    {
        return $query->where('show_in_footer', true)->orderBy('footer_order');
    }

    /**
     * Get the full URL for this page
     */
    public function getUrlAttribute(): string
    {
        if ($this->is_homepage) {
            return '/';
        }
        return '/' . $this->slug;
    }

    /**
     * Get the SEO title (meta_title or title fallback)
     */
    public function getSeoTitleAttribute(): string
    {
        return $this->meta_title ?: $this->title;
    }

    /**
     * Duplicate a page
     */
    public function duplicate(): Page
    {
        $newPage = $this->replicate();
        $newPage->title = $this->title . ' (Copy)';
        $newPage->slug = $this->slug . '-copy-' . Str::random(4);
        $newPage->status = 'draft';
        $newPage->is_homepage = false;
        $newPage->save();

        // Duplicate blocks
        foreach ($this->blocks as $block) {
            $newBlock = $block->replicate();
            $newBlock->page_id = $newPage->id;
            $newBlock->save();
        }

        return $newPage;
    }
}
