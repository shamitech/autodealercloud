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
        Schema::create('site_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->unique();
            
            // Business Information
            $table->string('business_name')->nullable();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_secondary')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->string('country')->default('US');
            
            // Branding
            $table->string('logo_url')->nullable();
            $table->string('logo_alt_text')->nullable();
            $table->string('favicon_url')->nullable();
            
            // Colors
            $table->string('primary_color')->default('#2563eb');
            $table->string('secondary_color')->default('#1e40af');
            $table->string('accent_color')->default('#f59e0b');
            $table->string('text_color')->default('#1f2937');
            $table->string('background_color')->default('#ffffff');
            $table->string('header_bg_color')->default('#ffffff');
            $table->string('header_text_color')->default('#1f2937');
            $table->string('footer_bg_color')->default('#111827');
            $table->string('footer_text_color')->default('#ffffff');
            
            // Typography
            $table->string('heading_font')->default('Inter');
            $table->string('body_font')->default('Inter');
            $table->string('heading_font_weight')->default('700');
            $table->string('body_font_weight')->default('400');
            $table->string('base_font_size')->default('16px');
            
            // Social Media
            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->string('ebay_url')->nullable();
            
            // Business Hours (JSON)
            $table->json('business_hours')->nullable();
            
            // SEO Defaults
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('og_image_url')->nullable();
            
            // Analytics
            $table->string('google_analytics_id')->nullable();
            $table->string('google_tag_manager_id')->nullable();
            $table->string('facebook_pixel_id')->nullable();
            
            // Custom Code Injection
            $table->text('custom_head_code')->nullable();
            $table->text('custom_body_start_code')->nullable();
            $table->text('custom_body_end_code')->nullable();
            
            $table->timestamps();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
