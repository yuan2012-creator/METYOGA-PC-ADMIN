/**
 * P1.1 visual density acceptance — real browser screenshots + layout checks.
 * Does not mutate business state beyond optional staff reset for stable session rows.
 *
 * Run: node scripts/ui-density-p11-acceptance.mjs
 * Env: STAFF_BASE / BASE (default http://127.0.0.1:5173)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.STAFF_BASE || process.env.BASE || 'http://127.0.0.1:5173';
const OUT = path.resolve('tmp/ui-density-p11');
const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1600x1000', width: 1600, height: 1000 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function clickNav(page, label) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(120);
  await page.locator('.met-sidebar-v2__nav-item', { hasText: label }).click({ force: true, timeout: 10000 });
  await page.waitForTimeout(280);
}

/** Remount module by leaving and re-entering (resets internal secondary views). */
async function openModule(page, label) {
  await clickNav(page, '经营总览');
  await clickNav(page, label);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function measureStaff(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="staff-v2-root"]');
    if (!root) return { ok: false, reason: 'no staff root' };

    const rows = [...root.querySelectorAll('[data-testid^="staff-session-row-"]')];
    const rowHeights = rows.map(r => Math.round(r.getBoundingClientRect().height));
    const wrapCells = [];
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td.is-nowrap, td.is-col-date, td.is-col-time, td.is-col-store, td.is-col-teacher');
      cells.forEach(td => {
        if (td.scrollHeight > td.clientHeight + 2) {
          wrapCells.push({ row: idx, text: (td.textContent || '').trim().slice(0, 40) });
        }
      });
    });

    const ops = [...root.querySelectorAll('td.is-ops .met-v2-btn-row')];
    const stackedOps = ops.filter(el => {
      const buttons = [...el.querySelectorAll('button')];
      if (buttons.length < 2) return false;
      const tops = buttons.map(b => Math.round(b.getBoundingClientRect().top));
      return Math.max(...tops) - Math.min(...tops) > 8;
    }).length;

    const wrappedButtons = [...root.querySelectorAll('td.is-ops button, .met-v2-side-task-card__action')]
      .filter(btn => {
        const style = getComputedStyle(btn);
        if (style.whiteSpace === 'nowrap') {
          return btn.scrollWidth > btn.clientWidth + 2;
        }
        return btn.clientHeight > 36;
      })
      .map(btn => (btn.textContent || '').trim());

    const todos = [...root.querySelectorAll('.met-v2-side-task-card')];
    const todoHeights = todos.map(t => Math.round(t.getBoundingClientRect().height));
    const side = root.querySelector('.met-staff-v2-zone--side');
    const sideWidth = side ? Math.round(side.getBoundingClientRect().width) : 0;
    const summary = [...root.querySelectorAll('.met-staff-v2-summary-card')].map(c =>
      Math.round(c.getBoundingClientRect().height),
    );
    const h1 = root.querySelector('h1');
    const h1Size = h1 ? getComputedStyle(h1).fontSize : null;
    const density = [...root.classList].find(c => c.startsWith('met-v2-density-')) || null;

    return {
      ok: true,
      density,
      h1Size,
      rowCount: rows.length,
      rowHeights,
      maxRowHeight: rowHeights.length ? Math.max(...rowHeights) : 0,
      wrapCells,
      stackedOps,
      wrappedButtons,
      todoHeights,
      maxTodoHeight: todoHeights.length ? Math.max(...todoHeights) : 0,
      sideWidth,
      summaryHeights: summary,
    };
  });
}

