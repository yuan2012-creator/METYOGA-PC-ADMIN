import { CANONICAL_STAFF_IDS, resolveLegacyStaffRef } from '../../staff/domain/legacyStaffIdMap';
import {
  CANONICAL_SESSION_IDS,
  UNIFIED_LEGACY_TO_SESSION,
  buildUnresolvedSessionReferenceRecords,
  collectLegacyIdsForCanonical,
  sessIdFromCs,
} from '../domain';
import { mapLegacyAssignmentStatus, mapLegacyWeekStatus } from '../domain/enums';
import { nowIso } from '../domain/transitions';
import type { TeacherAssignment, StoreCourseSession } from '../domain/types';
import {
  buildDefaultStaffContext,
  recalculateSessionRisks,
} from '../courseScheduleCalculations';
import {
  COURSE_SCHEDULE_STORAGE_VERSION,
  type CourseSchedulePersistedSnapshot,
  type UnresolvedTeacherReference,
} from '../courseSchedulePersistence';

export const COURSE_SEED_STORES = {
  wanxiang: { id: 'store-wanxiang', name: '万象城馆' },
  chengxi: { id: 'store-chengxi', name: '城西馆' },
  binjiang: { id: 'store-binjiang', name: '滨江馆' },
} as const;

const PROTOTYPE_TODAY = '2026-07-27';

const WEEK_DAYS: Record<
  string,
  { dateIso: string; weekDayId: string; weekDayLabel: string; weekDateLabel: string }
> = {
  'day-mon': { dateIso: '2026-07-27', weekDayId: 'day-mon', weekDayLabel: '周一', weekDateLabel: '7/27' },
  'day-tue': { dateIso: '2026-07-28', weekDayId: 'day-tue', weekDayLabel: '周二', weekDateLabel: '7/28' },
  'day-wed': { dateIso: '2026-07-29', weekDayId: 'day-wed', weekDayLabel: '周三', weekDateLabel: '7/29' },
  'day-thu': { dateIso: '2026-07-30', weekDayId: 'day-thu', weekDayLabel: '周四', weekDateLabel: '7/30' },
  'day-fri': { dateIso: '2026-07-31', weekDayId: 'day-fri', weekDayLabel: '周五', weekDateLabel: '7/31' },
  'day-sat': { dateIso: '2026-08-01', weekDayId: 'day-sat', weekDayLabel: '周六', weekDateLabel: '8/1' },
  'day-sun': { dateIso: '2026-08-02', weekDayId: 'day-sun', weekDayLabel: '周日', weekDateLabel: '8/2' },
};

const SKIP_CS_IDS = new Set(Object.keys(UNIFIED_LEGACY_TO_SESSION));

const STAFF_CAPS: Record<string, { capabilityIds: string[]; primaryStoreId: string; supportStoreIds: string[] }> = {
  [CANONICAL_STAFF_IDS.mia]: {
    capabilityIds: ['cap_pilates', 'cap_private', 'cap_flow_yoga'],
    primaryStoreId: COURSE_SEED_STORES.wanxiang.id,
    supportStoreIds: [COURSE_SEED_STORES.chengxi.id],
  },
  [CANONICAL_STAFF_IDS.anna]: {
    capabilityIds: ['cap_yin_yoga', 'cap_neck', 'cap_flow_yoga', 'cap_restore'],
    primaryStoreId: COURSE_SEED_STORES.wanxiang.id,
    supportStoreIds: [],
  },
  [CANONICAL_STAFF_IDS.nora]: {
    capabilityIds: ['cap_flow_yoga', 'cap_restore'],
    primaryStoreId: COURSE_SEED_STORES.chengxi.id,
    supportStoreIds: [COURSE_SEED_STORES.wanxiang.id],
  },
  [CANONICAL_STAFF_IDS.leo]: {
    capabilityIds: ['cap_private'],
    primaryStoreId: COURSE_SEED_STORES.binjiang.id,
    supportStoreIds: [],
  },
  [CANONICAL_STAFF_IDS.caicai]: {
    capabilityIds: ['cap_yin_yoga', 'cap_flow_yoga'],
    primaryStoreId: COURSE_SEED_STORES.chengxi.id,
    supportStoreIds: [],
  },
  [CANONICAL_STAFF_IDS.keke]: {
    capabilityIds: ['cap_pilates', 'cap_neck'],
    primaryStoreId: COURSE_SEED_STORES.wanxiang.id,
    supportStoreIds: [],
  },
};

