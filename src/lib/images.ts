import analyticsDashboard from "../../public/images/analytics-dashboard.jpg";
import breakerPanel from "../../public/images/breaker-panel.jpg";
import candleDark from "../../public/images/candle-dark.jpg";
import cardPayment from "../../public/images/card-payment.jpg";
import dhakaNeon from "../../public/images/dhaka-neon.jpg";
import dhakaNightRoad from "../../public/images/dhaka-night-road.jpg";
import dhakaNightStreet from "../../public/images/dhaka-night-street.jpg";
import dhakaSkylineDay from "../../public/images/dhaka-skyline-day.jpg";
import dhanmondiLakeNight from "../../public/images/dhanmondi-lake-night.jpg";
import earthNightLights from "../../public/images/earth-night-lights.jpg";
import electricianPanel from "../../public/images/electrician-panel.jpg";
import engineerPlans from "../../public/images/engineer-plans.jpg";
import heroTowersSunset from "../../public/images/hero-towers-sunset.jpg";
import linemanBucket from "../../public/images/lineman-bucket.jpg";
import linemenPole from "../../public/images/linemen-pole.jpg";
import substationDusk from "../../public/images/substation-dusk.jpg";
import towersGreen from "../../public/images/towers-green.jpg";

// Static imports give next/image the intrinsic size and a blur placeholder,
// so no image shifts the layout or pops in from nothing. Each one carries its
// own alt text; purely decorative uses pass alt="" at the call site.

export const images = {
  heroTowersSunset: {
    src: heroTowersSunset,
    alt: "High-voltage transmission towers against an orange sunset",
  },
  towersGreen: { src: towersGreen, alt: "Transmission towers carrying power lines at dusk" },
  earthNightLights: { src: earthNightLights, alt: "City lights seen from orbit at night" },
  dhakaNightStreet: {
    src: dhakaNightStreet,
    alt: "A Dhaka street at night, lit by street lamps and passing traffic",
  },
  dhakaNightRoad: { src: dhakaNightRoad, alt: "Evening traffic on a lit road in Dhaka" },
  dhakaNeon: { src: dhakaNeon, alt: "Neon shop signs on a Dhaka street at night" },
  dhanmondiLakeNight: {
    src: dhanmondiLakeNight,
    alt: "Lit apartment buildings reflected in Dhanmondi Lake at night",
  },
  dhakaSkylineDay: { src: dhakaSkylineDay, alt: "The Dhaka skyline under a cloudy sky" },
  linemenPole: {
    src: linemenPole,
    alt: "Two linemen in safety harnesses repairing cables on a utility pole",
  },
  linemanBucket: {
    src: linemanBucket,
    alt: "A lineman in a bucket truck working on a roadside power line",
  },
  substationDusk: { src: substationDusk, alt: "An electrical substation at dusk" },
  electricianPanel: {
    src: electricianPanel,
    alt: "A technician in a hard hat inspecting an electrical panel",
  },
  breakerPanel: { src: breakerPanel, alt: "Rows of circuit breakers in a distribution board" },
  engineerPlans: {
    src: engineerPlans,
    alt: "An engineer marking up technical drawings at a workbench",
  },
  analyticsDashboard: {
    src: analyticsDashboard,
    alt: "A monitor showing analytics charts on a dark dashboard",
  },
  cardPayment: { src: cardPayment, alt: "A person paying online with a card and a laptop" },
  candleDark: { src: candleDark, alt: "A single candle burning in a dark room" },
} as const;
