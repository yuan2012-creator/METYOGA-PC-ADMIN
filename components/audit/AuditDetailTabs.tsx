import React from 'react';

export type AuditDetailTabId =
  | 'overview'
  | 'permission'
  | 'approval'
  | 'logs'
  | 'export'
  | 'risk';

export const AUDIT_DETAIL_TABS: { id: AuditDetailTabId; label: string }[] = [
  { id: 'overview', label: '审计概览' },
  { id: 'permission', label: '权限范围' },
  { id: 'approval', label: '审批链路' },
  { id: 'logs', label: '操作日志' },
  { id: 'export', label: '数据导出' },
  { id: 'risk', label: '风险与处理' },
];

const AuditDetailTabs: React.FC<{
  active: AuditDetailTabId;
  onChange: (id: AuditDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-audit-detail-tabs" aria-label="审计详情">
    {AUDIT_DETAIL_TABS.map(tab => (
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

export default AuditDetailTabs;
