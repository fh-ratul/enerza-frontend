"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { TextareaField } from "@/components/shared/form-fields";
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
import { type StatusNoteValues, statusNoteSchema } from "./schemas";

type StatusNoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  noteLabel: string;
  placeholder: string;
  confirmLabel: string;
  destructive?: boolean;
  isPending: boolean;
  onConfirm: (note: string) => void;
};

/** Resolving and cancelling an outage both need a note: this asks for it. */
export function StatusNoteDialog({
  open,
  onOpenChange,
  title,
  description,
  noteLabel,
  placeholder,
  confirmLabel,
  destructive = false,
  isPending,
  onConfirm,
}: StatusNoteDialogProps) {
  const form = useForm<StatusNoteValues>({
    resolver: zodResolver(statusNoteSchema),
    defaultValues: { note: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (isPending) {
      return;
    }

    if (!next) {
      form.reset();
    }

    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form
          noValidate
          onSubmit={form.handleSubmit(({ note }) => onConfirm(note))}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <TextareaField
            control={form.control}
            name="note"
            label={noteLabel}
            placeholder={placeholder}
            rows={4}
            maxLength={500}
            disabled={isPending}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              variant={destructive ? "destructive" : "default"}
              disabled={isPending}
            >
              {isPending ? <Spinner /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
