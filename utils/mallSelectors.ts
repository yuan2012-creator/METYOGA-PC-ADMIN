import type {
  CardProduct,
  Contract,
  ContractStatus,
  Member,
  MemberAsset,
  MemberAssetStatus,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentStatus,
  PointProduct,
  Refund,
  RefundStatus,
} from '../types';
import type { MallTtcCourse } from '../components/mall/MallTtc';
import type { MallContractData } from '../components/mall/MallContractCreate';

export type MallProductSourceType = 'card' | 'ttc' | 'point' | 'course' | 'custom';

export interface MallProductOption {
  id: string;
  name: string;
  sourceType: MallProductSourceType;
  amount: number;
  sourceLabel: string;
  status?: string;
  isFallback?: boolean;
}

export interface MallAssetSourceLink {
  assetId: string;
  memberId: string;
  assetName: string;
  sourceOrderId?: string;
  contractId?: string;
  productId?: string;
  productType?: MallProductSourceType;
  sourceLabel: string;
  orderLinked: boolean;
  contractLinked: boolean;
  order?: Order;
  contract?: Contract;
  /** 本模块内点击生成的资产（用于列表与摘要口径） */
  mallModuleGrantOnly?: boolean;
}

export interface MallOrderRow {
  id: string;
  user: string;
  phone: string;
  product: string;
  category: 'cards' | 'ttc' | 'points';
  productType: MallProductSourceType;
  type: string;
  amount: string;
  status: 'paid' | 'pending' | 'refunded' | 'completed' | 'deposit' | 'cancelled' | 'closed';
  time: string;
  details: string;
  subStatus: string;
  sourceSummary: string;
  assetSourceLabel: string;
  hasAssetSource: boolean;
}

export interface MallContractSourceSummary {
  memberName: string;
  productName: string;
  productLabel: string;
  amount: number;
  sourceSummary: string;
  isFallback: boolean;
}

export interface MallClosureSummary {
  totalOrders: number;
  linkedAssetCount: number;
  linkedContractCount: number;
  fallbackAssetCount: number;
}

export interface MallWriteClosureDraft {
  order: Order;
  contract: Contract;
  asset: MemberAsset;
  product: MallProductOption;
  member: Member;
}

const formatMoney = (value: number | undefined) => `¥${(value ?? 0).toLocaleString()}`;

const getOrderPrimaryItem = (order: Order): OrderItem | undefined => order.items[0];

/** 订单与下拉等处的业务口径（勿用于代码标识展示） */
export const getMallProductBusinessTypeLabel = (productType?: string): string => {
  if (productType === 'card') return '卡项产品';
  if (productType === 'ttc') return '教培产品';
  if (productType === 'point') return '积分商品';
  if (productType === 'course') return '课程权益';
  return '自选商品';
};

const getProductTypeLabel = getMallProductBusinessTypeLabel;

const getOrderCategory = (item?: OrderItem): MallOrderRow['category'] => {
  if (item?.productType === 'ttc') return 'ttc';
  if (item?.productType === 'point') return 'points';
  return 'cards';
};

const getOrderDisplayStatus = (order: Order): MallOrderRow['status'] => {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.status === 'closed') return 'closed';
  if (order.status === 'pending_payment') return order.paidAmount ? 'deposit' : 'pending';
  if (order.status === 'refunded' || order.status === 'partially_refunded') return 'refunded';
  if (order.status === 'fulfilled' || order.status === 'paid') return 'paid';
  return 'pending';
};

const getContractDisplay = (contract?: Contract): { details: string; subStatus: string } => {
  if (!contract) return { details: '未绑定合同', subStatus: 'inactive' };
  if (contract.status === 'effective') return { details: '合同生效', subStatus: 'active' };
  if (contract.status === 'signed') return { details: '已签合同', subStatus: 'signed' };
  if (contract.status === 'pending_signature') return { details: '待签署', subStatus: 'pending' };
  if (contract.status === 'voided') return { details: '合同已作废', subStatus: 'inactive' };
  if (contract.status === 'draft') return { details: '合同草稿', subStatus: 'pending' };
  if (contract.status === 'expired') return { details: '合同已到期', subStatus: 'inactive' };
  if (contract.status === 'terminated') return { details: '合同已终止', subStatus: 'inactive' };
  return { details: '合同待核对', subStatus: 'inactive' };
};

