<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProductDisplaySettings extends Model
{
    use HasFactory;

    protected $table = 'product_display_settings';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        // Listing settings
        'default_view',
        'products_per_page',
        'default_sort',
        // Grid settings
        'grid_columns_desktop',
        'grid_columns_tablet',
        'grid_columns_mobile',
        // Product card display
        'show_price',
        'show_msrp',
        'show_savings',
        'show_stock_status',
        'show_year',
        'show_make',
        'show_model',
        'show_condition',
        'show_mileage',
        'show_vin',
        'show_stock_number',
        // Product detail page
        'gallery_style',
        'show_image_zoom',
        'show_similar_products',
        'similar_products_count',
        'show_share_buttons',
        'show_print_button',
        // Pricing display
        'price_prefix',
        'price_suffix',
        'call_for_price_text',
        'show_monthly_payment',
        'default_interest_rate',
        'default_loan_term',
        // CTA buttons
        'primary_cta_text',
        'secondary_cta_text',
        'show_call_button',
        'show_text_button',
        // Filters
        'enabled_filters',
        'filter_order',
        // SEO
        'product_title_format',
        'product_meta_description_format',
        'product_url_format',
    ];

    protected $casts = [
        'show_price' => 'boolean',
        'show_msrp' => 'boolean',
        'show_savings' => 'boolean',
        'show_stock_status' => 'boolean',
        'show_year' => 'boolean',
        'show_make' => 'boolean',
        'show_model' => 'boolean',
        'show_condition' => 'boolean',
        'show_mileage' => 'boolean',
        'show_vin' => 'boolean',
        'show_stock_number' => 'boolean',
        'show_image_zoom' => 'boolean',
        'show_similar_products' => 'boolean',
        'show_share_buttons' => 'boolean',
        'show_print_button' => 'boolean',
        'show_monthly_payment' => 'boolean',
        'show_call_button' => 'boolean',
        'show_text_button' => 'boolean',
        'default_interest_rate' => 'decimal:2',
        'enabled_filters' => 'array',
        'filter_order' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    /**
     * Get the tenant that owns the settings
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get default filter list
     */
    public static function getDefaultFilters(): array
    {
        return [
            'category' => ['label' => 'Category', 'enabled' => true],
            'make' => ['label' => 'Make', 'enabled' => true],
            'model' => ['label' => 'Model', 'enabled' => true],
            'year' => ['label' => 'Year', 'enabled' => true],
            'price' => ['label' => 'Price Range', 'enabled' => true],
            'condition' => ['label' => 'Condition', 'enabled' => true],
            'mileage' => ['label' => 'Mileage', 'enabled' => true],
            'color' => ['label' => 'Color', 'enabled' => false],
            'fuel_type' => ['label' => 'Fuel Type', 'enabled' => false],
            'transmission' => ['label' => 'Transmission', 'enabled' => false],
        ];
    }

    /**
     * Format product title using template
     */
    public function formatProductTitle(array $product): string
    {
        $format = $this->product_title_format;
        
        $replacements = [
            '{year}' => $product['year'] ?? '',
            '{make}' => $product['make'] ?? '',
            '{model}' => $product['model'] ?? '',
            '{trim}' => $product['trim'] ?? '',
            '{condition}' => $product['condition'] ?? '',
            '{stock_number}' => $product['stock_number'] ?? '',
        ];

        return trim(str_replace(array_keys($replacements), array_values($replacements), $format));
    }

    /**
     * Calculate monthly payment
     */
    public function calculateMonthlyPayment(float $price, ?float $downPayment = 0): float
    {
        $principal = $price - $downPayment;
        $monthlyRate = ($this->default_interest_rate / 100) / 12;
        $term = $this->default_loan_term;

        if ($monthlyRate === 0) {
            return $principal / $term;
        }

        return $principal * ($monthlyRate * pow(1 + $monthlyRate, $term)) / (pow(1 + $monthlyRate, $term) - 1);
    }
}
