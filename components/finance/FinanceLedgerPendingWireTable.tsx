import React from 'react';
import type { FinanceLedgerPendingWireRow } from '../../utils/financeSelectors';

interface FinanceLedgerPendingWireTableProps {
  rows: FinanceLedgerPendingWireRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无可核对记录</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceLedgerPendingWireTable: React.FC<FinanceLedgerPendingWireTableProps> = ({ rows }) => (
  <div id="finance-detail-ledger-pending" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50/80">
      <h3 className="font-bold text-lg text-gray-900">财务分录待接入</h3>
      <ul className="text-xs text-gray-600 mt-3 space-y-1.5 list-disc pl-5 leading-relaxed">
        <li><strong>当前未生成</strong>可在总账直接核对的<strong>正式分录</strong>；列表为<strong>模块内估算 / 演示占位</strong>。</li>
        <li><strong>仅用于经营核对</strong>；后续需要<strong>待接入真实财务分录服务</strong>与<strong>待生成正式分录</strong>的闭环。</li>
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
              <th className="p-3 pl-5">来源类型</th>
              <th className="p-3">来源对象</th>
              <th className="p-3">金额</th>
              <th className="p-3">方向说明</th>
              <th className="p-3">当前状态</th>
              <th className="p-3">待生成分录说明</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.sourceTypeLabel}</td>
                <td className="p-3 text-xs text-gray-800 font-mono leading-snug max-w-[280px]">{row.sourceObjectSummary}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmt(row.amount)}</td>
                <td className="p-3 text-xs text-gray-600">{row.directionHint}</td>
                <td className="p-3 text-xs text-gray-800">{row.currentStatusText}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[220px] leading-snug">{row.pendingFormalEntryNote}</td>
                <td className="p-3 pr-5 text-xs text-orange-800">
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

export default FinanceLedgerPendingWireTable;
