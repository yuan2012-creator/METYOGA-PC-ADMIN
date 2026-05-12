import React from 'react';
import type { PartnerBrandCourseAuthRow } from '../../utils/partnerSelectors';

interface PartnerBrandCourseAuthTableProps {
  rows: PartnerBrandCourseAuthRow[];
}

const PartnerBrandCourseAuthTable: React.FC<PartnerBrandCourseAuthTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100 bg-white">
      <h3 className="text-sm font-bold text-slate-900">品牌与课程授权明细</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[1000px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">合作门店</th>
            <th className="p-3 min-w-[180px]">品牌使用范围</th>
            <th className="p-3 min-w-[200px]">课程授权范围</th>
            <th className="p-3 whitespace-nowrap">授权有效期</th>
            <th className="p-3 whitespace-nowrap">当前状态</th>
            <th className="p-3 min-w-[200px]">待核对说明</th>
            <th className="p-3 pr-5 min-w-[200px]">风险提示</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.partnerStore}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.brandScope}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.courseAuthScope}</td>
              <td className="p-3 text-xs font-mono whitespace-nowrap">{row.validityPeriod}</td>
              <td className="p-3 text-xs">{row.statusLabel}</td>
              <td className="p-3 text-xs text-amber-900 leading-snug">{row.pendingCheckNote}</td>
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

export default PartnerBrandCourseAuthTable;
