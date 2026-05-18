import React from 'react';

export type PartnerDetailTabId =
  | 'overview'
  | 'authScope'
  | 'brand'
  | 'data'
  | 'quality'
  | 'renewal';

export const PARTNER_DETAIL_TABS: { id: PartnerDetailTabId; label: string }[] = [
  { id: 'overview', label: '合作概览' },
  { id: 'authScope', label: '授权范围' },
  { id: 'brand', label: '品牌与规范' },
  { id: 'data', label: '数据与系统' },
  { id: 'quality', label: '质检与整改' },
  { id: 'renewal', label: '续约与退出' },
];

const PartnerDetailTabs: React.FC<{
  active: PartnerDetailTabId;
  onChange: (id: PartnerDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-partner-detail-tabs" aria-label="合作门店详情">
    {PARTNER_DETAIL_TABS.map(tab => (
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

export default PartnerDetailTabs;
