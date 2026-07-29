import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import CohortDetailPage, { type CohortDetailTab } from './CohortDetailPage';
import type { CohortDeliveryDrawerState } from './CohortDeliveryDrawer';
import ResearchCenterDrawer, { type ResearchCenterDrawerState } from './ResearchCenterDrawer';
import ResearchFinanceTab from './ResearchFinanceTab';
import ResearchLeadsTab from './ResearchLeadsTab';
import ResearchOperationTab from './ResearchOperationTab';
import type { FinanceTaskTab } from './researchCenterFinanceModel';
import type { ResearchCenterDrawerContent } from './researchCenterV2.viewModel';
import {
  buildReceiptDrawerContent,
  buildStudentsDrawerContent,
} from './researchCenterCalculations';
import { useResearchCenterState } from './useResearchCenterState';
import { confirmDiscardUnsaved } from './researchFormFields';
import './researchCenterV2.css';

const PAGE_TABS = [
  { id: 'operation' as const, label: '经营操作' },
  { id: 'leads' as const, label: '招生跟进' },
  { id: 'finance' as const, label: '财务分析' },
];

const FINANCE_TASK_TABS: { id: FinanceTaskTab; label: string }[] = [
  { id: 'profit', label: '班期盈利' },
  { id: 'cash', label: '现金计划' },
  { id: 'recovery', label: '成本与回本' },
];

