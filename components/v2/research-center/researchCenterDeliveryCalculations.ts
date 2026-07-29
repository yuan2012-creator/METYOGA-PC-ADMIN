import { MOCK_TODAY_ISO } from './researchCenterOptions';
import type {
  AttendanceSheet,
  AttendanceStatus,
  CohortConfig,
  EnrollmentRecord,
  LeadRecord,
  LeaveRequest,
  LearningStatus,
  MakeupRecord,
  ScheduleItem,
  SessionStatus,
  TeachingRecord,
} from './researchCenterV2.viewModel';
import { computeScheduleSummary, formatCurrency } from './researchCenterCalculations';

export const COHORT_PROGRESS_NODES = [
  '招生中',
  '已锁班',
  '待开课',
  '进行中',
  '考试中',
  '待结业',
  '已结业',
] as const;

export type CohortProgressNode = (typeof COHORT_PROGRESS_NODES)[number];

const PRESENT_STATUSES: AttendanceStatus[] = ['已到', '迟到', '早退'];

export function filterSchedulesByCohort(schedules: ScheduleItem[], cohortId: string): ScheduleItem[] {
  return schedules.filter(s => (s.cohortId || '') === cohortId || !s.cohortId);
}

export function getActiveCohortStudents(
  enrollments: EnrollmentRecord[],
  cohortId: string,
): EnrollmentRecord[] {
  return enrollments.filter(e => e.cohortId === cohortId && e.joined && !e.refunded);
}

export function resolveCohortProgressNode(cohort: CohortConfig, schedules: ScheduleItem[]): CohortProgressNode {
  const status = cohort.status || '';
  if (status.includes('结业') || status === '已结业') return '已结业';
  if (status.includes('考试')) return '考试中';
  if (status.includes('进行')) return '进行中';
  if (status.includes('待开课') || status.includes('待开')) return '待开课';
  if (cohort.paidCount >= cohort.lockCount) return '已锁班';
  const hasExam = schedules.some(s => s.sessionType === '考试');
  if (hasExam && schedules.some(s => s.status === '进行中' || s.status === '已完成')) return '考试中';
  if (MOCK_TODAY_ISO >= cohort.startDate && MOCK_TODAY_ISO <= cohort.endDate) return '进行中';
  if (MOCK_TODAY_ISO < cohort.startDate && cohort.paidCount >= cohort.lockCount) return '待开课';
  return '招生中';
}

export function countCompletedSessions(schedules: ScheduleItem[]): number {
  return schedules.filter(s => s.status === '已完成').length;
}

export function countCompletedTeachingDays(schedules: ScheduleItem[]): number {
  const days = new Set(schedules.filter(s => s.status === '已完成').map(s => s.dateIso));
  return days.size;
}

export function deriveAverageAttendanceRate(
  attendances: AttendanceSheet[],
  cohortId: string,
): number | null {
  const sheets = attendances.filter(a => a.cohortId === cohortId);
  if (!sheets.length) return null;
  let present = 0;
  let expected = 0;
  for (const sheet of sheets) {
    for (const entry of sheet.entries) {
      expected += 1;
      if (PRESENT_STATUSES.includes(entry.status)) present += 1;
    }
  }
  if (expected === 0) return null;
  return Math.round((present / expected) * 1000) / 10;
}

export interface CohortOverviewMetrics {
  paidCount: number;
  totalReceipt: number;
  scheduledDays: number;
  completedSessions: number;
  averageAttendanceRate: number | null;
  pendingExceptions: number;
}

export interface DeliveryTodoItem {
  id: string;
  title: string;
  actionId: string;
  actionLabel: string;
  sessionId?: string;
  studentId?: string;
  leaveRequestId?: string;
}

export function buildCohortOverviewMetrics(
  cohort: CohortConfig,
  schedules: ScheduleItem[],
  attendances: AttendanceSheet[],
  leaveRequests: LeaveRequest[],
  makeupRecords: MakeupRecord[],
): CohortOverviewMetrics {
  const cohortSchedules = filterSchedulesByCohort(schedules, cohort.id);
  const summary = computeScheduleSummary(cohort, cohortSchedules);
  const pendingLeaves = leaveRequests.filter(
    l => l.cohortId === cohort.id && l.status === '已批准' && l.needMakeup && !l.makeupId,
  ).length;
  const pendingMakeups = makeupRecords.filter(
    m => m.cohortId === cohort.id && (m.status === '待安排' || m.status === '已安排'),
  ).length;
  const unsigned = cohortSchedules.filter(
    s =>
      s.status !== '已取消' &&
      s.status !== '草稿' &&
      !s.attendanceSaved &&
      s.dateIso <= MOCK_TODAY_ISO,
  ).length;
  const pendingDays = summary.pendingDays;
  return {
    paidCount: cohort.paidCount,
    totalReceipt: cohort.totalReceipt,
    scheduledDays: summary.scheduledDays,
    completedSessions: countCompletedSessions(cohortSchedules),
    averageAttendanceRate: deriveAverageAttendanceRate(attendances, cohort.id),
    pendingExceptions: pendingLeaves + pendingMakeups + unsigned + (pendingDays > 0 ? 1 : 0),
  };
}

