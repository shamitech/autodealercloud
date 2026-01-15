<?php

namespace App\Http\Controllers\Api;

use App\Models\MediaLibrary;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaLibraryController extends Controller
{
    /**
     * Get all media for current tenant
     */
    public function index(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $query = MediaLibrary::where('tenant_id', $tenant->id);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by folder
        if ($request->has('folder')) {
            $query->where('folder', $request->folder);
        }

        // Search by filename or title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('original_filename', 'like', "%{$search}%");
            });
        }

        $media = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 24);

        return response()->json($media);
    }

    /**
     * Upload new media file(s)
     */
    public function store(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:51200', // 50MB max
            'folder' => 'nullable|string|max:255',
        ]);

        $uploaded = [];
        $folder = $request->folder ?? '/';

        foreach ($request->file('files') as $file) {
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();
            $type = MediaLibrary::getTypeFromMimeType($mimeType);

            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $path = $file->storeAs(
                "tenants/{$tenant->id}/media",
                $filename,
                'public'
            );

            $url = Storage::disk('public')->url($path);

            // Get image dimensions if applicable
            $width = null;
            $height = null;
            if ($type === 'image') {
                $imageInfo = getimagesize($file->getPathname());
                if ($imageInfo) {
                    $width = $imageInfo[0];
                    $height = $imageInfo[1];
                }
            }

            $media = MediaLibrary::create([
                'tenant_id' => $tenant->id,
                'filename' => $filename,
                'original_filename' => $originalName,
                'path' => $path,
                'url' => $url,
                'mime_type' => $mimeType,
                'size' => $size,
                'width' => $width,
                'height' => $height,
                'folder' => $folder,
                'type' => $type,
                'uploaded_by' => auth()->id(),
            ]);

            $uploaded[] = $media;
        }

        return response()->json([
            'data' => $uploaded,
            'message' => count($uploaded) . ' file(s) uploaded successfully',
        ], 201);
    }

    /**
     * Get a single media item
     */
    public function show(Request $request, MediaLibrary $media)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $media->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $media,
        ]);
    }

    /**
     * Update media metadata
     */
    public function update(Request $request, MediaLibrary $media)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $media->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'folder' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
        ]);

        $media->update($validated);

        return response()->json([
            'data' => $media,
            'message' => 'Media updated successfully',
        ]);
    }

    /**
     * Delete media
     */
    public function destroy(Request $request, MediaLibrary $media)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant || $media->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete file from storage
        Storage::disk('public')->delete($media->path);
        
        // Delete record
        $media->delete();

        return response()->json(null, 204);
    }

    /**
     * Bulk delete media
     */
    public function bulkDestroy(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'uuid|exists:media_library,id',
        ]);

        $deleted = 0;
        foreach ($validated['ids'] as $id) {
            $media = MediaLibrary::where('id', $id)
                ->where('tenant_id', $tenant->id)
                ->first();
            
            if ($media) {
                Storage::disk('public')->delete($media->path);
                $media->delete();
                $deleted++;
            }
        }

        return response()->json([
            'message' => "{$deleted} file(s) deleted successfully",
        ]);
    }

    /**
     * Get folders for current tenant
     */
    public function getFolders(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $folders = MediaLibrary::where('tenant_id', $tenant->id)
            ->distinct()
            ->pluck('folder')
            ->sort()
            ->values();

        return response()->json([
            'data' => $folders,
        ]);
    }

    /**
     * Create a new folder
     */
    public function createFolder(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'folder' => 'required|string|max:255',
        ]);

        // Folders are virtual - they're created when files are uploaded to them
        // Just return success
        return response()->json([
            'data' => ['folder' => $validated['folder']],
            'message' => 'Folder created successfully',
        ]);
    }

    /**
     * Move media to folder
     */
    public function moveToFolder(Request $request)
    {
        $tenant = $request->attributes->get('tenant');
        
        if (!$tenant) {
            return response()->json(['error' => 'No tenant context'], 400);
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'uuid|exists:media_library,id',
            'folder' => 'required|string|max:255',
        ]);

        $moved = MediaLibrary::whereIn('id', $validated['ids'])
            ->where('tenant_id', $tenant->id)
            ->update(['folder' => $validated['folder']]);

        return response()->json([
            'message' => "{$moved} file(s) moved successfully",
        ]);
    }
}
