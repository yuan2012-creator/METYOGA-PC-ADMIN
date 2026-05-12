import React from 'react';
import type { StaffPermissionAuditDetailRow } from '../../utils/staffSelectors';

interface StaffPermissionAuditDetailTableProps {
  rows: StaffPermissionAuditDetailRow[];
}

const StaffPermissionAuditDetailTable: React.FC<StaffPermissionAuditDetailTableProps> = ({ rows }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-zinc-100/80">
      <h3 className="font-bold text-lg text-gray-900">权限审计明细</h3>
      <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
        <li>
          <strong>当前为只读审计入口</strong>；<strong>不修改员工权限</strong>；<strong>不生成审批记录</strong>；后续需接入<strong>角色权限与操作日志</strong>；<strong>仅用于经营核对</strong>。
        </li>
      </ul>
    </div>
    {!rows.length ? (
      <div className="p-10 text-center text-sm text-gray-600 space-y-2 leading-relaxed">
        <p className="font-medium text-gray-800">暂无可核对记录</p>
        <p>待接入统一规则配置</p>
        <p>待接入权限审计</p>
        <p>当前为模块内展示</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">角色 / 人员</th>
              <th className="p-3">当前权限范围</th>
              <th className="p-3">敏感操作范围</th>
              <th className="p-3">审计状态</th>
              <th className="p-3">待接入说明</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.roleOrPersonLabel}</td>
                <td className="p-3 text-xs text-gray-800 font-medium">{row.permissionScopeLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[240px] leading-snug">{row.sensitiveOpsSummary}</td>
                <td className="p-3 text-xs text-zinc-800 whitespace-nowrap">{row.auditStatusLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[260px] leading-snug">{row.pendingIntegrationNote}</td>
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

export default StaffPermissionAuditDetailTable;
