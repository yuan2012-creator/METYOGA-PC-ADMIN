import type {
  AvailabilityStatus,
  CooperationType,
  EmploymentStatus,
  MentorLevel,
  ScheduleAssignmentStatus,
  StaffApplicationStatus,
  StaffApplicationType,
  StaffIssueSeverity,
  StaffIssueType,
  StaffReferenceResolution,
  StaffRoleCode,
  StaffTodoType,
  StewardLevel,
  TeachingLevel,
  WorkloadStatus,
} from './enums';
import type { StaffEventName } from './events';

export type TransitionOptions = {
  forceReason?: string;
};

export interface StaffRoleAssignment {
  roleCode: StaffRoleCode;
  storeId?: string;
  label: string;
  active: boolean;
}

export interface StoreAssignment {
  storeId: string;
  storeName: string;
  isPrimary: boolean;
  isSupport: boolean;
}

export interface TeachingCapability {
  id: string;
  capabilityId: string;
  capabilityLabel: string;
  courseTypeIds: string[];
  levelRequired?: TeachingLevel;
}

export interface StaffAvailability {
  staffId: string;
  status: AvailabilityStatus;
  weeklySlots: Array<{
    dayOfWeek: number; // 0=Sun … 6=Sat
    startTime: string;
    endTime: string;
  }>;
  blockedDates: string[];
  note?: string;
  updatedAt: string;
}

export interface CourseSessionReference {
  sessionId: string;
  courseName: string;
  courseTypeId: string;
  storeId: string;
  storeName: string;
  room: string;
  dateIso: string;
  startTime: string;
  endTime: string;
  requiredCapabilityIds: string[];
  bookedCount: number;
  capacity: number;
  /** Prototype adapter flag — not synced to Course module. */
  prototypeAdapter: true;
}

export interface ScheduleAssignment {
  id: string;
  session: CourseSessionReference;
  staffId: string | null;
  status: ScheduleAssignmentStatus;
  previousStaffId?: string | null;
  riskTags: string[];
  ownerStaffId: string | null;
  applicationId?: string;
  updatedAt: string;
  note?: string;
}

export interface StaffEvidence {
  id: string;
  label: string;
  status: 'submitted' | 'pending' | 'missing' | 'na';
  url?: string;
}

export interface StaffApplication {
  id: string;
  type: StaffApplicationType;
  status: StaffApplicationStatus;
  applicantStaffId: string;
  ownerStaffId: string | null;
  storeId: string;
  reason: string;
  note?: string;
  relatedSessionIds: string[];
  substituteStaffId?: string | null;
  rescheduleTo?: { dateIso: string; startTime: string; endTime: string } | null;
  evidence: StaffEvidence[];
  approvalComment?: string;
  rejectReason?: string;
  supplementRequest?: string;
  submittedAt: string;
  updatedAt: string;
  impactExecuted?: boolean;
  executionError?: string;
}

export interface StaffTodo {
  id: string;
  type: StaffTodoType;
  title: string;
  ownerStaffId: string | null;
  relatedApplicationId?: string;
  relatedIssueId?: string;
  relatedSessionId?: string;
  relatedStaffId?: string;
  dueAt?: string;
  severity: StaffIssueSeverity;
  dismissed?: boolean;
  dedupeKey: string;
  createdAt: string;
}

export interface StaffIssue {
  id: string;
  type: StaffIssueType;
  title: string;
  severity: StaffIssueSeverity;
  ownerStaffId: string | null;
  relatedSessionId?: string;
  relatedStaffId?: string;
  relatedApplicationId?: string;
  dueAt?: string;
  nextAction: string;
  resolved?: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface StaffOperationLog {
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

export interface StaffDomainEvent {
  id: string;
  name: StaffEventName;
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

export interface StaffMember {
  id: string;
  employeeCode: string;
  name: string;
  mobileMasked: string;
  avatar: string;
  employmentStatus: EmploymentStatus;
  cooperationType: CooperationType;
  joinDate: string;
  primaryStoreId: string;
  supportStoreIds: string[];
  roleAssignments: StaffRoleAssignment[];
  teachingLevel?: TeachingLevel;
  mentorLevel?: MentorLevel;
  stewardLevel?: StewardLevel;
  capabilityIds: string[];
  availabilityStatus: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
  /** Read-only facts — never editable via profile forms. */
  readonlyFacts?: {
    taughtSessionCount?: number;
    attendanceRate?: number;
    fillRate?: number;
    teachingScore?: number;
    payableDueYuan?: number;
    payablePaidYuan?: number;
    memberConversion?: number;
    complaintCount?: number;
  };
}

export interface LegacyStaffMappingEntry {
  legacyKey: string;
  legacySource:
    | 'types.Staff.id'
    | 'StaffTeacherRow.stf'
    | 'StaffTeacherRow.T'
    | 'StaffV2.teacher'
    | 'course.t'
    | 'course.ts'
    | 'research.mentorName'
    | 'research.teacherId'
    | 'finance.teacherName'
    | 'member.assignedCoach'
    | 'displayName';
  staffId: string | null;
  resolution: StaffReferenceResolution;
  displayHint?: string;
  note?: string;
}

export interface UnresolvedStaffReference {
  id: string;
  source: string;
  rawValue: string;
  context: string;
  markedAt: string;
}

export interface StaffWorkbenchMetrics {
  todayTeachingStaffCount: number;
  pendingGapCount: number;
  leaveSubstituteTodoCount: number;
  supplyRiskNext7Days: number;
  payablePendingCount: number;
  payableAbnormalCount: number;
}

export interface StaffLoadRow {
  staffId: string;
  name: string;
  primaryStoreName: string;
  todaySessionCount: number;
  next7DaySessionCount: number;
  workloadStatus: WorkloadStatus;
  availabilityStatus: AvailabilityStatus;
  currentIssues: string[];
  nextAction: string;
}

export interface AvailableTeacherCandidate {
  staffId: string;
  name: string;
  teachingLevel?: TeachingLevel;
  primaryStoreName: string;
  isSupport: boolean;
  todaySessionCount: number;
  weekLoadLabel: string;
  matchNotes: string[];
  riskNotes: string[];
  score: number;
}

export interface StaffWorkbenchSnapshot {
  metrics: StaffWorkbenchMetrics;
  scheduleWindow: ScheduleAssignment[];
  gapsAndConflicts: StaffIssue[];
  todos: StaffTodo[];
  loadRows: StaffLoadRow[];
  unresolvedCount: number;
}
