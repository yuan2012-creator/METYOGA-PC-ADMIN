export type FinanceV2SuggestionSource = 'system_rule' | 'pending_config';
export type FinanceV2Priority = 'P0' | 'P1' | 'P2';
export type FinanceV2StoreStatusLevel = 'danger' | 'warning' | 'healthy' | 'watch';
export type FinanceV2CoverageTone = 'danger' | 'warning' | 'healthy' | 'watch';
export type FinanceV2MetricTone = 'danger' | 'warning' | 'healthy' | 'neutral' | 'watch';
export type FinanceV2DrawerType = 'asset' | 'store' | 'finance_evidence';

export interface FinanceV2Meta {
  title: string;
  subtitle: string;
}

export interface FinanceV2Filters {
  storeLabel: string;
  periodLabel: string;
  paymentTypeLabel: string;
  assetStatusLabel: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  detailLinkLabel: string;
}

export interface FinanceV2SectionHeader {
  title: string;
  subtitle: string;
}

export interface FinanceV2EvidenceMetric {
  label: string;
  value: string;
}

export interface FinanceV2HealthSummary {
  section: FinanceV2SectionHeader;
  title: string;
  conclusion: string;
  description: string;
  statusTags: string[];
  suggestionSource: FinanceV2SuggestionSource;
  suggestionSourceLabel: string;
  evidence: FinanceV2EvidenceMetric[];
  actionLabel: string;
}

export interface CashSafetyMetric {
  id: string;
  title: string;
  value: string;
  description: string;
  statusLabel: string;
  tone: FinanceV2MetricTone;
  safeLine?: string;
  actionLabel: string;
  toastMessage: string;
}

export interface FinanceV2CashSafety {
  title: string;
  metrics: CashSafetyMetric[];
}

export type FinanceV2EvidenceStatus = 'complete' | 'missing' | 'pending';

export interface FinancialStructureFlowStep {
  id: string;
  label: string;
  value: string;
  tone: 'cash' | 'revenue' | 'liability' | 'profit' | 'cost';
  description?: string;
}

export interface FinancialStructureFlowItem {
  label: string;
  value: string;
}

export interface PrepaidLiabilityBreakdownItem {
  label: string;
  amount: string;
  amountValue: number;
  description: string;
  tone: 'scheduled' | 'risk' | 'warning' | 'change';
}

export interface FinancialStructureFlow {
  title: string;
  subtitle: string;
  inflow: FinancialStructureFlowItem;
  inflowSplits: FinancialStructureFlowItem[];
  flowSteps: FinancialStructureFlowStep[];
  outcomes: FinancialStructureFlowItem[];
  confirmedRevenue: FinancialStructureFlowItem;
  costItems: FinancialStructureFlowItem[];
  operatingProfit: FinancialStructureFlowItem;
  prepaidLiabilityStock: FinancialStructureFlowItem;
  prepaidLiabilityNote: string;
  prepaidLiabilityBreakdown: PrepaidLiabilityBreakdownItem[];
}

export interface StoreMonthlyChangeSummary {
  coveragePercent: string;
  coverageChange: string;
  coverageTone: 'up' | 'down' | 'neutral';
  keyChange: string;
  keyChangeTone: 'up' | 'down' | 'neutral' | 'warn';
  judgement: string;
}

export interface StoreFinanceRow {
  id: string;
  storeName: string;
  statusLabel: string;
  statusLevel: FinanceV2StoreStatusLevel;
  confirmedRevenue: string;
  cashReceived: string;
  prepaidLiability: string;
  operatingProfit: string;
  operatingProfitValue: number;
  cashSafetyCoverage: string;
  cashSafetyCoveragePercent: number;
  coverageTone: FinanceV2CoverageTone;
  businessJudgement: string;
  monthlyChangeSummary: StoreMonthlyChangeSummary;
  actionLabel: string;
}

export interface AssetRiskItem {
  id: string;
  priority: FinanceV2Priority;
  title: string;
  fact: string;
  impact: string;
  suggestionSource: FinanceV2SuggestionSource;
  suggestionSourceLabel: string;
  suggestionAction: string;
  actionLabel: string;
  toastMessage: string;
  relatedAssetId?: string;
  relatedStoreId?: string;
}

export interface RevenueEvidenceTask {
  id: string;
  title: string;
  count: string;
  source: string;
  impactScope: string;
  taskStatus: string;
  actionLabel: string;
  toastMessage: string;
}

export interface RevenueRecognitionSummary {
  title: string;
  subtitle: string;
  flowSteps: string[];
  metrics: FinanceV2EvidenceMetric[];
  tasks: RevenueEvidenceTask[];
}

