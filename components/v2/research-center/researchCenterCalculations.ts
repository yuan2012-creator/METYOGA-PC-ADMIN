import type {
  CashReceiptEvent,
  CohortConfig,
  CohortFinance,
  EnrollmentRecord,
  LeadRecord,
  LeadStage,
  MentorPayableItem,
  QuickLeadCategory,
  ResearchCenterDrawerContent,
  ResearchCenterFunnelStage,
  ScheduleItem,
  TodoItem,
} from './researchCenterV2.viewModel';
import {
  addDaysIso,
  findClassroom,
  formatDateShort,
  getTeacherPay,
  LEAD_STAGE_OPTIONS,
  MOCK_TODAY_ISO,
} from './researchCenterOptions';
import {
  normalizeLeadStage as domainNormalizeLeadStage,
  validateLeadStageTransition as domainValidateLeadStageTransition,
} from './domain/transitions';

export type LeadCategoryId = 'contact-today' | 'interview-passed' | 'deposit-contract' | 'overdue';

export interface CohortStats {
  activeCohortsCount: number;
  belowLockCount: number;
  atRiskCount: number;
}

export interface BreakevenBreakdown {
  fixedDirectCost: number;
  unitPrice: number;
  commissionRate: number;
  commissionPerStudent: number;
  mentorDirectCost: number;
  accommodationCost: number;
  variableCostPerStudent: number;
  netContributionPerStudent: number;
  breakevenCount: number;
}

const STAGE_SUGGESTED_ACTION: Record<string, string> = {
  新咨询: '24小时内首次建联',
  待联系: '完成首次联系',
  已联系: '确认意向等级并推进有效沟通',
  有效意向: '安排面试',
  待面试: '确认面试时间与面试官',
  已面试: '录入面试结果',
  面试通过: '发送正式方案与合同',
  已发方案: '跟进签约意向',
  待签约: '完成合同签署',
  已签约: '跟进收款',
  部分付款: '催收尾款',
  已付清: '确认加入班期',
  已入班: '完成入班资料',
  暂缓: '按约定时间回访',
  已流失: '归档并复盘原因',
  已退款: '完成退款结算',
};

const TERMINAL_STAGES = new Set(['暂缓', '已流失', '已退款']);

export function normalizeLeadStage(stage: string): LeadStage | string {
  return domainNormalizeLeadStage(stage);
}

export function getLeadStageIndex(stage: string): number {
  const normalized = normalizeLeadStage(stage);
  return LEAD_STAGE_OPTIONS.indexOf(normalized as (typeof LEAD_STAGE_OPTIONS)[number]);
}

export function suggestNextLeadStage(stage: string): LeadStage | null {
  const normalized = normalizeLeadStage(stage);
  if (TERMINAL_STAGES.has(String(normalized))) return null;
  const idx = getLeadStageIndex(String(normalized));
  if (idx < 0 || idx >= LEAD_STAGE_OPTIONS.length - 1) return null;
  const next = LEAD_STAGE_OPTIONS[idx + 1];
  if (TERMINAL_STAGES.has(next)) return null;
  return next;
}

export function getSuggestedActionForStage(stage: string): string {
  const normalized = normalizeLeadStage(stage);
  return STAGE_SUGGESTED_ACTION[normalized] ?? '继续跟进';
}

export function validateLeadStageTransition(
  from: string,
  to: string,
  lead: Pick<LeadRecord, 'paidAmount' | 'enrolled' | 'interview'>,
  options?: { forceReason?: string },
): { ok: boolean; error?: string; warning?: string; requireForceReason?: boolean; recommend?: LeadStage | null } {
  const result = domainValidateLeadStageTransition(from, to, lead, options);
  return {
    ok: result.ok,
    error: result.error,
    warning: result.warning,
    requireForceReason: result.requireForceReason,
    recommend: suggestNextLeadStage(to),
  };
}

