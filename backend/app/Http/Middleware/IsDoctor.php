<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsDoctor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->isDoctor() && !$user->isTherapist()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Dokter.',
            ], 403);
        }

        // If user has a doctor profile, verify status is approved
        $doctor = $user->doctor;
        if ($doctor && $doctor->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Akun dokter Anda belum disetujui atau sedang ditangguhkan.',
            ], 403);
        }

        return $next($request);
    }
}
