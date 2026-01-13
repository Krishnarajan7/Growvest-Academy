<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Question;

class StudentQuestionController extends Controller
{
    public function getByCategory(string $slug)
    {
        $questions = Question::where('category', $slug)
            ->where('status', 1)
            ->get();

        if ($questions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No questions found for this category'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }

    
}
