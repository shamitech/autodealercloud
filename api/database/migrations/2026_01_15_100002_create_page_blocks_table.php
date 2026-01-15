<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('page_blocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('page_id');
            
            // Block type
            $table->enum('block_type', [
                // Content blocks
                'hero',              // Hero banner with image/video
                'text',              // Rich text content
                'image',             // Single image
                'image_gallery',     // Image gallery/carousel
                'video',             // Video embed
                'button',            // CTA button
                'spacer',            // Vertical space
                'divider',           // Horizontal line
                
                // Layout blocks
                'columns',           // Multi-column layout
                'container',         // Container wrapper
                
                // Feature blocks
                'featured_inventory', // Featured products from Lightspeed
                'inventory_grid',     // Product grid
                'inventory_carousel', // Product carousel
                'category_cards',     // Category navigation cards
                'brand_logos',        // Partner/brand logos
                
                // Business blocks
                'contact_form',      // Contact form
                'map',               // Google Maps embed
                'business_hours',    // Hours table
                'testimonials',      // Customer reviews
                'team_members',      // Staff profiles
                'faq',               // FAQ accordion
                
                // Marketing blocks
                'cta_banner',        // Call to action banner
                'newsletter',        // Newsletter signup
                'promo_banner',      // Promotional banner
                
                // Custom
                'html',              // Raw HTML block
                'embed',             // External embed (iframe)
            ]);
            
            // Block position
            $table->integer('order')->default(0);
            
            // Block content (JSON - varies by block type)
            $table->json('content')->nullable();
            
            // Block settings (JSON)
            $table->json('settings')->nullable();
            
            // Visibility
            $table->boolean('is_visible')->default(true);
            $table->boolean('mobile_visible')->default(true);
            $table->boolean('desktop_visible')->default(true);
            
            $table->timestamps();
            
            $table->foreign('page_id')->references('id')->on('pages')->onDelete('cascade');
            $table->index(['page_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_blocks');
    }
};
