import React, { useMemo, useState } from 'react';
import { SummaryMetricGrid } from '../shared';
import CohortQuickEditor from './CohortQuickEditor';
import CohortScheduleEditor from './CohortScheduleEditor';
import LeadCompactItem from './LeadCompactItem';
import ResearchActionPanel from './ResearchActionPanel';
import {
  buildOperationMetrics,
  filterLeadsByCategory,
  formatCurrency,
  formatGapLabel,
  gapTo,
  type CohortStats,
  type LeadCategoryId,
} from './researchCenterCalculations';
import {
  mapOperationMetricsToGrid,
  type CohortConfig,
  type CohortFinance,
  type LeadRecord,
  type QuickLeadCategory,
  type ScheduleItem,
  type TodoItem,
} from './researchCenterV2.viewModel';
import type { ResearchCenterDrawerState } from './ResearchCenterDrawer';

const METRIC_DRAWER_KEYS: Record<string, string> = {
  'op-cohorts': 'cohort-list',
  'op-paid': 'students',
  'op-receipt': 'receipt-detail',
  'op-payment': 'cash-plan',
};

interface ResearchOperationTabProps {
  cohorts: CohortConfig[];
  activeCohort: CohortConfig;
  activeCohortId: string;
  finance: CohortFinance;
  schedules: ScheduleItem[];
  leads: LeadRecord[];
  todos: TodoItem[];
  cohortStats: CohortStats;
  leadCategories: QuickLeadCategory[];
  paymentPlanConfigured: boolean;
  canDirectManage: boolean;
  onSelectCohort: (id: string) => void;
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  onUpdateCohort: (patch: Partial<CohortConfig>) => boolean;
  onAddSchedule: (draft: import('./researchCenterV2.viewModel').ScheduleDraft) => boolean;
  onUpdateSchedule: (id: string, patch: Partial<ScheduleItem>) => boolean;
  onDeleteSchedule: (id: string) => void;
  onTodoAction: (todoId: string, actionId: string) => void;
  onToast: (msg: string) => void;
  onCohortEditingChange?: (editing: boolean) => void;
  onOpenCohortDetail: (cohortId: string) => void;
  onOpenCohortList: () => void;
  onOpenFullSchedule?: () => void;
  onChangeTeacher?: (sessionId: string) => void;
  onReschedule?: (sessionId: string) => void;
}

