<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Admin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;
use Illuminate\Support\Facades\File;

class MediaService
{
    protected $allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    protected $allowedVideoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'];
    protected $allowedAudioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    protected $allowedDocumentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    protected $maxFileSize = 102400; // 100MB in KB

    public function upload(UploadedFile $file, Admin $admin, array $options = [])
    {
        $this->validateFile($file);

        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();
        $type = $this->getFileType($extension, $mimeType);

        // Generate unique filename
        $fileName = $this->generateFileName($originalName, $extension);
        $folderPath = $this->getFolderPath($type);
        $filePath = $folderPath . '/' . $fileName;

        // Store file
        $path = $file->storeAs($folderPath, $fileName, $this->getStorageDriver());

        // Process based on file type
        $processedData = $this->processFile($file, $type, $filePath);

        // Create media record
        $mediaData = [
            'admin_id' => $admin->id,
            'name' => pathinfo($originalName, PATHINFO_FILENAME),
            'original_name' => $originalName,
            'path' => $path,
            'url' => $this->getFileUrl($path),
            'type' => $type,
            'mime_type' => $mimeType,
            'extension' => $extension,
            'size' => $fileSize,
            'dimensions' => $processedData['dimensions'] ?? null,
            'duration' => $processedData['duration'] ?? null,
            'thumbnail_url' => $processedData['thumbnail_url'] ?? null,
            'visibility' => $options['visibility'] ?? 'public',
            'storage_driver' => $this->getStorageDriver(),
            'alt_text' => $options['alt_text'] ?? null,
            'caption' => $options['caption'] ?? null,
            'description' => $options['description'] ?? null,
            'tags' => $options['tags'] ?? null,
            'metadata' => $this->extractMetadata($file, $type)
        ];

        // Add CDN URL if configured
        if ($this->useCDN()) {
            $mediaData['cdn_url'] = $this->getCDNUrl($path);
        }

        $media = Media::create($mediaData);

        // Handle categories and albums
        if (!empty($options['category_ids'])) {
            $media->categories()->sync($options['category_ids']);
        }

        if (!empty($options['album_ids'])) {
            $media->albums()->sync($options['album_ids']);
        }

        return $media;
    }

    public function uploadMultiple(array $files, Admin $admin, array $options = [])
    {
        $uploadedMedia = [];

        foreach ($files as $file) {
            try {
                $media = $this->upload($file, $admin, $options);
                $uploadedMedia[] = $media;
            } catch (\Exception $e) {
                // Log error but continue with other files
                \Log::error('File upload failed: ' . $e->getMessage());
                continue;
            }
        }

        return $uploadedMedia;
    }

    public function uploadFromUrl(string $url, Admin $admin, array $options = [])
    {
        // Download file from URL
        $tempFile = tempnam(sys_get_temp_dir(), 'media_');
        file_put_contents($tempFile, file_get_contents($url));

        $originalName = basename(parse_url($url, PHP_URL_PATH));
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $mimeType = mime_content_type($tempFile);

        // Create UploadedFile instance
        $uploadedFile = new UploadedFile(
            $tempFile,
            $originalName,
            $mimeType,
            null,
            true
        );

        $media = $this->upload($uploadedFile, $admin, $options);

        // Clean up temp file
        unlink($tempFile);

        return $media;
    }

