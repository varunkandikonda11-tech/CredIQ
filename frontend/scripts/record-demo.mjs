/**
 * Records a paced walkthrough of CreditIQ.
 *
 *   npm install -D playwright
 *   npx playwright install chromium
 *   node scripts/record-demo.mjs
 *
 * Writes demo/CreditIQ-live-demo.webm (repo root) and frontend/public/CreditIQ-live-demo.webm
 */
import { chromium } from "playwright";
import { mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontend = join(here, "..");
const root = join(frontend, "..");
const outDir = join(root, "demo");
const publicDir = join(frontend, "public");
const baseURL = process.env.DEMO_URL ?? "http://localhost:5173";

function sleep(page, ms) {
  return page.waitForTimeout(ms);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(join(outDir, "_raw"), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    slowMo: 90,
    channel: "chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: join(outDir, "_raw"),
      size: { width: 1440, height: 900 },
    },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await sleep(page, 1800);

  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "smooth" }));
  await sleep(page, 2200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(page, 1200);

  await page.getByRole("link", { name: "See plans" }).first().click();
  await page.getByRole("heading", { name: /CredIQ Free/i }).waitFor();
  await sleep(page, 2200);

  await page.getByRole("link", { name: "CreditIQ" }).first().click();
  await page.getByRole("heading", { name: /Know your credit risk/i }).waitFor();
  await sleep(page, 1000);

  await page.locator('a[href="/borrower?new=1"]').last().click();
  await page.getByRole("heading", { name: /What is my credit score/i }).waitFor();
  await sleep(page, 800);

  await page.getByRole("button", { name: "INR ₹" }).click();
  await sleep(page, 900);
  await page.getByRole("button", { name: "USD $" }).click();
  await sleep(page, 600);

  await page.getByRole("button", { name: "Yes" }).first().click();
  await page.locator('input[type="number"]').first().fill("8");
  await page.getByRole("button", { name: "Credit Card" }).click();
  await page.getByRole("button", { name: "Auto Loan" }).click();
  await page.locator('input[type="number"]').nth(1).fill("1");
  await page.getByRole("button", { name: "Never" }).click();

  const money = page.locator('input[type="number"]');
  await money.nth(2).fill("72000");
  await money.nth(3).fill("15000");
  await money.nth(4).fill("4200");
  await page.getByRole("button", { name: "No" }).last().click();
  await sleep(page, 600);

  await page.getByRole("button", { name: /Calculate score/i }).click();
  await page.getByText(/Excellent|Very Good|Good|Fair|Poor/i).first().waitFor();
  await sleep(page, 1800);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(page, 800);
  await page.getByPlaceholder("Your name").fill("Rudra");
  await page.getByRole("button", { name: /Save profile/i }).click();
  await sleep(page, 1200);

  const excellent = page.getByRole("button", { name: /Excellent/ });
  if (await excellent.count()) {
    await excellent.first().click();
    await sleep(page, 1400);
  }

  await page.getByText("What-if scenarios").scrollIntoViewIfNeeded();
  await sleep(page, 700);
  await page.getByRole("button", { name: "Pay off credit card" }).click();
  await sleep(page, 1600);

  await page.getByRole("button", { name: "Credit Coach" }).click();
  await page.getByRole("heading", { name: "Credit Coach" }).waitFor();
  await sleep(page, 900);
  await page.getByRole("button", { name: "/why" }).click();
  await sleep(page, 1800);
  await page.getByRole("button", { name: "/improve" }).click();
  await sleep(page, 2000);
  await page.getByPlaceholder(/faq/).fill("/status");
  await page.getByRole("button", { name: "Ask" }).click();
  await sleep(page, 1800);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await sleep(page, 600);

  await page.getByRole("link", { name: "Lender" }).click();
  await page.getByRole("heading", { name: "Demo sign in" }).waitFor();
  await sleep(page, 1000);
  await page.getByLabel("Password").fill("demo");
  await page.getByRole("button", { name: /Open portfolio/i }).click();
  await page.getByRole("heading", { name: "Portfolio scoring" }).waitFor();
  await sleep(page, 2500);

  const firstRow = page.locator("table tbody tr").first();
  if (await firstRow.count()) {
    await firstRow.click();
    await page.getByText("( applicant )").waitFor();
    await sleep(page, 2200);
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await sleep(page, 800);
  }

  await page.getByRole("button", { name: /Export CSV/i }).click().catch(() => {});
  await sleep(page, 1000);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: /Know your credit risk/i }).waitFor();
  await sleep(page, 1600);

  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const rawPath = video ? await video.path() : null;
  if (!rawPath || !existsSync(rawPath)) {
    throw new Error("Playwright did not write a video file.");
  }

  const dest = join(outDir, "CreditIQ-live-demo.webm");
  const publicDest = join(publicDir, "CreditIQ-live-demo.webm");
  copyFileSync(rawPath, dest);
  copyFileSync(rawPath, publicDest);
  console.log(`Saved ${dest}`);
  console.log(`Also copied to ${publicDest}`);
  console.log("Raw files:", readdirSync(join(outDir, "_raw")).join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