export function detectLeadAnomaly(lead: LeadRecord): string | null {
  const stage = normalizeLeadStage(lead.stage);
  if (TERMINAL_STAGES.has(String(stage))) return null;
  const stageIdx = getLeadStageIndex(stage);
  const signedIdx = getLeadStageIndex('已签约');
  if (lead.paidAmount > 0 && stageIdx >= 0 && stageIdx < signedIdx) {
    return '已付款但未签约：请先完成签约或核对收款记录';
  }
  if ((stage === '已签约' || stage === '待签约') && lead.paidAmount <= 0) {
    return '已签约但未付款：请进入收款待办';
  }
  return null;
}

export function derivePaymentStatus(dealPrice: number, paidAmount: number): '未付款' | '部分付款' | '已付清' {
  if (paidAmount <= 0) return '未付款';
  if (paidAmount + 0.001 >= dealPrice) return '已付清';
  return '部分付款';
}

export function isFullyPaidStatus(paymentStatus: string): boolean {
  return paymentStatus === '已付清';
}

export function isPartialPaidStatus(paymentStatus: string): boolean {
  return paymentStatus === '部分付款';
}

export function countsTowardPaidSeat(enrollment: Pick<EnrollmentRecord, 'paymentStatus' | 'joined' | 'refunded'>): boolean {
  return !enrollment.refunded && enrollment.joined && isFullyPaidStatus(enrollment.paymentStatus);
}

export function computeScheduleMentorCost(schedules: ScheduleItem[]): number {
  return schedules.reduce((sum, item) => sum + (item.calcPay ? item.payAmount : 0), 0);
}

export function syncMentorPayablesFromSchedules(
  schedules: ScheduleItem[],
  cohortId: string,
  previous: MentorPayableItem[],
): MentorPayableItem[] {
  const prevMap = new Map(previous.map(p => [p.sessionId, p]));
  const retained = previous.filter(p => p.cohortId !== cohortId);
  const next: MentorPayableItem[] = [...retained];
  for (const s of schedules) {
    if ((s.cohortId || cohortId) !== cohortId) continue;
    if (!s.calcPay || s.payAmount <= 0) continue;
    const old = prevMap.get(s.id);
    if (old && old.status === '已支付' && old.dueAmount !== s.payAmount) {
      next.push(old);
      continue;
    }
    const paidAmount = old?.paidAmount ?? 0;
    const dueAmount = s.payAmount;
    next.push({
      id: old?.id ?? `mp-${s.id}`,
      teacher: s.teacher,
      cohortId: s.cohortId || cohortId,
      sessionId: s.id,
      sessionLabel: `${s.date} ${s.content}`,
      dueAmount,
      paidAmount,
      dueDate: s.dateIso,
      status:
        paidAmount >= dueAmount && dueAmount > 0
          ? '已支付'
          : paidAmount > 0
            ? '部分支付'
            : '待付款',
    });
  }
  return next;
}

export function formatGapLabel(gap: number): string {
  return gap <= 0 ? '已达到' : `${gap}人`;
}

/** Display funnel labels (product wording) mapped from unified stages. */
export function deriveFunnelStages(leads: LeadRecord[]): ResearchCenterFunnelStage[] {
  const buckets: { id: string; stage: string; match: (s: string) => boolean }[] = [
    { id: 'fs-1', stage: '新增咨询', match: s => ['新咨询', '待联系'].includes(s) },
    { id: 'fs-2', stage: '有效沟通', match: s => ['已联系', '有效意向'].includes(s) },
    { id: 'fs-3', stage: '完成面试', match: s => ['待面试', '已面试'].includes(s) },
    { id: 'fs-4', stage: '面试通过', match: s => s === '面试通过' },
    { id: 'fs-5', stage: '已发方案', match: s => ['已发方案', '待签约'].includes(s) },
    { id: 'fs-6', stage: '已签约', match: s => s === '已签约' },
    { id: 'fs-7', stage: '已付款', match: s => ['部分付款', '已付清'].includes(s) },
    { id: 'fs-8', stage: '正式入班', match: s => s === '已入班' },
  ];

  const normalized = leads.map(l => ({ ...l, stage: normalizeLeadStage(l.stage) }));
  return buckets.map((b, index) => {
    const count = normalized.filter(l => b.match(String(l.stage))).length;
    const prev = index > 0 ? buckets[index - 1] : null;
    const prevCount = prev ? normalized.filter(l => prev.match(String(l.stage))).length : 0;
    const conversionRate =
      index === 0 || prevCount === 0 ? '—' : `${((count / prevCount) * 100).toFixed(1)}%`;
    const expectedAmount = `${((count * 12800) / 10000).toFixed(1)}万`;
    const overdueCount = normalized.filter(l => b.match(String(l.stage)) && l.overdueDays >= 3).length;
    return { id: b.id, stage: b.stage, count, conversionRate, expectedAmount, overdueCount };
  });
}

