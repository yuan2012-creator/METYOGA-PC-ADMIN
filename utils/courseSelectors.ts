import type {
  Attendance,
  Booking,
  Course,
  CourseSession,
  CourseSessionStatus,
} from '../types';

export type CourseSubTab = 'schedule' | 'library';

export type CourseLibraryItem = Course & {
  levelLabel: string;
  price: number;
  rating: number;
  suitable: string[];
  goals: string;
  notes: string;
  colorTag: string;
};

export type ScheduleEvent = CourseSession & {
  name: string;
  teacher: string;
  dayIndex: number;
  startTime: string;
  duration: number;
  color: string;
};

/** 抽屉与场次操作：用多种 id 别名匹配同一排课事件 */
export const scheduleEventMatchesSessionId = (ev: ScheduleEvent, sid: string): boolean => {
  if (!sid) return false;
  if (ev.id === sid) return true;
  const ext = ev as ScheduleEvent & { sessionId?: string; courseSessionId?: string; originalSessionId?: string };
  return ext.sessionId === sid || ext.courseSessionId === sid || ext.originalSessionId === sid;
};

export type OpsScheduleItem = {
  id: string;
  courseId: string;
  courseSessionStatus: CourseSessionStatus;
  time: string;
  name: string;
  type: string;
  teacher: string;
  room: string;
  enrolled: number;
  capacity: number;
  status: 'checked_in' | 'upcoming' | 'full';
  signed: number;
  state: 'finished' | 'ongoing' | 'upcoming';
  abnormal: boolean;
  abnormalReason: string;
  startAt: string;
  endAt: string;
};

export type OpsFilter = 'all' | 'group' | 'private';

export type CourseOpsSummary = {
  totalCourses: number;
  smallClass: number;
  groupClass: number;
  privateClass: number;
  totalEnrolled: number;
  totalEmptySpots: number;
  totalConsumed: number;
};

export type ScheduleFormState = {
  id: string;
  dayIndex: number;
  roomId: string;
  courseId: string;
  teacherName: string;
  startTime: string;
  duration: number;
  capacity: number;
};

export type ScheduleWriteFeedback = {
  event: ScheduleEvent;
  message: string;
};

export type CourseBookingWriteResult = {
  event: ScheduleEvent;
  bookings: Booking[];
  message: string;
};

export type CourseAttendanceWriteResult = {
  event: ScheduleEvent;
  bookings: Booking[];
  attendances: Attendance[];
  message: string;
};

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  icon: string;
}

export const COURSE_TYPE_LABELS: Record<Course['type'], string> = {
  group: '团课',
  small_group: '小班',
  private: '私教',
  workshop: '工作坊',
  ttc: '教培',
};

const COURSE_DIFFICULTY_LABELS: Record<NonNullable<Course['difficulty']>, string> = {
  beginner: 'L1 入门',
  intermediate: 'L2 进阶',
  advanced: 'L3 强力',
  all_levels: '全级别',
};

export const COURSE_COLOR_TAGS: Record<Course['type'], string> = {
  group: 'bg-green-50 text-green-700 border-green-200',
  small_group: 'bg-gray-100 text-gray-700 border-gray-200',
  private: 'bg-slate-100 text-slate-700 border-slate-200',
  workshop: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  ttc: 'bg-stone-100 text-stone-700 border-stone-200',
};

export const COURSE_ROOMS: Room[] = [
  { id: '101', name: '瑜伽大教室', type: '团课', capacity: 12, icon: 'fa-om' },
  { id: '102', name: '普拉提器械室', type: '小班', capacity: 6, icon: 'fa-dumbbell' },
  { id: '201', name: 'VIP 私教室', type: '私教', capacity: 1, icon: 'fa-user-secret' },
];

export const COURSE_SUB_TABS: { id: CourseSubTab; label: string }[] = [
  { id: 'schedule', label: '课表与排课' },
  { id: 'library', label: '课程库' },
];

const TEACHER_NAMES: Record<string, string> = {
  '2': 'Mike',
  '4': 'Leo',
};

