import type {
  AdminStats,
  AdminUser,
  AuditAction,
  AuditEntityType,
  AuditLog,
  Bill,
  BillStatus,
  CustomerSchedule,
  Feeder,
  FeederPriority,
  Me,
  Outage,
  OutagePriority,
  OutageStatus,
  Role,
  Schedule,
  ScheduleStatus,
  ScheduleType,
  UserStatus,
} from "@/types/api";
import { compactParams, type QueryParams } from "./query-string";

// Every read the app makes, described once: where it lives in the API and
// under which key its result is cached. The same description serves both
// sides: a Server Component prefetches it with the visitor's cookie, and the
// client component that takes over finds the data already in its cache.

/** A readable API resource. `T` is the type of its payload. */
export type Resource<T> = {
  queryKey: readonly unknown[];
  path: string;
  query?: QueryParams;
  /** Never set: it only carries the payload type. */
  readonly __payload?: T;
};

const resource = <T>(queryKey: readonly unknown[], path: string, query?: QueryParams): Resource<T> => ({
  queryKey,
  path,
  query,
});

export type SortOrder = "asc" | "desc";

export type ListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type FeederListParams = ListParams & {
  searchTerm?: string;
  zoneId?: string;
  substationId?: string;
  priority?: FeederPriority;
  isActive?: boolean;
};

export type UserListParams = ListParams & {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
};

export type ScheduleListParams = ListParams & {
  type?: ScheduleType;
  status?: ScheduleStatus;
  phase?: "UPCOMING" | "ONGOING" | "COMPLETED";
  feederId?: string;
  zoneId?: string;
  from?: string;
  to?: string;
};

export type OutageListParams = ListParams & {
  status?: OutageStatus;
  priority?: OutagePriority;
  feederId?: string;
  zoneId?: string;
  from?: string;
  to?: string;
};

export type BillListParams = ListParams & {
  status?: BillStatus;
  billingMonth?: string;
  customerId?: string;
  overdue?: boolean;
};

export type AuditLogParams = ListParams & {
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  actorId?: string;
  from?: string;
  to?: string;
};

/** The roots of the cache keys, for invalidating everything under one of them. */
export const queryKeys = {
  me: ["me"],
  users: ["users"],
  feeders: ["feeders"],
  schedules: ["schedules"],
  outages: ["outages"],
  bills: ["bills"],
  adminStats: ["admin", "stats"],
  auditLogs: ["admin", "audit-logs"],
} as const;

const list = <T>(root: readonly unknown[], path: string, params: QueryParams = {}) =>
  resource<T[]>([...root, "list", compactParams(params)], path, params);

export const resources = {
  me: () => resource<Me>(queryKeys.me, "/users/me"),
  users: (params?: UserListParams) => list<AdminUser>(queryKeys.users, "/users", params),
  feeders: (params?: FeederListParams) => list<Feeder>(queryKeys.feeders, "/feeders", params),
  /** Admin view: every schedule, with filters. */
  schedules: (params?: ScheduleListParams) =>
    list<Schedule>(queryKeys.schedules, "/schedules", params),
  /** Customer view: the published schedule of their own feeder. */
  mySchedules: (params?: ListParams) =>
    list<CustomerSchedule>([...queryKeys.schedules, "mine"], "/schedules", params),
  outages: (params?: OutageListParams) => list<Outage>(queryKeys.outages, "/outages", params),
  bills: (params?: BillListParams) => list<Bill>(queryKeys.bills, "/bills", params),
  adminStats: () => resource<AdminStats>(queryKeys.adminStats, "/admin/stats"),
  auditLogs: (params?: AuditLogParams) =>
    list<AuditLog>(queryKeys.auditLogs, "/admin/audit-logs", params),
};
