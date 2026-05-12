import type { CardProduct, Contract, Member, MemberAsset, Order, Payment, PointProduct, Refund } from '../types';

export type MallGrantTtcProduct = { id: string; name: string; durationDays?: number };

export type MallGrantResolvedProduct = {
  name: string;
  productType: NonNullable<Order['items'][0]>['productType'];
  productId?: string;
  balanceType: MemberAsset['balanceType'];
  totalAmount: number;
  remainingAmount: number;
  validityDays?: number;
};

const PAID_LIKE_ORDER_STATUSES: Order['status'][] = ['paid', 'fulfilled', 'partially_refunded'];

const isPaymentEffective = (p: Payment): boolean => p.status === 'paid' || p.status === 'reconciled';

const findContractForOrder = (order: Order, contracts: Contract[]): Contract | undefined =>
  contracts.find(c => c.id === order.contractId) ?? contracts.find(c => c.orderId === order.id);

const resolveProductName = (
  item: Order['items'][0],
  cardProducts: CardProduct[],
  ttcProducts: MallGrantTtcProduct[],
  pointProducts: PointProduct[]
): string => {
  const fromItem = item.productName?.trim();
  if (fromItem) return fromItem;
  const pid = item.productId;
  const card = cardProducts.find(c => c.id === pid);
  if (card) return card.name;
  const ttc = ttcProducts.find(t => t.id === pid);
  if (ttc) return ttc.name;
  const pt = pointProducts.find(p => p.id === pid);
  if (pt) return pt.name;
  return '';
};

export const resolveMallGrantProduct = (
  order: Order,
  cardProducts: CardProduct[],
  ttcProducts: MallGrantTtcProduct[],
  pointProducts: PointProduct[]
): MallGrantResolvedProduct | null => {
  const item = order.items[0];
  if (!item) return null;
  const name = resolveProductName(item, cardProducts, ttcProducts, pointProducts).trim();
  if (!name) return null;

  const productType = item.productType;
  const productId = item.productId;

  if (productType === 'card') {
    const card = cardProducts.find(c => c.id === productId);
    if (card?.type === 'stored_value') {
      const pts = card.openingPoints ?? card.points ?? 0;
      return {
        name,
        productType,
        productId,
        balanceType: 'points',
        totalAmount: pts,
        remainingAmount: pts,
        validityDays: card.validityUnit === 'month' ? card.validity * 30 : card.validity,
      };
    }
    const days =
      card?.validity != null
        ? card.validityUnit === 'month'
          ? card.validity * 30
          : card.validity
        : 365;
    return {
      name,
      productType,
      productId,
      balanceType: 'time',
      totalAmount: days,
      remainingAmount: days,
      validityDays: days,
    };
  }

  if (productType === 'ttc') {
    const ttc = ttcProducts.find(t => t.id === productId);
    const dur = ttc?.durationDays ?? 1;
    return {
      name,
      productType,
      productId,
      balanceType: 'course',
      totalAmount: 1,
      remainingAmount: 1,
      validityDays: dur,
    };
  }

  if (productType === 'point') {
    const pt = pointProducts.find(p => p.id === productId);
    const pts = pt?.purePointsPrice ?? pt?.pointsPrice ?? pt?.mixedPointsPrice ?? 0;
    return {
      name,
      productType,
      productId,
      balanceType: 'points',
      totalAmount: pts,
      remainingAmount: pts,
      validityDays: pt?.validityDays,
    };
  }

  if (productType === 'course') {
    return {
      name,
      productType,
      productId,
      balanceType: 'count',
      totalAmount: 10,
      remainingAmount: 10,
      validityDays: 365,
    };
  }

  return {
    name,
    productType: 'custom',
    productId,
    balanceType: 'value',
    totalAmount: item.totalAmount ?? order.totalAmount ?? 0,
    remainingAmount: item.totalAmount ?? order.totalAmount ?? 0,
    validityDays: 365,
  };
};

