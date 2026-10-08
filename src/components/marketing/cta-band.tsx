import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/images";
import { Container } from "./section";

type CtaBandProps = {
  title?: string;
  description?: string;
};

export function CtaBand({
  title = "Stop guessing when the power comes back.",
  description = "Create an account with your meter number and see your feeder's schedule in under two minutes.",
}: CtaBandProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="bg-ink text-ink-foreground relative isolate overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20">
          <Image
            src={images.dhakaNightStreet.src}
            alt=""
            fill
            placeholder="blur"
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="-z-10 object-cover opacity-55"
          />
          <div
            aria-hidden
            className="from-ink via-ink/80 absolute inset-0 -z-10 bg-linear-to-r to-transparent"
          />
          <div className="flex max-w-xl flex-col items-start gap-6">
            <h2 className="text-3xl leading-[1.08] font-semibold sm:text-5xl">{title}</h2>
            <p className="text-base leading-relaxed text-white/75 sm:text-lg">{description}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="xl">
                <Link href="/register">
                  Create your account
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="glass">
                <Link href="/login">Try a demo login</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
