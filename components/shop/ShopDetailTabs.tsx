import React from 'react';

export type ShopDetailTabId =
  | 'overview'
  | 'capacity'
  | 'schedule'
  | 'staff'
  | 'cost'
  | 'quality';

export const SHOP_DETAIL_TABS: { id: ShopDetailTabId; label: string }[] = [
  { id: 'overview', label: '门店概览' },
  { id: 'capacity', label: '教室容量' },
  { id: 'schedule', label: '营业与排课' },
  { id: 'staff', label: '员工与权限' },
  { id: 'cost', label: '成本与测算' },
  { id: 'quality', label: '质检与风险' },
];

const ShopDetailTabs: React.FC<{
  active: ShopDetailTabId;
  onChange: (id: ShopDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-shop-detail-tabs" aria-label="门店详情">
    {SHOP_DETAIL_TABS.map(tab => (
      <button
        key={tab.id}
        type="button"
        className={active === tab.id ? 'is-active' : ''}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);

export default ShopDetailTabs;
