<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsTherapist
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()->isTherapist()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Role terapis diperlukan.',
            ], 403);
        }

        return $next($request);
    }
}
