import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type LookupResult = { address: string; family: number };
type LookupFn = (hostname: string) => Promise<LookupResult[]>;

function blockedIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) return true;

  const value = parts.reduce((total, part) => ((total << 8) | part) >>> 0, 0);
  const cidrs: Array<[string, number]> = [
    ["0.0.0.0", 8],
    ["10.0.0.0", 8],
    ["100.64.0.0", 10],
    ["127.0.0.0", 8],
    ["169.254.0.0", 16],
    ["172.16.0.0", 12],
    ["192.0.0.0", 24],
    ["192.0.2.0", 24],
    ["192.88.99.0", 24],
    ["192.168.0.0", 16],
    ["198.18.0.0", 15],
    ["198.51.100.0", 24],
    ["203.0.113.0", 24],
    ["224.0.0.0", 4],
    ["240.0.0.0", 4],
  ];

  return cidrs.some(([base, bits]) => {
    const baseValue = base.split(".").map(Number).reduce(
      (total, part) => ((total << 8) | part) >>> 0,
      0,
    );
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (value & mask) >>> 0 === (baseValue & mask) >>> 0;
  });
}

function ipv6Value(input: string): bigint {
  let ip = input.toLowerCase();
  const dotted = ip.match(/(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (dotted) {
    const bytes = dotted.split(".").map(Number);
    const first = ((bytes[0] << 8) | bytes[1]).toString(16);
    const second = ((bytes[2] << 8) | bytes[3]).toString(16);
    ip = `${ip.slice(0, -dotted.length)}${first}:${second}`;
  }

  const [leftRaw, rightRaw = ""] = ip.split("::");
  const left = leftRaw ? leftRaw.split(":") : [];
  const right = rightRaw ? rightRaw.split(":") : [];
  const missing = 8 - left.length - right.length;
  const parts = ip.includes("::")
    ? [...left, ...Array.from({ length: missing }, () => "0"), ...right]
    : left;
  return parts.reduce(
    (value, part) => (value << BigInt(16)) | BigInt(`0x${part || "0"}`),
    BigInt(0),
  );
}

function blockedIpv6(ip: string): boolean {
  const value = ipv6Value(ip);
  const cidrs: Array<[string, number]> = [
    ["::", 96],
    ["::ffff:0:0", 96],
    ["64:ff9b::", 96],
    ["64:ff9b:1::", 48],
    ["100::", 64],
    ["2001::", 23],
    ["2001:db8::", 32],
    ["2002::", 16],
    ["3fff::", 20],
    ["5f00::", 16],
    ["fc00::", 7],
    ["fec0::", 10],
    ["fe80::", 10],
    ["ff00::", 8],
  ];

  return cidrs.some(([base, bits]) => {
    const shift = BigInt(128) - BigInt(bits);
    return value >> shift === ipv6Value(base) >> shift;
  });
}

export function isBlockedIp(input: string): boolean {
  const ip = input.toLowerCase().replace(/^\[|\]$/g, "");

  if (ip.startsWith("::ffff:")) {
    return blockedIpv4(ip.slice(7));
  }

  if (isIP(ip) === 4) return blockedIpv4(ip);
  if (isIP(ip) === 6) return blockedIpv6(ip);

  return true;
}

const defaultLookup: LookupFn = async (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

export async function resolvePublicAddresses(
  url: URL,
  resolver: LookupFn = defaultLookup,
): Promise<LookupResult[]> {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Hanya URL HTTP atau HTTPS yang diizinkan.");
  }
  if (url.username || url.password) {
    throw new Error("URL dengan kredensial tidak diizinkan.");
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    throw new Error("Port nonstandar tidak diizinkan.");
  }

  const hostname = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("Hostname lokal tidak diizinkan.");
  }

  const literalFamily = isIP(hostname);
  const addresses = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await resolver(hostname);

  if (!addresses.length || addresses.some(({ address }) => isBlockedIp(address))) {
    throw new Error("Alamat jaringan privat atau khusus tidak diizinkan.");
  }
  return addresses;
}

export async function assertSafeUrl(
  url: URL,
  resolver: LookupFn = defaultLookup,
): Promise<void> {
  await resolvePublicAddresses(url, resolver);
}
