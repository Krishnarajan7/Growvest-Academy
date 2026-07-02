<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'original_price',
        'best_for',
        'badge',
        'theme',
        'description',
        'features',
        'image_path',
        'order',
        'in_stock',
        'is_active',
    ];

    protected $casts = [
        'features'       => 'array',
        'price'          => 'decimal:2',
        'original_price' => 'decimal:2',
        'order'          => 'integer',
        'in_stock'       => 'boolean',
        'is_active'      => 'boolean',
    ];

    protected $appends = ['image_url'];

    /**
     * Public URL for the product image (served from the "public" disk → ASSET_URL/uploads/...).
     */
    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image_path)) {
            return null;
        }

        // Already an absolute URL (admin pasted a link instead of uploading)
        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return Storage::disk('public')->url($this->image_path);
    }
}