export function canGrantMemberAssetForOrder({
  order,
  contracts,
  payments,
  refunds,
  memberAssets,
  members,
  cardProducts,
  ttcProducts,
  pointProducts,
}: {
  order: Order | null | undefined;
  contracts: Contract[];
  payments: Payment[];
  refunds: Refund[];
  memberAssets: MemberAsset[];
  members: Member[];
  cardProducts: CardProduct[];
  ttcProducts: MallGrantTtcProduct[];
  pointProducts: PointProduct[];
}): { allowed: true } | { allowed: false; reason: string } {
  if (!order) {
    return { allowed: false, reason: '未找到订单信息，暂不可生成资产记录。' };
  }

  if (order.status === 'cancelled' || order.status === 'closed') {
    return { allowed: false, reason: '订单已取消或关闭，暂不可生成资产记录。' };
  }

  if (order.status === 'refunded') {
    return { allowed: false, reason: '订单已退款，暂不可生成资产记录。' };
  }

  if (!PAID_LIKE_ORDER_STATUSES.includes(order.status)) {
    return { allowed: false, reason: '订单未完成支付，暂不可生成资产记录。' };
  }

  const contract = findContractForOrder(order, contracts);
  if (!contract) {
    return { allowed: false, reason: '暂无关联合同，暂不可生成资产记录。' };
  }

  if (contract.status === 'voided') {
    return { allowed: false, reason: '合同已作废，暂不可生成资产记录。' };
  }

  if (contract.status === 'draft' || contract.status === 'pending_signature') {
    return { allowed: false, reason: '合同尚未签署，暂不可生成资产记录。' };
  }

  if (contract.status !== 'signed' && contract.status !== 'effective') {
    return { allowed: false, reason: '合同尚未签署，暂不可生成资产记录。' };
  }

  const orderPayments = payments.filter(p => p.orderId === order.id && isPaymentEffective(p));
  if (orderPayments.length === 0) {
    return { allowed: false, reason: '暂无支付记录，暂不可生成资产记录。' };
  }

  const orderRefunds = refunds.filter(r => r.orderId === order.id);
  if (orderRefunds.some(r => r.status === 'completed')) {
    return { allowed: false, reason: '订单已退款，暂不可生成资产记录。' };
  }

  if (memberAssets.some(a => a.sourceOrderId === order.id)) {
    return { allowed: false, reason: '当前订单已存在会员资产记录，无需重复生成。' };
  }

  const member = members.find(m => m.id === order.memberId);
  if (!member) {
    return { allowed: false, reason: '暂未识别会员信息，暂不可生成资产记录。' };
  }

  const resolved = resolveMallGrantProduct(order, cardProducts, ttcProducts, pointProducts);
  if (!resolved) {
    return { allowed: false, reason: '暂未识别产品信息，暂不可生成资产记录。' };
  }

  return { allowed: true };
}

const pickGrantPayment = (payments: Payment[]): Payment | undefined => {
  const list = payments.filter(p => isPaymentEffective(p));
  if (list.length === 0) return undefined;
  return [...list].sort((a, b) => {
    const ta = new Date(a.paidAt ?? a.reconciledAt ?? a.initiatedAt ?? 0).getTime();
    const tb = new Date(b.paidAt ?? b.reconciledAt ?? b.initiatedAt ?? 0).getTime();
    return tb - ta;
  })[0];
};

export const selectGrantPaymentForOrder = (order: Order, payments: Payment[]): Payment | undefined =>
  pickGrantPayment(payments.filter(p => p.orderId === order.id));

const toIsoEndOfDay = (d: Date): string => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
};

export function buildMemberAssetFromOrder({
  order,
  contract,
  payment,
  product,
  member: _member,
  now = new Date(),
}: {
  order: Order;
  contract: Contract;
  payment: Payment;
  product: MallGrantResolvedProduct;
  member: Member;
  now?: Date;
}): MemberAsset {
  const paidAt = payment.paidAt ?? payment.reconciledAt ?? payment.initiatedAt;
  const signedAt = contract.signedAt ?? contract.effectiveAt;
  const baseMs = Math.max(
    now.getTime(),
    paidAt ? new Date(paidAt).getTime() : 0,
    signedAt ? new Date(signedAt).getTime() : 0
  );
  const effectiveDate = new Date(baseMs).toISOString();

  let expiryDate: string | undefined;
  if (product.validityDays != null && product.validityDays > 0) {
    const end = new Date(baseMs);
    end.setDate(end.getDate() + product.validityDays);
    expiryDate = toIsoEndOfDay(end);
  }

  const id = `asset-from-${order.id}`;

  return {
    id,
    memberId: order.memberId,
    name: product.name,
    status: 'effective',
    sourceOrderId: order.id,
    contractId: contract.id,
    productId: product.productId,
    productType: product.productType,
    balanceType: product.balanceType,
    totalAmount: product.totalAmount,
    remainingAmount: product.remainingAmount,
    effectiveDate,
    expiryDate,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    mallGrantRecordNote:
      '产品与合同模块内生成的资产记录，正式版本需同步会员经营与财务证据链。',
  };
}
