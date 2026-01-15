<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NavigationItem extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'parent_id',
        'location',
        'label',
        'link_type',
        'page_id',
        'url',
        'inventory_filters',
        'order',
        'is_visible',
        'open_in_new_tab',
        'icon',
        'css_classes',
        'is_highlighted',
        'highlight_color',
    ];

    protected $casts = [
        'inventory_filters' => 'array',
        'is_visible' => 'boolean',
        'open_in_new_tab' => 'boolean',
        'is_highlighted' => 'boolean',
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
     * Get the tenant that owns the navigation item
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the parent navigation item
     */
    public function parent()
    {
        return $this->belongsTo(NavigationItem::class, 'parent_id');
    }

    /**
     * Get child navigation items
     */
    public function children()
    {
        return $this->hasMany(NavigationItem::class, 'parent_id')->orderBy('order');
    }

    /**
     * Get the linked page
     */
    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Scope to visible items
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to header items
     */
    public function scopeHeader($query)
    {
        return $query->where('location', 'header');
    }

    /**
     * Scope to footer items
     */
    public function scopeFooter($query)
    {
        return $query->where('location', 'footer');
    }

    /**
     * Scope to top-level items (no parent)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get the resolved URL for this navigation item
     */
    public function getResolvedUrlAttribute(): string
    {
        switch ($this->link_type) {
            case 'page':
                return $this->page ? $this->page->url : '/';
            case 'url':
                return $this->url ?: '/';
            case 'inventory':
                $params = http_build_query($this->inventory_filters ?? []);
                return '/inventory' . ($params ? '?' . $params : '');
            case 'anchor':
                return $this->url ?: '#';
            case 'dropdown':
                return '#';
            default:
                return '/';
        }
    }

    /**
     * Check if this item has children
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Get navigation tree structure
     */
    public static function getTree(string $tenantId, string $location = 'header'): array
    {
        $items = self::where('tenant_id', $tenantId)
            ->where('location', $location)
            ->where('is_visible', true)
            ->whereNull('parent_id')
            ->with(['children' => function ($query) {
                $query->where('is_visible', true)->orderBy('order');
            }, 'page'])
            ->orderBy('order')
            ->get();

        return $items->map(function ($item) {
            return [
                'id' => $item->id,
                'label' => $item->label,
                'url' => $item->resolved_url,
                'open_in_new_tab' => $item->open_in_new_tab,
                'is_highlighted' => $item->is_highlighted,
                'highlight_color' => $item->highlight_color,
                'icon' => $item->icon,
                'children' => $item->children->map(function ($child) {
                    return [
                        'id' => $child->id,
                        'label' => $child->label,
                        'url' => $child->resolved_url,
                        'open_in_new_tab' => $child->open_in_new_tab,
                    ];
                })->toArray(),
            ];
        })->toArray();
    }
}
