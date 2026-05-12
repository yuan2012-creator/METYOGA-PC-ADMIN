import React from 'react';
import type { StaffTeachingQualityRiskDetailRow } from '../../utils/staffSelectors';

interface StaffTeachingQualityRiskDetailTableProps {
  rows: StaffTeachingQualityRiskDetailRow[];
}

const StaffTeachingQualityRiskDetailTable: React.FC<StaffTeachingQualityRiskDetailTableProps> = ({ rows }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-teal-50/70">
      <h3 className="font-bold text-lg text-gray-900">教学质量风险明细</h3>
      <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
        <li>
          <strong>当前为模块内展示</strong>；<strong>不生成正式考核结果</strong>；后续需接入<strong>教学质量评价</strong>；<strong>仅用于经营核对</strong>。
        </li>
      </ul>
    </div>
    {!rows.length ? (
      <div className="p-10 text-center text-sm text-gray-600 space-y-2 leading-relaxed">
        <p className="font-medium text-gray-800">暂无可核对记录</p>
        <p>待接入成长规则</p>
        <p>待接入教学质量评价</p>
        <p>当前为模块内展示</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">老师姓名</th>
              <th className="p-3">课程执行情况</th>
              <th className="p-3">满课 / 到课 / 缺席摘要</th>
              <th className="p-3">会员反馈或待关注项</th>
              <th className="p-3">教学质量状态</th>
              <th className="p-3">风险提示</th>
              <th className="p-3 pr-5">建议处理动作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[200px] leading-snug">{row.courseExecutionSummary}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[240px] leading-snug">{row.attendanceSummary}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[240px] leading-snug">{row.feedbackOrWatchSummary}</td>
                <td className="p-3 text-xs text-teal-900 font-medium whitespace-nowrap">{row.teachingQualityStatusLabel}</td>
                <td className="p-3 text-xs text-orange-900 max-w-[220px]">
                  <ul className="list-disc pl-4 space-y-1">
                    {row.riskHints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 pr-5 text-xs text-gray-800 max-w-[260px] leading-snug">{row.suggestedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default StaffTeachingQualityRiskDetailTable;
