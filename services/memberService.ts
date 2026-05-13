/**
 * P0 会员域只读 service：从 MOCK_MEMBERS / MOCK_MEMBER_ASSETS 经 adapter 返回；不接云函数。
 */

import { MOCK_MEMBER_ASSETS, MOCK_MEMBERS } from '../constants';
import { adaptMember, adaptMemberAsset, adaptMemberAssets } from '../adapters/memberAdapter';
import type { Member, MemberAsset } from '../types';
import {
  buildReadonlyMeta,
  defaultReadonlyDataSource,
  generateReadonlyRequestId,
  readonlyLiveNotConnectedError,
} from './apiClient';
import type { ReadonlyApiResult, ReadonlyQueryParams } from './readonlyTypes';

export interface FetchMembersParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
  /** 可选：姓名或电话模糊匹配（mock 安全子串） */
  q?: string;
  memberId?: string;
}

export interface FetchMemberDetailParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
}

export interface FetchMemberAssetsParams {
  requestId?: string;
  page?: number;
  pageSize?: number;
  storeId?: string;
  from?: string;
  to?: string;
  role?: string;
  dataSource?: ReadonlyQueryParams['dataSource'];
  memberId?: string;
}

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

function filterMembersByQ(list: typeof MOCK_MEMBERS, q?: string): typeof MOCK_MEMBERS {
  if (!q?.trim()) return [...list];
  const s = q.trim().toLowerCase();
  return list.filter(m => m.name.toLowerCase().includes(s) || m.phone.toLowerCase().includes(s));
}

function filterMembersById(list: typeof MOCK_MEMBERS, memberId?: string): typeof MOCK_MEMBERS {
  if (!memberId?.trim()) return [...list];
  return list.filter(m => m.id === memberId);
}

/**
 * 分页会员列表（只读 mock；storeId 仅透传 meta，mock 无门店字段时不强滤）
 */
export function fetchMembers(params: FetchMembersParams = {}): ReadonlyApiResult<Member[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    let list = filterMembersByQ(MOCK_MEMBERS, params.q);
    list = filterMembersById(list, params.memberId);
    const total = list.length;
    const start = (qp.page - 1) * qp.pageSize;
    const slice = list.slice(start, start + qp.pageSize);
    const data = adaptMembers(slice);
    return {
      data,
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MEMBER_LIST_FAILED', message: '会员列表读取失败（只读 mock）。' },
    };
  }
}

/**
 * 会员详情（只读 mock）
 */
export function fetchMemberDetail(
  memberId: string,
  params: FetchMemberDetailParams = {}
): ReadonlyApiResult<Member> {
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
    const found = MOCK_MEMBERS.find(m => m.id === memberId);
    if (!found) {
      return {
        data: null,
        meta: buildReadonlyMeta({ ...qp, pageSize: 1 }, 0),
        error: { code: 'MEMBER_NOT_FOUND', message: '未找到该会员（mock）。' },
      };
    }
    return {
      data: adaptMember(found),
      meta: buildReadonlyMeta({ ...qp, page: 1, pageSize: 1 }, 1),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MEMBER_DETAIL_FAILED', message: '会员详情读取失败（只读 mock）。' },
    };
  }
}

/**
 * 会员资产列表（可选 memberId；分页）
 */
export function fetchMemberAssets(params: FetchMemberAssetsParams = {}): ReadonlyApiResult<MemberAsset[]> {
  const qp = baseQueryParams(params);

  if (qp.dataSource === 'live') {
    return { data: null, meta: null, error: readonlyLiveNotConnectedError() };
  }

  try {
    let list = [...MOCK_MEMBER_ASSETS];
    if (params.memberId?.trim()) {
      list = list.filter(a => a.memberId === params.memberId);
    }
    const total = list.length;
    const start = (qp.page - 1) * qp.pageSize;
    const slice = list.slice(start, start + qp.pageSize);
    return {
      data: adaptMemberAssets(slice),
      meta: buildReadonlyMeta(qp, total),
      error: null,
    };
  } catch {
    return {
      data: null,
      meta: buildReadonlyMeta(qp, 0),
      error: { code: 'MEMBER_ASSETS_FAILED', message: '会员资产读取失败（只读 mock）。' },
    };
  }
}

/**
 * 按会员 id 拉取资产（语义糖，等价于带 memberId 的 fetchMemberAssets）
 */
export function fetchMemberAssetsByMemberId(
  memberId: string,
  params: Omit<FetchMemberAssetsParams, 'memberId'> = {}
): ReadonlyApiResult<MemberAsset[]> {
  return fetchMemberAssets({ ...params, memberId });
}
