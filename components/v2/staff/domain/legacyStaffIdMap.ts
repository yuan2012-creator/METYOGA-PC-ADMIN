/**
 * Central legacy → staff_xxx ID map.
 * Pages MUST NOT match by display name; use resolveLegacyStaffRef / listUnresolved.
 */

import type { LegacyStaffMappingEntry, UnresolvedStaffReference } from './types';

/** Canonical staff IDs for seed personas (one real person → one staffId). */
export const CANONICAL_STAFF_IDS = {
  mia: 'staff_mia',
  anna: 'staff_anna',
  nora: 'staff_nora',
  leo: 'staff_leo',
  chenyue: 'staff_chenyue',
  dapeng: 'staff_dapeng',
  joyce: 'staff_joyce',
  yidan: 'staff_yidan',
  dongdong: 'staff_dongdong',
  keke: 'staff_keke',
  ruilin: 'staff_ruilin',
  caicai: 'staff_caicai',
  fangfang: 'staff_fangfang',
  lina: 'staff_lina',
} as const;

export type CanonicalStaffKey = keyof typeof CANONICAL_STAFF_IDS;

const DISPLAY_NAME_TO_STAFF: Record<string, string> = {
  Mia: CANONICAL_STAFF_IDS.mia,
  mia: CANONICAL_STAFF_IDS.mia,
  Anna: CANONICAL_STAFF_IDS.anna,
  anna: CANONICAL_STAFF_IDS.anna,
  Nora: CANONICAL_STAFF_IDS.nora,
  Leo: CANONICAL_STAFF_IDS.leo,
  陈悦: CANONICAL_STAFF_IDS.chenyue,
  大鹏: CANONICAL_STAFF_IDS.dapeng,
  JOYCE: CANONICAL_STAFF_IDS.joyce,
  Joyce: CANONICAL_STAFF_IDS.joyce,
  一丹: CANONICAL_STAFF_IDS.yidan,
  董董: CANONICAL_STAFF_IDS.dongdong,
  科科: CANONICAL_STAFF_IDS.keke,
  锐霖: CANONICAL_STAFF_IDS.ruilin,
  菜菜: CANONICAL_STAFF_IDS.caicai,
  芳芳: CANONICAL_STAFF_IDS.fangfang,
  Lina: CANONICAL_STAFF_IDS.lina,
};

/**
 * Explicit legacy keys only. Name-based resolution is reserved for seed migration
 * via resolveDisplayNameToStaffId and must surface unresolved when unknown.
 */
