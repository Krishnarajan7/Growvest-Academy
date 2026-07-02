<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::where('is_active', true)
            ->orderBy('order')
            ->orderBy('price')
            ->get()
            ->map(fn ($product) => $this->transform($product));

        return response()->json([
            'success' => true,
            'data'    => $products,
        ]);
    }

    public function show($slug)
    {
        $product = Product::where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $this->transform($product),
        ]);
    }

    protected function transform(Product $product): array
    {
        return [
            'id'             => $product->id,
            'name'           => $product->name,
            'slug'           => $product->slug,
            'price'          => $product->price,
            'original_price' => $product->original_price,
            'best_for'       => $product->best_for,
            'badge'          => $product->badge,
            'theme'          => $product->theme,
            'description'    => $product->description,
            'features'       => $product->features ?? [],
            'image_url'      => $product->image_url,
            'in_stock'       => $product->in_stock,
        ];
    }
}
