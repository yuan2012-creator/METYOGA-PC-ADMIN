/**
 * 课程运营域 adapter：snake_case → camelCase；mock 安全兜底；不修改入参对象、无副作用。
 */

import type {
  Attendance,
  AttendanceStatus,
  Booking,
  BookingStatus,
  Course,
  CourseSession,
  CourseSessionBookingStatus,
  CourseSessionExceptionStatus,
  CourseSessionLifecycleStatus,
  CourseSessionPublishStatus,
  CourseSessionSettlementStatus,
  CourseSessionStatus,
  MockCourseConsumptionRecord,
} from '../types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pickStr(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v;
  return fallback;
}

function pickNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

const COURSE_TYPES: Course['type'][] = ['group', 'small_group', 'private', 'workshop', 'ttc'];
function pickCourseType(v: unknown): Course['type'] {
  return typeof v === 'string' && COURSE_TYPES.includes(v as Course['type']) ? (v as Course['type']) : 'group';
}

const SESSION_STATUSES: CourseSessionStatus[] = [
  'draft',
  'scheduled',
  'published',
  'in_progress',
  'completed',
  'cancelled',
  'rescheduled',
];
function pickSessionStatus(v: unknown): CourseSessionStatus {
  return typeof v === 'string' && SESSION_STATUSES.includes(v as CourseSessionStatus)
    ? (v as CourseSessionStatus)
    : 'draft';
}

function pickOptionalEnum<T extends string>(v: unknown, allowed: readonly T[], fallback: T | undefined): T | undefined {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

const BOOKING_STATUSES: BookingStatus[] = ['booked', 'waitlisted', 'cancelled', 'late_cancelled', 'no_show'];
function pickBookingStatus(v: unknown): BookingStatus {
  return typeof v === 'string' && BOOKING_STATUSES.includes(v as BookingStatus) ? (v as BookingStatus) : 'booked';
}

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'pending_checkin',
  'checked_in',
  'attended',
  'consumed',
  'absent',
];
function pickAttendanceStatus(v: unknown): AttendanceStatus {
  return typeof v === 'string' && ATTENDANCE_STATUSES.includes(v as AttendanceStatus)
    ? (v as AttendanceStatus)
    : 'pending_checkin';
}

const COURSE_KEY_MAP: Record<string, string> = {
  duration_minutes: 'durationMinutes',
};

const SESSION_KEY_MAP: Record<string, string> = {
  course_id: 'courseId',
  store_id: 'storeId',
  room_id: 'roomId',
  teacher_id: 'teacherId',
  teacher_name: 'teacherName',
  start_at: 'startAt',
  end_at: 'endAt',
  booked_count: 'bookedCount',
  waitlist_count: 'waitlistCount',
  publish_status: 'publishStatus',
  booking_status: 'bookingStatus',
  session_status: 'sessionStatus',
  exception_status: 'exceptionStatus',
  settlement_status: 'settlementStatus',
};

const BOOKING_KEY_MAP: Record<string, string> = {
  member_id: 'memberId',
  course_session_id: 'courseSessionId',
  booked_at: 'bookedAt',
  cancelled_at: 'cancelledAt',
  cancel_reason: 'cancelReason',
};

const ATTENDANCE_KEY_MAP: Record<string, string> = {
  member_id: 'memberId',
  course_session_id: 'courseSessionId',
  booking_id: 'bookingId',
  member_asset_id: 'memberAssetId',
  checked_in_at: 'checkedInAt',
  attended_at: 'attendedAt',
  consumed_at: 'consumedAt',
};

const CONSUMPTION_KEY_MAP: Record<string, string> = {
  course_session_id: 'courseSessionId',
  member_id: 'memberId',
  member_name: 'memberName',
  course_title: 'courseTitle',
  consumed_at: 'consumedAt',
};

function normalizeKeys(raw: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const [snake, camel] of Object.entries(map)) {
    if (snake in out && !(camel in out)) {
      out[camel] = out[snake];
    }
  }
  return out;
}

export function adaptCourse(raw: unknown): Course {
  if (!isRecord(raw)) {
    return {
      id: '',
      name: '—',
      type: 'group',
      durationMinutes: 0,
    };
  }
  const n = normalizeKeys(raw, COURSE_KEY_MAP) as Partial<Course>;
  return {
    id: pickStr(n.id, ''),
    name: pickStr(n.name, '—'),
    type: pickCourseType(n.type),
    durationMinutes: pickNum(n.durationMinutes, 0),
    category: n.category,
    description: n.description,
    difficulty: pickOptionalEnum<Course['difficulty']>(
      n.difficulty,
      ['beginner', 'intermediate', 'advanced', 'all_levels'],
      undefined
    ),
    status: pickOptionalEnum<NonNullable<Course['status']>>(n.status, ['active', 'inactive'], undefined),
  };
}

export function adaptCourses(rawList: unknown): Course[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptCourse);
}

