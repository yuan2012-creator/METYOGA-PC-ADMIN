/**
 * Staff V2.1 / V2.1.1 UI-only Playwright acceptance.
 * Must NOT call internal state APIs / localStorage / debug hooks.
 *
 * Prerequisites: vite dev server on STAFF_BASE (default http://127.0.0.1:3000)
 * Run: STAFF_BASE=http://127.0.0.1:3000 node scripts/staff-v21-acceptance.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.STAFF_BASE || 'http://127.0.0.1:3000';

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
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    steps.push('loaded');

    await page.getByRole('button', { name: '师资与团队' }).click();
    await page.getByTestId('staff-v2-root').waitFor({ timeout: 20000 });
    steps.push('entered-staff');

    // No technical jargon on first screen
    const rootText = await page.getByTestId('staff-v2-root').innerText();
    assert(!rootText.includes('staff_xxx'), 'should not show staff_xxx');
    assert(!rootText.includes('前端原型持久化'), 'should not show prototype jargon');
    assert(!/cap_[a-z_]+/.test(rootText), 'should not show capability ids on workbench');
    steps.push('no-tech-jargon');

    await page.getByTestId('staff-reset-test-data').click();
    await page.waitForTimeout(500);
    steps.push('reset');

    await page.getByTestId('staff-workbench-metrics').waitFor();
    for (const id of ['m1', 'm2', 'm3', 'm4']) {
      const text = await page.getByTestId(`staff-metric-${id}`).innerText();
      assert(/\d/.test(text), `metric ${id} should show number`);
    }
    steps.push('metrics');

    // Pending sessions visible; gaps section removed
    await page.getByTestId('staff-schedule-window').waitFor();
    assert(
      (await page.getByTestId('staff-gaps-conflicts').count()) === 0,
      'gaps section should be merged away',
    );
    steps.push('pending-sessions');

    const gapBeforeText = await page.getByTestId('staff-metric-m2').innerText();
    const gapBefore = Number((gapBeforeText.match(/\d+/) || ['0'])[0]);

    await page.getByTestId('staff-assign-sa-gap-1').click();
    await page.getByTestId('staff-assign-drawer').waitFor();
    const drawerText = await page.getByTestId('staff-assign-drawer').innerText();
    assert(!drawerText.includes('cap_'), 'assign drawer must not show capability ids');
    assert(!drawerText.includes('staff_'), 'assign drawer must not show staff ids');
    assert(!drawerText.includes('psess'), 'assign drawer must not show session ids');

    const candidate = page
      .locator('[data-testid^="staff-candidate-"][data-disabled="false"]')
      .first();
    await candidate.click();
    await page.getByTestId('staff-assign-save').click();
    await page.waitForTimeout(500);
    steps.push('assigned');

    const gapAfterText = await page.getByTestId('staff-metric-m2').innerText();
    const gapAfter = Number((gapAfterText.match(/\d+/) || ['0'])[0]);
    assert(gapAfter < gapBefore, `gap should decrease (${gapBefore} -> ${gapAfter})`);
    steps.push('gap-decreased');

    await page.getByTestId('staff-open-applications').click();
    await page.getByTestId('staff-app-row-TA-20260727-001').waitFor({ timeout: 15000 });
    steps.push('applications');

    await page.getByTestId('staff-app-row-TA-20260727-001').click();
    await page.getByTestId('staff-application-drawer').waitFor();
    const appText = await page.getByTestId('staff-application-drawer').innerText();
    assert(!appText.includes('staff_'), 'application drawer must not show staff ids');
    assert(!appText.includes('psess'), 'application drawer must not show session ids');

    await page.getByTestId('staff-app-more-toggle').click();
    await page.getByTestId('staff-app-owner-id').selectOption({ label: 'Anna' });
    await page.getByTestId('staff-app-assign-owner').click();
    await page.waitForTimeout(300);
    steps.push('owner-assigned');

    await page.getByTestId('staff-app-action-approve').click();
    await page.getByTestId('staff-app-confirm-sessions').check();
    await page.getByTestId('staff-app-substitute').selectOption({ label: '一丹 · T2' });
    await page.getByTestId('staff-app-comment').fill('同意请假并安排代课');
    await page.getByTestId('staff-app-submit').click();
    await page.waitForTimeout(500);
    steps.push('approved');

    // Re-open processed application — no repeat approve action pills
    await page.getByTestId('staff-app-row-TA-20260727-001').click();
    await page.getByTestId('staff-application-drawer').waitFor();
    assert(
      (await page.getByTestId('staff-app-action-approve').count()) === 0,
      'processed application should not show approve action',
    );
    await page.getByLabel('关闭申请').click();
    steps.push('no-repeat-approve');

    await page.getByRole('button', { name: /返回师资与团队/ }).click();
    await page.getByTestId('staff-v2-root').waitFor();
    await page.getByTestId('staff-view-archive').click();
    await page.getByTestId('staff-open-detail-staff_mia').click();
    await page.getByTestId('staff-teacher-drawer').waitFor();
    const detailText = await page.getByTestId('staff-teacher-drawer').innerText();
    assert(!detailText.includes('staff_mia'), 'teacher detail must not show internal id');

    // Toggle support store 滨江馆 and capability 肩颈舒缓
    await page
      .getByTestId('staff-edit-support-stores')
      .locator('label')
      .filter({ hasText: '滨江馆' })
      .click();
    const neckLabel = page
      .getByTestId('staff-edit-capabilities')
      .locator('label')
      .filter({ hasText: '肩颈舒缓' });
    if (!(await neckLabel.locator('input').isChecked())) {
      await neckLabel.click();
    }
    await page.getByTestId('staff-edit-profile').click();
    await page.waitForTimeout(400);
    steps.push('profile-edited');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: '师资与团队' }).click();
    await page.getByTestId('staff-v2-root').waitFor({ timeout: 20000 });
    await page.getByTestId('staff-view-archive').click();
    await page.getByTestId('staff-open-detail-staff_mia').click();
    const supportChecked = await page
      .getByTestId('staff-edit-support-stores')
      .locator('label')
      .filter({ hasText: '滨江馆' })
      .locator('input')
      .isChecked();
    assert(supportChecked, 'support store 滨江馆 should persist');
    const neckChecked = await page
      .getByTestId('staff-edit-capabilities')
      .locator('label')
      .filter({ hasText: '肩颈舒缓' })
      .locator('input')
      .isChecked();
    assert(neckChecked, 'capability 肩颈舒缓 should persist');
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

    console.log(JSON.stringify({ ok: true, steps, gapBefore, gapAfter }, null, 2));
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: String(err), steps, consoleErrors }, null, 2));
    await browser.close();
    process.exit(1);
  }
}

main();
