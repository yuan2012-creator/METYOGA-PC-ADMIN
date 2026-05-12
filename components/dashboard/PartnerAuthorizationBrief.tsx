import React from 'react';
import type { PartnerAuthorizationRow } from '../../utils/partnerSelectors';

interface PartnerAuthorizationBriefProps {
  rows: PartnerAuthorizationRow[];
}

const PartnerAuthorizationBrief: React.FC<PartnerAuthorizationBriefProps> = ({ rows }) => (
  <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/90">
      <h2 className="text-base font-bold text-slate-900">合作授权 · 治理入口（第六阶段）</h2>
      <ul className="mt-2 text-xs text-slate-600 space-y-1 list-disc pl-5 leading-relaxed">
        <li><strong>当前为授权治理入口</strong>；<strong>不自动变更授权状态</strong>；<strong>不生成正式合同或整改通知</strong>；<strong>待接入授权服务</strong>；<strong>仅用于经营判断</strong>。</li>
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
        <table className="w-full text-left text-sm min-w-[1100px]">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5 whitespace-nowrap">合作门店</th>
              <th className="p-3 whitespace-nowrap">授权状态</th>
              <th className="p-3 min-w-[140px]">品牌使用规范</th>
              <th className="p-3 min-w-[120px]">数据回传</th>
              <th className="p-3 min-w-[120px]">质检记录</th>
              <th className="p-3 min-w-[120px]">课程授权</th>
              <th className="p-3 whitespace-nowrap">系统服务等级</th>
              <th className="p-3 min-w-[120px]">整改记录</th>
              <th className="p-3 min-w-[120px]">续约 / 退出提示</th>
              <th className="p-3 pr-5 min-w-[200px]">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900 whitespace-nowrap">{row.partnerStore}</td>
                <td className="p-3 text-xs">{row.authorizationStatus}</td>
                <td className="p-3 text-xs text-gray-700 leading-snug">{row.brandUsage}</td>
                <td className="p-3 text-xs text-gray-700 leading-snug">{row.dataBackhaul}</td>
                <td className="p-3 text-xs text-gray-700 leading-snug">{row.qualityRecord}</td>
                <td className="p-3 text-xs text-gray-700 leading-snug">{row.courseAuthorization}</td>
                <td className="p-3 text-xs whitespace-nowrap">{row.serviceLevel}</td>
                <td className="p-3 text-xs text-gray-700 leading-snug">{row.rectificationRecord}</td>
                <td className="p-3 text-xs text-amber-900 leading-snug">{row.renewalExitHint}</td>
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

export default PartnerAuthorizationBrief;
