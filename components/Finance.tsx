
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
  buildFinanceOverviewSummary,
  buildFinanceIncomeStructure,
  buildFinancePendingItems,
  buildFinanceTransactionRows,
  filterLedgerEntriesByDateRange,
  filterFinanceTransactionRows,
  filterOrdersByDateRange,
  filterPaymentsByDateRange,
  filterRefundsByDateRange,
  type FinanceOrderFilter,
  type FinancePendingItem,
  type FinanceTransactionRow,
} from '../utils/financeSelectors';
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

interface StaffPerformance {
  name: string;
  role: string;
  target: number;
  actual: number;
  progress: number;
}

type FinanceToastTone = 'info' | 'success';

interface FinanceToast {
  id: number;
  message: string;
  tone: FinanceToastTone;
}

const FINANCE_SUB_TABS: { id: FinanceSubTab; label: string }[] = [
  { id: 'overview', label: '营收总览' },
  { id: 'revenue', label: '收入与预收' },
  { id: 'expense', label: '支出与薪酬' },
  { id: 'target', label: '业绩目标' },
  { id: 'report', label: '报表中心' },
];

const Finance: React.FC = () => {
  const [subTab, setSubTab] = useState<FinanceSubTab>('overview');
  const [dateRange, setDateRange] = useState({ start: '2026-05-01', end: '2026-05-31' });
  const [orderFilter, setOrderFilter] = useState<FinanceOrderFilter>('all');
  const [toast, setToast] = useState<FinanceToast | null>(null);

  const showToast = (message: string, tone: FinanceToastTone = 'info') => {
    setToast({ id: Date.now(), message, tone });
    window.setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 2400);
  };

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
    () => buildFinanceTransactionRows({
      orders: periodOrders,
      payments: periodPayments,
      refunds: periodRefunds,
      ledgerEntries: periodLedgerEntries,
      members: MOCK_MEMBERS,
      contracts: MOCK_CONTRACTS,
    }),
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
  const beginningDeferredRevenue = 1200000;
  const transitionalOperatingExpense = 185000;
  const financeSummary = useMemo(
    () => buildFinanceOverviewSummary({
      orders: periodOrders,
      payments: periodPayments,
      refunds: periodRefunds,
      ledgerEntries: periodLedgerEntries,
      beginningDeferredRevenue,
    }),
    [periodOrders, periodPayments, periodRefunds, periodLedgerEntries, beginningDeferredRevenue]
  );
  const monthlyActual = financeSummary.cashIncomeTotal;

  // --- Computed ---
  const filteredOrders = useMemo(
    () => filterFinanceTransactionRows(transactionRows, orderFilter),
    [orderFilter, transactionRows]
  );
  const pendingItems = useMemo(
    () => buildFinancePendingItems({
      orders: periodOrders,
      refunds: periodRefunds,
      members: MOCK_MEMBERS,
    }),
    [periodOrders, periodRefunds]
  );
  const incomeStructure = useMemo(
    () => buildFinanceIncomeStructure(periodOrders),
    [periodOrders]
  );

  const annualProgress = Math.min(100, Math.round((annualActual / annualTarget) * 100));
  const monthlyProgress = Math.min(100, Math.round((monthlyActual / monthlyTarget) * 100));

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                财务管理中心
                <button 
                    onClick={() => showToast('Gemini AI 正在生成财务分析报告...')}
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
                    <button onClick={() => showToast(`数据已更新至 ${dateRange.start} ~ ${dateRange.end}`, 'success')} className="bg-black text-white px-3 py-1.5 rounded-lg ml-3 text-xs font-medium hover:opacity-80 transition">查询</button>
                </div>

                <button
                    onClick={() => showToast('财务报表导出演示已准备', 'success')}
                    className="bg-white border border-gray-200 text-black text-xs px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                >
                    <i className="fa-solid fa-file-export"></i> 导出报表
                </button>
                <button
                    onClick={() => showToast('已打开录入支出演示')}
                    className="bg-black text-white text-xs px-4 py-2 rounded-lg font-medium hover:opacity-80 transition"
                >
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
                            cashIncomeTotal={financeSummary.cashIncomeTotal}
                            recognizedIncomeTotal={financeSummary.recognizedIncomeTotal}
                            operatingExpenseTotal={transitionalOperatingExpense}
                            netCashFlow={financeSummary.netCashFlow}
                        />

                        <FinanceReportCharts
                            pendingItems={pendingItems}
                            incomeStructure={incomeStructure}
                            endingDeferredRevenue={financeSummary.endingDeferredRevenue}
                            refundTotal={financeSummary.refundTotal}
                        />
                    </div>
                )}

                {/* --- TAB: REVENUE --- */}
                {subTab === 'revenue' && (
                    <div className="space-y-6 animate-fadeIn">
                        <DeferredRevenuePanel
                            beginningDeferredRevenue={beginningDeferredRevenue}
                            cashIncomeTotal={financeSummary.cashIncomeTotal}
                            recognizedIncomeTotal={financeSummary.recognizedIncomeTotal}
                            endingDeferredRevenue={financeSummary.endingDeferredRevenue}
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
                                <button
                                    onClick={() => showToast('已进入业绩目标重新分配演示')}
                                    className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-80 transition"
                                >
                                    重新分配目标
                                </button>
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
                                            <td className="p-3">
                                              <button
                                                onClick={() => showToast(`已打开 ${staff.name} 业绩明细演示`)}
                                                className="text-xs text-blue-600 hover:underline font-bold"
                                              >
                                                查看明细
                                              </button>
                                            </td>
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
                                <div
                                    onClick={() => showToast('资产负债表导出演示已准备', 'success')}
                                    className="p-6 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 w-56 transition group"
                                >
                                    <i className="fa-solid fa-file-excel text-4xl text-green-600 mb-4 group-hover:scale-110 transition"></i>
                                    <div className="font-bold text-base text-gray-900">资产负债表</div>
                                    <div className="text-xs text-gray-400 mt-1">XLSX 格式</div>
                                </div>
                                <div
                                    onClick={() => showToast('利润表导出演示已准备', 'success')}
                                    className="p-6 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 w-56 transition group"
                                >
                                    <i className="fa-solid fa-file-invoice text-4xl text-blue-600 mb-4 group-hover:scale-110 transition"></i>
                                    <div className="font-bold text-base text-gray-900">利润表 (P&L)</div>
                                    <div className="text-xs text-gray-400 mt-1">PDF / XLSX</div>
                                </div>
                                <div
                                    onClick={() => showToast('现金流量表导出演示已准备', 'success')}
                                    className="p-6 border border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 w-56 transition group"
                                >
                                    <i className="fa-solid fa-money-bill-transfer text-4xl text-orange-500 mb-4 group-hover:scale-110 transition"></i>
                                    <div className="font-bold text-base text-gray-900">现金流量表</div>
                                    <div className="text-xs text-gray-400 mt-1">XLSX 格式</div>
                                </div>
                            </div>
                            <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-2xl mx-auto">
                                 <div className="font-bold text-base mb-4 text-gray-700">经营分析报表</div>
                                 <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => showToast('消课收入明细表导出演示已准备', 'success')}
                                        className="bg-white border border-gray-200 text-black text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition"
                                    >
                                        消课收入明细表
                                    </button>
                                    <button
                                        onClick={() => showToast('卡项销售明细表导出演示已准备', 'success')}
                                        className="bg-white border border-gray-200 text-black text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition"
                                    >
                                        卡项销售明细表
                                     </button>
                                 </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

        {toast && (
            <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
                <div className={`px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
                    toast.tone === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-white text-gray-800 border-gray-100'
                }`}>
                    <i className={`fa-solid ${toast.tone === 'success' ? 'fa-circle-check' : 'fa-circle-info'}`}></i>
                    {toast.message}
                </div>
            </div>
        )}

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
