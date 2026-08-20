export type LinkMetadata = {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
};

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
    nbsp: " ",
  };
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (full, key) => named[key.toLowerCase()] ?? full)
    .replace(/\s+/g, " ")
    .trim();
}

function attribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  return value ? decodeHtml(value) : undefined;
}

function safeAbsoluteUrl(value: string | undefined, base: URL): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function extractMetadata(html: string, base: URL): LinkMetadata {
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);

  const metaValue = (key: string) => {
    const tag = meta.find((item) => {
      const id = attribute(item, "property") ?? attribute(item, "name");
      return id?.toLowerCase() === key.toLowerCase();
    });
    return tag ? attribute(tag, "content") : undefined;
  };

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const iconTag = links.find((item) =>
    (attribute(item, "rel") ?? "").toLowerCase().split(/\s+/).includes("icon"),
  );

  return {
    title: metaValue("og:title") ?? (titleMatch ? decodeHtml(titleMatch[1]) : undefined),
    description: metaValue("og:description") ?? metaValue("description"),
    image: safeAbsoluteUrl(metaValue("og:image"), base),
    favicon: safeAbsoluteUrl(iconTag ? attribute(iconTag, "href") : undefined, base),
  };
}
