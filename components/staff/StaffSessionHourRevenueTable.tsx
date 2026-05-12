import React from 'react';
import type { StaffSessionHourRevenueRow } from '../../utils/staffSelectors';

const fmtMoney = (n: number) => `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;
const fmtInt = (n: number) => n.toLocaleString('zh-CN');

interface StaffSessionHourRevenueTableProps {
  rows: StaffSessionHourRevenueRow[];
}

const StaffSessionHourRevenueTable: React.FC<StaffSessionHourRevenueTableProps> = ({ rows }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-cyan-50/50">
      <h3 className="font-bold text-lg text-gray-900">课时收入明细</h3>
      <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
        <li>
          <strong>当前为模块内估算</strong>；<strong>不生成工资单</strong>；<strong>不代表已结算</strong>；后续需接入<strong>正式课时费规则</strong>与<strong>财务结算</strong>；<strong>仅用于经营核对</strong>。
        </li>
        <li>课时费估算为前端演示系数，<strong>待接入规则</strong>后以财务与排课事实为准。</li>
      </ul>
    </div>
    {!rows.length ? (
      <div className="p-10 text-center text-sm text-gray-600 space-y-2 leading-relaxed">
        <p className="font-medium text-gray-800">暂无可核对记录</p>
        <p>待接入正式课时费规则</p>
        <p>当前为模块内估算</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">老师</th>
              <th className="p-3">课程场次</th>
              <th className="p-3">课程类型</th>
              <th className="p-3">上课时间</th>
              <th className="p-3">到课人数</th>
              <th className="p-3">课时费规则说明</th>
              <th className="p-3">课时费估算</th>
              <th className="p-3">当前状态</th>
              <th className="p-3 pr-5">待核对说明</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 text-xs text-gray-800 max-w-[200px] leading-snug">{row.sessionTitle}</td>
                <td className="p-3 text-xs">{row.courseType}</td>
                <td className="p-3 text-xs font-mono whitespace-nowrap">{row.startDisplay}</td>
                <td className="p-3 font-mono text-xs">{fmtInt(row.headcount)}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[260px] leading-snug">{row.feeRuleNote}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmtMoney(row.feeEstimate)}</td>
                <td className="p-3 text-xs text-gray-800">{row.statusLabel}</td>
                <td className="p-3 pr-5 text-xs text-amber-900 max-w-[280px] leading-snug">{row.pendingCheckNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default StaffSessionHourRevenueTable;
