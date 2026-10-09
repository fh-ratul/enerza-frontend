"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HardHat, LockKeyhole, LockKeyholeOpen, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RoleBadge, UserStatusBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { adminUserList, ROLES, USER_SORT, USER_STATUSES } from "@/features/admin/queries";
import { useGrid } from "@/features/admin/use-grid";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuth } from "@/hooks/use-auth";
import { useResource } from "@/hooks/use-resource";
import { useRetained } from "@/hooks/use-retained";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { type ApiError, getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/resources";
import { formatDate } from "@/lib/format";
import { ROLE, USER_STATUS } from "@/lib/status";
import type { AdminUser, ApiResult, UserStatus } from "@/types/api";

const FILTER_KEYS = ["searchTerm", "role", "status"];

const roleOptions = ROLES.map((value) => ({ value, label: ROLE[value].label }));
const statusOptions = USER_STATUSES.map((value) => ({ value, label: USER_STATUS[value].label }));

type Snapshot = [readonly unknown[], ApiResult<AdminUser[]> | undefined][];

/**
 * Blocks or unblocks an account. The badge changes at once and goes back if
 * the API refuses (an admin cannot block themselves or another admin).
 */
const useUserStatus = (onSettled: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResult<AdminUser>,
    ApiError,
    { id: string; status: UserStatus },
    { previous: Snapshot }
  >({
    mutationFn: ({ id, status }) => api.patch<AdminUser>(`/users/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });

      const previous = queryClient.getQueriesData<ApiResult<AdminUser[]>>({
        queryKey: queryKeys.users,
      });

      queryClient.setQueriesData<ApiResult<AdminUser[]>>({ queryKey: queryKeys.users }, (cached) =>
        cached && Array.isArray(cached.data)
          ? { ...cached, data: cached.data.map((user) => (user.id === id ? { ...user, status } : user)) }
          : cached,
      );

      return { previous };
    },
    onError: (error, _change, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, data);
      }

      toast.error(getErrorMessage(error));
    },
    onSuccess: (result) => toast.success(result.message),
    onSettled: () => {
      onSettled();

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
      ]);
    },
  });
};

type PromoteDialogProps = {
  user: AdminUser | null;
  zones: { value: string; label: string }[];
  onClose: () => void;
};

function PromoteDialog({ user: selected, zones, onClose }: PromoteDialogProps) {
  const user = useRetained(selected);
  const [zoneId, setZoneId] = useState("");

  const promote = useApiMutation<AdminUser, { id: string; zoneId: string }>({
    mutationFn: ({ id, zoneId: zone }) =>
      api.patch<AdminUser>(`/users/${id}`, { role: "TECHNICIAN", zoneId: zone }),
    invalidate: [queryKeys.users, queryKeys.adminStats],
    onSuccess: () => {
      setZoneId("");
      onClose();
    },
  });

  return (
    <Dialog
      open={selected !== null}
      onOpenChange={(open) => (!open && !promote.isPending ? onClose() : undefined)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make {user?.name ?? "this user"} a technician</DialogTitle>
          <DialogDescription>
            They stop being a customer and start receiving outages in the zone you choose. This
            cannot be undone here, and is refused while they have an unpaid bill.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <label htmlFor="promote-zone" className="text-sm font-medium">
            Zone they will work in
          </label>
          <Select value={zoneId} onValueChange={setZoneId}>
            <SelectTrigger id="promote-zone" className="w-full">
              <SelectValue placeholder="Choose a zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" size="lg" onClick={onClose} disabled={promote.isPending}>
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={!zoneId || promote.isPending}
            onClick={() => (user ? promote.mutate({ id: user.id, zoneId }) : undefined)}
          >
            {promote.isPending ? <Spinner /> : <HardHat data-icon="inline-start" />}
            Make technician
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Every account: find one, block or unblock it, or promote a customer to technician. */
export function UserTable() {
  const { get } = useUrlState();
  const { user: me } = useAuth();
  const query = useResource(adminUserList(get), { keepPrevious: true });
  const grid = useGrid();
  const [toggling, setToggling] = useState<AdminUser | null>(null);
  const [promoting, setPromoting] = useState<AdminUser | null>(null);
  const shownToggling = useRetained(toggling);
  const status = useUserStatus(() => setToggling(null));
  const hasFilter = FILTER_KEYS.some((key) => get(key));
  const isBlocking = shownToggling?.status === "ACTIVE";

  const columns: Column<AdminUser>[] = [
    {
      id: "name",
      header: "User",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} photo={user.profilePhoto} size={36} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortable: true,
      cell: (user) => <RoleBadge role={user.role} />,
    },
    {
      id: "detail",
      header: "Meter / zone",
      hideBelow: "lg",
      cell: (user) =>
        user.customer ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs">{user.customer.meterNumber ?? "No meter"}</span>
            <span className="text-muted-foreground text-xs">
              {user.customer.area?.name ?? "No area"}
            </span>
          </div>
        ) : user.technician ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm">{user.technician.zone.name}</span>
            <span className="text-muted-foreground nums text-xs">
              {user.technician.isAvailable ? "On duty" : "Off duty"} ·{" "}
              {user.technician.activeJobCount}/{user.technician.maxActiveJobs} jobs
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "createdAt",
      header: "Joined",
      sortable: true,
      hideBelow: "md",
      cell: (user) => <span className="nums">{formatDate(user.createdAt)}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (user) =>
        // Admin accounts, your own included, are not managed from here.
        user.role === "ADMIN" || user.id === me?.id ? null : (
          <div className="flex justify-end gap-1">
            {user.role === "CUSTOMER" && user.status === "ACTIVE" ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPromoting(user)}
                aria-label={`Make ${user.name} a technician`}
                title="Make technician"
              >
                <HardHat />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setToggling(user)}
              aria-label={`${user.status === "ACTIVE" ? "Block" : "Unblock"} ${user.name}`}
              title={user.status === "ACTIVE" ? "Block" : "Unblock"}
            >
              {user.status === "ACTIVE" ? <LockKeyhole /> : <LockKeyholeOpen />}
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Customers, technicians and admins. Block an account to sign it out everywhere, or turn a customer into a technician."
      />

      <div
        role="search"
        aria-label="Filter users"
        className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center"
      >
        <SearchInput placeholder="Search a name, email or meter…" />
        <FilterSelect paramKey="role" label="Role" allLabel="Any role" options={roleOptions} />
        <FilterSelect paramKey="status" label="Status" allLabel="Any status" options={statusOptions} />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      <DataTable
        caption="Users"
        columns={columns}
        rows={query.data?.data}
        getRowId={(user) => user.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={USER_SORT}
        empty={{
          icon: Users,
          title: hasFilter ? "No users match these filters" : "No users yet",
          description: hasFilter
            ? "Try a different search, or clear the filters."
            : "Accounts appear here as people register.",
        }}
      />

      <ConfirmDialog
        open={toggling !== null}
        onOpenChange={(open) => (!open && !status.isPending ? setToggling(null) : undefined)}
        title={`${isBlocking ? "Block" : "Unblock"} ${shownToggling?.name ?? "this user"}?`}
        description={
          isBlocking
            ? "They are signed out and cannot log in again until the account is unblocked. Nothing of theirs is deleted."
            : "They will be able to log in again straight away."
        }
        confirmLabel={isBlocking ? "Block account" : "Unblock account"}
        destructive={isBlocking}
        isPending={status.isPending}
        onConfirm={() =>
          toggling
            ? status.mutate({
                id: toggling.id,
                status: toggling.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
              })
            : undefined
        }
      />

      <PromoteDialog user={promoting} zones={grid.zoneOptions} onClose={() => setPromoting(null)} />
    </>
  );
}
