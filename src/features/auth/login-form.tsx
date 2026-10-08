"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { PasswordField } from "@/components/shared/password-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { applyFieldErrors } from "@/lib/action-result";
import { loginAction } from "./actions";
import { type LoginValues, loginSchema } from "./schemas";

export function LoginForm() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    // The transition stays pending until the redirect has finished, so the
    // button does not flash back to "Log in" while the dashboard loads.
    startTransition(async () => {
      // Nothing cached for a previous account may survive into this one.
      queryClient.clear();

      const result = await loginAction(values, searchParams.get("redirect") ?? undefined);

      // A successful login redirects and never gets here.
      if (result && !result.ok) {
        if (!applyFieldErrors(result.fieldErrors, form.setError, ["email", "password"])) {
          setFormError(result.message);
        }
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {searchParams.get("expired") && !formError ? (
          <Alert>
            <CircleAlert aria-hidden />
            <AlertTitle>Your session has ended</AlertTitle>
            <AlertDescription>Log in again to pick up where you left off.</AlertDescription>
          </Alert>
        ) : null}

        {formError ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden />
            <AlertTitle>Could not log in</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <PasswordField
          control={form.control}
          name="password"
          label="Password"
          autoComplete="current-password"
        />
        <Button type="submit" size="xl" disabled={isPending} className="w-full">
          {isPending ? <Spinner /> : <LogIn data-icon="inline-start" />}
          {isPending ? "Logging in…" : "Log in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
