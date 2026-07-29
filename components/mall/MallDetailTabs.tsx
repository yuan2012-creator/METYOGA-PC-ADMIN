import React from 'react';

export type MallDetailTabId =
  | 'overview'
  | 'contract'
  | 'orders'
  | 'asset'
  | 'risk'
  | 'logs';

const TABS: { id: MallDetailTabId; label: string }[] = [
  { id: 'overview', label: '产品配置' },
  { id: 'contract', label: '合同条款' },
  { id: 'orders', label: '订单支付' },
  { id: 'asset', label: '会员资产' },
  { id: 'risk', label: '敏感操作' },
  { id: 'logs', label: '操作日志' },
];

interface MallDetailTabsProps {
  active: MallDetailTabId;
  onChange: (id: MallDetailTabId) => void;
}

const MallDetailTabs: React.FC<MallDetailTabsProps> = ({ active, onChange }) => (
  <nav className="met-mall-detail-tabs" aria-label="产品详情标签">
    {TABS.map(tab => (
      <button
        key={tab.id}
        type="button"
        className={active === tab.id ? 'is-active' : undefined}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);

export default MallDetailTabs;
