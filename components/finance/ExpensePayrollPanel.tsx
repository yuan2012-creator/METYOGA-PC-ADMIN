import React from 'react';
import type { FinanceExpenseRow, FinancePayrollRow } from '../../utils/financeSelectors';

interface ExpensePayrollPanelProps {
  payrollRows: FinancePayrollRow[];
  expenseRows: FinanceExpenseRow[];
}

const ExpensePayrollPanel: React.FC<ExpensePayrollPanelProps> = ({
  payrollRows,
  expenseRows,
}) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-900">教练/员工薪酬核算</h3>
        <div className="flex gap-2">
          <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-gray-50 transition">重新计算</button>
          <button className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-80 transition">一键发放</button>
        </div>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
          <tr><th className="p-3 pl-4">姓名/职级</th><th className="p-3">基础薪资</th><th className="p-3">课时费 (自动计算)</th><th className="p-3">销售提成</th><th className="p-3">扣除 (个税/社保)</th><th className="p-3">实发金额</th><th className="p-3">状态</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payrollRows.map(row => (
            <tr key={row.id}>
              <td className="p-3 pl-4">
                <div className="font-bold text-gray-900">{row.name}</div>
                <div className="text-[10px] text-gray-400">{row.role}</div>
                {row.isFallback && <div className="text-[10px] text-orange-500">{row.sourceSummary}</div>}
              </td>
              <td className="p-3 font-mono text-gray-600">¥{row.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-3 font-mono text-blue-600 font-bold">
                ¥{row.classFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-[10px] text-gray-400 block font-normal">FinanceLedgerEntry / fallback</span>
              </td>
              <td className="p-3 font-mono text-gray-600">¥{row.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-3 font-mono text-red-500">-¥{row.deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-3 font-mono font-bold text-lg text-black">¥{row.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-3"><span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded text-[10px] font-bold">{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-900">支出明细</h3>
        <button className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:opacity-80 transition">+ 录入支出</button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-bold"><tr><th className="py-3 pl-4">发生日期</th><th>类别</th><th>金额</th><th>凭证</th></tr></thead>
        <tbody className="divide-y divide-gray-50">
          {expenseRows.map(row => (
            <tr key={row.id}>
              <td className="py-3 pl-4 text-gray-500">{row.date}</td>
              <td>
                <div className="font-bold text-gray-900">{row.category}</div>
                {row.isFallback && <div className="text-[10px] text-orange-500">{row.sourceSummary}</div>}
              </td>
              <td className="font-mono font-bold text-gray-900">¥{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td>
                <span className="text-[10px] text-gray-400 font-mono">{row.voucherLabel}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ExpensePayrollPanel;
