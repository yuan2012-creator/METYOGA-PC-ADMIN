import React from 'react';
import type { InvestmentBreakevenModel } from '../../utils/investmentSelectors';
import { formatInvestmentMoney } from '../../utils/investmentSelectors';

interface InvestmentEntryPanelProps {
  model: InvestmentBreakevenModel;
  onMonthlyReportDemo: () => void;
}

const InvestmentEntryPanel: React.FC<InvestmentEntryPanelProps> = ({ model, onMonthlyReportDemo }) => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-violet-200 bg-violet-50/90 px-5 py-4 text-sm text-violet-950 leading-relaxed">
      <p className="font-bold text-violet-950 mb-1">投资测算（第六阶段入口）</p>
      <ul className="list-disc pl-5 space-y-1 text-xs">
        <li><strong>当前为模块内测算</strong>；<strong>不代表真实财务预测</strong>；后续需接入<strong>真实经营数据</strong>；<strong>不生成正式报告</strong>；<strong>仅用于经营判断</strong>。</li>
      </ul>
    </div>

    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">项目基础信息</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        <div><span className="text-gray-400">项目名称</span><div className="font-bold text-gray-900 mt-1">{model.basics.projectName}</div></div>
        <div><span className="text-gray-400">城市 / 商圈</span><div className="font-bold text-gray-900 mt-1">{model.basics.city}</div></div>
        <div><span className="text-gray-400">门店模型</span><div className="font-bold text-gray-900 mt-1">{model.basics.storeModel}</div></div>
        <div><span className="text-gray-400">计划开业</span><div className="font-bold text-gray-900 mt-1">{model.basics.openingMonth}</div></div>
        <div><span className="text-gray-400">容纳能力（演示）</span><div className="font-bold text-gray-900 mt-1">{model.basics.seatCapacity} 席</div></div>
        <div className="col-span-2 md:col-span-3 text-gray-500 leading-snug">{model.basics.remark}</div>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="text-[10px] text-gray-400 font-bold uppercase">一次性投入</div>
        <div className="text-xl font-mono font-bold mt-1">{formatInvestmentMoney(model.oneTimeCapex)}</div>
        <p className="text-[10px] text-gray-500 mt-2">模块内测算；待核对</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="text-[10px] text-gray-400 font-bold uppercase">月固定成本</div>
        <div className="text-xl font-mono font-bold mt-1">{formatInvestmentMoney(model.monthlyFixedCost)}</div>
        <p className="text-[10px] text-gray-500 mt-2">不含变动课时结算（演示）</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="text-[10px] text-gray-400 font-bold uppercase">保本线（月收入）</div>
        <div className="text-xl font-mono font-bold mt-1">{formatInvestmentMoney(model.breakevenMonthlyRevenue)}</div>
        <p className="text-[10px] text-gray-500 mt-2">模块内测算；待接入真实经营数据</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="text-[10px] text-gray-400 font-bold uppercase">回本周期（参考）</div>
        <div className="text-xl font-mono font-bold mt-1">约 {model.paybackMonthsReference} 个月</div>
        <p className="text-[10px] text-gray-500 mt-2">不代表真实财务预测；待核对</p>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">课程 / 私教 / 小班 / 教培产能（周或月口径 · 演示）</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-gray-400">团课（场 / 周）</div>
          <div className="text-lg font-mono font-bold mt-1">{model.capacity.groupClassesPerWeek}</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-gray-400">私教（档 / 周）</div>
          <div className="text-lg font-mono font-bold mt-1">{model.capacity.privateSlotsPerWeek}</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-gray-400">小班（场 / 周）</div>
          <div className="text-lg font-mono font-bold mt-1">{model.capacity.smallClassSlotsPerWeek}</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-gray-400">教培席位（人 / 月）</div>
          <div className="text-lg font-mono font-bold mt-1">{model.capacity.ttcSeatsPerMonth}</div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-gray-900">现金流预测（演示月份）</h3>
        <button
          type="button"
          onClick={onMonthlyReportDemo}
          className="met-primary-button text-xs"
        >
          <i className="fa-solid fa-file-lines mr-2" aria-hidden />
          投资人月报入口（演示）
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-2 pr-4">月份</th>
              <th className="py-2 pr-4">流入（演示）</th>
              <th className="py-2 pr-4">流出（演示）</th>
              <th className="py-2">净额（演示）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-mono text-xs">
            {model.cashFlowForecast.map(row => (
              <tr key={row.month}>
                <td className="py-2 pr-4 font-bold text-gray-800">{row.month}</td>
                <td className="py-2 pr-4">{formatInvestmentMoney(row.inflow)}</td>
                <td className="py-2 pr-4">{formatInvestmentMoney(row.outflow)}</td>
                <td className={`py-2 font-bold ${row.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatInvestmentMoney(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-500 mt-3">以上为模块内测算占位；不生成正式投资报告；后续需接入真实经营数据。</p>
    </div>

    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3">敏感性分析（模块内测算）</h3>
      <ul className="space-y-2 text-xs text-gray-700">
        {model.sensitivityScenarios.map(s => (
          <li key={s.name} className="flex gap-2">
            <span className="font-bold text-gray-900 shrink-0">{s.name}</span>
            <span className="leading-snug">{s.impactNote}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default InvestmentEntryPanel;
