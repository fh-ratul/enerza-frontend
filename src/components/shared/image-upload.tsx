"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ALLOWED_PHOTO_TYPES, validatePhoto } from "@/lib/uploads";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** 0–100 while the file is being sent; null otherwise. */
  progress?: number | null;
  disabled?: boolean;
  className?: string;
};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Picks one image, by click or drag and drop, checks its type and size before
 * anything is sent, previews it, and shows upload progress.
 */
export function ImageUpload({
  label,
  hint = "JPEG, PNG or WebP, up to 4 MB",
  file,
  onChange,
  progress = null,
  disabled = false,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setDragging] = useState(false);

  // An object URL shows the chosen file without uploading it; it is released
  // when the file changes or the component goes away.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const choose = (candidate: File | undefined) => {
    if (!candidate) {
      return;
    }

    const problem = validatePhoto(candidate);

    setError(problem);
    onChange(problem ? null : candidate);
  };

  const clear = () => {
    setError(null);
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isUploading = progress !== null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_PHOTO_TYPES.join(",")}
        className="sr-only"
        disabled={disabled || isUploading}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        onChange={(event) => choose(event.target.files?.[0])}
      />

      {file && previewUrl ? (
        <div className="bg-muted/40 flex items-center gap-4 rounded-xl border p-3">
          <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
            {/* A local preview: there is nothing for the image optimiser to fetch. */}
            <Image src={previewUrl} alt="Preview of the chosen image" fill unoptimized className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="truncate text-sm font-medium">{file.name}</p>
            {isUploading ? (
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-1.5 flex-1" aria-label="Upload progress" />
                <span className="text-muted-foreground nums text-xs">{progress}%</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">{formatSize(file.size)}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            disabled={disabled || isUploading}
            aria-label="Remove the image"
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            choose(event.dataTransfer.files[0]);
          }}
          className={cn(
            "text-muted-foreground hover:border-foreground/30 hover:bg-muted/40 focus-visible:ring-ring/50 flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors outline-none focus-visible:ring-3 disabled:opacity-50",
            isDragging && "border-brand bg-brand/5",
            error && "border-destructive/60",
          )}
        >
          <ImagePlus className="size-6" aria-hidden />
          <span>
            <span className="text-foreground font-medium">Choose an image</span> or drop it here
          </span>
          <span className="text-xs">{hint}</span>
        </button>
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
