/**
 * Research Center permission action codes (V2.0).
 * Prefer these over ad-hoc booleans when gating UI actions.
 */

export const RESEARCH_PERMISSIONS = {
  LEAD_VIEW: 'research.lead.view',
  LEAD_EDIT: 'research.lead.edit',
  ENROLLMENT_CREATE: 'research.enrollment.create',
  RECEIPT_RECORD: 'research.receipt.record',
  REFUND_CREATE: 'research.refund.create',
  COHORT_EDIT: 'research.cohort.edit',
  SESSION_EDIT: 'research.session.edit',
  ATTENDANCE_EDIT: 'research.attendance.edit',
  LEAVE_APPROVE: 'research.leave.approve',
  MAKEUP_MANAGE: 'research.makeup.manage',
  TEACHING_RECORD_EDIT: 'research.teaching_record.edit',
  FINANCE_VIEW: 'research.finance.view',
  FINANCE_EDIT: 'research.finance.edit',
  MENTOR_PAY_VIEW: 'research.mentor_pay.view',
} as const;

export type ResearchPermission =
  (typeof RESEARCH_PERMISSIONS)[keyof typeof RESEARCH_PERMISSIONS];

export type ResearchRole = 'hq_admin' | 'center_owner' | 'recruit_owner' | 'teacher' | 'assistant' | 'member';

const ALL_PERMISSIONS = Object.values(RESEARCH_PERMISSIONS);

const ROLE_PERMISSIONS: Record<ResearchRole, readonly ResearchPermission[]> = {
  hq_admin: ALL_PERMISSIONS,
  center_owner: ALL_PERMISSIONS.filter(p => p !== RESEARCH_PERMISSIONS.FINANCE_EDIT),
  recruit_owner: [
    RESEARCH_PERMISSIONS.LEAD_VIEW,
    RESEARCH_PERMISSIONS.LEAD_EDIT,
    RESEARCH_PERMISSIONS.ENROLLMENT_CREATE,
    RESEARCH_PERMISSIONS.RECEIPT_RECORD,
  ],
  teacher: [
    RESEARCH_PERMISSIONS.ATTENDANCE_EDIT,
    RESEARCH_PERMISSIONS.TEACHING_RECORD_EDIT,
    RESEARCH_PERMISSIONS.MENTOR_PAY_VIEW,
  ],
  assistant: [
    RESEARCH_PERMISSIONS.ATTENDANCE_EDIT,
    RESEARCH_PERMISSIONS.LEAVE_APPROVE,
    RESEARCH_PERMISSIONS.MAKEUP_MANAGE,
  ],
  member: [RESEARCH_PERMISSIONS.LEAD_VIEW],
};

export function hasResearchPermission(role: ResearchRole, action: ResearchPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

/** Prototype PC defaults to HQ admin with full access. */
export function createPermissionChecker(role: ResearchRole = 'hq_admin') {
  return {
    role,
    can: (action: ResearchPermission) => hasResearchPermission(role, action),
    /** @deprecated Prefer `can(RESEARCH_PERMISSIONS.*)` */
    canDirectManage: hasResearchPermission(role, RESEARCH_PERMISSIONS.COHORT_EDIT),
  };
}
