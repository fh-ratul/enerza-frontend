import { BILL_SORTABLE_FIELDS, BILL_STATUSES } from "@/features/bills/schemas";
import { OUTAGE_STATUSES } from "@/features/outages/schemas";
import { resources } from "@/lib/api/resources";
import { oneOf, paging, type RawParams } from "@/lib/list-params";

// The reads behind the customer dashboard, defined once so the Server
// Component that prefetches them and the client component that renders them
// are guaranteed to ask for exactly the same thing.

export const customerQueries = {
  /** Everything published for the customer's feeder that has not ended yet. */
  schedules: resources.mySchedules({ limit: 50 }),
  recentOutages: resources.outages({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
  /** A year of bills: the amount due, the last reading and the consumption chart. */
  billHistory: resources.bills({ limit: 12, sortBy: "billingMonth", sortOrder: "desc" }),
  /** Every bill with its payment attempts, for the payment history. */
  payments: resources.bills({ limit: 100, sortBy: "billingMonth", sortOrder: "desc" }),
};

export const OPEN_OUTAGE_STATUSES = ["REPORTED", "ASSIGNED", "IN_PROGRESS"] as const;

export const CUSTOMER_OUTAGE_PAGE_SIZE = 5;

/** The customer's outages for the filters in the URL. */
export const customerOutageList = (raw: RawParams) =>
  resources.outages({
    ...paging(raw, {
      limit: CUSTOMER_OUTAGE_PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
      sortable: [],
    }),
    status: oneOf(raw("status"), OUTAGE_STATUSES),
  });

export const CUSTOMER_BILL_SORT = { sortBy: "billingMonth", sortOrder: "desc" } as const;

/** The customer's bills for the filters, sort order and page in the URL. */
export const customerBillList = (raw: RawParams) => {
  const view = oneOf(raw("status"), [...BILL_STATUSES, "OVERDUE"] as const);

  return resources.bills({
    ...paging(raw, { ...CUSTOMER_BILL_SORT, sortable: BILL_SORTABLE_FIELDS }),
    // "Overdue" is not a stored status: the API computes it from the due date.
    status: view === "OVERDUE" ? undefined : view,
    overdue: view === "OVERDUE" ? true : undefined,
  });
};
