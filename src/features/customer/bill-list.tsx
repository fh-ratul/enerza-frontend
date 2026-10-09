"use client";

import { CalendarClock, CircleCheck, CreditCard, Receipt, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { BillStatusBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { BillDetailDialog } from "@/features/bills/bill-detail-dialog";
import { PayDialog } from "@/features/bills/pay-dialog";
import { useResource } from "@/hooks/use-resource";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDate, formatMoney, formatMonth, formatNumber } from "@/lib/format";
import { BILL_STATUS } from "@/lib/status";
import type { Bill } from "@/types/api";
import { CUSTOMER_BILL_SORT, customerBillList, customerQueries } from "./queries";

const statusOptions = [
  { value: "UNPAID", label: BILL_STATUS.UNPAID.label },
  { value: "OVERDUE", label: "Overdue" },
  { value: "PAID", label: BILL_STATUS.PAID.label },
  { value: "CANCELLED", label: BILL_STATUS.CANCELLED.label },
];

/** Taka amounts summed in paisa: floating-point taka would drift. */
const sumMoney = (bills: Bill[]) =>
  bills.reduce((total, bill) => total + Math.round(Number(bill.totalAmount) * 100), 0) / 100;

export function BillList() {
  const { get } = useUrlState();
  const query = useResource(customerBillList(get), { keepPrevious: true });
  // The summary looks at the whole year, whatever the table is filtered to.
  const history = useResource(customerQueries.billHistory);
  const [detail, setDetail] = useState<Bill | null>(null);
  const [paying, setPaying] = useState<Bill | null>(null);

  const summary = useMemo(() => {
    const bills = history.data?.data ?? [];
    const unpaid = bills.filter((bill) => bill.status === "UNPAID");
    const paid = bills.filter((bill) => bill.status === "PAID");
    // The bill to settle first: the one that has been due the longest.
    const nextDue = [...unpaid].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

    return {
      unpaid,
      overdueCount: unpaid.filter((bill) => bill.isOverdue).length,
      amountDue: sumMoney(unpaid),
      paidTotal: sumMoney(paid),
      paidCount: paid.length,
      nextDue,
    };
  }, [history.data]);

  const columns: Column<Bill>[] = [
    {
      id: "billingMonth",
      header: "Billing month",
      sortable: true,
      cell: (bill) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{formatMonth(bill.billingMonth)}</span>
          <span className="text-muted-foreground hidden font-mono text-xs sm:inline">{bill.billNumber}</span>
        </div>
      ),
    },
    {
      id: "unitsConsumed",
      header: "Units",
      sortable: true,
      align: "right",
      hideBelow: "sm",
      cell: (bill) => <span className="nums">{formatNumber(bill.unitsConsumed)} kWh</span>,
    },
    {
      id: "dueDate",
      header: "Due date",
      sortable: true,
      hideBelow: "md",
      cell: (bill) => <span className="nums">{formatDate(bill.dueDate)}</span>,
    },
    {
      id: "totalAmount",
      header: "Amount",
      sortable: true,
      align: "right",
      cell: (bill) => <span className="nums font-medium">{formatMoney(bill.totalAmount)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (bill) => <BillStatusBadge status={bill.status} isOverdue={bill.isOverdue} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (bill) =>
        bill.status === "UNPAID" ? (
          <Button
            size="sm"
            onClick={(event) => {
              // The row itself opens the bill; this button goes straight to paying it.
              event.stopPropagation();
              setPaying(bill);
            }}
          >
            Pay
            <span className="sr-only"> the {formatMonth(bill.billingMonth)} bill</span>
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">View</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Bills"
        description="Every bill issued for your connection. Open one to see how the amount is made up."
        actions={
          summary.nextDue ? (
            <Button size="lg" onClick={() => setPaying(summary.nextDue)}>
              <CreditCard data-icon="inline-start" />
              Pay {formatMoney(summary.nextDue.totalAmount)}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {history.isPending ? (
          Array.from({ length: 3 }, (_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Amount due"
              icon={Wallet}
              tone={
                summary.overdueCount > 0
                  ? "danger"
                  : summary.unpaid.length > 0
                    ? "warning"
                    : "success"
              }
              value={formatMoney(summary.amountDue)}
              hint={
                summary.unpaid.length === 0
                  ? "Every bill is paid"
                  : `${summary.unpaid.length} unpaid ${summary.unpaid.length === 1 ? "bill" : "bills"}${summary.overdueCount > 0 ? `, ${summary.overdueCount} overdue` : ""}`
              }
            />
            <StatCard
              label="Next due date"
              icon={CalendarClock}
              tone="info"
              value={summary.nextDue ? formatDate(summary.nextDue.dueDate) : "None"}
              hint={
                summary.nextDue
                  ? `${formatMonth(summary.nextDue.billingMonth)} bill`
                  : "Nothing is waiting to be paid"
              }
            />
            <StatCard
              label="Paid in the past year"
              icon={CircleCheck}
              tone="success"
              value={formatMoney(summary.paidTotal)}
              hint={`${summary.paidCount} ${summary.paidCount === 1 ? "bill" : "bills"} settled`}
            />
          </>
        )}
      </div>

      <div
        role="search"
        aria-label="Filter bills"
        className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center"
      >
        <FilterSelect paramKey="status" label="Status" allLabel="All bills" options={statusOptions} />
        <ClearFilters keys={["status"]} />
      </div>

      <DataTable
        caption="Your bills"
        columns={columns}
        rows={query.data?.data}
        getRowId={(bill) => bill.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={CUSTOMER_BILL_SORT}
        onRowClick={setDetail}
        empty={{
          icon: Receipt,
          title: get("status") ? "No bills match this filter" : "No bills yet",
          description: get("status")
            ? "Clear the filter to see every bill on your account."
            : "Your first bill appears here after your meter has been read.",
        }}
      />

      <BillDetailDialog
        bill={detail}
        onClose={() => setDetail(null)}
        onPay={(bill) => {
          setDetail(null);
          setPaying(bill);
        }}
      />
      <PayDialog bill={paying} onClose={() => setPaying(null)} />
    </>
  );
}
