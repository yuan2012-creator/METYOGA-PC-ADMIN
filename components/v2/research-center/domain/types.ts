/**
 * Research Center V2.0 domain object shapes.
 * Association fields use IDs only — never display names as join keys.
 */

import type {
  AttendanceStatus,
  CohortStatus,
  ContractStatus,
  LeadStage,
  LeaveStatus,
  MakeupStatus,
  PayableStatus,
  PaymentStatus,
  SessionStatus,
} from './enums';
import type { MoneyYuan } from './money';

export const RESEARCH_CENTER_DEFAULT_BUSINESS_UNIT_ID = 'bu-metyoga-hq';

export interface DomainTimestamps {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface BusinessUnit extends DomainTimestamps {
  id: string;
  name: string;
  code?: string;
}

export interface Venue extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  name: string;
}

export interface Classroom extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  venueId: string;
  name: string;
}

export interface TrainingProduct extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  code: string;
  name: string;
  standardPriceYuan: MoneyYuan;
}

export interface StaffReference {
  id: string;
  businessUnitId: string;
  displayName: string;
  roleHints?: string[];
}

export interface StudentReference {
  id: string;
  businessUnitId: string;
  leadId?: string;
  enrollmentId?: string;
  displayName: string;
  phone?: string;
}

export interface Cohort extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  productId?: string;
  name: string;
  displayTitle: string;
  standardPriceYuan: MoneyYuan;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  maxCount: number;
  breakevenCount: number;
  lockCount: number;
  targetCount: number;
  venueId?: string;
  classroomId?: string;
  venue: string;
  classroom: string;
  recruitmentOwnerId?: string;
  trainingOwnerId?: string;
  recruitmentOwner: string;
  trainingOwner: string;
  status: CohortStatus | string;
  statusTone: 'danger' | 'warning' | 'normal';
  projectDirectCostYuan: MoneyYuan;
  otherFixedProjectCostYuan: MoneyYuan;
  commissionRate: number;
  mentorDirectCostYuan: MoneyYuan;
  accommodationCostYuan: MoneyYuan;
  notes: string;
  durationDays: number;
  paidCount: number;
  totalReceiptYuan: MoneyYuan;
  salesCommissionYuan: MoneyYuan;
  contributionProfitYuan: MoneyYuan;
}

export interface Lead extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  name: string;
  phone?: string;
  wechat?: string;
  course: string;
  intentLevel: string;
  intentTone: 'high' | 'medium' | 'low';
  stage: LeadStage | string;
  expectedAmountYuan: MoneyYuan;
  paidAmountYuan: MoneyYuan;
  lastFollowUp: string;
  nextFollowUpDate?: string;
  overdueDays: number;
  ownerId?: string;
  owner: string;
  suggestedAction: string;
  categories: string[];
  enrolled: boolean;
  source?: string;
  learningBase?: string;
  learningPurpose?: string;
  budgetNote?: string;
  timeCondition?: string;
  targetCohortId?: string;
  note?: string;
  enrolledCohortIds?: string[];
  anomaly?: string | null;
}

export interface Followup extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  leadId: string;
  method: string;
  result: string;
  nextStep: string;
  nextFollowUpDate: string;
  intentLevel?: string;
  stage?: string;
  note?: string;
}

export interface Interview extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  leadId: string;
  status: '待面试' | '已面试';
  result?: string;
  suggestedCourse?: string;
  interviewerId?: string;
  interviewer?: string;
  note?: string;
  scheduledAt?: string;
  interviewMode?: string;
  foundationEval?: string;
  timeEval?: string;
  goalEval?: string;
  riskNote?: string;
}

export interface Enrollment extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  leadId: string;
  cohortId: string;
  studentId?: string;
  studentName: string;
  course: string;
  standardPriceYuan: MoneyYuan;
  dealPriceYuan: MoneyYuan;
  paidAmountYuan: MoneyYuan;
  enrollmentStatus: string;
  paymentStatus: PaymentStatus | string;
  contractStatus: ContractStatus | string;
  paymentMethod: string;
  ownerId?: string;
  owner: string;
  refunded: boolean;
  joined: boolean;
  note?: string;
}

