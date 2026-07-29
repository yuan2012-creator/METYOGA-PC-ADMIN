import { applyCohortDerivedFields, detectLeadAnomaly } from '../researchCenterCalculations';
import { createInitialFinanceState } from '../researchCenterFinanceModel';
import {
  createInitialCohortState,
  createInitialEnrollments,
  createInitialLeads,
  createInitialMentorPayables,
  createInitialSchedules,
  type LeadRecord,
} from '../researchCenterV2.viewModel';
import {
  RESEARCH_CENTER_STORAGE_VERSION,
  type ResearchCenterPersistedSnapshot,
} from '../researchCenterPersistence';

/** Build the same baseline snapshot as `createFreshState` in useResearchCenterState. */
export function buildInitialResearchCenterSnapshot(options?: {
  skipLeadAnomaly?: boolean;
}): ResearchCenterPersistedSnapshot {
  const { cohorts: raw } = createInitialCohortState();
  const cohorts = raw.map(applyCohortDerivedFields);
  const schedules = createInitialSchedules();
  const activeCohortId = cohorts[0]?.id ?? '';
  const seedLeads = createInitialLeads();
  const leads = options?.skipLeadAnomaly
    ? seedLeads
    : seedLeads.map((lead: LeadRecord) => ({ ...lead, anomaly: detectLeadAnomaly(lead) }));

  return {
    version: RESEARCH_CENTER_STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    activeCohortId,
    cohorts,
    schedules,
    leads,
    enrollments: createInitialEnrollments(),
    paymentPlanConfigured: false,
    financeState: createInitialFinanceState(cohorts[0]!),
    mentorPayables: createInitialMentorPayables(schedules, activeCohortId),
    operationLogs: [],
    dismissedTodoIds: [],
    attendances: [],
    leaveRequests: [],
    makeupRecords: [],
    teachingRecords: [],
    scheduleChangeLogs: [],
    domainEvents: [],
  };
}
