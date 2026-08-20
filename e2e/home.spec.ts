import { expect, test } from "@playwright/test";

test("memeriksa URL publik dan menampilkan hasil bersih", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Lihat tujuan link/i })).toBeVisible();
  await page.getByLabel("Link yang ingin diperiksa").fill("example.com/?utm_source=facebook&id=7");
  await page.getByRole("button", { name: /Periksa link/i }).click();
  await expect(page.getByText("Tujuan link ditemukan")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("https://example.com/?id=7", { exact: true })).toBeVisible();
  await page.screenshot({ path: `artifacts/vibelink-${testInfo.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("menolak private IP dengan pesan aman", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Link yang ingin diperiksa").fill("http://127.0.0.1/admin");
  await page.getByRole("button", { name: /Periksa link/i }).click();
  await expect(page.locator("#url-error")).toContainText(/privat|khusus/i);
});

test("mengabaikan riwayat localStorage yang rusak", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("vibelink-recent-v1", JSON.stringify([{
      originalUrl: "https://example.com",
      finalUrl: "https://example.com",
      cleanUrl: "https://example.com",
      inspectedAt: new Date().toISOString(),
      metadata: {},
      hops: [null],
    }]));
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Lihat tujuan link/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pemeriksaan terakhir" })).toHaveCount(0);
  expect(errors).toEqual([]);
});
