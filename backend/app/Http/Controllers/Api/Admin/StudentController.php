<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\StudentService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    protected $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $filters = $request->only(['search', 'status', 'account_type', 'country', 'date_from', 'date_to', 'sort_by', 'sort_direction']);

        $students = $this->studentService->getAllStudents($filters, $perPage);

        ActivityLogService::log(
            $request->user(),
            'view_list',
            'Viewed student list',
            'Student',
            null,
            ['filters' => $filters],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $students,
            'filters' => $filters
        ]);
    }

    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'first_name' => 'required|string|max:100',
        'last_name' => 'required|string|max:100',
        'username' => 'nullable|string|max:50|unique:students,username',
        'email' => 'nullable|email|unique:students,email',
        'parent_email' => 'nullable|email',
        'parent_phone' => 'nullable|string|max:20',
        'phone' => 'nullable|string|max:20',
        'password' => 'nullable|string|min:6',
        'confirm_password' => 'required_with:password|same:password',
        'date_of_birth' => 'nullable|date',
        'gender' => 'nullable|in:male,female,other',
        'country' => 'nullable|string|max:100',
        'state' => 'nullable|string|max:100',
        'city' => 'nullable|string|max:100',
        'address' => 'nullable|string',
        'postal_code' => 'nullable|string|max:20',
        'status' => 'nullable|in:active,inactive,suspended,graduated',
        'account_type' => 'nullable|in:free,premium,enterprise',
        'age_group' => 'required|in:6-8,9-11,12-14,15-16',
        'notes' => 'nullable|string'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $studentService = new \App\Services\StudentService();
    
    $result = $studentService->createStudent($request->all(), $request->user());

    ActivityLogService::log(
        $request->user(),
        'create',
        'Created new student account',
        'Student',
        $result['student']->id,
        [
            'username' => $result['student']->username,
            'student_code' => $result['student']->student_code,
            'name' => $result['student']->full_name
        ],
        $request
    );

    return response()->json([
        'success' => true,
        'message' => 'Student created successfully',
        'data' => [
            'student' => $result['student'],
            'generated_password' => $result['generated_password']
        ]
    ], 201);
}

    public function show(Request $request, $id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        $details = $this->studentService->getStudentDetailsWithStats($id);

        ActivityLogService::log(
            $request->user(),
            'view',
            'Viewed student details',
            'Student',
            $student->id,
            ['student_id' => $student->student_id],
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $details
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('students')->ignore($student->id)
            ],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'confirm_password' => 'required_with:password|same:password',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'country' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'postal_code' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive,suspended,graduated',
            'account_type' => 'nullable|in:free,premium,enterprise',
            'profile_image' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $student->toArray();
        $student = $this->studentService->updateStudent($student, $request->all());
        $newData = $student->toArray();

        $changes = array_diff_assoc($newData, $oldData);

        ActivityLogService::log(
            $request->user(),
            'update',
            'Updated student information',
            'Student',
            $student->id,
            ['changes' => $changes],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $studentData = $student->toArray();

        $this->studentService->deleteStudent($student);

        ActivityLogService::log(
            $request->user(),
            'delete',
            'Deleted student',
            'Student',
            $id,
            ['student_data' => $studentData],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    }

    public function forceDelete(Request $request, $id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        $studentData = $student->toArray();

        $student->forceDelete();

        ActivityLogService::log(
            $request->user(),
            'force_delete',
            'Permanently deleted student',
            'Student',
            $id,
            ['student_data' => $studentData],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Student permanently deleted'
        ]);
    }

    public function restore(Request $request, $id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        $student->restore();

        ActivityLogService::log(
            $request->user(),
            'restore',
            'Restored deleted student',
            'Student',
            $student->id,
            ['student_id' => $student->student_id],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Student restored successfully',
            'data' => $student
        ]);
    }
    
    public function bulkCreate(Request $request)
{
    $validator = Validator::make($request->all(), [
        'students' => 'required|array|min:1',
        'students.*.first_name' => 'required|string|max:100',
        'students.*.last_name' => 'required|string|max:100',
        'students.*.age_group' => 'required|in:6-8,9-11,12-14,15-16',
        'students.*.parent_email' => 'nullable|email',
        'students.*.parent_phone' => 'nullable|string|max:20',
        'students.*.gender' => 'nullable|in:male,female,other',
        'students.*.account_type' => 'nullable|in:free,premium,enterprise',
        'students.*.status' => 'nullable|in:active,inactive,suspended'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $studentService = new \App\Services\StudentService();
    
    $results = $studentService->generateBulkStudents($request->students, $request->user());

    ActivityLogService::log(
        $request->user(),
        'bulk_create',
        'Bulk created student accounts',
        'Student',
        null,
        [
            'successful' => count($results['successful']),
            'failed' => count($results['failed'])
        ],
        $request
    );

    return response()->json([
        'success' => true,
        'message' => 'Bulk student creation completed',
        'data' => $results
    ]);
}

public function resetPassword(Request $request, $id)
{
    $student = Student::findOrFail($id);
    
    $studentService = new \App\Services\StudentService();
    $newPassword = $studentService->resetStudentPassword($student, $request->new_password);

    ActivityLogService::log(
        $request->user(),
        'reset_password',
        'Reset student password',
        'Student',
        $student->id,
        ['username' => $student->username],
        $request
    );

    return response()->json([
        'success' => true,
        'message' => 'Password reset successfully',
        'data' => [
            'new_password' => $newPassword,
            'login_credentials' => [
                'student_code' => $student->student_code,
                'username' => $student->username
            ]
        ]
    ]);
}

public function getLoginCredentials(Request $request, $id)
{
    $student = Student::findOrFail($id);
    
    $studentService = new \App\Services\StudentService();
    $credentials = $studentService->generateLoginCredentials($student);

    ActivityLogService::log(
        $request->user(),
        'get_credentials',
        'Generated login credentials for student',
        'Student',
        $student->id,
        ['username' => $student->username],
        $request
    );

    return response()->json([
        'success' => true,
        'data' => $credentials
    ]);
} 
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id'
        ]);

        $deleted = $this->studentService->bulkDeleteStudents($request->student_ids);

        ActivityLogService::log(
            $request->user(),
            'bulk_delete',
            'Bulk deleted students',
            'Student',
            null,
            ['count' => $deleted, 'student_ids' => $request->student_ids],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "{$deleted} students deleted successfully"
        ]);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'status' => 'required|in:active,inactive,suspended,graduated'
        ]);

        $updated = $this->studentService->bulkUpdateStatus(
            $request->student_ids,
            $request->status
        );

        ActivityLogService::log(
            $request->user(),
            'bulk_update_status',
            'Bulk updated student status',
            'Student',
            null,
            ['count' => $updated, 'status' => $request->status, 'student_ids' => $request->student_ids],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "Status updated for {$updated} students"
        ]);
    }

    public function bulkUpdateAccountType(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'account_type' => 'required|in:free,premium,enterprise'
        ]);

        $updated = $this->studentService->bulkUpdateAccountType(
            $request->student_ids,
            $request->account_type
        );

        ActivityLogService::log(
            $request->user(),
            'bulk_update_account_type',
            'Bulk updated student account type',
            'Student',
            null,
            ['count' => $updated, 'account_type' => $request->account_type, 'student_ids' => $request->student_ids],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => "Account type updated for {$updated} students"
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:10240'
        ]);

        $result = $this->studentService->importStudentsFromCsv($request->file('csv_file')->path());

        ActivityLogService::log(
            $request->user(),
            'import',
            'Imported students from CSV',
            'Student',
            null,
            ['imported' => $result['imported'], 'failed' => $result['failed']],
            $request
        );

        $response = [
            'success' => true,
            'message' => "Import completed: {$result['imported']} imported, {$result['failed']} failed",
            'imported' => $result['imported'],
            'failed' => $result['failed']
        ];

        if (!empty($result['errors'])) {
            $response['errors'] = $result['errors'];
        }

        return response()->json($response);
    }

    public function export(Request $request)
    {
        $filters = $request->only(['status', 'account_type', 'date_from', 'date_to']);
        $students = $this->studentService->exportStudents($filters);

        $csvFileName = 'students_export_' . date('Y_m_d_His') . '.csv';
        $csvPath = storage_path('app/exports/' . $csvFileName);

        // Create directory if not exists
        if (!file_exists(dirname($csvPath))) {
            mkdir(dirname($csvPath), 0755, true);
        }

        $handle = fopen($csvPath, 'w');
        
        // Add CSV headers
        fputcsv($handle, [
            'Student ID',
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Date of Birth',
            'Gender',
            'Country',
            'State',
            'City',
            'Address',
            'Postal Code',
            'Status',
            'Account Type',
            'Registration Source',
            'Created At',
            'Last Login'
        ]);

        // Add data rows
        foreach ($students as $student) {
            fputcsv($handle, [
                $student->student_id,
                $student->first_name,
                $student->last_name,
                $student->email,
                $student->phone,
                $student->date_of_birth,
                $student->gender,
                $student->country,
                $student->state,
                $student->city,
                $student->address,
                $student->postal_code,
                $student->status,
                $student->account_type,
                $student->registration_source,
                $student->created_at,
                $student->last_login_at
            ]);
        }

        fclose($handle);

        ActivityLogService::log(
            $request->user(),
            'export',
            'Exported students to CSV',
            'Student',
            null,
            ['count' => $students->count(), 'filters' => $filters],
            $request
        );

        return response()->download($csvPath)->deleteFileAfterSend(true);
    }

    public function statistics(Request $request)
    {
        $stats = $this->studentService->getStudentStatistics();

        ActivityLogService::log(
            $request->user(),
            'view_statistics',
            'Viewed student statistics',
            'Student',
            null,
            null,
            $request
        );

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getFilters()
    {
        $countries = Student::select('country')
            ->whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return response()->json([
            'success' => true,
            'data' => [
                'status_options' => ['active', 'inactive', 'suspended', 'graduated'],
                'account_type_options' => ['free', 'premium', 'enterprise'],
                'gender_options' => ['male', 'female', 'other'],
                'countries' => $countries,
                'sort_options' => [
                    'created_at' => 'Registration Date',
                    'first_name' => 'First Name',
                    'last_name' => 'Last Name',
                    'email' => 'Email',
                    'last_login_at' => 'Last Login'
                ]
            ]
        ]);
    }
}