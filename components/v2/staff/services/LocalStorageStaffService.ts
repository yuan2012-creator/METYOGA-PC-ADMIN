import { getDefaultCourseScheduleAdapter } from '../../course/adapters';
import { COURSE_SCHEDULE_PERMISSIONS } from '../../course/domain/permissions';
import { resolveLegacySessionId } from '../../course/domain/legacySessionIdMap';
import type { CourseScheduleAdapter } from '../../course/adapters/CourseScheduleAdapter';
import {
  STAFF_EVENTS,
  applicationNeedsScheduleImpact,
  createStaffPermissionChecker,
  nowIso,
  validateApplicationTransition,
  type StaffActorRole,
  type StaffPermission,
} from '../domain';
import type {
  ScheduleAssignment,
  StaffApplication,
  StaffAvailability,
  StaffDomainEvent,
  StaffMember,
  StaffOperationLog,
} from '../domain/types';
import {
  clearStaffSnapshot,
  loadStaffSnapshot,
  saveStaffSnapshot,
  type StaffPersistedSnapshot,
} from '../staffPersistence';
import {
  buildWorkbenchSnapshot,
  listAvailableTeacherCandidates,
  recomputeConflicts,
  rebuildTodosFromFacts,
  resolveGapIssuesAfterAssign,
} from '../staffWorkbenchCalculations';
import { buildInitialStaffSnapshot } from './buildInitialStaffSnapshot';
import type { CreateStaffServiceOptions, ServiceResult, StaffService } from './StaffService';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toSessionStartAt(dateIso: string, startTime: string): string {
  return `${dateIso}T${startTime}:00+08:00`;
}

function toSessionEndAt(dateIso: string, endTime: string): string {
  return `${dateIso}T${endTime}:00+08:00`;
}

function canonicalSessionId(sessionId: string): string {
  if (sessionId.startsWith('sess_')) return sessionId;
  return resolveLegacySessionId(sessionId).sessionId ?? sessionId;
}

function sessionIdsMatch(storedId: string | undefined, sessionId: string): boolean {
  if (!storedId) return false;
  return canonicalSessionId(storedId) === canonicalSessionId(sessionId);
}

function tryPersist(snapshot: StaffPersistedSnapshot): ServiceResult {
  try {
    saveStaffSnapshot(snapshot);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存失败' };
  }
}

export class LocalStorageStaffService implements StaffService {
  readonly mode = 'local' as const;
  private snapshot: StaffPersistedSnapshot;
  private listeners = new Set<() => void>();
  private hydrated = false;
  private readonly checker: ReturnType<typeof createStaffPermissionChecker>;
  private readonly role: StaffActorRole;
  private readonly adapter: CourseScheduleAdapter;

  constructor(role: StaffActorRole = 'hq_admin') {
    this.role = role;
    this.checker = createStaffPermissionChecker(role);
    this.adapter = getDefaultCourseScheduleAdapter();
    this.snapshot = buildInitialStaffSnapshot();
  }

  async hydrate(): Promise<ServiceResult> {
    if (this.hydrated) return { ok: true };
    const courseHydrate = await this.adapter.hydrate();
    if (!courseHydrate.ok) return courseHydrate;
    const loaded = loadStaffSnapshot();
    if (loaded) {
      this.snapshot = loaded;
      this.migrateLegacySessionRefs(this.snapshot);
    } else {
      this.snapshot = buildInitialStaffSnapshot();
      const persist = tryPersist(this.snapshot);
      if (!persist.ok) {
        this.syncScheduleProjections();
        this.hydrated = true;
        this.emit();
        return { ok: true, data: undefined };
      }
    }
    this.syncScheduleProjections();
    this.hydrated = true;
    this.emit();
    return { ok: true };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    const unsubAdapter = this.adapter.subscribe(() => {
      this.syncScheduleProjections();
      this.emit();
    });
    return () => {
      this.listeners.delete(listener);
      unsubAdapter();
    };
  }

  /** Course schedule is source of truth; staff scheduleAssignments are display cache only. */
  private syncScheduleProjectionsInto(target: StaffPersistedSnapshot): void {
    target.scheduleAssignments = this.adapter.listStaffSessionReferences('all') as ScheduleAssignment[];
    target.scheduleAssignments = recomputeConflicts(target.scheduleAssignments);
  }