export function buildStudentsDrawerContent(
  enrollments: EnrollmentRecord[],
  cohorts: CohortConfig[],
): ResearchCenterDrawerContent {
  const active = enrollments.filter(e => !e.refunded);
  const cohortTitle = (id: string) => cohorts.find(c => c.id === id)?.displayTitle ?? id;
  return {
    title: '实缴学员名单',
    subtitle: '由报名记录实时派生（非 snapshot）',
    sections: [
      {
        title: '当前学员',
        rows:
          active.length > 0
            ? active.map(e => ({
                label: e.studentName,
                value: `${cohortTitle(e.cohortId)}｜成交 ${e.dealPrice.toLocaleString()}｜已收 ${e.paidAmount.toLocaleString()}｜未收 ${Math.max(0, e.dealPrice - e.paidAmount).toLocaleString()}｜${e.paymentStatus}｜合同${e.contractStatus}｜${e.joined ? '已入班' : '未入班'}｜${e.owner}`,
              }))
            : [{ label: '暂无学员', value: '—' }],
      },
    ],
    notes: ['实缴人数以已入班且已付清学员为准；名单随报名/收款/退款自动更新。'],
    footerActions: [{ label: '添加报名' }, { label: '关闭' }],
  };
}

export function buildReceiptDrawerContent(
  receipts: CashReceiptEvent[],
  enrollments: EnrollmentRecord[],
  cohorts: CohortConfig[],
): ResearchCenterDrawerContent {
  const list = [...receipts].filter(r => r.kind !== 'payout').sort((a, b) => b.date.localeCompare(a.date));
  const cohortTitle = (id?: string) => (id ? cohorts.find(c => c.id === id)?.displayTitle ?? id : '—');
  const studentName = (enrollmentId?: string) =>
    enrollmentId ? enrollments.find(e => e.id === enrollmentId)?.studentName ?? '—' : '—';
  return {
    title: '收款明细',
    subtitle: '由收款/退款流水实时派生',
    sections: [
      {
        title: '流水',
        rows:
          list.length > 0
            ? list.map(r => ({
                label: `${r.date} · ${r.serialNo || r.id}`,
                value: `${studentName(r.enrollmentId)}｜${cohortTitle(r.cohortId)}｜${r.amount.toLocaleString()}元｜${r.paymentMethod || '—'}｜${r.operator || '—'}｜${r.status || (r.amount < 0 ? '退款' : '已确认')}`,
              }))
            : [{ label: '暂无流水', value: '—' }],
      },
    ],
    footerActions: [{ label: '关闭' }],
  };
}

