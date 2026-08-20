import { describe, expect, it } from "vitest";
import { extractMetadata } from "../metadata";

describe("extractMetadata", () => {
  it("mengutamakan Open Graph dan menyelesaikan URL relatif", () => {
    const html = `<!doctype html><html><head>
      <title>Judul biasa</title>
      <meta name="description" content="Deskripsi biasa">
      <meta property="og:title" content="Judul OG">
      <meta property="og:description" content="Deskripsi OG">
      <meta property="og:image" content="/og.jpg">
      <link rel="icon" href="/favicon.png">
    </head></html>`;
    expect(extractMetadata(html, new URL("https://example.com/artikel"))).toEqual({
      title: "Judul OG",
      description: "Deskripsi OG",
      image: "https://example.com/og.jpg",
      favicon: "https://example.com/favicon.png",
    });
  });

  it("kembali ke title dan meta description", () => {
    const html = `<title>Judul &amp; Aman</title><meta name="description" content="Ringkas">`;
    expect(extractMetadata(html, new URL("https://example.com"))).toMatchObject({
      title: "Judul & Aman",
      description: "Ringkas",
    });
  });
});
