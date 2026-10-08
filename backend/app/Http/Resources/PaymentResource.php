<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'invoice' => InvoiceResource::make($this->whenLoaded('invoice')),
            'amount' => (float) $this->amount,
            'method' => $this->method,
            'transaction_id' => $this->transaction_id,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'notes' => $this->notes,
            'is_completed' => $this->is_completed,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
