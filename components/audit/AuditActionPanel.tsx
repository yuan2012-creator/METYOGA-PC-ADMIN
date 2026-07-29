import React from 'react';
import type { AuditActionGroup, AuditActionItem } from './auditOperationViewModel';
import { AuditEvidenceChain } from './auditModalShared';

const GROUP_TITLES: Record<AuditActionGroup, string> = {
  approvalPending: '敏感审批待处理',
  riskReview: '权限风险待复核',
  exportConfirm: '数据导出待确认',
  logGap: '操作日志待补齐',
};

const QueueBlock: React.FC<{
  group: AuditActionGroup;
  items: AuditActionItem[];
  onViewDetail: (item: AuditActionItem) => void;
  onViewChain: (item: AuditActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewChain, onMarkDone }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-audit-action-block">
      <h3 className="met-audit-action-block__title">{GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-audit-action-item">
          <div className="met-audit-action-item__row1">
            <p className="met-audit-action-item__name">{item.title}</p>
            <span className="met-audit-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-audit-action-item__risk">{item.riskLine}</p>
          <div className="met-audit-action-item__chain">
            <AuditEvidenceChain steps={item.evidenceChain} compact />
          </div>
          <div className="met-audit-action-item__footer">
            <button type="button" className="met-audit-action-btn" onClick={() => onViewDetail(item)}>
              查看详情
            </button>
            <button type="button" className="met-audit-action-btn" onClick={() => onViewChain(item)}>
              查看链路
            </button>
            <button type="button" className="met-audit-action-btn" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-audit-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const AuditActionPanel: React.FC<{
  approvalItems: AuditActionItem[];
  riskItems: AuditActionItem[];
  exportItems: AuditActionItem[];
  logItems: AuditActionItem[];
  onViewDetail: (item: AuditActionItem) => void;
  onViewChain: (item: AuditActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({
  approvalItems,
  riskItems,
  exportItems,
  logItems,
  onViewDetail,
  onViewChain,
  onMarkDone,
}) => (
  <aside className="met-audit-action-panel met-today-surface">
    <header className="met-audit-action-panel__head">
      <h2>今日审计待办</h2>
      <p>优先处理越权、审批、导出和关键操作留痕</p>
    </header>
    <div className="met-audit-action-panel__scroll custom-scroll">
      <QueueBlock group="approvalPending" items={approvalItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="riskReview" items={riskItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="exportConfirm" items={exportItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
      <QueueBlock group="logGap" items={logItems} onViewDetail={onViewDetail} onViewChain={onViewChain} onMarkDone={onMarkDone} />
    </div>
  </aside>
);

export default AuditActionPanel;