export const buildMallProductOptions = ({
  cards,
  ttcCourses,
  pointProducts,
}: {
  cards: CardProduct[];
  ttcCourses: MallTtcCourse[];
  pointProducts: PointProduct[];
}): MallProductOption[] => [
  ...cards.map(card => ({
    id: card.id,
    name: card.name,
    sourceType: 'card' as const,
    amount: card.price,
    sourceLabel: getProductTypeLabel('card'),
    status: card.status,
  })),
  ...ttcCourses.map(course => ({
    id: course.id,
    name: course.name,
    sourceType: 'ttc' as const,
    amount: course.price,
    sourceLabel: getProductTypeLabel('ttc'),
    status: course.status,
  })),
  ...pointProducts.map(product => ({
    id: product.id,
    name: product.name,
    sourceType: 'point' as const,
    amount: product.mixedCashPrice ?? product.mixedCash ?? 0,
    sourceLabel: getProductTypeLabel('point'),
    status: product.status,
  })),
];

export const buildMallAssetSourceLinks = ({
  assets,
  orders,
  contracts,
}: {
  assets: MemberAsset[];
  orders: Order[];
  contracts: Contract[];
}): MallAssetSourceLink[] =>
  assets.map(asset => {
    const order = orders.find(item => item.id === asset.sourceOrderId);
    const contract = contracts.find(item => item.id === asset.contractId || item.orderId === asset.sourceOrderId);
    const orderItem = order?.items.find(item => item.memberAssetId === asset.id) ?? order?.items[0];
    const productType = asset.productType ?? orderItem?.productType;
    const productNames =
      order?.items.map(i => i.productName).filter(Boolean).join('、') || '暂未记录';
    const contractTitle = contract?.title?.trim();
    const contractLine = contractTitle ? `合同：${contractTitle}` : '合同：暂未记录';

    return {
      assetId: asset.id,
      memberId: asset.memberId,
      assetName: asset.name,
      sourceOrderId: asset.sourceOrderId,
      contractId: asset.contractId ?? contract?.id,
      productId: asset.productId ?? orderItem?.productId,
      productType,
      mallModuleGrantOnly: Boolean(asset.mallGrantRecordNote?.trim()),
      sourceLabel: order
        ? `订单产品：${productNames}；${contractLine}`
        : '未找到来源订单',
      orderLinked: Boolean(order),
      contractLinked: Boolean(contract),
      order,
      contract,
    };
  });

export const buildMallOrderRows = ({
  orders,
  contracts,
  members,
  assetSourceLinks,
}: {
  orders: Order[];
  contracts: Contract[];
  members: Member[];
  assetSourceLinks: MallAssetSourceLink[];
}): MallOrderRow[] =>
  orders.map(order => {
    const item = getOrderPrimaryItem(order);
    const member = members.find(user => user.id === order.memberId);
    const assetLink = assetSourceLinks.find(link => link.sourceOrderId === order.id);
    const contract = contracts.find(contractItem => contractItem.id === order.contractId || contractItem.orderId === order.id);
    const contractDisplay = getContractDisplay(contract);
    const productType = (item?.productType ?? 'custom') as MallProductSourceType;

    const assetLine = assetLink
      ? assetLink.mallModuleGrantOnly
        ? `本模块已记录 · ${assetLink.assetName}`
        : `资产：${assetLink.assetName}`
      : '暂无资产记录';

    return {
      id: order.id,
      user: member?.name || order.memberId,
      phone: member?.phone || '-',
      product: item?.productName || '暂未记录',
      category: getOrderCategory(item),
      productType,
      type: getProductTypeLabel(item?.productType),
      amount: formatMoney(order.paidAmount ?? order.totalAmount),
      status: getOrderDisplayStatus(order),
      time: order.createdAt.replace('T', ' ').slice(0, 16),
      details: contractDisplay.details,
      subStatus: contractDisplay.subStatus,
      sourceSummary: assetLink
        ? assetLine
        : contract
          ? contract.title?.trim()
            ? `${assetLine} · 合同：${contract.title.trim()}`
            : `${assetLine} · 合同：暂未记录`
          : assetLine,
      assetSourceLabel: assetLink?.sourceLabel ?? '未生成会员资产',
      hasAssetSource: Boolean(assetLink),
    };
  });

export const buildMallContractSourceSummary = ({
  contractData,
  members,
  productOptions,
}: {
  contractData: MallContractData;
  members: Member[];
  productOptions: MallProductOption[];
}): MallContractSourceSummary => {
  const member = members.find(item => item.id === contractData.memberId);
  const product = productOptions.find(item => item.id === contractData.productId);
  const fallbackProductName = contractData.productType === 'card'
    ? contractData.cardSubCategory
    : contractData.ttcCourseName;
  const amount = product?.amount || contractData.amount || 0;
  const productKind = product ? getProductTypeLabel(product.sourceType) : '';

  return {
    memberName: member?.name ?? '未选择会员',
    productName: product?.name ?? fallbackProductName,
    productLabel: product ? productKind : '合同表单估算',
    amount,
    sourceSummary: product
      ? `产品「${product.name}」（${productKind}）→ 合同草稿 ${contractData.contractNo}`
      : `表单填写 → 合同草稿 ${contractData.contractNo}`,
    isFallback: !product,
  };
};

