/**
 * P0 只读请求底座：不接真实云函数、不 fetch、不写存储。
 * live 数据源仅返回 REAL_API_NOT_CONNECTED。
 */

import type {
  ReadonlyApiError,
  ReadonlyApiMeta,
  ReadonlyApiResult,
  ReadonlyDataSource,
  ReadonlyQueryParams,
} from './readonlyTypes';

export const REAL_API_NOT_CONNECTED = 'REAL_API_NOT_CONNECTED';

export function generateReadonlyRequestId(): string {
  return `ro-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildReadonlyMeta(
  params: Pick<
    ReadonlyQueryParams,
    'requestId' | 'page' | 'pageSize' | 'storeId' | 'from' | 'to' | 'role' | 'dataSource'
  >,
  total: number
): ReadonlyApiMeta {
  const { page, pageSize } = params;
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(500, pageSize));
  const hasMore = safePage * safeSize < total;
  return {
    requestId: params.requestId,
    page: safePage,
    pageSize: safeSize,
    total,
    hasMore,
    storeId: params.storeId,
    from: params.from,
    to: params.to,
    role: params.role,
    dataSource: params.dataSource,
  };
}

export function readonlyLiveNotConnectedError(): ReadonlyApiError {
  return {
    code: REAL_API_NOT_CONNECTED,
    message: '真实只读接口尚未接入；请将 dataSource 设为 mock 或后续接入云函数后再使用 live。',
  };
}

/**
 * 执行只读查询：mock 走 executor；live 固定错误；不发起网络请求。
 */
export function executeReadonlyQuery<T>(
  params: ReadonlyQueryParams,
  mockExecutor: () => { data: T; total: number }
): ReadonlyApiResult<T> {
  if (params.dataSource === 'live') {
    return {
      data: null,
      meta: null,
      error: readonlyLiveNotConnectedError(),
    };
  }

  try {
    const { data, total } = mockExecutor();
    const safeTotal = Math.max(0, Number.isFinite(total) ? total : 0);
    return {
      data,
      meta: buildReadonlyMeta(params, safeTotal),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(params, 0),
      error: {
        code: 'MOCK_QUERY_FAILED',
        message: '模块内 mock 查询处理失败（只读，未写库）。',
      },
    };
  }
}

/** 预留：未来云函数名 + 入参（本轮不调用） */
export function presetReadonlyCloudCall(
  functionName: string,
  payload: Record<string, unknown>
): { functionName: string; payload: Record<string, unknown> } {
  return { functionName, payload };
}

export function defaultReadonlyDataSource(): ReadonlyDataSource {
  return 'mock';
}
