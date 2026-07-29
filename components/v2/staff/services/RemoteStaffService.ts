/**
 * Remote StaffService placeholder — not enabled in V2.1.
 * Do not hardcode API endpoints.
 */
import type { StaffActorRole, StaffPermission } from '../domain/permissions';
import { createStaffPermissionChecker } from '../domain/permissions';
import { buildInitialStaffSnapshot } from './buildInitialStaffSnapshot';
import type { ServiceResult, StaffService } from './StaffService';
import type { StaffPersistedSnapshot } from '../staffPersistence';

const NOT_ENABLED: ServiceResult = {
  ok: false,
  error: 'RemoteStaffService 本轮未启用，请使用 LocalStorage 原型服务',
};

export class RemoteStaffService implements StaffService {
  readonly mode = 'remote' as const;
  private readonly checker: ReturnType<typeof createStaffPermissionChecker>;
  private readonly role: StaffActorRole;
  private snapshot = buildInitialStaffSnapshot();

  constructor(role: StaffActorRole = 'hq_admin') {
    this.role = role;
    this.checker = createStaffPermissionChecker(role);
  }

  async hydrate(): Promise<ServiceResult> {
    return NOT_ENABLED;
  }

  subscribe(): () => void {
    return () => undefined;
  }

  getSnapshot(): StaffPersistedSnapshot {
    return this.snapshot;
  }

  replaceSnapshot(): ServiceResult {
    return NOT_ENABLED;
  }

  runTransaction(): ServiceResult {
    return NOT_ENABLED;
  }

  resetTestData(): ServiceResult {
    return NOT_ENABLED;
  }

  listStaff() {
    return this.snapshot.members;
  }

  getStaff(staffId: string) {
    return this.snapshot.members.find(m => m.id === staffId) ?? null;
  }

  updateStaffProfile(): ServiceResult {
    return NOT_ENABLED;
  }

  updateStoreAssignments(): ServiceResult {
    return NOT_ENABLED;
  }

  updateTeachingCapabilities(): ServiceResult {
    return NOT_ENABLED;
  }

  updateAvailability(): ServiceResult {
    return NOT_ENABLED;
  }

  listUnresolvedStaffReferences() {
    return this.snapshot.unresolvedReferences;
  }

  listCapabilities() {
    return this.snapshot.capabilities;
  }

  getStaffWorkbench() {
    return {
      metrics: {
        todayTeachingStaffCount: 0,
        pendingGapCount: 0,
        leaveSubstituteTodoCount: 0,
        supplyRiskNext7Days: 0,
        payablePendingCount: 0,
        payableAbnormalCount: 0,
      },
      scheduleWindow: [],
      gapsAndConflicts: [],
      todos: [],
      loadRows: [],
      unresolvedCount: this.snapshot.unresolvedReferences.length,
    };
  }

  listStaffTodos() {
    return [];
  }

  listStaffIssues() {
    return [];
  }

  assignTodoOwner(): ServiceResult {
    return NOT_ENABLED;
  }

  dismissTodo(): ServiceResult {
    return NOT_ENABLED;
  }

  resolveIssue(): ServiceResult {
    return NOT_ENABLED;
  }

  listScheduleAssignments() {
    return [];
  }

  listScheduleGaps() {
    return [];
  }

  listScheduleConflicts() {
    return [];
  }

  assignTeacherToSession(
    _assignmentId: string,
    _staffId: string,
    _options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult {
    return NOT_ENABLED;
  }

  replaceTeacherForSession(
    _assignmentId: string,
    _staffId: string,
    _options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult {
    return NOT_ENABLED;
  }

  listAvailableTeachers() {
    return [];
  }

  listApplications() {
    return [];
  }

  getApplication() {
    return null;
  }

  approveApplication(): ServiceResult {
    return NOT_ENABLED;
  }

  rejectApplication(): ServiceResult {
    return NOT_ENABLED;
  }

  requestApplicationSupplement(): ServiceResult {
    return NOT_ENABLED;
  }

  assignApplicationOwner(): ServiceResult {
    return NOT_ENABLED;
  }

  submitApplicationSupplement(): ServiceResult {
    return NOT_ENABLED;
  }

  listOperationLogs() {
    return [];
  }

  can(action: StaffPermission): boolean {
    return this.checker.can(action);
  }

  getActorRole(): StaffActorRole {
    return this.role;
  }

  setStoreFilter(): void {
    /* no-op */
  }
}
