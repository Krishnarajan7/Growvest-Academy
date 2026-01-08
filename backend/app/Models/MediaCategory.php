<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MediaCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'order',
        'status',
        'parent_id'
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MediaCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(MediaCategory::class, 'parent_id');
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'media_category_pivot');
    }

    public function getMediaCountAttribute()
    {
        return $this->media()->count();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }
}