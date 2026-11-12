import { ImageResponse } from "next/og";
import { FEST } from "@/lib/fest";

export const runtime = "edge";
export const alt = `${FEST.fullName} — ${FEST.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05010d",
          padding: 64,
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(255,45,149,.55), transparent 65%)",
            top: -300,
            right: -160,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(0,240,255,.4), transparent 65%)",
            bottom: -320,
            left: -120,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                border: "2px solid #00f0ff",
                color: "#00f0ff",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              N
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#fff", fontSize: 20, letterSpacing: 8, fontWeight: 700 }}>suNRIseevent</div>
              <div style={{ color: "#8f83b8", fontSize: 13, letterSpacing: 5 }}>NRI VIJAYAWADA</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 999,
              padding: "10px 20px",
              color: "#a3ff12",
              fontSize: 16,
              letterSpacing: 2,
            }}
          >
            19—21 FEB 2027
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 102,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: -3,
              color: "#f7f2ff",
              display: "flex",
              textShadow: "0 0 42px rgba(255,45,149,.55)",
            }}
          >
            suNRIseevent ’27
          </div>
          <div style={{ display: "flex", color: "#e9e3ff", fontSize: 34, marginTop: 16, fontWeight: 500 }}>
            {FEST.tagline}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#8f83b8" }}>
          <div style={{ display: "flex", gap: 40, fontSize: 17 }}>
            <span>60+ EVENTS</span>
            <span>12K+ FOOTFALL</span>
            <span>₹8L PRIZE POOL</span>
          </div>
          <div style={{ display: "flex", fontSize: 17, color: "#00f0ff" }}>sunriseevent.in</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
