<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MediaCategory;
use Illuminate\Support\Str;

class MediaCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Root categories
        $categories = [
            [
                'name' => 'General',
                'slug' => 'general',
                'description' => 'General media files',
                'icon' => 'folder',
                'order' => 1,
                'status' => 'active',
                'children' => [],
            ],
            [
                'name' => 'Images',
                'slug' => 'images',
                'description' => 'All image files',
                'icon' => 'image',
                'order' => 2,
                'status' => 'active',
                'children' => [
                    'Logos',
                    'Banners',
                    'Thumbnails',
                    'Gallery',
                ],
            ],
            [
                'name' => 'Videos',
                'slug' => 'videos',
                'description' => 'All video files',
                'icon' => 'video',
                'order' => 3,
                'status' => 'active',
                'children' => [
                    'Promotional',
                    'Tutorials',
                    'Reels',
                ],
            ],
            [
                'name' => 'Audio',
                'slug' => 'audio',
                'description' => 'Audio & podcasts',
                'icon' => 'music',
                'order' => 4,
                'status' => 'active',
                'children' => [
                    'Podcasts',
                    'Music',
                ],
            ],
            [
                'name' => 'Documents',
                'slug' => 'documents',
                'description' => 'PDFs, docs, and files',
                'icon' => 'file',
                'order' => 5,
                'status' => 'active',
                'children' => [
                    'PDF',
                    'Spreadsheets',
                    'Presentations',
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $parent = MediaCategory::updateOrCreate(
                ['slug' => $categoryData['slug']],
                [
                    'name' => $categoryData['name'],
                    'description' => $categoryData['description'],
                    'icon' => $categoryData['icon'],
                    'order' => $categoryData['order'],
                    'status' => $categoryData['status'],
                    'parent_id' => null,
                ]
            );

            // Create child categories
            foreach ($categoryData['children'] as $index => $childName) {
                MediaCategory::updateOrCreate(
                    [
                        'slug' => Str::slug($childName),
                        'parent_id' => $parent->id,
                    ],
                    [
                        'name' => $childName,
                        'description' => $childName . ' related media',
                        'icon' => 'folder',
                        'order' => $index + 1,
                        'status' => 'active',
                    ]
                );
            }
        }
    }
}
