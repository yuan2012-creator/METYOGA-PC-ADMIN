import type {
  Contract,
  FinanceLedgerEntry,
  Member,
  Order,
  Payment,
  Refund,
} from '../types';

const COLLECTED_PAYMENT_STATUSES: Payment['status'][] = ['paid', 'reconciled'];
const PENDING_ORDER_STATUSES: Order['status'][] = ['draft', 'pending_payment', 'paid'];
const PENDING_REFUND_STATUSES: Refund['status'][] = ['requested', 'reviewing', 'approved', 'processing'];

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
        ? `Order ${order.id} -> Payment ${payment.id}${ledgerEntry ? ` -> Ledger ${ledgerEntry.id}` : ' -> 待生成分录'}`
        : `Order ${order.id} -> 待确认收款`,
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
      sourceSummary: `Refund ${refund.id} -> Order ${refund.orderId}${ledgerEntry ? ` -> Ledger ${ledgerEntry.id}` : ' -> 待生成分录'}`,
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
    sourceSummary: `Refund ${refund.id} -> Order ${refund.orderId}`,
  })),
  ...getPendingOrders(orders).map(order => ({
    id: order.id,
    tone: 'order' as const,
    title: order.status === 'pending_payment' ? '待确认收款订单' : '待处理订单',
    description: `¥${(order.paidAmount ?? order.totalAmount).toLocaleString()}, ${getMemberName(order.memberId, members)}`,
    actionLabel: order.status === 'pending_payment' ? '去核对' : '去处理',
    sourceSummary: `Order ${order.id} -> ${order.contractId ?? '未绑定合同'}`,
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
  const refundTotal = sumRefunds(refunds);
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
  const refundTotal = sumRefunds(dailyRefunds);

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
      sourceSummary: `Ledger ${entry.id} -> ${entry.sourceType} ${entry.sourceId}`,
      isFallback: false,
    }));
  }

  return [
    {
      id: 'expense-fallback-rent',
      date: '演示周期',
      category: '房租水电',
      amount: 85000,
      voucherLabel: 'fallback',
      sourceSummary: 'fallback：费用分录尚未接入 FinanceLedgerEntry',
      isFallback: true,
    },
    {
      id: 'expense-fallback-marketing',
      date: '演示周期',
      category: '市场推广',
      amount: 12000,
      voucherLabel: 'fallback',
      sourceSummary: 'fallback：费用分录尚未接入 FinanceLedgerEntry',
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
      status: '待发放',
      sourceSummary: `Ledger ${entry.id} -> payroll ${entry.sourceId}`,
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
      status: '待发放',
      sourceSummary: 'fallback：薪酬分录尚未接入 FinanceLedgerEntry',
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
        ? `Orders ${staffOrderIds.join(', ')} -> Payments`
        : 'fallback target：当前周期暂无销售订单',
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
  const periodRefundTotal = sumRefunds(periodRefunds);
  const annualActual = sumPayments(annualPayments) - sumRefunds(annualRefunds);
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
        sourceSummary: '年度完成额 = 本年度 Payment - Refund；目标为门店配置 fallback',
        isFallbackTarget: true,
      },
      period: {
        label: '查询区间目标',
        target: periodTarget,
        actual: periodActual,
        progress: getProgress(periodActual, periodTarget),
        sourceSummary: '区间完成额 = 查询区间 Payment - Refund；目标为门店配置 fallback',
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
