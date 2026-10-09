"use client";

import { CreditCard } from "lucide-react";
import type { ReactNode } from "react";
import { BillStatusBadge, PaymentStatusBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRetained } from "@/hooks/use-retained";
import { formatDate, formatDateTime, formatMoney, formatMonth, formatNumber } from "@/lib/format";
import { CONNECTION_TYPE, GATEWAY } from "@/lib/status";
import { VAT_PERCENT } from "@/lib/tariff";
import type { Bill } from "@/types/api";

function Line({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className={strong ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "nums text-lg font-semibold" : "nums"}>{value}</dd>
    </div>
  );
}

type BillDetailDialogProps = {
  bill: Bill | null;
  onClose: () => void;
  /** Customers can pay from here; staff only read. */
  onPay?: (bill: Bill) => void;
  /** Staff see whose bill it is. */
  showCustomer?: boolean;
};

/** One bill in full: readings, how the amount is made up, and every payment attempt. */
export function BillDetailDialog({
  bill: selected,
  onClose,
  onPay,
  showCustomer = false,
}: BillDetailDialogProps) {
  const bill = useRetained(selected);
  const payments = bill?.payments ?? [];

  return (
    <Dialog open={selected !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {bill ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 pr-8">
                <DialogTitle className="text-lg">{formatMonth(bill.billingMonth)}</DialogTitle>
                <BillStatusBadge status={bill.status} isOverdue={bill.isOverdue} />
              </div>
              <DialogDescription>
                Bill <span className="font-mono">{bill.billNumber}</span>
                {showCustomer
                  ? ` · ${bill.customer.user.name} · ${CONNECTION_TYPE[bill.customer.connectionType].label.toLowerCase()} connection`
                  : ` · ${CONNECTION_TYPE[bill.customer.connectionType].label} connection`}
              </DialogDescription>
            </DialogHeader>

            <dl className="flex flex-col gap-2.5 text-sm">
              <Line
                label="Meter reading"
                value={`${formatNumber(bill.previousReading)} → ${formatNumber(bill.currentReading)}`}
              />
              <Line label="Units consumed" value={`${formatNumber(bill.unitsConsumed)} kWh`} />
              <div className="my-1 border-t" />
              <Line label="Energy charge" value={formatMoney(bill.energyCharge)} />
              <Line label="Demand charge" value={formatMoney(bill.demandCharge)} />
              <Line label={`VAT (${VAT_PERCENT}%)`} value={formatMoney(bill.vatAmount)} />
              <div className="my-1 border-t" />
              <Line label="Total" value={formatMoney(bill.totalAmount)} strong />
              <Line
                label={bill.status === "PAID" ? "Paid on" : "Due by"}
                value={bill.paidAt ? formatDate(bill.paidAt) : formatDate(bill.dueDate)}
              />
            </dl>

            {payments.length > 0 ? (
              <section className="flex flex-col gap-3 border-t pt-4">
                <h3 className="font-sans text-sm font-semibold tracking-normal">Payment attempts</h3>
                <ul className="flex flex-col gap-2.5">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="bg-muted/40 flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-sm font-medium">
                          {GATEWAY[payment.gateway].label}
                          <span className="text-muted-foreground nums font-normal">
                            {" "}
                            · {formatDateTime(payment.paidAt ?? payment.createdAt)}
                          </span>
                        </p>
                        <p className="text-muted-foreground truncate font-mono text-xs">
                          {payment.gatewayTrxId ?? payment.invoiceNumber}
                        </p>
                      </div>
                      <PaymentStatusBadge status={payment.status} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <DialogFooter>
              <Button variant="outline" size="lg" onClick={onClose}>
                Close
              </Button>
              {onPay && bill.status === "UNPAID" ? (
                <Button size="lg" onClick={() => onPay(bill)}>
                  <CreditCard data-icon="inline-start" />
                  Pay {formatMoney(bill.totalAmount)}
                </Button>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
