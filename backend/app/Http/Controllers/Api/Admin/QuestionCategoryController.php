<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionCategory;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuestionCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = QuestionCategory::orderBy('order')->get();

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed question categories',
            'QuestionCategory',
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
            'slug' => 'required|string|max:100|unique:question_categories,slug',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $category = QuestionCategory::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'color' => $request->color ?? '#3b82f6',
            'icon' => $request->icon,
            'description' => $request->description,
            'order' => $request->order ?? 0,
            'is_active' => $request->is_active ?? true
        ]);

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created question category',
            'QuestionCategory',
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
        $category = QuestionCategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'sometimes|required|string|max:100|unique:question_categories,slug,' . $category->id,
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $category->toArray();
        $category->update($request->all());
        $newData = $category->toArray();

        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated question category',
            'QuestionCategory',
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
        $category = QuestionCategory::findOrFail($id);

        // Check if category has questions
        if ($category->question_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category that contains questions'
            ], 400);
        }

        $categoryData = $category->toArray();
        $category->delete();

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted question category',
            'QuestionCategory',
            $id,
            ['name' => $categoryData['name']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
}