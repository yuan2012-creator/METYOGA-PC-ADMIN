/**
 * Staff & Team V2.1 — canonical enums.
 * UI and services MUST import from here; do not redeclare synonym strings in components.
 */

export const TEACHING_LEVELS = ['T1', 'T2', 'T3', 'T4', 'T5'] as const;
export type TeachingLevel = (typeof TEACHING_LEVELS)[number];

export const STEWARD_LEVELS = ['G1', 'G2'] as const;
export type StewardLevel = (typeof STEWARD_LEVELS)[number];

export const MENTOR_LEVELS = ['P1', 'P2'] as const;
export type MentorLevel = (typeof MENTOR_LEVELS)[number];

export const EMPLOYMENT_STATUSES = ['在职', '试用', '停课', '离职', '合作暂停'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const COOPERATION_TYPES = ['全职', '兼职', '合作导师', '外聘'] as const;
export type CooperationType = (typeof COOPERATION_TYPES)[number];

export const AVAILABILITY_STATUSES = ['可排', '暂不可排', '请假中', '负荷过高', '待确认'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const STAFF_ROLE_CODES = [
  'store_teacher',
  'mentor',
  'assistant',
  'teaching_lead',
  'store_manager',
  'hq_admin',
  'finance',
] as const;
export type StaffRoleCode = (typeof STAFF_ROLE_CODES)[number];

export const STAFF_APPLICATION_TYPES = ['请假', '代课', '改期', '停课', '补签', '资料补交'] as const;
export type StaffApplicationType = (typeof STAFF_APPLICATION_TYPES)[number];

export const STAFF_APPLICATION_STATUSES = [
  '草稿',
  '待提交',
  '待审批',
  '待补充',
  '已通过',
  '已驳回',
  '已撤销',
  '已执行',
  '执行异常',
] as const;
export type StaffApplicationStatus = (typeof STAFF_APPLICATION_STATUSES)[number];

export const SCHEDULE_ASSIGNMENT_STATUSES = [
  '待指定',
  '待确认',
  '已确认',
  '有冲突',
  '已替换',
  '已取消',
] as const;
export type ScheduleAssignmentStatus = (typeof SCHEDULE_ASSIGNMENT_STATUSES)[number];

export const STAFF_ISSUE_TYPES = [
  '缺老师',
  '排课冲突',
  '负荷过高',
  '负荷过低',
  '证书到期',
  '合同到期',
  '教学异常',
  '负责人待指定',
  '课酬待确认',
] as const;
export type StaffIssueType = (typeof STAFF_ISSUE_TYPES)[number];

export const STAFF_ISSUE_SEVERITIES = ['P0', 'P1', 'P2', 'info'] as const;
export type StaffIssueSeverity = (typeof STAFF_ISSUE_SEVERITIES)[number];

export const STAFF_TODO_TYPES = [
  '请假待审批',
  '代课待确认',
  '负责人待指定',
  '证书或合同到期',
  '教学异常',
  '课酬待确认',
  '缺老师待指定',
  '排课冲突待处理',
  '资料补交待审',
] as const;
export type StaffTodoType = (typeof STAFF_TODO_TYPES)[number];

export const WORKLOAD_STATUSES = ['空闲', '正常', '偏高', '超负荷', '暂不可排'] as const;
export type WorkloadStatus = (typeof WORKLOAD_STATUSES)[number];

export const STAFF_REFERENCE_RESOLUTIONS = ['resolved', 'unresolved'] as const;
export type StaffReferenceResolution = (typeof STAFF_REFERENCE_RESOLUTIONS)[number];

export function isStaffApplicationStatus(value: string): value is StaffApplicationStatus {
  return (STAFF_APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function isScheduleAssignmentStatus(value: string): value is ScheduleAssignmentStatus {
  return (SCHEDULE_ASSIGNMENT_STATUSES as readonly string[]).includes(value);
}

export function isStaffApplicationType(value: string): value is StaffApplicationType {
  return (STAFF_APPLICATION_TYPES as readonly string[]).includes(value);
}
