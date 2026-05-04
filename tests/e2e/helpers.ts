import { Page } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "ci-test@turbag.app";
const PASSWORD = process.env.TEST_PASSWORD ?? "CiTest2026";

export async function loginAsRehber(page: Page) {
  await page.goto("/giris");
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/**", { timeout: 30000 });
}
