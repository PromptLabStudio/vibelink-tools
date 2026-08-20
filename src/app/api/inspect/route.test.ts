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

  it("mengabaikan x-vercel-forwarded-for di luar Vercel", async () => {
    const previous = process.env.VERCEL;
    delete process.env.VERCEL;
    try {
      const responses = await Promise.all(Array.from({ length: 16 }, (_, index) => POST(new Request(
        "http://localhost/api/inspect",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.77",
            "x-vercel-forwarded-for": `198.51.100.${index + 100}`,
          },
          body: "null",
        },
      ))));
      expect(responses.at(-1)?.status).toBe(429);
    } finally {
      if (previous === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = previous;
    }
  });

  it("memakai x-vercel-forwarded-for pada Vercel", async () => {
    const previous = process.env.VERCEL;
    process.env.VERCEL = "1";
    try {
      const responses = await Promise.all(Array.from({ length: 16 }, (_, index) => POST(new Request(
        "http://localhost/api/inspect",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.88",
            "x-vercel-forwarded-for": `203.0.113.${index + 100}`,
          },
          body: "null",
        },
      ))));
      expect(responses.every((response) => response.status === 400)).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = previous;
    }
  });
});
