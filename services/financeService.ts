/**
 * P0 财务域只读 service：从 MOCK_PAYMENTS / MOCK_ORDERS 等经 financeAdapter 返回；不接云函数。
 * live 数据源仅返回错误，不回退 mock。
 */

import {
  adaptFinanceConsumptions,
  adaptFinanceOrders,
  adaptFinanceOrder,
  adaptFinancePayments,
  adaptFinanceReadonlySummary,
} from '../adapters/financeAdapter';
import type { FinanceReadonlySummary } from '../adapters/financeAdapter';
import { MOCK_ORDERS, MOCK_PAYMENTS } from '../constants';
import type { MockCourseConsumptionRecord, Order, Payment } from '../types';
import {
  buildReadonlyMeta,
  defaultReadonlyDataSource,
  generateReadonlyRequestId,
  readonlyLiveNotConnectedError,
} from './apiClient';
import type { ReadonlyApiResult, ReadonlyQueryParams } from './readonlyTypes';

/**
 * TODO: `constants` 尚无全局财务耗课只读列表；接入后与 `MOCK_FINANCE_LEDGER_ENTRIES` 等统一口径。
 * 不在此从 attendances 合成耗课业务数据。
 */
const READONLY_FINANCE_CONSUMPTIONS: MockCourseConsumptionRecord[] = [];

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

export interface FetchFinanceDomainParams {
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

export interface FetchFinanceOrderDetailParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

function paginate<T>(list: T[], page: number, pageSize: number): { slice: T[]; total: number } {
  const total = list.length;
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(500, pageSize));
  const start = (safePage - 1) * safeSize;
  return { slice: list.slice(start, start + safeSize), total };
}

function recordInTimeRange(iso: string | undefined, from?: string, to?: string): boolean {
  if (!from?.trim() && !to?.trim()) return true;
  if (!iso?.trim()) return true;
  const f = from?.trim();
  const t = to?.trim();
  if (f && iso < f) return false;
  if (t && iso > t) return false;
  return true;
}

function paymentTime(p: Payment): string {
  return p.reconciledAt ?? p.paidAt ?? p.initiatedAt ?? '';
}

function filterFinanceOrders(list: typeof MOCK_ORDERS, params: FetchFinanceDomainParams): typeof MOCK_ORDERS {
  let next = [...list];
  if (params.storeId?.trim()) {
    next = next.filter(o => !o.storeId || o.storeId === params.storeId);
  }
  if (params.orderId?.trim()) {
    next = next.filter(o => o.id === params.orderId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(o => o.memberId === params.memberId);
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(o => recordInTimeRange(o.createdAt, params.from, params.to));
  }
  return next;
}

function filterFinancePayments(list: typeof MOCK_PAYMENTS, params: FetchFinanceDomainParams): typeof MOCK_PAYMENTS {
  let next = [...list];
  if (params.orderId?.trim()) {
    next = next.filter(p => p.orderId === params.orderId);
  }
  if (params.memberId?.trim()) {
    next = next.filter(p => p.memberId === params.memberId);
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(p => recordInTimeRange(paymentTime(p), params.from, params.to));
  }
  return next;
}

function filterFinanceConsumptions(
  list: MockCourseConsumptionRecord[],
  params: FetchFinanceDomainParams
): MockCourseConsumptionRecord[] {
  if (params.orderId?.trim()) {
    return [];
  }
  let next = [...list];
  if (params.memberId?.trim()) {
    next = next.filter(c => c.memberId === params.memberId);
  }
  if (params.from?.trim() || params.to?.trim()) {
    next = next.filter(c => recordInTimeRange(c.consumedAt, params.from, params.to));
  }
  return next;
}

export function fetchFinancePayments(params: FetchFinanceDomainParams = {}): ReadonlyApiResult<Payment[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterFinancePayments(MOCK_PAYMENTS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptFinancePayments(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'FINANCE_PAYMENTS_FAILED', message: '财务支付流水读取失败（只读 mock）。' },
    };
  }
}

export function fetchFinancePaymentsByOrderId(
  orderId: string,
  params: Omit<FetchFinanceDomainParams, 'orderId'> = {}
): ReadonlyApiResult<Payment[]> {
  return fetchFinancePayments({ ...params, orderId });
}

export function fetchFinanceOrders(params: FetchFinanceDomainParams = {}): ReadonlyApiResult<Order[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterFinanceOrders(MOCK_ORDERS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptFinanceOrders(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'FINANCE_ORDERS_FAILED', message: '财务订单列表读取失败（只读 mock）。' },
    };
  }
}

export function fetchFinanceOrderDetail(
  orderId: string,
  params: FetchFinanceOrderDetailParams = {}
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
      data: adaptFinanceOrder(found),
      meta: buildReadonlyMeta({ ...qp, page: 1, pageSize: 1 }, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'FINANCE_ORDER_DETAIL_FAILED', message: '财务订单详情读取失败（只读 mock）。' },
    };
  }
}

export function fetchFinanceConsumptions(params: FetchFinanceDomainParams = {}): ReadonlyApiResult<MockCourseConsumptionRecord[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const filtered = filterFinanceConsumptions(READONLY_FINANCE_CONSUMPTIONS, params);
    const { slice, total } = paginate(filtered, qp.page, qp.pageSize);
    return {
      data: adaptFinanceConsumptions(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'FINANCE_CONSUMPTIONS_FAILED', message: '财务耗课列表读取失败（只读 mock）。' },
    };
  }
}

/**
 * 模块内只读估算摘要（不写入状态；不代表已入账或已同步真实财务）。
 */
export function fetchFinanceReadonlySummary(
  params: FetchFinanceDomainParams = {}
): ReadonlyApiResult<FinanceReadonlySummary> {
  const qp = baseQueryParams({ ...params, page: 1, pageSize: 1 });

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    const orders = filterFinanceOrders(MOCK_ORDERS, params);
    const payments = filterFinancePayments(MOCK_PAYMENTS, params);
    const consumptions = filterFinanceConsumptions(READONLY_FINANCE_CONSUMPTIONS, params);
    const estimatedPaymentAmountTotal = payments.reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);

    const summary = adaptFinanceReadonlySummary({
      paymentCount: payments.length,
      orderCount: orders.length,
      estimatedPaymentAmountTotal,
      estimatedConsumptionRecordCount: consumptions.length,
    });

    return {
      data: summary,
      meta: buildReadonlyMeta(qp, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'FINANCE_SUMMARY_FAILED', message: '财务只读摘要读取失败（只读 mock）。' },
    };
  }
}
