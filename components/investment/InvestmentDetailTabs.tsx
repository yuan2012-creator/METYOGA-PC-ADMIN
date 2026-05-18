import React from 'react';

export type InvestmentDetailTabId =
  | 'overview'
  | 'cost'
  | 'revenue'
  | 'payback'
  | 'sensitivity'
  | 'caliber';

export const INVESTMENT_DETAIL_TABS: { id: InvestmentDetailTabId; label: string }[] = [
  { id: 'overview', label: '方案概览' },
  { id: 'cost', label: '投入与成本' },
  { id: 'revenue', label: '收入与产能' },
  { id: 'payback', label: '保本与回本' },
  { id: 'sensitivity', label: '敏感性影响' },
  { id: 'caliber', label: '测算口径' },
];

const InvestmentDetailTabs: React.FC<{
  active: InvestmentDetailTabId;
  onChange: (id: InvestmentDetailTabId) => void;
}> = ({ active, onChange }) => (
  <nav className="met-investment-detail-tabs" aria-label="投资测算详情">
    {INVESTMENT_DETAIL_TABS.map(tab => (
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

export default InvestmentDetailTabs;
