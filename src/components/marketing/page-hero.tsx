import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Container } from "./section";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  image: { src: StaticImageData; alt: string };
  /** Where the photo's subject sits, e.g. "object-[50%_30%]". */
  imageClassName?: string;
  children?: ReactNode;
};

/** The dark photo band at the top of every public page except the home page. */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageClassName = "object-center",
  children,
}: PageHeroProps) {
  return (
    <section className="bg-ink text-ink-foreground relative isolate overflow-hidden">
      <Image
        src={image.src}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className={`-z-10 object-cover opacity-70 ${imageClassName}`}
      />
      <div
        aria-hidden
        className="from-ink via-ink/75 absolute inset-0 -z-10 bg-linear-to-r to-transparent"
      />
      <div
        aria-hidden
        className="from-ink absolute inset-0 -z-10 bg-linear-to-t via-transparent to-transparent"
      />
      <Container className="animate-in fade-in slide-in-from-bottom-3 flex flex-col items-start gap-5 py-16 duration-700 sm:py-20 lg:py-24">
        <p className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.18em] text-white/70 uppercase">
          <span aria-hidden className="bg-primary size-1.5 rounded-full" />
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-white/75 sm:text-lg">
          {description}
        </p>
        {children}
      </Container>
    </section>
  );
}
