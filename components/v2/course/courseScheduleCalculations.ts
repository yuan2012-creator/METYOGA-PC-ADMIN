import type { ScheduleAssignmentStatus } from '../staff/domain/enums';
import type { CourseSessionReference } from '../staff/domain/types';
import type { SessionRiskType } from './domain/enums';
import { SESSION_RISK_TYPES } from './domain/enums';
import type { SessionRisk, StoreCourseSession, TeacherAssignment } from './domain/types';

export type StaffRiskContext = {
  capabilityIds: string[];
  primaryStoreId: string;
  supportStoreIds: string[];
  weekCount: number;
};

export interface WeekScheduleDayProjection {
  id: string;
  label: string;
  dateLabel: string;
  dateIso: string;
  sessions: StoreCourseSession[];
}

/** Staff-compatible schedule assignment projection (adapter layer). */
export interface ScheduleAssignmentProjection {
  id: string;
  session: CourseSessionReference;
  staffId: string | null;
  status: ScheduleAssignmentStatus;
  previousStaffId?: string | null;
  riskTags: string[];
  ownerStaffId: string | null;
  updatedAt: string;
  note?: string;
}

const WEEKDAY_ORDER = [
  'day-mon',
  'day-tue',
  'day-wed',
  'day-thu',
  'day-fri',
  'day-sat',
  'day-sun',
] as const;

