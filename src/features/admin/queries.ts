import { BILL_SORTABLE_FIELDS, BILL_STATUSES } from "@/features/bills/schemas";
import { OUTAGE_PRIORITIES, OUTAGE_STATUSES } from "@/features/outages/schemas";
import { resources } from "@/lib/api/resources";
import {
  isoDate,
  isoMonth,
  oneOf,
  paging,
  type RawParams,
  searchTerm,
  uuid,
} from "@/lib/list-params";

// Every admin list, built from the URL's query string. The Server Component
// that prefetches a page and the table that renders it both call the same
// builder, so they always agree on the request.

export const FEEDER_PRIORITIES = ["CRITICAL", "HIGH", "NORMAL", "LOW"] as const;
export const ROLES = ["CUSTOMER", "TECHNICIAN", "ADMIN"] as const;
export const USER_STATUSES = ["ACTIVE", "BLOCKED"] as const;
export const SCHEDULE_TYPES = ["LOAD_SHEDDING", "MAINTENANCE"] as const;
export const SCHEDULE_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;
export const SCHEDULE_PHASES = ["UPCOMING", "ONGOING", "COMPLETED"] as const;
export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "SOFT_DELETE",
  "STATUS_CHANGE",
  "ROLE_CHANGE",
  "GENERATE",
  "PAYMENT_COMPLETED",
  "PAYMENT_FAILED",
] as const;
export const AUDIT_ENTITY_TYPES = ["User", "Feeder", "Schedule", "Outage", "Bill", "Payment"] as const;

export const FEEDER_SORT = { sortBy: "code", sortOrder: "asc" } as const;
export const USER_SORT = { sortBy: "createdAt", sortOrder: "desc" } as const;
export const SCHEDULE_SORT = { sortBy: "startTime", sortOrder: "desc" } as const;
export const OUTAGE_SORT = { sortBy: "createdAt", sortOrder: "desc" } as const;
export const BILL_SORT = { sortBy: "createdAt", sortOrder: "desc" } as const;
export const AUDIT_SORT = { sortBy: "createdAt", sortOrder: "desc" } as const;

const activeFlag = (value: string | undefined) =>
  value === "true" ? true : value === "false" ? false : undefined;

export const adminFeederList = (raw: RawParams) =>
  resources.feeders({
    ...paging(raw, {
      ...FEEDER_SORT,
      sortable: ["createdAt", "name", "code", "loadMW", "priority"],
    }),
    searchTerm: searchTerm(raw("searchTerm")),
    zoneId: uuid(raw("zoneId")),
    priority: oneOf(raw("priority"), FEEDER_PRIORITIES),
    isActive: activeFlag(raw("isActive")),
  });

export const adminUserList = (raw: RawParams) =>
  resources.users({
    ...paging(raw, { ...USER_SORT, sortable: ["createdAt", "name", "email", "role", "status"] }),
    searchTerm: searchTerm(raw("searchTerm")),
    role: oneOf(raw("role"), ROLES),
    status: oneOf(raw("status"), USER_STATUSES),
  });

export const adminScheduleList = (raw: RawParams) =>
  resources.schedules({
    ...paging(raw, {
      ...SCHEDULE_SORT,
      sortable: ["startTime", "endTime", "createdAt", "type", "status"],
    }),
    type: oneOf(raw("type"), SCHEDULE_TYPES),
    status: oneOf(raw("status"), SCHEDULE_STATUSES),
    phase: oneOf(raw("phase"), SCHEDULE_PHASES),
    zoneId: uuid(raw("zoneId")),
    from: isoDate(raw("from")),
    to: isoDate(raw("to")),
  });

export const adminOutageList = (raw: RawParams) =>
  resources.outages({
    ...paging(raw, {
      ...OUTAGE_SORT,
      sortable: ["createdAt", "startedAt", "resolvedAt", "priority", "status", "reportCount"],
    }),
    status: oneOf(raw("status"), OUTAGE_STATUSES),
    priority: oneOf(raw("priority"), OUTAGE_PRIORITIES),
    zoneId: uuid(raw("zoneId")),
    from: isoDate(raw("from")),
    to: isoDate(raw("to")),
  });

export const adminBillList = (raw: RawParams) => {
  const view = oneOf(raw("status"), [...BILL_STATUSES, "OVERDUE"] as const);

  return resources.bills({
    ...paging(raw, { ...BILL_SORT, sortable: BILL_SORTABLE_FIELDS }),
    // "Overdue" is not a stored status: the API computes it from the due date.
    status: view === "OVERDUE" ? undefined : view,
    overdue: view === "OVERDUE" ? true : undefined,
    billingMonth: isoMonth(raw("billingMonth")),
  });
};

export const adminAuditLogList = (raw: RawParams) =>
  resources.auditLogs({
    ...paging(raw, { ...AUDIT_SORT, limit: 20, sortable: ["createdAt", "action", "entityType"] }),
    action: oneOf(raw("action"), AUDIT_ACTIONS),
    entityType: oneOf(raw("entityType"), AUDIT_ENTITY_TYPES),
    from: isoDate(raw("from")),
    to: isoDate(raw("to")),
  });

export const adminQueries = {
  stats: resources.adminStats(),
  /** The whole grid: zone and substation pickers, and the feeder pickers. */
  grid: resources.feeders({ limit: 100, sortBy: "code", sortOrder: "asc" }),
  /** Everyone who can be given a job. */
  technicians: resources.users({ role: "TECHNICIAN", limit: 100, sortBy: "name", sortOrder: "asc" }),
  /** The latest hundred outages: the trend chart on the overview. */
  recentOutages: resources.outages({ limit: 100, sortBy: "createdAt", sortOrder: "desc" }),
  /** The latest hundred bills: billed against collected, per month. */
  recentBills: resources.bills({ limit: 100, sortBy: "billingMonth", sortOrder: "desc" }),
  latestAudit: resources.auditLogs({ limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
};
