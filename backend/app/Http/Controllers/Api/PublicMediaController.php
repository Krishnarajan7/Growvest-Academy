<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;

class PublicMediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::query()
            ->where('visibility', 'public')
            ->where('status', 'active')
            ->with('categories');

        if ($request->filled('category') && $request->category !== 'all') {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json([
            'success' => true,
            'data' => $query
                ->latest()
                ->paginate(12)
                ->through(fn ($media) => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'type' => $media->type,
                    'url' => $media->url,
                    'thumbnail_url' => $media->thumbnail_url ?? $media->url,
                    'created_at' => $media->created_at,
                    'view_count' => $media->view_count,
                    'category' => $media->categories->first()?->slug,
                ]),
        ]);
    }

    public function show(Media $media)
    {
        abort_if(
            $media->visibility !== 'public' || $media->status !== 'active',
            404
        );

        $media->increment('view_count');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $media->id,
                'name' => $media->name,
                'type' => $media->type,
                'url' => $media->url,
                'thumbnail_url' => $media->thumbnail_url ?? $media->url,
                'created_at' => $media->created_at,
                'view_count' => $media->view_count,
            ],
        ]);
    }
}
