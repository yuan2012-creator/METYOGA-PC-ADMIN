import React from 'react';
import type { FinancePendingRecognitionDetailRow } from '../../utils/financeSelectors';

interface FinancePendingRecognitionTableProps {
  rows: FinancePendingRecognitionDetailRow[];
}

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center text-sm text-gray-500 space-y-2">
    <p>暂无可核对记录</p>
    <p>待接入真实财务分录</p>
    <p>当前为模块内估算</p>
  </div>
);

const FinancePendingRecognitionTable: React.FC<FinancePendingRecognitionTableProps> = ({ rows }) => (
  <div id="finance-detail-pending-recognition" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-gray-50/80">
      <h3 className="font-bold text-lg text-gray-900">待确认收入明细</h3>
      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
        <strong>待确认收入</strong>表示<strong>已发生交付或耗课</strong>、但<strong>尚未进入可核对正式分录链路</strong>的收入侧<strong>模块内估算</strong>。
        与<strong>预收负债</strong>（已收钱未完成交付）区分；本表仅为待确认 / 模块内估算口径，仅用于经营核对，待生成正式分录、待接入真实财务分录。
      </p>
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
              <th className="p-3 pl-5">课程场次</th>
              <th className="p-3">会员 / 约课</th>
              <th className="p-3">老师</th>
              <th className="p-3">耗课金额（估算）</th>
              <th className="p-3">场次 / 到课状态</th>
              <th className="p-3">待生成正式分录</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5">
                  <div className="font-bold text-gray-900">{row.sessionTitle}</div>
                  <div className="text-xs font-mono text-gray-500 mt-1">{row.id}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{row.sessionTimeLabel}</div>
                </td>
                <td className="p-3 text-xs text-gray-800">
                  <div className="font-medium text-gray-900">{row.memberSummary}</div>
                  <div className="text-gray-500 mt-1">{row.headcountSummary}</div>
                </td>
                <td className="p-3 text-gray-800">{row.teacherLabel}</td>
                <td className="p-3 font-mono text-xs">{fmt(row.consumptionAmountEstimate)}</td>
                <td className="p-3 text-xs text-gray-700">
                  <div>场次：{row.sessionStatusLabel}</div>
                  <div className="mt-1">到课：{row.attendanceStatusSummary}</div>
                </td>
                <td className="p-3 text-xs text-gray-700 max-w-[220px] leading-snug">{row.formalLedgerStatusText}</td>
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

export default FinancePendingRecognitionTable;
