"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, CircleCheck, type LucideIcon, Send, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OutageStatusBadge } from "@/components/shared/badges";
import { TextareaField } from "@/components/shared/form-fields";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuth } from "@/hooks/use-auth";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatShortDate, formatTimeRange } from "@/lib/format";
import { SCHEDULE_TYPE } from "@/lib/status";
import type { ApiResult, OutageOutcome, ReportOutageResult } from "@/types/api";
import { type ReportOutageValues, reportOutageSchema } from "./schemas";

const OUTCOME: Record<OutageOutcome, { icon: LucideIcon; title: string; iconClass: string }> = {
  EXPLAINED_BY_SCHEDULE: {
    icon: CalendarClock,
    title: "This is a planned cut",
    iconClass: "bg-info/10 text-info",
  },
  LINKED_TO_EXISTING_OUTAGE: {
    icon: Users,
    title: "We already know about this outage",
    iconClass: "bg-warning/15 text-warning",
  },
  NEW_OUTAGE_CREATED: {
    icon: CircleCheck,
    title: "Your report has been logged",
    iconClass: "bg-success/10 text-success",
  },
};

/** What became of the report, in the API's own words plus the facts behind it. */
function Outcome({ result }: { result: ApiResult<ReportOutageResult> }) {
  const { outcome, schedule, outage } = result.data;
  const { icon: Icon, title, iconClass } = OUTCOME[outcome];

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <span className={`grid size-14 place-items-center rounded-2xl ${iconClass}`}>
        <Icon className="size-7" aria-hidden />
      </span>
      <div className="flex flex-col gap-1.5">
        <DialogTitle className="text-lg">{title}</DialogTitle>
        <DialogDescription className="text-pretty">{result.message}</DialogDescription>
      </div>

      {schedule ? (
        <dl className="bg-muted/50 flex w-full flex-col gap-1 rounded-xl border p-4 text-left">
          <dt className="text-muted-foreground text-xs">{SCHEDULE_TYPE[schedule.type].label}</dt>
          <dd className="nums font-medium">
            {formatShortDate(schedule.startTime)} ·{" "}
            {formatTimeRange(schedule.startTime, schedule.endTime)}
          </dd>
          {schedule.reason ? (
            <dd className="text-muted-foreground text-sm">{schedule.reason}</dd>
          ) : null}
        </dl>
      ) : null}

      {outage ? (
        <dl className="bg-muted/50 flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left">
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs">Outage on</dt>
            <dd className="truncate font-medium">{outage.feeder.name}</dd>
            <dd className="text-muted-foreground text-sm">
              {outage.reportCount} {outage.reportCount === 1 ? "report" : "reports"} so far
            </dd>
          </div>
          <OutageStatusBadge status={outage.status} />
        </dl>
      ) : null}
    </div>
  );
}

type ReportOutageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * A customer reports that their power is out. The API decides what the report
 * means: a planned cut, one more report on a known outage, or a new outage.
 */
export function ReportOutageDialog({ open, onOpenChange }: ReportOutageDialogProps) {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<ApiResult<ReportOutageResult> | null>(null);
  const form = useForm<ReportOutageValues>({
    resolver: zodResolver(reportOutageSchema),
    defaultValues: { description: "" },
  });

  const report = useApiMutation<ReportOutageResult, ReportOutageValues>({
    mutationFn: async ({ description }) => {
      if (!photo) {
        return api.post<ReportOutageResult>("/outages", { description });
      }

      const body = new FormData();

      body.append("description", description);
      body.append("photo", photo);
      setProgress(0);

      try {
        return await api.upload<ReportOutageResult>("/outages", body, { onProgress: setProgress });
      } finally {
        setProgress(null);
      }
    },
    invalidate: [queryKeys.outages],
    // The outcome is shown in the dialog itself, which says more than a toast.
    successMessage: false,
    onSuccess: setResult,
    onError: (error) => applyFieldErrors(error.fieldErrors, form.setError, ["description"]),
  });

  const handleOpenChange = (next: boolean) => {
    if (report.isPending) {
      return;
    }

    if (!next) {
      form.reset();
      setPhoto(null);
      setResult(null);
    }

    onOpenChange(next);
  };

  const area = user?.customer?.area;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {result ? (
          <>
            <Outcome result={result} />
            <DialogFooter>
              <Button size="lg" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : user && !area ? (
          <>
            <DialogHeader>
              <DialogTitle>Add your area first</DialogTitle>
              <DialogDescription>
                A report is filed against the feeder that supplies your area, and your account is
                not linked to one yet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button asChild size="lg">
                <Link href="/dashboard/profile">
                  <UserCog data-icon="inline-start" />
                  Complete profile
                </Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => report.mutate(values))}
            className="flex flex-col gap-5"
          >
            <DialogHeader>
              <DialogTitle>Report an outage</DialogTitle>
              <DialogDescription>
                {area
                  ? `Filed against ${area.feeder.name}, the feeder that supplies ${area.name}. If a cut is planned right now, we will tell you instead.`
                  : "Tell us what happened and we will look into it."}
              </DialogDescription>
            </DialogHeader>

            <TextareaField
              control={form.control}
              name="description"
              label="What happened?"
              placeholder="e.g. The whole street lost power after a loud bang from the transformer."
              rows={4}
              maxLength={500}
              disabled={report.isPending}
            />

            <ImageUpload
              label="Photo (optional)"
              hint="A photo of the fault helps the crew. JPEG, PNG or WebP, up to 4 MB."
              file={photo}
              onChange={setPhoto}
              progress={progress}
              disabled={report.isPending}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleOpenChange(false)}
                disabled={report.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={report.isPending}>
                {report.isPending ? <Spinner /> : <Send data-icon="inline-start" />}
                {report.isPending ? "Sending…" : "Send report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
