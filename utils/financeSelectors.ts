import type {
  Attendance,
  Booking,
  Contract,
  Course,
  CourseSession,
  FinanceLedgerEntry,
  Member,
  MemberAsset,
  MockTeacherSessionPayRecord,
  Order,
  Payment,
  Refund,
  Staff,
} from '../types';

const COLLECTED_PAYMENT_STATUSES: Payment['status'][] = ['paid', 'reconciled'];
const PENDING_ORDER_STATUSES: Order['status'][] = ['draft', 'pending_payment', 'paid'];
const PENDING_REFUND_STATUSES: Refund['status'][] = ['requested', 'reviewing', 'approved', 'processing'];

const REFUND_REGISTERED_STATUSES: Refund['status'][] = [
  'requested',
  'reviewing',
  'approved',
  'processing',
  'completed',
];

const ASSET_STILL_SERVICEABLE: MemberAsset['status'][] = ['effective', 'frozen'];

export interface FinanceDateRange {
  start: string;
  end: string;
}

export type FinanceOrderFilter = 'all' | 'card' | 'refund' | 'integral';

export interface FinanceTransactionRow {
  id: string;
  date: string;
  occurredAt: string;
  type: string;
  content: string;
  amount: number;
  customer: string;
  method: string;
  status: string;
  statusTag: string;
  sourceType: 'order' | 'refund';
  orderId: string;
  paymentId?: string;
  refundId?: string;
  ledgerEntryId?: string;
  productTypes: Order['items'][number]['productType'][];
  integral?: number;
  sourceSummary: string;
}

export interface FinancePendingItem {
  id: string;
  tone: 'refund' | 'order';
  title: string;
  description: string;
  actionLabel: string;
  sourceSummary: string;
}

export interface FinanceOverviewSummary {
  cashIncomeTotal: number;
  recognizedIncomeTotal: number;
  refundTotal: number;
  netCashFlow: number;
  endingDeferredRevenue: number;
  orderCount: number;
  paymentCount: number;
  refundCount: number;
  pendingCount: number;
}

export interface FinanceIncomeStructureEntry {
  type: Order['items'][number]['productType'];
  label: string;
  amount: number;
}

export interface FinanceCashFlowPoint {
  label: string;
  cashIncome: number;
  netCashFlow: number;
}

export interface FinanceTargetProgress {
  label: string;
  target: number;
  actual: number;
  progress: number;
  sourceSummary: string;
  isFallbackTarget: boolean;
}

export interface FinanceStaffPerformance {
  id: string;
  name: string;
  role: string;
  target: number;
  actual: number;
  progress: number;
  sourceSummary: string;
  isFallbackTarget: boolean;
}

export interface FinanceExpenseRow {
  id: string;
  date: string;
  category: string;
  amount: number;
  voucherLabel: string;
  sourceSummary: string;
  isFallback: boolean;
}

export interface FinancePayrollRow {
  id: string;
  name: string;
  role: string;
  baseSalary: number;
  classFee: number;
  commission: number;
  deduction: number;
  netPay: number;
  status: string;
  sourceSummary: string;
  isFallback: boolean;
}

export interface FinanceReportSummary {
  cashFlowTrend: FinanceCashFlowPoint[];
  operatingExpenseTotal: number;
  payrollExpenseTotal: number;
  reportExpenseTotal: number;
  targetProgress: {
    annual: FinanceTargetProgress;
    period: FinanceTargetProgress;
  };
  staffPerformance: FinanceStaffPerformance[];
  expenseRows: FinanceExpenseRow[];
  payrollRows: FinancePayrollRow[];
}

const PRODUCT_TYPE_LABELS: Record<Order['items'][number]['productType'], string> = {
  card: '卡项',
  ttc: '教培',
  point: '积分',
  course: '课程',
  custom: '其他',
};

const PAYMENT_METHOD_LABELS: Record<NonNullable<Payment['method']>, string> = {
  cash: '现金',
  card: '银行卡',
  wechat: '微信支付',
  alipay: '支付宝',
  bank_transfer: '银行转账',
  other: '其他',
};

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: '草稿',
  pending_payment: '待支付',
  paid: '已支付',
  fulfilled: '已履约',
  closed: '已关闭',
  cancelled: '已取消',
  partially_refunded: '部分退款',
  refunded: '已退款',
};

const ORDER_STATUS_TAGS: Record<Order['status'], string> = {
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  pending_payment: 'bg-orange-50 text-orange-700 border-orange-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  fulfilled: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-50 text-gray-600 border-gray-200',
  cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
  partially_refunded: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-red-50 text-red-700 border-red-200',
};

const REFUND_STATUS_LABELS: Record<Refund['status'], string> = {
  requested: '已申请',
  reviewing: '审核中',
  approved: '已通过',
  processing: '处理中',
  completed: '已退款',
  rejected: '已拒绝',
  cancelled: '已取消',
};

const REFUND_STATUS_TAGS: Record<Refund['status'], string> = {
  requested: 'bg-orange-50 text-orange-700 border-orange-200',
  reviewing: 'bg-orange-50 text-orange-700 border-orange-200',
  approved: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-red-50 text-red-700 border-red-200',
  rejected: 'bg-gray-50 text-gray-600 border-gray-200',
  cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
};

export const FINANCE_PRODUCT_TYPE_LABELS = PRODUCT_TYPE_LABELS;

const ledgerEntrySourceTypeZh = (t: FinanceLedgerEntry['sourceType']): string => (
  ({
    payment: '订单收款',
    refund: '退款',
    course_consumption: '耗课确认收入',
    payroll: '老师课时费',
    adjustment: '调整项',
  } as const)[t] ?? '来源待核对'
);

const formatDateTime = (iso?: string): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDateOnly = (iso?: string): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getMemberName = (memberId: string, members: Member[]): string => (
  members.find(member => member.id === memberId)?.name ?? `会员 ${memberId}`
);

const getOrderPayment = (orderId: string, payments: Payment[]): Payment | undefined => (
  payments.find(payment => (
    payment.orderId === orderId && COLLECTED_PAYMENT_STATUSES.includes(payment.status)
  )) ?? payments.find(payment => payment.orderId === orderId)
);

const getLedgerEntryForSource = (
  entries: FinanceLedgerEntry[],
  sourceType: FinanceLedgerEntry['sourceType'],
  sourceId: string
): FinanceLedgerEntry | undefined => (
  entries.find(entry => entry.sourceType === sourceType && entry.sourceId === sourceId)
);

const getContractTitle = (order: Order, contracts: Contract[]): string | undefined => (
  order.contractId ? contracts.find(contract => contract.id === order.contractId)?.title : undefined
);

const getOrderContent = (order: Order, contracts: Contract[]): string => {
  const itemNames = order.items.map(item => item.productName).join(' / ');
  const contractTitle = getContractTitle(order, contracts);
  return contractTitle ? `${itemNames} · ${contractTitle}` : itemNames;
};

