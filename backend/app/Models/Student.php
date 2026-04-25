<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $guard = 'student';

    protected $fillable = [
        'student_id',
        'student_code',
        'first_name',
        'last_name',
        'username',
        'email',
        'parent_email',
        'parent_phone',
        'phone',
        'password',
        'date_of_birth',
        'gender',
        'country',
        'state',
        'city',
        'address',
        'postal_code',
        'profile_image',
        'status',
        'account_type',
        'registration_source',
        'registration_type',
        'notes',
        'last_login_at',
        'last_login_ip'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'last_login_at' => 'datetime',
    ];

    protected $appends = ['age_group', 'full_name', 'age'];

    public function getAgeGroupAttribute()
    {
        if (!$this->date_of_birth) return null;
        
        $age = now()->diffInYears($this->date_of_birth);
        if ($age >= 6 && $age <= 8) return "6-8";
        if ($age >= 9 && $age <= 11) return "9-11";
        if ($age >= 12 && $age <= 14) return "12-14";
        if ($age >= 15 && $age <= 16) return "15-16";
        if ($age < 6) return "<6";
        return ">16";
    }


    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? now()->diffInYears($this->date_of_birth) : null;
    }

    public function getLoginIdentifier()
    {
        return $this->username ?? $this->student_code;
    }

    public function isPremium()
    {
        return in_array($this->account_type, ['premium', 'enterprise']);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePremium($query)
    {
        return $query->whereIn('account_type', ['premium', 'enterprise']);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('username', 'like', "%{$search}%")
              ->orWhere('student_code', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('parent_email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }
}