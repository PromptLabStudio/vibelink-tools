const TRACKING_KEYS = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "ref_src",
  "vero_conv",
  "vero_id",
]);

export function parseHttpUrl(input: string): URL {
  const trimmed = input.trim();
  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(candidate);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("Hanya URL HTTP atau HTTPS yang didukung.");
  }

  if (url.username || url.password) {
    throw new Error("URL dengan kredensial tidak didukung.");
  }

  return url;
}

export function cleanUrl(input: string): string {
  const url = parseHttpUrl(input);

  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || TRACKING_KEYS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}
