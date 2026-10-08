// Types for the Enerza API, mirroring what each endpoint actually returns.
// Money and loads arrive as decimal strings ("1845.90", "8.50"); dates as ISO strings.

export type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";
export type AuthProvider = "CREDENTIAL" | "GOOGLE";
export type FeederPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
export type ConnectionType = "RESIDENTIAL" | "COMMERCIAL";
export type ScheduleType = "LOAD_SHEDDING" | "MAINTENANCE";
export type ScheduleStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type SchedulePhase = "DRAFT" | "CANCELLED" | "UPCOMING" | "ONGOING" | "COMPLETED";
export type OutageStatus = "REPORTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
export type OutagePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ReportStatus = "OPEN" | "EXPLAINED" | "RESOLVED" | "REJECTED";
export type BillStatus = "UNPAID" | "PAID" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";
export type PaymentGateway = "BKASH" | "SSLCOMMERZ";
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "SOFT_DELETE"
  | "STATUS_CHANGE"
  | "ROLE_CHANGE"
  | "GENERATE"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED";
export type AuditEntityType = "User" | "Feeder" | "Schedule" | "Outage" | "Bill" | "Payment";

// ── Envelope ────────────────────────────────────────────────────────────────

export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiFieldError = { path: string; message: string };

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiFailure = {
  success: false;
  statusCode: number;
  message: string;
  errors: ApiFieldError[];
};

/** What the data layer hands to the UI: the payload plus the envelope's extras. */
export type ApiResult<T> = { data: T; meta?: ApiMeta; message: string };
export type Paginated<T> = { data: T[]; meta: ApiMeta; message: string };

// ── Grid ────────────────────────────────────────────────────────────────────

export type Zone = { id: string; name: string; code: string };
export type Substation = { id: string; name: string; code: string; zone: Zone };
export type Area = { id: string; name: string; code: string };

export type Feeder = {
  id: string;
  name: string;
  code: string;
  loadMW: string;
  priority: FeederPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  substation: Substation;
  areas: Area[];
};

type FeederRef = { id: string; name: string; code: string };
type FeederWithGrid = FeederRef & {
  priority: FeederPriority;
  substation: { id: string; name: string; zone: Zone };
};

// ── Users ───────────────────────────────────────────────────────────────────

export type SessionUser = { id: string; name: string; email: string; role: Role };

export type CustomerProfile = {
  id: string;
  contactNumber: string | null;
  address: string | null;
  meterNumber: string | null;
  connectionType: ConnectionType;
  sanctionedLoadKW: string;
  lastReading: number;
  area:
    | (Area & {
        feeder: FeederRef & { priority: FeederPriority; substation: Substation };
      })
    | null;
  isProfileComplete: boolean;
};

export type TechnicianProfile = {
  id: string;
  contactNumber: string | null;
  isAvailable: boolean;
  activeJobCount: number;
  maxActiveJobs: number;
  lastAssignedAt: string | null;
  zone: Zone;
};

export type Me = {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  role: Role;
  status: UserStatus;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerProfile | null;
  technician?: TechnicianProfile | null;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  role: Role;
  status: UserStatus;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    meterNumber: string | null;
    contactNumber: string | null;
    connectionType: ConnectionType;
    area: Area | null;
  } | null;
  technician: Omit<TechnicianProfile, "lastAssignedAt"> | null;
};

export type AuthTokens = { accessToken: string; refreshToken: string; user: SessionUser };

// ── Schedules ───────────────────────────────────────────────────────────────

export type Schedule = {
  id: string;
  type: ScheduleType;
  status: ScheduleStatus;
  phase: SchedulePhase;
  startTime: string;
  endTime: string;
  reason: string | null;
  batchId: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  feeder: FeederWithGrid;
  createdBy: { id: string; name: string } | null;
};

/** What a customer sees: only the published schedule of their own feeder. */
export type CustomerSchedule = {
  id: string;
  type: ScheduleType;
  status: ScheduleStatus;
  phase: SchedulePhase;
  startTime: string;
  endTime: string;
  reason: string | null;
  feeder: FeederRef;
};

export type GeneratorSlot = {
  window: string;
  startTime: string;
  endTime: string;
  shedMW: number;
  unmetMW: number;
  feeders: {
    id: string;
    code: string;
    name: string;
    priority: FeederPriority;
    loadMW: number;
    shedMinutesLast7Days: number;
  }[];
};

