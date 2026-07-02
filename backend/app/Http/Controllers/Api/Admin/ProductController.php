<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::orderBy('order')->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data'    => $products,
        ]);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $product,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateProduct($request);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }

        $data['slug'] = $this->uniqueSlug($data['name']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        } elseif ($request->filled('image_url')) {
            $data['image_path'] = $request->input('image_url');
        }

        $product = Product::create($data);

        ActivityLogService::log(
            $request->user(),
            'create',
            'Created product',
            'Product',
            $product->id,
            ['name' => $product->name],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data'    => $product,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $this->validateProduct($request, $product->id);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }

        // Keep slug in sync only when the name changes
        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        if ($request->hasFile('image')) {
            // Remove the previous uploaded file (skip external URLs)
            if ($product->image_path && ! Str::startsWith($product->image_path, ['http://', 'https://'])) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $request->file('image')->store('products', 'public');
        } elseif ($request->filled('image_url')) {
            $data['image_path'] = $request->input('image_url');
        }

        $product->update($data);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated product',
            'Product',
            $product->id,
            ['name' => $product->name],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data'    => $product->fresh(),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if ($product->image_path && ! Str::startsWith($product->image_path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($product->image_path);
        }

        $name = $product->name;
        $product->delete();

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted product',
            'Product',
            $id,
            ['name' => $name],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => ! $product->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Product status updated',
            'data'    => $product,
        ]);
    }

    /**
     * Validate incoming product data. Returns the validated array, or a 422
     * JsonResponse when validation fails.
     */
    protected function validateProduct(Request $request, $id = null)
    {
        // Normalise "features" — accepts a JSON string, a features[] array, or comma/newline text.
        $request->merge(['features' => $this->normaliseFeatures($request->input('features'))]);

        $rules = [
            'name'           => ($id ? 'sometimes|' : '') . 'required|string|max:150',
            'price'          => ($id ? 'sometimes|' : '') . 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'best_for'       => 'nullable|string|max:150',
            'badge'          => 'nullable|string|max:100',
            'theme'          => 'nullable|in:green,blue,purple,orange,red',
            'description'    => 'nullable|string',
            'features'       => 'nullable|array',
            'features.*'     => 'string|max:200',
            'image'          => 'nullable|image|max:5120', // 5MB
            'image_url'      => 'nullable|url',
            'order'          => 'nullable|integer',
            'in_stock'       => 'nullable|boolean',
            'is_active'      => 'nullable|boolean',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Booleans arrive from FormData as "true"/"false"/"1"/"0" strings
        foreach (['in_stock', 'is_active'] as $boolField) {
            if ($request->has($boolField)) {
                $data[$boolField] = filter_var($request->input($boolField), FILTER_VALIDATE_BOOLEAN);
            }
        }

        // image / image_url are handled by the caller, not mass-assigned here
        unset($data['image'], $data['image_url']);

        return $data;
    }

    protected function normaliseFeatures($features): array
    {
        if (is_array($features)) {
            return array_values(array_filter(array_map('trim', $features), fn ($v) => $v !== ''));
        }

        if (is_string($features) && $features !== '') {
            $decoded = json_decode($features, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded), fn ($v) => $v !== ''));
            }
            // Fall back to newline/comma separated text
            $parts = preg_split('/[\r\n,]+/', $features);
            return array_values(array_filter(array_map('trim', $parts), fn ($v) => $v !== ''));
        }

        return [];
    }

    protected function uniqueSlug(string $name, $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $i    = 1;

        while (
            Product::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
