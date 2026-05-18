/** 财务管理模块局部 demo 数据（不写入全局 types/constants） */

import {
  formatFinanceCny,
  formatFinanceCount,
  formatFinanceDate,
  formatFinanceDateTime,
} from './financeFormatters';

export type FinanceWorkbenchSegment =
  | 'payments'
  | 'refunds'
  | 'consumption'
  | 'teacherFees'
  | 'settlements'
  | 'expenses'
  | 'reports';

export const FINANCE_WORKBENCH_SEGMENTS: { id: FinanceWorkbenchSegment; label: string }[] = [
  { id: 'payments', label: '收款核对' },
  { id: 'refunds', label: '退款核对' },
  { id: 'consumption', label: '耗课确认收入' },
  { id: 'teacherFees', label: '老师课时费' },
  { id: 'settlements', label: '跨店结算' },
  { id: 'expenses', label: '费用支出' },
  { id: 'reports', label: '财务报表' },
];

export const FINANCE_SEGMENT_HINTS: Record<FinanceWorkbenchSegment, string> = {
  payments: '核对今日实收与订单、合同、资产是否对齐',
  refunds: '退款申请需核对资产余量与支付记录',
  consumption: '耗课后确认收入，收款未耗课计入预收负债',
  teacherFees: '老师课时费待生成、待确认、待发放',
  settlements: '跨店消课与售卡门店结算核对',
  expenses: '房租、人工、课时费等支出与凭证',
  reports: '经营测算与现金负债覆盖判断（仅作经营参考）',
};

export type FinanceEntityType =
  | 'payment'
  | 'refund'
  | 'consumption'
  | 'teacherFee'
  | 'settlement'
  | 'expense';

export interface FinanceMetricItem {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'amber' | 'rose';
}

export interface FinanceInsightTip {
  id: string;
  tag: string;
  line: string;
  actionLabel: string;
  actionKey: string;
}

export interface FinancePaymentRow {
  id: string;
  payNo: string;
  orderNo: string;
  memberName: string;
  phoneMask: string;
  productName: string;
  amount: number;
  payMethod: string;
  contractStatus: string;
  assetStatus: string;
  financeStatus: string;
  payTime: string;
  evidenceChain: string[];
  riskNote: string;
}

export interface FinanceRefundRow {
  id: string;
  refundNo: string;
  memberName: string;
  phoneMask: string;
  productName: string;
  orderNo: string;
  applyAmount: number;
  refundableAmount: number;
  assetAction: string;
  approvalStatus: string;
  riskReason: string;
  evidenceChain: string[];
}

export interface FinanceConsumptionRow {
  id: string;
  recordNo: string;
  date: string;
  memberName: string;
  courseName: string;
  teacherName: string;
  storeName: string;
  deductLabel: string;
  recognizedRevenue: number;
  assetSource: string;
  status: string;
  evidenceChain: string[];
}

export interface FinanceTeacherFeeRow {
  id: string;
  sessionNo: string;
  date: string;
  teacherName: string;
  courseName: string;
  storeName: string;
  classType: string;
  attendeeCount: number;
  feeAmount: number;
  status: string;
  evidenceChain: string[];
}

export interface FinanceSettlementRow {
  id: string;
  settlementNo: string;
  consumeStore: string;
  sellStore: string;
  memberName: string;
  productName: string;
  points: number;
  amount: number;
  ruleLabel: string;
  status: string;
  evidenceChain: string[];
}

export interface FinanceExpenseRow {
  id: string;
  expenseNo: string;
  date: string;
  storeName: string;
  category: string;
  amount: number;
  payStatus: string;
  operator: string;
  voucherStatus: string;
  status: string;
}

export interface FinanceReportSummary {
  monthCashIn: number;
  monthRecognized: number;
  monthExpense: number;
  deferredLiability: number;
  cashBalance: number;
  safetyCushion: number;
  judgment1: '通过' | '预警' | '风险';
  judgment2: '通过' | '预警' | '风险';
  judgment3: '正常' | '需关注';
  judgment1Note: string;
  judgment2Note: string;
  judgment3Note: string;
}

export type FinanceActionGroup =
  | 'paymentPending'
  | 'refundPending'
  | 'consumptionPending'
  | 'teacherFeePending'
  | 'settlementPending'
  | 'expenseVoucherPending';

export interface FinanceSegmentMiniStat {
  label: string;
  value: string;
  isAmount?: boolean;
}

export interface FinanceJudgmentHint {
  principle: string;
  stuck: string;
  nextStep: string;
}

export interface FinanceActionItem {
  id: string;
  group: FinanceActionGroup;
  title: string;
  statusLabel: string;
  riskLine: string;
  evidenceChain: string[];
  entityType: FinanceEntityType;
  entityId: string;
}

/** 收款类证据链 */
export const FINANCE_CHAIN_PAYMENT = ['收款', '订单', '合同', '资产', '财务核对'];
/** 退款类证据链 */
export const FINANCE_CHAIN_REFUND = ['订单', '支付', '退款', '资产', '财务核对'];
/** 耗课收入类证据链 */
export const FINANCE_CHAIN_CONSUMPTION = ['预约', '签到', '耗课', '确认收入'];
/** 老师课时费类证据链 */
export const FINANCE_CHAIN_TEACHER_FEE = ['课程', '到课', '完课', '课时费', '发放'];
/** 跨店结算类证据链 */
export const FINANCE_CHAIN_SETTLEMENT = ['耗课门店', '售卡门店', '结算规则', '财务确认'];
/** 费用支出类证据链 */
export const FINANCE_CHAIN_EXPENSE = ['费用申请', '付款', '凭证', '归档'];

