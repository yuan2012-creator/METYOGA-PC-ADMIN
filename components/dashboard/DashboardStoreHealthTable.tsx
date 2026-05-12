import React from 'react';
import type { DashboardStoreHealthRow } from '../../utils/dashboardSelectors';

interface DashboardStoreHealthTableProps {
  rows: DashboardStoreHealthRow[];
}

const DashboardStoreHealthTable: React.FC<DashboardStoreHealthTableProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-emerald-200/80 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/80">
      <h2 className="text-base font-bold text-emerald-950">门店健康明细</h2>
      <p className="text-xs text-emerald-900/85 mt-2 leading-relaxed">
        <strong>模块内判断</strong>；<strong>待核对</strong>；<strong>待接入真实经营数据</strong>；<strong>仅用于经营判断</strong>。
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[1100px]">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
          <tr>
            <th className="p-3 pl-5 whitespace-nowrap">门店</th>
            <th className="p-3 min-w-[140px]">经营状态</th>
            <th className="p-3 min-w-[120px]">预约情况</th>
            <th className="p-3 min-w-[120px]">到课情况</th>
            <th className="p-3 min-w-[120px]">收款情况</th>
            <th className="p-3 min-w-[120px]">退款风险</th>
            <th className="p-3 min-w-[120px]">老师执行</th>
            <th className="p-3 min-w-[120px]">会员风险</th>
            <th className="p-3 pr-5 min-w-[200px]">综合提示</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.storeName}</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">{row.businessStatus}</td>
              <td className="p-3 text-xs text-gray-700 leading-snug">{row.bookingSummary}</td>
              <td className="p-3 text-xs text-gray-700 leading-snug">{row.attendanceSummary}</td>
              <td className="p-3 text-xs text-gray-700 leading-snug">{row.collectionSummary}</td>
              <td className="p-3 text-xs text-amber-900 leading-snug">{row.refundRiskSummary}</td>
              <td className="p-3 text-xs text-gray-700 leading-snug">{row.teacherExecSummary}</td>
              <td className="p-3 text-xs text-gray-700 leading-snug">{row.memberRiskSummary}</td>
              <td className="p-3 pr-5 text-xs text-gray-800 font-medium leading-snug">{row.holisticHint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DashboardStoreHealthTable;