    public function generateThumbnail(Media $media, $width = 300, $height = 300)
    {
        if (!$media->is_image) {
            return null;
        }

        $thumbnailName = 'thumb_' . $width . 'x' . $height . '_' . basename($media->path);
        $thumbnailPath = 'thumbnails/' . $thumbnailName;

        $image = Image::make(Storage::disk($media->storage_driver)->path($media->path));
        
        // Resize maintaining aspect ratio
        $image->fit($width, $height, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        // Save thumbnail
        Storage::disk($media->storage_driver)->put($thumbnailPath, $image->encode());

        $media->update([
            'thumbnail_url' => $this->getFileUrl($thumbnailPath)
        ]);

        return $media->thumbnail_url;
    }

    public function optimizeImage(Media $media, $quality = 80)
    {
        if (!$media->is_image) {
            return null;
        }

        $optimizedName = 'optimized_' . basename($media->path);
        $optimizedPath = 'optimized/' . $optimizedName;

        $image = Image::make(Storage::disk($media->storage_driver)->path($media->path));
        
        // Reduce quality
        $image->encode($media->extension, $quality);

        Storage::disk($media->storage_driver)->put($optimizedPath, $image);

        $optimizedUrl = $this->getFileUrl($optimizedPath);
        
        $media->update(['optimized_url' => $optimizedUrl]);

        return $optimizedUrl;
    }

    public function extractVideoThumbnail(Media $media, $time = '00:00:05')
    {
        if (!$media->is_video) {
            return null;
        }

        $thumbnailName = 'video_thumb_' . basename($media->path) . '.jpg';
        $thumbnailPath = 'video_thumbnails/' . $thumbnailName;

        $ffmpeg = FFMpeg::create();
        $video = $ffmpeg->open(Storage::disk($media->storage_driver)->path($media->path));
        
        $frame = $video->frame(TimeCode::fromSeconds(5));
        $frame->save(storage_path('app/' . $thumbnailPath));

        $thumbnailUrl = $this->getFileUrl($thumbnailPath);
        
        $media->update(['thumbnail_url' => $thumbnailUrl]);

        return $thumbnailUrl;
    }

    public function deleteMedia(Media $media)
    {
        // Delete physical files
        $this->deletePhysicalFiles($media);

        // Delete media record
        return $media->delete();
    }

    public function bulkDelete(array $mediaIds)
    {
        $deleted = 0;
        
        foreach ($mediaIds as $mediaId) {
            $media = Media::find($mediaId);
            if ($media) {
                $this->deleteMedia($media);
                $deleted++;
            }
        }

        return $deleted;
    }

    public function moveToStorage(Media $media, $newStorageDriver)
    {
        $oldPath = $media->path;
        $newPath = str_replace(
            $this->getFolderPath($media->type),
            $this->getFolderPath($media->type, $newStorageDriver),
            $oldPath
        );

        // Copy file to new storage
        $fileContent = Storage::disk($media->storage_driver)->get($oldPath);
        Storage::disk($newStorageDriver)->put($newPath, $fileContent);

        // Delete from old storage
        Storage::disk($media->storage_driver)->delete($oldPath);

        // Update media record
        $media->update([
            'path' => $newPath,
            'url' => $this->getFileUrl($newPath, $newStorageDriver),
            'storage_driver' => $newStorageDriver,
            'cdn_url' => $this->useCDN() ? $this->getCDNUrl($newPath) : null
        ]);

        return $media;
    }

    private function validateFile(UploadedFile $file)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Check file size
        if ($fileSize > ($this->maxFileSize * 1024)) {
            throw new \Exception("File size exceeds maximum limit of {$this->maxFileSize}KB");
        }

        // Check allowed extensions
        $type = $this->getFileType($extension, $mimeType);
        $allowedExtensions = $this->getAllowedExtensions($type);

        if (!in_array($extension, $allowedExtensions)) {
            throw new \Exception("File extension .{$extension} is not allowed for {$type} files");
        }
    }

    private function getFileType($extension, $mimeType)
    {
        if (strpos($mimeType, 'image/') === 0) {
            return 'image';
        } elseif (strpos($mimeType, 'video/') === 0) {
            return 'video';
        } elseif (strpos($mimeType, 'audio/') === 0) {
            return 'audio';
        } else {
            return 'document';
        }
    }

    private function getAllowedExtensions($type)
    {
        switch ($type) {
            case 'image': return $this->allowedImageExtensions;
            case 'video': return $this->allowedVideoExtensions;
            case 'audio': return $this->allowedAudioExtensions;
            case 'document': return $this->allowedDocumentExtensions;
            default: return [];
        }
    }

    private function generateFileName($originalName, $extension)
    {
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $slug = Str::slug($name);
        $timestamp = now()->timestamp;
        $random = Str::random(8);

        return "{$slug}_{$timestamp}_{$random}.{$extension}";
    }

    private function getFolderPath($type, $driver = null)
    {
        $driver = $driver ?? $this->getStorageDriver();
        $date = now()->format('Y/m/d');
        
        return "media/{$type}/{$date}";
    }

    private function processFile(UploadedFile $file, $type, $filePath)
    {
        $result = [];

        switch ($type) {
            case 'image':
                $result = $this->processImage($file, $filePath);
                break;
            case 'video':
                $result = $this->processVideo($file, $filePath);
                break;
            case 'audio':
                $result = $this->processAudio($file, $filePath);
                break;
        }

        return $result;
    }

