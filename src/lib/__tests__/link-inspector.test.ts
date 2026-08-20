import { describe, expect, it, vi } from "vitest";
import { inspectLink } from "../link-inspector";

describe("inspectLink", () => {
  it("mengikuti redirect dan mengembalikan URL bersih serta metadata", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { location: "https://final.example/page?utm_source=fb&id=7" } }),
      )
      .mockResolvedValueOnce(
        new Response(`<title>Halaman Akhir</title><meta name="description" content="Tujuan aman">`, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    const guard = vi.fn().mockResolvedValue(undefined);

    const result = await inspectLink("https://short.example/a", { fetcher, guard });

    expect(result.finalUrl).toBe("https://final.example/page?utm_source=fb&id=7");
    expect(result.cleanUrl).toBe("https://final.example/page?id=7");
    expect(result.hops).toHaveLength(2);
    expect(result.metadata.title).toBe("Halaman Akhir");
    expect(guard).toHaveBeenCalledTimes(2);
  });

  it("menghentikan redirect loop", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(null, { status: 302, headers: { location: "https://loop.example/a" } }),
    );
    await expect(
      inspectLink("https://loop.example/a", {
        fetcher,
        guard: vi.fn().mockResolvedValue(undefined),
      }),
    ).rejects.toThrow("berulang");
  });
});
