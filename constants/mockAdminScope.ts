/**
 * 总部 / 单店 mock 视角（仅前端演示；不接真实权限与登录态）。
 * 后续接入 role / storeScope 时，可把 canonicalStoreId 与 mode 映射到真实会话。
 */

import type { MockStoreNumericIdStr } from './mockStoresCatalog';
import { MOCK_STORE_ROWS } from './mockStoresCatalog';

export type MockAdminUiMode = 'hq' | 'store';

export interface MockAdminUiConfig {
  mode: MockAdminUiMode;
  /** 展示用角色文案 */
  role: string;
  /** 总部视角下可筛选的门店 id（与 MOCK_MEMBER / 订单等 `storeId` 对齐，使用数值字符串） */
  storeIds: MockStoreNumericIdStr[];
  /**
   * 总部：null 表示「全部门店」；非 null 为当前筛选门店。
   * 单店：忽略此字段，使用 `lockedStoreId`。
   */
  hqSelectedStoreId: MockStoreNumericIdStr | null;
  /** 单店视角下锁定的门店（必须落在 storeIds 内） */
  lockedStoreId: MockStoreNumericIdStr;
}

export const MOCK_ADMIN_UI_DEFAULT: MockAdminUiConfig = {
  mode: 'hq',
  role: '总部管理员',
  storeIds: [...MOCK_STORE_ROWS.map((r) => r.numericIdStr)] as MockStoreNumericIdStr[],
  hqSelectedStoreId: null,
  lockedStoreId: '1',
};

/** 切换为「单店馆长」演示：不展示门店筛选，数据按 lockedStoreId 过滤 */
export const MOCK_ADMIN_UI_SINGLE_STORE_DEMO: MockAdminUiConfig = {
  mode: 'store',
  role: '滨江馆长（单店）',
  storeIds: ['3'] as MockStoreNumericIdStr[],
  hqSelectedStoreId: null,
  lockedStoreId: '3',
};
