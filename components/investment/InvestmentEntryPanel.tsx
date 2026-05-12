import React from 'react';
import type { InvestmentFullModel } from '../../utils/investmentSelectors';
import { formatInvestmentMoney } from '../../utils/investmentSelectors';

interface InvestmentEntryPanelProps {
  model: InvestmentFullModel;
  onMonthlyReportDemo: () => void;
}

const Disclosure = () => (
  <div className="rounded-2xl border border-violet-200 bg-violet-50/90 px-5 py-4 text-sm text-violet-950 leading-relaxed">
    <p className="font-bold text-violet-950 mb-1">投资测算明细（第六阶段）</p>
    <ul className="list-disc pl-5 space-y-1 text-xs">
      <li><strong>当前为模块内测算</strong>；<strong>不代表正式投资报告</strong>；<strong>不代表真实财务预测</strong>；后续需接入<strong>真实经营数据</strong>；<strong>不生成正式投资报告</strong>；<strong>不生成正式月报</strong>；<strong>仅用于投资判断</strong>；<strong>测算结果需人工复核</strong>。</li>
    </ul>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="p-3 text-left text-xs font-bold text-gray-500 bg-gray-50 border-b border-gray-100 whitespace-nowrap">{children}</th>
);

const TdMoney = ({ children }: { children: React.ReactNode }) => (
  <td className="p-3 font-mono text-sm text-gray-900">{children}</td>
);

