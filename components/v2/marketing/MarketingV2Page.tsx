import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildMarketingV2Snapshot,
  getCalendarStatusClass,
  getCampaignStatusClass,
  getChannelStatusClass,
  getFunnelBreakClass,
  getPriorityClass,
  getQuadrantToneClass,
  getSuggestionSourceClass,
  type ActivityDetail,
  type ChannelPill,
  type HeroCampaign,
  type LeadActionItem,
  type LeadDetail,
  type SupportCampaignCard,
  type TodayActionItem,
} from './marketingV2.viewModel';
import './marketingV2.css';

type DrawerState =
  | { type: 'activity'; id: string }
  | { type: 'lead'; id: string }
  | null;

function V2DrawerEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="met-v2-drawer-empty">
      <h3 className="met-v2-drawer-empty__title">暂无详情</h3>
      <p className="met-v2-drawer-empty__desc">当前记录缺少详情数据，请检查 mock 配置</p>
      <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
        关闭
      </button>
    </div>
  );
}

const LEAD_DRAWER_SECTIONS: { title: string; labels: string[] }[] = [
  { title: '线索来源', labels: ['线索来源'] },
  { title: '当前阶段', labels: ['会员姓名', '意向课程'] },
  { title: '预约 / 到店 / 成交状态', labels: ['预约时间', '未到店原因'] },
  { title: '跟进记录', labels: ['最近跟进', '负责人'] },
  { title: '下一动作', labels: ['下一动作'] },
  { title: '是否进入会员经营', labels: ['是否进入会员经营'] },
];

