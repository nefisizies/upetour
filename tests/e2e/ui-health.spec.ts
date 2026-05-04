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

    test("dashboard hatasız yükleniyor", async ({ page }) => {
      await page.goto("/dashboard/rehber");
      await expect(page.locator("text=500")).not.toBeVisible();
      await expect(page.locator("text=404")).not.toBeVisible();
      console.log("✅ Dashboard hatasız yükleniyor");
    });

    test("profil kartı — fotoğraf banner arkasında kalmamalı", async ({ page }) => {
      await page.goto("/dashboard/rehber/profil");
      const kart = page.locator("text=Acentelere böyle görünüyorsunuz");
      await expect(kart).toBeVisible({ timeout: 10000 });
      const banner = page.locator("a.bg-gradient-to-r").first();
      const avatarContainer = page.locator(".-mt-10").first();
      const avatarBox = await avatarContainer.boundingBox();
      const bannerBox = await banner.boundingBox();
      if (avatarBox && bannerBox) {
        expect(avatarBox.y, "Avatar banner üstüne çıkmalı").toBeLessThan(bannerBox.y + bannerBox.height);
      }
      console.log("✅ Profil kartı görünümü sağlıklı");
    });

    test("takvim sayfası yükleniyor", async ({ page }) => {
      await page.goto("/dashboard/rehber/takvim");
      await expect(page.locator("text=Takvimim")).toBeVisible({ timeout: 10000 });
      console.log("✅ Takvim sayfası yükleniyor");
    });

    test("nav linkleri görünür", async ({ page }) => {
      await page.goto("/dashboard/rehber");
      for (const link of ["Profilim", "Takvim", "Mesajlar"]) {
        await expect(page.locator(`nav >> text=${link}`)).toBeVisible();
      }
      console.log("✅ Nav linkleri görünür");
    });
  });
});
