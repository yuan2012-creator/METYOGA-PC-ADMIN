import React from 'react';
import type { StaffActionGroup, StaffActionItem } from './staffOperationViewModel';
import { StaffEvidenceChain } from './staffModalShared';

const GROUP_TITLES: Record<StaffActionGroup, string> = {
  courseExecution: '课程执行异常',
  payPending: '课时费待核',
  growthReview: '成长等级复核',
  leaveSubstitute: '请假代课待处理',
};

const QueueBlock: React.FC<{
  group: StaffActionGroup;
  items: StaffActionItem[];
  onViewDetail: (item: StaffActionItem) => void;
  onViewChain: (item: StaffActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewChain, onMarkDone }) => {
  if (items.length === 0) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-staff-action-block">
      <h3 className="met-staff-action-block__title">{GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-staff-action-item">
          <div className="met-staff-action-item__row1">
            <p className="met-staff-action-item__name">{item.title}</p>
            <span className="met-staff-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-staff-action-item__risk">{item.riskLine}</p>
          <StaffEvidenceChain steps={item.evidenceChain} compact />
          <div className="met-staff-action-item__footer">
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
      {rest > 0 ? <p className="met-staff-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const StaffActionPanel: React.FC<{
  courseItems: StaffActionItem[];
  payItems: StaffActionItem[];
  growthItems: StaffActionItem[];
  leaveItems: StaffActionItem[];
  onViewDetail: (item: StaffActionItem) => void;
  onViewChain: (item: StaffActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({
  courseItems,
  payItems,
  growthItems,
  leaveItems,
  onViewDetail,
  onViewChain,
  onMarkDone,
}) => (
  <aside className="met-staff-action-panel met-today-surface">
    <header className="met-staff-action-panel__head">
      <h2>今日师资待办</h2>
      <p>按排课、课时、成长与权限风险优先处理</p>
    </header>
    <div className="met-staff-action-panel__scroll custom-scroll">
      <QueueBlock group="courseExecution" items={courseItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="payPending" items={payItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="growthReview" items={growthItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="leaveSubstitute" items={leaveItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
    </div>
  </aside>
);

export default StaffActionPanel;
