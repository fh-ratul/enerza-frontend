import type { NextRequest } from "next/server";
import { clientIpOf, finishPayment } from "@/features/payments/finish-payment";
import { backendRequest } from "@/lib/api/backend";
import type { PaymentResult } from "@/types/api";

const text = (value: FormDataEntryValue | null) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/**
 * Where SSLCommerz sends the customer after its checkout, whatever the
 * result: a form POST with `tran_id` (our invoice number), `status`, and on
 * success a `val_id`.
 *
 * None of it is trusted. Only these three fields are passed on, and the API
 * validates the transaction with SSLCommerz before anything is marked as paid.
 */
export async function POST(request: NextRequest) {
  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    form = new FormData();
  }

  const invoice = text(form.get("tran_id"));
  const body = new URLSearchParams();

  for (const key of ["tran_id", "val_id", "status"]) {
    const value = text(form.get(key));

    if (value) {
      body.set(key, value);
    }
  }

  return finishPayment(
    request,
    () =>
      backendRequest<PaymentResult>("/payments/sslcommerz/callback", {
        method: "POST",
        body,
        clientIp: clientIpOf(request),
      }),
    invoice,
  );
}
