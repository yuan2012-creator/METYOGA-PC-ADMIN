/**
 * 经营总览只读 adapter：snake_case → camelCase；mock / selector 输出安全兜底；不修改入参、无副作用。
 * 口径：模块内判断、待核对、待接入真实经营数据；不自动生成任务或通知。
 */

import type { PartnerAuthorizationRow } from '../utils/partnerSelectors';
import type {
  DashboardOperatingZoneCard,
  DashboardRadarItem,
  DashboardSnapshotItem,
  DashboardStoreHealthRow,
  DashboardSuggestionRow,
  DashboardSummary,
  DashboardTodayIssueRow,
} from '../utils/dashboardSelectors';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pickStr(v: unknown, fallback: string): string {
  if (typeof v === 'string') return v;
  return fallback;
}

function pickNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

function normalizeKeys(raw: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const [snake, camel] of Object.entries(map)) {
    if (snake in out && !(camel in out)) {
      out[camel] = out[snake];
    }
  }
  return out;
}

const SNAPSHOT_SCOPE_NOTE =
  '经营总览快照为模块内聚合展示，仅供经营判断；待接入真实经营数据；不自动生成任务、不自动通知责任人。';

const FINANCE_SCOPE_NOTE =
  '以下为模块内估算用于经营核对；待核对；待接入真实财务分录；不表示已入账、不表示已同步财务。';

const SUMMARY_KEY_MAP: Record<string, string> = {
  mhs_score: 'mhsScore',
  mhs_status_label: 'mhsStatusLabel',
  mhs_status_class: 'mhsStatusClass',
  mhs_stroke_offset: 'mhsStrokeOffset',
  active_member_count: 'activeMemberCount',
  risk_member_count: 'riskMemberCount',
  pending_order_count: 'pendingOrderCount',
  pending_contract_count: 'pendingContractCount',
  upcoming_session_count: 'upcomingSessionCount',
  active_booking_count: 'activeBookingCount',
  consumed_attendance_count: 'consumedAttendanceCount',
  paid_payment_amount: 'paidPaymentAmount',
  refund_amount: 'refundAmount',
  net_cash_flow: 'netCashFlow',
  recognized_income_amount: 'recognizedIncomeAmount',
};

export function adaptDashboardSummary(raw: unknown): DashboardSummary {
  if (!isRecord(raw)) {
    return {
      mhsScore: 0,
      mhsStatusLabel: '—',
      mhsStatusClass: 'bg-gray-100 text-gray-600',
      mhsStrokeOffset: 440,
      activeMemberCount: 0,
      riskMemberCount: 0,
      pendingOrderCount: 0,
      pendingContractCount: 0,
      upcomingSessionCount: 0,
      activeBookingCount: 0,
      consumedAttendanceCount: 0,
      paidPaymentAmount: 0,
      refundAmount: 0,
      netCashFlow: 0,
      recognizedIncomeAmount: 0,
    };
  }
  const n = normalizeKeys(raw, SUMMARY_KEY_MAP) as Partial<DashboardSummary>;
  return {
    mhsScore: pickNum(n.mhsScore, 0),
    mhsStatusLabel: pickStr(n.mhsStatusLabel, '—'),
    mhsStatusClass: pickStr(n.mhsStatusClass, 'bg-gray-100 text-gray-600'),
    mhsStrokeOffset: pickNum(n.mhsStrokeOffset, 440),
    activeMemberCount: pickNum(n.activeMemberCount, 0),
    riskMemberCount: pickNum(n.riskMemberCount, 0),
    pendingOrderCount: pickNum(n.pendingOrderCount, 0),
    pendingContractCount: pickNum(n.pendingContractCount, 0),
    upcomingSessionCount: pickNum(n.upcomingSessionCount, 0),
    activeBookingCount: pickNum(n.activeBookingCount, 0),
    consumedAttendanceCount: pickNum(n.consumedAttendanceCount, 0),
    paidPaymentAmount: pickNum(n.paidPaymentAmount, 0),
    refundAmount: pickNum(n.refundAmount, 0),
    netCashFlow: pickNum(n.netCashFlow, 0),
    recognizedIncomeAmount: pickNum(n.recognizedIncomeAmount, 0),
  };
}

const SNAPSHOT_ITEM_KEY_MAP: Record<string, string> = {};

