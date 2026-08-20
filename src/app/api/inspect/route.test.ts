import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/inspect", () => {
  it("menolak JSON null sebagai input tidak valid", async () => {
    const response = await POST(new Request("http://localhost/api/inspect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "null",
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Masukkan URL yang valid." });
  });

  it("menolak body lebih dari 4 KB meski Content-Length tidak tersedia", async () => {
    const request = new Request("http://localhost/api/inspect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: `https://example.com/${"a".repeat(5000)}` }),
    });
    expect(request.headers.get("content-length")).toBeNull();

    const response = await POST(request);
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "Payload terlalu besar." });
  });
});
