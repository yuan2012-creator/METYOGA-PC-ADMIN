import type { ScheduleEvent } from './courseSelectors';

/** 过滤误混入页面的开发说明类片段，仅用于用户可见文案 */
const BANNED_USER_VISIBLE_SNIPPETS = [
  '不要出现',
  '术语限制',
  '开发限制',
  '严禁做',
  '严禁做的事',
  'METYOGA',
  'MetYoga',
  'MET 瑜伽',
  'AI深度分析',
  'Gemini',
  'fallback',
  'demo',
  '菜品',
  '港口',
  '码头',
  '日元',
];

export const sanitizeStaffFacingCopy = (raw: string | undefined | null): string => {
  if (raw == null) return '';
  const t = String(raw);
  if (!t.trim()) return '';
  const lower = t.toLowerCase();
  if (BANNED_USER_VISIBLE_SNIPPETS.some(s => t.includes(s) || lower.includes(s.toLowerCase()))) {
    return '—';
  }
  return t;
};

const appendNote = (existing: string | undefined, segment: string): string => {
  const base = (existing ?? '').trim();
  return base ? `${base}；${segment}` : segment;
};

const operatorClause = (operatorName?: string): string => {
  const n = operatorName?.trim();
  return n ? `（操作：${n}）` : '';
};

export type CancelSchedulePayload = {
  reason: string;
  operatorName?: string;
};

export const cancelScheduleEvent = (
  event: ScheduleEvent,
  payload: CancelSchedulePayload,
): ScheduleEvent => {
  const line = `【取消】${payload.reason.trim()}${operatorClause(payload.operatorName)}`;
  return {
    ...event,
    status: 'cancelled',
    publishStatus: 'canceled',
    bookingStatus: 'suspended',
    sessionStatus: 'canceled',
    exceptionStatus: 'cancel_pending',
    settlementStatus: 'exception_hold',
    notes: appendNote(event.notes, line),
  };
};

export type RescheduleSchedulePayload = {
  reason: string;
  note?: string;
  operatorName?: string;
};

export const rescheduleScheduleEvent = (
  event: ScheduleEvent,
  payload: RescheduleSchedulePayload,
): ScheduleEvent => {
  let line = `【调课】原因：${payload.reason.trim()}`;
  if (payload.note?.trim()) line += `；说明：${payload.note.trim()}`;
  line += operatorClause(payload.operatorName);
  return {
    ...event,
    sessionStatus: 'rescheduled',
    exceptionStatus: 'reschedule_pending',
    settlementStatus: 'exception_hold',
    notes: appendNote(event.notes, line),
  };
};

export type SubstituteSchedulePayload = {
  substituteTeacherName: string;
  reason: string;
  operatorName?: string;
};

export const substituteScheduleEvent = (
  event: ScheduleEvent,
  payload: SubstituteSchedulePayload,
): ScheduleEvent => {
  const name = payload.substituteTeacherName.trim();
  const originalTeacher = typeof event.teacher === 'string' && event.teacher.trim() ? event.teacher.trim() : '—';
  const line = `【代课】原老师：${originalTeacher}；代课老师：${name}；原因：${payload.reason.trim()}${operatorClause(payload.operatorName)}`;
  return {
    ...event,
    teacher: name,
    teacherName: name,
    sessionStatus: 'substitute',
    exceptionStatus: 'substitute_pending',
    settlementStatus: 'exception_hold',
    notes: appendNote(event.notes, line),
  };
};

export type ParsedSessionChangeEntry = {
  tag: 'cancel' | 'reschedule' | 'substitute';
  typeLabel: string;
  detail: string;
};

/** 从 notes 中解析由场次操作写入的片段，供异常记录只读展示 */
export const parseSessionChangeEntriesFromNotes = (notes?: string): ParsedSessionChangeEntry[] => {
  if (!notes?.trim()) return [];
  const segments = notes.split('；').map(s => s.trim()).filter(Boolean);
  const out: ParsedSessionChangeEntry[] = [];
  for (const seg of segments) {
    if (seg.startsWith('【取消】')) {
      const d = sanitizeStaffFacingCopy(seg.slice('【取消】'.length).trim()) || '—';
      out.push({ tag: 'cancel', typeLabel: '场次取消', detail: d });
    } else if (seg.startsWith('【调课】')) {
      const d = sanitizeStaffFacingCopy(seg.slice('【调课】'.length).trim()) || '—';
      out.push({ tag: 'reschedule', typeLabel: '调课说明', detail: d });
    } else if (seg.startsWith('【代课】')) {
      const d = sanitizeStaffFacingCopy(seg.slice('【代课】'.length).trim()) || '—';
      out.push({ tag: 'substitute', typeLabel: '代课说明', detail: d });
    }
  }
  return out;
};

const extractOperatorFromSegment = (detail: string): string | null => {
  const m = /（操作：([^）]+)）/.exec(detail);
  return m?.[1]?.trim() || null;
};

const formatLogTime = (iso?: string): string | null => {
  if (!iso?.trim()) return null;
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export type MockOperationLogEntry = {
  actionType: string;
  detail: string;
  operatorName: string;
  timeLabel: string;
};

type SessionAuditFields = {
  publishedAt?: string;
  publishedBy?: string;
  createdAt?: string;
  createdBy?: string;
};

/** 只读 mock：从 notes 标记与可选场次字段拼出操作日志行 */
export const buildMockOperationLogEntries = (
  notes: string | undefined,
  audit?: SessionAuditFields | null,
): MockOperationLogEntry[] => {
  const rows: MockOperationLogEntry[] = [];
  const a = audit ?? {};
  const parsed = parseSessionChangeEntriesFromNotes(notes);
  const typeMap: Record<ParsedSessionChangeEntry['tag'], string> = {
    cancel: '取消课程',
    reschedule: '标记调课',
    substitute: '标记代课',
  };
  for (const p of parsed) {
    rows.push({
      actionType: typeMap[p.tag],
      detail: p.detail,
      operatorName: extractOperatorFromSegment(p.detail) ?? '系统记录',
      timeLabel: '时间暂未记录',
    });
  }
  if (a.publishedAt) {
    rows.push({
      actionType: '发布课表',
      detail: '场次已发布为可预约状态（前端记录）',
      operatorName: a.publishedBy?.trim() || '系统记录',
      timeLabel: formatLogTime(a.publishedAt) ?? '时间暂未记录',
    });
  }
  if (a.createdAt && !a.publishedAt) {
    rows.push({
      actionType: '排课创建',
      detail: '场次创建时间（前端记录）',
      operatorName: a.createdBy?.trim() || '系统记录',
      timeLabel: formatLogTime(a.createdAt) ?? '时间暂未记录',
    });
  }
  return rows;
};

/** 从【代课】备注片段解析原老师 / 代课老师（若格式匹配） */
export const parseSubstituteTeachersFromDetail = (detail: string): { original?: string; substitute?: string } => {
  const orig = /原老师：([^；]+)/.exec(detail);
  const sub = /代课老师：([^；]+)/.exec(detail);
  return {
    original: orig?.[1]?.trim(),
    substitute: sub?.[1]?.trim(),
  };
};
