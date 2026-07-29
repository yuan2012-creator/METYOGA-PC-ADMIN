import { createPermissionChecker, type ResearchRole } from '../domain';
import type { DomainEvent } from '../domain/types';
import type { ResearchPermission } from '../domain/permissions';
import type { ResearchCenterPersistedSnapshot } from '../researchCenterPersistence';
import type { ResearchCenterService, ServiceResult } from './ResearchCenterService';
import { buildInitialResearchCenterSnapshot } from './buildInitialSnapshot';

const REMOTE_STUB_ERROR = 'RemoteResearchCenterService 待接后端（V2.0 占位）';

function stubFail<T = void>(): ServiceResult<T> {
  return { ok: false, error: REMOTE_STUB_ERROR };
}

/** Remote API placeholder — mutating calls are no-ops until REST/cloud wiring lands. */
export class RemoteResearchCenterService implements ResearchCenterService {
  readonly mode = 'remote' as const;

  private snapshot: ResearchCenterPersistedSnapshot;
  private readonly permissions: ReturnType<typeof createPermissionChecker>;

  constructor(role: ResearchRole = 'hq_admin') {
    this.permissions = createPermissionChecker(role);
    this.snapshot = buildInitialResearchCenterSnapshot();
  }

  async hydrate(): Promise<ServiceResult> {
    // TODO: wire REST/cloud API
    return { ok: true };
  }

  subscribe(_listener: () => void): () => void {
    // TODO: wire REST/cloud API
    return () => {};
  }

  getSnapshot(): ResearchCenterPersistedSnapshot {
    return this.snapshot;
  }

  replaceSnapshot(_next: ResearchCenterPersistedSnapshot): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  runTransaction(
    _mutator: (draft: ResearchCenterPersistedSnapshot) => void | ServiceResult,
  ): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  resetTestData(): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  listLeads(): ResearchCenterPersistedSnapshot['leads'] {
    // TODO: wire REST/cloud API
    return [];
  }

  createLead(_draft: import('../researchCenterV2.viewModel').LeadDraft): ServiceResult<{ id: string }> {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  updateLead(
    _leadId: string,
    _patch: Partial<ResearchCenterPersistedSnapshot['leads'][number]>,
    _options?: { forceReason?: string },
  ): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  addFollowup(_draft: import('../researchCenterV2.viewModel').FollowUpDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  scheduleInterview(_draft: import('../researchCenterV2.viewModel').InterviewScheduleDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  saveInterviewResult(_draft: import('../researchCenterV2.viewModel').InterviewResultDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  changeLeadStage(_leadId: string, _stage: string, _options?: { forceReason?: string }): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  createEnrollment(
    _draft: import('../researchCenterV2.viewModel').EnrollmentDraft,
  ): ServiceResult<{ enrollmentId: string }> {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  listEnrollments(_cohortId?: string): ResearchCenterPersistedSnapshot['enrollments'] {
    // TODO: wire REST/cloud API
    return [];
  }

  recordReceipt(_draft: import('../researchCenterV2.viewModel').ReceiptDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  createRefund(_draft: import('../researchCenterV2.viewModel').RefundDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  confirmEnrollment(_enrollmentId: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  listReceipts(_cohortId?: string): ResearchCenterPersistedSnapshot['financeState']['cashReceipts'] {
    // TODO: wire REST/cloud API
    return [];
  }

  listRefunds(_cohortId?: string): ResearchCenterPersistedSnapshot['financeState']['cashReceipts'] {
    // TODO: wire REST/cloud API
    return [];
  }

  listCohorts(): ResearchCenterPersistedSnapshot['cohorts'] {
    // TODO: wire REST/cloud API
    return [];
  }

  getCohort(_cohortId: string): ResearchCenterPersistedSnapshot['cohorts'][number] | null {
    // TODO: wire REST/cloud API
    return null;
  }

  updateCohort(
    _cohortId: string,
    _patch: Partial<ResearchCenterPersistedSnapshot['cohorts'][number]>,
  ): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  createSession(_draft: import('../researchCenterV2.viewModel').ScheduleDraft): ServiceResult<{ id: string }> {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  updateSession(_sessionId: string, _patch: Partial<import('../researchCenterV2.viewModel').ScheduleItem>): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  cancelSession(_sessionId: string, _reason: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  deleteSession(_sessionId: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  changeSessionTeacher(_sessionId: string, _teacher: string, _reason: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  rescheduleSession(
    _sessionId: string,
    _next: { dateIso: string; startTime: string; endTime: string; reason: string },
  ): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  saveAttendance(_draft: import('../researchCenterV2.viewModel').AttendanceDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  createLeaveRequest(
    _draft: import('../researchCenterV2.viewModel').LeaveDraft,
  ): ServiceResult<{ id: string }> {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  approveLeaveRequest(_leaveId: string, _options?: { forceReason?: string }): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  createMakeupRecord(
    _draft: import('../researchCenterV2.viewModel').MakeupDraft,
  ): ServiceResult<{ id: string }> {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  completeMakeup(_makeupId: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  saveTeachingRecord(_draft: import('../researchCenterV2.viewModel').TeachingRecordDraft): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  completeSession(_sessionId: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  listMentorPayables(_cohortId?: string): ResearchCenterPersistedSnapshot['mentorPayables'] {
    // TODO: wire REST/cloud API
    return [];
  }

  syncMentorPayable(_cohortId: string): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  recordMentorPayment(_payableId: string, _amountYuan: number): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  listPaymentPlans(): ResearchCenterPersistedSnapshot['financeState']['paymentPlans'] {
    // TODO: wire REST/cloud API
    return [];
  }

  updatePaymentPlan(
    _planId: string,
    _patch: Partial<ResearchCenterPersistedSnapshot['financeState']['paymentPlans'][number]>,
  ): ServiceResult {
    // TODO: wire REST/cloud API
    return stubFail();
  }

  listOperationLogs(): ResearchCenterPersistedSnapshot['operationLogs'] {
    // TODO: wire REST/cloud API
    return [];
  }

  listDomainEvents(): DomainEvent[] {
    // TODO: wire REST/cloud API
    return [];
  }

  can(action: ResearchPermission): boolean {
    return this.permissions.can(action);
  }
}
