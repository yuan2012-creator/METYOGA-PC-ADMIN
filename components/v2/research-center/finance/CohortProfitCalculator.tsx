import React, { useMemo } from 'react';
import { computeCohortSimulation } from '../researchCenterFinanceCalculations';
import { formatCurrency } from '../researchCenterCalculations';
import type { CohortBudgetSimulation, ResearchCenterFinanceState } from '../researchCenterFinanceModel';
import type { CohortConfig } from '../researchCenterV2.viewModel';
import { ResearchNumberField, ResearchSelect } from '../researchFormFields';

type ScenarioKey = 'current' | 'breakeven' | 'lock' | 'target' | 'full' | 'custom';

interface CohortProfitCalculatorProps {
  cohort: CohortConfig;
  actualPaidCount: number;
  budget: CohortBudgetSimulation;
  financeState: ResearchCenterFinanceState;
  onChange: (patch: Partial<CohortBudgetSimulation>) => void;
  onSaveBudget: () => void;
}

const CohortProfitCalculator: React.FC<CohortProfitCalculatorProps> = ({
  cohort,
  actualPaidCount,
  budget,
  financeState,
  onChange,
  onSaveBudget,
}) => {
  const simulation = useMemo(
    () => computeCohortSimulation(budget, cohort, financeState),
    [budget, cohort, financeState],
  );

  const scenarios: { id: ScenarioKey; label: string; count: number }[] = [
    { id: 'current', label: '当前', count: actualPaidCount },
    { id: 'breakeven', label: '直接保本', count: cohort.breakevenCount },
    { id: 'lock', label: '条件锁班', count: cohort.lockCount },
    { id: 'target', label: '目标', count: cohort.targetCount },
    { id: 'full', label: '满班', count: cohort.maxCount },
    { id: 'custom', label: '自定义', count: budget.simCount },
  ];

  return (
    <section className="met-rc-v2-card met-rc-v2-profit-calc">
      <header className="met-rc-v2-profit-calc__head">
        <div>
          <h2 className="met-rc-v2-zone__title">班期测算器</h2>
          <p className="met-rc-v2-zone__subtitle">调整测算条件模拟不同人数与成本情景，不改变实际收款记录</p>
        </div>
        <div className="met-rc-v2-profit-calc__status">
          <span>实际实缴：<strong>{actualPaidCount}人</strong></span>
          <span>当前模拟：<strong>{budget.simCount}人</strong></span>
        </div>
      </header>

      <div className="met-rc-v2-profit-calc__scenarios">
        {scenarios.map(s => (
          <button
            key={s.id}
            type="button"
            className={['met-rc-v2-profit-calc__scenario', budget.simCount === s.count && s.id !== 'custom' ? 'is-active' : '', s.id === 'custom' ? 'is-custom' : ''].filter(Boolean).join(' ')}
            onClick={() => s.id !== 'custom' && onChange({ simCount: s.count })}
          >
            {s.label}：{s.count}人
          </button>
        ))}
      </div>

      <div className="met-rc-v2-profit-calc__body">
        <div className="met-rc-v2-profit-calc__inputs">
          <div className="met-rc-v2-profit-calc__form-grid">
            <label className="met-rc-v2-profit-calc__sim-count">
              测算人数
              <div className="met-rc-v2-stepper">
                <button type="button" onClick={() => onChange({ simCount: Math.max(0, budget.simCount - 1) })}>−</button>
                <input
                  type="number"
                  className="met-rc-v2-input"
                  value={budget.simCount}
                  min={0}
                  max={cohort.maxCount}
                  onChange={e => onChange({ simCount: Math.max(0, Number(e.target.value) || 0) })}
                />
                <button type="button" onClick={() => onChange({ simCount: Math.min(cohort.maxCount, budget.simCount + 1) })}>+</button>
              </div>
            </label>
            <label>平均成交价<ResearchNumberField value={budget.avgDealPrice} onChange={v => onChange({ avgDealPrice: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>
              销售提成比例
              <ResearchSelect
                value={String(budget.commissionRate)}
                options={[
                  { value: '0', label: '0%' },
                  { value: '0.03', label: '3%' },
                  { value: '0.05', label: '5%' },
                  { value: '0.08', label: '8%' },
                  { value: '0.1', label: '10%' },
                ]}
                onChange={v => onChange({ commissionRate: Number(v) })}
              />
            </label>
            <label>导师直接成本<ResearchNumberField value={budget.mentorDirectCost} onChange={v => onChange({ mentorDirectCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>住宿交通<ResearchNumberField value={budget.accommodationCost} onChange={v => onChange({ accommodationCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>考试证书成本<ResearchNumberField value={budget.examCertCost} onChange={v => onChange({ examCertCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>教材耗材<ResearchNumberField value={budget.materialCost} onChange={v => onChange({ materialCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>其他直接成本<ResearchNumberField value={budget.otherDirectCost} onChange={v => onChange({ otherDirectCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label>分摊固定成本<ResearchNumberField value={budget.allocatedFixedCost} onChange={v => onChange({ allocatedFixedCost: v === '' ? 0 : v })} min={0} prefix="¥" /></label>
            <label className="met-rc-v2-profit-calc__toggle">
              <input
                type="checkbox"
                checked={budget.includeRenovationAmortization}
                onChange={e => onChange({ includeRenovationAmortization: e.target.checked })}
              />
              计入装修摊销
            </label>
          </div>
          <div className="met-rc-v2-profit-calc__save">
            <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={onSaveBudget}>
              保存为班期预算
            </button>
            <p className="met-rc-v2-profit-calc__hint">本次调整仅更新班期预算，不修改实际收款和实际付款</p>
          </div>
        </div>

        <div className="met-rc-v2-profit-calc__results">
          <div className="met-rc-v2-profit-calc__result-group">
            <h4 className="met-rc-v2-profit-calc__result-title">收入与直接成本</h4>
            <div className="met-rc-v2-profit-calc__result-row"><span>测算收入</span><strong>{formatCurrency(simulation.revenue)}</strong></div>
            <div className="met-rc-v2-profit-calc__result-row"><span>销售提成</span><strong>{formatCurrency(simulation.salesCommission)}</strong></div>
            <div className="met-rc-v2-profit-calc__result-row"><span>项目直接成本</span><strong>{formatCurrency(simulation.projectDirectCost)}</strong></div>
          </div>

          <div className="met-rc-v2-profit-calc__result-group met-rc-v2-profit-calc__result-group--core">
            <h4 className="met-rc-v2-profit-calc__result-title">核心结果</h4>
            <div className="met-rc-v2-profit-calc__core-item">
              <span>项目贡献利润</span>
              <strong className={simulation.contributionProfit < 0 ? 'is-danger' : 'is-brand'}>
                {formatCurrency(simulation.contributionProfit)}
              </strong>
            </div>
            <div className="met-rc-v2-profit-calc__core-item">
              <span>完整经营利润</span>
              {simulation.fullOperatingProfit !== null ? (
                <strong className={simulation.fullOperatingProfit < 0 ? 'is-danger' : 'is-brand'}>
                  {formatCurrency(simulation.fullOperatingProfit)}
                </strong>
              ) : (
                <div className="met-rc-v2-profit-calc__pending">
                  <strong className="is-muted">暂不可计算</strong>
                  <em>{simulation.fullProfitPendingReason ?? '待录入502室场地成本'}</em>
                </div>
              )}
            </div>
          </div>

          <div className="met-rc-v2-profit-calc__result-group">
            <h4 className="met-rc-v2-profit-calc__result-title">效率与门槛</h4>
            <div className="met-rc-v2-profit-calc__eff-grid">
              <div>
                <span>人均贡献</span>
                <strong>{formatCurrency(Math.round(simulation.netContributionPerStudent))}</strong>
              </div>
              <div>
                <span>利润率</span>
                <strong>{(simulation.profitMargin * 100).toFixed(1)}%</strong>
              </div>
              <div>
                <span>直接保本人数</span>
                <strong>{simulation.breakevenCount}人</strong>
              </div>
              <div>
                <span>完整经营保本人数</span>
                <strong>{simulation.fullBreakevenCount != null ? `${simulation.fullBreakevenCount}人` : '暂不可计算'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CohortProfitCalculator;