async function pageMeta(page) {
  return page.evaluate(() => {
    const root =
      document.querySelector('[class*="met-v2-density-"]') ||
      document.querySelector('[class^="met-"]');
    const density = root
      ? [...root.classList].find(c => c.startsWith('met-v2-density-')) || null
      : null;
    const h1 = document.querySelector('main h1, [class*="__header"] h1, h1');
    const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2;
    return {
      density,
      h1: h1 ? (h1.textContent || '').trim().slice(0, 40) : null,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      overflowX,
      title: document.title,
    };
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  }

  const report = { base: BASE, shots: [], staffChecks: [], pages: [], failures: [] };
  const page = await browser.newPage({ viewport: VIEWPORTS[0] });

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(800);

    // Staff deep check at each viewport
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await clickNav(page, '师资与团队');
      await page.getByTestId('staff-v2-root').waitFor({ timeout: 20000 });
      if (vp.name === '1440x900') {
        const reset = page.getByTestId('staff-reset-test-data');
        if (await reset.count()) {
          await reset.click();
          await page.waitForTimeout(400);
        }
      }
      const m = await measureStaff(page);
      report.staffChecks.push({ viewport: vp.name, ...m });
      const shotName = `staff-workbench-${vp.name}`;
      report.shots.push(await shot(page, shotName));

      if (!m.ok) report.failures.push(`${vp.name}: staff root missing`);
      if (m.maxRowHeight > 72) report.failures.push(`${vp.name}: session row height ${m.maxRowHeight}px > 72`);
      if (m.wrapCells?.length) report.failures.push(`${vp.name}: nowrap cells wrapping ${JSON.stringify(m.wrapCells)}`);
      if (m.stackedOps > 0) report.failures.push(`${vp.name}: stacked ops rows=${m.stackedOps}`);
      if (m.wrappedButtons?.length) report.failures.push(`${vp.name}: wrapped buttons ${m.wrappedButtons.join(',')}`);
      if (m.maxTodoHeight > 118) report.failures.push(`${vp.name}: todo card ${m.maxTodoHeight}px`);
      if (vp.width >= 1440 && (m.sideWidth < 300 || m.sideWidth > 380)) {
        report.failures.push(`${vp.name}: side width ${m.sideWidth} not in 300–380`);
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });

    const pages = [
      {
        id: 'dashboard',
        go: async () => clickNav(page, '经营总览'),
      },
      {
        id: 'today',
        go: async () => openModule(page, '今日运营'),
      },
      {
        id: 'member',
        go: async () => openModule(page, '会员经营'),
      },
      {
        id: 'member-list',
        go: async () => {
          await openModule(page, '会员经营');
          const btn = page.getByRole('button', { name: /会员名单|会员列表/ });
          if (await btn.count()) await btn.first().click();
          await page.waitForTimeout(400);
        },
      },
      {
        id: 'course',
        go: async () => openModule(page, '课程与排课'),
      },
      {
        id: 'week-schedule',
        go: async () => {
          await openModule(page, '课程与排课');
          await page.getByRole('button', { name: /完整周排课/ }).first().click();
          await page.getByTestId('course-week-root').waitFor({ timeout: 15000 });
        },
      },
      {
        id: 'course-session-drawer',
        go: async () => {
          await openModule(page, '课程与排课');
          await page.getByRole('button', { name: /完整周排课/ }).first().click();
          await page.getByTestId('course-week-root').waitFor({ timeout: 15000 });
          const card = page.locator('[data-testid^="course-session-card-"]').first();
          await card.click();
          await page.waitForTimeout(400);
        },
      },
      {
        id: 'staff',
        go: async () => {
          await openModule(page, '师资与团队');
          await page.getByTestId('staff-v2-root').waitFor();
        },
      },
      {
        id: 'teacher-applications',
        go: async () => {
          await openModule(page, '师资与团队');
          await page.getByTestId('staff-open-applications').click();
          await page.waitForTimeout(500);
        },
      },
      {
        id: 'assign-drawer',
        go: async () => {
          await openModule(page, '师资与团队');
          await page.getByTestId('staff-v2-root').waitFor();
          const assign = page
            .locator(
              '[data-testid^="staff-assign-"], [data-testid^="staff-replace-"], [data-testid^="staff-view-teachers-"]',
            )
            .first();
          await assign.click();
          await page.waitForTimeout(500);
        },
      },
      {
        id: 'teacher-profile',
        go: async () => {
          await openModule(page, '师资与团队');
          await page.getByTestId('staff-v2-root').waitFor();
          const link = page.locator('.met-staff-v2-link').first();
          if (await link.count()) await link.click();
          await page.waitForTimeout(500);
        },
      },
      {
        id: 'finance',
        go: async () => openModule(page, '财务与资产'),
      },
      {
        id: 'product-rights',
        go: async () => openModule(page, '产品与权益'),
      },
      {
        id: 'marketing',
        go: async () => openModule(page, '活动与获客'),
      },
      {
        id: 'research-operation',
        go: async () => {
          await openModule(page, '研学中心');
          await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '经营操作' }).click();
          await page.waitForTimeout(400);
        },
      },
      {
        id: 'research-leads',
        go: async () => {
          await openModule(page, '研学中心');
          await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '招生跟进' }).click();
          await page.waitForTimeout(400);
        },
      },
      {
        id: 'research-finance-profit',
        go: async () => {
          await openModule(page, '研学中心');
          await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '财务分析' }).click();
          await page.waitForTimeout(300);
          await page.locator('.met-rc-v2-unified-nav__subtab', { hasText: '班期盈利' }).click();
          await page.waitForTimeout(300);
        },
      },
      {
        id: 'research-finance-cash',
        go: async () => {
          await openModule(page, '研学中心');
          await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '财务分析' }).click();
          await page.waitForTimeout(300);
          await page.locator('.met-rc-v2-unified-nav__subtab', { hasText: '现金计划' }).click();
          await page.waitForTimeout(300);
        },
      },
      {
        id: 'research-finance-renovation',
        go: async () => {
          await openModule(page, '研学中心');
          await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '财务分析' }).click();
          await page.waitForTimeout(300);
          await page.locator('.met-rc-v2-unified-nav__subtab', { hasText: '成本与回本' }).click();
          await page.waitForTimeout(300);
        },
      },
      {
        id: 'research-cohort',
        go: async () => {
          await openModule(page, '研学中心');
          await page.locator('.met-rc-v2-unified-nav__tab', { hasText: '经营操作' }).click();
          await page.waitForTimeout(300);
          const open = page.getByRole('button', { name: /查看班期/ }).first();
          if (await open.count()) await open.click();
          await page.waitForTimeout(500);
        },
      },
      {
        id: 'settings',
        go: async () => openModule(page, '系统设置'),
      },
    ];

    for (const p of pages) {
      try {
        await p.go();
        await page.waitForTimeout(250);
        const meta = await pageMeta(page);
        const file = await shot(page, `page-${p.id}-1440`);
        report.pages.push({ id: p.id, ...meta, shot: file });
        if (meta.overflowX) report.failures.push(`${p.id}: horizontal overflow`);
      } catch (err) {
        report.failures.push(`${p.id}: ${err.message}`);
        try {
          report.shots.push(await shot(page, `page-${p.id}-ERROR`));
        } catch {
          /* ignore */
        }
      }
    }

    // Extra viewports for a few key pages
    for (const vp of VIEWPORTS.slice(1)) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const label of ['经营总览', '师资与团队', '研学中心']) {
        await clickNav(page, label);
        await page.waitForTimeout(250);
        const id = label === '经营总览' ? 'dashboard' : label === '师资与团队' ? 'staff' : 'research';
        report.shots.push(await shot(page, `page-${id}-${vp.name}`));
      }
    }

    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

    console.log('OUT_DIR', OUT);
    console.log('STAFF_CHECKS', JSON.stringify(report.staffChecks, null, 2));
    console.log('PAGES', report.pages.map(p => `${p.id}|${p.density}|${p.h1FontSize}|overflow=${p.overflowX}`).join('\n'));
    if (report.failures.length) {
      console.error('FAILURES');
      report.failures.forEach(f => console.error('-', f));
      process.exitCode = 1;
    } else {
      console.log('UI_DENSITY_P11_OK');
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
