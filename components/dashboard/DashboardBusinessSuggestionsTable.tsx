import React from 'react';
import type { DashboardSuggestionRow } from '../../utils/dashboardSelectors';

interface DashboardBusinessSuggestionsTableProps {
  rows: DashboardSuggestionRow[];
}

const DashboardBusinessSuggestionsTable: React.FC<DashboardBusinessSuggestionsTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-indigo-200/80 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-indigo-100 bg-indigo-50/80">
      <h2 className="text-base font-bold text-indigo-950">经营建议明细</h2>
      <ul className="mt-2 text-xs text-indigo-900/90 space-y-1 list-disc pl-5 leading-relaxed">
        <li><strong>当前为模块内经营建议</strong>；<strong>不自动生成任务</strong>；<strong>不自动通知责任人</strong>；后续需接入<strong>真实经营数据</strong>与<strong>任务系统</strong>；<strong>仅用于经营判断</strong>。</li>
      </ul>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[900px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">建议类型</th>
            <th className="p-3 min-w-[200px]">触发原因</th>
            <th className="p-3 min-w-[200px]">建议动作</th>
            <th className="p-3 min-w-[140px]">影响范围</th>
            <th className="p-3 whitespace-nowrap">责任角色</th>
            <th className="p-3 pr-5 whitespace-nowrap">当前状态</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.suggestionType}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.triggerReason}</td>
              <td className="p-3 text-xs text-emerald-900 leading-snug">{row.suggestedAction}</td>
              <td className="p-3 text-xs text-gray-700 leading-snug">{row.impactScope}</td>
              <td className="p-3 text-xs text-violet-900 font-medium whitespace-nowrap">{row.ownerRole}</td>
              <td className="p-3 pr-5 text-xs text-gray-700 whitespace-nowrap">{row.statusLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DashboardBusinessSuggestionsTable;
