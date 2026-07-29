import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { getResearchCenterIntentClass } from './researchCenterV2.viewModel';
import type { LeadRecord } from './researchCenterV2.viewModel';
import type { ResearchCenterDrawerState } from './ResearchCenterDrawer';

interface LeadCompactItemProps {
  lead: LeadRecord;
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  onToast: (msg: string) => void;
}

const LeadCompactItem: React.FC<LeadCompactItemProps> = ({ lead, onOpenDrawer, onToast }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="met-rc-v2-lead-compact">
      <div className="met-rc-v2-lead-compact__row1">
        <strong>{lead.name}</strong>
        <span>{lead.course}</span>
        <span className={['met-rc-v2-intent', getResearchCenterIntentClass(lead.intentTone)].join(' ')}>
          {lead.intentLevel}意向
        </span>
        <span className="met-rc-v2-lead-compact__stage">{lead.stage}</span>
      </div>
      <div className="met-rc-v2-lead-compact__row2">
        <span>预计 {lead.expectedAmount.toLocaleString()}元</span>
        <span>已付 {lead.paidAmount.toLocaleString()}元</span>
        <span>最近跟进 {lead.lastFollowUp}</span>
        <span className={lead.overdueDays >= 3 ? 'is-overdue' : ''}>超时 {lead.overdueDays} 天</span>
        <span>负责人 {lead.owner}</span>
      </div>
      {lead.anomaly ? <p className="met-rc-v2-field-error">{lead.anomaly}</p> : null}
      <div className="met-rc-v2-lead-compact__row3">
        <span className="met-rc-v2-lead-compact__hint">下一步：{lead.suggestedAction}</span>
        <div className="met-rc-v2-lead-compact__actions">
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
            onClick={() => onOpenDrawer({ type: 'follow-up', leadId: lead.id })}
          >
            立即跟进
          </button>
          <div className="met-rc-v2-row-more">
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="更多操作"
            >
              <MoreHorizontal size={14} aria-hidden />
            </button>
            {menuOpen ? (
              <div className="met-rc-v2-row-more__menu">
                <button type="button" onClick={() => { onOpenDrawer({ type: 'enrollment', leadId: lead.id }); setMenuOpen(false); }}>添加报名</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'interview', leadId: lead.id, mode: 'schedule' }); setMenuOpen(false); }}>安排面试</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'interview', leadId: lead.id, mode: 'result' }); setMenuOpen(false); }}>录入面试结果</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'edit-stage', leadId: lead.id }); setMenuOpen(false); }}>修改阶段</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'record-payment' }); setMenuOpen(false); }}>录入收款</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'assign-owner' }); setMenuOpen(false); }}>指定负责人</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'lead', id: lead.id }); setMenuOpen(false); onToast(`查看 ${lead.name}`); }}>查看详情</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};

export default LeadCompactItem;
