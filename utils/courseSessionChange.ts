import type { ScheduleEvent } from './courseSelectors';

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
  const line = `【代课】代课老师：${name}；原因：${payload.reason.trim()}${operatorClause(payload.operatorName)}`;
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
      out.push({ tag: 'cancel', typeLabel: '场次取消', detail: seg.slice('【取消】'.length).trim() || '—' });
    } else if (seg.startsWith('【调课】')) {
      out.push({ tag: 'reschedule', typeLabel: '调课说明', detail: seg.slice('【调课】'.length).trim() || '—' });
    } else if (seg.startsWith('【代课】')) {
      out.push({ tag: 'substitute', typeLabel: '代课说明', detail: seg.slice('【代课】'.length).trim() || '—' });
    }
  }
  return out;
};
