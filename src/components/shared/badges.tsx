import { StatusBadge } from "@/components/shared/status-badge";
import {
  BILL_STATUS,
  FEEDER_PRIORITY,
  OUTAGE_PRIORITY,
  OUTAGE_STATUS,
  PAYMENT_STATUS,
  REPORT_STATUS,
  ROLE,
  SCHEDULE_PHASE,
  SCHEDULE_TYPE,
  USER_STATUS,
} from "@/lib/status";
import type {
  BillStatus,
  FeederPriority,
  OutagePriority,
  OutageStatus,
  PaymentStatus,
  ReportStatus,
  Role,
  SchedulePhase,
  ScheduleType,
  UserStatus,
} from "@/types/api";

// One small component per API enum, so pages never repeat the label and
// colour of a status, and a status reads the same wherever it appears.

const OPEN_OUTAGE: readonly OutageStatus[] = ["REPORTED", "ASSIGNED", "IN_PROGRESS"];

export function OutageStatusBadge({ status }: { status: OutageStatus }) {
  const { label, tone } = OUTAGE_STATUS[status];

  return (
    <StatusBadge tone={tone} dot pulse={OPEN_OUTAGE.includes(status)}>
      {label}
    </StatusBadge>
  );
}

export function OutagePriorityBadge({ priority }: { priority: OutagePriority }) {
  const { label, tone } = OUTAGE_PRIORITY[priority];

  return <StatusBadge tone={tone}>{label} priority</StatusBadge>;
}

export function FeederPriorityBadge({ priority }: { priority: FeederPriority }) {
  const { label, tone } = FEEDER_PRIORITY[priority];

  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

export function SchedulePhaseBadge({ phase }: { phase: SchedulePhase }) {
  const { label, tone } = SCHEDULE_PHASE[phase];

  return (
    <StatusBadge tone={tone} dot pulse={phase === "ONGOING"}>
      {label}
    </StatusBadge>
  );
}

export function ScheduleTypeBadge({ type }: { type: ScheduleType }) {
  const { label, tone } = SCHEDULE_TYPE[type];

  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

/** An unpaid bill past its due date reads "Overdue"; that state is computed by the API. */
export function BillStatusBadge({ status, isOverdue }: { status: BillStatus; isOverdue: boolean }) {
  if (isOverdue) {
    return (
      <StatusBadge tone="danger" dot>
        Overdue
      </StatusBadge>
    );
  }

  const { label, tone } = BILL_STATUS[status];

  return (
    <StatusBadge tone={tone} dot>
      {label}
    </StatusBadge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, tone } = PAYMENT_STATUS[status];

  return (
    <StatusBadge tone={tone} dot>
      {label}
    </StatusBadge>
  );
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const { label, tone } = REPORT_STATUS[status];

  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, tone } = ROLE[role];

  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { label, tone } = USER_STATUS[status];

  return (
    <StatusBadge tone={tone} dot>
      {label}
    </StatusBadge>
  );
}
