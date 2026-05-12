import type { Contract, MallTransferRequestPreviewDto, MemberAsset, Order, Payment, Refund } from '../types';
import {
  formatMallAssetEquitySummary,
  formatMallDateTimeDisplay,
  labelMallContractStatusZh,
  labelMallMemberAssetStatusZh,
  labelMallOrderStatusZh,
  mallAssetExpiryWithinDaysAhead,
  mallAssetIsPastExpiryClock,
} from './mallSelectors';

const REFUND_IN_FLIGHT_STATUSES: Refund['status'][] = [
  'requested',
  'reviewing',
  'approved',
  'processing',
];

const refundLinksAsset = (r: Refund, assetId: string): boolean =>
  r.memberAssetId === assetId || r.assetId === assetId;

/**
 * 是否允许打开「转卡申请」抽屉（只读判断，不修改数据）。
 * 同时校验资产、来源订单、退款登记与合同，避免仅看 asset.status。
 */
export function canOpenTransferRequest({
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
    return { allowed: false, reason: '资产信息缺失，暂不可申请转卡。', riskMessages };
  }

  if (!asset.sourceOrderId?.trim()) {
    return { allowed: false, reason: '资产来源订单缺失，暂不可申请转卡。', riskMessages };
  }

  if (!order || order.id !== asset.sourceOrderId) {
    return { allowed: false, reason: '资产来源订单缺失，暂不可申请转卡。', riskMessages };
  }

  if (!contract) {
    return {
      allowed: false,
      reason: '暂不可申请转卡：缺少合同记录，无法核对转卡依据。',
      riskMessages,
    };
  }
  if (contract.status === 'voided') {
    return { allowed: false, reason: '合同已作废，请先核对合同状态。', riskMessages };
  }

  /** 来源订单终态：不允许在「已关闭 / 已取消 / 已全额登记关闭」下打开转卡入口 */
  if (order.status === 'closed') {
    return { allowed: false, reason: '来源订单已关闭，暂不可申请转卡。', riskMessages };
  }
  if (order.status === 'cancelled') {
    return { allowed: false, reason: '来源订单已取消，暂不可申请转卡。', riskMessages };
  }
  if (order.status === 'refunded') {
    return {
      allowed: false,
      reason: '来源订单已登记全额关闭（退款），暂不可申请转卡；若资产仍显示可用，请先核对数据一致性。',
      riskMessages,
    };
  }
  if (order.status === 'draft' || order.status === 'pending_payment') {
    return { allowed: false, reason: '来源订单未完成收款或仍为草稿，暂不可申请转卡。', riskMessages };
  }

  /** 仅允许处于可经营履约链路的订单主状态 */
  const transferOkOrderStatuses: Order['status'][] = ['paid', 'fulfilled', 'partially_refunded'];
  if (!transferOkOrderStatuses.includes(order.status)) {
    return {
      allowed: false,
      reason: '来源订单主状态与可执行转卡的经营状态不一致，暂不可申请转卡。',
      riskMessages,
    };
  }

  /** 订单仍为可用主状态，但资产已不可用 → 状态冲突 */
  if (asset.status !== 'effective') {
    if (asset.status === 'frozen') {
      return { allowed: false, reason: '当前资产已冻结，暂不可申请转卡。', riskMessages };
    }
    if (asset.status === 'transferred') {
      return { allowed: false, reason: '资产已转出，暂不可申请转卡。', riskMessages };
    }
    if (asset.status === 'cancelled') {
      return { allowed: false, reason: '资产已退款或作废，暂不可申请转卡。', riskMessages };
    }
    return {
      allowed: false,
      reason: '资产状态与来源订单可用状态不一致，暂不可申请转卡；请先核对订单、退款与资产记录。',
      riskMessages,
    };
  }

  const now = new Date();
  if (mallAssetIsPastExpiryClock(asset.expiryDate, now)) {
    return { allowed: false, reason: '资产已过期，暂不可申请转卡。', riskMessages };
  }

  const rem = asset.remainingAmount ?? 0;
  if (rem <= 0) {
    return { allowed: false, reason: '资产剩余权益不足，暂不可申请转卡。', riskMessages };
  }

  const orderRefunds = refunds.filter(r => r.orderId === order.id);

  if (orderRefunds.some(r => REFUND_IN_FLIGHT_STATUSES.includes(r.status))) {
    return { allowed: false, reason: '存在进行中的退款登记，暂不可申请转卡。', riskMessages };
  }

  const linkedCompleted = orderRefunds.filter(
    r => r.status === 'completed' && refundLinksAsset(r, asset.id)
  );

  const missingHandle = linkedCompleted.some(
    r => r.assetHandleType === undefined || r.assetHandleType === null
  );
  if (missingHandle) {
    return {
      allowed: false,
      reason:
        '存在已完成的关联退款登记但未标注资产处理方式，无法判断对本资产的影响，暂不可申请转卡；请先补全登记或人工核对。',
      riskMessages,
    };
  }

  if (linkedCompleted.some(r => r.assetHandleType === 'manual_review')) {
    return {
      allowed: false,
      reason: '存在需人工复核的已完成关联退款登记，暂不可申请转卡；请先完成复核与资产口径确认。',
      riskMessages,
    };
  }

  if (linkedCompleted.some(r => r.assetHandleType === 'void_asset')) {
    return {
      allowed: false,
      reason:
        '退款登记显示应对本资产作废，与当前资产可用状态不一致，暂不可申请转卡；请先核对退款处理与资产状态。',
      riskMessages,
    };
  }

  if (
    linkedCompleted.some(r => r.assetHandleType === 'freeze_asset')
  ) {
    return {
      allowed: false,
      reason:
        '退款登记显示应对本资产冻结，与当前资产可用状态不一致，暂不可申请转卡；请先核对冻结与登记记录。',
      riskMessages,
    };
  }

  const hasCompletedOnOrder = orderRefunds.some(r => r.status === 'completed');
  const hasUnlinkedCompleted = orderRefunds.some(
    r => r.status === 'completed' && !refundLinksAsset(r, asset.id)
  );
  if (hasUnlinkedCompleted) {
    pushRisk(
      '订单上存在未绑定本资产的已完成退款登记，请先核对该笔退回是否影响本资产权益（仍以财务与合同为准）。'
    );
  } else if (hasCompletedOnOrder) {
    pushRisk('该资产关联订单存在已完成退款登记，请先核对资产状态、剩余权益、合同与财务记录。');
  }

  if (mallAssetExpiryWithinDaysAhead(asset.expiryDate, now, 30)) {
    pushRisk('资产即将到期，转卡前请先核对有效期与合同。');
  }

  if (rem > 0 && rem <= 3) {
    pushRisk('剩余权益较低，请确认转卡必要性。');
  }

  pushRisk('转卡记录需后续接入操作日志与财务/会员经营证据链。');

  return { allowed: true, riskMessages };
}