const ResearchCenterV2Page: React.FC = () => {
  const state = useResearchCenterState();
  const [toast, setToast] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<ResearchCenterDrawerState>(null);
  const [showMore, setShowMore] = useState(false);
  const [cohortEditing, setCohortEditing] = useState(false);
  const [financeTaskTab, setFinanceTaskTab] = useState<FinanceTaskTab>('profit');
  const [detail, setDetail] = useState<{
    cohortId: string;
    tab?: CohortDetailTab;
    drawer?: CohortDeliveryDrawerState;
  } | null>(null);
  const homeScrollRef = useRef({ scrollY: 0, activeTab: state.activeTab });

  const showToast = useCallback((message: string) => {
    console.log('[ResearchCenterV2]', message);
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, []);

  const closeDrawer = useCallback(() => setDrawer(null), []);

  const openCohortDetail = useCallback(
    (cohortId: string, options?: { tab?: CohortDetailTab; drawer?: CohortDeliveryDrawerState }) => {
      homeScrollRef.current = { scrollY: window.scrollY, activeTab: state.activeTab };
      state.setActiveCohortId(cohortId);
      setDetail({ cohortId, tab: options?.tab, drawer: options?.drawer });
      setDrawer(null);
      window.scrollTo(0, 0);
    },
    [state],
  );

  const closeCohortDetail = useCallback(() => {
    const { scrollY, activeTab } = homeScrollRef.current;
    setDetail(null);
    state.setActiveTab(activeTab);
    window.requestAnimationFrame(() => window.scrollTo(0, scrollY));
  }, [state]);

  const openContentDrawer = useCallback((key: string) => {
    setDrawer({ type: 'content', key });
  }, []);

  const drawerContent: ResearchCenterDrawerContent | null = useMemo(() => {
    if (!drawer) return null;
    if (drawer.type === 'content') {
      if (drawer.key === 'students') {
        return buildStudentsDrawerContent(state.enrollments.filter(e => !e.refunded), state.cohorts);
      }
      if (drawer.key === 'receipt-detail') {
        return buildReceiptDrawerContent(
          state.financeState.cashReceipts ?? [],
          state.enrollments,
          state.cohorts,
        );
      }
      return state.snapshot.drawerContentMap[drawer.key] ?? null;
    }
    return null;
  }, [drawer, state.cohorts, state.enrollments, state.financeState.cashReceipts, state.snapshot.drawerContentMap]);

  const handleTodoAction = useCallback(
    (todoId: string, actionId: string) => {
      if (actionId === 'add-enrollment') setDrawer({ type: 'enrollment' });
      else if (actionId === 'high-intent') {
        const high = state.leads.find(l => !l.enrolled && l.intentTone === 'high');
        if (high) setDrawer({ type: 'lead', id: high.id });
        else openContentDrawer('leads');
      }
      else if (actionId === 'recruit') openContentDrawer('recruit');
      else if (actionId === 'assign-owner') setDrawer({ type: 'assign-owner' });
      else if (actionId === 'cash-plan') openContentDrawer('cash-plan');
      else if (actionId === 'record-payment') setDrawer({ type: 'record-payment' });
      else if (actionId === 'join-cohort') setDrawer({ type: 'join-cohort' });
      else if (actionId === 'check-schedule') {
        openContentDrawer('priority-p4');
        state.completeTodo('todo-venue');
      }
      else showToast('操作已记录（待建设）');
    },
    [openContentDrawer, showToast, state],
  );

  const handleHeaderPrimary = useCallback(
    (actionId: string) => {
      if (actionId === 'new-cohort') openContentDrawer('new-cohort');
      else if (actionId === 'new-lead') setDrawer({ type: 'new-lead' });
      else if (actionId === 'record-payment') setDrawer({ type: 'record-payment' });
      else if (actionId === 'record-cost') openContentDrawer('record-cost');
    },
    [openContentDrawer],
  );

  const { snapshot } = state;
  const { meta } = snapshot;
  const detailCohort = detail ? state.cohorts.find(c => c.id === detail.cohortId) ?? null : null;

  const homeDensityClass =
    state.activeTab === 'finance'
      ? 'met-v2-density-compact'
      : state.activeTab === 'operation' || state.activeTab === 'leads'
        ? 'met-v2-density-workbench'
        : 'met-v2-density-dashboard';

  if (detailCohort && detail) {
    return (
      <div className="met-rc-v2 met-v2-density-compact">
        <div className="met-rc-v2__inner">
          <CohortDetailPage
            cohort={detailCohort}
            schedules={state.schedules}
            enrollments={state.enrollments}
            leads={state.leads}
            attendances={state.attendances}
            leaveRequests={state.leaveRequests}
            makeupRecords={state.makeupRecords}
            teachingRecords={state.teachingRecords}
            operationLogs={state.operationLogs}
            cohorts={state.cohorts}
            canDirectManage={state.canDirectManage}
            initialTab={detail.tab}
            initialDrawer={detail.drawer ?? null}
            onBack={closeCohortDetail}
            onToast={showToast}
            onOpenHomeDrawer={setDrawer}
            onOpenCohort={(cohortId, tab) => openCohortDetail(cohortId, { tab })}
            onViewFinance={() => {
              closeCohortDetail();
              state.setActiveTab('finance');
            }}
            onSaveAttendance={state.saveAttendance}
            onCreateLeaveRequest={state.createLeaveRequest}
            onArrangeMakeup={state.arrangeMakeup}
            onCompleteMakeup={state.completeMakeup}
            onSaveTeachingRecord={state.saveTeachingRecord}
            onCompleteTeachingSession={state.completeTeachingSession}
            onChangeSessionTeacher={state.changeSessionTeacher}
            onRescheduleSession={state.rescheduleSession}
            onCancelSession={state.cancelSession}
            onAddSchedule={state.addSchedule}
            onUpdateSchedule={state.updateSchedule}
            onDeleteSchedule={id => {
              const result = state.deleteSchedule(id);
              if (!result.ok) showToast(result.error || '删除失败');
            }}
          />
        </div>

        <ResearchCenterDrawer
          drawer={drawer}
          content={drawerContent}
          leads={state.leads}
          enrollments={state.enrollments}
          cohorts={state.cohorts.map(c => ({
            id: c.id,
            displayTitle: c.displayTitle,
            standardPrice: c.standardPrice,
            recruitmentOwner: c.recruitmentOwner,
          }))}
          activeCohortId={state.activeCohortId}
          cohortPrice={state.activeCohort?.standardPrice ?? 12800}
          onClose={closeDrawer}
          onToast={showToast}
          onSaveEnrollment={draft => state.saveEnrollment(draft)}
          onAssignOwner={state.assignOwner}
          onConfigurePayment={state.configurePaymentPlan}
          onOpenDrawer={openContentDrawer}
          onOpenEnrollment={leadId => setDrawer({ type: 'enrollment', leadId })}
          onAddLead={state.addLead}
          onAddFollowUp={state.addFollowUp}
          onUpdateLeadFields={state.updateLeadFields}
          onScheduleInterview={state.scheduleInterview}
          onRecordInterviewResult={state.recordInterviewResult}
          onRecordReceipt={state.recordReceipt}
          onJoinCohort={state.joinCohort}
          onRefundEnrollment={state.refundEnrollment}
          onSetDrawer={setDrawer}
        />

        {toast ? (
          <div className="met-v2-toast" role="status">{toast}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`met-rc-v2 ${homeDensityClass}`}>
      <div className="met-rc-v2__inner">
        <header className="met-rc-v2__header">
          <div className="met-rc-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-rc-v2__header-actions">
            <div className="met-rc-v2__filters met-rc-v2__filters--compact">
              <button type="button" className="met-rc-v2__filter-btn met-rc-v2__filter-btn--sm" onClick={() => showToast('切换经营单元（待建设）')}>
                {meta.unitLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button type="button" className="met-rc-v2__filter-btn met-rc-v2__filter-btn--sm" onClick={() => showToast('切换日期范围（待建设）')}>
                {meta.periodLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <span className="met-rc-v2__updated-at">{meta.updatedAt}</span>
            </div>
            <div className="met-rc-v2__header-ops">
              {(() => {
                const primary =
                  state.activeTab === 'leads'
                    ? { id: 'new-lead' as const, label: '新增咨询' }
                    : state.activeTab === 'finance'
                      ? { id: 'record-payment' as const, label: '录入收款' }
                      : { id: 'new-cohort' as const, label: '新建班期' };
                const secondary = (
                  [
                    { id: 'new-cohort' as const, label: '新建班期' },
                    { id: 'new-lead' as const, label: '新增咨询' },
                    { id: 'record-payment' as const, label: '录入收款' },
                  ] as const
                ).filter(item => item.id !== primary.id);
                return (
                  <>
                    <button
                      type="button"
                      className="met-rc-v2__filter-btn met-rc-v2__filter-btn--primary"
                      onClick={() => handleHeaderPrimary(primary.id)}
                    >
                      {primary.label}
                    </button>
                    <div className="met-rc-v2-more">
                      <button
                        type="button"
                        className="met-rc-v2__filter-btn met-rc-v2__filter-btn--ghost"
                        aria-expanded={showMore}
                        onClick={() => setShowMore(v => !v)}
                      >
                        更多操作<MoreHorizontal size={14} aria-hidden />
                      </button>
                      {showMore ? (
                        <div className="met-rc-v2-more__menu">
                          {secondary.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                handleHeaderPrimary(item.id);
                                setShowMore(false);
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              handleHeaderPrimary('record-cost');
                              setShowMore(false);
                            }}
                          >
                            录入成本
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              openContentDrawer('budget');
                              setShowMore(false);
                            }}
                          >
                            调整预算
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawer({ type: 'join-cohort' });
                              setShowMore(false);
                            }}
                          >
                            确认入班
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawer({ type: 'refund' });
                              setShowMore(false);
                            }}
                          >
                            发起退款
                          </button>
                          {state.canDirectManage ? (
                            <button
                              type="button"
                              data-testid="rc-reset-test-data"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    '确认重置研学中心测试数据？将清空 localStorage 原型持久化并恢复初始 Mock。',
                                  )
                                ) {
                                  return;
                                }
                                state.resetTestData();
                                setDetail(null);
                                setShowMore(false);
                                showToast('已重置研学中心测试数据（原型持久化）');
                              }}
                            >
                              重置测试数据
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </header>

        <nav className="met-rc-v2-unified-nav" role="tablist" aria-label="研学中心页签">
          <div className="met-rc-v2-unified-nav__primary">
            {PAGE_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={state.activeTab === tab.id}
                className={['met-rc-v2-unified-nav__tab', state.activeTab === tab.id ? 'is-active' : ''].join(' ')}
                onClick={() => {
                  if (cohortEditing && state.activeTab === 'operation' && tab.id !== 'operation') {
                    if (!confirmDiscardUnsaved()) return;
                  }
                  state.setActiveTab(tab.id);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {state.activeTab === 'finance' ? (
            <>
              <span className="met-rc-v2-unified-nav__sep" aria-hidden />
              <div className="met-rc-v2-unified-nav__secondary" role="tablist" aria-label="财务分析子页签">
                {FINANCE_TASK_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={financeTaskTab === tab.id}
                    className={['met-rc-v2-unified-nav__subtab', financeTaskTab === tab.id ? 'is-active' : ''].join(' ')}
                    onClick={() => setFinanceTaskTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </nav>

        {state.activeTab === 'operation' && state.activeCohort ? (
          <ResearchOperationTab
            cohorts={state.cohorts}
            activeCohort={state.activeCohort}
            activeCohortId={state.activeCohortId}
            finance={state.finance}
            schedules={state.schedules}
            leads={state.leads}
            todos={state.todos}
            cohortStats={state.cohortStats}
            leadCategories={state.leadCategories.operation}
            paymentPlanConfigured={state.paymentPlanConfigured}
            canDirectManage={state.canDirectManage}
            onSelectCohort={state.setActiveCohortId}
            onOpenDrawer={setDrawer}
            onUpdateCohort={patch => state.updateCohort(state.activeCohortId, patch)}
            onAddSchedule={state.addSchedule}
            onUpdateSchedule={state.updateSchedule}
            onDeleteSchedule={id => {
              const result = state.deleteSchedule(id);
              if (!result.ok) showToast(result.error || '删除失败');
            }}
            onTodoAction={handleTodoAction}
            onToast={showToast}
            onCohortEditingChange={setCohortEditing}
            onOpenCohortDetail={cohortId => openCohortDetail(cohortId)}
            onOpenCohortList={() => openCohortDetail(state.activeCohortId, { drawer: { type: 'cohort-list' } })}
            onOpenFullSchedule={() => openCohortDetail(state.activeCohortId, { tab: 'schedule' })}
            onChangeTeacher={sessionId =>
              openCohortDetail(state.activeCohortId, {
                tab: 'schedule',
                drawer: { type: 'change-teacher', sessionId },
              })
            }
            onReschedule={sessionId =>
              openCohortDetail(state.activeCohortId, {
                tab: 'schedule',
                drawer: { type: 'reschedule', sessionId },
              })
            }
          />
        ) : null}

        {state.activeTab === 'leads' ? (
          <ResearchLeadsTab
            funnelStages={state.funnelStages}
            funnelNote={
              state.activeCohort
                ? `当前${state.activeCohort.name}还需${Math.max(0, state.activeCohort.lockCount - state.finance.paidCount)}名实缴学员达到锁班。`
                : snapshot.funnelNote
            }
            funnelDisclaimer={snapshot.funnelDisclaimer}
            leads={state.leads}
            leadCategories={state.leadCategories.leads}
            onOpenDrawer={setDrawer}
            onToast={showToast}
          />
        ) : null}

        {state.activeTab === 'finance' && state.activeCohort ? (
          <ResearchFinanceTab
            cohorts={state.cohorts}
            activeCohort={state.activeCohort}
            activeCohortId={state.activeCohortId}
            finance={state.finance}
            cohortStats={state.cohortStats}
            financeState={state.financeState}
            scheduleMentorCost={state.scheduleMentorCost}
            mentorPayables={state.mentorPayables}
            taskTab={financeTaskTab}
            onSelectCohort={state.setActiveCohortId}
            onUpdateBudget={state.updateBudget}
            onSaveBudget={state.saveCohortBudget}
            onUpdateFinanceState={state.updateFinanceState}
            onUpdateFixedCost={state.updateFixedCost}
            onUpdateRenovationNodes={state.updateRenovationNodes}
            onUpdatePaybackScenario={state.updatePaybackScenario}
            onRecordPayment={state.recordPlanPayment}
            onOpenDrawer={setDrawer}
            onToast={showToast}
          />
        ) : null}

        {state.actionLog.length > 0 && (state.activeTab === 'operation' || state.activeTab === 'leads') ? (
          <details className="met-rc-v2-action-log">
            <summary>操作日志（原型 · {state.actionLog.length}）</summary>
            <ul>
              {state.actionLog.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      <ResearchCenterDrawer
        drawer={drawer}
        content={drawerContent}
        leads={state.leads}
        enrollments={state.enrollments}
        cohorts={state.cohorts.map(c => ({
          id: c.id,
          displayTitle: c.displayTitle,
          standardPrice: c.standardPrice,
          recruitmentOwner: c.recruitmentOwner,
        }))}
        activeCohortId={state.activeCohortId}
        cohortPrice={state.activeCohort?.standardPrice ?? 12800}
        onClose={closeDrawer}
        onToast={showToast}
        onSaveEnrollment={draft => state.saveEnrollment(draft)}
        onAssignOwner={state.assignOwner}
        onConfigurePayment={state.configurePaymentPlan}
        onOpenDrawer={openContentDrawer}
        onOpenEnrollment={leadId => setDrawer({ type: 'enrollment', leadId })}
        onAddLead={state.addLead}
        onAddFollowUp={state.addFollowUp}
        onUpdateLeadFields={state.updateLeadFields}
        onScheduleInterview={state.scheduleInterview}
        onRecordInterviewResult={state.recordInterviewResult}
        onRecordReceipt={state.recordReceipt}
        onJoinCohort={state.joinCohort}
        onRefundEnrollment={state.refundEnrollment}
        onSetDrawer={setDrawer}
      />

      {toast ? (
        <div className="met-v2-toast" role="status">{toast}</div>
      ) : null}
    </div>
  );
};

export default ResearchCenterV2Page;
