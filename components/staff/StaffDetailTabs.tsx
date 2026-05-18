import React from 'react';

export type StaffDetailTabId = 'overview' | 'courses' | 'pay' | 'growth' | 'leave' | 'permission';

export const STAFF_DETAIL_TABS: { id: StaffDetailTabId; label: string }[] = [
  { id: 'overview', label: '老师概览' },
  { id: 'courses', label: '课程执行' },
  { id: 'pay', label: '课时收入' },
  { id: 'growth', label: '成长等级' },
  { id: 'leave', label: '请假代课' },
  { id: 'permission', label: '权限与老师端' },
];

const StaffDetailTabs: React.FC<{
  active: StaffDetailTabId;
  onChange: (id: StaffDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-staff-detail-tabs" aria-label="老师详情">
    {STAFF_DETAIL_TABS.map(tab => (
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

export default StaffDetailTabs;
