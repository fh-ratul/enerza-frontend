import { Ban, CircleX, CreditCard, Hourglass, type LucideIcon, RotateCcw, TimerOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { findMyPayment } from "@/features/payments/find-payment";
import { RETURN_REASONS, type ReturnReason } from "@/features/payments/finish-payment";
import { type PaymentDetail, PaymentResultCard } from "@/features/payments/payment-result-card";
import { formatMoney, formatMonth } from "@/lib/format";
import { fromSearchParams, oneOf } from "@/lib/list-params";
import { GATEWAY } from "@/lib/status";
import type { PaymentStatus } from "@/types/api";

export const metadata: Metadata = { title: "Payment not completed" };

type Explanation = {
  tone: "warning" | "danger" | "neutral";
  icon: LucideIcon;
  title: string;
  description: string;
};

const NOTHING_CHARGED = "Nothing has been marked as paid and your bill is still open.";

const BY_STATUS: Record<Exclude<PaymentStatus, "PAID">, Explanation> = {
  CANCELLED: {
    tone: "neutral",
    icon: Ban,
    title: "Payment cancelled",
    description: `You left the checkout before paying. ${NOTHING_CHARGED}`,
  },
  FAILED: {
    tone: "danger",
    icon: CircleX,
    title: "Payment failed",
    description: `The gateway did not complete this payment. ${NOTHING_CHARGED} If money left your account, the gateway returns it.`,
  },
  EXPIRED: {
    tone: "neutral",
    icon: TimerOff,
    title: "This payment session has expired",
    description: "A newer payment was started for the same bill, so this one can no longer be used.",
  },
  PENDING: {
    tone: "warning",
    icon: Hourglass,
    title: "Payment not confirmed",
    description: `The gateway has not confirmed this payment. ${NOTHING_CHARGED}`,
  },
};

const BY_REASON: Record<ReturnReason, Explanation> = {
  incomplete: BY_STATUS.PENDING,
  unconfirmed: {
    tone: "warning",
    icon: Hourglass,
    title: "We could not confirm your payment",
    description: `The gateway did not answer when we checked. ${NOTHING_CHARGED} If you did pay, contact us with the invoice number and we will sort it out.`,
  },
  "not-found": {
    tone: "neutral",
    icon: CircleX,
    title: "We could not find this payment",
    description: "The link you came back with does not match a payment we started. Your bills show what is still open.",
  },
  invalid: {
    tone: "neutral",
    icon: CircleX,
    title: "This payment link is not valid",
    description: "The gateway sent you back without the details we need. Your bills show what is still open.",
  },
};

/**
 * Where a customer lands when a payment was cancelled, failed, or could not
 * be confirmed. The state shown is the one the API holds for the payment.
 */
export default async function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  const raw = fromSearchParams(await searchParams);
  const reason = oneOf(raw("reason"), RETURN_REASONS);
  const found = await findMyPayment({ paymentId: raw("payment"), invoice: raw("invoice") });

  if (found?.payment.status === "PAID") {
    redirect(`/payment/success?payment=${found.payment.id}`);
  }

  const explanation = found
    ? // A reason code says why the check itself failed; otherwise the stored status speaks.
      reason
      ? BY_REASON[reason]
      : BY_STATUS[found.payment.status as Exclude<PaymentStatus, "PAID">]
    : BY_REASON[reason ?? "not-found"];

  const details: PaymentDetail[] = found
    ? [
        { label: "Bill", value: `${formatMonth(found.bill.billingMonth)} · ${formatMoney(found.bill.totalAmount)}` },
        { label: "Payment method", value: GATEWAY[found.payment.gateway].label },
        { label: "Invoice", value: found.payment.invoiceNumber, mono: true },
      ]
    : [];

  return (
    <PaymentResultCard
      tone={explanation.tone}
      icon={explanation.icon}
      title={explanation.title}
      description={explanation.description}
      details={details}
      actions={
        <>
          <Button asChild size="xl">
            <Link href="/dashboard/bills">
              <RotateCcw data-icon="inline-start" />
              Back to bills
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/dashboard/payments">
              <CreditCard data-icon="inline-start" />
              Payment history
            </Link>
          </Button>
        </>
      }
    />
  );
}
