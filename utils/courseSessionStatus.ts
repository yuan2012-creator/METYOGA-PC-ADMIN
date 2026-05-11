import type {
  Attendance,
  Booking,
  CourseSession,
  CourseSessionBookingStatus,
  CourseSessionExceptionStatus,
  CourseSessionLifecycleStatus,
  CourseSessionPublishStatus,
  CourseSessionSettlementStatus,
  CourseSessionStatus,
} from '../types';

export type DisplayTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export type CourseSessionStatusInput = {
  session: CourseSession;
  bookings: Booking[];
  attendances: Attendance[];
  now?: Date;
};

export type CourseSessionDisplayStatus = {
  key: string;
  label: string;
  tone: DisplayTone;
  priority: number;
  description?: string;
};

export type CourseSessionStatusMeta = {
  publishStatusLabel: string;
  bookingStatusLabel: string;
  sessionStatusLabel: string;
  exceptionStatusLabel: string;
  settlementStatusLabel: string;
};

type Resolved = {
  publish: CourseSessionPublishStatus;
  booking: CourseSessionBookingStatus;
  lifecycle: CourseSessionLifecycleStatus;
  exception: CourseSessionExceptionStatus;
  settlement: CourseSessionSettlementStatus;
  startMs: number;
  endMs: number;
};

const countLateCancel = (sessionId: string, bookings: Booking[]): number => (
  bookings.filter(b => b.courseSessionId === sessionId && b.status === 'late_cancelled').length
);

const countActiveBookings = (sessionId: string, bookings: Booking[]): number => (
  bookings.filter(b => (
    b.courseSessionId === sessionId
    && b.status !== 'cancelled'
    && b.status !== 'late_cancelled'
  )).length
);

const bounds = (s: CourseSession): { startMs: number; endMs: number } => {
  const startMs = new Date(s.startAt).getTime();
  const endMs = new Date(s.endAt).getTime();
  return { startMs, endMs };
};

const resolvePublish = (s: CourseSession): CourseSessionPublishStatus => {
  if (s.publishStatus) return s.publishStatus;
  const st = s.status as CourseSessionStatus;
  if (st === 'draft') return 'draft';
  if (st === 'cancelled') return 'canceled';
  return 'published';
};

const resolveException = (
  s: CourseSession,
  bookings: Booking[],
  attendances: Attendance[],
): CourseSessionExceptionStatus => {
  if (s.exceptionStatus) return s.exceptionStatus;
  if (countLateCancel(s.id, bookings) > 0) return 'late_cancel';
  if (attendances.some(a => a.courseSessionId === s.id && a.status === 'absent')) return 'attendance_conflict';
  if (s.notes?.includes('代课')) return 'substitute_pending';
  return 'none';
};

const resolveSettlement = (s: CourseSession): CourseSessionSettlementStatus => {
  if (s.settlementStatus) return s.settlementStatus;
  if (s.status === 'completed') return 'consumed';
  return 'not_started';
};

const resolveLifecycle = (s: CourseSession, nowMs: number): CourseSessionLifecycleStatus => {
  if (s.sessionStatus) return s.sessionStatus;
  const st = s.status as CourseSessionStatus;
  const { startMs, endMs } = bounds(s);

  if (st === 'cancelled') return 'canceled';
  if (st === 'completed') return 'completed';
  if (st === 'rescheduled') return 'rescheduled';
  if (s.notes?.includes('代课')) return 'substitute';

  if (st === 'in_progress') {
    if (nowMs > endMs) return 'pending_completion';
    return 'in_progress';
  }

  if (st === 'draft') return 'upcoming';

  if (nowMs >= endMs && (st === 'published' || st === 'scheduled')) {
    return 'ended';
  }

  if (nowMs >= startMs && nowMs < endMs && (st === 'published' || st === 'scheduled')) {
    return 'in_progress';
  }

  return 'upcoming';
};

const resolveBooking = (
  s: CourseSession,
  bookings: Booking[],
  publish: CourseSessionPublishStatus,
): CourseSessionBookingStatus => {
  if (s.bookingStatus) return s.bookingStatus;
  if (publish === 'canceled' || publish === 'draft' || publish === 'unpublished') return 'not_open';
  const enrolled = s.bookedCount ?? countActiveBookings(s.id, bookings);
  if (enrolled >= s.capacity) return 'full';
  if (publish === 'published') return 'bookable';
  return 'not_open';
};

const resolveAll = (input: CourseSessionStatusInput): Resolved => {
  const nowMs = (input.now ?? new Date()).getTime();
  const { startMs, endMs } = bounds(input.session);
  const publish = resolvePublish(input.session);
  const exception = resolveException(input.session, input.bookings, input.attendances);
  const settlement = resolveSettlement(input.session);
  const lifecycle = resolveLifecycle(input.session, nowMs);
  const booking = resolveBooking(input.session, input.bookings, publish);

  return {
    publish,
    booking,
    lifecycle,
    exception,
    settlement,
    startMs,
    endMs,
  };
};

const PUBLISH_LABEL: Record<CourseSessionPublishStatus, string> = {
  draft: '草稿',
  published: '已发布',
  unpublished: '已下架',
  canceled: '已取消',
};

