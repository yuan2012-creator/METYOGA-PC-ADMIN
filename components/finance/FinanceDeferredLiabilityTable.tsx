import React from 'react';
import type { FinanceDeferredLiabilityDetailRow } from '../../utils/financeSelectors';

interface FinanceDeferredLiabilityTableProps {
  rows: FinanceDeferredLiabilityDetailRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无可核对记录</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceDeferredLiabilityTable: React.FC<FinanceDeferredLiabilityTableProps> = ({ rows }) => (
  <div id="finance-detail-deferred" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50/80">
      <h3 className="font-bold text-lg text-gray-900">预收负债明细</h3>
      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
        <strong>预收负债</strong>表示会员已付款、但<strong>尚未完成交付</strong>的权益所对应的负债口径（<strong>模块内估算</strong>）。
        与<strong>待确认收入</strong>（已发生耗课/到课、<strong>待生成正式分录</strong>）不同；仅用于经营核对，待接入真实财务分录。
      </p>
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
              <th className="p-3 pl-5">会员</th>
              <th className="p-3">订单 / 产品</th>
              <th className="p-3">合同状态</th>
              <th className="p-3">已收金额</th>
              <th className="p-3">已消耗 / 耗课</th>
              <th className="p-3">已消耗金额（估算）</th>
              <th className="p-3">剩余权益</th>
              <th className="p-3">预收负债余额（估算）</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-medium text-gray-900">{row.memberName}</td>
                <td className="p-3 text-gray-800">
                  <div className="font-mono text-xs text-gray-500">{row.orderId}</div>
                  <div>{row.productSummary}</div>
                </td>
                <td className="p-3 text-gray-700">{row.contractStatusLabel}</td>
                <td className="p-3 font-mono">{fmt(row.collectedAmount)}</td>
                <td className="p-3 text-xs text-gray-600 max-w-[200px]">{row.consumedSummary}</td>
                <td className="p-3 font-mono text-xs">{fmt(row.consumedAmountEstimate)}</td>
                <td className="p-3 text-xs text-gray-700">{row.remainingEquitySummary}</td>
                <td className="p-3 font-mono text-xs font-bold text-gray-900">{fmt(row.deferredLiabilityBalanceEstimate)}</td>
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

export default FinanceDeferredLiabilityTable;