  private syncScheduleProjections(): void {
    this.syncScheduleProjectionsInto(this.snapshot);
    this.snapshot.todos = rebuildTodosFromFacts(this.snapshot);
  }

  private migrateLegacySessionRefs(draft: StaffPersistedSnapshot): void {
    const migrateId = (id: string | undefined): string | undefined => {
      if (!id) return id;
      if (id.startsWith('sess_')) return id;
      return resolveLegacySessionId(id).sessionId ?? id;
    };
    for (const app of draft.applications) {
      app.relatedSessionIds = app.relatedSessionIds.map(id => migrateId(id) ?? id);
    }
    for (const issue of draft.issues) {
      if (issue.relatedSessionId) {
        issue.relatedSessionId = migrateId(issue.relatedSessionId) ?? issue.relatedSessionId;
      }
    }
    for (const todo of draft.todos) {
      if (todo.relatedSessionId) {
        todo.relatedSessionId = migrateId(todo.relatedSessionId) ?? todo.relatedSessionId;
      }
    }
  }

  private resolveIssuesForSession(draft: StaffPersistedSnapshot, sessionId: string): void {
    draft.issues = resolveGapIssuesAfterAssign(draft.issues, sessionId);
    draft.issues = draft.issues.map(i => {
      if (i.resolved) return i;
      if (!sessionIdsMatch(i.relatedSessionId, sessionId)) return i;
      if (i.type === '缺老师' || i.type === '排课冲突') {
        return { ...i, resolved: true, resolvedAt: nowIso() };
      }
      return i;
    });
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }

  getSnapshot(): StaffPersistedSnapshot {
    return this.snapshot;
  }

  getActorRole(): StaffActorRole {
    return this.role;
  }

  can(action: StaffPermission): boolean {
    return this.checker.can(action);
  }

  setStoreFilter(storeId: string | 'all'): void {
    this.runTransaction(draft => {
      draft.storeFilterId = storeId;
    });
  }

  replaceSnapshot(next: StaffPersistedSnapshot): ServiceResult {
    const persist = tryPersist(next);
    if (!persist.ok) return persist;
    this.snapshot = next;
    this.emit();
    return { ok: true };
  }

  runTransaction(
    mutator: (draft: StaffPersistedSnapshot) => void | ServiceResult,
  ): ServiceResult {
    const draft = clone(this.snapshot);
    const result = mutator(draft);
    if (result && result.ok === false) return result;
    this.syncScheduleProjectionsInto(draft);
    draft.todos = rebuildTodosFromFacts(draft);
    const persist = tryPersist(draft);
    if (!persist.ok) return persist;
    this.snapshot = draft;
    this.emit();
    return { ok: true };
  }

  resetTestData(): ServiceResult {
    if (!this.can('staff.test_data.reset')) {
      return { ok: false, error: '无权限重置师资测试数据' };
    }
    const courseReset = this.adapter.getService().resetTestData();
    if (!courseReset.ok) return courseReset;
    clearStaffSnapshot();
    const next = buildInitialStaffSnapshot();
    this.appendLog(next, {
      operatorStaffId: next.actorStaffId,
      operatorName: this.nameOf(next, next.actorStaffId),
      action: '重置师资测试数据',
      targetType: 'snapshot',
      targetId: 'met-staff-v2.1',
      reason: '前端原型持久化重置',
    });
    this.appendEvent(next, {
      name: STAFF_EVENTS.TEST_DATA_RESET,
      actorStaffId: next.actorStaffId,
      actorName: this.nameOf(next, next.actorStaffId),
      objectType: 'snapshot',
      objectId: 'met-staff-v2.1',
    });
    const replaced = this.replaceSnapshot(next);
    if (!replaced.ok) return replaced;
    this.syncScheduleProjections();
    return { ok: true };
  }

  private nameOf(snap: StaffPersistedSnapshot, staffId: string | null | undefined): string {
    if (!staffId) return '系统';
    return snap.members.find(m => m.id === staffId)?.name ?? staffId;
  }