const LEAD_CATEGORY_DEFS: {
  id: LeadCategoryId;
  labelOperation: string;
  labelLeads: string;
  match: (lead: LeadRecord) => boolean;
}[] = [
  {
    id: 'contact-today',
    labelOperation: '今天要联系',
    labelLeads: '今天需要联系',
    match: lead => isActiveLead(lead) && lead.categories.includes('contact-today'),
  },
  {
    id: 'interview-passed',
    labelOperation: '面试通过待付款',
    labelLeads: '面试通过待付款',
    match: lead =>
      isActiveLead(lead) &&
      (normalizeLeadStage(lead.stage) === '面试通过' || lead.categories.includes('interview-passed')),
  },
  {
    id: 'deposit-contract',
    labelOperation: '已付定金',
    labelLeads: '已签合同未付清或已付定金',
    match: lead =>
      isActiveLead(lead) &&
      (lead.categories.includes('deposit-paid') ||
        normalizeLeadStage(lead.stage) === '已签约' ||
        normalizeLeadStage(lead.stage) === '部分付款' ||
        (lead.paidAmount > 0 && lead.paidAmount < lead.expectedAmount)),
  },
  {
    id: 'overdue',
    labelOperation: '超过3天未跟进',
    labelLeads: '超时未跟进',
    match: lead =>
      isActiveLead(lead) && (lead.overdueDays >= 3 || lead.categories.includes('overdue')),
  },
];

export function isActiveLead(lead: LeadRecord): boolean {
  const stage = normalizeLeadStage(lead.stage);
  if (lead.enrolled || stage === '已入班') return false;
  if (['暂缓', '已流失', '已退款'].includes(String(stage))) return false;
  return true;
}

export function matchLeadCategory(lead: LeadRecord, categoryId: LeadCategoryId): boolean {
  const def = LEAD_CATEGORY_DEFS.find(d => d.id === categoryId);
  return def ? def.match(lead) : false;
}

export function filterLeadsByCategory(leads: LeadRecord[], categoryId: LeadCategoryId): LeadRecord[] {
  return leads.filter(l => matchLeadCategory(l, categoryId));
}

export function getLeadCategories(
  leads: LeadRecord[],
  variant: 'operation' | 'leads',
): QuickLeadCategory[] {
  return LEAD_CATEGORY_DEFS.map(def => ({
    id: def.id,
    label: variant === 'operation' ? def.labelOperation : def.labelLeads,
    count: leads.filter(def.match).length,
  }));
}

export function deriveCohortStats(cohorts: CohortConfig[]): CohortStats {
  const recruiting = cohorts.filter(c => c.status === '招生中');
  const activeCohortsCount = recruiting.length;
  const belowLockCount = recruiting.filter(c => c.paidCount < c.lockCount).length;
  const atRiskCount = recruiting.filter(c => c.paidCount < c.breakevenCount).length;
  return { activeCohortsCount, belowLockCount, atRiskCount };
}

export function computeBreakevenBreakdown(
  cohort: Pick<
    CohortConfig,
    | 'standardPrice'
    | 'commissionRate'
    | 'mentorDirectCost'
    | 'accommodationCost'
    | 'projectDirectCost'
    | 'otherFixedProjectCost'
  >,
): BreakevenBreakdown {
  const fixedDirectCost = cohort.projectDirectCost + (cohort.otherFixedProjectCost ?? 0);
  const unitPrice = cohort.standardPrice;
  const commissionPerStudent = Math.round(unitPrice * cohort.commissionRate);
  const mentorDirectCost = cohort.mentorDirectCost ?? 0;
  const accommodationCost = cohort.accommodationCost ?? 0;
  const variableCostPerStudent = mentorDirectCost + accommodationCost;
  const netContributionPerStudent = unitPrice - commissionPerStudent - variableCostPerStudent;
  const breakevenCount =
    netContributionPerStudent > 0
      ? Math.ceil(fixedDirectCost / netContributionPerStudent)
      : Number.POSITIVE_INFINITY;

  return {
    fixedDirectCost,
    unitPrice,
    commissionRate: cohort.commissionRate,
    commissionPerStudent,
    mentorDirectCost,
    accommodationCost,
    variableCostPerStudent,
    netContributionPerStudent,
    breakevenCount,
  };
}

