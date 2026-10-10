import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleSignIn } from "@/features/auth/google-sign-in";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

function FormFallback() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">Welcome back</h1>
        <p className="text-muted-foreground">Log in to your Enerza account.</p>
      </div>

      {/* Both forms read ?redirect= from the URL, so they render behind a boundary. */}
      <Suspense fallback={<FormFallback />}>
        <LoginForm />
        <GoogleSignIn />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        New to Enerza?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
