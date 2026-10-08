import { resources } from "@/lib/api/resources";

// The reads behind the customer dashboard, defined once so the Server
// Component that prefetches them and the client component that renders them
// are guaranteed to ask for exactly the same thing.

export const customerQueries = {
  /** Everything published for the customer's feeder that has not ended yet. */
  schedules: resources.mySchedules({ limit: 50 }),
  recentOutages: resources.outages({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
  /** A year of bills: the amount due, the last reading and the consumption chart. */
  billHistory: resources.bills({ limit: 12, sortBy: "billingMonth", sortOrder: "desc" }),
};

export const OPEN_OUTAGE_STATUSES = ["REPORTED", "ASSIGNED", "IN_PROGRESS"] as const;
