import React from 'react';
import type { FinanceRefundReconciliationRow } from '../../utils/financeSelectors';

interface FinanceRefundReconciliationTableProps {
  rows: FinanceRefundReconciliationRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无退款登记</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceRefundReconciliationTable: React.FC<FinanceRefundReconciliationTableProps> = ({ rows }) => (
  <div id="finance-detail-refund-reconciliation" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50/80">
      <h3 className="font-bold text-lg text-gray-900">退款核对明细</h3>
      <ul className="text-xs text-gray-600 mt-3 space-y-1.5 list-disc pl-5 leading-relaxed">
        <li>按<strong>退款登记</strong>与<strong>订单、会员资产、分录占位</strong>交叉核对；<strong>仅用于经营核对</strong>。</li>
        <li>金额与状态为<strong>模块内估算</strong>；分录侧统一表述为<strong>待生成正式分录</strong>、<strong>待接入真实财务分录</strong>。</li>
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
              <th className="p-3 pl-5">退款登记记录</th>
              <th className="p-3">关联订单</th>
              <th className="p-3">关联会员</th>
              <th className="p-3">关联资产</th>
              <th className="p-3">退款金额</th>
              <th className="p-3">退款状态</th>
              <th className="p-3">资产处理方式</th>
              <th className="p-3">是否已绑定资产</th>
              <th className="p-3">是否待接入财务分录</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5">
                  <div className="font-medium text-gray-900">{row.refundRecordSummary}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">内部键 {row.id}</div>
                </td>
                <td className="p-3 font-mono text-xs text-gray-800">{row.relatedOrderId}</td>
                <td className="p-3 text-gray-800">{row.relatedMemberName}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[220px] leading-snug">{row.relatedAssetsSummary}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmt(row.refundAmount)}</td>
                <td className="p-3 text-xs text-gray-800">{row.refundStatusLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[180px]">{row.assetHandleSummary}</td>
                <td className="p-3 text-xs font-medium text-gray-900">{row.assetBoundLabel}</td>
                <td className="p-3 text-xs text-orange-900 max-w-[200px] leading-snug">{row.ledgerPendingLabel}</td>
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

export default FinanceRefundReconciliationTable;
