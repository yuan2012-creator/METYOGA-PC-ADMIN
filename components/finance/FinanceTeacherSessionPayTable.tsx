import React from 'react';
import type { FinanceTeacherSessionPayCheckRow } from '../../utils/financeSelectors';

interface FinanceTeacherSessionPayTableProps {
  rows: FinanceTeacherSessionPayCheckRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无可核对记录</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinanceTeacherSessionPayTable: React.FC<FinanceTeacherSessionPayTableProps> = ({ rows }) => (
  <div id="finance-detail-teacher-session-pay" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50/80">
      <h3 className="font-bold text-lg text-gray-900">老师课时费核对</h3>
      <ul className="text-xs text-gray-600 mt-3 space-y-1.5 list-disc pl-5 leading-relaxed">
        <li>当前为<strong>模块内估算</strong>；<strong>不生成工资单</strong>。</li>
        <li><strong>不代表</strong>门店或总部已完成任何费用闭合；<strong>仅用于经营核对</strong>。</li>
        <li>后续需接入<strong>老师课时费规则</strong>与<strong>正式结算流程</strong>，并<strong>待接入真实财务分录服务</strong>。</li>
      </ul>
    </div>
    {rows.length === 0 ? (
      <div className="p-6">
        <Empty />
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">老师</th>
              <th className="p-3">课程场次</th>
              <th className="p-3">课程类型</th>
              <th className="p-3">到课人数</th>
              <th className="p-3">规则 / 估算说明</th>
              <th className="p-3">课时费金额</th>
              <th className="p-3">当前状态</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 text-gray-800">
                  <div className="font-medium">{row.sessionTitle}</div>
                  <div className="text-[11px] font-mono text-gray-500 mt-1">{row.sessionId}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{row.sessionTimeLabel}</div>
                </td>
                <td className="p-3 text-xs text-gray-700">{row.courseTypeLabel}</td>
                <td className="p-3 text-xs text-gray-700">{row.headcountSummary}</td>
                <td className="p-3 text-xs text-gray-600 max-w-[260px] leading-snug">{row.ruleOrEstimateSummary}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmt(row.amount)}</td>
                <td className="p-3 text-xs text-gray-800">{row.statusLabel}</td>
                <td className="p-3 pr-5 text-xs text-orange-800">
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

export default FinanceTeacherSessionPayTable;
