<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaCategory;
use App\Models\MediaAlbum; 
use App\Services\MediaService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    protected $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 24);
        
        $query = Media::with(['categories', 'albums', 'admin'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('media_categories.id', $request->category_id);
            });
        }

        if ($request->has('album_id')) {
            $query->whereHas('albums', function ($q) use ($request) {
                $q->where('media_albums.id', $request->album_id);
            });
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('original_name', 'like', "%{$request->search}%")
                  ->orWhere('caption', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $media = $query->paginate($perPage);

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed media library',
            'Media',
            null,
            ['filters' => $request->all()],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1|max:20',
            'files.*' => 'file|max:102400', // 100MB max
            'visibility' => 'sometimes|in:public,private,protected',
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:media_categories,id',
            'album_ids' => 'nullable|array',
            'album_ids.*' => 'exists:media_albums,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $uploadedMedia = $this->mediaService->uploadMultiple(
            $request->file('files'),
            $request->user(),
            $request->only([
                'visibility', 'alt_text', 'caption', 'description', 
                'tags', 'category_ids', 'album_ids'
            ])
        );

        ActivityLogService::log(
            $request->user(),
            'upload',
            'Uploaded media files',
            'Media',
            null,
            ['count' => count($uploadedMedia)],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Files uploaded successfully',
            'data' => $uploadedMedia,
            'count' => count($uploadedMedia)
        ], 201);
    }

    public function uploadFromUrl(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'visibility' => 'sometimes|in:public,private,protected',
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:media_categories,id',
            'album_ids' => 'nullable|array',
            'album_ids.*' => 'exists:media_albums,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $media = $this->mediaService->uploadFromUrl(
                $request->url,
                $request->user(),
                $request->only([
                    'visibility', 'alt_text', 'caption', 'description', 
                    'tags', 'category_ids', 'album_ids'
                ])
            );

            ActivityLogService::log(
                $request->user(),
                'upload_from_url',
                'Uploaded media from URL',
                'Media',
                $media->id,
                ['url' => $request->url],
                $request
            );

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully from URL',
                'data' => $media
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload from URL: ' . $e->getMessage()
            ], 400);
        }
    }

    public function show(Request $request, $id)
    {
        $media = Media::with(['categories', 'albums', 'admin'])->findOrFail($id);

        // Increment view count
        $media->incrementViewCount();

        ActivityLogService::log(
            $request->user(),
            'view',
            'Viewed media details',
            'Media',
            $media->id,
            ['file_name' => $media->original_name],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    public function update(Request $request, $id)
    {
        $media = Media::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:255',
            'title'       => 'sometimes|string|max:255', // Support frontend that sends title
            'alt_text'    => 'nullable|string|max:500',
            'caption'     => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'visibility'  => 'sometimes|in:public,private,protected',
            'status'      => 'sometimes|in:active,inactive,archived',
            'tags'        => 'nullable|array',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:media_categories,id',
            'album_ids'   => 'nullable|array',
            'album_ids.*' => 'exists:media_albums,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Support title → name mapping (for frontend compatibility)
        if ($request->filled('title') && !$request->filled('name')) {
            $request->merge(['name' => $request->title]);
        }

        $oldData = $media->only([
            'name',
            'alt_text',
            'caption',
            'description',
            'visibility',
            'status',
            'tags'
        ]);

        $media->update($request->only([
            'name',
            'alt_text',
            'caption',
            'description',
            'visibility',
            'status',
            'tags'
        ]));

        // Category sync
        if ($request->has('category_ids')) {
            $media->categories()->sync($request->category_ids);
        }

        // Default category "General" if no categories were provided
        if (!$request->has('category_ids') || empty($request->category_ids)) {
            $defaultCategory = MediaCategory::firstOrCreate(
                ['slug' => 'general'],
                ['name' => 'General']
            );

            $media->categories()->sync([$defaultCategory->id]);
        }

        // Album sync
        if ($request->has('album_ids')) {
            $media->albums()->sync($request->album_ids);
        }

        // Safe change detection (handles arrays properly - no array_diff_assoc crash)
        $newData = $media->only([
            'name',
            'alt_text',
            'caption',
            'description',
            'visibility',
            'status',
            'tags'
        ]);

        $changes = [];

        foreach ($oldData as $key => $oldValue) {
            $newValue = $newData[$key] ?? null;

            if (is_array($oldValue) || is_array($newValue)) {
                if (json_encode($oldValue) !== json_encode($newValue)) {
                    $changes[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            } else {
                if ($oldValue !== $newValue) {
                    $changes[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }
        }

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated media information',
            'Media',
            $media->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Media updated successfully',
            'data' => $media->fresh(['categories', 'albums'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $media = Media::findOrFail($id);
        $mediaData = $media->toArray();

        $this->mediaService->deleteMedia($media);

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted media file',
            'Media',
            $id,
            ['file_name' => $mediaData['original_name']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully'
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'media_ids' => 'required|array|min:1',
            'media_ids.*' => 'exists:media,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $deleted = $this->mediaService->bulkDelete($request->media_ids);

        ActivityLogService::log(
            $request->user(),
            'bulk_delete',
            'Bulk deleted media files',
            'Media',
            null,
            ['count' => $deleted, 'media_ids' => $request->media_ids],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "{$deleted} media files deleted successfully"
        ]);
    }

    public function download(Request $request, $id)
    {
        $media = Media::findOrFail($id);

        // Increment download count
        $media->incrementDownloadCount();

        ActivityLogService::log(
            $request->user(),
            'download',
            'Downloaded media file',
            'Media',
            $media->id,
            ['file_name' => $media->original_name],
            $request
        );

        $filePath = Storage::disk($media->storage_driver)->path($media->path);
        
        return response()->download($filePath, $media->original_name);
    }

    public function generateThumbnail(Request $request, $id)
    {
        $media = Media::findOrFail($id);

        $width = $request->input('width', 300);
        $height = $request->input('height', 300);

        $thumbnailUrl = $this->mediaService->generateThumbnail($media, $width, $height);

        ActivityLogService::log(
            $request->user(),
            'generate_thumbnail',
            'Generated thumbnail for media',
            'Media',
            $media->id,
            ['dimensions' => "{$width}x{$height}"],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Thumbnail generated successfully',
            'thumbnail_url' => $thumbnailUrl
        ]);
    }

    public function optimize(Request $request, $id)
    {
        $media = Media::findOrFail($id);

        $quality = $request->input('quality', 80);
        $optimizedUrl = $this->mediaService->optimizeImage($media, $quality);

        ActivityLogService::log(
            $request->user(),
            'optimize',
            'Optimized media file',
            'Media',
            $media->id,
            ['quality' => $quality],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Media optimized successfully',
            'optimized_url' => $optimizedUrl
        ]);
    }

    public function moveToStorage(Request $request, $id)
    {
        $media = Media::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'storage_driver' => 'required|in:local,public,s3,cloudinary'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $media = $this->mediaService->moveToStorage($media, $request->storage_driver);

        ActivityLogService::log(
            $request->user(),
            'move_storage',
            'Moved media to different storage',
            'Media',
            $media->id,
            ['from' => $media->storage_driver, 'to' => $request->storage_driver],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Media moved to new storage successfully',
            'data' => $media
        ]);
    }

    public function statistics(Request $request)
    {
        $total = Media::count();
        $images = Media::where('type', 'image')->count();
        $videos = Media::where('type', 'video')->count();
        $audio = Media::where('type', 'audio')->count();
        $documents = Media::where('type', 'document')->count();

        $totalSize = Media::sum('size');
        $averageSize = $total > 0 ? $totalSize / $total : 0;

        $recentUploads = Media::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $topCategories = MediaCategory::withCount('media')
            ->orderBy('media_count', 'desc')
            ->limit(5)
            ->get();

        ActivityLogService::log(
            $request->user(),
            'view_statistics',
            'Viewed media statistics',
            'Media',
            null,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => [
                'total_files' => $total,
                'by_type' => [
                    'images' => $images,
                    'videos' => $videos,
                    'audio' => $audio,
                    'documents' => $documents
                ],
                'storage_usage' => [
                    'total' => $this->formatBytes($totalSize),
                    'average_per_file' => $this->formatBytes($averageSize)
                ],
                'recent_uploads' => $recentUploads,
                'top_categories' => $topCategories,
                'total_downloads' => Media::sum('download_count'),
                'total_views' => Media::sum('view_count')
            ]
        ]);
    }

    public function getUsageByDate(Request $request)
    {
        $days = $request->input('days', 30);

        $usage = Media::selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(size) as size')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $usage
        ]);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}