export interface EvidenceCompletenessItem {
  key: string;
  label: string;
  status: FinanceV2EvidenceStatus;
  statusLabel: string;
}

export interface AssetChangeRequest {
  id: string;
  memberName: string;
  cardName: string;
  remainingPoints: string;
  reason: string;
  status: string;
  actionLabel: string;
  evidenceCompleteness: EvidenceCompletenessItem[];
  completenessScore: string;
  relatedAssetId?: string;
}

export interface AssetChangeQueue {
  id: string;
  type: 'refund' | 'transfer' | 'freeze';
  typeLabel: string;
  summary: {
    pending: string;
    detail1: string;
    detail2: string;
    detail3: string;
  };
  actionLabel: string;
  toastMessage: string;
  requests: AssetChangeRequest[];
}

export interface PaymentSettlementCard {
  id: string;
  channel: string;
  received: string;
  detail: string;
  status: string;
  exceptionLabel: string;
  tone: FinanceV2MetricTone;
  actionLabel?: string;
  toastMessage?: string;
}

export interface PaymentSettlementSummary {
  title: string;
  subtitle: string;
  cards: PaymentSettlementCard[];
  crossStoreRule: string;
  settlementAlert: string;
}

export interface EvidenceChainItem {
  label: string;
  value: string;
  status?: 'ok' | 'warn' | 'missing';
}

export interface ProcessingSuggestion {
  text: string;
  suggestionSource: FinanceV2SuggestionSource;
  suggestionSourceLabel: string;
}

export interface AssetDetail {
  id: string;
  title: string;
  subtitle: string;
  overview: EvidenceChainItem[];
  financeMetrics: EvidenceChainItem[];
  contractEvidence: EvidenceChainItem[];
  evidenceCompleteness: EvidenceCompletenessItem[];
  operationLogStatus: string;
  processingSuggestion: ProcessingSuggestion;
  activityRecords: { label: string }[];
  riskFlags: { label: string; tone: FinanceV2MetricTone }[];
  actions: { label: string; toastMessage: string }[];
}

export interface FinanceDetail {
  id: string;
  title: string;
  subtitle: string;
  metrics: EvidenceChainItem[];
  riskSummary: EvidenceChainItem[];
  suggestions: string[];
  actions: { label: string; toastMessage: string }[];
}

export interface FinanceV2Snapshot {
  meta: FinanceV2Meta;
  filters: FinanceV2Filters;
  healthSummary: FinanceV2HealthSummary;
  cashSafety: FinanceV2CashSafety;
  financialStructure: FinancialStructureFlow;
  storeFinanceHealth: {
    title: string;
    subtitle: string;
    stores: StoreFinanceRow[];
  };
  assetRiskQueue: {
    title: string;
    subtitle: string;
    items: AssetRiskItem[];
  };
  revenueRecognition: RevenueRecognitionSummary;
  assetChangeQueues: AssetChangeQueue[];
  paymentSettlement: PaymentSettlementSummary;
  financeDetailMap: Record<string, FinanceDetail>;
  assetDetailMap: Record<string, AssetDetail>;
}

const EVIDENCE_XUQIAN: EvidenceCompletenessItem[] = [
  { key: 'contract', label: '合同', status: 'complete', statusLabel: '已齐' },
  { key: 'payment', label: '支付', status: 'complete', statusLabel: '已齐' },
  { key: 'consumption', label: '耗课', status: 'pending', statusLabel: '待核对' },
  { key: 'member', label: '会员确认', status: 'missing', statusLabel: '缺失' },
];

const EVIDENCE_WANGFANG: EvidenceCompletenessItem[] = [
  { key: 'contract', label: '合同', status: 'complete', statusLabel: '已齐' },
  { key: 'payment', label: '支付', status: 'complete', statusLabel: '已齐' },
  { key: 'consumption', label: '耗课', status: 'complete', statusLabel: '已齐' },
  { key: 'member', label: '会员确认', status: 'pending', statusLabel: '待核对' },
];

const EVIDENCE_DEFAULT_COMPLETE: EvidenceCompletenessItem[] = [
  { key: 'contract', label: '合同', status: 'complete', statusLabel: '已齐' },
  { key: 'payment', label: '支付', status: 'complete', statusLabel: '已齐' },
  { key: 'consumption', label: '耗课', status: 'complete', statusLabel: '已齐' },
  { key: 'member', label: '会员确认', status: 'complete', statusLabel: '已齐' },
];

