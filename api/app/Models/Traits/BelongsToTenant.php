<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    /**
     * Boot the trait
     */
    public static function bootBelongsToTenant()
    {
        /**
         * Add a where clause to always filter by the current tenant
         */
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = config('app.tenant_id');
            
            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });
    }

    /**
     * Get the tenant relationship
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
