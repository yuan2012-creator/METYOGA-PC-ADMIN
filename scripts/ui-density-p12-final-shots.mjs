/**
 * P1.2 visual evidence — capture 7 required final screenshots.
 * Run: node scripts/ui-density-p12-final-shots.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.STAFF_BASE || process.env.BASE || 'http://127.0.0.1:5173';
const OUT = path.resolve('tmp/ui-density-p12');

async function clickNav(page, label) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(100);
  await page.locator('.met-sidebar-v2__nav-item', { hasText: label }).click({ force: true, timeout: 10000 });
  await page.waitForTimeout(300);
}

async function openModule(page, label) {
  await clickNav(page, '经营总览');
  await clickNav(page, label);
}

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(700);

    // 1-2 week schedule
    await openModule(page, '课程与排课');
    await page.getByRole('button', { name: /完整周排课/ }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 15000 });
    results.push(await shot(page, 'course-week-1440x900-final.png'));
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);
    results.push(await shot(page, 'course-week-1920x1080-final.png'));
    await page.setViewportSize({ width: 1440, height: 900 });

    // 3 research operation
    await openModule(page, '研学中心');
    await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '经营操作' }).click();
    await page.waitForTimeout(400);
    results.push(await shot(page, 'research-operation-1440x900-final.png'));

    // 4 research finance
    await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '财务分析' }).click();
    await page.waitForTimeout(300);
    await page.locator('.met-rc-v2-unified-nav__subtab', { hasText: '班期盈利' }).click();
    await page.waitForTimeout(300);
    results.push(await shot(page, 'research-finance-1440x900-final.png'));

    // 5 dashboard
    await openModule(page, '经营总览');
    await page.waitForTimeout(350);
    results.push(await shot(page, 'dashboard-1440x900-final.png'));

    // 6 member detail drawer
    await openModule(page, '会员经营');
    const listBtn = page.getByRole('button', { name: /会员名单|会员列表/ });
    if (await listBtn.count()) await listBtn.first().click();
    await page.waitForTimeout(400);
    const detailBtn = page.getByRole('button', { name: '查看详情' }).first();
    if (await detailBtn.count()) {
      await detailBtn.click();
    } else {
      await page.locator('[data-testid^="member-row-"], .met-member-list__row, tr').first().click();
    }
    await page.locator('.met-member-v2-drawer, [aria-labelledby="member-v2-drawer-title"]').waitFor({ timeout: 10000 });
    await page.waitForTimeout(300);
    results.push(await shot(page, 'member-detail-drawer-1440x900-final.png'));
    await page.keyboard.press('Escape');

    // 7 staff workbench
    await openModule(page, '师资与团队');
    await page.getByTestId('staff-v2-root').waitFor();
    const reset = page.getByTestId('staff-reset-test-data');
    if (await reset.count()) {
      await reset.click();
      await page.waitForTimeout(300);
    }
    results.push(await shot(page, 'staff-workbench-1440x900-final.png'));

    // also copy into p11 folder aliases for continuity
    for (const file of results) {
      const base = path.basename(file);
      fs.copyFileSync(file, path.join('tmp/ui-density-p11', base));
    }

    console.log('SHOTS');
    results.forEach(f => console.log(f));
    console.log('P12_SHOTS_OK');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
