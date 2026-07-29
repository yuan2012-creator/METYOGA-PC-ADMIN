import {
  isStaffApplicationStatus,
  type StaffApplicationStatus,
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

/** Legal forward edges for application status machine. */
const APPLICATION_EDGES: Record<StaffApplicationStatus, readonly StaffApplicationStatus[]> = {
  草稿: ['待提交', '已撤销'],
  待提交: ['待审批', '草稿', '已撤销'],
  待审批: ['已通过', '已驳回', '待补充', '已撤销'],
  待补充: ['待审批', '已撤销'],
  已通过: ['已执行', '执行异常'],
  已驳回: [],
  已撤销: [],
  已执行: [],
  执行异常: ['已执行', '已通过'],
};

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

export function validateApplicationTransition(
  fromRaw: string,
  toRaw: string,
  options?: TransitionOptions & { rejectReason?: string },
): TransitionResult {
  const from = isStaffApplicationStatus(fromRaw) ? fromRaw : null;
  const to = isStaffApplicationStatus(toRaw) ? toRaw : null;
  if (!from || !to) {
    return forceOk(fromRaw, toRaw, options, '未知申请状态');
  }
  if (from === to) {
    return { ok: true, from, to };
  }
  // 已执行不可直接回到待审批
  if (from === '已执行' && to === '待审批') {
    return forceOk(from, to, options, '已执行申请不能直接改回待审批');
  }
  const allowed = APPLICATION_EDGES[from] ?? [];
  if (allowed.includes(to)) {
    if (to === '已驳回' && !options?.rejectReason?.trim() && !options?.forceReason?.trim()) {
      return {
        ok: false,
        error: '驳回必须填写原因',
        from,
        to,
      };
    }
    return { ok: true, from, to };
  }
  return forceOk(from, to, options);
}

export function canApproveApplication(status: StaffApplicationStatus): boolean {
  return status === '待审批';
}

export function canRejectApplication(status: StaffApplicationStatus): boolean {
  return status === '待审批';
}

export function canRequestSupplement(status: StaffApplicationStatus): boolean {
  return status === '待审批';
}

export function applicationNeedsScheduleImpact(type: string): boolean {
  return type === '请假' || type === '代课' || type === '改期' || type === '停课';
}
