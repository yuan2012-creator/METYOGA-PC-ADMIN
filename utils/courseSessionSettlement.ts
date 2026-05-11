import type {
  Attendance,
  Booking,
  Course,
  CourseSessionId,
  FinanceLedgerEntry,
  Member,
  MockCourseConsumptionRecord,
  MockTeacherSessionPayRecord,
} from '../types';
import type { CourseLibraryItem, ScheduleEvent } from './courseSelectors';
import { getCourseById, scheduleEventMatchesSessionId } from './courseSelectors';

export type CanCompleteCourseSessionResult =
  | { allowed: true }
  | { allowed: false; reason: string };

const appendNoteSegment = (existing: string | undefined, segment: string): string => {
  const base = (existing ?? '').trim();
  return base ? `${base}；${segment}` : segment;
};

const COMPLETION_NOTE =
  '【完课】已完成课程归档，生成耗课、老师课时与确认收入估算记录。（操作：运营管理员）';

const isPublishedEvent = (event: ScheduleEvent): boolean => (
  event.publishStatus === 'published' || event.status === 'published'
);

const isCanceledPath = (event: ScheduleEvent): boolean => (
  event.publishStatus === 'canceled'
  || event.status === 'cancelled'
  || event.sessionStatus === 'canceled'
);

/** 场次下是否存在有效到课签到（checked_in / attended / consumed） */
const hasValidAttendanceForSession = (
  event: ScheduleEvent,
  attendances: Attendance[],
): boolean => (
  attendances.some(
    a => scheduleEventMatchesSessionId(event, a.courseSessionId)
      && (a.status === 'checked_in' || a.status === 'attended' || a.status === 'consumed'),
  )
);

const isPastEnd = (event: ScheduleEvent, nowMs: number): boolean => {
  const t = new Date(event.endAt).getTime();
  return Number.isFinite(t) && nowMs >= t;
};

const lifecycleAllowsArchive = (event: ScheduleEvent, nowMs: number): boolean => {
  if (event.sessionStatus === 'ended' || event.sessionStatus === 'pending_completion') return true;
  return isPastEnd(event, nowMs);
};

const settlementAlreadyClosed = (event: ScheduleEvent): boolean => {
  const s = event.settlementStatus;
  return s === 'consumed' || s === 'teacher_pay_generated' || s === 'revenue_confirmed';
};

export const canCompleteCourseSession = (
  event: ScheduleEvent | null | undefined,
  attendances: Attendance[],
  _bookings: Booking[],
  nowMs: number = Date.now(),
): CanCompleteCourseSessionResult => {
  if (!event) {
    return { allowed: false, reason: '未找到排课场次，无法归档。' };
  }
  if (!isPublishedEvent(event)) {
    return { allowed: false, reason: '场次未发布，暂不可归档。' };
  }
  if (isCanceledPath(event)) {
    return { allowed: false, reason: '已取消场次不可归档。' };
  }
  const ex = event.exceptionStatus;
  if (ex != null && ex !== 'none') {
    return { allowed: false, reason: '存在未处理异常，暂不可归档。' };
  }
  if (settlementAlreadyClosed(event)) {
    return { allowed: false, reason: '结算已推进或已归档，无需重复操作。' };
  }
  if (event.status === 'completed') {
    return {
      allowed: false,
      reason: event.settlementStatus === 'revenue_confirmed' ? '该场次已完成归档。' : '该场次已标记完课。',
    };
  }
  if (!lifecycleAllowsArchive(event, nowMs)) {
    return { allowed: false, reason: '课程尚未结束或未进入待完课，暂不可归档。' };
  }
  if (!hasValidAttendanceForSession(event, attendances)) {
    return {
      allowed: false,
      reason: '缺少有效到课记录，暂不可归档。请先完成签到核验或异常处理。',
    };
  }
  return { allowed: true };
};

const teacherPayAmountForType = (courseType: Course['type'] | undefined): number => {
  switch (courseType) {
    case 'group':
      return 150;
    case 'small_group':
      return 180;
    case 'private':
      return 200;
    case 'ttc':
      return 300;
    default:
      return 150;
  }
};

const eventUnitPrice = (event: ScheduleEvent): number => {
  const p = (event as ScheduleEvent & { price?: number }).price;
  return typeof p === 'number' && Number.isFinite(p) && p > 0 ? p : 120;
};

