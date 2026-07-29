/**
 * Staff permission action codes (V2.1).
 * Prototype role matrix — does not replace the global permission system.
 */

export const STAFF_PERMISSIONS = {
  VIEW: 'staff.view',
  PROFILE_EDIT: 'staff.profile.edit',
  STORE_ASSIGN: 'staff.store.assign',
  CAPABILITY_EDIT: 'staff.capability.edit',
  AVAILABILITY_EDIT: 'staff.availability.edit',
  SCHEDULE_VIEW: 'staff.schedule.view',
  SCHEDULE_ASSIGN: 'staff.schedule.assign',
  SCHEDULE_REPLACE: 'staff.schedule.replace',
  APPLICATION_VIEW: 'staff.application.view',
  APPLICATION_APPROVE: 'staff.application.approve',
  APPLICATION_REJECT: 'staff.application.reject',
  APPLICATION_ASSIGN_OWNER: 'staff.application.assign_owner',
  RISK_RESOLVE: 'staff.risk.resolve',
  PAYABLE_VIEW: 'staff.payable.view',
  PAYABLE_EDIT: 'staff.payable.edit',
  TEST_DATA_RESET: 'staff.test_data.reset',
} as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[keyof typeof STAFF_PERMISSIONS];

/** Prototype actor roles for PC admin filtering. */
export type StaffActorRole =
  | 'hq_admin'
  | 'store_manager'
  | 'teaching_lead'
  | 'finance'
  | 'teacher';

const ALL_PERMISSIONS = Object.values(STAFF_PERMISSIONS);

const ROLE_PERMISSIONS: Record<StaffActorRole, readonly StaffPermission[]> = {
  hq_admin: ALL_PERMISSIONS,
  store_manager: [
    STAFF_PERMISSIONS.VIEW,
    STAFF_PERMISSIONS.PROFILE_EDIT,
    STAFF_PERMISSIONS.STORE_ASSIGN,
    STAFF_PERMISSIONS.CAPABILITY_EDIT,
    STAFF_PERMISSIONS.AVAILABILITY_EDIT,
    STAFF_PERMISSIONS.SCHEDULE_VIEW,
    STAFF_PERMISSIONS.SCHEDULE_ASSIGN,
    STAFF_PERMISSIONS.SCHEDULE_REPLACE,
    STAFF_PERMISSIONS.APPLICATION_VIEW,
    STAFF_PERMISSIONS.APPLICATION_APPROVE,
    STAFF_PERMISSIONS.APPLICATION_REJECT,
    STAFF_PERMISSIONS.APPLICATION_ASSIGN_OWNER,
    STAFF_PERMISSIONS.RISK_RESOLVE,
  ],
  teaching_lead: [
    STAFF_PERMISSIONS.VIEW,
    STAFF_PERMISSIONS.PROFILE_EDIT,
    STAFF_PERMISSIONS.CAPABILITY_EDIT,
    STAFF_PERMISSIONS.AVAILABILITY_EDIT,
    STAFF_PERMISSIONS.SCHEDULE_VIEW,
    STAFF_PERMISSIONS.SCHEDULE_ASSIGN,
    STAFF_PERMISSIONS.SCHEDULE_REPLACE,
    STAFF_PERMISSIONS.APPLICATION_VIEW,
    STAFF_PERMISSIONS.APPLICATION_APPROVE,
    STAFF_PERMISSIONS.APPLICATION_REJECT,
    STAFF_PERMISSIONS.APPLICATION_ASSIGN_OWNER,
    STAFF_PERMISSIONS.RISK_RESOLVE,
  ],
  finance: [
    STAFF_PERMISSIONS.VIEW,
    STAFF_PERMISSIONS.SCHEDULE_VIEW,
    STAFF_PERMISSIONS.APPLICATION_VIEW,
    STAFF_PERMISSIONS.PAYABLE_VIEW,
    STAFF_PERMISSIONS.PAYABLE_EDIT,
  ],
  teacher: [
    STAFF_PERMISSIONS.VIEW,
    STAFF_PERMISSIONS.SCHEDULE_VIEW,
    STAFF_PERMISSIONS.APPLICATION_VIEW,
    STAFF_PERMISSIONS.PAYABLE_VIEW,
  ],
};

export function hasStaffPermission(role: StaffActorRole, action: StaffPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function createStaffPermissionChecker(role: StaffActorRole = 'hq_admin') {
  return {
    role,
    can: (action: StaffPermission) => hasStaffPermission(role, action),
  };
}

/** Whether actor may see payable amounts for a given staff member. */
export function canViewPayableAmount(
  role: StaffActorRole,
  viewerStaffId: string | null | undefined,
  targetStaffId: string,
): boolean {
  if (role === 'hq_admin' || role === 'finance') return true;
  if (role === 'teacher' && viewerStaffId && viewerStaffId === targetStaffId) return true;
  return false;
}
