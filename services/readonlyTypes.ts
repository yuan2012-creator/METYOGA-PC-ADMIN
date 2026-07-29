/**
 * P0 只读查询统一类型（与真实云函数预留对齐；当前不接 live）。
 */

export type ReadonlyDataSource = 'mock' | 'live';

export interface ReadonlyQueryParams {
  requestId: string;
  page: number;
  pageSize: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource: ReadonlyDataSource;
}

export interface ReadonlyApiMeta {
  requestId: string;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource: ReadonlyDataSource;
}

export interface ReadonlyApiError {
  code: string;
  message: string;
}

export interface ReadonlyApiResult<T> {
  data: T | null;
  meta: ReadonlyApiMeta | null;
  error: ReadonlyApiError | null;
}

/** 预留：与云函数 `memberQuery` 等对齐的入参壳（当前仅 mock 使用子集） */
export interface ReadonlyCloudCallPreset {
  /** 未来云函数名，例如 memberQuery */
  functionName: string;
  /** 未来完整 payload */
  payload: Record<string, unknown>;
}