export function adaptCourseSession(raw: unknown): CourseSession {
  if (!isRecord(raw)) {
    return {
      id: '',
      courseId: '',
      status: 'draft',
      startAt: '',
      endAt: '',
      capacity: 0,
    };
  }
  const n = raw;
  return {
    id: pickStr(n.id, ''),
    courseId: pickStr(n.courseId, ''),
    status: pickSessionStatus(n.status),
    title: n.title,
    storeId: n.storeId,
    roomId: n.roomId,
    teacherId: n.teacherId,
    teacherName: n.teacherName,
    startAt: pickStr(n.startAt, ''),
    endAt: pickStr(n.endAt, ''),
    capacity: pickNum(n.capacity, 0),
    bookedCount: n.bookedCount,
    waitlistCount: n.waitlistCount,
    notes: n.notes,
    price: n.price,
    publishStatus: pickOptionalEnum<CourseSessionPublishStatus>(
      n.publishStatus,
      ['draft', 'published', 'unpublished', 'canceled'],
      undefined
    ),
    bookingStatus: pickOptionalEnum<CourseSessionBookingStatus>(
      n.bookingStatus,
      ['not_open', 'bookable', 'full', 'closed', 'suspended'],
      undefined
    ),
    sessionStatus: pickOptionalEnum<CourseSessionLifecycleStatus>(
      n.sessionStatus,
      [
        'upcoming',
        'in_progress',
        'ended',
        'pending_completion',
        'completed',
        'canceled',
        'rescheduled',
        'substitute',
        'exception_pending',
      ],
      undefined
    ),
    exceptionStatus: pickOptionalEnum<CourseSessionExceptionStatus>(
      n.exceptionStatus,
      [
        'none',
        'booking_low',
        'teacher_absent',
        'attendance_conflict',
        'late_cancel',
        'no_show',
        'room_conflict',
        'teacher_conflict',
        'reschedule_pending',
        'substitute_pending',
        'cancel_pending',
      ],
      undefined
    ),
    settlementStatus: pickOptionalEnum<CourseSessionSettlementStatus>(
      n.settlementStatus,
      ['not_started', 'pending', 'consumed', 'teacher_pay_generated', 'revenue_confirmed', 'exception_hold'],
      undefined
    ),
  };
}

export function adaptCourseSessions(rawList: unknown): CourseSession[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptCourseSession);
}

function pickBookingSource(v: unknown): Booking['source'] | undefined {
  const a: NonNullable<Booking['source']>[] = ['admin', 'front_desk', 'member_app', 'system'];
  return typeof v === 'string' && a.includes(v as NonNullable<Booking['source']>) ? (v as Booking['source']) : undefined;
}

export function adaptBooking(raw: unknown): Booking {
  if (!isRecord(raw)) {
    return {
      id: '',
      memberId: '',
      courseSessionId: '',
      status: 'booked',
      bookedAt: '',
    };
  }
  const n = normalizeKeys(raw, BOOKING_KEY_MAP) as Partial<Booking>;
  return {
    id: pickStr(n.id, ''),
    memberId: pickStr(n.memberId, ''),
    courseSessionId: pickStr(n.courseSessionId, ''),
    status: pickBookingStatus(n.status),
    bookedAt: pickStr(n.bookedAt, ''),
    source: pickBookingSource(n.source),
    cancelledAt: n.cancelledAt,
    cancelReason: n.cancelReason,
  };
}

export function adaptBookings(rawList: unknown): Booking[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptBooking);
}

export function adaptAttendance(raw: unknown): Attendance {
  if (!isRecord(raw)) {
    return {
      id: '',
      memberId: '',
      courseSessionId: '',
      status: 'pending_checkin',
    };
  }
  const n = normalizeKeys(raw, ATTENDANCE_KEY_MAP) as Partial<Attendance>;
  return {
    id: pickStr(n.id, ''),
    memberId: pickStr(n.memberId, ''),
    courseSessionId: pickStr(n.courseSessionId, ''),
    status: pickAttendanceStatus(n.status),
    bookingId: n.bookingId,
    memberAssetId: n.memberAssetId,
    checkedInAt: n.checkedInAt,
    attendedAt: n.attendedAt,
    consumedAt: n.consumedAt,
    notes: n.notes,
  };
}

export function adaptAttendances(rawList: unknown): Attendance[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptAttendance);
}

export function adaptConsumption(raw: unknown): MockCourseConsumptionRecord {
  if (!isRecord(raw)) {
    return {
      id: '',
      courseSessionId: '',
      memberId: '',
      consumedAt: '',
    };
  }
  const n = normalizeKeys(raw, CONSUMPTION_KEY_MAP) as Partial<MockCourseConsumptionRecord>;
  return {
    id: pickStr(n.id, ''),
    courseSessionId: pickStr(n.courseSessionId, ''),
    memberId: pickStr(n.memberId, ''),
    memberName: n.memberName,
    courseTitle: n.courseTitle,
    consumedAt: pickStr(n.consumedAt, ''),
    note: n.note,
    amount: n.amount,
  };
}

export function adaptConsumptions(rawList: unknown): MockCourseConsumptionRecord[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptConsumption);
}