  private appendLog(
    draft: StaffPersistedSnapshot,
    entry: Omit<StaffOperationLog, 'id' | 'at'> & { at?: string },
  ): void {
    const full: StaffOperationLog = {
      id: `slog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    draft: StaffPersistedSnapshot,
    entry: Omit<StaffDomainEvent, 'id' | 'at'> & { at?: string },
  ): void {
    const full: StaffDomainEvent = {
      id: `sevt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

  private actor(draft: StaffPersistedSnapshot) {
    return {
      id: draft.actorStaffId,
      name: this.nameOf(draft, draft.actorStaffId),
    };
  }

  listStaff(storeId?: string | 'all'): StaffMember[] {
    const filter = storeId ?? this.snapshot.storeFilterId;
    if (!filter || filter === 'all') return this.snapshot.members;
    return this.snapshot.members.filter(
      m => m.primaryStoreId === filter || m.supportStoreIds.includes(filter),
    );
  }

  getStaff(staffId: string): StaffMember | null {
    return this.snapshot.members.find(m => m.id === staffId) ?? null;
  }

  listCapabilities() {
    return this.snapshot.capabilities;
  }

  listUnresolvedStaffReferences() {
    return this.snapshot.unresolvedReferences;
  }

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
  ): ServiceResult {
    if (!this.can('staff.profile.edit')) return { ok: false, error: '无权限编辑人员档案' };
    return this.runTransaction(draft => {
      const idx = draft.members.findIndex(m => m.id === staffId);
      if (idx < 0) return { ok: false, error: '人员不存在' };
      const before = draft.members[idx];
      const next = {
        ...before,
        ...patch,
        updatedAt: nowIso(),
      };
      draft.members[idx] = next;
      if (patch.availabilityStatus) {
        const av = draft.availabilities.find(a => a.staffId === staffId);
        if (av) {
          av.status = patch.availabilityStatus;
          av.updatedAt = nowIso();
        }
      }
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '更新人员档案',
        targetType: 'staff',
        targetId: staffId,
        before: JSON.stringify({
          primaryStoreId: before.primaryStoreId,
          supportStoreIds: before.supportStoreIds,
          capabilityIds: before.capabilityIds,
          availabilityStatus: before.availabilityStatus,
        }),
        after: JSON.stringify({
          primaryStoreId: next.primaryStoreId,
          supportStoreIds: next.supportStoreIds,
          capabilityIds: next.capabilityIds,
          availabilityStatus: next.availabilityStatus,
        }),
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.PROFILE_UPDATED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'staff',
        objectId: staffId,
      });
    });
  }

  updateStoreAssignments(
    staffId: string,
    primaryStoreId: string,
    supportStoreIds: string[],
  ): ServiceResult {
    if (!this.can('staff.store.assign')) return { ok: false, error: '无权限调整门店' };
    return this.updateStaffProfile(staffId, { primaryStoreId, supportStoreIds });
  }

  updateTeachingCapabilities(staffId: string, capabilityIds: string[]): ServiceResult {
    if (!this.can('staff.capability.edit')) return { ok: false, error: '无权限编辑教学能力' };
    return this.runTransaction(draft => {
      const idx = draft.members.findIndex(m => m.id === staffId);
      if (idx < 0) return { ok: false, error: '人员不存在' };
      const before = draft.members[idx].capabilityIds;
      draft.members[idx] = {
        ...draft.members[idx],
        capabilityIds,
        updatedAt: nowIso(),
      };
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '更新教学能力',
        targetType: 'staff',
        targetId: staffId,
        before: before.join(','),
        after: capabilityIds.join(','),
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.CAPABILITY_UPDATED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'staff',
        objectId: staffId,
      });
    });
  }

  updateAvailability(
    staffId: string,
    patch: Partial<Omit<StaffAvailability, 'staffId'>>,
  ): ServiceResult {
    if (!this.can('staff.availability.edit')) return { ok: false, error: '无权限编辑可排时间' };
    return this.runTransaction(draft => {
      const av = draft.availabilities.find(a => a.staffId === staffId);
      if (!av) return { ok: false, error: '可排记录不存在' };
      Object.assign(av, patch, { updatedAt: nowIso() });
      const member = draft.members.find(m => m.id === staffId);
      if (member && patch.status) {
        member.availabilityStatus = patch.status;
        member.updatedAt = nowIso();
      }
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '更新可排时间',
        targetType: 'availability',
        targetId: staffId,
        after: JSON.stringify(patch),
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.AVAILABILITY_UPDATED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'availability',
        objectId: staffId,
      });
    });
  }

  getStaffWorkbench(storeId?: string | 'all') {
    return buildWorkbenchSnapshot(this.snapshot, storeId ?? this.snapshot.storeFilterId);
  }

  listStaffTodos() {
    return this.snapshot.todos.filter(
      t => !t.dismissed && !this.snapshot.dismissedTodoIds.includes(t.id),
    );
  }

  listStaffIssues() {
    return this.snapshot.issues.filter(i => !i.resolved);
  }

  assignTodoOwner(todoId: string, ownerStaffId: string): ServiceResult {
    return this.runTransaction(draft => {
      const todo = draft.todos.find(t => t.id === todoId);
      if (!todo) return { ok: false, error: '待办不存在' };
      todo.ownerStaffId = ownerStaffId;
      if (todo.relatedApplicationId) {
        const app = draft.applications.find(a => a.id === todo.relatedApplicationId);
        if (app) app.ownerStaffId = ownerStaffId;
      }
      if (todo.relatedIssueId) {
        const issue = draft.issues.find(i => i.id === todo.relatedIssueId);
        if (issue) issue.ownerStaffId = ownerStaffId;
      }
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '指定待办负责人',
        targetType: 'todo',
        targetId: todoId,
        after: ownerStaffId,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.TODO_ASSIGNED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'todo',
        objectId: todoId,
        after: ownerStaffId,
      });
    });
  }

  dismissTodo(todoId: string): ServiceResult {
    return this.runTransaction(draft => {
      if (!draft.dismissedTodoIds.includes(todoId)) {
        draft.dismissedTodoIds.push(todoId);
      }
      const todo = draft.todos.find(t => t.id === todoId);
      if (todo) todo.dismissed = true;
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '关闭待办',
        targetType: 'todo',
        targetId: todoId,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.TODO_DISMISSED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'todo',
        objectId: todoId,
      });
    });
  }

  resolveIssue(issueId: string, reason?: string): ServiceResult {
    if (!this.can('staff.risk.resolve')) return { ok: false, error: '无权限处理风险' };
    return this.runTransaction(draft => {
      const issue = draft.issues.find(i => i.id === issueId);
      if (!issue) return { ok: false, error: '问题不存在' };
      issue.resolved = true;
      issue.resolvedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '解决问题',
        targetType: 'issue',
        targetId: issueId,
        reason,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.ISSUE_RESOLVED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'issue',
        objectId: issueId,
        reason,
      });
    });
  }

  listScheduleAssignments(storeId?: string | 'all') {
    this.syncScheduleProjections();
    const filter = storeId ?? this.snapshot.storeFilterId;
    if (!filter || filter === 'all') return this.snapshot.scheduleAssignments;
    return this.snapshot.scheduleAssignments.filter(a => a.session.storeId === filter);
  }

  listScheduleGaps() {
    this.syncScheduleProjections();
    return this.snapshot.scheduleAssignments.filter(
      a => a.status === '待指定' || !a.staffId || a.riskTags.includes('缺老师'),
    );
  }

  listScheduleConflicts() {
    this.syncScheduleProjections();
    return this.snapshot.scheduleAssignments.filter(
      a => a.status === '有冲突' || a.riskTags.includes('时间冲突'),
    );
  }

  listAvailableTeachers(assignmentId: string) {
    this.syncScheduleProjections();
    const assignment = this.snapshot.scheduleAssignments.find(a => a.id === assignmentId);
    if (!assignment) return [];
    return listAvailableTeacherCandidates(this.snapshot, assignment);
  }

  private assignOrReplace(
    assignmentId: string,
    staffId: string,
    mode: 'assign' | 'replace',
    options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult {
    const staffPerm = mode === 'assign' ? 'staff.schedule.assign' : 'staff.schedule.replace';
    if (!this.can(staffPerm)) return { ok: false, error: '无权限调整排课老师' };

    this.syncScheduleProjections();
    const assignment = this.snapshot.scheduleAssignments.find(a => a.id === assignmentId);
    if (!assignment) return { ok: false, error: '排课分配不存在' };

    const courseService = this.adapter.getService();
    const coursePerm =
      mode === 'assign'
        ? COURSE_SCHEDULE_PERMISSIONS.SESSION_ASSIGN_TEACHER
        : COURSE_SCHEDULE_PERMISSIONS.SESSION_REPLACE_TEACHER;
    if (!courseService.can(coursePerm)) {
      return { ok: false, error: '无权限调整课程授课老师' };
    }
    if (options?.forced) {
      if (!courseService.can(COURSE_SCHEDULE_PERMISSIONS.SESSION_FORCE_ASSIGN)) {
        return { ok: false, error: '无权限强制指定老师' };
      }
      if (!options.forcedReason?.trim()) {
        return { ok: false, error: '强制指定必须填写原因' };
      }
    }

    const teacher = this.snapshot.members.find(m => m.id === staffId);
    if (!teacher) return { ok: false, error: '老师不存在' };

    const sessionId = assignment.session.sessionId;
    const before = assignment.staffId;
    const pendingSession = courseService.getSession(sessionId);
    const courseOptions = {
      forced: options?.forced,
      forcedReason: options?.forcedReason,
      actorStaffId: this.snapshot.actorStaffId,
      assignmentType:
        pendingSession?.teacherAssignment.assignmentStatus === '待替代'
          ? ('代课' as const)
          : undefined,
    };
    const courseResult =
      mode === 'assign'
        ? this.adapter.assignStaffToSession(sessionId, staffId, courseOptions)
        : this.adapter.replaceStaffForSession(sessionId, staffId, courseOptions);
    if (!courseResult.ok) return courseResult;

    return this.runTransaction(draft => {
      this.resolveIssuesForSession(draft, sessionId);
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: mode === 'assign' ? '指定老师' : '更换老师',
        targetType: 'schedule',
        targetId: assignmentId,
        before: before ?? '空',
        after: staffId,
        forced: options?.forced,
        reason: options?.forcedReason,
      });
      this.appendEvent(draft, {
        name: mode === 'assign' ? STAFF_EVENTS.SCHEDULE_ASSIGNED : STAFF_EVENTS.SCHEDULE_REPLACED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'schedule',
        objectId: assignmentId,
        before: before ?? undefined,
        after: staffId,
        forced: options?.forced,
        reason: options?.forcedReason,
        payload: { sessionId, courseSynced: true },
      });
    });
  }

  assignTeacherToSession(
    assignmentId: string,
    staffId: string,
    options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult {
    return this.assignOrReplace(assignmentId, staffId, 'assign', options);
  }

  replaceTeacherForSession(
    assignmentId: string,
    staffId: string,
    options?: { forced?: boolean; forcedReason?: string },
  ): ServiceResult {
    return this.assignOrReplace(assignmentId, staffId, 'replace', options);
  }

  listApplications(filter?: { status?: string; type?: string }) {
    return this.snapshot.applications.filter(a => {
      if (filter?.status && a.status !== filter.status) return false;
      if (filter?.type && a.type !== filter.type) return false;
      return true;
    });
  }

  getApplication(applicationId: string) {
    return this.snapshot.applications.find(a => a.id === applicationId) ?? null;
  }

  private applyScheduleImpact(
    app: StaffApplication,
  ): { ok: boolean; error?: string } {
    if (!applicationNeedsScheduleImpact(app.type)) {
      return { ok: true };
    }
    try {
      if (app.type === '代课') {
        if (!app.substituteStaffId) return { ok: false, error: '代课必须选择替代老师' };
        for (const sessionId of app.relatedSessionIds) {
          const result = this.adapter.applySubstituteImpact(sessionId, app.substituteStaffId, {
            reason: app.reason,
          });
          if (!result.ok) return { ok: false, error: result.error ?? '代课影响写入失败' };
        }
      } else if (app.type === '请假') {
        for (const sessionId of app.relatedSessionIds) {
          const result = app.substituteStaffId
            ? this.adapter.applySubstituteImpact(sessionId, app.substituteStaffId, {
                reason: app.reason ?? '请假审批代课',
              })
            : this.adapter.applyApprovedLeaveImpact(sessionId, {
                keepPreviousStaff: true,
                reason: app.reason ?? '请假审批通过，待安排代课',
              });
          if (!result.ok) return { ok: false, error: result.error ?? '请假影响写入失败' };
        }
      } else if (app.type === '改期') {
        if (!app.rescheduleTo) return { ok: false, error: '改期必须选择新日期时间' };
        for (const sessionId of app.relatedSessionIds) {
          const { dateIso, startTime, endTime } = app.rescheduleTo;
          const result = this.adapter.applyRescheduleImpact(sessionId, {
            startAt: toSessionStartAt(dateIso, startTime),
            endAt: toSessionEndAt(dateIso, endTime),
            reason: app.reason ?? '改期审批通过',
          });
          if (!result.ok) return { ok: false, error: result.error ?? '改期影响写入失败' };
        }
      } else if (app.type === '停课') {
        for (const sessionId of app.relatedSessionIds) {
          const result = this.adapter.applySuspensionImpact(sessionId, {
            reason: app.reason ?? '停课审批通过',
          });
          if (!result.ok) return { ok: false, error: result.error ?? '停课影响写入失败' };
        }
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : '排课影响写入失败' };
    }
  }

  approveApplication(
    applicationId: string,
    options: {
      comment: string;
      substituteStaffId?: string;
      rescheduleTo?: { dateIso: string; startTime: string; endTime: string };
      forceReason?: string;
    },
  ): ServiceResult {
    if (!this.can('staff.application.approve')) return { ok: false, error: '无权限审批' };
    return this.runTransaction(draft => {
      const app = draft.applications.find(a => a.id === applicationId);
      if (!app) return { ok: false, error: '申请不存在' };
      const transition = validateApplicationTransition(app.status, '已通过', {
        forceReason: options.forceReason,
      });
      if (!transition.ok) return { ok: false, error: transition.error ?? '非法状态转换' };

      if (app.type === '代课' && !options.substituteStaffId) {
        return { ok: false, error: '代课审批必须选择替代老师' };
      }
      if (app.type === '改期' && !options.rescheduleTo) {
        return { ok: false, error: '改期审批必须选择新日期时间' };
      }
      if (app.type === '请假' && app.relatedSessionIds.length === 0) {
        return { ok: false, error: '请假审批必须确认影响课次' };
      }

      const before = app.status;
      app.status = '已通过';
      app.approvalComment = options.comment;
      if (options.substituteStaffId) app.substituteStaffId = options.substituteStaffId;
      if (options.rescheduleTo) app.rescheduleTo = options.rescheduleTo;
      app.updatedAt = nowIso();

      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '审批通过',
        targetType: 'application',
        targetId: applicationId,
        before,
        after: '已通过',
        reason: options.comment,
        forced: transition.forced,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.APPLICATION_APPROVED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'application',
        objectId: applicationId,
        before,
        after: '已通过',
        reason: options.comment,
        forced: transition.forced,
      });

      if (applicationNeedsScheduleImpact(app.type)) {
        const impact = this.applyScheduleImpact(app);
        if (!impact.ok) {
          app.status = '执行异常';
          app.executionError = impact.error;
          app.updatedAt = nowIso();
          this.appendLog(draft, {
            operatorStaffId: actor.id,
            operatorName: actor.name,
            action: '排课影响执行失败',
            targetType: 'application',
            targetId: applicationId,
            reason: impact.error,
          });
          this.appendEvent(draft, {
            name: STAFF_EVENTS.APPLICATION_EXECUTION_FAILED,
            actorStaffId: actor.id,
            actorName: actor.name,
            objectType: 'application',
            objectId: applicationId,
            reason: impact.error,
          });
          return { ok: false, error: impact.error ?? '执行异常' };
        }
        app.status = '已执行';
        app.impactExecuted = true;
        app.updatedAt = nowIso();
        this.appendLog(draft, {
          operatorStaffId: actor.id,
          operatorName: actor.name,
          action: '排课影响已执行',
          targetType: 'application',
          targetId: applicationId,
          after: '已执行',
        });
        this.appendEvent(draft, {
          name: STAFF_EVENTS.APPLICATION_EXECUTED,
          actorStaffId: actor.id,
          actorName: actor.name,
          objectType: 'application',
          objectId: applicationId,
          after: '已执行',
        });
      }
    });
  }

  rejectApplication(applicationId: string, reason: string, forceReason?: string): ServiceResult {
    if (!this.can('staff.application.reject')) return { ok: false, error: '无权限驳回' };
    if (!reason.trim()) return { ok: false, error: '驳回必须填写原因' };
    return this.runTransaction(draft => {
      const app = draft.applications.find(a => a.id === applicationId);
      if (!app) return { ok: false, error: '申请不存在' };
      const transition = validateApplicationTransition(app.status, '已驳回', {
        rejectReason: reason,
        forceReason,
      });
      if (!transition.ok) return { ok: false, error: transition.error ?? '非法状态转换' };
      const before = app.status;
      app.status = '已驳回';
      app.rejectReason = reason;
      app.updatedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '驳回申请',
        targetType: 'application',
        targetId: applicationId,
        before,
        after: '已驳回',
        reason,
        forced: transition.forced,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.APPLICATION_REJECTED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'application',
        objectId: applicationId,
        before,
        after: '已驳回',
        reason,
        forced: transition.forced,
      });
    });
  }

  requestApplicationSupplement(applicationId: string, message: string): ServiceResult {
    if (!this.can('staff.application.approve')) return { ok: false, error: '无权限要求补充' };
    return this.runTransaction(draft => {
      const app = draft.applications.find(a => a.id === applicationId);
      if (!app) return { ok: false, error: '申请不存在' };
      const transition = validateApplicationTransition(app.status, '待补充');
      if (!transition.ok) return { ok: false, error: transition.error ?? '非法状态转换' };
      const before = app.status;
      app.status = '待补充';
      app.supplementRequest = message;
      app.updatedAt = nowIso();
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '要求补充材料',
        targetType: 'application',
        targetId: applicationId,
        before,
        after: '待补充',
        reason: message,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.APPLICATION_SUPPLEMENT_REQUESTED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'application',
        objectId: applicationId,
        reason: message,
      });
    });
  }

  submitApplicationSupplement(applicationId: string): ServiceResult {
    return this.runTransaction(draft => {
      const app = draft.applications.find(a => a.id === applicationId);
      if (!app) return { ok: false, error: '申请不存在' };
      const transition = validateApplicationTransition(app.status, '待审批');
      if (!transition.ok) return { ok: false, error: transition.error ?? '非法状态转换' };
      app.status = '待审批';
      app.updatedAt = nowIso();
      app.evidence = app.evidence.map(e =>
        e.status === 'missing' ? { ...e, status: 'submitted' } : e,
      );
    });
  }

  assignApplicationOwner(applicationId: string, ownerStaffId: string): ServiceResult {
    if (!this.can('staff.application.assign_owner')) {
      return { ok: false, error: '无权限指定负责人' };
    }
    return this.runTransaction(draft => {
      const app = draft.applications.find(a => a.id === applicationId);
      if (!app) return { ok: false, error: '申请不存在' };
      app.ownerStaffId = ownerStaffId;
      app.updatedAt = nowIso();
      for (const issue of draft.issues) {
        if (issue.relatedApplicationId === applicationId && issue.type === '负责人待指定') {
          issue.ownerStaffId = ownerStaffId;
          issue.resolved = true;
          issue.resolvedAt = nowIso();
        }
      }
      const actor = this.actor(draft);
      this.appendLog(draft, {
        operatorStaffId: actor.id,
        operatorName: actor.name,
        action: '指定申请负责人',
        targetType: 'application',
        targetId: applicationId,
        after: ownerStaffId,
      });
      this.appendEvent(draft, {
        name: STAFF_EVENTS.APPLICATION_OWNER_ASSIGNED,
        actorStaffId: actor.id,
        actorName: actor.name,
        objectType: 'application',
        objectId: applicationId,
        after: ownerStaffId,
      });
    });
  }

  listOperationLogs() {
    return this.snapshot.operationLogs;
  }
}

export type { CreateStaffServiceOptions };
