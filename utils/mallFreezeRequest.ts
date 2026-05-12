import type { Contract, MallFreezeRequestPreviewDto, MemberAsset, Order, Payment, Refund } from '../types';
import { mallAssetExpiryWithinDaysAhead, mallAssetIsPastExpiryClock } from './mallSelectors';

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

  if (contract?.status === 'voided') {
    return { allowed: false, reason: '合同已作废，请先核对合同状态。', riskMessages };
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

  if (!contract) {
    pushRisk('当前资产缺少关联合同，请核对冻结依据。');
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
