/**
 * P0 产品与合同域只读 service：从 MOCK_ORDERS / MOCK_CONTRACTS / MOCK_PAYMENTS / MOCK_MEMBER_ASSETS
 * 经 mallAdapter 返回；不接云函数、不发起网络请求。
 */

import {
  adaptContract,
  adaptContracts,
  adaptMemberAssets,
  adaptOrder,
  adaptOrders,
  adaptPayment,
  adaptPayments,
} from '../adapters/mallAdapter';
import { MOCK_CONTRACTS, MOCK_MEMBER_ASSETS, MOCK_ORDERS, MOCK_PAYMENTS } from '../constants.ts';
import type { Contract, MemberAsset, Order, Payment } from '../types';
import {
  buildReadonlyMeta,
  defaultReadonlyDataSource,
  generateReadonlyRequestId,
  readonlyLiveNotConnectedError,
} from './apiClient';
import type { ReadonlyApiResult, ReadonlyQueryParams } from './readonlyTypes';

function baseQueryParams(overrides: Partial<ReadonlyQueryParams>): ReadonlyQueryParams {
  return {
    requestId: overrides.requestId ?? generateReadonlyRequestId(),
    page: overrides.page ?? 1,
    pageSize: overrides.pageSize ?? 20,
    storeId: overrides.storeId,
    from: overrides.from,
    to: overrides.to,
    role: overrides.role,
    dataSource: overrides.dataSource ?? defaultReadonlyDataSource(),
  };
}

export interface FetchMallListParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
  orderId?: string;
  memberId?: string;
}

export interface FetchOrderDetailParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

export interface FetchContractDetailParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

export interface FetchPaymentsParams extends FetchMallListParams {}

export interface FetchMemberAssetsByOrderParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

function filterOrdersByStore(list: typeof MOCK_ORDERS, storeId?: string): typeof MOCK_ORDERS {
  if (!storeId?.trim()) return [...list];
  return list.filter(o => !o.storeId || o.storeId === storeId);
}

function filterOrdersByIds(
  list: typeof MOCK_ORDERS,
  params: { orderId?: string; memberId?: string; storeId?: string }
): typeof MOCK_ORDERS {
  let next = filterOrdersByStore(list, params.storeId);
  if (params.orderId?.trim()) {
    next = next.filter(o => o.id === params.orderId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(o => o.memberId === params.memberId);
  }
  return next;
}

function filterContracts(
  list: typeof MOCK_CONTRACTS,
  params: { orderId?: string; memberId?: string }
): typeof MOCK_CONTRACTS {
  let next = [...list];
  if (params.orderId?.trim()) {
    next = next.filter(c => c.orderId === params.orderId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(c => c.memberId === params.memberId);
  }
  return next;
}

function filterPayments(
  list: typeof MOCK_PAYMENTS,
  params: { orderId?: string; memberId?: string }
): typeof MOCK_PAYMENTS {
  let next = [...list];
  if (params.orderId?.trim()) {
    next = next.filter(p => p.orderId === params.orderId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(p => p.memberId === params.memberId);
  }
  return next;
}

function paginate<T>(list: T[], page: number, pageSize: number): { slice: T[]; total: number } {
  const total = list.length;
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(500, pageSize));
  const start = (safePage - 1) * safeSize;
  return { slice: list.slice(start, start + safeSize), total };
}

/** 产品与合同页初始化用只读快照（constants mock 经 adapter；不含 Mall 场景合并数据） */
export interface MallReadonlySnapshot {
  orders: Order[];
  contracts: Contract[];
  payments: Payment[];
  memberAssets: MemberAsset[];
}

export interface FetchMallReadonlySnapshotParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

/**
 * 一次性拉取订单 / 合同 / 支付 / 会员资产（只读 mock，全量至 pageSize 上限）
 */
export function fetchMallReadonlySnapshot(
  params: FetchMallReadonlySnapshotParams = {}
): ReadonlyApiResult<MallReadonlySnapshot> {
  const qp = baseQueryParams({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 500 });

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    const filteredOrders = filterOrdersByIds(MOCK_ORDERS, { storeId: params.storeId });
    const orders = adaptOrders(filteredOrders);
    const contracts = adaptContracts([...MOCK_CONTRACTS]);
    const payments = adaptPayments([...MOCK_PAYMENTS]);
    const memberAssets = adaptMemberAssets([...MOCK_MEMBER_ASSETS]);
    const total = orders.length;
    return {
      data: { orders, contracts, payments, memberAssets },
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MALL_SNAPSHOT_FAILED', message: '产品与合同快照读取失败（只读 mock）。' },
    };
  }
}

/**
 * 订单列表（只读 mock；storeId 仅在订单含 storeId 时参与过滤）
 */
export function fetchOrders(params: FetchMallListParams = {}): ReadonlyApiResult<Order[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    const filtered = filterOrdersByIds(MOCK_ORDERS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptOrders(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MALL_ORDERS_FAILED', message: '订单列表读取失败（只读 mock）。' },
    };
  }
}

/**
 * 订单详情（只读 mock）
 */
export function fetchOrderDetail(
  orderId: string,
  params: FetchOrderDetailParams = {}
): ReadonlyApiResult<Order> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  if (!orderId?.trim()) {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'ORDER_ID_REQUIRED', message: 'orderId 不能为空。' },
    };
  }

  try {
    const found = MOCK_ORDERS.find(o => o.id === orderId);
    if (!found) {
      return {
        data: null,
        meta: buildReadonlyMeta({ ...qp, pageSize: 1 }, 0),
        error: { code: 'ORDER_NOT_FOUND', message: '未找到该订单（mock）。' },
      };
    }
    return {
      data: adaptOrder(found),
      meta: buildReadonlyMeta({ ...qp, page: 1, pageSize: 1 }, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'ORDER_DETAIL_FAILED', message: '订单详情读取失败（只读 mock）。' },
    };
  }
}

