<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsPatient
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

        if (!$user->isPatient()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Pasien.',
            ], 403);
        }

        return $next($request);
    }
}
