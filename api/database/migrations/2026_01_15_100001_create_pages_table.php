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
        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            // Page basics
            $table->string('title');
            $table->string('slug')->index();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('is_homepage')->default(false);
            
            // Page type
            $table->enum('page_type', [
                'custom',           // User-created pages
                'home',             // Homepage
                'inventory',        // Inventory listing page
                'product_detail',   // Single product page template
                'contact',          // Contact page
                'about',            // About page
                'services',         // Services page
                'financing',        // Financing page
                'sold_product',     // Template for sold products
            ])->default('custom');
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('og_image_url')->nullable();
            $table->boolean('noindex')->default(false);
            $table->boolean('nofollow')->default(false);
            
            // Page settings
            $table->boolean('show_in_nav')->default(false);
            $table->integer('nav_order')->default(0);
            $table->boolean('show_in_footer')->default(false);
            $table->integer('footer_order')->default(0);
            
            // Template settings
            $table->string('template')->default('default');
            $table->boolean('full_width')->default(false);
            $table->boolean('show_header')->default(true);
            $table->boolean('show_footer')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->unique(['tenant_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
