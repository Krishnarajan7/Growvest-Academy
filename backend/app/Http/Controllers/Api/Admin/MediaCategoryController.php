<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaCategory;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaCategoryController extends Controller
{
  public function index(Request $request)
{
    $categories = MediaCategory::orderBy('order')->get();

    ActivityLogService::log(
        $request->user(),
        'view_list',
        'Viewed media categories',
        'MediaCategory',
        null,
        null,
        $request
    );

    return response()->json([
        'success' => true,
        'data' => $categories
    ]);
}


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'nullable|integer',
            'parent_id' => 'nullable|exists:media_categories,id',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $category = MediaCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'icon' => $request->icon,
            'order' => $request->order ?? 0,
            'parent_id' => $request->parent_id,
            'status' => $request->status ?? 'active'
        ]);

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created media category',
            'MediaCategory',
            $category->id,
            ['name' => $category->name],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = MediaCategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'order' => 'nullable|integer',
            'parent_id' => 'nullable|exists:media_categories,id',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $category->toArray();

        $category->update([
            'name' => $request->name ?? $category->name,
            'slug' => $request->name ? Str::slug($request->name) : $category->slug,
            'description' => $request->description ?? $category->description,
            'icon' => $request->icon ?? $category->icon,
            'order' => $request->order ?? $category->order,
            'parent_id' => $request->has('parent_id') ? $request->parent_id : $category->parent_id,
            'status' => $request->status ?? $category->status
        ]);

        $newData = $category->toArray();
        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated media category',
            'MediaCategory',
            $category->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $category = MediaCategory::findOrFail($id);

        // Check if category has media
        if ($category->media_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category that contains media files'
            ], 400);
        }

        // Check if category has children
        if ($category->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category that has sub-categories'
            ], 400);
        }

        $categoryData = $category->toArray();
        $category->delete();

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted media category',
            'MediaCategory',
            $id,
            ['name' => $categoryData['name']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }

    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:media_categories,id',
            'categories.*.order' => 'required|integer',
            'categories.*.parent_id' => 'nullable|exists:media_categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->categories as $item) {
            MediaCategory::where('id', $item['id'])->update([
                'order' => $item['order'],
                'parent_id' => $item['parent_id'] ?? null
            ]);
        }

        ActivityLogService::log(
            $request->user(),
            'reorder',
            'Reordered media categories',
            'MediaCategory',
            null,
            ['count' => count($request->categories)],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Categories reordered successfully'
        ]);
    }
}