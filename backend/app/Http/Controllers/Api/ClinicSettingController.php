<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ClinicSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicSettingController extends Controller
{
    /**
     * Get the current clinic settings (public).
     */
    public function show(): JsonResponse
    {
        $settings = ClinicSetting::getSettings();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update clinic settings (admin only).
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'whatsapp' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:1000'],
            'operational_hours' => ['nullable', 'string', 'max:1000'],
        ]);

        $settings = ClinicSetting::getSettings();
        $oldValues = $settings->toArray();

        $settings->update([
            'name' => $validated['name'] ?? $settings->name,
            'phone' => $validated['phone'],
            'whatsapp' => $validated['whatsapp'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'operational_hours' => $validated['operational_hours'] ?? $settings->operational_hours,
        ]);

        $newValues = $settings->fresh()->toArray();

        // Log action in audit logs
        AuditLog::log(
            'update',
            'clinic_settings',
            $settings->id,
            $oldValues,
            $newValues
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan informasi klinik berhasil disimpan.',
            'data' => $settings->fresh(),
        ]);
    }
}
