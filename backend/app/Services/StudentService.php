<?php

namespace App\Services;

use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentService
{
    public function getAllStudents($filters = [], $perPage = 15)
    {
        $query = Student::query();

        // Apply filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['account_type'])) {
            $query->where('account_type', $filters['account_type']);
        }

        if (!empty($filters['country'])) {
            $query->where('country', $filters['country']);
        }

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->whereBetween('created_at', [
                $filters['date_from'],
                $filters['date_to']
            ]);
        }

        // Apply sorting
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }

    public function createStudent(array $data)
    {
        DB::beginTransaction();

        try {
            $studentId = $this->generateStudentId();
            
            $student = Student::create([
                'student_id' => $studentId,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'country' => $data['country'] ?? null,
                'state' => $data['state'] ?? null,
                'city' => $data['city'] ?? null,
                'address' => $data['address'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'status' => $data['status'] ?? 'active',
                'account_type' => $data['account_type'] ?? 'free',
                'registration_source' => $data['registration_source'] ?? 'admin_panel',
                'notes' => $data['notes'] ?? null,
            ]);

            DB::commit();
            return $student;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateStudent(Student $student, array $data)
    {
        DB::beginTransaction();

        try {
            // Remove password if not being updated
            if (isset($data['password']) && empty($data['password'])) {
                unset($data['password']);
            }

            // Hash password if provided
            if (isset($data['password']) && !empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $student->update($data);

            DB::commit();
            return $student;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteStudent(Student $student)
    {
        return $student->delete();
    }

    public function bulkDeleteStudents(array $studentIds)
    {
        return Student::whereIn('id', $studentIds)->delete();
    }

    public function bulkUpdateStatus(array $studentIds, string $status)
    {
        return Student::whereIn('id', $studentIds)->update(['status' => $status]);
    }

    public function bulkUpdateAccountType(array $studentIds, string $accountType)
    {
        return Student::whereIn('id', $studentIds)->update(['account_type' => $accountType]);
    }

    public function importStudentsFromCsv($file)
    {
        $csvData = array_map('str_getcsv', file($file));
        $headers = array_shift($csvData);
        
        $imported = 0;
        $failed = 0;
        $errors = [];

        foreach ($csvData as $index => $row) {
            try {
                $data = array_combine($headers, $row);
                
                // Validate required fields
                if (empty($data['email']) || empty($data['first_name']) || empty($data['last_name'])) {
                    throw new \Exception("Missing required fields on row {$index}");
                }

                // Check if student exists
                $exists = Student::where('email', $data['email'])->exists();
                if ($exists) {
                    throw new \Exception("Student with email {$data['email']} already exists");
                }

                // Generate password if not provided
                if (empty($data['password'])) {
                    $data['password'] = Str::random(12);
                }

                $this->createStudent($data);
                $imported++;

            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Row {$index}: " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'failed' => $failed,
            'errors' => $errors
        ];
    }

    public function exportStudents($filters = [])
    {
        $query = Student::query();

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['account_type'])) {
            $query->where('account_type', $filters['account_type']);
        }

        if (!empty($filters['date_from']) && !empty($filters['date_to'])) {
            $query->whereBetween('created_at', [
                $filters['date_from'],
                $filters['date_to']
            ]);
        }

        return $query->get();
    }

    public function getStudentStatistics()
    {
        $total = Student::count();
        $active = Student::where('status', 'active')->count();
        $premium = Student::whereIn('account_type', ['premium', 'enterprise'])->count();
        $today = Student::whereDate('created_at', today())->count();
        $thisMonth = Student::whereMonth('created_at', now()->month)->count();

        $countryDistribution = Student::select('country', DB::raw('COUNT(*) as count'))
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $growthData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = Student::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $growthData[] = [
                'month' => $date->format('M Y'),
                'count' => $count
            ];
        }

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => Student::where('status', 'inactive')->count(),
            'suspended' => Student::where('status', 'suspended')->count(),
            'premium' => $premium,
            'free' => $total - $premium,
            'new_today' => $today,
            'new_this_month' => $thisMonth,
            'country_distribution' => $countryDistribution,
            'growth_data' => $growthData,
            'status_distribution' => [
                'active' => $active,
                'inactive' => Student::where('status', 'inactive')->count(),
                'suspended' => Student::where('status', 'suspended')->count(),
                'graduated' => Student::where('status', 'graduated')->count()
            ]
        ];
    }

    private function generateStudentId()
    {
        $year = date('Y');
        $month = date('m');
        $random = Str::upper(Str::random(6));
        
        return "STU{$year}{$month}{$random}";
    }

    public function getStudentDetailsWithStats($studentId)
    {
        $student = Student::findOrFail($studentId);
        
        // Get additional statistics
        $stats = [
            'total_tests_taken' => DB::table('test_results')
                ->where('student_id', $studentId)
                ->count(),
            'average_score' => DB::table('test_results')
                ->where('student_id', $studentId)
                ->avg('score'),
            'total_time_spent' => DB::table('student_activities')
                ->where('student_id', $studentId)
                ->sum('duration_minutes'),
            'last_activity' => DB::table('student_activities')
                ->where('student_id', $studentId)
                ->latest()
                ->first(),
            'subscription_info' => DB::table('subscriptions')
                ->where('student_id', $studentId)
                ->where('status', 'active')
                ->first()
        ];

        return [
            'student' => $student,
            'statistics' => $stats
        ];
    }
}