export const applyMallProductToContractDraft = (
  draft: MallContractData,
  product: MallProductOption
): MallContractData => ({
  ...draft,
  productId: product.id,
  amount: product.amount,
  ...(product.sourceType === 'card'
    ? { cardSubCategory: product.name, productType: 'card' as const }
    : { ttcCourseName: product.name, productType: 'ttc' as const }),
});

const toLocalIsoDateTime = (date: string | undefined, fallback: string) =>
  `${date || fallback}T00:00:00+08:00`;

const buildDraftSequence = (existingOrders: Order[]) => {
  const generatedCount = existingOrders.filter(order => order.id.startsWith('ord-local-')).length + 1;
  return String(generatedCount).padStart(3, '0');
};

export const buildMallWriteClosureDraft = ({
  contractData,
  members,
  productOptions,
  existingOrders,
  now = new Date(),
}: {
  contractData: MallContractData;
  members: Member[];
  productOptions: MallProductOption[];
  existingOrders: Order[];
  now?: Date;
}): MallWriteClosureDraft | null => {
  const member = members.find(item => item.id === contractData.memberId);
  const product = productOptions.find(item => item.id === contractData.productId);

  if (!member || !product || !contractData.amount) return null;

  const sequence = buildDraftSequence(existingOrders);
  const createdAt = now.toISOString();
  const orderId = `ord-local-${sequence}`;
  const contractId = `contract-local-${sequence}`;
  const assetId = `asset-local-${sequence}`;
  const title = contractData.productType === 'card'
    ? `${product.name}会员服务协议`
    : `${product.name}教培服务协议`;

  const orderItem: OrderItem = {
    id: `${orderId}-item-1`,
    orderId,
    productType: product.sourceType === 'ttc' ? 'ttc' : 'card',
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitPrice: contractData.amount,
    totalAmount: contractData.amount,
    memberAssetId: assetId,
  };

  const order: Order = {
    id: orderId,
    memberId: member.id,
    status: 'paid',
    items: [orderItem],
    totalAmount: contractData.amount,
    paidAmount: contractData.amount,
    contractId,
    createdAt,
    updatedAt: createdAt,
    storeId: contractData.partyAVenueId,
  };

  const contract: Contract = {
    id: contractId,
    memberId: member.id,
    orderId,
    status: 'pending_signature',
    title,
    templateId: contractData.productType === 'card' ? 'template-card-standard' : 'template-ttc-standard',
    sentAt: createdAt,
    expiresAt: contractData.endDate ? toLocalIsoDateTime(contractData.endDate, contractData.paymentDate) : undefined,
  };

  const asset: MemberAsset = {
    id: assetId,
    memberId: member.id,
    name: product.name,
    status: 'inactive',
    sourceOrderId: orderId,
    contractId,
    productId: product.id,
    productType: product.sourceType === 'ttc' ? 'ttc' : 'card',
    balanceType: product.sourceType === 'ttc' ? 'course' : 'time',
    totalAmount: product.sourceType === 'ttc' ? 1 : undefined,
    remainingAmount: product.sourceType === 'ttc' ? 1 : undefined,
    effectiveDate: toLocalIsoDateTime(contractData.startDate, contractData.paymentDate),
    expiryDate: contractData.endDate ? toLocalIsoDateTime(contractData.endDate, contractData.paymentDate) : undefined,
    createdAt,
    updatedAt: createdAt,
  };

  return { order, contract, asset, product, member };
};

export const buildMallClosureSummary = ({
  orders,
  assetSourceLinks,
}: {
  orders: Order[];
  assetSourceLinks: MallAssetSourceLink[];
}): MallClosureSummary => ({
  totalOrders: orders.length,
  linkedAssetCount: assetSourceLinks.filter(link => link.orderLinked).length,
  linkedContractCount: assetSourceLinks.filter(link => link.contractLinked).length,
  fallbackAssetCount: assetSourceLinks.filter(link => !link.orderLinked || !link.contractLinked).length,
});

