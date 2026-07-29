/**
 * Research Center V2.0 — canonical status enums.
 * UI and services MUST import from here; do not redeclare string unions in components.
 */

export const LEAD_STAGES = [
  '新咨询',
  '待联系',
  '已联系',
  '有效意向',
  '待面试',
  '已面试',
  '面试通过',
  '已发方案',
  '待签约',
  '已签约',
  '部分付款',
  '已付清',
  '已入班',
  '暂缓',
  '已流失',
  '已退款',
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const COHORT_STATUSES = [
  '草稿',
  '招生中',
  '待锁班',
  '条件锁班',
  '已锁班',
  '待开课',
  '进行中',
  '考试中',
  '待结业',
  '已结业',
  '已取消',
] as const;
export type CohortStatus = (typeof COHORT_STATUSES)[number];

export const SESSION_STATUSES = [
  '草稿',
  '待确认',
  '已发布',
  '待上课',
  '进行中',
  '已完成',
  '已取消',
  '已改期',
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['待签到', '已到', '请假', '缺勤', '迟到', '早退'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const PAYMENT_STATUSES = ['未付款', '部分付款', '已付清', '部分退款', '已退款'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const LEAVE_STATUSES = ['待确认', '已批准', '已拒绝', '已撤销'] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

export const MAKEUP_STATUSES = ['待安排', '已安排', '已完成', '已取消'] as const;
export type MakeupStatus = (typeof MAKEUP_STATUSES)[number];

export const PAYABLE_STATUSES = ['待配置', '待确认', '待付款', '部分支付', '已支付', '已逾期'] as const;
export type PayableStatus = (typeof PAYABLE_STATUSES)[number];

export const CONTRACT_STATUSES = ['未签约', '已签约', '已作废'] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

/** Legacy synonyms → canonical (V1.x → V2.0). */
export const LEGACY_LEAD_STAGE_MAP: Record<string, LeadStage> = {
  新增咨询: '新咨询',
  正式入班: '已入班',
  完成面试: '已面试',
  已缴费: '已付清',
  已付款: '已付清',
  实缴: '已付清',
};

export const LEGACY_COHORT_STATUS_MAP: Record<string, CohortStatus> = {
  招生: '招生中',
  锁班: '已锁班',
  开课中: '进行中',
  结业: '已结业',
  取消: '已取消',
};

export function isLeadStage(value: string): value is LeadStage {
  return (LEAD_STAGES as readonly string[]).includes(value);
}

export function isSessionStatus(value: string): value is SessionStatus {
  return (SESSION_STATUSES as readonly string[]).includes(value);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}
