<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicSetting extends Model
{
    use HasFactory;

    protected $table = 'clinic_settings';

    protected $fillable = [
        'name',
        'phone',
        'whatsapp',
        'email',
        'address',
        'operational_hours',
    ];

    /**
     * Retrieve the primary clinic settings row, creating default if absent.
     */
    public static function getSettings(): self
    {
        return self::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Klinik Terapi & Rehabilitasi Medik',
                'phone' => '+62 82235123063',
                'whatsapp' => '6282235123063',
                'email' => 'layanan@klinikterapi.com',
                'address' => 'Jl. HMS Mintareja Sarjana Hukum No.Ruko A-28, Baros, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40521',
                'operational_hours' => "Senin - Jumat: 08:00 - 18:00 WIB\nSabtu: 08:00 - 15:00 WIB\nMinggu & Libur Nasional: Tutup",
            ]
        );
    }
}
