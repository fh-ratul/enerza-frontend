import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/features/faq/data";

export function FaqAccordion({ items, idPrefix }: { items: FaqItem[]; idPrefix: string }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`${idPrefix}-${index}`}>
          <AccordionTrigger className="py-5 text-left text-base font-medium">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground max-w-3xl pb-5 text-[0.95rem] leading-relaxed">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
