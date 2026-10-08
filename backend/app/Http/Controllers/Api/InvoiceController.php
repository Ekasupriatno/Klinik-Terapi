<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Invoice::with('booking.child', 'child.guardian.user', 'guardian.user', 'payments');

        if ($request->guardian_id) {
            $query->where('guardian_id', $request->guardian_id);
        } elseif ($request->user() && $request->user()->isParent()) {
            $guardian = $request->user()->guardian;
            if ($guardian) {
                $query->where('guardian_id', $guardian->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }

        return InvoiceResource::collection($query->paginate(20));
    }

    public function show(Invoice $invoice): InvoiceResource
    {
        $invoice->load('booking.child.guardian', 'child.guardian.user', 'guardian.user', 'payments');
        return new InvoiceResource($invoice);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'child_id' => 'nullable|exists:children,id',
            'guardian_id' => 'nullable|exists:guardians,id',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'sometimes|numeric|min:0',
            'tax_amount' => 'sometimes|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'status' => 'sometimes|in:unpaid,pending,paid,failed,refunded',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $validated['invoice_number'] = 'INV-' . strtoupper(Str::random(8));

        $invoice = Invoice::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil dibuat.',
            'data' => new InvoiceResource($invoice->load('booking', 'child', 'guardian')),
        ], 201);
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'subtotal' => 'sometimes|numeric|min:0',
            'discount_amount' => 'sometimes|numeric|min:0',
            'tax_amount' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:unpaid,pending,paid,failed,refunded',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);

        if ($invoice->status === 'paid' && !$invoice->paid_at) {
            $invoice->update(['paid_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil diperbarui.',
            'data' => new InvoiceResource($invoice->load('booking', 'child', 'guardian')),
        ]);
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil dihapus.',
        ]);
    }
}
