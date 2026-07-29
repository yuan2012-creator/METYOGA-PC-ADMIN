import {
  RESEARCH_CENTER_EVENTS,
  createPermissionChecker,
  nowIso,
  validateLeadStageTransition,
  validateLeaveTransition,
  validateMakeupTransition,
  normalizeLeadStage,
  type ResearchRole,
} from '../domain';
import type { DomainEvent } from '../domain/types';
import {
  applyCohortDerivedFields,
  computeScheduleMentorCost,
  derivePaymentStatus,
  detectLeadAnomaly,
  getSuggestedActionForStage,
  isFullyPaidStatus,
  syncMentorPayablesFromSchedules,
  validateCohortPatch,
  validateScheduleDraft,
} from '../researchCenterCalculations';
import {
  canCompleteSession,
  filterSchedulesByCohort,
  getActiveCohortStudents,
  nextSessionStatusAfterAttendance,
} from '../researchCenterDeliveryCalculations';
import { formatDateShort, getTeacherPay, MOCK_TODAY_ISO } from '../researchCenterOptions';
import type {
  AttendanceDraft,
  EnrollmentDraft,
  EnrollmentRecord,
  FollowUpDraft,
  InterviewResultDraft,
  InterviewScheduleDraft,
  LeadDraft,
  LeadRecord,
  LeaveDraft,
  MakeupDraft,
  OperationLogEntry,
  ReceiptDraft,
  RefundDraft,
  ScheduleChangeLog,
  ScheduleDraft,
  ScheduleItem,
  TeachingRecord,
  TeachingRecordDraft,
} from '../researchCenterV2.viewModel';
import { RESEARCH_CENTER_BUSINESS_UNIT_ID } from '../researchCenterV2.viewModel';
import {
  clearResearchCenterSnapshot,
  loadResearchCenterSnapshot,
  saveResearchCenterSnapshot,
  type ResearchCenterPersistedSnapshot,
} from '../researchCenterPersistence';
import type { ResearchPermission } from '../domain/permissions';
import type { ResearchCenterService, ServiceResult } from './ResearchCenterService';
import { buildInitialResearchCenterSnapshot } from './buildInitialSnapshot';

type LogEntry = OperationLogEntry & { forced?: boolean };

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

function validateSnapshotShape(raw: unknown): raw is ResearchCenterPersistedSnapshot {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as Partial<ResearchCenterPersistedSnapshot>;
  return (
    Array.isArray(s.cohorts) &&
    Array.isArray(s.leads) &&
    Array.isArray(s.schedules) &&
    Array.isArray(s.enrollments) &&
    s.financeState != null &&
    typeof s.activeCohortId === 'string'
  );
}

function tryPersist(snapshot: ResearchCenterPersistedSnapshot): ServiceResult {
  try {
    if (typeof localStorage === 'undefined') {
      return { ok: false, error: 'localStorage 不可用' };
    }
    saveResearchCenterSnapshot(snapshot);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存失败' };
  }
}

function appendOperationLog(
  draft: ResearchCenterPersistedSnapshot,
  entry: Omit<LogEntry, 'id' | 'at'> & { at?: string },
): void {
  const full: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: entry.at ?? nowLogTime(),
    operator: entry.operator,
    type: entry.type,
    target: entry.target,
    before: entry.before,
    after: entry.after,
    reason: entry.reason,
    forced: entry.forced,
  };
  draft.operationLogs = [full, ...(draft.operationLogs ?? [])].slice(0, 80);
}

function appendDomainEvent(
  draft: ResearchCenterPersistedSnapshot,
  event: Omit<DomainEvent, 'id' | 'at' | 'businessUnitId'> & { at?: string },
): void {
  const full: DomainEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
    at: event.at ?? nowIso(),
    name: event.name,
    actorName: event.actorName,
    actorId: event.actorId,
    objectType: event.objectType,
    objectId: event.objectId,
    before: event.before,
    after: event.after,
    reason: event.reason,
    forced: event.forced,
    payload: event.payload,
  };
  draft.domainEvents = [full, ...(draft.domainEvents ?? [])].slice(0, 200);
}

function updateCohortInDraft(
  draft: ResearchCenterPersistedSnapshot,
  cohortId: string,
  patch: Partial<ResearchCenterPersistedSnapshot['cohorts'][number]>,
): ServiceResult {
  const cohort = draft.cohorts.find(c => c.id === cohortId);
  if (!cohort) return { ok: false, error: '班期不存在' };
  const errors = validateCohortPatch(patch, cohort, draft.schedules);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: Object.values(errors)[0] ?? '班期参数无效' };
  }
  draft.cohorts = draft.cohorts.map(c =>
    c.id === cohortId ? applyCohortDerivedFields({ ...c, ...patch }) : c,
  );
  return { ok: true };
}

