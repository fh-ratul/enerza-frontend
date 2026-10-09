"use client";

import { ArrowRight, CreditCard, Lock, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRetained } from "@/hooks/use-retained";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatMoney, formatMonth } from "@/lib/format";
import { GATEWAY } from "@/lib/status";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/stores/preferences";
import type { Bill, InitiatedPayment, PaymentGateway } from "@/types/api";
import { PAYMENT_GATEWAYS } from "./schemas";

const GATEWAY_ICON = { BKASH: Smartphone, SSLCOMMERZ: CreditCard } as const;

type PayDialogProps = {
  /** The bill being paid; the dialog is open while there is one. */
  bill: Bill | null;
  onClose: () => void;
};

/**
 * Starts a payment for one bill. The API opens a checkout session with the
 * chosen gateway and returns its address; the customer pays on the gateway's
 * own page and is sent back to /payment/success or /payment/cancel.
 */
export function PayDialog({ bill: selected, onClose }: PayDialogProps) {
  const bill = useRetained(selected);
  const preferred = usePreferences((state) => state.gateway);
  const rememberGateway = usePreferences((state) => state.setGateway);
  const [gateway, setGateway] = useState<PaymentGateway>(preferred);
  const [isLeaving, setLeaving] = useState(false);

  const initiate = useApiMutation<InitiatedPayment, { billId: string; gateway: PaymentGateway }>({
    mutationFn: (body) => api.post<InitiatedPayment>("/payments/initiate", body),
    // A pending payment now exists on this bill.
    invalidate: [queryKeys.bills],
    successMessage: false,
    onSuccess: ({ data }) => {
      rememberGateway(data.gateway);
      setLeaving(true);
      // The gateway's checkout is another site: a full navigation, not a route change.
      window.location.assign(data.paymentUrl);
    },
  });

  const isBusy = initiate.isPending || isLeaving;

  return (
    <Dialog open={selected !== null} onOpenChange={(open) => (!open && !isBusy ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        {bill ? (
          <>
            <DialogHeader>
              <DialogTitle>Pay your {formatMonth(bill.billingMonth)} bill</DialogTitle>
              <DialogDescription>
                Bill <span className="font-mono">{bill.billNumber}</span>. You will finish the
                payment on the gateway&apos;s secure page and come straight back.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/50 flex items-baseline justify-between gap-4 rounded-xl border p-4">
              <span className="text-muted-foreground text-sm">Amount to pay</span>
              <span className="text-2xl font-semibold tracking-tight">
                {formatMoney(bill.totalAmount)}
              </span>
            </div>

            <RadioGroup
              value={gateway}
              onValueChange={(value) => setGateway(value as PaymentGateway)}
              aria-label="Payment method"
              disabled={isBusy}
              className="gap-3"
            >
              {PAYMENT_GATEWAYS.map((option) => {
                const Icon = GATEWAY_ICON[option];
                const id = `gateway-${option}`;

                return (
                  <label
                    key={option}
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-colors",
                      gateway === option
                        ? "border-foreground/40 bg-muted/60"
                        : "hover:bg-muted/40",
                      isBusy && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <span className="bg-background grid size-10 shrink-0 place-items-center rounded-lg border">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{GATEWAY[option].label}</span>
                      <span className="text-muted-foreground text-sm">
                        {GATEWAY[option].description}
                      </span>
                    </span>
                    <RadioGroupItem id={id} value={option} />
                  </label>
                );
              })}
            </RadioGroup>

            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <Lock className="size-3.5 shrink-0" aria-hidden />
              Enerza never sees your wallet PIN or card number. Both gateways run in test mode.
            </p>

            <DialogFooter>
              <Button variant="outline" size="lg" onClick={onClose} disabled={isBusy}>
                Not now
              </Button>
              <Button
                size="lg"
                disabled={isBusy}
                onClick={() => initiate.mutate({ billId: bill.id, gateway })}
              >
                {isBusy ? <Spinner /> : null}
                {isLeaving
                  ? `Opening ${GATEWAY[gateway].label}…`
                  : `Continue to ${GATEWAY[gateway].label}`}
                {isBusy ? null : <ArrowRight data-icon="inline-end" />}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
