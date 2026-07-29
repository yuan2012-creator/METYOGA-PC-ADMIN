import React from 'react';
import type { ShopActionGroup, ShopActionItem } from './shopOperationViewModel';
import { ShopEvidenceChain } from './shopModalShared';

const GROUP_TITLES: Record<ShopActionGroup, string> = {
  capacity: '容量与排课异常',
  hoursGap: '营业时间待补齐',
  qualityPending: '门店质检待整改',
  costRisk: '成本与经营风险',
};

const QueueBlock: React.FC<{
  group: ShopActionGroup;
  items: ShopActionItem[];
  onViewDetail: (item: ShopActionItem) => void;
  onViewChain: (item: ShopActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewChain, onMarkDone }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-shop-action-block">
      <h3 className="met-shop-action-block__title">{GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-shop-action-item">
          <div className="met-shop-action-item__row1">
            <p className="met-shop-action-item__name">{item.title}</p>
            <span className="met-shop-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-shop-action-item__risk">{item.riskLine}</p>
          <div className="met-shop-action-item__chain">
            <ShopEvidenceChain steps={item.evidenceChain} compact />
          </div>
          <div className="met-shop-action-item__footer">
            <button type="button" className="met-shop-action-btn" onClick={() => onViewDetail(item)}>
              查看详情
            </button>
            <button type="button" className="met-shop-action-btn" onClick={() => onViewChain(item)}>
              查看链路
            </button>
            <button type="button" className="met-shop-action-btn" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-shop-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const ShopActionPanel: React.FC<{
  capacityItems: ShopActionItem[];
  hoursItems: ShopActionItem[];
  qualityItems: ShopActionItem[];
  costItems: ShopActionItem[];
  onViewDetail: (item: ShopActionItem) => void;
  onViewChain: (item: ShopActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({
  capacityItems,
  hoursItems,
  qualityItems,
  costItems,
  onViewDetail,
  onViewChain,
  onMarkDone,
}) => (
  <aside className="met-shop-action-panel met-today-surface">
    <header className="met-shop-action-panel__head">
      <h2>今日门店待办</h2>
      <p>优先处理容量、营业时间、质检和成本异常</p>
    </header>
    <div className="met-shop-action-panel__scroll custom-scroll">
      <QueueBlock group="capacity" items={capacityItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="hoursGap" items={hoursItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="qualityPending" items={qualityItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="costRisk" items={costItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
    </div>
  </aside>
);

export default ShopActionPanel;
