import React from 'react';
import type { ActionQueueItem } from './memberOperationViewModel';

interface MemberActionPanelProps {
  todayItems: ActionQueueItem[];
  expiringItems: ActionQueueItem[];
  highBalanceItems: ActionQueueItem[];
  trialItems: ActionQueueItem[];
  managerItems: ActionQueueItem[];
  onViewMember: (id: string) => void;
  onAddFollowUp: (id: string) => void;
  onAssign: (id: string) => void;
  onMarkDone: (id: string) => void;
}

const QueueBlock: React.FC<{
  title: string;
  items: ActionQueueItem[];
  onView: (id: string) => void;
  onFollow: (id: string) => void;
  onDone: (id: string) => void;
}> = ({ title, items, onView, onFollow, onDone }) => {
  if (items.length === 0) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-member-action-block">
      <h3 className="met-member-action-block__title">{title}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-member-action-item">
          <div className="met-member-action-item__row1">
            <p className="met-member-action-item__name">{item.memberName}</p>
            <span className="met-member-action-item__tag">{item.category}</span>
          </div>
          <p className="met-member-action-item__reason">{item.reason}</p>
          <div className="met-member-action-item__footer">
            <button type="button" className="met-member-btn-sm" onClick={() => onView(item.memberId)}>
              查看
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onFollow(item.memberId)}>
              跟进
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-member-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const MemberActionPanel: React.FC<MemberActionPanelProps> = ({
  todayItems,
  expiringItems,
  managerItems,
  onViewMember,
  onAddFollowUp,
  onMarkDone,
}) => (
  <aside className="met-member-action-panel met-today-surface">
    <header className="met-member-action-panel__head">
      <h2>今日会员行动区</h2>
      <p>按优先级处理维护事项</p>
    </header>
    <div className="met-member-action-panel__scroll custom-scroll">
      <QueueBlock title="今日需跟进" items={todayItems} onView={onViewMember} onFollow={onAddFollowUp} onDone={onMarkDone} />
      <QueueBlock title="店长介入" items={managerItems} onView={onViewMember} onFollow={onAddFollowUp} onDone={onMarkDone} />
      <QueueBlock title="续费窗口" items={expiringItems} onView={onViewMember} onFollow={onAddFollowUp} onDone={onMarkDone} />
    </div>
  </aside>
);

export default MemberActionPanel;
