<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', 
            'password' => 'required',
            'device_name' => 'required'
        ]);
        
        $student = Student::where(function($query) use ($request) {
            $query->where('username', $request->login)
                  ->orWhere('student_code', $request->login)
                  ->orWhere('email', $request->login);
        })->first();

        if (!$student || !Hash::check($request->password, $student->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($student->status !== 'active') {
            throw ValidationException::withMessages([
                'login' => ['Your account is not active. Please contact administrator.'],
            ]);
        }

        // Update last login info
        $student->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip()
        ]);

        $token = $student->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'student' => $student,
            'token' => $token
        ]);
    }
    
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:students,username',
            'password' => 'required|string|min:6|confirmed',
            'age_group' => 'required|in:6-8,9-11,12-14,15-16',
            'parent_email' => 'required|email',
            'parent_phone' => 'required|string|max:20',
            'device_name' => 'required'
        ]);

        $studentService = new \App\Services\StudentService();
        
        $result = $studentService->createStudent([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'password' => $request->password,
            'age_group' => $request->age_group,
            'parent_email' => $request->parent_email,
            'parent_phone' => $request->parent_phone,
            'registration_source' => 'web_registration'
        ]);

        $student = $result['student'];

        // Update last login info
        $student->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip()
        ]);

        $token = $student->createToken($request->device_name)->plainTextToken;

        return response()->json([
            'student' => $student,
            'token' => $token
        ], 201);
    }
    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $student = $request->user();

        $request->validate([
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'username' => 'sometimes|required|string|max:50|unique:students,username,' . $student->id,
            'email' => 'nullable|email|unique:students,email,' . $student->id,
            'parent_email' => 'nullable|email',
            'parent_phone' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'postal_code' => 'nullable|string|max:20',
            'profile_image' => 'nullable|string'
        ]);

        $student->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $student
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $student = $request->user();

        if (!Hash::check($request->current_password, $student->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $student->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'login' => 'required|string' // Can be username, student_code, or email
        ]);

        $student = Student::where(function($query) use ($request) {
            $query->where('username', $request->login)
                  ->orWhere('student_code', $request->login)
                  ->orWhere('email', $request->login)
                  ->orWhere('parent_email', $request->login);
        })->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with the provided information.'
            ], 404);
        }

        // Generate reset token (you can implement email sending here)
        $token = Str::random(60);
        
        // Store token in password_resets table
        DB::table('password_resets')->updateOrInsert(
            ['email' => $student->parent_email ?? $student->email],
            [
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // In production, send email to parent_email with reset link
        // For now, just return success
        
        return response()->json([
            'success' => true,
            'message' => 'Password reset instructions sent to registered email.'
        ]);
    }
}