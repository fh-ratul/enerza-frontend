export const siteConfig = {
  name: "Enerza",
  tagline: "Power you can plan around",
  description:
    "Enerza tells you when the power will go out and why, tracks every outage from first report to repair, and lets you pay your electricity bill online.",
  url: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  serviceArea: "Dhaka North and Dhaka South",
} as const;

export const marketingNav = [
  { href: "/services", label: "Services" },
  { href: "/coverage", label: "Coverage" },
  { href: "/tariff", label: "Tariff" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
