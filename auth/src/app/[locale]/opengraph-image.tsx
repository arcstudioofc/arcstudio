import { ImageResponse } from "next/og";
import { settings } from "@/lib";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const brand = settings.name || "ARC Studio, Auth.";
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "https://auth.arcstudio.online";

  const card = (
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        background: "#0b0b0f",
        color: "#e5e7eb",
        padding: 72,
        boxSizing: "border-box",
        gap: 48,
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: '"Poppins", "Inter", "Segoe UI", sans-serif',
        letterSpacing: 0.2,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "block",
            padding: "6px 14px",
            width: "auto",
            borderRadius: 999,
            // background: "#111827",
            border: "1px solid #1f2937",
            fontSize: 14,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          Auth Portal
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.05,
            maxWidth: 640,
          }}
        >
          {brand}
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#cbd5e1",
            maxWidth: 700,
            lineHeight: 1.45,
          }}
        >
          Sign in, manage teams, and keep access secure across the ARC ecosystem.
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["SSO", "Org roles", "Invites"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                // background: "#111827",
                border: "1px solid #1f2937",
                fontSize: 15,
                color: "#d1d5db",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: 28,
        //   background: "#111827",
          border: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          overflow: "hidden",
        }}
      >
        <img
          src={`${base}/images/favicon.png`}
          alt="ARC Studio logo"
          width={220}
          height={220}
          style={{
            width: 220,
            height: 220,
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>
  );

  return new ImageResponse(card, { ...size });
}