export interface FinanceOperationSnapshot {
  metrics: FinanceMetricItem[];
  insights: FinanceInsightTip[];
  payments: FinancePaymentRow[];
  refunds: FinanceRefundRow[];
  consumptions: FinanceConsumptionRow[];
  teacherFees: FinanceTeacherFeeRow[];
  settlements: FinanceSettlementRow[];
  expenses: FinanceExpenseRow[];
  report: FinanceReportSummary;
  actionQueue: FinanceActionItem[];
}

const chainPaymentPending = ['收款', '订单', '待签约', '资产未生成', '财务核对'];
const chainPaymentRisk = ['收款', '订单', '支付', '退款中', '财务核对'];

const MEMBERS = [
  { name: '林晓', phone: '138****1201' },
  { name: '周然', phone: '139****8823' },
  { name: '钱芳', phone: '137****5560' },
  { name: '陈悦', phone: '136****9012' },
  { name: '吴婷', phone: '135****3344' },
  { name: '郑凯', phone: '133****7788' },
  { name: '赵敏', phone: '132****6611' },
  { name: '孙莉', phone: '131****2299' },
  { name: '王浩', phone: '130****1188' },
  { name: '学员张', phone: '189****4400' },
  { name: '新客李', phone: '188****3301' },
  { name: '会员A', phone: '186****9900' },
];

const PRODUCTS = [
  '初遇卡 Spark',
  '锦鲤卡 Flow',
  '天选卡 Prime',
  '硬核卡 Core',
  '自由卡 Flex',
  '瑜伽月卡',
  '普拉提月卡',
  '核心床小班卡',
  '私教正式课包',
  '普拉提教培早鸟名额',
];

const STORES = ['万象馆', '城西馆', '滨江馆', '西湖馆', '云谷馆'];
const TEACHERS = ['Anna', 'David', 'Leo', 'Lina', 'Mia', 'Sara', 'Tom', '王凯', '林青', '陈宁'];

const withIds = <T,>(rows: T[], prefix: string): (T & { id: string })[] =>
  rows.map((r, i) => ({ ...r, id: `${prefix}-${i + 1}` }));

