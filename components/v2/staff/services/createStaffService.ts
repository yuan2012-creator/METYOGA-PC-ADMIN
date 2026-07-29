import {
  __resetDefaultCourseScheduleAdapterForTests,
} from '../../course/adapters';
import { clearCourseScheduleSnapshot } from '../../course/courseSchedulePersistence';
import {
  __resetDefaultCourseScheduleServiceForTests,
} from '../../course/services/createCourseScheduleService';
import type { CreateStaffServiceOptions, StaffService } from './StaffService';
import { LocalStorageStaffService } from './LocalStorageStaffService';
import { RemoteStaffService } from './RemoteStaffService';

let defaultInstance: StaffService | null = null;

export function createStaffService(options?: CreateStaffServiceOptions): StaffService {
  const mode = options?.mode ?? 'local';
  const role = options?.role ?? 'hq_admin';
  if (mode === 'remote') {
    return new RemoteStaffService(role);
  }
  return new LocalStorageStaffService(role);
}

export function getDefaultStaffService(): StaffService {
  if (!defaultInstance) {
    defaultInstance = createStaffService({ mode: 'local' });
  }
  return defaultInstance;
}

export function __resetStaffServiceInstanceForTests(): void {
  defaultInstance = null;
  __resetDefaultCourseScheduleAdapterForTests();
  __resetDefaultCourseScheduleServiceForTests();
}

export function __resetDefaultStaffServiceForTests(): void {
  __resetStaffServiceInstanceForTests();
  clearCourseScheduleSnapshot();
}
