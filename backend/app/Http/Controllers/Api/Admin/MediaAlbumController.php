<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaAlbum;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaAlbumController extends Controller
{
    public function index(Request $request)
    {
        $albums = MediaAlbum::with(['admin'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed media albums',
            'MediaAlbum',
            null,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $albums
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'privacy' => 'sometimes|in:public,private,shared',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $album = MediaAlbum::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'cover_image' => $request->cover_image,
            'privacy' => $request->privacy ?? 'public',
            'status' => $request->status ?? 'active',
            'admin_id' => $request->user()->id
        ]);

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created media album',
            'MediaAlbum',
            $album->id,
            ['name' => $album->name],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Album created successfully',
            'data' => $album
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $album = MediaAlbum::with(['admin', 'media.categories'])->findOrFail($id);

        ActivityLogService::log(
            $request->user(),
            'view',
            'Viewed album details',
            'MediaAlbum',
            $album->id,
            ['name' => $album->name],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $album
        ]);
    }

    public function update(Request $request, $id)
    {
        $album = MediaAlbum::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'privacy' => 'sometimes|in:public,private,shared',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $album->toArray();

        $album->update([
            'name' => $request->name ?? $album->name,
            'slug' => $request->name ? Str::slug($request->name) : $album->slug,
            'description' => $request->description ?? $album->description,
            'cover_image' => $request->cover_image ?? $album->cover_image,
            'privacy' => $request->privacy ?? $album->privacy,
            'status' => $request->status ?? $album->status
        ]);

        $newData = $album->toArray();
        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated media album',
            'MediaAlbum',
            $album->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Album updated successfully',
            'data' => $album
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $album = MediaAlbum::findOrFail($id);
        $albumData = $album->toArray();

        $album->delete();

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted media album',
            'MediaAlbum',
            $id,
            ['name' => $albumData['name']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Album deleted successfully'
        ]);
    }

    public function addMedia(Request $request, $id)
    {
        $album = MediaAlbum::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'media_ids' => 'required|array',
            'media_ids.*' => 'exists:media,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Add media to album
        $album->media()->syncWithoutDetaching($request->media_ids);
        
        // Update media count
        $album->updateMediaCount();

        ActivityLogService::log(
            $request->user(),
            'add_media',
            'Added media to album',
            'MediaAlbum',
            $album->id,
            ['count' => count($request->media_ids)],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => count($request->media_ids) . ' media files added to album',
            'data' => $album->fresh('media')
        ]);
    }

    public function removeMedia(Request $request, $id)
    {
        $album = MediaAlbum::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'media_ids' => 'required|array',
            'media_ids.*' => 'exists:media,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Remove media from album
        $album->media()->detach($request->media_ids);
        
        // Update media count
        $album->updateMediaCount();

        ActivityLogService::log(
            $request->user(),
            'remove_media',
            'Removed media from album',
            'MediaAlbum',
            $album->id,
            ['count' => count($request->media_ids)],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => count($request->media_ids) . ' media files removed from album'
        ]);
    }

    public function reorderMedia(Request $request, $id)
    {
        $album = MediaAlbum::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'media_order' => 'required|array',
            'media_order.*.media_id' => 'required|exists:media,id',
            'media_order.*.order' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->media_order as $item) {
            $album->media()->updateExistingPivot($item['media_id'], [
                'order' => $item['order']
            ]);
        }

        ActivityLogService::log(
            $request->user(),
            'reorder_media',
            'Reordered media in album',
            'MediaAlbum',
            $album->id,
            ['count' => count($request->media_order)],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Media order updated in album'
        ]);
    }
}