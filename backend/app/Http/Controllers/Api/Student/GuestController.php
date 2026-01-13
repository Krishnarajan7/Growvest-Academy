<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GuestController extends Controller
{
    public function enter(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'age'  => 'required|integer|min:4|max:16',
        ]);

        $dob = Carbon::now()->subYears($request->age)->startOfYear();

        $student = Student::create([
            'student_id' => 'STU-' . strtoupper(Str::random(10)),
            'student_code' => 'GST-' . strtoupper(Str::random(8)),
            'first_name' => $request->name,
            'last_name' => null,
            'username' => 'guest_' . Str::random(8),
            'password' => bcrypt(Str::random(16)),
            'date_of_birth' => $dob,
            'account_type' => 'free',
            'registration_type' => 'guest',
            'registration_source' => 'guest',
            'status' => 'active',
        ]);

        $token = $student->createToken('guest-device')->plainTextToken;

        return response()->json([
            'success' => true,
            'student' => $student,
            'token' => $token,
        ]);
    }
}