function adaptDashboardSnapshotItem(raw: unknown): DashboardSnapshotItem {
  if (!isRecord(raw)) {
    return { label: '—', value: '—', desc: '—', icon: 'fa-regular fa-circle', tone: 'bg-gray-50 text-gray-600' };
  }
  const n = normalizeKeys(raw, SNAPSHOT_ITEM_KEY_MAP) as Partial<DashboardSnapshotItem>;
  return {
    label: pickStr(n.label, '—'),
    value: pickStr(n.value, '—'),
    desc: pickStr(n.desc, '—'),
    icon: pickStr(n.icon, 'fa-regular fa-circle'),
    tone: pickStr(n.tone, 'bg-gray-50 text-gray-600'),
  };
}

const RADAR_KEY_MAP: Record<string, string> = {
  full_mark: 'fullMark',
};

function adaptDashboardRadarItem(raw: unknown): DashboardRadarItem {
  if (!isRecord(raw)) {
    return { subject: '—', A: 0, fullMark: 100, key: 'L' };
  }
  const n = normalizeKeys(raw, RADAR_KEY_MAP) as Partial<DashboardRadarItem>;
  const key = n.key === 'L' || n.key === 'F' || n.key === 'E' || n.key === 'S' ? n.key : 'L';
  return {
    subject: pickStr(n.subject, '—'),
    A: pickNum(n.A, 0),
    fullMark: pickNum(n.fullMark, 100),
    key,
  };
}

const ZONE_KEY_MAP: Record<string, string> = {
  metric_line: 'metricLine',
};

function adaptDashboardOperatingZoneCard(raw: unknown): DashboardOperatingZoneCard {
  if (!isRecord(raw)) {
    return {
      id: '',
      title: '—',
      problem: '—',
      action: '—',
      owner: '—',
      metricLine: '—',
    };
  }
  const n = normalizeKeys(raw, ZONE_KEY_MAP) as Partial<DashboardOperatingZoneCard>;
  return {
    id: pickStr(n.id, ''),
    title: pickStr(n.title, '—'),
    problem: pickStr(n.problem, '—'),
    action: pickStr(n.action, '—'),
    owner: pickStr(n.owner, '—'),
    metricLine: pickStr(n.metricLine, '—'),
  };
}

const ISSUE_KEY_MAP: Record<string, string> = {
  problem_type: 'problemType',
  store_label: 'storeLabel',
  related_object: 'relatedObject',
  risk_level: 'riskLevel',
  suggested_action: 'suggestedAction',
  status_label: 'statusLabel',
  pending_integration_note: 'pendingIntegrationNote',
};

function adaptDashboardTodayIssueRow(raw: unknown): DashboardTodayIssueRow {
  if (!isRecord(raw)) {
    return {
      id: '',
      problemType: '—',
      storeLabel: '—',
      relatedObject: '—',
      riskLevel: '—',
      suggestedAction: '—',
      owner: '—',
      statusLabel: '待处理（模块内展示）',
      pendingIntegrationNote: '待接入真实经营数据',
    };
  }
  const n = normalizeKeys(raw, ISSUE_KEY_MAP) as Partial<DashboardTodayIssueRow>;
  return {
    id: pickStr(n.id, ''),
    problemType: pickStr(n.problemType, '—'),
    storeLabel: pickStr(n.storeLabel, '—'),
    relatedObject: pickStr(n.relatedObject, '—'),
    riskLevel: pickStr(n.riskLevel, '—'),
    suggestedAction: pickStr(n.suggestedAction, '—'),
    owner: pickStr(n.owner, '—'),
    statusLabel: pickStr(n.statusLabel, '待处理（模块内展示）'),
    pendingIntegrationNote: pickStr(n.pendingIntegrationNote, '待接入真实经营数据'),
  };
}

const STORE_HEALTH_KEY_MAP: Record<string, string> = {
  store_name: 'storeName',
  business_status: 'businessStatus',
  booking_summary: 'bookingSummary',
  attendance_summary: 'attendanceSummary',
  collection_summary: 'collectionSummary',
  refund_risk_summary: 'refundRiskSummary',
  teacher_exec_summary: 'teacherExecSummary',
  member_risk_summary: 'memberRiskSummary',
  holistic_hint: 'holisticHint',
};

