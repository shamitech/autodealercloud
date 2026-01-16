<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SectionController extends Controller
{
    /**
     * Get all sections for the tenant
     */
    public function index()
    {
        $tenant = auth()->user()->tenant;
        if (!$tenant) {
            return response()->json(['error' => 'Tenant not found'], 403);
        }

        $sections = Section::where('tenant_id', $tenant->id)
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $sections]);
    }

    /**
     * Create or update sections
     */
    public function save(Request $request)
    {
        $tenant = auth()->user()->tenant;
        if (!$tenant) {
            return response()->json(['error' => 'Tenant not found'], 403);
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
                    $section = Section::where('tenant_id', $tenant->id)
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
                        'tenant_id' => $tenant->id,
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
        $tenant = auth()->user()->tenant;
        if (!$tenant) {
            return response()->json(['error' => 'Tenant not found'], 403);
        }

        $section = Section::where('tenant_id', $tenant->id)->find($id);
        if (!$section) {
            return response()->json(['error' => 'Section not found'], 404);
        }

        $section->delete();
        return response()->json(['message' => 'Section deleted']);
    }
}
