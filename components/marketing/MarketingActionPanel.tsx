import React, { useMemo } from 'react';
import {
  SEGMENT_ACTION_BUTTONS,
  SEGMENT_ACTION_GROUPS,
  SEGMENT_ACTION_GROUP_TITLES,
  SEGMENT_ACTION_SUBTITLES,
  type MarketingActionItem,
  type MarketingSegment,
} from './marketingOperationViewModel';
import { MarketingEvidenceChain } from './marketingModalShared';

const QueueBlock: React.FC<{
  groupTitle: string;
  items: MarketingActionItem[];
  buttons: { primary: string; secondary: string; mark: string };
  onViewDetail: (item: MarketingActionItem) => void;
  onSecondary: (item: MarketingActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ groupTitle, items, buttons, onViewDetail, onSecondary, onMarkDone }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-marketing-action-block">
      <h3 className="met-marketing-action-block__title">{groupTitle}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-marketing-action-item">
          <div className="met-marketing-action-item__row1">
            <p className="met-marketing-action-item__name">{item.title}</p>
            <span className="met-marketing-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-marketing-action-item__risk">{item.riskLine}</p>
          <div className="met-marketing-action-item__chain">
            <MarketingEvidenceChain steps={item.evidenceChain} compact />
          </div>
          <div className="met-marketing-action-item__footer">
            <button type="button" className="met-marketing-action-btn" onClick={() => onViewDetail(item)}>
              {buttons.primary}
            </button>
            <button type="button" className="met-marketing-action-btn" onClick={() => onSecondary(item)}>
              {buttons.secondary}
            </button>
            <button type="button" className="met-marketing-action-btn" onClick={() => onMarkDone(item.id)}>
              {buttons.mark}
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-marketing-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const MarketingActionPanel: React.FC<{
  segment: MarketingSegment;
  items: MarketingActionItem[];
  onViewDetail: (item: MarketingActionItem) => void;
  onSecondary: (item: MarketingActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ segment, items, onViewDetail, onSecondary, onMarkDone }) => {
  const buttons = SEGMENT_ACTION_BUTTONS[segment];
  const groups = SEGMENT_ACTION_GROUPS[segment];

  const grouped = useMemo(() => {
    const map = new Map<string, MarketingActionItem[]>();
    groups.forEach(g => map.set(g, []));
    items.forEach(item => {
      const list = map.get(item.group);
      if (list) list.push(item);
    });
    return map;
  }, [items, groups]);

  const hasItems = items.length > 0;

  return (
    <aside className="met-marketing-action-panel met-today-surface">
      <header className="met-marketing-action-panel__head">
        <h2>今日活动待办</h2>
        <p>{SEGMENT_ACTION_SUBTITLES[segment]}</p>
      </header>
      <div className="met-marketing-action-panel__scroll custom-scroll">
        {!hasItems ? (
          <p className="met-marketing-action-panel__empty">当前分段暂无待办，可切换其他分段查看</p>
        ) : (
          groups.map(group => (
            <QueueBlock
              key={group}
              groupTitle={SEGMENT_ACTION_GROUP_TITLES[group]}
              items={grouped.get(group) ?? []}
              buttons={buttons}
              onViewDetail={onViewDetail}
              onSecondary={onSecondary}
              onMarkDone={onMarkDone}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default MarketingActionPanel;
