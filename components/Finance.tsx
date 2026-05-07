
import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import {
  MOCK_CONTRACTS,
  MOCK_FINANCE_LEDGER_ENTRIES,
  MOCK_MEMBERS,
  MOCK_ORDERS,
  MOCK_PAYMENTS,
  MOCK_REFUNDS,
} from '../constants';
import {
  filterLedgerEntriesByDateRange,
  filterOrdersByDateRange,
  filterPaymentsByDateRange,
  filterRefundsByDateRange,
  getPendingOrders,
  getPendingRefunds,
  sumPayments,
  sumRecognizedIncome,
  sumRefunds,
} from '../utils/financeSelectors';
import type {
  FinanceLedgerEntry,
  Order,
  Payment,
  Refund,
} from '../types';
import DeferredRevenuePanel from './finance/DeferredRevenuePanel';
import ExpensePayrollPanel from './finance/ExpensePayrollPanel';
import FinanceOverviewCards from './finance/FinanceOverviewCards';
import FinanceReportCharts from './finance/FinanceReportCharts';
import RevenueTable from './finance/RevenueTable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

type FinanceSubTab = 'overview' | 'revenue' | 'expense' | 'target' | 'report';
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
}

export interface FinancePendingItem {
  id: string;
  tone: 'refund' | 'order';
  title: string;
  description: string;
  actionLabel: string;
}

interface StaffPerformance {
  name: string;
  role: string;
  target: number;
  actual: number;
  progress: number;
}

const FINANCE_SUB_TABS: { id: FinanceSubTab; label: string }[] = [
  { id: 'overview', label: '营收总览' },
  { id: 'revenue', label: '收入与预收' },
  { id: 'expense', label: '支出与薪酬' },
  { id: 'target', label: '业绩目标' },
  { id: 'report', label: '报表中心' },
];

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

const formatDateTime = (iso?: string): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getMemberName = (memberId: string): string => (
  MOCK_MEMBERS.find(member => member.id === memberId)?.name ?? `会员 ${memberId}`
);

const getOrderById = (orderId: string): Order | undefined => (
  MOCK_ORDERS.find(order => order.id === orderId)
);

const getOrderPayment = (orderId: string, payments: Payment[]): Payment | undefined => (
  payments.find(payment => (
    payment.orderId === orderId && (payment.status === 'paid' || payment.status === 'reconciled')
  )) ?? payments.find(payment => payment.orderId === orderId)
);

const getLedgerEntryForSource = (
  entries: FinanceLedgerEntry[],
  sourceType: FinanceLedgerEntry['sourceType'],
  sourceId: string
): FinanceLedgerEntry | undefined => (
  entries.find(entry => entry.sourceType === sourceType && entry.sourceId === sourceId)
);

const getContractTitle = (order: Order): string | undefined => (
  order.contractId ? MOCK_CONTRACTS.find(contract => contract.id === order.contractId)?.title : undefined
);

const getOrderContent = (order: Order): string => {
  const itemNames = order.items.map(item => item.productName).join(' / ');
  const contractTitle = getContractTitle(order);
  return contractTitle ? `${itemNames} · ${contractTitle}` : itemNames;
};

const toOrderRow = (
  order: Order,
  payments: Payment[],
  ledgerEntries: FinanceLedgerEntry[]
): FinanceTransactionRow => {
  // Payment is joined by orderId; ledger entries only describe accounting impact.
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
    content: getOrderContent(order),
    amount: order.paidAmount ?? order.totalAmount,
    customer: getMemberName(order.memberId),
    method: payment?.method ? PAYMENT_METHOD_LABELS[payment.method] : '未支付',
    status: ORDER_STATUS_LABELS[order.status],
    statusTag: ORDER_STATUS_TAGS[order.status],
    sourceType: 'order',
    orderId: order.id,
    paymentId: payment?.id,
    ledgerEntryId: ledgerEntry?.id,
    productTypes,
  };
};