const DEMO_BOOKING_MEMBER_IDS = ['1', '2', '3', '5'];

const COURSE_LIBRARY_OVERRIDES: Record<string, Partial<CourseLibraryItem>> = {
  'course-flow-yoga': {
    price: 180,
    rating: 4.9,
    suitable: ['零基础', '身体僵硬', '亚健康'],
    goals: '改善身体柔韧性，缓解肩颈腰背酸痛。',
    notes: '建议饭后1小时进行练习。',
    description: '以呼吸串联体式，建立稳定、流动、可持续的练习节奏。',
  },
  'course-pilates-reformer': {
    price: 480,
    rating: 5.0,
    suitable: ['康复需求', '核心强化', '体态矫正'],
    goals: '强化核心肌群，改善骨盆前倾/后倾。',
    notes: '上课必须穿着专业普拉提防滑袜。',
  },
  'course-private-core': {
    price: 680,
    rating: 4.9,
    suitable: ['一对一', '核心稳定', '精准训练'],
    goals: '围绕会员体态问题做个性化核心训练。',
    notes: '课前需完成身体评估。',
  },
  'course-ryt200': {
    price: 18800,
    rating: 4.8,
    suitable: ['教培学员', '进阶习练者'],
    goals: '完成RYT 200小时系统学习，建立授课能力。',
    notes: '需完成报名审核与合同签署。',
  },
};

export const toCourseLibraryItem = (course: Course): CourseLibraryItem => {
  const override = COURSE_LIBRARY_OVERRIDES[course.id] ?? {};

  return {
    ...course,
    levelLabel: override.levelLabel ?? COURSE_DIFFICULTY_LABELS[course.difficulty ?? 'all_levels'],
    price: override.price ?? 0,
    rating: override.rating ?? 0,
    suitable: override.suitable ?? [course.category ?? COURSE_TYPE_LABELS[course.type]],
    goals: override.goals ?? '',
    notes: override.notes ?? '',
    colorTag: override.colorTag ?? COURSE_COLOR_TAGS[course.type],
    description: override.description ?? course.description ?? '',
  };
};

export const getRoomName = (roomId?: string): string => (
  COURSE_ROOMS.find(room => room.id === roomId)?.name ?? '未分配教室'
);

export const getTeacherName = (teacherId?: string): string => (
  teacherId ? TEACHER_NAMES[teacherId] ?? `老师 ${teacherId}` : '待定'
);

export const getDayIndexFromIso = (iso: string): number => {
  const day = new Date(iso).getDay();
  return (day + 6) % 7;
};

export const getTimeFromIso = (iso: string): string => iso.slice(11, 16);

export const getDurationMinutes = (startAt: string, endAt: string): number => {
  const durationMs = new Date(endAt).getTime() - new Date(startAt).getTime();
  return Math.max(15, Math.round(durationMs / 60000));
};

export const formatSessionTimeRange = (session: CourseSession): string => (
  `${getTimeFromIso(session.startAt)} - ${getTimeFromIso(session.endAt)}`
);

