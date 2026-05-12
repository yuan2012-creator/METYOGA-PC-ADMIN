import React from 'react';

interface FinanceOverviewCardsProps {
  cashIncomeTotal: number;
  recognizedIncomeTotal: number;
  operatingExpenseTotal: number;
  netCashFlow: number;
}

const FinanceOverviewCards: React.FC<FinanceOverviewCardsProps> = ({
  cashIncomeTotal,
  recognizedIncomeTotal,
  operatingExpenseTotal,
  netCashFlow,
}) => (
  <div className="grid grid-cols-4 gap-6">
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-black hover:-translate-y-1 transition duration-200">
      <div className="text-xs text-gray-400 mb-1 uppercase font-bold">实收金额 / 总现金收入 (Cash In)</div>
      <div className="text-3xl font-bold font-mono tracking-tight text-gray-900">¥{cashIncomeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      <div className="text-xs text-gray-500 mt-2 font-medium">模块内估算，仅用于经营核对</div>
      <div className="text-xs text-green-600 mt-1 font-medium flex items-center"><i className="fa-solid fa-arrow-trend-up mr-1"></i> 环比 +12%（演示）</div>
    </div>
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-blue-500 hover:-translate-y-1 transition duration-200">
      <div className="text-xs text-gray-400 mb-1 uppercase font-bold">从预收扣减的履约参考</div>
      <div className="text-3xl font-bold font-mono tracking-tight text-gray-900">¥{recognizedIncomeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      <div className="text-xs text-blue-600 mt-2 font-medium leading-snug">模块内估算；待确认收入与待生成正式分录待接入真实财务分录。确认收入需以后续真实耗课记录为准。</div>
    </div>
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-red-500 hover:-translate-y-1 transition duration-200">
      <div className="text-xs text-gray-400 mb-1 uppercase font-bold">总支出</div>
      <div className="text-3xl font-bold font-mono tracking-tight text-gray-900">¥{operatingExpenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      <div className="text-xs text-gray-400 mt-2 font-medium">支出占比 40%</div>
    </div>
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm border-l-4 border-l-green-500 hover:-translate-y-1 transition duration-200">
      <div className="text-xs text-gray-400 mb-1 uppercase font-bold">净收款 / 净现金流 (Net Cash)</div>
      <div className={`text-3xl font-bold font-mono tracking-tight ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>¥{netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      <div className="text-xs text-gray-400 mt-2 font-medium">实收减退款；模块内估算，仅用于经营核对</div>
    </div>
  </div>
);

export default FinanceOverviewCards;