/** 订单在后台是否呈现为「已收款 / 已履约」等与支付强相关的口径（用于风险提示，非财务确认） */
export const mallOrderAppearsSettledForPaymentCheck = (order: Order): boolean => {
  if (order.status === 'paid' || order.status === 'fulfilled' || order.status === 'closed') return true;
  if (order.status === 'partially_refunded' || order.status === 'refunded') return true;
  const paid = order.paidAmount ?? 0;
  const total = order.totalAmount ?? 0;
  if (total > 0 && paid >= total) return true;
  return false;
};

export const mallOrderHasAnyPaymentRecord = (order: Order, payments: Payment[]): boolean =>
  payments.some(p => p.orderId === order.id);

export const formatMallMoneyYuan = (amount: number | undefined): string => {
  if (amount === undefined || Number.isNaN(amount)) return '暂未记录';
  return `¥${amount.toLocaleString()}`;
};

export const labelMallOrderStatusZh = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    draft: '草稿',
    pending_payment: '待收款',
    paid: '已收款',
    fulfilled: '已履约',
    closed: '已关闭',
    cancelled: '已取消',
    partially_refunded: '部分已退',
    refunded: '已退款',
  };
  return map[status] ?? '暂未识别';
};

export const labelMallContractStatusZh = (status: ContractStatus): string => {
  const map: Record<ContractStatus, string> = {
    draft: '草稿',
    pending_signature: '待签署',
    signed: '已签署',
    effective: '已生效',
    voided: '已作废',
    expired: '已到期',
    terminated: '已终止',
  };
  return map[status] ?? '暂未识别';
};

export const labelMallPaymentStatusZh = (status: PaymentStatus): string => {
  const map: Record<PaymentStatus, string> = {
    initiated: '发起中',
    paid: '已到账',
    reconciled: '已对账',
    failed: '失败',
    cancelled: '已取消',
    refunding: '退款处理中',
    refunded: '已原路退回',
  };
  return map[status] ?? '暂未识别';
};

export const labelMallRefundStatusZh = (status: RefundStatus): string => {
  const map: Record<RefundStatus, string> = {
    requested: '已申请',
    reviewing: '审核中',
    approved: '已通过',
    processing: '处理中',
    completed: '已完成',
    rejected: '已驳回',
    cancelled: '已撤销',
  };
  return map[status] ?? '暂未识别';
};

export const labelMallMemberAssetStatusZh = (status: MemberAssetStatus): string => {
  const map: Record<MemberAssetStatus, string> = {
    inactive: '未激活',
    effective: '可用',
    frozen: '已冻结',
    expired: '已过期',
    used_up: '已用尽',
    transferred: '已转出',
    upgraded: '已升级',
    cancelled: '已作废',
  };
  return map[status] ?? '暂未识别';
};

export const labelMallPaymentMethodZh = (method?: Payment['method']): string => {
  if (!method) return '暂未记录';
  const map: Record<NonNullable<Payment['method']>, string> = {
    cash: '现金',
    card: '银行卡',
    wechat: '微信支付',
    alipay: '支付宝',
    bank_transfer: '银行转账',
    other: '其他',
  };
  return map[method] ?? '暂未识别';
};

export const formatMallDateTimeDisplay = (iso?: string): string => {
  if (!iso?.trim()) return '暂未记录';
  return iso.replace('T', ' ').slice(0, 19);
};

export const mallStoreLabelFromId = (storeId?: string): string | undefined => {
  if (!storeId) return undefined;
  const map: Record<string, string> = {
    '1': 'MET YOGA 万象城店',
    'v1': 'MET YOGA 万象城店',
    'v2': 'MET YOGA 西湖旗舰店',
    custom: '自定义场馆',
  };
  return map[storeId];
};

export const formatMallAssetInitialSummary = (asset: MemberAsset): string => {
  const { balanceType, totalAmount } = asset;
  if (balanceType === 'time') return `共 ${totalAmount ?? '—'} 天`;
  if (balanceType === 'count' || balanceType === 'course') return `共 ${totalAmount ?? '—'} 次`;
  if (balanceType === 'value') return `额度 ${formatMallMoneyYuan(totalAmount)}`;
  if (balanceType === 'points') return `共 ${totalAmount ?? '—'} 积分`;
  return '暂未记录';
};

