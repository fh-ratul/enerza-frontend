"use client";

import { BadgeCheck, CreditCard, History, Receipt } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PaymentStatusBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { PAYMENT_GATEWAYS, PAYMENT_STATUSES } from "@/features/bills/schemas";
import { usePagination } from "@/hooks/use-pagination";
import { useResource } from "@/hooks/use-resource";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDate, formatDateTime, formatMoney, formatMonth } from "@/lib/format";
import { oneOf } from "@/lib/list-params";
import { GATEWAY, PAYMENT_STATUS } from "@/lib/status";
import type { Bill, Payment } from "@/types/api";
import { customerQueries } from "./queries";

type PaymentRow = Payment & { bill: Pick<Bill, "id" | "billNumber" | "billingMonth"> };

const statusOptions = PAYMENT_STATUSES.map((value) => ({
  value,
  label: PAYMENT_STATUS[value].label,
}));

const gatewayOptions = PAYMENT_GATEWAYS.map((value) => ({ value, label: GATEWAY[value].label }));

const columns: Column<PaymentRow>[] = [
  {
    id: "date",
    header: "Date",
    cell: (payment) => (
      <time dateTime={payment.paidAt ?? payment.createdAt} className="nums">
        {formatDateTime(payment.paidAt ?? payment.createdAt)}
      </time>
    ),
  },
  {
    id: "bill",
    header: "Bill",
    cell: (payment) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{formatMonth(payment.bill.billingMonth)}</span>
        <span className="text-muted-foreground font-mono text-xs">{payment.bill.billNumber}</span>
      </div>
    ),
  },
  {
    id: "gateway",
    header: "Paid with",
    hideBelow: "sm",
    cell: (payment) => GATEWAY[payment.gateway].label,
  },
  {
    id: "reference",
    header: "Transaction",
    hideBelow: "lg",
    cell: (payment) => (
      <span className="font-mono text-xs">
        {payment.gatewayTrxId ?? (
          <span className="text-muted-foreground">{payment.invoiceNumber}</span>
        )}
      </span>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    cell: (payment) => <span className="nums font-medium">{formatMoney(payment.amount)}</span>,
  },
  {
    id: "status",
    header: "Status",
    cell: (payment) => <PaymentStatusBadge status={payment.status} />,
  },
];

/**
 * Every payment attempt across the customer's bills. The API returns payments
 * with the bill they belong to, so the history is assembled, filtered and
 * paged here; the filters and the page still live in the URL.
 */
export function PaymentHistory() {
  const { get } = useUrlState();
  const query = useResource(customerQueries.payments);
  const status = oneOf(get("status"), PAYMENT_STATUSES);
  const gateway = oneOf(get("gateway"), PAYMENT_GATEWAYS);

  const payments = useMemo<PaymentRow[]>(
    () =>
      (query.data?.data ?? [])
        .flatMap((bill) =>
          (bill.payments ?? []).map((payment) => ({
            ...payment,
            bill: { id: bill.id, billNumber: bill.billNumber, billingMonth: bill.billingMonth },
          })),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [query.data],
  );

  const filtered = useMemo(
    () =>
      payments.filter(
        (payment) =>
          (!status || payment.status === status) && (!gateway || payment.gateway === gateway),
      ),
    [payments, status, gateway],
  );

  const { rows, meta } = usePagination(filtered);

  const successful = payments.filter((payment) => payment.status === "PAID");
  const totalPaid =
    successful.reduce((total, payment) => total + Math.round(Number(payment.amount) * 100), 0) /
    100;
  const latest = successful[0];
  const hasFilter = Boolean(status || gateway);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every payment you have started, whether it went through or not."
        actions={
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/bills">
              <Receipt data-icon="inline-start" />
              Go to bills
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {query.isPending ? (
          Array.from({ length: 3 }, (_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Total paid"
              icon={CreditCard}
              tone="success"
              value={formatMoney(totalPaid)}
              hint={`Across ${successful.length} successful ${successful.length === 1 ? "payment" : "payments"}`}
            />
            <StatCard
              label="Last payment"
              icon={BadgeCheck}
              tone="info"
              value={latest ? formatDate(latest.paidAt ?? latest.createdAt) : "None yet"}
              hint={
                latest
                  ? `${formatMoney(latest.amount)} with ${GATEWAY[latest.gateway].label}`
                  : "Your first payment will show here"
              }
            />
            <StatCard
              label="Attempts in total"
              icon={History}
              value={payments.length}
              hint={`${payments.length - successful.length} did not complete`}
            />
          </>
        )}
      </div>

      <div
        role="search"
        aria-label="Filter payments"
        className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center"
      >
        <FilterSelect paramKey="status" label="Status" allLabel="Any status" options={statusOptions} />
        <FilterSelect
          paramKey="gateway"
          label="Payment method"
          allLabel="Any method"
          options={gatewayOptions}
        />
        <ClearFilters keys={["status", "gateway"]} />
      </div>

      <DataTable
        caption="Your payments"
        columns={columns}
        rows={query.data ? rows : undefined}
        getRowId={(payment) => payment.id}
        meta={query.data ? meta : undefined}
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => query.refetch()}
        empty={{
          icon: CreditCard,
          title: hasFilter ? "No payments match these filters" : "No payments yet",
          description: hasFilter
            ? "Clear the filters to see your whole payment history."
            : "When you pay a bill with bKash or SSLCommerz, the payment is listed here.",
          action: hasFilter ? undefined : (
            <Button asChild size="lg">
              <Link href="/dashboard/bills">See your bills</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
