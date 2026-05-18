/** 投资测算模块局部 demo 数据 */

import { formatInvestmentCny } from './investmentFormatters';
import type { InvestmentDetailTabId } from './InvestmentDetailTabs';

export type InvestmentSegment =
  | 'projects'
  | 'capex'
  | 'fixedCost'
  | 'revenue'
  | 'breakeven'
  | 'cashflow'
  | 'sensitivity';

export type InvestmentEntityType =
  | 'project'
  | 'capex'
  | 'fixedCost'
  | 'revenue'
  | 'breakeven'
  | 'cashflow'
  | 'sensitivity';

export type InvestmentFocusGroup =
  | 'overspend'
  | 'costPressure'
  | 'capacityShort'
  | 'paybackRisk';

export interface InvestmentListFilters {
  query: string;
  project: string;
  timeHorizon: string;
  risk: string;
  model: string;
}

export const DEFAULT_INVESTMENT_FILTERS: InvestmentListFilters = {
  query: '',
  project: '全部项目',
  timeHorizon: '12 个月',
  risk: '全部',
  model: '标准',
};

export const INVESTMENT_FILTER_OPTIONS = {
  projects: ['全部项目', '滨江宝龙馆', '西湖优化馆', '云谷新店', '授权馆样板', '城西扩容方案'],
  timeHorizons: ['12 个月', '24 个月', '36 个月'],
  risks: ['全部', '正常', '关注', '高风险'],
  models: ['保守', '标准', '乐观'],
};

export const INVESTMENT_WORKBENCH_SEGMENTS: { id: InvestmentSegment; label: string }[] = [
  { id: 'projects', label: '项目方案' },
  { id: 'capex', label: '初始投入' },
  { id: 'fixedCost', label: '月固定成本' },
  { id: 'revenue', label: '收入产能' },
  { id: 'breakeven', label: '保本测算' },
  { id: 'cashflow', label: '现金流预测' },
  { id: 'sensitivity', label: '敏感性分析' },
];

export const INVESTMENT_SEGMENT_HINTS: Record<InvestmentSegment, string> = {
  projects: '管理不同新店与投资方案，对比投入与回本周期',
  capex: '拆解装修、设备、押金等初始投入结构',
  fixedCost: '分析租金、人工等月固定成本与刚性占比',
  revenue: '团课、小班、私教、教培等收入产能假设',
  breakeven: '保本收入、到课人次与满员率测算',
  cashflow: '12 个月现金流滚动预测与危险时点',
  sensitivity: '租金、人工、满员率等参数对回本的影响',
};

export interface InvestmentMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface InvestmentInsight {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: InvestmentSegment;
}

export interface InvestmentProjectRecord {
  id: string;
  segment: 'projects';
  projectName: string;
  region: string;
  area: number;
  storeType: string;
  budget: number;
  monthlyCost: number;
  paybackMonths: string;
  riskLevel: string;
  projectKey: string;
}

export interface InvestmentCapexRecord {
  id: string;
  segment: 'capex';
  itemName: string;
  category: string;
  budgetAmount: number;
  confirmedAmount: number;
  variance: number;
  isEssential: string;
  riskNote: string;
  riskLevel: string;
  projectKey: string;
}

export interface InvestmentFixedCostRecord {
  id: string;
  segment: 'fixedCost';
  costName: string;
  costType: string;
  monthlyBudget: number;
  ratio: string;
  isRigid: string;
  riskNote: string;
  riskLevel: string;
  projectKey: string;
}

export interface InvestmentRevenueRecord {
  id: string;
  segment: 'revenue';
  revenueType: string;
  product: string;
  unitPrice: number;
  monthlyVolume: number;
  monthlyRevenue: number;
  utilization: string;
  riskLevel: string;
  projectKey: string;
}

export interface InvestmentBreakevenRecord {
  id: string;
  segment: 'breakeven';
  metricName: string;
  currentValue: string;
  breakevenReq: string;
  gap: string;
  factor: string;
  judgment: string;
  riskLevel: string;
  projectKey: string;
}

export interface InvestmentCashflowRecord {
  id: string;
  segment: 'cashflow';
  monthLabel: string;
  openingCash: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashflow: number;
  cumulativeCash: number;
  riskLevel: string;
  projectKey: string;
}

export interface InvestmentSensitivityRecord {
  id: string;
  segment: 'sensitivity';
  paramName: string;
  currentValue: string;
  adjustedValue: string;
  paybackImpact: string;
  cashflowImpact: string;
  riskLevel: string;
  projectKey: string;
}

export type InvestmentTableRow =
  | InvestmentProjectRecord
  | InvestmentCapexRecord
  | InvestmentFixedCostRecord
  | InvestmentRevenueRecord
  | InvestmentBreakevenRecord
  | InvestmentCashflowRecord
  | InvestmentSensitivityRecord;

export interface InvestmentFocusItem {
  id: string;
  segment: InvestmentSegment;
  group: InvestmentFocusGroup;
  entityType: InvestmentEntityType;
  entityId: string;
  title: string;
  statusLabel: string;
  reasonLine: string;
  calcChain: string[];
  openTab?: InvestmentDetailTabId;
}