export interface Receipt extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  enrollmentId: string;
  leadId?: string;
  cohortId: string;
  studentId?: string;
  amountYuan: MoneyYuan;
  paymentMethod: string;
  date: string;
  operatorId?: string;
  operator: string;
  serialNo?: string;
  status?: string;
  note?: string;
  kind?: 'receipt' | 'refund' | 'payout';
}

export interface Refund extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  enrollmentId: string;
  leadId?: string;
  cohortId: string;
  studentId?: string;
  amountYuan: MoneyYuan;
  reason: string;
  date: string;
  operatorId?: string;
  operator: string;
  exitCohort: boolean;
  serialNo?: string;
}

export interface TrainingSession extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  cohortId: string;
  dateIso: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  contentTemplateId?: string;
  teacherId?: string;
  teacher: string;
  venueId?: string;
  classroomId?: string;
  venue: string;
  classroom: string;
  sessionType: string;
  calcPay: boolean;
  payMethod?: string;
  payAmountYuan: MoneyYuan;
  customPayReason?: string;
  note: string;
  status: SessionStatus;
  originalDateIso?: string;
  cancelReason?: string;
  attendanceSaved?: boolean;
  signedCount?: number;
  leaveCount?: number;
  absentCount?: number;
  teachingRecordId?: string;
}

export interface AttendanceEntry {
  studentId: string;
  leadId: string;
  status: AttendanceStatus;
  note?: string;
  previousStatus?: AttendanceStatus;
}

export interface Attendance extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  entries: AttendanceEntry[];
  operatorId?: string;
  operator: string;
  savedAt: string;
}

export interface LeaveRequest extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  studentId: string;
  leadId: string;
  reason: string;
  leaveAt: string;
  needMakeup: boolean;
  note?: string;
  operatorId?: string;
  operator: string;
  status: LeaveStatus;
  makeupId?: string;
}

export interface MakeupRecord extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  studentId: string;
  leadId: string;
  leaveRequestId?: string;
  method: string;
  makeupDate: string;
  makeupSessionId?: string;
  teacherId?: string;
  teacher: string;
  note?: string;
  status: MakeupStatus;
  completedAt?: string;
}

export interface TeachingRecord extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  cohortId: string;
  sessionId: string;
  contentActual: string;
  completionStatus: string;
  studentPerformance: string;
  keyIssues: string;
  nextSuggestion: string;
  attachmentNote: string;
  recorderId?: string;
  recorder: string;
  recordedAt: string;
  anomalyNote?: string;
}

export interface MentorPayable extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  teacherId?: string;
  teacher: string;
  cohortId: string;
  sessionId: string;
  sessionLabel: string;
  dueAmountYuan: MoneyYuan;
  paidAmountYuan: MoneyYuan;
  dueDate: string;
  status: PayableStatus | string;
}

export interface PaymentPlan extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  cohortId?: string;
  title: string;
  dueAmountYuan: MoneyYuan;
  paidAmountYuan: MoneyYuan;
  dueDate?: string;
  status: string;
}

export interface OperationLog extends DomainTimestamps {
  id: string;
  businessUnitId: string;
  at: string;
  operatorId?: string;
  operator: string;
  type: string;
  target: string;
  targetId?: string;
  before: string;
  after: string;
  reason: string;
  forced?: boolean;
  eventName?: string;
}

export interface DomainEvent {
  id: string;
  businessUnitId: string;
  name: string;
  at: string;
  actorId?: string;
  actorName: string;
  objectType: string;
  objectId: string;
  before?: string;
  after?: string;
  reason?: string;
  forced?: boolean;
  payload?: Record<string, unknown>;
}

export interface TransitionOptions {
  forceReason?: string;
  actorName?: string;
}
