import { CircleCheck, CreditCard, Receipt, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { findMyPayment } from "@/features/payments/find-payment";
import { PaymentResultCard } from "@/features/payments/payment-result-card";
import { formatDateTime, formatMoney, formatMonth } from "@/lib/format";
import { fromSearchParams } from "@/lib/list-params";
import { GATEWAY } from "@/lib/status";

export const metadata: Metadata = { title: "Payment received" };

const actions = (
  <>
    <Button asChild size="xl">
      <Link href="/dashboard/bills">
        <Receipt data-icon="inline-start" />
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
);

/**
 * Where a customer lands after a payment the gateway has confirmed. What is
 * shown comes from the API, looked up by the payment id in the URL, never
 * from the URL itself.
 */
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const raw = fromSearchParams(await searchParams);
  const found = await findMyPayment({ paymentId: raw("payment") });

  if (!found) {
    return (
      <PaymentResultCard
        tone="neutral"
        icon={SearchX}
        title="We could not find this payment"
        description="The link does not match a payment on your account. Your payment history shows everything that has been paid."
        actions={actions}
      />
    );
  }

  const { payment, bill, isDuplicate } = found;

  if (payment.status !== "PAID") {
    redirect(`/payment/cancel?payment=${payment.id}`);
  }

  return (
    <PaymentResultCard
      tone="success"
      icon={CircleCheck}
      title="Payment received"
      description={`Thank you. Your ${formatMonth(bill.billingMonth)} electricity bill is paid, and a receipt is on its way to your email.`}
      amount={formatMoney(payment.amount)}
      details={[
        { label: "Bill", value: bill.billNumber, mono: true },
        { label: "Paid with", value: GATEWAY[payment.gateway].label },
        { label: "Transaction ID", value: payment.gatewayTrxId ?? "—", mono: true },
        { label: "Invoice", value: payment.invoiceNumber, mono: true },
        { label: "Paid on", value: formatDateTime(payment.paidAt ?? payment.createdAt) },
      ]}
      notice={
        isDuplicate
          ? "This bill had already been settled by an earlier payment, so this one will be refunded to the account you paid from."
          : undefined
      }
      actions={actions}
    />
  );
}