function adaptDashboardStoreHealthRow(raw: unknown): DashboardStoreHealthRow {
  if (!isRecord(raw)) {
    return {
      id: '',
      storeName: '—',
      businessStatus: '—',
      bookingSummary: '—',
      attendanceSummary: '—',
      collectionSummary: '—',
      refundRiskSummary: '—',
      teacherExecSummary: '—',
      memberRiskSummary: '—',
      holisticHint: '—',
    };
  }
  const n = normalizeKeys(raw, STORE_HEALTH_KEY_MAP) as Partial<DashboardStoreHealthRow>;
  return {
    id: pickStr(n.id, ''),
    storeName: pickStr(n.storeName, '—'),
    businessStatus: pickStr(n.businessStatus, '—'),
    bookingSummary: pickStr(n.bookingSummary, '—'),
    attendanceSummary: pickStr(n.attendanceSummary, '—'),
    collectionSummary: pickStr(n.collectionSummary, '—'),
    refundRiskSummary: pickStr(n.refundRiskSummary, '—'),
    teacherExecSummary: pickStr(n.teacherExecSummary, '—'),
    memberRiskSummary: pickStr(n.memberRiskSummary, '—'),
    holisticHint: pickStr(n.holisticHint, '—'),
  };
}

const SUGGESTION_KEY_MAP: Record<string, string> = {
  suggestion_type: 'suggestionType',
  trigger_reason: 'triggerReason',
  suggested_action: 'suggestedAction',
  impact_scope: 'impactScope',
  owner_role: 'ownerRole',
  status_label: 'statusLabel',
};

function adaptDashboardSuggestionRow(raw: unknown): DashboardSuggestionRow {
  if (!isRecord(raw)) {
    return {
      id: '',
      suggestionType: '—',
      triggerReason: '—',
      suggestedAction: '—',
      impactScope: '—',
      ownerRole: '—',
      statusLabel: '待处理（模块内展示）',
    };
  }
  const n = normalizeKeys(raw, SUGGESTION_KEY_MAP) as Partial<DashboardSuggestionRow>;
  return {
    id: pickStr(n.id, ''),
    suggestionType: pickStr(n.suggestionType, '—'),
    triggerReason: pickStr(n.triggerReason, '—'),
    suggestedAction: pickStr(n.suggestedAction, '—'),
    impactScope: pickStr(n.impactScope, '—'),
    ownerRole: pickStr(n.ownerRole, '—'),
    statusLabel: pickStr(n.statusLabel, '待处理（模块内展示）'),
  };
}

/** 经营总览侧财务只读摘要（模块内估算，不表示已入账） */
export interface DashboardFinanceReadonlySummary {
  netCashFlow: number;
  paidPaymentAmount: number;
  refundAmount: number;
  recognizedIncomeAmount: number;
  pendingOrderCount: number;
  scopeNote: string;
}

const FINANCE_SUMMARY_KEY_MAP: Record<string, string> = {
  net_cash_flow: 'netCashFlow',
  paid_payment_amount: 'paidPaymentAmount',
  refund_amount: 'refundAmount',
  recognized_income_amount: 'recognizedIncomeAmount',
  pending_order_count: 'pendingOrderCount',
  scope_note: 'scopeNote',
};

export function adaptDashboardFinanceSummary(raw: unknown): DashboardFinanceReadonlySummary {
  if (!isRecord(raw)) {
    return {
      netCashFlow: 0,
      paidPaymentAmount: 0,
      refundAmount: 0,
      recognizedIncomeAmount: 0,
      pendingOrderCount: 0,
      scopeNote: FINANCE_SCOPE_NOTE,
    };
  }
  const n = normalizeKeys(raw, FINANCE_SUMMARY_KEY_MAP) as Partial<DashboardFinanceReadonlySummary>;
  return {
    netCashFlow: pickNum(n.netCashFlow, 0),
    paidPaymentAmount: pickNum(n.paidPaymentAmount, 0),
    refundAmount: pickNum(n.refundAmount, 0),
    recognizedIncomeAmount: pickNum(n.recognizedIncomeAmount, 0),
    pendingOrderCount: pickNum(n.pendingOrderCount, 0),
    scopeNote: pickStr(n.scopeNote, FINANCE_SCOPE_NOTE),
  };
}

