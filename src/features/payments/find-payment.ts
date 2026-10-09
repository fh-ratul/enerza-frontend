import "server-only";
import { isApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { uuid } from "@/lib/list-params";
import type { Bill, Payment } from "@/types/api";

export type FoundPayment = {
  payment: Payment;
  bill: Bill;
  /** The bill was already settled by an earlier payment, so this one is refunded. */
  isDuplicate: boolean;
};

type Lookup = { paymentId?: string; invoice?: string };

/**
 * One of the signed-in customer's own payments, by id or by invoice number.
 * The API lists payments under the bill they belong to and only ever returns
 * the caller's own bills, so a payment id taken from a URL cannot reveal
 * anybody else's payment.
 */
export const findMyPayment = async ({ paymentId, invoice }: Lookup): Promise<FoundPayment | null> => {
  const id = uuid(paymentId);
  const invoiceNumber = invoice && /^[A-Za-z0-9-]{6,60}$/.test(invoice) ? invoice : undefined;

  if (!id && !invoiceNumber) {
    return null;
  }

  let bills: Bill[];

  try {
    ({ data: bills } = await serverApi.get<Bill[]>("/bills", {
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    }));
  } catch (error) {
    // A page about one payment should say "not found", not crash, when the
    // API is unreachable. Anything else (a redirect to /login) carries on.
    if (isApiError(error)) {
      return null;
    }

    throw error;
  }

  for (const bill of bills) {
    const payments = bill.payments ?? [];
    const payment = payments.find((item) =>
      id ? item.id === id : item.invoiceNumber === invoiceNumber,
    );

    if (payment) {
      const firstPaid = payments
        .filter((item) => item.status === "PAID" && item.paidAt)
        .sort((a, b) => (a.paidAt as string).localeCompare(b.paidAt as string))[0];

      return {
        payment,
        bill,
        isDuplicate: payment.status === "PAID" && firstPaid !== undefined && firstPaid.id !== payment.id,
      };
    }
  }

  return null;
};