/**
 * 合同列表（只读 mock）
 */
export function fetchContracts(params: FetchMallListParams = {}): ReadonlyApiResult<Contract[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    const filtered = filterContracts(MOCK_CONTRACTS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptContracts(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MALL_CONTRACTS_FAILED', message: '合同列表读取失败（只读 mock）。' },
    };
  }
}

/**
 * 合同详情（只读 mock）
 */
export function fetchContractDetail(
  contractId: string,
  params: FetchContractDetailParams = {}
): ReadonlyApiResult<Contract> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  if (!contractId?.trim()) {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'CONTRACT_ID_REQUIRED', message: 'contractId 不能为空。' },
    };
  }

  try {
    const found = MOCK_CONTRACTS.find(c => c.id === contractId);
    if (!found) {
      return {
        data: null,
        meta: buildReadonlyMeta({ ...qp, pageSize: 1 }, 0),
        error: { code: 'CONTRACT_NOT_FOUND', message: '未找到该合同（mock）。' },
      };
    }
    return {
      data: adaptContract(found),
      meta: buildReadonlyMeta({ ...qp, page: 1, pageSize: 1 }, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'CONTRACT_DETAIL_FAILED', message: '合同详情读取失败（只读 mock）。' },
    };
  }
}

/**
 * 支付流水列表（只读 mock）
 */
export function fetchPayments(params: FetchPaymentsParams = {}): ReadonlyApiResult<Payment[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    const filtered = filterPayments(MOCK_PAYMENTS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptPayments(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MALL_PAYMENTS_FAILED', message: '支付流水读取失败（只读 mock）。' },
    };
  }
}

/**
 * 按订单 id 查询支付（语义糖）
 */
export function fetchPaymentsByOrderId(
  orderId: string,
  params: Omit<FetchPaymentsParams, 'orderId'> = {}
): ReadonlyApiResult<Payment[]> {
  return fetchPayments({ ...params, orderId });
}

/**
 * 按订单 id 查询会员资产（sourceOrderId 对齐）
 */
export function fetchMemberAssetsByOrderId(
  orderId: string,
  params: FetchMemberAssetsByOrderParams = {}
): ReadonlyApiResult<MemberAsset[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  if (!orderId?.trim()) {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'ORDER_ID_REQUIRED', message: 'orderId 不能为空。' },
    };
  }

  try {
    const list = MOCK_MEMBER_ASSETS.filter(a => a.sourceOrderId === orderId);
    const { slice, total } = paginate(list, qp.page, qp.pageSize);
    return {
      data: adaptMemberAssets(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MALL_MEMBER_ASSETS_BY_ORDER_FAILED', message: '按订单读取会员资产失败（只读 mock）。' },
    };
  }
}

export interface FetchMemberAssetsByMemberMallParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

/**
 * 按会员 id 查询会员资产（产品与合同域只读；mock 无门店字段时不按 storeId 过滤）
 */
export function fetchMemberAssetsByMemberId(
  memberId: string,
  params: FetchMemberAssetsByMemberMallParams = {}
): ReadonlyApiResult<MemberAsset[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  if (!memberId?.trim()) {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MEMBER_ID_REQUIRED', message: 'memberId 不能为空。' },
    };
  }

  try {
    const list = MOCK_MEMBER_ASSETS.filter(a => a.memberId === memberId);
    const { slice, total } = paginate(list, qp.page, qp.pageSize);
    return {
      data: adaptMemberAssets(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MALL_MEMBER_ASSETS_BY_MEMBER_FAILED', message: '按会员读取资产失败（只读 mock）。' },
    };
  }
}
