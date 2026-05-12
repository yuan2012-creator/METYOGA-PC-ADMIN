import React from 'react';
import type { FinanceCrossStoreSettlementRow } from '../../utils/financeSelectors';

interface FinanceCrossStoreSettlementTableProps {
  rows: FinanceCrossStoreSettlementRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无跨店结算演示行</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceCrossStoreSettlementTable: React.FC<FinanceCrossStoreSettlementTableProps> = ({ rows }) => (
  <div id="finance-detail-cross-store" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-slate-50/80">
      <h3 className="font-bold text-lg text-gray-900">跨店结算入口</h3>
      <ul className="text-xs text-gray-600 mt-3 space-y-1.5 list-disc pl-5 leading-relaxed">
        <li><strong>当前为模块内估算</strong>；<strong>不生成真实跨店结算单</strong>；<strong>不同步财务</strong>；<strong>仅用于经营核对</strong>。</li>
        <li>后续需接入<strong>正式跨店结算规则</strong>，并与<strong>待生成正式分录</strong>、<strong>待接入真实财务分录服务</strong>闭环对齐。</li>
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
              <th className="p-3 pl-5">来源门店</th>
              <th className="p-3">消课门店</th>
              <th className="p-3">会员 / 订单</th>
              <th className="p-3">课程或耗课来源</th>
              <th className="p-3">结算金额</th>
              <th className="p-3">当前状态</th>
              <th className="p-3">待接入说明</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 text-gray-900 text-xs leading-snug">{row.sourceStoreLabel}</td>
                <td className="p-3 text-gray-900 text-xs leading-snug">{row.consumeStoreLabel}</td>
                <td className="p-3 text-xs text-gray-800">{row.memberOrderSummary}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[220px] leading-snug">{row.courseConsumptionSummary}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmt(row.settlementAmount)}</td>
                <td className="p-3 text-xs text-gray-800">{row.statusLabel}</td>
                <td className="p-3 text-xs text-slate-800 max-w-[240px] leading-snug">{row.pendingIntegrationText}</td>
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

export default FinanceCrossStoreSettlementTable;
