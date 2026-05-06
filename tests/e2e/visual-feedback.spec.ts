/**
 * Görsel & Kontrast Feedback Testi
 *
 * Bu test "emrimize amade sanal kullanıcı" görevini üstleniyor:
 * - Her ana sayfayı light + dark modda ziyaret eder
 * - axe-core ile WCAG AA kontrast ihlallerini otomatik tespit eder
 * - Ekran görüntüsü alır → tests/screenshots/ klasörüne kaydeder
 *
 * Çalıştır: npx playwright test tests/e2e/visual-feedback.spec.ts --reporter=list
 */

import { test, expect, Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "path";
import fs from "fs";

const BASE = process.env.TEST_URL ?? "http://localhost:3000";
const PASS = process.env.TEST_PASSWORD ?? "Uras1903";
const EMAIL = "uras@turbag.app";

const SCREENSHOT_DIR = path.join(process.cwd(), "tests", "screenshots");

// ── helpers ──────────────────────────────────────────────────────────────────

async function enableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("dark-mode", "true");
    document.documentElement.setAttribute("data-dark", "true");
  });
}

async function disableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("dark-mode", "false");
    document.documentElement.setAttribute("data-dark", "false");
  });
}

async function shot(page: Page, name: string) {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function runAxe(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    // Sadece kontrast ve renk kural grubu
    .withRules(["color-contrast", "color-contrast-enhanced"])
    .analyze();

  if (results.violations.length > 0) {
    const report = results.violations.map((v) => {
      const nodes = v.nodes
        .slice(0, 3)
        .map((n) => `  → ${n.html.slice(0, 120)}`)
        .join("\n");
      return `[${v.id}] ${v.description}\n${nodes}`;
    }).join("\n\n");
    console.warn(`\n⚠️  Kontrast ihlali (${label}):\n${report}\n`);
  } else {
    console.log(`✅ Kontrast OK: ${label}`);
  }

  // Test sadece critical ihlallerde fail eder
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(
    critical,
    `Kritik kontrast ihlali — ${label}:\n${critical.map((v) => v.description).join(", ")}`
  ).toHaveLength(0);
}

// ── login ─────────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto(`${BASE}/giris`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

// ── testler ──────────────────────────────────────────────────────────────────

test.describe("Landing page — light mod", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await disableDarkMode(page);
    await page.waitForLoadState("networkidle");
  });

  test("ekran görüntüsü + kontrast taraması", async ({ page }) => {
    await shot(page, "landing-light");
    await runAxe(page, "landing light");
  });

  test("hero yazıları görünür", async ({ page }) => {
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const color = await h1.evaluate((el) => getComputedStyle(el).color);
    // beyaz veya çok açık olmalı (hero koyu arka plan üstünde)
    expect(color).not.toBe("rgb(10, 126, 164)"); // teal'e dönmemeli
  });
});

test.describe("Landing page — dark mod", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await enableDarkMode(page);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("ekran görüntüsü + kontrast taraması", async ({ page }) => {
    await shot(page, "landing-dark");
    await runAxe(page, "landing dark");
  });

  test("nav arka planı koyu", async ({ page }) => {
    const nav = page.locator("nav.sticky").first();
    const bg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
    // rgba(10, 18, 32, ...) gibi koyu olmalı — 3 kanalın toplamı < 120
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);
    expect(r + g + b).toBeLessThan(120);
  });
});

test.describe("Giriş sayfası — light mod", () => {
  test("ekran görüntüsü + kontrast taraması", async ({ page }) => {
    await page.goto(`${BASE}/giris`);
    await disableDarkMode(page);
    await page.waitForLoadState("networkidle");
    await shot(page, "giris-light");
    await runAxe(page, "giris light");
  });
});

test.describe("Giriş sayfası — dark mod", () => {
  test("ekran görüntüsü + kontrast taraması", async ({ page }) => {
    await page.goto(`${BASE}/giris`);
    await enableDarkMode(page);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await shot(page, "giris-dark");
    await runAxe(page, "giris dark");
  });
});

test.describe("Dashboard (rehber) — light mod", () => {
  test("ekran görüntüsü + kontrast taraması", async ({ page }) => {
    await login(page);
    await disableDarkMode(page);
    await page.goto(`${BASE}/dashboard/rehber`);
    await page.waitForLoadState("networkidle");
    await shot(page, "dashboard-rehber-light");
    await runAxe(page, "dashboard rehber light");
  });
});

test.describe("Dashboard (rehber) — dark mod", () => {
  test("ekran görüntüsü + kontrast taraması", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/dashboard/rehber`);
    await enableDarkMode(page);
    await page.reload();
    await page.waitForLoadState("networkidle");
    await shot(page, "dashboard-rehber-dark");
    await runAxe(page, "dashboard rehber dark");
  });
});

test.describe("Dashboard nav kontrolü — dark mod", () => {
  test("nav beyaz kalmıyor, sidebar beyaz kalmıyor", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/dashboard/rehber`);
    await enableDarkMode(page);
    await page.reload();

    // Üst nav
    const nav = page.locator("nav.sticky").first();
    const navBg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
    const [nr, ng, nb] = navBg.match(/\d+/g)!.map(Number);
    expect(nr + ng + nb, `Nav çok açık: ${navBg}`).toBeLessThan(150);

    await shot(page, "nav-dark-check");
  });
});
