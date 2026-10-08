import type {
  AuditAction,
  BillStatus,
  ConnectionType,
  FeederPriority,
  OutagePriority,
  OutageStatus,
  PaymentGateway,
  PaymentStatus,
  ReportStatus,
  Role,
  SchedulePhase,
  ScheduleType,
  UserStatus,
} from "@/types/api";

// How every status, priority and role in the API is worded and coloured in
// the interface. One table per enum, so a badge looks the same on every page.

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand" | "volt";

type Presentation = { label: string; tone: Tone };

export const ROLE: Record<Role, Presentation> = {
  CUSTOMER: { label: "Customer", tone: "info" },
  TECHNICIAN: { label: "Technician", tone: "volt" },
  ADMIN: { label: "Admin", tone: "brand" },
};

export const USER_STATUS: Record<UserStatus, Presentation> = {
  ACTIVE: { label: "Active", tone: "success" },
  BLOCKED: { label: "Blocked", tone: "danger" },
};

export const FEEDER_PRIORITY: Record<FeederPriority, Presentation & { description: string }> = {
  CRITICAL: {
    label: "Critical",
    tone: "danger",
    description: "Hospitals and emergency services. Never load-shed.",
  },
  HIGH: {
    label: "High",
    tone: "warning",
    description: "Commercial and industrial load. Shed last.",
  },
  NORMAL: {
    label: "Normal",
    tone: "info",
    description: "Residential areas. Shed in fair rotation.",
  },
  LOW: {
    label: "Low",
    tone: "neutral",
    description: "Non-essential load. Shed first.",
  },
};

export const CONNECTION_TYPE: Record<ConnectionType, Presentation> = {
  RESIDENTIAL: { label: "Residential", tone: "info" },
  COMMERCIAL: { label: "Commercial", tone: "volt" },
};

export const SCHEDULE_TYPE: Record<ScheduleType, Presentation> = {
  LOAD_SHEDDING: { label: "Load shedding", tone: "warning" },
  MAINTENANCE: { label: "Maintenance", tone: "info" },
};

export const SCHEDULE_PHASE: Record<SchedulePhase, Presentation> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  UPCOMING: { label: "Upcoming", tone: "info" },
  ONGOING: { label: "Ongoing", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export const OUTAGE_STATUS: Record<OutageStatus, Presentation> = {
  REPORTED: { label: "Reported", tone: "warning" },
  ASSIGNED: { label: "Assigned", tone: "info" },
  IN_PROGRESS: { label: "In progress", tone: "brand" },
  RESOLVED: { label: "Resolved", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const OUTAGE_PRIORITY: Record<OutagePriority, Presentation> = {
  LOW: { label: "Low", tone: "neutral" },
  MEDIUM: { label: "Medium", tone: "info" },
  HIGH: { label: "High", tone: "warning" },
  URGENT: { label: "Urgent", tone: "danger" },
};

export const REPORT_STATUS: Record<ReportStatus, Presentation> = {
  OPEN: { label: "Open", tone: "warning" },
  EXPLAINED: { label: "Explained by schedule", tone: "info" },
  RESOLVED: { label: "Resolved", tone: "success" },
  REJECTED: { label: "Closed, no fault found", tone: "neutral" },
};

export const BILL_STATUS: Record<BillStatus, Presentation> = {
  UNPAID: { label: "Unpaid", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, Presentation> = {
  PENDING: { label: "Pending", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  EXPIRED: { label: "Expired", tone: "neutral" },
};

export const GATEWAY: Record<PaymentGateway, { label: string; description: string }> = {
  BKASH: { label: "bKash", description: "Pay from your bKash wallet" },
  SSLCOMMERZ: {
    label: "SSLCommerz",
    description: "Cards, mobile banking and internet banking",
  },
};

export const AUDIT_ACTION: Record<AuditAction, Presentation> = {
  CREATE: { label: "Created", tone: "success" },
  UPDATE: { label: "Updated", tone: "info" },
  SOFT_DELETE: { label: "Deleted", tone: "danger" },
  STATUS_CHANGE: { label: "Status changed", tone: "brand" },
  ROLE_CHANGE: { label: "Role changed", tone: "volt" },
  GENERATE: { label: "Generated", tone: "info" },
  PAYMENT_COMPLETED: { label: "Payment completed", tone: "success" },
  PAYMENT_FAILED: { label: "Payment failed", tone: "danger" },
};