export function computeBreakevenCount(
  cohort: Pick<
    CohortConfig,
    | 'standardPrice'
    | 'commissionRate'
    | 'mentorDirectCost'
    | 'accommodationCost'
    | 'projectDirectCost'
    | 'otherFixedProjectCost'
  >,
): number {
  const { breakevenCount } = computeBreakevenBreakdown(cohort);
  return Number.isFinite(breakevenCount) ? breakevenCount : cohort.standardPrice > 0 ? 999 : 0;
}

export function applyCohortDerivedFields(cohort: CohortConfig): CohortConfig {
  const breakevenCount = computeBreakevenCount(cohort);
  const finance = computeCohortFinance(
    cohort.paidCount,
    cohort.totalReceipt,
    cohort.projectDirectCost,
    cohort.commissionRate,
  );
  return {
    ...cohort,
    breakevenCount,
    salesCommission: finance.salesCommission,
    contributionProfit: finance.contributionProfit,
    statusTone: deriveCohortStatusTone(cohort.paidCount, breakevenCount, cohort.lockCount),
  };
}

export function computeCohortFinance(
  paidCount: number,
  totalReceipt: number,
  projectDirectCost: number,
  commissionRate = 0.05,
): CohortFinance {
  const salesCommission = Math.round(totalReceipt * commissionRate);
  const contributionProfit = totalReceipt - salesCommission - projectDirectCost;
  return { paidCount, totalReceipt, salesCommission, contributionProfit };
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('zh-CN')}元`;
}

export function formatPeople(count: number): string {
  return `${count}人`;
}

export function gapTo(count: number, target: number): number {
  return Math.max(0, target - count);
}

export function deriveCohortStatusTone(
  paidCount: number,
  breakevenCount: number,
  lockCount: number,
): 'danger' | 'warning' | 'normal' {
  if (paidCount < breakevenCount) return 'danger';
  if (paidCount < lockCount) return 'warning';
  return 'normal';
}

export function deriveDiagnosisConclusion(
  cohort: CohortConfig,
  finance: CohortFinance,
): string {
  const breakevenGap = gapTo(finance.paidCount, cohort.breakevenCount);
  const lockGap = gapTo(finance.paidCount, cohort.lockCount);
  if (breakevenGap > 0) {
    return `当前实缴${finance.paidCount}人，尚未覆盖${formatCurrency(cohort.projectDirectCost)}项目直接成本，距离建议锁班还差${lockGap}人。`;
  }
  if (lockGap > 0) {
    return `已覆盖直接成本，距离建议锁班还差${lockGap}人，请继续推进招生。`;
  }
  return `已达建议锁班线，继续向经营目标${cohort.targetCount}人推进。`;
}

export function buildOperationMetrics(
  cohortStats: CohortStats,
  finance: CohortFinance,
  cohort: CohortConfig,
  paymentPlanConfigured: boolean,
) {
  return [
    {
      id: 'op-cohorts',
      label: '在招班期',
      value: `${cohortStats.activeCohortsCount}个`,
      hint: `未达锁班：${cohortStats.belowLockCount}个`,
      status: cohortStats.belowLockCount > 0 ? ('warning' as const) : ('normal' as const),
      drawerKey: 'cohort-list',
    },
    {
      id: 'op-paid',
      label: '当前实缴',
      value: formatPeople(finance.paidCount),
      hint:
        gapTo(finance.paidCount, cohort.breakevenCount) > 0
          ? `距离直接保本还差${gapTo(finance.paidCount, cohort.breakevenCount)}人`
          : '已达到直接保本',
      status: finance.paidCount < cohort.breakevenCount ? ('warning' as const) : ('normal' as const),
      drawerKey: 'students',
    },
    {
      id: 'op-receipt',
      label: '本月实收',
      value: formatCurrency(finance.totalReceipt),
      hint: `当前${finance.paidCount}名实缴学员到账金额`,
      status: 'normal' as const,
      drawerKey: 'receipt-detail',
    },
    {
      id: 'op-payment',
      label: '未来30天待付款',
      value: paymentPlanConfigured ? '待计算' : '待配置',
      hint: paymentPlanConfigured ? '按付款计划汇总' : '硬装付款计划尚未设置',
      status: paymentPlanConfigured ? ('pending' as const) : ('warning' as const),
      drawerKey: 'cash-plan',
    },
  ];
}

export function buildDerivedTodos(
  activeCohort: CohortConfig | null,
  paymentPlanConfigured: boolean,
  dismissedIds: ReadonlySet<string>,
  leads: LeadRecord[] = [],
): TodoItem[] {
  const items: TodoItem[] = [];
  if (!activeCohort) return items;

  const breakevenGap = gapTo(activeCohort.paidCount, activeCohort.breakevenCount);
  if (breakevenGap > 0) {
    items.push({
      id: 'todo-breakeven',
      title: `距离直接保本还差${breakevenGap}名实缴学员`,
      actions: [
        { id: 'add-enrollment', label: '添加报名' },
        { id: 'high-intent', label: '查看高意向' },
      ],
      done: false,
    });
  }

  const lockGap = gapTo(activeCohort.paidCount, activeCohort.lockCount);
  if (lockGap > 0) {
    items.push({
      id: 'todo-lock',
      title: `距离锁班还差${lockGap}人`,
      actions: [{ id: 'recruit', label: '发起补招' }],
      done: false,
    });
  }

  if (activeCohort.recruitmentOwner === '待指定') {
    items.push({
      id: 'todo-owner',
      title: '招生负责人未指定',
      actions: [{ id: 'assign-owner', label: '指定负责人' }],
      done: false,
    });
  }

  if (!paymentPlanConfigured) {
    items.push({
      id: 'todo-payment',
      title: '硬装付款计划未设置',
      hint: '影响金额220,000元',
      actions: [{ id: 'cash-plan', label: '配置计划' }],
      done: false,
    });
  }

  const collectionLeads = leads.filter(l => {
    const stage = normalizeLeadStage(l.stage);
    return isActiveLead(l) && (stage === '已签约' || stage === '部分付款') && l.paidAmount < l.expectedAmount;
  });
  if (collectionLeads.length > 0) {
    items.push({
      id: 'todo-collect',
      title: `${collectionLeads.length}名已签约学员待收款`,
      actions: [{ id: 'record-payment', label: '录入收款' }],
      done: false,
    });
  }

  const joinReady = leads.filter(l => {
    const stage = normalizeLeadStage(l.stage);
    return isActiveLead(l) && stage === '已付清';
  });
  if (joinReady.length > 0) {
    items.push({
      id: 'todo-join',
      title: `${joinReady.length}名已付清学员待入班`,
      actions: [{ id: 'join-cohort', label: '确认入班' }],
      done: false,
    });
  }

  const anomalyLeads = leads.filter(l => isActiveLead(l) && detectLeadAnomaly(l));
  if (anomalyLeads.length > 0) {
    items.push({
      id: 'todo-anomaly',
      title: `${anomalyLeads.length}名咨询者状态异常（已付款未签约）`,
      actions: [{ id: 'high-intent', label: '查看名单' }],
      done: false,
    });
  }

  items.push({
    id: 'todo-venue',
    title: '502室将于2026年8月31日停止使用',
    actions: [{ id: 'check-schedule', label: '检查课表' }],
    done: false,
  });

  const seen = new Set<string>();
  return items.filter(t => {
    if (seen.has(t.id) || dismissedIds.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export interface ScheduleSummary {
  plannedDays: number;
  scheduledDays: number;
  sessionCount: number;
  pendingDays: number;
  mentorCostTotal: number;
}

export interface VisibleScheduleResult {
  items: ScheduleItem[];
  hasUpcoming: boolean;
  hiddenCount: number;
}

export function computeScheduleSummary(cohort: CohortConfig, schedules: ScheduleItem[]): ScheduleSummary {
  const scheduledDays = new Set(schedules.map(s => s.dateIso)).size;
  const sessionCount = schedules.length;
  const plannedDays = cohort.durationDays;
  const pendingDays = Math.max(0, plannedDays - scheduledDays);
  const mentorCostTotal = computeScheduleMentorCost(schedules);
  return { plannedDays, scheduledDays, sessionCount, pendingDays, mentorCostTotal };
}

export function getLastTeachingDateIso(schedules: ScheduleItem[]): string | null {
  if (!schedules.length) return null;
  return schedules.reduce((max, item) => (item.dateIso > max ? item.dateIso : max), schedules[0].dateIso);
}

export function compareTime(a: string, b: string): number {
  return a.localeCompare(b);
}

export function isSessionUpcoming(item: ScheduleItem, todayIso = MOCK_TODAY_ISO): boolean {
  if (item.dateIso > todayIso) return true;
  if (item.dateIso < todayIso) return false;
  return compareTime(item.endTime, '12:00') >= 0;
}

export function getVisibleScheduleItems(
  schedules: ScheduleItem[],
  showAll: boolean,
  todayIso = MOCK_TODAY_ISO,
  limit = 3,
): VisibleScheduleResult {
  const sorted = [...schedules].sort((a, b) =>
    `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`),
  );
  const upcoming = sorted.filter(item => isSessionUpcoming(item, todayIso));
  const hasUpcoming = upcoming.length > 0;
  const base = hasUpcoming ? upcoming : sorted.slice(-limit);
  const items = showAll ? (hasUpcoming ? upcoming : sorted) : base.slice(0, limit);
  const pool = hasUpcoming ? upcoming : sorted;
  const hiddenCount = Math.max(0, pool.length - limit);
  return { items, hasUpcoming, hiddenCount };
}

export function validateCohortPatch(
  patch: Partial<CohortConfig>,
  cohort: CohortConfig,
  schedules: ScheduleItem[],
): Partial<Record<keyof CohortConfig | 'classroom' | 'venue', string>> {
  const errors: Partial<Record<keyof CohortConfig | 'classroom' | 'venue', string>> = {};
  const next = { ...cohort, ...patch };

  if ('displayTitle' in patch) {
    const title = String(patch.displayTitle ?? '').trim();
    if (!title) errors.displayTitle = '班期名称不能为空';
  }

  if ('standardPrice' in patch) {
    const price = Number(patch.standardPrice);
    if (!Number.isFinite(price) || price < 0) errors.standardPrice = '请输入非负金额';
  }

  if ('startDate' in patch || 'endDate' in patch) {
    if (next.endDate && next.startDate && next.endDate < next.startDate) {
      errors.endDate = '结束日期不得早于开课日期';
    }
    const lastTeaching = getLastTeachingDateIso(schedules);
    if (patch.endDate && lastTeaching && patch.endDate < lastTeaching) {
      errors.endDate = `结束日期不得早于最后课次日期（${formatDateShort(lastTeaching)}）`;
    }
  }

  if ('enrollmentDeadline' in patch || 'startDate' in patch) {
    if (next.enrollmentDeadline && next.startDate && next.enrollmentDeadline > next.startDate) {
      errors.enrollmentDeadline = '招生截止日期不得晚于开课日期';
    }
  }

  if ('venue' in patch || 'classroom' in patch) {
    if (next.classroom && next.venue && !findClassroom(next.venue, next.classroom)) {
      errors.classroom = '请选择当前场地下的教室';
    }
    const classroom = findClassroom(next.venue, next.classroom);
    if (classroom && next.maxCount > classroom.maxCapacity) {
      errors.maxCount = `最大人数不得超过教室容量（${classroom.maxCapacity}人）`;
    }
  }

  if ('maxCount' in patch) {
    const classroom = findClassroom(next.venue, next.classroom);
    const max = Number(patch.maxCount);
    if (!Number.isFinite(max) || max < 1) errors.maxCount = '最大人数至少为1人';
    if (classroom && max > classroom.maxCapacity) {
      errors.maxCount = `最大人数不得超过教室容量（${classroom.maxCapacity}人）`;
    }
  }

  if ('lockCount' in patch) {
    const lock = Number(patch.lockCount);
    if (lock < next.breakevenCount) errors.lockCount = '不得低于直接保本人数';
    if (lock > next.targetCount) errors.lockCount = '不得高于目标人数';
    if (lock > next.maxCount) errors.lockCount = '不得高于最大人数';
  }

  if ('targetCount' in patch) {
    const target = Number(patch.targetCount);
    if (target < next.lockCount) errors.targetCount = '不得低于建议锁班人数';
    if (target > next.maxCount) errors.targetCount = '不得高于最大人数';
  }

  if ('commissionRate' in patch) {
    const rate = Number(patch.commissionRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) errors.commissionRate = '请输入0—100%之间的比例';
  }

  return errors;
}

export function needsStatusConfirm(
  nextStatus: string,
  cohort: CohortConfig,
  schedules: ScheduleItem[],
): { confirm?: string; reasonRequired?: boolean; error?: string } {
  if (nextStatus === '已锁班' && cohort.paidCount < cohort.lockCount) {
    return { confirm: '实缴人数尚未达到锁班线，确认标记为已锁班？' };
  }
  if (nextStatus === '已取消' && cohort.paidCount > 0) {
    return { reasonRequired: true };
  }
  if (nextStatus === '进行中' && schedules.length === 0) {
    return { error: '进入进行中前，请至少添加一个课次' };
  }
  if (nextStatus === '已结业') {
    const hasExamOrGraduation = schedules.some(s => s.sessionType === '考试' || s.sessionType === '结业');
    if (!hasExamOrGraduation) {
      return { confirm: '尚未确认考试或结业课次，确认标记为已结业？' };
    }
  }
  return {};
}

export function defaultEnrollmentDeadline(startDateIso: string): string {
  return addDaysIso(startDateIso, -7);
}

export interface ScheduleDraftValidationInput {
  dateIso: string;
  startTime: string;
  endTime: string;
  content: string;
  teacher: string;
  venue: string;
  classroom: string;
  calcPay: boolean;
  payAmount: number;
  customPayReason?: string;
}

export function validateScheduleDraft(
  draft: ScheduleDraftValidationInput,
  cohort: CohortConfig,
): Partial<Record<'dateIso' | 'startTime' | 'endTime' | 'content' | 'teacher' | 'venue' | 'classroom' | 'payAmount' | 'customPayReason', string>> {
  const errors: Partial<Record<'dateIso' | 'startTime' | 'endTime' | 'content' | 'teacher' | 'venue' | 'classroom' | 'payAmount' | 'customPayReason', string>> = {};
  if (!draft.dateIso) errors.dateIso = '请选择日期';
  if (!draft.content.trim()) errors.content = '请选择或填写课程内容';
  if (!draft.teacher || draft.teacher === '—') errors.teacher = '请选择导师';
  if (!draft.venue) errors.venue = '请选择场地';
  if (!draft.classroom) errors.classroom = '请选择教室';
  if (draft.startTime && draft.endTime && draft.endTime <= draft.startTime) {
    errors.endTime = '结束时间必须晚于开始时间';
  }
  if (draft.dateIso && cohort.startDate && draft.dateIso < cohort.startDate) {
    errors.dateIso = '课次日期不得早于班期开课日期';
  }
  if (draft.dateIso && cohort.endDate && draft.dateIso > cohort.endDate) {
    errors.dateIso = '课次日期不得晚于班期结束日期';
  }
  if (draft.calcPay && draft.payAmount <= 0) errors.payAmount = '请填写课酬金额';
  const teacherPay = getTeacherPay(draft.teacher);
  if (
    draft.calcPay &&
    teacherPay &&
    draft.payAmount !== teacherPay.defaultAmount &&
    !draft.customPayReason?.trim()
  ) {
    errors.customPayReason = '修改自动课酬时请填写调整原因';
  }
  return errors;
}
