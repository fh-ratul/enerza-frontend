"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField, TextareaField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { applyFieldErrors } from "@/lib/action-result";
import { sendContactMessage } from "./actions";
import { CONTACT_TOPICS, type ContactValues, contactSchema } from "./schema";

const FIELD_NAMES = ["name", "email", "topic", "message"] as const;

export function ContactForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: undefined, message: "", website: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await sendContactMessage(values);

    if (!result.ok) {
      if (!applyFieldErrors(result.fieldErrors, form.setError, FIELD_NAMES)) {
        toast.error(result.message);
      }

      return;
    }

    setSentTo(values.email);
    form.reset();
  });

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 py-6">
        <span className="bg-success/12 text-success grid size-12 place-items-center rounded-2xl">
          <CircleCheck className="size-6" aria-hidden />
        </span>
        <h3 className="text-xl font-semibold">Message sent</h3>
        <p className="text-muted-foreground">
          Thank you. We will reply to <span className="text-foreground font-medium">{sentTo}</span>.
        </p>
        <Button variant="outline" size="lg" onClick={() => setSentTo(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="name"
            label="Your name"
            autoComplete="name"
            placeholder="Nusrat Jahan"
          />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <SelectField
          control={form.control}
          name="topic"
          label="What is it about?"
          placeholder="Choose a topic"
          options={CONTACT_TOPICS.map((topic) => ({ ...topic }))}
        />
        <TextareaField
          control={form.control}
          name="message"
          label="Message"
          rows={6}
          maxLength={1500}
          placeholder="Tell us what happened, and include your area or bill number if it helps."
        />
        {/* Honeypot: invisible to people and skipped by keyboard and screen readers. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
          </label>
        </div>
        <Button type="submit" size="xl" disabled={form.formState.isSubmitting} className="self-start">
          {form.formState.isSubmitting ? <Spinner /> : <Send data-icon="inline-start" />}
          {form.formState.isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </FieldGroup>
    </form>
  );
}