export function overlaps(
  a: { dateIso: string; startTime: string; endTime: string },
  b: { dateIso: string; startTime: string; endTime: string },
): boolean {
  if (a.dateIso !== b.dateIso) return false;
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

function riskId(sessionId: string, type: SessionRiskType): string {
  return `risk-${sessionId}-${type}`;
}

function makeRisk(
  sessionId: string,
  type: SessionRiskType,
  severity: SessionRisk['severity'],
  message: string,
  relatedStaffId?: string,
): SessionRisk {
  return {
    id: riskId(sessionId, type),
    sessionId,
    type,
    severity,
    message,
    relatedStaffId,
    createdAt: '2026-07-27T08:00:00.000Z',
  };
}

export function deriveTeacherGap(session: StoreCourseSession): SessionRisk | null {
  const staffId = session.teacherAssignment.staffId;
  const status = session.teacherAssignment.assignmentStatus;
  if (staffId && status !== '待指定') return null;
  return makeRisk(session.id, '缺老师', 'P0', '课次尚未指定授课老师');
}

export function deriveTeacherConflict(
  sessions: StoreCourseSession[],
  session: StoreCourseSession,
): SessionRisk | null {
  const staffId = session.teacherAssignment.staffId;
  if (!staffId) return null;
  const conflict = sessions.find(
    other =>
      other.id !== session.id &&
      other.teacherAssignment.staffId === staffId &&
      other.sessionStatus !== '已取消' &&
      other.sessionStatus !== '已停课' &&
      overlaps(session, other),
  );
  if (!conflict) return null;
  return makeRisk(
    session.id,
    '时间冲突',
    'P0',
    `与「${conflict.courseName}」(${conflict.startTime}-${conflict.endTime}) 时间冲突`,
    staffId,
  );
}

export function deriveCapabilityMismatch(
  session: StoreCourseSession,
  staffCapabilityIds: string[],
): SessionRisk | null {
  const staffId = session.teacherAssignment.staffId;
  if (!staffId || session.requiredCapabilityIds.length === 0) return null;
  const missing = session.requiredCapabilityIds.filter(id => !staffCapabilityIds.includes(id));
  if (missing.length === 0) return null;
  return makeRisk(
    session.id,
    '能力不匹配',
    'P1',
    '当前老师不具备本课所需教学能力',
    staffId,
  );
}

export function deriveStoreAuthorizationRisk(
  session: StoreCourseSession,
  staffPrimaryStoreId: string,
  supportStoreIds: string[],
): SessionRisk | null {
  const staffId = session.teacherAssignment.staffId;
  if (!staffId) return null;
  const authorized =
    staffPrimaryStoreId === session.storeId || supportStoreIds.includes(session.storeId);
  if (authorized) return null;
  return makeRisk(
    session.id,
    '门店无授权',
    'P1',
    '老师未授权在该门店授课',
    staffId,
  );
}

export function deriveWorkloadRisk(
  session: StoreCourseSession,
  staffWeekCount: number,
): SessionRisk | null {
  const staffId = session.teacherAssignment.staffId;
  if (!staffId) return null;
  if (staffWeekCount < 8) return null;
  const severity = staffWeekCount >= 12 ? 'P0' : 'P1';
  return makeRisk(
    session.id,
    '负荷过高',
    severity,
    `本周已排 ${staffWeekCount} 节课，负荷${staffWeekCount >= 12 ? '超负荷' : '偏高'}`,
    staffId,
  );
}

export function deriveApprovedLeaveImpact(session: StoreCourseSession): SessionRisk | null {
  const { assignmentStatus, staffId } = session.teacherAssignment;
  if (assignmentStatus === '待替代') {
    return makeRisk(
      session.id,
      '请假影响',
      'P0',
      '原授课老师已请假，待安排代课或替换',
      staffId ?? undefined,
    );
  }
  if (assignmentStatus === '有冲突' && session.note?.includes('请假')) {
    return makeRisk(
      session.id,
      '请假影响',
      'P0',
      '老师请假与课次冲突，需人工确认',
      staffId ?? undefined,
    );
  }
  return null;
}

function deriveTeacherUnresolved(session: StoreCourseSession): SessionRisk | null {
  if (!session.teacherAssignment.teacherUnresolved) return null;
  return makeRisk(session.id, '老师关联待确认', 'P1', '老师关联待确认');
}

function countStaffWeekSessions(
  sessions: StoreCourseSession[],
  staffId: string,
  anchorDateIso: string,
): number {
  const start = anchorDateIso;
  const endDate = new Date(`${anchorDateIso}T00:00:00`);
  endDate.setDate(endDate.getDate() + 6);
  const end = endDate.toISOString().slice(0, 10);
  return sessions.filter(
    s =>
      s.teacherAssignment.staffId === staffId &&
      s.sessionStatus !== '已取消' &&
      s.sessionStatus !== '已停课' &&
      s.dateIso >= start &&
      s.dateIso <= end,
  ).length;
}

export function recalculateSessionRisks(
  sessions: StoreCourseSession[],
  staffContext?: Map<string, StaffRiskContext>,
): SessionRisk[] {
  const anchorDate =
    sessions.map(s => s.dateIso).sort()[0] ?? '2026-07-27';
  const weekCounts = new Map<string, number>();
  for (const session of sessions) {
    const staffId = session.teacherAssignment.staffId;
    if (!staffId) continue;
    if (!weekCounts.has(staffId)) {
      const ctxCount = staffContext?.get(staffId)?.weekCount;
      weekCounts.set(
        staffId,
        ctxCount ?? countStaffWeekSessions(sessions, staffId, anchorDate),
      );
    }
  }

  const risks: SessionRisk[] = [];
  for (const session of sessions) {
    if (session.sessionStatus === '已取消' || session.sessionStatus === '已完成') {
      continue;
    }

    const gap = deriveTeacherGap(session);
    if (gap) risks.push(gap);

    const conflict = deriveTeacherConflict(sessions, session);
    if (conflict) risks.push(conflict);

    const leave = deriveApprovedLeaveImpact(session);
    if (leave) risks.push(leave);

    const unresolved = deriveTeacherUnresolved(session);
    if (unresolved) risks.push(unresolved);

    const staffId = session.teacherAssignment.staffId;
    if (staffId) {
      const ctx = staffContext?.get(staffId);
      const capabilityIds = ctx?.capabilityIds ?? [];
      const cap = deriveCapabilityMismatch(session, capabilityIds);
      if (cap && capabilityIds.length > 0) risks.push(cap);

      if (ctx) {
        const store = deriveStoreAuthorizationRisk(
          session,
          ctx.primaryStoreId,
          ctx.supportStoreIds,
        );
        if (store) risks.push(store);
      }

      const weekCount = weekCounts.get(staffId) ?? 0;
      const load = deriveWorkloadRisk(session, weekCount);
      if (load) risks.push(load);
    }
  }

  return risks.filter(r => (SESSION_RISK_TYPES as readonly string[]).includes(r.type));
}

export function projectWeekScheduleDays(
  sessions: StoreCourseSession[],
): WeekScheduleDayProjection[] {
  const grouped = new Map<string, WeekScheduleDayProjection>();

  for (const session of sessions) {
    const dayId = session.weekDayId ?? 'day-unknown';
    if (!grouped.has(dayId)) {
      grouped.set(dayId, {
        id: dayId,
        label: session.weekDayLabel ?? dayId,
        dateLabel: session.weekDateLabel ?? session.dateIso.slice(5).replace('-', '/'),
        dateIso: session.dateIso,
        sessions: [],
      });
    }
    grouped.get(dayId)!.sessions.push(session);
  }

  for (const day of grouped.values()) {
    day.sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  const ordered = WEEKDAY_ORDER.filter(id => grouped.has(id)).map(id => grouped.get(id)!);
  const extras = [...grouped.entries()]
    .filter(([id]) => !WEEKDAY_ORDER.includes(id as (typeof WEEKDAY_ORDER)[number]))
    .map(([, day]) => day)
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));

  return [...ordered, ...extras];
}

