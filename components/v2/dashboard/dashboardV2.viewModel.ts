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

export type DashboardV2ViewMode = 'hq' | 'storeManager';

export type StoreOperatingStatusLevel = 'healthy' | 'watch' | 'warning' | 'highRisk';

export type StoreMetricStatusLevel = 'normal' | 'watch' | 'warning' | 'highRisk';

export interface StoreInsightEvidence {
  label: string;
  value: string;
  isWarning?: boolean;
}

export interface StoreOperatingConclusion {
  storeName: string;
  periodLabel: string;
  operatingStatus: StoreOperatingStatusLevel;
  statusLabel: string;
  headline: string;
  primaryReason: string;
  judgmentSources: string[];
  updatedAt: string;
  evidence: StoreInsightEvidence[];
  evidenceButtonLabel: string;
  evidenceToastMessage: string;
}

export interface StoreCoreMetric {
  id: string;
  label: string;
  value: string;
  changeLabel: string;
  status: StoreMetricStatusLevel;
  statusLabel: string;
  explanation: string;
  sourceModule: string;
  drillDownToast: string;
}

export interface StorePriorityAction {
  id: string;
  priority: DashboardV2PriorityLevel;
  title: string;
  impactScope: string;
  sourceModules: string[];
  ownerRole: string;
  suggestedAction: string;
  buttonLabel: string;
  drillDownToast: string;
}

export interface StoreWeeklyAction {
  id: string;
  priority: DashboardV2PriorityLevel;
  title: string;
  impactScope: string;
  ownerRole: string;
  sourceModule: string;
  suggestedAction: string;
  buttonLabel: string;
  drillDownToast: string;
}

export interface StoreIssueCategory {
  id: string;
  title: string;
  status: StoreMetricStatusLevel;
  statusLabel: string;
  riskCount: number;
  representativeIssue: string;
  suggestedAction: string;
  entryModule: string;
  entryButtonLabel: string;
  drillDownToast: string;
}

export interface StoreStructureCard {
  id: string;
  title: string;
  fields: { label: string; value: string; isWarning?: boolean }[];
  entryModule: string;
  entryButtonLabel: string;
  drillDownToast: string;
}

export interface StoreDrillDownEntry {
  id: string;
  label: string;
  drillDownToast: string;
}

