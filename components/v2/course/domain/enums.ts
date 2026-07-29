/**
 * Course Schedule P1 — canonical enums.
 * UI and services MUST import from here; do not redeclare synonym strings in components.
 */

export const SESSION_STATUSES = [
  '草稿',
  '待发布',
  '已发布',
  '待开课',
  '进行中',
  '已完成',
  '已取消',
  '已改期',
  '已停课',
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const TEACHER_ASSIGNMENT_STATUSES = [
  '待指定',
  '待确认',
  '已确认',
  '有冲突',
  '待替代',
  '已替换',
  '已取消',
] as const;
export type TeacherAssignmentStatus = (typeof TEACHER_ASSIGNMENT_STATUSES)[number];

export const TEACHER_ASSIGNMENT_TYPES = [
  '正常排课',
  '代课',
  '临时替换',
  '审批影响',
  '手工调整',
] as const;
export type TeacherAssignmentType = (typeof TEACHER_ASSIGNMENT_TYPES)[number];

export const BOOKING_STATUSES = ['未开放', '可预约', '已满员', '已关闭', '已暂停'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['未开始', '待签到', '签到中', '已完成'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const SESSION_RISK_TYPES = [
  '缺老师',
  '时间冲突',
  '能力不匹配',
  '门店无授权',
  '负荷过高',
  '请假影响',
  '教室冲突',
  '课次关联待确认',
  '老师关联待确认',
] as const;
export type SessionRiskType = (typeof SESSION_RISK_TYPES)[number];

export const SESSION_REFERENCE_RESOLUTIONS = ['resolved', 'unresolved'] as const;
export type SessionReferenceResolution = (typeof SESSION_REFERENCE_RESOLUTIONS)[number];

export const SESSION_SOURCE_MODULES = ['course', 'staff', 'migration', 'manual'] as const;
export type SessionSourceModule = (typeof SESSION_SOURCE_MODULES)[number];

export const PAYABLE_STATUSES = ['未生成', '应付', '已支付', '已冲正'] as const;
export type PayableStatus = (typeof PAYABLE_STATUSES)[number];

/** Legacy WeekScheduleStatus → SessionStatus / BookingStatus mapping. */
export const LEGACY_WEEK_STATUS_MAP: Record<
  string,
  { sessionStatus: SessionStatus; bookingStatus?: BookingStatus; attendanceStatus?: AttendanceStatus }
> = {
  draft: { sessionStatus: '草稿', bookingStatus: '未开放' },
  scheduled: { sessionStatus: '已发布', bookingStatus: '可预约' },
  openForBooking: { sessionStatus: '待开课', bookingStatus: '可预约' },
  full: { sessionStatus: '待开课', bookingStatus: '已满员' },
  lowAttendance: { sessionStatus: '待开课', bookingStatus: '可预约' },
  waitlist: { sessionStatus: '待开课', bookingStatus: '已满员' },
  completed: { sessionStatus: '已完成', bookingStatus: '已关闭', attendanceStatus: '已完成' },
  cancelledMock: { sessionStatus: '已取消', bookingStatus: '已关闭' },
  teacherLeaveRisk: { sessionStatus: '待开课', bookingStatus: '可预约' },
  conflictWarning: { sessionStatus: '待开课', bookingStatus: '可预约' },
};

/** Legacy Staff ScheduleAssignmentStatus → TeacherAssignmentStatus. */
export const LEGACY_ASSIGNMENT_STATUS_MAP: Record<string, TeacherAssignmentStatus> = {
  待指定: '待指定',
  待确认: '待确认',
  已确认: '已确认',
  有冲突: '有冲突',
  已替换: '已替换',
  已取消: '已取消',
};

export function isSessionStatus(value: string): value is SessionStatus {
  return (SESSION_STATUSES as readonly string[]).includes(value);
}

export function isTeacherAssignmentStatus(value: string): value is TeacherAssignmentStatus {
  return (TEACHER_ASSIGNMENT_STATUSES as readonly string[]).includes(value);
}

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function isAttendanceStatus(value: string): value is AttendanceStatus {
  return (ATTENDANCE_STATUSES as readonly string[]).includes(value);
}

export function mapLegacyWeekStatus(legacy: string): {
  sessionStatus: SessionStatus;
  bookingStatus: BookingStatus;
  attendanceStatus: AttendanceStatus;
} {
  const hit = LEGACY_WEEK_STATUS_MAP[legacy];
  if (hit) {
    return {
      sessionStatus: hit.sessionStatus,
      bookingStatus: hit.bookingStatus ?? '可预约',
      attendanceStatus: hit.attendanceStatus ?? '未开始',
    };
  }
  return { sessionStatus: '已发布', bookingStatus: '可预约', attendanceStatus: '未开始' };
}

export function mapLegacyAssignmentStatus(legacy: string): TeacherAssignmentStatus {
  return LEGACY_ASSIGNMENT_STATUS_MAP[legacy] ?? '待指定';
}
