import {
  ATTENDANCE_STATUSES,
  COHORT_STATUSES,
  LEAD_STAGES,
  LEAVE_STATUSES,
  LEGACY_COHORT_STATUS_MAP,
  LEGACY_LEAD_STAGE_MAP,
  MAKEUP_STATUSES,
  PAYMENT_STATUSES,
  SESSION_STATUSES,
  type AttendanceStatus,
  type CohortStatus,
  type LeadStage,
  type LeaveStatus,
  type MakeupStatus,
  type PaymentStatus,
  type SessionStatus,
  isLeadStage,
  isPaymentStatus,
  isSessionStatus,
} from './enums';
import type { TransitionOptions } from './types';

export type TransitionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
  requireForceReason?: boolean;
  forced?: boolean;
  from: string;
  to: string;
};

const LEAD_SET = new Set<string>(LEAD_STAGES);
const TERMINAL_LEADS = new Set<LeadStage>(['暂缓', '已流失', '已退款']);
const MAX_FORWARD_JUMP = 3;

export function normalizeLeadStage(raw: string): LeadStage {
  const mapped = LEGACY_LEAD_STAGE_MAP[raw] ?? raw;
  return isLeadStage(mapped) ? mapped : '新咨询';
}

export function normalizeCohortStatus(raw: string): CohortStatus {
  const mapped = LEGACY_COHORT_STATUS_MAP[raw] ?? raw;
  return (COHORT_STATUSES as readonly string[]).includes(mapped)
    ? (mapped as CohortStatus)
    : '招生中';
}

export function normalizeSessionStatus(raw: string): SessionStatus {
  return isSessionStatus(raw) ? raw : '草稿';
}

export function normalizePaymentStatus(raw: string): PaymentStatus {
  if (raw === '实缴' || raw === '已缴费' || raw === '已付款') return '已付清';
  return isPaymentStatus(raw) ? raw : '未付款';
}

function forceOk(
  from: string,
  to: string,
  options?: TransitionOptions,
  baseError?: string,
): TransitionResult {
  const reason = options?.forceReason?.trim();
  if (reason) {
    return { ok: true, forced: true, warning: `强制跳转：${reason}`, from, to };
  }
  return {
    ok: false,
    error: baseError ?? '非法状态跳转；总部管理员强制跳转请填写原因',
    requireForceReason: true,
    from,
    to,
  };
}

export function validateLeadStageTransition(
  from: string,
  to: string,
  lead: { paidAmount: number; enrolled: boolean; interview?: { status?: string; result?: string } | null },
  options?: TransitionOptions,
): TransitionResult {
  const fromNorm = normalizeLeadStage(from);
  const toNorm = normalizeLeadStage(to);
  if (!LEAD_SET.has(toNorm)) return { ok: false, error: '未知状态', from: fromNorm, to };
  if (fromNorm === toNorm) return { ok: true, from: fromNorm, to: toNorm };

  const fromIdx = LEAD_STAGES.indexOf(fromNorm);
  const toIdx = LEAD_STAGES.indexOf(toNorm);
  const force = Boolean(options?.forceReason?.trim());

  if (toNorm === '已入班' && !lead.enrolled && !force) {
    return forceOk(fromNorm, toNorm, options, '请先完成报名收款并确认入班后再标记为已入班');
  }
  if ((toNorm === '已付清' || toNorm === '部分付款') && lead.paidAmount <= 0 && !force) {
    return forceOk(fromNorm, toNorm, options, '尚未收款，不能标记付款状态');
  }
  if (
    toNorm === '面试通过' &&
    lead.interview?.status !== '已面试' &&
    lead.interview?.result !== '通过' &&
    lead.interview?.result !== '有条件通过' &&
    !force
  ) {
    return forceOk(fromNorm, toNorm, options, '请先录入面试结果，不能直接标记面试通过');
  }
  if (fromNorm === '新咨询' && toNorm === '已入班' && !force) {
    return forceOk(fromNorm, toNorm, options, '不允许从新咨询直接跳到已入班');
  }
  if (toIdx > fromIdx + MAX_FORWARD_JUMP && !force && !(fromNorm === '面试通过' && toNorm === '已签约')) {
    return forceOk(fromNorm, toNorm, options, `不允许从「${fromNorm}」直接跳到「${toNorm}」`);
  }
  if (toIdx < fromIdx - 3 && !force) {
    return forceOk(fromNorm, toNorm, options, `不允许大幅回退到「${toNorm}」`);
  }

  return {
    ok: true,
    forced: force,
    warning: force ? `强制跳转：${options?.forceReason}` : undefined,
    from: fromNorm,
    to: toNorm,
  };
}

const COHORT_ORDER = COHORT_STATUSES as readonly CohortStatus[];

export function validateCohortStatusTransition(
  from: string,
  to: string,
  options?: TransitionOptions,
): TransitionResult {
  const fromNorm = normalizeCohortStatus(from);
  const toNorm = normalizeCohortStatus(to);
  if (fromNorm === toNorm) return { ok: true, from: fromNorm, to: toNorm };
  if (fromNorm === '已取消' || fromNorm === '已结业') {
    return forceOk(fromNorm, toNorm, options, `「${fromNorm}」后不可再变更状态`);
  }
  const fromIdx = COHORT_ORDER.indexOf(fromNorm);
  const toIdx = COHORT_ORDER.indexOf(toNorm);
  if (toIdx < 0) return { ok: false, error: '未知班期状态', from: fromNorm, to };
  if (toIdx > fromIdx + 2 && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options);
  }
  return {
    ok: true,
    forced: Boolean(options?.forceReason?.trim()),
    from: fromNorm,
    to: toNorm,
    warning: options?.forceReason ? `强制跳转：${options.forceReason}` : undefined,
  };
}

