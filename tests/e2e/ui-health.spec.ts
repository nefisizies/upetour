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

  test("giriş çalışıyor ve dashboard'a yönlendiriyor", async ({ page }) => {
    await loginAsRehber(page);
    await expect(page).toHaveURL(/dashboard/);
    console.log("✅ Giriş ve yönlendirme çalışıyor");
  });

  test.describe("Giriş sonrası", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsRehber(page);
    });

    test("dashboard 200 dönüyor, kritik alanlar görünür", async ({ page }) => {
      await page.goto("/dashboard/rehber");
      await page.waitForLoadState("networkidle");
      // Hata sayfası değil mi?
      await expect(page.locator("text=500")).not.toBeVisible();
      await expect(page.locator("text=404")).not.toBeVisible();
      // Wave background var mı?
      const waveEl = page.locator(".fixed.inset-0.-z-10");
      await expect(waveEl).toBeAttached();
      console.log("✅ Dashboard hatasız yükleniyor");
    });

    test("profil sayfası yükleniyor", async ({ page }) => {
      await page.goto("/dashboard/rehber/profil");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=500")).not.toBeVisible();
      await expect(page.locator("text=404")).not.toBeVisible();
      console.log("✅ Profil sayfası yükleniyor");
    });

    test("profil kartı — fotoğraf banner arkasında kalmamalı", async ({ page }) => {
      await page.goto("/dashboard/rehber/profil");
      await page.waitForLoadState("networkidle");

      // Kart var mı?
      const kart = page.locator("text=Acentelere böyle görünüyorsunuz");
      await expect(kart).toBeVisible({ timeout: 5000 });

      // Banner (mavi şerit) + avatar container birlikte var mı?
      const banner = page.locator("a.bg-gradient-to-r").first();
      const avatarContainer = page.locator(".\\-mt-10").first();
      await expect(banner).toBeVisible();
      await expect(avatarContainer).toBeVisible();

      // Avatar, banner'ın ALTINDA kalmamalı — z-index kontrol
      const avatarBox = await avatarContainer.boundingBox();
      const bannerBox = await banner.boundingBox();
      if (avatarBox && bannerBox) {
        // Avatar'ın üst kısmı banner içinde başlıyor olmalı (overlap)
        const overlaps = avatarBox.y < bannerBox.y + bannerBox.height;
        expect(overlaps, "Avatar banner üstüne çıkmalı (overlap)").toBeTruthy();
      }
      console.log("✅ Profil kartı görünümü sağlıklı");
    });

    test("takvim sayfası yükleniyor", async ({ page }) => {
      await page.goto("/dashboard/rehber/takvim");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Takvimim")).toBeVisible({ timeout: 5000 });
      await expect(page.locator("text=500")).not.toBeVisible();
      console.log("✅ Takvim sayfası yükleniyor");
    });

    test("nav linkleri çalışıyor", async ({ page }) => {
      await page.goto("/dashboard/rehber");
      const navLinks = ["Profilim", "Takvim", "Mesajlar"];
      for (const link of navLinks) {
        await expect(page.locator(`nav >> text=${link}`)).toBeVisible();
      }
      console.log("✅ Nav linkleri görünür");
    });
  });
});
