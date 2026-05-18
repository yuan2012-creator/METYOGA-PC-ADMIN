import React from 'react';

export type DataCenterDetailTabId =
  | 'overview'
  | 'trend'
  | 'compare'
  | 'related'
  | 'advice'
  | 'caliber';

export const DATA_CENTER_DETAIL_TABS: { id: DataCenterDetailTabId; label: string }[] = [
  { id: 'overview', label: '分析概览' },
  { id: 'trend', label: '趋势变化' },
  { id: 'compare', label: '对比分析' },
  { id: 'related', label: '关联明细' },
  { id: 'advice', label: '经营建议' },
  { id: 'caliber', label: '数据口径' },
];

const DataCenterDetailTabs: React.FC<{
  active: DataCenterDetailTabId;
  onChange: (id: DataCenterDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-data-detail-tabs" aria-label="数据分析详情">
    {DATA_CENTER_DETAIL_TABS.map(tab => (
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

export default DataCenterDetailTabs;