export interface InvestmentJudgment {
  summary: string;
  stuck: string;
  nextStep: string;
}

export interface InvestmentStructureItem {
  label: string;
  amount: string;
  ratio: string;
  note: string;
}

export interface InvestmentSensitivityLine {
  param: string;
  current: string;
  adjusted: string;
  paybackImpact: string;
  cashflowImpact: string;
}

export interface InvestmentCaliberItem {
  metric: string;
  definition: string;
  assumption: string;
  source: string;
}

export interface InvestmentDetailRecord {
  id: string;
  entityType: InvestmentEntityType;
  segment: InvestmentSegment;
  title: string;
  subtitle: string;
  projectName: string;
  region: string;
  area: string;
  storeType: string;
  status: string;
  riskLevel: string;
  todaySuggestion: string;
  judgment: InvestmentJudgment;
  coreMetrics: { label: string; value: string }[];
  capexStructure: InvestmentStructureItem[];
  fixedCostStructure: InvestmentStructureItem[];
  overBudgetItems: string[];
  rigidCostNote: string;
  revenueAssumptions: { type: string; volume: string; revenue: string; utilization: string }[];
  breakevenRevenue: string;
  predictedRevenue: string;
  monthlyNetCashflow: string;
  paybackPeriod: string;
  safetyMargin: string;
  sensitivityLines: InvestmentSensitivityLine[];
  highImpactParams: string[];
  caliberItems: InvestmentCaliberItem[];
  calcChain: string[];
  updatedAt: string;
  isDemo: boolean;
}

export interface InvestmentOperationSnapshot {
  metrics: InvestmentMetric[];
  insights: InvestmentInsight[];
  projects: InvestmentProjectRecord[];
  capex: InvestmentCapexRecord[];
  fixedCost: InvestmentFixedCostRecord[];
  revenue: InvestmentRevenueRecord[];
  breakeven: InvestmentBreakevenRecord[];
  cashflow: InvestmentCashflowRecord[];
  sensitivity: InvestmentSensitivityRecord[];
  details: InvestmentDetailRecord[];
  focusQueue: InvestmentFocusItem[];
}

const PROJECTS = [
  { key: '滨江宝龙馆', region: '杭州滨江', area: 680, type: '标准馆', budget: 2800000, monthly: 186000, payback: '18 个月', risk: '关注' },
  { key: '西湖优化馆', region: '杭州西湖', area: 520, type: '优化改造', budget: 1200000, monthly: 142000, payback: '14 个月', risk: '正常' },
  { key: '云谷新店', region: '杭州云谷', area: 450, type: '精品馆', budget: 2100000, monthly: 168000, payback: '22 个月', risk: '高风险' },
  { key: '授权馆样板', region: '苏州园区', area: 380, type: '授权馆', budget: 980000, monthly: 98000, payback: '16 个月', risk: '正常' },
  { key: '城西扩容方案', region: '杭州城西', area: 600, type: '扩容', budget: 1560000, monthly: 128000, payback: '15 个月', risk: '关注' },
];

const CAPEX_CATS = ['装修', '设备', '押金', '预付租金', '软装', '开业物料', '系统 / 品牌', '启动备用金'];

const mkJudgment = (risk: string): InvestmentJudgment => ({
  summary:
    risk === '高风险'
      ? '项目现金流安全边际偏紧，建议优先控制初始投入与刚性成本'
      : risk === '关注'
        ? '测算结果对租金与产能假设较敏感，建议做敏感性复盘'
        : '测算模型整体可控，可作为对标方案继续优化假设',
  stuck: risk === '高风险' ? '现金流转正晚于预期' : risk === '关注' ? '部分投入项超预算' : '—',
  nextStep: '结合敏感性分析与保本测算复核假设（测算预览 · 本测算不构成投资承诺）',
});