export const formatMallAssetEquitySummary = (asset: MemberAsset): string => {
  const { balanceType, totalAmount, remainingAmount } = asset;
  if (balanceType === 'time') {
    const t = totalAmount ?? undefined;
    const r = remainingAmount ?? undefined;
    if (t === undefined && r === undefined) return '暂未记录';
    return `期限权益：共 ${t ?? '—'} 天，剩余 ${r ?? '—'} 天`;
  }
  if (balanceType === 'count' || balanceType === 'course') {
    const t = totalAmount ?? undefined;
    const r = remainingAmount ?? undefined;
    if (t === undefined && r === undefined) return '暂未记录';
    return `次数权益：共 ${t ?? '—'} 次，剩余 ${r ?? '—'} 次`;
  }
  if (balanceType === 'value') {
    return `额度：${formatMallMoneyYuan(totalAmount)}，剩余 ${formatMallMoneyYuan(remainingAmount)}`;
  }
  if (balanceType === 'points') {
    const t = totalAmount ?? undefined;
    const r = remainingAmount ?? undefined;
    return `积分：共 ${t ?? '—'}，剩余 ${r ?? '—'}`;
  }
  return '暂未记录';
};

export const buildMallOrderDetailRiskMessages = ({
  order,
  contract,
  payments,
  refunds,
  assets,
}: {
  order: Order;
  contract?: Contract;
  payments: Payment[];
  refunds: Refund[];
  assets: MemberAsset[];
}): string[] => {
  const messages: string[] = [];
  const orderPayments = payments.filter(p => p.orderId === order.id);
  const orderRefunds = refunds.filter(r => r.orderId === order.id);
  const orderAssets = assets.filter(a => a.sourceOrderId === order.id);
  const effectiveOrderPayments = orderPayments.filter(
    p => p.status === 'paid' || p.status === 'reconciled'
  );

  if (order.status === 'cancelled' || order.status === 'closed') {
    messages.push('该订单已取消或关闭，请按门店规则核对后续处理与留痕。');
  }

  if (
    mallOrderAppearsSettledForPaymentCheck(order) &&
    order.status !== 'cancelled' &&
    order.status !== 'closed' &&
    orderPayments.length === 0
  ) {
    messages.push('订单显示已支付，但暂无支付记录。');
  }

  const paidIn = order.paidAmount ?? 0;
  if (paidIn > 0 && contract && (contract.status === 'pending_signature' || contract.status === 'draft')) {
    messages.push('订单已支付，合同仍待签署。');
  }

  if (
    mallOrderAppearsSettledForPaymentCheck(order) &&
    contract &&
    (contract.status === 'signed' || contract.status === 'effective') &&
    orderAssets.length === 0
  ) {
    messages.push('合同已签署，但暂无会员资产发放记录。');
  }

  const hasCompletedRefund = orderRefunds.some(r => r.status === 'completed');
  const assetStillUsable = orderAssets.some(
    a => a.status === 'effective' && (a.remainingAmount ?? 0) > 0
  );
  if (hasCompletedRefund && assetStillUsable) {
    messages.push('订单存在退款记录，请核对会员资产状态。');
  }

  if (messages.length === 0) {
    const contractSignedLike =
      contract &&
      (contract.status === 'signed' || contract.status === 'effective') &&
      contract.status !== 'voided';
    const chainOk =
      mallOrderAppearsSettledForPaymentCheck(order) &&
      effectiveOrderPayments.length > 0 &&
      Boolean(contractSignedLike) &&
      orderAssets.length > 0;

    if (chainOk && orderAssets.some(a => a.mallGrantRecordNote?.trim())) {
      messages.push('产品与合同模块内资产记录已生成；会员经营同步与财务证据链需后续接入统一服务。');
    } else {
      messages.push('订单、合同、支付与资产链路暂无明显异常。');
    }
  }

  return messages;
};

export const summarizeMallHeaderPaymentStateZh = (order: Order, payments: Payment[]): string => {
  const list = payments.filter(p => p.orderId === order.id);
  if (list.length === 0) {
    if (order.status === 'pending_payment') {
      const paid = order.paidAmount ?? 0;
      if (paid > 0) return '部分已收（待收尾款）';
      return '待收款';
    }
    return '暂无支付记录';
  }
  const allReconciled = list.every(p => p.status === 'reconciled' || p.status === 'paid');
  if (allReconciled && list.length > 0) return '已登记支付';
  return '支付处理中';
};

export const summarizeMallHeaderContractStateZh = (contract?: Contract): string => {
  if (!contract) return '暂无合同';
  return labelMallContractStatusZh(contract.status);
};

export const summarizeMallHeaderAssetStateZh = (order: Order, assets: MemberAsset[]): string => {
  const list = assets.filter(a => a.sourceOrderId === order.id);
  if (list.length === 0) return '暂无资产记录';
  if (list.some(a => a.mallGrantRecordNote?.trim())) return '本模块已记录';
  const allEffective = list.every(a => a.status === 'effective');
  if (list.some(a => a.status === 'frozen')) return '含冻结资产';
  if (allEffective) return '已发放';
  return '已登记资产';
};
