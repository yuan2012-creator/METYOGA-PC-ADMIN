import type {
  CourseScheduleDomainEvent,
  CourseScheduleOperationLog,
  SessionRisk,
  SessionScheduleChange,
  SessionTeacherChange,
  StoreCourseSession,
  UnresolvedSessionReference,
} from './domain/types';

/** Prototype localStorage key — not a real database. */
export const COURSE_SCHEDULE_STORAGE_KEY = 'met-course-schedule-v1';
export const COURSE_SCHEDULE_STORAGE_VERSION = 1;

export interface UnresolvedTeacherReference {
  id: string;
  source: string;
  rawValue: string;
  context: string;
  markedAt: string;
}

export interface CourseSchedulePersistedSnapshot {
  version: number;
  savedAt: string;
  /** Prototype marker — not a real database. */
  prototypePersistence: true;
  actorStaffId: string;
  storeFilterId: string | 'all';
  sessions: StoreCourseSession[];
  scheduleChanges: SessionScheduleChange[];
  teacherChanges: SessionTeacherChange[];
  risks: SessionRisk[];
  operationLogs: CourseScheduleOperationLog[];
  domainEvents: CourseScheduleDomainEvent[];
  unresolvedSessionReferences: UnresolvedSessionReference[];
  unresolvedTeacherReferences: UnresolvedTeacherReference[];
}

export function isValidCourseScheduleSnapshot(
  raw: unknown,
): raw is CourseSchedulePersistedSnapshot {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as Partial<CourseSchedulePersistedSnapshot>;
  return Array.isArray(s.sessions) && typeof s.version === 'number';
}

export function migrateCourseScheduleSnapshot(
  raw: unknown,
): CourseSchedulePersistedSnapshot | null {
  if (!isValidCourseScheduleSnapshot(raw)) return null;
  return {
    ...raw,
    version: COURSE_SCHEDULE_STORAGE_VERSION,
    savedAt: raw.savedAt || new Date().toISOString(),
    prototypePersistence: true,
    actorStaffId: raw.actorStaffId || 'staff_fangfang',
    storeFilterId: raw.storeFilterId || 'all',
    scheduleChanges: Array.isArray(raw.scheduleChanges) ? raw.scheduleChanges : [],
    teacherChanges: Array.isArray(raw.teacherChanges) ? raw.teacherChanges : [],
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    operationLogs: Array.isArray(raw.operationLogs) ? raw.operationLogs : [],
    domainEvents: Array.isArray(raw.domainEvents) ? raw.domainEvents : [],
    unresolvedSessionReferences: Array.isArray(raw.unresolvedSessionReferences)
      ? raw.unresolvedSessionReferences
      : [],
    unresolvedTeacherReferences: Array.isArray(raw.unresolvedTeacherReferences)
      ? raw.unresolvedTeacherReferences
      : [],
  };
}

export function loadCourseScheduleSnapshot(): CourseSchedulePersistedSnapshot | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(COURSE_SCHEDULE_STORAGE_KEY);
    if (!raw) return null;
    return migrateCourseScheduleSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveCourseScheduleSnapshot(snapshot: CourseSchedulePersistedSnapshot): void {
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage 不可用');
  }
  const payload: CourseSchedulePersistedSnapshot = {
    ...snapshot,
    version: COURSE_SCHEDULE_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    prototypePersistence: true,
  };
  localStorage.setItem(COURSE_SCHEDULE_STORAGE_KEY, JSON.stringify(payload));
}

export function clearCourseScheduleSnapshot(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(COURSE_SCHEDULE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
