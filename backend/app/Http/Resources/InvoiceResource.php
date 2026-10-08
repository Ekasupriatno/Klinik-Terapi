<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'booking_id' => $this->booking_id,
            'booking' => BookingResource::make($this->whenLoaded('booking')),
            'child_id' => $this->child_id,
            'child' => ChildResource::make($this->whenLoaded('child')),
            'guardian_id' => $this->guardian_id,
            'guardian' => GuardianResource::make($this->whenLoaded('guardian')),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total' => (float) $this->total,
            'status' => $this->status,
            'due_date' => $this->due_date,
            'paid_at' => $this->paid_at,
            'notes' => $this->notes,
            'remaining_amount' => (float) $this->remaining_amount,
            'is_paid' => $this->is_paid,
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
