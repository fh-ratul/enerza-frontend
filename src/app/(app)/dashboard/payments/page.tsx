import type { Metadata } from "next";
import { PaymentHistory } from "@/features/customer/payment-history";
import { customerQueries } from "@/features/customer/queries";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Payments" };

export default function CustomerPaymentsPage() {
  return (
    <Prefetch resources={[customerQueries.payments]}>
      <PaymentHistory />
    </Prefetch>
  );
}