function mapAssignmentStatusToStaff(
  assignment: TeacherAssignment,
  riskTypes: SessionRiskType[],
): ScheduleAssignmentStatus {
  if (assignment.assignmentStatus === '已取消') return '已取消';
  if (assignment.assignmentStatus === '已替换') return '已替换';
  if (assignment.assignmentStatus === '待替代') return '待指定';
  if (assignment.assignmentStatus === '有冲突') return '有冲突';
  if (assignment.assignmentStatus === '待确认') return '待确认';
  if (assignment.assignmentStatus === '已确认') return '已确认';
  if (assignment.assignmentStatus === '待指定' || !assignment.staffId) return '待指定';
  return '已确认';
}

function mapRiskTags(risks: SessionRisk[], assignment: TeacherAssignment): string[] {
  const tags = new Set<string>();
  for (const risk of risks) {
    tags.add(risk.type);
  }
  if (assignment.assignmentStatus === '待替代') {
    tags.add('老师请假');
  }
  if (assignment.isSubstitute) {
    tags.add('代课');
  }
  if (!assignment.staffId || assignment.assignmentStatus === '待指定') {
    tags.add('缺老师');
  }
  return [...tags];
}

/** Stable Staff-facing assignment IDs for unified demo sessions (keeps V2.1 testids). */
const STABLE_ASSIGNMENT_IDS: Record<string, string> = {
  sess_today_pilates: 'sa-today-1',
  sess_today_yin: 'sa-today-2',
  sess_gap_evening_flow: 'sa-gap-1',
  sess_nora_leave: 'sa-leave-1',
  sess_conflict_a: 'sa-conflict-1',
  sess_conflict_b: 'sa-conflict-2',
  sess_wed_pilates: 'sa-week-1',
  sess_thu_restore: 'sa-week-2',
  sess_fri_flow: 'sa-week-3',
  sess_sat_pilates: 'sa-week-4',
};

export function projectionAssignmentId(sessionId: string): string {
  return STABLE_ASSIGNMENT_IDS[sessionId] ?? `sa-proj-${sessionId}`;
}

export function toScheduleAssignmentProjection(
  session: StoreCourseSession,
  risks: SessionRisk[] = [],
  ownerStaffId: string | null = 'staff_fangfang',
): ScheduleAssignmentProjection {
  const sessionRisks = risks.filter(r => r.sessionId === session.id && !r.resolved);
  const assignment = session.teacherAssignment;
  const riskTypes = sessionRisks.map(r => r.type);

  return {
    id: projectionAssignmentId(session.id),
    session: {
      sessionId: session.id,
      courseName: session.courseName,
      courseTypeId: session.courseTypeId,
      storeId: session.storeId,
      storeName: session.storeName,
      room: session.classroomName,
      dateIso: session.dateIso,
      startTime: session.startTime,
      endTime: session.endTime,
      requiredCapabilityIds: session.requiredCapabilityIds,
      bookedCount: session.bookingCount,
      capacity: session.capacity,
      prototypeAdapter: true,
    },
    staffId: assignment.staffId,
    status: mapAssignmentStatusToStaff(assignment, riskTypes),
    previousStaffId: assignment.previousStaffId,
    riskTags: mapRiskTags(sessionRisks, assignment),
    ownerStaffId,
    updatedAt: session.updatedAt,
    note: assignment.isSubstitute ? '代课' : session.note,
  };
}

export function buildDefaultStaffContext(
  sessions: StoreCourseSession[],
  overrides: Map<string, Partial<StaffRiskContext>> = new Map(),
): Map<string, StaffRiskContext> {
  const anchorDate = sessions.map(s => s.dateIso).sort()[0] ?? '2026-07-27';
  const map = new Map<string, StaffRiskContext>();
  for (const session of sessions) {
    const staffId = session.teacherAssignment.staffId;
    if (!staffId || map.has(staffId)) continue;
    const override = overrides.get(staffId);
    map.set(staffId, {
      capabilityIds: override?.capabilityIds ?? [],
      primaryStoreId: override?.primaryStoreId ?? session.storeId,
      supportStoreIds: override?.supportStoreIds ?? [],
      weekCount:
        override?.weekCount ?? countStaffWeekSessions(sessions, staffId, anchorDate),
    });
  }
  return map;
}