const buildDetails = (
  projects: InvestmentProjectRecord[],
  capex: InvestmentCapexRecord[],
  fixedCost: InvestmentFixedCostRecord[],
  revenue: InvestmentRevenueRecord[],
  breakeven: InvestmentBreakevenRecord[],
  sensitivity: InvestmentSensitivityRecord[],
): InvestmentDetailRecord[] => {
  const projectDetails = projects.map(p => {
    const projCapex = capex.filter(c => c.projectKey === p.projectName);
    const projFixed = fixedCost.filter(c => c.projectKey === p.projectName);
    const projRev = revenue.filter(r => r.projectKey === p.projectName);
    const totalCapex = projCapex.reduce((n, c) => n + c.budgetAmount, 0) || p.budget;
    const totalFixed = projFixed.reduce((n, c) => n + c.monthlyBudget, 0) || p.monthlyCost;
    const totalRev = projRev.reduce((n, r) => n + r.monthlyRevenue, 0);
    const be = breakeven.find(b => b.projectKey === p.projectName && b.metricName === '保本收入');
    return {
      id: p.id,
      entityType: 'project' as const,
      segment: 'projects' as const,
      title: p.projectName,
      subtitle: `${p.region} · ${p.area}㎡ · ${p.storeType}`,
      projectName: p.projectName,
      region: p.region,
      area: `${p.area}㎡`,
      storeType: p.storeType,
      status: p.riskLevel === '高风险' ? '需复核' : '测算中',
      riskLevel: p.riskLevel,
      todaySuggestion: `关注 ${p.projectName} 投入 ${formatInvestmentCny(p.budget)} / 月成本 ${formatInvestmentCny(p.monthlyCost)} / 回本 ${p.paybackMonths}`,
      judgment: mkJudgment(p.riskLevel),
      coreMetrics: [
        { label: '初始投入', value: formatInvestmentCny(p.budget) },
        { label: '月固定成本', value: formatInvestmentCny(p.monthlyCost) },
        { label: '月收入预测', value: formatInvestmentCny(totalRev || 198000) },
        { label: '月净现金流', value: formatInvestmentCny((totalRev || 198000) - totalFixed) },
        { label: '预计回本', value: p.paybackMonths },
      ],
      capexStructure: projCapex.slice(0, 6).map(c => ({
        label: c.itemName,
        amount: formatInvestmentCny(c.budgetAmount),
        ratio: `${Math.round((c.budgetAmount / totalCapex) * 100)}%`,
        note: c.riskNote,
      })),
      fixedCostStructure: projFixed.slice(0, 6).map(c => ({
        label: c.costName,
        amount: formatInvestmentCny(c.monthlyBudget),
        ratio: c.ratio,
        note: c.isRigid === '是' ? '刚性成本' : '可调整',
      })),
      overBudgetItems: projCapex.filter(c => c.variance > 0).map(c => `${c.itemName} 超 ${formatInvestmentCny(c.variance)}`),
      rigidCostNote: `租金 + 人工占比约 ${projFixed.filter(c => ['租金', '人工'].includes(c.costType)).reduce((n, c) => n + parseInt(c.ratio), 0)}%（演示）`,
      revenueAssumptions: projRev.map(r => ({
        type: r.revenueType,
        volume: `${r.monthlyVolume}`,
        revenue: formatInvestmentCny(r.monthlyRevenue),
        utilization: r.utilization,
      })),
      breakevenRevenue: be?.breakevenReq ?? formatInvestmentCny(totalFixed),
      predictedRevenue: formatInvestmentCny(totalRev || 198000),
      monthlyNetCashflow: formatInvestmentCny((totalRev || 198000) - totalFixed),
      paybackPeriod: p.paybackMonths,
      safetyMargin: totalRev > totalFixed ? '有安全垫（演示）' : '缺口需关注',
      sensitivityLines: sensitivity.filter(s => s.projectKey === p.projectName).slice(0, 6).map(s => ({
        param: s.paramName,
        current: s.currentValue,
        adjusted: s.adjustedValue,
        paybackImpact: s.paybackImpact,
        cashflowImpact: s.cashflowImpact,
      })),
      highImpactParams: sensitivity.filter(s => s.projectKey === p.projectName && s.riskLevel === '高风险').map(s => s.paramName),
      caliberItems: [
        { metric: '初始投入', definition: '开店一次性资本支出合计（演示）', assumption: '含装修、设备、押金等', source: '测算模型' },
        { metric: '月固定成本', definition: '不随课量变化的月度支出', assumption: '租金、人工、物业等为刚性', source: '合同 + 人力模型' },
        { metric: '月收入预测', definition: '各产品线成交量 × 单价汇总', assumption: '基于排课产能与转化假设', source: '产能模型（演示）' },
        { metric: '风险提示', definition: '本测算不构成投资承诺', assumption: '—', source: '前端演示' },
      ],
      calcChain: ['投入', '成本', '现金流', '回本'],
      updatedAt: '2026-05-14 18:00（演示）',
      isDemo: true,
    };
  });

  const rowDetail = (
    row: InvestmentTableRow,
    entityType: InvestmentEntityType,
    title: string,
    subtitle: string,
    metrics: { label: string; value: string }[],
    chain: string[],
    projectKey: string,
  ): InvestmentDetailRecord => {
    const proj = projects.find(p => p.projectName === projectKey)!;
    const base = projectDetails.find(d => d.id === proj.id)!;
    return { ...base, id: row.id, entityType, segment: row.segment, title, subtitle, coreMetrics: metrics, calcChain: chain };
  };

  return [
    ...projectDetails,
    ...capex.map(c =>
      rowDetail(c, 'capex', c.itemName, `${c.category} · ${formatInvestmentCny(c.budgetAmount)}`, [
        { label: '分类', value: c.category },
        { label: '预算金额', value: formatInvestmentCny(c.budgetAmount) },
        { label: '已确认', value: formatInvestmentCny(c.confirmedAmount) },
        { label: '差异', value: formatInvestmentCny(c.variance) },
        { label: '是否必要', value: c.isEssential },
      ], ['投入', '预算', '确认', '差异'], c.projectKey),
    ),
    ...fixedCost.map(c =>
      rowDetail(c, 'fixedCost', c.costName, `${c.costType} · ${formatInvestmentCny(c.monthlyBudget)}`, [
        { label: '月预算', value: formatInvestmentCny(c.monthlyBudget) },
        { label: '占比', value: c.ratio },
        { label: '是否刚性', value: c.isRigid },
        { label: '风险说明', value: c.riskNote },
      ], ['成本', '刚性', '现金流', '回本'], c.projectKey),
    ),
    ...revenue.map(r =>
      rowDetail(r, 'revenue', r.revenueType, `${r.product} · ${formatInvestmentCny(r.monthlyRevenue)}`, [
        { label: '单价', value: formatInvestmentCny(r.unitPrice) },
        { label: '月成交量', value: `${r.monthlyVolume}` },
        { label: '月收入', value: formatInvestmentCny(r.monthlyRevenue) },
        { label: '产能利用率', value: r.utilization },
      ], ['产能', '收入', '保本', '回本'], r.projectKey),
    ),
    ...breakeven.map(b =>
      rowDetail(b, 'breakeven', b.metricName, `${b.judgment} · 差距 ${b.gap}`, [
        { label: '当前值', value: b.currentValue },
        { label: '保本要求', value: b.breakevenReq },
        { label: '差距', value: b.gap },
        { label: '影响因素', value: b.factor },
      ], ['保本', '产能', '现金流', '回本'], b.projectKey),
    ),
    ...sensitivity.map(s =>
      rowDetail(s, 'sensitivity', s.paramName, `回本影响 ${s.paybackImpact}`, [
        { label: '当前值', value: s.currentValue },
        { label: '调整后', value: s.adjustedValue },
        { label: '回本影响', value: s.paybackImpact },
        { label: '现金流影响', value: s.cashflowImpact },
      ], ['参数', '成本', '现金流', '回本'], s.projectKey),
    ),
    ...projects.flatMap(p => {
      const cf = buildCashflowForProject(p.projectName, p.budget, p.monthlyCost);
      return cf.map(c =>
        rowDetail(c, 'cashflow', c.monthLabel, `净现金流 ${formatInvestmentCny(c.netCashflow)}`, [
          { label: '期初现金', value: formatInvestmentCny(c.openingCash) },
          { label: '本月收入', value: formatInvestmentCny(c.monthlyIncome) },
          { label: '本月支出', value: formatInvestmentCny(c.monthlyExpense) },
          { label: '累计现金流', value: formatInvestmentCny(c.cumulativeCash) },
        ], ['投入', '成本', '现金流', '回本'], c.projectKey),
      );
    }),
  ];
};

