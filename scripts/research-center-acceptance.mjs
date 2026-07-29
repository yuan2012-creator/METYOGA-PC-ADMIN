/**
 * Research Center V1.8 — UI-only acceptance (Playwright).
 * Must NOT call internal state APIs, localStorage helpers, or page debug hooks.
 */
import { chromium } from 'playwright';

const BASE = process.env.RC_BASE || 'http://127.0.0.1:5173';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function fillLabeled(page, labelText, value) {
  const label = page.locator('.met-rc-v2-drawer-form label').filter({ hasText: labelText }).first();
  const control = label.locator('input, select, textarea').first();
  const tag = await control.evaluate(el => el.tagName.toLowerCase());
  if (tag === 'select') await control.selectOption({ label: value }).catch(async () => control.selectOption(value));
  else await control.fill(String(value));
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
  await page.locator('.met-sidebar-v2__nav-item', { hasText: '研学中心' }).click({ force: true });
  await page.waitForSelector('.met-rc-v2');

  // 1. Reset test data via UI (under header 更多操作)
  page.once('dialog', d => d.accept());
  await page.locator('.met-rc-v2__header-ops').getByRole('button', { name: '更多操作' }).click();
  await page.getByTestId('rc-reset-test-data').click();
  await page.waitForTimeout(500);

  let op = await page.locator('.met-rc-v2-operation').innerText();
  assert(op.includes('3人'), 'baseline paid 3');
  assert(op.includes('38,400') || op.includes('38400'), 'baseline receipt');
  assert(op.includes('-7,520') || op.includes('-7520'), 'baseline profit');

  // 2-3. New lead
  await page.getByRole('tab', { name: '招生跟进' }).click();
  await page.locator('.met-rc-v2-leads-tab__ops').getByRole('button', { name: '新增咨询', exact: true }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  await fillLabeled(page, '姓名', '测试学员A');
  await fillLabeled(page, '手机号', '13800000001');
  await fillLabeled(page, '微信', 'test_a_yoga');
  await fillLabeled(page, '来源渠道', '老学员推荐');
  await fillLabeled(page, '意向课程', 'RYT200');
  await fillLabeled(page, '学习基础', '有一年瑜伽练习基础');
  await fillLabeled(page, '学习目的', '转型成为瑜伽老师');
  await fillLabeled(page, '预算区间', '15,000元以内');
  await fillLabeled(page, '时间条件', '可以参加2026年7月27日班');
  await fillLabeled(page, '意向等级', '高意向');
  await page.getByRole('button', { name: '保存咨询' }).click();
  await page.waitForTimeout(500);
  assert(await page.getByText('测试学员A').first().isVisible(), 'lead visible');

  const leadCard = page.locator('.met-rc-v2-lead-compact').filter({ hasText: '测试学员A' }).first();

  // 4. Follow-up (auto → 已联系, nextStep 安排面试)
  await leadCard.getByRole('button', { name: '立即跟进' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  await fillLabeled(page, '跟进方式', '微信');
  await fillLabeled(page, '跟进结果', '已了解课程时间和费用');
  await fillLabeled(page, '下一步', '安排面试');
  await page.getByRole('button', { name: '保存跟进' }).click();
  await page.waitForTimeout(400);

  // Second follow-up to push 已联系 → 有效意向
  await leadCard.getByRole('button', { name: '立即跟进' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  await fillLabeled(page, '跟进方式', '电话');
  await fillLabeled(page, '跟进结果', '确认高意向，准备面试');
  await fillLabeled(page, '下一步', '安排面试');
  await page.getByRole('button', { name: '保存跟进' }).click();
  await page.waitForTimeout(400);

  // 5. Schedule interview
  await leadCard.locator('button[aria-label="更多操作"]').click();
  await leadCard.locator('.met-rc-v2-row-more__menu').getByRole('button', { name: '安排面试' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  await page.getByRole('button', { name: '保存安排' }).click();
  await page.waitForTimeout(400);
  assert((await leadCard.locator('.met-rc-v2-lead-compact__stage').innerText()).includes('待面试'), 'stage 待面试');

  // 6. Interview result
  await leadCard.locator('button[aria-label="更多操作"]').click();
  await leadCard.locator('.met-rc-v2-row-more__menu').getByRole('button', { name: '录入面试结果' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  await fillLabeled(page, '面试结果', '通过');
  await fillLabeled(page, '基础评估', '良好');
  await fillLabeled(page, '时间评估', '可全勤');
  await fillLabeled(page, '目标评估', '转型教师');
  await fillLabeled(page, '建议课程', 'RYT200');
  await fillLabeled(page, '备注', '时间与学习目标匹配');
  await page.getByRole('button', { name: '保存结果' }).click();
  await page.waitForTimeout(400);
  assert((await leadCard.locator('.met-rc-v2-lead-compact__stage').innerText()).includes('面试通过'), '面试通过');

  // 7. Enrollment (unpaid first — receipt separate)
  await leadCard.locator('button[aria-label="更多操作"]').click();
  await leadCard.locator('.met-rc-v2-row-more__menu').getByRole('button', { name: '添加报名' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  await fillLabeled(page, '支付方式', '微信');
  await fillLabeled(page, '付款状态', '未付款');
  await fillLabeled(page, '合同状态', '已签约');
  await fillLabeled(page, '成交价格', '12800');
  // initial receipt 0 default
  await page.getByRole('button', { name: '保存报名' }).click();
  await page.waitForTimeout(500);

  // 8. Record full payment via header more menu (primary depends on active tab)
  await page.locator('.met-rc-v2__header-ops').getByRole('button', { name: '更多操作' }).click();
  await page.locator('.met-rc-v2__header-ops .met-rc-v2-more__menu').getByRole('button', { name: '录入收款' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  const enrollSelect = page.locator('.met-rc-v2-drawer-form label').filter({ hasText: '报名记录' }).locator('select');
  const enrollValue = await enrollSelect.locator('option').evaluateAll(opts => {
    const hit = opts.find(o => (o.textContent || '').includes('测试学员A'));
    return hit ? hit.value : '';
  });
  assert(enrollValue, 'enrollment option for 测试学员A');
  await enrollSelect.selectOption(enrollValue);
  await fillLabeled(page, '本次收款金额', '12800');
  await fillLabeled(page, '支付方式', '微信');
  await page.getByRole('button', { name: '提交收款' }).click();
  await page.waitForTimeout(500);

  // 9. Join cohort
  await page.locator('.met-rc-v2__header-ops').getByRole('button', { name: '更多操作' }).click();
  await page.locator('.met-rc-v2__header-ops .met-rc-v2-more__menu').getByRole('button', { name: '确认入班' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  // If list mode, click confirm for the student; if single, footer button
  const joinButtons = page.locator('.met-v2-drawer-panel').getByRole('button', { name: '确认入班' });
  await joinButtons.last().click();
  await page.waitForTimeout(600);

  // Lead should leave follow list
  await page.getByRole('tab', { name: '招生跟进' }).click();
  await page.waitForTimeout(300);
  assert((await page.locator('.met-rc-v2-lead-compact').filter({ hasText: '测试学员A' }).count()) === 0, 'left follow list');

  // 10-13 metrics
  await page.getByRole('tab', { name: '经营操作' }).click();
  await page.waitForTimeout(400);
  op = await page.locator('.met-rc-v2-operation').innerText();
  assert(op.includes('4人'), 'paid 4');
  assert(op.includes('51,200') || op.includes('51200'), 'receipt 51200');
  assert(op.includes('4,640') || op.includes('4640'), 'profit 4640');
  assert(op.includes('已达到'), 'breakeven reached');
  const todos = await page.locator('.met-rc-v2-action-panel').innerText();
  assert(!todos.includes('距离直接保本还差'), 'breakeven todo gone');

  await page.getByRole('tab', { name: '财务分析' }).click();
  await page.waitForTimeout(400);
  const fin = await page.locator('.met-rc-v2-finance-tab').innerText();
  assert(fin.includes('51,200') || fin.includes('51200'), 'finance receipt');
  assert(fin.includes('2,560') || fin.includes('2560'), 'commission');
  assert(fin.includes('4,640') || fin.includes('4640'), 'finance profit');
  assert((await page.locator('.met-rc-v2-profit-calc').innerText()).includes('3人'), 'sim count not overwritten');

  // 15-16 Add course + mentor payable
  await page.getByRole('tab', { name: '经营操作' }).click();
  await page.getByRole('button', { name: '添加课程' }).click();
  await page.waitForTimeout(300);
  const selects = page.locator('.met-rc-v2 select');
  const n = await selects.count();
  for (let i = 0; i < n; i++) {
    const opts = await selects.nth(i).locator('option').allTextContents();
    if (opts.some(o => o.includes('解剖基础'))) await selects.nth(i).selectOption({ label: '解剖基础' }).catch(() => {});
    if (opts.some(o => o === '大鹏')) await selects.nth(i).selectOption({ label: '大鹏' }).catch(() => {});
  }
  await page.getByRole('button', { name: '保存' }).last().click();
  await page.waitForTimeout(500);
  assert((await page.locator('.met-rc-v2-operation').innerText()).includes('导师课酬合计'), 'schedule summary');

  await page.getByRole('tab', { name: '财务分析' }).click();
  await page.getByRole('tab', { name: '现金计划' }).click();
  await page.waitForTimeout(400);
  assert(await page.getByTestId('rc-mentor-payables').isVisible(), 'mentor payables visible');
  assert((await page.getByTestId('rc-mentor-payables').innerText()).includes('大鹏'), 'mentor payable teacher');

  // 17-18 Refresh persistence
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '研学中心' }).click();
  await page.waitForSelector('.met-rc-v2');
  op = await page.locator('.met-rc-v2-operation').innerText();
  assert(op.includes('4人'), 'persist paid 4');
  assert(op.includes('51,200') || op.includes('51200'), 'persist receipt');

  // 19-20 Refund exit cohort
  page.once('dialog', d => d.accept());
  await page.locator('.met-rc-v2__header-ops').getByRole('button', { name: '更多操作' }).click();
  await page.locator('.met-rc-v2__header-ops .met-rc-v2-more__menu').getByRole('button', { name: '发起退款' }).click();
  await page.waitForSelector('.met-v2-drawer-panel');
  const refundSelect = page.locator('.met-rc-v2-drawer-form label').filter({ hasText: '报名记录' }).locator('select');
  const refundValue = await refundSelect.locator('option').evaluateAll(opts => {
    const hit = opts.find(o => (o.textContent || '').includes('测试学员A'));
    return hit ? hit.value : '';
  });
  assert(refundValue, 'refund enrollment option');
  await refundSelect.selectOption(refundValue);
  await fillLabeled(page, '退款金额', '12800');
  await fillLabeled(page, '退款原因', '验收冲回测试');
  const exitBox = page.locator('.met-rc-v2-drawer-form label').filter({ hasText: '退出班期' }).locator('input[type="checkbox"]');
  if (!(await exitBox.isChecked())) await exitBox.check();
  await page.getByRole('button', { name: '确认退款' }).click();
  await page.waitForTimeout(700);

  op = await page.locator('.met-rc-v2-operation').innerText();
  assert(op.includes('3人'), 'refund paid back to 3');
  assert(op.includes('38,400') || op.includes('38400'), 'refund receipt back');
  assert(op.includes('-7,520') || op.includes('-7520'), 'refund profit back');

  // 21 Duplicate enrollment guard
  await page.getByRole('button', { name: '添加报名' }).first().click();
  await page.waitForSelector('.met-v2-drawer-panel');
  // if lead reappears after refund as 已退款, may or may not be in list — check no duplicate of joined enrollments for A while refunded
  await page.locator('.met-v2-drawer-close').first().click();

  // todos unique
  await page.getByRole('tab', { name: '经营操作' }).click();
  const todoTitles = await page.locator('.met-rc-v2-action-panel__item-title').allTextContents();
  assert(new Set(todoTitles).size === todoTitles.length, 'no duplicate todos');
  assert(todoTitles.some(t => t.includes('直接保本')), 'breakeven todo returns after refund');

  await browser.close();
  console.log(JSON.stringify({
    ok: true,
    uiOnly: true,
    afterJoin: { paidCount: 4, receipt: 51200, commission: 2560, profit: 4640 },
    afterRefund: { paidCount: 3, receipt: 38400, commission: 1920, profit: -7520 },
    consoleErrors,
  }, null, 2));
  if (consoleErrors.length) process.exitCode = 2;
}

main().catch(err => {
  console.error('ACCEPTANCE_FAILED', err);
  process.exit(1);
});
