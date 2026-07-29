import type {
  AssignTeacherOptions,
  CourseScheduleOperationLog,
  RescheduleSessionInput,
  SessionReference,
  SessionRisk,
  StoreCourseSession,
  SuspendSessionInput,
  UnresolvedSessionReference,
} from '../domain/types';
import type { CourseScheduleActorRole, CourseSchedulePermission } from '../domain/permissions';
import type { UnresolvedTeacherReference } from '../courseSchedulePersistence';
import type { CourseSchedulePersistedSnapshot } from '../courseSchedulePersistence';
import type { StaffRiskContext } from '../courseScheduleCalculations';

export type ServiceResult<T = void> = { ok: true; data?: T } | { ok: false; error: string };

export interface CreateCourseScheduleServiceOptions {
  mode?: 'local' | 'remote';
  role?: CourseScheduleActorRole;
}

export interface MarkSessionPendingReplacementOptions {
  reason?: string;
  keepPreviousStaff?: boolean;
  actorStaffId?: string;
  actorName?: string;
}

export interface ApplyApprovedLeaveImpactOptions {
  keepPreviousStaff?: boolean;
  substituteStaffId?: string | null;
  reason?: string;
}

export interface ApplySubstituteImpactOptions {
  reason?: string;
  forced?: boolean;
  forcedReason?: string;
}

export interface CourseScheduleService {
  readonly mode: 'local' | 'remote';

  hydrate(): Promise<ServiceResult>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): CourseSchedulePersistedSnapshot;
  runTransaction(
    mutator: (draft: CourseSchedulePersistedSnapshot) => void | ServiceResult,
  ): ServiceResult;
  resetTestData(): ServiceResult;
  setStoreFilter(storeId: string | 'all'): void;

  // Query
  listSessions(storeId?: string | 'all'): StoreCourseSession[];
  getSession(sessionId: string): StoreCourseSession | null;
  listSessionsByRange(startDateIso: string, endDateIso: string, storeId?: string | 'all'): StoreCourseSession[];
  listSessionsByStore(storeId: string): StoreCourseSession[];
  listSessionsByStaff(staffId: string): StoreCourseSession[];
  listSessionRisks(sessionId?: string): SessionRisk[];
  getSessionReference(legacyKey: string): SessionReference;
  listUnresolvedSessionReferences(): UnresolvedSessionReference[];
  listUnresolvedTeacherReferences(): UnresolvedTeacherReference[];

  // Mutations
  createSession(input: Omit<StoreCourseSession, 'id' | 'createdAt' | 'updatedAt'>): ServiceResult<{ sessionId: string }>;
  updateSession(
    sessionId: string,
    patch: Partial<
      Pick<
        StoreCourseSession,
        | 'courseName'
        | 'capacity'
        | 'bookingCount'
        | 'sessionStatus'
        | 'bookingStatus'
        | 'note'
        | 'payableStatus'
      >
    >,
  ): ServiceResult;
  assignTeacher(sessionId: string, staffId: string, options?: AssignTeacherOptions): ServiceResult;
  replaceTeacher(sessionId: string, staffId: string, options?: AssignTeacherOptions): ServiceResult;
  confirmTeacherAssignment(sessionId: string): ServiceResult;
  rescheduleSession(sessionId: string, input: RescheduleSessionInput): ServiceResult;
  cancelSession(sessionId: string, reason: string): ServiceResult;
  suspendSession(sessionId: string, input: SuspendSessionInput): ServiceResult;

  // Staff adapter impacts
  markSessionPendingReplacement(
    sessionId: string,
    options?: MarkSessionPendingReplacementOptions,
  ): ServiceResult;
  applyApprovedLeaveImpact(
    sessionId: string,
    options?: ApplyApprovedLeaveImpactOptions,
  ): ServiceResult;
  applySubstituteImpact(
    sessionId: string,
    substituteStaffId: string,
    options?: ApplySubstituteImpactOptions,
  ): ServiceResult;
  applyRescheduleImpact(
    sessionId: string,
    input: { startAt: string; endAt: string; reason: string },
  ): ServiceResult;
  applySuspensionImpact(sessionId: string, input: { reason: string }): ServiceResult;

  // Risk derivation (pure helpers bound to current snapshot)
  deriveTeacherGap(session: StoreCourseSession): SessionRisk | null;
  deriveTeacherConflict(session: StoreCourseSession): SessionRisk | null;
  deriveCapabilityMismatch(session: StoreCourseSession, staffCapabilityIds: string[]): SessionRisk | null;
  deriveStoreAuthorizationRisk(
    session: StoreCourseSession,
    staffPrimaryStoreId: string,
    supportStoreIds: string[],
  ): SessionRisk | null;
  deriveWorkloadRisk(session: StoreCourseSession, staffWeekCount: number): SessionRisk | null;
  deriveApprovedLeaveImpact(session: StoreCourseSession): SessionRisk | null;
  recalculateSessionRisks(staffContext?: Map<string, StaffRiskContext>): SessionRisk[];

  // Logs / permissions
  listOperationLogs(): CourseScheduleOperationLog[];
  can(action: CourseSchedulePermission): boolean;
  getActorRole(): CourseScheduleActorRole;
}
