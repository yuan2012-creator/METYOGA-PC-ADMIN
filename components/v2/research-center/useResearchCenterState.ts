import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildResearchCenterV2Snapshot,
  createInitialCohortState,
  createInitialEnrollments,
  createInitialLeads,
  createInitialMentorPayables,
  createInitialSchedules,
  normalizeScheduleItem,
  RESEARCH_CENTER_BUSINESS_UNIT_ID,
  type AttendanceDraft,
  type AttendanceSheet,
  type EnrollmentDraft,
  type EnrollmentRecord,
  type FollowUpDraft,
  type InterviewResultDraft,
  type InterviewScheduleDraft,
  type LeadDraft,
  type LeadRecord,
  type LeaveDraft,
  type LeaveRequest,
  type MakeupDraft,
  type MakeupRecord,
  type MentorPayableItem,
  type OperationLogEntry,
  type ReceiptDraft,
  type RefundDraft,
  type ScheduleChangeLog,
  type ScheduleDraft,
  type ScheduleItem,
  type TeachingRecord,
  type TeachingRecordDraft,
} from './researchCenterV2.viewModel';
import {
  applyCohortDerivedFields,
  buildDerivedTodos,
  computeCohortFinance,
  computeScheduleMentorCost,
  deriveCohortStats,
  deriveDiagnosisConclusion,
  deriveFunnelStages,
  derivePaymentStatus,
  detectLeadAnomaly,
  getLeadCategories,
  getSuggestedActionForStage,
  isFullyPaidStatus,
  normalizeLeadStage,
  suggestNextLeadStage,
  syncMentorPayablesFromSchedules,
  validateCohortPatch,
  validateLeadStageTransition,
  validateScheduleDraft,
} from './researchCenterCalculations';
import {
  canCompleteSession,
  filterSchedulesByCohort,
  getActiveCohortStudents,
  nextSessionStatusAfterAttendance,
} from './researchCenterDeliveryCalculations';
import { formatDateShort, getTeacherPay, MOCK_TODAY_ISO } from './researchCenterOptions';
import {
  createDefaultBudget,
  createInitialFinanceState,
  type CohortBudgetSimulation,
  type FixedCostItem,
  type PaybackScenarioConfig,
  type RenovationPaymentNode,
  type ResearchCenterFinanceState,
} from './researchCenterFinanceModel';
import { RESEARCH_CENTER_STORAGE_VERSION } from './researchCenterPersistence';
import { getDefaultResearchCenterService } from './services';
import { RESEARCH_PERMISSIONS } from './domain/permissions';
import { nowIso } from './domain/money';
import type { DomainEvent } from './domain/types';

export type ResearchCenterTab = 'operation' | 'leads' | 'finance';

function intentToneOf(level: string): LeadRecord['intentTone'] {
  if (level === '高' || level.includes('高')) return 'high';
  if (level === '低' || level.includes('低')) return 'low';
  return 'medium';
}

function withAnomaly(lead: LeadRecord): LeadRecord {
  return { ...lead, anomaly: detectLeadAnomaly(lead) };
}

