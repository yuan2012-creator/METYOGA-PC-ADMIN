import React from 'react';

export type MemberDetailTabId =
  | 'overview'
  | 'practice'
  | 'course'
  | 'assets'
  | 'followup'
  | 'points';

const TABS: { id: MemberDetailTabId; label: string }[] = [
  { id: 'overview', label: '经营概览' },
  { id: 'practice', label: '练习档案' },
  { id: 'course', label: '课程 / 私教' },
  { id: 'assets', label: '资产权益' },
  { id: 'followup', label: '跟进协同' },
  { id: 'points', label: '积分 / 消费' },
];

interface MemberDetailTabsProps {
  active: MemberDetailTabId;
  onChange: (id: MemberDetailTabId) => void;
}

const MemberDetailTabs: React.FC<MemberDetailTabsProps> = ({ active, onChange }) => (
  <nav className="met-member-detail-tabs" role="tablist">
    {TABS.map(tab => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        className={active === tab.id ? 'is-active' : undefined}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);

export default MemberDetailTabs;