function toStartAt(dateIso: string, startTime: string): string {
  return `${dateIso}T${startTime}:00+08:00`;
}

function toEndAt(dateIso: string, endTime: string): string {
  return `${dateIso}T${endTime}:00+08:00`;
}

function courseTypeMeta(courseType: string, courseName: string): {
  courseTypeId: string;
  requiredCapabilityIds: string[];
} {
  if (courseType.includes('普拉提')) {
    return { courseTypeId: 'ct-pilates', requiredCapabilityIds: ['cap_pilates'] };
  }
  if (courseName.includes('阴瑜伽') || courseType.includes('阴')) {
    return { courseTypeId: 'ct-yin', requiredCapabilityIds: ['cap_yin_yoga'] };
  }
  if (courseName.includes('修复') || courseName.includes('恢复')) {
    return { courseTypeId: 'ct-restore', requiredCapabilityIds: ['cap_restore'] };
  }
  if (courseName.includes('肩颈')) {
    return { courseTypeId: 'ct-neck', requiredCapabilityIds: ['cap_neck'] };
  }
  if (courseType.includes('私教')) {
    return { courseTypeId: 'ct-private', requiredCapabilityIds: ['cap_private'] };
  }
  if (courseType.includes('教培')) {
    return { courseTypeId: 'ct-ryt200', requiredCapabilityIds: ['cap_mentor_ryt'] };
  }
  if (courseType.includes('小班')) {
    return { courseTypeId: 'ct-yoga-small', requiredCapabilityIds: ['cap_flow_yoga'] };
  }
  return { courseTypeId: 'ct-flow', requiredCapabilityIds: ['cap_flow_yoga'] };
}

function resolveTeacher(legacyTeacherId: string): TeacherAssignment {
  const resolved = resolveLegacyStaffRef(legacyTeacherId, 'course.t');
  if (resolved.resolution === 'unresolved' || !resolved.staffId) {
    return {
      staffId: null,
      assignmentStatus: '待指定',
      assignmentType: '正常排课',
      isSubstitute: false,
      forced: false,
      teacherUnresolved: true,
      unresolvedTeacherHint: '老师关联待确认',
    };
  }
  return {
    staffId: resolved.staffId,
    assignmentStatus: '已确认',
    assignmentType: '正常排课',
    isSubstitute: false,
    forced: false,
    assignedAt: `${PROTOTYPE_TODAY}T08:00:00.000Z`,
    assignedBy: CANONICAL_STAFF_IDS.fangfang,
  };
}

function mkSession(
  partial: Partial<StoreCourseSession> &
    Pick<
      StoreCourseSession,
      | 'id'
      | 'courseName'
      | 'courseType'
      | 'courseTypeId'
      | 'storeId'
      | 'storeName'
      | 'classroomName'
      | 'startAt'
      | 'endAt'
      | 'dateIso'
      | 'startTime'
      | 'endTime'
      | 'durationMinutes'
      | 'capacity'
      | 'bookingCount'
      | 'sessionStatus'
      | 'teacherAssignment'
    >,
): StoreCourseSession {
  const ts = `${PROTOTYPE_TODAY}T08:00:00.000Z`;
  return {
    legacyIds: [],
    courseId: partial.id,
    courseTemplateId: `tpl-${partial.courseTypeId}`,
    requiredCapabilityIds: [],
    classroomId: `room-${partial.classroomName.replace(/\s+/g, '-').toLowerCase()}`,
    createdAt: ts,
    updatedAt: ts,
    waitlistCount: 0,
    checkedInCount: 0,
    pointCost: 1,
    bookingStatus: '可预约',
    attendanceStatus: '未开始',
    sourceModule: 'course',
    payableStatus: '未生成',
    ...partial,
  };
}

