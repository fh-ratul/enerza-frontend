import { ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { RegisterWizard } from "@/features/auth/register-wizard";
import { toAreaOptions } from "@/features/grid/area-options";
import { getGridSnapshot } from "@/features/grid/public-data";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  // The area list is public and cached, so this page is still prerendered.
  const grid = await getGridSnapshot();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold sm:text-4xl">Create your account</h1>
        <p className="text-muted-foreground">
          Three short steps. You will need the meter number of your connection.
        </p>
      </div>

      {grid ? (
        <RegisterWizard areas={toAreaOptions(grid.feeders)} />
      ) : (
        <EmptyState
          icon={ServerCrash}
          title="Registration is unavailable right now"
          description="The list of service areas could not be loaded, and an account needs one. Please try again in a moment."
          action={
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Try again</Link>
            </Button>
          }
        />
      )}

      <p className="text-muted-foreground text-center text-sm">
        Already registered?{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