const buildCashflowForProject = (
  projectKey: string,
  budget: number,
  monthlyCost: number,
): InvestmentCashflowRecord[] => {
  const monthlyIncome = [82000, 96000, 108000, 118000, 128000, 138000, 148000, 158000, 168000, 178000, 188000, 198000];
  let cumulative = -budget;
  let opening = -budget;
  return monthlyIncome.map((income, i) => {
    const expense = monthlyCost + (i < 3 ? 28000 : 12000);
    const net = income - expense;
    cumulative += net;
    const row: InvestmentCashflowRecord = {
      id: `dc-cf-${projectKey}-${i + 1}`,
      segment: 'cashflow',
      monthLabel: `第 ${i + 1} 月`,
      openingCash: opening,
      monthlyIncome: income,
      monthlyExpense: expense,
      netCashflow: net,
      cumulativeCash: cumulative,
      riskLevel: cumulative < -budget * 0.3 ? '高风险' : cumulative < 0 ? '关注' : '正常',
      projectKey,
    };
    opening = cumulative;
    return row;
  });
};

export const buildInvestmentOperationSnapshot = (): InvestmentOperationSnapshot => {
  const projects: InvestmentProjectRecord[] = PROJECTS.map((p, i) => ({
    id: `inv-prj-${i + 1}`,
    segment: 'projects',
    projectName: p.key,
    region: p.region,
    area: p.area,
    storeType: p.type,
    budget: p.budget,
    monthlyCost: p.monthly,
    paybackMonths: p.payback,
    riskLevel: p.risk,
    projectKey: p.key,
  }));

  const capex: InvestmentCapexRecord[] = PROJECTS.flatMap((p, pi) =>
    CAPEX_CATS.map((cat, ci) => {
      const budget = [420000, 280000, 180000, 120000, 80000, 45000, 65000, 200000][ci] * (pi === 2 ? 1.15 : pi === 0 ? 1.08 : 1);
      const confirmed = Math.round(budget * (ci === 0 && pi === 2 ? 1.12 : 0.92));
      return {
        id: `inv-cpx-${pi}-${ci}`,
        segment: 'capex' as const,
        itemName: `${p.key} · ${cat}`,
        category: cat,
        budgetAmount: Math.round(budget),
        confirmedAmount: confirmed,
        variance: confirmed - budget,
        isEssential: ci < 6 ? '是' : '视情况',
        riskNote: confirmed > budget ? '超预算（演示）' : '—',
        riskLevel: confirmed > budget * 1.05 ? '高风险' : confirmed > budget ? '关注' : '正常',
        projectKey: p.key,
      };
    }),
  ).slice(0, 40);

  const fixedItems = ['租金', '物业', '人工', '社保', '水电', '运营推广', '课程成本', '系统服务', '其他'];
  const fixedCost: InvestmentFixedCostRecord[] = PROJECTS.flatMap((p, pi) =>
    fixedItems.map((name, fi) => {
      const monthly = [52000, 8000, 48000, 12000, 6000, 8000, 15000, 3500, 5000][fi] * (p.area / 500);
      return {
        id: `inv-fix-${pi}-${fi}`,
        segment: 'fixedCost' as const,
        costName: name,
        costType: name,
        monthlyBudget: Math.round(monthly),
        ratio: `${Math.round((monthly / p.monthly) * 100)}%`,
        isRigid: ['租金', '物业', '人工', '社保'].includes(name) ? '是' : '否',
        riskNote: name === '租金' && pi === 2 ? '租金占比偏高' : '—',
        riskLevel: name === '租金' && pi === 2 ? '高风险' : '正常',
        projectKey: p.key,
      };
    }),
  ).slice(0, 45);

  const revTypes = [
    { type: '团课卡项', product: '月卡 / 季卡', price: 2800, vol: 42 },
    { type: '普拉提小班', product: '小班次卡', price: 380, vol: 180 },
    { type: '私教', product: '私教包', price: 4800, vol: 12 },
    { type: '教培', product: '教培课程', price: 12800, vol: 4 },
    { type: '活动 / 体验转化', product: '体验包', price: 680, vol: 48 },
    { type: '老会员续费', product: '续费订单', price: 3200, vol: 28 },
  ];
  const revenue: InvestmentRevenueRecord[] = PROJECTS.flatMap((p, pi) =>
    revTypes.map((r, ri) => ({
      id: `inv-rev-${pi}-${ri}`,
      segment: 'revenue' as const,
      revenueType: r.type,
      product: r.product,
      unitPrice: r.price,
      monthlyVolume: Math.round(r.vol * (p.area / 550)),
      monthlyRevenue: Math.round(r.price * r.vol * (p.area / 550)),
      utilization: ['72%', '68%', '55%', '80%', '62%', '75%'][ri],
      riskLevel: ri === 2 && pi === 2 ? '高风险' : ri === 1 && pi === 4 ? '关注' : '正常',
      projectKey: p.key,
    })),
  );

  const beMetrics = ['月固定成本', '保本收入', '保本到课人次', '保本小班满员率', '保本私教成交', '保本续费金额'];
  const breakeven: InvestmentBreakevenRecord[] = PROJECTS.flatMap((p, pi) =>
    beMetrics.map((m, mi) => ({
      id: `inv-be-${pi}-${mi}`,
      segment: 'breakeven' as const,
      metricName: m,
      currentValue: [formatInvestmentCny(p.monthly), formatInvestmentCny(p.monthly * 1.05), '820 人次', '62%', '8 单', formatInvestmentCny(68000)][mi],
      breakevenReq: [formatInvestmentCny(p.monthly), formatInvestmentCny(p.monthly), '780 人次', '58%', '6 单', formatInvestmentCny(52000)][mi],
      gap: ['0', formatInvestmentCny(p.monthly * 0.05), '-40', '-4%', '-2', formatInvestmentCny(-16000)][mi],
      factor: ['刚性成本', '产能 / 单价', '排课结构', '小班预约', '私教转化', '续费周期'][mi],
      judgment: mi === 1 && pi === 2 ? '未达保本' : mi === 3 && pi === 4 ? '关注' : '达标',
      riskLevel: mi === 1 && pi === 2 ? '高风险' : mi >= 3 && pi >= 3 ? '关注' : '正常',
      projectKey: p.key,
    })),
  );

  const cashflow = buildCashflowForProject('滨江宝龙馆', 2800000, 186000);

  const sensParams = ['租金上涨', '装修超支', '人工增加', '小班满员率下降', '私教成交下降', '教培招生不足', '退款率上升', '开业延期'];
  const sensitivity: InvestmentSensitivityRecord[] = PROJECTS.flatMap((p, pi) =>
    sensParams.map((param, si) => ({
      id: `inv-sen-${pi}-${si}`,
      segment: 'sensitivity' as const,
      paramName: param,
      currentValue: ['¥52,000/月', '+0%', '¥48,000/月', '68%', '12 单/月', '4 人/月', '3%', '0 天'][si],
      adjustedValue: ['¥58,000/月', '+12%', '¥54,000/月', '55%', '8 单/月', '2 人/月', '6%', '+30 天'][si],
      paybackImpact: ['+2 个月', '+3 个月', '+1 个月', '+4 个月', '+3 个月', '+2 个月', '+1 个月', '+2 个月'][si],
      cashflowImpact: ['-¥6,000/月', '-¥180,000', '-¥6,000/月', '-¥18,000/月', '-¥19,200/月', '-¥25,600/月', '-¥8,000/月', '推迟转正'][si],
      riskLevel: si < 2 || si === 3 ? (pi === 2 ? '高风险' : '关注') : '正常',
      projectKey: p.key,
    })),
  ).slice(0, 40);

  const details = buildDetails(projects, capex, fixedCost, revenue, breakeven, sensitivity);

  const primary = projects[0];
  const totalRev = revenue.filter(r => r.projectKey === primary.projectName).reduce((n, r) => n + r.monthlyRevenue, 0);
  const netCf = totalRev - primary.monthlyCost;
  const riskCount =
    projects.filter(p => p.riskLevel !== '正常').length +
    capex.filter(c => c.riskLevel === '高风险').length +
    sensitivity.filter(s => s.riskLevel === '高风险').length;

  const metrics: InvestmentMetric[] = [
    { id: 'im1', label: '初始投入', value: formatInvestmentCny(primary.budget), hint: `${primary.projectName} · 前端演示`, tone: 'amber' },
    { id: 'im2', label: '月固定成本', value: formatInvestmentCny(primary.monthlyCost), hint: '租金 + 人工 + 运营' },
    { id: 'im3', label: '月收入预测', value: formatInvestmentCny(totalRev), hint: '团课 / 小班 / 私教 / 教培' },
    { id: 'im4', label: '月净现金流', value: formatInvestmentCny(netCf), hint: netCf > 0 ? '预测转正（演示）' : '开业前期为负', tone: netCf < 0 ? 'rose' : 'default' },
    { id: 'im5', label: '预计回本周期', value: primary.paybackMonths, hint: '以累计现金流回正估算' },
    { id: 'im6', label: '投资风险项', value: `${riskCount} 项`, hint: '投入 / 成本 / 产能 / 回本', tone: 'rose' },
  ];

  const insights: InvestmentInsight[] = [
    { id: 'ii1', tag: '初始投入偏高', line: '云谷新店装修 / 设备 / 押金占比偏高', actionLabel: '查看', actionKey: 'capex' },
    { id: 'ii2', tag: '固定成本压力', line: '滨江宝龙馆租金 / 人工占月成本 62%', actionLabel: '分析', actionKey: 'fixedCost' },
    { id: 'ii3', tag: '产能不足', line: '云谷新店小班 / 私教未达到保本产能', actionLabel: '查看', actionKey: 'breakeven' },
    { id: 'ii4', tag: '回本风险', line: '现金流转正预计晚于标准方案 2 个月', actionLabel: '分析', actionKey: 'cashflow' },
  ];

  const focusQueue: InvestmentFocusItem[] = [
    { id: 'if1', segment: 'capex', group: 'overspend', entityType: 'capex', entityId: 'inv-cpx-2-0', title: '云谷新店 · 装修', statusLabel: '超预算', reasonLine: '装修确认金额超预算 12%', calcChain: ['投入', '预算', '现金流', '回本'], openTab: 'cost' },
    { id: 'if2', segment: 'capex', group: 'overspend', entityType: 'capex', entityId: 'inv-cpx-0-1', title: '滨江宝龙馆 · 设备', statusLabel: '关注', reasonLine: '设备采购价高于样板方案', calcChain: ['投入', '设备', '成本', '回本'] },
    { id: 'if3', segment: 'capex', group: 'overspend', entityType: 'project', entityId: 'inv-prj-3', title: '云谷新店', statusLabel: '投入偏高', reasonLine: '总投入高于同面积标准馆 18%', calcChain: ['投入', '成本', '现金流', '回本'] },
    { id: 'if4', segment: 'fixedCost', group: 'costPressure', entityType: 'fixedCost', entityId: 'inv-fix-2-0', title: '云谷新店 · 租金', statusLabel: '占比高', reasonLine: '租金占月固定成本 38%', calcChain: ['成本', '刚性', '现金流', '回本'], openTab: 'cost' },
    { id: 'if5', segment: 'fixedCost', group: 'costPressure', entityType: 'fixedCost', entityId: 'inv-fix-0-2', title: '滨江宝龙馆 · 人工', statusLabel: '刚性', reasonLine: '人工 + 社保占月成本 32%', calcChain: ['人工', '成本', '保本', '回本'] },
    { id: 'if6', segment: 'fixedCost', group: 'costPressure', entityType: 'project', entityId: 'inv-prj-1', title: '滨江宝龙馆', statusLabel: '成本压力', reasonLine: '月固定成本高于收入预测前 3 个月支出', calcChain: ['成本', '收入', '现金流', '回本'] },
    { id: 'if7', segment: 'revenue', group: 'capacityShort', entityType: 'revenue', entityId: 'inv-rev-2-2', title: '云谷新店 · 私教', statusLabel: '产能不足', reasonLine: '私教月成交 8 单，低于保本 10 单', calcChain: ['产能', '收入', '保本', '回本'], openTab: 'revenue' },
    { id: 'if8', segment: 'breakeven', group: 'capacityShort', entityType: 'breakeven', entityId: 'inv-be-2-3', title: '云谷新店 · 小班满员率', statusLabel: '未达标', reasonLine: '满员率 55%，保本要求 58%', calcChain: ['课程', '满员率', '收入', '保本'] },
    { id: 'if9', segment: 'revenue', group: 'capacityShort', entityType: 'revenue', entityId: 'inv-rev-4-1', title: '城西扩容 · 小班', statusLabel: '关注', reasonLine: '小班产能利用率 62%', calcChain: ['产能', '小班', '收入', '回本'] },
    { id: 'if10', segment: 'cashflow', group: 'paybackRisk', entityType: 'cashflow', entityId: 'dc-cf-滨江宝龙馆-4', title: '滨江宝龙馆 · 第 4 月', statusLabel: '现金紧张', reasonLine: '累计现金流仍为负，低于安全垫', calcChain: ['投入', '成本', '现金流', '回本'], openTab: 'payback' },
    { id: 'if11', segment: 'sensitivity', group: 'paybackRisk', entityType: 'sensitivity', entityId: 'inv-sen-2-3', title: '小班满员率下降', statusLabel: '高影响', reasonLine: '满员率降至 55% 时回本延后 4 个月', calcChain: ['参数', '产能', '现金流', '回本'], openTab: 'sensitivity' },
    { id: 'if12', segment: 'sensitivity', group: 'paybackRisk', entityType: 'sensitivity', entityId: 'inv-sen-2-0', title: '租金上涨', statusLabel: '回本延后', reasonLine: '租金上涨 12% 时月净现金流减少 ¥6,000', calcChain: ['租金', '成本', '现金流', '回本'] },
    { id: 'if13', segment: 'cashflow', group: 'paybackRisk', entityType: 'project', entityId: 'inv-prj-3', title: '云谷新店', statusLabel: '转正偏晚', reasonLine: '预计第 9 月现金流转正，晚于目标 2 月', calcChain: ['投入', '成本', '现金流', '回本'], openTab: 'payback' },
    { id: 'if14', segment: 'projects', group: 'overspend', entityType: 'project', entityId: 'inv-prj-5', title: '城西扩容方案', statusLabel: '关注', reasonLine: '扩容投入需与产能释放节奏匹配', calcChain: ['投入', '产能', '收入', '回本'] },
    { id: 'if15', segment: 'breakeven', group: 'capacityShort', entityType: 'breakeven', entityId: 'inv-be-2-1', title: '云谷新店 · 保本收入', statusLabel: '缺口', reasonLine: '预测收入低于保本收入 5%', calcChain: ['收入', '保本', '现金流', '回本'], openTab: 'payback' },
    { id: 'if16', segment: 'sensitivity', group: 'paybackRisk', entityType: 'sensitivity', entityId: 'inv-sen-2-7', title: '开业延期', statusLabel: '现金流风险', reasonLine: '延期 30 天将推迟收入启动并增加成本', calcChain: ['开业', '收入', '现金流', '回本'] },
  ];

  return {
    metrics,
    insights,
    projects,
    capex,
    fixedCost,
    revenue,
    breakeven,
    cashflow,
    sensitivity,
    details,
    focusQueue,
  };
};

