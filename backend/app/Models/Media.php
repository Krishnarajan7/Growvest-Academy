<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Media extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'admin_id',
        'name',
        'original_name',
        'path',
        'url',
        'thumbnail_url',
        'type',
        'mime_type',
        'extension',
        'size',
        'dimensions',
        'duration',
        'visibility',
        'status',
        'metadata',
        'storage_driver',
        'cdn_url',
        'optimized_url',
        'download_count',
        'view_count',
        'alt_text',
        'caption',
        'description',
        'tags'
    ];

    protected $casts = [
        'dimensions' => 'array',
        'metadata' => 'array',
        'tags' => 'array',
        'size' => 'integer',
        'download_count' => 'integer',
        'view_count' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($media) {
            $media->uuid = (string) Str::uuid();
        });
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    public function categories(): BelongsToMany
{
    return $this->belongsToMany(
        MediaCategory::class,
        'media_category_pivot', 
        'media_id',             
        'category_id'           
    );
}


    public function albums(): BelongsToMany
{
    return $this->belongsToMany(
        MediaAlbum::class,
        'media_album_pivot',
        'media_id',   
        'album_id'    
    );
}


    public function scopeImage($query)
    {
        return $query->where('type', 'image');
    }

    public function scopeVideo($query)
    {
        return $query->where('type', 'video');
    }

    public function scopeAudio($query)
    {
        return $query->where('type', 'audio');
    }

    public function scopeDocument($query)
    {
        return $query->where('type', 'document');
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByMime($query, $mime)
    {
        return $query->where('mime_type', 'like', "{$mime}%");
    }

    public function getFormattedSizeAttribute()
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->size;
        $unit = 0;
        
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        
        return round($size, 2) . ' ' . $units[$unit];
    }

    public function getIsImageAttribute()
    {
        return $this->type === 'image';
    }

    public function getIsVideoAttribute()
    {
        return $this->type === 'video';
    }

    public function getDimensionsFormattedAttribute()
    {
        if (!$this->dimensions) return null;
        
        return $this->dimensions['width'] . '×' . $this->dimensions['height'];
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function incrementDownloadCount()
    {
        $this->increment('download_count');
    }
}