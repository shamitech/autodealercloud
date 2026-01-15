<?php

namespace App\Http\Controllers\Api;

use App\Models\ProductDisplaySettings;
use App\Models\SoldProductSettings;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProductSettingsController extends Controller
{
    /**
     * Get product display settings
     */
    public function getDisplaySettings(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $settings = ProductDisplaySettings::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'enabled_filters' => ProductDisplaySettings::getDefaultFilters(),
                'filter_order' => array_keys(ProductDisplaySettings::getDefaultFilters()),
            ]
        );

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update product display settings
     */
    public function updateDisplaySettings(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            // Listing settings
            'default_view' => 'sometimes|in:grid,list',
            'products_per_page' => 'sometimes|integer|min:4|max:48',
            'default_sort' => 'sometimes|in:newest,oldest,price_low,price_high,name_asc,name_desc,featured',
            // Grid settings
            'grid_columns_desktop' => 'sometimes|integer|min:2|max:6',
            'grid_columns_tablet' => 'sometimes|integer|min:1|max:4',
            'grid_columns_mobile' => 'sometimes|integer|min:1|max:2',
            // Display flags
            'show_price' => 'sometimes|boolean',
            'show_msrp' => 'sometimes|boolean',
            'show_savings' => 'sometimes|boolean',
            'show_stock_status' => 'sometimes|boolean',
            'show_year' => 'sometimes|boolean',
            'show_make' => 'sometimes|boolean',
            'show_model' => 'sometimes|boolean',
            'show_condition' => 'sometimes|boolean',
            'show_mileage' => 'sometimes|boolean',
            'show_vin' => 'sometimes|boolean',
            'show_stock_number' => 'sometimes|boolean',
            // Detail page
            'gallery_style' => 'sometimes|in:slider,grid,thumbnails',
            'show_image_zoom' => 'sometimes|boolean',
            'show_similar_products' => 'sometimes|boolean',
            'similar_products_count' => 'sometimes|integer|min:2|max:12',
            'show_share_buttons' => 'sometimes|boolean',
            'show_print_button' => 'sometimes|boolean',
            // Pricing
            'price_prefix' => 'sometimes|string|max:10',
            'price_suffix' => 'nullable|string|max:50',
            'call_for_price_text' => 'sometimes|string|max:100',
            'show_monthly_payment' => 'sometimes|boolean',
            'default_interest_rate' => 'sometimes|numeric|min:0|max:30',
            'default_loan_term' => 'sometimes|integer|min:12|max:84',
            // CTA
            'primary_cta_text' => 'sometimes|string|max:50',
            'secondary_cta_text' => 'sometimes|string|max:50',
            'show_call_button' => 'sometimes|boolean',
            'show_text_button' => 'sometimes|boolean',
            // Filters
            'enabled_filters' => 'sometimes|array',
            'filter_order' => 'sometimes|array',
            // SEO
            'product_title_format' => 'sometimes|string|max:255',
            'product_meta_description_format' => 'nullable|string|max:500',
            'product_url_format' => 'sometimes|string|max:100',
        ]);

        $settings = ProductDisplaySettings::updateOrCreate(
            ['tenant_id' => $tenant->id],
            $validated
        );

        return response()->json([
            'data' => $settings,
            'message' => 'Product display settings updated successfully',
        ]);
    }

    /**
     * Get sold product settings
     */
    public function getSoldSettings(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $settings = SoldProductSettings::firstOrCreate(
            ['tenant_id' => $tenant->id],
            []
        );

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update sold product settings
     */
    public function updateSoldSettings(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            // Behavior
            'sold_behavior' => 'sometimes|in:sold_page,redirect_category,redirect_homepage,redirect_inventory,archive',
            // Sold page
            'sold_page_title' => 'sometimes|string|max:100',
            'sold_page_message' => 'sometimes|string|max:500',
            'show_sold_badge' => 'sometimes|boolean',
            'sold_badge_text' => 'sometimes|string|max:20',
            'sold_badge_color' => 'sometimes|string|max:7',
            // Similar products
            'show_similar_on_sold' => 'sometimes|boolean',
            'similar_count_on_sold' => 'sometimes|integer|min:2|max:12',
            'similar_matching' => 'sometimes|in:same_category,same_make,price_range,featured',
            // SEO
            'keep_sold_indexed' => 'sometimes|boolean',
            'add_sold_schema' => 'sometimes|boolean',
            'days_before_noindex' => 'sometimes|integer|min:0|max:365',
            'add_canonical_to_category' => 'sometimes|boolean',
            // Redirect
            'redirect_page_id' => 'nullable|uuid|exists:pages,id',
            'redirect_url' => 'nullable|url|max:500',
            // Notifications
            'notify_on_sold_visit' => 'sometimes|boolean',
            'notification_email' => 'nullable|email|max:255',
            // Archive
            'auto_delete_after_days' => 'sometimes|integer|min:0|max:1095',
            'show_in_sold_gallery' => 'sometimes|boolean',
        ]);

        $settings = SoldProductSettings::updateOrCreate(
            ['tenant_id' => $tenant->id],
            $validated
        );

        return response()->json([
            'data' => $settings,
            'message' => 'Sold product settings updated successfully',
        ]);
    }

    /**
     * Get default filter configuration
     */
    public function getDefaultFilters()
    {
        return response()->json([
            'data' => ProductDisplaySettings::getDefaultFilters(),
        ]);
    }

    /**
     * Preview sold product behavior
     */
    public function previewSoldBehavior(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $settings = SoldProductSettings::where('tenant_id', $tenant->id)->first();
        
        if (!$settings) {
            $settings = new SoldProductSettings();
        }

        // Mock product for preview
        $mockProduct = [
            'id' => 'preview',
            'title' => '2024 Honda CR-V',
            'year' => 2024,
            'make' => 'Honda',
            'model' => 'CR-V',
            'category' => 'SUV',
            'price' => 35000,
            'description' => 'A well-maintained SUV perfect for families.',
        ];

        $result = $settings->handleSoldProduct($mockProduct);

        return response()->json([
            'data' => $result,
            'settings' => $settings,
        ]);
    }
}