export const findInvestmentDetail = (snapshot: InvestmentOperationSnapshot, id: string) =>
  snapshot.details.find(d => d.id === id);

export const getInvestmentRows = (snapshot: InvestmentOperationSnapshot, segment: InvestmentSegment): InvestmentTableRow[] => {
  switch (segment) {
    case 'projects': return snapshot.projects;
    case 'capex': return snapshot.capex;
    case 'fixedCost': return snapshot.fixedCost;
    case 'revenue': return snapshot.revenue;
    case 'breakeven': return snapshot.breakeven;
    case 'cashflow': return snapshot.cashflow;
    case 'sensitivity': return snapshot.sensitivity;
    default: return [];
  }
};

export const filterInvestmentRows = (
  rows: InvestmentTableRow[],
  segment: InvestmentSegment,
  filters: InvestmentListFilters,
): InvestmentTableRow[] => {
  const q = filters.query.trim().toLowerCase();
  return rows.filter(row => {
    if (filters.project !== '全部项目') {
      const pk = 'projectKey' in row ? row.projectKey : 'projectName' in row ? row.projectName : '';
      if (pk && pk !== filters.project) return false;
    }
    if ('riskLevel' in row && filters.risk !== '全部' && row.riskLevel !== filters.risk) return false;
    if (!q) return true;
    return JSON.stringify(row).toLowerCase().includes(q);
  });
};

