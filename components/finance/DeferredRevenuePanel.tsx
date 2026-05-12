import React from 'react';

interface DeferredRevenuePanelProps {
  beginningDeferredRevenue: number;
  cashIncomeTotal: number;
  recognizedIncomeTotal: number;
  endingDeferredRevenue: number;
}

const DeferredRevenuePanel: React.FC<DeferredRevenuePanelProps> = ({
  beginningDeferredRevenue,
  cashIncomeTotal,
  recognizedIncomeTotal,
  endingDeferredRevenue,
}) => (
  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white shadow-xl">
    <div className="p-6 border-b border-white/10 flex justify-between items-center">
      <h3 className="font-bold text-lg flex items-center gap-2"><i className="fa-solid fa-vault text-gray-400"></i> 预收账款资金池 (门店负债)</h3>
      <span className="text-xs opacity-60">期初 + 新增 - 从预收扣减的履约参考 = 期末预收负债（模块内估算）</span>
    </div>
    <div className="grid grid-cols-4 divide-x divide-white/10">
      <div className="p-6">
        <div className="text-xs opacity-60 mb-1">期初预收款</div>
        <div className="text-2xl font-bold font-mono">¥{beginningDeferredRevenue.toLocaleString()}</div>
      </div>
      <div className="p-6 bg-green-900/20">
        <div className="text-xs opacity-60 mb-1 flex items-center gap-1"><i className="fa-solid fa-plus text-[10px] text-green-400"></i> 本期新增 (销售)</div>
        <div className="text-2xl font-bold font-mono text-green-400">¥{cashIncomeTotal.toLocaleString()}</div>
      </div>
      <div className="p-6 bg-red-900/20">
        <div className="text-xs opacity-60 mb-1 flex items-center gap-1"><i className="fa-solid fa-minus text-[10px] text-orange-400"></i> 本期从预收扣减的履约参考（模块内估算）</div>
        <div className="text-2xl font-bold font-mono text-orange-400">¥{recognizedIncomeTotal.toLocaleString()}</div>
      </div>
      <div className="p-6 bg-white/5">
        <div className="text-xs opacity-60 mb-1">= 期末预收款余额</div>
        <div className="text-2xl font-bold font-mono">¥{endingDeferredRevenue.toLocaleString()}</div>
      </div>
    </div>
  </div>
);

export default DeferredRevenuePanel;
