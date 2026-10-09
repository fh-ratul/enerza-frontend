"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { RoleBadge } from "@/components/shared/badges";
import { ImageUpload } from "@/components/shared/image-upload";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatDate } from "@/lib/format";
import type { Me } from "@/types/api";

const SIGN_IN_METHOD = {
  CREDENTIAL: "Email and password",
  GOOGLE: "Google account",
} as const;

/** Who the account belongs to, with the profile photo and a way to replace it. */
export function ProfileIdentity({ user }: { user: Me }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const upload = useApiMutation<Me, File>({
    mutationFn: async (file) => {
      const body = new FormData();

      body.append("profilePhoto", file);
      setProgress(0);

      try {
        return await api.upload<Me>("/users/me", body, { method: "PATCH", onProgress: setProgress });
      } finally {
        setProgress(null);
      }
    },
    invalidate: [queryKeys.me],
    successMessage: "Your profile photo has been updated",
    onSuccess: () => setPhoto(null),
  });

  return (
    <section
      aria-label="Your account"
      className="bg-card flex h-fit flex-col gap-6 rounded-2xl border p-6"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <UserAvatar name={user.name} photo={user.profilePhoto} size={96} />
        <div className="flex min-w-0 flex-col items-center gap-1.5">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-muted-foreground max-w-full truncate text-sm">{user.email}</p>
          <RoleBadge role={user.role} />
        </div>
      </div>

      <dl className="flex flex-col gap-3 border-t pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Member since</dt>
          <dd className="nums">{formatDate(user.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Signs in with</dt>
          <dd>{SIGN_IN_METHOD[user.authProvider]}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 border-t pt-5">
        <ImageUpload
          label={user.profilePhoto ? "Replace your photo" : "Add a photo"}
          file={photo}
          onChange={setPhoto}
          progress={progress}
          disabled={upload.isPending}
        />
        {photo ? (
          <Button size="lg" onClick={() => upload.mutate(photo)} disabled={upload.isPending}>
            {upload.isPending ? <Spinner /> : <Upload data-icon="inline-start" />}
            {upload.isPending ? "Uploading…" : "Save photo"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