const EVIDENCE_DEFAULT_PARTIAL: EvidenceCompletenessItem[] = [
  { key: 'contract', label: '合同', status: 'complete', statusLabel: '已齐' },
  { key: 'payment', label: '支付', status: 'pending', statusLabel: '待核对' },
  { key: 'consumption', label: '耗课', status: 'complete', statusLabel: '已齐' },
  { key: 'member', label: '会员确认', status: 'missing', statusLabel: '缺失' },
];

function countCompleteEvidence(items: EvidenceCompletenessItem[]): string {
  const complete = items.filter(i => i.status === 'complete').length;
  return `${complete}/${items.length}`;
}

const XUQIAN_ASSET: AssetDetail = {
  id: 'asset-xuqian',
  title: '许倩 · 天选卡资产详情',
  subtitle: '滨江馆 · 天选卡 · 剩余 96 点 · S4 低频风险',
  overview: [
    { label: '会员姓名', value: '许倩' },
    { label: '卡项名称', value: '天选卡' },
    { label: '购买金额', value: '¥12,800' },
    { label: '总点数', value: '120 点' },
    { label: '已耗点数', value: '24 点' },
    { label: '剩余点数', value: '96 点' },
    { label: '有效期', value: '2026-09-30' },
    { label: '当前状态', value: '正常 · 低频耗课' },
  ],
  financeMetrics: [
    { label: '实收金额', value: '¥12,800' },
    { label: '已确认收入', value: '¥2,560' },
    { label: '剩余预收负债', value: '¥10,240' },
    { label: '预计可交付点数', value: '96 点' },
    { label: '是否涉及退款 / 冻结 / 转卡', value: '暂无，存在临期风险' },
  ],
  contractEvidence: [
    { label: '合同编号', value: 'HT-2025-BJ-0892', status: 'ok' },
    { label: '重点条款确认', value: '已确认', status: 'ok' },
    { label: '身份证 / 联系方式', value: '已归档', status: 'ok' },
    { label: '支付凭证', value: '微信支付 · 已关联', status: 'ok' },
    { label: '电子签署状态', value: '已签署', status: 'ok' },
    { label: '操作日志', value: '12 条记录', status: 'ok' },
  ],
  evidenceCompleteness: EVIDENCE_XUQIAN,
  operationLogStatus: '已记录',
  processingSuggestion: {
    text: '当前不建议直接审批退款，需先核对耗课记录并补齐会员确认',
    suggestionSource: 'system_rule',
    suggestionSourceLabel: '系统规则建议',
  },
  activityRecords: [
    { label: '最近耗课：2026-06-08 流瑜伽 · 扣 2 点' },
    { label: '预约记录：近 30 天 2 次预约' },
    { label: '冻结记录：无' },
    { label: '转卡记录：无' },
    { label: '退款记录：无' },
    { label: '积分流水：+120 入会 · -24 耗课' },
  ],
  riskFlags: [
    { label: '高余额低耗课', tone: 'warning' },
    { label: '临期风险（剩余 3 个月）', tone: 'warning' },
    { label: '退款风险', tone: 'neutral' },
    { label: '证据链完整', tone: 'healthy' },
  ],
  actions: [
    { label: '生成跟进任务', toastMessage: '推送至会员经营（待建设）' },
    { label: '查看合同', toastMessage: '进入合同详情（待建设）' },
    { label: '查看流水', toastMessage: '进入资产流水（待建设）' },
    { label: '记录处理', toastMessage: '记录处理结果（待建设）' },
  ],
};

function buildStoreFinanceDetail(store: StoreFinanceRow): FinanceDetail {
  return {
    id: `finance-${store.id}`,
    title: `${store.storeName} · 财务健康详情`,
    subtitle: `本月 · 现金安全覆盖率 ${store.cashSafetyCoverage}`,
    metrics: [
      { label: '实收金额', value: store.cashReceived },
      { label: '确认收入', value: store.confirmedRevenue },
      { label: '预收负债', value: store.prepaidLiability },
      { label: '经营利润', value: store.operatingProfit },
      { label: '现金安全覆盖率', value: store.cashSafetyCoverage },
      { label: '高风险资产', value: store.statusLevel === 'danger' ? '12 笔' : store.statusLevel === 'warning' ? '8 笔' : '4 笔' },
      { label: '退款 / 冻结 / 转卡', value: store.statusLevel === 'danger' ? '6 笔待处理' : '3 笔待处理' },
      { label: '待确认耗课', value: store.statusLevel === 'danger' ? '48 点' : '24 点' },
      { label: '跨店结算', value: store.storeName === '滨江馆' ? '¥6.2万待分摊' : '¥3.8万待分摊' },
    ],
    riskSummary: [
      { label: '经营判断', value: store.businessJudgement },
      { label: '状态', value: store.statusLabel },
    ],
    suggestions: [
      store.operatingProfitValue < 0 ? '优先控制成本与交付压力' : '持续观察现金安全覆盖率',
      '核对高余额低耗课资产清单',
      '同步会员经营处理临期资产',
    ],
    actions: [
      { label: '查看财务证据链', toastMessage: '进入财务证据链（待建设）' },
      { label: '查看资产风险', toastMessage: '进入资产风险队列（待建设）' },
      { label: '跨店结算', toastMessage: '进入跨店结算（待建设）' },
    ],
  };
}