export function buildTeachingProgress(cohort: CohortConfig, schedules: ScheduleItem[]) {
  const cohortSchedules = filterSchedulesByCohort(schedules, cohort.id).filter(s => s.status !== '已取消');
  const summary = computeScheduleSummary(cohort, cohortSchedules);
  const completedDays = countCompletedTeachingDays(cohortSchedules);
  const completedSessions = countCompletedSessions(cohortSchedules);
  const next = [...cohortSchedules]
    .filter(s => s.status !== '已完成' && s.status !== '已取消')
    .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`))[0];
  return {
    plannedDays: summary.plannedDays,
    scheduledDays: summary.scheduledDays,
    completedDays,
    sessionCount: summary.sessionCount,
    completedSessions,
    pendingDays: summary.pendingDays,
    nextSession: next ?? null,
  };
}

export function buildDeliveryTodos(params: {
  cohort: CohortConfig;
  schedules: ScheduleItem[];
  attendances: AttendanceSheet[];
  leaveRequests: LeaveRequest[];
  makeupRecords: MakeupRecord[];
  teachingRecords: TeachingRecord[];
}): DeliveryTodoItem[] {
  const { cohort, schedules, leaveRequests, makeupRecords, teachingRecords } = params;
  const cohortSchedules = filterSchedulesByCohort(schedules, cohort.id);
  const todos: DeliveryTodoItem[] = [];
  const lockGap = Math.max(0, cohort.lockCount - cohort.paidCount);
  if (lockGap > 0) {
    todos.push({
      id: `todo-lock-${cohort.id}`,
      title: `距锁班还差${lockGap}人`,
      actionId: 'add-student',
      actionLabel: '添加学员',
    });
  }
  const summary = computeScheduleSummary(cohort, cohortSchedules);
  if (summary.pendingDays > 0) {
    todos.push({
      id: `todo-pending-days-${cohort.id}`,
      title: `${summary.pendingDays}个教学日尚未安排课程`,
      actionId: 'add-session',
      actionLabel: '添加课程',
    });
  }
  for (const s of cohortSchedules) {
    if (!s.teacher || s.teacher === '—') {
      if (s.sessionType !== '自习') {
        todos.push({
          id: `todo-teacher-${s.id}`,
          title: `${s.date} ${s.content} 导师尚未确认`,
          actionId: 'change-teacher',
          actionLabel: '更换导师',
          sessionId: s.id,
        });
      }
    }
    if (!s.attendanceSaved && s.status !== '已取消' && s.status !== '草稿' && s.status !== '已完成') {
      if (['待上课', '已发布', '进行中', '待确认'].includes(s.status)) {
        todos.push({
          id: `todo-attend-${s.id}`,
          title: `${s.date} ${s.content} 签到尚未完成`,
          actionId: 'record-attendance',
          actionLabel: '记录签到',
          sessionId: s.id,
        });
      }
    }
    if (s.attendanceSaved && !teachingRecords.some(t => t.sessionId === s.id) && s.status !== '已完成') {
      todos.push({
        id: `todo-teach-${s.id}`,
        title: `${s.date} ${s.content} 待完成教学记录`,
        actionId: 'teaching-record',
        actionLabel: '填写教学记录',
        sessionId: s.id,
      });
    }
  }
  for (const leave of leaveRequests.filter(l => l.cohortId === cohort.id && l.status === '已批准' && l.needMakeup)) {
    const makeup = makeupRecords.find(m => m.id === leave.makeupId || (m.leaveRequestId === leave.id && m.status !== '已取消'));
    if (!makeup) {
      todos.push({
        id: `todo-leave-makeup-${leave.id}`,
        title: `请假后尚未安排补课`,
        actionId: 'arrange-makeup',
        actionLabel: '安排补课',
        studentId: leave.studentId,
        leaveRequestId: leave.id,
        sessionId: leave.sessionId,
      });
    } else if (makeup.status === '已安排' || makeup.status === '待安排') {
      todos.push({
        id: `todo-makeup-${makeup.id}`,
        title: `补课已安排待完成`,
        actionId: 'complete-makeup',
        actionLabel: '标记完成',
        studentId: makeup.studentId,
        leaveRequestId: leave.id,
        sessionId: makeup.sessionId,
      });
    }
  }
  // de-dupe by id
  const seen = new Set<string>();
  return todos.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export interface StudentDeliveryRow {
  enrollment: EnrollmentRecord;
  lead: LeadRecord | null;
  presentCount: number;
  leaveCount: number;
  absentCount: number;
  attendanceRate: number | null;
  learningStatus: LearningStatus;
  nextAction: string;
}

export function buildStudentDeliveryRows(
  enrollments: EnrollmentRecord[],
  leads: LeadRecord[],
  cohortId: string,
  attendances: AttendanceSheet[],
  leaveRequests: LeaveRequest[],
  makeupRecords: MakeupRecord[],
): StudentDeliveryRow[] {
  const cohortEnrollments = enrollments.filter(e => e.cohortId === cohortId);
  return cohortEnrollments.map(enrollment => {
    const lead = leads.find(l => l.id === enrollment.leadId) ?? null;
    let presentCount = 0;
    let leaveCount = 0;
    let absentCount = 0;
    for (const sheet of attendances.filter(a => a.cohortId === cohortId)) {
      const entry = sheet.entries.find(e => e.studentId === enrollment.id);
      if (!entry) continue;
      if (PRESENT_STATUSES.includes(entry.status)) presentCount += 1;
      else if (entry.status === '请假') leaveCount += 1;
      else if (entry.status === '缺勤') absentCount += 1;
    }
    const approvedLeaves = leaveRequests.filter(
      l => l.studentId === enrollment.id && l.status === '已批准',
    );
    leaveCount = Math.max(leaveCount, approvedLeaves.length);
    const totalMarked = presentCount + leaveCount + absentCount;
    const attendanceRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 1000) / 10 : null;
    const pendingMakeup = makeupRecords.some(
      m => m.studentId === enrollment.id && (m.status === '待安排' || m.status === '已安排'),
    );
    let learningStatus: LearningStatus = '正常';
    if (enrollment.refunded || !enrollment.joined) learningStatus = '已退出';
    else if (pendingMakeup) learningStatus = '补课中';
    else if (absentCount >= 2) learningStatus = '缺勤异常';
    else if (approvedLeaves.some(l => !l.makeupId || makeupRecords.some(m => m.leaveRequestId === l.id && m.status !== '已完成'))) {
      learningStatus = '请假中';
    }
    const unpaid = Math.max(0, enrollment.dealPrice - enrollment.paidAmount);
    let nextAction = '查看档案';
    if (learningStatus === '请假中') nextAction = '安排补课';
    else if (learningStatus === '缺勤异常') nextAction = '跟进缺勤';
    else if (unpaid > 0) nextAction = '录入收款';
    else if (enrollment.contractStatus !== '已签约') nextAction = '跟进合同';
    return {
      enrollment,
      lead,
      presentCount,
      leaveCount,
      absentCount,
      attendanceRate,
      learningStatus,
      nextAction,
    };
  });
}

export function formatAttendanceRate(rate: number | null): string {
  if (rate == null) return '—';
  return `${rate}%`;
}

export function formatReceiptLabel(amount: number): string {
  return formatCurrency(amount);
}

export function canCompleteSession(params: {
  session: ScheduleItem;
  attendance?: AttendanceSheet | null;
  teaching?: TeachingRecord | null;
}): { ok: boolean; error?: string } {
  const { session, attendance, teaching } = params;
  if (!attendance && !session.attendanceSaved) {
    return { ok: false, error: '请先保存签到记录' };
  }
  if (!teaching || !teaching.completionStatus?.trim()) {
    return { ok: false, error: '请先填写教学完成情况' };
  }
  const hasException = Boolean(
    attendance?.entries.some(e => e.status === '缺勤' || e.status === '请假') ||
      session.absentCount ||
      session.leaveCount,
  );
  if (hasException && !teaching.anomalyNote?.trim()) {
    return { ok: false, error: '存在异常时请填写异常说明' };
  }
  return { ok: true };
}

export function nextSessionStatusAfterAttendance(current: SessionStatus): SessionStatus {
  if (current === '已完成' || current === '已取消') return current;
  return '进行中';
}

export function groupSchedulesByDate(schedules: ScheduleItem[]): [string, ScheduleItem[]][] {
  const map = new Map<string, ScheduleItem[]>();
  [...schedules]
    .filter(s => s.status !== '已取消')
    .sort((a, b) => `${a.dateIso}${a.startTime}`.localeCompare(`${b.dateIso}${b.startTime}`))
    .forEach(item => {
      const list = map.get(item.dateIso) ?? [];
      list.push(item);
      map.set(item.dateIso, list);
    });
  return [...map.entries()];
}

export function dayIndexLabel(cohort: CohortConfig, dateIso: string): string {
  const start = new Date(`${cohort.startDate}T00:00:00`);
  const cur = new Date(`${dateIso}T00:00:00`);
  const diff = Math.floor((cur.getTime() - start.getTime()) / 86400000) + 1;
  return `第${Math.max(1, diff)}天`;
}