export const buildMockConsumptionRecords = (
  event: ScheduleEvent,
  attendances: Attendance[],
  members?: Member[],
): { records: MockCourseConsumptionRecord[]; emptyReason?: string } => {
  const memberById = new Map((members ?? []).map(m => [m.id, m]));
  const unit = eventUnitPrice(event);
  const rows = attendances.filter(
    a => scheduleEventMatchesSessionId(event, a.courseSessionId)
      && (a.status === 'checked_in' || a.status === 'attended' || a.status === 'consumed'),
  );
  if (rows.length === 0) {
    return {
      records: [],
      emptyReason: '当前场次无已签到记录，未生成会员耗课估算行。',
    };
  }
  const now = new Date().toISOString();
  const records: MockCourseConsumptionRecord[] = rows.map((a, i) => {
    const m = memberById.get(a.memberId);
    return {
      id: `consumption-mock-${event.id}-${a.memberId}-${i}`,
      courseSessionId: event.id as CourseSessionId,
      memberId: a.memberId,
      memberName: m?.name,
      consumedAt: a.attendedAt ?? a.checkedInAt ?? now,
      note: '前端演示耗课估算，未扣减会员资产',
      amount: unit,
    };
  });
  return { records };
};

export const buildMockTeacherSessionPay = (
  event: ScheduleEvent,
  _attendances: Attendance[],
  courseType: Course['type'] | undefined,
): MockTeacherSessionPayRecord => {
  const amount = teacherPayAmountForType(courseType);
  const labelMap: Record<Course['type'], string> = {
    group: '团课',
    small_group: '小班',
    private: '私教',
    workshop: '工作坊',
    ttc: '教培',
  };
  return {
    id: `teacher-pay-mock-${event.id}-${Date.now()}`,
    courseSessionId: event.id as CourseSessionId,
    teacherName: typeof event.teacher === 'string' ? event.teacher : undefined,
    amount,
    courseTypeLabel: courseType ? labelMap[courseType] ?? '课程' : '课程',
  };
};

export const buildMockFinanceLedgerEntries = (
  event: ScheduleEvent,
  consumptionRecords: MockCourseConsumptionRecord[],
): FinanceLedgerEntry[] => {
  const unit = eventUnitPrice(event);
  const now = new Date().toISOString();
  if (consumptionRecords.length === 0) {
    return [];
  }
  return consumptionRecords.map((c, i) => ({
    id: `ledger-mock-${event.id}-${c.memberId ?? i}`,
    sourceType: 'course_consumption' as const,
    sourceId: c.id,
    memberId: c.memberId,
    amount: c.amount ?? unit,
    direction: 'income' as const,
    occurredAt: c.consumedAt ?? now,
    description: `确认收入估算 · ${c.memberName ?? '会员'} · 场次 ${event.name ?? event.title ?? ''}`.trim(),
    createdBy: '运营管理员',
    courseSessionId: event.id as CourseSessionId,
  }));
};

export type CompleteCourseSessionMockResult = {
  nextEvent: ScheduleEvent;
  consumptions: MockCourseConsumptionRecord[];
  teacherPay: MockTeacherSessionPayRecord | null;
  financeEntries: FinanceLedgerEntry[];
  summary: string;
};

export const completeCourseSessionMock = (
  event: ScheduleEvent,
  attendances: Attendance[],
  _bookings: Booking[],
  libraryList?: CourseLibraryItem[],
): CompleteCourseSessionMockResult => {
  const course = libraryList ? getCourseById(libraryList, event.courseId) : undefined;
  const { records: consumptions, emptyReason } = buildMockConsumptionRecords(event, attendances);
  const financeEntries = buildMockFinanceLedgerEntries(event, consumptions);
  const hasSettlementChain = consumptions.length > 0 && financeEntries.length > 0;
  const teacherPay = hasSettlementChain
    ? buildMockTeacherSessionPay(event, attendances, course?.type)
    : null;

  const nextEvent: ScheduleEvent = hasSettlementChain
    ? {
        ...event,
        status: 'completed',
        sessionStatus: 'completed',
        settlementStatus: 'revenue_confirmed',
        exceptionStatus: 'none',
        notes: appendNoteSegment(event.notes, COMPLETION_NOTE),
      }
    : { ...event };

  const summaryParts = hasSettlementChain && teacherPay
    ? [
        `已生成老师课时估算 ¥${teacherPay.amount}`,
        `已生成确认收入估算 ${financeEntries.length} 条`,
        `已生成会员耗课估算 ${consumptions.length} 条`,
      ]
    : [emptyReason ?? '未生成耗课与确认收入估算链路，场次未更新。'];
  return {
    nextEvent,
    consumptions,
    teacherPay,
    financeEntries,
    summary: summaryParts.join('；'),
  };
};
