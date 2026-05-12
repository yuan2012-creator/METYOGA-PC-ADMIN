import type {
  Contract,
  MallRefundRequestPreviewDto,
  MemberAsset,
  Order,
  OrderId,
  Payment,
  Refund,
  RefundAssetHandleType,
} from '../types';

const isEffectivePayment = (p: Payment): boolean =>
  p.status === 'paid' || p.status === 'reconciled';

/** 草稿在页面 state 中的键：有资产时 orderId::assetId，仅订单视角时 orderId::order */
export function getRefundRequestDraftKey(orderId: OrderId, assetId?: string | null): string {
  const suffix = assetId?.trim() ? assetId.trim() : 'order';
  return `${orderId}::${suffix}`;
}

export function canOpenRefundRequest({
  order,
  asset,
  contract,
  payments,
  refunds,
  memberAssets,
}: {
  order?: Order | null;
  asset?: MemberAsset | null;
  contract?: Contract | null;
  payments: Payment[];
  refunds: Refund[];
  memberAssets?: MemberAsset[];
}): { allowed: boolean; reason?: string; riskMessages: string[] } {
  const riskMessages: string[] = [];
  const pushRisk = (t: string) => {
    if (!riskMessages.includes(t)) riskMessages.push(t);
  };

  if (!order) {
    return { allowed: false, reason: '未找到订单信息，暂不可申请退款。', riskMessages };
  }

  if (order.status === 'cancelled' || order.status === 'closed') {
    return { allowed: false, reason: '订单已取消或关闭，暂不可申请退款。', riskMessages };
  }

  if (order.status === 'refunded') {
    return { allowed: false, reason: '订单已全额退款，暂不可再次申请退款。', riskMessages };
  }

  const orderPayments = payments.filter(p => p.orderId === order.id && isEffectivePayment(p));
  if (orderPayments.length === 0) {
    return { allowed: false, reason: '暂无支付记录，暂不可申请退款。', riskMessages };
  }

  if (contract?.status === 'voided') {
    return { allowed: false, reason: '合同已作废，请先核对合同状态。', riskMessages };
  }

  if (asset) {
    if (!asset.sourceOrderId || asset.sourceOrderId !== order.id) {
      return { allowed: false, reason: '资产来源信息不完整，暂不可申请退款。', riskMessages };
    }
  }

  const completedRefs = refunds.filter(r => r.orderId === order.id && r.status === 'completed');
  if (completedRefs.length > 0) {
    pushRisk('已有退款记录，请核对累计退款金额。');
  }

  const orderAssets = (memberAssets ?? []).filter(a => a.sourceOrderId === order.id);
  const stillUsable = orderAssets.some(
    a => a.status === 'effective' && (a.remainingAmount ?? 0) > 0
  );
  if (stillUsable && completedRefs.length > 0) {
    pushRisk('资产仍可用，请确认退款后资产处理方式。');
  }

  if (contract && contract.status !== 'signed' && contract.status !== 'effective') {
    pushRisk('合同状态异常，请核对合同依据。');
  }

  pushRisk('财务分录需后续接入统一服务。');
  pushRisk('退款属于敏感操作，正式版本需审批、财务记录与操作日志。');

  return { allowed: true, riskMessages };
}

export function buildRefundRequestPreview({
  order,
  payments,
  refunds,
  asset,
}: {
  order: Order;
  payments: Payment[];
  refunds: Refund[];
  asset?: MemberAsset | null;
}): MallRefundRequestPreviewDto {
  const completed = refunds.filter(r => r.orderId === order.id && r.status === 'completed');
  const refundedAmount = completed.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const orderPayments = payments.filter(p => p.orderId === order.id && isEffectivePayment(p));
  const summedPaid = orderPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const paidAmount =
    order.paidAmount !== undefined && order.paidAmount !== null && !Number.isNaN(Number(order.paidAmount))
      ? order.paidAmount
      : summedPaid > 0
        ? summedPaid
        : undefined;
  const paidNum = paidAmount ?? 0;
  const refundableAmount = Math.max(paidNum - refundedAmount, 0);

  let suggestedAssetHandleType: RefundAssetHandleType = 'manual_review';

  if (!asset) {
    suggestedAssetHandleType = 'manual_review';
  } else if (
    asset.status === 'effective' &&
    (asset.remainingAmount ?? 0) > 0 &&
    refundedAmount > 0
  ) {
    suggestedAssetHandleType = 'manual_review';
  } else if (paidNum > 0 && refundedAmount === 0) {
    suggestedAssetHandleType = 'void_asset';
  } else if (refundedAmount > 0 && refundableAmount > 0) {
    suggestedAssetHandleType = 'reduce_balance';
  } else {
    suggestedAssetHandleType = 'manual_review';
  }

  return {
    paidAmount,
    refundedAmount,
    refundableAmount,
    historyRefundCount: refunds.filter(r => r.orderId === order.id).length,
    suggestedAssetHandleType,
  };
}
