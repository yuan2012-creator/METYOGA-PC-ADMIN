import {
  COURSE_SCHEDULE_EVENTS,
  COURSE_SCHEDULE_PERMISSIONS,
  canReplaceTeacherForSession,
  createCourseSchedulePermissionChecker,
  nextAssignmentStatusAfterAssign,
  nowIso,
  resolveLegacySessionId,
  validateSessionStatusTransition,
  type CourseScheduleActorRole,
  type CourseSchedulePermission,
} from '../domain';
import type {
  AssignTeacherOptions,
  CourseScheduleDomainEvent,
  CourseScheduleOperationLog,
  RescheduleSessionInput,
  SessionReference,
  SessionRisk,
  SessionScheduleChange,
  SessionTeacherChange,
  StoreCourseSession,
  SuspendSessionInput,
} from '../domain/types';
import {
  buildDefaultStaffContext,
  deriveApprovedLeaveImpact,
  deriveCapabilityMismatch,
  deriveStoreAuthorizationRisk,
  deriveTeacherConflict,
  deriveTeacherGap,
  deriveWorkloadRisk,
  recalculateSessionRisks as calcRecalculateSessionRisks,
  type StaffRiskContext,
} from '../courseScheduleCalculations';
import {
  clearCourseScheduleSnapshot,
  loadCourseScheduleSnapshot,
  saveCourseScheduleSnapshot,
  type CourseSchedulePersistedSnapshot,
  type UnresolvedTeacherReference,
} from '../courseSchedulePersistence';
import { buildInitialCourseScheduleSnapshot } from './buildInitialCourseScheduleSnapshot';
import type {
  ApplyApprovedLeaveImpactOptions,
  ApplySubstituteImpactOptions,
  CourseScheduleService,
  CreateCourseScheduleServiceOptions,
  MarkSessionPendingReplacementOptions,
  ServiceResult,
} from './CourseScheduleService';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function tryPersist(snapshot: CourseSchedulePersistedSnapshot): ServiceResult {
  try {
    saveCourseScheduleSnapshot(snapshot);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存失败' };
  }
}

function parseIsoParts(iso: string): { dateIso: string; startTime: string } {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (match) {
    return { dateIso: match[1], startTime: match[2] };
  }
  return { dateIso: iso.slice(0, 10), startTime: '00:00' };
}

function endTimeFromIso(iso: string): string {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return match?.[2] ?? '00:00';
}

export class LocalStorageCourseScheduleService implements CourseScheduleService {
  readonly mode = 'local' as const;
  private snapshot: CourseSchedulePersistedSnapshot;
  private listeners = new Set<() => void>();
  private hydrated = false;
  private readonly checker: ReturnType<typeof createCourseSchedulePermissionChecker>;
  private readonly role: CourseScheduleActorRole;

  constructor(role: CourseScheduleActorRole = 'hq_admin') {
    this.role = role;
    this.checker = createCourseSchedulePermissionChecker(role);
    this.snapshot = buildInitialCourseScheduleSnapshot();
  }

  async hydrate(): Promise<ServiceResult> {
    if (this.hydrated) return { ok: true };
    const loaded = loadCourseScheduleSnapshot();
    if (loaded) {
      this.snapshot = loaded;
    } else {
      this.snapshot = buildInitialCourseScheduleSnapshot();
      const persist = tryPersist(this.snapshot);
      if (!persist.ok) {
        this.hydrated = true;
        this.emit();
        return { ok: true };
      }
    }
    this.hydrated = true;
    this.emit();
    return { ok: true };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }

  getSnapshot(): CourseSchedulePersistedSnapshot {
    return this.snapshot;
  }

  getActorRole(): CourseScheduleActorRole {
    return this.role;
  }

  can(action: CourseSchedulePermission): boolean {
    return this.checker.can(action);
  }

  setStoreFilter(storeId: string | 'all'): void {
    this.runTransaction(draft => {
      draft.storeFilterId = storeId;
    });
  }

  runTransaction(
    mutator: (draft: CourseSchedulePersistedSnapshot) => void | ServiceResult,
  ): ServiceResult {
    const draft = clone(this.snapshot);
    const result = mutator(draft);
    if (result && result.ok === false) return result;
    draft.risks = this.recalculateSessionRisksInternal(draft);
    const persist = tryPersist(draft);
    if (!persist.ok) return persist;
    this.snapshot = draft;
    this.emit();
    return { ok: true };
  }

