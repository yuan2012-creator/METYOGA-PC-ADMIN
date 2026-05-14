/**
 * 会员域 adapter：snake_case → camelCase；mock 安全兜底；无副作用。
 */

import type { Member, MemberAsset, MemberCard, TimelineEvent } from '../types';

const EMPTY_CARDS: MemberCard[] = [];
const EMPTY_TIMELINE: TimelineEvent[] = [];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** 常见后端字段 → 前端 camelCase */
const MEMBER_KEY_MAP: Record<string, string> = {
  member_id: 'id',
  lifecycle_status: 'lifecycleStatus',
  lead_status: 'leadStatus',
  lead_probability: 'leadProbability',
  join_date: 'joinDate',
  last_visit: 'lastVisit',
  total_ltv: 'totalLTV',
  total_classes: 'totalClasses',
  body_tags: 'bodyTags',
  body_notes: 'bodyNotes',
  primary_store_id: 'primaryStoreId',
  risk_tags: 'riskTags',
  follow_up: 'followUp',
  joined_at: 'joinedAt',
  last_visited_at: 'lastVisitedAt',
  top_courses: 'topCourses',
  private_teachers: 'privateTeachers',
};

const ASSET_KEY_MAP: Record<string, string> = {
  member_id: 'memberId',
  source_order_id: 'sourceOrderId',
  contract_id: 'contractId',
  product_id: 'productId',
  product_type: 'productType',
  balance_type: 'balanceType',
  total_amount: 'totalAmount',
  remaining_amount: 'remainingAmount',
  frozen_until: 'frozenUntil',
  effective_date: 'effectiveDate',
  expiry_date: 'expiryDate',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  mall_grant_record_note: 'mallGrantRecordNote',
};

function pickStr(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v;
  return fallback;
}

function pickNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

function pickGender(v: unknown): 'female' | 'male' {
  return v === 'male' || v === 'female' ? v : 'female';
}

function pickStage(v: unknown): Member['stage'] {
  const s = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as const;
  if (typeof v === 'string' && s.includes(v as Member['stage'])) return v as Member['stage'];
  return 'S4';
}

function normalizeMemberKeys(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const [snake, camel] of Object.entries(MEMBER_KEY_MAP)) {
    if (snake in out && !(camel in out)) {
      out[camel as string] = out[snake];
    }
  }
  return out;
}

function normalizeAssetKeys(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const [snake, camel] of Object.entries(ASSET_KEY_MAP)) {
    if (snake in out && !(camel in out)) {
      out[camel as string] = out[snake];
    }
  }
  return out;
}

export function adaptMember(raw: unknown): Member {
  if (!isRecord(raw)) {
    return {
      id: '',
      name: '—',
      avatar: '',
      gender: 'female',
      phone: '—',
      stage: 'S0',
      age: 0,
      manager: '—',
      joinDate: '—',
      lastVisit: '—',
      totalLTV: 0,
      points: 0,
      totalClasses: 0,
      cards: EMPTY_CARDS,
      bodyTags: [],
      bodyNotes: '',
      timeline: EMPTY_TIMELINE,
    };
  }

  const n = normalizeMemberKeys(raw) as Partial<Member>;

  return {
    id: pickStr(n.id, ''),
    name: pickStr(n.name, '—'),
    avatar: pickStr(n.avatar, ''),
    gender: pickGender(n.gender),
    phone: pickStr(n.phone, '—'),
    lifecycleStatus: n.lifecycleStatus,
    stage: pickStage(n.stage),
    leadStatus: n.leadStatus,
    leadProbability: n.leadProbability,
    age: pickNum(n.age, 0),
    manager: pickStr(n.manager, '—'),
    joinDate: pickStr(n.joinDate, '—'),
    lastVisit: pickStr(n.lastVisit, '—'),
    totalLTV: pickNum(n.totalLTV, 0),
    points: pickNum(n.points, 0),
    totalClasses: pickNum(n.totalClasses, 0),
    cards: Array.isArray(n.cards) ? n.cards : EMPTY_CARDS,
    assets: Array.isArray(n.assets) ? n.assets.map(adaptMemberAsset) : n.assets,
    topCourses: Array.isArray(n.topCourses) ? n.topCourses : [],
    privateTeachers: Array.isArray(n.privateTeachers) ? n.privateTeachers : [],
    bodyTags: Array.isArray(n.bodyTags) ? n.bodyTags : [],
    bodyNotes: pickStr(n.bodyNotes, ''),
    timeline: Array.isArray(n.timeline) ? n.timeline : EMPTY_TIMELINE,
    riskTag: n.riskTag,
    primaryStoreId: typeof n.primaryStoreId === 'string' ? n.primaryStoreId : undefined,
    riskTags: Array.isArray(n.riskTags) ? n.riskTags : undefined,
    followUp: typeof n.followUp === 'string' ? n.followUp : undefined,
    joinedAt: typeof n.joinedAt === 'string' ? n.joinedAt : undefined,
    lastVisitedAt: typeof n.lastVisitedAt === 'string' ? n.lastVisitedAt : undefined,
  };
}

export function adaptMembers(rawList: unknown): Member[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptMember);
}

export function adaptMemberAsset(raw: unknown): MemberAsset {
  if (!isRecord(raw)) {
    return {
      id: '',
      memberId: '',
      name: '—',
      status: 'inactive',
      balanceType: 'count',
    };
  }

  const n = normalizeAssetKeys(raw) as Partial<MemberAsset>;
  const balanceType = n.balanceType === 'time' || n.balanceType === 'count' || n.balanceType === 'value' || n.balanceType === 'points' || n.balanceType === 'course'
    ? n.balanceType
    : 'count';

  const status =
    n.status === 'inactive' ||
    n.status === 'effective' ||
    n.status === 'frozen' ||
    n.status === 'expired' ||
    n.status === 'used_up' ||
    n.status === 'transferred' ||
    n.status === 'upgraded' ||
    n.status === 'cancelled'
      ? n.status
      : 'inactive';

  return {
    id: pickStr(n.id, ''),
    memberId: pickStr(n.memberId, ''),
    name: pickStr(n.name, '—'),
    status,
    sourceOrderId: n.sourceOrderId,
    contractId: n.contractId,
    productId: n.productId,
    productType: n.productType,
    balanceType,
    totalAmount: n.totalAmount,
    remainingAmount: n.remainingAmount,
    frozenUntil: n.frozenUntil,
    effectiveDate: n.effectiveDate,
    expiryDate: n.expiryDate,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    mallGrantRecordNote: n.mallGrantRecordNote,
  };
}

export function adaptMemberAssets(rawList: unknown): MemberAsset[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptMemberAsset);
}