const BOOKING_LABEL: Record<CourseSessionBookingStatus, string> = {
  not_open: '未开放预约',
  bookable: '可预约',
  full: '已满员',
  closed: '预约截止',
  suspended: '暂停预约',
};

const LIFECYCLE_LABEL: Record<CourseSessionLifecycleStatus, string> = {
  upcoming: '未开始',
  in_progress: '进行中',
  ended: '已结束',
  pending_completion: '待完课',
  completed: '已完课',
  canceled: '已取消',
  rescheduled: '已调课',
  substitute: '代课中',
  exception_pending: '异常待处理',
};

const EXCEPTION_LABEL: Record<CourseSessionExceptionStatus, string> = {
  none: '无异常',
  booking_low: '预约不足',
  teacher_absent: '老师未到岗',
  attendance_conflict: '签到异常',
  late_cancel: '迟取消异常',
  no_show: '爽约异常',
  room_conflict: '教室冲突',
  teacher_conflict: '老师冲突',
  reschedule_pending: '调课待确认',
  substitute_pending: '代课待确认',
  cancel_pending: '取消待处理',
};

const SETTLEMENT_LABEL: Record<CourseSessionSettlementStatus, string> = {
  not_started: '未开始结算',
  pending: '待结算',
  consumed: '已耗课',
  teacher_pay_generated: '已生成老师课时',
  revenue_confirmed: '已确认收入',
  exception_hold: '异常挂起',
};

export const getCourseSessionStatusMeta = (input: CourseSessionStatusInput): CourseSessionStatusMeta => {
  const r = resolveAll(input);
  return {
    publishStatusLabel: PUBLISH_LABEL[r.publish],
    bookingStatusLabel: BOOKING_LABEL[r.booking],
    sessionStatusLabel: LIFECYCLE_LABEL[r.lifecycle],
    exceptionStatusLabel: EXCEPTION_LABEL[r.exception],
    settlementStatusLabel: SETTLEMENT_LABEL[r.settlement],
  };
};

export const getCourseSessionStatusTone = (statusKey: string): DisplayTone => {
  switch (statusKey) {
    case 'canceled':
    case 'exception_pending':
      return 'danger';
    case 'rescheduled':
    case 'substitute':
    case 'pending_completion':
    case 'booking_closed':
      return 'warning';
    case 'completed':
    case 'in_progress':
    case 'bookable':
      return 'success';
    case 'draft':
    case 'upcoming':
    case 'ended':
    case 'full':
      return 'neutral';
    default:
      return 'info';
  }
};

export const getCourseSessionToneBadgeClass = (tone: DisplayTone): string => {
  switch (tone) {
    case 'danger':
      return 'border border-rose-100 bg-rose-50/90 text-rose-800';
    case 'warning':
      return 'border border-amber-100 bg-amber-50/90 text-amber-900';
    case 'success':
      return 'border border-emerald-100 bg-emerald-50/90 text-emerald-900';
    case 'info':
      return 'border border-sky-100 bg-sky-50/80 text-sky-900';
    default:
      return 'border border-gray-200 bg-gray-50 text-gray-700';
  }
};

export const getCourseSessionDisplayStatus = (input: CourseSessionStatusInput): CourseSessionDisplayStatus => {
  const r = resolveAll(input);
  const nowMs = (input.now ?? new Date()).getTime();

  const pick = (
    key: string,
    label: string,
    tone: DisplayTone,
    priority: number,
    description?: string,
  ): CourseSessionDisplayStatus => ({ key, label, tone, priority, description });

  if (r.publish === 'canceled' || r.lifecycle === 'canceled') {
    return pick('canceled', '已取消', 'danger', 1);
  }
  if (r.exception !== 'none') {
    return pick('exception_pending', '异常待处理', 'danger', 2, EXCEPTION_LABEL[r.exception]);
  }
  if (r.lifecycle === 'rescheduled') {
    return pick('rescheduled', '已调课', 'warning', 3);
  }
  if (r.lifecycle === 'substitute') {
    return pick('substitute', '代课中', 'warning', 4);
  }
  if (r.lifecycle === 'completed') {
    return pick('completed', '已完课', 'success', 5);
  }
  if (r.lifecycle === 'pending_completion') {
    return pick('pending_completion', '待完课', 'warning', 6);
  }
  if (r.lifecycle === 'ended') {
    return pick('ended', '已结束', 'neutral', 7);
  }
  if (r.lifecycle === 'in_progress' || (nowMs >= r.startMs && nowMs < r.endMs)) {
    return pick('in_progress', '进行中', 'success', 8);
  }
  if (r.booking === 'full') {
    return pick('full', '已满员', 'neutral', 9);
  }
  if (r.booking === 'closed') {
    return pick('booking_closed', '预约截止', 'warning', 10);
  }
  if (r.booking === 'bookable') {
    return pick('bookable', '可预约', 'success', 11);
  }
  if (r.publish === 'draft') {
    return pick('draft', '草稿', 'neutral', 12);
  }
  return pick('upcoming', '未开始', 'neutral', 13);
};
