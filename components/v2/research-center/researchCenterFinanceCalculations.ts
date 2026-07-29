import { computeBreakevenCount } from './researchCenterCalculations';
import type { CohortConfig } from './researchCenterV2.viewModel';
import {
  NEW_CENTER_COST_START,
  RENOVATION_TOTAL,
  type CohortBudgetSimulation,
  type FinanceCompletenessField,
  type FixedCostItem,
  type PaybackScenarioConfig,
  type PaymentPlanItem,
  type RenovationFinanceState,
  type ResearchCenterFinanceState,
} from './researchCenterFinanceModel';
import { MOCK_TODAY_ISO } from './researchCenterOptions';

export interface CohortSimulationResult {
  revenue: number;
  salesCommission: number;
  projectDirectCost: number;
  contributionProfit: number;
  allocatedFixedCost: number;
  renovationAmortization: number;
  fullOperatingProfit: number | null;
  fullProfitPendingReason?: string;
  netContributionPerStudent: number;
  profitMargin: number;
  breakevenCount: number;
  fullBreakevenCount: number | null;
}

export interface CashPlanSummary {
  currentCash: number;
  inflow30: number | null;
  outflow30: number | null;
  minBalance30: number | null;
  incompleteReason?: string;
}

export interface CashTimelineDay {
  date: string;
  label: string;
  expectedInflow: number;
  confirmedInflow: number;
  expectedOutflow: number;
  confirmedOutflow: number;
  balance: number;
  risk: 'normal' | 'warning' | 'danger';
}

export interface ConfirmedCashEvent {
  date: string;
  label: string;
  title: string;
  amount: number;
  balanceAfter: number;
}

export interface ConfirmedCashSnapshot {
  events: ConfirmedCashEvent[];
  confirmedInflowTotal: number;
  confirmedInflowCount: number;
  confirmedOutflowTotal: number;
  confirmedOutflowCount: number;
}

function formatCashEventLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function sumProjectDirectCost(budget: CohortBudgetSimulation): number {
  return (
    budget.mentorDirectCost +
    budget.accommodationCost +
    budget.examCertCost +
    budget.materialCost +
    budget.otherDirectCost
  );
}

export function computeCohortSimulation(
  budget: CohortBudgetSimulation,
  cohort: CohortConfig,
  financeState: ResearchCenterFinanceState,
): CohortSimulationResult {
  const count = Math.max(0, budget.simCount);
  const revenue = count * budget.avgDealPrice;
  const salesCommission = Math.round(revenue * budget.commissionRate);
  const projectDirectCost = sumProjectDirectCost(budget);
  const contributionProfit = revenue - salesCommission - projectDirectCost;

  const monthlyAmortization =
    financeState.renovation.amortizationMonths > 0
      ? Math.round(financeState.renovation.totalAmount / financeState.renovation.amortizationMonths)
      : 0;
  const cohortMonths = Math.max(1, Math.ceil(cohort.durationDays / 30));
  const renovationAmortization = budget.includeRenovationAmortization
    ? monthlyAmortization * cohortMonths
    : 0;

  let fullOperatingProfit: number | null = contributionProfit - budget.allocatedFixedCost - renovationAmortization;
  let fullProfitPendingReason: string | undefined;

  const cohortEndsBeforeNewCenter = cohort.endDate < NEW_CENTER_COST_START;
  if (cohortEndsBeforeNewCenter && !financeState.venue502CostEntered) {
    fullOperatingProfit = null;
    fullProfitPendingReason = '待录入502室实际场地成本后计算';
  }

  const netPerStudent = count > 0 ? contributionProfit / count : budget.avgDealPrice * (1 - budget.commissionRate) - (count === 0 ? projectDirectCost : projectDirectCost / Math.max(count, 1));
  const unitNet =
    budget.avgDealPrice -
    Math.round(budget.avgDealPrice * budget.commissionRate) -
    (count > 0 ? projectDirectCost / count : 0);
  const breakevenCount = unitNet > 0 ? Math.ceil(projectDirectCost / unitNet) : computeBreakevenCount(cohort);

  const fullUnitNet = unitNet - (count > 0 ? (budget.allocatedFixedCost + renovationAmortization) / count : 0);
  const fullBreakevenCount =
    fullOperatingProfit !== null && fullUnitNet > 0
      ? Math.ceil((projectDirectCost + budget.allocatedFixedCost + renovationAmortization) / (budget.avgDealPrice * (1 - budget.commissionRate)))
      : null;

  return {
    revenue,
    salesCommission,
    projectDirectCost,
    contributionProfit,
    allocatedFixedCost: budget.allocatedFixedCost,
    renovationAmortization,
    fullOperatingProfit,
    fullProfitPendingReason,
    netContributionPerStudent: count > 0 ? contributionProfit / count : unitNet,
    profitMargin: revenue > 0 ? contributionProfit / revenue : 0,
    breakevenCount,
    fullBreakevenCount,
  };
}