export type GeneratorPlan = {
  dryRun: boolean;
  batchId: string | null;
  schedulesCreated: number;
  scope: { type: "ZONE" | "SUBSTATION"; id: string; name: string; code: string };
  date: string;
  slotMinutes: number;
  deficitMW: number;
  slots: GeneratorSlot[];
  summary: {
    totalSlots: number;
    fullyCoveredSlots: number;
    totalUnmetMW: number;
    feeders: {
      code: string;
      priority: FeederPriority;
      loadMW: number;
      shedMinutesLast7Days: number;
      plannedMinutes: number;
    }[];
  };
};

// ── Outages ─────────────────────────────────────────────────────────────────

export type OutageTimelineEntry = {
  id: string;
  fromStatus: OutageStatus | null;
  toStatus: OutageStatus;
  note: string | null;
  createdAt: string;
  /** Staff only: customers do not see who made a change. */
  changedBy?: { id: string; name: string; role: Role } | null;
};

export type OutageReport = {
  id: string;
  status: ReportStatus;
  description: string;
  photoUrl: string | null;
  createdAt: string;
};

export type Outage = {
  id: string;
  status: OutageStatus;
  priority: OutagePriority;
  description: string | null;
  reportCount: number;
  startedAt: string;
  assignedAt: string | null;
  resolvedAt: string | null;
  durationMinutes: number | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  feeder: FeederWithGrid;
  technician: { id: string; contactNumber: string | null; user: { id: string; name: string } } | null;
  timeline: OutageTimelineEntry[];
  /** Customers only: their own reports on this outage. */
  reports?: OutageReport[];
};

export type OutageOutcome =
  | "EXPLAINED_BY_SCHEDULE"
  | "LINKED_TO_EXISTING_OUTAGE"
  | "NEW_OUTAGE_CREATED";

export type ReportOutageResult = {
  outcome: OutageOutcome;
  report?: OutageReport;
  outage?: Omit<Outage, "timeline" | "reports">;
  schedule?: {
    id: string;
    type: ScheduleType;
    startTime: string;
    endTime: string;
    reason: string | null;
  };
};

// ── Billing ─────────────────────────────────────────────────────────────────

export type Payment = {
  id: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  amount: string;
  currency: string;
  invoiceNumber: string;
  bkashTrxId: string | null;
  gatewayTrxId: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type Bill = {
  id: string;
  billNumber: string;
  billingMonth: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  energyCharge: string;
  demandCharge: string;
  vatAmount: string;
  totalAmount: string;
  dueDate: string;
  status: BillStatus;
  isOverdue: boolean;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    meterNumber: string | null;
    connectionType: ConnectionType;
    user: { id: string; name: string; email: string };
  };
  payments?: Payment[];
};

export type InitiatedPayment = {
  paymentId: string;
  paymentUrl: string;
  gateway: PaymentGateway;
  bkashPaymentId?: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  bill: { id: string; billNumber: string; billingMonth: string };
};

/** What both gateway callbacks report back. */
export type PaymentResult = Omit<Payment, "bkashTrxId"> & {
  bkashPaymentId: string | null;
  bkashTrxId: string | null;
  requiresRefund: boolean;
  updatedAt: string;
  bill: {
    id: string;
    billNumber: string;
    billingMonth: string;
    status: BillStatus;
    paidAt: string | null;
  };
};

// ── Admin ───────────────────────────────────────────────────────────────────

export type ReliabilityIndices = {
  customers: number;
  outages: number;
  saifi: number;
  saidiMinutes: number;
};

export type AdminStats = {
  generatedAt: string;
  windowDays: number;
  users: { total: number; byRole: Record<Role, number>; blocked: number };
  outages: {
    open: number;
    byStatus: Record<"REPORTED" | "ASSIGNED" | "IN_PROGRESS", number>;
    byPriority: Record<OutagePriority, number>;
    resolvedInWindow: number;
    mttrMinutes: number | null;
  };
  loadShedding: {
    feederCount: number;
    totalLoadMW: string;
    feeders: {
      scheduleId: string;
      startTime: string;
      endTime: string;
      feeder: FeederRef & { loadMW: string };
    }[];
  };
  reliability: {
    overall: ReliabilityIndices;
    byZone: (ReliabilityIndices & { zone: Zone })[];
  };
  billing: {
    month: string;
    revenueThisMonth: string;
    paymentsThisMonth: number;
    unpaidTotal: string;
    unpaidCount: number;
    overdueTotal: string;
    overdueCount: number;
  };
};

export type AuditLog = {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  actorRole: Role | null;
  ipAddress: string | null;
  createdAt: string;
  /** Null for system actions such as a payment gateway callback. */
  actor: { id: string; name: string; email: string } | null;
};
