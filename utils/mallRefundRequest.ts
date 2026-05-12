import type {
  Contract,
  MallRefundRequestDraft,
  MallRefundRequestPreviewDto,
  MallRefundRequestSubmitValidation,
  MemberAsset,
  Order,
  OrderId,
  Payment,
  Refund,
  RefundAssetHandleType,
  RefundType,
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

const REFUND_TYPES: RefundType[] = ['full_refund', 'partial_refund', 'deposit_refund', 'special_refund'];
const ASSET_HANDLE_TYPES: RefundAssetHandleType[] = [
  'void_asset',
  'reduce_balance',
  'freeze_asset',
  'keep_asset',
  'manual_review',
];

/**
 * 提交前校验（仅展示用，不开放真实提交、不写业务数据）。
 */
export function validateRefundRequestDraftForSubmit({
  draft,
  order,
  asset,
  contract,
  payments,
  refunds,
  preview,
  gate,
}: {
  draft: MallRefundRequestDraft;
  order: Order | null | undefined;
  asset?: MemberAsset | null;
  contract?: Contract | null;
  payments: Payment[];
  refunds: Refund[];
  preview: MallRefundRequestPreviewDto;
  gate: { allowed: boolean; reason?: string };
}): MallRefundRequestSubmitValidation {
  const blockingMessages: string[] = [];
  const pushBlock = (t: string) => {
    if (t && !blockingMessages.includes(t)) blockingMessages.push(t);
  };

  if (!gate.allowed && gate.reason) {
    pushBlock(gate.reason);
  }

  if (!order) {
    pushBlock('未找到订单信息，暂不可申请退款。');
  } else {
    if (order.status === 'cancelled' || order.status === 'closed') {
      if (!blockingMessages.some(m => m.includes('订单已取消') || m.includes('已关闭'))) {
        pushBlock('订单已取消或关闭，暂不可提交退款申请。');
      }
    }
    if (order.status === 'refunded') {
      if (!blockingMessages.some(m => m.includes('全额退款') || m.includes('再次'))) {
        pushBlock('订单已全额退款，暂不可再次提交退款申请。');
      }
    }
    if (contract?.status === 'voided') {
      if (!blockingMessages.some(m => m.includes('合同已作废'))) {
        pushBlock('合同已作废，请先核对合同状态。');
      }
    }
  }

  const rt = draft.refundType as string | undefined;
  if (!rt?.trim() || !REFUND_TYPES.includes(draft.refundType)) {
    pushBlock('请选择退款类型。');
  }

  const amt = draft.requestedAmount;
  if (amt === undefined || Number.isNaN(Number(amt))) {
    pushBlock('请填写申请退款金额。');
  } else {
    if (amt <= 0) {
      pushBlock('申请退款金额需大于 0。');
    }
    if (amt > preview.refundableAmount) {
      pushBlock('申请金额超过当前可申请退款上限，请核对。');
    }
  }

  if (!draft.refundReason?.trim()) {
    pushBlock('请填写退款原因。');
  }

  const ht = draft.assetHandleType as string | undefined;
  if (!ht?.trim() || !ASSET_HANDLE_TYPES.includes(draft.assetHandleType)) {
    pushBlock('请选择资产处理方式。');
  }

  const warningMessages: string[] = [];
  const pushWarn = (t: string) => {
    if (t && !warningMessages.includes(t)) warningMessages.push(t);
  };

  if (order) {
    const completedRefs = refunds.filter(r => r.orderId === order.id && r.status === 'completed');
    if (completedRefs.length > 0) {
      pushWarn('已有退款记录，请核对累计退款金额。');
    }
    if (
      asset &&
      asset.status === 'effective' &&
      (asset.remainingAmount ?? 0) > 0 &&
      completedRefs.length > 0
    ) {
      pushWarn('资产仍可用，请确认退款后的资产处理方式。');
    }
    if (draft.refundType === 'partial_refund' && draft.assetHandleType === 'void_asset') {
      pushWarn('部分退款选择作废资产，请确认处理依据。');
    }
    if (
      draft.refundType === 'full_refund' &&
      draft.assetHandleType !== 'void_asset' &&
      draft.assetHandleType !== 'manual_review'
    ) {
      pushWarn('全额退款建议作废资产或人工复核。');
    }
    const linkedAsset = !!(draft.assetId?.trim() || asset);
    if (!linkedAsset) {
      pushWarn('当前退款申请未关联具体会员资产，请确认资产处理结果。');
    }
  }

  pushWarn('财务分录需后续接入统一服务。');

  if (!draft.attachmentNote?.trim()) {
    pushWarn('未填写证明材料说明，正式版本建议上传退款依据。');
  }

  const confirmationMessages: string[] = [
    '退款金额已核对；',
    '资产处理方式已核对；',
    '合同条款已核对；',
    '财务记录与操作日志需正式版本接入；',
    '当前仅为提交前校验，不会生成退款记录。',
  ];

  return {
    canSubmit: blockingMessages.length === 0,
    blockingMessages,
    warningMessages,
    confirmationMessages,
  };
}
