import React from 'react';
import type { StaffTeacherArchiveDetailRow } from '../../utils/staffSelectors';

const fmtInt = (n: number) => n.toLocaleString('zh-CN');

interface StaffTeacherArchiveDetailTableProps {
  rows: StaffTeacherArchiveDetailRow[];
}

const StaffTeacherArchiveDetailTable: React.FC<StaffTeacherArchiveDetailTableProps> = ({ rows }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-sky-50/60">
      <h3 className="font-bold text-lg text-gray-900">老师档案明细</h3>
      <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
        <li>
          <strong>当前为模块内估算</strong>；<strong>不生成工资单</strong>；<strong>不代表已结算</strong>；后续需接入<strong>正式课时费规则</strong>与<strong>财务结算</strong>；<strong>仅用于经营核对</strong>。
        </li>
        <li>本月课程数 / 本月课时数：按当月 mock 场次汇总；课时按「每场 1 课时」模块内折算（待接入规则后以对账为准）。</li>
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
              <th className="p-3 pl-5">老师姓名</th>
              <th className="p-3">老师类型 / 角色</th>
              <th className="p-3">当前等级</th>
              <th className="p-3">所属门店</th>
              <th className="p-3">可授课类型</th>
              <th className="p-3">本月课程数</th>
              <th className="p-3">本月课时数</th>
              <th className="p-3">当前状态</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 text-xs text-gray-800 max-w-[140px] leading-snug">{row.typeRoleLabel}</td>
                <td className="p-3 text-xs">{row.currentLevelLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[160px] leading-snug">{row.storeLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[200px] leading-snug">{row.teachableTypes}</td>
                <td className="p-3 font-mono text-xs">{fmtInt(row.monthCourseCount)}</td>
                <td className="p-3 font-mono text-xs">{fmtInt(row.monthLessonHoursEstimate)}</td>
                <td className="p-3 text-xs text-gray-800">{row.statusLabel}</td>
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
    )}
  </div>
);

export default StaffTeacherArchiveDetailTable;
