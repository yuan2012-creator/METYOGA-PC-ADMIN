import type {
  AttendanceSheet,
  CashReceiptEvent,
  CohortConfig,
  EnrollmentRecord,
  LeadRecord,
  LeaveRequest,
  MakeupRecord,
  MentorPayableItem,
  OperationLogEntry,
  ScheduleChangeLog,
  ScheduleItem,
  TeachingRecord,
} from './researchCenterV2.viewModel';
import { normalizeScheduleItem } from './researchCenterV2.viewModel';
import type { ResearchCenterFinanceState } from './researchCenterFinanceModel';
import type { DomainEvent } from './domain/types';

/** Legacy keys kept for migration only. */
export const RESEARCH_CENTER_STORAGE_KEY_V18 = 'met-research-center-v1.8';
export const RESEARCH_CENTER_STORAGE_KEY_V19 = 'met-research-center-v1.9';
export const RESEARCH_CENTER_STORAGE_KEY = 'met-research-center-v2.0';
/** V2.0 schema version (V1.8=1, V1.9=2). */
export const RESEARCH_CENTER_STORAGE_VERSION = 3;

export interface ResearchCenterPersistedSnapshot {
  version: number;
  savedAt: string;
  activeCohortId: string;
  cohorts: CohortConfig[];
  schedules: ScheduleItem[];
  leads: LeadRecord[];
  enrollments: EnrollmentRecord[];
  paymentPlanConfigured: boolean;
  financeState: ResearchCenterFinanceState;
  mentorPayables: MentorPayableItem[];
  operationLogs: OperationLogEntry[];
  dismissedTodoIds: string[];
  attendances: AttendanceSheet[];
  leaveRequests: LeaveRequest[];
  makeupRecords: MakeupRecord[];
  teachingRecords: TeachingRecord[];
  scheduleChangeLogs: ScheduleChangeLog[];
  /** V2.0 domain events for cross-end sync scaffolding. */
  domainEvents?: DomainEvent[];
}

function emptyDeliveryCollections() {
  return {
    attendances: [] as AttendanceSheet[],
    leaveRequests: [] as LeaveRequest[],
    makeupRecords: [] as MakeupRecord[],
    teachingRecords: [] as TeachingRecord[],
    scheduleChangeLogs: [] as ScheduleChangeLog[],
    domainEvents: [] as DomainEvent[],
  };
}

/** Migrate V1.8/V1.9/partial payloads into V2.0 without dropping business data. */
export function migrateResearchCenterSnapshot(raw: unknown): ResearchCenterPersistedSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<ResearchCenterPersistedSnapshot> & { version?: number };
  if (!Array.isArray(parsed.leads) || !Array.isArray(parsed.cohorts)) return null;
  if (!parsed.financeState) return null;
  const fallbackCohortId = parsed.activeCohortId || parsed.cohorts[0]?.id || 'cohort-ryt200-0727';
  const schedules = (parsed.schedules ?? []).map(s => normalizeScheduleItem(s as ScheduleItem, fallbackCohortId));
  const delivery = emptyDeliveryCollections();
  return {
    version: RESEARCH_CENTER_STORAGE_VERSION,
    savedAt: parsed.savedAt || new Date().toISOString(),
    activeCohortId: fallbackCohortId,
    cohorts: parsed.cohorts,
    schedules,
    leads: parsed.leads,
    enrollments: parsed.enrollments ?? [],
    paymentPlanConfigured: Boolean(parsed.paymentPlanConfigured),
    financeState: parsed.financeState,
    mentorPayables: parsed.mentorPayables ?? [],
    operationLogs: parsed.operationLogs ?? [],
    dismissedTodoIds: parsed.dismissedTodoIds ?? [],
    attendances: Array.isArray(parsed.attendances) ? parsed.attendances : delivery.attendances,
    leaveRequests: Array.isArray(parsed.leaveRequests) ? parsed.leaveRequests : delivery.leaveRequests,
    makeupRecords: Array.isArray(parsed.makeupRecords) ? parsed.makeupRecords : delivery.makeupRecords,
    teachingRecords: Array.isArray(parsed.teachingRecords) ? parsed.teachingRecords : delivery.teachingRecords,
    scheduleChangeLogs: Array.isArray(parsed.scheduleChangeLogs)
      ? parsed.scheduleChangeLogs
      : delivery.scheduleChangeLogs,
    domainEvents: Array.isArray(parsed.domainEvents) ? parsed.domainEvents : delivery.domainEvents,
  };
}

