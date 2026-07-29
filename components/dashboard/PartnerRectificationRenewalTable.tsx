import React from 'react';
import type { PartnerRectificationRenewalRow } from '../../utils/partnerSelectors';

interface PartnerRectificationRenewalTableProps {
  rows: PartnerRectificationRenewalRow[];
}

const PartnerRectificationRenewalTable: React.FC<PartnerRectificationRenewalTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 bg-white">
      <h3 className="text-sm font-bold text-slate-900">整改与续约 / 退出风险明细</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[1000px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">合作门店</th>
            <th className="p-3 whitespace-nowrap">问题类型</th>
            <th className="p-3 min-w-[220px]">整改要求</th>
            <th className="p-3 whitespace-nowrap">责任人</th>
            <th className="p-3 whitespace-nowrap">当前状态</th>
            <th className="p-3 min-w-[200px]">续约风险</th>
            <th className="p-3 pr-5 min-w-[240px]">退出 / 摘牌风险提示</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.partnerStore}</td>
              <td className="p-3 text-xs text-gray-800">{row.problemType}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.rectificationRequirement}</td>
              <td className="p-3 text-xs text-violet-900 font-medium whitespace-nowrap">{row.owner}</td>
              <td className="p-3 text-xs">{row.statusLabel}</td>
              <td className="p-3 text-xs text-amber-900 leading-snug">{row.renewalRisk}</td>
              <td className="p-3 pr-5 text-xs text-red-900/90 leading-snug">{row.exitDelistingRiskHint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PartnerRectificationRenewalTable;