    private function processImage(UploadedFile $file, $filePath)
    {
        $image = Image::make($file);
        
        $result = [
            'dimensions' => [
                'width' => $image->width(),
                'height' => $image->height()
            ]
        ];

        // Generate thumbnail
        $thumbnailPath = $this->generateThumbnailPath($filePath);
        $thumbnail = $image->fit(300, 300);
        Storage::disk($this->getStorageDriver())->put($thumbnailPath, $thumbnail->encode());
        
        $result['thumbnail_url'] = $this->getFileUrl($thumbnailPath);

        return $result;
    }

    private function processVideo(UploadedFile $file, $filePath)
    {
        try {
            $ffmpeg = FFMpeg::create();
            $video = $ffmpeg->open($file->getPathname());
            
            $duration = $video->getFFProbe()->format($file->getPathname())->get('duration');
            $stream = $video->getStreams()->videos()->first();
            
            $result = [
                'dimensions' => [
                    'width' => $stream->get('width'),
                    'height' => $stream->get('height')
                ],
                'duration' => gmdate("H:i:s", $duration)
            ];

            // Generate video thumbnail
            $thumbnailPath = $this->generateThumbnailPath($filePath, 'jpg');
            $frame = $video->frame(TimeCode::fromSeconds(5));
            $frame->save(storage_path('app/' . $thumbnailPath));
            
            $result['thumbnail_url'] = $this->getFileUrl($thumbnailPath);

        } catch (\Exception $e) {
            // If FFMpeg fails, still save the file without metadata
            $result = [];
        }

        return $result;
    }

    private function processAudio(UploadedFile $file, $filePath)
    {
        try {
            $getID3 = new \getID3;
            $fileInfo = $getID3->analyze($file->getPathname());
            
            $result = [
                'duration' => isset($fileInfo['playtime_string']) ? $fileInfo['playtime_string'] : null,
                'bitrate' => isset($fileInfo['audio']['bitrate']) ? $fileInfo['audio']['bitrate'] : null
            ];
        } catch (\Exception $e) {
            $result = [];
        }

        return $result;
    }

    private function extractMetadata(UploadedFile $file, $type)
    {
        $metadata = [];

        if ($type === 'image') {
            $image = Image::make($file);
            $exif = $image->exif();
            
            if ($exif) {
                $metadata['exif'] = $exif;
            }
        }

        return $metadata;
    }

    private function generateThumbnailPath($filePath, $extension = null)
    {
        $pathInfo = pathinfo($filePath);
        $extension = $extension ?? $pathInfo['extension'];
        
        return 'thumbnails/' . $pathInfo['dirname'] . '/thumb_' . $pathInfo['filename'] . '.' . $extension;
    }

    private function getFileUrl($path, $driver = null)
    {
        $driver = $driver ?? $this->getStorageDriver();
        
        if ($driver === 's3') {
            return Storage::disk('s3')->url($path);
        } elseif ($driver === 'public') {
            return Storage::url($path);
        } else {
            return asset('storage/' . $path);
        }
    }

    private function getCDNUrl($path)
    {
        $cdnDomain = config('filesystems.cdn.domain');
        
        if ($cdnDomain) {
            return rtrim($cdnDomain, '/') . '/' . ltrim($path, '/');
        }
        
        return null;
    }

    private function getStorageDriver()
    {
        return config('filesystems.media_driver', 'public');
    }

    private function useCDN()
    {
        return config('filesystems.cdn.enabled', false);
    }

    private function deletePhysicalFiles(Media $media)
    {
        // Delete main file
        Storage::disk($media->storage_driver)->delete($media->path);

        // Delete thumbnail if exists
        if ($media->thumbnail_url) {
            $thumbnailPath = str_replace($this->getFileUrl(''), '', $media->thumbnail_url);
            Storage::disk($media->storage_driver)->delete($thumbnailPath);
        }

        // Delete optimized version if exists
        if ($media->optimized_url) {
            $optimizedPath = str_replace($this->getFileUrl(''), '', $media->optimized_url);
            Storage::disk($media->storage_driver)->delete($optimizedPath);
        }
    }
}