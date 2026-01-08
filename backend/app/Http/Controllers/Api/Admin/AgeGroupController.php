<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgeGroup;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AgeGroupController extends Controller
{
    public function index(Request $request)
    {
        $ageGroups = AgeGroup::orderBy('order')->get();

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed age groups',
            'AgeGroup',
            null,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $ageGroups
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:50|unique:age_groups,slug',
            'min_age' => 'required|string|max:10',
            'max_age' => 'required|string|max:10',
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

        $ageGroup = AgeGroup::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'min_age' => $request->min_age,
            'max_age' => $request->max_age,
            'description' => $request->description,
            'order' => $request->order ?? 0,
            'is_active' => $request->is_active ?? true
        ]);

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created age group',
            'AgeGroup',
            $ageGroup->id,
            ['name' => $ageGroup->name],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Age group created successfully',
            'data' => $ageGroup
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $ageGroup = AgeGroup::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'slug' => 'sometimes|required|string|max:50|unique:age_groups,slug,' . $ageGroup->id,
            'min_age' => 'sometimes|required|string|max:10',
            'max_age' => 'sometimes|required|string|max:10',
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

        $oldData = $ageGroup->toArray();
        $ageGroup->update($request->all());
        $newData = $ageGroup->toArray();

        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated age group',
            'AgeGroup',
            $ageGroup->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Age group updated successfully',
            'data' => $ageGroup
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $ageGroup = AgeGroup::findOrFail($id);

        // Check if age group has questions
        if ($ageGroup->question_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete age group that contains questions'
            ], 400);
        }

        $ageGroupData = $ageGroup->toArray();
        $ageGroup->delete();

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted age group',
            'AgeGroup',
            $id,
            ['name' => $ageGroupData['name']],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Age group deleted successfully'
        ]);
    }
}