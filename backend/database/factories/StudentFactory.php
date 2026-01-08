<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $countries = ['USA', 'Canada', 'UK', 'Australia', 'India', 'Germany', 'France', 'Japan'];
        $states = ['California', 'Texas', 'New York', 'Florida', 'Ontario', 'Quebec', 'London', 'Tokyo'];
        $cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Toronto', 'London', 'Sydney', 'Tokyo'];

        return [
            'student_id' => 'STU' . date('Ym') . Str::upper(Str::random(6)),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'password' => Hash::make('password123'),
            'date_of_birth' => $this->faker->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'country' => $this->faker->randomElement($countries),
            'state' => $this->faker->randomElement($states),
            'city' => $this->faker->randomElement($cities),
            'address' => $this->faker->address(),
            'postal_code' => $this->faker->postcode(),
            'profile_image' => null,
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'account_type' => $this->faker->randomElement(['free', 'premium', 'enterprise']),
            'registration_source' => $this->faker->randomElement(['web', 'mobile', 'admin', 'referral']),
            'notes' => $this->faker->optional()->paragraph(),
            'email_verified_at' => now(),
            'last_login_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'last_login_ip' => $this->faker->optional()->ipv4(),
            'remember_token' => Str::random(10),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}