/**
 * P1.3 final shots + first-screen metrics for week schedule / research.
 * Run: node scripts/ui-density-p13-final-shots.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.STAFF_BASE || process.env.BASE || 'http://127.0.0.1:5173';
const OUT = path.resolve('tmp/ui-density-p13');

async function clickNav(page, label) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(80);
  await page.locator('.met-sidebar-v2__nav-item', { hasText: label }).click({ force: true, timeout: 10000 });
  await page.waitForTimeout(280);
}

async function openModule(page, label) {
  await clickNav(page, '经营总览');
  await clickNav(page, label);
}

async function measureWeek(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="course-week-root"]') || document.querySelector('.met-week-schedule');
    if (!root) return { error: 'no-root' };
    const vh = window.innerHeight;
    const rectOf = sel => {
      const el = root.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) };
    };
    const cards = [...root.querySelectorAll('.met-week-schedule__card')];
    const fullyVisible = cards.filter(c => {
      const r = c.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= vh && r.height > 40;
    }).length;
    return {
      viewport: { w: window.innerWidth, h: vh },
      header: rectOf('.met-week-schedule__page-header'),
      kpi: rectOf('.met-week-schedule__kpi-strip'),
      filters: rectOf('.met-week-schedule__filters'),
      alerts: rectOf('.met-week-schedule__alerts'),
      grid: rectOf('.met-week-schedule__grid'),
      cardCount: cards.length,
      fullyVisibleSessions: fullyVisible,
      sampleCardH: cards[0] ? Math.round(cards[0].getBoundingClientRect().height) : null,
    };
  });
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
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  const results = [];
  let metrics1440 = null;

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(700);

    await openModule(page, '课程与排课');
    await page.getByRole('button', { name: /完整周排课/ }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 15000 });
    await page.waitForTimeout(400);
    metrics1440 = await measureWeek(page);
    results.push(await shot(page, 'course-week-1440x900-p13-final.png'));

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(200);
    results.push(await shot(page, 'course-week-1920x1080-p13-final.png'));
    await page.setViewportSize({ width: 1440, height: 900 });

    await openModule(page, '研学中心');
    await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '经营操作' }).click();
    await page.waitForTimeout(400);
    results.push(await shot(page, 'research-operation-1440x900-p13-final.png'));

    await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '财务分析' }).click();
    await page.waitForTimeout(300);
    await page.locator('.met-rc-v2-unified-nav__subtab', { hasText: '班期盈利' }).click();
    await page.waitForTimeout(300);
    results.push(await shot(page, 'research-finance-1440x900-p13-final.png'));

    fs.writeFileSync(
      path.join(OUT, 'report.json'),
      JSON.stringify({ metrics1440, consoleErrors, results }, null, 2),
    );

    console.log('METRICS_1440', JSON.stringify(metrics1440, null, 2));
    console.log('SHOTS');
    results.forEach(f => console.log(f));
    console.log('CONSOLE_ERRORS', consoleErrors.length ? consoleErrors : 'none');
    if ((metrics1440?.fullyVisibleSessions ?? 0) < 4) {
      console.error('FAIL: first screen sessions < 4');
      process.exitCode = 1;
    } else {
      console.log('P13_SHOTS_OK');
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
