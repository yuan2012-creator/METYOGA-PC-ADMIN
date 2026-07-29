import type { WorkloadStatus } from './domain/enums';
import type {
  AvailableTeacherCandidate,
  ScheduleAssignment,
  StaffIssue,
  StaffLoadRow,
  StaffMember,
  StaffTodo,
  StaffWorkbenchMetrics,
  StaffWorkbenchSnapshot,
} from './domain/types';

export type { StaffWorkbenchSnapshot };

type SnapshotLike = {
  members: StaffMember[];
  scheduleAssignments: ScheduleAssignment[];
  issues: StaffIssue[];
  todos: StaffTodo[];
  dismissedTodoIds: string[];
  unresolvedReferences: { id: string }[];
};

const STORE_NAMES: Record<string, string> = {
  'store-wanxiang': '万象馆',
  'store-chengxi': '城西馆',
  'store-binjiang': '滨江馆',
};

export const PROTOTYPE_TODAY_ISO = '2026-07-27';

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function overlaps(
  a: { dateIso: string; startTime: string; endTime: string },
  b: { dateIso: string; startTime: string; endTime: string },
): boolean {
  if (a.dateIso !== b.dateIso) return false;
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function filterAssignmentsByStore(
  assignments: ScheduleAssignment[],
  storeId?: string | 'all',
): ScheduleAssignment[] {
  if (!storeId || storeId === 'all') return assignments;
  return assignments.filter(a => a.session.storeId === storeId);
}

export function deriveWorkloadStatus(
  next7Count: number,
  availabilityStatus: string,
): WorkloadStatus {
  if (availabilityStatus === '暂不可排' || availabilityStatus === '请假中') return '暂不可排';
  if (next7Count >= 12) return '超负荷';
  if (next7Count >= 8) return '偏高';
  if (next7Count <= 2) return '空闲';
  return '正常';
}

export function computeWorkbenchMetrics(
  snapshot: SnapshotLike,
  storeId?: string | 'all',
): StaffWorkbenchMetrics {
  const assignments = filterAssignmentsByStore(snapshot.scheduleAssignments, storeId);
  const today = PROTOTYPE_TODAY_ISO;
  const end = addDays(today, 7);
  const todayAssignments = assignments.filter(a => a.session.dateIso === today);
  const teachingStaff = new Set(
    todayAssignments.filter(a => a.staffId && a.status !== '已取消').map(a => a.staffId as string),
  );
  const pendingGaps = assignments.filter(
    a =>
      (a.status === '待指定' || a.riskTags.includes('缺老师') || !a.staffId) &&
      a.status !== '已取消' &&
      a.session.dateIso >= today &&
      a.session.dateIso <= end,
  );
  const leaveSubTodos = snapshot.todos.filter(
    t =>
      !t.dismissed &&
      !snapshot.dismissedTodoIds.includes(t.id) &&
      (t.type === '请假待审批' || t.type === '代课待确认'),
  );
  const supplyRisk = snapshot.issues.filter(
    i =>
      !i.resolved &&
      (i.type === '缺老师' || i.type === '排课冲突' || i.type === '负荷过高'),
  );
  const payablePending = snapshot.issues.filter(i => !i.resolved && i.type === '课酬待确认');
  return {
    todayTeachingStaffCount: teachingStaff.size,
    pendingGapCount: pendingGaps.length,
    leaveSubstituteTodoCount: leaveSubTodos.length,
    supplyRiskNext7Days: supplyRisk.length,
    payablePendingCount: payablePending.length,
    payableAbnormalCount: payablePending.filter(i => i.severity === 'P0').length,
  };
}

export function buildLoadRows(snapshot: SnapshotLike, storeId?: string | 'all'): StaffLoadRow[] {
  const today = PROTOTYPE_TODAY_ISO;
  const end = addDays(today, 7);
  const assignments = filterAssignmentsByStore(snapshot.scheduleAssignments, storeId);
  return snapshot.members
    .filter(m => {
      if (!storeId || storeId === 'all') return true;
      return m.primaryStoreId === storeId || m.supportStoreIds.includes(storeId);
    })
    .map(m => {
      const mine = assignments.filter(a => a.staffId === m.id && a.status !== '已取消');
      const todayCount = mine.filter(a => a.session.dateIso === today).length;
      const next7 = mine.filter(a => a.session.dateIso >= today && a.session.dateIso <= end).length;
      const issues = snapshot.issues
        .filter(i => !i.resolved && i.relatedStaffId === m.id)
        .map(i => i.type);
      const workloadStatus = deriveWorkloadStatus(next7, m.availabilityStatus);
      let nextAction = '查看详情';
      if (issues.includes('缺老师') || m.availabilityStatus === '请假中') nextAction = '安排代课';
      else if (workloadStatus === '超负荷' || workloadStatus === '偏高') nextAction = '调整负荷';
      else if (workloadStatus === '空闲') nextAction = '可补排';
      return {
        staffId: m.id,
        name: m.name,
        primaryStoreName: STORE_NAMES[m.primaryStoreId] ?? m.primaryStoreId,
        todaySessionCount: todayCount,
        next7DaySessionCount: next7,
        workloadStatus,
        availabilityStatus: m.availabilityStatus,
        currentIssues: issues,
        nextAction,
      };
    });
}

export function rebuildTodosFromFacts(
  snapshot: SnapshotLike & {
    applications: Array<{
      id: string;
      type: string;
      status: string;
      ownerStaffId: string | null;
      applicantStaffId: string;
      submittedAt: string;
      updatedAt: string;
    }>;
  },
): StaffTodo[] {
  const todos: StaffTodo[] = [];
  const push = (todo: StaffTodo) => {
    if (todos.some(t => t.dedupeKey === todo.dedupeKey)) return;
    if (snapshot.dismissedTodoIds.includes(todo.id)) {
      todos.push({ ...todo, dismissed: true });
      return;
    }
    todos.push(todo);
  };

  for (const app of snapshot.applications) {
    if (app.status === '待审批' && app.type === '请假') {
      push({
        id: `todo-app-${app.id}`,
        type: '请假待审批',
        title: `${app.id} 请假待审批`,
        ownerStaffId: app.ownerStaffId,
        relatedApplicationId: app.id,
        relatedStaffId: app.applicantStaffId,
        severity: 'P0',
        dedupeKey: `app:${app.id}`,
        createdAt: app.submittedAt,
      });
    }
    if (app.status === '待审批' && app.type === '代课') {
      push({
        id: `todo-app-${app.id}`,
        type: '代课待确认',
        title: `${app.id} 代课待确认`,
        ownerStaffId: app.ownerStaffId,
        relatedApplicationId: app.id,
        relatedStaffId: app.applicantStaffId,
        severity: 'P0',
        dedupeKey: `app:${app.id}`,
        createdAt: app.submittedAt,
      });
    }
    if (app.status === '待补充') {
      push({
        id: `todo-app-${app.id}`,
        type: '资料补交待审',
        title: `${app.id} 资料待补充`,
        ownerStaffId: app.ownerStaffId,
        relatedApplicationId: app.id,
        relatedStaffId: app.applicantStaffId,
        severity: 'P1',
        dedupeKey: `app:${app.id}`,
        createdAt: app.updatedAt,
      });
    }
    if (!app.ownerStaffId && (app.status === '待审批' || app.status === '待补充')) {
      push({
        id: `todo-owner-${app.id}`,
        type: '负责人待指定',
        title: `${app.id} 负责人待指定`,
        ownerStaffId: null,
        relatedApplicationId: app.id,
        severity: 'P1',
        dedupeKey: `owner-app:${app.id}`,
        createdAt: app.submittedAt,
      });
    }
  }

  for (const issue of snapshot.issues) {
    if (issue.resolved) continue;
    if (issue.type === '缺老师') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '缺老师待指定',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedSessionId: issue.relatedSessionId,
        severity: issue.severity,
        dedupeKey: issue.relatedSessionId ? `gap:${issue.relatedSessionId}` : `issue:${issue.id}`,
        createdAt: issue.createdAt,
        dueAt: issue.dueAt,
      });
    } else if (issue.type === '排课冲突') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '排课冲突待处理',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedSessionId: issue.relatedSessionId,
        severity: issue.severity,
        dedupeKey: `conflict:${issue.relatedSessionId ?? issue.id}`,
        createdAt: issue.createdAt,
        dueAt: issue.dueAt,
      });
    } else if (issue.type === '证书到期' || issue.type === '合同到期') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '证书或合同到期',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedStaffId: issue.relatedStaffId,
        severity: issue.severity,
        dedupeKey: `cert:${issue.relatedStaffId ?? issue.id}`,
        createdAt: issue.createdAt,
        dueAt: issue.dueAt,
      });
    } else if (issue.type === '课酬待确认') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '课酬待确认',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        relatedStaffId: issue.relatedStaffId,
        severity: issue.severity,
        dedupeKey: `pay:${issue.relatedStaffId ?? issue.id}`,
        createdAt: issue.createdAt,
      });
    } else if (issue.type === '负责人待指定') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '负责人待指定',
        title: issue.title,
        ownerStaffId: null,
        relatedIssueId: issue.id,
        relatedApplicationId: issue.relatedApplicationId,
        severity: issue.severity,
        dedupeKey: issue.relatedApplicationId
          ? `owner-app:${issue.relatedApplicationId}`
          : `owner-issue:${issue.id}`,
        createdAt: issue.createdAt,
      });
    } else if (issue.type === '教学异常') {
      push({
        id: `todo-issue-${issue.id}`,
        type: '教学异常',
        title: issue.title,
        ownerStaffId: issue.ownerStaffId,
        relatedIssueId: issue.id,
        severity: issue.severity,
        dedupeKey: `teach:${issue.id}`,
        createdAt: issue.createdAt,
      });
    }
  }
  return todos;
}

