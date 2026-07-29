import React from 'react';

export type FinanceDetailTabId =
  | 'overview'
  | 'orderPay'
  | 'contractAsset'
  | 'consumption'
  | 'feeSettlement'
  | 'logs';

export const FINANCE_DETAIL_TABS: { id: FinanceDetailTabId; label: string }[] = [
  { id: 'overview', label: '核对概览' },
  { id: 'orderPay', label: '收款订单' },
  { id: 'contractAsset', label: '合同资产' },
  { id: 'consumption', label: '耗课收入' },
  { id: 'feeSettlement', label: '课时费结算' },
  { id: 'logs', label: '操作记录' },
];

interface FinanceDetailTabsProps {
  active: FinanceDetailTabId;
  onChange: (id: FinanceDetailTabId) => void;
}

const FinanceDetailTabs: React.FC<FinanceDetailTabsProps> = ({ active, onChange }) => (
  <nav className="met-finance-detail-tabs" aria-label="财务详情">
    {FINANCE_DETAIL_TABS.map(tab => (
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

export default FinanceDetailTabs;
