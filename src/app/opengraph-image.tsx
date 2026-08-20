import { ImageResponse } from "next/og";
export const alt = "VibeLink — Lihat tujuan link sebelum kamu klik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#faf8f5", color: "#1c1917", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}><div style={{ width: 54, height: 54, borderRadius: 16, background: "#1c1917", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>↗</div>VibeLink</div>
      <div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", flexDirection: "column", fontSize: 72, letterSpacing: -4, fontWeight: 750, lineHeight: 1.04 }}><div style={{ display: "flex" }}>Lihat tujuan link</div><div style={{ display: "flex", color: "#ea580c" }}>sebelum kamu klik.</div></div><div style={{ marginTop: 30, fontSize: 26, color: "#57534e" }}>Redirect transparan · URL bersih · Preview tujuan</div></div>
      <div style={{ display: "flex", fontSize: 20, color: "#78716c" }}>Eksperimen vibe coding oleh PromptLab Studio</div>
    </div>, size,
  );
}
