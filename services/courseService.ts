/**
 * P0 课程运营域只读 service：从 MOCK_COURSES / MOCK_COURSE_SESSIONS / MOCK_BOOKINGS / MOCK_ATTENDANCES
 * 经 courseAdapter 返回；不接云函数、不发起网络请求。
 */

import {
  adaptAttendances,
  adaptBookings,
  adaptConsumptions,
  adaptCourse,
  adaptCourses,
  adaptCourseSession,
  adaptCourseSessions,
} from '../adapters/courseAdapter';
import {
  MOCK_ATTENDANCES,
  MOCK_BOOKINGS,
  MOCK_COURSES,
  MOCK_COURSE_SESSIONS,
} from '../constants';
import type {
  Attendance,
  Booking,
  Course,
  CourseSession,
  MockCourseConsumptionRecord,
} from '../types';
import {
  buildReadonlyMeta,
  defaultReadonlyDataSource,
  generateReadonlyRequestId,
  readonlyLiveNotConnectedError,
} from './apiClient';
import type { ReadonlyApiResult, ReadonlyQueryParams } from './readonlyTypes';

/**
 * TODO: `constants` 尚无全局耗课 mock；接入 `MOCK_COURSE_CONSUMPTIONS` 或云函数只读查询后替换此占位源。
 * 不在此调用 `buildMockConsumptionRecords` 等合成逻辑，避免在只读 service 层生成耗课业务数据。
 */
const READONLY_COURSE_CONSUMPTIONS: MockCourseConsumptionRecord[] = [];

function baseQueryParams(overrides: Partial<ReadonlyQueryParams>): ReadonlyQueryParams {
  return {
    requestId: overrides.requestId ?? generateReadonlyRequestId(),
    page: overrides.page ?? 1,
    pageSize: overrides.pageSize ?? 20,
    storeId: overrides.storeId,
    from: overrides.from,
    to: overrides.to,
    role: overrides.role,
    dataSource: overrides.dataSource ?? defaultReadonlyDataSource(),
  };
}

export interface FetchCourseDomainParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
  courseId?: string;
  courseSessionId?: string;
  memberId?: string;
  teacherId?: string;
}

export interface FetchCourseDetailParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

export interface FetchCourseSessionDetailParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

function paginate<T>(list: T[], page: number, pageSize: number): { slice: T[]; total: number } {
  const total = list.length;
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(500, pageSize));
  const start = (safePage - 1) * safeSize;
  return { slice: list.slice(start, start + safeSize), total };
}

/** ISO 字符串安全区间过滤；字段缺失时保留记录，避免误删 */
function recordInTimeRange(iso: string | undefined, from?: string, to?: string): boolean {
  if (!from?.trim() && !to?.trim()) return true;
  if (!iso?.trim()) return true;
  const f = from?.trim();
  const t = to?.trim();
  if (f && iso < f) return false;
  if (t && iso > t) return false;
  return true;
}

function sessionIdsForMember(memberId: string): Set<string> {
  const ids = new Set<string>();
  for (const b of MOCK_BOOKINGS) {
    if (b.memberId === memberId) ids.add(b.courseSessionId);
  }
  for (const a of MOCK_ATTENDANCES) {
    if (a.memberId === memberId) ids.add(a.courseSessionId);
  }
  return ids;
}

function courseIdsForMember(memberId: string): Set<string> {
  const sessionIds = sessionIdsForMember(memberId);
  const out = new Set<string>();
  for (const s of MOCK_COURSE_SESSIONS) {
    if (sessionIds.has(s.id)) out.add(s.courseId);
  }
  return out;
}

function filterCourses(list: typeof MOCK_COURSES, params: FetchCourseDomainParams): typeof MOCK_COURSES {
  let next = [...list];
  if (params.courseId?.trim()) {
    next = next.filter(c => c.id === params.courseId);
  }
  if (params.memberId?.trim()) {
    const allow = courseIdsForMember(params.memberId);
    next = next.filter(c => allow.has(c.id));
  }
  return next;
}

