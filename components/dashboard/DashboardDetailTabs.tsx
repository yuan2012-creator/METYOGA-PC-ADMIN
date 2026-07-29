import React from 'react';

export type DashboardDetailTabId =
  | 'judgment'
  | 'evidence'
  | 'store'
  | 'memberCourse'
  | 'finance'
  | 'records';

export const DASHBOARD_DETAIL_TABS: { id: DashboardDetailTabId; label: string }[] = [
  { id: 'judgment', label: '经营判断' },
  { id: 'evidence', label: '证据链' },
  { id: 'store', label: '门店影响' },
  { id: 'memberCourse', label: '会员 / 课程影响' },
  { id: 'finance', label: '财务影响' },
  { id: 'records', label: '处理记录' },
];

const DashboardDetailTabs: React.FC<{
  active: DashboardDetailTabId;
  onChange: (id: DashboardDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-dashboard-detail-tabs" aria-label="经营事项详情">
    {DASHBOARD_DETAIL_TABS.map(tab => (
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

export default DashboardDetailTabs;
