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
        Schema::create('product_display_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->unique();
            
            // Inventory listing settings
            $table->enum('default_view', ['grid', 'list'])->default('grid');
            $table->integer('products_per_page')->default(12);
            $table->enum('default_sort', [
                'newest',
                'oldest',
                'price_low',
                'price_high',
                'name_asc',
                'name_desc',
                'featured',
            ])->default('newest');
            
            // Grid settings
            $table->integer('grid_columns_desktop')->default(3);
            $table->integer('grid_columns_tablet')->default(2);
            $table->integer('grid_columns_mobile')->default(1);
            
            // Product card display
            $table->boolean('show_price')->default(true);
            $table->boolean('show_msrp')->default(false);
            $table->boolean('show_savings')->default(false);
            $table->boolean('show_stock_status')->default(true);
            $table->boolean('show_year')->default(true);
            $table->boolean('show_make')->default(true);
            $table->boolean('show_model')->default(true);
            $table->boolean('show_condition')->default(true);
            $table->boolean('show_mileage')->default(true);
            $table->boolean('show_vin')->default(false);
            $table->boolean('show_stock_number')->default(false);
            
            // Product detail page
            $table->enum('gallery_style', ['slider', 'grid', 'thumbnails'])->default('slider');
            $table->boolean('show_image_zoom')->default(true);
            $table->boolean('show_similar_products')->default(true);
            $table->integer('similar_products_count')->default(4);
            $table->boolean('show_share_buttons')->default(true);
            $table->boolean('show_print_button')->default(true);
            
            // Pricing display
            $table->string('price_prefix')->default('$');
            $table->string('price_suffix')->nullable();
            $table->string('call_for_price_text')->default('Call for Price');
            $table->boolean('show_monthly_payment')->default(false);
            $table->decimal('default_interest_rate', 5, 2)->default(7.99);
            $table->integer('default_loan_term')->default(60);
            
            // CTA buttons
            $table->string('primary_cta_text')->default('Get Quote');
            $table->string('secondary_cta_text')->default('Schedule Test Drive');
            $table->boolean('show_call_button')->default(true);
            $table->boolean('show_text_button')->default(false);
            
            // Filters
            $table->json('enabled_filters')->nullable(); // Which filters to show
            $table->json('filter_order')->nullable();    // Order of filters
            
            // SEO for product pages
            $table->string('product_title_format')->default('{year} {make} {model}');
            $table->text('product_meta_description_format')->nullable();
            $table->string('product_url_format')->default('{slug}');
            
            $table->timestamps();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_display_settings');
    }
};