const FINANCE_EVIDENCE_DETAIL: FinanceDetail = {
  id: 'finance-evidence',
  title: '本月财务证据链',
  subtitle: '总部经营视角 · 实收、确认收入、预收负债与利润口径',
  metrics: [
    { label: '实收金额', value: '¥286万' },
    { label: '确认收入', value: '¥231万' },
    { label: '预收负债', value: '¥418万' },
    { label: '经营利润', value: '¥46万' },
    { label: '现金安全覆盖率', value: '72%' },
    { label: '本月耗课点数', value: '12,480 点' },
    { label: '待确认耗课', value: '312 点' },
    { label: '异常耗课记录', value: '18 条' },
  ],
  riskSummary: [
    { label: '核心判断', value: '确认收入为正，但现金安全覆盖率低于安全线' },
    { label: '优先门店', value: '滨江馆、西湖馆' },
  ],
  suggestions: [
    '优先处理滨江馆与西湖馆预收负债',
    '跟进高余额低耗课资产 18 人',
    '核对本周 4 笔退款申请证据链',
  ],
  actions: [
    { label: '查看合同', toastMessage: '进入合同证据链（待建设）' },
    { label: '查看流水', toastMessage: '进入收支流水（待建设）' },
    { label: '记录处理', toastMessage: '记录财务处理（待建设）' },
  ],
};

