/** Staff domain event names (V2.1). */

export const STAFF_EVENTS = {
  PROFILE_UPDATED: 'staff.profile.updated',
  STORE_ASSIGNED: 'staff.store.assigned',
  CAPABILITY_UPDATED: 'staff.capability.updated',
  AVAILABILITY_UPDATED: 'staff.availability.updated',
  SCHEDULE_ASSIGNED: 'staff.schedule.assigned',
  SCHEDULE_REPLACED: 'staff.schedule.replaced',
  APPLICATION_SUBMITTED: 'staff.application.submitted',
  APPLICATION_APPROVED: 'staff.application.approved',
  APPLICATION_REJECTED: 'staff.application.rejected',
  APPLICATION_SUPPLEMENT_REQUESTED: 'staff.application.supplement_requested',
  APPLICATION_OWNER_ASSIGNED: 'staff.application.owner_assigned',
  APPLICATION_EXECUTED: 'staff.application.executed',
  APPLICATION_EXECUTION_FAILED: 'staff.application.execution_failed',
  TODO_ASSIGNED: 'staff.todo.assigned',
  TODO_DISMISSED: 'staff.todo.dismissed',
  ISSUE_RESOLVED: 'staff.issue.resolved',
  TEST_DATA_RESET: 'staff.test_data.reset',
} as const;

export type StaffEventName = (typeof STAFF_EVENTS)[keyof typeof STAFF_EVENTS];
