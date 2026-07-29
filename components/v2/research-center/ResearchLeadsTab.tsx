import React, { useState } from 'react';
import LeadCompactItem from './LeadCompactItem';
import type { LeadCategoryId } from './researchCenterCalculations';
import { filterLeadsByCategory } from './researchCenterCalculations';
import type { LeadRecord, QuickLeadCategory, ResearchCenterFunnelStage } from './researchCenterV2.viewModel';
import type { ResearchCenterDrawerState } from './ResearchCenterDrawer';

interface ResearchLeadsTabProps {
  funnelStages: ResearchCenterFunnelStage[];
  funnelNote: string;
  funnelDisclaimer: string;
  leads: LeadRecord[];
  leadCategories: QuickLeadCategory[];
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  onToast: (msg: string) => void;
}

const ResearchLeadsTab: React.FC<ResearchLeadsTabProps> = ({
  funnelStages,
  funnelNote,
  funnelDisclaimer,
  leads,
  leadCategories,
  onOpenDrawer,
  onToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<LeadCategoryId | null>(null);
  const [opsMoreOpen, setOpsMoreOpen] = useState(false);
  const activeLeads = leads.filter(l => !l.enrolled);
  const filteredLeads = activeCategory ? filterLeadsByCategory(leads, activeCategory) : activeLeads;

  return (
    <div className="met-rc-v2-leads-tab">
      <section className="met-rc-v2-card">
        <header className="met-rc-v2-zone__head">
          <h2 className="met-rc-v2-zone__title">招生阶段快捷统计</h2>
        </header>
        <div className="met-rc-v2-stage-stats">
          {leadCategories.map(s => (
            <button
              key={s.id}
              type="button"
              className={['met-rc-v2-stage-stats__item', activeCategory === s.id ? 'is-active' : ''].join(' ')}
              onClick={() => setActiveCategory(prev => (prev === s.id ? null : (s.id as LeadCategoryId)))}
            >
              <span>{s.label}</span>
              <strong>{s.count}人</strong>
            </button>
          ))}
        </div>
        <div className="met-rc-v2-leads-tab__ops">
          <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={() => onOpenDrawer({ type: 'new-lead' })}>
            新增咨询
          </button>
          <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={() => onOpenDrawer({ type: 'follow-up' })}>
            记录跟进
          </button>
          <div className="met-rc-v2-more">
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
              aria-expanded={opsMoreOpen}
              onClick={() => setOpsMoreOpen(v => !v)}
            >
              更多
            </button>
            {opsMoreOpen ? (
              <div className="met-rc-v2-more__menu">
                <button type="button" onClick={() => { onOpenDrawer({ type: 'enrollment' }); setOpsMoreOpen(false); }}>添加报名</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'edit-stage' }); setOpsMoreOpen(false); }}>修改阶段</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'interview', mode: 'schedule' }); setOpsMoreOpen(false); }}>安排面试</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'interview', mode: 'result' }); setOpsMoreOpen(false); }}>面试结果</button>
                <button type="button" onClick={() => { onOpenDrawer({ type: 'assign-owner' }); setOpsMoreOpen(false); }}>指定负责人</button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="met-rc-v2-card">
        <header className="met-rc-v2-zone__head">
          <h2 className="met-rc-v2-zone__title">待跟进人员</h2>
          <p className="met-rc-v2-zone__subtitle">优先展示需要立即联系的高意向线索</p>
        </header>
        <div className="met-rc-v2-lead-compact-list">
          {filteredLeads.map(lead => (
            <LeadCompactItem
              key={lead.id}
              lead={lead}
              onOpenDrawer={onOpenDrawer}
              onToast={onToast}
            />
          ))}
        </div>
      </section>

      <section className="met-rc-v2-card">
        <header className="met-rc-v2-zone__head">
          <h2 className="met-rc-v2-zone__title">招生漏斗与转化分析</h2>
          <p className="met-rc-v2-zone__subtitle">辅助判断，不作为首页第一视觉</p>
        </header>
        <div className="met-rc-v2-funnel">
          {funnelStages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <button type="button" className="met-rc-v2-funnel__stage" onClick={() => onToast(`查看阶段：${stage.stage}`)}>
                <span className="met-rc-v2-funnel__stage-name">{stage.stage}</span>
                <span className="met-rc-v2-funnel__stage-count">{stage.count} 人</span>
                {stage.conversionRate && stage.conversionRate !== '—' ? (
                  <span className="met-rc-v2-funnel__stage-rate">转化率 {stage.conversionRate}</span>
                ) : null}
              </button>
              {index < funnelStages.length - 1 ? <span className="met-rc-v2-funnel__arrow" aria-hidden>→</span> : null}
            </React.Fragment>
          ))}
        </div>
        <p className="met-rc-v2-funnel__note">{funnelNote}</p>
        <p className="met-rc-v2-funnel__disclaimer">{funnelDisclaimer}</p>
      </section>
    </div>
  );
};

export default ResearchLeadsTab;
