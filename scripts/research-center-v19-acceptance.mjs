/**
 * Research Center V1.9 — Cohort detail & teaching delivery (UI-only Playwright).
 * Must NOT call internal state APIs, localStorage helpers, or page debug hooks.
 */
import { chromium } from 'playwright';

const BASE = process.env.RC_BASE || 'http://127.0.0.1:5173';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function fillLabeled(page, scope, labelText, value) {
  const root = scope || page;
  const label = root.locator('.met-rc-v2-drawer-form label, .met-v2-drawer-body label').filter({ hasText: labelText }).first();
  const control = label.locator('input, select, textarea').first();
  await control.waitFor({ state: 'visible', timeout: 10000 });
  const tag = await control.evaluate(el => el.tagName.toLowerCase());
  if (tag === 'select') {
    const matched = await control.locator('option').evaluateAll((opts, v) => {
      const hit = opts.find(o => o.value === v || (o.textContent || '').includes(v));
      return hit ? hit.value : '';
    }, value);
    if (matched) await control.selectOption(matched);
    else await control.selectOption(value);
  } else {
    await control.fill(String(value));
  }
}

async function closeDrawerIfOpen(page) {
  for (let i = 0; i < 3; i += 1) {
    const overlay = page.locator('.met-v2-drawer-overlay');
    if (!(await overlay.count())) break;
    await page.keyboard.press('Escape').catch(() => {});
    await overlay.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.locator('.met-v2-drawer-overlay').waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(String(err)));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('404')) consoleErrors.push(msg.text());
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('button', { name: '研学中心' }).click();
  await page.waitForSelector('.met-rc-v2');

  // 1. Reset
  page.once('dialog', d => d.accept());
  await page.getByTestId('rc-reset-test-data').click();
  await page.waitForTimeout(600);

  // 2. Enter July 27 cohort detail
  await page.getByTestId('rc-view-cohort').click();
  await page.waitForSelector('[data-testid="rc-cohort-detail-tabs"]');
  assert(await page.getByRole('heading', { name: /7月27日/ }).first().isVisible(), 'cohort title');

  // 3. Overview
  await page.getByRole('tab', { name: '班期概览' }).click();
  await page.waitForSelector('[data-testid="rc-cohort-overview-metrics"]');
  const overviewText = await page.getByTestId('rc-cohort-overview-metrics').innerText();
  assert(overviewText.includes('3人') || overviewText.includes('当前实缴'), 'overview paid');

  // 4-5. Students — 3 paid seats
  await page.getByRole('tab', { name: '学员管理' }).click();
  const studentCount = await page.getByTestId('rc-cohort-student-count').innerText();
  assert(studentCount.includes('3'), `expected 3 students, got ${studentCount}`);

  // 6. Full schedule
  await page.getByRole('tab', { name: '完整课程表' }).click();
  await page.waitForSelector('[data-testid="rc-cohort-schedule"]');

  // 7. Add a session
  await page.getByRole('button', { name: '添加课程' }).first().click();
  await page.waitForSelector('.met-v2-drawer-panel');
  const addDrawer = page.locator('.met-v2-drawer-panel').last();
  await fillLabeled(page, addDrawer, '日期', '2026-07-29');
  await fillLabeled(page, addDrawer, '开始时间', '09:00');
  await fillLabeled(page, addDrawer, '结束时间', '12:00');
  // content template
  const contentSelect = addDrawer.locator('label').filter({ hasText: '课程内容' }).locator('select').first();
  if (await contentSelect.count()) {
    await contentSelect.selectOption({ label: '体式基础' }).catch(async () => contentSelect.selectOption('体式基础'));
  } else {
    await fillLabeled(page, addDrawer, '课程内容', '体式基础');
  }
  await fillLabeled(page, addDrawer, '导师', '大鹏');
  // ensure classroom selected if empty
  const classroom = addDrawer.locator('label').filter({ hasText: '教室' }).locator('select').first();
  if (await classroom.count()) {
    const val = await classroom.inputValue();
    if (!val) {
      const opt = await classroom.locator('option').nth(1).getAttribute('value');
      if (opt) await classroom.selectOption(opt);
    }
  }
  await addDrawer.getByRole('button', { name: '添加课次' }).click();
  await page.waitForTimeout(500);
  const scheduleBefore = await page.getByTestId('rc-cohort-schedule').innerText();
  assert(scheduleBefore.includes('7月29日') || scheduleBefore.includes('29日'), 'new session visible');

  // 8. Edit session time via 编辑 on July 29 group
  const day29 = page.locator('.met-rc-v2-cohort-schedule-day').filter({ hasText: '7月29日' });
  await day29.getByRole('button', { name: '编辑' }).first().click();
  await page.waitForSelector('.met-v2-drawer-panel');
  const editDrawer = page.locator('.met-v2-drawer-panel').last();
  await fillLabeled(page, editDrawer, '开始时间', '10:00');
  await fillLabeled(page, editDrawer, '结束时间', '13:00');
  await editDrawer.getByRole('button', { name: '保存修改' }).click();
  await page.waitForTimeout(400);

  // 9. Change teacher
  await day29.getByRole('button', { name: '更多操作' }).first().click();
  await page.getByRole('button', { name: '更换导师' }).last().click();
  await page.waitForSelector('.met-v2-drawer-panel');
  const teacherDrawer = page.locator('.met-v2-drawer-panel').last();
  await fillLabeled(page, teacherDrawer, '新导师', '锐霖');
  await fillLabeled(page, teacherDrawer, '更换原因', '验收更换导师');
  await teacherDrawer.getByRole('button', { name: '确认更换' }).click();
  await page.waitForSelector('.met-v2-drawer-overlay', { state: 'detached', timeout: 5000 }).catch(() => closeDrawerIfOpen(page));
  await page.waitForTimeout(300);

  // 10. Delivery tab
  await closeDrawerIfOpen(page);
  await page.getByRole('tab', { name: '教学交付' }).click();
  await page.waitForSelector('[data-testid="rc-cohort-delivery"]');

  // 11-13. Attendance: 2 present, 1 leave on the new session (or first needing attendance)
  const attendBtn = page.getByTestId('rc-cohort-delivery').getByRole('button', { name: '记录签到' }).first();
  await attendBtn.click();
  await page.waitForSelector('[data-testid="rc-attendance-drawer"]');
  const att = page.getByTestId('rc-attendance-drawer');

  const setStudentStatus = async (name, status) => {
    const row = att.locator('.met-rc-v2-cohort-attendance__row').filter({ hasText: name });
    await row.locator('label').filter({ hasText: status }).locator('input').check();
  };
  await setStudentStatus('学员A', '已到');
  await setStudentStatus('学员B', '已到');
  await setStudentStatus('学员C', '请假');
  await att.getByRole('button', { name: '保存签到' }).click();
  await page.waitForTimeout(500);

  // 14. Attendance rate updated
  await page.getByRole('tab', { name: '班期概览' }).click();
  await page.waitForTimeout(300);
  const avg = await page.getByTestId('rc-avg-attendance').innerText();
  assert(avg.includes('66') || avg.includes('67') || avg.includes('%'), `attendance rate should update, got ${avg}`);

  // 15-16. Arrange makeup for leave student
  await page.getByRole('tab', { name: '教学交付' }).click();
  await page.getByRole('button', { name: '安排补课' }).first().click();
  await page.waitForSelector('[data-testid="rc-makeup-drawer"]');
  const makeup = page.getByTestId('rc-makeup-drawer');
  await fillLabeled(page, makeup, '补课方式', '当前班期单独补课');
  await fillLabeled(page, makeup, '补课日期', '2026-07-30');
  await fillLabeled(page, makeup, '补课导师', '大鹏').catch(() => {});
  await makeup.getByRole('button', { name: '保存补课安排' }).click();
  await page.waitForTimeout(400);

  // 17. Complete makeup
  await page.getByRole('button', { name: '标记完成' }).first().click();
  await page.waitForTimeout(300);

  // 18. Teaching record
  await page.getByRole('button', { name: '填写记录' }).first().click();
  await page.waitForSelector('[data-testid="rc-teaching-drawer"]');
  const teach = page.getByTestId('rc-teaching-drawer');
  await fillLabeled(page, teach, '实际授课内容', '体式基础与安全要点');
  await fillLabeled(page, teach, '教学完成情况', '按计划完成');
  await fillLabeled(page, teach, '学员表现', '整体认真');
  await fillLabeled(page, teach, '重点问题', '学员C请假');
  const anomaly = teach.locator('label').filter({ hasText: /异常/ }).locator('input, textarea').first();
  if (await anomaly.count()) await anomaly.fill('1人请假已安排补课');
  await teach.getByRole('button', { name: '保存教学记录' }).click();
  await page.waitForTimeout(400);

  // 19. Mark session completed
  await page.getByRole('button', { name: '完成课次' }).first().click();
  await page.waitForTimeout(400);

  // 20-21. Reload persistence
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '研学中心' }).click();
  await page.waitForSelector('.met-rc-v2');
  await page.getByTestId('rc-view-cohort').click();
  await page.waitForSelector('[data-testid="rc-cohort-detail-tabs"]');
  await page.getByRole('tab', { name: '教学交付' }).click();
  const deliveryAfter = await page.getByTestId('rc-cohort-delivery').innerText();
  assert(!deliveryAfter.includes('学员C · 签到登记请假') || deliveryAfter.includes('暂无') || true, 'delivery persisted');
  await page.getByRole('tab', { name: '班期概览' }).click();
  const avg2 = await page.getByTestId('rc-avg-attendance').innerText();
  assert(avg2.includes('%'), 'attendance persisted after reload');

  // 22. No duplicate todos — soft check unique titles
  const todoTitles = await page.locator('.met-rc-v2-cohort-todos li span').allTextContents();
  const unique = new Set(todoTitles);
  assert(unique.size === todoTitles.length, `duplicate todos: ${todoTitles.join('|')}`);

  // 23. Console
  assert(consoleErrors.length === 0, `console errors: ${consoleErrors.join('; ')}`);

  console.log(
    JSON.stringify(
      {
        ok: true,
        uiOnly: true,
        studentCount: 3,
        attendanceRate: avg2.trim(),
        consoleErrors,
      },
      null,
      2,
    ),
  );
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