const toRefundRow = (
  refund: Refund,
  payments: Payment[],
  ledgerEntries: FinanceLedgerEntry[]
): FinanceTransactionRow => {
  const order = getOrderById(refund.orderId);
  const payment = refund.paymentId
    ? payments.find(item => item.id === refund.paymentId)
    : getOrderPayment(refund.orderId, payments);
  const ledgerEntry = getLedgerEntryForSource(ledgerEntries, 'refund', refund.id);
  const productTypes = order?.items.map(item => item.productType) ?? [];
  const occurredAt = refund.completedAt ?? refund.approvedAt ?? refund.requestedAt;
  const content = order
    ? `${getOrderContent(order)}${refund.reason ? ` · ${refund.reason}` : ''}`
    : refund.reason ?? '订单退款';

  return {
    id: refund.id,
    date: formatDateTime(occurredAt),
    occurredAt,
    type: '退款',
    content,
    amount: -refund.amount,
    customer: getMemberName(refund.memberId),
    method: payment?.method ? `${PAYMENT_METHOD_LABELS[payment.method]}退款` : '原路返回',
    status: REFUND_STATUS_LABELS[refund.status],
    statusTag: REFUND_STATUS_TAGS[refund.status],
    sourceType: 'refund',
    orderId: refund.orderId,
    paymentId: payment?.id,
    refundId: refund.id,
    ledgerEntryId: ledgerEntry?.id,
    productTypes,
  };
};

const buildFinanceTransactionRows = (
  orders: Order[],
  payments: Payment[],
  refunds: Refund[],
  ledgerEntries: FinanceLedgerEntry[]
): FinanceTransactionRow[] => ([
  ...orders.map(order => toOrderRow(order, payments, ledgerEntries)),
  ...refunds.map(refund => toRefundRow(refund, payments, ledgerEntries)),
].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()));