  resetTestData(): ServiceResult {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.TEST_DATA_RESET)) {
      return { ok: false, error: '无权限重置排课测试数据' };
    }
    clearCourseScheduleSnapshot();
    const next = buildInitialCourseScheduleSnapshot();
    this.appendLog(next, {
      operatorStaffId: next.actorStaffId,
      operatorName: '芳芳',
      action: '重置排课测试数据',
      targetType: 'snapshot',
      targetId: 'met-course-schedule-v1',
      reason: '前端原型持久化重置',
    });
    this.appendEvent(next, {
      name: COURSE_SCHEDULE_EVENTS.TEST_DATA_RESET,
      actorStaffId: next.actorStaffId,
      actorName: '芳芳',
      objectType: 'snapshot',
      objectId: 'met-course-schedule-v1',
    });
    this.snapshot = next;
    tryPersist(next);
    this.emit();
    return { ok: true };
  }

  private recalculateSessionRisksInternal(
    draft: CourseSchedulePersistedSnapshot,
    staffContext?: Map<string, StaffRiskContext>,
  ): SessionRisk[] {
    const ctx = staffContext ?? buildDefaultStaffContext(draft.sessions);
    return calcRecalculateSessionRisks(draft.sessions, ctx);
  }

  private actor(draft: CourseSchedulePersistedSnapshot) {
    return {
      id: draft.actorStaffId,
      name: draft.actorStaffId === 'staff_fangfang' ? '芳芳' : draft.actorStaffId,
    };
  }

  private appendLog(
    draft: CourseSchedulePersistedSnapshot,
    entry: Omit<CourseScheduleOperationLog, 'id' | 'at'> & { at?: string },
  ): void {
    const full: CourseScheduleOperationLog = {
      id: `clog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: entry.at ?? nowIso(),
      operatorStaffId: entry.operatorStaffId,
      operatorName: entry.operatorName,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      before: entry.before,
      after: entry.after,
      reason: entry.reason,
      forced: entry.forced,
    };
    draft.operationLogs = [full, ...(draft.operationLogs ?? [])].slice(0, 120);
  }

  private appendEvent(
    draft: CourseSchedulePersistedSnapshot,
    entry: Omit<CourseScheduleDomainEvent, 'id' | 'at'> & { at?: string },
  ): void {
    const full: CourseScheduleDomainEvent = {
      id: `cevt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: entry.at ?? nowIso(),
      name: entry.name,
      actorStaffId: entry.actorStaffId,
      actorName: entry.actorName,
      objectType: entry.objectType,
      objectId: entry.objectId,
      before: entry.before,
      after: entry.after,
      reason: entry.reason,
      forced: entry.forced,
      payload: entry.payload,
    };
    draft.domainEvents = [full, ...(draft.domainEvents ?? [])].slice(0, 200);
  }

  private findSession(draft: CourseSchedulePersistedSnapshot, sessionId: string) {
    return draft.sessions.find(s => s.id === sessionId) ?? null;
  }

  private filterByStore(sessions: StoreCourseSession[], storeId?: string | 'all') {
    const filter = storeId ?? this.snapshot.storeFilterId;
    if (!filter || filter === 'all') return sessions;
    return sessions.filter(s => s.storeId === filter);
  }

  listSessions(storeId?: string | 'all'): StoreCourseSession[] {
    return this.filterByStore(this.snapshot.sessions, storeId);
  }

  getSession(sessionId: string): StoreCourseSession | null {
    return this.snapshot.sessions.find(s => s.id === sessionId) ?? null;
  }

  listSessionsByRange(
    startDateIso: string,
    endDateIso: string,
    storeId?: string | 'all',
  ): StoreCourseSession[] {
    return this.filterByStore(this.snapshot.sessions, storeId).filter(
      s => s.dateIso >= startDateIso && s.dateIso <= endDateIso,
    );
  }

  listSessionsByStore(storeId: string): StoreCourseSession[] {
    return this.snapshot.sessions.filter(s => s.storeId === storeId);
  }

  listSessionsByStaff(staffId: string): StoreCourseSession[] {
    return this.snapshot.sessions.filter(s => s.teacherAssignment.staffId === staffId);
  }

  listSessionRisks(sessionId?: string): SessionRisk[] {
    if (!sessionId) return this.snapshot.risks.filter(r => !r.resolved);
    return this.snapshot.risks.filter(r => r.sessionId === sessionId && !r.resolved);
  }

  getSessionReference(legacyKey: string): SessionReference {
    const resolved = resolveLegacySessionId(legacyKey);
    return {
      sessionId: resolved.sessionId,
      legacySessionId: legacyKey,
      legacySource: resolved.source,
      resolution: resolved.resolution,
      note:
        resolved.resolution === 'unresolved'
          ? '课次关联待确认'
          : undefined,
    };
  }

  listUnresolvedSessionReferences() {
    return this.snapshot.unresolvedSessionReferences;
  }

  listUnresolvedTeacherReferences(): UnresolvedTeacherReference[] {
    return this.snapshot.unresolvedTeacherReferences;
  }

  createSession(
    input: Omit<StoreCourseSession, 'id' | 'createdAt' | 'updatedAt'>,
  ): ServiceResult<{ sessionId: string }> {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_EDIT)) {
      return { ok: false, error: '无权限创建课次' };
    }
    const sessionId = `sess_manual_${Date.now()}`;
    const result = this.runTransaction(draft => {
      const ts = nowIso();
      const session: StoreCourseSession = {
        ...input,
        id: sessionId,
        createdAt: ts,
        updatedAt: ts,
      };
      draft.sessions.push(session);
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '创建课次',
        targetType: 'session',
        targetId: sessionId,
        after: session.courseName,
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.SESSION_CREATED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
      });
    });
    if (result.ok === false) {
      return { ok: false, error: result.error };
    }
    return { ok: true, data: { sessionId } };
  }

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
  ): ServiceResult {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_EDIT)) {
      return { ok: false, error: '无权限编辑课次' };
    }
    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      Object.assign(session, patch, { updatedAt: nowIso() });
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '更新课次',
        targetType: 'session',
        targetId: sessionId,
        after: JSON.stringify(patch),
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.SESSION_UPDATED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
      });
    });
  }

  private writeTeacherChange(
    draft: CourseSchedulePersistedSnapshot,
    change: Omit<SessionTeacherChange, 'id' | 'changedAt' | 'changedBy'>,
    actorId: string,
  ): void {
    const record: SessionTeacherChange = {
      id: `tch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      changedAt: nowIso(),
      changedBy: actorId,
      ...change,
    };
    draft.teacherChanges = [record, ...(draft.teacherChanges ?? [])].slice(0, 200);
  }

  private assignOrReplaceTeacher(
    sessionId: string,
    staffId: string,
    mode: 'assign' | 'replace',
    options?: AssignTeacherOptions,
  ): ServiceResult {
    const perm =
      mode === 'assign'
        ? COURSE_SCHEDULE_PERMISSIONS.SESSION_ASSIGN_TEACHER
        : COURSE_SCHEDULE_PERMISSIONS.SESSION_REPLACE_TEACHER;
    if (!this.can(perm)) {
      return { ok: false, error: '无权限调整授课老师' };
    }

    if (options?.forced) {
      if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SESSION_FORCE_ASSIGN)) {
        return { ok: false, error: '无权限强制指定老师' };
      }
      if (!options.forcedReason?.trim()) {
        return { ok: false, error: '强制指定必须填写原因' };
      }
    }

    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };

      if (mode === 'replace') {
        const guard = canReplaceTeacherForSession({
          sessionStatus: session.sessionStatus,
          payableStatus: session.payableStatus,
        });
        if (!guard.ok && !options?.forced) {
          return { ok: false, error: guard.error ?? '不可更换老师' };
        }
      }

      const beforeStaffId = session.teacherAssignment.staffId;
      const nextStatus = nextAssignmentStatusAfterAssign(mode);
      session.teacherAssignment = {
        ...session.teacherAssignment,
        previousStaffId: beforeStaffId,
        staffId,
        assignmentStatus: nextStatus,
        assignmentType: options?.assignmentType ?? (mode === 'replace' ? '临时替换' : '正常排课'),
        isSubstitute: options?.assignmentType === '代课',
        forced: Boolean(options?.forced),
        forcedReason: options?.forcedReason,
        assignedAt: nowIso(),
        assignedBy: options?.actorStaffId ?? draft.actorStaffId,
        teacherUnresolved: false,
        unresolvedTeacherHint: undefined,
      };
      session.updatedAt = nowIso();

      const actor = this.actor(draft);
      this.writeTeacherChange(
        draft,
        {
          sessionId,
          fromStaffId: beforeStaffId,
          toStaffId: staffId,
          changeType: session.teacherAssignment.assignmentType,
          reason: options?.forcedReason,
          forced: options?.forced,
        },
        actor.id,
      );
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: mode === 'assign' ? '指定授课老师' : '更换授课老师',
        targetType: 'session',
        targetId: sessionId,
        before: beforeStaffId ?? '空',
        after: staffId,
        reason: options?.forcedReason,
        forced: options?.forced,
      });
      this.appendEvent(draft, {
        name:
          mode === 'assign'
            ? COURSE_SCHEDULE_EVENTS.TEACHER_ASSIGNED
            : COURSE_SCHEDULE_EVENTS.TEACHER_REPLACED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
        before: beforeStaffId ?? undefined,
        after: staffId,
        forced: options?.forced,
        payload: { staffId, mode },
      });
    });
  }

  assignTeacher(sessionId: string, staffId: string, options?: AssignTeacherOptions): ServiceResult {
    return this.assignOrReplaceTeacher(sessionId, staffId, 'assign', options);
  }

  replaceTeacher(sessionId: string, staffId: string, options?: AssignTeacherOptions): ServiceResult {
    return this.assignOrReplaceTeacher(sessionId, staffId, 'replace', options);
  }

  confirmTeacherAssignment(sessionId: string): ServiceResult {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SESSION_ASSIGN_TEACHER)) {
      return { ok: false, error: '无权限确认老师' };
    }
    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      if (!session.teacherAssignment.staffId) {
        return { ok: false, error: '尚未指定老师' };
      }
      session.teacherAssignment.assignmentStatus = '已确认';
      session.teacherAssignment.confirmedAt = nowIso();
      session.updatedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '确认授课老师',
        targetType: 'session',
        targetId: sessionId,
        after: session.teacherAssignment.staffId ?? undefined,
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.TEACHER_CONFIRMED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
        after: session.teacherAssignment.staffId ?? undefined,
      });
    });
  }

  rescheduleSession(sessionId: string, input: RescheduleSessionInput): ServiceResult {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SESSION_RESCHEDULE)) {
      return { ok: false, error: '无权限改期' };
    }
    return this.applyRescheduleImpact(sessionId, input);
  }

  cancelSession(sessionId: string, reason: string): ServiceResult {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SESSION_CANCEL)) {
      return { ok: false, error: '无权限取消课次' };
    }
    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      const transition = validateSessionStatusTransition(session.sessionStatus, '已取消');
      if (!transition.ok) return { ok: false, error: transition.error ?? '不可取消' };
      session.sessionStatus = '已取消';
      session.bookingStatus = '已关闭';
      session.teacherAssignment.assignmentStatus = '已取消';
      session.updatedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '取消课次',
        targetType: 'session',
        targetId: sessionId,
        reason,
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.SESSION_CANCELLED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
        reason,
      });
    });
  }

  suspendSession(sessionId: string, input: SuspendSessionInput): ServiceResult {
    if (!this.can(COURSE_SCHEDULE_PERMISSIONS.SESSION_CANCEL)) {
      return { ok: false, error: '无权限停课' };
    }
    return this.applySuspensionImpact(sessionId, { reason: input.reason });
  }

  markSessionPendingReplacement(
    sessionId: string,
    options?: MarkSessionPendingReplacementOptions,
  ): ServiceResult {
    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      const beforeStaffId = session.teacherAssignment.staffId;
      if (!options?.keepPreviousStaff) {
        session.teacherAssignment.previousStaffId = beforeStaffId;
        session.teacherAssignment.staffId = null;
      }
      session.teacherAssignment.assignmentStatus = '待替代';
      session.note = options?.reason ?? session.note;
      session.updatedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '标记待替代',
        targetType: 'session',
        targetId: sessionId,
        reason: options?.reason,
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.LEAVE_IMPACT_APPLIED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
        reason: options?.reason,
        payload: { pendingReplacement: true },
      });
    });
  }

  applyApprovedLeaveImpact(
    sessionId: string,
    options?: ApplyApprovedLeaveImpactOptions,
  ): ServiceResult {
    if (options?.substituteStaffId) {
      return this.applySubstituteImpact(sessionId, options.substituteStaffId, {
        reason: options.reason ?? '请假审批代课',
      });
    }
    return this.markSessionPendingReplacement(sessionId, {
      reason: options?.reason ?? '请假审批通过，待安排代课',
      keepPreviousStaff: options?.keepPreviousStaff ?? true,
    });
  }

  applySubstituteImpact(
    sessionId: string,
    substituteStaffId: string,
    options?: ApplySubstituteImpactOptions,
  ): ServiceResult {
    return this.assignOrReplaceTeacher(sessionId, substituteStaffId, 'replace', {
      assignmentType: '代课',
      forced: options?.forced,
      forcedReason: options?.forcedReason ?? options?.reason,
    });
  }

  applyRescheduleImpact(
    sessionId: string,
    input: { startAt: string; endAt: string; reason: string },
  ): ServiceResult {
    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      const transition = validateSessionStatusTransition(session.sessionStatus, '已改期');
      if (!transition.ok && session.sessionStatus !== '已改期') {
        session.sessionStatus = '已改期';
      }

      const startParts = parseIsoParts(input.startAt);
      const endTime = endTimeFromIso(input.endAt);

      const change: SessionScheduleChange = {
        id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sessionId,
        originalStartAt: session.startAt,
        originalEndAt: session.endAt,
        newStartAt: input.startAt,
        newEndAt: input.endAt,
        reason: input.reason,
        changedAt: nowIso(),
        changedBy: draft.actorStaffId,
        memberNotifyPending: true,
      };
      draft.scheduleChanges = [change, ...(draft.scheduleChanges ?? [])].slice(0, 200);

      session.originalStartAt = session.originalStartAt ?? session.startAt;
      session.originalEndAt = session.originalEndAt ?? session.endAt;
      session.startAt = input.startAt;
      session.endAt = input.endAt;
      session.dateIso = startParts.dateIso;
      session.startTime = startParts.startTime;
      session.endTime = endTime;
      session.sessionStatus = '已改期';
      session.updatedAt = nowIso();

      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '课次改期',
        targetType: 'session',
        targetId: sessionId,
        reason: input.reason,
        after: `${session.dateIso} ${session.startTime}-${session.endTime}`,
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.SESSION_RESCHEDULED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
        reason: input.reason,
      });
    });
  }

  applySuspensionImpact(sessionId: string, input: { reason: string }): ServiceResult {
    return this.runTransaction(draft => {
      const session = this.findSession(draft, sessionId);
      if (!session) return { ok: false, error: '课次不存在' };
      const transition = validateSessionStatusTransition(session.sessionStatus, '已停课');
      if (!transition.ok) return { ok: false, error: transition.error ?? '不可停课' };
      session.sessionStatus = '已停课';
      session.bookingStatus = '已暂停';
      session.updatedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '课次停课',
        targetType: 'session',
        targetId: sessionId,
        reason: input.reason,
      });
      this.appendEvent(draft, {
        name: COURSE_SCHEDULE_EVENTS.SESSION_SUSPENDED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'session',
        objectId: sessionId,
        reason: input.reason,
      });
    });
  }

  deriveTeacherGap(session: StoreCourseSession): SessionRisk | null {
    return deriveTeacherGap(session);
  }

  deriveTeacherConflict(session: StoreCourseSession): SessionRisk | null {
    return deriveTeacherConflict(this.snapshot.sessions, session);
  }

  deriveCapabilityMismatch(session: StoreCourseSession, staffCapabilityIds: string[]): SessionRisk | null {
    return deriveCapabilityMismatch(session, staffCapabilityIds);
  }

  deriveStoreAuthorizationRisk(
    session: StoreCourseSession,
    staffPrimaryStoreId: string,
    supportStoreIds: string[],
  ): SessionRisk | null {
    return deriveStoreAuthorizationRisk(session, staffPrimaryStoreId, supportStoreIds);
  }

  deriveWorkloadRisk(session: StoreCourseSession, staffWeekCount: number): SessionRisk | null {
    return deriveWorkloadRisk(session, staffWeekCount);
  }

  deriveApprovedLeaveImpact(session: StoreCourseSession): SessionRisk | null {
    return deriveApprovedLeaveImpact(session);
  }

  recalculateSessionRisks(staffContext?: Map<string, StaffRiskContext>): SessionRisk[] {
    return calcRecalculateSessionRisks(this.snapshot.sessions, staffContext);
  }

  listOperationLogs(): CourseScheduleOperationLog[] {
    return this.snapshot.operationLogs;
  }
}

export type { CreateCourseScheduleServiceOptions };
