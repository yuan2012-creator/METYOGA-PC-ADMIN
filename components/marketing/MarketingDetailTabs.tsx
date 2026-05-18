import React from 'react';

export type MarketingDetailTabId =
  | 'overview'
  | 'signup'
  | 'conversion'
  | 'coupon'
  | 'cost'
  | 'review';

export const MARKETING_DETAIL_TABS: { id: MarketingDetailTabId; label: string }[] = [
  { id: 'overview', label: '活动概览' },
  { id: 'signup', label: '报名到店' },
  { id: 'conversion', label: '转化跟进' },
  { id: 'coupon', label: '权益与券' },
  { id: 'cost', label: '成本与物料' },
  { id: 'review', label: '复盘记录' },
];

const MarketingDetailTabs: React.FC<{
  active: MarketingDetailTabId;
  onChange: (id: MarketingDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-marketing-detail-tabs" aria-label="活动详情">
    {MARKETING_DETAIL_TABS.map(tab => (
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

export default MarketingDetailTabs;
