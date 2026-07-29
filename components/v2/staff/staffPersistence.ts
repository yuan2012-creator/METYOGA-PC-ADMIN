import type {
  ScheduleAssignment,
  StaffApplication,
  StaffAvailability,
  StaffDomainEvent,
  StaffIssue,
  StaffMember,
  StaffOperationLog,
  StaffTodo,
  TeachingCapability,
  UnresolvedStaffReference,
} from './domain/types';

export const STAFF_STORAGE_KEY = 'met-staff-v2.1';
export const STAFF_STORAGE_VERSION = 1;

export interface StaffPersistedSnapshot {
  version: number;
  savedAt: string;
  /** Prototype marker — not a real database. */
  prototypePersistence: true;
  actorStaffId: string;
  storeFilterId: string | 'all';
  members: StaffMember[];
  capabilities: TeachingCapability[];
  availabilities: StaffAvailability[];
  scheduleAssignments: ScheduleAssignment[];
  applications: StaffApplication[];
  todos: StaffTodo[];
  issues: StaffIssue[];
  operationLogs: StaffOperationLog[];
  domainEvents: StaffDomainEvent[];
  unresolvedReferences: UnresolvedStaffReference[];
  dismissedTodoIds: string[];
}

export function isValidStaffSnapshot(raw: unknown): raw is StaffPersistedSnapshot {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as Partial<StaffPersistedSnapshot>;
  return (
    Array.isArray(s.members) &&
    Array.isArray(s.scheduleAssignments) &&
    Array.isArray(s.applications) &&
    Array.isArray(s.todos) &&
    Array.isArray(s.issues) &&
    typeof s.version === 'number'
  );
}

export function migrateStaffSnapshot(raw: unknown): StaffPersistedSnapshot | null {
  if (!isValidStaffSnapshot(raw)) return null;
  return {
    ...raw,
    version: STAFF_STORAGE_VERSION,
    savedAt: raw.savedAt || new Date().toISOString(),
    prototypePersistence: true,
    actorStaffId: raw.actorStaffId || 'staff_fangfang',
    storeFilterId: raw.storeFilterId || 'all',
    capabilities: Array.isArray(raw.capabilities) ? raw.capabilities : [],
    availabilities: Array.isArray(raw.availabilities) ? raw.availabilities : [],
    operationLogs: Array.isArray(raw.operationLogs) ? raw.operationLogs : [],
    domainEvents: Array.isArray(raw.domainEvents) ? raw.domainEvents : [],
    unresolvedReferences: Array.isArray(raw.unresolvedReferences) ? raw.unresolvedReferences : [],
    dismissedTodoIds: Array.isArray(raw.dismissedTodoIds) ? raw.dismissedTodoIds : [],
  };
}

export function loadStaffSnapshot(): StaffPersistedSnapshot | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) return null;
    return migrateStaffSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStaffSnapshot(snapshot: StaffPersistedSnapshot): void {
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage 不可用');
  }
  const payload: StaffPersistedSnapshot = {
    ...snapshot,
    version: STAFF_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    prototypePersistence: true,
  };
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStaffSnapshot(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STAFF_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