export interface StoreManagerDashboardSnapshot {
  conclusion: StoreOperatingConclusion;
  coreMetrics: StoreCoreMetric[];
  todayActions: StorePriorityAction[];
  issueCategories: StoreIssueCategory[];
  structureCards: StoreStructureCard[];
  weekActions: StoreWeeklyAction[];
  drillDownEntries: StoreDrillDownEntry[];
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
  storeManagerView: StoreManagerDashboardSnapshot;
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

function buildStoreManagerView(): StoreManagerDashboardSnapshot {
  return {
    conclusion: {
      storeName: '滨江馆',
      periodLabel: '2026年6月',
      operatingStatus: 'watch',
      statusLabel: '观察',
      headline: '滨江馆 · 本月经营状态：观察',
      primaryReason:
        '本月实收正常，但现金安全覆盖率低于 80%，耗课目标完成偏慢，高余额低耗课会员增加，需要优先处理交付和会员风险。',
      judgmentSources: ['财务与资产', '会员经营', '课程与排课'],
      updatedAt: '2026-06-26 09:30 更新',
      evidence: [
        { label: '现金安全覆盖率', value: '72%，安全线 80%', isWarning: true },
        { label: '耗课目标完成率', value: '68%', isWarning: true },
        { label: '高余额低耗课会员', value: '12 人', isWarning: true },
        { label: '本月退费申请', value: '4 笔' },
      ],
      evidenceButtonLabel: '查看判断依据',
      evidenceToastMessage: '查看判断依据（待建设）',
    },
    coreMetrics: [
      {
        id: 'sm-received',
        label: '本月实收',
        value: '¥286,000',
        changeLabel: '较上月 +8%',
        status: 'normal',
        statusLabel: '正常',
        explanation: '实收现金到账正常，不等于确认收入',
        sourceModule: '财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sm-recognized',
        label: '本月确认收入',
        value: '¥231,000',
        changeLabel: '较上月 +5%',
        status: 'normal',
        statusLabel: '正常',
        explanation: '按耗课确认，区别于实收现金',
        sourceModule: '财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sm-profit',
        label: '经营利润',
        value: '¥46,000',
        changeLabel: '利润率 19.9%',
        status: 'watch',
        statusLabel: '观察',
        explanation: '确认收入 − 成本，需关注成本压力',
        sourceModule: '财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sm-coverage',
        label: '现金安全覆盖率',
        value: '72%',
        changeLabel: '低于安全线 80%',
        status: 'watch',
        statusLabel: '观察',
        explanation: '可用现金对预收责任覆盖不足',
        sourceModule: '财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sm-consumption',
        label: '本月耗课目标完成率',
        value: '68%',
        changeLabel: '落后时间进度 9%',
        status: 'warning',
        statusLabel: '预警',
        explanation: '交付进度偏慢，需补排与跟进',
        sourceModule: '课程与排课',
        drillDownToast: '进入课程与排课（待建设）',
      },
      {
        id: 'sm-liability',
        label: '预收负债',
        value: '¥418,000',
        changeLabel: '已收未交付压力偏高',
        status: 'watch',
        statusLabel: '观察',
        explanation: '预收负债不是收入，需推进耗课交付',
        sourceModule: '财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sm-active',
        label: '活跃会员数',
        value: '326 人',
        changeLabel: '较上月 -3%',
        status: 'watch',
        statusLabel: '观察',
        explanation: '活跃会员略有下降，需关注低频风险',
        sourceModule: '会员经营',
        drillDownToast: '进入会员经营（待建设）',
      },
      {
        id: 'sm-refund-risk',
        label: '本月退费 / 流失风险',
        value: '退费 4 笔',
        changeLabel: '流失风险 18 人',
        status: 'warning',
        statusLabel: '预警',
        explanation: '退费与流失风险需优先处理证据链',
        sourceModule: '会员经营 / 财务与资产',
        drillDownToast: '进入会员经营（待建设）',
      },
    ],
    todayActions: [
      {
        id: 'ta-1',
        priority: 'P0',
        title: '跟进 12 名高余额低耗课会员',
        impactScope: '预收负债与现金安全',
        sourceModules: ['会员经营', '财务与资产'],
        ownerRole: '管家 / 对应老师',
        suggestedAction: '分配老师或管家点对点跟进',
        buttonLabel: '去处理',
        drillDownToast: '进入会员经营（待建设）',
      },
      {
        id: 'ta-2',
        priority: 'P1',
        title: '补排 2 节高需求课程',
        impactScope: '耗课目标与会员到店频率',
        sourceModules: ['课程与排课'],
        ownerRole: '店长',
        suggestedAction: '优先补排晚间普拉提小班',
        buttonLabel: '去排课',
        drillDownToast: '进入课程与排课（待建设）',
      },
      {
        id: 'ta-3',
        priority: 'P1',
        title: '处理 4 笔退费证据链',
        impactScope: '现金安全与合同争议',
        sourceModules: ['财务与资产'],
        ownerRole: '店长 / 财务',
        suggestedAction: '补齐合同、支付、耗课、积分证据',
        buttonLabel: '去核对',
        drillDownToast: '进入财务与资产（待建设）',
      },
    ],
    issueCategories: [
      {
        id: 'ic-cash',
        title: '现金与财务',
        status: 'watch',
        statusLabel: '观察',
        riskCount: 3,
        representativeIssue: '现金安全覆盖率 72%，低于安全线 80%',
        suggestedAction: '处理高余额低耗课与退费证据链',
        entryModule: '财务与资产',
        entryButtonLabel: '进入财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'ic-course',
        title: '耗课与课程',
        status: 'warning',
        statusLabel: '预警',
        riskCount: 4,
        representativeIssue: '耗课完成率 68%，落后时间进度 9%',
        suggestedAction: '补排高需求课程，处理低满班课程',
        entryModule: '课程与排课',
        entryButtonLabel: '进入课程与排课',
        drillDownToast: '进入课程与排课（待建设）',
      },
      {
        id: 'ic-member',
        title: '会员与资产',
        status: 'watch',
        statusLabel: '观察',
        riskCount: 5,
        representativeIssue: '高余额低耗课会员增加 12 人',
        suggestedAction: '分配老师 / 管家点对点跟进',
        entryModule: '会员经营',
        entryButtonLabel: '进入会员经营',
        drillDownToast: '进入会员经营（待建设）',
      },
      {
        id: 'ic-teacher',
        title: '老师与供给',
        status: 'watch',
        statusLabel: '观察',
        riskCount: 2,
        representativeIssue: '2 位老师负载偏高，1 位老师可补排',
        suggestedAction: '调整排课与代课安排',
        entryModule: '师资与团队',
        entryButtonLabel: '进入师资与团队',
        drillDownToast: '进入师资与团队（待建设）',
      },
      {
        id: 'ic-marketing',
        title: '获客与转化',
        status: 'watch',
        statusLabel: '观察',
        riskCount: 2,
        representativeIssue: '预约未到店 46 人',
        suggestedAction: '跟进未到店线索并同步会员经营',
        entryModule: '活动与获客',
        entryButtonLabel: '进入活动与获客',
        drillDownToast: '进入活动与获客（待建设）',
      },
    ],
    structureCards: [
      {
        id: 'sc-consumption',
        title: '耗课目标进度',
        fields: [
          { label: '本月目标', value: '520 点' },
          { label: '已完成', value: '354 点' },
          { label: '完成率', value: '68%', isWarning: true },
          { label: '日均还需', value: '9.2 点' },
          { label: '可补耗课程', value: '7 节' },
        ],
        entryModule: '课程与排课',
        entryButtonLabel: '进入课程与排课',
        drillDownToast: '进入课程与排课（待建设）',
      },
      {
        id: 'sc-cost',
        title: '成本压力',
        fields: [
          { label: '本月预算', value: '¥190,000' },
          { label: '已发生', value: '¥176,000' },
          { label: '成本使用率', value: '92%', isWarning: true },
          { label: '风险', value: '接近预算上限' },
          { label: '主要压力', value: '老师课酬预估 / 活动成本' },
        ],
        entryModule: '财务与资产',
        entryButtonLabel: '进入财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sc-cash',
        title: '现金安全与预收负债',
        fields: [
          { label: '现金安全覆盖率', value: '72%', isWarning: true },
          { label: '预收负债', value: '¥418,000' },
          { label: '待退费金额', value: '¥36,000' },
          { label: '判断', value: '观察' },
        ],
        entryModule: '财务与资产',
        entryButtonLabel: '进入财务与资产',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'sc-member',
        title: '会员结构',
        fields: [
          { label: '总会员', value: '482' },
          { label: '活跃会员', value: '326' },
          { label: '低频风险', value: '42' },
          { label: '续费窗口', value: '28' },
          { label: '沉睡流失', value: '31' },
        ],
        entryModule: '会员经营',
        entryButtonLabel: '进入会员经营',
        drillDownToast: '进入会员经营（待建设）',
      },
      {
        id: 'sc-marketing',
        title: '获客转化',
        fields: [
          { label: '线索', value: '186' },
          { label: '预约体验', value: '92' },
          { label: '到店体验', value: '46' },
          { label: '成交', value: '18' },
          { label: '最大断点', value: '预约未到店', isWarning: true },
        ],
        entryModule: '活动与获客',
        entryButtonLabel: '进入活动与获客',
        drillDownToast: '进入活动与获客（待建设）',
      },
      {
        id: 'sc-teacher',
        title: '师资供给',
        fields: [
          { label: '可用老师', value: '12' },
          { label: '负载偏高', value: '2', isWarning: true },
          { label: '可代课', value: '4' },
          { label: '老师端待处理申请', value: '5' },
          { label: '名下会员风险', value: '9' },
        ],
        entryModule: '师资与团队',
        entryButtonLabel: '进入师资与团队',
        drillDownToast: '进入师资与团队（待建设）',
      },
    ],
    weekActions: [
      {
        id: 'wa-1',
        priority: 'P1',
        title: '补排周六上午普拉提小班',
        impactScope: '耗课目标与周末供给',
        ownerRole: '店长',
        sourceModule: '课程与排课',
        suggestedAction: '评估满班需求后补排 1–2 节',
        buttonLabel: '去排课',
        drillDownToast: '进入课程与排课（待建设）',
      },
      {
        id: 'wa-2',
        priority: 'P1',
        title: '跟进 S4 低频风险会员',
        impactScope: '活跃会员与续费窗口',
        ownerRole: '管家',
        sourceModule: '会员经营',
        suggestedAction: '本周内完成首轮点对点触达',
        buttonLabel: '去跟进',
        drillDownToast: '进入会员经营（待建设）',
      },
      {
        id: 'wa-3',
        priority: 'P1',
        title: '复核退费 / 冻结 / 转卡证据链',
        impactScope: '现金安全与合同争议',
        ownerRole: '店长 / 财务',
        sourceModule: '财务与资产',
        suggestedAction: '补齐合同、支付、耗课、积分证据',
        buttonLabel: '去核对',
        drillDownToast: '进入财务与资产（待建设）',
      },
      {
        id: 'wa-4',
        priority: 'P2',
        title: '处理老师代课 / 请假申请',
        impactScope: '课程供给与会员通知',
        ownerRole: '教学负责人',
        sourceModule: '师资与团队',
        suggestedAction: '优先处理晚高峰代课申请',
        buttonLabel: '去处理',
        drillDownToast: '进入师资与团队（待建设）',
      },
      {
        id: 'wa-5',
        priority: 'P2',
        title: '复盘朋友圈渠道线索转化',
        impactScope: '获客转化与会员承接',
        ownerRole: '运营',
        sourceModule: '活动与获客',
        suggestedAction: '分析预约未到店断点并调整跟进',
        buttonLabel: '去复盘',
        drillDownToast: '进入活动与获客（待建设）',
      },
    ],
    drillDownEntries: [
      { id: 'dd-member', label: '查看会员风险', drillDownToast: '进入会员经营（待建设）' },
      { id: 'dd-course', label: '查看耗课目标', drillDownToast: '进入课程与排课（待建设）' },
      { id: 'dd-finance', label: '查看财务资产', drillDownToast: '进入财务与资产（待建设）' },
      { id: 'dd-staff', label: '查看师资供给', drillDownToast: '进入师资与团队（待建设）' },
      { id: 'dd-marketing', label: '查看活动转化', drillDownToast: '进入活动与获客（待建设）' },
      { id: 'dd-today', label: '查看今日运营', drillDownToast: '进入今日运营（待建设）' },
    ],
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
    storeManagerView: buildStoreManagerView(),
  };
}