function buildUnifiedSessions(): StoreCourseSession[] {
  const S = CANONICAL_STAFF_IDS;
  const C = CANONICAL_SESSION_IDS;
  const stores = COURSE_SEED_STORES;
  const mon = WEEK_DAYS['day-mon'];
  const tue = WEEK_DAYS['day-tue'];
  const wed = WEEK_DAYS['day-wed'];
  const thu = WEEK_DAYS['day-thu'];
  const fri = WEEK_DAYS['day-fri'];
  const sat = WEEK_DAYS['day-sat'];

  return [
    mkSession({
      id: C.todayPilates,
      legacyIds: collectLegacyIdsForCanonical(C.todayPilates),
      courseId: 'course-pilates-small',
      courseTemplateId: 'tpl-pilates-small',
      courseName: '普拉提小班',
      courseType: '普拉提小班',
      courseTypeId: 'ct-pilates',
      requiredCapabilityIds: ['cap_pilates'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-pilates',
      classroomName: '普拉提教室',
      startAt: toStartAt(mon.dateIso, '14:00'),
      endAt: toEndAt(mon.dateIso, '15:00'),
      dateIso: mon.dateIso,
      startTime: '14:00',
      endTime: '15:00',
      durationMinutes: 60,
      capacity: 6,
      bookingCount: 4,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.mia,
        assignmentStatus: '已确认',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${mon.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
        confirmedAt: `${mon.dateIso}T08:00:00.000Z`,
      },
      weekDayId: mon.weekDayId,
      weekDayLabel: mon.weekDayLabel,
      weekDateLabel: mon.weekDateLabel,
    }),
    mkSession({
      id: C.todayYin,
      legacyIds: collectLegacyIdsForCanonical(C.todayYin),
      courseId: 'course-yin',
      courseTemplateId: 'tpl-yin',
      courseName: '阴瑜伽',
      courseType: '团课',
      courseTypeId: 'ct-yin',
      requiredCapabilityIds: ['cap_yin_yoga'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-a',
      classroomName: 'A 教室',
      startAt: toStartAt(mon.dateIso, '18:30'),
      endAt: toEndAt(mon.dateIso, '19:30'),
      dateIso: mon.dateIso,
      startTime: '18:30',
      endTime: '19:30',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 12,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.anna,
        assignmentStatus: '已确认',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${mon.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
        confirmedAt: `${mon.dateIso}T08:00:00.000Z`,
      },
      weekDayId: mon.weekDayId,
      weekDayLabel: mon.weekDayLabel,
      weekDateLabel: mon.weekDateLabel,
    }),
    mkSession({
      id: C.gapEveningFlow,
      legacyIds: collectLegacyIdsForCanonical(C.gapEveningFlow),
      courseId: 'course-flow-evening',
      courseTemplateId: 'tpl-flow',
      courseName: '晚间流瑜伽',
      courseType: '团课',
      courseTypeId: 'ct-flow',
      requiredCapabilityIds: ['cap_flow_yoga'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-b',
      classroomName: 'B 教室',
      startAt: toStartAt(mon.dateIso, '19:45'),
      endAt: toEndAt(mon.dateIso, '20:45'),
      dateIso: mon.dateIso,
      startTime: '19:45',
      endTime: '20:45',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 10,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: null,
        assignmentStatus: '待指定',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
      },
      weekDayId: mon.weekDayId,
      weekDayLabel: mon.weekDayLabel,
      weekDateLabel: mon.weekDateLabel,
    }),
    mkSession({
      id: C.noraLeave,
      legacyIds: collectLegacyIdsForCanonical(C.noraLeave),
      courseId: 'course-flow-basic',
      courseTemplateId: 'tpl-flow',
      courseName: '基础流瑜伽',
      courseType: '团课',
      courseTypeId: 'ct-flow',
      requiredCapabilityIds: ['cap_flow_yoga'],
      storeId: stores.chengxi.id,
      storeName: stores.chengxi.name,
      classroomId: 'room-a-cx',
      classroomName: 'A 教室',
      startAt: toStartAt(mon.dateIso, '10:30'),
      endAt: toEndAt(mon.dateIso, '11:30'),
      dateIso: mon.dateIso,
      startTime: '10:30',
      endTime: '11:30',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 9,
      sessionStatus: '待开课',
      note: '老师请假冲突待确认',
      teacherAssignment: {
        staffId: S.nora,
        assignmentStatus: '有冲突',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${mon.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
      },
      weekDayId: mon.weekDayId,
      weekDayLabel: mon.weekDayLabel,
      weekDateLabel: mon.weekDateLabel,
    }),
    mkSession({
      id: C.conflictA,
      legacyIds: collectLegacyIdsForCanonical(C.conflictA),
      courseId: 'course-neck',
      courseTemplateId: 'tpl-neck',
      courseName: '肩颈舒缓',
      courseType: '团课',
      courseTypeId: 'ct-neck',
      requiredCapabilityIds: ['cap_neck'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-a',
      classroomName: 'A 教室',
      startAt: toStartAt(tue.dateIso, '19:30'),
      endAt: toEndAt(tue.dateIso, '20:30'),
      dateIso: tue.dateIso,
      startTime: '19:30',
      endTime: '20:30',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 11,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.anna,
        assignmentStatus: '有冲突',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${tue.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
      },
      weekDayId: tue.weekDayId,
      weekDayLabel: tue.weekDayLabel,
      weekDateLabel: tue.weekDateLabel,
    }),
    mkSession({
      id: C.conflictB,
      legacyIds: collectLegacyIdsForCanonical(C.conflictB),
      courseId: 'course-yin-extra',
      courseTemplateId: 'tpl-yin',
      courseName: '阴瑜伽加开',
      courseType: '团课',
      courseTypeId: 'ct-yin',
      requiredCapabilityIds: ['cap_yin_yoga'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-b',
      classroomName: 'B 教室',
      startAt: toStartAt(tue.dateIso, '19:30'),
      endAt: toEndAt(tue.dateIso, '20:30'),
      dateIso: tue.dateIso,
      startTime: '19:30',
      endTime: '20:30',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 8,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.anna,
        assignmentStatus: '有冲突',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${tue.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
      },
      weekDayId: tue.weekDayId,
      weekDayLabel: tue.weekDayLabel,
      weekDateLabel: tue.weekDateLabel,
    }),
    mkSession({
      id: C.wedPilates,
      legacyIds: collectLegacyIdsForCanonical(C.wedPilates),
      courseId: 'course-pilates-small',
      courseTemplateId: 'tpl-pilates-small',
      courseName: '普拉提小班',
      courseType: '普拉提小班',
      courseTypeId: 'ct-pilates',
      requiredCapabilityIds: ['cap_pilates'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-pilates',
      classroomName: '普拉提教室',
      startAt: toStartAt(wed.dateIso, '19:30'),
      endAt: toEndAt(wed.dateIso, '20:30'),
      dateIso: wed.dateIso,
      startTime: '19:30',
      endTime: '20:30',
      durationMinutes: 60,
      capacity: 6,
      bookingCount: 2,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.mia,
        assignmentStatus: '待确认',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${wed.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
      },
      weekDayId: wed.weekDayId,
      weekDayLabel: wed.weekDayLabel,
      weekDateLabel: wed.weekDateLabel,
    }),
    mkSession({
      id: C.thuRestore,
      legacyIds: collectLegacyIdsForCanonical(C.thuRestore),
      courseId: 'course-restore',
      courseTemplateId: 'tpl-restore',
      courseName: '修复瑜伽',
      courseType: '团课',
      courseTypeId: 'ct-restore',
      requiredCapabilityIds: ['cap_restore'],
      storeId: stores.chengxi.id,
      storeName: stores.chengxi.name,
      classroomId: 'room-a-cx',
      classroomName: 'A 教室',
      startAt: toStartAt(thu.dateIso, '10:00'),
      endAt: toEndAt(thu.dateIso, '11:00'),
      dateIso: thu.dateIso,
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 6,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: null,
        assignmentStatus: '待指定',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
      },
      weekDayId: thu.weekDayId,
      weekDayLabel: thu.weekDayLabel,
      weekDateLabel: thu.weekDateLabel,
    }),
    mkSession({
      id: C.friFlow,
      legacyIds: collectLegacyIdsForCanonical(C.friFlow),
      courseId: 'course-flow-weekend',
      courseTemplateId: 'tpl-flow',
      courseName: '周末流瑜伽预习',
      courseType: '团课',
      courseTypeId: 'ct-flow',
      requiredCapabilityIds: ['cap_flow_yoga'],
      storeId: stores.binjiang.id,
      storeName: stores.binjiang.name,
      classroomId: 'room-a-bj',
      classroomName: 'A 教室',
      startAt: toStartAt(fri.dateIso, '18:00'),
      endAt: toEndAt(fri.dateIso, '19:00'),
      dateIso: fri.dateIso,
      startTime: '18:00',
      endTime: '19:00',
      durationMinutes: 60,
      capacity: 16,
      bookingCount: 7,
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.caicai,
        assignmentStatus: '已确认',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${fri.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
        confirmedAt: `${fri.dateIso}T08:00:00.000Z`,
      },
      weekDayId: fri.weekDayId,
      weekDayLabel: fri.weekDayLabel,
      weekDateLabel: fri.weekDateLabel,
    }),
    mkSession({
      id: C.satPilates,
      legacyIds: collectLegacyIdsForCanonical(C.satPilates),
      courseId: 'course-pilates-small',
      courseTemplateId: 'tpl-pilates-small',
      courseName: '普拉提小班',
      courseType: '普拉提小班',
      courseTypeId: 'ct-pilates',
      requiredCapabilityIds: ['cap_pilates'],
      storeId: stores.wanxiang.id,
      storeName: stores.wanxiang.name,
      classroomId: 'room-pilates',
      classroomName: '普拉提教室',
      startAt: toStartAt(sat.dateIso, '10:00'),
      endAt: toEndAt(sat.dateIso, '11:00'),
      dateIso: sat.dateIso,
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      capacity: 6,
      bookingCount: 6,
      bookingStatus: '已满员',
      sessionStatus: '待开课',
      teacherAssignment: {
        staffId: S.keke,
        assignmentStatus: '已确认',
        assignmentType: '正常排课',
        isSubstitute: false,
        forced: false,
        assignedAt: `${sat.dateIso}T08:00:00.000Z`,
        assignedBy: S.fangfang,
        confirmedAt: `${sat.dateIso}T08:00:00.000Z`,
      },
      weekDayId: sat.weekDayId,
      weekDayLabel: sat.weekDayLabel,
      weekDateLabel: sat.weekDateLabel,
    }),
  ];
}

type RawWeekCard = {
  sessionId: string;
  dayId: keyof typeof WEEK_DAYS;
  courseName: string;
  courseType: string;
  teacherId: string;
  room: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  waitlistCount?: number;
  checkedInCount?: number;
  pointCost?: number;
  legacyStatus: string;
  storeId?: string;
  payableStatus?: StoreCourseSession['payableStatus'];
};

const MIGRATED_WEEK_CARDS: RawWeekCard[] = [
  { sessionId: 'cs-mon-0930', dayId: 'day-mon', courseName: '晨间流瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 18, bookedCount: 14, legacyStatus: 'openForBooking' },
  { sessionId: 'cs-mon-1030', dayId: 'day-mon', courseName: '基础流瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '10:30', endTime: '11:30', durationMinutes: 60, capacity: 16, bookedCount: 10, legacyStatus: 'scheduled' },
  { sessionId: 'cs-mon-1200', dayId: 'day-mon', courseName: '基础瑜伽小班', courseType: '瑜伽小班', teacherId: 't-lily', room: 'B 教室', startTime: '12:00', endTime: '13:00', durationMinutes: 60, capacity: 8, bookedCount: 3, legacyStatus: 'lowAttendance' },
  { sessionId: 'cs-mon-1600', dayId: 'day-mon', courseName: '私教', courseType: '私教', teacherId: 't-leo', room: '私教区', startTime: '16:00', endTime: '17:00', durationMinutes: 60, capacity: 1, bookedCount: 1, pointCost: 8, legacyStatus: 'scheduled' },
  { sessionId: 'cs-tue-0930', dayId: 'day-tue', courseName: '晨间修复瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 16, bookedCount: 11, legacyStatus: 'scheduled' },
  { sessionId: 'cs-tue-1100', dayId: 'day-tue', courseName: '肩颈舒缓', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 16, bookedCount: 8, legacyStatus: 'scheduled' },
  { sessionId: 'cs-tue-1430', dayId: 'day-tue', courseName: '器械普拉提', courseType: '普拉提小班', teacherId: 't-mia', room: '普拉提教室', startTime: '14:30', endTime: '15:30', durationMinutes: 60, capacity: 6, bookedCount: 5, pointCost: 2, legacyStatus: 'scheduled' },
  { sessionId: 'cs-tue-1830', dayId: 'day-tue', courseName: '基础瑜伽', courseType: '团课', teacherId: 't-lily', room: 'B 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 6, legacyStatus: 'lowAttendance' },
  { sessionId: 'cs-wed-0930', dayId: 'day-wed', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 16, bookedCount: 9, legacyStatus: 'scheduled' },
  { sessionId: 'cs-wed-1100', dayId: 'day-wed', courseName: '基础小班', courseType: '瑜伽小班', teacherId: 't-lily', room: 'B 教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 8, bookedCount: 2, legacyStatus: 'lowAttendance' },
  { sessionId: 'cs-wed-1200', dayId: 'day-wed', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', room: '普拉提教室', startTime: '12:00', endTime: '13:00', durationMinutes: 60, capacity: 6, bookedCount: 3, pointCost: 2, legacyStatus: 'lowAttendance' },
  { sessionId: 'cs-wed-1830', dayId: 'day-wed', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 15, legacyStatus: 'scheduled' },
  { sessionId: 'cs-wed-2030', dayId: 'day-wed', courseName: '晚间基础瑜伽', courseType: '团课', teacherId: 't-lily', room: 'B 教室', startTime: '20:30', endTime: '21:30', durationMinutes: 60, capacity: 16, bookedCount: 5, legacyStatus: 'scheduled' },
  { sessionId: 'cs-thu-1000', dayId: 'day-thu', courseName: '私教', courseType: '私教', teacherId: 't-leo', room: '私教区', startTime: '10:00', endTime: '11:00', durationMinutes: 60, capacity: 1, bookedCount: 1, pointCost: 8, legacyStatus: 'scheduled' },
  { sessionId: 'cs-thu-1200', dayId: 'day-thu', courseName: '瑜伽教培', courseType: '教培 / 内训', teacherId: 't-anna', room: 'A 教室', startTime: '12:00', endTime: '14:00', durationMinutes: 120, capacity: 12, bookedCount: 10, pointCost: 0, legacyStatus: 'scheduled' },
  { sessionId: 'cs-thu-1400', dayId: 'day-thu', courseName: '核心普拉提', courseType: '普拉提小班', teacherId: 't-mia', room: '普拉提教室', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 6, bookedCount: 5, pointCost: 2, legacyStatus: 'scheduled' },
  { sessionId: 'cs-thu-1830', dayId: 'day-thu', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 16, waitlistCount: 2, legacyStatus: 'waitlist' },
  { sessionId: 'cs-thu-1930', dayId: 'day-thu', courseName: '肩颈舒缓', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 16, bookedCount: 11, legacyStatus: 'scheduled' },
  { sessionId: 'cs-fri-0930', dayId: 'day-fri', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 16, bookedCount: 12, checkedInCount: 12, legacyStatus: 'completed', payableStatus: '应付' },
  { sessionId: 'cs-fri-1100', dayId: 'day-fri', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', room: '普拉提教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 6, bookedCount: 5, checkedInCount: 3, pointCost: 2, legacyStatus: 'openForBooking' },
  { sessionId: 'cs-fri-1400', dayId: 'day-fri', courseName: '私教', courseType: '私教', teacherId: 't-leo', room: '私教区', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 1, bookedCount: 1, pointCost: 8, legacyStatus: 'scheduled' },
  { sessionId: 'cs-fri-1830', dayId: 'day-fri', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 18, waitlistCount: 4, legacyStatus: 'full' },
  { sessionId: 'cs-fri-1930', dayId: 'day-fri', courseName: '普拉提小班', courseType: '普拉提小班', teacherId: 't-mia', room: '普拉提教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 6, bookedCount: 2, pointCost: 2, legacyStatus: 'lowAttendance' },
  { sessionId: 'cs-fri-2030', dayId: 'day-fri', courseName: '肩颈舒缓', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '20:30', endTime: '21:30', durationMinutes: 60, capacity: 16, bookedCount: 9, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sat-0930', dayId: 'day-sat', courseName: '周末流瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '09:30', endTime: '10:30', durationMinutes: 60, capacity: 18, bookedCount: 15, waitlistCount: 3, legacyStatus: 'waitlist' },
  { sessionId: 'cs-sat-1030', dayId: 'day-sat', courseName: '基础普拉提', courseType: '普拉提小班', teacherId: 't-anna', room: '普拉提教室', startTime: '10:30', endTime: '11:30', durationMinutes: 60, capacity: 6, bookedCount: 4, pointCost: 2, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sat-1430', dayId: 'day-sat', courseName: '流瑜伽', courseType: '团课', teacherId: 't-nora', room: 'A 教室', startTime: '14:30', endTime: '15:30', durationMinutes: 60, capacity: 18, bookedCount: 14, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sat-1600', dayId: 'day-sat', courseName: '私教体验', courseType: '私教', teacherId: 't-leo', room: '私教区', startTime: '16:00', endTime: '17:00', durationMinutes: 60, capacity: 1, bookedCount: 0, pointCost: 8, legacyStatus: 'openForBooking' },
  { sessionId: 'cs-sat-1930', dayId: 'day-sat', courseName: '内观流', courseType: '团课', teacherId: 't-nora', room: 'A 教室', startTime: '19:30', endTime: '20:30', durationMinutes: 60, capacity: 18, bookedCount: 10, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sun-0900', dayId: 'day-sun', courseName: '阴瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '09:00', endTime: '10:00', durationMinutes: 60, capacity: 16, bookedCount: 8, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sun-1100', dayId: 'day-sun', courseName: '周末小班', courseType: '瑜伽小班', teacherId: 't-mia', room: 'B 教室', startTime: '11:00', endTime: '12:00', durationMinutes: 60, capacity: 6, bookedCount: 4, pointCost: 2, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sun-1400', dayId: 'day-sun', courseName: '基础瑜伽', courseType: '团课', teacherId: 't-lily', room: 'A 教室', startTime: '14:00', endTime: '15:00', durationMinutes: 60, capacity: 16, bookedCount: 5, legacyStatus: 'lowAttendance' },
  { sessionId: 'cs-sun-1600', dayId: 'day-sun', courseName: '修复瑜伽', courseType: '团课', teacherId: 't-anna', room: 'A 教室', startTime: '16:00', endTime: '17:00', durationMinutes: 60, capacity: 16, bookedCount: 7, legacyStatus: 'scheduled' },
  { sessionId: 'cs-sun-1830', dayId: 'day-sun', courseName: '晚间流瑜伽', courseType: '团课', teacherId: 't-nora', room: 'A 教室', startTime: '18:30', endTime: '19:30', durationMinutes: 60, capacity: 18, bookedCount: 13, legacyStatus: 'scheduled' },
];

function buildMigratedWeekSessions(): StoreCourseSession[] {
  const defaultStore = COURSE_SEED_STORES.binjiang;
  return MIGRATED_WEEK_CARDS.filter(card => !SKIP_CS_IDS.has(card.sessionId)).map(card => {
    const day = WEEK_DAYS[card.dayId];
    const mapped = mapLegacyWeekStatus(card.legacyStatus);
    const typeMeta = courseTypeMeta(card.courseType, card.courseName);
    const teacher = resolveTeacher(card.teacherId);
    if (teacher.staffId && card.legacyStatus !== 'teacherLeaveRisk') {
      teacher.assignmentStatus = mapLegacyAssignmentStatus(
        card.teacherId === 't-nora' && card.legacyStatus === 'scheduled' ? '已确认' : '已确认',
      );
    }
    if (card.teacherId === 't-lily') {
      teacher.assignmentStatus = '待指定';
    }

    return mkSession({
      id: sessIdFromCs(card.sessionId),
      legacyIds: [card.sessionId],
      courseId: `course-${card.sessionId}`,
      courseTemplateId: `tpl-${typeMeta.courseTypeId}`,
      courseName: card.courseName,
      courseType: card.courseType,
      courseTypeId: typeMeta.courseTypeId,
      requiredCapabilityIds: typeMeta.requiredCapabilityIds,
      storeId: card.storeId ?? defaultStore.id,
      storeName: defaultStore.name,
      classroomId: `room-${card.room.replace(/\s+/g, '-').toLowerCase()}`,
      classroomName: card.room,
      startAt: toStartAt(day.dateIso, card.startTime),
      endAt: toEndAt(day.dateIso, card.endTime),
      dateIso: day.dateIso,
      startTime: card.startTime,
      endTime: card.endTime,
      durationMinutes: card.durationMinutes,
      capacity: card.capacity,
      bookingCount: card.bookedCount,
      waitlistCount: card.waitlistCount ?? 0,
      checkedInCount: card.checkedInCount ?? 0,
      pointCost: card.pointCost ?? 1,
      sessionStatus: mapped.sessionStatus,
      bookingStatus: mapped.bookingStatus,
      attendanceStatus: mapped.attendanceStatus,
      payableStatus: card.payableStatus ?? '未生成',
      teacherAssignment: teacher,
      sourceModule: 'migration',
      weekDayId: day.weekDayId,
      weekDayLabel: day.weekDayLabel,
      weekDateLabel: day.weekDateLabel,
    });
  });
}

function buildUnresolvedTeacherReferences(): UnresolvedTeacherReference[] {
  return [
    {
      id: 'unresolved-teacher-1',
      source: 'course.t',
      rawValue: 't-lily',
      context: '老师关联待确认：课程侧 Lily 尚未纳入 Staff 主数据',
      markedAt: `${PROTOTYPE_TODAY}T00:00:00.000Z`,
    },
    {
      id: 'unresolved-teacher-2',
      source: 'course.ts',
      rawValue: 'ts-lily',
      context: '老师关联待确认',
      markedAt: `${PROTOTYPE_TODAY}T00:00:00.000Z`,
    },
  ];
}

function buildStaffContextOverrides(): Map<string, Partial<{ capabilityIds: string[]; primaryStoreId: string; supportStoreIds: string[]; weekCount: number }>> {
  const overrides = new Map<string, Partial<{ capabilityIds: string[]; primaryStoreId: string; supportStoreIds: string[]; weekCount: number }>>();
  for (const [staffId, ctx] of Object.entries(STAFF_CAPS)) {
    overrides.set(staffId, ctx);
  }
  overrides.set(CANONICAL_STAFF_IDS.mia, {
    ...STAFF_CAPS[CANONICAL_STAFF_IDS.mia],
    weekCount: 9,
  });
  return overrides;
}

export function buildInitialCourseScheduleSnapshot(): CourseSchedulePersistedSnapshot {
  const sessions = [...buildUnifiedSessions(), ...buildMigratedWeekSessions()];
  const staffContext = buildDefaultStaffContext(sessions, buildStaffContextOverrides());
  const risks = recalculateSessionRisks(sessions, staffContext);

  return {
    version: COURSE_SCHEDULE_STORAGE_VERSION,
    savedAt: nowIso(),
    prototypePersistence: true,
    actorStaffId: CANONICAL_STAFF_IDS.fangfang,
    storeFilterId: 'all',
    sessions,
    scheduleChanges: [],
    teacherChanges: [],
    risks,
    operationLogs: [],
    domainEvents: [],
    unresolvedSessionReferences: buildUnresolvedSessionReferenceRecords(),
    unresolvedTeacherReferences: buildUnresolvedTeacherReferences(),
  };
}