export const buildFinanceOperationSnapshot = (): FinanceOperationSnapshot => {
  const payments: FinancePaymentRow[] = withIds(
    [
      {
        payNo: 'PAY-20260514-001',
        orderNo: 'SO-20260514-001',
        memberName: '林晓',
        phoneMask: '138****1201',
        productName: '初遇卡 Spark',
        amount: 4990,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-14 10:18',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260514-002',
        orderNo: 'SO-20260514-002',
        memberName: '周然',
        phoneMask: '139****8823',
        productName: '锦鲤卡 Flow',
        amount: 8800,
        payMethod: '微信支付',
        contractStatus: '待签署',
        assetStatus: '待生成',
        financeStatus: '待合同',
        payTime: '2026-05-14 11:05',
        evidenceChain: chainPaymentPending,
        riskNote: '已支付但合同未签',
      },
      {
        payNo: 'PAY-20260513-018',
        orderNo: 'SO-20260513-018',
        memberName: '周然',
        phoneMask: '139****8823',
        productName: '锦鲤卡 Flow',
        amount: 8800,
        payMethod: '线下转账',
        contractStatus: '待签署',
        assetStatus: '待生成',
        financeStatus: '待资产',
        payTime: '2026-05-13 16:40',
        evidenceChain: chainPaymentPending,
        riskNote: '合同未签，暂不可确认负债',
      },
      {
        payNo: 'PAY-20260513-022',
        orderNo: 'SO-20260513-022',
        memberName: '钱芳',
        phoneMask: '137****5560',
        productName: '私教正式课包',
        amount: 12800,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '异常',
        financeStatus: '金额异常',
        payTime: '2026-05-13 14:22',
        evidenceChain: chainPaymentRisk,
        riskNote: '部分退款需复核金额',
      },
      {
        payNo: 'PAY-20260512-009',
        orderNo: 'SO-20260512-009',
        memberName: '陈悦',
        phoneMask: '136****9012',
        productName: '天选卡 Prime',
        amount: 15800,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-12 09:15',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260512-031',
        orderNo: 'SO-20260512-031',
        memberName: '学员张',
        phoneMask: '189****4400',
        productName: '普拉提教培早鸟名额',
        amount: 16800,
        payMethod: '线下转账',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-12 14:00',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260511-007',
        orderNo: 'SO-20260511-007',
        memberName: '王浩',
        phoneMask: '130****1188',
        productName: '硬核卡 Core',
        amount: 6600,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-11 18:30',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260510-015',
        orderNo: 'SO-20260510-015',
        memberName: '赵敏',
        phoneMask: '132****6611',
        productName: '瑜伽月卡',
        amount: 1280,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-10 12:08',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260509-003',
        orderNo: 'SO-20260509-003',
        memberName: '吴婷',
        phoneMask: '135****3344',
        productName: '普拉提月卡',
        amount: 1680,
        payMethod: '微信支付',
        contractStatus: '待签署',
        assetStatus: '待生成',
        financeStatus: '待人工复核',
        payTime: '2026-05-09 20:11',
        evidenceChain: chainPaymentPending,
        riskNote: '模板待确认',
      },
      {
        payNo: 'PAY-20260508-021',
        orderNo: 'SO-20260508-021',
        memberName: '郑凯',
        phoneMask: '133****7788',
        productName: '核心床小班卡',
        amount: 2980,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-08 15:45',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260507-012',
        orderNo: 'SO-20260507-012',
        memberName: '新客李',
        phoneMask: '188****3301',
        productName: '私教体验包',
        amount: 399,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-07 10:02',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
      {
        payNo: 'PAY-20260506-008',
        orderNo: 'SO-20260506-008',
        memberName: '孙莉',
        phoneMask: '131****2299',
        productName: '瑜伽季卡',
        amount: 3280,
        payMethod: '微信支付',
        contractStatus: '已签署',
        assetStatus: '已生成',
        financeStatus: '已核对',
        payTime: '2026-05-06 19:20',
        evidenceChain: FINANCE_CHAIN_PAYMENT,
        riskNote: '—',
      },
    ],
    'fin-pay',
  );

  const refunds: FinanceRefundRow[] = withIds(
    [
      {
        refundNo: 'REF-20260513-022',
        memberName: '钱芳',
        phoneMask: '137****5560',
        productName: '私教正式课包',
        orderNo: 'SO-20260513-022',
        applyAmount: 2000,
        refundableAmount: 2000,
        assetAction: '扣减剩余权益',
        approvalStatus: '待审批',
        riskReason: '部分退款需核对剩余节数',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260514-003',
        memberName: '新客李',
        phoneMask: '188****3301',
        productName: '私教体验包',
        orderNo: 'SO-20260507-012',
        applyAmount: 399,
        refundableAmount: 399,
        assetAction: '作废资产',
        approvalStatus: '申请待审',
        riskReason: '体验课误购',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260512-001',
        memberName: '周然',
        phoneMask: '139****8823',
        productName: '锦鲤卡 Flow',
        orderNo: 'SO-20260513-018',
        applyAmount: 8800,
        refundableAmount: 0,
        assetAction: '待确认',
        approvalStatus: '已驳回',
        riskReason: '合同未签不可退全款',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260511-008',
        memberName: '陈悦',
        phoneMask: '136****9012',
        productName: '天选卡 Prime',
        orderNo: 'SO-20260512-009',
        applyAmount: 3000,
        refundableAmount: 2800,
        assetAction: '扣减剩余权益',
        approvalStatus: '已通过待退款',
        riskReason: '需财务确认退款路径',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260510-002',
        memberName: '赵敏',
        phoneMask: '132****6611',
        productName: '瑜伽月卡',
        orderNo: 'SO-20260510-015',
        applyAmount: 640,
        refundableAmount: 640,
        assetAction: '扣减剩余权益',
        approvalStatus: '金额需复核',
        riskReason: '未开课比例待确认',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260509-001',
        memberName: '吴婷',
        phoneMask: '135****3344',
        productName: '普拉提月卡',
        orderNo: 'SO-20260509-003',
        applyAmount: 1680,
        refundableAmount: 1680,
        assetAction: '保留资产',
        approvalStatus: '待审批',
        riskReason: '合同未签暂缓',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260508-004',
        memberName: '郑凯',
        phoneMask: '133****7788',
        productName: '核心床小班卡',
        orderNo: 'SO-20260508-021',
        applyAmount: 500,
        refundableAmount: 500,
        assetAction: '扣减剩余权益',
        approvalStatus: '已完成',
        riskReason: '—',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
      {
        refundNo: 'REF-20260507-002',
        memberName: '王浩',
        phoneMask: '130****1188',
        productName: '硬核卡 Core',
        orderNo: 'SO-20260511-007',
        applyAmount: 1200,
        refundableAmount: 1100,
        assetAction: '扣减剩余权益',
        approvalStatus: '待审批',
        riskReason: '跨店耗课影响可退额',
        evidenceChain: FINANCE_CHAIN_REFUND,
      },
    ],
    'fin-ref',
  );

  const consumptions: FinanceConsumptionRow[] = withIds(
    Array.from({ length: 16 }, (_, i) => {
      const m = MEMBERS[i % MEMBERS.length];
      const st = STORES[i % STORES.length];
      const t = TEACHERS[i % TEACHERS.length];
      const day = String(8 + (i % 7)).padStart(2, '0');
      const statuses = ['已确认', '已确认', '待确认', '异常待处理', '跨店待结算'];
      const status = statuses[i % statuses.length];
      return {
        recordNo: `CON-202605${day}-${String(i + 1).padStart(3, '0')}`,
        date: `2026-05-${day}`,
        memberName: m.name,
        courseName: i % 3 === 0 ? '流瑜伽 · 晚间' : i % 3 === 1 ? '核心床小班' : '阴瑜伽',
        teacherName: t,
        storeName: st,
        deductLabel: i % 2 === 0 ? '扣 1 点' : '扣 1 次',
        recognizedRevenue: 80 + (i % 5) * 25,
        assetSource: PRODUCTS[i % PRODUCTS.length],
        status,
        evidenceChain: FINANCE_CHAIN_CONSUMPTION,
      };
    }),
    'fin-con',
  );

  const teacherFees: FinanceTeacherFeeRow[] = withIds(
    Array.from({ length: 12 }, (_, i) => {
      const statuses = ['待生成', '待确认', '已确认', '待发放', '已发放', '异常'];
      return {
        sessionNo: `TSF-202605${String(10 + (i % 5)).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        date: `2026-05-${String(10 + (i % 5)).padStart(2, '0')}`,
        teacherName: TEACHERS[i % TEACHERS.length],
        courseName: i % 2 === 0 ? '流瑜伽' : '普拉提小班',
        storeName: STORES[i % STORES.length],
        classType: i % 3 === 0 ? '团课' : i % 3 === 1 ? '小班' : '私教',
        attendeeCount: 6 + (i % 8),
        feeAmount: 180 + i * 35,
        status: statuses[i % statuses.length],
        evidenceChain: FINANCE_CHAIN_TEACHER_FEE,
      };
    }),
    'fin-tsf',
  );

  const settlements: FinanceSettlementRow[] = withIds(
    [
      {
        settlementNo: 'XSS-20260511-001',
        consumeStore: '万象馆',
        sellStore: '城西馆',
        memberName: '王浩',
        productName: '硬核卡 Core',
        points: 2,
        amount: 160,
        ruleLabel: '跨店按点 80 元/点',
        status: '待核对',
        evidenceChain: FINANCE_CHAIN_SETTLEMENT,
      },
      {
        settlementNo: 'XSS-20260512-002',
        consumeStore: '滨江馆',
        sellStore: '万象馆',
        memberName: '陈悦',
        productName: '天选卡 Prime',
        points: 3,
        amount: 240,
        ruleLabel: '跨店按点 80 元/点',
        status: '已确认',
        evidenceChain: FINANCE_CHAIN_SETTLEMENT,
      },
      {
        settlementNo: 'XSS-20260513-003',
        consumeStore: '西湖馆',
        sellStore: '云谷馆',
        memberName: '林晓',
        productName: '初遇卡 Spark',
        points: 1,
        amount: 80,
        ruleLabel: '跨店按点 80 元/点',
        status: '待结算',
        evidenceChain: FINANCE_CHAIN_SETTLEMENT,
      },
      {
        settlementNo: 'XSS-20260510-004',
        consumeStore: '城西馆',
        sellStore: '滨江馆',
        memberName: '赵敏',
        productName: '瑜伽月卡',
        points: 1,
        amount: 60,
        ruleLabel: '月卡跨店折算',
        status: '已结算',
        evidenceChain: FINANCE_CHAIN_SETTLEMENT,
      },
      {
        settlementNo: 'XSS-20260509-005',
        consumeStore: '云谷馆',
        sellStore: '万象馆',
        memberName: '郑凯',
        productName: '核心床小班卡',
        points: 2,
        amount: 120,
        ruleLabel: '小班跨店规则 v2',
        status: '规则异常',
        evidenceChain: ['耗课门店', '售卡门店', '规则异常', '财务确认'],
      },
      {
        settlementNo: 'XSS-20260508-006',
        consumeStore: '万象馆',
        sellStore: '西湖馆',
        memberName: '孙莉',
        productName: '瑜伽季卡',
        points: 1,
        amount: 55,
        ruleLabel: '季卡跨店折算',
        status: '待核对',
        evidenceChain: FINANCE_CHAIN_SETTLEMENT,
      },
      {
        settlementNo: 'XSS-20260514-007',
        consumeStore: '滨江馆',
        sellStore: '城西馆',
        memberName: '学员张',
        productName: '普拉提教培早鸟名额',
        points: 0,
        amount: 0,
        ruleLabel: '教培不适用跨店',
        status: '已确认',
        evidenceChain: ['教培', '—', '—', '财务'],
      },
      {
        settlementNo: 'XSS-20260507-008',
        consumeStore: '城西馆',
        sellStore: '城西馆',
        memberName: '新客李',
        productName: '私教体验包',
        points: 0,
        amount: 0,
        ruleLabel: '同店无需结算',
        status: '已结算',
        evidenceChain: ['同店', '—', '—', '财务'],
      },
    ],
    'fin-xss',
  );

  const expenses: FinanceExpenseRow[] = withIds(
    [
      {
        expenseNo: 'EXP-20260510-001',
        date: '2026-05-10',
        storeName: '万象馆',
        category: '房租',
        amount: 42000,
        payStatus: '已付款',
        operator: '财务A',
        voucherStatus: '已归档',
        status: '已归档',
      },
      {
        expenseNo: 'EXP-20260512-002',
        date: '2026-05-12',
        storeName: '全部门店',
        category: '工资',
        amount: 86000,
        payStatus: '已付款',
        operator: '人事',
        voucherStatus: '已归档',
        status: '已归档',
      },
      {
        expenseNo: 'EXP-20260513-003',
        date: '2026-05-13',
        storeName: '滨江馆',
        category: '老师课时费',
        amount: 12800,
        payStatus: '待付款',
        operator: '财务B',
        voucherStatus: '待凭证',
        status: '待付款',
      },
      {
        expenseNo: 'EXP-20260514-004',
        date: '2026-05-14',
        storeName: '城西馆',
        category: '市场活动',
        amount: 5600,
        payStatus: '待付款',
        operator: '市场',
        voucherStatus: '待凭证',
        status: '待凭证',
      },
      {
        expenseNo: 'EXP-20260508-005',
        date: '2026-05-08',
        storeName: '西湖馆',
        category: '物业',
        amount: 3200,
        payStatus: '已付款',
        operator: '行政',
        voucherStatus: '已归档',
        status: '已归档',
      },
      {
        expenseNo: 'EXP-20260509-006',
        date: '2026-05-09',
        storeName: '云谷馆',
        category: '设备耗材',
        amount: 4800,
        payStatus: '已付款',
        operator: '采购',
        voucherStatus: '待凭证',
        status: '待凭证',
      },
      {
        expenseNo: 'EXP-20260511-007',
        date: '2026-05-11',
        storeName: '万象馆',
        category: '系统服务',
        amount: 2200,
        payStatus: '已付款',
        operator: 'IT',
        voucherStatus: '已归档',
        status: '已归档',
      },
      {
        expenseNo: 'EXP-20260507-008',
        date: '2026-05-07',
        storeName: '滨江馆',
        category: '老师课时费',
        amount: 9600,
        payStatus: '已付款',
        operator: '财务B',
        voucherStatus: '已归档',
        status: '已归档',
      },
      {
        expenseNo: 'EXP-20260506-009',
        date: '2026-05-06',
        storeName: '城西馆',
        category: '市场活动',
        amount: 8900,
        payStatus: '已付款',
        operator: '市场',
        voucherStatus: '已归档',
        status: '异常',
      },
      {
        expenseNo: 'EXP-20260505-010',
        date: '2026-05-05',
        storeName: '全部门店',
        category: '工资',
        amount: 1200,
        payStatus: '待付款',
        operator: '人事',
        voucherStatus: '待凭证',
        status: '待付款',
      },
    ],
    'fin-exp',
  );

  const report: FinanceReportSummary = {
    monthCashIn: 62609,
    monthRecognized: 186420,
    monthExpense: 154800,
    deferredLiability: 1286000,
    cashBalance: 1420000,
    safetyCushion: 134000,
    judgment1: '通过',
    judgment2: '预警',
    judgment3: '需关注',
    judgment1Note: '本月确认收入高于支出，经营基本健康（仅作经营测算）',
    judgment2Note: '账户余额略高于预收负债，安全垫偏薄，需关注退款与支出',
    judgment3Note: '2 笔退款待核对，异常支出 1 项需财务确认',
  };

  const metrics: FinanceMetricItem[] = [
    {
      id: 'fm1',
      label: '今日实收',
      value: formatFinanceCny(62609),
      hint: '微信 / 线下 / 转账',
    },
    {
      id: 'fm2',
      label: '本月确认收入',
      value: formatFinanceCny(186420),
      hint: '按耗课确认',
    },
    {
      id: 'fm3',
      label: '当前预收负债',
      value: formatFinanceCny(1286000),
      hint: '未耗课会员权益',
      tone: 'amber',
    },
    {
      id: 'fm4',
      label: '本月支出',
      value: formatFinanceCny(154800),
      hint: '房租 / 人工 / 课时费',
    },
    {
      id: 'fm5',
      label: '老师课时费待核',
      value: formatFinanceCny(38600),
      hint: '待确认 / 待发放',
      tone: 'amber',
    },
    {
      id: 'fm6',
      label: '财务风险',
      value: '6 项',
      hint: '退款 / 订单 / 负债异常',
      tone: 'rose',
    },
  ];

  const insights: FinanceInsightTip[] = [
    {
      id: 'fi1',
      tag: '收入覆盖支出',
      line: '本月确认收入高于支出，现金流仍需看预收负债覆盖',
      actionLabel: '查看判断',
      actionKey: 'judgment1',
    },
    {
      id: 'fi2',
      tag: '现金负债覆盖',
      line: '账户余额需大于预收负债，超出部分才接近可支配利润',
      actionLabel: '查看风险',
      actionKey: 'judgment2',
    },
    {
      id: 'fi3',
      tag: '退款核对',
      line: '2 笔退款申请需核对资产余量与支付记录',
      actionLabel: '处理',
      actionKey: 'refunds',
    },
    {
      id: 'fi4',
      tag: '课时费核算',
      line: '本周 18 节课待生成老师课时费',
      actionLabel: '核对',
      actionKey: 'teacherFees',
    },
  ];

  const actionQueue: FinanceActionItem[] = [
    {
      id: 'fa-1',
      group: 'paymentPending',
      title: '周然 · 锦鲤卡 Flow',
      statusLabel: '收款未核对',
      riskLine: '已收款但合同未签，暂不可确认收入',
      evidenceChain: chainPaymentPending,
      entityType: 'payment',
      entityId: 'fin-pay-2',
    },
    {
      id: 'fa-2',
      group: 'paymentPending',
      title: '吴婷 · 普拉提月卡',
      statusLabel: '待人工复核',
      riskLine: '收款已到账，合同模板待确认后生成资产',
      evidenceChain: chainPaymentPending,
      entityType: 'payment',
      entityId: 'fin-pay-9',
    },
    {
      id: 'fa-3',
      group: 'paymentPending',
      title: '钱芳 · 私教正式课包',
      statusLabel: '金额异常',
      riskLine: '实收与退款申请不一致，需核对支付记录',
      evidenceChain: chainPaymentRisk,
      entityType: 'payment',
      entityId: 'fin-pay-4',
    },
    {
      id: 'fa-4',
      group: 'refundPending',
      title: '钱芳 · 私教正式课包',
      statusLabel: '退款待核',
      riskLine: '退款申请需同步资产余量与支付记录',
      evidenceChain: FINANCE_CHAIN_REFUND,
      entityType: 'refund',
      entityId: 'fin-ref-1',
    },
    {
      id: 'fa-5',
      group: 'refundPending',
      title: '新客李 · 私教体验包',
      statusLabel: '待审批',
      riskLine: '退款申请需同步资产余量与支付记录',
      evidenceChain: FINANCE_CHAIN_REFUND,
      entityType: 'refund',
      entityId: 'fin-ref-2',
    },
    {
      id: 'fa-6',
      group: 'consumptionPending',
      title: '林晓 · 流瑜伽',
      statusLabel: '收入待确认',
      riskLine: '已完课但耗课记录未确认，收入待确认',
      evidenceChain: FINANCE_CHAIN_CONSUMPTION,
      entityType: 'consumption',
      entityId: 'fin-con-3',
    },
    {
      id: 'fa-7',
      group: 'consumptionPending',
      title: '王浩 · 核心床小班',
      statusLabel: '跨店耗课',
      riskLine: '跨店耗课待结算，确认收入需同步门店规则',
      evidenceChain: FINANCE_CHAIN_CONSUMPTION,
      entityType: 'consumption',
      entityId: 'fin-con-5',
    },
    {
      id: 'fa-8',
      group: 'teacherFeePending',
      title: 'Anna · 流瑜伽',
      statusLabel: '课时费待核',
      riskLine: '老师课时费待核，暂不进入发放',
      evidenceChain: FINANCE_CHAIN_TEACHER_FEE,
      entityType: 'teacherFee',
      entityId: 'fin-tsf-2',
    },
    {
      id: 'fa-9',
      group: 'teacherFeePending',
      title: 'David · 普拉提小班',
      statusLabel: '待生成',
      riskLine: '本周完课记录待生成课时费明细',
      evidenceChain: FINANCE_CHAIN_TEACHER_FEE,
      entityType: 'teacherFee',
      entityId: 'fin-tsf-1',
    },
    {
      id: 'fa-10',
      group: 'settlementPending',
      title: '王浩 · 硬核卡 Core',
      statusLabel: '跨店待结算',
      riskLine: '万象馆消课 / 城西馆售卡，结算规则待财务确认',
      evidenceChain: FINANCE_CHAIN_SETTLEMENT,
      entityType: 'settlement',
      entityId: 'fin-xss-1',
    },
    {
      id: 'fa-11',
      group: 'settlementPending',
      title: '郑凯 · 核心床小班卡',
      statusLabel: '规则异常',
      riskLine: '跨店结算规则与产品配置不一致，需人工确认',
      evidenceChain: ['耗课门店', '售卡门店', '规则异常', '财务确认'],
      entityType: 'settlement',
      entityId: 'fin-xss-5',
    },
    {
      id: 'fa-12',
      group: 'expenseVoucherPending',
      title: '滨江馆 · 老师课时费',
      statusLabel: '待凭证',
      riskLine: '支出已登记，凭证待补后进入正式账务',
      evidenceChain: FINANCE_CHAIN_EXPENSE,
      entityType: 'expense',
      entityId: 'fin-exp-3',
    },
    {
      id: 'fa-13',
      group: 'expenseVoucherPending',
      title: '城西馆 · 市场活动',
      statusLabel: '待付款',
      riskLine: '费用申请已审批，付款与凭证待补齐',
      evidenceChain: FINANCE_CHAIN_EXPENSE,
      entityType: 'expense',
      entityId: 'fin-exp-4',
    },
  ];

  return {
    metrics,
    insights,
    payments,
    refunds,
    consumptions,
    teacherFees,
    settlements,
    expenses,
    report,
    actionQueue,
  };
};

export const findFinancePayment = (s: FinanceOperationSnapshot, id: string) =>
  s.payments.find(p => p.id === id);

export const findFinanceRefund = (s: FinanceOperationSnapshot, id: string) =>
  s.refunds.find(r => r.id === id);

export const findFinanceConsumption = (s: FinanceOperationSnapshot, id: string) =>
  s.consumptions.find(c => c.id === id);

export const findFinanceTeacherFee = (s: FinanceOperationSnapshot, id: string) =>
  s.teacherFees.find(t => t.id === id);

export const findFinanceSettlement = (s: FinanceOperationSnapshot, id: string) =>
  s.settlements.find(x => x.id === id);

export const findFinanceExpense = (s: FinanceOperationSnapshot, id: string) =>
  s.expenses.find(e => e.id === id);

export const resolveFinanceEntityTitle = (
  snapshot: FinanceOperationSnapshot,
  type: FinanceEntityType,
  id: string,
): { title: string; subtitle: string; status: string; riskHint: string; chain: string[] } => {
  if (type === 'payment') {
    const p = findFinancePayment(snapshot, id);
    if (!p) return { title: '—', subtitle: '—', status: '—', riskHint: '—', chain: [] };
    return {
      title: p.payNo,
      subtitle: `${p.memberName} · ${p.productName} · ${p.orderNo}`,
      status: p.financeStatus,
      riskHint: p.riskNote !== '—' ? p.riskNote : '当前无额外风险提示 · 前端演示',
      chain: p.evidenceChain,
    };
  }
  if (type === 'refund') {
    const r = findFinanceRefund(snapshot, id);
    if (!r) return { title: '—', subtitle: '—', status: '—', riskHint: '—', chain: [] };
    return {
      title: r.refundNo,
      subtitle: `${r.memberName} · ${r.productName} · ${r.orderNo}`,
      status: r.approvalStatus,
      riskHint: r.riskReason,
      chain: r.evidenceChain,
    };
  }
  if (type === 'consumption') {
    const c = findFinanceConsumption(snapshot, id);
    if (!c) return { title: '—', subtitle: '—', status: '—', riskHint: '—', chain: [] };
    return {
      title: c.recordNo,
      subtitle: `${c.memberName} · ${c.courseName} · ${c.storeName}`,
      status: c.status,
      riskHint: '耗课后确认收入，未耗课部分仍属预收负债',
      chain: c.evidenceChain,
    };
  }
  if (type === 'teacherFee') {
    const t = findFinanceTeacherFee(snapshot, id);
    if (!t) return { title: '—', subtitle: '—', status: '—', riskHint: '—', chain: [] };
    return {
      title: t.sessionNo,
      subtitle: `${t.teacherName} · ${t.courseName} · ${t.storeName}`,
      status: t.status,
      riskHint: '老师课时费需以完课和到课记录为准，当前待财务确认（前端演示）',
      chain: t.evidenceChain,
    };
  }
  if (type === 'settlement') {
    const x = findFinanceSettlement(snapshot, id);
    if (!x) return { title: '—', subtitle: '—', status: '—', riskHint: '—', chain: [] };
    return {
      title: x.settlementNo,
      subtitle: `${x.memberName} · ${x.consumeStore} → ${x.sellStore}`,
      status: x.status,
      riskHint: x.ruleLabel,
      chain: x.evidenceChain,
    };
  }
  const e = findFinanceExpense(snapshot, id);
  if (!e) return { title: '—', subtitle: '—', status: '—', riskHint: '—', chain: [] };
  return {
    title: e.expenseNo,
    subtitle: `${e.storeName} · ${e.category} · ${formatFinanceDate(e.date)}`,
    status: e.status,
    riskHint: '支出需凭证归档后以银行流水与财务入账为准',
    chain: FINANCE_CHAIN_EXPENSE,
  };
};

export const getFinanceEvidenceChainForType = (type: FinanceEntityType): string[] => {
  switch (type) {
    case 'payment':
      return FINANCE_CHAIN_PAYMENT;
    case 'refund':
      return FINANCE_CHAIN_REFUND;
    case 'consumption':
      return FINANCE_CHAIN_CONSUMPTION;
    case 'teacherFee':
      return FINANCE_CHAIN_TEACHER_FEE;
    case 'settlement':
      return FINANCE_CHAIN_SETTLEMENT;
    case 'expense':
      return FINANCE_CHAIN_EXPENSE;
    default:
      return [];
  }
};

export const getFinanceJudgmentHint = (
  type: FinanceEntityType,
  snapshot: FinanceOperationSnapshot,
  id: string,
): FinanceJudgmentHint => {
  if (type === 'payment') {
    const p = findFinancePayment(snapshot, id);
    const stuck =
      p?.financeStatus === '待合同'
        ? '合同未签，收款暂记预收，不可确认收入'
        : p?.financeStatus === '待资产'
          ? '合同已签但资产未生成，无法跟踪耗课'
          : p?.financeStatus === '金额异常'
            ? '实收与订单/退款申请不一致'
            : p?.financeStatus === '待人工复核'
              ? '模板或金额需财务人工复核'
              : '收款链路完整，可继续跟踪耗课确认收入';
    return {
      principle: '收款不等于收入，需合同/资产/耗课链路完整后才能确认收入',
      stuck,
      nextStep: '先核对合同与资产，再跟踪耗课确认收入；以银行流水与财务入账为准',
    };
  }
  if (type === 'refund') {
    const r = findFinanceRefund(snapshot, id);
    return {
      principle: '退款需同步支付记录、会员资产、预收负债，不支持直接改余额',
      stuck: r?.riskReason && r.riskReason !== '—' ? r.riskReason : '退款审批与资产处理待对齐',
      nextStep: '核对可退金额与资产扣减方案，待财务确认后执行退款路径（前端演示）',
    };
  }
  if (type === 'consumption') {
    const c = findFinanceConsumption(snapshot, id);
    const stuck =
      c?.status === '待确认'
        ? '已完课，耗课记录待财务确认'
        : c?.status === '跨店待结算'
          ? '耗课已发生，跨店结算待确认'
          : c?.status === '异常待处理'
            ? '耗课与资产来源不匹配'
            : '耗课已确认，可计入确认收入';
    return {
      principle: '已完课未耗课确认时，不进入确认收入',
      stuck,
      nextStep: '确认签到与扣点记录后，将金额计入本月确认收入（仅作经营测算）',
    };
  }
  if (type === 'teacherFee') {
    const t = findFinanceTeacherFee(snapshot, id);
    return {
      principle: '老师课时费需以完课和到课记录为准，不以排课为准',
      stuck:
        t?.status === '待生成'
          ? '完课记录已存在，课时费明细待生成'
          : t?.status === '异常'
            ? '到课人数与课型规则不一致'
            : '课时费待财务确认，暂不进入发放队列',
      nextStep: '核对到课人数与课型规则后，标记待发放（前端演示，非真实发放）',
    };
  }
  if (type === 'settlement') {
    const x = findFinanceSettlement(snapshot, id);
    return {
      principle: '跨店结算需以耗课门店、售卡门店和结算规则为准',
      stuck: x?.status === '规则异常' ? '结算规则与产品配置不一致' : '门店间结算金额待双方确认',
      nextStep: '确认结算规则与耗课点数后，进入待结算 / 已结算（前端演示）',
    };
  }
  const e = findFinanceExpense(snapshot, id);
  return {
    principle: '费用支出需凭证归档后进入正式账务',
    stuck:
      e?.voucherStatus === '待凭证'
        ? '付款已完成或待付款，凭证未归档'
        : e?.status === '异常'
          ? '支出类目或金额需财务复核'
          : '支出流程进行中',
    nextStep: '补齐付款凭证并归档，以银行流水与财务入账为准',
  };
};

const sumAmount = (rows: { amount: number }[]) => rows.reduce((s, r) => s + r.amount, 0);

export const computeSegmentMiniSummary = (
  snapshot: FinanceOperationSnapshot,
  segment: FinanceWorkbenchSegment,
): FinanceSegmentMiniStat[] => {
  const { payments, refunds, consumptions, teacherFees, settlements, expenses, report } = snapshot;

  if (segment === 'payments') {
    const todayRows = payments.filter(p => p.payTime.startsWith('2026-05-14'));
    const pendingRows = payments.filter(p => p.financeStatus !== '已核对');
    const abnormal = payments.filter(p => /异常|待人工/.test(p.financeStatus)).length;
    const unlinked = payments.filter(p => /待合同|待资产/.test(p.financeStatus)).length;
    return [
      { label: '今日收款', value: formatFinanceCny(sumAmount(todayRows)), isAmount: true },
      { label: '待核金额', value: formatFinanceCny(sumAmount(pendingRows)), isAmount: true },
      { label: '异常笔数', value: formatFinanceCount(abnormal) },
      { label: '未关联订单', value: formatFinanceCount(unlinked) },
    ];
  }

  if (segment === 'refunds') {
    const applyTotal = sumAmount(refunds.map(r => ({ amount: r.applyAmount })));
    const refundableTotal = sumAmount(refunds.map(r => ({ amount: r.refundableAmount })));
    const pending = refunds.filter(r => /待|申请/.test(r.approvalStatus)).length;
    const assetPending = refunds.filter(r => /待|扣减|作废/.test(r.assetAction) && r.assetAction !== '保留资产').length;
    return [
      { label: '申请退款', value: formatFinanceCny(applyTotal), isAmount: true },
      { label: '可退金额', value: formatFinanceCny(refundableTotal), isAmount: true },
      { label: '待审批', value: formatFinanceCount(pending) },
      { label: '需资产处理', value: formatFinanceCount(assetPending) },
    ];
  }

  if (segment === 'consumption') {
    const pendingRows = consumptions.filter(c => c.status === '待确认');
    const pendingRev = pendingRows.reduce((s, c) => s + c.recognizedRevenue, 0);
    const abnormal = consumptions.filter(c => c.status === '异常待处理').length;
    const cross = consumptions.filter(c => c.status === '跨店待结算').length;
    const unmatched = consumptions.filter(c => /待/.test(c.status)).length;
    return [
      { label: '待确认收入', value: formatFinanceCny(pendingRev), isAmount: true },
      { label: '异常耗课', value: formatFinanceCount(abnormal) },
      { label: '跨店耗课', value: formatFinanceCount(cross) },
      { label: '未匹配资产', value: formatFinanceCount(unmatched) },
    ];
  }

  if (segment === 'teacherFees') {
    const pendingRows = teacherFees.filter(t => /待/.test(t.status));
    const pendingAmt = pendingRows.reduce((s, t) => s + t.feeAmount, 0);
    const abnormal = teacherFees.filter(t => t.status === '异常').length;
    const toPay = teacherFees.filter(t => t.status === '待发放').length;
    const cross = teacherFees.filter(t => t.storeName !== '城西馆' && t.classType === '私教').length;
    return [
      { label: '待核课时费', value: formatFinanceCny(pendingAmt), isAmount: true },
      { label: '异常课时', value: formatFinanceCount(abnormal) },
      { label: '待发放', value: formatFinanceCount(toPay) },
      { label: '跨店老师', value: formatFinanceCount(cross) },
    ];
  }

  if (segment === 'settlements') {
    const pendingAmt = settlements
      .filter(x => /待/.test(x.status))
      .reduce((s, x) => s + x.amount, 0);
    const pendingStores = settlements.filter(x => x.status === '待核对').length;
    const ruleErr = settlements.filter(x => x.status === '规则异常').length;
    const done = settlements.filter(x => x.status === '已结算').length;
    return [
      { label: '待结算金额', value: formatFinanceCny(pendingAmt), isAmount: true },
      { label: '待确认门店', value: formatFinanceCount(pendingStores) },
      { label: '规则异常', value: formatFinanceCount(ruleErr) },
      { label: '已结算', value: formatFinanceCount(done) },
    ];
  }

  if (segment === 'expenses') {
    const monthAmt = sumAmount(expenses);
    const voucherPending = expenses.filter(e => e.voucherStatus === '待凭证').length;
    const payPending = expenses.filter(e => e.payStatus === '待付款').length;
    const abnormal = expenses.filter(e => e.status === '异常').length;
    return [
      { label: '本月支出', value: formatFinanceCny(monthAmt), isAmount: true },
      { label: '待凭证', value: formatFinanceCount(voucherPending) },
      { label: '待付款', value: formatFinanceCount(payPending) },
      { label: '异常支出', value: formatFinanceCount(abnormal) },
    ];
  }

  return [
    { label: '实收', value: formatFinanceCny(report.monthCashIn), isAmount: true },
    { label: '确认收入', value: formatFinanceCny(report.monthRecognized), isAmount: true },
    { label: '支出', value: formatFinanceCny(report.monthExpense), isAmount: true },
    { label: '预收负债', value: formatFinanceCny(report.deferredLiability), isAmount: true },
    { label: '安全垫', value: formatFinanceCny(report.safetyCushion), isAmount: true },
  ];
};
