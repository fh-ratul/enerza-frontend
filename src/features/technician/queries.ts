import { OUTAGE_PRIORITIES, OUTAGE_STATUSES } from "@/features/outages/schemas";
import { resources } from "@/lib/api/resources";
import { oneOf, paging, type RawParams } from "@/lib/list-params";

// For a technician the API's outage list is their own job list: it only ever
// returns the outages assigned to them.

export const TECHNICIAN_JOB_PAGE_SIZE = 6;

/** The technician's jobs for the filters in the URL. */
export const technicianJobList = (raw: RawParams) =>
  resources.outages({
    ...paging(raw, {
      limit: TECHNICIAN_JOB_PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder: "desc",
      sortable: [],
    }),
    status: oneOf(raw("status"), OUTAGE_STATUSES),
    priority: oneOf(raw("priority"), OUTAGE_PRIORITIES),
  });

export const technicianQueries = {
  /** The latest hundred jobs: the numbers and charts on the performance page. */
  history: resources.outages({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
};