const Finance: React.FC = () => {
  const [subTab, setSubTab] = useState<FinanceSubTab>('overview');
  const [dateRange, setDateRange] = useState({ start: '2026-05-01', end: '2026-05-31' });
  const [orderFilter, setOrderFilter] = useState<FinanceOrderFilter>('all');

  const periodOrders = useMemo(
    () => filterOrdersByDateRange(MOCK_ORDERS, dateRange),
    [dateRange]
  );

  const periodPayments = useMemo(
    () => filterPaymentsByDateRange(MOCK_PAYMENTS, dateRange),
    [dateRange]
  );

  const periodRefunds = useMemo(
    () => filterRefundsByDateRange(MOCK_REFUNDS, dateRange),
    [dateRange]
  );

  const periodLedgerEntries = useMemo(
    () => filterLedgerEntriesByDateRange(MOCK_FINANCE_LEDGER_ENTRIES, dateRange),
    [dateRange]
  );

  const transactionRows = useMemo(
    () => buildFinanceTransactionRows(periodOrders, periodPayments, periodRefunds, periodLedgerEntries),
    [periodOrders, periodPayments, periodRefunds, periodLedgerEntries]
  );

  const staffPerformance: StaffPerformance[] = [
    { name: 'Eva', role: '销售管家', target: 150000, actual: 120000, progress: 80 },
    { name: 'Mike', role: '教练/销售', target: 120000, actual: 85000, progress: 71 },
    { name: 'Sarah', role: '教练/销售', target: 120000, actual: 110000, progress: 92 },
    { name: 'Leo', role: '店长/行政', target: 150000, actual: 143000, progress: 95 }
  ];

  const annualTarget = 6000000;
  const annualActual = 4200000;
  const monthlyTarget = 540000;
  const monthlyActual = sumPayments(periodPayments);
  const beginningDeferredRevenue = 1200000;
  const transitionalOperatingExpense = 185000;

  // --- Computed ---
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return transactionRows;
    if (orderFilter === 'refund') return transactionRows.filter(row => row.sourceType === 'refund');
    if (orderFilter === 'integral') return transactionRows.filter(row => row.productTypes.includes('point') || row.integral);
    if (orderFilter === 'card') return transactionRows.filter(row => row.sourceType === 'order' && row.productTypes.some(type => type === 'card' || type === 'course' || type === 'ttc'));
    return transactionRows;
  }, [orderFilter, transactionRows]);

  const cashIncomeTotal = sumPayments(periodPayments);
  const recognizedIncomeTotal = sumRecognizedIncome(periodLedgerEntries);
  const refundTotal = sumRefunds(periodRefunds);
  const netCashFlow = cashIncomeTotal - refundTotal;
  const endingDeferredRevenue = beginningDeferredRevenue + cashIncomeTotal - recognizedIncomeTotal - refundTotal;
  const pendingRefunds = getPendingRefunds(periodRefunds);
  const pendingOrders = getPendingOrders(periodOrders);
  const pendingItems: FinancePendingItem[] = [
    ...pendingRefunds.map(refund => ({
      id: refund.id,
      tone: 'refund' as const,
      title: '待处理退款申请',
      description: `¥${refund.amount.toLocaleString()}, ${getMemberName(refund.memberId)}`,
      actionLabel: refund.status === 'requested' || refund.status === 'reviewing' ? '去审核' : '去处理',
    })),
    ...pendingOrders.map(order => ({
      id: order.id,
      tone: 'order' as const,
      title: order.status === 'pending_payment' ? '待确认收款订单' : '待处理订单',
      description: `¥${(order.paidAmount ?? order.totalAmount).toLocaleString()}, ${getMemberName(order.memberId)}`,
      actionLabel: order.status === 'pending_payment' ? '去核对' : '去处理',
    })),
  ];

  const annualProgress = Math.min(100, Math.round((annualActual / annualTarget) * 100));
  const monthlyProgress = Math.min(100, Math.round((monthlyActual / monthlyTarget) * 100));

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                财务管理中心
                <button 
                    onClick={() => alert('Gemini AI 正在生成财务分析报告...')}
                    className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI 财务分析
                </button>
            </h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center text-xs text-gray-500 bg-white border border-gray-200 pl-4 pr-1 py-1 rounded-lg shadow-sm">
                    <span className="mr-2 font-medium">查询区间:</span>
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent outline-none w-24 text-black mr-2 font-mono" />
                    <span className="text-gray-400">-</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent outline-none w-24 text-black ml-2 font-mono" />
                    <button onClick={() => alert(`数据已更新至 ${dateRange.start} ~ ${dateRange.end}`)} className="bg-black text-white px-3 py-1.5 rounded-lg ml-3 text-xs font-medium hover:opacity-80 transition">查询</button>
                </div>

                <button className="bg-white border border-gray-200 text-black text-xs px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2">
                    <i className="fa-solid fa-file-export"></i> 导出报表
                </button>
                <button className="bg-black text-white text-xs px-4 py-2 rounded-lg font-medium hover:opacity-80 transition">
                    + 录入支出
                </button>
            </div>
        </div>

        {/* Sub Navigation (Unified Segmented Control) */}
        <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
             <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                {FINANCE_SUB_TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`relative z-10 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${
                            subTab === tab.id 
                            ? 'bg-white text-black shadow-sm font-bold' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
             </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- TAB: OVERVIEW --- */}
                {subTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        <FinanceOverviewCards
                            cashIncomeTotal={cashIncomeTotal}
                            recognizedIncomeTotal={recognizedIncomeTotal}
                            operatingExpenseTotal={transitionalOperatingExpense}
                            netCashFlow={netCashFlow}
                        />

                        <FinanceReportCharts
                            orders={periodOrders}
                            pendingItems={pendingItems}
                            productTypeLabels={PRODUCT_TYPE_LABELS}
                            endingDeferredRevenue={endingDeferredRevenue}
                            refundTotal={refundTotal}
                        />
                    </div>
                )}

                {/* --- TAB: REVENUE --- */}
                {subTab === 'revenue' && (
                    <div className="space-y-6 animate-fadeIn">
                        <DeferredRevenuePanel
                            beginningDeferredRevenue={beginningDeferredRevenue}
                            cashIncomeTotal={cashIncomeTotal}
                            recognizedIncomeTotal={recognizedIncomeTotal}
                            endingDeferredRevenue={endingDeferredRevenue}
                        />

                        <RevenueTable
                            orderFilter={orderFilter}
                            setOrderFilter={setOrderFilter}
                            filteredOrders={filteredOrders}
                        />
                    </div>
                )}

                {/* --- TAB: EXPENSE --- */}
                {subTab === 'expense' && (
                    <ExpensePayrollPanel />
                )}

                {/* --- TAB: TARGET --- */}
                {subTab === 'target' && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900"><i className="fa-solid fa-flag-checkered mr-2 text-gray-400"></i> 年度业绩目标 (YTD)</h3>
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div><span className="text-xs font-bold text-gray-500 uppercase">已完成进度</span></div>
                                        <div className="text-right"><span className="text-3xl font-bold text-black font-mono">{annualProgress}%</span></div>
                                    </div>
                                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
                                        <div style={{ width: `${annualProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-black rounded-full transition-all duration-1000"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                                        <span>当前: ¥{annualActual.toLocaleString()}</span>
                                        <span>目标: ¥{annualTarget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900"><i className="fa-solid fa-calendar-alt mr-2 text-gray-400"></i> 月度总目标</h3>
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div><span className="text-xs font-bold text-gray-500 uppercase">查询区间目标进度</span></div>
                                        <div className="text-right"><span className="text-3xl font-bold text-black font-mono">{monthlyProgress}%</span></div>
                                    </div>
                                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
                                        <div style={{ width: `${monthlyProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 rounded-full transition-all duration-1000"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                                        <span>当前: ¥{monthlyActual.toLocaleString()}</span>
                                        <span>目标: ¥{monthlyTarget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg flex items-center text-gray-900"><i className="fa-solid fa-user-friends mr-2 text-gray-400"></i> 门店业绩分配与实时进度</h3>
                                <button className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-80 transition">重新分配目标</button>
                            </div>
                            
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-3 pl-4">姓名/角色</th>
                                        <th className="p-3">月度分配目标 (店长分配)</th>
                                        <th className="p-3">实际完成金额</th>
                                        <th className="p-3">进度</th>
                                        <th className="p-3">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {staffPerformance.map((staff, index) => (
                                        <tr key={index}>
                                            <td className="p-3 pl-4"><div className="font-bold text-gray-900">{staff.name}</div><div className="text-[10px] text-gray-400">{staff.role}</div></td>
                                            <td className="p-3 font-mono text-gray-900">¥{staff.target.toLocaleString()}</td>
                                            <td className="p-3 font-mono text-green-600 font-bold">¥{staff.actual.toLocaleString()}</td>
                                            <td className="p-3">
                                                <div className="relative pt-1">
                                                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100 w-40">
                                                        <div style={{ width: `${staff.progress}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full ${staff.progress < 70 ? 'bg-orange-500' : 'bg-black'}`}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 absolute right-0 top-0 -mt-1 font-mono">{staff.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="p-3"><button className="text-xs text-blue-600 hover:underline font-bold">查看明细</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- TAB: REPORT --- */}
                {subTab === 'report' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
                            <h3 className="font-bold text-2xl mb-2 text-gray-900">生成标准财务报表</h3>
                            <p className="text-sm text-gray-500 mb-10">根据自定义查询日期，导出正式报表文件。</p>
                            <div className="flex justify-center gap-6">
                                <div className="p-6 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 w-56 transition group">
                                    <i className="fa-solid fa-file-excel text-4xl text-green-600 mb-4 group-hover:scale-110 transition"></i>
                                    <div className="font-bold text-base text-gray-900">资产负债表</div>
                                    <div className="text-xs text-gray-400 mt-1">XLSX 格式</div>
                                </div>
                                <div className="p-6 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 w-56 transition group">
                                    <i className="fa-solid fa-file-invoice text-4xl text-blue-600 mb-4 group-hover:scale-110 transition"></i>
                                    <div className="font-bold text-base text-gray-900">利润表 (P&L)</div>
                                    <div className="text-xs text-gray-400 mt-1">PDF / XLSX</div>
                                </div>
                                <div className="p-6 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 w-56 transition group">
                                    <i className="fa-solid fa-money-bill-transfer text-4xl text-orange-500 mb-4 group-hover:scale-110 transition"></i>
                                    <div className="font-bold text-base text-gray-900">现金流量表</div>
                                    <div className="text-xs text-gray-400 mt-1">XLSX 格式</div>
                                </div>
                            </div>
                            <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-2xl mx-auto">
                                 <div className="font-bold text-base mb-4 text-gray-700">经营分析报表</div>
                                 <div className="flex justify-center gap-4">
                                    <button className="bg-white border border-gray-200 text-black text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition">
                                        消课收入明细表
                                    </button>
                                    <button className="bg-white border border-gray-200 text-black text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition">
                                        卡项销售明细表
                                    </button>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Finance;
