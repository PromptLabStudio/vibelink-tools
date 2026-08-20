import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { Readable } from "node:stream";
import { assertSafeUrl, resolvePublicAddresses } from "./network-safety";
import { extractMetadata, type LinkMetadata } from "./metadata";
import { cleanUrl, parseHttpUrl } from "./url-cleaner";

export type RedirectHop = {
  url: string;
  hostname: string;
  status: number;
  durationMs: number;
};

export type InspectionResult = {
  originalUrl: string;
  finalUrl: string;
  cleanUrl: string;
  hops: RedirectHop[];
  metadata: LinkMetadata;
  inspectedAt: string;
};

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
type Guard = (url: URL) => Promise<void>;

type InspectOptions = {
  fetcher?: Fetcher;
  guard?: Guard;
  maxHops?: number;
};

async function pinnedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(input);
  const addresses = await resolvePublicAddresses(url);
  const target = addresses.find((item) => item.family === 4) ?? addresses[0];
  const headers = Object.fromEntries(new Headers(init.headers).entries());
  const originalHostname = url.hostname.replace(/^\[|\]$/g, "");

  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
    const request = transport(
      {
        protocol: url.protocol,
        hostname: target.address,
        family: target.family,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: init.method ?? "GET",
        headers: { ...headers, host: url.host, "accept-encoding": "identity" },
        servername: isIP(originalHostname) ? undefined : originalHostname,
        timeout: 10_000,
      },
      (incoming) => {
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(incoming.headers)) {
          if (Array.isArray(value)) value.forEach((item) => responseHeaders.append(key, item));
          else if (value !== undefined) responseHeaders.set(key, value);
        }
        const status = incoming.statusCode ?? 502;
        const hasBody = ![204, 205, 304].includes(status);
        resolve(
          new Response(
            hasBody ? (Readable.toWeb(incoming) as ReadableStream<Uint8Array>) : null,
            {
              status,
              statusText: incoming.statusMessage,
              headers: responseHeaders,
            },
          ),
        );
      },
    );
    request.once("error", reject);
    request.once("timeout", () => request.destroy(new Error("Request timeout")));
    if (init.signal) {
      if (init.signal.aborted) request.destroy(new DOMException("Aborted", "AbortError"));
      else init.signal.addEventListener(
        "abort",
        () => request.destroy(new DOMException("Aborted", "AbortError")),
        { once: true },
      );
    }
    request.end();
  });
}

async function readLimited(response: Response, limit = 524_288): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(chunks.reduce((total, item) => total + item.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

export async function inspectLink(
  input: string,
  options: InspectOptions = {},
): Promise<InspectionResult> {
  const fetcher = options.fetcher ?? pinnedFetch;
  const guard = options.guard ?? assertSafeUrl;
  const maxHops = options.maxHops ?? 8;
  const original = parseHttpUrl(input);
  const seen = new Set<string>();
  const hops: RedirectHop[] = [];
  let current = original;
  let metadata: LinkMetadata = {};

  for (let index = 0; index <= maxHops; index += 1) {
    if (seen.has(current.toString())) throw new Error("Rantai redirect berulang terdeteksi.");
    seen.add(current.toString());
    await guard(current);

    const started = Date.now();
    const response = await fetcher(current.toString(), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        range: "bytes=0-524287",
        "user-agent": "VibeLink/1.0 (+https://vibelink.vercel.app)",
      },
    });

    hops.push({
      url: current.toString(),
      hostname: current.hostname,
      status: response.status,
      durationMs: Date.now() - started,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect tidak memiliki tujuan.");
      if (index === maxHops) throw new Error("Redirect terlalu banyak.");
      current = new URL(location, current);
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/html")) {
      metadata = extractMetadata(await readLimited(response), current);
    }
    break;
  }

  return {
    originalUrl: original.toString(),
    finalUrl: current.toString(),
    cleanUrl: cleanUrl(current.toString()),
    hops,
    metadata,
    inspectedAt: new Date().toISOString(),
  };
}
