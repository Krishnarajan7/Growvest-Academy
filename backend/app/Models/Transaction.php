<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'student_id',
        'type',
        'description',
        'amount',
        'tax',
        'total_amount',
        'currency',
        'payment_method',
        'status',
        'payment_details',
        'invoice_url',
        'paid_at',
        'refunded_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'payment_details' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime'
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRevenue($query)
    {
        return $query->completed()->sum('total_amount');
    }

    public function getFormattedAmountAttribute()
    {
        return $this->currency . ' ' . number_format($this->total_amount, 2);
    }
}