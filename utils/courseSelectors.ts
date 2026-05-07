import type {
  Attendance,
  Booking,
  Course,
  CourseSession,
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

export type OpsScheduleItem = {
  id: string;
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

export const getScheduleEventColor = (
  course?: Pick<CourseLibraryItem, 'colorTag'>
): string => (
  course?.colorTag.replace('text-', 'border-').replace('700', '800')
  ?? 'bg-gray-100 text-gray-800 border-gray-200'
);

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
    teacher: getTeacherName(session.teacherId),
    dayIndex: getDayIndexFromIso(session.startAt),
    startTime: getTimeFromIso(session.startAt),
    duration: getDurationMinutes(session.startAt, session.endAt),
    color: getScheduleEventColor(course),
    bookedCount: session.bookedCount ?? getActiveBookings(session.id, bookings).length,
  };
};

export const toOpsScheduleItem = (
  session: CourseSession,
  courses: CourseLibraryItem[],
  bookings: Booking[],
  attendances: Attendance[]
): OpsScheduleItem => {
  const course = getCourseById(courses, session.courseId);
  const activeBookings = getActiveBookings(session.id, bookings);
  const signed = getAttendanceCount(session.id, attendances);
  const enrolled = session.bookedCount ?? activeBookings.length;
  const lateCancelledCount = bookings.filter(booking => (
    booking.courseSessionId === session.id && booking.status === 'late_cancelled'
  )).length;
  const state: OpsScheduleItem['state'] = session.status === 'completed'
    ? 'finished'
    : session.status === 'in_progress'
      ? 'ongoing'
      : 'upcoming';

  return {
    id: session.id,
    time: formatSessionTimeRange(session),
    name: session.title ?? course?.name ?? '自定义课程',
    type: course ? COURSE_TYPE_LABELS[course.type] : '课程',
    teacher: getTeacherName(session.teacherId),
    room: getRoomName(session.roomId),
    enrolled,
    capacity: session.capacity,
    status: signed >= enrolled && enrolled > 0 ? 'checked_in' : isEventFull(session) ? 'full' : 'upcoming',
    signed,
    state,
    abnormal: lateCancelledCount > 0,
    abnormalReason: lateCancelledCount > 0 ? `${lateCancelledCount} 个迟取消预约` : '',
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
