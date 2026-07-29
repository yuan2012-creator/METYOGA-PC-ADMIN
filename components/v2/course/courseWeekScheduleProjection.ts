import type { SessionRisk, StoreCourseSession } from './domain/types';
import type {
  WeekScheduleRiskType,
  WeekScheduleSessionCard,
  WeekScheduleStatus,
} from './courseSecondaryWeekSchedule.viewModel';

const STATUS_LABELS: Record<WeekScheduleStatus, string> = {
  draft: '草稿',
  scheduled: '已排',
  openForBooking: '开放预约',
  full: '已满员',
  lowAttendance: '低满班',
  waitlist: '候补中',
  completed: '已完成',
  cancelledMock: '已取消',
  teacherLeaveRisk: '老师请假风险',
  conflictWarning: '冲突预警',
};

const RISK_TYPE_MAP: Partial<Record<string, WeekScheduleRiskType>> = {
  缺老师: 'teacherConflict',
  时间冲突: 'teacherConflict',
  能力不匹配: 'teacherLeave',
  门店无授权: 'teacherLeave',
  负荷过高: 'overLoad',
  请假影响: 'teacherLeave',
  教室冲突: 'roomConflict',
  老师关联待确认: 'teacherLeave',
};

function deriveWeekScheduleStatus(session: StoreCourseSession, risks: SessionRisk[]): WeekScheduleStatus {
  if (session.sessionStatus === '已完成') return 'completed';
  if (session.sessionStatus === '已取消') return 'cancelledMock';
  if (session.sessionStatus === '已改期') return 'scheduled';
  if (session.bookingStatus === '已满员' && session.waitlistCount > 0) return 'waitlist';
  if (session.bookingStatus === '已满员') return 'full';
  if (session.teacherAssignment.assignmentStatus === '待替代') return 'teacherLeaveRisk';
  if (risks.some(r => r.type === '时间冲突')) return 'conflictWarning';
  if (risks.some(r => r.type === '请假影响')) return 'teacherLeaveRisk';
  if (session.bookingCount > 0 && session.bookingCount / session.capacity < 0.5) return 'lowAttendance';
  if (session.bookingStatus === '可预约' && session.bookingCount >= session.capacity * 0.7) {
    return 'openForBooking';
  }
  return 'scheduled';
}

function buildRiskTags(session: StoreCourseSession, risks: SessionRisk[]): string[] {
  const tags = new Set<string>();
  for (const risk of risks) {
    if (!risk.resolved) tags.add(risk.type);
  }
  const assignment = session.teacherAssignment;
  if (assignment.assignmentStatus === '待指定' || !assignment.staffId) {
    tags.add('缺老师');
  }
  if (assignment.assignmentStatus === '待替代') {
    tags.add('待替代');
  }
  if (assignment.isSubstitute) {
    tags.add('代课');
  }
  if (session.originalStartAt) {
    tags.add('改期');
  }
  if (session.bookingCount > 0 && session.bookingCount / session.capacity < 0.5) {
    tags.add('低满班');
  }
  if (session.waitlistCount > 0) {
    tags.add('候补');
  }
  return [...tags];
}

function buildRiskTypes(risks: SessionRisk[]): WeekScheduleRiskType[] {
  const types = new Set<WeekScheduleRiskType>();
  for (const risk of risks) {
    const mapped = RISK_TYPE_MAP[risk.type];
    if (mapped) types.add(mapped);
  }
  return [...types];
}

function buildSuggestedAction(session: StoreCourseSession, risks: SessionRisk[]): string {
  if (!session.teacherAssignment.staffId || session.teacherAssignment.assignmentStatus === '待指定') {
    return '指定授课老师';
  }
  if (session.teacherAssignment.assignmentStatus === '待替代') {
    return '安排代课或替换老师';
  }
  const p0 = risks.find(r => r.severity === 'P0' && !r.resolved);
  if (p0) return p0.message;
  if (session.bookingCount / session.capacity < 0.5) return '复核时间或课程主题';
  return '正常开放名单';
}

function resolveTeacherName(
  session: StoreCourseSession,
  staffNameMap: Map<string, string>,
): { teacherId: string; teacherName: string } {
  const assignment = session.teacherAssignment;
  if (assignment.teacherUnresolved || (!assignment.staffId && assignment.unresolvedTeacherHint)) {
    const legacy = session.legacyIds.find(id => id.startsWith('t-')) ?? 'unresolved';
    return { teacherId: legacy, teacherName: '老师关联待确认' };
  }
  if (assignment.staffId) {
    return {
      teacherId: assignment.staffId,
      teacherName: staffNameMap.get(assignment.staffId) ?? '老师关联待确认',
    };
  }
  return { teacherId: 'none', teacherName: '老师关联待确认' };
}

export function projectSessionToWeekCard(
  session: StoreCourseSession,
  risks: SessionRisk[],
  staffNameMap: Map<string, string>,
): WeekScheduleSessionCard {
  const sessionRisks = risks.filter(r => r.sessionId === session.id && !r.resolved);
  const status = deriveWeekScheduleStatus(session, sessionRisks);
  const { teacherId, teacherName } = resolveTeacherName(session, staffNameMap);
  const assignment = session.teacherAssignment;
  const hasConflict = sessionRisks.some(r => r.type === '时间冲突');

  return {
    sessionId: session.id,
    detailKey: session.id,
    courseName: session.courseName,
    courseType: session.courseType,
    storeName: session.storeName,
    teacherId,
    teacherName,
    room: session.classroomName,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMinutes: session.durationMinutes,
    capacity: session.capacity,
    bookedCount: session.bookingCount,
    waitlistCount: session.waitlistCount,
    checkedInCount: session.checkedInCount,
    pointCost: session.pointCost,
    status,
    statusLabel: session.sessionStatus,
    riskTags: buildRiskTags(session, sessionRisks),
    attendanceRisk: status === 'lowAttendance',
    teacherAvailability:
      assignment.assignmentStatus === '待替代'
        ? '待替代'
        : assignment.isSubstitute
          ? '代课中'
          : assignment.staffId
            ? '可排'
            : '待指定',
    conflictStatus: hasConflict ? '冲突预警' : '通过',
    suggestedAction: buildSuggestedAction(session, sessionRisks),
    riskTypes: buildRiskTypes(sessionRisks),
    assignmentStatus: assignment.assignmentStatus,
    isSubstitute: assignment.isSubstitute,
    hasReschedule: Boolean(session.originalStartAt),
    staffId: assignment.staffId,
    previousStaffId: assignment.previousStaffId ?? null,
    needsStaffAction: sessionRisks.some(
      r =>
        r.type === '缺老师' ||
        r.type === '时间冲突' ||
        r.type === '请假影响' ||
        r.type === '能力不匹配',
    ),
  };
}

export function getWeekScheduleStatusLabel(status: WeekScheduleStatus): string {
  return STATUS_LABELS[status] ?? status;
}