const PARTNER_AUTH_KEY_MAP: Record<string, string> = {
  partner_store: 'partnerStore',
  authorization_status: 'authorizationStatus',
  brand_usage: 'brandUsage',
  data_backhaul: 'dataBackhaul',
  quality_record: 'qualityRecord',
  course_authorization: 'courseAuthorization',
  service_level: 'serviceLevel',
  rectification_record: 'rectificationRecord',
  renewal_exit_hint: 'renewalExitHint',
  risk_hints: 'riskHints',
};

function adaptPartnerAuthorizationRow(raw: unknown): PartnerAuthorizationRow {
  if (!isRecord(raw)) {
    return {
      id: '',
      partnerStore: '—',
      authorizationStatus: '待核对（模块内展示）',
      brandUsage: '—',
      dataBackhaul: '—',
      qualityRecord: '—',
      courseAuthorization: '—',
      serviceLevel: '—',
      rectificationRecord: '—',
      renewalExitHint: '—',
      riskHints: [],
    };
  }
  const n = normalizeKeys(raw, PARTNER_AUTH_KEY_MAP) as Partial<PartnerAuthorizationRow> & {
    risk_hints?: unknown;
  };
  const hints = Array.isArray(n.riskHints) ? n.riskHints.filter((x): x is string => typeof x === 'string') : [];
  return {
    id: pickStr(n.id, ''),
    partnerStore: pickStr(n.partnerStore, '—'),
    authorizationStatus: pickStr(n.authorizationStatus, '待核对（模块内展示）'),
    brandUsage: pickStr(n.brandUsage, '—'),
    dataBackhaul: pickStr(n.dataBackhaul, '—'),
    qualityRecord: pickStr(n.qualityRecord, '—'),
    courseAuthorization: pickStr(n.courseAuthorization, '—'),
    serviceLevel: pickStr(n.serviceLevel, '—'),
    rectificationRecord: pickStr(n.rectificationRecord, '—'),
    renewalExitHint: pickStr(n.renewalExitHint, '—'),
    riskHints: hints.length ? hints : ['待接入真实合作数据；仅用于授权治理判断'],
  };
}

export interface DashboardReadonlySnapshot {
  summary: DashboardSummary;
  snapshotItems: DashboardSnapshotItem[];
  radarData: DashboardRadarItem[];
  operatingZoneCards: DashboardOperatingZoneCard[];
  scopeNote: string;
}

const SNAPSHOT_ROOT_KEY_MAP: Record<string, string> = {
  snapshot_items: 'snapshotItems',
  radar_data: 'radarData',
  operating_zone_cards: 'operatingZoneCards',
  scope_note: 'scopeNote',
};

export function adaptDashboardReadonlySnapshot(raw: unknown): DashboardReadonlySnapshot {
  const emptySummary = adaptDashboardSummary(null);
  const base: DashboardReadonlySnapshot = {
    summary: emptySummary,
    snapshotItems: [],
    radarData: [],
    operatingZoneCards: [],
    scopeNote: SNAPSHOT_SCOPE_NOTE,
  };
  if (!isRecord(raw)) return base;
  const n = normalizeKeys(raw, SNAPSHOT_ROOT_KEY_MAP) as Record<string, unknown> & Partial<DashboardReadonlySnapshot>;
  const summary = adaptDashboardSummary(n.summary ?? null);
  const itemsRaw = n.snapshotItems;
  const radarRaw = n.radarData;
  const zonesRaw = n.operatingZoneCards;
  return {
    summary,
    snapshotItems: Array.isArray(itemsRaw) ? itemsRaw.map(adaptDashboardSnapshotItem) : [],
    radarData: Array.isArray(radarRaw) ? radarRaw.map(adaptDashboardRadarItem) : [],
    operatingZoneCards: Array.isArray(zonesRaw) ? zonesRaw.map(adaptDashboardOperatingZoneCard) : [],
    scopeNote: pickStr(n.scopeNote, SNAPSHOT_SCOPE_NOTE),
  };
}

export function adaptDashboardOperationIssues(rawList: unknown): DashboardTodayIssueRow[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptDashboardTodayIssueRow);
}

export function adaptDashboardStoreHealth(rawList: unknown): DashboardStoreHealthRow[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptDashboardStoreHealthRow);
}

export function adaptDashboardSuggestions(rawList: unknown): DashboardSuggestionRow[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptDashboardSuggestionRow);
}

export function adaptDashboardPartnerGovernance(rawList: unknown): PartnerAuthorizationRow[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptPartnerAuthorizationRow);
}
