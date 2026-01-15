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
        Schema::create('sold_product_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->unique();
            
            // What happens when a product is sold
            $table->enum('sold_behavior', [
                'sold_page',       // Show "This vehicle has been sold" page
                'redirect_category', // 301 redirect to category page
                'redirect_homepage', // 301 redirect to homepage
                'redirect_inventory', // 301 redirect to main inventory
                'archive',         // Keep page but mark as sold (best for SEO)
            ])->default('archive');
            
            // Sold page settings (for 'sold_page' and 'archive' behaviors)
            $table->string('sold_page_title')->default('Vehicle Sold');
            $table->text('sold_page_message')->default('This vehicle has been sold. Check out our similar inventory below!');
            $table->boolean('show_sold_badge')->default(true);
            $table->string('sold_badge_text')->default('SOLD');
            $table->string('sold_badge_color')->default('#dc2626');
            
            // Similar products on sold page
            $table->boolean('show_similar_on_sold')->default(true);
            $table->integer('similar_count_on_sold')->default(6);
            $table->enum('similar_matching', [
                'same_category',   // Same vehicle category
                'same_make',       // Same manufacturer
                'price_range',     // Similar price range
                'featured',        // Featured inventory
            ])->default('same_category');
            
            // SEO settings for sold products
            $table->boolean('keep_sold_indexed')->default(true); // Keep in search engines
            $table->boolean('add_sold_schema')->default(true);   // Add OutOfStock schema
            $table->integer('days_before_noindex')->default(90); // Noindex after X days
            $table->boolean('add_canonical_to_category')->default(false);
            
            // Redirect settings (for redirect behaviors)
            $table->uuid('redirect_page_id')->nullable(); // Specific page to redirect to
            $table->string('redirect_url')->nullable();   // Or specific URL
            
            // Notification settings
            $table->boolean('notify_on_sold_visit')->default(false);
            $table->string('notification_email')->nullable();
            
            // Archive settings
            $table->integer('auto_delete_after_days')->default(0); // 0 = never delete
            $table->boolean('show_in_sold_gallery')->default(false);
            
            $table->timestamps();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('redirect_page_id')->references('id')->on('pages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sold_product_settings');
    }
};
