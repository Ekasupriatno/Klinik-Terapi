<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Payment::with('invoice.guardian.user');

        if ($request->invoice_id) {
            $query->where('invoice_id', $request->invoice_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return PaymentResource::collection($query->paginate(20));
    }

    public function show(Payment $payment): PaymentResource
    {
        $payment->load('invoice.guardian.user');
        return new PaymentResource($payment);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:cash,transfer,credit_card,e_wallet,other',
            'transaction_id' => 'nullable|string|max:255',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create($validated);

        if ($payment->status === 'completed' && !$payment->paid_at) {
            $payment->update(['paid_at' => now()]);
        }

        // Update invoice status if fully paid
        $invoice = $payment->invoice;
        if ($invoice->is_paid()) {
            $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dicatat.',
            'data' => new PaymentResource($payment->load('invoice')),
        ], 201);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|in:cash,transfer,credit_card,e_wallet,other',
            'transaction_id' => 'nullable|string|max:255',
            'status' => 'sometimes|in:pending,completed,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        if ($payment->status === 'completed' && !$payment->paid_at) {
            $payment->update(['paid_at' => now()]);
        }

        // Update invoice status
        $invoice = $payment->invoice;
        if ($invoice->is_paid()) {
            $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil diperbarui.',
            'data' => new PaymentResource($payment->load('invoice')),
        ]);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dihapus.',
        ]);
    }
}
