import type {
  AttendanceStatus,
  BookingStatus,
  PayableStatus,
  SessionReferenceResolution,
  SessionRiskType,
  SessionSourceModule,
  SessionStatus,
  TeacherAssignmentStatus,
  TeacherAssignmentType,
} from './enums';
import type { CourseScheduleEventName } from './events';

export type TransitionOptions = {
  forceReason?: string;
};

export interface TeacherAssignment {
  staffId: string | null;
  previousStaffId?: string | null;
  assignmentStatus: TeacherAssignmentStatus;
  assignmentType: TeacherAssignmentType;
  isSubstitute: boolean;
  forced: boolean;
  forcedReason?: string;
  assignedAt?: string;
  assignedBy?: string;
  confirmedAt?: string;
  /** Teacher identity unresolved — show “老师关联待确认”. */
  teacherUnresolved?: boolean;
  unresolvedTeacherHint?: string;
}

export interface SessionScheduleChange {
  id: string;
  sessionId: string;
  originalStartAt: string;
  originalEndAt: string;
  newStartAt: string;
  newEndAt: string;
  reason: string;
  changedAt: string;
  changedBy: string;
  memberNotifyPending: true;
}

export interface SessionTeacherChange {
  id: string;
  sessionId: string;
  fromStaffId: string | null;
  toStaffId: string | null;
  changeType: TeacherAssignmentType;
  reason?: string;
  forced?: boolean;
  changedAt: string;
  changedBy: string;
}

export interface SessionRisk {
  id: string;
  sessionId: string;
  type: SessionRiskType;
  severity: 'P0' | 'P1' | 'P2' | 'info';
  message: string;
  relatedStaffId?: string;
  createdAt: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface SessionReference {
  sessionId: string | null;
  legacySessionId: string;
  legacySource: 'course.cs' | 'course.session' | 'staff.psess' | 'unknown';
  resolution: SessionReferenceResolution;
  note?: string;
}

export interface CourseScheduleOperationLog {
  id: string;
  at: string;
  operatorStaffId: string;
  operatorName: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: string;
  after?: string;
  reason?: string;
  forced?: boolean;
}

export interface CourseScheduleDomainEvent {
  id: string;
  name: CourseScheduleEventName;
  at: string;
  actorStaffId: string;
  actorName: string;
  objectType: string;
  objectId: string;
  before?: string;
  after?: string;
  reason?: string;
  forced?: boolean;
  payload?: Record<string, unknown>;
}

export interface StoreCourseSession {
  id: string;
  legacyIds: string[];
  courseId: string;
  courseTemplateId: string;
  courseName: string;
  courseType: string;
  courseTypeId: string;
  requiredCapabilityIds: string[];
  storeId: string;
  storeName: string;
  classroomId: string;
  classroomName: string;
  /** ISO datetime */
  startAt: string;
  endAt: string;
  originalStartAt?: string;
  originalEndAt?: string;
  dateIso: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  bookingCount: number;
  waitlistCount: number;
  checkedInCount: number;
  pointCost: number;
  sessionStatus: SessionStatus;
  bookingStatus: BookingStatus;
  attendanceStatus: AttendanceStatus;
  teacherAssignment: TeacherAssignment;
  sourceModule: SessionSourceModule;
  payableStatus: PayableStatus;
  weekDayId?: string;
  weekDayLabel?: string;
  weekDateLabel?: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface LegacySessionMappingEntry {
  legacyKey: string;
  legacySource: SessionReference['legacySource'];
  sessionId: string | null;
  resolution: SessionReferenceResolution;
  note?: string;
}

export interface UnresolvedSessionReference {
  id: string;
  source: string;
  rawValue: string;
  context: string;
  markedAt: string;
}

export interface AssignTeacherOptions {
  forced?: boolean;
  forcedReason?: string;
  assignmentType?: TeacherAssignmentType;
  actorStaffId?: string;
  actorName?: string;
}

export interface RescheduleSessionInput {
  startAt: string;
  endAt: string;
  reason: string;
}

export interface SuspendSessionInput {
  reason: string;
}