function readRaw(key: string): unknown | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @deprecated Pages/hooks must not call this. Use ResearchCenterService / LocalStorageResearchCenterService.
 * Kept for migration tooling and the LocalStorage adapter only.
 */
export function loadResearchCenterSnapshot(): ResearchCenterPersistedSnapshot | null {
  try {
    const keys = [
      RESEARCH_CENTER_STORAGE_KEY,
      RESEARCH_CENTER_STORAGE_KEY_V19,
      RESEARCH_CENTER_STORAGE_KEY_V18,
    ];
    for (const key of keys) {
      const current = readRaw(key);
      if (!current) continue;
      const migrated = migrateResearchCenterSnapshot(current);
      if (migrated) {
        if (key !== RESEARCH_CENTER_STORAGE_KEY) {
          saveResearchCenterSnapshot(migrated);
          try {
            if (key === RESEARCH_CENTER_STORAGE_KEY_V18) localStorage.removeItem(RESEARCH_CENTER_STORAGE_KEY_V18);
            if (key === RESEARCH_CENTER_STORAGE_KEY_V19) localStorage.removeItem(RESEARCH_CENTER_STORAGE_KEY_V19);
          } catch {
            // ignore
          }
        }
        return migrated;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * @deprecated Pages/hooks must not call this. Use ResearchCenterService.
 */
export function saveResearchCenterSnapshot(snapshot: ResearchCenterPersistedSnapshot): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const payload: ResearchCenterPersistedSnapshot = {
      ...snapshot,
      version: RESEARCH_CENTER_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      attendances: snapshot.attendances ?? [],
      leaveRequests: snapshot.leaveRequests ?? [],
      makeupRecords: snapshot.makeupRecords ?? [],
      teachingRecords: snapshot.teachingRecords ?? [],
      scheduleChangeLogs: snapshot.scheduleChangeLogs ?? [],
      domainEvents: snapshot.domainEvents ?? [],
      schedules: (snapshot.schedules ?? []).map(s => normalizeScheduleItem(s)),
    };
    localStorage.setItem(RESEARCH_CENTER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // prototype persistence only
  }
}

/**
 * @deprecated Pages/hooks must not call this. Use ResearchCenterService.resetTestData().
 */
export function clearResearchCenterSnapshot(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(RESEARCH_CENTER_STORAGE_KEY);
    localStorage.removeItem(RESEARCH_CENTER_STORAGE_KEY_V19);
    localStorage.removeItem(RESEARCH_CENTER_STORAGE_KEY_V18);
  } catch {
    // ignore
  }
}

/** Seed receipts used when building initial finance state alongside enrollments. */
export function buildSeedCashReceipts(): CashReceiptEvent[] {
  return [
    {
      id: 'cash-a',
      date: '2026-07-05',
      title: '学员A 全款',
      amount: 12800,
      enrollmentId: 'enroll-a',
      leadId: 'lead-enrolled-a',
      cohortId: 'cohort-ryt200-0727',
      paymentMethod: '微信',
      operator: '芳芳',
      serialNo: 'RC-20260705-001',
      status: '已确认',
    },
    {
      id: 'cash-b',
      date: '2026-07-08',
      title: '学员B 全款',
      amount: 12800,
      enrollmentId: 'enroll-b',
      leadId: 'lead-enrolled-b',
      cohortId: 'cohort-ryt200-0727',
      paymentMethod: '支付宝',
      operator: '芳芳',
      serialNo: 'RC-20260708-001',
      status: '已确认',
    },
    {
      id: 'cash-c',
      date: '2026-07-10',
      title: '学员C 全款',
      amount: 12800,
      enrollmentId: 'enroll-c',
      leadId: 'lead-enrolled-c',
      cohortId: 'cohort-ryt200-0727',
      paymentMethod: '银行转账',
      operator: '芳芳',
      serialNo: 'RC-20260710-001',
      status: '已确认',
    },
  ];
}
