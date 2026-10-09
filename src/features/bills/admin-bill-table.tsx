"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BillStatusBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { type Column, DataTable } from "@/components/shared/data-table";
import { DateFilter } from "@/components/shared/date-filter";
import { FilterSelect } from "@/components/shared/filter-select";
import { TextField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { adminBillList, BILL_SORT } from "@/features/admin/queries";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useResource } from "@/hooks/use-resource";
import { useUrlState } from "@/hooks/use-url-state";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatDate, formatMoney, formatMonth, formatNumber } from "@/lib/format";
import { BILL_STATUS } from "@/lib/status";
import type { Bill } from "@/types/api";
import { BillDetailDialog } from "./bill-detail-dialog";
import { CustomerCombobox } from "./customer-combobox";
import { type IssueBillValues, issueBillSchema } from "./schemas";

const FILTER_KEYS = ["status", "billingMonth"];

const statusOptions = [
  { value: "UNPAID", label: BILL_STATUS.UNPAID.label },
  { value: "OVERDUE", label: "Overdue" },
  { value: "PAID", label: BILL_STATUS.PAID.label },
  { value: "CANCELLED", label: BILL_STATUS.CANCELLED.label },
];

function IssueBillForm({ onDone }: { onDone: () => void }) {
  const form = useForm<IssueBillValues>({
    resolver: zodResolver(issueBillSchema),
    defaultValues: {
      customerId: "",
      billingMonth: "",
      currentReading: undefined as unknown as number,
    },
  });

  const issue = useApiMutation<Bill, IssueBillValues>({
    mutationFn: (values) => api.post<Bill>("/bills", values),
    invalidate: [queryKeys.bills, queryKeys.adminStats],
    successMessage: ({ data }) =>
      `Bill ${data.billNumber} issued: ${formatMoney(data.totalAmount)} for ${formatNumber(data.unitsConsumed)} kWh`,
    onSuccess: onDone,
    onError: (error) =>
      applyFieldErrors(error.fieldErrors, form.setError, [
        "customerId",
        "billingMonth",
        "currentReading",
      ]),
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => issue.mutate(values))}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle>Issue a bill</DialogTitle>
        <DialogDescription>
          Enter this month&apos;s meter reading. The units used are worked out from the customer&apos;s
          last reading and billed on the tariff for their connection; the customer is emailed the
          bill.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Controller
          control={form.control}
          name="customerId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="customerId">Customer</FieldLabel>
              <CustomerCombobox
                id="customerId"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={fieldState.invalid}
              />
              <FieldDescription>
                Only customers with an area and a meter number can be billed.
              </FieldDescription>
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField control={form.control} name="billingMonth" label="Billing month" type="month" />
          <TextField
            control={form.control}
            name="currentReading"
            label="Meter reading (kWh)"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="1570"
          />
        </div>
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onDone} disabled={issue.isPending}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={issue.isPending}>
          {issue.isPending ? <Spinner /> : null}
          Issue bill
        </Button>
      </DialogFooter>
    </form>
  );
}

const columns: Column<Bill>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: (bill) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{bill.customer.user.name}</span>
        <span className="text-muted-foreground font-mono text-xs">
          {bill.customer.meterNumber ?? "No meter"}
        </span>
      </div>
    ),
  },
  {
    id: "billingMonth",
    header: "Month",
    sortable: true,
    cell: (bill) => (
      <div className="flex flex-col gap-0.5">
        <span>{formatMonth(bill.billingMonth)}</span>
        <span className="text-muted-foreground hidden font-mono text-xs xl:inline">
          {bill.billNumber}
        </span>
      </div>
    ),
  },
  {
    id: "unitsConsumed",
    header: "Units",
    sortable: true,
    align: "right",
    hideBelow: "md",
    cell: (bill) => <span className="nums">{formatNumber(bill.unitsConsumed)} kWh</span>,
  },
  {
    id: "totalAmount",
    header: "Amount",
    sortable: true,
    align: "right",
    cell: (bill) => <span className="nums font-medium">{formatMoney(bill.totalAmount)}</span>,
  },
  {
    id: "dueDate",
    header: "Due",
    sortable: true,
    hideBelow: "lg",
    cell: (bill) => <span className="nums">{formatDate(bill.dueDate)}</span>,
  },
  {
    id: "status",
    header: "Status",
    sortable: true,
    cell: (bill) => <BillStatusBadge status={bill.status} isOverdue={bill.isOverdue} />,
  },
];

/** Every bill issued, with the reading-to-bill form. */
export function AdminBillTable() {
  const { get } = useUrlState();
  const query = useResource(adminBillList(get), { keepPrevious: true });
  const [detail, setDetail] = useState<Bill | null>(null);
  const [isIssuing, setIssuing] = useState(false);
  const hasFilter = FILTER_KEYS.some((key) => get(key));

  return (
    <>
      <PageHeader
        title="Bills"
        description="Bills across every customer. Issue one from a meter reading; it is marked paid when a gateway confirms the payment."
        actions={
          <Button size="lg" onClick={() => setIssuing(true)}>
            <Plus data-icon="inline-start" />
            Issue bill
          </Button>
        }
      />

      <div
        role="search"
        aria-label="Filter bills"
        className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center"
      >
        <FilterSelect paramKey="status" label="Status" allLabel="All bills" options={statusOptions} />
        <DateFilter paramKey="billingMonth" label="Month" type="month" />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      <DataTable
        caption="Bills"
        columns={columns}
        rows={query.data?.data}
        getRowId={(bill) => bill.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={BILL_SORT}
        onRowClick={setDetail}
        empty={{
          icon: Receipt,
          title: hasFilter ? "No bills match these filters" : "No bills have been issued",
          description: hasFilter
            ? "Choose another month or clear the filters."
            : "Issue the first bill from a customer's meter reading.",
        }}
      />

      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} showCustomer />

      <Dialog open={isIssuing} onOpenChange={setIssuing}>
        <DialogContent className="sm:max-w-lg">
          <IssueBillForm onDone={() => setIssuing(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
