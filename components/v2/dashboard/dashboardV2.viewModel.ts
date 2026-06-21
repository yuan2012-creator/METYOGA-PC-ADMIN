/** 经营总览 v1.7 — mock 数据与类型（C 版设计令牌） */

export type DashboardV2PriorityLevel = 'P0' | 'P1' | 'P2';

export type DashboardV2SuggestionSource = 'system_rule' | 'pending_config';

export interface DashboardV2PageMeta {
  title: string;
  subtitle: string;
  filters: {
    storeLabel: string;
    periodLabel: string;
    exportLabel: string;
  };
}

export interface DashboardV2DiagnosisHero {
  conclusion: string;
  description: string;
  tags: string[];
  evidenceButtonLabel: string;
}

export interface DashboardV2OperatingProfitSummary {
  title: string;
  subtitle: string;
  profitStatusLabel: string;
  profitLabel: string;
  operatingProfit: string;
  operatingProfitRate: string;
  operatingProfitDelta: string;
  belowTargetStoreCount: number;
  belowTargetStoreLabel: string;
  footnote: string;
}

export interface DashboardV2Metric {
  id: string;
  label: string;
  value: string;
  changeLabel: string;
  changeDirection: 'up' | 'down' | 'neutral';
  note: string;
  isWarning?: boolean;
}

export interface DashboardV2RiskItem {
  id: string;
  priority: 'P0' | 'P1';
  title: string;
  fact: string;
  impact: string;
  suggestionSource: DashboardV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestedAction: string;
  buttonLabel: string;
}

export interface DashboardV2ProfitTrendPoint {
  month: string;
  profitWan: number;
}

export interface DashboardV2ProfitTrend {
  title: string;
  subtitle: string;
  currentOperatingProfit: string;
  currentOperatingProfitDelta: string;
  currentDeltaDirection: 'up' | 'down' | 'neutral';
  points: DashboardV2ProfitTrendPoint[];
}

export interface DashboardV2DeliveryItem {
  id: string;
  label: string;
  value: string;
  note?: string;
}

export interface DashboardV2DeliverySummary {
  title: string;
  detailButtonLabel: string;
  items: DashboardV2DeliveryItem[];
}

export type DashboardV2CoverageStatus = 'ok' | 'warn' | 'risk';

export type DashboardV2StoreStatusLevel = 'danger' | 'warning' | 'success' | 'neutral' | 'loss';

export type DashboardV2CoverageTone = 'danger' | 'warning' | 'success';

export interface DashboardV2StoreHighlight {
  id: string;
  title: string;
  value: string;
  note?: string;
}

export interface DashboardV2CostStructure {
  totalCost: number;
  totalCostLabel: string;
  isLoss: boolean;
  lossAmount: number;
  lossLabel: string;
  structureScaleMax: number;
  revenueBaselineRatio: number;
  laborCostRatio: number;
  fixedCostRatio: number;
  operationCostRatio: number;
  profitRatio: number;
  lossRatio: number;
  barDenominator: number;
  lossResultLabel: string;
  operatingResultHeadline: string;
  structureHint: string;
}

export interface DashboardV2StoreStructureRow {
  id: string;
  storeName: string;
  statusLabel: string;
  statusLevel: DashboardV2StoreStatusLevel;
  confirmedRevenue: string;
  confirmedRevenueValue: number;
  cashReceived: string;
  prepaidLiability: string;
  operatingProfit: string;
  operatingProfitValue: number;
  laborCost: string;
  laborCostValue: number;
  fixedCost: string;
  fixedCostValue: number;
  operationCost: string;
  operationCostValue: number;
  costStructure: DashboardV2CostStructure;
  cashSafetyCoverage: string;
  cashSafetyCoveragePercent: number;
  coverageTone: DashboardV2CoverageTone;
  businessJudgement: string;
  nextActionLabel: string;
}

export interface DashboardV2StoreComparison {
  title: string;
  subtitle: string;
  highlights: DashboardV2StoreHighlight[];
  stores: DashboardV2StoreStructureRow[];
}

export interface DashboardV2Snapshot {
  meta: DashboardV2PageMeta;
  diagnosis: DashboardV2DiagnosisHero;
  operatingProfitSummary: DashboardV2OperatingProfitSummary;
  metrics: DashboardV2Metric[];
  riskQueue: DashboardV2RiskItem[];
  profitTrend: DashboardV2ProfitTrend;
  deliverySummary: DashboardV2DeliverySummary;
  storeComparison: DashboardV2StoreComparison;
}


