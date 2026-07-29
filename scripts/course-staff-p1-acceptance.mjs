/**
 * Course ↔ Staff P1 UI-only Playwright acceptance.
 * Must NOT call internal state APIs / localStorage / debug hooks.
 *
 * Prerequisites: vite dev server (default http://127.0.0.1:5173 or STAFF_BASE env)
 * Run: node scripts/course-staff-p1-acceptance.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.STAFF_BASE || process.env.COURSE_BASE || 'http://127.0.0.1:5173';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('404')) consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(String(err)));

  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  const steps = [];
  const GAP_SESSION = 'sess_gap_evening_flow';
  const LEAVE_SESSION = 'sess_nora_leave';

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    steps.push('loaded');

    // Reset staff test data
    await page.getByRole('button', { name: '师资与团队' }).click();
    await page.getByTestId('staff-v2-root').waitFor({ timeout: 20000 });
    await page.getByTestId('staff-reset-test-data').click();
    await page.waitForTimeout(500);
    steps.push('staff-reset');

    // Reset course test data
    await page.getByRole('button', { name: '课程与排课' }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: '完整周排课' }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 20000 });
    await page.getByTestId('course-reset-test-data').click();
    await page.waitForTimeout(500);
    steps.push('course-reset');

    // Open gap session card
    const gapCard = page.getByTestId(`course-session-card-${GAP_SESSION}`);
    await gapCard.waitFor({ timeout: 15000 });
    const gapBefore = await gapCard.innerText();
    assert(gapBefore.includes('缺老师') || gapBefore.includes('待指定'), 'gap card should show missing teacher');
    steps.push('gap-visible');

    // Assign via staff navigation
    await page.getByTestId(`course-assign-${GAP_SESSION}`).click();
    await page.getByTestId('staff-assign-drawer').waitFor({ timeout: 15000 });
    steps.push('navigated-staff-assign');

    const candidate = page
      .locator('[data-testid^="staff-candidate-"][data-disabled="false"]')
      .first();
    const candidateName = (await candidate.innerText()).split('\n')[0].trim();
    await candidate.click();
    await page.getByTestId('staff-assign-save').click();
    await page.waitForTimeout(600);
    steps.push('assigned-gap');

    // Return to course week schedule
    await page.getByRole('button', { name: '课程与排课' }).click();
    await page.getByRole('button', { name: '完整周排课' }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 20000 });
    const gapAfter = await page.getByTestId(`course-session-card-${GAP_SESSION}`).innerText();
    assert(
      gapAfter.includes(candidateName),
      `gap card should show assigned teacher (${candidateName})`,
    );
    assert(!gapAfter.includes('缺老师'), 'gap should be cleared after assign');
    steps.push('course-teacher-updated');

    // Leave application flow
    await page.getByRole('button', { name: '师资与团队' }).click();
    await page.getByTestId('staff-v2-root').waitFor({ timeout: 20000 });
    await page.getByTestId('staff-open-applications').click();
    await page.getByTestId('staff-app-row-TA-20260727-001').waitFor({ timeout: 15000 });
    await page.getByTestId('staff-app-row-TA-20260727-001').click();
    await page.getByTestId('staff-application-drawer').waitFor();
    await page.getByTestId('staff-app-action-approve').click();
    await page.getByTestId('staff-app-confirm-sessions').check();
    await page.getByTestId('staff-app-substitute').selectOption({ value: '' });
    await page.getByTestId('staff-app-comment').fill('同意请假，待安排代课');
    await page.getByTestId('staff-app-submit').click();
    await page.waitForTimeout(1000);
    steps.push('leave-approved');

    // Verify 待替代 on course — open detail if card text is ambiguous
    await page.getByRole('button', { name: '课程与排课' }).click();
    await page.getByRole('button', { name: '完整周排课' }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 20000 });
    await page.waitForTimeout(500);
    const leaveCard = page.getByTestId(`course-session-card-${LEAVE_SESSION}`);
    await leaveCard.waitFor({ timeout: 15000 });
    let leaveText = await leaveCard.innerText();
    if (!leaveText.includes('待替代')) {
      await page.getByTestId(`course-detail-${LEAVE_SESSION}`).click();
      await page.getByTestId('course-session-drawer').waitFor({ timeout: 10000 });
      leaveText = await page.getByTestId('course-session-drawer').innerText();
      await page.getByTestId('course-session-drawer').getByLabel('关闭').click();
    }
    assert(leaveText.includes('待替代'), `leave session should show 待替代; got: ${leaveText.slice(0, 120)}`);
    steps.push('pending-replacement');

    // Assign substitute from staff
    await page.getByRole('button', { name: '师资与团队' }).click();
    await page.getByTestId('staff-v2-root').waitFor({ timeout: 20000 });
    await page.getByTestId('staff-assign-sa-leave-1').click();
    await page.getByTestId('staff-assign-drawer').waitFor();
    const subCandidate = page
      .locator('[data-testid^="staff-candidate-"][data-disabled="false"]')
      .first();
    await subCandidate.click();
    await page.getByTestId('staff-assign-save').click();
    await page.waitForTimeout(600);
    steps.push('substitute-assigned');

    // Verify 代课 on course
    await page.getByRole('button', { name: '课程与排课' }).click();
    await page.getByRole('button', { name: '完整周排课' }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 20000 });
    const leaveAfterSub = await page.getByTestId(`course-session-card-${LEAVE_SESSION}`).innerText();
    assert(leaveAfterSub.includes('代课'), 'substitute session should show 代课 badge');
    steps.push('substitute-badge');

    // Reload and verify persistence
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '课程与排课' }).click();
    await page.getByRole('button', { name: '完整周排课' }).first().click();
    await page.getByTestId('course-week-root').waitFor({ timeout: 20000 });
    const gapReload = await page.getByTestId(`course-session-card-${GAP_SESSION}`).innerText();
    assert(gapReload.includes(candidateName), 'gap assign should persist after reload');
    const leaveReload = await page.getByTestId(`course-session-card-${LEAVE_SESSION}`).innerText();
    assert(leaveReload.includes('代课'), 'substitute should persist after reload');
    steps.push('persisted');

    const redErrors = consoleErrors.filter(
      e =>
        !e.includes('Download the React DevTools') &&
        !e.includes('favicon') &&
        !e.includes('404') &&
        !/Warning:/.test(e),
    );
    assert(redErrors.length === 0, `console errors: ${redErrors.join(' | ')}`);
    steps.push('console-clean');

    console.log(JSON.stringify({ ok: true, steps, candidateName }, null, 2));
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: String(err), steps, consoleErrors }, null, 2));
    await browser.close();
    process.exit(1);
  }
}

main();
