import { Rocket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoLogin } from "@/features/auth/demo-login";
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

function Divider({ children }: { children: string }) {
  return (
    <div className="text-muted-foreground flex items-center gap-4 text-xs font-medium tracking-wider uppercase">
      <span aria-hidden className="bg-border h-px flex-1" />
      {children}
      <span aria-hidden className="bg-border h-px flex-1" />
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

      <Divider>or</Divider>

      <section aria-labelledby="demo-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="demo-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Rocket className="text-brand size-5" aria-hidden />
            Quick demo login
          </h2>
          <p className="text-muted-foreground text-sm">
            Explore Enerza as any of its three roles. No password needed.
          </p>
        </div>
        <DemoLogin />
      </section>

      <p className="text-muted-foreground text-center text-sm">
        New to Enerza?{" "}
        <Link href="/register" className="text-brand font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