const SESSION_FLOW: SessionStatus[] = ['草稿', '待确认', '已发布', '待上课', '进行中', '已完成'];

export function validateSessionStatusTransition(
  from: string,
  to: string,
  options?: TransitionOptions,
): TransitionResult {
  const fromNorm = normalizeSessionStatus(from);
  const toNorm = normalizeSessionStatus(to);
  if (fromNorm === toNorm) return { ok: true, from: fromNorm, to: toNorm };
  if (fromNorm === '已完成' && toNorm !== '已完成') {
    return forceOk(fromNorm, toNorm, options, '已完成课次不可回退状态');
  }
  if (fromNorm === '已取消' && toNorm !== '已取消') {
    return forceOk(fromNorm, toNorm, options, '已取消课次不可恢复');
  }
  if (toNorm === '已取消' || toNorm === '已改期') {
    return { ok: true, from: fromNorm, to: toNorm };
  }
  const fromIdx = SESSION_FLOW.indexOf(fromNorm as (typeof SESSION_FLOW)[number]);
  const toIdx = SESSION_FLOW.indexOf(toNorm as (typeof SESSION_FLOW)[number]);
  if (fromIdx >= 0 && toIdx >= 0 && toIdx > fromIdx + 2 && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options);
  }
  return {
    ok: true,
    forced: Boolean(options?.forceReason?.trim()),
    from: fromNorm,
    to: toNorm,
  };
}

export function validatePaymentStatusTransition(
  from: string,
  to: string,
  ctx: { dealPriceYuan: number; paidAmountYuan: number },
  options?: TransitionOptions,
): TransitionResult {
  const fromNorm = normalizePaymentStatus(from);
  const toNorm = normalizePaymentStatus(to);
  if (fromNorm === toNorm) return { ok: true, from: fromNorm, to: toNorm };
  if (toNorm === '已付清' && ctx.paidAmountYuan + 0.001 < ctx.dealPriceYuan && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options, '累计收款未达成交价，不能标记已付清');
  }
  if (toNorm === '部分付款' && !(ctx.paidAmountYuan > 0 && ctx.paidAmountYuan < ctx.dealPriceYuan) && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options, '部分付款要求累计收款大于0且小于成交价');
  }
  if (toNorm === '未付款' && ctx.paidAmountYuan > 0 && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options, '已有收款不能标记未付款');
  }
  return {
    ok: true,
    forced: Boolean(options?.forceReason?.trim()),
    from: fromNorm,
    to: toNorm,
  };
}

export function validateLeaveTransition(
  from: string,
  to: string,
  options?: TransitionOptions,
): TransitionResult {
  const fromNorm = (LEAVE_STATUSES as readonly string[]).includes(from) ? (from as LeaveStatus) : '待确认';
  const toNorm = (LEAVE_STATUSES as readonly string[]).includes(to) ? (to as LeaveStatus) : to;
  if (!(LEAVE_STATUSES as readonly string[]).includes(toNorm)) {
    return { ok: false, error: '未知请假状态', from: fromNorm, to };
  }
  if (fromNorm === '已撤销' && toNorm !== '已撤销') {
    return forceOk(fromNorm, toNorm, options, '已撤销请假不可再变更');
  }
  if (fromNorm === '已拒绝' && toNorm === '已批准' && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options, '已拒绝请假需强制原因才能改批准');
  }
  return { ok: true, forced: Boolean(options?.forceReason?.trim()), from: fromNorm, to: toNorm };
}

export function validateMakeupTransition(
  from: string,
  to: string,
  options?: TransitionOptions,
): TransitionResult {
  const fromNorm = (MAKEUP_STATUSES as readonly string[]).includes(from) ? (from as MakeupStatus) : '待安排';
  const toNorm = (MAKEUP_STATUSES as readonly string[]).includes(to) ? (to as MakeupStatus) : to;
  if (!(MAKEUP_STATUSES as readonly string[]).includes(toNorm)) {
    return { ok: false, error: '未知补课状态', from: fromNorm, to };
  }
  if (fromNorm === '已取消' && toNorm !== '已取消') {
    return forceOk(fromNorm, toNorm, options, '已取消补课不可恢复');
  }
  if (fromNorm === '已完成' && toNorm !== '已完成') {
    return forceOk(fromNorm, toNorm, options, '已完成补课不可回退');
  }
  if (fromNorm === '待安排' && toNorm === '已完成' && !options?.forceReason?.trim()) {
    return forceOk(fromNorm, toNorm, options, '请先安排补课再标记完成');
  }
  return { ok: true, forced: Boolean(options?.forceReason?.trim()), from: fromNorm, to: toNorm };
}

export function isValidAttendanceStatus(value: string): value is AttendanceStatus {
  return (ATTENDANCE_STATUSES as readonly string[]).includes(value);
}

export function derivePaymentStatusFromAmounts(dealPriceYuan: number, paidAmountYuan: number): PaymentStatus {
  if (paidAmountYuan <= 0) return '未付款';
  if (paidAmountYuan + 0.001 >= dealPriceYuan) return '已付清';
  return '部分付款';
}

export { TERMINAL_LEADS, PAYMENT_STATUSES, SESSION_STATUSES };
