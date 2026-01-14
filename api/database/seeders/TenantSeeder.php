<?php

namespace Database\Seeders;

use App\Models\Domain;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create test tenants
        $tenants = [
            [
                'slug' => 'dealer1',
                'name' => 'Dealer One',
                'domain' => 'dealer1.autodealercloud.com',
                'status' => 'active',
            ],
            [
                'slug' => 'dealer2',
                'name' => 'Dealer Two',
                'domain' => 'dealer2.autodealercloud.com',
                'status' => 'active',
            ],
            [
                'slug' => 'dealer3',
                'name' => 'Dealer Three',
                'domain' => 'dealer3.autodealercloud.com',
                'status' => 'active',
            ],
        ];

        foreach ($tenants as $tenantData) {
            $tenant = Tenant::create($tenantData);

            // Create a custom domain for the second tenant
            if ($tenant->slug === 'dealer2') {
                Domain::create([
                    'tenant_id' => $tenant->id,
                    'domain' => 'customdealership.com',
                    'verified_at' => now(),
                ]);
            }
        }
    }
}
