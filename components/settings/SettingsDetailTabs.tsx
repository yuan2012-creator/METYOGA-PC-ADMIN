import React from 'react';

export type SettingsDetailTabId =
  | 'overview'
  | 'content'
  | 'sync'
  | 'risk'
  | 'approval'
  | 'version';

export const SETTINGS_DETAIL_TABS: { id: SettingsDetailTabId; label: string }[] = [
  { id: 'overview', label: '规则概览' },
  { id: 'content', label: '规则内容' },
  { id: 'sync', label: '三端联动' },
  { id: 'risk', label: '风险检查' },
  { id: 'approval', label: '审批与权限' },
  { id: 'version', label: '版本记录' },
];

interface SettingsDetailTabsProps {
  active: SettingsDetailTabId;
  onChange: (id: SettingsDetailTabId) => void;
}

const SettingsDetailTabs: React.FC<SettingsDetailTabsProps> = ({ active, onChange }) => (
  <nav className="met-settings-detail-tabs" aria-label="规则详情">
    {SETTINGS_DETAIL_TABS.map(tab => (
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

export default SettingsDetailTabs;
