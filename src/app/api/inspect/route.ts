import { inspectLink } from "@/lib/link-inspector";

export const runtime = "nodejs";

const requests = new Map<string, number[]>();
const LIMIT = 15;
const WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 4096;
const MAX_TRACKED_IPS = 2048;
let overflowRequests: number[] = [];

class PayloadTooLargeError extends Error {}

async function readJsonBody(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Empty body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError("Payload terlalu besar.");
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return JSON.parse(text);
}

function allowed(ip: string): boolean {
  const now = Date.now();
  if (!requests.has(ip) && requests.size >= MAX_TRACKED_IPS) {
    for (const [key, times] of requests) {
      const active = times.filter((time) => now - time < WINDOW_MS);
      if (active.length) requests.set(key, active);
      else requests.delete(key);
    }
    if (requests.size >= MAX_TRACKED_IPS) {
      overflowRequests = overflowRequests.filter((time) => now - time < WINDOW_MS);
      if (overflowRequests.length >= LIMIT) return false;
      overflowRequests.push(now);
      return true;
    }
  }
  const recent = (requests.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  requests.set(ip, recent);
  return true;
}

function messageFor(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return { message: "Tujuan terlalu lama merespons. Coba lagi nanti.", status: 504 };
    }
    const known = [
      "URL",
      "protokol",
      "kredensial",
      "Port",
      "lokal",
      "privat",
      "khusus",
      "redirect",
    ];
    if (known.some((term) => error.message.toLowerCase().includes(term.toLowerCase()))) {
      return { message: error.message, status: 400 };
    }
  }
  return { message: "Link tidak dapat diperiksa saat ini.", status: 502 };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload terlalu besar." }, { status: 413 });
  }

  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowed(ip)) {
    return Response.json(
      { error: "Terlalu banyak permintaan. Tunggu satu menit lalu coba lagi." },
      { status: 429 },
    );
  }

  try {
    const parsed = await readJsonBody(request);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Masukkan URL yang valid." }, { status: 400 });
    }
    const body = parsed as { url?: unknown };
    if (typeof body.url !== "string" || !body.url.trim() || body.url.length > 2048) {
      return Response.json({ error: "Masukkan URL yang valid." }, { status: 400 });
    }

    return Response.json(await inspectLink(body.url));
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return Response.json({ error: error.message }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "Payload JSON tidak valid." }, { status: 400 });
    }
    const result = messageFor(error);
    return Response.json({ error: result.message }, { status: result.status });
  }
}
