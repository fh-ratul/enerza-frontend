import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { isApiError } from "@/lib/api/errors";
import type { ApiResult, PaymentResult } from "@/types/api";

// Both gateways send the customer's browser back to this app after checkout
// (bKash with a GET, SSLCommerz with a form POST). The route handlers pass
// what the gateway sent to the API, which verifies it with the gateway
// itself, and then show the customer one of two pages.
//
// The redirect only carries the payment's id (or a reason code): the result
// pages read the amount, status and transaction from the API, so a made-up
// link can never display a payment that did not happen.

/** Why a payment could not be confirmed when there is no payment to point at. */
export const RETURN_REASONS = ["incomplete", "unconfirmed", "not-found", "invalid"] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number];

const reasonFor = (error: unknown): ReturnReason => {
  if (!isApiError(error)) {
    return "unconfirmed";
  }

  switch (error.statusCode) {
    case 400:
      return "invalid";
    case 404:
      return "not-found";
    case 409:
      return "incomplete";
    default:
      return "unconfirmed";
  }
};

export const clientIpOf = (request: NextRequest) =>
  request.headers.get("x-real-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  undefined;

/**
 * Runs the API's verification and sends the browser to the matching result
 * page. `invoice` is our own invoice number, when the gateway echoes it back.
 */
export const finishPayment = async (
  request: NextRequest,
  confirm: () => Promise<ApiResult<PaymentResult>>,
  invoice?: string,
) => {
  const redirectTo = (pathname: string, params: Record<string, string | undefined>) => {
    const url = new URL(pathname, request.url);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    // 303: follow with a GET, also when the gateway arrived with a POST.
    return NextResponse.redirect(url, 303);
  };

  try {
    const { data: payment } = await confirm();

    return redirectTo(payment.status === "PAID" ? "/payment/success" : "/payment/cancel", {
      payment: payment.id,
    });
  } catch (error) {
    return redirectTo("/payment/cancel", { reason: reasonFor(error), invoice });
  }
};
