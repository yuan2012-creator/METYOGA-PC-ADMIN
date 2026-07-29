import React from 'react';
import type { FinanceRiskDetailRow } from '../../utils/financeSelectors';

interface FinanceRiskDetailTableProps {
  rows: FinanceRiskDetailRow[];
}

const fmtImpact = (n: number | null): string => {
  if (n === null || Number.isNaN(n)) return '—（待核对）';
  return `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无风险扫描结果</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceRiskDetailTable: React.FC<FinanceRiskDetailTableProps> = ({ rows }) => (
  <div id="finance-detail-risk-matrix" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50/80">
      <h3 className="font-bold text-lg text-gray-900">财务风险明细</h3>
      <ul className="text-xs text-gray-600 mt-3 space-y-1.5 list-disc pl-5 leading-relaxed">
        <li>汇总<strong>退款—资产—合同—分录占位</strong>链路中的典型风险；<strong>仅用于经营核对</strong>。</li>
        <li>影响金额为<strong>模块内估算</strong>；正式口径需<strong>待生成正式分录</strong>并<strong>待接入真实财务分录服务</strong>后复核。</li>
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
              <th className="p-3 pl-5">风险类型</th>
              <th className="p-3">关联对象</th>
              <th className="p-3">影响金额</th>
              <th className="p-3">当前状态</th>
              <th className="p-3 pr-5">建议处理动作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.riskTypeLabel}</td>
                <td className="p-3 text-xs text-gray-800 max-w-[280px] leading-snug">{row.relatedObjectSummary}</td>
                <td className="p-3 font-mono text-xs font-bold whitespace-nowrap">{fmtImpact(row.impactAmount)}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[260px] leading-snug">{row.currentStatusText}</td>
                <td className="p-3 pr-5 text-xs text-blue-900 max-w-[280px] leading-snug">{row.suggestedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default FinanceRiskDetailTable;
