/**
 * P0 经营总览只读 service：复用 `dashboardSelectors` / `partnerSelectors` 构建结果，经 `dashboardAdapter` 输出；不接云函数。
 * live 仅返回错误，不与 mock 混用。
 */

import {
  adaptDashboardFinanceSummary,
  adaptDashboardOperationIssues,
  adaptDashboardPartnerGovernance,
  adaptDashboardReadonlySnapshot,
  adaptDashboardStoreHealth,
  adaptDashboardSuggestions,
  type DashboardFinanceReadonlySummary,
  type DashboardReadonlySnapshot,
} from '../adapters/dashboardAdapter';
import {
  buildDashboardOperatingZoneCards,
  buildDashboardStoreHealthRows,
  buildDashboardSuggestionRows,
  buildDashboardSummary,
  buildDashboardTodayIssueRows,
  buildRadarData,
  buildSnapshotItems,
} from '../utils/dashboardSelectors';
import { buildPartnerAuthorizationRows } from '../utils/partnerSelectors';
import type { DashboardStoreHealthRow, DashboardSuggestionRow, DashboardTodayIssueRow } from '../utils/dashboardSelectors';
import type { PartnerAuthorizationRow } from '../utils/partnerSelectors';
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

export interface FetchDashboardParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

function dashboardMeta(params: ReturnType<typeof baseQueryParams>, total: number) {
  return buildReadonlyMeta(params, total);
}

export function fetchDashboardReadonlySnapshot(
  params: FetchDashboardParams = {}
): ReadonlyApiResult<DashboardReadonlySnapshot> {
  const qp = baseQueryParams({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 50 });
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const summary = buildDashboardSummary();
    const bundle = {
      summary,
      snapshotItems: buildSnapshotItems(summary),
      radarData: buildRadarData(),
      operatingZoneCards: buildDashboardOperatingZoneCards(summary),
    };
    return {
      data: adaptDashboardReadonlySnapshot(bundle),
      meta: dashboardMeta(qp, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: dashboardMeta(qp, 0),
      error: { code: 'DASHBOARD_SNAPSHOT_FAILED', message: '经营总览快照读取失败（只读 mock）。' },
    };
  }
}

export function fetchDashboardOperationIssues(
  params: FetchDashboardParams = {}
): ReadonlyApiResult<DashboardTodayIssueRow[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const rows = buildDashboardTodayIssueRows(buildDashboardSummary());
    const data = adaptDashboardOperationIssues(rows);
    return {
      data,
      meta: dashboardMeta(qp, data.length),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: dashboardMeta(qp, 0),
      error: { code: 'DASHBOARD_ISSUES_FAILED', message: '经营待办问题读取失败（只读 mock）。' },
    };
  }
}

export function fetchDashboardStoreHealth(
  params: FetchDashboardParams = {}
): ReadonlyApiResult<DashboardStoreHealthRow[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const rows = buildDashboardStoreHealthRows(buildDashboardSummary());
    const data = adaptDashboardStoreHealth(rows);
    return {
      data,
      meta: dashboardMeta(qp, data.length),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: dashboardMeta(qp, 0),
      error: { code: 'DASHBOARD_STORE_HEALTH_FAILED', message: '门店健康明细读取失败（只读 mock）。' },
    };
  }
}

export function fetchDashboardSuggestions(
  params: FetchDashboardParams = {}
): ReadonlyApiResult<DashboardSuggestionRow[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const rows = buildDashboardSuggestionRows(buildDashboardSummary());
    const data = adaptDashboardSuggestions(rows);
    return {
      data,
      meta: dashboardMeta(qp, data.length),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: dashboardMeta(qp, 0),
      error: { code: 'DASHBOARD_SUGGESTIONS_FAILED', message: '经营建议读取失败（只读 mock）。' },
    };
  }
}

export function fetchDashboardFinanceSummary(
  params: FetchDashboardParams = {}
): ReadonlyApiResult<DashboardFinanceReadonlySummary> {
  const qp = baseQueryParams({ ...params, page: 1, pageSize: 1 });
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const s = buildDashboardSummary();
    const data = adaptDashboardFinanceSummary({
      netCashFlow: s.netCashFlow,
      paidPaymentAmount: s.paidPaymentAmount,
      refundAmount: s.refundAmount,
      recognizedIncomeAmount: s.recognizedIncomeAmount,
      pendingOrderCount: s.pendingOrderCount,
    });
    return {
      data,
      meta: dashboardMeta(qp, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: dashboardMeta(qp, 0),
      error: { code: 'DASHBOARD_FINANCE_SUMMARY_FAILED', message: '经营侧财务摘要读取失败（只读 mock）。' },
    };
  }
}

export function fetchDashboardPartnerGovernance(
  params: FetchDashboardParams = {}
): ReadonlyApiResult<PartnerAuthorizationRow[]> {
  const qp = baseQueryParams(params);
  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }
  try {
    const rows = buildPartnerAuthorizationRows();
    const data = adaptDashboardPartnerGovernance(rows);
    return {
      data,
      meta: dashboardMeta(qp, data.length),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: dashboardMeta(qp, 0),
      error: { code: 'DASHBOARD_PARTNER_GOVERNANCE_FAILED', message: '合作治理只读数据读取失败（只读 mock）。' },
    };
  }
}
