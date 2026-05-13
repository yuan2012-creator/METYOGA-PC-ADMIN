/**
 * 产品与合同域 adapter：snake_case → camelCase；mock 安全兜底；不修改入参对象、无副作用。
 */

import type { Contract, Order, OrderItem, OrderStatus, Payment, PaymentStatus } from '../types';
import { adaptMemberAsset, adaptMemberAssets } from './memberAdapter';

export { adaptMemberAsset, adaptMemberAssets };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pickStr(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v;
  return fallback;
}

function pickNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

const ORDER_STATUSES: OrderStatus[] = [
  'draft',
  'pending_payment',
  'paid',
  'fulfilled',
  'closed',
  'cancelled',
  'partially_refunded',
  'refunded',
];

function pickOrderStatus(v: unknown): OrderStatus {
  return typeof v === 'string' && ORDER_STATUSES.includes(v as OrderStatus) ? (v as OrderStatus) : 'draft';
}

const CONTRACT_STATUSES: Contract['status'][] = [
  'draft',
  'pending_signature',
  'signed',
  'effective',
  'voided',
  'expired',
  'terminated',
];

function pickContractStatus(v: unknown): Contract['status'] {
  return typeof v === 'string' && CONTRACT_STATUSES.includes(v as Contract['status'])
    ? (v as Contract['status'])
    : 'draft';
}

const PAYMENT_STATUSES: PaymentStatus[] = [
  'initiated',
  'paid',
  'reconciled',
  'failed',
  'cancelled',
  'refunding',
  'refunded',
];

function pickPaymentStatus(v: unknown): PaymentStatus {
  return typeof v === 'string' && PAYMENT_STATUSES.includes(v as PaymentStatus) ? (v as PaymentStatus) : 'initiated';
}

const ORDER_KEY_MAP: Record<string, string> = {
  member_id: 'memberId',
  total_amount: 'totalAmount',
  paid_amount: 'paidAmount',
  contract_id: 'contractId',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  sales_id: 'salesId',
  store_id: 'storeId',
};

const ORDER_ITEM_KEY_MAP: Record<string, string> = {
  order_id: 'orderId',
  product_id: 'productId',
  product_type: 'productType',
  product_name: 'productName',
  unit_price: 'unitPrice',
  total_amount: 'totalAmount',
  member_asset_id: 'memberAssetId',
};

const CONTRACT_KEY_MAP: Record<string, string> = {
  member_id: 'memberId',
  order_id: 'orderId',
  template_id: 'templateId',
  sent_at: 'sentAt',
  signed_at: 'signedAt',
  effective_at: 'effectiveAt',
  expires_at: 'expiresAt',
};

const PAYMENT_KEY_MAP: Record<string, string> = {
  order_id: 'orderId',
  member_id: 'memberId',
  transaction_no: 'transactionNo',
  initiated_at: 'initiatedAt',
  paid_at: 'paidAt',
  reconciled_at: 'reconciledAt',
};

function normalizeKeys(raw: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  for (const [snake, camel] of Object.entries(map)) {
    if (snake in out && !(camel in out)) {
      out[camel] = out[snake];
    }
  }
  return out;
}

function pickProductType(v: unknown): OrderItem['productType'] {
  const allowed: OrderItem['productType'][] = ['card', 'ttc', 'point', 'course', 'custom'];
  return typeof v === 'string' && allowed.includes(v as OrderItem['productType']) ? (v as OrderItem['productType']) : 'custom';
}

export function adaptOrderItem(raw: unknown): OrderItem {
  if (!isRecord(raw)) {
    return {
      id: '',
      productType: 'custom',
      productId: '',
      productName: '—',
      quantity: 0,
      unitPrice: 0,
      totalAmount: 0,
    };
  }
  const n = normalizeKeys(raw, ORDER_ITEM_KEY_MAP) as Partial<OrderItem>;
  return {
    id: pickStr(n.id, ''),
    orderId: n.orderId,
    productType: pickProductType(n.productType),
    productId: pickStr(n.productId, ''),
    productName: pickStr(n.productName, '—'),
    quantity: pickNum(n.quantity, 0),
    unitPrice: pickNum(n.unitPrice, 0),
    totalAmount: pickNum(n.totalAmount, 0),
    memberAssetId: n.memberAssetId,
  };
}

export function adaptOrder(raw: unknown): Order {
  if (!isRecord(raw)) {
    return {
      id: '',
      memberId: '',
      status: 'draft',
      items: [],
      totalAmount: 0,
      paidAmount: 0,
      createdAt: '',
    };
  }
  const n = normalizeKeys(raw, ORDER_KEY_MAP) as Partial<Order> & Record<string, unknown>;
  const itemsRaw = n.items;
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(adaptOrderItem) : [];

  return {
    id: pickStr(n.id, ''),
    memberId: pickStr(n.memberId, ''),
    status: pickOrderStatus(n.status),
    items,
    totalAmount: pickNum(n.totalAmount, 0),
    paidAmount: n.paidAmount !== undefined ? pickNum(n.paidAmount, 0) : undefined,
    contractId: n.contractId,
    createdAt: pickStr(n.createdAt, ''),
    updatedAt: n.updatedAt,
    salesId: n.salesId,
    storeId: n.storeId,
  };
}

export function adaptOrders(rawList: unknown): Order[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptOrder);
}

export function adaptContract(raw: unknown): Contract {
  if (!isRecord(raw)) {
    return {
      id: '',
      memberId: '',
      status: 'draft',
    };
  }
  const n = normalizeKeys(raw, CONTRACT_KEY_MAP) as Partial<Contract>;
  return {
    id: pickStr(n.id, ''),
    memberId: pickStr(n.memberId, ''),
    orderId: n.orderId,
    status: pickContractStatus(n.status),
    title: n.title,
    templateId: n.templateId,
    sentAt: n.sentAt,
    signedAt: n.signedAt,
    effectiveAt: n.effectiveAt,
    expiresAt: n.expiresAt,
  };
}

export function adaptContracts(rawList: unknown): Contract[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptContract);
}

function pickPaymentMethod(v: unknown): Payment['method'] | undefined {
  const allowed: NonNullable<Payment['method']>[] = ['cash', 'card', 'wechat', 'alipay', 'bank_transfer', 'other'];
  return typeof v === 'string' && allowed.includes(v as NonNullable<Payment['method']>) ? v : undefined;
}

export function adaptPayment(raw: unknown): Payment {
  if (!isRecord(raw)) {
    return {
      id: '',
      orderId: '',
      memberId: '',
      status: 'initiated',
      amount: 0,
    };
  }
  const n = normalizeKeys(raw, PAYMENT_KEY_MAP) as Partial<Payment>;
  return {
    id: pickStr(n.id, ''),
    orderId: pickStr(n.orderId, ''),
    memberId: pickStr(n.memberId, ''),
    status: pickPaymentStatus(n.status),
    amount: pickNum(n.amount, 0),
    method: pickPaymentMethod(n.method),
    transactionNo: n.transactionNo,
    initiatedAt: n.initiatedAt,
    paidAt: n.paidAt,
    reconciledAt: n.reconciledAt,
  };
}

export function adaptPayments(rawList: unknown): Payment[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(adaptPayment);
}
