<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $kits = [
            [
                'name'        => 'Basic Kit',
                'slug'        => 'basic-kit',
                'price'       => 199,
                'best_for'    => 'LKG - 2nd STD',
                'badge'       => 'LOW PRICE • GREAT VALUE',
                'theme'       => 'green',
                'description' => 'All important school items in one box for the little ones.',
                'features'    => [
                    '2 Notebooks',
                    '2 Pencils',
                    '1 Pen',
                    'Eraser',
                    'Sharpener',
                    'Scale',
                    'Name Stickers',
                ],
                'order'       => 1,
            ],
            [
                'name'        => 'Standard Kit',
                'slug'        => 'standard-kit',
                'price'       => 399,
                'best_for'    => '3rd - 5th STD',
                'badge'       => 'MOST POPULAR',
                'theme'       => 'blue',
                'description' => 'A complete set of quality school essentials for growing students.',
                'features'    => [
                    '4 Notebooks',
                    'Pencil Box',
                    '2 Pens',
                    '2 Pencils',
                    'Eraser & Sharpener',
                    'Scale',
                    'Crayons / Color Pencils',
                    'Water Bottle',
                    'Name Stickers',
                ],
                'order'       => 2,
            ],
            [
                'name'        => 'Premium Kit',
                'slug'        => 'premium-kit',
                'price'       => 699,
                'best_for'    => '6th - 10th STD',
                'badge'       => 'COMPLETE SOLUTION',
                'theme'       => 'purple',
                'description' => 'Everything a senior student needs — including bag, lunch box and study materials.',
                'features'    => [
                    '6 Notebooks',
                    'Geometry Box',
                    'Pencil Box',
                    'Pens & Pencils Set',
                    'Crayons / Color Kit',
                    'Water Bottle',
                    'Lunch Box',
                    'School Labels',
                    'Study Materials',
                    'Small School Bag',
                ],
                'order'       => 3,
            ],
        ];

        foreach ($kits as $kit) {
            Product::updateOrCreate(['slug' => $kit['slug']], $kit);
        }
    }
}
