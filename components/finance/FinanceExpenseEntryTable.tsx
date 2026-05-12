import React from 'react';
import type { FinanceExpenseEntryRow } from '../../utils/financeSelectors';

interface FinanceExpenseEntryTableProps {
  rows: FinanceExpenseEntryRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无费用支出演示行</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceExpenseEntryTable: React.FC<FinanceExpenseEntryTableProps> = ({ rows }) => (
  <div id="finance-detail-expense-entry" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-emerald-50/50">
      <h3 className="font-bold text-lg text-gray-900">费用支出入口</h3>
      <ul className="text-xs text-gray-600 mt-3 space-y-1.5 list-disc pl-5 leading-relaxed">
        <li><strong>当前仅用于经营核对</strong>；<strong>不生成真实费用凭证</strong>；<strong>不生成正式财务分录</strong>；<strong>不同步财务</strong>。</li>
        <li>正式口径需<strong>待生成正式分录</strong>并<strong>待接入真实财务分录服务</strong>后复核（<strong>模块内估算</strong>）。</li>
      </ul>
    </div>
    {rows.length === 0 ? (
      <div className="p-6">
        <Empty />
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">支出类型</th>
              <th className="p-3">所属门店</th>
              <th className="p-3">金额</th>
              <th className="p-3">发生时间</th>
              <th className="p-3">当前状态</th>
              <th className="p-3">待核对说明</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.categoryLabel}</td>
                <td className="p-3 text-xs text-gray-800">{row.storeLabel}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmt(row.amount)}</td>
                <td className="p-3 text-xs text-gray-600 font-mono">{row.occurredAtLabel}</td>
                <td className="p-3 text-xs text-gray-800">{row.statusLabel}</td>
                <td className="p-3 text-xs text-emerald-900 max-w-[260px] leading-snug">{row.reconciliationNote}</td>
                <td className="p-3 pr-5 text-xs text-orange-900">
                  <ul className="list-disc pl-4 space-y-1">
                    {row.riskHints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default FinanceExpenseEntryTable;
