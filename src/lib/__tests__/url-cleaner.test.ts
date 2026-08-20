import { describe, expect, it } from "vitest";
import { cleanUrl, parseHttpUrl } from "../url-cleaner";

describe("cleanUrl", () => {
  it("menghapus parameter tracking dan mempertahankan parameter fungsional", () => {
    expect(
      cleanUrl(
        "https://example.com/artikel?id=42&utm_source=facebook&fbclid=abc&utm_campaign=launch",
      ),
    ).toBe("https://example.com/artikel?id=42");
  });

  it("menghapus tracker tanpa menyisakan tanda tanya kosong", () => {
    expect(cleanUrl("https://example.com/path?gclid=abc")).toBe(
      "https://example.com/path",
    );
  });
});

describe("parseHttpUrl", () => {
  it("menambahkan https pada domain polos", () => {
    expect(parseHttpUrl("example.com/path").toString()).toBe(
      "https://example.com/path",
    );
  });

  it("menolak protokol selain http dan https", () => {
    expect(() => parseHttpUrl("file:///etc/passwd")).toThrow(
      "Hanya URL HTTP atau HTTPS",
    );
  });
});
