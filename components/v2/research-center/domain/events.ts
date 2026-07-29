/** Canonical business event names for cross-end sync / notifications (V2.0). */

export const RESEARCH_CENTER_EVENTS = {
  LEAD_CREATED: 'lead.created',
  LEAD_FOLLOWED_UP: 'lead.followed_up',
  INTERVIEW_SCHEDULED: 'interview.scheduled',
  INTERVIEW_COMPLETED: 'interview.completed',
  ENROLLMENT_CREATED: 'enrollment.created',
  RECEIPT_RECORDED: 'receipt.recorded',
  ENROLLMENT_CONFIRMED: 'enrollment.confirmed',
  REFUND_CREATED: 'refund.created',
  COHORT_UPDATED: 'cohort.updated',
  SESSION_CREATED: 'session.created',
  SESSION_RESCHEDULED: 'session.rescheduled',
  SESSION_TEACHER_CHANGED: 'session.teacher_changed',
  ATTENDANCE_SAVED: 'attendance.saved',
  LEAVE_APPROVED: 'leave.approved',
  MAKEUP_SCHEDULED: 'makeup.scheduled',
  MAKEUP_COMPLETED: 'makeup.completed',
  TEACHING_RECORD_SAVED: 'teaching_record.saved',
  SESSION_COMPLETED: 'session.completed',
  MENTOR_PAYABLE_GENERATED: 'mentor_payable.generated',
  MENTOR_PAYABLE_PAID: 'mentor_payable.paid',
  LEAD_STAGE_CHANGED: 'lead.stage_changed',
} as const;

export type ResearchCenterEventName =
  (typeof RESEARCH_CENTER_EVENTS)[keyof typeof RESEARCH_CENTER_EVENTS];
