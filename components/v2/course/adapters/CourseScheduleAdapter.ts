import type { ScheduleAssignment } from '../../staff/domain/types';
import { resolveLegacySessionId } from '../domain/legacySessionIdMap';
import type { AssignTeacherOptions } from '../domain/types';
import {
  toScheduleAssignmentProjection,
  type ScheduleAssignmentProjection,
} from '../courseScheduleCalculations';
import type {
  ApplyApprovedLeaveImpactOptions,
  ApplySubstituteImpactOptions,
  CourseScheduleService,
  MarkSessionPendingReplacementOptions,
  ServiceResult,
} from '../services/CourseScheduleService';
import { createCourseScheduleService, getDefaultCourseScheduleService } from '../services/createCourseScheduleService';

/**
 * Bridge Course Schedule service facts to Staff-compatible schedule assignments.
 * Staff module imports this adapter — CourseScheduleService must NOT import StaffService.
 */
export class CourseScheduleAdapter {
  private readonly service: CourseScheduleService;

  constructor(service?: CourseScheduleService) {
    this.service = service ?? getDefaultCourseScheduleService();
  }

  getService(): CourseScheduleService {
    return this.service;
  }

  hydrate(): Promise<ServiceResult> {
    return this.service.hydrate();
  }

  subscribe(listener: () => void): () => void {
    return this.service.subscribe(listener);
  }

  listStaffSessionReferences(storeId?: string | 'all'): ScheduleAssignment[] {
    const snapshot = this.service.getSnapshot();
    const sessions = this.service.listSessions(storeId);
    return sessions.map(session =>
      toScheduleAssignmentProjection(session, snapshot.risks, snapshot.actorStaffId),
    ) as ScheduleAssignment[];
  }

  getStaffSessionReference(sessionId: string): ScheduleAssignment | null {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    const session = this.service.getSession(canonicalId);
    if (!session) return null;
    const snapshot = this.service.getSnapshot();
    return toScheduleAssignmentProjection(
      session,
      snapshot.risks,
      snapshot.actorStaffId,
    ) as ScheduleAssignment;
  }

  assignStaffToSession(
    sessionId: string,
    staffId: string,
    options?: AssignTeacherOptions,
  ): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.assignTeacher(canonicalId, staffId, options);
  }

  replaceStaffForSession(
    sessionId: string,
    staffId: string,
    options?: AssignTeacherOptions,
  ): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.replaceTeacher(canonicalId, staffId, options);
  }

  markSessionPendingReplacement(
    sessionId: string,
    options?: MarkSessionPendingReplacementOptions,
  ): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.markSessionPendingReplacement(canonicalId, options);
  }

  applyApprovedLeaveImpact(
    sessionId: string,
    options?: ApplyApprovedLeaveImpactOptions,
  ): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.applyApprovedLeaveImpact(canonicalId, options);
  }

  applySubstituteImpact(
    sessionId: string,
    substituteStaffId: string,
    options?: ApplySubstituteImpactOptions,
  ): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.applySubstituteImpact(canonicalId, substituteStaffId, options);
  }

  applyRescheduleImpact(
    sessionId: string,
    input: { startAt: string; endAt: string; reason: string },
  ): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.applyRescheduleImpact(canonicalId, input);
  }

  applySuspensionImpact(sessionId: string, input: { reason: string }): ServiceResult {
    const resolved = resolveLegacySessionId(sessionId);
    const canonicalId = resolved.sessionId ?? sessionId;
    return this.service.applySuspensionImpact(canonicalId, input);
  }

  listUnresolvedSessionReferences() {
    return this.service.listUnresolvedSessionReferences();
  }

  /** Expose projection helper for tests / diagnostics. */
  toScheduleAssignment(sessionId: string): ScheduleAssignmentProjection | null {
    const session = this.service.getSession(sessionId);
    if (!session) return null;
    const snapshot = this.service.getSnapshot();
    return toScheduleAssignmentProjection(session, snapshot.risks, snapshot.actorStaffId);
  }
}

export function createCourseScheduleAdapter(service?: CourseScheduleService): CourseScheduleAdapter {
  return new CourseScheduleAdapter(service ?? createCourseScheduleService());
}

let defaultAdapter: CourseScheduleAdapter | null = null;

export function getDefaultCourseScheduleAdapter(): CourseScheduleAdapter {
  if (!defaultAdapter) {
    defaultAdapter = new CourseScheduleAdapter(getDefaultCourseScheduleService());
  }
  return defaultAdapter;
}

export function __resetDefaultCourseScheduleAdapterForTests(): void {
  defaultAdapter = null;
}