export const getSessionTimes = (dayIndex: number, startTime: string, duration: number) => {
  const baseDate = new Date('2026-05-04T00:00:00+08:00');
  baseDate.setDate(baseDate.getDate() + dayIndex);

  const [hour, minute] = startTime.split(':').map(Number);
  const start = new Date(baseDate);
  start.setHours(hour, minute, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
};

export const getCourseById = (
  courses: CourseLibraryItem[],
  courseId: string
): CourseLibraryItem | undefined => (
  courses.find(course => course.id === courseId)
);

export const getActiveBookings = (sessionId: string, bookings: Booking[]): Booking[] => (
  bookings.filter(booking => (
    booking.courseSessionId === sessionId
    && booking.status !== 'cancelled'
    && booking.status !== 'late_cancelled'
  ))
);

export const getSessionAttendances = (
  sessionId: string,
  attendances: Attendance[]
): Attendance[] => (
  attendances.filter(attendance => attendance.courseSessionId === sessionId)
);

export const getAttendanceCount = (
  sessionId: string,
  attendances: Attendance[]
): number => (
  getSessionAttendances(sessionId, attendances).filter(attendance => (
    attendance.status === 'checked_in'
    || attendance.status === 'attended'
    || attendance.status === 'consumed'
  )).length
);

export const isEventFull = (
  event: Pick<CourseSession, 'bookedCount' | 'capacity'>
): boolean => (
  (event.bookedCount ?? 0) >= event.capacity
);

const DEFAULT_SCHEDULE_EVENT_COLOR = 'bg-gray-100 text-gray-800 border-gray-200';

export const getScheduleEventColor = (
  course?: Pick<CourseLibraryItem, 'colorTag'> | null,
): string => {
  const raw = course?.colorTag;
  if (typeof raw !== 'string' || !raw.trim()) {
    return DEFAULT_SCHEDULE_EVENT_COLOR;
  }
  try {
    return raw.replace('text-', 'border-').replace('700', '800');
  } catch {
    return DEFAULT_SCHEDULE_EVENT_COLOR;
  }
};

/** 活跃可执行场次（不含已取消），用于需要「仍在执行流」的筛选 */
export const getActiveScheduleEvents = (events: ScheduleEvent[]): ScheduleEvent[] => (
  events.filter(event => event.status !== 'cancelled')
);

/**
 * 今日运营与排课日历可见场次（含已取消，便于追溯；不做「删除」语义过滤）。
 * 后续若需按门店营业日收紧范围，可在此集中扩展。
 */
export const getTodayOperationScheduleEvents = (events: ScheduleEvent[]): ScheduleEvent[] => [...events];

const extractCancelDetailFromNotes = (notes?: string): string | null => {
  if (!notes?.trim()) return null;
  const hit = notes.split('；').map(s => s.trim()).find(s => s.startsWith('【取消】'));
  if (!hit) return null;
  const body = hit.slice('【取消】'.length).trim();
  return body || null;
};

export const getCalendarEventStyle = (
  startTime: string,
  duration: number,
  startHour: number,
  hourHeight: number
) => {
  const [h, m] = startTime.split(':').map(Number);
  const startMinutes = (h - startHour) * 60 + m;
  const top = (startMinutes / 60) * hourHeight;
  const height = (duration / 60) * hourHeight;
  return { top: `${top}px`, height: `${height}px` };
};

export const toScheduleEvent = (
  session: CourseSession,
  courses: CourseLibraryItem[],
  bookings: Booking[]
): ScheduleEvent => {
  const course = getCourseById(courses, session.courseId);

  return {
    ...session,
    name: session.title ?? course?.name ?? '自定义课程',
    teacher: session.teacherName?.trim() || getTeacherName(session.teacherId),
    dayIndex: getDayIndexFromIso(session.startAt),
    startTime: getTimeFromIso(session.startAt),
    duration: getDurationMinutes(session.startAt, session.endAt),
    color: getScheduleEventColor(course),
    bookedCount: session.bookedCount ?? getActiveBookings(session.id, bookings).length,
  };
};

export const createScheduleFormDraft = (
  dayIndex: number,
  roomId: string,
  startTime: string,
  capacity: number,
  duration = 60
): ScheduleFormState => ({
  id: `evt_${Date.now()}`,
  dayIndex,
  roomId,
  courseId: '',
  teacherName: '',
  startTime,
  duration,
  capacity,
});

export const createDraftEventFromCourse = (
  course: CourseLibraryItem,
  dayIndex: number,
  roomId: string,
  startTime: string,
  capacity: number
): ScheduleEvent => {
  const { startAt, endAt } = getSessionTimes(dayIndex, startTime, course.durationMinutes);

  return {
    id: `evt_${Date.now()}`,
    courseId: course.id,
    name: course.name,
    title: course.name,
    teacher: '待定',
    roomId,
    dayIndex,
    startTime,
    duration: course.durationMinutes,
    color: getScheduleEventColor(course),
    status: 'draft',
    startAt,
    endAt,
    capacity,
    bookedCount: 0,
  };
};

export const createEventFromScheduleForm = (
  form: ScheduleFormState,
  courses: CourseLibraryItem[],
  existingEvent?: ScheduleEvent
): ScheduleEvent => {
  const course = getCourseById(courses, form.courseId);
  const { startAt, endAt } = getSessionTimes(form.dayIndex, form.startTime, form.duration);

  return {
    ...(existingEvent ?? {}),
    id: form.id || existingEvent?.id || `evt_${Date.now()}`,
    courseId: form.courseId || 'custom-course',
    name: course ? course.name : '自定义课程',
    title: course ? course.name : '自定义课程',
    teacher: form.teacherName || '待定',
    roomId: form.roomId,
    dayIndex: form.dayIndex,
    startTime: form.startTime,
    duration: form.duration,
    color: getScheduleEventColor(course),
    status: existingEvent?.status ?? 'draft',
    startAt,
    endAt,
    bookedCount: existingEvent?.bookedCount ?? 0,
    waitlistCount: existingEvent?.waitlistCount,
    capacity: form.capacity,
  };
};

export const moveScheduleEvent = (
  event: ScheduleEvent,
  dayIndex: number,
  roomId: string,
  startTime: string
): ScheduleEvent => {
  const { startAt, endAt } = getSessionTimes(dayIndex, startTime, event.duration);

  return {
    ...event,
    dayIndex,
    roomId,
    startTime,
    startAt,
    endAt,
    status: event.status === 'published' || event.status === 'in_progress' || event.status === 'completed'
      ? 'rescheduled'
      : event.status,
  };
};

export const cancelScheduleEvent = (event: ScheduleEvent): ScheduleEvent => ({
  ...event,
  status: 'cancelled',
  notes: [event.notes, '前端演示态取消排课'].filter(Boolean).join('；'),
});

export const assignSubstituteTeacher = (
  event: ScheduleEvent,
  substituteName = '代课老师'
): ScheduleWriteFeedback => ({
  event: {
    ...event,
    teacher: substituteName,
    notes: [event.notes, `前端演示态安排${substituteName}`].filter(Boolean).join('；'),
  },
  message: `${event.name} 已安排${substituteName}`,
});

export const markScheduleCheckInHandled = (event: ScheduleEvent): ScheduleWriteFeedback => {
  if (event.status === 'completed') {
    return {
      event,
      message: `${event.name} 已完成，无需重复签到`,
    };
  }

  return {
    event: {
      ...event,
      status: event.status === 'in_progress' ? 'completed' : 'in_progress',
      notes: [event.notes, '前端演示态处理签到'].filter(Boolean).join('；'),
    },
    message: event.status === 'in_progress'
      ? `${event.name} 已标记完成`
      : `${event.name} 已进入签到处理中`,
  };
};

const createDemoBooking = (
  event: ScheduleEvent,
  bookings: Booking[]
): Booking => {
  const activeBookingCount = Math.max(event.bookedCount ?? 0, getActiveBookings(event.id, bookings).length);

  return {
    id: `booking-demo-${event.id}-${Date.now()}`,
    memberId: DEMO_BOOKING_MEMBER_IDS[activeBookingCount % DEMO_BOOKING_MEMBER_IDS.length],
    courseSessionId: event.id,
    status: 'booked',
    bookedAt: new Date().toISOString(),
    source: 'admin',
  };
};

const getFirstCheckInCandidate = (
  event: ScheduleEvent,
  bookings: Booking[],
  attendances: Attendance[]
): Booking | undefined => (
  getActiveBookings(event.id, bookings).find(booking => (
    !attendances.some(attendance => (
      attendance.courseSessionId === event.id
      && attendance.bookingId === booking.id
      && (
        attendance.status === 'checked_in'
        || attendance.status === 'attended'
        || attendance.status === 'consumed'
      )
    ))
  ))
);

const createAttendanceFromBooking = (
  event: ScheduleEvent,
  booking: Booking,
  status: Attendance['status']
): Attendance => {
  const now = new Date().toISOString();

  return {
    id: `attendance-demo-${event.id}-${booking.memberId}-${Date.now()}`,
    memberId: booking.memberId,
    courseSessionId: event.id,
    bookingId: booking.id,
    status,
    checkedInAt: status === 'checked_in' || status === 'attended' || status === 'consumed' ? now : undefined,
    attendedAt: status === 'attended' || status === 'consumed' ? now : undefined,
    consumedAt: status === 'consumed' ? now : undefined,
    notes: '前端演示态生成签到记录',
  };
};

export const bookDemoMemberForSession = (
  event: ScheduleEvent,
  bookings: Booking[]
): CourseBookingWriteResult => {
  const activeBookingCount = Math.max(event.bookedCount ?? 0, getActiveBookings(event.id, bookings).length);

  if (activeBookingCount >= event.capacity) {
    return {
      event,
      bookings,
      message: `${event.name} 已满员，无法继续添加演示预约`,
    };
  }

  const booking = createDemoBooking(event, bookings);

  return {
    event: {
      ...event,
      bookedCount: activeBookingCount + 1,
      notes: [event.notes, '前端演示态新增预约'].filter(Boolean).join('；'),
    },
    bookings: [...bookings, booking],
    message: `${event.name} 已新增 1 条演示预约`,
  };
};

export const checkInDemoAttendanceForSession = (
  event: ScheduleEvent,
  bookings: Booking[],
  attendances: Attendance[]
): CourseAttendanceWriteResult => {
  let nextBookings = bookings;
  let nextEvent = event;
  let booking = getFirstCheckInCandidate(event, bookings, attendances);

  if (!booking) {
    const previousBookingCount = nextBookings.length;
    const bookingResult = bookDemoMemberForSession(event, bookings);
    nextBookings = bookingResult.bookings;
    nextEvent = bookingResult.event;
    booking = nextBookings.length > previousBookingCount
      ? nextBookings[nextBookings.length - 1]
      : getFirstCheckInCandidate(nextEvent, nextBookings, attendances);
  }

  if (!booking) {
    return {
      event,
      bookings,
      attendances,
      message: `${event.name} 暂无可签到预约`,
    };
  }

  const attendance = createAttendanceFromBooking(nextEvent, booking, 'checked_in');

  return {
    event: {
      ...nextEvent,
      status: nextEvent.status === 'completed' ? 'completed' : 'in_progress',
      notes: [nextEvent.notes, '前端演示态签到'].filter(Boolean).join('；'),
    },
    bookings: nextBookings,
    attendances: [...attendances, attendance],
    message: `${nextEvent.name} 已生成 1 条演示签到记录`,
  };
};

export const completeDemoAttendanceForSession = (
  event: ScheduleEvent,
  bookings: Booking[],
  attendances: Attendance[]
): CourseAttendanceWriteResult => {
  const sessionAttendances = getSessionAttendances(event.id, attendances);

  if (sessionAttendances.length === 0) {
    const checkedInResult = checkInDemoAttendanceForSession(event, bookings, attendances);
    return completeDemoAttendanceForSession(
      checkedInResult.event,
      checkedInResult.bookings,
      checkedInResult.attendances
    );
  }

  const now = new Date().toISOString();
  const updatedAttendances = attendances.map(attendance => (
    attendance.courseSessionId === event.id
      ? {
          ...attendance,
          status: 'consumed' as const,
          attendedAt: attendance.attendedAt ?? now,
          consumedAt: attendance.consumedAt ?? now,
          notes: [attendance.notes, '前端演示态完成消课'].filter(Boolean).join('；'),
        }
      : attendance
  ));

  return {
    event: {
      ...event,
      status: 'completed',
      notes: [event.notes, '前端演示态完成课程'].filter(Boolean).join('；'),
    },
    bookings,
    attendances: updatedAttendances,
    message: `${event.name} 已完成签到并生成消课记录`,
  };
};

export const toOpsScheduleItem = (
  session: CourseSession,
  courses: CourseLibraryItem[],
  bookings: Booking[],
  attendances: Attendance[]
): OpsScheduleItem => {
  const course = getCourseById(courses, session.courseId);
  const displayTeacher = 'teacher' in session && typeof session.teacher === 'string'
    ? session.teacher
    : getTeacherName(session.teacherId);
  const activeBookings = getActiveBookings(session.id, bookings);
  const signed = getAttendanceCount(session.id, attendances);
  const enrolled = session.bookedCount ?? activeBookings.length;
  const lateCancelledCount = bookings.filter(booking => (
    booking.courseSessionId === session.id && booking.status === 'late_cancelled'
  )).length;
  const cancelDetail = extractCancelDetailFromNotes(session.notes);
  const cancelTraceLine = session.status === 'cancelled'
    ? (cancelDetail ?? '本场次已标记取消')
    : '';
  const lateReason = lateCancelledCount > 0 ? `${lateCancelledCount} 个迟取消预约` : '';
  const abnormalReasonCombined = [lateReason, cancelTraceLine].filter(Boolean).join('；');
  const abnormal = lateCancelledCount > 0 || (session.status === 'cancelled' && !!cancelTraceLine);
  const state: OpsScheduleItem['state'] = session.status === 'completed'
    ? 'finished'
    : session.status === 'in_progress'
      ? 'ongoing'
      : session.status === 'cancelled'
        ? 'finished'
        : 'upcoming';

  return {
    id: session.id,
    courseId: session.courseId,
    courseSessionStatus: session.status,
    time: formatSessionTimeRange(session),
    name: session.title ?? course?.name ?? '自定义课程',
    type: course ? COURSE_TYPE_LABELS[course.type] : '课程',
    teacher: displayTeacher,
    room: getRoomName(session.roomId),
    enrolled,
    capacity: session.capacity,
    status: signed >= enrolled && enrolled > 0 ? 'checked_in' : isEventFull(session) ? 'full' : 'upcoming',
    signed,
    state,
    abnormal,
    abnormalReason: abnormalReasonCombined,
    startAt: session.startAt,
    endAt: session.endAt,
  };
};

export const buildOpsSchedule = (
  sessions: CourseSession[],
  courses: CourseLibraryItem[],
  bookings: Booking[],
  attendances: Attendance[]
): OpsScheduleItem[] => (
  sessions.map(session => toOpsScheduleItem(session, courses, bookings, attendances))
);

export const filterOpsSchedule = (
  opsSchedule: OpsScheduleItem[],
  opsFilter: OpsFilter
): OpsScheduleItem[] => (
  opsSchedule.filter(cls => {
    if (opsFilter === 'group') return cls.type === '团课' || cls.type === '小班';
    if (opsFilter === 'private') return cls.type === '私教';
    return true;
  })
);

export const getOpsSummary = (opsSchedule: OpsScheduleItem[]): CourseOpsSummary => ({
  totalCourses: opsSchedule.length,
  smallClass: opsSchedule.filter(c => c.type === '小班').length,
  groupClass: opsSchedule.filter(c => c.type === '团课').length,
  privateClass: opsSchedule.filter(c => c.type === '私教').length,
  totalEnrolled: opsSchedule.reduce((sum, c) => sum + c.enrolled, 0),
  totalEmptySpots: opsSchedule.reduce((sum, c) => sum + (c.capacity - c.enrolled), 0),
  totalConsumed: opsSchedule.reduce((sum, c) => sum + c.signed, 0),
});

export const getOpsAiGuidance = (
  opsSchedule: OpsScheduleItem[],
  opsSummary: Pick<CourseOpsSummary, 'totalCourses' | 'totalEmptySpots'>
): string => {
  const abnormalCount = opsSchedule.filter(c => c.abnormal).length;

  if (abnormalCount > 0) {
    return `发现 ${abnormalCount} 个课程异常（未签到等），请优先处理。`;
  }

  if (opsSummary.totalEmptySpots > 0) {
    return `今日还有 ${opsSummary.totalEmptySpots} 个空位，建议提醒老师在社群或私聊邀约会员。`;
  }

  if (opsSummary.totalCourses < 6) {
    return '今日排课较少，下午时段场地空闲，建议安排老师进行私教体验课或场馆内训。';
  }

  return '今日课程安排饱满，运行状态良好，请继续保持。';
};
