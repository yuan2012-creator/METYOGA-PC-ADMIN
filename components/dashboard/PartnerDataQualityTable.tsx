import React from 'react';
import type { PartnerDataQualityRow } from '../../utils/partnerSelectors';

interface PartnerDataQualityTableProps {
  rows: PartnerDataQualityRow[];
}

const PartnerDataQualityTable: React.FC<PartnerDataQualityTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 bg-white">
      <h3 className="text-sm font-bold text-slate-900">数据回传与经营质检明细</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[1000px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">合作门店</th>
            <th className="p-3 whitespace-nowrap">数据回传状态</th>
            <th className="p-3 whitespace-nowrap">最近回传时间</th>
            <th className="p-3 whitespace-nowrap">经营数据完整度</th>
            <th className="p-3 whitespace-nowrap">质检状态</th>
            <th className="p-3 min-w-[200px]">质检问题</th>
            <th className="p-3 pr-5 min-w-[220px]">建议动作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.partnerStore}</td>
              <td className="p-3 text-xs">{row.backhaulStatus}</td>
              <td className="p-3 text-xs font-mono whitespace-nowrap">{row.lastBackhaulAt}</td>
              <td className="p-3 text-xs">{row.dataCompleteness}</td>
              <td className="p-3 text-xs">{row.qcStatus}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.qcIssues}</td>
              <td className="p-3 pr-5 text-xs text-emerald-900 leading-snug">{row.suggestedAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PartnerDataQualityTable;