export function buildFinanceCompletenessFields(state: ResearchCenterFinanceState): FinanceCompletenessField[] {
  const hardcoverConfigured = state.renovation.paymentNodes.length > 0;
  const hardcoverPaidEntered = state.renovation.paidAmount > 0 || state.renovation.paymentNodes.some(n => n.paidAmount > 0);

  return [
    {
      id: 'venue502',
      label: '502室实际场地成本尚未录入',
      actionLabel: '录入场地成本',
      actionKey: 'venue-cost',
      completed: state.venue502CostEntered,
      required: true,
    },
    {
      id: 'hardcover-plan',
      label: '硬装付款计划尚未配置',
      actionLabel: '配置付款计划',
      actionKey: 'hardcover-plan',
      completed: hardcoverConfigured,
      required: true,
    },
    {
      id: 'renovation-paid',
      label: '装修实际已付款金额尚未录入',
      actionLabel: '录入已付款',
      actionKey: 'renovation-paid',
      completed: hardcoverPaidEntered,
      required: true,
    },
    {
      id: 'allocation-rules',
      label: '部分固定成本分摊规则尚未确认',
      actionLabel: '设置分摊规则',
      actionKey: 'allocation-rules',
      completed: state.allocationRulesConfirmed,
      required: true,
    },
  ];
}

export function computeFinanceCompletenessPercent(fields: FinanceCompletenessField[]): number {
  const required = fields.filter(f => f.required);
  if (!required.length) return 100;
  const done = required.filter(f => f.completed).length;
  return Math.round((done / required.length) * 100);
}

export function validateRenovationNodes(nodes: { dueDate: string; dueAmount: number; paidAmount: number }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const totalDue = nodes.reduce((s, n) => s + n.dueAmount, 0);
  if (nodes.length && totalDue !== RENOVATION_TOTAL) {
    errors.total = `付款节点合计必须为 ${RENOVATION_TOTAL.toLocaleString()} 元，当前为 ${totalDue.toLocaleString()} 元`;
  }
  nodes.forEach((node, index) => {
    if (node.dueDate > '2026-12-31') errors[`date-${index}`] = '最后付款日期不得晚于 2026-12-31';
    if (node.paidAmount > node.dueAmount) errors[`paid-${index}`] = '已付金额不能大于应付金额';
  });
  return errors;
}

export function buildCashPlanSummary(
  state: ResearchCenterFinanceState,
  days = 30,
): CashPlanSummary {
  const timeline = buildCashTimeline(state, days);
  const hardcoverMissing = state.renovation.paymentNodes.length === 0;

  if (hardcoverMissing) {
    return {
      currentCash: state.currentCashBalance,
      inflow30: null,
      outflow30: null,
      minBalance30: null,
      incompleteReason: '硬装付款节点尚未设置',
    };
  }

  const inflow30 = timeline.reduce((s, d) => s + d.expectedInflow + d.confirmedInflow, 0);
  const outflow30 = timeline.reduce((s, d) => s + d.expectedOutflow + d.confirmedOutflow, 0);
  const minBalance30 = Math.min(...timeline.map(d => d.balance));

  return { currentCash: state.currentCashBalance, inflow30, outflow30, minBalance30 };
}

export function buildCashTimeline(state: ResearchCenterFinanceState, horizonDays: number): CashTimelineDay[] {
  const start = new Date(`${MOCK_TODAY_ISO}T12:00:00`);
  const plans = [...state.paymentPlans, ...state.renovation.paymentNodes.map((n, i) => ({
    id: `reno-${i}`,
    title: '硬装付款',
    owner: '工程',
    dueDate: n.dueDate,
    dueAmount: n.dueAmount,
    paidAmount: n.paidAmount,
    status: n.status as PaymentPlanItem['status'],
    category: '装修',
  }))];

  let balance = state.currentCashBalance;
  const days: CashTimelineDay[] = [];

  for (let i = 0; i < horizonDays; i += 7) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    const label = `${date.getMonth() + 1}/${date.getDate()}`;

    const duePlans = plans.filter(p => p.dueDate >= iso && p.dueDate < new Date(date.getTime() + 7 * 86400000).toISOString().slice(0, 10));
    const weekEnd = new Date(date.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    const expectedOutflow = duePlans.reduce((s, p) => s + Math.max(0, p.dueAmount - p.paidAmount), 0);
    const confirmedOutflow = duePlans.reduce((s, p) => s + p.paidAmount, 0);
    const expectedInflow = i < 28 ? (i % 14 === 0 ? 12800 : 0) : 0;
    const confirmedInflow = (state.cashReceipts ?? [])
      .filter(r => r.amount > 0 && r.date >= iso && r.date < weekEnd)
      .reduce((s, r) => s + r.amount, 0);

    balance = balance + expectedInflow + confirmedInflow - expectedOutflow - confirmedOutflow;
    const risk: CashTimelineDay['risk'] =
      balance < 0 ? 'danger' : balance < 50000 ? 'warning' : 'normal';

    days.push({
      date: iso,
      label,
      expectedInflow,
      confirmedInflow,
      expectedOutflow,
      confirmedOutflow,
      balance,
      risk,
    });
  }

  return days;
}

