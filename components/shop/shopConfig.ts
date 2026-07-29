import type { Holiday, Room, StoreInfo } from '../../types';
import { MOCK_STORE_INFO_PRIMARY, MOCK_STORE_SELECT_OPTIONS } from '../../constants/mockStoresCatalog';

export type ShopSubTab = 'setup' | 'rooms';

export interface StoreOption {
  id: StoreInfo['id'];
  name: StoreInfo['name'];
}

export interface ShopConfigDraft {
  store: StoreInfo;
  storeOptions: StoreOption[];
  isStoreMenuOpen: boolean;
}

export interface SaveShopConfigInput {
  store: StoreInfo;
}

export const SHOP_SUB_TABS: Array<{ id: ShopSubTab; label: string }> = [
  { id: 'setup', label: '门店配置' },
  { id: 'rooms', label: '教室配置' },
];

export const DEMO_STORE_IMAGE_URL = 'https://images.unsplash.com/photo-1571019613454-1cb2f57a69d7?auto=format&fit=crop&q=80&w=400';

export const buildInitialShopConfig = (primary?: StoreInfo, options?: StoreOption[]): ShopConfigDraft => ({
  store: primary ?? MOCK_STORE_INFO_PRIMARY,
  storeOptions: options ?? MOCK_STORE_SELECT_OPTIONS,
  isStoreMenuOpen: false,
});

export const switchStoreConfig = (draft: ShopConfigDraft, store: StoreOption): ShopConfigDraft => ({
  ...draft,
  store: {
    ...draft.store,
    id: store.id,
    name: store.name,
  },
  isStoreMenuOpen: false,
});

export const setStoreMenuOpen = (draft: ShopConfigDraft, isOpen: boolean): ShopConfigDraft => ({
  ...draft,
  isStoreMenuOpen: isOpen,
});

export const updateStoreBasicInfo = (
  draft: ShopConfigDraft,
  updates: Partial<Pick<StoreInfo, 'name' | 'address' | 'phone' | 'hours'>>
): ShopConfigDraft => ({
  ...draft,
  store: {
    ...draft.store,
    ...updates,
  },
});

export const addStoreHoliday = (draft: ShopConfigDraft, holiday: Holiday): ShopConfigDraft => ({
  ...draft,
  store: {
    ...draft.store,
    holidays: [...draft.store.holidays, holiday],
  },
});

export const removeStoreHoliday = (draft: ShopConfigDraft, index: number): ShopConfigDraft => ({
  ...draft,
  store: {
    ...draft.store,
    holidays: draft.store.holidays.filter((_, currentIndex) => currentIndex !== index),
  },
});

export const addStoreGalleryImage = (draft: ShopConfigDraft, imageUrl: string): ShopConfigDraft => ({
  ...draft,
  store: {
    ...draft.store,
    gallery: [...draft.store.gallery, imageUrl],
  },
});

export const removeStoreGalleryImage = (draft: ShopConfigDraft, index: number): ShopConfigDraft => ({
  ...draft,
  store: {
    ...draft.store,
    gallery: draft.store.gallery.filter((_, currentIndex) => currentIndex !== index),
  },
});

export const filterStoreRooms = (rooms: Room[], searchQuery: string, activeTab: ShopSubTab): Room[] => {
  if (!searchQuery || activeTab !== 'rooms') return rooms;

  const query = searchQuery.toLowerCase();
  return rooms.filter(room => room.name.toLowerCase().includes(query));
};

export const buildSaveShopConfigInput = (draft: ShopConfigDraft): SaveShopConfigInput => ({
  store: draft.store,
});