function filterCourseSessions(
  list: typeof MOCK_COURSE_SESSIONS,
  params: FetchCourseDomainParams
): typeof MOCK_COURSE_SESSIONS {
  let next = [...list];
  if (params.storeId?.trim()) {
    next = next.filter(s => !s.storeId || s.storeId === params.storeId);
  }
  if (params.courseId?.trim()) {
    next = next.filter(s => s.courseId === params.courseId);
  }
  if (params.courseSessionId?.trim()) {
    next = next.filter(s => s.id === params.courseSessionId);
  }
  if (params.teacherId?.trim()) {
    next = next.filter(s => s.teacherId === params.teacherId);
  }
  if (params.memberId?.trim()) {
    const allow = sessionIdsForMember(params.memberId);
    next = next.filter(s => allow.has(s.id));
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(s => recordInTimeRange(s.startAt, params.from, params.to));
  }
  return next;
}

function filterBookings(list: typeof MOCK_BOOKINGS, params: FetchCourseDomainParams): typeof MOCK_BOOKINGS {
  let next = [...list];
  if (params.courseSessionId?.trim()) {
    next = next.filter(b => b.courseSessionId === params.courseSessionId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(b => b.memberId === params.memberId);
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(b => recordInTimeRange(b.bookedAt, params.from, params.to));
  }
  return next;
}

function filterAttendances(
  list: typeof MOCK_ATTENDANCES,
  params: FetchCourseDomainParams
): typeof MOCK_ATTENDANCES {
  let next = [...list];
  if (params.courseSessionId?.trim()) {
    next = next.filter(a => a.courseSessionId === params.courseSessionId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(a => a.memberId === params.memberId);
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(a =>
      recordInTimeRange(a.consumedAt ?? a.attendedAt ?? a.checkedInAt, params.from, params.to)
    );
  }
  return next;
}

function filterConsumptions(
  list: MockCourseConsumptionRecord[],
  params: FetchCourseDomainParams
): MockCourseConsumptionRecord[] {
  let next = [...list];
  if (params.courseSessionId?.trim()) {
    next = next.filter(c => c.courseSessionId === params.courseSessionId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(c => c.memberId === params.memberId);
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(c => recordInTimeRange(c.consumedAt, params.from, params.to));
  }
  return next;
}

export function fetchCourses(params: FetchCourseDomainParams = {}): ReadonlyApiResult<Course[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterCourses(MOCK_COURSES, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptCourses(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_LIST_FAILED', message: '课程列表读取失败（只读 mock）。' },
    };
  }
}

export function fetchCourseDetail(
  courseId: string,
  params: FetchCourseDetailParams = {}
): ReadonlyApiResult<Course> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  if (!courseId?.trim()) {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_ID_REQUIRED', message: 'courseId 不能为空。' },
    };
  }
  try {
    const found = MOCK_COURSES.find(c => c.id === courseId);
    if (!found) {
      return {
        data: null,
        meta: buildReadonlyMeta({ ...qp, pageSize: 1 }, 0),
        error: { code: 'COURSE_NOT_FOUND', message: '未找到该课程（mock）。' },
      };
    }
    return {
      data: adaptCourse(found),
      meta: buildReadonlyMeta({ ...qp, page: 1, pageSize: 1 }, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_DETAIL_FAILED', message: '课程详情读取失败（只读 mock）。' },
    };
  }
}

export function fetchCourseSessions(params: FetchCourseDomainParams = {}): ReadonlyApiResult<CourseSession[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterCourseSessions(MOCK_COURSE_SESSIONS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptCourseSessions(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_SESSIONS_FAILED', message: '课程场次列表读取失败（只读 mock）。' },
    };
  }
}

export function fetchCourseSessionDetail(
  courseSessionId: string,
  params: FetchCourseSessionDetailParams = {}
): ReadonlyApiResult<CourseSession> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  if (!courseSessionId?.trim()) {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_SESSION_ID_REQUIRED', message: 'courseSessionId 不能为空。' },
    };
  }
  try {
    const found = MOCK_COURSE_SESSIONS.find(s => s.id === courseSessionId);
    if (!found) {
      return {
        data: null,
        meta: buildReadonlyMeta({ ...qp, pageSize: 1 }, 0),
        error: { code: 'COURSE_SESSION_NOT_FOUND', message: '未找到该场次（mock）。' },
      };
    }
    return {
      data: adaptCourseSession(found),
      meta: buildReadonlyMeta({ ...qp, page: 1, pageSize: 1 }, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_SESSION_DETAIL_FAILED', message: '场次详情读取失败（只读 mock）。' },
    };
  }
}

export function fetchBookings(params: FetchCourseDomainParams = {}): ReadonlyApiResult<Booking[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterBookings(MOCK_BOOKINGS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptBookings(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_BOOKINGS_FAILED', message: '预约列表读取失败（只读 mock）。' },
    };
  }
}

export function fetchBookingsBySessionId(
  courseSessionId: string,
  params: Omit<FetchCourseDomainParams, 'courseSessionId'> = {}
): ReadonlyApiResult<Booking[]> {
  return fetchBookings({ ...params, courseSessionId });
}

export function fetchAttendances(params: FetchCourseDomainParams = {}): ReadonlyApiResult<Attendance[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterAttendances(MOCK_ATTENDANCES, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptAttendances(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_ATTENDANCES_FAILED', message: '签到/到课列表读取失败（只读 mock）。' },
    };
  }
}

export function fetchAttendancesBySessionId(
  courseSessionId: string,
  params: Omit<FetchCourseDomainParams, 'courseSessionId'> = {}
): ReadonlyApiResult<Attendance[]> {
  return fetchAttendances({ ...params, courseSessionId });
}

export function fetchConsumptions(params: FetchCourseDomainParams = {}): ReadonlyApiResult<MockCourseConsumptionRecord[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterConsumptions(READONLY_COURSE_CONSUMPTIONS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptConsumptions(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_CONSUMPTIONS_FAILED', message: '耗课列表读取失败（只读 mock）。' },
    };
  }
}

export function fetchConsumptionsBySessionId(
  courseSessionId: string,
  params: Omit<FetchCourseDomainParams, 'courseSessionId'> = {}
): ReadonlyApiResult<MockCourseConsumptionRecord[]> {
  return fetchConsumptions({ ...params, courseSessionId });
}

/** 课程运营页初始化用只读快照（constants mock 经 adapter；不含 courseOps 场景合并） */
export interface CourseReadonlySnapshot {
  courses: Course[];
  courseSessions: CourseSession[];
  bookings: Booking[];
  attendances: Attendance[];
  consumptions: MockCourseConsumptionRecord[];
}

export interface FetchCourseReadonlySnapshotParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

/**
 * 一次性拉取课程 / 场次 / 预约 / 签到 / 耗课占位列表（只读 mock，全量至 pageSize 上限）
 */
export function fetchCourseReadonlySnapshot(
  params: FetchCourseReadonlySnapshotParams = {}
): ReadonlyApiResult<CourseReadonlySnapshot> {
  const qp = baseQueryParams({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 500 });

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    const courses = adaptCourses([...MOCK_COURSES]);
    const courseSessions = adaptCourseSessions([...MOCK_COURSE_SESSIONS]);
    const bookings = adaptBookings([...MOCK_BOOKINGS]);
    const attendances = adaptAttendances([...MOCK_ATTENDANCES]);
    const consumptions = adaptConsumptions([...READONLY_COURSE_CONSUMPTIONS]);
    return {
      data: { courses, courseSessions, bookings, attendances, consumptions },
      meta: buildReadonlyMeta(qp, courses.length),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'COURSE_SNAPSHOT_FAILED', message: '课程域快照读取失败（只读 mock）。' },
    };
  }
}
