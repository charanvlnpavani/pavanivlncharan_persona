import { ImageResponse } from "next/og";
import { getSite } from "@/lib/api";

/* The preview card shown when the site is shared on LinkedIn, X, Slack, etc.
   Built from published content; refreshed when you publish. */
export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { profile } = await getSite();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#16171b",
          color: "#f1f2f4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#2a2c33",
              color: "#5eead4",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {profile.initials}
          </div>
          <div style={{ fontSize: 30, color: "#a9adb8" }}>{profile.fullName}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, color: "#5eead4" }}>{profile.headline}</div>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{profile.heroHeading}</div>
        </div>
        <div style={{ fontSize: 26, color: "#a9adb8" }}>{profile.location}</div>
      </div>
    ),
    size,
  );
}
