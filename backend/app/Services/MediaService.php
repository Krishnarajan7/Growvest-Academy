<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Admin;
use App\Models\MediaCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;
use getID3;

class MediaService
{
    protected $allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    protected $allowedVideoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'];
    protected $allowedAudioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    protected $allowedDocumentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    protected $maxFileSize = 102400;

    private function getImageManager(): ImageManager
    {
        return new ImageManager(new Driver());
    }

    public function upload(UploadedFile $file, Admin $admin, array $options = [])
    {
        $this->validateFile($file);

        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        $type = $this->getFileType($extension, $mimeType);
        $fileName = $this->generateFileName($originalName, $extension);
        $folderPath = $this->getFolderPath($type);
        $filePath = $folderPath . '/' . $fileName;

        $path = $file->storeAs($folderPath, $fileName, $this->getStorageDriver());

        $processedData = $this->processFile($file, $type, $filePath);

        $name = $options['name'] ?? $options['title'] ?? pathinfo($originalName, PATHINFO_FILENAME);

        $mediaData = [
            'admin_id' => $admin->id,
            'name' => $name,
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

        if ($this->useCDN()) {
            $mediaData['cdn_url'] = $this->getCDNUrl($path);
        }

        $media = Media::create($mediaData);

        $categoryIds = $this->resolveCategories($options);
        $media->categories()->sync($categoryIds);

        if (!empty($options['album_ids'])) {
            $media->albums()->sync($options['album_ids']);
        }

        return $media;
    }

    public function uploadMultiple(array $files, Admin $admin, array $options = [])
    {
        $uploadedMedia = [];
        $errors = [];

        foreach ($files as $index => $file) {
            try {
                $media = $this->upload($file, $admin, $options);
                $uploadedMedia[] = $media;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $index,
                    'filename' => $file->getClientOriginalName(),
                    'error' => $e->getMessage()
                ];

                \Log::error('Media upload failed', [
                    'filename' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        if (!empty($errors) && empty($uploadedMedia)) {
            throw new \Exception("All files failed to upload. First error: " . ($errors[0]['error'] ?? 'Unknown error'));
        }

        return [
            'media' => $uploadedMedia,
            'errors' => $errors
        ];
    }

    private function resolveCategories(array $options): array
    {
        if (!empty($options['category_ids'])) {
            return array_filter($options['category_ids'], 'is_numeric');
        }

        if (!empty($options['category'])) {
            $name = trim($options['category']);
            if (empty($name)) {
                goto default_category;
            }

            $category = MediaCategory::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => ucfirst($name)]
            );

            return [$category->id];
        }

        default_category:
        $default = MediaCategory::firstOrCreate(
            ['slug' => 'general'],
            ['name' => 'General']
        );

        return [$default->id];
    }

    private function validateFile(UploadedFile $file)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        if ($fileSize > ($this->maxFileSize * 1024)) {
            throw new \Exception("File size exceeds maximum limit of {$this->maxFileSize}KB");
        }

        $type = $this->getFileType($extension, $mimeType);
        $allowedExtensions = $this->getAllowedExtensions($type);

        if (!in_array($extension, $allowedExtensions)) {
            throw new \Exception("File extension .{$extension} is not allowed for {$type} files");
        }
    }

    private function getFileType($extension, $mimeType)
    {
        if (strpos($mimeType, 'image/') === 0) return 'image';
        if (strpos($mimeType, 'video/') === 0) return 'video';
        if (strpos($mimeType, 'audio/') === 0) return 'audio';
        return 'document';
    }

    private function getAllowedExtensions($type)
    {
        return match ($type) {
            'image' => $this->allowedImageExtensions,
            'video' => $this->allowedVideoExtensions,
            'audio' => $this->allowedAudioExtensions,
            'document' => $this->allowedDocumentExtensions,
            default => []
        };
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
        return match ($type) {
            'image' => $this->processImage($file, $filePath),
            'video' => $this->processVideo($file, $filePath),
            'audio' => $this->processAudio($file, $filePath),
            default => []
        };
    }

    private function processImage(UploadedFile $file, string $filePath): array
    {
        $manager = $this->getImageManager();
        $original = $manager->read($file->getPathname());

        $result = [
            'dimensions' => [
                'width' => $original->width(),
                'height' => $original->height(),
            ],
        ];

        $thumbnail = $manager
            ->read($file->getPathname())
            ->cover(300, 300);

        $thumbnailPath = 'thumbnails/' . basename($filePath);
        Storage::disk($this->getStorageDriver())->put(
            $thumbnailPath,
            (string) $thumbnail->toJpeg(quality: 85)
        );

        $result['thumbnail_url'] = $this->getFileUrl($thumbnailPath);

        return $result;
    }

    private function processVideo(UploadedFile $file, $filePath)
    {
        try {
            $ffmpeg = FFMpeg::create();
            $video = $ffmpeg->open($file->getPathname());

            $durationSeconds = $video->getFFProbe()
                ->format($file->getPathname())
                ->get('duration');

            $duration = $durationSeconds ? gmdate("H:i:s", (int) $durationSeconds) : null;

            $stream = $video->getStreams()->videos()->first();

            $result = [
                'dimensions' => [
                    'width' => $stream?->get('width'),
                    'height' => $stream?->get('height'),
                ],
                'duration' => $duration
            ];

            $thumbnailPath = 'thumbnails/video_' . basename($filePath) . '.jpg';
            $frame = $video->frame(TimeCode::fromSeconds(5));
            $frame->save(storage_path('app/' . $thumbnailPath));

            $result['thumbnail_url'] = $this->getFileUrl($thumbnailPath);

            return $result;
        } catch (\Exception $e) {
            \Log::warning("Video processing failed, continuing without metadata", [
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage()
            ]);

            return [];
        }
    }

    private function processAudio(UploadedFile $file, $filePath)
    {
        try {
            $getID3 = new getID3;
            $fileInfo = $getID3->analyze($file->getPathname());
            return [
                'duration' => $fileInfo['playtime_string'] ?? null,
                'bitrate' => $fileInfo['audio']['bitrate'] ?? null,
            ];
        } catch (\Exception $e) {
            return [];
        }
    }

    private function extractMetadata(UploadedFile $file, $type)
    {
        if ($type !== 'image') {
            return [];
        }

        try {
            $manager = $this->getImageManager();
            $image = $manager->read($file->getPathname());
            $exif = $image->exif();
            return $exif ? ['exif' => $exif] : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getFileUrl($path, $driver = null)
    {
        $driver = $driver ?? $this->getStorageDriver();
        return match ($driver) {
            's3' => Storage::disk('s3')->url($path),
            'public' => rtrim(config('app.url'), '/') . Storage::url($path),
            default => asset('storage/' . $path),
        };
    }

    private function getCDNUrl($path)
    {
        $cdnDomain = config('filesystems.cdn.domain');
        return $cdnDomain
            ? rtrim($cdnDomain, '/') . '/' . ltrim($path, '/')
            : null;
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
        Storage::disk($media->storage_driver)->delete($media->path);

        if ($media->thumbnail_url) {
            $thumbnailPath = parse_url($media->thumbnail_url, PHP_URL_PATH);
            $thumbnailPath = ltrim($thumbnailPath, '/');
            Storage::disk($media->storage_driver)->delete($thumbnailPath);
        }

        if ($media->optimized_url) {
            $optimizedPath = parse_url($media->optimized_url, PHP_URL_PATH);
            $optimizedPath = ltrim($optimizedPath, '/');
            Storage::disk($media->storage_driver)->delete($optimizedPath);
        }
    }

    public function optimizeImage(Media $media, $quality = 80)
    {
        if (!$media->is_image) {
            return null;
        }

        $manager = $this->getImageManager();
        $optimizedName = 'optimized_' . basename($media->path);
        $optimizedPath = 'optimized/' . $optimizedName;

        $image = $manager->read(
            Storage::disk($media->storage_driver)->path($media->path)
        );

        $encoded = match (strtolower($media->extension)) {
            'png' => $image->toPng(quality: $quality),
            'webp' => $image->toWebp(quality: $quality),
            default => $image->toJpeg(quality: $quality),
        };

        Storage::disk($media->storage_driver)->put($optimizedPath, (string) $encoded);

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
        $thumbnailPath = 'thumbnails/' . $thumbnailName;

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
        $this->deletePhysicalFiles($media);
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

        $fileContent = Storage::disk($media->storage_driver)->get($oldPath);
        Storage::disk($newStorageDriver)->put($newPath, $fileContent);
        Storage::disk($media->storage_driver)->delete($oldPath);

        $media->update([
            'path' => $newPath,
            'url' => $this->getFileUrl($newPath, $newStorageDriver),
            'storage_driver' => $newStorageDriver,
            'cdn_url' => $this->useCDN() ? $this->getCDNUrl($newPath) : null
        ]);

        return $media;
    }
}