const ResearchOperationTab: React.FC<ResearchOperationTabProps> = ({
  cohorts,
  activeCohort,
  activeCohortId,
  finance,
  schedules,
  leads,
  todos,
  cohortStats,
  leadCategories,
  paymentPlanConfigured,
  canDirectManage,
  onSelectCohort,
  onOpenDrawer,
  onUpdateCohort,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onTodoAction,
  onToast,
  onCohortEditingChange,
  onOpenCohortDetail,
  onOpenCohortList,
  onOpenFullSchedule,
  onChangeTeacher,
  onReschedule,
}) => {
  const [activeCategory, setActiveCategory] = useState<LeadCategoryId | null>(null);
  const [cohortOpsOpen, setCohortOpsOpen] = useState(false);

  const operationMetrics = useMemo(
    () =>
      mapOperationMetricsToGrid(
        buildOperationMetrics(cohortStats, finance, activeCohort, paymentPlanConfigured),
      ),
    [activeCohort, cohortStats, finance, paymentPlanConfigured],
  );

  const categoryLeads = useMemo(() => {
    if (!activeCategory) return [];
    return filterLeadsByCategory(leads, activeCategory);
  }, [activeCategory, leads]);

  const progressPercent = (activeCohort.paidCount / activeCohort.maxCount) * 100;
  const milestones = [
    { count: 0, label: '0人' },
    { count: activeCohort.breakevenCount, label: `${activeCohort.breakevenCount}人直接保本` },
    { count: activeCohort.lockCount, label: `${activeCohort.lockCount}人锁班` },
    { count: activeCohort.targetCount, label: `${activeCohort.targetCount}人目标` },
    { count: activeCohort.maxCount, label: `${activeCohort.maxCount}人满班` },
  ];

  return (
    <div className="met-rc-v2-operation">
      <SummaryMetricGrid
        items={operationMetrics.map(m => ({
          ...m,
          onClick: () =>
            onOpenDrawer({
              type: 'content',
              key: METRIC_DRAWER_KEYS[m.id] ?? 'cohort',
            }),
        }))}
        className="met-rc-v2__summary-grid met-rc-v2__summary-grid--compact"
        columns={4}
      />

      <div className="met-rc-v2-cohort-switch">
        <div className="met-rc-v2-cohort-switch__tabs">
          {cohorts.map(c => (
            <button
              key={c.id}
              type="button"
              className={['met-rc-v2-cohort-switch__tab', c.id === activeCohortId ? 'is-active' : ''].join(' ')}
              onClick={() => onSelectCohort(c.id)}
            >
              {c.displayTitle}
            </button>
          ))}
        </div>
        <div className="met-rc-v2-cohort-switch__actions">
          <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={onOpenCohortList}>
            查看全部班期
          </button>
        </div>
      </div>

      <div className="met-rc-v2-operation__main">
        <div className="met-rc-v2-operation__primary">
          <section className="met-rc-v2-card met-rc-v2-card--cohort-op">
            <div className="met-rc-v2-card__head">
              <div>
                <h2 className="met-rc-v2-card__title">{activeCohort.displayTitle}</h2>
                <p className="met-rc-v2-card__subtitle">
                  <span className={`met-rc-v2-status met-rc-v2-status--${activeCohort.statusTone}`}>
                    {activeCohort.status} · 高风险
                  </span>
                </p>
              </div>
            </div>

            <div className="met-rc-v2-progress met-rc-v2-progress--compact">
              <div className="met-rc-v2-progress__inline-labels">
                当前{activeCohort.paidCount}人 / {activeCohort.breakevenCount}人直接保本 / {activeCohort.lockCount}人锁班 / {activeCohort.targetCount}人目标 / {activeCohort.maxCount}人满班
              </div>
              <div className="met-rc-v2-progress__track" aria-hidden>
                <div className="met-rc-v2-progress__fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                <span className="met-rc-v2-progress__marker is-current" style={{ left: `${Math.min(progressPercent, 100)}%` }} />
                {milestones.map(ms => (
                  <span
                    key={ms.count}
                    className="met-rc-v2-progress__node"
                    style={{ left: `${(ms.count / activeCohort.maxCount) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="met-rc-v2-cohort-op__body">
              <div className="met-rc-v2-cohort-op__left">
                <h3>招生与开班</h3>
                <div className="met-rc-v2-cohort-op__stats met-rc-v2-info-blocks">
                  <div><span>当前实缴</span><strong>{finance.paidCount}人</strong></div>
                  <div><span>距直接保本</span><strong>{formatGapLabel(gapTo(finance.paidCount, activeCohort.breakevenCount))}</strong></div>
                  <div><span>距锁班</span><strong>{formatGapLabel(gapTo(finance.paidCount, activeCohort.lockCount))}</strong></div>
                  <div><span>距目标</span><strong>{formatGapLabel(gapTo(finance.paidCount, activeCohort.targetCount))}</strong></div>
                  <div><span>项目贡献利润</span><strong className={finance.contributionProfit < 0 ? 'is-danger' : ''}>{formatCurrency(finance.contributionProfit)}</strong></div>
                </div>
                <div className="met-rc-v2-cohort-op__actions">
                  <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={() => onOpenDrawer({ type: 'enrollment' })}>
                    添加报名
                  </button>
                  <button
                    type="button"
                    className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                    data-testid="rc-view-cohort"
                    onClick={() => onOpenCohortDetail(activeCohortId)}
                  >
                    查看班期
                  </button>
                  <div className="met-rc-v2-more">
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      aria-expanded={cohortOpsOpen}
                      onClick={() => setCohortOpsOpen(v => !v)}
                    >
                      更多
                    </button>
                    {cohortOpsOpen ? (
                      <div className="met-rc-v2-more__menu">
                        <button type="button" onClick={() => { onOpenDrawer({ type: 'content', key: 'students' }); setCohortOpsOpen(false); }}>查看学员</button>
                        <button type="button" onClick={() => { onOpenDrawer({ type: 'content', key: 'leads' }); setCohortOpsOpen(false); }}>查看意向</button>
                        <button type="button" onClick={() => { onOpenDrawer({ type: 'content', key: 'recruit' }); setCohortOpsOpen(false); }}>发起补招</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <CohortQuickEditor
                cohort={activeCohort}
                schedules={schedules}
                canDirectManage={canDirectManage}
                onSave={onUpdateCohort}
                onAssignOwner={() => onOpenDrawer({ type: 'assign-owner' })}
                onToast={onToast}
                onEditingChange={onCohortEditingChange}
              />
            </div>
          </section>
        </div>

        <ResearchActionPanel todos={todos} onAction={onTodoAction} />
      </div>

      <div className="met-rc-v2-operation__secondary">
        <CohortScheduleEditor
          cohort={activeCohort}
          schedules={schedules}
          canDirectManage={canDirectManage}
          onAdd={onAddSchedule}
          onUpdate={onUpdateSchedule}
          onDelete={onDeleteSchedule}
          onToast={onToast}
          onOpenFullSchedule={onOpenFullSchedule}
          onChangeTeacher={onChangeTeacher}
          onReschedule={onReschedule}
        />

        <section className="met-rc-v2-card met-rc-v2-card--quick-leads">
          <header className="met-rc-v2-zone__head">
            <h2 className="met-rc-v2-zone__title">学员与招生</h2>
          </header>
          <div className="met-rc-v2-quick-cats">
            {leadCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={['met-rc-v2-quick-cats__item', activeCategory === cat.id ? 'is-active' : ''].join(' ')}
                onClick={() => setActiveCategory(prev => (prev === cat.id ? null : (cat.id as LeadCategoryId)))}
              >
                <span>{cat.label}</span>
                <strong>{cat.count}人</strong>
              </button>
            ))}
          </div>
          {activeCategory && categoryLeads.length > 0 ? (
            <div className="met-rc-v2-lead-compact-list">
              {categoryLeads.map(lead => (
                <LeadCompactItem
                  key={lead.id}
                  lead={lead}
                  onOpenDrawer={onOpenDrawer}
                  onToast={onToast}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default ResearchOperationTab;
