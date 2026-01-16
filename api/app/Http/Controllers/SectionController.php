<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    /**
     * Get the tenant ID from config (set by middleware)
     */
    protected function getTenantId()
    {
        return config('app.tenant_id');
    }

    /**
     * Get all sections for the tenant
     */
    public function index()
    {
        $tenantId = $this->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant not identified'], 403);
        }

        $sections = Section::where('tenant_id', $tenantId)
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $sections]);
    }

    /**
     * Create or update sections
     */
    public function save(Request $request)
    {
        $tenantId = $this->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant not identified'], 403);
        }

        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'nullable',
            'sections.*.name' => 'required|string',
            'sections.*.components' => 'nullable|array',
            'sections.*.order' => 'nullable|integer',
        ]);

        try {
            foreach ($validated['sections'] as $index => $sectionData) {
                // If section has an ID and it's numeric, it's an existing section
                if (isset($sectionData['id']) && is_numeric($sectionData['id'])) {
                    $section = Section::where('tenant_id', $tenantId)
                        ->find($sectionData['id']);
                    
                    if ($section) {
                        $section->update([
                            'name' => $sectionData['name'],
                            'components' => $sectionData['components'] ?? [],
                            'order' => $sectionData['order'] ?? $index,
                        ]);
                    }
                } else {
                    // Create new section
                    Section::create([
                        'tenant_id' => $tenantId,
                        'name' => $sectionData['name'],
                        'components' => $sectionData['components'] ?? [],
                        'order' => $sectionData['order'] ?? $index,
                    ]);
                }
            }

            return response()->json(['message' => 'Sections saved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Delete a section
     */
    public function destroy($id)
    {
        $tenantId = $this->getTenantId();
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant not identified'], 403);
        }

        $section = Section::where('tenant_id', $tenantId)->find($id);
        if (!$section) {
            return response()->json(['error' => 'Section not found'], 404);
        }

        $section->delete();
        return response()->json(['message' => 'Section deleted']);
    }
}
