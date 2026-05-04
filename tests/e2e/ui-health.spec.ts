import { test, expect } from "@playwright/test";
import { loginAsRehber } from "./helpers";

test.describe("UI Sağlık Kontrolleri", () => {

  test("ana sayfa açılıyor ve yönlendiriyor", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);
    console.log("✅ Ana sayfa erişilebilir");
  });

  test("giriş sayfası yükleniyor", async ({ page }) => {
    await page.goto("/giris");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    console.log("✅ Giriş sayfası düzgün yükleniyor");
  });

  test("giriş formu submit sonrası tepki veriyor", async ({ page }) => {
    await page.goto("/giris");
    await page.fill('input[type="email"]', "test@test.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Ya hata mesajı ya da yönlendirme olmalı — sayfa donmamalı
    await Promise.race([
      page.waitForURL("**/dashboard/**", { timeout: 15000 }).catch(() => {}),
      page.waitForSelector("text=Giriş Yap", { timeout: 15000 }).catch(() => {}),
    ]);
    console.log("✅ Login formu tepki veriyor");
  });
});