function nowLogTime(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

function makeSerial(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

function createFreshState() {
  const { cohorts: raw } = createInitialCohortState();
  const cohorts = raw.map(applyCohortDerivedFields);
  const schedules = createInitialSchedules();
  const activeCohortId = cohorts[0]?.id ?? '';
  return {
    activeCohortId,
    cohorts,
    schedules,
    leads: createInitialLeads().map(withAnomaly),
    enrollments: createInitialEnrollments(),
    paymentPlanConfigured: false,
    financeState: createInitialFinanceState(cohorts[0]),
    mentorPayables: createInitialMentorPayables(schedules, activeCohortId),
    operationLogs: [] as OperationLogEntry[],
    dismissedTodoIds: new Set<string>(),
    attendances: [] as AttendanceSheet[],
    leaveRequests: [] as LeaveRequest[],
    makeupRecords: [] as MakeupRecord[],
    teachingRecords: [] as TeachingRecord[],
    scheduleChangeLogs: [] as ScheduleChangeLog[],
  };
}

export function useResearchCenterState() {
  const snapshot = useMemo(() => buildResearchCenterV2Snapshot(), []);
  const service = useMemo(() => getDefaultResearchCenterService(), []);
  const boot = useMemo(() => {
    const saved = service.getSnapshot();
    return {
      activeCohortId: saved.activeCohortId,
      cohorts: saved.cohorts.map(applyCohortDerivedFields),
      schedules: saved.schedules.map(s => normalizeScheduleItem(s, saved.activeCohortId)),
      leads: saved.leads.map(withAnomaly),
      enrollments: saved.enrollments,
      paymentPlanConfigured: saved.paymentPlanConfigured,
      financeState: saved.financeState,
      mentorPayables: saved.mentorPayables ?? [],
      operationLogs: saved.operationLogs ?? [],
      dismissedTodoIds: new Set(saved.dismissedTodoIds ?? []),
      attendances: saved.attendances ?? [],
      leaveRequests: saved.leaveRequests ?? [],
      makeupRecords: saved.makeupRecords ?? [],
      teachingRecords: saved.teachingRecords ?? [],
      scheduleChangeLogs: saved.scheduleChangeLogs ?? [],
      domainEvents: saved.domainEvents ?? [],
    };
  }, [service]);

  const [activeTab, setActiveTab] = useState<ResearchCenterTab>('operation');
  const [activeCohortId, setActiveCohortId] = useState(boot.activeCohortId);
  const [cohorts, setCohorts] = useState(boot.cohorts);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(boot.schedules);
  const [leads, setLeads] = useState<LeadRecord[]>(boot.leads);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>(boot.enrollments);
  const [dismissedTodoIds, setDismissedTodoIds] = useState<Set<string>>(boot.dismissedTodoIds);
  const [paymentPlanConfigured, setPaymentPlanConfigured] = useState(boot.paymentPlanConfigured);
  const [financeState, setFinanceState] = useState<ResearchCenterFinanceState>(boot.financeState);
  const [mentorPayables, setMentorPayables] = useState<MentorPayableItem[]>(boot.mentorPayables);
  const [operationLogs, setOperationLogs] = useState<OperationLogEntry[]>(boot.operationLogs);
  const [attendances, setAttendances] = useState<AttendanceSheet[]>(boot.attendances);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(boot.leaveRequests);
  const [makeupRecords, setMakeupRecords] = useState<MakeupRecord[]>(boot.makeupRecords);
  const [teachingRecords, setTeachingRecords] = useState<TeachingRecord[]>(boot.teachingRecords);
  const [scheduleChangeLogs, setScheduleChangeLogs] = useState<ScheduleChangeLog[]>(boot.scheduleChangeLogs);
  const [domainEvents, setDomainEvents] = useState<DomainEvent[]>(boot.domainEvents);
  const savingRef = useRef(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const result = service.replaceSnapshot({
      version: RESEARCH_CENTER_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      activeCohortId,
      cohorts,
      schedules,
      leads,
      enrollments,
      paymentPlanConfigured,
      financeState,
      mentorPayables,
      operationLogs,
      dismissedTodoIds: [...dismissedTodoIds],
      attendances,
      leaveRequests,
      makeupRecords,
      teachingRecords,
      scheduleChangeLogs,
      domainEvents,
    });
    if (!result.ok) {
      console.warn('[ResearchCenterService]', result.error);
    }
  }, [
    activeCohortId,
    attendances,
    cohorts,
    dismissedTodoIds,
    domainEvents,
    enrollments,
    financeState,
    leads,
    leaveRequests,
    makeupRecords,
    mentorPayables,
    operationLogs,
    paymentPlanConfigured,
    scheduleChangeLogs,
    schedules,
    service,
    teachingRecords,
  ]);

  const activeCohort = useMemo(
    () => cohorts.find(c => c.id === activeCohortId) ?? cohorts[0] ?? null,
    [activeCohortId, cohorts],
  );

  const finance = useMemo(() => {
    if (!activeCohort) return { paidCount: 0, totalReceipt: 0, salesCommission: 0, contributionProfit: 0 };
    return computeCohortFinance(
      activeCohort.paidCount,
      activeCohort.totalReceipt,
      activeCohort.projectDirectCost,
      activeCohort.commissionRate,
    );
  }, [activeCohort]);

  const cohortStats = useMemo(() => deriveCohortStats(cohorts), [cohorts]);
  const leadCategories = useMemo(
    () => ({ operation: getLeadCategories(leads, 'operation'), leads: getLeadCategories(leads, 'leads') }),
    [leads],
  );
  const funnelStages = useMemo(() => deriveFunnelStages(leads), [leads]);
  const scheduleMentorCost = useMemo(() => computeScheduleMentorCost(schedules), [schedules]);
  const todos = useMemo(
    () => buildDerivedTodos(activeCohort, paymentPlanConfigured, dismissedTodoIds, leads),
    [activeCohort, dismissedTodoIds, leads, paymentPlanConfigured],
  );

  const pushLog = useCallback(
    (
      entry: Omit<OperationLogEntry, 'id' | 'at'> & {
        at?: string;
        forced?: boolean;
        eventName?: string;
        objectType?: string;
        objectId?: string;
      },
    ) => {
      const full: OperationLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        at: entry.at ?? nowLogTime(),
        operator: entry.operator,
        type: entry.type,
        target: entry.target,
        before: entry.before,
        after: entry.after,
        reason: entry.reason,
      };
      setOperationLogs(prev => [full, ...prev].slice(0, 80));
      if (entry.eventName) {
        const evt: DomainEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
          at: nowIso(),
          name: entry.eventName,
          actorName: entry.operator,
          objectType: entry.objectType ?? 'unknown',
          objectId: entry.objectId ?? entry.target,
          before: entry.before,
          after: entry.after,
          reason: entry.reason,
          forced: entry.forced,
        };
        setDomainEvents(prev => [evt, ...prev].slice(0, 200));
      }
    },
    [],
  );

  const updateCohort = useCallback(
    (cohortId: string, patch: Partial<(typeof cohorts)[number]>): boolean => {
      const cohort = cohorts.find(c => c.id === cohortId);
      if (!cohort) return false;
      const errors = validateCohortPatch(patch, cohort, schedules);
      if (Object.keys(errors).length > 0) return false;
      setCohorts(prev =>
        prev.map(c => (c.id === cohortId ? applyCohortDerivedFields({ ...c, ...patch }) : c)),
      );
      return true;
    },
    [cohorts, schedules],
  );

  const resetTestData = useCallback(() => {
    const result = service.resetTestData();
    if (!result.ok) {
      console.warn('[ResearchCenterService]', result.error);
      return;
    }
    const fresh = service.getSnapshot();
    setActiveCohortId(fresh.activeCohortId);
    setCohorts(fresh.cohorts.map(applyCohortDerivedFields));
    setSchedules(fresh.schedules);
    setLeads(fresh.leads.map(withAnomaly));
    setEnrollments(fresh.enrollments);
    setPaymentPlanConfigured(fresh.paymentPlanConfigured);
    setFinanceState(fresh.financeState);
    setMentorPayables(fresh.mentorPayables);
    setOperationLogs(fresh.operationLogs ?? []);
    setDismissedTodoIds(new Set(fresh.dismissedTodoIds ?? []));
    setAttendances(fresh.attendances ?? []);
    setLeaveRequests(fresh.leaveRequests ?? []);
    setMakeupRecords(fresh.makeupRecords ?? []);
    setTeachingRecords(fresh.teachingRecords ?? []);
    setScheduleChangeLogs(fresh.scheduleChangeLogs ?? []);
    setDomainEvents(fresh.domainEvents ?? []);
    setActiveTab('operation');
  }, [service]);

  const addLead = useCallback(
    (draft: LeadDraft): { ok: boolean; id?: string; error?: string } => {
      if (savingRef.current) return { ok: false, error: '正在保存，请勿重复点击' };
      const name = draft.name.trim();
      if (!name) return { ok: false, error: '姓名必填' };
      savingRef.current = true;
      try {
        const id = `lead-${Date.now()}`;
        const intentLevel = draft.intentLevel.replace('意向', '') || '中';
        const lead = withAnomaly({
          id,
          name,
          phone: draft.phone,
          wechat: draft.wechat,
          course: draft.course || 'RYT200',
          intentLevel,
          intentTone: intentToneOf(intentLevel),
          stage: '新咨询',
          expectedAmount: draft.expectedAmount || 12800,
          paidAmount: 0,
          lastFollowUp: MOCK_TODAY_ISO,
          nextFollowUpDate: draft.nextFollowUpDate || MOCK_TODAY_ISO,
          overdueDays: 0,
          owner: draft.owner || '待指定',
          suggestedAction: getSuggestedActionForStage('新咨询'),
          categories: ['contact-today'],
          enrolled: false,
          source: draft.source,
          learningBase: draft.learningBase,
          learningPurpose: draft.learningPurpose,
          budgetNote: draft.budgetNote,
          timeCondition: draft.timeCondition,
          targetCohortId: draft.targetCohortId,
          note: draft.note,
          followUps: [],
          enrolledCohortIds: [],
        });
        setLeads(prev => [lead, ...prev]);
        pushLog({
          operator: draft.owner || '芳芳',
          type: '新增咨询',
          target: name,
          before: '—',
          after: '新咨询',
          reason: draft.note || draft.source || '',
        });
        return { ok: true, id };
      } finally {
        window.setTimeout(() => {
          savingRef.current = false;
        }, 400);
      }
    },
    [pushLog],
  );

  const addFollowUp = useCallback(
    (draft: FollowUpDraft): { ok: boolean; error?: string } => {
      const lead = leads.find(l => l.id === draft.leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };
      const followUp = {
        id: `fu-${Date.now()}`,
        method: draft.method,
        result: draft.result,
        nextStep: draft.nextStep,
        nextFollowUpDate: draft.nextFollowUpDate,
        createdAt: MOCK_TODAY_ISO,
        intentLevel: draft.intentLevel,
        stage: draft.stage,
        note: draft.note,
      };
      let nextStage = draft.stage || normalizeLeadStage(lead.stage);
      const current = normalizeLeadStage(lead.stage);
      // If user kept current stage, apply business auto-advance from follow-up content.
      if (!draft.stage || normalizeLeadStage(draft.stage) === current) {
        if (current === '新咨询' || current === '待联系') nextStage = '已联系';
        else if (current === '已联系' && (draft.nextStep.includes('面试') || draft.result.includes('面试'))) nextStage = '有效意向';
        else if (current === '有效意向' && draft.nextStep.includes('面试')) nextStage = '待面试';
        else nextStage = current;
      }
      const transition = validateLeadStageTransition(String(lead.stage), String(nextStage), lead);
      if (!transition.ok) return { ok: false, error: transition.error };

      setLeads(prev =>
        prev.map(l => {
          if (l.id !== draft.leadId) return l;
          return withAnomaly({
            ...l,
            stage: nextStage,
            intentLevel: draft.intentLevel || l.intentLevel,
            intentTone: intentToneOf(draft.intentLevel || l.intentLevel),
            lastFollowUp: MOCK_TODAY_ISO,
            nextFollowUpDate: draft.nextFollowUpDate,
            overdueDays: 0,
            suggestedAction: draft.nextStep || getSuggestedActionForStage(String(nextStage)),
            categories: [...new Set([...l.categories.filter(c => c !== 'overdue'), 'contact-today'])],
            followUps: [...(l.followUps ?? []), followUp],
          });
        }),
      );
      pushLog({
        operator: lead.owner,
        type: '跟进',
        target: lead.name,
        before: String(lead.stage),
        after: String(nextStage),
        reason: `${draft.method}：${draft.result}`,
      });
      return { ok: true };
    },
    [leads, pushLog],
  );

  const updateLeadFields = useCallback(
    (
      leadId: string,
      patch: Partial<Pick<LeadRecord, 'intentLevel' | 'stage' | 'owner' | 'course' | 'expectedAmount'>>,
      options?: { forceReason?: string },
    ): { ok: boolean; error?: string; warning?: string } => {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };
      if (patch.stage && patch.stage !== lead.stage) {
        const result = validateLeadStageTransition(lead.stage, patch.stage, lead, options);
        if (!result.ok) return { ok: false, error: result.error };
        setLeads(prev =>
          prev.map(l =>
            l.id === leadId
              ? withAnomaly({
                  ...l,
                  ...patch,
                  intentTone: patch.intentLevel ? intentToneOf(patch.intentLevel) : l.intentTone,
                  stage: normalizeLeadStage(patch.stage!),
                  suggestedAction: getSuggestedActionForStage(patch.stage!),
                })
              : l,
          ),
        );
        pushLog({
          operator: '总部管理员',
          type: options?.forceReason ? '强制状态跳转' : '修改状态',
          target: lead.name,
          before: String(lead.stage),
          after: String(patch.stage),
          reason: options?.forceReason || '',
        });
        return { ok: true, warning: result.warning };
      }
      setLeads(prev =>
        prev.map(l =>
          l.id === leadId
            ? withAnomaly({
                ...l,
                ...patch,
                intentTone: patch.intentLevel ? intentToneOf(patch.intentLevel) : l.intentTone,
              })
            : l,
        ),
      );
      pushLog({
        operator: lead.owner,
        type: '修改状态',
        target: lead.name,
        before: '—',
        after: Object.keys(patch).join('、'),
        reason: '',
      });
      return { ok: true };
    },
    [leads, pushLog],
  );

  const scheduleInterview = useCallback(
    (draft: InterviewScheduleDraft): { ok: boolean; error?: string } => {
      const lead = leads.find(l => l.id === draft.leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };
      setLeads(prev =>
        prev.map(l =>
          l.id !== draft.leadId
            ? l
            : withAnomaly({
                ...l,
                stage: '待面试',
                suggestedAction: getSuggestedActionForStage('待面试'),
                course: draft.suggestedCourse || l.course,
                interview: {
                  status: '待面试',
                  interviewer: draft.interviewer,
                  scheduledAt: draft.scheduledAt,
                  interviewMode: draft.interviewMode,
                  note: draft.note,
                  suggestedCourse: draft.suggestedCourse,
                },
                lastFollowUp: MOCK_TODAY_ISO,
                overdueDays: 0,
              }),
        ),
      );
      pushLog({
        operator: draft.interviewer,
        type: '安排面试',
        target: lead.name,
        before: String(lead.stage),
        after: '待面试',
        reason: `${draft.interviewMode} ${draft.scheduledAt}`,
      });
      return { ok: true };
    },
    [leads, pushLog],
  );

  const recordInterviewResult = useCallback(
    (draft: InterviewResultDraft): { ok: boolean; error?: string } => {
      const lead = leads.find(l => l.id === draft.leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };
      const passed = draft.result === '通过' || draft.result === '有条件通过';
      const nextStage = passed ? '面试通过' : draft.result === '未到场' ? '有效意向' : '已面试';
      setLeads(prev =>
        prev.map(l =>
          l.id !== draft.leadId
            ? l
            : withAnomaly({
                ...l,
                stage: nextStage,
                course: draft.suggestedCourse || l.course,
                suggestedAction: getSuggestedActionForStage(nextStage),
                categories: passed
                  ? [...new Set([...l.categories.filter(c => c !== 'contact-today'), 'interview-passed'])]
                  : l.categories,
                interview: {
                  ...(l.interview ?? { status: '已面试' }),
                  status: '已面试',
                  result: draft.result,
                  suggestedCourse: draft.suggestedCourse,
                  interviewer: draft.interviewer,
                  note: draft.note,
                  foundationEval: draft.foundationEval,
                  timeEval: draft.timeEval,
                  goalEval: draft.goalEval,
                  riskNote: draft.riskNote,
                },
                lastFollowUp: MOCK_TODAY_ISO,
                overdueDays: 0,
              }),
        ),
      );
      pushLog({
        operator: draft.interviewer,
        type: '录入面试结果',
        target: lead.name,
        before: String(lead.stage),
        after: `${draft.result} → ${nextStage}`,
        reason: draft.riskNote || draft.note || '',
      });
      return { ok: true };
    },
    [leads, pushLog],
  );

  const saveEnrollment = useCallback(
    (draft: EnrollmentDraft): { ok: boolean; error?: string; enrollmentId?: string } => {
      if (savingRef.current) return { ok: false, error: '正在保存，请勿重复点击' };
      if (!draft.cohortId) return { ok: false, error: '必须选择班期' };
      if (!draft.paymentMethod) return { ok: false, error: '必须选择付款方式' };
      if (!(draft.dealPrice > 0)) return { ok: false, error: '成交价格必须大于0' };
      savingRef.current = true;
      try {
        const cohort = cohorts.find(c => c.id === draft.cohortId);
        if (!cohort) return { ok: false, error: '班期不存在' };

        let studentName = draft.newName?.trim() || '';
        let leadId = draft.leadId;
        let owner = draft.owner || cohort.recruitmentOwner;
        let course = draft.course || 'RYT200';

        if (draft.mode === 'existing') {
          const lead = leads.find(l => l.id === draft.leadId);
          if (!lead) return { ok: false, error: '请选择咨询者' };
          const dup = enrollments.find(e => e.leadId === lead.id && e.cohortId === draft.cohortId && !e.refunded);
          if (dup) return { ok: false, error: '同一咨询者不能重复报名同一班期' };
          studentName = lead.name;
          leadId = lead.id;
          owner = draft.owner || lead.owner;
          course = draft.course || lead.course;
        } else if (!studentName) {
          return { ok: false, error: '请填写学员姓名' };
        }

        const initial = Math.max(0, draft.initialReceiptAmount ?? 0);
        const paymentStatus = derivePaymentStatus(draft.dealPrice, initial);
        if (draft.paymentStatus === '已付清' && initial < draft.dealPrice) {
          return { ok: false, error: '已付清时，累计收款应等于应收金额' };
        }
        if (draft.paymentStatus === '部分付款' && !(initial > 0 && initial < draft.dealPrice)) {
          return { ok: false, error: '部分付款时，累计收款应小于应收金额' };
        }

        const enrollmentId = `enroll-${Date.now()}`;
        const record: EnrollmentRecord = {
          id: enrollmentId,
          leadId: leadId || `lead-new-${Date.now()}`,
          cohortId: draft.cohortId,
          studentName,
          course,
          standardPrice: draft.standardPrice || cohort.standardPrice,
          dealPrice: draft.dealPrice,
          paidAmount: initial,
          enrollmentStatus: '已报名',
          paymentStatus,
          contractStatus: draft.contractStatus || '已签约',
          paymentMethod: draft.paymentMethod,
          owner,
          createdAt: MOCK_TODAY_ISO,
          refunded: false,
          joined: false,
          note: draft.note,
        };

        setEnrollments(prev => [...prev, record]);

        if (initial > 0) {
          setFinanceState(prev => ({
            ...prev,
            currentCashBalance: prev.currentCashBalance + initial,
            cashReceipts: [
              ...prev.cashReceipts,
              {
                id: `cash-${enrollmentId}`,
                date: MOCK_TODAY_ISO,
                title: `${studentName} 报名收款`,
                amount: initial,
                enrollmentId,
                leadId: record.leadId,
                cohortId: draft.cohortId,
                paymentMethod: draft.paymentMethod,
                operator: owner,
                serialNo: makeSerial('RC'),
                status: '已确认',
                kind: 'receipt',
              },
            ],
          }));
          updateCohort(draft.cohortId, {
            totalReceipt: cohort.totalReceipt + initial,
          });
        }

        const stageAfter =
          paymentStatus === '已付清'
            ? '已付清'
            : paymentStatus === '部分付款'
              ? '部分付款'
              : draft.contractStatus === '已签约'
                ? '已签约'
                : '待签约';

        if (draft.mode === 'existing' && leadId) {
          setLeads(prev =>
            prev.map(l =>
              l.id !== leadId
                ? l
                : withAnomaly({
                    ...l,
                    stage: stageAfter,
                    paidAmount: l.paidAmount + initial,
                    expectedAmount: draft.dealPrice,
                    categories:
                      paymentStatus === '未付款'
                        ? l.categories
                        : [...new Set([...l.categories.filter(c => c !== 'interview-passed'), 'deposit-paid'])],
                    suggestedAction: getSuggestedActionForStage(stageAfter),
                    lastFollowUp: MOCK_TODAY_ISO,
                    overdueDays: 0,
                  }),
            ),
          );
        } else {
          setLeads(prev => [
            withAnomaly({
              id: record.leadId,
              name: studentName,
              course,
              intentLevel: '中',
              intentTone: 'medium',
              stage: stageAfter,
              expectedAmount: draft.dealPrice,
              paidAmount: initial,
              lastFollowUp: MOCK_TODAY_ISO,
              overdueDays: 0,
              owner,
              suggestedAction: getSuggestedActionForStage(stageAfter),
              categories: paymentStatus === '未付款' ? [] : ['deposit-paid'],
              enrolled: false,
              enrolledCohortIds: [],
              followUps: [],
            }),
            ...prev,
          ]);
        }

        pushLog({
          operator: owner,
          type: '创建报名',
          target: studentName,
          before: '—',
          after: `${cohort.displayTitle}｜${paymentStatus}｜合同${record.contractStatus}`,
          reason: draft.note || '',
        });
        return { ok: true, enrollmentId };
      } finally {
        window.setTimeout(() => {
          savingRef.current = false;
        }, 400);
      }
    },
    [cohorts, enrollments, leads, pushLog, updateCohort],
  );

  const recordReceipt = useCallback(
    (draft: ReceiptDraft): { ok: boolean; error?: string } => {
      if (savingRef.current) return { ok: false, error: '正在保存，请勿重复点击' };
      if (!(draft.amount > 0)) return { ok: false, error: '本次收款必须大于0' };
      if (!draft.paymentMethod) return { ok: false, error: '请选择支付方式' };
      const enrollment = enrollments.find(e => e.id === draft.enrollmentId && !e.refunded);
      if (!enrollment) return { ok: false, error: '请选择已报名学员' };
      const remaining = Math.max(0, enrollment.dealPrice - enrollment.paidAmount);
      if (draft.amount > remaining + 0.001) return { ok: false, error: '收款金额不能超过未收金额' };
      savingRef.current = true;
      try {
        const nextPaid = enrollment.paidAmount + draft.amount;
        const paymentStatus = derivePaymentStatus(enrollment.dealPrice, nextPaid);
        const cohort = cohorts.find(c => c.id === enrollment.cohortId);

        setEnrollments(prev =>
          prev.map(e => (e.id === enrollment.id ? { ...e, paidAmount: nextPaid, paymentStatus } : e)),
        );
        if (cohort) {
          updateCohort(cohort.id, { totalReceipt: cohort.totalReceipt + draft.amount });
        }
        setFinanceState(prev => ({
          ...prev,
          currentCashBalance: prev.currentCashBalance + draft.amount,
          cashReceipts: [
            ...prev.cashReceipts,
            {
              id: `cash-${Date.now()}`,
              date: draft.date || MOCK_TODAY_ISO,
              title: `${enrollment.studentName} 收款`,
              amount: draft.amount,
              enrollmentId: enrollment.id,
              leadId: enrollment.leadId,
              cohortId: enrollment.cohortId,
              paymentMethod: draft.paymentMethod,
              operator: draft.operator,
              serialNo: makeSerial('RC'),
              status: '已确认',
              note: draft.note,
              kind: 'receipt',
            },
          ],
        }));
        setLeads(prev =>
          prev.map(l =>
            l.id !== enrollment.leadId
              ? l
              : withAnomaly({
                  ...l,
                  paidAmount: l.paidAmount + draft.amount,
                  stage: paymentStatus === '已付清' ? '已付清' : '部分付款',
                  suggestedAction: getSuggestedActionForStage(paymentStatus === '已付清' ? '已付清' : '部分付款'),
                  categories: [...new Set([...l.categories.filter(c => c !== 'interview-passed'), 'deposit-paid'])],
                  lastFollowUp: MOCK_TODAY_ISO,
                  overdueDays: 0,
                }),
          ),
        );
        pushLog({
          operator: draft.operator,
          type: '录入收款',
          target: enrollment.studentName,
          before: `${enrollment.paidAmount}`,
          after: `${nextPaid}（${paymentStatus}）`,
          reason: draft.note || draft.paymentMethod,
        });
        return { ok: true };
      } finally {
        window.setTimeout(() => {
          savingRef.current = false;
        }, 400);
      }
    },
    [cohorts, enrollments, pushLog, updateCohort],
  );

  const joinCohort = useCallback(
    (enrollmentId: string): { ok: boolean; error?: string } => {
      const enrollment = enrollments.find(e => e.id === enrollmentId && !e.refunded);
      if (!enrollment) return { ok: false, error: '报名记录不存在' };
      if (enrollment.joined) return { ok: false, error: '已加入班期' };
      if (!isFullyPaidStatus(enrollment.paymentStatus)) return { ok: false, error: '已付清后方可正式入班' };
      const cohort = cohorts.find(c => c.id === enrollment.cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      setEnrollments(prev => prev.map(e => (e.id === enrollmentId ? { ...e, joined: true } : e)));
      updateCohort(cohort.id, { paidCount: cohort.paidCount + 1 });
      setLeads(prev =>
        prev.map(l =>
          l.id !== enrollment.leadId
            ? l
            : withAnomaly({
                ...l,
                enrolled: true,
                enrolledCohortIds: [...new Set([...(l.enrolledCohortIds ?? []), cohort.id])],
                stage: '已入班',
                categories: [],
                suggestedAction: getSuggestedActionForStage('已入班'),
              }),
        ),
      );
      pushLog({
        operator: enrollment.owner,
        type: '确认入班',
        target: enrollment.studentName,
        before: '已付清',
        after: `已入班 · ${cohort.displayTitle}`,
        reason: '',
      });
      return { ok: true };
    },
    [cohorts, enrollments, pushLog, updateCohort],
  );

  const refundEnrollment = useCallback(
    (draft: RefundDraft): { ok: boolean; error?: string } => {
      if (savingRef.current) return { ok: false, error: '正在保存，请勿重复点击' };
      const enrollment = enrollments.find(e => e.id === draft.enrollmentId && !e.refunded);
      if (!enrollment) return { ok: false, error: '报名记录不存在' };
      if (!(draft.amount > 0)) return { ok: false, error: '退款金额必须大于0' };
      if (draft.amount > enrollment.paidAmount + 0.001) return { ok: false, error: '退款金额不能超过可退金额' };
      if (!draft.reason.trim()) return { ok: false, error: '请填写退款原因' };
      savingRef.current = true;
      try {
        const cohort = cohorts.find(c => c.id === enrollment.cohortId);
        if (!cohort) return { ok: false, error: '班期不存在' };
        const nextPaid = Math.max(0, enrollment.paidAmount - draft.amount);
        const fullyRefund = nextPaid <= 0;
        const exit = draft.exitCohort;
        const wasJoined = enrollment.joined;

        setEnrollments(prev =>
          prev.map(e =>
            e.id !== enrollment.id
              ? e
              : {
                  ...e,
                  paidAmount: nextPaid,
                  paymentStatus: fullyRefund ? '未付款' : derivePaymentStatus(e.dealPrice, nextPaid),
                  refunded: fullyRefund,
                  joined: exit ? false : e.joined && !fullyRefund,
                },
          ),
        );
        updateCohort(cohort.id, {
          totalReceipt: Math.max(0, cohort.totalReceipt - draft.amount),
          paidCount: exit && wasJoined ? Math.max(0, cohort.paidCount - 1) : cohort.paidCount,
        });
        setFinanceState(prev => ({
          ...prev,
          currentCashBalance: prev.currentCashBalance - draft.amount,
          cashReceipts: [
            ...prev.cashReceipts,
            {
              id: `cash-refund-${Date.now()}`,
              date: draft.date || MOCK_TODAY_ISO,
              title: `${enrollment.studentName} 退款`,
              amount: -draft.amount,
              enrollmentId: enrollment.id,
              leadId: enrollment.leadId,
              cohortId: enrollment.cohortId,
              paymentMethod: enrollment.paymentMethod,
              operator: draft.operator,
              serialNo: makeSerial('RF'),
              status: '已退款',
              note: draft.reason,
              kind: 'refund',
            },
          ],
        }));
        setLeads(prev =>
          prev.map(l => {
            if (l.id !== enrollment.leadId) return l;
            const paidAmount = Math.max(0, l.paidAmount - draft.amount);
            const enrolledCohortIds = exit
              ? (l.enrolledCohortIds ?? []).filter(id => id !== cohort.id)
              : l.enrolledCohortIds ?? [];
            const stage = fullyRefund
              ? '已退款'
              : paidAmount > 0
                ? '部分付款'
                : '已签约';
            return withAnomaly({
              ...l,
              paidAmount,
              enrolled: enrolledCohortIds.length > 0,
              enrolledCohortIds,
              stage,
              categories: fullyRefund ? [] : ['deposit-paid'],
              suggestedAction: getSuggestedActionForStage(stage),
            });
          }),
        );
        pushLog({
          operator: draft.operator,
          type: '退款',
          target: enrollment.studentName,
          before: `${enrollment.paidAmount}｜入班${wasJoined}`,
          after: `退${draft.amount}｜剩余${nextPaid}｜退出班期${exit}`,
          reason: draft.reason,
        });
        return { ok: true };
      } finally {
        window.setTimeout(() => {
          savingRef.current = false;
        }, 400);
      }
    },
    [cohorts, enrollments, pushLog, updateCohort],
  );

  const applyScheduleMentorSync = useCallback((nextSchedules: ScheduleItem[], cohortId: string) => {
    const mentorCost = computeScheduleMentorCost(nextSchedules);
    setMentorPayables(prev => syncMentorPayablesFromSchedules(nextSchedules, cohortId, prev));
    setFinanceState(prev => ({
      ...prev,
      paymentPlans: prev.paymentPlans.map(p =>
        p.id === 'pay-teacher'
          ? {
              ...p,
              dueAmount: Math.max(mentorCost, p.paidAmount),
              status:
                p.paidAmount >= mentorCost && mentorCost > 0
                  ? ('已支付' as const)
                  : p.paidAmount > 0
                    ? ('部分支付' as const)
                    : ('待付款' as const),
            }
          : p,
      ),
    }));
  }, []);

  const addSchedule = useCallback(
    (draft: ScheduleDraft): boolean => {
      const cohortId = draft.cohortId || activeCohortId;
      const cohort = cohorts.find(c => c.id === cohortId);
      if (!cohort) return false;
      const errors = validateScheduleDraft(draft, cohort);
      if (Object.keys(errors).length > 0) return false;
      const item: ScheduleItem = {
        id: `sch-${Date.now()}`,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId,
        ...draft,
        date: formatDateShort(draft.dateIso),
        calcPay: draft.sessionType === '考试' || draft.sessionType === '结业' ? false : draft.calcPay,
        payAmount: draft.sessionType === '考试' || draft.sessionType === '结业' ? 0 : draft.payAmount,
        status: draft.status ?? '待确认',
      };
      setSchedules(prev => {
        const next = [...prev, item].sort((a, b) =>
          `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`),
        );
        applyScheduleMentorSync(
          filterSchedulesByCohort(next, cohortId),
          cohortId,
        );
        return next;
      });
      pushLog({
        operator: item.teacher,
        type: '添加课程',
        target: `${item.date} ${item.content}`,
        before: '—',
        after: `课酬${item.payAmount}｜计酬${item.calcPay}｜${item.status}`,
        reason: item.customPayReason || '',
      });
      return true;
    },
    [activeCohortId, applyScheduleMentorSync, cohorts, pushLog],
  );

  const updateSchedule = useCallback(
    (id: string, patch: Partial<ScheduleItem>): boolean => {
      const current = schedules.find(s => s.id === id);
      if (!current) return false;
      const cohortId = current.cohortId || activeCohortId;
      const cohort = cohorts.find(c => c.id === cohortId);
      if (!cohort) return false;
      const payable = mentorPayables.find(p => p.sessionId === id);
      if (payable?.status === '已支付' && ((patch.payAmount != null && patch.payAmount !== current.payAmount) || patch.calcPay === false)) {
        return false;
      }
      const merged = { ...current, ...patch, cohortId };
      const errors = validateScheduleDraft(merged, cohort);
      if (Object.keys(errors).length > 0) return false;
      setSchedules(prev => {
        const next = prev
          .map(s => (s.id === id ? merged : s))
          .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`));
        applyScheduleMentorSync(filterSchedulesByCohort(next, cohortId), cohortId);
        return next;
      });
      pushLog({
        operator: merged.teacher,
        type: '修改课酬',
        target: `${merged.date} ${merged.content}`,
        before: `${current.payAmount}`,
        after: `${merged.payAmount}`,
        reason: merged.customPayReason || '',
      });
      return true;
    },
    [activeCohortId, applyScheduleMentorSync, cohorts, mentorPayables, pushLog, schedules],
  );

  const deleteSchedule = useCallback(
    (id: string): { ok: boolean; error?: string } => {
      const current = schedules.find(s => s.id === id);
      if (!current) return { ok: false, error: '课次不存在' };
      if (current.status === '已完成') {
        return { ok: false, error: '已完成课次不能直接删除' };
      }
      const payable = mentorPayables.find(p => p.sessionId === id);
      if (payable && payable.status === '已支付') {
        return { ok: false, error: '已支付课酬不得直接删除，请走异常处理' };
      }
      const cohortId = current.cohortId || activeCohortId;
      setSchedules(prev => {
        const next = prev.filter(s => s.id !== id);
        applyScheduleMentorSync(filterSchedulesByCohort(next, cohortId), cohortId);
        return next;
      });
      pushLog({
        operator: current.teacher || '系统',
        type: '删除课程',
        target: `${current.date} ${current.content}`,
        before: `${current.payAmount}`,
        after: '已删除并冲回未付应付',
        reason: '',
      });
      return { ok: true };
    },
    [activeCohortId, applyScheduleMentorSync, mentorPayables, pushLog, schedules],
  );

  const pushScheduleChange = useCallback(
    (entry: Omit<ScheduleChangeLog, 'id' | 'at' | 'businessUnitId'> & { at?: string }) => {
      const full: ScheduleChangeLog = {
        id: `scl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        at: entry.at ?? nowLogTime(),
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId: entry.cohortId,
        sessionId: entry.sessionId,
        changeType: entry.changeType,
        before: entry.before,
        after: entry.after,
        reason: entry.reason,
        operator: entry.operator,
      };
      setScheduleChangeLogs(prev => [full, ...prev].slice(0, 120));
    },
    [],
  );

  const changeSessionTeacher = useCallback(
    (sessionId: string, teacher: string, reason: string): { ok: boolean; error?: string } => {
      const current = schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (!teacher.trim()) return { ok: false, error: '请选择导师' };
      if (!reason.trim()) return { ok: false, error: '请填写更换原因' };
      const payable = mentorPayables.find(p => p.sessionId === sessionId);
      if (payable?.status === '已支付') {
        return { ok: false, error: '已支付课酬课次更换导师需异常处理' };
      }
      const config = getTeacherPay(teacher);
      const patch: Partial<ScheduleItem> = {
        teacher,
        ...(config
          ? {
              payMethod: config.payMethod,
              payAmount: current.calcPay ? config.defaultAmount : 0,
              customPayReason: '',
            }
          : {}),
      };
      const ok = updateSchedule(sessionId, patch);
      if (!ok) return { ok: false, error: '更换导师失败' };
      pushScheduleChange({
        cohortId: current.cohortId,
        sessionId,
        changeType: '更换导师',
        before: current.teacher,
        after: teacher,
        reason,
        operator: '总部管理员',
      });
      pushLog({
        operator: '总部管理员',
        type: '更换导师',
        target: `${current.date} ${current.content}`,
        before: current.teacher,
        after: teacher,
        reason,
      });
      return { ok: true };
    },
    [mentorPayables, pushLog, pushScheduleChange, schedules, updateSchedule],
  );

  const rescheduleSession = useCallback(
    (
      sessionId: string,
      next: { dateIso: string; startTime: string; endTime: string; reason: string },
    ): { ok: boolean; error?: string } => {
      const current = schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (!next.reason.trim()) return { ok: false, error: '改期必须填写原因' };
      const ok = updateSchedule(sessionId, {
        originalDateIso: current.originalDateIso || current.dateIso,
        dateIso: next.dateIso,
        date: formatDateShort(next.dateIso),
        startTime: next.startTime,
        endTime: next.endTime,
        status: '已发布',
      });
      if (!ok) return { ok: false, error: '改期失败，请检查日期时间' };
      pushScheduleChange({
        cohortId: current.cohortId,
        sessionId,
        changeType: '改期',
        before: `${current.dateIso} ${current.startTime}-${current.endTime}`,
        after: `${next.dateIso} ${next.startTime}-${next.endTime}`,
        reason: next.reason,
        operator: '总部管理员',
      });
      pushLog({
        operator: '总部管理员',
        type: '改期',
        target: `${current.content}`,
        before: `${current.dateIso} ${current.startTime}-${current.endTime}`,
        after: `${next.dateIso} ${next.startTime}-${next.endTime}`,
        reason: next.reason,
      });
      return { ok: true };
    },
    [pushLog, pushScheduleChange, schedules, updateSchedule],
  );

  const cancelSession = useCallback(
    (sessionId: string, reason: string): { ok: boolean; error?: string } => {
      const current = schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (!reason.trim()) return { ok: false, error: '取消课次必须填写原因' };
      if (current.status === '已完成') return { ok: false, error: '已完成课次不能取消' };
      const payable = mentorPayables.find(p => p.sessionId === sessionId);
      if (payable?.status === '已支付') return { ok: false, error: '已支付课酬课次不能取消，请走异常处理' };
      updateSchedule(sessionId, { status: '已取消', cancelReason: reason, calcPay: false, payAmount: 0 });
      pushScheduleChange({
        cohortId: current.cohortId,
        sessionId,
        changeType: '取消',
        before: current.status,
        after: '已取消',
        reason,
        operator: '总部管理员',
      });
      pushLog({
        operator: '总部管理员',
        type: '取消课次',
        target: `${current.date} ${current.content}`,
        before: current.status,
        after: '已取消',
        reason,
      });
      return { ok: true };
    },
    [mentorPayables, pushLog, pushScheduleChange, schedules, updateSchedule],
  );

  const saveAttendance = useCallback(
    (draft: AttendanceDraft): { ok: boolean; error?: string } => {
      if (savingRef.current) return { ok: false, error: '正在保存，请勿重复点击' };
      const session = schedules.find(s => s.id === draft.sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      if (!draft.entries.length) return { ok: false, error: '没有可签到学员' };
      savingRef.current = true;
      try {
        const existing = attendances.find(a => a.sessionId === draft.sessionId);
        const entries = draft.entries.map(entry => {
          const prev = existing?.entries.find(e => e.studentId === entry.studentId);
          return {
            ...entry,
            previousStatus: prev?.status !== entry.status ? prev?.status : entry.previousStatus,
          };
        });
        const sheet: AttendanceSheet = {
          id: existing?.id ?? `att-${Date.now()}`,
          businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
          cohortId: session.cohortId,
          sessionId: session.id,
          entries,
          savedAt: nowLogTime(),
          operator: draft.operator || '总部管理员',
        };
        const signedCount = entries.filter(e => e.status === '已到' || e.status === '迟到' || e.status === '早退').length;
        const leaveCount = entries.filter(e => e.status === '请假').length;
        const absentCount = entries.filter(e => e.status === '缺勤').length;
        setAttendances(prev => {
          const others = prev.filter(a => a.sessionId !== draft.sessionId);
          return [sheet, ...others];
        });
        setSchedules(prev =>
          prev.map(s =>
            s.id === session.id
              ? {
                  ...s,
                  attendanceSaved: true,
                  signedCount,
                  leaveCount,
                  absentCount,
                  status: nextSessionStatusAfterAttendance(s.status),
                }
              : s,
          ),
        );
        // Auto-create leave requests for 请假 entries that need makeup tracking
        const leaveEntries = entries.filter(e => e.status === '请假');
        if (leaveEntries.length) {
          setLeaveRequests(prev => {
            const next = [...prev];
            leaveEntries.forEach(e => {
              if (next.some(l => l.sessionId === session.id && l.studentId === e.studentId && l.status === '已批准')) {
                return;
              }
              next.unshift({
                id: `leave-${Date.now()}-${e.studentId}`,
                businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
                cohortId: session.cohortId,
                sessionId: session.id,
                studentId: e.studentId,
                leadId: e.leadId,
                reason: e.note || '签到登记请假',
                leaveAt: session.dateIso,
                needMakeup: true,
                note: e.note,
                operator: draft.operator || '总部管理员',
                status: '已批准',
                createdAt: nowLogTime(),
              });
            });
            return next;
          });
        }
        const changes = entries
          .filter(e => e.previousStatus && e.previousStatus !== e.status)
          .map(e => `${e.studentId}:${e.previousStatus}→${e.status}`)
          .join('；');
        pushLog({
          operator: draft.operator || '总部管理员',
          type: '记录签到',
          target: `${session.date} ${session.content}`,
          before: existing ? `已签${existing.entries.length}` : '未签到',
          after: `到${signedCount}/假${leaveCount}/缺${absentCount}`,
          reason: changes || '首次签到保存',
        });
        return { ok: true };
      } finally {
        window.setTimeout(() => {
          savingRef.current = false;
        }, 400);
      }
    },
    [attendances, pushLog, schedules],
  );

  const createLeaveRequest = useCallback(
    (draft: LeaveDraft): { ok: boolean; error?: string; id?: string } => {
      const session = schedules.find(s => s.id === draft.sessionId);
      const enrollment = enrollments.find(e => e.id === draft.studentId);
      if (!session || !enrollment) return { ok: false, error: '课次或学员不存在' };
      if (!draft.reason.trim()) return { ok: false, error: '请填写请假原因' };
      const id = `leave-${Date.now()}`;
      const leave: LeaveRequest = {
        id,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId: session.cohortId,
        sessionId: session.id,
        studentId: enrollment.id,
        leadId: enrollment.leadId,
        reason: draft.reason.trim(),
        leaveAt: draft.leaveAt || session.dateIso,
        needMakeup: draft.needMakeup,
        note: draft.note,
        operator: draft.operator || '总部管理员',
        status: '已批准',
        createdAt: nowLogTime(),
      };
      setLeaveRequests(prev => [leave, ...prev]);
      // Sync attendance entry to 请假
      setAttendances(prev => {
        const existing = prev.find(a => a.sessionId === session.id);
        const students = getActiveCohortStudents(enrollments, session.cohortId);
        const baseEntries =
          existing?.entries ??
          students.map(s => ({
            studentId: s.id,
            leadId: s.leadId,
            status: '待签到' as const,
          }));
        const entries = baseEntries.map(e =>
          e.studentId === enrollment.id
            ? { ...e, previousStatus: e.status, status: '请假' as const, note: draft.reason }
            : e,
        );
        const sheet: AttendanceSheet = {
          id: existing?.id ?? `att-${session.id}`,
          businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
          cohortId: session.cohortId,
          sessionId: session.id,
          entries,
          savedAt: nowLogTime(),
          operator: draft.operator || '总部管理员',
        };
        return [sheet, ...prev.filter(a => a.sessionId !== session.id)];
      });
      pushLog({
        operator: draft.operator || '总部管理员',
        type: '记录请假',
        target: enrollment.studentName,
        before: '—',
        after: `请假｜需补课${draft.needMakeup}`,
        reason: draft.reason,
      });
      return { ok: true, id };
    },
    [enrollments, pushLog, schedules],
  );

  const arrangeMakeup = useCallback(
    (draft: MakeupDraft): { ok: boolean; error?: string; id?: string } => {
      if (!draft.method) return { ok: false, error: '请选择补课方式' };
      if (!draft.makeupDate) return { ok: false, error: '请选择补课日期' };
      const enrollment = enrollments.find(e => e.id === draft.studentId);
      const session = schedules.find(s => s.id === draft.sessionId);
      if (!enrollment || !session) return { ok: false, error: '学员或原课次不存在' };
      const id = `makeup-${Date.now()}`;
      const record: MakeupRecord = {
        id,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId: session.cohortId,
        sessionId: session.id,
        studentId: enrollment.id,
        leadId: enrollment.leadId,
        leaveRequestId: draft.leaveRequestId,
        method: draft.method,
        makeupDate: draft.makeupDate,
        makeupSessionId: draft.makeupSessionId,
        teacher: draft.teacher || session.teacher,
        note: draft.note,
        status: draft.method === '免补课' ? '已完成' : '已安排',
        createdAt: nowLogTime(),
        completedAt: draft.method === '免补课' ? nowLogTime() : undefined,
      };
      setMakeupRecords(prev => [record, ...prev.filter(m => !(m.leaveRequestId && m.leaveRequestId === draft.leaveRequestId))]);
      if (draft.leaveRequestId) {
        setLeaveRequests(prev =>
          prev.map(l => (l.id === draft.leaveRequestId ? { ...l, makeupId: id } : l)),
        );
      }
      pushLog({
        operator: '总部管理员',
        type: '安排补课',
        target: enrollment.studentName,
        before: '待安排',
        after: `${draft.method}｜${draft.makeupDate}`,
        reason: draft.note || '',
      });
      return { ok: true, id };
    },
    [enrollments, pushLog, schedules],
  );

  const completeMakeup = useCallback(
    (makeupId: string): { ok: boolean; error?: string } => {
      const record = makeupRecords.find(m => m.id === makeupId);
      if (!record) return { ok: false, error: '补课记录不存在' };
      setMakeupRecords(prev =>
        prev.map(m =>
          m.id === makeupId ? { ...m, status: '已完成', completedAt: nowLogTime() } : m,
        ),
      );
      pushLog({
        operator: '总部管理员',
        type: '完成补课',
        target: record.studentId,
        before: record.status,
        after: '已完成',
        reason: '不修改原签到事实',
      });
      return { ok: true };
    },
    [makeupRecords, pushLog],
  );

  const saveTeachingRecord = useCallback(
    (draft: TeachingRecordDraft): { ok: boolean; error?: string } => {
      const session = schedules.find(s => s.id === draft.sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      if (!draft.completionStatus.trim()) return { ok: false, error: '请填写教学完成情况' };
      const id = teachingRecords.find(t => t.sessionId === session.id)?.id ?? `teach-${Date.now()}`;
      const record: TeachingRecord = {
        id,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId: session.cohortId,
        sessionId: session.id,
        contentActual: draft.contentActual,
        completionStatus: draft.completionStatus,
        studentPerformance: draft.studentPerformance,
        keyIssues: draft.keyIssues,
        nextSuggestion: draft.nextSuggestion,
        attachmentNote: draft.attachmentNote,
        recorder: draft.recorder || '总部管理员',
        recordedAt: nowLogTime(),
        anomalyNote: draft.anomalyNote,
      };
      setTeachingRecords(prev => [record, ...prev.filter(t => t.sessionId !== session.id)]);
      setSchedules(prev =>
        prev.map(s => (s.id === session.id ? { ...s, teachingRecordId: id } : s)),
      );
      pushLog({
        operator: record.recorder,
        type: '教学记录',
        target: `${session.date} ${session.content}`,
        before: '未填写',
        after: draft.completionStatus,
        reason: draft.anomalyNote || '',
      });
      return { ok: true };
    },
    [pushLog, schedules, teachingRecords],
  );

  const completeTeachingSession = useCallback(
    (sessionId: string): { ok: boolean; error?: string } => {
      const session = schedules.find(s => s.id === sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      const attendance = attendances.find(a => a.sessionId === sessionId) ?? null;
      const teaching = teachingRecords.find(t => t.sessionId === sessionId) ?? null;
      const check = canCompleteSession({ session, attendance, teaching });
      if (!check.ok) return check;
      setSchedules(prev => prev.map(s => (s.id === sessionId ? { ...s, status: '已完成' } : s)));
      pushLog({
        operator: teaching?.recorder || '总部管理员',
        type: '完成课次',
        target: `${session.date} ${session.content}`,
        before: session.status,
        after: '已完成',
        reason: '',
      });
      return { ok: true };
    },
    [attendances, pushLog, schedules, teachingRecords],
  );

  const assignOwner = useCallback(
    (owner: string) => {
      updateCohort(activeCohortId, { recruitmentOwner: owner });
      setLeads(prev => prev.map(l => (l.owner === '待指定' ? withAnomaly({ ...l, owner }) : l)));
      pushLog({
        operator: '总部管理员',
        type: '指定负责人',
        target: activeCohort?.displayTitle || activeCohortId,
        before: '待指定',
        after: owner,
        reason: '',
      });
    },
    [activeCohort?.displayTitle, activeCohortId, pushLog, updateCohort],
  );

  const completeTodo = useCallback((todoId: string) => {
    setDismissedTodoIds(prev => new Set([...prev, todoId]));
  }, []);

  const configurePaymentPlan = useCallback(() => {
    setPaymentPlanConfigured(true);
    pushLog({
      operator: '财务',
      type: '配置付款计划',
      target: '硬装',
      before: '未配置',
      after: '已配置',
      reason: 'mock',
    });
  }, [pushLog]);

  const updateFinanceState = useCallback((patch: Partial<ResearchCenterFinanceState>) => {
    setFinanceState(prev => ({ ...prev, ...patch }));
  }, []);

  const updateBudget = useCallback(
    (cohortId: string, patch: Partial<CohortBudgetSimulation>) => {
      setFinanceState(prev => ({
        ...prev,
        budgetByCohortId: {
          ...prev.budgetByCohortId,
          [cohortId]: {
            ...(prev.budgetByCohortId[cohortId] ?? createDefaultBudget(cohorts.find(c => c.id === cohortId)!)),
            ...patch,
          },
        },
      }));
    },
    [cohorts],
  );

  const saveCohortBudget = useCallback(
    (cohortId: string) => {
      const budget = financeState.budgetByCohortId[cohortId];
      if (!budget) return;
      updateCohort(cohortId, {
        standardPrice: budget.avgDealPrice,
        commissionRate: budget.commissionRate,
        projectDirectCost: budget.mentorDirectCost,
        accommodationCost: budget.accommodationCost,
        otherFixedProjectCost: budget.otherDirectCost,
      });
      pushLog({
        operator: '财务',
        type: '保存班期预算',
        target: cohortId,
        before: '—',
        after: `测算${budget.simCount}人`,
        reason: '不覆盖实际实缴',
      });
    },
    [financeState.budgetByCohortId, pushLog, updateCohort],
  );

  const updateFixedCost = useCallback((id: string, patch: Partial<FixedCostItem>) => {
    setFinanceState(prev => ({
      ...prev,
      fixedCosts: prev.fixedCosts.map(item => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }, []);

  const updateRenovationNodes = useCallback((nodes: RenovationPaymentNode[]) => {
    setFinanceState(prev => {
      const totalDue = nodes.reduce((s, n) => s + n.dueAmount, 0);
      const paid = nodes.reduce((s, n) => s + n.paidAmount, 0);
      return {
        ...prev,
        renovation: { ...prev.renovation, paymentNodes: nodes, paidAmount: paid },
        paymentPlans: prev.paymentPlans.map(p =>
          p.id === 'pay-hardcover'
            ? {
                ...p,
                dueAmount: totalDue,
                paidAmount: paid,
                status: paid >= totalDue && totalDue > 0 ? '已支付' : totalDue > 0 ? '待付款' : '待配置',
              }
            : p,
        ),
      };
    });
    if (nodes.length > 0) setPaymentPlanConfigured(true);
  }, []);

  const updatePaybackScenario = useCallback(
    (id: PaybackScenarioConfig['id'], patch: Partial<PaybackScenarioConfig>) => {
      setFinanceState(prev => ({
        ...prev,
        paybackScenarios: prev.paybackScenarios.map(s => (s.id === id ? { ...s, ...patch } : s)),
      }));
    },
    [],
  );

  const recordPlanPayment = useCallback((planId: string) => {
    setFinanceState(prev => {
      const plan = prev.paymentPlans.find(p => p.id === planId);
      const payAmount = plan ? Math.max(0, plan.dueAmount - plan.paidAmount) : 0;
      return {
        ...prev,
        currentCashBalance: prev.currentCashBalance - payAmount,
        paymentPlans: prev.paymentPlans.map(p =>
          p.id === planId ? { ...p, paidAmount: p.dueAmount, status: '已支付' as const } : p,
        ),
        cashReceipts:
          payAmount > 0
            ? [
                ...prev.cashReceipts,
                {
                  id: `cash-pay-${planId}-${Date.now()}`,
                  date: MOCK_TODAY_ISO,
                  title: plan?.title ?? '付款',
                  amount: -payAmount,
                  kind: 'payout' as const,
                  status: '已支付',
                },
              ]
            : prev.cashReceipts,
      };
    });
  }, []);

  const setActiveCohortIdWithBudget = useCallback(
    (id: string) => {
      setActiveCohortId(id);
      setFinanceState(prev => {
        if (prev.budgetByCohortId[id]) return prev;
        const cohort = cohorts.find(c => c.id === id);
        if (!cohort) return prev;
        return { ...prev, budgetByCohortId: { ...prev.budgetByCohortId, [id]: createDefaultBudget(cohort) } };
      });
    },
    [cohorts],
  );

  const diagnosisConclusion = useMemo(
    () => (activeCohort ? deriveDiagnosisConclusion(activeCohort, finance) : '暂无班期数据'),
    [activeCohort, finance],
  );

  const actionLog = useMemo(
    () => operationLogs.map(l => `${l.at} [${l.type}] ${l.target}：${l.before} → ${l.after}${l.reason ? `（${l.reason}）` : ''}`),
    [operationLogs],
  );

  return {
    snapshot,
    activeTab,
    setActiveTab,
    activeCohortId,
    setActiveCohortId: setActiveCohortIdWithBudget,
    cohorts,
    activeCohort,
    schedules,
    leads,
    enrollments,
    todos,
    leadCategories,
    funnelStages,
    scheduleMentorCost,
    mentorPayables,
    paymentPlanConfigured,
    financeState,
    operationLogs,
    actionLog,
    canDirectManage: service.can(RESEARCH_PERMISSIONS.COHORT_EDIT),
    can: service.can.bind(service),
    finance,
    diagnosisConclusion,
    cohortStats,
    attendances,
    leaveRequests,
    makeupRecords,
    teachingRecords,
    scheduleChangeLogs,
    domainEvents,
    updateCohort,
    addLead,
    addFollowUp,
    updateLeadFields,
    scheduleInterview,
    recordInterviewResult,
    saveEnrollment,
    recordReceipt,
    joinCohort,
    refundEnrollment,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    changeSessionTeacher,
    rescheduleSession,
    cancelSession,
    saveAttendance,
    createLeaveRequest,
    arrangeMakeup,
    completeMakeup,
    saveTeachingRecord,
    completeTeachingSession,
    assignOwner,
    completeTodo,
    configurePaymentPlan,
    updateFinanceState,
    updateBudget,
    saveCohortBudget,
    updateFixedCost,
    updateRenovationNodes,
    updatePaybackScenario,
    recordPlanPayment,
    resetTestData,
    recommendNextStage: suggestNextLeadStage,
  };
}

export type ResearchCenterContext = ReturnType<typeof useResearchCenterState>;