export const LEGACY_STAFF_ID_MAP: LegacyStaffMappingEntry[] = [
  // types.ts Staff numeric ids (known overlaps)
  { legacyKey: '1', legacySource: 'types.Staff.id', staffId: null, resolution: 'unresolved', displayHint: 'Sarah', note: 'V1 Staff#1 Sarah 未纳入本轮主数据示例' },
  { legacyKey: '4', legacySource: 'types.Staff.id', staffId: CANONICAL_STAFF_IDS.anna, resolution: 'resolved', displayHint: 'Anna' },
  { legacyKey: '3', legacySource: 'types.Staff.id', staffId: CANONICAL_STAFF_IDS.leo, resolution: 'resolved', displayHint: 'Leo', note: '启发式：V1 Leo ↔ staff_leo' },

  // StaffTeacherRow stf-N / T-####
  { legacyKey: 'stf-1', legacySource: 'StaffTeacherRow.stf', staffId: CANONICAL_STAFF_IDS.lina, resolution: 'resolved', displayHint: 'Lina' },
  { legacyKey: 'T-1001', legacySource: 'StaffTeacherRow.T', staffId: CANONICAL_STAFF_IDS.lina, resolution: 'resolved', displayHint: 'Lina' },
  { legacyKey: 'stf-18', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved', note: '运营看板孤儿行，待确认' },
  { legacyKey: 'stf-13', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-5', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-3', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-4', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-11', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-14', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-15', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },
  { legacyKey: 'stf-2', legacySource: 'StaffTeacherRow.stf', staffId: null, resolution: 'unresolved' },

  // Staff V2 teacher-* ids
  { legacyKey: 'teacher-mia', legacySource: 'StaffV2.teacher', staffId: CANONICAL_STAFF_IDS.mia, resolution: 'resolved', displayHint: 'Mia' },
  { legacyKey: 'teacher-anna', legacySource: 'StaffV2.teacher', staffId: CANONICAL_STAFF_IDS.anna, resolution: 'resolved', displayHint: 'Anna' },
  { legacyKey: 'teacher-nora', legacySource: 'StaffV2.teacher', staffId: CANONICAL_STAFF_IDS.nora, resolution: 'resolved', displayHint: 'Nora' },
  { legacyKey: 'teacher-leo', legacySource: 'StaffV2.teacher', staffId: CANONICAL_STAFF_IDS.leo, resolution: 'resolved', displayHint: 'Leo' },
  { legacyKey: 'teacher-chen', legacySource: 'StaffV2.teacher', staffId: CANONICAL_STAFF_IDS.chenyue, resolution: 'resolved', displayHint: '陈悦' },

  // Course module t-* / ts-*
  { legacyKey: 't-mia', legacySource: 'course.t', staffId: CANONICAL_STAFF_IDS.mia, resolution: 'resolved', displayHint: 'Mia' },
  { legacyKey: 't-anna', legacySource: 'course.t', staffId: CANONICAL_STAFF_IDS.anna, resolution: 'resolved', displayHint: 'Anna' },
  { legacyKey: 't-nora', legacySource: 'course.t', staffId: CANONICAL_STAFF_IDS.nora, resolution: 'resolved', displayHint: 'Nora' },
  { legacyKey: 't-leo', legacySource: 'course.t', staffId: CANONICAL_STAFF_IDS.leo, resolution: 'resolved', displayHint: 'Leo' },
  { legacyKey: 't-lily', legacySource: 'course.t', staffId: null, resolution: 'unresolved', displayHint: 'Lily', note: '老师关联待确认：课程侧 Lily 尚未纳入 Staff 主数据' },
  { legacyKey: 'ts-mia', legacySource: 'course.ts', staffId: CANONICAL_STAFF_IDS.mia, resolution: 'resolved', displayHint: 'Mia' },
  { legacyKey: 'ts-anna', legacySource: 'course.ts', staffId: CANONICAL_STAFF_IDS.anna, resolution: 'resolved', displayHint: 'Anna' },
  { legacyKey: 'ts-nora', legacySource: 'course.ts', staffId: CANONICAL_STAFF_IDS.nora, resolution: 'resolved', displayHint: 'Nora' },
  { legacyKey: 'ts-leo', legacySource: 'course.ts', staffId: CANONICAL_STAFF_IDS.leo, resolution: 'resolved', displayHint: 'Leo' },
  { legacyKey: 'ts-lily', legacySource: 'course.ts', staffId: null, resolution: 'unresolved', displayHint: 'Lily', note: '老师关联待确认' },

  // Research mentors (name historically used as key — map explicitly, do not guess in UI)
  { legacyKey: '大鹏', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.dapeng, resolution: 'resolved' },
  { legacyKey: 'JOYCE', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.joyce, resolution: 'resolved' },
  { legacyKey: '锐霖', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.ruilin, resolution: 'resolved' },
  { legacyKey: '芳芳', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.fangfang, resolution: 'resolved' },
  { legacyKey: '一丹', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.yidan, resolution: 'resolved' },
  { legacyKey: '董董', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.dongdong, resolution: 'resolved' },
  { legacyKey: '科科', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.keke, resolution: 'resolved' },
  { legacyKey: '菜菜', legacySource: 'research.mentorName', staffId: CANONICAL_STAFF_IDS.caicai, resolution: 'resolved' },

  // Finance / member name keys that collide or are unknown
  { legacyKey: '李老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved', note: '数据中心师资行，无稳定 ID' },
  { legacyKey: '王老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '陈老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '张老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '刘老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '赵老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '周老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '吴老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '郑老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
  { legacyKey: '孙老师', legacySource: 'finance.teacherName', staffId: null, resolution: 'unresolved' },
];

const BY_KEY = new Map(LEGACY_STAFF_ID_MAP.map(e => [`${e.legacySource}::${e.legacyKey}`, e]));
const BY_RAW = new Map<string, LegacyStaffMappingEntry[]>();
for (const entry of LEGACY_STAFF_ID_MAP) {
  const list = BY_RAW.get(entry.legacyKey) ?? [];
  list.push(entry);
  BY_RAW.set(entry.legacyKey, list);
}

export function resolveLegacyStaffRef(
  legacyKey: string,
  preferredSource?: LegacyStaffMappingEntry['legacySource'],
): { staffId: string | null; resolution: 'resolved' | 'unresolved'; entry?: LegacyStaffMappingEntry } {
  if (preferredSource) {
    const hit = BY_KEY.get(`${preferredSource}::${legacyKey}`);
    if (hit) {
      return { staffId: hit.staffId, resolution: hit.resolution, entry: hit };
    }
  }
  const list = BY_RAW.get(legacyKey) ?? [];
  const resolved = list.find(e => e.resolution === 'resolved' && e.staffId);
  if (resolved) {
    return { staffId: resolved.staffId, resolution: 'resolved', entry: resolved };
  }
  if (list[0]) {
    return { staffId: list[0].staffId, resolution: list[0].resolution, entry: list[0] };
  }
  // Already canonical?
  if (legacyKey.startsWith('staff_')) {
    return { staffId: legacyKey, resolution: 'resolved' };
  }
  return { staffId: null, resolution: 'unresolved' };
}

/** Seed-only helper. UI must not call this for live matching. */
export function resolveDisplayNameToStaffId(name: string): string | null {
  return DISPLAY_NAME_TO_STAFF[name.trim()] ?? null;
}

export function listUnresolvedLegacyMappings(): LegacyStaffMappingEntry[] {
  return LEGACY_STAFF_ID_MAP.filter(e => e.resolution === 'unresolved' || !e.staffId);
}

export function countUnresolvedLegacyMappings(): number {
  return listUnresolvedLegacyMappings().length;
}

export function buildUnresolvedReferenceRecords(
  extras: Array<{ source: string; rawValue: string; context: string }> = [],
): UnresolvedStaffReference[] {
  const fromMap = listUnresolvedLegacyMappings().map((e, i) => ({
    id: `unresolved-map-${i + 1}`,
    source: e.legacySource,
    rawValue: e.legacyKey,
    context: e.note ?? e.displayHint ?? '人员关联待确认',
    markedAt: '2026-07-27T00:00:00.000Z',
  }));
  const fromExtras = extras.map((e, i) => ({
    id: `unresolved-extra-${i + 1}`,
    source: e.source,
    rawValue: e.rawValue,
    context: e.context,
    markedAt: '2026-07-27T00:00:00.000Z',
  }));
  return [...fromMap, ...fromExtras];
}
