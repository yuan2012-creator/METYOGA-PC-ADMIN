import type { CreateCourseScheduleServiceOptions, CourseScheduleService } from './CourseScheduleService';
import { LocalStorageCourseScheduleService } from './LocalStorageCourseScheduleService';

let defaultInstance: CourseScheduleService | null = null;

export function createCourseScheduleService(
  options?: CreateCourseScheduleServiceOptions,
): CourseScheduleService {
  const mode = options?.mode ?? 'local';
  const role = options?.role ?? 'hq_admin';
  if (mode === 'remote') {
    // Remote adapter reserved for P2 — fall back to local prototype persistence.
    return new LocalStorageCourseScheduleService(role);
  }
  return new LocalStorageCourseScheduleService(role);
}

export function getDefaultCourseScheduleService(): CourseScheduleService {
  if (!defaultInstance) {
    defaultInstance = createCourseScheduleService({ mode: 'local' });
  }
  return defaultInstance;
}

export function __resetDefaultCourseScheduleServiceForTests(): void {
  defaultInstance = null;
}
