import { Reveal } from "@/components/shared/reveal";
import { Container } from "./section";

// The rules the scheduler and the outage desk actually enforce: each number
// here is a constant in the API, not a marketing claim.
const rules = [
  { value: "4 h", label: "Most any feeder can be shed in one day" },
  { value: "0", label: "Critical feeders ever load-shed" },
  { value: "7 days", label: "Of history weighed to keep shedding fair" },
  { value: "10 reports", label: "Raise an outage's priority by one level" },
];

export function RuleStrip() {
  return (
    <section aria-label="How Enerza runs the grid" className="border-b">
      <Container>
        <dl className="grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
          {rules.map((rule, index) => (
            <Reveal
              key={rule.label}
              delay={index * 0.06}
              className="flex flex-col gap-1.5 px-4 py-8 first:pl-0 sm:px-8 nth-[2n+1]:max-lg:pl-0"
            >
              <dt className="text-muted-foreground order-2 text-sm leading-snug">{rule.label}</dt>
              <dd className="font-heading order-1 text-3xl font-semibold sm:text-4xl">
                {rule.value}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
