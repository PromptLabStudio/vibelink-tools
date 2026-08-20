import { describe, expect, it, vi } from "vitest";
import { assertSafeUrl, isBlockedIp } from "../network-safety";

describe("isBlockedIp", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "::1",
    "fe80::1",
    "fc00::1",
    "64:ff9b:1::7f00:1",
    "::127.0.0.1",
    "100::1",
    "2001:2::1",
    "fec0::1",
    "feff::1",
    "3fff::1",
    "5f00::1",
  ])("memblokir alamat internal %s", (ip) => {
    expect(isBlockedIp(ip)).toBe(true);
  });

  it.each(["1.1.1.1", "8.8.8.8", "198.51.1.1", "203.0.1.1", "2606:4700:4700::1111"])(
    "mengizinkan alamat publik %s",
    (ip) => {
      expect(isBlockedIp(ip)).toBe(false);
    },
  );
});

describe("assertSafeUrl", () => {
  it("menolak localhost", async () => {
    await expect(assertSafeUrl(new URL("http://localhost"))).rejects.toThrow(
      "tidak diizinkan",
    );
  });

  it("menolak hostname yang resolve ke private IP", async () => {
    await expect(
      assertSafeUrl(new URL("https://internal.example"), async () => [
        { address: "10.10.10.10", family: 4 },
      ]),
    ).rejects.toThrow("jaringan privat");
  });

  it("mengizinkan hostname publik", async () => {
    await expect(
      assertSafeUrl(new URL("https://example.com"), async () => [
        { address: "93.184.216.34", family: 4 },
      ]),
    ).resolves.toBeUndefined();
  });

  it("mengenali literal IPv6 publik tanpa lookup DNS", async () => {
    const resolver = vi.fn();
    await expect(
      assertSafeUrl(new URL("https://[2606:4700:4700::1111]/"), resolver),
    ).resolves.toBeUndefined();
    expect(resolver).not.toHaveBeenCalled();
  });
});
