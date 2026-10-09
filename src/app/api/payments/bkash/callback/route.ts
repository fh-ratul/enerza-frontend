import type { NextRequest } from "next/server";
import { clientIpOf, finishPayment } from "@/features/payments/finish-payment";
import { backendRequest } from "@/lib/api/backend";
import type { PaymentResult } from "@/types/api";

/**
 * Where bKash sends the customer after its checkout:
 * GET /api/payments/bkash/callback?paymentID=…&status=success|failure|cancel
 *
 * The `status` in the URL proves nothing; the API executes and verifies the
 * payment with bKash before anything is marked as paid.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  return finishPayment(request, () =>
    backendRequest<PaymentResult>("/payments/bkash/callback", {
      query: {
        paymentID: searchParams.get("paymentID"),
        status: searchParams.get("status"),
      },
      clientIp: clientIpOf(request),
    }),
  );
}
