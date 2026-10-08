// Every answer below describes behaviour the system actually has.

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "schedules",
    title: "Load-shedding schedules",
    items: [
      {
        question: "How is it decided which area loses power?",
        answer:
          "When demand is higher than supply, the control room enters the shortfall in megawatts and Enerza works out a rotation. Low-priority feeders go first, then normal, then high. Within a priority, the feeder that was shed least in the past seven days goes first, so the burden moves around instead of landing on the same streets.",
      },
      {
        question: "How long can my power be off in one day?",
        answer:
          "A single load-shedding block lasts at most four hours, and no feeder is shed for more than four hours in total in one day. The scheduler also never cuts the same feeder in two consecutive slots.",
      },
      {
        question: "Are hospitals ever load-shed?",
        answer:
          "No. Feeders marked critical, which supply hospitals and emergency services, are excluded from load shedding altogether. They can only be scheduled for maintenance.",
      },
      {
        question: "How will I know about a planned cut?",
        answer:
          "As soon as a schedule is published it appears on your dashboard, and you get an email with the date, the time window and the reason. Times are always given in Dhaka time.",
      },
    ],
  },
  {
    id: "outages",
    title: "Outages and repairs",
    items: [
      {
        question: "My power is out. What should I do?",
        answer:
          "Log in and report it from the Outages page. Describe what you see and add a photo if you can. If a published schedule is running on your feeder, you are told right away when it ends and no repair job is opened. Otherwise your report opens an outage, or joins the one your neighbours already reported.",
      },
      {
        question: "Why does my report say it was linked to an existing outage?",
        answer:
          "A fault on a feeder affects everyone on it, so Enerza keeps one outage per feeder and attaches every report to it. Your report still counts: once ten customers have reported the same outage, its priority goes up a level.",
      },
      {
        question: "How do I know someone is working on it?",
        answer:
          "Open the outage to see its timeline: when it was reported, when a technician was assigned, when work started and when it was resolved, with the technician's note. You also get an email when it is resolved.",
      },
      {
        question: "Can I report a second outage while one is open?",
        answer:
          "Not until the first is closed. Each customer can have one open report at a time; it is closed automatically when the outage is resolved, and you can report again after that.",
      },
    ],
  },
  {
    id: "billing",
    title: "Bills and payments",
    items: [
      {
        question: "How is my bill calculated?",
        answer:
          "Your consumption is the new meter reading minus the previous one. Residential units are billed in slabs, each slice of units at its own slab's rate; commercial units at one flat rate. A demand charge per kilowatt of sanctioned load is added, then 5% VAT. The tariff page shows the rates and lets you estimate a bill.",
      },
      {
        question: "How can I pay?",
        answer:
          "From the Bills page, with bKash or through SSLCommerz, which accepts cards, mobile banking and internet banking. You are taken to the gateway's own page to pay and brought back when you are done.",
      },
      {
        question: "When is a bill due, and what if I miss it?",
        answer:
          "A bill is due 14 days after it is issued. After that it is shown as overdue on your dashboard. You can still pay it online in the same way.",
      },
      {
        question: "I paid, but the page said the payment failed. Was I charged?",
        answer:
          "Enerza only marks a bill paid after the gateway itself confirms the payment for the exact amount. If the confirmation could not be reached, the payment stays pending and is checked again; if money was taken for a bill that was already paid, the payment is flagged for a refund.",
      },
    ],
  },
  {
    id: "account",
    title: "Your account",
    items: [
      {
        question: "What do I need to register?",
        answer:
          "Your name, an email address, the area you live in and your meter number. The area links you to the feeder that supplies you, which is how you get the right schedule.",
      },
      {
        question: "Can I sign in with Google?",
        answer:
          "Yes. A Google sign-in creates your account without an area or meter number, so you will be asked to complete your profile before you can report outages or see a schedule.",
      },
      {
        question: "I moved. Can I change my area?",
        answer:
          "Yes, from your profile, as long as you have no open outage report. Your meter number can be changed until your first bill is issued; after that it is fixed, because bills are tied to one physical meter.",
      },
    ],
  },
];

/** The handful shown on the home page. */
export const featuredFaqs: FaqItem[] = [
  faqGroups[0].items[0],
  faqGroups[0].items[1],
  faqGroups[1].items[0],
  faqGroups[2].items[1],
];