function coverageToneFromPercent(percent: number): DashboardV2CoverageTone {
  if (percent >= 80) return 'success';
  if (percent >= 70) return 'warning';
  return 'danger';
}

function roundRatio(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildCostStructure(
  confirmedRevenueValue: number,
  laborCostValue: number,
  fixedCostValue: number,
  operationCostValue: number,
): DashboardV2CostStructure {
  const totalCost = laborCostValue + fixedCostValue + operationCostValue;
  const operatingProfitValue = confirmedRevenueValue - totalCost;
  const isLoss = operatingProfitValue < 0;
  const lossAmount = isLoss ? Math.abs(operatingProfitValue) : 0;
  const structureScaleMax = Math.max(confirmedRevenueValue, totalCost);

  if (!isLoss) {
    const laborCostRatio = roundRatio((laborCostValue / confirmedRevenueValue) * 100);
    const fixedCostRatio = roundRatio((fixedCostValue / confirmedRevenueValue) * 100);
    const operationCostRatio = roundRatio((operationCostValue / confirmedRevenueValue) * 100);
    const profitRatio = roundRatio(100 - laborCostRatio - fixedCostRatio - operationCostRatio);

    return {
      totalCost,
      totalCostLabel: formatWan(totalCost),
      isLoss: false,
      lossAmount: 0,
      lossLabel: '',
      structureScaleMax: confirmedRevenueValue,
      revenueBaselineRatio: 100,
      laborCostRatio,
      fixedCostRatio,
      operationCostRatio,
      profitRatio,
      lossRatio: 0,
      barDenominator: confirmedRevenueValue,
      lossResultLabel: '',
      operatingResultHeadline: '',
      structureHint: '',
    };
  }

  const barDenominator = totalCost + lossAmount;
  const lossResultLabel = `亏损 ${formatProfitWan(-lossAmount)}`;

  return {
    totalCost,
    totalCostLabel: formatWan(totalCost),
    isLoss: true,
    lossAmount,
    lossLabel: formatProfitWan(-lossAmount),
    structureScaleMax,
    revenueBaselineRatio: roundRatio((confirmedRevenueValue / barDenominator) * 100),
    laborCostRatio: roundRatio((laborCostValue / barDenominator) * 100),
    fixedCostRatio: roundRatio((fixedCostValue / barDenominator) * 100),
    operationCostRatio: roundRatio((operationCostValue / barDenominator) * 100),
    profitRatio: 0,
    lossRatio: roundRatio((lossAmount / barDenominator) * 100),
    barDenominator,
    lossResultLabel,
    operatingResultHeadline: `经营结果：${lossResultLabel}`,
    structureHint: '成本超过确认收入',
  };
}

interface DashboardV2StoreStructureSeed {
  id: string;
  storeName: string;
  statusLabel: string;
  statusLevel: DashboardV2StoreStatusLevel;
  confirmedRevenueValue: number;
  cashReceivedValue: number;
  prepaidLiabilityValue: number;
  laborCostValue: number;
  fixedCostValue: number;
  operationCostValue: number;
  cashSafetyCoveragePercent: number;
  businessJudgement: string;
  nextActionLabel: string;
}

function formatWan(value: number): string {
  return `¥${value}万`;
}

function formatProfitWan(value: number): string {
  if (value < 0) {
    return `-¥${Math.abs(value)}万`;
  }
  return `¥${value}万`;
}

function buildStoreStructureRow(seed: DashboardV2StoreStructureSeed): DashboardV2StoreStructureRow {
  const costStructure = buildCostStructure(
    seed.confirmedRevenueValue,
    seed.laborCostValue,
    seed.fixedCostValue,
    seed.operationCostValue,
  );
  const operatingProfitValue = seed.confirmedRevenueValue - costStructure.totalCost;

  return {
    id: seed.id,
    storeName: seed.storeName,
    statusLabel: seed.statusLabel,
    statusLevel: seed.statusLevel,
    confirmedRevenue: formatWan(seed.confirmedRevenueValue),
    confirmedRevenueValue: seed.confirmedRevenueValue,
    cashReceived: formatWan(seed.cashReceivedValue),
    prepaidLiability: formatWan(seed.prepaidLiabilityValue),
    operatingProfit: formatProfitWan(operatingProfitValue),
    operatingProfitValue,
    laborCost: formatWan(seed.laborCostValue),
    laborCostValue: seed.laborCostValue,
    fixedCost: formatWan(seed.fixedCostValue),
    fixedCostValue: seed.fixedCostValue,
    operationCost: formatWan(seed.operationCostValue),
    operationCostValue: seed.operationCostValue,
    costStructure,
    cashSafetyCoverage: `${seed.cashSafetyCoveragePercent}%`,
    cashSafetyCoveragePercent: seed.cashSafetyCoveragePercent,
    coverageTone: coverageToneFromPercent(seed.cashSafetyCoveragePercent),
    businessJudgement: seed.businessJudgement,
    nextActionLabel: seed.nextActionLabel,
  };
}

export function buildDashboardV2Snapshot(): DashboardV2Snapshot {
  return {
    meta: {
      title: '经营总览',
      subtitle: '总部经营视角 · 2026年6月',
      filters: {
        storeLabel: '全部门店',
        periodLabel: '本月',
        exportLabel: '导出报告',
      },
    },
    diagnosis: {
      conclusion: '本月确认收入改善，但现金安全覆盖率降至 72%',
      description:
        '已收未交付压力仍高于安全线，需优先处理滨江馆与西湖馆的预收负债压力。',
      tags: ['P0 现金安全', '系统规则建议'],
      evidenceButtonLabel: '查看证据链',
    },
    operatingProfitSummary: {
      title: '经营利润摘要',
      subtitle: '确认收入 − 成本，区别于实收现金',
      profitStatusLabel: '本月经营为正',
      profitLabel: '本月经营利润',
      operatingProfit: '¥46万',
      operatingProfitRate: '15.8%',
      operatingProfitDelta: '+4.6%',
      belowTargetStoreCount: 2,
      belowTargetStoreLabel: '低于目标门店',
      footnote: '按耗课确认收入扣除运营成本后的经营结果，不等同于实收现金。',
    },
    metrics: [
      {
        id: 'm-confirmed',
        label: '确认收入',
        value: '¥231万',
        changeLabel: '环比 +6.2%',
        changeDirection: 'up',
        note: '按耗课确认，不等于实收',
      },
      {
        id: 'm-cash',
        label: '实收金额',
        value: '¥286万',
        changeLabel: '环比 +3.8%',
        changeDirection: 'up',
        note: '包含新购、续费、补款',
      },
      {
        id: 'm-deferred',
        label: '预收负债',
        value: '¥418万',
        changeLabel: '环比 +9.4%',
        changeDirection: 'up',
        note: '已收款但尚未交付课程',
      },
      {
        id: 'm-coverage',
        label: '现金安全覆盖率',
        value: '72%',
        changeLabel: '低于安全线 80%',
        changeDirection: 'down',
        note: '需关注可用现金对预收责任的覆盖',
        isWarning: true,
      },
    ],
    riskQueue: [
      {
        id: 'rq-1',
        priority: 'P0',
        title: '现金安全覆盖率偏低',
        fact: '全品牌可用现金对预收负债覆盖率为 72%，连续 2 周低于 80% 安全线。',
        impact: '滨江馆、西湖馆',
        suggestionSource: 'system_rule',
        suggestionSourceLabel: '系统规则建议',
        suggestedAction: '启动预收负债专项复核，优先安排高余额会员耗课与交付。',
        buttonLabel: '查看详情',
      },
      {
        id: 'rq-2',
        priority: 'P1',
        title: '高余额低耗课会员增加',
        fact: '余额 ≥ ¥8,000 且 30 天耗课 ≤ 2 次的会员本周新增 18 人。',
        impact: '会员续费与预收结构',
        suggestionSource: 'system_rule',
        suggestionSourceLabel: '系统规则建议',
        suggestedAction: '推送专属跟进任务至门店顾问，本周内完成首轮触达。',
        buttonLabel: '生成清单',
      },
      {
        id: 'rq-3',
        priority: 'P1',
        title: '部分老师课时负载过高',
        fact: '5 位老师本周排课量超过个人上限 115%，其中 2 位集中在晚高峰。',
        impact: '课程交付质量与师资稳定性',
        suggestionSource: 'pending_config',
        suggestionSourceLabel: '待配置规则',
        suggestedAction: '评估加课或调班方案，避免连续高负载导致取消率上升。',
        buttonLabel: '调整排课',
      },
    ],
    profitTrend: {
      title: '经营利润趋势',
      subtitle: '近 12 个月 · 口径：确认收入 − 成本',
      currentOperatingProfit: '¥46万',
      currentOperatingProfitDelta: '+4.6%',
      currentDeltaDirection: 'up',
      points: [
        { month: '7月', profitWan: 42 },
        { month: '8月', profitWan: 45 },
        { month: '9月', profitWan: 41 },
        { month: '10月', profitWan: 48 },
        { month: '11月', profitWan: 52 },
        { month: '12月', profitWan: 55 },
        { month: '1月', profitWan: 49 },
        { month: '2月', profitWan: 44 },
        { month: '3月', profitWan: 50 },
        { month: '4月', profitWan: 53 },
        { month: '5月', profitWan: 56 },
        { month: '6月', profitWan: 46 },
      ],
    },
    deliverySummary: {
      title: '课程交付摘要',
      detailButtonLabel: '查看交付明细',
      items: [
        { id: 'd-1', label: '本月耗课点数', value: '12,480 点', note: '较上月 +4.1%' },
        { id: 'd-2', label: '满课率', value: '78.6%' },
        { id: 'd-3', label: '低预约课程数', value: '23 节', note: '需关注周末早课' },
        { id: 'd-4', label: '满员未加课提醒', value: '6 节', note: '建议 48h 内评估加课' },
      ],
    },
    storeComparison: {
      title: '多店经营对比',
      subtitle: '按经营结构、利润结果与现金安全综合判断',
      highlights: [
        {
          id: 'h-attention',
          title: '最需关注',
          value: '滨江馆 / 西湖馆',
          note: '覆盖不足 · 西湖馆亏损',
        },
        {
          id: 'h-profit',
          title: '利润最高',
          value: '银泰馆 ¥15万',
        },
        {
          id: 'h-healthy',
          title: '经营健康',
          value: '城北馆 84%',
        },
      ],
      stores: [
        buildStoreStructureRow({
          id: 's-bj',
          storeName: '滨江馆',
          statusLabel: 'P0 现金压力',
          statusLevel: 'danger',
          confirmedRevenueValue: 68,
          cashReceivedValue: 82,
          prepaidLiabilityValue: 126,
          laborCostValue: 28,
          fixedCostValue: 18,
          operationCostValue: 10,
          cashSafetyCoveragePercent: 68,
          businessJudgement: '预收压力偏高，优先交付',
          nextActionLabel: '查看详情',
        }),
        buildStoreStructureRow({
          id: 's-xh',
          storeName: '西湖馆',
          statusLabel: 'P1 利润为负',
          statusLevel: 'loss',
          confirmedRevenueValue: 61,
          cashReceivedValue: 74,
          prepaidLiabilityValue: 118,
          laborCostValue: 30,
          fixedCostValue: 20,
          operationCostValue: 15,
          cashSafetyCoveragePercent: 71,
          businessJudgement: '确认收入不足以覆盖当月成本，需优化排课效率与人力成本。',
          nextActionLabel: '查看详情',
        }),
        buildStoreStructureRow({
          id: 's-cb',
          storeName: '城北馆',
          statusLabel: '健康',
          statusLevel: 'success',
          confirmedRevenueValue: 54,
          cashReceivedValue: 66,
          prepaidLiabilityValue: 89,
          laborCostValue: 21,
          fixedCostValue: 14,
          operationCostValue: 8,
          cashSafetyCoveragePercent: 84,
          businessJudgement: '经营稳健',
          nextActionLabel: '查看详情',
        }),
        buildStoreStructureRow({
          id: 's-yt',
          storeName: '银泰馆',
          statusLabel: '观察',
          statusLevel: 'neutral',
          confirmedRevenueValue: 48,
          cashReceivedValue: 64,
          prepaidLiabilityValue: 85,
          laborCostValue: 18,
          fixedCostValue: 10,
          operationCostValue: 5,
          cashSafetyCoveragePercent: 79,
          businessJudgement: '接近安全线，持续观察',
          nextActionLabel: '查看详情',
        }),
      ],
    },
  };
}