function applyScheduleMentorSyncToDraft(
  draft: ResearchCenterPersistedSnapshot,
  cohortSchedules: ScheduleItem[],
  cohortId: string,
): void {
  const mentorCost = computeScheduleMentorCost(cohortSchedules);
  draft.mentorPayables = syncMentorPayablesFromSchedules(cohortSchedules, cohortId, draft.mentorPayables);
  draft.financeState = {
    ...draft.financeState,
    paymentPlans: draft.financeState.paymentPlans.map(p =>
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
  };
}

function pushScheduleChange(
  draft: ResearchCenterPersistedSnapshot,
  entry: Omit<ScheduleChangeLog, 'id' | 'at' | 'businessUnitId'> & { at?: string },
): void {
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
  draft.scheduleChangeLogs = [full, ...(draft.scheduleChangeLogs ?? [])].slice(0, 120);
}

export class LocalStorageResearchCenterService implements ResearchCenterService {
  readonly mode = 'local' as const;

  private snapshot: ResearchCenterPersistedSnapshot;
  private readonly listeners = new Set<() => void>();
  private readonly permissions: ReturnType<typeof createPermissionChecker>;
  private writing = false;

  constructor(role: ResearchRole = 'hq_admin') {
    this.permissions = createPermissionChecker(role);
    const loaded = typeof localStorage !== 'undefined' ? loadResearchCenterSnapshot() : null;
    this.snapshot = loaded ?? buildInitialResearchCenterSnapshot();
    if (this.snapshot.cohorts.length) {
      this.snapshot.cohorts = this.snapshot.cohorts.map(applyCohortDerivedFields);
    }
    this.snapshot.leads = this.snapshot.leads.map(withAnomaly);
  }

  async hydrate(): Promise<ServiceResult> {
    const loaded = loadResearchCenterSnapshot();
    this.snapshot = loaded ?? buildInitialResearchCenterSnapshot();
    if (this.snapshot.cohorts.length) {
      this.snapshot.cohorts = this.snapshot.cohorts.map(applyCohortDerivedFields);
    }
    this.snapshot.leads = this.snapshot.leads.map(withAnomaly);
    this.notify();
    return { ok: true };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): ResearchCenterPersistedSnapshot {
    return this.snapshot;
  }

  replaceSnapshot(next: ResearchCenterPersistedSnapshot): ServiceResult {
    if (!validateSnapshotShape(next)) {
      return { ok: false, error: '快照结构无效' };
    }
    return this.commit(next);
  }

  runTransaction<T = void>(
    mutator: (draft: ResearchCenterPersistedSnapshot) => void | ServiceResult<T>,
  ): ServiceResult<T> {
    if (this.writing) {
      return { ok: false, error: '正在写入，请稍后重试' };
    }
    this.writing = true;
    try {
      const draft = structuredClone(this.snapshot);
      const result = mutator(draft);
      if (result && !result.ok) return result;
      const commitResult = this.commit(draft, { alreadyLocked: true });
      if (!commitResult.ok) return commitResult as ServiceResult<T>;
      if (result && result.ok && 'data' in result) {
        return { ok: true, data: result.data };
      }
      return { ok: true } as ServiceResult<T>;
    } finally {
      this.writing = false;
    }
  }

  resetTestData(): ServiceResult {
    if (this.writing) {
      return { ok: false, error: '正在写入，请稍后重试' };
    }
    this.writing = true;
    try {
      clearResearchCenterSnapshot();
      const fresh = buildInitialResearchCenterSnapshot();
      fresh.leads = fresh.leads.map(withAnomaly);
      appendOperationLog(fresh, {
        operator: '总部管理员',
        type: '重置测试数据',
        target: '研学中心',
        before: '当前会话数据',
        after: '初始 Mock',
        reason: '原型验收重置（localStorage 已清空）',
      });
      appendDomainEvent(fresh, {
        name: 'research.reset_test_data',
        actorName: '总部管理员',
        objectType: 'research_center',
        objectId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        before: '当前会话数据',
        after: '初始 Mock',
        reason: '原型验收重置',
      });
      const saveResult = tryPersist(fresh);
      if (!saveResult.ok) return saveResult;
      this.snapshot = fresh;
      this.notify();
      return { ok: true };
    } finally {
      this.writing = false;
    }
  }

  // —— list / read ——

  listLeads(): ResearchCenterPersistedSnapshot['leads'] {
    return this.snapshot.leads;
  }

  listEnrollments(cohortId?: string): ResearchCenterPersistedSnapshot['enrollments'] {
    const all = this.snapshot.enrollments;
    return cohortId ? all.filter(e => e.cohortId === cohortId) : all;
  }

  listReceipts(cohortId?: string): ResearchCenterPersistedSnapshot['financeState']['cashReceipts'] {
    const receipts = this.snapshot.financeState.cashReceipts.filter(
      r => r.kind === 'receipt' || (!r.kind && r.amount > 0),
    );
    return cohortId ? receipts.filter(r => r.cohortId === cohortId) : receipts;
  }

  listRefunds(cohortId?: string): ResearchCenterPersistedSnapshot['financeState']['cashReceipts'] {
    const refunds = this.snapshot.financeState.cashReceipts.filter(
      r => r.kind === 'refund' || r.amount < 0,
    );
    return cohortId ? refunds.filter(r => r.cohortId === cohortId) : refunds;
  }

  listCohorts(): ResearchCenterPersistedSnapshot['cohorts'] {
    return this.snapshot.cohorts;
  }

  getCohort(cohortId: string): ResearchCenterPersistedSnapshot['cohorts'][number] | null {
    return this.snapshot.cohorts.find(c => c.id === cohortId) ?? null;
  }

  listMentorPayables(cohortId?: string): ResearchCenterPersistedSnapshot['mentorPayables'] {
    const all = this.snapshot.mentorPayables;
    return cohortId ? all.filter(p => p.cohortId === cohortId) : all;
  }

  listPaymentPlans(): ResearchCenterPersistedSnapshot['financeState']['paymentPlans'] {
    return this.snapshot.financeState.paymentPlans;
  }

  listOperationLogs(): OperationLogEntry[] {
    return this.snapshot.operationLogs;
  }

  listDomainEvents(): DomainEvent[] {
    return this.snapshot.domainEvents ?? [];
  }

  can(action: ResearchPermission): boolean {
    return this.permissions.can(action);
  }

  // —— 咨询与招生 ——

  createLead(draft: LeadDraft): ServiceResult<{ id: string }> {
    return this.runTransaction(draftSnap => {
      const name = draft.name.trim();
      if (!name) return { ok: false, error: '姓名必填' };

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

      draftSnap.leads = [lead, ...draftSnap.leads];
      appendOperationLog(draftSnap, {
        operator: draft.owner || '芳芳',
        type: '新增咨询',
        target: name,
        before: '—',
        after: '新咨询',
        reason: draft.note || draft.source || '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.LEAD_CREATED,
        actorName: draft.owner || '芳芳',
        objectType: 'lead',
        objectId: id,
        after: '新咨询',
      });
      return { ok: true, data: { id } };
    });
  }

  updateLead(
    leadId: string,
    patch: Partial<LeadRecord>,
    options?: { forceReason?: string },
  ): ServiceResult {
    return this.runTransaction(draftSnap => {
      const lead = draftSnap.leads.find(l => l.id === leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };

      if (patch.stage && patch.stage !== lead.stage) {
        const result = validateLeadStageTransition(lead.stage, patch.stage, lead, options);
        if (!result.ok) return { ok: false, error: result.error ?? '状态跳转无效' };
        draftSnap.leads = draftSnap.leads.map(l =>
          l.id === leadId
            ? withAnomaly({
                ...l,
                ...patch,
                intentTone: patch.intentLevel ? intentToneOf(patch.intentLevel) : l.intentTone,
                stage: normalizeLeadStage(patch.stage!),
                suggestedAction: getSuggestedActionForStage(patch.stage!),
              })
            : l,
        );
        appendOperationLog(draftSnap, {
          operator: '总部管理员',
          type: options?.forceReason ? '强制状态跳转' : '修改状态',
          target: lead.name,
          before: String(lead.stage),
          after: String(patch.stage),
          reason: options?.forceReason || '',
          forced: Boolean(options?.forceReason?.trim() || result.forced),
        });
        appendDomainEvent(draftSnap, {
          name: RESEARCH_CENTER_EVENTS.LEAD_STAGE_CHANGED,
          actorName: '总部管理员',
          objectType: 'lead',
          objectId: leadId,
          before: String(lead.stage),
          after: String(patch.stage),
          reason: options?.forceReason,
          forced: Boolean(options?.forceReason?.trim() || result.forced),
        });
        return { ok: true };
      }

      draftSnap.leads = draftSnap.leads.map(l =>
        l.id === leadId
          ? withAnomaly({
              ...l,
              ...patch,
              intentTone: patch.intentLevel ? intentToneOf(patch.intentLevel) : l.intentTone,
            })
          : l,
      );
      appendOperationLog(draftSnap, {
        operator: lead.owner,
        type: '修改状态',
        target: lead.name,
        before: '—',
        after: Object.keys(patch).join('、'),
        reason: '',
      });
      return { ok: true };
    });
  }

  changeLeadStage(leadId: string, stage: string, options?: { forceReason?: string }): ServiceResult {
    return this.updateLead(leadId, { stage }, options);
  }

  addFollowup(draft: FollowUpDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      const lead = draftSnap.leads.find(l => l.id === draft.leadId);
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
      if (!draft.stage || normalizeLeadStage(draft.stage) === current) {
        if (current === '新咨询' || current === '待联系') nextStage = '已联系';
        else if (current === '已联系' && (draft.nextStep.includes('面试') || draft.result.includes('面试')))
          nextStage = '有效意向';
        else if (current === '有效意向' && draft.nextStep.includes('面试')) nextStage = '待面试';
        else nextStage = current;
      }

      const transition = validateLeadStageTransition(String(lead.stage), String(nextStage), lead);
      if (!transition.ok) return { ok: false, error: transition.error ?? '状态跳转无效' };

      draftSnap.leads = draftSnap.leads.map(l => {
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
      });

      appendOperationLog(draftSnap, {
        operator: lead.owner,
        type: '跟进',
        target: lead.name,
        before: String(lead.stage),
        after: String(nextStage),
        reason: `${draft.method}：${draft.result}`,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.LEAD_FOLLOWED_UP,
        actorName: lead.owner,
        objectType: 'lead',
        objectId: draft.leadId,
        before: String(lead.stage),
        after: String(nextStage),
      });
      return { ok: true };
    });
  }

  scheduleInterview(draft: InterviewScheduleDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      const lead = draftSnap.leads.find(l => l.id === draft.leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };

      draftSnap.leads = draftSnap.leads.map(l =>
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
      );

      appendOperationLog(draftSnap, {
        operator: draft.interviewer,
        type: '安排面试',
        target: lead.name,
        before: String(lead.stage),
        after: '待面试',
        reason: `${draft.interviewMode} ${draft.scheduledAt}`,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.INTERVIEW_SCHEDULED,
        actorName: draft.interviewer,
        objectType: 'lead',
        objectId: draft.leadId,
        after: '待面试',
      });
      return { ok: true };
    });
  }

  saveInterviewResult(draft: InterviewResultDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      const lead = draftSnap.leads.find(l => l.id === draft.leadId);
      if (!lead) return { ok: false, error: '咨询者不存在' };

      const passed = draft.result === '通过' || draft.result === '有条件通过';
      const nextStage = passed ? '面试通过' : draft.result === '未到场' ? '有效意向' : '已面试';

      draftSnap.leads = draftSnap.leads.map(l =>
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
      );

      appendOperationLog(draftSnap, {
        operator: draft.interviewer,
        type: '录入面试结果',
        target: lead.name,
        before: String(lead.stage),
        after: `${draft.result} → ${nextStage}`,
        reason: draft.riskNote || draft.note || '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.INTERVIEW_COMPLETED,
        actorName: draft.interviewer,
        objectType: 'lead',
        objectId: draft.leadId,
        before: String(lead.stage),
        after: nextStage,
      });
      return { ok: true };
    });
  }

  // —— 报名与财务 ——

  createEnrollment(draft: EnrollmentDraft): ServiceResult<{ enrollmentId: string }> {
    return this.runTransaction(draftSnap => {
      if (!draft.cohortId) return { ok: false, error: '必须选择班期' };
      if (!draft.paymentMethod) return { ok: false, error: '必须选择付款方式' };
      if (!(draft.dealPrice > 0)) return { ok: false, error: '成交价格必须大于0' };

      const cohort = draftSnap.cohorts.find(c => c.id === draft.cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      let studentName = draft.newName?.trim() || '';
      let leadId = draft.leadId;
      let owner = draft.owner || cohort.recruitmentOwner;
      let course = draft.course || 'RYT200';

      if (draft.mode === 'existing') {
        const lead = draftSnap.leads.find(l => l.id === draft.leadId);
        if (!lead) return { ok: false, error: '请选择咨询者' };
        const dup = draftSnap.enrollments.find(
          e => e.leadId === lead.id && e.cohortId === draft.cohortId && !e.refunded,
        );
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

      draftSnap.enrollments = [...draftSnap.enrollments, record];

      if (initial > 0) {
        draftSnap.financeState = {
          ...draftSnap.financeState,
          currentCashBalance: draftSnap.financeState.currentCashBalance + initial,
          cashReceipts: [
            ...draftSnap.financeState.cashReceipts,
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
        };
        const cohortPatch = updateCohortInDraft(draftSnap, draft.cohortId, {
          totalReceipt: cohort.totalReceipt + initial,
        });
        if (cohortPatch.ok === false) return cohortPatch;
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
        draftSnap.leads = draftSnap.leads.map(l =>
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
        );
      } else {
        draftSnap.leads = [
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
          ...draftSnap.leads,
        ];
      }

      appendOperationLog(draftSnap, {
        operator: owner,
        type: '创建报名',
        target: studentName,
        before: '—',
        after: `${cohort.displayTitle}｜${paymentStatus}｜合同${record.contractStatus}`,
        reason: draft.note || '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.ENROLLMENT_CREATED,
        actorName: owner,
        objectType: 'enrollment',
        objectId: enrollmentId,
        after: paymentStatus,
      });
      return { ok: true, data: { enrollmentId } };
    });
  }

  recordReceipt(draft: ReceiptDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      if (!(draft.amount > 0)) return { ok: false, error: '本次收款必须大于0' };
      if (!draft.paymentMethod) return { ok: false, error: '请选择支付方式' };

      const enrollment = draftSnap.enrollments.find(e => e.id === draft.enrollmentId && !e.refunded);
      if (!enrollment) return { ok: false, error: '请选择已报名学员' };

      const remaining = Math.max(0, enrollment.dealPrice - enrollment.paidAmount);
      if (draft.amount > remaining + 0.001) return { ok: false, error: '收款金额不能超过未收金额' };

      const nextPaid = enrollment.paidAmount + draft.amount;
      const paymentStatus = derivePaymentStatus(enrollment.dealPrice, nextPaid);
      const cohort = draftSnap.cohorts.find(c => c.id === enrollment.cohortId);

      draftSnap.enrollments = draftSnap.enrollments.map(e =>
        e.id === enrollment.id ? { ...e, paidAmount: nextPaid, paymentStatus } : e,
      );

      if (cohort) {
        const patch = updateCohortInDraft(draftSnap, cohort.id, {
          totalReceipt: cohort.totalReceipt + draft.amount,
        });
        if (patch.ok === false) return patch;
      }

      draftSnap.financeState = {
        ...draftSnap.financeState,
        currentCashBalance: draftSnap.financeState.currentCashBalance + draft.amount,
        cashReceipts: [
          ...draftSnap.financeState.cashReceipts,
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
      };

      draftSnap.leads = draftSnap.leads.map(l =>
        l.id !== enrollment.leadId
          ? l
          : withAnomaly({
              ...l,
              paidAmount: l.paidAmount + draft.amount,
              stage: paymentStatus === '已付清' ? '已付清' : '部分付款',
              suggestedAction: getSuggestedActionForStage(
                paymentStatus === '已付清' ? '已付清' : '部分付款',
              ),
              categories: [...new Set([...l.categories.filter(c => c !== 'interview-passed'), 'deposit-paid'])],
              lastFollowUp: MOCK_TODAY_ISO,
              overdueDays: 0,
            }),
      );

      appendOperationLog(draftSnap, {
        operator: draft.operator,
        type: '录入收款',
        target: enrollment.studentName,
        before: `${enrollment.paidAmount}`,
        after: `${nextPaid}（${paymentStatus}）`,
        reason: draft.note || draft.paymentMethod,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.RECEIPT_RECORDED,
        actorName: draft.operator,
        objectType: 'enrollment',
        objectId: enrollment.id,
        after: `${nextPaid}（${paymentStatus}）`,
      });
      return { ok: true };
    });
  }

  createRefund(draft: RefundDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      const enrollment = draftSnap.enrollments.find(e => e.id === draft.enrollmentId && !e.refunded);
      if (!enrollment) return { ok: false, error: '报名记录不存在' };
      if (!(draft.amount > 0)) return { ok: false, error: '退款金额必须大于0' };
      if (draft.amount > enrollment.paidAmount + 0.001) return { ok: false, error: '退款金额不能超过可退金额' };
      if (!draft.reason.trim()) return { ok: false, error: '请填写退款原因' };

      const cohort = draftSnap.cohorts.find(c => c.id === enrollment.cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      const nextPaid = Math.max(0, enrollment.paidAmount - draft.amount);
      const fullyRefund = nextPaid <= 0;
      const exit = draft.exitCohort;
      const wasJoined = enrollment.joined;

      draftSnap.enrollments = draftSnap.enrollments.map(e =>
        e.id !== enrollment.id
          ? e
          : {
              ...e,
              paidAmount: nextPaid,
              paymentStatus: fullyRefund ? '未付款' : derivePaymentStatus(e.dealPrice, nextPaid),
              refunded: fullyRefund,
              joined: exit ? false : e.joined && !fullyRefund,
            },
      );

      const cohortPatch = updateCohortInDraft(draftSnap, cohort.id, {
        totalReceipt: Math.max(0, cohort.totalReceipt - draft.amount),
        paidCount: exit && wasJoined ? Math.max(0, cohort.paidCount - 1) : cohort.paidCount,
      });
      if (cohortPatch.ok === false) return cohortPatch;

      draftSnap.financeState = {
        ...draftSnap.financeState,
        currentCashBalance: draftSnap.financeState.currentCashBalance - draft.amount,
        cashReceipts: [
          ...draftSnap.financeState.cashReceipts,
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
      };

      draftSnap.leads = draftSnap.leads.map(l => {
        if (l.id !== enrollment.leadId) return l;
        const paidAmount = Math.max(0, l.paidAmount - draft.amount);
        const enrolledCohortIds = exit
          ? (l.enrolledCohortIds ?? []).filter(id => id !== cohort.id)
          : (l.enrolledCohortIds ?? []);
        const stage = fullyRefund ? '已退款' : paidAmount > 0 ? '部分付款' : '已签约';
        return withAnomaly({
          ...l,
          paidAmount,
          enrolled: enrolledCohortIds.length > 0,
          enrolledCohortIds,
          stage,
          categories: fullyRefund ? [] : ['deposit-paid'],
          suggestedAction: getSuggestedActionForStage(stage),
        });
      });

      appendOperationLog(draftSnap, {
        operator: draft.operator,
        type: '退款',
        target: enrollment.studentName,
        before: `${enrollment.paidAmount}｜入班${wasJoined}`,
        after: `退${draft.amount}｜剩余${nextPaid}｜退出班期${exit}`,
        reason: draft.reason,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.REFUND_CREATED,
        actorName: draft.operator,
        objectType: 'enrollment',
        objectId: enrollment.id,
        reason: draft.reason,
      });
      return { ok: true };
    });
  }

  confirmEnrollment(enrollmentId: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const enrollment = draftSnap.enrollments.find(e => e.id === enrollmentId && !e.refunded);
      if (!enrollment) return { ok: false, error: '报名记录不存在' };
      if (enrollment.joined) return { ok: false, error: '已加入班期' };
      if (!isFullyPaidStatus(enrollment.paymentStatus)) return { ok: false, error: '已付清后方可正式入班' };

      const cohort = draftSnap.cohorts.find(c => c.id === enrollment.cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      draftSnap.enrollments = draftSnap.enrollments.map(e =>
        e.id === enrollmentId ? { ...e, joined: true } : e,
      );

      const patch = updateCohortInDraft(draftSnap, cohort.id, { paidCount: cohort.paidCount + 1 });
      if (patch.ok === false) return patch;

      draftSnap.leads = draftSnap.leads.map(l =>
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
      );

      appendOperationLog(draftSnap, {
        operator: enrollment.owner,
        type: '确认入班',
        target: enrollment.studentName,
        before: '已付清',
        after: `已入班 · ${cohort.displayTitle}`,
        reason: '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.ENROLLMENT_CONFIRMED,
        actorName: enrollment.owner,
        objectType: 'enrollment',
        objectId: enrollmentId,
        after: `已入班 · ${cohort.displayTitle}`,
      });
      return { ok: true };
    });
  }

  // —— 班期与课程 ——

  updateCohort(
    cohortId: string,
    patch: Partial<ResearchCenterPersistedSnapshot['cohorts'][number]>,
  ): ServiceResult {
    return this.runTransaction(draftSnap => {
      const result = updateCohortInDraft(draftSnap, cohortId, patch);
      if (!result.ok) return result;
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.COHORT_UPDATED,
        actorName: '总部管理员',
        objectType: 'cohort',
        objectId: cohortId,
      });
      return { ok: true };
    });
  }

  createSession(draft: ScheduleDraft): ServiceResult<{ id: string }> {
    return this.runTransaction(draftSnap => {
      const cohortId = draft.cohortId || draftSnap.activeCohortId;
      const cohort = draftSnap.cohorts.find(c => c.id === cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      const errors = validateScheduleDraft(draft, cohort);
      if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors)[0] ?? '课次参数无效' };
      }

      const id = `sch-${Date.now()}`;
      const item: ScheduleItem = {
        id,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId,
        ...draft,
        date: formatDateShort(draft.dateIso),
        calcPay: draft.sessionType === '考试' || draft.sessionType === '结业' ? false : draft.calcPay,
        payAmount: draft.sessionType === '考试' || draft.sessionType === '结业' ? 0 : draft.payAmount,
        status: draft.status ?? '待确认',
      };

      draftSnap.schedules = [...draftSnap.schedules, item].sort((a, b) =>
        `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`),
      );
      applyScheduleMentorSyncToDraft(
        draftSnap,
        filterSchedulesByCohort(draftSnap.schedules, cohortId),
        cohortId,
      );

      appendOperationLog(draftSnap, {
        operator: item.teacher,
        type: '添加课程',
        target: `${item.date} ${item.content}`,
        before: '—',
        after: `课酬${item.payAmount}｜计酬${item.calcPay}｜${item.status}`,
        reason: item.customPayReason || '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.SESSION_CREATED,
        actorName: item.teacher,
        objectType: 'session',
        objectId: id,
      });
      return { ok: true, data: { id } };
    });
  }

  updateSession(sessionId: string, patch: Partial<ScheduleItem>): ServiceResult {
    return this.runTransaction(draftSnap => {
      const current = draftSnap.schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };

      const cohortId = current.cohortId || draftSnap.activeCohortId;
      const cohort = draftSnap.cohorts.find(c => c.id === cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      const payable = draftSnap.mentorPayables.find(p => p.sessionId === sessionId);
      if (
        payable?.status === '已支付' &&
        ((patch.payAmount != null && patch.payAmount !== current.payAmount) || patch.calcPay === false)
      ) {
        return { ok: false, error: '已支付课酬不得修改' };
      }

      const merged = { ...current, ...patch, cohortId };
      const errors = validateScheduleDraft(merged, cohort);
      if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors)[0] ?? '课次参数无效' };
      }

      draftSnap.schedules = draftSnap.schedules
        .map(s => (s.id === sessionId ? merged : s))
        .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`));

      applyScheduleMentorSyncToDraft(
        draftSnap,
        filterSchedulesByCohort(draftSnap.schedules, cohortId),
        cohortId,
      );

      appendOperationLog(draftSnap, {
        operator: merged.teacher,
        type: '修改课酬',
        target: `${merged.date} ${merged.content}`,
        before: `${current.payAmount}`,
        after: `${merged.payAmount}`,
        reason: merged.customPayReason || '',
      });
      return { ok: true };
    });
  }

  deleteSession(sessionId: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const current = draftSnap.schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (current.status === '已完成') return { ok: false, error: '已完成课次不能直接删除' };

      const payable = draftSnap.mentorPayables.find(p => p.sessionId === sessionId);
      if (payable?.status === '已支付') {
        return { ok: false, error: '已支付课酬不得直接删除，请走异常处理' };
      }

      const cohortId = current.cohortId || draftSnap.activeCohortId;
      draftSnap.schedules = draftSnap.schedules.filter(s => s.id !== sessionId);
      applyScheduleMentorSyncToDraft(
        draftSnap,
        filterSchedulesByCohort(draftSnap.schedules, cohortId),
        cohortId,
      );

      appendOperationLog(draftSnap, {
        operator: current.teacher || '系统',
        type: '删除课程',
        target: `${current.date} ${current.content}`,
        before: `${current.payAmount}`,
        after: '已删除并冲回未付应付',
        reason: '',
      });
      return { ok: true };
    });
  }

  changeSessionTeacher(sessionId: string, teacher: string, reason: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const current = draftSnap.schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (!teacher.trim()) return { ok: false, error: '请选择导师' };
      if (!reason.trim()) return { ok: false, error: '请填写更换原因' };

      const payable = draftSnap.mentorPayables.find(p => p.sessionId === sessionId);
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

      const cohortId = current.cohortId || draftSnap.activeCohortId;
      const cohort = draftSnap.cohorts.find(c => c.id === cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      const merged = { ...current, ...patch, cohortId };
      const errors = validateScheduleDraft(merged, cohort);
      if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors)[0] ?? '更换导师失败' };
      }

      draftSnap.schedules = draftSnap.schedules
        .map(s => (s.id === sessionId ? merged : s))
        .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`));

      applyScheduleMentorSyncToDraft(
        draftSnap,
        filterSchedulesByCohort(draftSnap.schedules, cohortId),
        cohortId,
      );

      pushScheduleChange(draftSnap, {
        cohortId: current.cohortId,
        sessionId,
        changeType: '更换导师',
        before: current.teacher,
        after: teacher,
        reason,
        operator: '总部管理员',
      });
      appendOperationLog(draftSnap, {
        operator: '总部管理员',
        type: '更换导师',
        target: `${current.date} ${current.content}`,
        before: current.teacher,
        after: teacher,
        reason,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.SESSION_TEACHER_CHANGED,
        actorName: '总部管理员',
        objectType: 'session',
        objectId: sessionId,
        before: current.teacher,
        after: teacher,
        reason,
      });
      return { ok: true };
    });
  }

  rescheduleSession(
    sessionId: string,
    next: { dateIso: string; startTime: string; endTime: string; reason: string },
  ): ServiceResult {
    return this.runTransaction(draftSnap => {
      const current = draftSnap.schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (!next.reason.trim()) return { ok: false, error: '改期必须填写原因' };

      const cohortId = current.cohortId || draftSnap.activeCohortId;
      const cohort = draftSnap.cohorts.find(c => c.id === cohortId);
      if (!cohort) return { ok: false, error: '班期不存在' };

      const merged = {
        ...current,
        originalDateIso: current.originalDateIso || current.dateIso,
        dateIso: next.dateIso,
        date: formatDateShort(next.dateIso),
        startTime: next.startTime,
        endTime: next.endTime,
        status: '已发布' as const,
        cohortId,
      };
      const errors = validateScheduleDraft(merged, cohort);
      if (Object.keys(errors).length > 0) {
        return { ok: false, error: Object.values(errors)[0] ?? '改期失败，请检查日期时间' };
      }

      draftSnap.schedules = draftSnap.schedules
        .map(s => (s.id === sessionId ? merged : s))
        .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`));

      applyScheduleMentorSyncToDraft(
        draftSnap,
        filterSchedulesByCohort(draftSnap.schedules, cohortId),
        cohortId,
      );

      pushScheduleChange(draftSnap, {
        cohortId: current.cohortId,
        sessionId,
        changeType: '改期',
        before: `${current.dateIso} ${current.startTime}-${current.endTime}`,
        after: `${next.dateIso} ${next.startTime}-${next.endTime}`,
        reason: next.reason,
        operator: '总部管理员',
      });
      appendOperationLog(draftSnap, {
        operator: '总部管理员',
        type: '改期',
        target: `${current.content}`,
        before: `${current.dateIso} ${current.startTime}-${current.endTime}`,
        after: `${next.dateIso} ${next.startTime}-${next.endTime}`,
        reason: next.reason,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.SESSION_RESCHEDULED,
        actorName: '总部管理员',
        objectType: 'session',
        objectId: sessionId,
        reason: next.reason,
      });
      return { ok: true };
    });
  }

  cancelSession(sessionId: string, reason: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const current = draftSnap.schedules.find(s => s.id === sessionId);
      if (!current) return { ok: false, error: '课次不存在' };
      if (!reason.trim()) return { ok: false, error: '取消课次必须填写原因' };
      if (current.status === '已完成') return { ok: false, error: '已完成课次不能取消' };

      const payable = draftSnap.mentorPayables.find(p => p.sessionId === sessionId);
      if (payable?.status === '已支付') {
        return { ok: false, error: '已支付课酬课次不能取消，请走异常处理' };
      }

      const cohortId = current.cohortId || draftSnap.activeCohortId;
      const merged = {
        ...current,
        status: '已取消' as const,
        cancelReason: reason,
        calcPay: false,
        payAmount: 0,
      };
      draftSnap.schedules = draftSnap.schedules.map(s => (s.id === sessionId ? merged : s));
      applyScheduleMentorSyncToDraft(
        draftSnap,
        filterSchedulesByCohort(draftSnap.schedules, cohortId),
        cohortId,
      );

      pushScheduleChange(draftSnap, {
        cohortId: current.cohortId,
        sessionId,
        changeType: '取消',
        before: current.status,
        after: '已取消',
        reason,
        operator: '总部管理员',
      });
      appendOperationLog(draftSnap, {
        operator: '总部管理员',
        type: '取消课次',
        target: `${current.date} ${current.content}`,
        before: current.status,
        after: '已取消',
        reason,
      });
      return { ok: true };
    });
  }

  // —— 教学交付 ——

  saveAttendance(draft: AttendanceDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      const session = draftSnap.schedules.find(s => s.id === draft.sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      if (!draft.entries.length) return { ok: false, error: '没有可签到学员' };

      const studentIds = new Set<string>();
      for (const entry of draft.entries) {
        if (studentIds.has(entry.studentId)) {
          return { ok: false, error: `学员 ${entry.studentId} 重复签到状态` };
        }
        studentIds.add(entry.studentId);
      }

      const existing = draftSnap.attendances.find(a => a.sessionId === draft.sessionId);
      const entries = draft.entries.map(entry => {
        const prev = existing?.entries.find(e => e.studentId === entry.studentId);
        return {
          ...entry,
          previousStatus: prev?.status !== entry.status ? prev?.status : entry.previousStatus,
        };
      });

      const sheet = {
        id: existing?.id ?? `att-${Date.now()}`,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId: session.cohortId,
        sessionId: session.id,
        entries,
        savedAt: nowLogTime(),
        operator: draft.operator || '总部管理员',
      };

      const signedCount = entries.filter(
        e => e.status === '已到' || e.status === '迟到' || e.status === '早退',
      ).length;
      const leaveCount = entries.filter(e => e.status === '请假').length;
      const absentCount = entries.filter(e => e.status === '缺勤').length;

      draftSnap.attendances = [sheet, ...draftSnap.attendances.filter(a => a.sessionId !== draft.sessionId)];
      draftSnap.schedules = draftSnap.schedules.map(s =>
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
      );

      const leaveEntries = entries.filter(e => e.status === '请假');
      if (leaveEntries.length) {
        const nextLeaves = [...draftSnap.leaveRequests];
        leaveEntries.forEach(e => {
          if (
            nextLeaves.some(
              l => l.sessionId === session.id && l.studentId === e.studentId && l.status === '已批准',
            )
          ) {
            return;
          }
          nextLeaves.unshift({
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
        draftSnap.leaveRequests = nextLeaves;
      }

      const changes = entries
        .filter(e => e.previousStatus && e.previousStatus !== e.status)
        .map(e => `${e.studentId}:${e.previousStatus}→${e.status}`)
        .join('；');

      appendOperationLog(draftSnap, {
        operator: draft.operator || '总部管理员',
        type: '记录签到',
        target: `${session.date} ${session.content}`,
        before: existing ? `已签${existing.entries.length}` : '未签到',
        after: `到${signedCount}/假${leaveCount}/缺${absentCount}`,
        reason: changes || '首次签到保存',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.ATTENDANCE_SAVED,
        actorName: draft.operator || '总部管理员',
        objectType: 'session',
        objectId: session.id,
      });
      return { ok: true };
    });
  }

  createLeaveRequest(draft: LeaveDraft): ServiceResult<{ id: string }> {
    return this.runTransaction(draftSnap => {
      const session = draftSnap.schedules.find(s => s.id === draft.sessionId);
      const enrollment = draftSnap.enrollments.find(e => e.id === draft.studentId);
      if (!session || !enrollment) return { ok: false, error: '课次或学员不存在' };
      if (!draft.reason.trim()) return { ok: false, error: '请填写请假原因' };

      const id = `leave-${Date.now()}`;
      const leave = {
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
        status: '已批准' as const,
        createdAt: nowLogTime(),
      };

      draftSnap.leaveRequests = [leave, ...draftSnap.leaveRequests];

      const existing = draftSnap.attendances.find(a => a.sessionId === session.id);
      const students = getActiveCohortStudents(draftSnap.enrollments, session.cohortId);
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
      const sheet = {
        id: existing?.id ?? `att-${session.id}`,
        businessUnitId: RESEARCH_CENTER_BUSINESS_UNIT_ID,
        cohortId: session.cohortId,
        sessionId: session.id,
        entries,
        savedAt: nowLogTime(),
        operator: draft.operator || '总部管理员',
      };
      draftSnap.attendances = [sheet, ...draftSnap.attendances.filter(a => a.sessionId !== session.id)];

      appendOperationLog(draftSnap, {
        operator: draft.operator || '总部管理员',
        type: '记录请假',
        target: enrollment.studentName,
        before: '—',
        after: `请假｜需补课${draft.needMakeup}`,
        reason: draft.reason,
      });
      return { ok: true, data: { id } };
    });
  }

  approveLeaveRequest(leaveId: string, options?: { forceReason?: string }): ServiceResult {
    return this.runTransaction(draftSnap => {
      const leave = draftSnap.leaveRequests.find(l => l.id === leaveId);
      if (!leave) return { ok: false, error: '请假记录不存在' };

      const transition = validateLeaveTransition(leave.status, '已批准', options);
      if (!transition.ok) return { ok: false, error: transition.error ?? '请假状态跳转无效' };

      draftSnap.leaveRequests = draftSnap.leaveRequests.map(l =>
        l.id === leaveId ? { ...l, status: '已批准' } : l,
      );

      appendOperationLog(draftSnap, {
        operator: leave.operator,
        type: options?.forceReason ? '强制批准请假' : '批准请假',
        target: leave.studentId,
        before: leave.status,
        after: '已批准',
        reason: options?.forceReason || leave.reason,
        forced: Boolean(options?.forceReason?.trim() || transition.forced),
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.LEAVE_APPROVED,
        actorName: leave.operator,
        objectType: 'leave_request',
        objectId: leaveId,
        forced: Boolean(options?.forceReason?.trim() || transition.forced),
      });
      return { ok: true };
    });
  }

  createMakeupRecord(draft: MakeupDraft): ServiceResult<{ id: string }> {
    return this.runTransaction(draftSnap => {
      if (!draft.method) return { ok: false, error: '请选择补课方式' };
      if (!draft.makeupDate) return { ok: false, error: '请选择补课日期' };

      const enrollment = draftSnap.enrollments.find(e => e.id === draft.studentId);
      const session = draftSnap.schedules.find(s => s.id === draft.sessionId);
      if (!enrollment || !session) return { ok: false, error: '学员或原课次不存在' };

      const id = `makeup-${Date.now()}`;
      const status = draft.method === '免补课' ? ('已完成' as const) : ('已安排' as const);
      const record = {
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
        status,
        createdAt: nowLogTime(),
        completedAt: draft.method === '免补课' ? nowLogTime() : undefined,
      };

      draftSnap.makeupRecords = [
        record,
        ...draftSnap.makeupRecords.filter(
          m => !(m.leaveRequestId && m.leaveRequestId === draft.leaveRequestId),
        ),
      ];

      if (draft.leaveRequestId) {
        draftSnap.leaveRequests = draftSnap.leaveRequests.map(l =>
          l.id === draft.leaveRequestId ? { ...l, makeupId: id } : l,
        );
      }

      appendOperationLog(draftSnap, {
        operator: '总部管理员',
        type: '安排补课',
        target: enrollment.studentName,
        before: '待安排',
        after: `${draft.method}｜${draft.makeupDate}`,
        reason: draft.note || '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.MAKEUP_SCHEDULED,
        actorName: '总部管理员',
        objectType: 'makeup',
        objectId: id,
      });
      return { ok: true, data: { id } };
    });
  }

  completeMakeup(makeupId: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const record = draftSnap.makeupRecords.find(m => m.id === makeupId);
      if (!record) return { ok: false, error: '补课记录不存在' };

      const transition = validateMakeupTransition(record.status, '已完成');
      if (!transition.ok) return { ok: false, error: transition.error ?? '补课状态跳转无效' };

      draftSnap.makeupRecords = draftSnap.makeupRecords.map(m =>
        m.id === makeupId ? { ...m, status: '已完成', completedAt: nowLogTime() } : m,
      );

      appendOperationLog(draftSnap, {
        operator: '总部管理员',
        type: '完成补课',
        target: record.studentId,
        before: record.status,
        after: '已完成',
        reason: '不修改原签到事实',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.MAKEUP_COMPLETED,
        actorName: '总部管理员',
        objectType: 'makeup',
        objectId: makeupId,
      });
      return { ok: true };
    });
  }

  saveTeachingRecord(draft: TeachingRecordDraft): ServiceResult {
    return this.runTransaction(draftSnap => {
      const session = draftSnap.schedules.find(s => s.id === draft.sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      if (!draft.completionStatus.trim()) return { ok: false, error: '请填写教学完成情况' };

      const id =
        draftSnap.teachingRecords.find(t => t.sessionId === session.id)?.id ?? `teach-${Date.now()}`;
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

      draftSnap.teachingRecords = [
        record,
        ...draftSnap.teachingRecords.filter(t => t.sessionId !== session.id),
      ];
      draftSnap.schedules = draftSnap.schedules.map(s =>
        s.id === session.id ? { ...s, teachingRecordId: id } : s,
      );

      appendOperationLog(draftSnap, {
        operator: record.recorder,
        type: '教学记录',
        target: `${session.date} ${session.content}`,
        before: '未填写',
        after: draft.completionStatus,
        reason: draft.anomalyNote || '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.TEACHING_RECORD_SAVED,
        actorName: record.recorder,
        objectType: 'session',
        objectId: session.id,
      });
      return { ok: true };
    });
  }

  completeSession(sessionId: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const session = draftSnap.schedules.find(s => s.id === sessionId);
      if (!session) return { ok: false, error: '课次不存在' };

      const attendance = draftSnap.attendances.find(a => a.sessionId === sessionId) ?? null;
      const teaching = draftSnap.teachingRecords.find(t => t.sessionId === sessionId) ?? null;
      const check = canCompleteSession({ session, attendance, teaching });
      if (!check.ok) return { ok: false, error: check.error ?? '无法完成课次' };

      draftSnap.schedules = draftSnap.schedules.map(s =>
        s.id === sessionId ? { ...s, status: '已完成' } : s,
      );

      appendOperationLog(draftSnap, {
        operator: teaching?.recorder || '总部管理员',
        type: '完成课次',
        target: `${session.date} ${session.content}`,
        before: session.status,
        after: '已完成',
        reason: '',
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.SESSION_COMPLETED,
        actorName: teaching?.recorder || '总部管理员',
        objectType: 'session',
        objectId: sessionId,
      });
      return { ok: true };
    });
  }

  // —— 成本与应付 ——

  syncMentorPayable(cohortId: string): ServiceResult {
    return this.runTransaction(draftSnap => {
      const cohortSchedules = filterSchedulesByCohort(draftSnap.schedules, cohortId);
      applyScheduleMentorSyncToDraft(draftSnap, cohortSchedules, cohortId);
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.MENTOR_PAYABLE_GENERATED,
        actorName: '系统',
        objectType: 'cohort',
        objectId: cohortId,
      });
      return { ok: true };
    });
  }

  recordMentorPayment(payableId: string, amountYuan: number): ServiceResult {
    return this.runTransaction(draftSnap => {
      const payable = draftSnap.mentorPayables.find(p => p.id === payableId);
      if (!payable) return { ok: false, error: '应付记录不存在' };
      if (!(amountYuan > 0)) return { ok: false, error: '付款金额必须大于0' };

      const nextPaid = payable.paidAmount + amountYuan;
      if (nextPaid > payable.dueAmount + 0.001) {
        return { ok: false, error: '付款金额超过应付' };
      }

      draftSnap.mentorPayables = draftSnap.mentorPayables.map(p =>
        p.id === payableId
          ? {
              ...p,
              paidAmount: nextPaid,
              status:
                nextPaid >= p.dueAmount && p.dueAmount > 0
                  ? ('已支付' as const)
                  : nextPaid > 0
                    ? ('部分支付' as const)
                    : ('待付款' as const),
            }
          : p,
      );

      const cohortPayables = draftSnap.mentorPayables.filter(p => p.cohortId === payable.cohortId);
      const totalDue = cohortPayables.reduce((s, p) => s + p.dueAmount, 0);
      const totalPaid = cohortPayables.reduce((s, p) => s + p.paidAmount, 0);
      draftSnap.financeState = {
        ...draftSnap.financeState,
        currentCashBalance: draftSnap.financeState.currentCashBalance - amountYuan,
        paymentPlans: draftSnap.financeState.paymentPlans.map(p =>
          p.id === 'pay-teacher'
            ? {
                ...p,
                paidAmount: totalPaid,
                dueAmount: Math.max(totalDue, totalPaid),
                status:
                  totalPaid >= totalDue && totalDue > 0
                    ? ('已支付' as const)
                    : totalPaid > 0
                      ? ('部分支付' as const)
                      : ('待付款' as const),
              }
            : p,
        ),
      };

      appendOperationLog(draftSnap, {
        operator: '财务',
        type: '导师课酬付款',
        target: payable.sessionLabel,
        before: `${payable.paidAmount}`,
        after: `${nextPaid}`,
        reason: payable.teacher,
      });
      appendDomainEvent(draftSnap, {
        name: RESEARCH_CENTER_EVENTS.MENTOR_PAYABLE_PAID,
        actorName: '财务',
        objectType: 'mentor_payable',
        objectId: payableId,
        after: `${nextPaid}`,
      });
      return { ok: true };
    });
  }

  updatePaymentPlan(
    planId: string,
    patch: Partial<ResearchCenterPersistedSnapshot['financeState']['paymentPlans'][number]>,
  ): ServiceResult {
    return this.runTransaction(draftSnap => {
      const plan = draftSnap.financeState.paymentPlans.find(p => p.id === planId);
      if (!plan) return { ok: false, error: '付款计划不存在' };
      draftSnap.financeState = {
        ...draftSnap.financeState,
        paymentPlans: draftSnap.financeState.paymentPlans.map(p =>
          p.id === planId ? { ...p, ...patch } : p,
        ),
      };
      return { ok: true };
    });
  }

  private commit(
    next: ResearchCenterPersistedSnapshot,
    options?: { alreadyLocked?: boolean },
  ): ServiceResult {
    if (this.writing && !options?.alreadyLocked) {
      return { ok: false, error: '正在写入，请稍后重试' };
    }
    const acquired = !options?.alreadyLocked;
    if (acquired) this.writing = true;
    try {
      const saveResult = tryPersist(next);
      if (!saveResult.ok) return saveResult;
      this.snapshot = next;
      this.notify();
      return { ok: true };
    } finally {
      if (acquired) this.writing = false;
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
