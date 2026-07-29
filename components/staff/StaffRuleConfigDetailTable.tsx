import React from 'react';
import type { StaffRuleConfigDetailRow } from '../../utils/staffSelectors';

interface StaffRuleConfigDetailTableProps {
  rows: StaffRuleConfigDetailRow[];
}

const StaffRuleConfigDetailTable: React.FC<StaffRuleConfigDetailTableProps> = ({ rows }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-100 bg-slate-100/90">
      <h3 className="font-bold text-lg text-gray-900">规则配置明细</h3>
      <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
        <li>
          <strong>当前为模块内展示</strong>；<strong>尚未接入真实规则引擎</strong>；<strong>不自动应用到老师工资、等级、权限</strong>；后续需接入<strong>统一规则配置</strong>；<strong>仅用于经营核对</strong>。
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
              <th className="p-3 pl-5">规则类型</th>
              <th className="p-3">适用对象</th>
              <th className="p-3">当前配置状态</th>
              <th className="p-3">影响范围</th>
              <th className="p-3">待接入说明</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.ruleTypeLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[200px] leading-snug">{row.applicabilityLabel}</td>
                <td className="p-3 text-xs text-gray-800">{row.configStatusLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[240px] leading-snug">{row.impactScope}</td>
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

export default StaffRuleConfigDetailTable;
