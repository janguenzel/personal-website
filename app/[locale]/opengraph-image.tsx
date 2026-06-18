import { ImageResponse } from "next/og";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Terminal-styled social card, generated per locale. Satori supports flexbox +
// a CSS subset only, so every container sets display:flex explicitly.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(hasLocale(locale) ? locale : "en");

  const c = {
    bg: "#0a0e0f",
    surface: "#11171a",
    border: "#243033",
    fg: "#d6e2dd",
    muted: "#7f928c",
    accent: "#22c55e",
  };
  const dot = (color: string) => ({
    display: "flex",
    width: 16,
    height: 16,
    borderRadius: 99,
    background: color,
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: c.bg,
        padding: 56,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          border: `2px solid ${c.border}`,
          borderRadius: 18,
          background: c.surface,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 26px",
            borderBottom: `2px solid ${c.border}`,
          }}
        >
          <div style={dot("#ff5f56")} />
          <div style={dot("#ffbd2e")} />
          <div style={dot("#27c93f")} />
          <div
            style={{
              display: "flex",
              marginLeft: 18,
              color: c.muted,
              fontSize: 24,
            }}
          >
            {site.user}@{site.host}: ~
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "44px 56px",
          }}
        >
          <div style={{ display: "flex", color: c.accent, fontSize: 30 }}>
            ❯ whoami
          </div>
          <div
            style={{
              display: "flex",
              color: c.fg,
              fontSize: 74,
              fontWeight: 700,
              marginTop: 14,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              color: c.muted,
              fontSize: 34,
              marginTop: 8,
            }}
          >
            {site.role} · {site.location}
          </div>
          <div
            style={{
              display: "flex",
              color: c.accent,
              fontSize: 26,
              marginTop: 40,
            }}
          >
            {dict.meta.home.title} — {new URL(site.url).host}
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