const MarketingV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildMarketingV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const showToast = useCallback((message: string) => {
    console.log('[MarketingV2]', message);
    setToast(message);
    window.setTimeout(
      () => setToast(current => (current === message ? null : current)),
      2400,
    );
  }, []);

  const handleAction = useCallback(
    (label: string) => {
      const message =
        label.includes('（待建设）') || label.startsWith('进入 ')
          ? label
          : `${label}（待建设）`;
      showToast(message);
    },
    [showToast],
  );

  const openActivityDrawer = useCallback((id: string) => {
    setDrawer({ type: 'activity', id });
  }, []);

  const openLeadDrawer = useCallback((id: string) => {
    setDrawer({ type: 'lead', id });
  }, []);

  const closeDrawer = useCallback(() => setDrawer(null), []);

  const drawerActivity: ActivityDetail | null =
    drawer?.type === 'activity' ? snapshot.activityDetailMap[drawer.id] ?? null : null;

  const drawerLead: LeadDetail | null =
    drawer?.type === 'lead' ? snapshot.leadDetailMap[drawer.id] ?? null : null;

  const handleTodayAction = useCallback(
    (item: TodayActionItem) => {
      showToast(item.toastMessage);
      if (item.relatedLeadId) openLeadDrawer(item.relatedLeadId);
      else if (item.relatedActivityId) openActivityDrawer(item.relatedActivityId);
    },
    [openActivityDrawer, openLeadDrawer, showToast],
  );

  const handleLeadAction = useCallback(
    (item: LeadActionItem) => {
      showToast(item.toastMessage);
      if (item.relatedLeadId) openLeadDrawer(item.relatedLeadId);
      else if (item.relatedActivityId) openActivityDrawer(item.relatedActivityId);
    },
    [openActivityDrawer, openLeadDrawer, showToast],
  );

  const handleHeroCampaign = useCallback(
    (item: HeroCampaign) => {
      if (snapshot.activityDetailMap[item.id]) {
        openActivityDrawer(item.id);
        return;
      }
      showToast(item.toastMessage ?? `${item.actionLabel}（待建设）`);
    },
    [openActivityDrawer, showToast, snapshot.activityDetailMap],
  );

  const handleSupportCampaign = useCallback(
    (item: SupportCampaignCard) => {
      if (snapshot.activityDetailMap[item.id]) {
        openActivityDrawer(item.id);
        return;
      }
      showToast(item.toastMessage ?? `${item.actionLabel}（待建设）`);
    },
    [openActivityDrawer, showToast, snapshot.activityDetailMap],
  );

  const handleChannelPill = useCallback(
    (pill: ChannelPill) => {
      showToast(pill.toastMessage);
    },
    [showToast],
  );

  const handleFunnelStageClick = useCallback(
    (stageId: string) => {
      if (stageId === 'fs-4') openLeadDrawer('lead-no-show');
      else showToast('查看漏斗阶段详情（待建设）');
    },
    [openLeadDrawer, showToast],
  );

  const {
    meta,
    filters,
    warroom,
    channelQuadrants,
    campaignBattle,
    leadActionQueue,
    handoffFlow,
    activityTimeline,
  } = snapshot;

  const breakpointMap = useMemo(
    () => new Map(warroom.mainBreakpoints.map(bp => [bp.afterStageId, bp])),
    [warroom.mainBreakpoints],
  );

  const renderActivityDrawer = (detail: ActivityDetail) => (
    <>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">活动概览</h3>
        {detail.overview.map(row => (
          <div key={row.label} className="met-marketing-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">转化数据</h3>
        {detail.conversion.map(row => (
          <div key={row.label} className="met-marketing-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">活动目标完成度</h3>
        <p className="met-marketing-v2-drawer__highlight">{detail.goalCompletion}</p>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">是否建议复制</h3>
        <p className="met-marketing-v2-drawer__highlight">{detail.copyRecommendation}</p>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">最大断点</h3>
        <p className="met-marketing-v2-drawer__highlight is-warn">{detail.mainBreakpoint}</p>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">会员经营承接状态</h3>
        <p className="met-marketing-v2-drawer__highlight">{detail.memberHandoffStatus}</p>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">渠道来源</h3>
        <div className="met-marketing-v2-drawer__tags">
          {detail.channels.map(ch => (
            <span key={ch} className="met-marketing-v2-drawer__tag">{ch}</span>
          ))}
        </div>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">当前问题</h3>
        <ul className="met-marketing-v2-drawer__list">
          {detail.issues.map(i => <li key={i}>{i}</li>)}
        </ul>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">下一动作</h3>
        <ul className="met-marketing-v2-drawer__list">
          {detail.nextActions.map(a => <li key={a}>{a}</li>)}
        </ul>
      </section>
      <section className="met-marketing-v2-drawer__section">
        <h3 className="met-marketing-v2-drawer__section-title">证据链</h3>
        {detail.evidenceChain.map(row => (
          <div key={row.label} className="met-marketing-v2-drawer__row">
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
      </section>
      <div className="met-marketing-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
        {detail.actions.map(action => (
          <button key={action.label} type="button" className="met-v2-drawer-footer-btn" onClick={() => showToast(action.toastMessage)}>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderLeadDrawer = (detail: LeadDetail) => {
    const renderedLabels = new Set<string>();
    const sections = LEAD_DRAWER_SECTIONS.map(section => {
      const rows = detail.fields.filter(field => section.labels.includes(field.label));
      rows.forEach(row => renderedLabels.add(row.label));
      if (!rows.length) return null;
      return (
        <section key={section.title} className="met-marketing-v2-drawer__section">
          <h3 className="met-marketing-v2-drawer__section-title">{section.title}</h3>
          {rows.map(row => (
            <div key={row.label} className="met-marketing-v2-drawer__row">
              <span className="met-v2-drawer-label">{row.label}</span>
              <span className="met-v2-drawer-value">{row.value}</span>
            </div>
          ))}
        </section>
      );
    });
    const remaining = detail.fields.filter(field => !renderedLabels.has(field.label));
    return (
      <>
        {sections}
        {remaining.length ? (
          <section className="met-marketing-v2-drawer__section">
            <h3 className="met-marketing-v2-drawer__section-title">补充信息</h3>
            {remaining.map(row => (
              <div key={row.label} className="met-marketing-v2-drawer__row">
                <span className="met-v2-drawer-label">{row.label}</span>
                <span className="met-v2-drawer-value">{row.value}</span>
              </div>
            ))}
          </section>
        ) : null}
        <p className="met-marketing-v2-drawer__follow-hint">点对点跟进 · 非群发</p>
        <div className="met-marketing-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
          {detail.actions.map(action => (
            <button key={action.label} type="button" className="met-v2-drawer-footer-btn" onClick={() => showToast(action.toastMessage)}>
              {action.label}
            </button>
          ))}
        </div>
      </>
    );
  };

  const { heroCampaign } = campaignBattle;
  const drawerHasContent = Boolean(drawerActivity || drawerLead);
  const drawerTitle = drawerActivity?.title ?? drawerLead?.title ?? '暂无详情';
  const drawerSubtitle =
    drawerActivity?.subtitle ?? drawerLead?.subtitle ?? (drawerHasContent ? '' : '当前记录缺少详情数据');

  return (
    <div className="met-marketing-v2">
      <div className="met-marketing-v2__inner">
        <header className="met-marketing-v2__header">
          <div className="met-marketing-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-marketing-v2__header-actions">
            <div className="met-marketing-v2__filters">
              <button
                type="button"
                className="met-marketing-v2__filter-btn"
                onClick={() => handleAction('切换门店筛选')}
              >
                门店：{filters.storeLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-marketing-v2__filter-btn"
                onClick={() => handleAction('切换周期筛选')}
              >
                周期：{filters.periodLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-marketing-v2__filter-btn"
                onClick={() => handleAction('切换渠道筛选')}
              >
                渠道：{filters.channelLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-marketing-v2__filter-btn"
                onClick={() => handleAction('切换活动状态筛选')}
              >
                活动状态：{filters.campaignStatusLabel}<ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-marketing-v2__filter-btn"
                onClick={() => handleAction('切换线索阶段筛选')}
              >
                线索阶段：{filters.leadStageLabel}<ChevronDown size={14} aria-hidden />
              </button>
            </div>
            <div className="met-marketing-v2__header-ops">
              <button type="button" className="met-marketing-v2__filter-btn met-marketing-v2__filter-btn--ghost" onClick={() => showToast('进入渠道规则（待建设）')}>
                {filters.secondaryActionLabel}
              </button>
              <button type="button" className="met-marketing-v2__filter-btn met-marketing-v2__filter-btn--primary" onClick={() => showToast('新增活动（待建设）')}>
                {filters.primaryActionLabel}
              </button>
              <button type="button" className="met-marketing-v2__filter-btn met-marketing-v2__filter-btn--link" onClick={() => showToast('进入线索池二级页（待建设）')}>
                {filters.leadPoolLinkLabel}
              </button>
            </div>
          </div>
        </header>

        {/* 第一屏：获客转化作战台 */}
        <section className="met-marketing-v2-zone met-marketing-v2-zone--warroom met-marketing-v2-warroom">
          <header className="met-marketing-v2-zone__head">
            <h2 className="met-marketing-v2-zone__title">{warroom.section.title}</h2>
            <p className="met-marketing-v2-zone__subtitle">{warroom.section.subtitle}</p>
          </header>
          <div className="met-marketing-v2-warroom__body">
            <div className="met-marketing-v2-funnel-main">
              <div className="met-marketing-v2-funnel-main__track">
              {warroom.funnelStages.map((stage, index) => {
                const bp = breakpointMap.get(stage.id);
                const isLast = index === warroom.funnelStages.length - 1;
                return (
                  <React.Fragment key={stage.id}>
                    <div
                      className="met-marketing-v2-funnel-main__unit"
                      style={{ flex: `${stage.widthPercent} 1 0` }}
                    >
                      <button
                        type="button"
                        className="met-marketing-v2-funnel-stage"
                        style={{
                          minHeight: `${52 + stage.widthPercent * 0.32}px`,
                        }}
                        onClick={() => handleFunnelStageClick(stage.id)}
                      >
                        <span className="met-marketing-v2-funnel-stage__name">{stage.stage}</span>
                        <span className="met-marketing-v2-funnel-stage__count">{stage.count}</span>
                        {stage.conversionRate ? (
                          <span className="met-marketing-v2-funnel-stage__rate">
                            {stage.conversionLabel ?? '转化率'} {stage.conversionRate}
                          </span>
                        ) : null}
                      </button>
                      {bp ? (
                        <div className={['met-marketing-v2-funnel-break', getFunnelBreakClass(bp.severity)].join(' ')}>
                          <span className="met-marketing-v2-funnel-break__label">{bp.label}</span>
                          <span className="met-marketing-v2-funnel-break__detail">{bp.detail}</span>
                        </div>
                      ) : null}
                    </div>
                    {!isLast ? (
                      <span className="met-marketing-v2-funnel-main__arrow" aria-hidden>→</span>
                    ) : null}
                  </React.Fragment>
                );
              })}
              </div>
            </div>
            <aside className="met-marketing-v2-action-compact">
              <header className="met-marketing-v2-action-compact__head">
                <h3 className="met-marketing-v2-action-compact__title">今日必须处理</h3>
                <p className="met-marketing-v2-action-compact__subtitle">优先处理会影响转化结果的断点</p>
              </header>
              <ul className="met-marketing-v2-action-compact__list">
                {warroom.todayActions.map(item => (
                  <li key={item.id} className={['met-marketing-v2-action-compact__row', getPriorityClass(item.priority)].join(' ')}>
                    <div className="met-marketing-v2-action-compact__main">
                      <span className={['met-marketing-v2-priority', getPriorityClass(item.priority)].join(' ')}>{item.priority}</span>
                      <span className="met-marketing-v2-action-compact__name">{item.title}</span>
                      <span className="met-marketing-v2-action-compact__count">{item.count}</span>
                      <span className="met-marketing-v2-action-compact__desc">{item.description}</span>
                    </div>
                    <button type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => handleTodayAction(item)}>
                      {item.actionLabel}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
          <div className="met-marketing-v2-warroom__brief">
            {warroom.quickMetrics.map(metric => (
              <span key={metric.label} className="met-marketing-v2-warroom__brief-item">
                {metric.label} <strong>{metric.value}</strong>
              </span>
            ))}
          </div>
        </section>

        {/* 第二屏：渠道价值四象限 */}
        <article className="met-marketing-v2-zone">
          <header className="met-marketing-v2-zone__head">
            <h2 className="met-marketing-v2-zone__title">{channelQuadrants.title}</h2>
            <p className="met-marketing-v2-zone__subtitle">{channelQuadrants.subtitle}</p>
          </header>
          <div className="met-marketing-v2-channel-quadrants">
            <div className="met-marketing-v2-channel-quadrants__grid">
              {channelQuadrants.quadrants.map(quad => (
                <div key={quad.id} className={['met-marketing-v2-quadrant', getQuadrantToneClass(quad.tone)].join(' ')}>
                  <h3 className="met-marketing-v2-quadrant__title">{quad.title}</h3>
                  <div className="met-marketing-v2-quadrant__channels">
                    {quad.channels.map(pill => (
                      <div key={pill.id} className={['met-marketing-v2-channel-pill', getChannelStatusClass(pill.statusLevel)].join(' ')}>
                        <div className="met-marketing-v2-channel-pill__head">
                          <span className="met-marketing-v2-channel-pill__name">{pill.channel}</span>
                          <span className="met-marketing-v2-channel-pill__meta">线索 {pill.leads} · 成交率 {pill.dealRate} · 成本 {pill.cost}</span>
                        </div>
                        <p className="met-marketing-v2-channel-pill__judgement">{pill.judgement}</p>
                        <button type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => handleChannelPill(pill)}>
                          {pill.actionLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <ul className="met-marketing-v2-channel-quadrants__judgements">
              {channelQuadrants.judgements.map(j => (
                <li key={j}>{j}</li>
              ))}
            </ul>
          </div>
        </article>

        {/* 第三屏：活动战役复盘 */}
        <article className="met-marketing-v2-zone">
          <header className="met-marketing-v2-zone__head">
            <h2 className="met-marketing-v2-zone__title">{campaignBattle.title}</h2>
            <p className="met-marketing-v2-zone__subtitle">{campaignBattle.subtitle}</p>
          </header>
          <div className="met-marketing-v2-battle-layout">
            <div className={['met-marketing-v2-battle-hero', getCampaignStatusClass(heroCampaign.statusLevel)].join(' ')}>
              <div className="met-marketing-v2-battle-hero__head">
                <div>
                  <span className="met-marketing-v2-battle-hero__badge">主战役</span>
                  <h3 className="met-marketing-v2-battle-hero__name">{heroCampaign.name}</h3>
                </div>
                <span className="met-marketing-v2-battle-hero__status">{heroCampaign.status}</span>
              </div>
              <p className="met-marketing-v2-battle-hero__goal">目标：{heroCampaign.goal}</p>
              <div className="met-marketing-v2-battle-hero__progress-head">
                <span className="met-marketing-v2-battle-hero__progress-label">当前进度</span>
                <span className="met-marketing-v2-battle-hero__progress-value">{heroCampaign.goalProgress.display}</span>
              </div>
              <div className="met-marketing-v2-battle-hero__goal-bar">
                <div className="met-marketing-v2-battle-hero__goal-fill" style={{ width: `${heroCampaign.goalProgress.percent}%` }} />
              </div>
              <div className="met-marketing-v2-campaign-progress">
                {heroCampaign.progress.map(stage => (
                  <div key={stage.key} className="met-marketing-v2-campaign-progress__stage">
                    <div className="met-marketing-v2-campaign-progress__bar">
                      <div className="met-marketing-v2-campaign-progress__fill" style={{ width: `${stage.percent}%` }} />
                    </div>
                    <span className="met-marketing-v2-campaign-progress__label">{stage.label}</span>
                    <span className="met-marketing-v2-campaign-progress__value">{stage.display}</span>
                  </div>
                ))}
              </div>
              <p className="met-marketing-v2-battle-hero__issue">最大问题：{heroCampaign.maxIssue}</p>
              <p className="met-marketing-v2-battle-hero__next">下一动作：{heroCampaign.nextAction}</p>
              <p className="met-marketing-v2-battle-hero__copy">复制判断：{heroCampaign.copyJudgement}</p>
              <button type="button" className="met-marketing-v2-btn" onClick={() => handleHeroCampaign(heroCampaign)}>
                {heroCampaign.actionLabel}
              </button>
            </div>
            <div className="met-marketing-v2-battle-support">
              {campaignBattle.supportCampaigns.map(item => (
                <div key={item.id} className={['met-marketing-v2-battle-support__card', getCampaignStatusClass(item.statusLevel)].join(' ')}>
                  <div className="met-marketing-v2-battle-support__head">
                    <span className="met-marketing-v2-battle-support__name">{item.name}</span>
                    <span className="met-marketing-v2-battle-support__status">{item.status}</span>
                  </div>
                  <p className="met-marketing-v2-battle-support__stats">
                    线索 {item.leads} · 到店 {item.visited} · 成交 {item.deals}
                  </p>
                  <p className="met-marketing-v2-battle-support__copy">{item.copyJudgement}</p>
                  <button type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => handleSupportCampaign(item)}>
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* 第四屏：线索跟进行动队列 */}
        <article className="met-marketing-v2-zone">
          <header className="met-marketing-v2-zone__head">
            <h2 className="met-marketing-v2-zone__title">{leadActionQueue.title}</h2>
            <p className="met-marketing-v2-zone__subtitle">{leadActionQueue.subtitle}</p>
          </header>
          <div className="met-marketing-v2-action-queue">
            {leadActionQueue.items.map(item => (
              <div key={item.id} className={['met-marketing-v2-action-queue__row', `met-marketing-v2-action-queue__row--${item.priority.toLowerCase()}`].join(' ')}>
                <span className={['met-marketing-v2-priority', getPriorityClass(item.priority)].join(' ')}>{item.priority}</span>
                <div className="met-marketing-v2-action-queue__main">
                  <p className="met-marketing-v2-action-queue__title">{item.title}</p>
                  <p className="met-marketing-v2-action-queue__fact">{item.fact}</p>
                  <p className="met-marketing-v2-action-queue__action">{item.suggestionAction}</p>
                  <p className="met-marketing-v2-action-queue__meta">
                    <span className="met-marketing-v2-action-queue__impact-tag">影响：{item.impact}</span>
                    <span className={['met-marketing-v2-source-tag', getSuggestionSourceClass(item.suggestionSource)].join(' ')}>
                      {item.suggestionSourceLabel}
                    </span>
                  </p>
                </div>
                <button type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => handleLeadAction(item)}>
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        {/* 第五屏：体验成交承接 */}
        <article className="met-marketing-v2-zone">
          <header className="met-marketing-v2-zone__head">
            <h2 className="met-marketing-v2-zone__title">{handoffFlow.title}</h2>
            <p className="met-marketing-v2-zone__subtitle">{handoffFlow.subtitle}</p>
          </header>
          <div className="met-marketing-v2-handoff-compact">
            <div className="met-marketing-v2-handoff-compact__flow">
              {handoffFlow.nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  <div className="met-marketing-v2-handoff-compact__node">
                    <span className="met-marketing-v2-handoff-compact__label">{node.label}</span>
                    <span className="met-marketing-v2-handoff-compact__count">{node.count}</span>
                  </div>
                  {index < handoffFlow.nodes.length - 1 ? (
                    <span className="met-marketing-v2-handoff-compact__arrow" aria-hidden>→</span>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <ul className="met-marketing-v2-handoff-compact__breaks">
              {handoffFlow.breakpoints.map(bp => (
                <li key={bp.id} className="met-marketing-v2-handoff-compact__break">
                  <span>{bp.title}</span>
                  <strong>{bp.count}</strong>
                </li>
              ))}
            </ul>
            <div className="met-marketing-v2-handoff-compact__actions">
              {handoffFlow.actions.map(action => (
                <button key={action.label} type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => showToast(action.toastMessage)}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </article>

        {/* 第六屏：内容与活动节奏 */}
        <article className="met-marketing-v2-zone met-marketing-v2-zone--lite">
          <header className="met-marketing-v2-zone__head met-marketing-v2-zone__head--lite">
            <h2 className="met-marketing-v2-zone__title">{activityTimeline.title}</h2>
          </header>
          <ul className="met-marketing-v2-timeline-lite">
            {activityTimeline.nodes.map(node => (
              <li key={node.id} className="met-marketing-v2-timeline-lite__item">
                <span className="met-marketing-v2-timeline-lite__date">{node.date}</span>
                <span className="met-marketing-v2-timeline-lite__title">{node.title}</span>
                <span className={['met-marketing-v2-timeline-lite__status', getCalendarStatusClass(node.statusTone)].join(' ')}>
                  {node.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="met-marketing-v2-timeline-lite__actions">
            <button type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => showToast('新增节点（待建设）')}>
              {activityTimeline.addActionLabel}
            </button>
            <button type="button" className="met-marketing-v2-btn met-marketing-v2-btn--sm" onClick={() => showToast('查看复盘（待建设）')}>
              {activityTimeline.reviewActionLabel}
            </button>
          </div>
        </article>
      </div>

      {drawer ? (
        <>
          <button type="button" className="met-marketing-v2-drawer-overlay met-v2-drawer-overlay" aria-label="关闭详情" onClick={closeDrawer} />
          <aside className="met-marketing-v2-drawer met-v2-drawer-panel" role="dialog" aria-labelledby="marketing-v2-drawer-title">
            <div className="met-marketing-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2 id="marketing-v2-drawer-title" className="met-marketing-v2-drawer__title met-v2-drawer-title">{drawerTitle}</h2>
                {drawerSubtitle ? (
                  <p className="met-marketing-v2-drawer__subtitle met-v2-drawer-subtitle">{drawerSubtitle}</p>
                ) : null}
              </div>
              <button type="button" className="met-marketing-v2-drawer__close met-v2-drawer-close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-marketing-v2-drawer__body met-v2-drawer-body">
              {drawerHasContent ? (
                <>
                  {drawerActivity ? renderActivityDrawer(drawerActivity) : null}
                  {drawerLead ? renderLeadDrawer(drawerLead) : null}
                </>
              ) : (
                <V2DrawerEmpty onClose={closeDrawer} />
              )}
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-marketing-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default MarketingV2Page;