const getDateOnlyTime = (date: string, endOfDay = false): number => (
  new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}+08:00`).getTime()
);

export const isWithinFinanceDateRange = (
  iso: string | undefined,
  dateRange: FinanceDateRange
): boolean => {
  if (!iso) return false;

  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return false;

  return timestamp >= getDateOnlyTime(dateRange.start) && timestamp <= getDateOnlyTime(dateRange.end, true);
};

export const filterOrdersByDateRange = (
  orders: Order[],
  dateRange: FinanceDateRange
): Order[] => (
  orders.filter(order => isWithinFinanceDateRange(order.createdAt, dateRange))
);

export const filterPaymentsByDateRange = (
  payments: Payment[],
  dateRange: FinanceDateRange
): Payment[] => (
  payments.filter(payment => (
    isWithinFinanceDateRange(payment.paidAt ?? payment.initiatedAt, dateRange)
  ))
);

export const filterRefundsByDateRange = (
  refunds: Refund[],
  dateRange: FinanceDateRange
): Refund[] => (
  refunds.filter(refund => (
    isWithinFinanceDateRange(refund.completedAt ?? refund.approvedAt ?? refund.requestedAt, dateRange)
  ))
);

export const filterLedgerEntriesByDateRange = (
  entries: FinanceLedgerEntry[],
  dateRange: FinanceDateRange
): FinanceLedgerEntry[] => (
  entries.filter(entry => isWithinFinanceDateRange(entry.occurredAt, dateRange))
);

export const sumPayments = (payments: Payment[]): number => (
  payments
    .filter(payment => COLLECTED_PAYMENT_STATUSES.includes(payment.status))
    .reduce((sum, payment) => sum + payment.amount, 0)
);

export const sumRefunds = (
  refunds: Refund[],
  statuses?: Refund['status'][]
): number => (
  refunds
    .filter(refund => !statuses || statuses.includes(refund.status))
    .reduce((sum, refund) => sum + refund.amount, 0)
);

/** 退款金额（入口页口径）：已登记或待核对退款，不含已拒绝/已取消 */
export const sumRegisteredRefunds = (refunds: Refund[]): number => (
  sumRefunds(refunds, REFUND_REGISTERED_STATUSES)
);

export interface ClosedLoopFivePillars {
  /** 实收金额：会员已支付的现金流入 */
  collectedCash: number;
  /** 退款金额：已登记或待核对退款 */
  refundRegistered: number;
  /** 净收款：实收减退款 */
  netCollection: number;
  /** 预收负债：期末预收余额（模块内估算） */
  deferredLiability: number;
  /** 待确认收入：耗课/到课交付侧、尚未接正式总账分录链路的模块内估算 */
  pendingRecognitionIncomeEstimate: number;
}

export const buildClosedLoopFivePillars = ({
  payments,
  refunds,
  ledgerEntries,
  beginningDeferredRevenue,
}: {
  payments: Payment[];
  refunds: Refund[];
  ledgerEntries: FinanceLedgerEntry[];
  beginningDeferredRevenue: number;
}): ClosedLoopFivePillars => {
  const collectedCash = sumPayments(payments);
  const refundRegistered = sumRegisteredRefunds(refunds);
  const recognizedFromLedgerDemo = sumRecognizedIncome(ledgerEntries);
  const deferredLiability = beginningDeferredRevenue + collectedCash - recognizedFromLedgerDemo - refundRegistered;
  const pendingRecognitionIncomeEstimate = ledgerEntries
    .filter(entry => entry.sourceType === 'course_consumption')
    .reduce((sum, entry) => sum + entry.amount, 0);

  return {
    collectedCash,
    refundRegistered,
    netCollection: collectedCash - refundRegistered,
    deferredLiability,
    pendingRecognitionIncomeEstimate,
  };
};

export interface ClosedLoopRefundAssetRiskRow {
  id: string;
  title: string;
  detailLines: string[];
}

const refundIsRegistered = (refund: Refund): boolean => (
  REFUND_REGISTERED_STATUSES.includes(refund.status)
);

const refundIsSettledLike = (refund: Refund): boolean => (
  ['completed', 'processing', 'approved'].includes(refund.status)
);

export const buildClosedLoopRefundAssetRiskRows = ({
  orders,
  payments,
  refunds,
  memberAssets,
  ledgerEntries,
}: {
  orders: Order[];
  payments: Payment[];
  refunds: Refund[];
  memberAssets: MemberAsset[];
  ledgerEntries: FinanceLedgerEntry[];
}): ClosedLoopRefundAssetRiskRow[] => {
  const orderById = new Map(orders.map(order => [order.id, order]));
  const paidAmount = (order: Order): number => order.paidAmount ?? order.totalAmount;

  const rows: ClosedLoopRefundAssetRiskRow[] = [];

  const hitRefundButAssetActive: string[] = [];
  refunds.filter(refundIsSettledLike).forEach(refund => {
    const assets = memberAssets.filter(asset => asset.sourceOrderId === refund.orderId);
    const active = assets.filter(asset => ASSET_STILL_SERVICEABLE.includes(asset.status));
    if (active.length > 0) {
      hitRefundButAssetActive.push(
        `退款登记 ${refund.id}（订单 ${refund.orderId}）后仍存在状态为「${active.map(a => a.status).join('、')}」的资产：${active.map(a => a.name).join('、')}`
      );
    }
  });
  rows.push({
    id: 'risk-refund-asset-active',
    title: '有退款记录但资产仍有效',
    detailLines: hitRefundButAssetActive.length > 0
      ? hitRefundButAssetActive
      : ['当前 mock 未命中此项；仍须在实单中核对退款后资产是否冻结/作废。'],
  });

  const hitPartial: string[] = [];
  orders
    .filter(order => order.status === 'partially_refunded')
    .forEach(order => {
      const rsum = sumRefunds(
        refunds.filter(r => r.orderId === order.id && refundIsRegistered(r)),
      );
      hitPartial.push(
        `订单 ${order.id} 为部分退款态；已登记退款合计 ¥${rsum.toLocaleString('zh-CN')}，实付口径 ¥${paidAmount(order).toLocaleString('zh-CN')}，需核对剩余权益与资产。`
      );
    });
  refunds.forEach(refund => {
    if (!refundIsRegistered(refund)) return;
    const order = orderById.get(refund.orderId);
    if (!order || order.status === 'partially_refunded') return;
    const rsum = sumRefunds(refunds.filter(r => r.orderId === order.id && refundIsRegistered(r)));
    if (rsum > 0 && rsum < paidAmount(order) && refund.status === 'completed') {
      const line = `订单 ${order.id}：已登记退款累计 ¥${rsum.toLocaleString('zh-CN')} 小于实付 ¥${paidAmount(order).toLocaleString('zh-CN')}，需核对剩余权益。`;
      if (!hitPartial.includes(line)) hitPartial.push(line);
    }
  });
  rows.push({
    id: 'risk-partial-refund',
    title: '部分退款需核对剩余权益',
    detailLines: hitPartial.length > 0
      ? hitPartial
      : ['当前 mock 未命中此项；部分退款单仍须逐笔核对课包/卡项剩余。'],
  });

  const hitFull: string[] = [];
  orders.filter(order => order.status === 'refunded').forEach(order => {
    hitFull.push(`订单 ${order.id} 标记为已全额退款，请核对关联资产是否已作废或冲减。`);
  });
  refunds.filter(r => r.status === 'completed').forEach(refund => {
    const order = orderById.get(refund.orderId);
    if (!order) return;
    const rsum = sumRefunds(refunds.filter(r => r.orderId === order.id && r.status === 'completed'));
    if (rsum >= paidAmount(order) && order.status !== 'refunded') {
      hitFull.push(
        `订单 ${order.id}：已登记退款累计 ¥${rsum.toLocaleString('zh-CN')} 已达到或超过实付 ¥${paidAmount(order).toLocaleString('zh-CN')}，需核对资产是否应作废。`
      );
    }
  });
  rows.push({
    id: 'risk-full-refund-asset',
    title: '全额退款需核对资产是否作废',
    detailLines: hitFull.length > 0
      ? hitFull
      : ['当前 mock 未命中此项；全额退款路径须核对资产终止与权益冲减。'],
  });

  const hitUnbound: string[] = [];
  refunds.filter(refundIsRegistered).forEach(refund => {
    const order = orderById.get(refund.orderId);
    const itemHasAsset = order?.items.some(item => Boolean(item.memberAssetId));
    if (itemHasAsset && !refund.memberAssetId) {
      hitUnbound.push(
        `退款登记 ${refund.id}（订单 ${refund.orderId}）未绑定订单行内对应会员资产，建议核对资产处理链路（仅用于经营核对）。`
      );
    }
  });
  rows.push({
    id: 'risk-refund-unbound-asset',
    title: '退款未绑定资产',
    detailLines: hitUnbound.length > 0
      ? hitUnbound
      : ['当前 mock 未命中此项；仍须防范退款单未关联具体资产。'],
  });

  const hitNoLedger: string[] = [];
  refunds.filter(refundIsRegistered).forEach(refund => {
    if (!getLedgerEntryForSource(ledgerEntries, 'refund', refund.id)) {
      hitNoLedger.push(`退款登记 ${refund.id}：列表中无对应演示分录，属待接入真实财务分录 / 待生成正式分录。`);
    }
  });
  payments.filter(payment => COLLECTED_PAYMENT_STATUSES.includes(payment.status)).forEach(payment => {
    if (!getLedgerEntryForSource(ledgerEntries, 'payment', payment.id)) {
      hitNoLedger.push(`收款流水 ${payment.id}：待生成正式分录（待接入真实财务分录）。`);
    }
  });
  rows.push({
    id: 'risk-ledger-not-wired',
    title: '财务分录未接入',
    detailLines: hitNoLedger.length > 0
      ? hitNoLedger
      : ['当前演示数据均已占位；上线后仍须逐笔核对是否已接真实财务分录服务。'],
  });

  return rows;
};

export const sumLedgerByDirection = (
  entries: FinanceLedgerEntry[],
  direction: FinanceLedgerEntry['direction']
): number => (
  entries
    .filter(entry => entry.direction === direction)
    .reduce((sum, entry) => sum + entry.amount, 0)
);

export const sumRecognizedIncome = (entries: FinanceLedgerEntry[]): number => (
  sumLedgerByDirection(entries, 'liability_decrease')
);

export const countOrders = (orders: Order[]): number => orders.length;

export const countPayments = (payments: Payment[]): number => payments.length;

export const countRefunds = (refunds: Refund[]): number => refunds.length;

export const countPendingOrders = (orders: Order[]): number => (
  orders.filter(order => PENDING_ORDER_STATUSES.includes(order.status)).length
);

export const countPendingRefunds = (refunds: Refund[]): number => (
  refunds.filter(refund => PENDING_REFUND_STATUSES.includes(refund.status)).length
);

export const getPendingRefunds = (refunds: Refund[]): Refund[] => (
  refunds.filter(refund => PENDING_REFUND_STATUSES.includes(refund.status))
);

export const getPendingOrders = (orders: Order[]): Order[] => (
  orders.filter(order => PENDING_ORDER_STATUSES.includes(order.status))
);

export const buildFinanceTransactionRows = ({
  orders,
  payments,
  refunds,
  ledgerEntries,
  members,
  contracts,
}: {
  orders: Order[];
  payments: Payment[];
  refunds: Refund[];
  ledgerEntries: FinanceLedgerEntry[];
  members: Member[];
  contracts: Contract[];
}): FinanceTransactionRow[] => {
  const toOrderRow = (order: Order): FinanceTransactionRow => {
    const payment = getOrderPayment(order.id, payments);
    const ledgerEntry = payment
      ? getLedgerEntryForSource(ledgerEntries, 'payment', payment.id)
      : undefined;
    const productTypes = order.items.map(item => item.productType);
    const primaryProductType = productTypes[0] ?? 'custom';
    const occurredAt = payment?.paidAt ?? order.createdAt;

    return {
      id: order.id,
      date: formatDateTime(occurredAt),
      occurredAt,
      type: PRODUCT_TYPE_LABELS[primaryProductType],
      content: getOrderContent(order, contracts),
      amount: order.paidAmount ?? order.totalAmount,
      customer: getMemberName(order.memberId, members),
      method: payment?.method ? PAYMENT_METHOD_LABELS[payment.method] : '未支付',
      status: ORDER_STATUS_LABELS[order.status],
      statusTag: ORDER_STATUS_TAGS[order.status],
      sourceType: 'order',
      orderId: order.id,
      paymentId: payment?.id,
      ledgerEntryId: ledgerEntry?.id,
      productTypes,
      sourceSummary: payment
        ? `订单 ${order.id} → 收款流水 ${payment.id}${ledgerEntry ? ` → 分录占位 ${ledgerEntry.id}` : ' → 待生成正式分录（待接入真实财务分录）'}`
        : `订单 ${order.id} → 待核对收款（仅用于经营核对）`,
    };
  };

  const toRefundRow = (refund: Refund): FinanceTransactionRow => {
    const order = orders.find(item => item.id === refund.orderId);
    const payment = refund.paymentId
      ? payments.find(item => item.id === refund.paymentId)
      : getOrderPayment(refund.orderId, payments);
    const ledgerEntry = getLedgerEntryForSource(ledgerEntries, 'refund', refund.id);
    const productTypes = order?.items.map(item => item.productType) ?? [];
    const occurredAt = refund.completedAt ?? refund.approvedAt ?? refund.requestedAt;
    const content = order
      ? `${getOrderContent(order, contracts)}${refund.reason ? ` · ${refund.reason}` : ''}`
      : refund.reason ?? '订单退款';

    return {
      id: refund.id,
      date: formatDateTime(occurredAt),
      occurredAt,
      type: '退款',
      content,
      amount: -refund.amount,
      customer: getMemberName(refund.memberId, members),
      method: payment?.method ? `${PAYMENT_METHOD_LABELS[payment.method]}退款` : '原路返回',
      status: REFUND_STATUS_LABELS[refund.status],
      statusTag: REFUND_STATUS_TAGS[refund.status],
      sourceType: 'refund',
      orderId: refund.orderId,
      paymentId: payment?.id,
      refundId: refund.id,
      ledgerEntryId: ledgerEntry?.id,
      productTypes,
      sourceSummary: `退款登记 ${refund.id} → 订单 ${refund.orderId}${ledgerEntry ? ` → 分录占位 ${ledgerEntry.id}` : ' → 待生成正式分录（待接入真实财务分录）'}`,
    };
  };

  return [
    ...orders.map(toOrderRow),
    ...refunds.map(toRefundRow),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
};

export const filterFinanceTransactionRows = (
  rows: FinanceTransactionRow[],
  orderFilter: FinanceOrderFilter
): FinanceTransactionRow[] => {
  if (orderFilter === 'all') return rows;
  if (orderFilter === 'refund') return rows.filter(row => row.sourceType === 'refund');
  if (orderFilter === 'integral') return rows.filter(row => row.productTypes.includes('point') || row.integral);
  if (orderFilter === 'card') {
    return rows.filter(row => (
      row.sourceType === 'order' &&
      row.productTypes.some(type => type === 'card' || type === 'course' || type === 'ttc')
    ));
  }
  return rows;
};

export const buildFinancePendingItems = ({
  orders,
  refunds,
  members,
}: {
  orders: Order[];
  refunds: Refund[];
  members: Member[];
}): FinancePendingItem[] => [
  ...getPendingRefunds(refunds).map(refund => ({
    id: refund.id,
    tone: 'refund' as const,
    title: '待处理退款申请',
    description: `¥${refund.amount.toLocaleString()}, ${getMemberName(refund.memberId, members)}`,
    actionLabel: refund.status === 'requested' || refund.status === 'reviewing' ? '去审核' : '去处理',
    sourceSummary: `退款登记 ${refund.id} → 订单 ${refund.orderId}`,
  })),
  ...getPendingOrders(orders).map(order => ({
    id: order.id,
    tone: 'order' as const,
    title: order.status === 'pending_payment' ? '待核对收款订单（仅用于经营核对）' : '待处理订单',
    description: `¥${(order.paidAmount ?? order.totalAmount).toLocaleString()}, ${getMemberName(order.memberId, members)}`,
    actionLabel: order.status === 'pending_payment' ? '去核对' : '去处理',
    sourceSummary: `订单 ${order.id} → ${order.contractId ?? '未绑定合同'}`,
  })),
];

export const buildFinanceOverviewSummary = ({
  orders,
  payments,
  refunds,
  ledgerEntries,
  beginningDeferredRevenue,
}: {
  orders: Order[];
  payments: Payment[];
  refunds: Refund[];
  ledgerEntries: FinanceLedgerEntry[];
  beginningDeferredRevenue: number;
}): FinanceOverviewSummary => {
  const cashIncomeTotal = sumPayments(payments);
  const recognizedIncomeTotal = sumRecognizedIncome(ledgerEntries);
  const refundTotal = sumRegisteredRefunds(refunds);
  const endingDeferredRevenue = beginningDeferredRevenue + cashIncomeTotal - recognizedIncomeTotal - refundTotal;
  const pendingCount = countPendingOrders(orders) + countPendingRefunds(refunds);

  return {
    cashIncomeTotal,
    recognizedIncomeTotal,
    refundTotal,
    netCashFlow: cashIncomeTotal - refundTotal,
    endingDeferredRevenue,
    orderCount: countOrders(orders),
    paymentCount: countPayments(payments),
    refundCount: countRefunds(refunds),
    pendingCount,
  };
};

export const buildFinanceIncomeStructure = (orders: Order[]): FinanceIncomeStructureEntry[] => {
  const incomeByProductType: Record<Order['items'][number]['productType'], number> = {
    card: 0,
    ttc: 0,
    point: 0,
    course: 0,
    custom: 0,
  };

  orders.forEach(order => {
    const paidAmount = order.paidAmount ?? order.totalAmount;
    order.items.forEach(item => {
      const itemRatio = order.totalAmount > 0 ? item.totalAmount / order.totalAmount : 0;
      incomeByProductType[item.productType] += paidAmount * itemRatio;
    });
  });

  return (Object.keys(incomeByProductType) as Array<Order['items'][number]['productType']>)
    .map(type => ({
      type,
      label: PRODUCT_TYPE_LABELS[type],
      amount: incomeByProductType[type],
    }))
    .filter(entry => entry.amount > 0);
};

const getPaymentTime = (payment: Payment): string | undefined => payment.paidAt ?? payment.initiatedAt;

const getRefundTime = (refund: Refund): string => refund.completedAt ?? refund.approvedAt ?? refund.requestedAt;

const getProgress = (actual: number, target: number): number => (
  target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
);

const getNetCashFlowForDate = (
  date: string,
  payments: Payment[],
  refunds: Refund[]
): { cashIncome: number; netCashFlow: number } => {
  const dailyPayments = payments.filter(payment => formatDateOnly(getPaymentTime(payment)) === date);
  const dailyRefunds = refunds.filter(refund => formatDateOnly(getRefundTime(refund)) === date);
  const cashIncome = sumPayments(dailyPayments);
  const refundTotal = sumRegisteredRefunds(dailyRefunds);

  return {
    cashIncome,
    netCashFlow: cashIncome - refundTotal,
  };
};

export const buildFinanceCashFlowTrend = ({
  payments,
  refunds,
  dateRange,
}: {
  payments: Payment[];
  refunds: Refund[];
  dateRange: FinanceDateRange;
}): FinanceCashFlowPoint[] => {
  const dates = Array.from(new Set([
    ...payments.map(payment => formatDateOnly(getPaymentTime(payment))),
    ...refunds.map(refund => formatDateOnly(getRefundTime(refund))),
  ])).filter(date => date !== '-' && isWithinFinanceDateRange(`${date}T12:00:00+08:00`, dateRange));

  const labels = dates.length > 0
    ? dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    : [dateRange.start, dateRange.end];

  return labels.map(date => ({
    label: date.slice(5),
    ...getNetCashFlowForDate(date, payments, refunds),
  }));
};

export const buildFinanceExpenseRows = (ledgerEntries: FinanceLedgerEntry[]): FinanceExpenseRow[] => {
  const expenseEntries = ledgerEntries.filter(entry => entry.direction === 'expense');

  if (expenseEntries.length > 0) {
    return expenseEntries.map(entry => ({
      id: entry.id,
      date: formatDateOnly(entry.occurredAt),
      category: entry.sourceType === 'payroll' ? '薪酬支出' : entry.sourceType === 'refund' ? '退款支出' : '运营支出',
      amount: entry.amount,
      voucherLabel: entry.sourceId,
      sourceSummary: `分录占位 ${entry.id} → ${ledgerEntrySourceTypeZh(entry.sourceType)} · 标识 ${entry.sourceId}`,
      isFallback: false,
    }));
  }

  return [
    {
      id: 'expense-fallback-rent',
      date: '演示周期',
      category: '房租水电',
      amount: 85000,
      voucherLabel: '估算',
      sourceSummary: '模块内估算：费用分录待接入真实财务分录（待生成正式分录）',
      isFallback: true,
    },
    {
      id: 'expense-fallback-marketing',
      date: '演示周期',
      category: '市场推广',
      amount: 12000,
      voucherLabel: '估算',
      sourceSummary: '模块内估算：费用分录待接入真实财务分录（待生成正式分录）',
      isFallback: true,
    },
  ];
};

export const buildFinancePayrollRows = (ledgerEntries: FinanceLedgerEntry[]): FinancePayrollRow[] => {
  const payrollEntries = ledgerEntries.filter(entry => entry.sourceType === 'payroll');

  if (payrollEntries.length > 0) {
    return payrollEntries.map(entry => ({
      id: entry.id,
      name: entry.createdBy ?? '员工',
      role: '薪酬对象',
      baseSalary: 0,
      classFee: 0,
      commission: entry.amount,
      deduction: 0,
      netPay: entry.amount,
      status: '待核对（演示）',
      sourceSummary: `分录占位 ${entry.id} → 薪酬侧标识 ${entry.sourceId}`,
      isFallback: false,
    }));
  }

  return [
    {
      id: 'payroll-fallback-sarah',
      name: 'Sarah',
      role: '教学总监',
      baseSalary: 8000,
      classFee: 12500,
      commission: 2000,
      deduction: 1500,
      netPay: 21000,
      status: '待核对（演示）',
      sourceSummary: '模块内估算：薪酬分录待接入真实财务分录（待生成正式分录）',
      isFallback: true,
    },
  ];
};

export const buildFinanceStaffPerformance = ({
  orders,
  payments,
  staffTargets,
}: {
  orders: Order[];
  payments: Payment[];
  staffTargets: Array<{ id: string; name: string; role: string; target: number }>;
}): FinanceStaffPerformance[] => (
  staffTargets.map(staff => {
    const staffOrderIds = orders
      .filter(order => order.salesId === staff.id)
      .map(order => order.id);
    const actual = sumPayments(payments.filter(payment => staffOrderIds.includes(payment.orderId)));

    return {
      ...staff,
      actual,
      progress: getProgress(actual, staff.target),
      sourceSummary: staffOrderIds.length > 0
        ? `订单 ${staffOrderIds.join('、')} → 对应收款流水（模块内估算）`
        : '估算：当前周期暂无销售订单',
      isFallbackTarget: true,
    };
  })
);

export const buildFinanceReportSummary = ({
  periodOrders,
  periodPayments,
  periodRefunds,
  periodLedgerEntries,
  annualPayments,
  annualRefunds,
  dateRange,
  annualTarget,
  periodTarget,
  staffTargets,
}: {
  periodOrders: Order[];
  periodPayments: Payment[];
  periodRefunds: Refund[];
  periodLedgerEntries: FinanceLedgerEntry[];
  annualPayments: Payment[];
  annualRefunds: Refund[];
  dateRange: FinanceDateRange;
  annualTarget: number;
  periodTarget: number;
  staffTargets: Array<{ id: string; name: string; role: string; target: number }>;
}): FinanceReportSummary => {
  const expenseRows = buildFinanceExpenseRows(periodLedgerEntries);
  const payrollRows = buildFinancePayrollRows(periodLedgerEntries);
  const operatingExpenseTotal = expenseRows.reduce((sum, row) => sum + row.amount, 0);
  const payrollExpenseTotal = payrollRows.reduce((sum, row) => sum + row.netPay, 0);
  const periodCashIncome = sumPayments(periodPayments);
  const periodRefundTotal = sumRegisteredRefunds(periodRefunds);
  const annualActual = sumPayments(annualPayments) - sumRegisteredRefunds(annualRefunds);
  const periodActual = periodCashIncome - periodRefundTotal;

  return {
    cashFlowTrend: buildFinanceCashFlowTrend({
      payments: periodPayments,
      refunds: periodRefunds,
      dateRange,
    }),
    operatingExpenseTotal,
    payrollExpenseTotal,
    reportExpenseTotal: operatingExpenseTotal + payrollExpenseTotal,
    targetProgress: {
      annual: {
        label: '年度业绩目标 (YTD)',
        target: annualTarget,
        actual: annualActual,
        progress: getProgress(annualActual, annualTarget),
        sourceSummary: '年度完成额 = 本年度实收减退款（模块内估算）；目标为门店配置估算',
        isFallbackTarget: true,
      },
      period: {
        label: '查询区间目标',
        target: periodTarget,
        actual: periodActual,
        progress: getProgress(periodActual, periodTarget),
        sourceSummary: '区间完成额 = 查询区间实收减退款（模块内估算）；目标为门店配置估算',
        isFallbackTarget: true,
      },
    },
    staffPerformance: buildFinanceStaffPerformance({
      orders: periodOrders,
      payments: periodPayments,
      staffTargets,
    }),
    expenseRows,
    payrollRows,
  };
};

const CONTRACT_STATUS_LABELS: Record<Contract['status'], string> = {
  draft: '草稿',
  pending_signature: '待签署',
  signed: '已签署',
  effective: '生效中',
  voided: '已作废',
  expired: '已过期',
  terminated: '已终止',
};

const ATTENDANCE_STATUS_LABELS: Record<Attendance['status'], string> = {
  pending_checkin: '待签到',
  checked_in: '已签到',
  attended: '已到课',
  consumed: '已消课',
  absent: '缺席',
};

const SESSION_STATUS_LABELS: Record<NonNullable<CourseSession['status']>, string> = {
  draft: '草稿',
  scheduled: '已排期',
  published: '已发布',
  in_progress: '进行中',
  completed: '已结束',
  cancelled: '已取消',
  rescheduled: '已改期',
};

const formatAssetEquityProgress = (asset: MemberAsset): string => {
  const total = asset.totalAmount ?? 0;
  const remaining = asset.remainingAmount ?? 0;
  if (total <= 0) return '权益总量未配置（仅用于经营核对）';
  const consumed = Math.max(0, total - remaining);
  const unit: Record<MemberAsset['balanceType'], string> = {
    time: '天',
    count: '次',
    value: '额度',
    points: '点',
    course: '节',
  };
  return `已消耗 ${consumed} / 共 ${total} ${unit[asset.balanceType] ?? ''}（模块内估算）`;
};

const formatRemainingEquityShort = (asset: MemberAsset): string => {
  const r = asset.remainingAmount ?? 0;
  const unit: Record<MemberAsset['balanceType'], string> = {
    time: '天',
    count: '次',
    value: '额度',
    points: '点',
    course: '节',
  };
  return `剩余 ${r} ${unit[asset.balanceType] ?? ''}（模块内估算）`.trim();
};

const getOrderItemForAsset = (order: Order, asset: MemberAsset): Order['items'][number] | undefined => (
  order.items.find(item => item.memberAssetId === asset.id) ?? order.items[0]
);

const allocatePaidToItem = (order: Order, item: Order['items'][number] | undefined): number => {
  const paid = order.paidAmount ?? order.totalAmount;
  if (!item || order.totalAmount <= 0) return paid;
  return paid * (item.totalAmount / order.totalAmount);
};

const sumLedgerConsumptionForOrder = (orderId: Order['id'], ledgerEntries: FinanceLedgerEntry[]): number => (
  ledgerEntries
    .filter(entry => entry.sourceType === 'course_consumption' && entry.orderId === orderId)
    .reduce((sum, entry) => sum + entry.amount, 0)
);

export interface FinanceDeferredLiabilityDetailRow {
  id: string;
  memberName: string;
  orderId: string;
  productSummary: string;
  contractStatusLabel: string;
  collectedAmount: number;
  consumedSummary: string;
  consumedAmountEstimate: number;
  remainingEquitySummary: string;
  deferredLiabilityBalanceEstimate: number;
  riskHints: string[];
}

export const buildFinanceDeferredLiabilityDetailRows = ({
  orders,
  contracts,
  members,
  memberAssets,
  ledgerEntries,
  refunds,
}: {
  orders: Order[];
  contracts: Contract[];
  members: Member[];
  memberAssets: MemberAsset[];
  ledgerEntries: FinanceLedgerEntry[];
  refunds: Refund[];
}): FinanceDeferredLiabilityDetailRow[] => {
  const orderById = new Map(orders.map(order => [order.id, order]));
  const contractByOrderId = new Map<string, Contract>();
  contracts.forEach(contract => {
    if (contract.orderId) contractByOrderId.set(contract.orderId, contract);
  });

  return memberAssets
    .filter(asset => Boolean(asset.sourceOrderId))
    .map(asset => {
      const order = asset.sourceOrderId ? orderById.get(asset.sourceOrderId) : undefined;
      if (!order) {
        return null;
      }

      const item = getOrderItemForAsset(order, asset);
      const collectedAmount = allocatePaidToItem(order, item);
      const total = asset.totalAmount ?? 0;
      const remaining = asset.remainingAmount ?? 0;
      const consumedRatio = total > 0 ? Math.min(1, Math.max(0, (total - remaining) / total)) : 0;
      const ledgerConsumed = sumLedgerConsumptionForOrder(order.id, ledgerEntries);
      const consumedMoneyEstimate = collectedAmount * consumedRatio;

      const consumedSummaryParts = [formatAssetEquityProgress(asset)];
      if (ledgerConsumed > 0) {
        consumedSummaryParts.push(`分录侧耗课累计 ¥${ledgerConsumed.toLocaleString('zh-CN')}（模块内估算）`);
      }

      const deferredLiabilityBalanceEstimate = Math.max(0, collectedAmount * (total > 0 ? remaining / total : 0));

      const contract =
        (order.contractId ? contracts.find(c => c.id === order.contractId) : undefined)
        ?? contractByOrderId.get(order.id);

      const contractStatusLabel = contract
        ? CONTRACT_STATUS_LABELS[contract.status]
        : '未绑定合同';

      const productSummary = `${item?.productName ?? '—'}（订单 ${order.id}）`;

      const riskHints: string[] = [];
      if (!contract) riskHints.push('合同未绑定：预收负债口径待核对');
      if (asset.status === 'frozen') riskHints.push('资产冻结中：履约与退款路径需核对');
      if (asset.status === 'expired' || asset.status === 'used_up') riskHints.push('资产已过期或已用尽：预收负债与待确认收入边界需核对');
      if (order.status === 'partially_refunded') riskHints.push('订单存在部分退款登记：剩余权益与预收负债需逐项核对');
      if (order.status === 'refunded') riskHints.push('订单已标记退款完成：资产是否作废需核对');
      if (refunds.some(r => r.orderId === order.id && ['requested', 'reviewing', 'approved', 'processing'].includes(r.status))) {
        riskHints.push('存在处理中退款：权益冲减与分录待接入真实财务分录');
      }

      return {
        id: asset.id,
        memberName: getMemberName(asset.memberId, members),
        orderId: order.id,
        productSummary,
        contractStatusLabel,
        collectedAmount,
        consumedSummary: consumedSummaryParts.join('；'),
        consumedAmountEstimate: consumedMoneyEstimate,
        remainingEquitySummary: formatRemainingEquityShort(asset),
        deferredLiabilityBalanceEstimate,
        riskHints: riskHints.length > 0 ? riskHints : ['暂无明显冲突标记；仍建议例行核对'],
      };
    })
    .filter((row): row is FinanceDeferredLiabilityDetailRow => row !== null);
};

export interface FinancePendingRecognitionDetailRow {
  id: string;
  sessionTitle: string;
  sessionTimeLabel: string;
  sessionStatusLabel: string;
  memberSummary: string;
  headcountSummary: string;
  teacherLabel: string;
  consumptionAmountEstimate: number;
  attendanceStatusSummary: string;
  formalLedgerStatusText: string;
  riskHints: string[];
}

const getTeacherLabel = (session: CourseSession, staffList: Staff[]): string => {
  if (session.teacherName?.trim()) return session.teacherName.trim();
  const sid = session.teacherId?.trim();
  if (!sid) return '—';
  const staff = staffList.find(s => String(s.id) === sid);
  return staff?.name ?? `老师 ${sid}`;
};

export const buildFinancePendingRecognitionDetailRows = ({
  attendances,
  bookings,
  courseSessions,
  members,
  staffList,
  ledgerEntries,
}: {
  attendances: Attendance[];
  bookings: Booking[];
  courseSessions: CourseSession[];
  members: Member[];
  staffList: Staff[];
  ledgerEntries: FinanceLedgerEntry[];
}): FinancePendingRecognitionDetailRow[] => {
  const sessionIds = new Set([
    ...attendances.map(a => a.courseSessionId),
    ...bookings.map(b => b.courseSessionId),
  ]);

  const sessionById = new Map(courseSessions.map(s => [s.id, s]));

  return [...sessionIds].map(sessionId => {
    const session = sessionById.get(sessionId);
    if (!session) return null;

    const atts = attendances.filter(a => a.courseSessionId === sessionId);
    const books = bookings.filter(b => b.courseSessionId === sessionId);

    const memberNames = new Map<string, string>();
    atts.forEach(a => {
      memberNames.set(a.memberId, getMemberName(a.memberId, members));
    });
    books.forEach(b => {
      if (!memberNames.has(b.memberId)) {
        memberNames.set(b.memberId, getMemberName(b.memberId, members));
      }
    });

    const memberSummary = [...memberNames.values()].join('、') || '—';
    const headcountSummary = `约课 ${books.length} 条 · 到课记录 ${atts.length} 条（模块内估算）`;

    const attStatusParts = atts.map(a => ATTENDANCE_STATUS_LABELS[a.status]);
    const attendanceStatusSummary = attStatusParts.length > 0
      ? attStatusParts.join(' / ')
      : (books.length > 0 ? '已约课，未到课/未消课（待确认 / 模块内估算）' : '—');

    const ledgerForSession = ledgerEntries.filter(entry => {
      if (entry.sourceType !== 'course_consumption') return false;
      return entry.courseSessionId === sessionId || atts.some(a => a.id === entry.sourceId);
    });
    const ledgerUnique = [...new Map(ledgerForSession.map(e => [e.id, e])).values()];
    const ledgerAmount = ledgerUnique.reduce((s, e) => s + e.amount, 0);
    const hasDemoLedger = ledgerUnique.length > 0;
    const hasConsumed = atts.some(a => a.status === 'consumed');

    let consumptionAmountEstimate = ledgerAmount;
    if (!hasDemoLedger && hasConsumed && typeof session.price === 'number') {
      consumptionAmountEstimate = session.price;
    }

    let formalLedgerStatusText: string;
    if (hasDemoLedger) {
      formalLedgerStatusText = '演示分录已占位；仍待生成正式分录、待接入真实财务分录';
    } else if (hasConsumed) {
      formalLedgerStatusText = '待生成正式分录（模块内估算）';
    } else {
      formalLedgerStatusText = '尚无消课事实；待确认 / 模块内估算';
    }

    const riskHints: string[] = [];
    if (books.some(b => b.status === 'late_cancelled')) riskHints.push('存在临期取消：待确认收入与课耗口径需核对');
    if (session.status === 'cancelled') riskHints.push('场次已取消：不应再计提待确认收入（模块内估算）');
    if (!hasDemoLedger && hasConsumed) riskHints.push('已消课但无演示分录占位：待接入真实财务分录');
    if (atts.some(a => a.status === 'pending_checkin')) riskHints.push('存在待签到：交付未完成，预收负债仍可能成立');

    return {
      id: sessionId,
      sessionTitle: session.title ?? session.id,
      sessionTimeLabel: `${formatDateTime(session.startAt)} ~ ${formatDateOnly(session.endAt)}`,
      sessionStatusLabel: session.status ? SESSION_STATUS_LABELS[session.status] : '—',
      memberSummary,
      headcountSummary,
      teacherLabel: getTeacherLabel(session, staffList),
      consumptionAmountEstimate,
      attendanceStatusSummary,
      formalLedgerStatusText,
      riskHints: riskHints.length > 0 ? riskHints : ['暂无明显冲突标记；仍建议例行核对'],
    };
  }).filter((row): row is FinancePendingRecognitionDetailRow => row !== null);
};

const COURSE_TYPE_LABELS: Record<Course['type'], string> = {
  group: '团课',
  small_group: '小班',
  private: '私教',
  workshop: '工作坊',
  ttc: '教培',
};

const LEDGER_PENDING_SOURCE_TYPE_LABELS: Record<FinanceLedgerEntry['sourceType'], string> = {
  payment: ledgerEntrySourceTypeZh('payment'),
  refund: ledgerEntrySourceTypeZh('refund'),
  course_consumption: ledgerEntrySourceTypeZh('course_consumption'),
  payroll: ledgerEntrySourceTypeZh('payroll'),
  adjustment: ledgerEntrySourceTypeZh('adjustment'),
};

const headcountAttendedStatuses: Attendance['status'][] = ['consumed', 'attended', 'checked_in'];

export interface FinanceTeacherSessionPayCheckRow {
  id: string;
  teacherName: string;
  sessionTitle: string;
  sessionId: string;
  sessionTimeLabel: string;
  courseTypeLabel: string;
  headcountSummary: string;
  ruleOrEstimateSummary: string;
  amount: number;
  statusLabel: string;
  riskHints: string[];
}

export const buildFinanceTeacherSessionPayCheckRows = ({
  teacherChecks,
  courseSessions,
  courses,
  attendances,
  bookings,
}: {
  teacherChecks: MockTeacherSessionPayRecord[];
  courseSessions: CourseSession[];
  courses: Course[];
  attendances: Attendance[];
  bookings: Booking[];
}): FinanceTeacherSessionPayCheckRow[] => {
  const sessionById = new Map(courseSessions.map(s => [s.id, s]));
  const courseById = new Map(courses.map(c => [c.id, c]));

  return teacherChecks.map(row => {
    const session = sessionById.get(row.courseSessionId);
    const course = session ? courseById.get(session.courseId) : undefined;
    const typeLabel = row.courseTypeLabel?.trim()
      ? row.courseTypeLabel
      : (course ? `${COURSE_TYPE_LABELS[course.type] ?? String(course.type)} · ${course.name}` : '—');

    const attended = attendances.filter(
      a => a.courseSessionId === row.courseSessionId && headcountAttendedStatuses.includes(a.status)
    ).length;
    const booked = bookings.filter(
      b => b.courseSessionId === row.courseSessionId && b.status === 'booked'
    ).length;
    const headcountSummary = `到课/签到侧 ${attended} 人 · 有效约课 ${booked} 条（模块内估算）`;

    const riskHints: string[] = [];
    if (session?.status === 'cancelled') riskHints.push('场次已取消：课时费与分录口径待核对');
    if ((row.amount ?? 0) <= 0) riskHints.push('金额为 0 或缺失：待核对');
    if (!session) riskHints.push('找不到对应场次：排课与财务对齐待核对');

    return {
      id: row.id,
      teacherName: row.teacherName ?? '—',
      sessionTitle: session?.title ?? row.courseSessionId,
      sessionId: row.courseSessionId,
      sessionTimeLabel: session ? `${formatDateTime(session.startAt)} 起` : '—',
      courseTypeLabel: typeLabel,
      headcountSummary,
      ruleOrEstimateSummary: '门店老师课时规则未接入本页：按场次与到课人数做模块内估算；不生成工资单；不视为费用已闭合；后续需接入老师课时费规则和正式结算流程。',
      amount: row.amount ?? 0,
      statusLabel: '待核对（模块内估算）',
      riskHints: riskHints.length > 0 ? riskHints : ['暂无明显异常；仍建议例行核对'],
    };
  });
};

export interface FinanceLedgerPendingWireRow {
  id: string;
  sourceTypeLabel: string;
  sourceObjectSummary: string;
  amount: number;
  directionHint: string;
  currentStatusText: string;
  pendingFormalEntryNote: string;
  riskHints: string[];
}

const ledgerDirectionHint = (d: FinanceLedgerEntry['direction']): string => {
  const map: Record<FinanceLedgerEntry['direction'], string> = {
    income: '资金流入侧（待接入分录口径）',
    expense: '资金流出侧（待接入分录口径）',
    liability_increase: '预收负债增加侧',
    liability_decrease: '履约 / 负债减少侧',
  };
  return map[d] ?? '—';
};

export const buildFinanceLedgerPendingIntegrationRows = ({
  ledgerEntries,
  payments,
  refunds,
}: {
  ledgerEntries: FinanceLedgerEntry[];
  payments: Payment[];
  refunds: Refund[];
}): FinanceLedgerPendingWireRow[] => {
  const fromLedger: FinanceLedgerPendingWireRow[] = ledgerEntries.map(entry => {
    const parts: string[] = [];
    if (entry.orderId) parts.push(`订单 ${entry.orderId}`);
    if (entry.memberId) parts.push(`会员 ${entry.memberId}`);
    if (entry.courseSessionId) parts.push(`场次 ${entry.courseSessionId}`);
    parts.push(`关联标识 ${entry.sourceId}`);

    return {
      id: `ledger-wire-${entry.id}`,
      sourceTypeLabel: LEDGER_PENDING_SOURCE_TYPE_LABELS[entry.sourceType],
      sourceObjectSummary: parts.join(' · '),
      amount: entry.amount,
      directionHint: ledgerDirectionHint(entry.direction),
      currentStatusText: '列表占位；待核对（模块内估算）',
      pendingFormalEntryNote: '待生成正式分录；待接入真实财务分录服务',
      riskHints: [
        '当前未生成可在总账直接核对的正式分录；仅用于经营核对',
        '演示数据与真实服务口径可能不一致：待接入真实财务分录服务',
      ],
    };
  });

  const gapCollections: FinanceLedgerPendingWireRow[] = payments
    .filter(payment => COLLECTED_PAYMENT_STATUSES.includes(payment.status))
    .filter(payment => !ledgerEntries.some(
      entry => entry.sourceType === 'payment' && entry.sourceId === payment.id
    ))
    .map(payment => ({
      id: `gap-collection-${payment.id}`,
      sourceTypeLabel: '订单收款',
      sourceObjectSummary: `订单 ${payment.orderId} · 流水标识 ${payment.id}`,
      amount: payment.amount,
      directionHint: '资金流入侧（待接入分录口径）',
      currentStatusText: '尚未在列表占位；待核对（模块内估算）',
      pendingFormalEntryNote: '待生成正式分录；待接入真实财务分录服务',
      riskHints: [
        '业务侧已收款但未见对齐的分录占位：待接入真实财务分录服务',
        '仅用于经营核对',
      ],
    }));

  const gapRefunds: FinanceLedgerPendingWireRow[] = refunds
    .filter(refund => REFUND_REGISTERED_STATUSES.includes(refund.status))
    .filter(refund => !ledgerEntries.some(
      entry => entry.sourceType === 'refund' && entry.sourceId === refund.id
    ))
    .map(refund => ({
      id: `gap-refund-${refund.id}`,
      sourceTypeLabel: '退款',
      sourceObjectSummary: `订单 ${refund.orderId} · 业务标识 ${refund.id}`,
      amount: refund.amount,
      directionHint: '资金流出侧（待接入分录口径）',
      currentStatusText: '尚未在列表占位；待核对（模块内估算）',
      pendingFormalEntryNote: '待生成正式分录；待接入真实财务分录服务',
      riskHints: [
        '业务侧已登记退款但未见对齐的分录占位：待接入真实财务分录服务',
        '仅用于经营核对',
      ],
    }));

  return [...fromLedger, ...gapCollections, ...gapRefunds];
};

const REFUND_ASSET_HANDLE_SUMMARY = (
  t: Refund['assetHandleType'] | undefined
): string => {
  if (!t) return '未登记资产处理方式（待核对）';
  const map: Record<NonNullable<Refund['assetHandleType']>, string> = {
    void_asset: '计划作废资产（仅登记，待核对）',
    reduce_balance: '计划冲减余额（仅登记，待核对）',
    freeze_asset: '计划冻结资产（仅登记，待核对）',
    keep_asset: '登记为保留资产（待核对）',
    manual_review: '待人工复核处理方式（待核对）',
  };
  return map[t] ?? '未登记资产处理方式（待核对）';
};

const MEMBER_ASSET_STATUS_ZH: Record<MemberAsset['status'], string> = {
  inactive: '未激活',
  effective: '有效',
  frozen: '冻结',
  expired: '已过期',
  used_up: '已用尽',
  transferred: '已转卡',
  upgraded: '已升级',
  cancelled: '已取消',
};

const formatOrderAssetsForRefund = (
  orderId: string,
  memberAssets: MemberAsset[]
): string => {
  const assets = memberAssets.filter(a => a.sourceOrderId === orderId);
  if (assets.length === 0) return '无关联会员资产登记（待核对）';
  return assets
    .map(a => `${a.name}（${MEMBER_ASSET_STATUS_ZH[a.status] ?? a.status}）`)
    .join('；');
};

export interface FinanceRefundReconciliationRow {
  id: string;
  refundRecordSummary: string;
  relatedOrderId: string;
  relatedMemberName: string;
  relatedAssetsSummary: string;
  refundAmount: number;
  refundStatusLabel: string;
  assetHandleSummary: string;
  assetBoundLabel: string;
  ledgerPendingLabel: string;
  riskHints: string[];
}

export const buildFinanceRefundReconciliationRows = ({
  refunds,
  orders,
  members,
  memberAssets,
  ledgerEntries,
}: {
  refunds: Refund[];
  orders: Order[];
  members: Member[];
  memberAssets: MemberAsset[];
  ledgerEntries: FinanceLedgerEntry[];
}): FinanceRefundReconciliationRow[] => {
  const orderById = new Map(orders.map(o => [o.id, o]));

  return refunds.map(refund => {
    const order = orderById.get(refund.orderId);
    const assetsOnOrder = memberAssets.filter(a => a.sourceOrderId === refund.orderId);
    const activeAfterRefund = refundIsSettledLike(refund)
      ? assetsOnOrder.filter(a => ASSET_STILL_SERVICEABLE.includes(a.status))
      : [];

    const hasLedger = Boolean(getLedgerEntryForSource(ledgerEntries, 'refund', refund.id));
    const bound = Boolean(refund.memberAssetId ?? refund.assetId);
    const itemExpectsAsset = order?.items.some(item => Boolean(item.memberAssetId)) ?? false;

    const riskHints: string[] = [];
    if (activeAfterRefund.length > 0) {
      riskHints.push(`存在仍在有效/冻结态的会员资产：${activeAfterRefund.map(a => a.name).join('、')}（模块内估算；待核对）`);
    }
    if (itemExpectsAsset && !bound) {
      riskHints.push('订单行已关联会员资产，但本笔退款登记未绑定具体资产（待核对）');
    }
    if (!hasLedger) {
      riskHints.push('待生成正式分录；待接入真实财务分录（仅用于经营核对）');
    }
    if (order?.status === 'partially_refunded') {
      riskHints.push('订单主状态为部分退款态：剩余权益与预收负债口径待核对');
    }
    if (riskHints.length === 0) {
      riskHints.push('暂无明显异常；仍建议例行核对（仅用于经营核对）');
    }

    const primaryLabel = refund.refundNo?.trim()
      ? `对客单号 ${refund.refundNo.trim()}`
      : `登记键 ${refund.id}`;

    return {
      id: refund.id,
      refundRecordSummary: primaryLabel,
      relatedOrderId: refund.orderId,
      relatedMemberName: getMemberName(refund.memberId, members),
      relatedAssetsSummary: formatOrderAssetsForRefund(refund.orderId, memberAssets),
      refundAmount: refund.amount,
      refundStatusLabel: REFUND_STATUS_LABELS[refund.status],
      assetHandleSummary: REFUND_ASSET_HANDLE_SUMMARY(refund.assetHandleType),
      assetBoundLabel: bound ? '已绑定登记（待核对）' : '未绑定（待核对）',
      ledgerPendingLabel: hasLedger
        ? '演示占位已有，仍以正式分录为准（待核对）'
        : '待生成正式分录（待接入真实财务分录）',
      riskHints,
    };
  }).sort((a, b) => a.relatedOrderId.localeCompare(b.relatedOrderId) || a.id.localeCompare(b.id));
};

export interface FinanceRiskDetailRow {
  id: string;
  riskTypeLabel: string;
  relatedObjectSummary: string;
  impactAmount: number | null;
  currentStatusText: string;
  suggestedAction: string;
}

const RISK_TYPE_LABELS = {
  refundAssetActive: '有退款记录但资产仍有效',
  partialRefund: '部分退款需核对剩余权益',
  fullRefund: '全额退款需核对资产是否作废',
  refundUnbound: '退款未绑定资产',
  consumedNoLedger: '已耗课但未生成正式分录',
  teacherPayPending: '老师课时费待核对',
  deferredRecognitionMismatch: '预收负债与确认收入口径可能不一致',
} as const;

export const buildFinanceRiskDetailRows = ({
  orders,
  refunds,
  memberAssets,
  ledgerEntries,
  members,
  attendances,
  bookings,
  courseSessions,
  teacherPayRows,
  deferredRows,
}: {
  orders: Order[];
  refunds: Refund[];
  memberAssets: MemberAsset[];
  ledgerEntries: FinanceLedgerEntry[];
  members: Member[];
  attendances: Attendance[];
  bookings: Booking[];
  courseSessions: CourseSession[];
  teacherPayRows: FinanceTeacherSessionPayCheckRow[];
  deferredRows: FinanceDeferredLiabilityDetailRow[];
}): FinanceRiskDetailRow[] => {
  const rows: FinanceRiskDetailRow[] = [];
  const orderById = new Map(orders.map(o => [o.id, o]));
  const paidAmount = (order: Order): number => order.paidAmount ?? order.totalAmount;

  const refundActiveOrdersDone = new Set<string>();
  refunds.filter(refundIsSettledLike).forEach(refund => {
    const assets = memberAssets.filter(a => a.sourceOrderId === refund.orderId);
    const active = assets.filter(a => ASSET_STILL_SERVICEABLE.includes(a.status));
    if (active.length === 0 || refundActiveOrdersDone.has(refund.orderId)) return;
    refundActiveOrdersDone.add(refund.orderId);
    const sumRef = sumRefunds(refunds.filter(
      r => r.orderId === refund.orderId && refundIsSettledLike(r)
    ));
    rows.push({
      id: `risk-detail-refund-active-${refund.orderId}`,
      riskTypeLabel: RISK_TYPE_LABELS.refundAssetActive,
      relatedObjectSummary: `订单 ${refund.orderId} · 会员 ${getMemberName(refund.memberId, members)}`,
      impactAmount: sumRef,
      currentStatusText: `存在仍在有效/冻结态的会员资产：${active.map(a => a.name).join('、')}（模块内估算；待核对）`,
      suggestedAction: '核对退款后权益是否应冻结、冲减或作废；仅用于经营核对。待接入真实财务分录后以上线口径为准。',
    });
  });

  const partialOrderDone = new Set<string>();
  orders
    .filter(o => o.status === 'partially_refunded')
    .forEach(order => {
      if (partialOrderDone.has(order.id)) return;
      partialOrderDone.add(order.id);
      const rsum = sumRefunds(refunds.filter(r => r.orderId === order.id && refundIsRegistered(r)));
      rows.push({
        id: `risk-detail-partial-${order.id}`,
        riskTypeLabel: RISK_TYPE_LABELS.partialRefund,
        relatedObjectSummary: `订单 ${order.id} · 会员 ${getMemberName(order.memberId, members)}`,
        impactAmount: rsum,
        currentStatusText: '订单主状态为部分退款态；已登记退款与实付口径待核对（模块内估算）',
        suggestedAction: '逐项核对剩余课包/卡项与资产余额；待生成正式分录；仅用于经营核对。',
      });
    });

  refunds.forEach(refund => {
    if (!refundIsRegistered(refund)) return;
    const order = orderById.get(refund.orderId);
    if (!order || order.status === 'partially_refunded') return;
    const rsum = sumRefunds(refunds.filter(r => r.orderId === order.id && refundIsRegistered(r)));
    if (rsum > 0 && rsum < paidAmount(order) && refund.status === 'completed') {
      if (partialOrderDone.has(order.id)) return;
      partialOrderDone.add(order.id);
      rows.push({
        id: `risk-detail-partial-sum-${order.id}`,
        riskTypeLabel: RISK_TYPE_LABELS.partialRefund,
        relatedObjectSummary: `订单 ${order.id} · 会员 ${getMemberName(order.memberId, members)}`,
        impactAmount: rsum,
        currentStatusText: '已登记退款累计小于实付（模块内估算）；待核对',
        suggestedAction: '核对剩余权益与预收负债；待接入真实财务分录；仅用于经营核对。',
      });
    }
  });

  const fullOrderDone = new Set<string>();
  orders.filter(o => o.status === 'refunded').forEach(order => {
    if (fullOrderDone.has(order.id)) return;
    fullOrderDone.add(order.id);
    rows.push({
      id: `risk-detail-full-status-${order.id}`,
      riskTypeLabel: RISK_TYPE_LABELS.fullRefund,
      relatedObjectSummary: `订单 ${order.id} · 会员 ${getMemberName(order.memberId, members)}`,
      impactAmount: paidAmount(order),
      currentStatusText: '订单主状态为已全额退款态登记（待核对）',
      suggestedAction: '核对关联会员资产是否应作废或冲减；待生成正式分录；仅用于经营核对。',
    });
  });

  refunds.filter(r => r.status === 'completed').forEach(refund => {
    const order = orderById.get(refund.orderId);
    if (!order) return;
    const rsum = sumRefunds(refunds.filter(r2 => r2.orderId === order.id && r2.status === 'completed'));
    if (rsum >= paidAmount(order) && order.status !== 'refunded') {
      if (fullOrderDone.has(order.id)) return;
      fullOrderDone.add(order.id);
      rows.push({
        id: `risk-detail-full-sum-${order.id}`,
        riskTypeLabel: RISK_TYPE_LABELS.fullRefund,
        relatedObjectSummary: `订单 ${order.id} · 会员 ${getMemberName(order.memberId, members)}`,
        impactAmount: rsum,
        currentStatusText: '已登记退款累计达到或超过实付口径（模块内估算）；主状态未标记全额退款（待核对）',
        suggestedAction: '核对资产终止与权益冲减是否与退款登记一致；仅用于经营核对。',
      });
    }
  });

  refunds.filter(refundIsRegistered).forEach(refund => {
    const order = orderById.get(refund.orderId);
    const itemHasAsset = order?.items.some(item => Boolean(item.memberAssetId));
    if (itemHasAsset && !refund.memberAssetId && !refund.assetId) {
      rows.push({
        id: `risk-detail-unbound-${refund.id}`,
        riskTypeLabel: RISK_TYPE_LABELS.refundUnbound,
        relatedObjectSummary: `退款登记 ${refund.id} · 订单 ${refund.orderId}`,
        impactAmount: refund.amount,
        currentStatusText: '订单行已关联会员资产，本笔退款未绑定资产登记（待核对）',
        suggestedAction: '补全资产处理链路登记；待接入真实财务分录；仅用于经营核对。',
      });
    }
  });

  const sessionById = new Map(courseSessions.map(s => [s.id, s]));
  const sessionIds = new Set([
    ...attendances.map(a => a.courseSessionId),
    ...bookings.map(b => b.courseSessionId),
  ]);
  [...sessionIds].forEach(sessionId => {
    const session = sessionById.get(sessionId);
    if (!session) return;
    const atts = attendances.filter(a => a.courseSessionId === sessionId);
    const hasConsumed = atts.some(a => a.status === 'consumed');
    const ledgerForSession = ledgerEntries.filter(entry => {
      if (entry.sourceType !== 'course_consumption') return false;
      return entry.courseSessionId === sessionId || atts.some(a => a.id === entry.sourceId);
    });
    if (hasConsumed && ledgerForSession.length === 0) {
      const est = typeof session.price === 'number' ? session.price : null;
      rows.push({
        id: `risk-detail-consume-${sessionId}`,
        riskTypeLabel: RISK_TYPE_LABELS.consumedNoLedger,
        relatedObjectSummary: `场次 ${session.title ?? sessionId}`,
        impactAmount: est,
        currentStatusText: '已耗课登记但未见可对齐的分录占位（模块内估算；待核对）',
        suggestedAction: '待生成正式分录；待接入真实财务分录服务；与课耗事实交叉核对（仅用于经营核对）。',
      });
    }
  });

  teacherPayRows.forEach(row => {
    rows.push({
      id: `risk-detail-teacher-${row.id}`,
      riskTypeLabel: RISK_TYPE_LABELS.teacherPayPending,
      relatedObjectSummary: `${row.teacherName} · ${row.sessionTitle} · 场次 ${row.sessionId}`,
      impactAmount: row.amount,
      currentStatusText: `${row.statusLabel}；${row.riskHints[0] ?? '待核对'}`,
      suggestedAction: '接入老师课时规则与正式结算流程前，仅作模块内估算；不生成工资单；仅用于经营核对。',
    });
  });

  deferredRows.forEach(row => {
    const ledgerConsumed = sumLedgerConsumptionForOrder(row.orderId, ledgerEntries);
    const diff = Math.abs(ledgerConsumed - row.consumedAmountEstimate);
    if (diff > 1 && (ledgerConsumed > 0 || row.consumedAmountEstimate > 0)) {
      rows.push({
        id: `risk-detail-deferred-mismatch-${row.id}`,
        riskTypeLabel: RISK_TYPE_LABELS.deferredRecognitionMismatch,
        relatedObjectSummary: `会员 ${row.memberName} · 订单 ${row.orderId} · ${row.productSummary}`,
        impactAmount: diff,
        currentStatusText: `分录侧耗课累计 ¥${ledgerConsumed.toLocaleString('zh-CN')} 与权益消耗金额估算 ¥${row.consumedAmountEstimate.toLocaleString('zh-CN')} 不一致（模块内估算；待核对）`,
        suggestedAction: '对齐预收负债、待确认收入与课耗事实口径；待生成正式分录；仅用于经营核对。',
      });
    }
  });

  const seenTypes = new Set(rows.map(r => r.riskTypeLabel));
  (Object.values(RISK_TYPE_LABELS) as string[]).forEach(label => {
    if (seenTypes.has(label)) return;
    rows.push({
      id: `risk-detail-placeholder-${label}`,
      riskTypeLabel: label,
      relatedObjectSummary: '当前 mock 未命中典型案例（模块内估算）',
      impactAmount: null,
      currentStatusText: '待核对',
      suggestedAction: '在实单中按该类型规则例行核对；待接入真实财务分录；仅用于经营核对。',
    });
  });

  return rows;
};
