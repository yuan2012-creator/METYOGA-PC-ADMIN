import React from 'react';
import { formatCurrency } from '../researchCenterCalculations';
import type { CostDataStatus } from '../researchCenterFinanceModel';
import type { ResearchCenterDrawerState } from '../ResearchCenterDrawer';

export interface ProfitCompositionLine {
  id: string;
  label: string;
  budget: number;
  actual: number | null;
  status: CostDataStatus;
  drawerKey?: string;
  emphasis?: 'summary' | 'cost';
}

interface ProfitCompositionProps {
  lines: ProfitCompositionLine[];
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
}

const statusClass: Record<CostDataStatus, string> = {
  已确认: 'is-confirmed',
  待确认: 'is-pending',
  未录入: 'is-missing',
  不适用: 'is-na',
};

const ProfitComposition: React.FC<ProfitCompositionProps> = ({ lines, onOpenDrawer }) => (
  <section className="met-rc-v2-card met-rc-v2-profit-compose">
    <header className="met-rc-v2-zone__head">
      <h2 className="met-rc-v2-zone__title">利润构成</h2>
      <p className="met-rc-v2-zone__subtitle">预算、实际与差异对比</p>
    </header>
    <div className="met-rc-v2-profit-compose__table">
      <div className="met-rc-v2-profit-compose__head">
        <span>项目</span><span>预算</span><span>实际</span><span>差异</span><span>状态</span><span />
      </div>
      {lines.map(line => {
        const actual = line.actual ?? 0;
        const diff = actual - line.budget;
        const rowClass = [
          'met-rc-v2-profit-compose__row',
          line.emphasis === 'summary' ? 'is-summary' : '',
          line.emphasis === 'cost' ? 'is-cost' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={line.id}
            className={rowClass}
            role="button"
            tabIndex={0}
            onClick={() => line.drawerKey && onOpenDrawer({ type: 'content', key: line.drawerKey })}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && line.drawerKey) {
                e.preventDefault();
                onOpenDrawer({ type: 'content', key: line.drawerKey });
              }
            }}
          >
            <span className="met-rc-v2-profit-compose__label">{line.label}</span>
            <span>{formatCurrency(line.budget)}</span>
            <span>{line.actual === null ? (line.status === '不适用' ? '不适用' : '待录入') : formatCurrency(line.actual)}</span>
            <span className={diff < 0 ? 'is-danger' : ''}>{line.actual === null ? (line.status === '不适用' ? '不适用' : '待录入') : formatCurrency(diff)}</span>
            <span className={['met-rc-v2-profit-compose__status', statusClass[line.status]].join(' ')}>{line.status}</span>
            <span className="met-rc-v2-profit-compose__action">
              {line.drawerKey ? '查看明细' : ''}
            </span>
          </div>
        );
      })}
    </div>
  </section>
);

export default ProfitComposition;