export const computeInvestmentSegmentMiniSummary = (
  snapshot: InvestmentOperationSnapshot,
  segment: InvestmentSegment,
): { label: string; value: string }[] => {
  switch (segment) {
    case 'projects': {
      const rows = snapshot.projects;
      const avg = rows.reduce((n, p) => n + p.budget, 0) / rows.length;
      const fastest = [...rows].sort((a, b) => parseInt(a.paybackMonths) - parseInt(b.paybackMonths))[0];
      return [
        { label: '项目数', value: `${rows.length} 个` },
        { label: '平均投入', value: formatInvestmentCny(avg) },
        { label: '最快回本', value: fastest?.paybackMonths ?? '—' },
        { label: '高风险项目', value: `${rows.filter(p => p.riskLevel === '高风险').length} 个` },
      ];
    }
    case 'capex': {
      const rows = snapshot.capex;
      const total = rows.reduce((n, c) => n + c.budgetAmount, 0);
      const confirmed = rows.reduce((n, c) => n + c.confirmedAmount, 0);
      return [
        { label: '预算总额', value: formatInvestmentCny(total) },
        { label: '已确认', value: formatInvestmentCny(confirmed) },
        { label: '超预算项', value: `${rows.filter(c => c.variance > 0).length} 项` },
        { label: '必要投入', value: `${rows.filter(c => c.isEssential === '是').length} 项` },
      ];
    }
    case 'fixedCost': {
      const rows = snapshot.fixedCost;
      const total = rows.reduce((n, c) => n + c.monthlyBudget, 0);
      const rigid = rows.filter(c => c.isRigid === '是').reduce((n, c) => n + c.monthlyBudget, 0);
      const rent = rows.filter(c => c.costType === '租金').reduce((n, c) => n + c.monthlyBudget, 0);
      const labor = rows.filter(c => c.costType === '人工').reduce((n, c) => n + c.monthlyBudget, 0);
      return [
        { label: '月成本', value: formatInvestmentCny(total) },
        { label: '刚性成本', value: formatInvestmentCny(rigid) },
        { label: '人工占比', value: total ? `${Math.round((labor / total) * 100)}%` : '—' },
        { label: '租金占比', value: total ? `${Math.round((rent / total) * 100)}%` : '—' },
      ];
    }
    case 'revenue': {
      const rows = snapshot.revenue;
      const total = rows.reduce((n, r) => n + r.monthlyRevenue, 0);
      const small = rows.filter(r => r.revenueType.includes('小班')).reduce((n, r) => n + r.monthlyRevenue, 0);
      const pt = rows.filter(r => r.revenueType === '私教').reduce((n, r) => n + r.monthlyRevenue, 0);
      const train = rows.filter(r => r.revenueType === '教培').reduce((n, r) => n + r.monthlyRevenue, 0);
      return [
        { label: '预测收入', value: formatInvestmentCny(total) },
        { label: '小班收入', value: formatInvestmentCny(small) },
        { label: '私教收入', value: formatInvestmentCny(pt) },
        { label: '教培收入', value: formatInvestmentCny(train) },
      ];
    }
    case 'breakeven': {
      const rows = snapshot.breakeven;
      const income = rows.find(r => r.metricName === '保本收入');
      const pred = rows.find(r => r.metricName === '保本收入');
      return [
        { label: '保本收入', value: income?.breakevenReq ?? '—' },
        { label: '当前预测', value: pred?.currentValue ?? '—' },
        { label: '缺口', value: `${rows.filter(r => r.judgment === '未达保本').length} 项` },
        { label: '安全垫', value: `${rows.filter(r => r.judgment === '达标').length} 项达标` },
      ];
    }
    case 'cashflow': {
      const rows = snapshot.cashflow;
      const first = rows[0];
      const positive = rows.find(r => r.cumulativeCash > 0);
      const min = rows.reduce((m, r) => (r.cumulativeCash < m.cumulativeCash ? r : m), rows[0]);
      return [
        { label: '首月现金', value: first ? formatInvestmentCny(first.openingCash) : '—' },
        { label: '现金流转正月', value: positive?.monthLabel ?? '未转正（演示）' },
        { label: '最低现金余额', value: min ? formatInvestmentCny(min.cumulativeCash) : '—' },
        { label: '回本月', value: positive?.monthLabel ?? '—' },
      ];
    }
    case 'sensitivity': {
      const rows = snapshot.sensitivity;
      return [
        { label: '参数数', value: `${rows.length} 个` },
        { label: '高影响参数', value: `${rows.filter(s => s.riskLevel === '高风险').length} 个` },
        { label: '回本延后风险', value: `${rows.filter(s => s.paybackImpact.includes('+3') || s.paybackImpact.includes('+4')).length} 项` },
        { label: '建议优先控制', value: '租金 / 装修 / 满员率' },
      ];
    }
    default:
      return [];
  }
};

export const FOCUS_GROUP_TITLES: Record<InvestmentFocusGroup, string> = {
  overspend: '投入超支',
  costPressure: '成本压力',
  capacityShort: '产能不足',
  paybackRisk: '回本风险',
};

const SEGMENT_FOCUS_MAP: Record<InvestmentSegment, InvestmentFocusGroup[]> = {
  projects: ['overspend', 'paybackRisk'],
  capex: ['overspend'],
  fixedCost: ['costPressure'],
  revenue: ['capacityShort'],
  breakeven: ['capacityShort', 'paybackRisk'],
  cashflow: ['paybackRisk'],
  sensitivity: ['paybackRisk', 'overspend'],
};

export const getSegmentFocusItems = (queue: InvestmentFocusItem[], segment: InvestmentSegment): InvestmentFocusItem[] => {
  const groups = new Set(SEGMENT_FOCUS_MAP[segment] ?? Object.keys(FOCUS_GROUP_TITLES));
  return queue.filter(i => i.segment === segment || groups.has(i.group));
};
