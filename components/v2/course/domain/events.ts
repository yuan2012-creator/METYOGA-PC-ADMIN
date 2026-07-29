/** Course Schedule domain event names (P1). */

export const COURSE_SCHEDULE_EVENTS = {
  SESSION_CREATED: 'course.session.created',
  SESSION_UPDATED: 'course.session.updated',
  TEACHER_ASSIGNED: 'course.session.teacher_assigned',
  TEACHER_REPLACED: 'course.session.teacher_replaced',
  TEACHER_CONFIRMED: 'course.session.teacher_confirmed',
  SESSION_RESCHEDULED: 'course.session.rescheduled',
  SESSION_CANCELLED: 'course.session.cancelled',
  SESSION_SUSPENDED: 'course.session.suspended',
  LEAVE_IMPACT_APPLIED: 'course.session.leave_impact_applied',
  SUBSTITUTE_IMPACT_APPLIED: 'course.session.substitute_impact_applied',
  RISKS_RECALCULATED: 'course.session.risks_recalculated',
  TEST_DATA_RESET: 'course.schedule.test_data_reset',
} as const;

export type CourseScheduleEventName =
  (typeof COURSE_SCHEDULE_EVENTS)[keyof typeof COURSE_SCHEDULE_EVENTS];
