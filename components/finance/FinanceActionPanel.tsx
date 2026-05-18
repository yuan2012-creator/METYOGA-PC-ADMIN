import React from 'react';
import type { FinanceActionGroup, FinanceActionItem } from './financeOperationViewModel';
import { FinanceEvidenceChain } from './financeModalShared';

interface FinanceActionPanelProps {
  paymentPendingItems: FinanceActionItem[];
  refundPendingItems: FinanceActionItem[];
  consumptionPendingItems: FinanceActionItem[];
  teacherFeePendingItems: FinanceActionItem[];
  settlementPendingItems: FinanceActionItem[];
  expenseVoucherItems: FinanceActionItem[];
  onViewDetail: (item: FinanceActionItem) => void;
  onViewChain: (item: FinanceActionItem) => void;
  onMarkDone: (id: string) => void;
}

const GROUP_META: Record<FinanceActionGroup, { title: string }> = {
  paymentPending: { title: '收款未核对' },
  refundPending: { title: '退款待核' },
  consumptionPending: { title: '耗课收入待确认' },
  teacherFeePending: { title: '老师课时费待核' },
  settlementPending: { title: '跨店结算待处理' },
  expenseVoucherPending: { title: '费用凭证待补' },
};

const QueueBlock: React.FC<{
  group: FinanceActionGroup;
  items: FinanceActionItem[];
  onViewDetail: (item: FinanceActionItem) => void;
  onViewChain: (item: FinanceActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewChain, onMarkDone }) => {
  if (items.length === 0) return null;
  const meta = GROUP_META[group];
  const visible = items.slice(0, 2);
  const rest = items.length - visible.length;
  return (
    <section className="met-finance-action-block">
      <h3 className="met-finance-action-block__title">{meta.title}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-finance-action-item met-finance-action-item--evidence">
          <div className="met-finance-action-item__row1">
            <p className="met-finance-action-item__name">{item.title}</p>
            <span className="met-finance-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-finance-action-item__risk-line">{item.riskLine}</p>
          {item.evidenceChain.length > 0 ? (
            <FinanceEvidenceChain steps={item.evidenceChain} compact />
          ) : null}
          <div className="met-finance-action-item__footer">
            <button type="button" className="met-member-btn-sm" onClick={() => onViewDetail(item)}>
              查看详情
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onViewChain(item)}>
              查看链路
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-finance-action-block__more">还有 {rest} 条待办</p> : null}
    </section>
  );
};

const FinanceActionPanel: React.FC<FinanceActionPanelProps> = ({
  paymentPendingItems,
  refundPendingItems,
  consumptionPendingItems,
  teacherFeePendingItems,
  settlementPendingItems,
  expenseVoucherItems,
  onViewDetail,
  onViewChain,
  onMarkDone,
}) => (
  <aside className="met-finance-action-panel met-today-surface">
    <header className="met-finance-action-panel__head">
      <h2>今日财务待办</h2>
      <p>按财务风险优先核对，当前为前端演示数据</p>
    </header>
    <div className="met-finance-action-panel__scroll custom-scroll">
      <QueueBlock
        group="paymentPending"
        items={paymentPendingItems}
        onViewDetail={onViewDetail}
        onViewChain={onViewChain}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        group="refundPending"
        items={refundPendingItems}
        onViewDetail={onViewDetail}
        onViewChain={onViewChain}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        group="consumptionPending"
        items={consumptionPendingItems}
        onViewDetail={onViewDetail}
        onViewChain={onViewChain}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        group="teacherFeePending"
        items={teacherFeePendingItems}
        onViewDetail={onViewDetail}
        onViewChain={onViewChain}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        group="settlementPending"
        items={settlementPendingItems}
        onViewDetail={onViewDetail}
        onViewChain={onViewChain}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        group="expenseVoucherPending"
        items={expenseVoucherItems}
        onViewDetail={onViewDetail}
        onViewChain={onViewChain}
        onMarkDone={onMarkDone}
      />
    </div>
  </aside>
);

export default FinanceActionPanel;
