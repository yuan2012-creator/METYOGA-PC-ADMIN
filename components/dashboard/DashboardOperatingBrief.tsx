import React from 'react';
import type { DashboardOperatingZoneCard } from '../../utils/dashboardSelectors';

interface DashboardOperatingBriefProps {
  zones: DashboardOperatingZoneCard[];
}

const DashboardOperatingBrief: React.FC<DashboardOperatingBriefProps> = ({ zones }) => (
  <div className="rounded-[18px] border border-amber-200/90 bg-amber-50/90 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-amber-200/70 bg-amber-50/95">
      <h2 className="text-base font-bold text-amber-950">经营总览 · 问题与动作入口（第六阶段）</h2>
      <ul className="mt-2 text-xs text-amber-950/90 space-y-1 list-disc pl-5 leading-relaxed">
        <li><strong>问题优先 · 动作优先 · 责任人优先</strong>；不做纯数据大屏。</li>
        <li><strong>当前为模块内展示</strong>；<strong>待接入真实经营数据</strong>；<strong>仅用于经营判断</strong>；<strong>不生成正式报告</strong>；<strong>不同步财务</strong>。</li>
      </ul>
    </div>
    {!zones.length ? (
      <div className="p-8 text-center text-sm text-gray-600">暂无可展示条目（演示）</div>
    ) : (
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-white/60">
        {zones.map(z => (
          <div
            key={z.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-2 min-h-[168px]"
          >
            <div className="text-xs font-black text-gray-400 uppercase tracking-wide">{z.title}</div>
            <p className="text-sm font-bold text-gray-900 leading-snug">{z.problem}</p>
            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              <span className="text-gray-500 font-bold mr-1">动作</span>
              {z.action}
            </p>
            <p className="text-xs text-violet-900 font-medium">
              <span className="text-gray-500 font-bold mr-1">责任人</span>
              {z.owner}
            </p>
            <p className="text-[11px] text-gray-500 mt-auto pt-2 border-t border-gray-50 leading-snug">{z.metricLine}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DashboardOperatingBrief;
