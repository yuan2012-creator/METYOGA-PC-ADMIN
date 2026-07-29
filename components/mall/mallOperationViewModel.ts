/** 产品与合同模块局部类型与 demo 数据（不写入全局 types/constants） */

import {
  formatMallCny,
  formatMallLogAt,
  parseOrderNoDateTime,
} from './mallFormatters';

export type MallProductType = '卡项' | '私教' | '教培' | '体验' | '积分商品';
export type MallProductStatus = '在售' | '停售' | '草稿' | '待补规则';
export type MallContractBind = '已绑定' | '未绑定' | '模板待确认';
export type MallAssetGenStatus = '已生成' | '待生成' | '异常';
export type MallOrderRisk = '正常' | '待签' | '待退款' | '资产异常';

export interface MallMetricItem {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface MallInsightTip {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: string;
}

export interface MallProductRow {
  id: string;
  name: string;
  type: MallProductType;
  status: MallProductStatus;
  priceBenefit: string;
  contractTemplate: string;
  contractBind: MallContractBind;
  recentOrder: string;
  assetGen: MallAssetGenStatus;
  riskHint: string;
  suggestedAction: string;
  orderRisk: MallOrderRisk;
  systemSuggestion: string;
  /** 详情 */
  price: string;
  benefit: string;
  validity: string;
  stores: string;
  courses: string;
  onlineSale: string;
  contractSignStatus: string;
  clauseSummary: string;
  pendingAssetReason?: string;
  configCompleteness: string;
  contractStatusLabel: string;
  assetStatusLabel: string;
}

export interface MallOrderRow {
  id: string;
  orderNo: string;
  memberName: string;
  amount: string;
  payStatus: string;
  contractStatus: string;
  assetStatus: string;
  productId: string;
  riskNote?: string;
  orderStatus?: string;
  orderTime?: string;
  paidAmount?: string;
  payMethod?: string;
  payTime?: string;
  channel?: string;
  productName?: string;
  contractId?: string;
  assetId?: string;
  riskId?: string;
  orderRisk?: MallOrderRisk;
  riskLevel?: string;
  suggestedAction?: string;
  owner?: string;
  dueLabel?: string;
  assetGeneratedAt?: string;
}

export interface MallContractRow {
  id: string;
  templateName: string;
  productId: string;
  signStatus: string;
  clauses: string;
  contractNo: string;
  contractStatus: string;
  memberName?: string;
  productName?: string;
  signedAt?: string;
  orderId?: string;
  freezeRule?: string;
  transferRule?: string;
  refundRule?: string;
  stores?: string;
  courses?: string;
  disputeSummary?: string;
  riskHints?: string[];
}

export interface MallUsageRecord {
  date: string;
  course: string;
  deduct: string;
  status: string;
}

export interface MallAssetRow {
  id: string;
  productId: string;
  assetName: string;
  remaining: string;
  validUntil: string;
  status: string;
  generated: boolean;
  pendingReason?: string;
  sourceOrderNo?: string;
  assetCode?: string;
  memberName?: string;
  productName?: string;
  totalBenefit?: string;
  contractId?: string;
  orderId?: string;
  generatedAt?: string;
  stores?: string;
  courses?: string;
  deductRules?: string;
  bookingRules?: string;
  cancelRules?: string;
  freezeRule?: string;
  transferRule?: string;
  refundRule?: string;
  usageRecords?: MallUsageRecord[];
  isFrozen?: boolean;
  isRefunding?: boolean;
  isTransferring?: boolean;
  isExpiringSoon?: boolean;
  isLowUsage?: boolean;
}

export interface MallRiskHandleLog {
  at: string;
  operator: string;
  content: string;
  result: string;
}

export interface MallRiskRow {
  id: string;
  productId: string;
  kind: '退款' | '转卡' | '冻结';
  summary: string;
  memberName: string;
  refundStatus: string;
  transferStatus: string;
  freezeStatus: string;
  assetImpact: string;
  riskNote: string;
  riskLevel?: string;
  orderId?: string;
  contractId?: string;
  assetId?: string;
  relatedOrderNo?: string;
  relatedContractNo?: string;
  relatedAssetName?: string;
  productName?: string;
  owner?: string;
  dueLabel?: string;
  status?: string;
  triggerReason?: string;
  impactScope?: string;
  checkData?: string;
  steps?: string[];
  handleLogs?: MallRiskHandleLog[];
}

export interface MallLogRow {
  id: string;
  productId: string;
  at: string;
  operator: string;
  action: string;
  linkType?: 'order' | 'contract' | 'asset' | 'risk';
  linkId?: string;
}

export type MallWorkbenchSegment = 'products' | 'orders' | 'contracts' | 'assets' | 'sensitive';

export const MALL_WORKBENCH_SEGMENTS: { id: MallWorkbenchSegment; label: string }[] = [
  { id: 'products', label: '产品库' },
  { id: 'orders', label: '销售订单' },
  { id: 'contracts', label: '合同待签' },
  { id: 'assets', label: '资产生成' },
  { id: 'sensitive', label: '退款/转卡/冻结' },
];

export interface MallActionItem {
  id: string;
  memberName: string;
  productName: string;
  category: string;
  reason: string;
  group: 'contract' | 'asset' | 'risk';
  subgroup?: string;
  evidenceChain?: string[];
  riskLine?: string;
  productId?: string;
  orderNo?: string;
  relatedOrderId?: string;
  relatedContractId?: string;
  relatedAssetId?: string;
  relatedRiskId?: string;
}

export interface MallContractPendingRow {
  id: string;
  contractId: string;
  contractNo: string;
  memberName: string;
  productName: string;
  productId: string;
  orderNo: string;
  orderId: string;
  signStatus: string;
  templateName: string;
  pendingReason: string;
}

export interface MallAssetPendingRow {
  id: string;
  assetId?: string;
  assetStatus: string;
  memberName: string;
  productName: string;
  productId: string;
  orderNo: string;
  orderId?: string;
  contractStatus: string;
  remaining: string;
  pendingReason: string;
  contractId?: string;
}

export interface MallSensitiveOpRow {
  id: string;
  riskId: string;
  kind: MallRiskRow['kind'];
  memberName: string;
  productName: string;
  productId: string;
  orderNo: string;
  orderId?: string;
  assetName: string;
  assetId?: string;
  status: string;
  riskReason: string;
  owner: string;
}

export type MallEvidenceChainStep = {
  key: string;
  value: string;
  tone?: 'ok' | 'pending' | 'risk' | 'muted';
};

export interface MallListFilters {
  query: string;
  type: string;
  status: string;
  contract: string;
  asset: string;
  risk: string;
}

export const DEFAULT_MALL_LIST_FILTERS: MallListFilters = {
  query: '',
  type: 'all',
  status: 'all',
  contract: 'all',
  asset: 'all',
  risk: 'all',
};

export interface MallOperationSnapshot {
  metrics: MallMetricItem[];
  insights: MallInsightTip[];
  products: MallProductRow[];
  orders: MallOrderRow[];
  contracts: MallContractRow[];
  assets: MallAssetRow[];
  risks: MallRiskRow[];
  logs: MallLogRow[];
  actionQueue: MallActionItem[];
}

const PRODUCTS: Omit<MallProductRow, 'id'>[] = [
  {
    name: '初遇卡 Spark',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥4,990 / 40 点 / 12 个月',
    contractTemplate: 'MET 通用会员卡协议 v3',
    contractBind: '已绑定',
    recentOrder: '05-14 · 林晓 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '维持在售',
    orderRisk: '正常',
    systemSuggestion: '近期成交稳定，可配合 S2 体验转化',
    price: '¥4,990',
    benefit: '40 点 · 团课/小班通用',
    validity: '12 个月',
    stores: '全馆通用',
    courses: '团课、小班',
    onlineSale: '是',
    contractSignStatus: '模板已绑定',
    clauseSummary: '有效期 12 个月；可冻结 1 次/年；转卡需审批；退款按未使用点数比例',
  },
  {
    name: '锦鲤卡 Flow',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥8,800 / 80 点 / 18 个月',
    contractTemplate: 'MET 点数卡协议 v2',
    contractBind: '已绑定',
    recentOrder: '05-13 · 周然 · 待签合同',
    assetGen: '待生成',
    riskHint: '待签 1 笔',
    suggestedAction: '查看待签合同',
    orderRisk: '待签',
    systemSuggestion: '订单已支付但合同未签，建议先完成补签。',
    price: '¥8,800',
    benefit: '80 点',
    validity: '18 个月',
    stores: '万象馆、城西馆',
    courses: '团课、小班、部分私教',
    onlineSale: '是',
    contractSignStatus: '1 笔待签',
    clauseSummary: '点数不过期结转；冻结最长 30 天；转卡手续费 5%',
    pendingAssetReason: '合同未签',
  },
  {
    name: '天选卡 Prime',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥15,800 / 150 点 / 24 个月',
    contractTemplate: 'MET 高额度点数卡 v1',
    contractBind: '已绑定',
    recentOrder: '05-12 · 陈悦 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '高额度卡建议管家月度回访',
    price: '¥15,800',
    benefit: '150 点',
    validity: '24 个月',
    stores: '全馆',
    courses: '全品类',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '高额度专属条款；转卡需店长审批',
  },
  {
    name: '硬核卡 Core',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥6,600 / 55 点 / 12 个月',
    contractTemplate: 'MET 进阶练习协议',
    contractBind: '已绑定',
    recentOrder: '05-11 · 王浩 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '适合进阶会员，可搭配小班课包',
    price: '¥6,600',
    benefit: '55 点',
    validity: '12 个月',
    stores: '城西馆、滨江馆',
    courses: '小班、进阶团课',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '进阶课种限制；爽约扣点加倍',
  },
  {
    name: '自由卡 Flex',
    type: '卡项',
    status: '待补规则',
    priceBenefit: '¥3,980 / 30 点 / 9 个月',
    contractTemplate: '—',
    contractBind: '未绑定',
    recentOrder: '—',
    assetGen: '待生成',
    riskHint: '缺冻结/转卡规则',
    suggestedAction: '检查冻结规则',
    orderRisk: '资产异常',
    systemSuggestion: '产品规则缺少冻结/转卡配置，建议补齐后再继续销售。',
    price: '¥3,980',
    benefit: '30 点',
    validity: '9 个月',
    stores: '全馆',
    courses: '团课',
    onlineSale: '否',
    contractSignStatus: '未绑定合同',
    clauseSummary: '待补充合同模板与关键条款',
    pendingAssetReason: '规则缺失',
  },
  {
    name: '瑜伽月卡',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥1,280 / 月限次 12 次',
    contractTemplate: 'MET 期限卡协议',
    contractBind: '已绑定',
    recentOrder: '05-10 · 赵敏 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '期限卡注意到期续费提醒',
    price: '¥1,280',
    benefit: '每月 12 次',
    validity: '1 个月',
    stores: '全馆',
    courses: '团课',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '按月续费；不可转卡',
  },
  {
    name: '瑜伽季卡',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥3,280 / 季限次 36 次',
    contractTemplate: 'MET 期限卡协议',
    contractBind: '已绑定',
    recentOrder: '05-09 · 孙莉 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '—',
    price: '¥3,280',
    benefit: '季度 36 次',
    validity: '3 个月',
    stores: '全馆',
    courses: '团课',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '季卡不可退款；可请假 1 次',
  },
  {
    name: '瑜伽年卡',
    type: '卡项',
    status: '停售',
    priceBenefit: '¥9,800 / 年限次 120 次',
    contractTemplate: 'MET 期限卡协议',
    contractBind: '已绑定',
    recentOrder: '04-28 · 历史订单',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '已停售维护',
    orderRisk: '正常',
    systemSuggestion: '停售产品仅维护存量资产',
    price: '¥9,800',
    benefit: '年度 120 次',
    validity: '12 个月',
    stores: '全馆',
    courses: '团课',
    onlineSale: '否',
    contractSignStatus: '已绑定',
    clauseSummary: '年卡条款 v2',
  },
  {
    name: '普拉提月卡',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥1,680 / 8 次小班',
    contractTemplate: 'MET 普拉提小班协议',
    contractBind: '模板待确认',
    recentOrder: '05-08 · 吴婷 · 待签',
    assetGen: '待生成',
    riskHint: '模板待确认',
    suggestedAction: '补齐合同模板',
    orderRisk: '待签',
    systemSuggestion: '合同模板待法务确认后再售卖',
    price: '¥1,680',
    benefit: '8 次核心床小班',
    validity: '1 个月',
    stores: '万象馆',
    courses: '普拉提小班',
    onlineSale: '是',
    contractSignStatus: '模板待确认',
    clauseSummary: '小班专用；不可转团课点数',
    pendingAssetReason: '合同未签',
  },
  {
    name: '核心床小班卡',
    type: '卡项',
    status: '在售',
    priceBenefit: '¥2,980 / 10 次',
    contractTemplate: 'MET 小班专项协议',
    contractBind: '已绑定',
    recentOrder: '05-07 · 郑凯 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '—',
    price: '¥2,980',
    benefit: '10 次小班',
    validity: '6 个月',
    stores: '万象馆、滨江馆',
    courses: '核心床小班',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '小班专用扣次',
  },
  {
    name: '私教体验包',
    type: '私教',
    status: '在售',
    priceBenefit: '¥399 / 1 节体验',
    contractTemplate: 'MET 私教体验协议',
    contractBind: '已绑定',
    recentOrder: '05-14 · 新客李 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '跟进转化',
    orderRisk: '正常',
    systemSuggestion: '体验课后 48h 内建议管家回访',
    price: '¥399',
    benefit: '1 节私教体验',
    validity: '30 天',
    stores: '全馆',
    courses: '私教',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '仅限首次；不可退款',
  },
  {
    name: '私教正式课包',
    type: '私教',
    status: '在售',
    priceBenefit: '¥12,800 / 24 节',
    contractTemplate: 'MET 私教课包协议 v2',
    contractBind: '已绑定',
    recentOrder: '05-13 · 钱芳 · 部分退款中',
    assetGen: '异常',
    riskHint: '退款核对',
    suggestedAction: '复核退款影响',
    orderRisk: '待退款',
    systemSuggestion: '部分退款已存在，建议核对资产余量与退款金额。',
    price: '¥12,800',
    benefit: '24 节私教',
    validity: '12 个月',
    stores: '全馆',
    courses: '私教',
    onlineSale: '是',
    contractSignStatus: '已签署',
    clauseSummary: '课包不可转卡；退款按未上课节数',
    pendingAssetReason: '退款流程中',
  },
  {
    name: '普拉提教培早鸟名额',
    type: '教培',
    status: '在售',
    priceBenefit: '¥16,800 / 名额 1',
    contractTemplate: 'MET 教培培训协议',
    contractBind: '已绑定',
    recentOrder: '05-12 · 学员张 · 已支付',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '教培名额与学籍分开管理',
    price: '¥16,800',
    benefit: '教培学籍 + 教材',
    validity: '按班期',
    stores: '教培中心',
    courses: '教培',
    onlineSale: '否',
    contractSignStatus: '已绑定',
    clauseSummary: '不退款；可延期 1 期',
  },
  {
    name: '积分兑换 · 瑜伽辅具套装',
    type: '积分商品',
    status: '在售',
    priceBenefit: '680 积分',
    contractTemplate: '—',
    contractBind: '未绑定',
    recentOrder: '05-11 · 会员兑换',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '继续在售',
    orderRisk: '正常',
    systemSuggestion: '积分商品不生成练习资产，仅扣积分',
    price: '680 积分',
    benefit: '辅具套装 1 份',
    validity: '兑换后 7 天领取',
    stores: '前台领取',
    courses: '—',
    onlineSale: '是',
    contractSignStatus: '无需合同',
    clauseSummary: '积分兑换不退还',
  },
  {
    name: '积分兑换 · 单次小班券',
    type: '积分商品',
    status: '草稿',
    priceBenefit: '320 积分',
    contractTemplate: '—',
    contractBind: '未绑定',
    recentOrder: '—',
    assetGen: '待生成',
    riskHint: '—',
    suggestedAction: '补齐合同模板',
    orderRisk: '正常',
    systemSuggestion: '草稿状态，未对外售卖',
    price: '320 积分',
    benefit: '小班 1 次',
    validity: '30 天',
    stores: '全馆',
    courses: '小班',
    onlineSale: '否',
    contractSignStatus: '无需合同',
    clauseSummary: '—',
  },
  {
    name: '新客体验课',
    type: '体验',
    status: '在售',
    priceBenefit: '¥99 / 1 次团课',
    contractTemplate: 'MET 体验课告知书',
    contractBind: '已绑定',
    recentOrder: '05-14 · 多位新客',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '转化跟进',
    orderRisk: '正常',
    systemSuggestion: '体验课成交后引导办卡',
    price: '¥99',
    benefit: '1 次团课体验',
    validity: '14 天',
    stores: '全馆',
    courses: '入门团课',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '仅限新客；不可退款',
  },
  {
    name: '双人体验课',
    type: '体验',
    status: '在售',
    priceBenefit: '¥168 / 2 人 1 次',
    contractTemplate: 'MET 体验课告知书',
    contractBind: '已绑定',
    recentOrder: '05-10 · 团购券',
    assetGen: '已生成',
    riskHint: '—',
    suggestedAction: '—',
    orderRisk: '正常',
    systemSuggestion: '—',
    price: '¥168',
    benefit: '双人各 1 次',
    validity: '14 天',
    stores: '城西馆',
    courses: '入门团课',
    onlineSale: '是',
    contractSignStatus: '已绑定',
    clauseSummary: '双人同行体验条款',
  },
];

const withIds = <T extends { productId?: string }>(
  rows: T[],
  prefix: string,
  productIds: string[],
): (T & { id: string })[] =>
  rows.map((r, i) => ({
    ...r,
    id: `${prefix}-${i + 1}`,
    productId: r.productId ?? productIds[i % productIds.length],
  }));

const parseCnyAmount = (label: string): number => {
  const n = label.replace(/[^0-9]/g, '');
  return n ? Number(n) : 0;
};

const enrichProduct = (p: MallProductRow): MallProductRow => {
  let configCompleteness = '配置完整';
  if (p.status === '待补规则') configCompleteness = '缺冻结/转卡规则';
  else if (p.contractBind === '未绑定') configCompleteness = '缺合同模板';
  else if (p.contractBind === '模板待确认') configCompleteness = '合同模板待确认';

  const contractStatusLabel =
    p.contractBind === '未绑定' ? '未绑定' : p.contractSignStatus.includes('待') ? '待签署' : '已绑定';
  const assetStatusLabel = p.assetGen;

  const riskHint =
    !p.riskHint || p.riskHint === '—' || p.orderRisk === '正常' ? '—' : p.riskHint;

  let suggestedAction = p.suggestedAction;
  if (suggestedAction === '—' || suggestedAction === '维持在售') suggestedAction = '继续在售';

  return {
    ...p,
    configCompleteness,
    contractStatusLabel,
    assetStatusLabel,
    riskHint,
    suggestedAction,
  };
};

export const filterMallProducts = (
  products: MallProductRow[],
  orders: MallOrderRow[],
  contracts: MallContractRow[],
  filters: MallListFilters,
): MallProductRow[] => {
  const q = filters.query.trim().toLowerCase();
  return products.filter(p => {
    if (filters.type !== 'all' && p.type !== filters.type) return false;
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.contract !== 'all' && p.contractBind !== filters.contract) return false;
    if (filters.asset !== 'all' && p.assetGen !== filters.asset) return false;
    if (filters.risk !== 'all' && p.orderRisk !== filters.risk) return false;
    if (q) {
      const relatedOrders = orders.filter(o => o.productId === p.id);
      const relatedContracts = contracts.filter(c => c.productId === p.id);
      const hay = [
        p.name,
        p.contractTemplate,
        ...relatedOrders.map(o => `${o.orderNo}${o.memberName}`),
        ...relatedContracts.map(c => `${c.contractNo}${c.templateName}`),
      ]
        .join('')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
};

type MallCoreData = Pick<
  MallOperationSnapshot,
  'products' | 'orders' | 'contracts' | 'assets' | 'risks' | 'logs' | 'actionQueue'
>;

export const deriveMallMetrics = (data: MallCoreData): MallMetricItem[] => {
  const { products, orders } = data;
  const onSale = products.filter(p => p.status === '在售').length;
  const pendingContractOrders = orders.filter(o => o.contractStatus.includes('待签')).length;
  const pendingProducts = products.filter(
    p => p.orderRisk === '待签' || p.contractBind !== '已绑定',
  ).length;
  const pendingContract = Math.max(pendingContractOrders, pendingProducts);
  const todayOrders = orders.length;
  const todayRevenue = orders
    .filter(o => o.payStatus === '已支付' || o.payStatus.includes('已支付'))
    .reduce((sum, o) => sum + parseCnyAmount(o.amount), 0);
  const assetPending = products.filter(p => p.assetGen === '待生成').length;
  const refundPending = orders.filter(o => o.payStatus.includes('退款')).length;
  const riskOrders = products.filter(p => p.orderRisk !== '正常').length;

  const typeHint = ['卡项', '私教', '教培']
    .map(t => {
      const n = products.filter(p => p.type === t && p.status === '在售').length;
      return n > 0 ? t : null;
    })
    .filter(Boolean)
    .join(' / ');

  return [
    { id: 'm1', label: '在售产品', value: String(onSale), hint: typeHint || '卡项 / 私教 / 教培', tone: 'default' },
    {
      id: 'm2',
      label: '待签合同',
      value: String(pendingContract),
      hint: '已支付未签 / 待补签',
      tone: 'amber',
    },
    {
      id: 'm3',
      label: '今日订单',
      value: String(todayOrders),
      hint: `实收 ¥${todayRevenue.toLocaleString('en-US')}`,
      tone: 'default',
    },
    {
      id: 'm4',
      label: '资产待生成',
      value: String(assetPending),
      hint: '需核对订单与合同',
      tone: 'amber',
    },
    {
      id: 'm5',
      label: '退款待处理',
      value: String(refundPending),
      hint: '含部分退款',
      tone: 'rose',
    },
    {
      id: 'm6',
      label: '风险订单',
      value: String(riskOrders),
      hint: '合同 / 支付 / 资产异常',
      tone: 'rose',
    },
  ];
};

export const deriveMallInsights = (data: MallCoreData): MallInsightTip[] => {
  const { products, orders } = data;
  const contractPending = orders.filter(o => o.contractStatus.includes('待签')).length;
  const assetPending = orders.filter(o => o.assetStatus.includes('待生成')).length;
  const refundRisk = orders.filter(o => o.payStatus.includes('退款')).length;
  const rulesMissing = products.filter(p => p.status === '待补规则').length;

  return [
    {
      id: 'i1',
      tag: '合同待签',
      line: `${contractPending} 笔订单已支付但合同未签`,
      actionLabel: '查看',
      actionKey: 'contract',
    },
    {
      id: 'i2',
      tag: '资产未生成',
      line: `${assetPending} 笔订单未生成会员资产`,
      actionLabel: '查看',
      actionKey: 'asset',
    },
    {
      id: 'i3',
      tag: '退款风险',
      line: `${refundRisk} 笔部分退款需核对资产余量`,
      actionLabel: '查看',
      actionKey: 'refund',
    },
    {
      id: 'i4',
      tag: '卡项配置缺失',
      line: `${rulesMissing} 个产品缺少冻结/转卡规则`,
      actionLabel: '补齐',
      actionKey: 'rules',
    },
  ];
};

export const buildMallOperationSnapshot = (): MallOperationSnapshot => {
  const products: MallProductRow[] = PRODUCTS.map((p, i) =>
    enrichProduct({ ...p, id: `mp-${i + 1}` } as MallProductRow),
  );
  const productIds = products.map(p => p.id);

  const orders: MallOrderRow[] = [
    { orderNo: 'SO-20260514-001', memberName: '林晓', amount: '¥4,990', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-1', riskNote: '—' },
    { orderNo: 'SO-20260513-018', memberName: '周然', amount: '¥8,800', payStatus: '已支付', contractStatus: '待签署', assetStatus: '待生成', productId: 'mp-2', riskNote: '合同未签，资产待生成' },
    { orderNo: 'SO-20260513-022', memberName: '钱芳', amount: '¥12,800', payStatus: '部分退款', contractStatus: '已签署', assetStatus: '异常', productId: 'mp-12', riskNote: '部分退款需核对节数' },
    { orderNo: 'SO-20260512-009', memberName: '陈悦', amount: '¥15,800', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-3', riskNote: '—' },
    { orderNo: 'SO-20260512-031', memberName: '学员张', amount: '¥16,800', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-13', riskNote: '—' },
    { orderNo: 'SO-20260511-007', memberName: '王浩', amount: '¥6,600', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-4', riskNote: '—' },
    { orderNo: 'SO-20260510-015', memberName: '赵敏', amount: '¥1,280', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-6', riskNote: '—' },
    { orderNo: 'SO-20260509-003', memberName: '吴婷', amount: '¥1,680', payStatus: '已支付', contractStatus: '待签署', assetStatus: '待生成', productId: 'mp-9', riskNote: '合同未签' },
    { orderNo: 'SO-20260508-021', memberName: '郑凯', amount: '¥2,980', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-10', riskNote: '—' },
    { orderNo: 'SO-20260507-012', memberName: '新客李', amount: '¥399', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-11', riskNote: '—' },
    { orderNo: 'SO-20260506-008', memberName: '孙莉', amount: '¥3,280', payStatus: '已支付', contractStatus: '已签署', assetStatus: '已生成', productId: 'mp-7', riskNote: '—' },
    { orderNo: 'SO-20260505-019', memberName: '会员A', amount: '680 积分', payStatus: '已兑换', contractStatus: '—', assetStatus: '已出库', productId: 'mp-14', riskNote: '—' },
  ].map((o, i) => ({ ...o, id: `mo-${i + 1}` }));

  const contracts: MallContractRow[] = withIds(
    [
      { templateName: 'MET 通用会员卡协议 v3', signStatus: '已签署', clauses: '有效期、冻结、转卡、退款', contractNo: 'CT-2026-001', contractStatus: '已绑定' },
      { templateName: 'MET 点数卡协议 v2', signStatus: '待签署', clauses: '点数规则、冻结 30 天', contractNo: 'CT-2026-018', contractStatus: '待签署' },
      { templateName: 'MET 私教课包协议 v2', signStatus: '已签署', clauses: '课包退款按未上课节数', contractNo: 'CT-2026-022', contractStatus: '已绑定' },
      { templateName: 'MET 教培培训协议', signStatus: '已签署', clauses: '学籍、延期、不退款', contractNo: 'CT-2026-031', contractStatus: '已绑定' },
      { templateName: 'MET 普拉提小班协议', signStatus: '模板待确认', clauses: '小班专用条款', contractNo: 'CT-2026-009', contractStatus: '模板待确认' },
      { templateName: 'MET 体验课告知书', signStatus: '已签署', clauses: '新客限定', contractNo: 'CT-2026-011', contractStatus: '已绑定' },
      { templateName: 'MET 期限卡协议', signStatus: '已签署', clauses: '按月/季/年限制次数', contractNo: 'CT-2026-006', contractStatus: '已绑定' },
      { templateName: 'MET 进阶练习协议', signStatus: '已签署', clauses: '进阶课种限制', contractNo: 'CT-2026-004', contractStatus: '已绑定' },
    ],
    'mc',
    productIds,
  );

  const assets: MallAssetRow[] = withIds(
    [
      { assetName: '初遇卡 Spark', remaining: '28 点', validUntil: '2027-05-14', status: '正常', generated: true, sourceOrderNo: 'SO-20260514-001' },
      { assetName: '锦鲤卡 Flow', remaining: '—', validUntil: '—', status: '待生成', generated: false, pendingReason: '合同未签', sourceOrderNo: 'SO-20260513-018' },
      { assetName: '私教正式课包', remaining: '18 节', validUntil: '2027-03-01', status: '退款核对中', generated: true, pendingReason: '人工复核中', sourceOrderNo: 'SO-20260513-022' },
      { assetName: '天选卡 Prime', remaining: '120 点', validUntil: '2028-01-12', status: '正常', generated: true, sourceOrderNo: 'SO-20260512-009' },
      { assetName: '教培学籍', remaining: '在训', validUntil: '2026-12', status: '正常', generated: true, sourceOrderNo: 'SO-20260512-031' },
      { assetName: '瑜伽月卡', remaining: '6 次', validUntil: '2026-06-10', status: '正常', generated: true, sourceOrderNo: 'SO-20260510-015' },
      { assetName: '自由卡 Flex', remaining: '—', validUntil: '—', status: '待生成', generated: false, pendingReason: '产品规则缺失', sourceOrderNo: '—' },
      { assetName: '普拉提月卡', remaining: '—', validUntil: '—', status: '待生成', generated: false, pendingReason: '合同未签', sourceOrderNo: 'SO-20260509-003' },
    ],
    'ma',
    productIds,
  );

  const risks: MallRiskRow[] = withIds(
    [
      {
        kind: '退款',
        summary: '部分退款 ¥2,000，需核对剩余节数',
        memberName: '钱芳',
        refundStatus: '部分退款待核对',
        transferStatus: '无',
        freezeStatus: '无',
        assetImpact: '剩余 18 节待确认是否扣减',
        riskNote: '需人工复核退款金额与资产余量',
      },
      {
        kind: '转卡',
        summary: '锦鲤卡转赠申请待审批',
        memberName: '周然',
        refundStatus: '无',
        transferStatus: '待审批',
        freezeStatus: '无',
        assetImpact: '转卡完成前资产不可变更持有人',
        riskNote: '待店长审批',
      },
      {
        kind: '冻结',
        summary: '天选卡申请冻结 15 天',
        memberName: '陈悦',
        refundStatus: '无',
        transferStatus: '无',
        freezeStatus: '申请中',
        assetImpact: '冻结期间不可扣点',
        riskNote: '待审批',
      },
      {
        kind: '退款',
        summary: '体验课误购退款申请',
        memberName: '新客李',
        refundStatus: '申请待审',
        transferStatus: '无',
        freezeStatus: '无',
        assetImpact: '体验资产可撤销',
        riskNote: '待接入审批流程',
      },
    ],
    'mr',
    productIds,
  );

  const logs: MallLogRow[] = withIds(
    [
      { at: '05-14 10:20', operator: '管家A', action: '订单支付确认 · SO-20260514-001' },
      { at: '05-14 09:05', operator: '系统', action: '资产生成 · 初遇卡 Spark' },
      { at: '05-13 16:40', operator: '管家B', action: '绑定合同模板 · 锦鲤卡 Flow' },
      { at: '05-13 11:00', operator: '店长', action: '创建产品 · 自由卡 Flex' },
      { at: '05-12 14:22', operator: '系统', action: '订单创建 · SO-20260512-009' },
      { at: '05-12 14:25', operator: '财务', action: '支付到账核对' },
      { at: '05-11 09:30', operator: '管家A', action: '修改冻结规则 · 硬核卡 Core' },
      { at: '05-10 18:00', operator: '系统', action: '教培名额资产登记' },
    ],
    'ml',
    productIds,
  );

  const actionQueue: MallActionItem[] = [
    {
      id: 'aq-1',
      memberName: '周然',
      productName: '锦鲤卡 Flow',
      category: '合同待签',
      subgroup: '已支付但合同未签',
      evidenceChain: ['已下单', '已支付', '待签约', '资产未生成'],
      riskLine: '已支付但合同未签，需人工复核补签流程',
      reason: '锦鲤卡 Flow 已支付，合同待会员签署',
      group: 'contract',
      productId: 'mp-2',
      orderNo: 'SO-20260513-018',
      relatedOrderId: 'mo-2',
      relatedContractId: 'mc-2',
      relatedAssetId: 'ma-2',
    },
    {
      id: 'aq-2',
      memberName: '吴婷',
      productName: '普拉提月卡',
      category: '合同待签',
      subgroup: '合同模板缺失',
      evidenceChain: ['已下单', '已支付', '模板待确认', '资产未生成'],
      riskLine: '合同模板待法务确认，签署状态异常',
      reason: '普拉提月卡已支付，合同模板待确认后补签',
      group: 'contract',
      productId: 'mp-9',
      relatedOrderId: 'mo-8',
      relatedContractId: 'mc-5',
      relatedAssetId: 'ma-8',
    },
    {
      id: 'aq-3',
      memberName: '林晓',
      productName: '初遇卡 Spark',
      category: '合同待签',
      subgroup: '合同签署状态异常',
      evidenceChain: ['已下单', '已支付', '条款待确认', '资产已生成'],
      riskLine: '条款更新待会员确认，仅展示预览',
      reason: '初遇卡补签条款更新，需会员确认',
      group: 'contract',
      productId: 'mp-1',
      relatedOrderId: 'mo-1',
      relatedContractId: 'mc-1',
      relatedAssetId: 'ma-1',
    },
    {
      id: 'aq-4',
      memberName: '周然',
      productName: '锦鲤卡 Flow',
      category: '资产待生成',
      subgroup: '已支付 + 已签约，资产未生成',
      evidenceChain: ['已支付', '待签约', '资产未生成'],
      riskLine: '需先完成合同签署，再接入统一资产服务',
      reason: '订单已支付，合同未签，暂不可生成练习资产记录',
      group: 'asset',
      productId: 'mp-2',
      relatedOrderId: 'mo-2',
      relatedContractId: 'mc-2',
      relatedAssetId: 'ma-2',
    },
    {
      id: 'aq-5',
      memberName: '吴婷',
      productName: '普拉提月卡',
      category: '资产待生成',
      subgroup: '资产生成失败',
      evidenceChain: ['已支付', '待签约', '生成失败'],
      riskLine: '合同未签导致资产生成阻塞',
      reason: '合同未签，资产待生成记录',
      group: 'asset',
      productId: 'mp-9',
      relatedOrderId: 'mo-8',
      relatedContractId: 'mc-5',
      relatedAssetId: 'ma-8',
    },
    {
      id: 'aq-6',
      memberName: '—',
      productName: '自由卡 Flex',
      category: '资产待生成',
      subgroup: '资产与订单权益不一致',
      evidenceChain: ['规则缺失', '资产未生成'],
      riskLine: '产品冻结/转卡规则缺失，需补齐配置',
      reason: '自由卡 Flex 规则缺失，需补齐后生成',
      group: 'asset',
      productId: 'mp-5',
      relatedContractId: 'mc-7',
      relatedAssetId: 'ma-7',
    },
    {
      id: 'aq-7',
      memberName: '钱芳',
      productName: '私教正式课包',
      category: '敏感操作',
      subgroup: '退款申请待核对',
      evidenceChain: ['已支付', '已签约', '退款待审'],
      riskLine: '部分退款需核对剩余节数与资产余量',
      reason: '私教课包部分退款，需核对剩余节数与资产',
      group: 'risk',
      productId: 'mp-12',
      relatedOrderId: 'mo-3',
      relatedContractId: 'mc-3',
      relatedAssetId: 'ma-3',
      relatedRiskId: 'mr-1',
    },
    {
      id: 'aq-8',
      memberName: '周然',
      productName: '锦鲤卡 Flow',
      category: '敏感操作',
      subgroup: '转卡申请待审批',
      evidenceChain: ['已支付', '转卡待审', '资产锁定'],
      riskLine: '转卡完成前资产不可变更持有人',
      reason: '锦鲤卡转赠申请待店长审批',
      group: 'risk',
      productId: 'mp-2',
      relatedOrderId: 'mo-2',
      relatedContractId: 'mc-2',
      relatedAssetId: 'ma-2',
      relatedRiskId: 'mr-2',
    },
    {
      id: 'aq-9',
      memberName: '陈悦',
      productName: '天选卡 Prime',
      category: '敏感操作',
      subgroup: '冻结申请待审批',
      evidenceChain: ['已支付', '已签约', '冻结待审'],
      riskLine: '冻结期间不可扣点，需店长审批',
      reason: '天选卡申请冻结 15 天',
      group: 'risk',
      productId: 'mp-3',
      relatedOrderId: 'mo-4',
      relatedContractId: 'mc-4',
      relatedAssetId: 'ma-4',
      relatedRiskId: 'mr-3',
    },
  ];

  const core: MallCoreData = {
    products,
    orders,
    contracts,
    assets,
    risks,
    logs,
    actionQueue,
  };

  const enriched = enrichMallRelations(core);

  return {
    metrics: deriveMallMetrics(enriched),
    insights: deriveMallInsights(enriched),
    ...enriched,
  };
};

export const productTypeBadgeClass = (type: MallProductType): string => {
  const map: Record<MallProductType, string> = {
    卡项: 'met-mall-badge--card',
    私教: 'met-mall-badge--pt',
    教培: 'met-mall-badge--ttc',
    体验: 'met-mall-badge--trial',
    积分商品: 'met-mall-badge--point',
  };
  return map[type];
};

export const riskBadgeClass = (risk: MallOrderRisk): string => {
  if (risk === '正常') return 'met-mall-badge--ok';
  if (risk === '待签') return 'met-mall-badge--warn';
  if (risk === '待退款') return 'met-mall-badge--rose';
  return 'met-mall-badge--danger';
};

const DEMO_USAGE: MallUsageRecord[] = [
  { date: '05-12', course: '流瑜伽 · 晚间', deduct: '扣 1 点', status: '已完成' },
  { date: '05-10', course: '阴瑜伽', deduct: '扣 1 点', status: '已完成' },
  { date: '05-08', course: '核心床小班', deduct: '扣 2 点', status: '已完成' },
  { date: '05-05', course: '普拉提入门', deduct: '扣 1 点', status: '已取消' },
  { date: '05-02', course: '晨间流瑜伽', deduct: '扣 1 点', status: '已完成' },
];

const buildContractRiskHints = (
  contract: MallContractRow,
  order?: MallOrderRow,
  asset?: MallAssetRow,
): string[] => {
  const hints: string[] = [];
  if (contract.signStatus.includes('待') || contract.contractStatus.includes('待')) {
    hints.push('合同未签');
  }
  if (contract.templateName === '—' || contract.contractStatus === '未绑定') {
    hints.push('合同模板缺失');
  }
  if (!contract.freezeRule || contract.clauses.length < 4) {
    hints.push('条款未配置完整');
  }
  if (order && order.payStatus.includes('已支付') && order.contractStatus.includes('待签')) {
    hints.push('订单已支付但合同未签');
  }
  if (contract.signStatus.includes('已') && asset && !asset.generated) {
    hints.push('合同已签但资产未生成');
  }
  return hints.length ? hints : ['当前无额外合同风险提示'];
};

const enrichMallRelations = (core: MallCoreData): MallCoreData => {
  const productMap = new Map(core.products.map(p => [p.id, p]));

  const orders: MallOrderRow[] = core.orders.map(o => {
    const product = productMap.get(o.productId);
    const contract = core.contracts.find(c => c.productId === o.productId);
    const asset =
      core.assets.find(a => a.sourceOrderNo === o.orderNo) ??
      core.assets.find(a => a.productId === o.productId);
    const risk = core.risks.find(r => r.productId === o.productId);
    const payOk = o.payStatus.includes('已支付') || o.payStatus.includes('已兑换');
    const orderDt = parseOrderNoDateTime(o.orderNo, '10:20');
    const payDt = parseOrderNoDateTime(o.orderNo, '10:18');
    const assetDt = parseOrderNoDateTime(o.orderNo, '10:25');
    const amountLabel = formatMallCny(o.amount);
    return {
      ...o,
      amount: amountLabel,
      productName: product?.name ?? '—',
      orderStatus: o.payStatus.includes('退款') ? '退款处理中' : payOk ? '已完成' : '待支付',
      orderTime: orderDt.dateTime,
      paidAmount: payOk ? amountLabel : '¥0',
      payMethod: o.amount.includes('积分') ? '积分兑换' : '微信支付',
      payTime: payOk ? payDt.dateTime : '—',
      channel: o.amount.includes('积分') ? '积分商城' : '小程序',
      contractId: contract?.id,
      assetId: asset?.id,
      riskId: risk?.id,
      orderRisk: product?.orderRisk ?? '正常',
      riskLevel: risk ? '中' : o.riskNote && o.riskNote !== '—' ? '中' : '低',
      suggestedAction:
        risk?.riskNote ?? (o.riskNote && o.riskNote !== '—' ? '需人工复核订单与合同' : '—'),
      owner: '管家A',
      dueLabel: risk || (o.riskNote && o.riskNote !== '—') ? '今日 18:00' : '—',
      assetGeneratedAt: asset?.generated ? assetDt.dateTime : '—',
    };
  });

  const contracts: MallContractRow[] = core.contracts.map(c => {
    const product = productMap.get(c.productId);
    const order = orders.find(o => o.productId === c.productId);
    const asset = core.assets.find(a => a.productId === c.productId);
    const signed = c.signStatus.includes('已');
    const signDt = order ? parseOrderNoDateTime(order.orderNo, '14:00') : null;
    return {
      ...c,
      productName: product?.name,
      memberName: order?.memberName ?? '—',
      signedAt: signed && signDt ? signDt.dateTime : '—',
      orderId: order?.id,
      freezeRule: '每年最多 1 次，单次最长 30 天',
      transferRule: '需店长审批，手续费按模板 5%',
      refundRule: product?.clauseSummary ?? '按未使用权益比例',
      stores: product?.stores ?? '全馆',
      courses: product?.courses ?? '—',
      disputeSummary: '争议事项提交总部法务协调，门店先行登记',
      riskHints: buildContractRiskHints(c, order, asset),
    };
  });

  const assets: MallAssetRow[] = core.assets.map(a => {
    const product = productMap.get(a.productId);
    const order = orders.find(o => o.orderNo === a.sourceOrderNo || o.productId === a.productId);
    const contract = contracts.find(c => c.productId === a.productId);
    const lowUsage = a.remaining !== '—' && /\d+/.test(a.remaining) && Number(a.remaining.replace(/\D/g, '')) > 20;
    return {
      ...a,
      assetCode:
        order?.orderNo && /^SO-\d{8}/.test(order.orderNo)
          ? order.orderNo.replace(/^SO-/, 'AS-')
          : a.assetName,
      memberName: order?.memberName ?? '—',
      productName: product?.name,
      totalBenefit: product?.benefit ?? '—',
      contractId: contract?.id,
      orderId: order?.id,
      generatedAt:
        a.generated && order
          ? parseOrderNoDateTime(order.orderNo, '10:25').dateTime
          : '—',
      stores: product?.stores ?? '全馆',
      courses: product?.courses ?? '—',
      deductRules: '团课按点/次扣减；私教按节扣减',
      bookingRules: '需提前 2 小时预约；高峰时段限次',
      cancelRules: '开课前 2 小时可免费取消',
      freezeRule: contract?.freezeRule ?? '见合同模板',
      transferRule: contract?.transferRule ?? '需审批',
      refundRule: contract?.refundRule ?? '按模板',
      usageRecords: a.generated ? DEMO_USAGE : [],
      isFrozen: a.status.includes('冻结'),
      isRefunding: a.status.includes('退款'),
      isTransferring: a.status.includes('转'),
      isExpiringSoon: a.validUntil !== '—' && a.validUntil.includes('2026'),
      isLowUsage: lowUsage,
    };
  });

  const risks: MallRiskRow[] = core.risks.map(r => {
    const product = productMap.get(r.productId);
    const order = orders.find(o => o.productId === r.productId);
    const contract = contracts.find(c => c.productId === r.productId);
    const asset = assets.find(a => a.productId === r.productId);
    return {
      ...r,
      riskLevel: r.kind === '退款' ? '高' : '中',
      orderId: order?.id,
      contractId: contract?.id,
      assetId: asset?.id,
      relatedOrderNo: order?.orderNo,
      relatedContractNo: contract?.contractNo,
      relatedAssetName: asset?.assetName,
      productName: product?.name,
      owner: '管家B',
      dueLabel: '今日 18:00',
      status: r.refundStatus.includes('待') || r.transferStatus.includes('待') ? '待处理' : '跟进中',
      triggerReason: r.summary,
      impactScope: r.assetImpact,
      checkData: '订单支付记录、合同签署状态、资产余量',
      steps: [
        '核对订单支付与合同签署是否一致',
        '确认资产余量与申请影响范围',
        '提交审批并记录处理结果（待接入真实服务）',
      ],
      handleLogs: [
        {
          at: formatMallLogAt('05-13 15:00'),
          operator: '管家B',
          content: '创建风险待办',
          result: '待人工复核',
        },
        {
          at: formatMallLogAt('05-13 16:20'),
          operator: '店长',
          content: '指派负责人',
          result: '待处理',
        },
      ],
    };
  });

  const logs: MallLogRow[] = core.logs.map(l => ({ ...l, at: formatMallLogAt(l.at) })).map((l, i) => {
    const order = orders.find(o => o.productId === l.productId);
    const contract = contracts.find(c => c.productId === l.productId);
    const asset = assets.find(a => a.productId === l.productId);
    const risk = risks.find(r => r.productId === l.productId);
    if (i % 4 === 0 && order) return { ...l, linkType: 'order', linkId: order.id };
    if (i % 4 === 1 && contract) return { ...l, linkType: 'contract', linkId: contract.id };
    if (i % 4 === 2 && asset) return { ...l, linkType: 'asset', linkId: asset.id };
    if (i % 4 === 3 && risk) return { ...l, linkType: 'risk', linkId: risk.id };
    return l;
  });

  return { ...core, orders, contracts, assets, risks, logs };
};

export const findMallOrder = (snapshot: MallOperationSnapshot, id?: string) =>
  id ? snapshot.orders.find(o => o.id === id) : undefined;

export const findMallContract = (snapshot: MallOperationSnapshot, id?: string) =>
  id ? snapshot.contracts.find(c => c.id === id) : undefined;

export const findMallAsset = (snapshot: MallOperationSnapshot, id?: string) =>
  id ? snapshot.assets.find(a => a.id === id) : undefined;

export const findMallRisk = (snapshot: MallOperationSnapshot, id?: string) =>
  id ? snapshot.risks.find(r => r.id === id) : undefined;

export const resolveOrderContext = (
  snapshot: MallOperationSnapshot,
  order: MallOrderRow,
) => ({
  contract: order.contractId
    ? findMallContract(snapshot, order.contractId)
    : snapshot.contracts.find(c => c.productId === order.productId),
  asset: order.assetId
    ? findMallAsset(snapshot, order.assetId)
    : snapshot.assets.find(
        a => a.sourceOrderNo === order.orderNo || a.productId === order.productId,
      ),
  risk: order.riskId ? findMallRisk(snapshot, order.riskId) : undefined,
  product: snapshot.products.find(p => p.id === order.productId),
});

const ORDER_STATUS_POOL = ['已完成', '已完成', '退款处理中', '待支付'] as const;
const PAY_STATUS_POOL = ['已支付', '已支付', '部分退款', '待支付'] as const;

const stepTone = (value: string): MallEvidenceChainStep['tone'] => {
  if (value.includes('待') || value.includes('未') || value.includes('异常') || value.includes('失败')) {
    return 'pending';
  }
  if (value.includes('退款') || value.includes('风险') || value.includes('审')) {
    return 'risk';
  }
  if (value === '—' || value.includes('无')) return 'muted';
  return 'ok';
};

export const buildEvidenceChainSteps = (
  order?: MallOrderRow,
  risk?: MallRiskRow,
): MallEvidenceChainStep[] => {
  if (!order) {
    return [
      { key: '订单', value: '—', tone: 'muted' },
      { key: '支付', value: '—', tone: 'muted' },
      { key: '合同', value: '—', tone: 'muted' },
      { key: '资产', value: '—', tone: 'muted' },
      { key: '风险', value: risk?.kind ? `${risk.kind}待审` : '无', tone: risk ? 'risk' : 'ok' },
    ];
  }
  const orderVal = order.orderStatus ?? '已下单';
  const payVal = order.payStatus;
  const contractVal = order.contractStatus;
  const assetVal = order.assetStatus;
  let riskVal = '无';
  if (risk) riskVal = `${risk.kind} · 待审`;
  else if (order.riskNote && order.riskNote !== '—') riskVal = '需核对';

  return [
    { key: '订单', value: orderVal, tone: stepTone(orderVal) },
    { key: '支付', value: payVal, tone: stepTone(payVal) },
    { key: '合同', value: contractVal, tone: stepTone(contractVal) },
    { key: '资产', value: assetVal, tone: stepTone(assetVal) },
    { key: '风险', value: riskVal, tone: stepTone(riskVal) },
  ];
};

export const buildEvidenceChainLabels = (order?: MallOrderRow, risk?: MallRiskRow): string[] =>
  buildEvidenceChainSteps(order, risk).map(s => s.value);

export type MallModalHeaderFocus = {
  title: string;
  subtitle: string;
  chain: MallEvidenceChainStep[];
  riskHint: string | null;
};

export const resolveMallModalHeader = (
  snapshot: MallOperationSnapshot,
  product: MallProductRow,
  subview: { type: string; id?: string } | null,
): MallModalHeaderFocus => {
  const defaultOrder = snapshot.orders.find(o => o.productId === product.id);
  const defaultRisk = snapshot.risks.find(r => r.productId === product.id);

  if (subview?.type === 'orderDetail' && subview.id) {
    const order = findMallOrder(snapshot, subview.id);
    const risk = order?.riskId ? findMallRisk(snapshot, order.riskId) : defaultRisk;
    if (order) {
      return {
        title: order.orderNo,
        subtitle: `${order.memberName} · ${order.productName ?? product.name} · 来源订单 ${order.orderNo}`,
        chain: buildEvidenceChainSteps(order, risk),
        riskHint: order.riskNote && order.riskNote !== '—' ? order.riskNote : null,
      };
    }
  }
  if (subview?.type === 'contractDetail' && subview.id) {
    const contract = findMallContract(snapshot, subview.id);
    const order = contract?.orderId
      ? findMallOrder(snapshot, contract.orderId)
      : defaultOrder;
    if (contract) {
      return {
        title: contract.contractNo,
        subtitle: `${contract.memberName ?? '—'} · ${contract.productName ?? product.name} · ${order?.orderNo ?? '—'}`,
        chain: buildEvidenceChainSteps(order, defaultRisk),
        riskHint: contract.riskHints?.[0] ?? null,
      };
    }
  }
  if (subview?.type === 'assetDetail' && subview.id) {
    const asset = findMallAsset(snapshot, subview.id);
    const order = asset?.orderId
      ? findMallOrder(snapshot, asset.orderId)
      : snapshot.orders.find(o => o.orderNo === asset?.sourceOrderNo) ?? defaultOrder;
    if (asset) {
      return {
        title: asset.assetName,
        subtitle: `${asset.memberName ?? '—'} · ${asset.productName ?? product.name} · ${asset.sourceOrderNo ?? '—'}`,
        chain: buildEvidenceChainSteps(order, defaultRisk),
        riskHint: asset.pendingReason ?? null,
      };
    }
  }
  if (subview?.type === 'riskRecord' && subview.id) {
    const risk = findMallRisk(snapshot, subview.id);
    const order = risk?.orderId ? findMallOrder(snapshot, risk.orderId) : defaultOrder;
    if (risk) {
      return {
        title: `${risk.kind} · ${risk.memberName}`,
        subtitle: `${risk.memberName} · ${risk.productName ?? product.name} · ${order?.orderNo ?? '—'}`,
        chain: buildEvidenceChainSteps(order, risk),
        riskHint: risk.riskNote,
      };
    }
  }

  return {
    title: product.name,
    subtitle: defaultOrder
      ? `${defaultOrder.memberName} · ${product.name} · ${defaultOrder.orderNo}`
      : `${product.name} · 仅展示草稿 / 预览`,
    chain: buildEvidenceChainSteps(defaultOrder, defaultRisk),
    riskHint:
      product.orderRisk !== '正常' && product.riskHint !== '—'
        ? product.riskHint
        : defaultOrder?.riskNote && defaultOrder.riskNote !== '—'
          ? defaultOrder.riskNote
          : null,
  };
};

export const deriveContractPendingRows = (data: MallCoreData): MallContractPendingRow[] => {
  const rows: MallContractPendingRow[] = [];
  data.orders.forEach(o => {
    if (!o.contractStatus.includes('待签') && !o.contractStatus.includes('待')) return;
    const contract = data.contracts.find(c => c.productId === o.productId);
    const product = data.products.find(p => p.id === o.productId);
    rows.push({
      id: `cp-${o.id}`,
      contractId: contract?.id ?? o.contractId ?? o.id,
      contractNo: contract?.contractNo ?? '—',
      memberName: o.memberName,
      productName: o.productName ?? product?.name ?? '—',
      productId: o.productId,
      orderNo: o.orderNo,
      orderId: o.id,
      signStatus: contract?.signStatus ?? o.contractStatus,
      templateName: contract?.templateName ?? product?.contractTemplate ?? '—',
      pendingReason:
        o.riskNote && o.riskNote !== '—'
          ? o.riskNote
          : contract?.contractStatus.includes('模板')
            ? '合同模板待确认'
            : '已支付但合同未签',
    });
  });
  data.products
    .filter(p => p.contractBind === '未绑定' || p.contractBind === '模板待确认')
    .forEach(p => {
      if (rows.some(r => r.productId === p.id)) return;
      const contract = data.contracts.find(c => c.productId === p.id);
      rows.push({
        id: `cp-p-${p.id}`,
        contractId: contract?.id ?? p.id,
        contractNo: contract?.contractNo ?? '—',
        memberName: '—',
        productName: p.name,
        productId: p.id,
        orderNo: '—',
        orderId: '',
        signStatus: p.contractSignStatus,
        templateName: p.contractTemplate,
        pendingReason: p.contractBind === '未绑定' ? '合同模板缺失' : '合同模板待确认',
      });
    });
  return rows;
};

export const deriveAssetPendingRows = (data: MallCoreData): MallAssetPendingRow[] => {
  const rows: MallAssetPendingRow[] = [];
  data.assets.forEach(a => {
    if (a.generated && a.status === '正常') return;
    const order = data.orders.find(
      o => o.orderNo === a.sourceOrderNo || o.productId === a.productId,
    );
    const product = data.products.find(p => p.id === a.productId);
    const contract = data.contracts.find(c => c.productId === a.productId);
    rows.push({
      id: `ap-${a.id}`,
      assetId: a.id,
      assetStatus: a.status,
      memberName: a.memberName ?? order?.memberName ?? '—',
      productName: a.productName ?? product?.name ?? '—',
      productId: a.productId,
      orderNo: a.sourceOrderNo ?? order?.orderNo ?? '—',
      orderId: order?.id,
      contractStatus: order?.contractStatus ?? contract?.signStatus ?? '—',
      remaining: a.remaining,
      pendingReason: a.pendingReason ?? product?.pendingAssetReason ?? '待核对',
      contractId: contract?.id,
    });
  });
  data.orders
    .filter(o => o.assetStatus.includes('待生成') || o.assetStatus.includes('异常'))
    .forEach(o => {
      if (rows.some(r => r.orderId === o.id)) return;
      const product = data.products.find(p => p.id === o.productId);
      const asset = data.assets.find(a => a.sourceOrderNo === o.orderNo || a.productId === o.productId);
      rows.push({
        id: `ap-o-${o.id}`,
        assetId: asset?.id,
        assetStatus: o.assetStatus,
        memberName: o.memberName,
        productName: o.productName ?? product?.name ?? '—',
        productId: o.productId,
        orderNo: o.orderNo,
        orderId: o.id,
        contractStatus: o.contractStatus,
        remaining: asset?.remaining ?? '—',
        pendingReason: o.riskNote && o.riskNote !== '—' ? o.riskNote : '支付与合同状态待核对',
        contractId: o.contractId,
      });
    });
  return rows;
};

export const deriveSensitiveOpRows = (data: MallCoreData): MallSensitiveOpRow[] =>
  data.risks.map(r => {
    const order = r.orderId
      ? data.orders.find(o => o.id === r.orderId)
      : data.orders.find(o => o.productId === r.productId);
    const asset = r.assetId
      ? data.assets.find(a => a.id === r.assetId)
      : data.assets.find(a => a.productId === r.productId);
    const product = data.products.find(p => p.id === r.productId);
    const status =
      r.kind === '退款'
        ? r.refundStatus
        : r.kind === '转卡'
          ? r.transferStatus
          : r.freezeStatus;
    return {
      id: `so-${r.id}`,
      riskId: r.id,
      kind: r.kind,
      memberName: r.memberName,
      productName: r.productName ?? product?.name ?? '—',
      productId: r.productId,
      orderNo: order?.orderNo ?? '—',
      orderId: order?.id,
      assetName: asset?.assetName ?? '—',
      assetId: asset?.id,
      status,
      riskReason: r.summary,
      owner: r.owner ?? '管家B',
    };
  });

export const getProductOrders = (
  orders: MallOrderRow[],
  productId: string,
  minCount = 28,
): MallOrderRow[] => {
  const base = orders.filter(o => o.productId === productId);
  if (base.length === 0) return [];
  const out: MallOrderRow[] = [...base];
  let seq = base.length + 1;
  while (out.length < minCount) {
    const src = base[out.length % base.length];
    const day = String(Math.max(1, 28 - Math.floor(out.length / 2))).padStart(2, '0');
    const suffix = String(seq).padStart(3, '0');
    const st = ORDER_STATUS_POOL[out.length % ORDER_STATUS_POOL.length];
    const pay = PAY_STATUS_POOL[out.length % PAY_STATUS_POOL.length];
    const orderNo = `SO-202605${day}-${suffix}`;
    const orderDt = parseOrderNoDateTime(orderNo, `${10 + (out.length % 8)}:20`);
    const payDt = parseOrderNoDateTime(orderNo, `${10 + (out.length % 8)}:18`);
    out.push({
      ...src,
      id: `${src.id}-x${seq}`,
      orderNo,
      amount: formatMallCny(src.amount),
      paidAmount: pay.includes('已支付') || pay.includes('已兑换') ? formatMallCny(src.amount) : '¥0',
      orderStatus: st,
      payStatus: pay,
      contractStatus: pay === '已支付' && out.length % 5 === 0 ? '待签署' : src.contractStatus,
      assetStatus: pay === '已支付' && out.length % 6 === 0 ? '待生成' : src.assetStatus,
      orderTime: orderDt.dateTime,
      payTime: pay.includes('已支付') || pay.includes('已兑换') ? payDt.dateTime : '—',
      riskNote: out.length % 7 === 0 ? '合同未签，需人工复核' : src.riskNote,
    });
    seq += 1;
  }
  return out;
};