export function buildFinanceV2Snapshot(): FinanceV2Snapshot {
  const stores: StoreFinanceRow[] = [
    {
      id: 'store-binjiang',
      storeName: '滨江馆',
      statusLabel: 'P0 现金压力',
      statusLevel: 'danger',
      confirmedRevenue: '¥68万',
      cashReceived: '¥82万',
      prepaidLiability: '¥126万',
      operatingProfit: '¥12万',
      operatingProfitValue: 12,
      cashSafetyCoverage: '68%',
      cashSafetyCoveragePercent: 68,
      coverageTone: 'danger',
      businessJudgement: '预收压力偏高，优先交付',
      monthlyChangeSummary: {
        coveragePercent: '68%',
        coverageChange: '较上月 -6%',
        coverageTone: 'down',
        keyChange: '预收负债 +12%',
        keyChangeTone: 'warn',
        judgement: '压力扩大，优先交付',
      },
      actionLabel: '查看详情',
    },
    {
      id: 'store-xihu',
      storeName: '西湖馆',
      statusLabel: 'P1 负债跟进',
      statusLevel: 'warning',
      confirmedRevenue: '¥61万',
      cashReceived: '¥74万',
      prepaidLiability: '¥118万',
      operatingProfit: '¥-4万',
      operatingProfitValue: -4,
      cashSafetyCoverage: '71%',
      cashSafetyCoveragePercent: 71,
      coverageTone: 'warning',
      businessJudgement: '利润为负，需控制成本与交付压力',
      monthlyChangeSummary: {
        coveragePercent: '71%',
        coverageChange: '较上月 -4%',
        coverageTone: 'down',
        keyChange: '经营利润 -¥4万',
        keyChangeTone: 'down',
        judgement: '利润为负，需控制成本',
      },
      actionLabel: '查看详情',
    },
    {
      id: 'store-chengbei',
      storeName: '城北馆',
      statusLabel: '健康',
      statusLevel: 'healthy',
      confirmedRevenue: '¥54万',
      cashReceived: '¥66万',
      prepaidLiability: '¥89万',
      operatingProfit: '¥11万',
      operatingProfitValue: 11,
      cashSafetyCoverage: '84%',
      cashSafetyCoveragePercent: 84,
      coverageTone: 'healthy',
      businessJudgement: '经营稳定',
      monthlyChangeSummary: {
        coveragePercent: '84%',
        coverageChange: '较上月 +3%',
        coverageTone: 'up',
        keyChange: '经营利润 ¥11万',
        keyChangeTone: 'up',
        judgement: '经营稳定',
      },
      actionLabel: '查看详情',
    },
    {
      id: 'store-yintai',
      storeName: '银泰馆',
      statusLabel: '观察',
      statusLevel: 'watch',
      confirmedRevenue: '¥48万',
      cashReceived: '¥64万',
      prepaidLiability: '¥85万',
      operatingProfit: '¥15万',
      operatingProfitValue: 15,
      cashSafetyCoverage: '79%',
      cashSafetyCoveragePercent: 79,
      coverageTone: 'watch',
      businessJudgement: '接近安全线，持续观察',
      monthlyChangeSummary: {
        coveragePercent: '79%',
        coverageChange: '较上月 -1%',
        coverageTone: 'down',
        keyChange: '接近安全线',
        keyChangeTone: 'warn',
        judgement: '持续观察',
      },
      actionLabel: '查看详情',
    },
  ];

  const financeDetailMap: Record<string, FinanceDetail> = {
    'finance-evidence': FINANCE_EVIDENCE_DETAIL,
  };
  stores.forEach(s => {
    financeDetailMap[`finance-${s.id}`] = buildStoreFinanceDetail(s);
  });

  const assetDetailMap: Record<string, AssetDetail> = {
    'asset-xuqian': XUQIAN_ASSET,
  };

  return {
    meta: {
      title: '财务与资产',
      subtitle: '总部经营视角 · 收款、确认收入、预收负债与资产风险',
    },
    filters: {
      storeLabel: '全部门店',
      periodLabel: '本月',
      paymentTypeLabel: '全部类型',
      assetStatusLabel: '全部状态',
      primaryActionLabel: '导出财务报告',
      secondaryActionLabel: '财务规则',
      detailLinkLabel: '收支明细',
    },
    healthSummary: {
      section: {
        title: '本月财务健康判断',
        subtitle: '区分实收现金、确认收入和预收负债，判断当前经营是否安全',
      },
      title: '财务健康结论',
      conclusion: '本月确认收入为正，但现金安全覆盖率降至 72%',
      description: '本月确认收入改善，但已收未交付压力仍高于安全线，需优先处理滨江馆与西湖馆的预收负债和高风险资产。',
      statusTags: ['P0 现金安全'],
      suggestionSource: 'system_rule',
      suggestionSourceLabel: '系统规则建议',
      evidence: [
        { label: '实收金额', value: '¥286万' },
        { label: '确认收入', value: '¥231万' },
        { label: '预收负债', value: '¥418万' },
        { label: '现金安全覆盖率', value: '72%' },
      ],
      actionLabel: '查看财务证据链',
    },
    cashSafety: {
      title: '现金安全与预收压力',
      metrics: [
        {
          id: 'cs-1',
          title: '可用现金覆盖率',
          value: '72%',
          safeLine: '安全线：80%',
          description: '',
          statusLabel: '低于安全线',
          tone: 'danger',
          actionLabel: '查看门店',
          toastMessage: '进入门店财务矩阵（待建设）',
        },
        {
          id: 'cs-2',
          title: '预收负债',
          value: '¥418万',
          description: '已收款但尚未交付课程',
          statusLabel: '压力偏高',
          tone: 'warning',
          actionLabel: '查看资产',
          toastMessage: '进入会员资产风险队列（待建设）',
        },
        {
          id: 'cs-3',
          title: '本月经营利润',
          value: '¥46万',
          description: '按确认收入扣除运营成本',
          statusLabel: '经营为正',
          tone: 'healthy',
          actionLabel: '查看口径',
          toastMessage: '进入财务口径结构（待建设）',
        },
        {
          id: 'cs-4',
          title: '高风险资产',
          value: '32 笔',
          description: '退款、冻结、到期、低耗课资产',
          statusLabel: '需处理',
          tone: 'warning',
          actionLabel: '处理',
          toastMessage: '进入资产风险处理（待建设）',
        },
      ],
    },
    financialStructure: {
      title: '财务口径结构',
      subtitle: '用一张图说明实收、确认收入、预收负债和经营利润的关系',
      inflow: { label: '实收金额', value: '¥286万' },
      inflowSplits: [
        { label: '新购', value: '¥168万' },
        { label: '续费', value: '¥82万' },
        { label: '补款', value: '¥18万' },
        { label: '其他', value: '¥18万' },
      ],
      flowSteps: [
        { id: 'fs-1', label: '实收金额', value: '¥286万', tone: 'cash', description: '本月实际收款' },
        { id: 'fs-2', label: '本期确认收入', value: '¥231万', tone: 'revenue', description: '按耗课交付确认' },
        { id: 'fs-3', label: '新增预收负债', value: '¥55万', tone: 'liability', description: '已收未交付部分' },
        { id: 'fs-4', label: '经营利润', value: '¥46万', tone: 'profit', description: '确认收入扣成本' },
        { id: 'fs-5', label: '预收负债存量', value: '¥418万', tone: 'liability', description: '不等于收入' },
      ],
      outcomes: [
        { label: '本期确认收入', value: '¥231万' },
        { label: '新增预收负债', value: '¥55万' },
      ],
      confirmedRevenue: { label: '确认收入', value: '¥231万' },
      costItems: [
        { label: '老师与员工成本', value: '¥92万' },
        { label: '房租物业', value: '¥48万' },
        { label: '市场与运营', value: '¥31万' },
        { label: '其他成本', value: '¥14万' },
      ],
      operatingProfit: { label: '经营利润', value: '¥46万' },
      prepaidLiabilityStock: { label: '预收负债结构', value: '¥418万' },
      prepaidLiabilityNote: '已收款但尚未交付课程，不等于确认收入',
      prepaidLiabilityBreakdown: [
        {
          label: '已预约未耗课',
          amount: '¥126万',
          amountValue: 126,
          description: '已预约课程尚未完成交付',
          tone: 'scheduled',
        },
        {
          label: '高余额低耗课',
          amount: '¥118万',
          amountValue: 118,
          description: '高余额会员近期耗课不足',
          tone: 'risk',
        },
        {
          label: '临期未交付',
          amount: '¥89万',
          amountValue: 89,
          description: '30 天内到期仍有余额',
          tone: 'warning',
        },
        {
          label: '冻结 / 转卡影响',
          amount: '¥85万',
          amountValue: 85,
          description: '资产状态变化影响交付节奏',
          tone: 'change',
        },
      ],
    },
    storeFinanceHealth: {
      title: '门店财务健康矩阵',
      subtitle: '按确认收入、实收、预收负债和现金安全覆盖率判断门店压力',
      stores,
    },
    assetRiskQueue: {
      title: '会员资产风险队列',
      subtitle: '识别高余额、低耗课、临期、冻结、退款和合同风险资产',
      items: [
        {
          id: 'ar-1',
          priority: 'P0',
          title: '高余额低耗课资产增加',
          fact: '余额 > ¥8,000 且 30 天耗课 ≤ 2 次会员新增 18 人',
          impact: '会员续费、预收负债、现金安全覆盖',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '推送专属跟进任务至会员经营',
          actionLabel: '生成清单',
          toastMessage: '生成高余额低耗课清单（待建设）',
          relatedAssetId: 'asset-xuqian',
        },
        {
          id: 'ar-2',
          priority: 'P0',
          title: '退款申请待确认',
          fact: '本周新增退款申请 4 笔，涉及剩余点数 186 点',
          impact: '现金流、合同履约、会员关系',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '核对合同、资产、耗课和积分记录',
          actionLabel: '处理',
          toastMessage: '进入退款处理（待建设）',
          relatedAssetId: 'asset-xuqian',
        },
        {
          id: 'ar-3',
          priority: 'P1',
          title: '冻结申请待审核',
          fact: '本周新增冻结申请 6 笔，其中 2 笔资料不完整',
          impact: '资产有效期、会员权益、门店执行',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '补齐材料后审批',
          actionLabel: '审核',
          toastMessage: '进入冻结审核（待建设）',
        },
        {
          id: 'ar-4',
          priority: 'P1',
          title: '临期资产未跟进',
          fact: '30 天内到期且余额 > 20 点资产共 21 笔',
          impact: '续费窗口、资产过期纠纷',
          suggestionSource: 'system_rule',
          suggestionSourceLabel: '系统规则建议',
          suggestionAction: '同步会员经营续费窗口',
          actionLabel: '跟进',
          toastMessage: '进入临期资产跟进（待建设）',
          relatedAssetId: 'asset-xuqian',
        },
        {
          id: 'ar-5',
          priority: 'P2',
          title: '合同资料不完整',
          fact: '本月新增 5 笔订单缺少身份证 / 重点条款确认记录',
          impact: '退费争议、证据链完整性',
          suggestionSource: 'pending_config',
          suggestionSourceLabel: '待配置规则',
          suggestionAction: '补齐合同资料',
          actionLabel: '补齐',
          toastMessage: '进入合同资料补齐（待建设）',
        },
      ],
    },
    revenueRecognition: {
      title: '收入确认与耗课证据',
      subtitle: '按课程交付与耗课记录确认收入，避免把收款误认为收入',
      flowSteps: ['预约课程', '到课签到', '扣点耗课', '确认收入', '进入经营利润口径'],
      metrics: [
        { label: '本月耗课点数', value: '12,480 点' },
        { label: '已确认收入', value: '¥231万' },
        { label: '待确认耗课', value: '312 点' },
        { label: '异常耗课记录', value: '18 条' },
      ],
      tasks: [
        {
          id: 'rt-1', title: '补签待确认', count: '6 条', source: '老师端 / 前台',
          impactScope: '确认收入、会员扣点、老师课时', taskStatus: '待核对',
          actionLabel: '核对', toastMessage: '进入补签证据处理页（待建设）',
        },
        {
          id: 'rt-2', title: '爽约待处理', count: '8 条', source: '课程签到',
          impactScope: '确认收入、会员扣点、候补释放', taskStatus: '待处理',
          actionLabel: '处理', toastMessage: '进入爽约证据处理页（待建设）',
        },
        {
          id: 'rt-3', title: '手动扣点记录', count: '3 条', source: '后台操作',
          impactScope: '确认收入、资产扣点、操作留痕', taskStatus: '待查看',
          actionLabel: '查看', toastMessage: '进入手动扣点证据页（待建设）',
        },
        {
          id: 'rt-4', title: '跨店耗课结算', count: '12 条', source: '通馆课程',
          impactScope: '消课店 / 卖卡店分摊', taskStatus: '待结算',
          actionLabel: '结算', toastMessage: '进入跨店结算证据页（待建设）',
        },
      ],
    },
    assetChangeQueues: [
      {
        id: 'ac-refund',
        type: 'refund',
        typeLabel: '退款',
        summary: {
          pending: '待处理：4 笔',
          detail1: '涉及剩余点数：186 点',
          detail2: '涉及金额预估：¥23.2万',
          detail3: '高风险：2 笔',
        },
        actionLabel: '查看退款',
        toastMessage: '进入退款队列（待建设）',
        requests: [
          {
            id: 'rf-1', memberName: '许倩', cardName: '天选卡', remainingPoints: '96 点', reason: '搬迁外地',
            status: '待核对', actionLabel: '审核', relatedAssetId: 'asset-xuqian',
            evidenceCompleteness: EVIDENCE_XUQIAN, completenessScore: countCompleteEvidence(EVIDENCE_XUQIAN),
          },
          {
            id: 'rf-2', memberName: '周敏', cardName: '年卡', remainingPoints: '42 点', reason: '身体原因',
            status: '资料待补', actionLabel: '查看',
            evidenceCompleteness: EVIDENCE_DEFAULT_PARTIAL, completenessScore: countCompleteEvidence(EVIDENCE_DEFAULT_PARTIAL),
          },
        ],
      },
      {
        id: 'ac-transfer',
        type: 'transfer',
        typeLabel: '转卡',
        summary: {
          pending: '待处理：3 笔',
          detail1: '涉及点数：96 点',
          detail2: '手续费预估：¥1,200',
          detail3: '异常：1 笔',
        },
        actionLabel: '查看转卡',
        toastMessage: '进入转卡队列（待建设）',
        requests: [
          {
            id: 'tf-1', memberName: '林悦', cardName: '小班卡', remainingPoints: '36 点', reason: '转赠家人',
            status: '待审核', actionLabel: '审核',
            evidenceCompleteness: EVIDENCE_DEFAULT_COMPLETE, completenessScore: countCompleteEvidence(EVIDENCE_DEFAULT_COMPLETE),
          },
          {
            id: 'tf-2', memberName: '陈航', cardName: '私教卡', remainingPoints: '18 点', reason: '卡项变更',
            status: '异常', actionLabel: '查看',
            evidenceCompleteness: EVIDENCE_DEFAULT_PARTIAL, completenessScore: countCompleteEvidence(EVIDENCE_DEFAULT_PARTIAL),
          },
        ],
      },
      {
        id: 'ac-freeze',
        type: 'freeze',
        typeLabel: '冻结',
        summary: {
          pending: '待审核：6 笔',
          detail1: '资料不完整：2 笔',
          detail2: '影响有效期：126 天',
          detail3: '异常：2 笔',
        },
        actionLabel: '查看冻结',
        toastMessage: '进入冻结队列（待建设）',
        requests: [
          {
            id: 'fz-1', memberName: '王芳', cardName: '年卡', remainingPoints: '58 点', reason: '孕期暂停',
            status: '资料待补', actionLabel: '审核',
            evidenceCompleteness: EVIDENCE_WANGFANG, completenessScore: countCompleteEvidence(EVIDENCE_WANGFANG),
          },
          {
            id: 'fz-2', memberName: '张磊', cardName: '次卡', remainingPoints: '12 点', reason: '出差',
            status: '资料不完整', actionLabel: '查看',
            evidenceCompleteness: EVIDENCE_DEFAULT_PARTIAL, completenessScore: countCompleteEvidence(EVIDENCE_DEFAULT_PARTIAL),
          },
        ],
      },
    ],
    paymentSettlement: {
      title: '支付与结算摘要',
      subtitle: '查看支付渠道、手续费、跨店结算和待对账事项',
      cards: [
        { id: 'ps-1', channel: '微信支付', received: '本月实收：¥248万', detail: '手续费：¥1.49万', status: '已对账', exceptionLabel: '异常：无', tone: 'healthy' },
        { id: 'ps-2', channel: '银行转账', received: '本月实收：¥28万', detail: '待确认：¥6万', status: '需核对', exceptionLabel: '异常：¥6万待确认', tone: 'warning', actionLabel: '核对', toastMessage: '进入银行转账核对（待建设）' },
        { id: 'ps-3', channel: '现金 / 其他', received: '本月实收：¥10万', detail: '异常：1 笔', status: '观察', exceptionLabel: '异常：1 笔来源待补充', tone: 'watch' },
        { id: 'ps-4', channel: '跨店结算', received: '待结算：¥18.6万', detail: '涉及课程：42 节', status: '待分摊', exceptionLabel: '异常：42 节课程待结算', tone: 'warning', actionLabel: '结算', toastMessage: '进入跨店结算（待建设）' },
      ],
      crossStoreRule: '消课店 70% / 卖卡店 30%，最低结算点单价 Pmin = 105',
      settlementAlert: '本月仍有银行转账、现金来源和跨店结算待核对，完成后才可进入最终财务归档。',
    },
    financeDetailMap,
    assetDetailMap,
  };
}

