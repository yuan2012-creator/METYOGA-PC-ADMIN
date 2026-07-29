import type { Contract, MallFreezeRequestPreviewDto, MemberAsset, Order, Payment, Refund } from '../types';
import { mallAssetExpiryWithinDaysAhead, mallAssetIsPastExpiryClock } from './mallSelectors';

const REFUND_IN_FLIGHT_STATUSES: Refund['status'][] = [
  'requested',
  'reviewing',
  'approved',
  'processing',
];

/**
 * 是否允许打开「冻结申请」抽屉（只读判断，不修改数据）。
 */
export function canOpenFreezeRequest({
  asset,
  order,
  contract,
  payments: _payments,
  refunds,
}: {
  asset?: MemberAsset | null;
  order?: Order | null;
  contract?: Contract | null;
  payments: Payment[];
  refunds: Refund[];
}): { allowed: boolean; reason?: string; riskMessages: string[] } {
  void _payments;
  const riskMessages: string[] = [];
  const pushRisk = (t: string) => {
    if (!riskMessages.includes(t)) riskMessages.push(t);
  };

  if (!asset) {
    return { allowed: false, reason: '资产信息缺失，暂不可申请冻结。', riskMessages };
  }

  if (!asset.sourceOrderId?.trim()) {
    return { allowed: false, reason: '资产来源订单缺失，暂不可申请冻结。', riskMessages };
  }

  if (!order || order.id !== asset.sourceOrderId) {
    return { allowed: false, reason: '资产来源订单缺失，暂不可申请冻结。', riskMessages };
  }

  if (!contract) {
    return {
      allowed: false,
      reason: '暂不可申请冻结：缺少合同记录，无法核对冻结依据。',
      riskMessages,
    };
  }

  if (contract.status === 'voided') {
    return { allowed: false, reason: '合同已作废，请先核对合同状态。', riskMessages };
  }

  if (order.status === 'closed') {
    return { allowed: false, reason: '来源订单已关闭，暂不可申请冻结。', riskMessages };
  }
  if (order.status === 'cancelled') {
    return { allowed: false, reason: '来源订单已取消，暂不可申请冻结。', riskMessages };
  }
  if (order.status === 'refunded') {
    return {
      allowed: false,
      reason:
        '来源订单已登记全额关闭（退款），暂不可申请冻结；若资产仍显示可用，请先核对数据一致性。',
      riskMessages,
    };
  }
  if (order.status === 'draft' || order.status === 'pending_payment') {
    return { allowed: false, reason: '来源订单未完成收款或仍为草稿，暂不可申请冻结。', riskMessages };
  }

  const freezeOkOrderStatuses: Order['status'][] = ['paid', 'fulfilled', 'partially_refunded'];
  if (!freezeOkOrderStatuses.includes(order.status)) {
    return {
      allowed: false,
      reason: '暂不可申请冻结：来源订单状态不支持冻结申请，请先核对订单与资产状态。',
      riskMessages,
    };
  }

  const orderRefundsEarly = refunds.filter(r => r.orderId === order.id);
  if (orderRefundsEarly.some(r => REFUND_IN_FLIGHT_STATUSES.includes(r.status))) {
    return { allowed: false, reason: '存在进行中的退款登记，暂不可申请冻结。', riskMessages };
  }

  if (asset.status === 'frozen') {
    return { allowed: false, reason: '当前资产已处于冻结状态。', riskMessages };
  }

  if (asset.status === 'transferred') {
    return { allowed: false, reason: '资产已转出，暂不可申请冻结。', riskMessages };
  }

  if (asset.status === 'cancelled') {
    return { allowed: false, reason: '资产已退款或作废，暂不可申请冻结。', riskMessages };
  }

  if (asset.status !== 'effective') {
    return { allowed: false, reason: '当前资产不是可用状态，暂不可申请冻结。', riskMessages };
  }

  const now = new Date();
  if (mallAssetIsPastExpiryClock(asset.expiryDate, now)) {
    return { allowed: false, reason: '资产已过期，暂不可申请冻结。', riskMessages };
  }

  const rem = asset.remainingAmount ?? 0;
  if (rem <= 0) {
    return { allowed: false, reason: '资产剩余权益不足，暂不可申请冻结。', riskMessages };
  }

  const orderRefunds = refunds.filter(r => r.orderId === order.id);
  if (orderRefunds.some(r => r.status === 'completed')) {
    pushRisk('该资产关联订单存在退款记录，请先核对资产状态。');
  }

  if (mallAssetExpiryWithinDaysAhead(asset.expiryDate, now, 30)) {
    pushRisk('资产即将到期，请确认是否允许冻结及顺延。');
  }

  if (rem > 0 && rem <= 3) {
    pushRisk('剩余权益较低，请确认冻结必要性。');
  }

  pushRisk('冻结记录需后续接入操作日志与财务/会员经营证据链。');

  return { allowed: true, riskMessages };
}

/** 冻结申请抽屉只读辅助标记（不写入资产、不驱动冻结） */
export function buildMallFreezeRequestPreviewDto({
  asset,
  order,
  contract,
  refunds,
}: {
  asset: MemberAsset;
  order: Order | null | undefined;
  contract: Contract | null | undefined;
  refunds: Refund[];
}): MallFreezeRequestPreviewDto {
  const now = new Date();
  const rem = asset.remainingAmount ?? 0;
  const orderRefunds = order ? refunds.filter(r => r.orderId === order.id) : [];
  const hasRefundSignal = orderRefunds.some(r => r.status === 'completed');

  return {
    nearExpiry: Boolean(asset.expiryDate?.trim()) && mallAssetExpiryWithinDaysAhead(asset.expiryDate, now, 30),
    lowEquity: rem > 0 && rem <= 3,
    hasRefundSignal,
    missingContract: !contract,
  };
}