/** 转卡申请抽屉只读摘要（不写入资产、不驱动转卡） */
export function buildMallTransferRequestPreviewDto({
  asset,
  order,
  contract,
  refunds,
  memberName,
}: {
  asset: MemberAsset;
  order: Order | null | undefined;
  contract: Contract | null | undefined;
  refunds: Refund[];
  memberName?: string;
}): MallTransferRequestPreviewDto {
  const orderRefunds = order ? refunds.filter(r => r.orderId === order.id) : [];
  const hasRefundSignal = orderRefunds.some(r => r.status === 'completed');
  const hasUnlinkedCompletedRefund = orderRefunds.some(
    r => r.status === 'completed' && !refundLinksAsset(r, asset.id)
  );
  const primaryOrderName =
    order?.items.map(i => i.productName).filter(Boolean).join('、') ?? '暂未记录';

  const sourceOrderSummary = order
    ? `${labelMallOrderStatusZh(order.status)} · ${primaryOrderName}`
    : '暂无来源订单';

  const contractSummary = contract
    ? `${labelMallContractStatusZh(contract.status)} · ${contract.title?.trim() || '暂未记录'}`
    : '暂无关联合同';

  const refundSummary = !hasRefundSignal
    ? '未发现已完成登记的订单维度退回记录（仍请以财务记录为准）。'
    : hasUnlinkedCompletedRefund
      ? '订单上存在已完成登记退回，且部分记录未绑定本资产，请先核对对本资产权益与合同的影响（仍以财务记录为准）。'
      : '该订单名下存在已完成登记的退回记录（含与本资产绑定的登记），请先核对资产与合同（仍以财务记录为准）。';

  const transferRuleSummary = [
    '转卡将涉及接收会员身份、资产归属与证据链调整，正式版本需审批与留痕。',
    '本页不会修改资产归属、权益余额、合同或财务数据；正式转卡需接入统一服务。',
    '转卡可能影响预约权限与收入确认节奏，请以门店与财务口径为准。',
  ];

  return {
    assetId: asset.id,
    orderId: order?.id,
    memberId: asset.memberId,
    memberName: memberName?.trim() || undefined,
    assetName: asset.name,
    assetStatusText: labelMallMemberAssetStatusZh(asset.status),
    remainingSummary: formatMallAssetEquitySummary(asset),
    validUntilText: `${formatMallDateTimeDisplay(asset.effectiveDate)} ～ ${formatMallDateTimeDisplay(asset.expiryDate)}`,
    sourceOrderSummary,
    contractSummary,
    refundSummary,
    transferRuleSummary,
    riskMessages: [],
  };
}

/** 转卡申请草稿在页面 state 中的键（按转出资产维度，一资产一草稿）。 */
export function getTransferRequestDraftKey(assetId: string): string {
  const t = assetId?.trim();
  return t ? `transfer::${t}` : 'transfer::__';
}