export function getStoreStatusClass(level: FinanceV2StoreStatusLevel): string {
  const map: Record<FinanceV2StoreStatusLevel, string> = {
    danger: 'is-danger',
    warning: 'is-warning',
    healthy: 'is-healthy',
    watch: 'is-watch',
  };
  return map[level];
}

export function getCoverageToneClass(tone: FinanceV2CoverageTone): string {
  const map: Record<FinanceV2CoverageTone, string> = {
    danger: 'is-danger',
    warning: 'is-warning',
    healthy: 'is-healthy',
    watch: 'is-watch',
  };
  return map[tone];
}

export function getMetricToneClass(tone: FinanceV2MetricTone): string {
  const map: Record<FinanceV2MetricTone, string> = {
    danger: 'is-danger',
    warning: 'is-warning',
    healthy: 'is-healthy',
    neutral: 'is-neutral',
    watch: 'is-watch',
  };
  return map[tone];
}

export function getPriorityClass(priority: FinanceV2Priority): string {
  const map: Record<FinanceV2Priority, string> = {
    P0: 'is-p0',
    P1: 'is-p1',
    P2: 'is-p2',
  };
  return map[priority];
}

export function getSuggestionSourceClass(source: FinanceV2SuggestionSource): string {
  return source === 'system_rule' ? 'is-rule' : 'is-pending';
}