export function recomputeConflicts(assignments: ScheduleAssignment[]): ScheduleAssignment[] {
  return assignments.map(a => {
    if (!a.staffId || a.status === '已取消') return a;
    const conflict = assignments.some(
      other =>
        other.id !== a.id &&
        other.staffId === a.staffId &&
        other.status !== '已取消' &&
        overlaps(a.session, other.session),
    );
    if (conflict) {
      const tags = Array.from(new Set([...a.riskTags.filter(t => t !== '时间冲突'), '时间冲突']));
      return { ...a, status: a.status === '待指定' ? a.status : '有冲突', riskTags: tags };
    }
    const tags = a.riskTags.filter(t => t !== '时间冲突');
    if (a.status === '有冲突' && !tags.includes('老师请假') && !tags.includes('缺老师')) {
      return { ...a, status: '已确认', riskTags: tags };
    }
    return { ...a, riskTags: tags };
  });
}

export function resolveGapIssuesAfterAssign(
  issues: StaffIssue[],
  sessionId: string,
): StaffIssue[] {
  return issues.map(i => {
    if (i.resolved) return i;
    if (i.type === '缺老师' && i.relatedSessionId === sessionId) {
      return { ...i, resolved: true, resolvedAt: new Date().toISOString() };
    }
    return i;
  });
}

