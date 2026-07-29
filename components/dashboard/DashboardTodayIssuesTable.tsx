import React from 'react';
import type { DashboardTodayIssueRow } from '../../utils/dashboardSelectors';

interface DashboardTodayIssuesTableProps {
  rows: DashboardTodayIssueRow[];
}

const DashboardTodayIssuesTable: React.FC<DashboardTodayIssuesTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-rose-200/80 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/80">
      <h2 className="text-base font-bold text-rose-950">今日待处理问题明细</h2>
      <p className="text-xs text-rose-900/85 mt-2 leading-relaxed">
        <strong>模块内判断</strong>；<strong>待核对</strong>；<strong>不写真实任务</strong>；<strong>不自动通知责任人</strong>；<strong>待接入真实经营数据与任务系统</strong>；<strong>仅用于经营判断</strong>。
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[960px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">问题类型</th>
            <th className="p-3 whitespace-nowrap">所属门店</th>
            <th className="p-3 min-w-[160px]">关联对象</th>
            <th className="p-3 whitespace-nowrap">风险等级</th>
            <th className="p-3 min-w-[180px]">建议动作</th>
            <th className="p-3 whitespace-nowrap">责任人</th>
            <th className="p-3 whitespace-nowrap">当前状态</th>
            <th className="p-3 pr-5 min-w-[200px]">待接入说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.problemType}</td>
              <td className="p-3 text-xs text-gray-700">{row.storeLabel}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.relatedObject}</td>
              <td className="p-3 text-xs font-semibold text-rose-800 whitespace-nowrap">{row.riskLevel}</td>
              <td className="p-3 text-xs text-emerald-900 leading-snug">{row.suggestedAction}</td>
              <td className="p-3 text-xs text-violet-900 font-medium whitespace-nowrap">{row.owner}</td>
              <td className="p-3 text-xs text-gray-700 whitespace-nowrap">{row.statusLabel}</td>
              <td className="p-3 pr-5 text-xs text-gray-600 leading-snug">{row.pendingIntegrationNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DashboardTodayIssuesTable;
