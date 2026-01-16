<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first tenant (or create one for testing)
        $tenant = Tenant::first();
        
        if (!$tenant) {
            return;
        }

        // Create default sections
        $sections = [
            [
                'name' => 'Header Navigation',
                'components' => [
                    [
                        'id' => 'menu-' . uniqid(),
                        'type' => 'menu-items',
                        'data' => [],
                    ],
                ],
                'order' => 0,
            ],
            [
                'name' => 'Footer',
                'components' => [
                    [
                        'id' => 'menu-' . uniqid(),
                        'type' => 'menu-items',
                        'data' => [],
                    ],
                ],
                'order' => 1,
            ],
        ];

        foreach ($sections as $sectionData) {
            Section::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'name' => $sectionData['name'],
                ],
                $sectionData
            );
        }
    }
}
