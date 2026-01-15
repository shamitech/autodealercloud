<?php

namespace App\Http\Controllers\Api;

use App\Models\NavigationItem;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NavigationController extends Controller
{
    /**
     * Get all navigation items for current tenant
     */
    public function index(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $location = $request->query('location'); // header, footer, or null for all

        $query = NavigationItem::where('tenant_id', $tenant->id)
            ->with(['page', 'children.page'])
            ->whereNull('parent_id')
            ->orderBy('order');

        if ($location) {
            $query->where('location', $location);
        }

        $items = $query->get();

        return response()->json([
            'data' => $items,
        ]);
    }

    /**
     * Create a new navigation item
     */
    public function store(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'parent_id' => 'nullable|uuid|exists:navigation_items,id',
            'location' => 'required|in:header,footer,mobile',
            'label' => 'required|string|max:100',
            'link_type' => 'required|in:page,url,inventory,anchor,dropdown',
            'page_id' => 'nullable|uuid|exists:pages,id',
            'url' => 'nullable|string|max:500',
            'inventory_filters' => 'nullable|array',
            'order' => 'nullable|integer',
            'is_visible' => 'nullable|boolean',
            'open_in_new_tab' => 'nullable|boolean',
            'icon' => 'nullable|string|max:100',
            'css_classes' => 'nullable|string|max:255',
            'is_highlighted' => 'nullable|boolean',
            'highlight_color' => 'nullable|string|max:7',
        ]);

        $validated['tenant_id'] = $tenant->id;

        // Auto-set order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = NavigationItem::where('tenant_id', $tenant->id)
                ->where('location', $validated['location'])
                ->whereNull('parent_id')
                ->max('order');
            $validated['order'] = ($maxOrder ?? 0) + 1;
        }

        $item = NavigationItem::create($validated);
        $item->load(['page', 'children']);

        return response()->json([
            'data' => $item,
            'message' => 'Navigation item created successfully',
        ], 201);
    }

    /**
     * Update a navigation item
     */
    public function update(Request $request, NavigationItem $navigationItem)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $navigationItem->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'parent_id' => 'nullable|uuid|exists:navigation_items,id',
            'location' => 'sometimes|in:header,footer,mobile',
            'label' => 'sometimes|string|max:100',
            'link_type' => 'sometimes|in:page,url,inventory,anchor,dropdown',
            'page_id' => 'nullable|uuid|exists:pages,id',
            'url' => 'nullable|string|max:500',
            'inventory_filters' => 'nullable|array',
            'order' => 'sometimes|integer',
            'is_visible' => 'sometimes|boolean',
            'open_in_new_tab' => 'sometimes|boolean',
            'icon' => 'nullable|string|max:100',
            'css_classes' => 'nullable|string|max:255',
            'is_highlighted' => 'sometimes|boolean',
            'highlight_color' => 'nullable|string|max:7',
        ]);

        $navigationItem->update($validated);
        $navigationItem->load(['page', 'children']);

        return response()->json([
            'data' => $navigationItem,
            'message' => 'Navigation item updated successfully',
        ]);
    }

    /**
     * Delete a navigation item
     */
    public function destroy(Request $request, NavigationItem $navigationItem)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $navigationItem->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete children first
        $navigationItem->children()->delete();
        $navigationItem->delete();

        return response()->json(null, 204);
    }

    /**
     * Reorder navigation items
     */
    public function reorder(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|uuid|exists:navigation_items,id',
            'items.*.order' => 'required|integer',
            'items.*.parent_id' => 'nullable|uuid|exists:navigation_items,id',
        ]);

        foreach ($validated['items'] as $itemData) {
            NavigationItem::where('id', $itemData['id'])
                ->where('tenant_id', $tenant->id)
                ->update([
                    'order' => $itemData['order'],
                    'parent_id' => $itemData['parent_id'] ?? null,
                ]);
        }

        return response()->json([
            'message' => 'Navigation reordered successfully',
        ]);
    }

    /**
     * Get navigation tree for public rendering
     */
    public function getPublicNavigation(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $headerNav = NavigationItem::getTree($tenant->id, 'header');
        $footerNav = NavigationItem::getTree($tenant->id, 'footer');

        return response()->json([
            'data' => [
                'header' => $headerNav,
                'footer' => $footerNav,
            ],
        ]);
    }

    /**
     * Bulk save navigation items (replace all)
     */
    public function bulkSave(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'location' => 'required|in:header,footer,mobile',
            'items' => 'required|array',
            'items.*.id' => 'nullable|uuid',
            'items.*.label' => 'required|string|max:100',
            'items.*.link_type' => 'required|in:page,url,inventory,anchor,dropdown',
            'items.*.page_id' => 'nullable|uuid|exists:pages,id',
            'items.*.url' => 'nullable|string|max:500',
            'items.*.inventory_filters' => 'nullable|array',
            'items.*.order' => 'required|integer',
            'items.*.is_visible' => 'nullable|boolean',
            'items.*.open_in_new_tab' => 'nullable|boolean',
            'items.*.is_highlighted' => 'nullable|boolean',
            'items.*.highlight_color' => 'nullable|string|max:7',
            'items.*.children' => 'nullable|array',
        ]);

        // Delete existing items for this location
        NavigationItem::where('tenant_id', $tenant->id)
            ->where('location', $validated['location'])
            ->delete();

        // Create new items
        foreach ($validated['items'] as $itemData) {
            $item = NavigationItem::create([
                'tenant_id' => $tenant->id,
                'location' => $validated['location'],
                'label' => $itemData['label'],
                'link_type' => $itemData['link_type'],
                'page_id' => $itemData['page_id'] ?? null,
                'url' => $itemData['url'] ?? null,
                'inventory_filters' => $itemData['inventory_filters'] ?? null,
                'order' => $itemData['order'],
                'is_visible' => $itemData['is_visible'] ?? true,
                'open_in_new_tab' => $itemData['open_in_new_tab'] ?? false,
                'is_highlighted' => $itemData['is_highlighted'] ?? false,
                'highlight_color' => $itemData['highlight_color'] ?? null,
            ]);

            // Create children if any
            if (!empty($itemData['children'])) {
                foreach ($itemData['children'] as $childOrder => $childData) {
                    NavigationItem::create([
                        'tenant_id' => $tenant->id,
                        'parent_id' => $item->id,
                        'location' => $validated['location'],
                        'label' => $childData['label'],
                        'link_type' => $childData['link_type'],
                        'page_id' => $childData['page_id'] ?? null,
                        'url' => $childData['url'] ?? null,
                        'inventory_filters' => $childData['inventory_filters'] ?? null,
                        'order' => $childOrder,
                        'is_visible' => $childData['is_visible'] ?? true,
                        'open_in_new_tab' => $childData['open_in_new_tab'] ?? false,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Navigation saved successfully',
        ]);
    }
}
