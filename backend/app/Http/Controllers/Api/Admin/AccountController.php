<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $this->authorizeAdminAccountManagement($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'min:10', 'max:15', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
            'password' => [
                'required',
                'string',
                'max:128',
                'confirmed',
                Password::min(6)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun admin berhasil dibuat.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $this->authorizeAdminAccountManagement($request);

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'string',
                'max:128',
                'confirmed',
                Password::min(6)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        if (!Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Kata sandi saat ini tidak sesuai.'],
            ]);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi admin berhasil diperbarui.',
        ]);
    }

    private function authorizeAdminAccountManagement(Request $request): void
    {
        abort_unless(in_array($request->user()->role, ['super_admin', 'admin'], true), 403);
    }
}
