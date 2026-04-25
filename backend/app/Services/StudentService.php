<?php

namespace App\Services;

use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentService
{
    public function createStudent(array $data, $admin = null)
    {
        DB::beginTransaction();

        try {
            $studentId = $this->generateStudentId();
            $studentCode = $this->generateStudentCode();
            
            // Generate username if not provided
            $username = $data['username'] ?? $this->generateUsername($data['first_name'], $data['last_name']);
            
            // Check if username exists
            $counter = 1;
            $originalUsername = $username;
            while (Student::where('username', $username)->exists()) {
                $username = $originalUsername . $counter;
                $counter++;
            }
            
            // Generate password if not provided
            $password = $data['password'] ?? Str::random(8);
            
            $studentData = [
                'student_id' => $studentId,
                'student_code' => $studentCode,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'username' => $username,
                'email' => $data['email'] ?? null,
                'parent_email' => $data['parent_email'] ?? null,
                'parent_phone' => $data['parent_phone'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($password),
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'country' => $data['country'] ?? null,
                'state' => $data['state'] ?? null,
                'city' => $data['city'] ?? null,
                'address' => $data['address'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'status' => $data['status'] ?? 'active',
                'account_type' => $data['account_type'] ?? 'free',
                'registration_source' => $admin ? 'admin_panel' : ($data['registration_source'] ?? 'web'),
                'registration_type' => $admin ? 'admin_created' : 'self_registered',
                'notes' => $data['notes'] ?? null,
            ];

            $student = Student::create($studentData);

            DB::commit();
            
            return [
                'student' => $student,
                'generated_password' => $password
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function generateBulkStudents(array $studentsData, $admin)
    {
        $results = [
            'successful' => [],
            'failed' => []
        ];

        foreach ($studentsData as $index => $studentData) {
            try {
                $result = $this->createStudent($studentData, $admin);
                $results['successful'][] = [
                    'index' => $index + 1,
                    'student' => $result['student'],
                    'password' => $result['generated_password']
                ];
            } catch (\Exception $e) {
                $results['failed'][] = [
                    'index' => $index + 1,
                    'error' => $e->getMessage(),
                    'data' => $studentData
                ];
            }
        }

        return $results;
    }

    public function resetStudentPassword(Student $student, $newPassword = null)
    {
        $newPassword = $newPassword ?? Str::random(8);
        
        $student->update([
            'password' => Hash::make($newPassword)
        ]);

        return $newPassword;
    }

    public function generateLoginCredentials(Student $student)
    {
        $password = Str::random(8);
        
        $student->update([
            'password' => Hash::make($password)
        ]);

        return [
            'student_code' => $student->student_code,
            'username' => $student->username,
            'password' => $password
        ];
    }

    private function generateStudentId()
    {
        $year = date('Y');
        $month = date('m');
        $random = Str::upper(Str::random(6));
        
        return "STU{$year}{$month}{$random}";
    }

    private function generateStudentCode()
    {
        return 'SK' . date('Ymd') . strtoupper(Str::random(4));
    }

    private function generateUsername($firstName, $lastName)
    {
        $firstName = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $firstName));
        $lastName = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $lastName));
        
        $username = substr($firstName, 0, 3) . substr($lastName, 0, 3);
        
        if (strlen($username) < 6) {
            $username .= rand(100, 999);
        }
        
        return $username . rand(10, 99);
    }
    public function getAllStudents(array $filters = [], $perPage = 15)
    {
        $query = Student::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['age_group'])) {
            $now = now();
            switch ($filters['age_group']) {
                case '6-8':
                    $query->whereBetween('date_of_birth', [$now->copy()->subYears(9)->addDay(), $now->copy()->subYears(6)]);
                    break;
                case '9-11':
                    $query->whereBetween('date_of_birth', [$now->copy()->subYears(12)->addDay(), $now->copy()->subYears(9)]);
                    break;
                case '12-14':
                    $query->whereBetween('date_of_birth', [$now->copy()->subYears(15)->addDay(), $now->copy()->subYears(12)]);
                    break;
                case '15-16':
                    $query->whereBetween('date_of_birth', [$now->copy()->subYears(17)->addDay(), $now->copy()->subYears(15)]);
                    break;
            }
        }
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getStudentStatistics()
    {
        $total = Student::count();
        $active = Student::where('status', 'active')->count();
        $pending = Student::where('status', 'pending')->count();
        $inactive = Student::where('status', 'inactive')->count();

        return [
            'total_students' => $total,
            'status_breakdown' => [
                'active' => $active,
                'pending' => $pending,
                'inactive' => $inactive
            ]
        ];
    }

    public function updateStudent(Student $student, array $data)
    {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        
        $student->update($data);
        return $student;
    }

    public function deleteStudent(Student $student)
    {
        return $student->delete();
    }

    public function exportStudents(array $filters = [])
    {
        $students = $this->getAllStudents($filters, 1000000)->items();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=students_export.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Username', 'Status', 'Age Group'];

        $callback = function() use($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                fputcsv($file, [
                    $student->id, 
                    $student->first_name, 
                    $student->last_name, 
                    $student->email, 
                    $student->phone, 
                    $student->username, 
                    $student->status,
                    $student->age_group
                ]);
            }

            fclose($file);
        };

        return \Illuminate\Support\Facades\Response::stream($callback, 200, $headers);
    }
}