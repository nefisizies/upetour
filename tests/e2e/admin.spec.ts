import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "uras@turbag.app";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "uras1903";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/giris");
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/admin**", { timeout: 30000 });
}

test.describe("Admin Paneli", () => {
  test("admin girişi çalışıyor ve dashboard yükleniyor", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator("text=Genel Bakış")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=ADMIN")).toBeVisible();
    console.log("✅ Admin girişi başarılı");
  });

  test("admin paneli korumalı — yetkisiz erişim redirect ediyor", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL(/giris/, { timeout: 10000 });
    console.log("✅ Admin koruması çalışıyor");
  });

  test("tema sayfası yükleniyor", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/dashboard/admin/tema");
    await expect(page.locator("text=Tema & Görünüm")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Arka Plan Teması")).toBeVisible();
    await expect(page.locator("text=Renkler")).toBeVisible();
    await expect(page.locator("text=Yazı Tipi")).toBeVisible();
    console.log("✅ Tema sayfası yüklendi");
  });

  test("kullanıcı listesi görünüyor", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator("text=Kayıtlı Hesaplar")).toBeVisible({ timeout: 10000 });
    console.log("✅ Kullanıcı listesi görünüyor");
  });

  test("sistem yöneticisi butonu girişte e-posta doldurur", async ({ page }) => {
    await page.goto("/giris");
    await page.click("button:has-text('Sistem Yöneticisi')");
    await expect(page.locator('input[type="email"]')).toHaveValue("uras@turbag.app");
    console.log("✅ Admin email otofill çalışıyor");
  });
});
