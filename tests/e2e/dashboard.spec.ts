import { test, expect } from "@playwright/test";
import { loginAsRehber } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRehber(page);
  });

  test("genel bakış sayfası yükleniyor", async ({ page }) => {
    await page.goto("/dashboard/rehber");
    await expect(page.locator("text=Yaklaşan Etkinlikler")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("nav >> text=Mesajlar")).toBeVisible();
    console.log("✅ Genel bakış sayfası yüklendi");
  });

  test("mini takvim görünüyor ve ay okları çalışıyor", async ({ page }) => {
    await page.goto("/dashboard/rehber");
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    const currentMonth = months[new Date().getMonth()];
    await expect(page.locator(`text=${currentMonth}`).last()).toBeVisible({ timeout: 10000 });
    const prevMonth = months[(new Date().getMonth() + 11) % 12];
    const chevronButtons = page.locator(".w-52 button");
    await chevronButtons.first().click();
    await expect(page.locator(`text=${prevMonth}`)).toBeVisible({ timeout: 5000 });
    console.log(`✅ Ay değiştirme çalışıyor: ${currentMonth} → ${prevMonth}`);
  });
});