const InvestmentEntryPanel: React.FC<InvestmentEntryPanelProps> = ({ model, onMonthlyReportDemo }) => (
  <div className="space-y-6">
    <Disclosure />

    {/* 1. 项目基础信息明细 */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">项目基础信息明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr>
              <Th>项目名称</Th>
              <Th>所属门店 / 拟开门店</Th>
              <Th>面积</Th>
              <Th>项目阶段</Th>
              <Th>预计开业时间</Th>
              <Th>测算状态</Th>
              <Th className="min-w-[220px]">风险提示</Th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50">
              <td className="p-3 font-bold text-gray-900">{model.projectDetail.projectName}</td>
              <td className="p-3 text-xs text-gray-800">{model.projectDetail.storeLabel}</td>
              <td className="p-3 text-xs">{model.projectDetail.areaSqm} ㎡（演示）</td>
              <td className="p-3 text-xs text-gray-700">{model.projectDetail.projectPhase}</td>
              <td className="p-3 text-xs">{model.projectDetail.expectedOpening}</td>
              <td className="p-3 text-xs font-medium text-amber-800">{model.projectDetail.calcStatusLabel}</td>
              <td className="p-3 text-xs text-orange-900">
                <ul className="list-disc pl-4 space-y-1">
                  {model.projectDetail.riskHints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* 2. 一次性投入明细 */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">一次性投入明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead>
            <tr>
              <Th>装修费用</Th>
              <Th>设备费用</Th>
              <Th>房租押金</Th>
              <Th>首期租金</Th>
              <Th>开办物料</Th>
              <Th>人员筹备成本</Th>
              <Th>其他一次性投入</Th>
              <Th>合计金额</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TdMoney>{formatInvestmentMoney(model.capex.renovation)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.capex.equipment)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.capex.rentDeposit)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.capex.firstRent)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.capex.openingSupplies)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.capex.staffPrep)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.capex.other)}</TdMoney>
              <td className="p-3 font-mono text-sm font-bold text-gray-900">{formatInvestmentMoney(model.capex.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="px-5 py-2 text-[10px] text-gray-500 border-t border-gray-50">模块内测算；待核对；不写真实财务数据。</p>
    </div>

    {/* 3. 月固定成本明细 */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">月固定成本明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead>
            <tr>
              <Th>房租</Th>
              <Th>物业</Th>
              <Th>人员底薪</Th>
              <Th>社保 / 福利</Th>
              <Th>水电杂费</Th>
              <Th>市场费用</Th>
              <Th>系统 / 运营费用</Th>
              <Th>其他固定支出</Th>
              <Th>合计金额</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.rent)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.propertyMgmt)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.basePayroll)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.socialBenefits)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.utilities)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.marketing)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.systemOps)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.monthlyFixedLines.otherFixed)}</TdMoney>
              <td className="p-3 font-mono text-sm font-bold">{formatInvestmentMoney(model.monthlyFixedLines.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="px-5 py-2 text-[10px] text-gray-500 border-t border-gray-50">模块内测算；待接入真实经营数据。</p>
    </div>

    {/* 4. 产能与收入测算明细 */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">产能与收入测算明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead>
            <tr>
              <Th>瑜伽团课产能</Th>
              <Th>普拉提小班产能</Th>
              <Th>私教产能</Th>
              <Th>教培产能</Th>
              <Th>预计满课率</Th>
              <Th>预计客单价</Th>
              <Th>月收入测算</Th>
              <Th className="min-w-[200px]">风险提示</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 font-mono text-sm">{model.capacityRevenue.yogaGroupCapacityPerWeek} 场/周</td>
              <td className="p-3 font-mono text-sm">{model.capacityRevenue.pilatesSmallCapacityPerWeek} 场/周</td>
              <td className="p-3 font-mono text-sm">{model.capacityRevenue.privateCapacityPerWeek} 档/周</td>
              <td className="p-3 font-mono text-sm">{model.capacityRevenue.ttcCapacityPerMonth} 人/月</td>
              <td className="p-3 font-mono text-sm">{model.capacityRevenue.expectedOccupancyPct}%</td>
              <td className="p-3 font-mono text-sm">¥{model.capacityRevenue.expectedArpuYuan}</td>
              <td className="p-3 font-mono text-sm font-bold">{formatInvestmentMoney(model.capacityRevenue.monthlyRevenueEstimate)}</td>
              <td className="p-3 text-xs text-orange-900">
                <ul className="list-disc pl-4 space-y-1">
                  {model.capacityRevenue.riskHints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* 5. 保本线与回本周期明细 */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">保本线与回本周期明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr>
              <Th>月固定成本</Th>
              <Th>月收入测算</Th>
              <Th>月净现金流估算</Th>
              <Th>保本收入</Th>
              <Th>保本课消</Th>
              <Th>预计回本周期</Th>
              <Th className="min-w-[240px]">敏感性提示</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TdMoney>{formatInvestmentMoney(model.breakevenDetail.monthlyFixedCost)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.breakevenDetail.monthlyRevenueEstimate)}</TdMoney>
              <TdMoney className={model.breakevenDetail.monthlyNetCashEstimate >= 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                {formatInvestmentMoney(model.breakevenDetail.monthlyNetCashEstimate)}
              </TdMoney>
              <TdMoney>{formatInvestmentMoney(model.breakevenDetail.breakevenRevenue)}</TdMoney>
              <td className="p-3 font-mono text-sm">{model.breakevenDetail.breakevenClassConsumptionPerMonth} 节/月（演示）</td>
              <td className="p-3 text-xs font-bold">约 {model.breakevenDetail.paybackMonthsReference} 个月（待核对）</td>
              <td className="p-3 text-xs text-gray-800 leading-snug">
                <p>{model.breakevenDetail.sensitivityHint}</p>
                <ul className="list-disc pl-4 mt-2 text-orange-900 space-y-1">
                  {model.breakevenDetail.riskHints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* 6. 投资人月报入口 */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/80">
        <h3 className="text-sm font-bold text-gray-900">投资人月报入口（演示汇总）</h3>
        <button type="button" onClick={onMonthlyReportDemo} className="met-primary-button text-xs">
          <i className="fa-solid fa-file-lines mr-2" aria-hidden />
          打开月报演示（不生成正式月报）
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr>
              <Th>期间</Th>
              <Th>本月实收</Th>
              <Th>本月退款</Th>
              <Th>本月净收款</Th>
              <Th>本月固定成本</Th>
              <Th>本月现金流估算</Th>
              <Th>与测算偏差</Th>
              <Th className="min-w-[200px]">风险提示</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 text-xs font-bold text-gray-800">{model.investorMonthlyFlash.monthLabel}</td>
              <TdMoney>{formatInvestmentMoney(model.investorMonthlyFlash.cashIn)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.investorMonthlyFlash.refund)}</TdMoney>
              <TdMoney className="font-bold">{formatInvestmentMoney(model.investorMonthlyFlash.netCollection)}</TdMoney>
              <TdMoney>{formatInvestmentMoney(model.investorMonthlyFlash.fixedCost)}</TdMoney>
              <TdMoney className="text-emerald-700 font-bold">{formatInvestmentMoney(model.investorMonthlyFlash.cashFlowEstimate)}</TdMoney>
              <td className="p-3 text-xs text-amber-900 leading-snug">{model.investorMonthlyFlash.vsModelDeviationNote}</td>
              <td className="p-3 text-xs text-orange-900">
                <ul className="list-disc pl-4 space-y-1">
                  {model.investorMonthlyFlash.riskHints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* 中长期现金流预测 + 敏感性（保留） */}
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">中长期现金流预测（演示月份）</h3>
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
      <p className="text-[10px] text-gray-500 mt-3">模块内测算占位；不生成正式投资报告；后续需接入真实经营数据。</p>
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
