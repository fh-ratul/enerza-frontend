import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

// Temporary landing page: replaced by the marketing site.
export default function Home() {
  return (
    <main id="main" className="grid flex-1 place-items-center p-8">
      <div className="flex items-center gap-4">
        <Logo />
        <ThemeToggle />
      </div>
    </main>
  );
}
