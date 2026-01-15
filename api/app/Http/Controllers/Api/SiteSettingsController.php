<?php

namespace App\Http\Controllers\Api;

use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class SiteSettingsController extends Controller
{
    /**
     * Get site settings for current tenant
     */
    public function show(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $settings = SiteSettings::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'business_name' => $tenant->name,
                'business_hours' => SiteSettings::getDefaultBusinessHours(),
            ]
        );

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update site settings
     */
    public function update(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            // Business Information
            'business_name' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'phone_secondary' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:2',
            // Branding
            'logo_url' => 'nullable|string|max:500',
            'logo_alt_text' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:500',
            // Colors
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'accent_color' => 'nullable|string|max:7',
            'text_color' => 'nullable|string|max:7',
            'background_color' => 'nullable|string|max:7',
            'header_bg_color' => 'nullable|string|max:7',
            'header_text_color' => 'nullable|string|max:7',
            'footer_bg_color' => 'nullable|string|max:7',
            'footer_text_color' => 'nullable|string|max:7',
            // Typography
            'heading_font' => 'nullable|string|max:100',
            'body_font' => 'nullable|string|max:100',
            'heading_font_weight' => 'nullable|string|max:10',
            'body_font_weight' => 'nullable|string|max:10',
            'base_font_size' => 'nullable|string|max:10',
            // Social Media
            'facebook_url' => 'nullable|url|max:500',
            'instagram_url' => 'nullable|url|max:500',
            'youtube_url' => 'nullable|url|max:500',
            'twitter_url' => 'nullable|url|max:500',
            'linkedin_url' => 'nullable|url|max:500',
            'tiktok_url' => 'nullable|url|max:500',
            'ebay_url' => 'nullable|url|max:500',
            // Business Hours
            'business_hours' => 'nullable|array',
            // SEO
            'meta_title' => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'og_image_url' => 'nullable|string|max:500',
            // Analytics
            'google_analytics_id' => 'nullable|string|max:50',
            'google_tag_manager_id' => 'nullable|string|max:50',
            'facebook_pixel_id' => 'nullable|string|max:50',
            // Custom Code
            'custom_head_code' => 'nullable|string',
            'custom_body_start_code' => 'nullable|string',
            'custom_body_end_code' => 'nullable|string',
        ]);

        $settings = SiteSettings::updateOrCreate(
            ['tenant_id' => $tenant->id],
            $validated
        );

        return response()->json([
            'data' => $settings,
            'message' => 'Site settings updated successfully',
        ]);
    }

    /**
     * Upload logo
     */
    public function uploadLogo(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,gif,svg,webp|max:5120',
        ]);

        $path = $request->file('logo')->store("tenants/{$tenant->id}/branding", 'public');
        $url = Storage::disk('public')->url($path);

        $settings = SiteSettings::firstOrCreate(['tenant_id' => $tenant->id]);
        $settings->update(['logo_url' => $url]);

        return response()->json([
            'data' => ['logo_url' => $url],
            'message' => 'Logo uploaded successfully',
        ]);
    }

    /**
     * Upload favicon
     */
    public function uploadFavicon(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $request->validate([
            'favicon' => 'required|image|mimes:ico,png,svg|max:1024',
        ]);

        $path = $request->file('favicon')->store("tenants/{$tenant->id}/branding", 'public');
        $url = Storage::disk('public')->url($path);

        $settings = SiteSettings::firstOrCreate(['tenant_id' => $tenant->id]);
        $settings->update(['favicon_url' => $url]);

        return response()->json([
            'data' => ['favicon_url' => $url],
            'message' => 'Favicon uploaded successfully',
        ]);
    }

    /**
     * Get CSS variables for the storefront
     */
    public function getCssVariables(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $settings = SiteSettings::where('tenant_id', $tenant->id)->first();
        
        if (!$settings) {
            $settings = new SiteSettings();
        }

        return response($settings->getCssVariables(), 200)
            ->header('Content-Type', 'text/css');
    }

    /**
     * Get available Google Fonts
     */
    public function getFonts()
    {
        $fonts = [
            'Inter' => 'Inter',
            'Roboto' => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Lato' => 'Lato',
            'Montserrat' => 'Montserrat',
            'Poppins' => 'Poppins',
            'Source Sans Pro' => 'Source Sans Pro',
            'Raleway' => 'Raleway',
            'Nunito' => 'Nunito',
            'Playfair Display' => 'Playfair Display',
            'Oswald' => 'Oswald',
            'Merriweather' => 'Merriweather',
            'PT Sans' => 'PT Sans',
            'Ubuntu' => 'Ubuntu',
            'Rubik' => 'Rubik',
            'Work Sans' => 'Work Sans',
            'Quicksand' => 'Quicksand',
            'Barlow' => 'Barlow',
            'DM Sans' => 'DM Sans',
            'Outfit' => 'Outfit',
        ];

        return response()->json([
            'data' => $fonts,
        ]);
    }
}