/** Display helper: confirmed cash events only (no full forecast). Does not alter profit formulas. */
export function buildConfirmedCashEvents(state: ResearchCenterFinanceState): ConfirmedCashSnapshot {
  type Raw = { date: string; title: string; amount: number };
  const raw: Raw[] = (state.cashReceipts ?? []).map(r => ({
    date: r.date,
    title: r.title,
    amount: r.amount,
  }));

  state.paymentPlans
    .filter(p => p.status !== '待配置' && p.dueAmount > 0)
    .forEach(p => {
      const unpaid = Math.max(0, p.dueAmount - p.paidAmount);
      if (unpaid > 0) raw.push({ date: p.dueDate, title: p.title, amount: -unpaid });
    });

  raw.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

  let balance = state.currentCashBalance;
  let confirmedInflowTotal = 0;
  let confirmedInflowCount = 0;
  let confirmedOutflowTotal = 0;
  let confirmedOutflowCount = 0;

  const events: ConfirmedCashEvent[] = raw.map(item => {
    balance += item.amount;
    if (item.amount > 0) {
      confirmedInflowTotal += item.amount;
      confirmedInflowCount += 1;
    } else if (item.amount < 0) {
      confirmedOutflowTotal += Math.abs(item.amount);
      confirmedOutflowCount += 1;
    }
    return {
      date: item.date,
      label: formatCashEventLabel(item.date),
      title: item.title,
      amount: item.amount,
      balanceAfter: balance,
    };
  });

  return {
    events,
    confirmedInflowTotal,
    confirmedInflowCount,
    confirmedOutflowTotal,
    confirmedOutflowCount,
  };
}

export function computePaybackScenario(scenario: PaybackScenarioConfig): {
  annualReceipt: number;
  annualContribution: number;
  annualFullProfit: number;
  annualCashSurplus: number;
  recoveryMonths: number | null;
  yearEndCash: number;
} {
  const annualStudents = scenario.cohortsPerYear * scenario.avgStudents;
  const annualReceipt = annualStudents * scenario.avgDealPrice;
  const annualCommission = Math.round(annualReceipt * 0.05);
  const annualDirect = scenario.cohortsPerYear * scenario.avgDirectCost;
  const annualContribution = annualReceipt - annualCommission - annualDirect;
  const annualFullProfit = annualContribution - scenario.monthlyFixedCost * 12;
  const annualCashSurplus = annualFullProfit - scenario.otherCashOutflow;
  const recoveryMonths =
    annualCashSurplus > 0 ? Math.ceil((RENOVATION_TOTAL / annualCashSurplus) * 12) : null;
  const yearEndCash = annualCashSurplus;

  return {
    annualReceipt,
    annualContribution,
    annualFullProfit,
    annualCashSurplus,
    recoveryMonths,
    yearEndCash,
  };
}

export function fixedCostMonthlyTotal(items: FixedCostItem[]): number {
  return items.reduce((s, i) => s + i.monthlyAmount, 0);
}

export function buildFinanceConclusion(
  cohort: CohortConfig,
  actualPaid: number,
  actualReceipt: number,
  simulation: CohortSimulationResult,
  financeState: ResearchCenterFinanceState,
): string {
  const gap = Math.max(0, cohort.breakevenCount - actualPaid);
  const parts = [
    `${actualPaid}名实缴学员尚未覆盖${simulation.projectDirectCost.toLocaleString()}元直接成本`,
    gap > 0 ? `再增加${gap}名实缴学员可达到直接保本` : '已达到直接保本',
  ];
  if (simulation.fullProfitPendingReason) {
    parts.push(`完整利润仍${simulation.fullProfitPendingReason}`);
  } else if (simulation.fullOperatingProfit !== null && simulation.fullOperatingProfit < 0) {
    parts.push('完整经营利润仍为负');
  }
  return parts.join('；') + '。';
}
