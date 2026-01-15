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
        Schema::create('navigation_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('parent_id')->nullable(); // For dropdown menus
            
            // Navigation location
            $table->enum('location', ['header', 'footer', 'mobile'])->default('header');
            
            // Item details
            $table->string('label');
            $table->enum('link_type', [
                'page',      // Internal page link
                'url',       // External URL
                'inventory', // Inventory with filters
                'anchor',    // Anchor link on same page
                'dropdown',  // Parent for dropdown (no link)
            ])->default('page');
            
            // Link target
            $table->uuid('page_id')->nullable(); // For page links
            $table->string('url')->nullable();   // For external URLs or anchors
            $table->json('inventory_filters')->nullable(); // For inventory links
            
            // Display options
            $table->integer('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->boolean('open_in_new_tab')->default(false);
            $table->string('icon')->nullable(); // Icon name or URL
            $table->string('css_classes')->nullable();
            
            // Highlight/emphasis
            $table->boolean('is_highlighted')->default(false);
            $table->string('highlight_color')->nullable();
            
            $table->timestamps();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('navigation_items')->onDelete('cascade');
            $table->foreign('page_id')->references('id')->on('pages')->onDelete('set null');
            
            $table->index(['tenant_id', 'location', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('navigation_items');
    }
};