export function getEvidenceStatusClass(status: FinanceV2EvidenceStatus): string {
  const map: Record<FinanceV2EvidenceStatus, string> = {
    complete: 'is-complete',
    missing: 'is-missing',
    pending: 'is-pending',
  };
  return map[status];
}

export function getMonthlyChangeToneClass(tone: StoreMonthlyChangeSummary['coverageTone'] | StoreMonthlyChangeSummary['keyChangeTone']): string {
  const map: Record<string, string> = {
    up: 'is-up',
    down: 'is-down',
    neutral: 'is-neutral',
    warn: 'is-warn',
  };
  return map[tone] ?? 'is-neutral';
}

export function getLiabilityBreakdownToneClass(tone: PrepaidLiabilityBreakdownItem['tone']): string {
  const map: Record<PrepaidLiabilityBreakdownItem['tone'], string> = {
    scheduled: 'is-scheduled',
    risk: 'is-risk',
    warning: 'is-warning',
    change: 'is-change',
  };
  return map[tone];
}

export function getFlowStepToneClass(tone: FinancialStructureFlowStep['tone']): string {
  const map: Record<FinancialStructureFlowStep['tone'], string> = {
    cash: 'is-cash',
    revenue: 'is-revenue',
    liability: 'is-liability',
    profit: 'is-profit',
    cost: 'is-cost',
  };
  return map[tone];
}
