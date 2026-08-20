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

  it("membatalkan body redirect dan response non-HTML", async () => {
    const redirectCancelled = vi.fn().mockRejectedValue(new Error("cancel failed"));
    const binaryCancelled = vi.fn();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(new ReadableStream({ cancel: redirectCancelled }), {
        status: 302,
        headers: { location: "https://final.example/file" },
      }))
      .mockResolvedValueOnce(new Response(new ReadableStream({ cancel: binaryCancelled }), {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      }));

    await inspectLink("https://short.example/a", {
      fetcher,
      guard: vi.fn().mockResolvedValue(undefined),
    });

    expect(redirectCancelled).toHaveBeenCalledOnce();
    expect(binaryCancelled).toHaveBeenCalledOnce();
  });

  it("menerapkan deadline total inspeksi", async () => {
    const fetcher = vi.fn((_input: string, init?: RequestInit) => new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    }));

    await expect(inspectLink("https://slow.example", {
      fetcher,
      guard: vi.fn().mockResolvedValue(undefined),
      deadlineMs: 10,
    })).rejects.toMatchObject({ name: "TimeoutError" });
  });

  it("menerapkan deadline total inspeksi termasuk network guard", async () => {
    const guard = vi.fn(() => new Promise<void>(() => undefined));
    const fetcher = vi.fn();

    await expect(inspectLink("https://slow.example", {
      fetcher,
      guard,
      deadlineMs: 10,
    })).rejects.toMatchObject({ name: "TimeoutError" });
    expect(fetcher).not.toHaveBeenCalled();
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
