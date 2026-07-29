import type { Holiday, Room, StoreInfo } from '../types';

/** 五家门店：与业务 mock 中 `storeId` 数值字符串 `1`–`5` 对齐；canonicalId 供后续接入真实 scope 映射 */
export const MOCK_STORE_ROWS = [
  { numericId: 1, numericIdStr: '1', canonicalId: 'store-wanxiang', shortName: '万象馆', displayName: 'MET YOGA 万象馆' },
  { numericId: 2, numericIdStr: '2', canonicalId: 'store-chengxi', shortName: '城西馆', displayName: 'MET YOGA 城西馆' },
  { numericId: 3, numericIdStr: '3', canonicalId: 'store-binjiang', shortName: '滨江馆', displayName: 'MET YOGA 滨江馆' },
  { numericId: 4, numericIdStr: '4', canonicalId: 'store-xihu', shortName: '西湖馆', displayName: 'MET YOGA 西湖馆' },
  { numericId: 5, numericIdStr: '5', canonicalId: 'store-yungu', shortName: '云谷馆', displayName: 'MET YOGA 云谷馆' },
] as const;

export type MockStoreNumericIdStr = (typeof MOCK_STORE_ROWS)[number]['numericIdStr'];

const BASE_ROOMS: Room[] = [
  { id: '101', name: '瑜伽小班教室', capacity: 12, type: '团课', equipment: ['地暖', '空中吊床', '瑜伽砖'] },
  { id: '102', name: '普拉提小班教室', capacity: 6, type: '团课', equipment: ['普拉提床', '魔力圈'] },
  { id: '201', name: '瑜伽私教室', capacity: 2, type: '私教', equipment: ['壁绳', '辅助椅'] },
  { id: '202', name: '普拉提核心床私教室', capacity: 1, type: '私教', equipment: ['凯迪拉克', '稳踏椅', '梯桶'] },
];

const BASE_GALLERY = [
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400',
];

const BASE_HOLIDAYS: Holiday[] = [
  { name: '春节假期', date: '2026-01-20 至 2026-01-28' },
  { name: '场馆维护', date: '2025-12-25' },
];

export function buildMockStoreInfo(row: (typeof MOCK_STORE_ROWS)[number]): StoreInfo {
  const addr: Record<string, string> = {
    '1': '杭州市上城区万象城商圈',
    '2': '杭州市西湖区文一路',
    '3': '杭州市滨江区宝龙城',
    '4': '杭州市西湖区北山路',
    '5': '杭州市西湖区云谷板块',
  };
  const phone: Record<string, string> = {
    '1': '0571-88001111',
    '2': '0571-88002222',
    '3': '0571-88003333',
    '4': '0571-88886666',
    '5': '0571-88005555',
  };
  return {
    id: row.numericId,
    name: row.displayName,
    address: addr[row.numericIdStr] ?? '杭州市',
    phone: phone[row.numericIdStr] ?? '0571-88880000',
    hours: '10:00 - 22:00',
    isOpen: true,
    gallery: [...BASE_GALLERY],
    holidays: [...BASE_HOLIDAYS],
    rooms: BASE_ROOMS.map((r) => ({ ...r, id: `${row.numericIdStr}-${r.id}` })),
  };
}

/** 门店管理下拉：五家全量 */
export const MOCK_STORE_SELECT_OPTIONS = MOCK_STORE_ROWS.map((r) => ({
  id: r.numericId,
  name: r.displayName,
}));

export const MOCK_STORE_INFO_PRIMARY: StoreInfo = buildMockStoreInfo(MOCK_STORE_ROWS[0]);