export function listAvailableTeacherCandidates(
  snapshot: SnapshotLike & { availabilities: Array<{ staffId: string; status: string; blockedDates: string[] }> },
  assignment: ScheduleAssignment,
): AvailableTeacherCandidate[] {
  const session = assignment.session;
  const candidates: AvailableTeacherCandidate[] = [];
  for (const m of snapshot.members) {
    if (m.employmentStatus !== '在职' && m.employmentStatus !== '试用') continue;
    if (m.availabilityStatus === '请假中' || m.availabilityStatus === '暂不可排') continue;
    const authorized =
      m.primaryStoreId === session.storeId || m.supportStoreIds.includes(session.storeId);
    if (!authorized) continue;
    const capsOk = session.requiredCapabilityIds.every(c => m.capabilityIds.includes(c));
    if (!capsOk) continue;
    const avail = snapshot.availabilities.find(a => a.staffId === m.id);
    if (avail?.blockedDates.includes(session.dateIso)) continue;

    const mine = snapshot.scheduleAssignments.filter(
      a => a.staffId === m.id && a.status !== '已取消',
    );
    const conflict = mine.some(a => a.id !== assignment.id && overlaps(a.session, session));
    const todayCount = mine.filter(a => a.session.dateIso === PROTOTYPE_TODAY_ISO).length;
    const weekCount = mine.filter(
      a =>
        a.session.dateIso >= PROTOTYPE_TODAY_ISO &&
        a.session.dateIso <= addDays(PROTOTYPE_TODAY_ISO, 7),
    ).length;
    const isSupport = m.primaryStoreId !== session.storeId;
    const matchNotes: string[] = [];
    const riskNotes: string[] = [];
    matchNotes.push('可授课程匹配');
    matchNotes.push(isSupport ? '支援门店授权' : '主门店授权');
    if (conflict) riskNotes.push('时间冲突');
    if (weekCount >= 8) riskNotes.push('未来7天负荷偏高');
    if (m.availabilityStatus === '负荷过高') riskNotes.push('当前负荷过高');

    let score = 100;
    if (isSupport) score -= 5;
    if (conflict) score -= 40;
    if (weekCount >= 8) score -= 15;
    if (weekCount >= 12) score -= 20;

    candidates.push({
      staffId: m.id,
      name: m.name,
      teachingLevel: m.teachingLevel,
      primaryStoreName: STORE_NAMES[m.primaryStoreId] ?? m.primaryStoreId,
      isSupport,
      todaySessionCount: todayCount,
      weekLoadLabel: `${weekCount} 节 / 7天`,
      matchNotes,
      riskNotes,
      score,
    });
  }
  return candidates.sort((a, b) => b.score - a.score);
}

export function buildWorkbenchSnapshot(
  snapshot: SnapshotLike,
  storeId?: string | 'all',
): StaffWorkbenchSnapshot {
  const assignments = filterAssignmentsByStore(snapshot.scheduleAssignments, storeId);
  const today = PROTOTYPE_TODAY_ISO;
  const end = addDays(today, 7);
  const scheduleWindow = assignments
    .filter(a => a.session.dateIso >= today && a.session.dateIso <= end && a.status !== '已取消')
    .sort((a, b) =>
      `${a.session.dateIso}${a.session.startTime}`.localeCompare(
        `${b.session.dateIso}${b.session.startTime}`,
      ),
    );
  const gapsAndConflicts = snapshot.issues.filter(i => {
    if (i.resolved) return false;
    return (
      i.type === '缺老师' ||
      i.type === '排课冲突' ||
      i.type === '负荷过高' ||
      i.type === '负荷过低'
    );
  });
  const todos = snapshot.todos.filter(t => !t.dismissed && !snapshot.dismissedTodoIds.includes(t.id));
  return {
    metrics: computeWorkbenchMetrics(snapshot, storeId),
    scheduleWindow,
    gapsAndConflicts,
    todos,
    loadRows: buildLoadRows(snapshot, storeId),
    unresolvedCount: snapshot.unresolvedReferences.length,
  };
}
