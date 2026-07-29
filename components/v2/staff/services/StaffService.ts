import type {
  AvailableTeacherCandidate,
  ScheduleAssignment,
  StaffApplication,
  StaffAvailability,
  StaffIssue,
  StaffMember,
  StaffOperationLog,
  StaffTodo,
  StaffWorkbenchSnapshot,
  TeachingCapability,
  UnresolvedStaffReference,
} from '../domain/types';
import type { StaffPermission, StaffActorRole } from '../domain/permissions';
import type { StaffPersistedSnapshot } from '../staffPersistence';

export type ServiceResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export interface StaffService {
  readonly mode: 'local' | 'remote';

  hydrate(): Promise<ServiceResult>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): StaffPersistedSnapshot;
  replaceSnapshot(next: StaffPersistedSnapshot): ServiceResult;
  runTransaction(
    mutator: (draft: StaffPersistedSnapshot) => void | ServiceResult,
  ): ServiceResult;
  resetTestData(): ServiceResult;

  // 人员
  listStaff(storeId?: string | 'all'): StaffMember[];
  getStaff(staffId: string): StaffMember | null;
  updateStaffProfile(
    staffId: string,
    patch: Partial<
      Pick<
        StaffMember,
        | 'primaryStoreId'
        | 'supportStoreIds'
        | 'roleAssignments'
        | 'employmentStatus'
        | 'availabilityStatus'
        | 'capabilityIds'
      >
    >,
  ): ServiceResult;
  updateStoreAssignments(
    staffId: string,
    primaryStoreId: string,
    supportStoreIds: string[],
  ): ServiceResult;
  updateTeachingCapabilities(staffId: string, capabilityIds: string[]): ServiceResult;
  updateAvailability(
    staffId: string,
    patch: Partial<Omit<StaffAvailability, 'staffId'>>,
  ): ServiceResult;
  listUnresolvedStaffReferences(): UnresolvedStaffReference[];
  listCapabilities(): TeachingCapability[];

  // 工作台
  getStaffWorkbench(storeId?: string | 'all'): StaffWorkbenchSnapshot;
  listStaffTodos(): StaffTodo[];
  listStaffIssues(): StaffIssue[];
  assignTodoOwner(todoId: string, ownerStaffId: string): ServiceResult;
  dismissTodo(todoId: string): ServiceResult;
  resolveIssue(issueId: string, reason?: string): ServiceResult;

  // 排课与供给
  listScheduleAssignments(storeId?: string | 'all'): ScheduleAssignment[];
  listScheduleGaps(): ScheduleAssignment[];
  listScheduleConflicts(): ScheduleAssignment[];
  assignTeacherToSession(
    assignmentId: string,
    staffId: string,
    options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult;
  replaceTeacherForSession(
    assignmentId: string,
    staffId: string,
    options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult;
  listAvailableTeachers(assignmentId: string): AvailableTeacherCandidate[];

  // 申请审批
  listApplications(filter?: { status?: string; type?: string }): StaffApplication[];
  getApplication(applicationId: string): StaffApplication | null;
  approveApplication(
    applicationId: string,
    options: {
      comment: string;
      substituteStaffId?: string;
      rescheduleTo?: { dateIso: string; startTime: string; endTime: string };
      forceReason?: string;
    },
  ): ServiceResult;
  rejectApplication(applicationId: string, reason: string, forceReason?: string): ServiceResult;
  requestApplicationSupplement(applicationId: string, message: string): ServiceResult;
  assignApplicationOwner(applicationId: string, ownerStaffId: string): ServiceResult;
  submitApplicationSupplement(applicationId: string): ServiceResult;

  // 日志 / 权限
  listOperationLogs(): StaffOperationLog[];
  can(action: StaffPermission): boolean;
  getActorRole(): StaffActorRole;
  setStoreFilter(storeId: string | 'all'): void;
}

export interface CreateStaffServiceOptions {
  mode?: 'local' | 'remote';
  role?: StaffActorRole;
}
