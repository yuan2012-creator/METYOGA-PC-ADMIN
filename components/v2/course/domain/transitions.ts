import type { SessionStatus, TeacherAssignmentStatus } from './enums';
import type { TransitionOptions } from './types';

const SESSION_TRANSITIONS: Record<SessionStatus, readonly SessionStatus[]> = {
  草稿: ['待发布', '已取消'],
  待发布: ['已发布', '草稿', '已取消'],
  已发布: ['待开课', '已改期', '已停课', '已取消'],
  待开课: ['进行中', '已改期', '已停课', '已取消'],
  进行中: ['已完成', '已停课'],
  已完成: [],
  已取消: [],
  已改期: ['待开课', '已发布', '已停课', '已取消'],
  已停课: [],
};

export function validateSessionStatusTransition(
  from: SessionStatus,
  to: SessionStatus,
  options?: TransitionOptions,
): { ok: boolean; error?: string; forced?: boolean } {
  if (from === to) return { ok: true };
  const allowed = SESSION_TRANSITIONS[from] ?? [];
  if (allowed.includes(to)) return { ok: true };
  if (options?.forceReason?.trim()) {
    return { ok: true, forced: true };
  }
  return { ok: false, error: `课次状态不可从「${from}」转为「${to}」` };
}

export function canReplaceTeacherForSession(input: {
  sessionStatus: SessionStatus;
  payableStatus: string;
}): { ok: boolean; error?: string } {
  if (input.sessionStatus === '已完成') {
    return {
      ok: false,
      error: '该课次已产生教学或财务事实，不能直接更换老师。',
    };
  }
  if (input.payableStatus === '应付' || input.payableStatus === '已支付') {
    return {
      ok: false,
      error: '该课次已产生教学或财务事实，不能直接更换老师。',
    };
  }
  return { ok: true };
}

export function nextAssignmentStatusAfterAssign(
  mode: 'assign' | 'replace' | 'substitute' | 'pending_replacement',
): TeacherAssignmentStatus {
  switch (mode) {
    case 'assign':
      return '已确认';
    case 'replace':
      return '已替换';
    case 'substitute':
      return '已替换';
    case 'pending_replacement':
      return '待替代';
    default:
      return '已确认';
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}
