<?php

namespace App\Http\Controllers\Api;

use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Get all pages for current tenant
     */
    public function index(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $pages = Page::where('tenant_id', $tenant->id)
            ->orderBy('title')
            ->get();

        return response()->json([
            'data' => $pages,
        ]);
    }

    /**
     * Create a new page
     */
    public function store(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,published,archived',
            'is_homepage' => 'nullable|boolean',
            'page_type' => 'nullable|in:custom,home,inventory,product_detail,contact,about,services,financing,sold_product',
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'og_image_url' => 'nullable|string|max:500',
            'noindex' => 'nullable|boolean',
            'nofollow' => 'nullable|boolean',
            'show_in_nav' => 'nullable|boolean',
            'nav_order' => 'nullable|integer',
            'show_in_footer' => 'nullable|boolean',
            'footer_order' => 'nullable|integer',
            'template' => 'nullable|string|max:50',
            'full_width' => 'nullable|boolean',
            'show_header' => 'nullable|boolean',
            'show_footer' => 'nullable|boolean',
        ]);

        $validated['tenant_id'] = $tenant->id;
        
        // Generate unique slug if not provided or if it conflicts
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }
        
        // Check for slug uniqueness
        $baseSlug = $validated['slug'];
        $counter = 1;
        while (Page::where('tenant_id', $tenant->id)->where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $baseSlug . '-' . $counter;
            $counter++;
        }

        $page = Page::create($validated);

        return response()->json([
            'data' => $page,
            'message' => 'Page created successfully',
        ], 201);
    }

    /**
     * Get a single page
     */
    public function show(Request $request, Page $page)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $page->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $page->load('blocks');

        return response()->json([
            'data' => $page,
        ]);
    }

    /**
     * Update a page
     */
    public function update(Request $request, Page $page)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $page->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:draft,published,archived',
            'is_homepage' => 'sometimes|boolean',
            'page_type' => 'sometimes|in:custom,home,inventory,product_detail,contact,about,services,financing,sold_product',
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'og_image_url' => 'nullable|string|max:500',
            'noindex' => 'sometimes|boolean',
            'nofollow' => 'sometimes|boolean',
            'show_in_nav' => 'sometimes|boolean',
            'nav_order' => 'sometimes|integer',
            'show_in_footer' => 'sometimes|boolean',
            'footer_order' => 'sometimes|integer',
            'template' => 'sometimes|string|max:50',
            'full_width' => 'sometimes|boolean',
            'show_header' => 'sometimes|boolean',
            'show_footer' => 'sometimes|boolean',
        ]);

        // Check slug uniqueness if slug is being changed
        if (isset($validated['slug']) && $validated['slug'] !== $page->slug) {
            $existingPage = Page::where('tenant_id', $tenant->id)
                ->where('slug', $validated['slug'])
                ->where('id', '!=', $page->id)
                ->first();
            
            if ($existingPage) {
                return response()->json(['error' => 'Slug already in use'], 422);
            }
        }

        $page->update($validated);

        return response()->json([
            'data' => $page,
            'message' => 'Page updated successfully',
        ]);
    }

    /**
     * Delete a page
     */
    public function destroy(Request $request, Page $page)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $page->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $page->delete();

        return response()->json(null, 204);
    }

    /**
     * Duplicate a page
     */
    public function duplicate(Request $request, Page $page)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $page->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $newPage = $page->duplicate();

        return response()->json([
            'data' => $newPage,
            'message' => 'Page duplicated successfully',
        ], 201);
    }

    /**
     * Update page blocks (save entire block structure)
     */
    public function updateBlocks(Request $request, Page $page)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $page->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'blocks' => 'required|array',
            'blocks.*.id' => 'nullable|string',
            'blocks.*.block_type' => 'required|string',
            'blocks.*.order' => 'required|integer',
            'blocks.*.content' => 'nullable|array',
            'blocks.*.settings' => 'nullable|array',
            'blocks.*.is_visible' => 'nullable|boolean',
            'blocks.*.mobile_visible' => 'nullable|boolean',
            'blocks.*.desktop_visible' => 'nullable|boolean',
        ]);

        // Delete existing blocks
        $page->blocks()->delete();

        // Create new blocks
        foreach ($validated['blocks'] as $blockData) {
            PageBlock::create([
                'page_id' => $page->id,
                'block_type' => $blockData['block_type'],
                'order' => $blockData['order'],
                'content' => $blockData['content'] ?? PageBlock::getDefaultContent($blockData['block_type']),
                'settings' => $blockData['settings'] ?? PageBlock::getDefaultSettings($blockData['block_type']),
                'is_visible' => $blockData['is_visible'] ?? true,
                'mobile_visible' => $blockData['mobile_visible'] ?? true,
                'desktop_visible' => $blockData['desktop_visible'] ?? true,
            ]);
        }

        $page->load('blocks');

        return response()->json([
            'data' => $page,
            'message' => 'Page blocks updated successfully',
        ]);
    }

    /**
     * Get available block types with their default configurations
     */
    public function getBlockTypes()
    {
        $blockTypes = [
            'content' => [
                ['type' => 'hero', 'label' => 'Hero Banner', 'icon' => '🖼️', 'description' => 'Large banner with background image and text'],
                ['type' => 'text', 'label' => 'Text Block', 'icon' => '📝', 'description' => 'Rich text content'],
                ['type' => 'image', 'label' => 'Image', 'icon' => '🖼️', 'description' => 'Single image'],
                ['type' => 'image_gallery', 'label' => 'Image Gallery', 'icon' => '🖼️', 'description' => 'Multiple images in grid or carousel'],
                ['type' => 'video', 'label' => 'Video', 'icon' => '🎬', 'description' => 'YouTube, Vimeo or video file'],
                ['type' => 'button', 'label' => 'Button', 'icon' => '🔘', 'description' => 'Call to action button'],
                ['type' => 'spacer', 'label' => 'Spacer', 'icon' => '↕️', 'description' => 'Vertical space'],
                ['type' => 'divider', 'label' => 'Divider', 'icon' => '➖', 'description' => 'Horizontal line'],
            ],
            'inventory' => [
                ['type' => 'featured_inventory', 'label' => 'Featured Inventory', 'icon' => '⭐', 'description' => 'Showcase featured products'],
                ['type' => 'inventory_grid', 'label' => 'Inventory Grid', 'icon' => '🔲', 'description' => 'Product grid with filters'],
                ['type' => 'inventory_carousel', 'label' => 'Inventory Carousel', 'icon' => '🎠', 'description' => 'Scrolling product slider'],
                ['type' => 'category_cards', 'label' => 'Category Cards', 'icon' => '🗂️', 'description' => 'Browse by category navigation'],
                ['type' => 'brand_logos', 'label' => 'Brand Logos', 'icon' => '🏷️', 'description' => 'Partner/manufacturer logos'],
            ],
            'business' => [
                ['type' => 'contact_form', 'label' => 'Contact Form', 'icon' => '📧', 'description' => 'Contact form submission'],
                ['type' => 'map', 'label' => 'Map', 'icon' => '🗺️', 'description' => 'Google Maps embed'],
                ['type' => 'business_hours', 'label' => 'Business Hours', 'icon' => '🕐', 'description' => 'Hours of operation'],
                ['type' => 'testimonials', 'label' => 'Testimonials', 'icon' => '💬', 'description' => 'Customer reviews'],
                ['type' => 'team_members', 'label' => 'Team Members', 'icon' => '👥', 'description' => 'Staff profiles'],
                ['type' => 'faq', 'label' => 'FAQ', 'icon' => '❓', 'description' => 'Frequently asked questions'],
            ],
            'marketing' => [
                ['type' => 'cta_banner', 'label' => 'CTA Banner', 'icon' => '📢', 'description' => 'Call to action section'],
                ['type' => 'newsletter', 'label' => 'Newsletter', 'icon' => '📰', 'description' => 'Email signup form'],
                ['type' => 'promo_banner', 'label' => 'Promo Banner', 'icon' => '🎉', 'description' => 'Promotional announcement'],
            ],
            'advanced' => [
                ['type' => 'html', 'label' => 'HTML', 'icon' => '🔧', 'description' => 'Custom HTML code'],
                ['type' => 'embed', 'label' => 'Embed', 'icon' => '📦', 'description' => 'External content embed'],
                ['type' => 'columns', 'label' => 'Columns', 'icon' => '📊', 'description' => 'Multi-column layout'],
                ['type' => 'container', 'label' => 'Container', 'icon' => '📦', 'description' => 'Content container'],
            ],
        ];

        return response()->json([
            'data' => $blockTypes,
        ]);
    }

    /**
     * Get page by slug (for public rendering)
     */
    public function getBySlug(Request $request, string $slug)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $page = Page::where('tenant_id', $tenant->id)
            ->where('slug', $slug)
            ->published()
            ->with('blocks')
            ->first();

        if (!$page) {
            return response()->json(['error' => 'Page not found'], 404);
        }

        return response()->json([
            'data' => $page,
        ]);
    }

    /**
     * Get homepage (for public rendering)
     */
    public function getHomepage(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $page = Page::where('tenant_id', $tenant->id)
            ->where('is_homepage', true)
            ->published()
            ->with('blocks')
            ->first();

        if (!$page) {
            // Return default homepage structure
            return response()->json([
                'data' => null,
                'message' => 'No homepage configured',
            ]);
        }

        return response()->json([
            'data' => $page,
        ]);
    }
}
