import React, { useCallback, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import CohortProfitCalculator from './finance/CohortProfitCalculator';
import FinanceConclusionBar, { CohortFinanceSwitch, FinanceKeyResults } from './finance/FinanceConclusionBar';
import FinanceDataCompleteness from './finance/FinanceDataCompleteness';
import CashPlanPanel from './finance/CashPlanPanel';
import ProfitComposition, { type ProfitCompositionLine } from './finance/ProfitComposition';
import RenovationFinancePanel, { FixedCostManager, PaybackScenarioCalculator } from './finance/RenovationFinancePanel';
import {
  buildFinanceCompletenessFields,
  buildFinanceConclusion,
  computeCohortSimulation,
  computeFinanceCompletenessPercent,
} from './researchCenterFinanceCalculations';
import { formatCurrency } from './researchCenterCalculations';
import type { FinanceTaskTab } from './researchCenterFinanceModel';
import type { CohortConfig, CohortFinance } from './researchCenterV2.viewModel';
import type { CohortStats } from './researchCenterCalculations';
import type { ResearchCenterFinanceState } from './researchCenterFinanceModel';
import type { ResearchCenterDrawerState } from './ResearchCenterDrawer';

interface ResearchFinanceTabProps {
  cohorts: CohortConfig[];
  activeCohort: CohortConfig;
  activeCohortId: string;
  finance: CohortFinance;
  cohortStats: CohortStats;
  financeState: ResearchCenterFinanceState;
  scheduleMentorCost?: number;
  mentorPayables?: import('./researchCenterV2.viewModel').MentorPayableItem[];
  taskTab: FinanceTaskTab;
  onSelectCohort: (id: string) => void;
  onUpdateBudget: (cohortId: string, patch: Partial<ResearchCenterFinanceState['budgetByCohortId'][string]>) => void;
  onSaveBudget: (cohortId: string) => void;
  onUpdateFinanceState: (patch: Partial<ResearchCenterFinanceState>) => void;
  onUpdateFixedCost: (id: string, patch: Partial<import('./researchCenterFinanceModel').FixedCostItem>) => void;
  onUpdateRenovationNodes: (nodes: import('./researchCenterFinanceModel').RenovationPaymentNode[]) => void;
  onUpdatePaybackScenario: (id: import('./researchCenterFinanceModel').PaybackScenarioConfig['id'], patch: Partial<import('./researchCenterFinanceModel').PaybackScenarioConfig>) => void;
  onRecordPayment: (planId: string) => void;
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  onToast: (msg: string) => void;
}

const ResearchFinanceTab: React.FC<ResearchFinanceTabProps> = ({
  cohorts,
  activeCohort,
  activeCohortId,
  finance,
  financeState,
  scheduleMentorCost = 0,
  mentorPayables = [],
  taskTab,
  onSelectCohort,
  onUpdateBudget,
  onSaveBudget,
  onUpdateFinanceState,
  onUpdateFixedCost,
  onUpdateRenovationNodes,
  onUpdatePaybackScenario,
  onRecordPayment,
  onOpenDrawer,
  onToast,
}) => {
  const [paybackScenario, setPaybackScenario] = useState<'conservative' | 'target' | 'full'>('conservative');

  const budget = financeState.budgetByCohortId[activeCohortId] ?? financeState.budgetByCohortId[Object.keys(financeState.budgetByCohortId)[0]];

  const simulation = useMemo(
    () => computeCohortSimulation(budget, activeCohort, financeState),
    [activeCohort, budget, financeState],
  );

  const completenessFields = useMemo(() => buildFinanceCompletenessFields(financeState), [financeState]);
  const completenessPercent = useMemo(() => computeFinanceCompletenessPercent(completenessFields), [completenessFields]);
  const missingCount = useMemo(() => completenessFields.filter(f => !f.completed).length, [completenessFields]);

  const conclusion = useMemo(
    () => buildFinanceConclusion(activeCohort, finance.paidCount, finance.totalReceipt, simulation, financeState),
    [activeCohort, finance.paidCount, finance.totalReceipt, financeState, simulation],
  );

  const keyResults = useMemo(
    () => [
      {
        id: 'receipt',
        label: '当前实收',
        value: formatCurrency(finance.totalReceipt),
        hint: `当前${finance.paidCount}名实缴学员到账金额`,
      },
      {
        id: 'direct-cost',
        label: '项目直接成本',
        value: formatCurrency(activeCohort.projectDirectCost),
        hint: '导师及项目直接成本合计',
      },
      {
        id: 'contribution',
        label: '项目贡献利润',
        value: formatCurrency(finance.contributionProfit),
        hint:
          finance.paidCount < activeCohort.breakevenCount
            ? `当前${finance.paidCount}名实缴学员尚未覆盖直接成本`
            : '已覆盖项目直接成本',
        tone: finance.contributionProfit < 0 ? ('danger' as const) : ('normal' as const),
      },
      {
        id: 'breakeven',
        label: '直接保本人数',
        value: `${activeCohort.breakevenCount}人`,
        hint: '系统根据班期价格与成本自动计算',
        tone: 'muted' as const,
      },
    ],
    [activeCohort.breakevenCount, activeCohort.projectDirectCost, finance],
  );

  const compositionLines = useMemo<ProfitCompositionLine[]>(
    () => [
      { id: 'revenue', label: '招生收入', budget: simulation.revenue, actual: finance.totalReceipt, status: '已确认', drawerKey: 'receipt-detail', emphasis: 'summary' },
      { id: 'commission', label: '− 销售提成', budget: simulation.salesCommission, actual: finance.salesCommission, status: '已确认', drawerKey: 'receipt-detail', emphasis: 'cost' },
      { id: 'mentor', label: '− 导师及助教成本', budget: budget.mentorDirectCost, actual: scheduleMentorCost > 0 ? scheduleMentorCost : null, status: scheduleMentorCost > 0 ? '待确认' : '未录入', drawerKey: 'record-cost', emphasis: 'cost' },
      { id: 'stay', label: '− 住宿交通', budget: budget.accommodationCost, actual: null, status: '未录入', drawerKey: 'record-cost', emphasis: 'cost' },
      { id: 'exam', label: '− 考试证书及材料', budget: budget.examCertCost, actual: null, status: '未录入', drawerKey: 'record-cost', emphasis: 'cost' },
      { id: 'contrib', label: '＝ 项目贡献利润', budget: simulation.contributionProfit, actual: finance.contributionProfit, status: '已确认', emphasis: 'summary' },
      { id: 'fixed', label: '− 分摊固定成本', budget: budget.allocatedFixedCost, actual: null, status: financeState.venue502CostEntered ? '待确认' : '未录入', drawerKey: 'venue-cost', emphasis: 'cost' },
      { id: 'reno', label: '− 装修摊销', budget: simulation.renovationAmortization, actual: financeState.renovation.cumulativeAmortized, status: budget.includeRenovationAmortization ? '待确认' : '不适用', drawerKey: 'hardcover-plan', emphasis: 'cost' },
      {
        id: 'full',
        label: '＝ 完整经营利润',
        budget: simulation.fullOperatingProfit ?? 0,
        actual: simulation.fullOperatingProfit,
        status: simulation.fullProfitPendingReason ? '未录入' : '待确认',
        emphasis: 'summary',
      },
    ],
    [budget, finance, financeState, scheduleMentorCost, simulation],
  );

  const handleSaveBudget = useCallback(() => {
    if (!window.confirm('本次调整仅更新班期预算，不修改实际收款和实际付款。确认保存？')) return;
    onSaveBudget(activeCohortId);
    onToast('班期预算已保存');
  }, [activeCohortId, onSaveBudget, onToast]);

  return (
    <div className="met-rc-v2-finance-tab">
      {taskTab === 'profit' ? (
        <>
          <FinanceConclusionBar
            conclusion={conclusion}
            onAddEnrollment={() => onOpenDrawer({ type: 'enrollment' })}
            onAddCost={() => onOpenDrawer({ type: 'content', key: 'record-cost' })}
            onViewCalc={() => onOpenDrawer({ type: 'content', key: 'cohort' })}
          />
          <p className="met-rc-v2-finance-caliber-note">
            <Info size={12} aria-hidden />
            <span title="判断班期本身是否值得开">项目贡献</span>：判断班期本身是否值得开
            <span className="met-rc-v2-finance-caliber-note__dot">·</span>
            <span title="判断分摊固定成本后是否真正盈利">完整利润</span>：判断分摊固定成本后是否真正盈利
            <span className="met-rc-v2-finance-caliber-note__dot">·</span>
            <span title="判断账上是否有足够现金">实际现金</span>：判断账上是否有足够现金
          </p>
          <div className="met-rc-v2-finance-profit-top">
            <CohortFinanceSwitch cohorts={cohorts} activeCohortId={activeCohortId} onSelect={onSelectCohort} />
            <FinanceKeyResults items={keyResults} />
          </div>
          <CohortProfitCalculator
            cohort={activeCohort}
            actualPaidCount={finance.paidCount}
            budget={budget}
            financeState={financeState}
            onChange={patch => onUpdateBudget(activeCohortId, patch)}
            onSaveBudget={handleSaveBudget}
          />
          <div className="met-rc-v2-profit-complete-row">
            <ProfitComposition lines={compositionLines} onOpenDrawer={onOpenDrawer} />
            <FinanceDataCompleteness
              variant="sidebar"
              percent={completenessPercent}
              missingCount={missingCount}
              fields={completenessFields}
              onOpenDrawer={drawer => {
                if (drawer.type === 'content' && drawer.key === 'venue-cost') {
                  onUpdateFinanceState({ venue502CostEntered: true });
                }
                if (drawer.type === 'content' && drawer.key === 'allocation-rules') {
                  onUpdateFinanceState({ allocationRulesConfirmed: true });
                }
                onOpenDrawer(drawer);
              }}
            />
          </div>
        </>
      ) : null}

      {taskTab === 'cash' ? (
        <CashPlanPanel
          financeState={financeState}
          mentorPayables={mentorPayables}
          onOpenDrawer={onOpenDrawer}
          onRecordPayment={onRecordPayment}
        />
      ) : null}

      {taskTab === 'recovery' ? (
        <div className="met-rc-v2-cost-payback-page">
          <FixedCostManager items={financeState.fixedCosts} onChange={onUpdateFixedCost} />
          <RenovationFinancePanel
            renovation={financeState.renovation}
            onChangeNodes={onUpdateRenovationNodes}
            onChangeRenovation={patch => onUpdateFinanceState({ renovation: { ...financeState.renovation, ...patch } })}
            onToast={onToast}
          />
          <PaybackScenarioCalculator
            scenarios={financeState.paybackScenarios}
            activeId={paybackScenario}
            onSelect={setPaybackScenario}
            onChange={onUpdatePaybackScenario}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ResearchFinanceTab;
