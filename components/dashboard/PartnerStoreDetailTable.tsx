import React from 'react';
import type { PartnerStoreDetailRow } from '../../utils/partnerSelectors';

interface PartnerStoreDetailTableProps {
  rows: PartnerStoreDetailRow[];
}

const PartnerStoreDetailTable: React.FC<PartnerStoreDetailTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 bg-white">
      <h3 className="text-sm font-bold text-slate-900">合作门店明细</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[900px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">合作门店</th>
            <th className="p-3 whitespace-nowrap">合作类型</th>
            <th className="p-3 whitespace-nowrap">授权状态</th>
            <th className="p-3 whitespace-nowrap">服务等级</th>
            <th className="p-3 min-w-[160px]">所属城市 / 区域</th>
            <th className="p-3 min-w-[180px]">当前阶段</th>
            <th className="p-3 pr-5 min-w-[220px]">风险提示</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.partnerStore}</td>
              <td className="p-3 text-xs">{row.cooperationType}</td>
              <td className="p-3 text-xs">{row.authorizationStatus}</td>
              <td className="p-3 text-xs">{row.serviceLevel}</td>
              <td className="p-3 text-xs text-gray-700">{row.cityRegion}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.currentPhase}</td>
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
  </div>
);

export default PartnerStoreDetailTable;
