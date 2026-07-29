/**
 * Course Schedule permission action codes (P1).
 * Prototype role matrix — does not replace the global permission system.
 */

export const COURSE_SCHEDULE_PERMISSIONS = {
  SCHEDULE_VIEW: 'course.schedule.view',
  SCHEDULE_EDIT: 'course.schedule.edit',
  SESSION_VIEW: 'course.session.view',
  SESSION_ASSIGN_TEACHER: 'course.session.assign_teacher',
  SESSION_REPLACE_TEACHER: 'course.session.replace_teacher',
  SESSION_RESCHEDULE: 'course.session.reschedule',
  SESSION_CANCEL: 'course.session.cancel',
  SESSION_FORCE_ASSIGN: 'course.session.force_assign',
  TEST_DATA_RESET: 'course.test_data.reset',
} as const;

export type CourseSchedulePermission =
  (typeof COURSE_SCHEDULE_PERMISSIONS)[keyof typeof COURSE_SCHEDULE_PERMISSIONS];

export type CourseScheduleActorRole =
  | 'hq_admin'
  | 'store_manager'
  | 'teaching_lead'
  | 'finance'
  | 'teacher';

const ALL_PERMISSIONS = Object.values(COURSE_SCHEDULE_PERMISSIONS);

const ROLE_PERMISSIONS: Record<CourseScheduleActorRole, readonly CourseSchedulePermission[]> = {
  hq_admin: ALL_PERMISSIONS,
  store_manager: [
    COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_VIEW,
    COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_EDIT,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_VIEW,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_ASSIGN_TEACHER,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_REPLACE_TEACHER,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_RESCHEDULE,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_CANCEL,
  ],
  teaching_lead: [
    COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_VIEW,
    COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_EDIT,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_VIEW,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_ASSIGN_TEACHER,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_REPLACE_TEACHER,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_RESCHEDULE,
  ],
  finance: [
    COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_VIEW,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_VIEW,
  ],
  teacher: [
    COURSE_SCHEDULE_PERMISSIONS.SCHEDULE_VIEW,
    COURSE_SCHEDULE_PERMISSIONS.SESSION_VIEW,
  ],
};

export function hasCourseSchedulePermission(
  role: CourseScheduleActorRole,
  action: CourseSchedulePermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function createCourseSchedulePermissionChecker(
  role: CourseScheduleActorRole = 'hq_admin',
) {
  return {
    role,
    can: (action: CourseSchedulePermission) => hasCourseSchedulePermission(role, action),
  };
}
