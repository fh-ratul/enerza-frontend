import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b111b";
const VOLT = "#fcc419";

/** The card shown when a link to Enerza is shared. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `radial-gradient(900px 500px at 85% 10%, #1b2a44 0%, ${INK} 60%)`,
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: VOLT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill={INK}>
            <path d="M13.6 1.6 4.4 13.2c-.4.5 0 1.3.7 1.3h5.2l-1.4 7.2c-.2.9 1 1.4 1.5.7l9.2-11.6c.4-.5 0-1.3-.7-1.3h-5.2l1.4-7.2c.2-.9-1-1.4-1.5-.7Z" />
          </svg>
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{siteConfig.name}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* The image renderer lays out with flexbox only: one text node per element. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 22,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -3,
          }}
        >
          <span>Power you can</span>
          <span style={{ color: VOLT }}>plan around.</span>
        </div>
        <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, color: "#b6c0d1", maxWidth: 940 }}>
          {`Load-shedding schedules, outage tracking and online bill payment for ${siteConfig.serviceArea}.`}
        </div>
      </div>
    </div>,
    size,
  );
}
