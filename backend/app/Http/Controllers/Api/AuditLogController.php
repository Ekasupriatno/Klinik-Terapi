<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuditLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = AuditLog::with('user');

        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->entity) {
            $query->where('entity', $request->entity);
        }

        if ($request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->where('created_at', '<=', $request->date_to);
        }

        return AuditLogResource::collection($query->orderBy('created_at', 'desc')->paginate(50));
    }

    public function show(AuditLog $auditLog): AuditLogResource
    {
        $auditLog->load('user');
        return new AuditLogResource($auditLog);
    }

    public function destroy(AuditLog $auditLog): JsonResponse
    {
        $auditLog->delete();

        return response()->json([
            'success' => true,
            'message' => 'Audit log berhasil dihapus.',
        ]);
    }
}
