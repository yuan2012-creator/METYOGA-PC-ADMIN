import type {
  CardProduct,
  Contract,
  Member,
  MemberAsset,
  Order,
  OrderItem,
  PointProduct,
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
  status: 'paid' | 'pending' | 'refunded' | 'completed' | 'deposit';
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

const getProductTypeLabel = (productType?: string): string => {
  if (productType === 'card') return '会员卡项';
  if (productType === 'ttc') return '教培';
  if (productType === 'point') return '积分商品';
  if (productType === 'course') return '课程权益';
  return '自定义';
};

const getOrderCategory = (item?: OrderItem): MallOrderRow['category'] => {
  if (item?.productType === 'ttc') return 'ttc';
  if (item?.productType === 'point') return 'points';
  return 'cards';
};

const getOrderDisplayStatus = (order: Order): MallOrderRow['status'] => {
  if (order.status === 'pending_payment') return order.paidAmount ? 'deposit' : 'pending';
  if (order.status === 'refunded' || order.status === 'partially_refunded') return 'refunded';
  if (order.status === 'fulfilled' || order.status === 'closed' || order.status === 'paid') return 'paid';
  return 'pending';
};

const getContractDisplay = (contract?: Contract): { details: string; subStatus: string } => {
  if (!contract) return { details: '未绑定合同', subStatus: 'inactive' };
  if (contract.status === 'effective') return { details: '合同生效', subStatus: 'active' };
  if (contract.status === 'signed') return { details: '已签合同', subStatus: 'signed' };
  if (contract.status === 'pending_signature') return { details: '待签署', subStatus: 'pending' };
  return { details: '合同异常', subStatus: contract.status };
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
    sourceLabel: 'CardProduct',
    status: card.status,
  })),
  ...ttcCourses.map(course => ({
    id: course.id,
    name: course.name,
    sourceType: 'ttc' as const,
    amount: course.price,
    sourceLabel: 'TtcProduct',
    status: course.status,
  })),
  ...pointProducts.map(product => ({
    id: product.id,
    name: product.name,
    sourceType: 'point' as const,
    amount: product.mixedCashPrice ?? product.mixedCash ?? 0,
    sourceLabel: 'PointProduct',
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

    return {
      assetId: asset.id,
      memberId: asset.memberId,
      assetName: asset.name,
      sourceOrderId: asset.sourceOrderId,
      contractId: asset.contractId ?? contract?.id,
      productId: asset.productId ?? orderItem?.productId,
      productType,
      sourceLabel: order
        ? `${order.id}${contract ? ` / ${contract.id}` : ' / 未绑定合同'}`
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

    return {
      id: order.id,
      user: member?.name || order.memberId,
      phone: member?.phone || '-',
      product: item?.productName || '未知商品',
      category: getOrderCategory(item),
      productType,
      type: getProductTypeLabel(item?.productType),
      amount: formatMoney(order.paidAmount ?? order.totalAmount),
      status: getOrderDisplayStatus(order),
      time: order.createdAt.replace('T', ' ').slice(0, 16),
      details: contractDisplay.details,
      subStatus: contractDisplay.subStatus,
      sourceSummary: assetLink
        ? `资产来源：${assetLink.assetName}`
        : contract
          ? `合同来源：${contract.id}`
          : '仅订单记录，待生成资产/合同',
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

  return {
    memberName: member?.name ?? '未选择会员',
    productName: product?.name ?? fallbackProductName,
    productLabel: product?.sourceLabel ?? '合同表单估算',
    amount,
    sourceSummary: product
      ? `${product.sourceLabel} ${product.id} -> 合同草稿 ${contractData.contractNo}`
      : `表单字段 -> 合同草稿 ${contractData.contractNo}`,
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
