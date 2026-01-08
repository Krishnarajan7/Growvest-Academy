<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MediaAlbum extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'cover_image',
        'privacy',
        'status',
        'admin_id'
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'media_album_pivot')
            ->withPivot('order')
            ->orderBy('order');
    }

    public function scopePublic($query)
    {
        return $query->where('privacy', 'public');
    }

    public function updateMediaCount()
    {
        $this->update(['media_count' => $this->media()->count()]);
    }

    public function getCoverImageUrlAttribute()
    {
        if ($this->cover_image) {
            return asset('storage/' . $this->cover_image);
        }
        
        $firstMedia = $this->media()->first();
        return $firstMedia ? $firstMedia->thumbnail_url : null;
    }
}