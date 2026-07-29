import type {
  AttendanceDraft,
  EnrollmentDraft,
  FollowUpDraft,
  InterviewResultDraft,
  InterviewScheduleDraft,
  LeadDraft,
  MakeupDraft,
  ReceiptDraft,
  RefundDraft,
  ScheduleDraft,
  ScheduleItem,
  TeachingRecordDraft,
} from '../researchCenterV2.viewModel';
import type { ResearchCenterPersistedSnapshot } from '../researchCenterPersistence';
import type { DomainEvent, OperationLog } from '../domain/types';
import type { ResearchPermission } from '../domain/permissions';

export type ServiceResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export interface ResearchCenterService {
  readonly mode: 'local' | 'remote';

  /** Hydrate from persistence / remote. Safe no-op if already loaded. */
  hydrate(): Promise<ServiceResult>;

  /** Subscribe to store changes (local prototype). Returns unsubscribe. */
  subscribe(listener: () => void): () => void;

  /** Current persisted runtime snapshot (UI view-model compatible). */
  getSnapshot(): ResearchCenterPersistedSnapshot;

  /** Replace snapshot transactionally and persist. */
  replaceSnapshot(next: ResearchCenterPersistedSnapshot): ServiceResult;

  /** Run mutator against a clone; persist only if mutator succeeds. */
  runTransaction(
    mutator: (draft: ResearchCenterPersistedSnapshot) => void | ServiceResult,
  ): ServiceResult;

  resetTestData(): ServiceResult;

  // —— 咨询与招生 ——
  listLeads(): ResearchCenterPersistedSnapshot['leads'];
  createLead(draft: LeadDraft): ServiceResult<{ id: string }>;
  updateLead(
    leadId: string,
    patch: Partial<ResearchCenterPersistedSnapshot['leads'][number]>,
    options?: { forceReason?: string },
  ): ServiceResult;
  addFollowup(draft: FollowUpDraft): ServiceResult;
  scheduleInterview(draft: InterviewScheduleDraft): ServiceResult;
  saveInterviewResult(draft: InterviewResultDraft): ServiceResult;
  changeLeadStage(leadId: string, stage: string, options?: { forceReason?: string }): ServiceResult;

  // —— 报名与财务 ——
  createEnrollment(draft: EnrollmentDraft): ServiceResult<{ enrollmentId: string }>;
  listEnrollments(cohortId?: string): ResearchCenterPersistedSnapshot['enrollments'];
  recordReceipt(draft: ReceiptDraft): ServiceResult;
  createRefund(draft: RefundDraft): ServiceResult;
  confirmEnrollment(enrollmentId: string): ServiceResult;
  listReceipts(cohortId?: string): ResearchCenterPersistedSnapshot['financeState']['cashReceipts'];
  listRefunds(cohortId?: string): ResearchCenterPersistedSnapshot['financeState']['cashReceipts'];

  // —— 班期与课程 ——
  listCohorts(): ResearchCenterPersistedSnapshot['cohorts'];
  getCohort(cohortId: string): ResearchCenterPersistedSnapshot['cohorts'][number] | null;
  updateCohort(
    cohortId: string,
    patch: Partial<ResearchCenterPersistedSnapshot['cohorts'][number]>,
  ): ServiceResult;
  createSession(draft: ScheduleDraft): ServiceResult<{ id: string }>;
  updateSession(sessionId: string, patch: Partial<ScheduleItem>): ServiceResult;
  cancelSession(sessionId: string, reason: string): ServiceResult;
  deleteSession(sessionId: string): ServiceResult;
  changeSessionTeacher(sessionId: string, teacher: string, reason: string): ServiceResult;
  rescheduleSession(
    sessionId: string,
    next: { dateIso: string; startTime: string; endTime: string; reason: string },
  ): ServiceResult;

  // —— 教学交付 ——
  saveAttendance(draft: AttendanceDraft): ServiceResult;
  createLeaveRequest(draft: import('../researchCenterV2.viewModel').LeaveDraft): ServiceResult<{ id: string }>;
  approveLeaveRequest(leaveId: string, options?: { forceReason?: string }): ServiceResult;
  createMakeupRecord(draft: MakeupDraft): ServiceResult<{ id: string }>;
  completeMakeup(makeupId: string): ServiceResult;
  saveTeachingRecord(draft: TeachingRecordDraft): ServiceResult;
  completeSession(sessionId: string): ServiceResult;

  // —— 成本与应付 ——
  listMentorPayables(cohortId?: string): ResearchCenterPersistedSnapshot['mentorPayables'];
  syncMentorPayable(cohortId: string): ServiceResult;
  recordMentorPayment(payableId: string, amountYuan: number): ServiceResult;
  listPaymentPlans(): ResearchCenterPersistedSnapshot['financeState']['paymentPlans'];
  updatePaymentPlan(
    planId: string,
    patch: Partial<ResearchCenterPersistedSnapshot['financeState']['paymentPlans'][number]>,
  ): ServiceResult;

  // —— 日志 / 事件 / 权限 ——
  listOperationLogs(): OperationLog[] | ResearchCenterPersistedSnapshot['operationLogs'];
  listDomainEvents(): DomainEvent[];
  can(action: ResearchPermission): boolean;
}

export interface CreateResearchCenterServiceOptions {
  mode?: 'local' | 'remote';
  role?: import('../domain/permissions').ResearchRole;
}
