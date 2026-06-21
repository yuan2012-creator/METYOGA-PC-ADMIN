import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildMemberV2Snapshot,
  getSecondaryEntranceLabel,
  type MemberV2MatchLevel,
  type MemberV2MemberDetail,
  type MemberV2RiskPriority,
  type MemberV2SuggestionSource,
} from './memberV2.viewModel';
import './memberV2.css';

const SOURCE_TAG_CLASS: Record<MemberV2SuggestionSource, string> = {
  system_rule: 'met-member-v2-source-tag--rule',
  pending_config: 'met-member-v2-source-tag--pending',
};

const PRIORITY_CLASS: Record<MemberV2RiskPriority, string> = {
  P0: 'met-member-v2-priority--p0',
  P1: 'met-member-v2-priority--p1',
  P2: 'met-member-v2-priority--p2',
};

const RISK_BUBBLE_CLASS: Record<MemberV2RiskPriority, string> = {
  P0: 'is-p0',
  P1: 'is-p1',
  P2: 'is-p2',
};

const MATCH_LEVEL_LABEL: Record<MemberV2MatchLevel, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const MATCH_LEVEL_FILL: Record<MemberV2MatchLevel, string> = {
  high: 'is-high',
  medium: 'is-medium',
  low: 'is-low',
};

const MemberV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildMemberV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[MemberV2]', message);
    setToast(message);
    window.setTimeout(
      () => setToast(current => (current === message ? null : current)),
      2400,
    );
  }, []);

  const openSecondary = useCallback(
    (key: string) => {
      const label = getSecondaryEntranceLabel(snapshot.secondaryEntrances, key);
      showToast(`进入 ${label} 二级页（待建设）`);
    },
    [showToast, snapshot.secondaryEntrances],
  );

  const drawerDetail: MemberV2MemberDetail | null = drawerMemberId
    ? snapshot.drawerMemberDetails[drawerMemberId] ?? null
    : null;

  const closeDrawer = useCallback(() => setDrawerMemberId(null), []);

  const openDetail = useCallback((memberId: string) => {
    setDrawerMemberId(memberId);
  }, []);

  const {
    meta,
    lifecycleFlow,
    attentionHighlights,
    serviceQueue,
    salesQueue,
    audienceMatchPacks,
    riskGraph,
    keyMemberEntrances,
  } = snapshot;

  return (
    <div className="met-member-v2">
      <div className="met-member-v2__inner">
        <header className="met-member-v2__header">
          <div className="met-member-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-member-v2__filters">
            <button type="button" className="met-member-v2__filter-btn">
              门店：{meta.filters.storeLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button type="button" className="met-member-v2__filter-btn">
              会员阶段：{meta.filters.stageLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button type="button" className="met-member-v2__filter-btn">
              负责人：{meta.filters.ownerLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button type="button" className="met-member-v2__filter-btn">
              风险类型：{meta.filters.riskLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn met-member-v2__filter-btn--link"
              onClick={() => openSecondary('member_list')}
            >
              {meta.filters.memberListLabel}
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn met-member-v2__filter-btn--primary"
              onClick={() => showToast('新增线索')}
            >
              {meta.filters.primaryActionLabel}
            </button>
          </div>
        </header>

        <section className="met-member-v2__row-top">
          <article className="met-member-v2-card met-member-v2-card--flow">
            <h2 className="met-member-v2-card__title">{lifecycleFlow.title}</h2>
            <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
              {lifecycleFlow.subtitle}
            </p>
            <div className="met-member-v2-flow">
              {lifecycleFlow.stages.map((stage, index) => (
                <button
                  key={stage.id}
                  type="button"
                  className={[
                    'met-member-v2-flow__segment',
                    stage.zone === 'risk' ? 'is-risk' : '',
                    stage.code === 'S6' ? 'is-risk-s6' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    showToast(`进入 ${stage.code} ${stage.name} 会员名单 二级页（待建设）`)
                  }
                >
                  <span className="met-member-v2-flow__code">{stage.code}</span>
                  <span className="met-member-v2-flow__name">{stage.name}</span>
                  <span className="met-member-v2-flow__count">{stage.count}</span>
                  <span
                    className={[
                      'met-member-v2-flow__change',
                      stage.weeklyChangeUp ? 'is-up' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    较上周 {stage.weeklyChange}
                  </span>
                  <span className="met-member-v2-flow__action">{stage.coreAction}</span>
                  {index < lifecycleFlow.stages.length - 1 ? (
                    <span className="met-member-v2-flow__arrow" aria-hidden>
                      →
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </article>

          <aside className="met-member-v2-card met-member-v2-card--attention">
            <h2 className="met-member-v2-card__title">{attentionHighlights.title}</h2>
            <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
              {attentionHighlights.subtitle}
            </p>
            <div className="met-member-v2-attention-grid">
              {attentionHighlights.items.map(item => (
                <div
                  key={item.id}
                  className={`met-member-v2-attention-bubble is-${item.tone}`}
                >
                  <div className="met-member-v2-attention-bubble__ring">{item.count}</div>
                  <p className="met-member-v2-attention-bubble__label">{item.label}</p>
                  <p className="met-member-v2-attention-bubble__note">{item.note}</p>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => openSecondary(item.secondaryKey)}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="met-member-v2__row-queues">
          <article className="met-member-v2-card met-member-v2-card--queue">
            <h2 className="met-member-v2-card__title">{serviceQueue.title}</h2>
            <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
              {serviceQueue.subtitle}
            </p>
            <div className="met-member-v2-summary-strip">
              {serviceQueue.summary.map(stat => (
                <span key={stat.label} className="met-member-v2-summary-pill">
                  {stat.label} <strong>{stat.value}</strong>
                </span>
              ))}
            </div>
            <div className="met-member-v2-top-list">
              {serviceQueue.topTasks.map(task => (
                <div key={task.id} className="met-member-v2-top-row">
                  <div className="met-member-v2-top-row__main">
                    <span className="met-member-v2-top-row__name">{task.memberName}</span>
                    <span className="met-member-v2-top-row__stage">{task.stageCode}</span>
                    <span className="met-member-v2-top-row__tag">{task.mainTag}</span>
                    <span>｜{task.triggerReason}</span>
                    <p className="met-member-v2-top-row__meta">
                      {task.owner} · {task.deadline}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => showToast(`${task.actionLabel}：${task.memberName}`)}
                  >
                    {task.actionLabel}
                  </button>
                </div>
              ))}
            </div>
            <div className="met-member-v2-card__footer-link">
              <button
                type="button"
                className="met-member-v2-link-btn"
                onClick={() => openSecondary(serviceQueue.viewAllKey)}
              >
                {serviceQueue.viewAllLabel}
              </button>
            </div>
          </article>

          <article className="met-member-v2-card met-member-v2-card--queue">
            <h2 className="met-member-v2-card__title">{salesQueue.title}</h2>
            <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
              {salesQueue.subtitle}
            </p>
            <div className="met-member-v2-summary-strip">
              {salesQueue.summary.map(stat => (
                <span key={stat.label} className="met-member-v2-summary-pill">
                  {stat.label} <strong>{stat.value}</strong>
                </span>
              ))}
            </div>
            <div className="met-member-v2-top-list">
              {salesQueue.topTasks.map(task => (
                <div key={task.id} className="met-member-v2-top-row">
                  <div className="met-member-v2-top-row__main">
                    <span className="met-member-v2-top-row__name">{task.name}</span>
                    <span className="met-member-v2-top-row__stage">{task.stageCode}</span>
                    <span className="met-member-v2-top-row__tag">{task.mainTag}</span>
                    <span>｜{task.triggerReason}</span>
                    <p className="met-member-v2-top-row__meta">
                      {task.owner} · {task.deadline}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => showToast(`${task.actionLabel}：${task.name}`)}
                  >
                    {task.actionLabel}
                  </button>
                </div>
              ))}
            </div>
            <div className="met-member-v2-card__footer-link">
              <button
                type="button"
                className="met-member-v2-link-btn"
                onClick={() => openSecondary(salesQueue.viewAllKey)}
              >
                {salesQueue.viewAllLabel}
              </button>
            </div>
          </article>
        </section>

        <article className="met-member-v2-card met-member-v2-card--audience">
          <h2 className="met-member-v2-card__title">{audienceMatchPacks.title}</h2>
          <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
            {audienceMatchPacks.subtitle}
          </p>
          <div className="met-member-v2-pack-grid">
            {audienceMatchPacks.packs.map(pack => (
              <div key={pack.id} className="met-member-v2-pack">
                <div className="met-member-v2-pack__head">
                  <h3 className="met-member-v2-pack__title">{pack.title}</h3>
                  <span
                    className={[
                      'met-member-v2-source-tag',
                      SOURCE_TAG_CLASS[pack.suggestionSource],
                    ].join(' ')}
                  >
                    {pack.suggestionSourceLabel}
                  </span>
                </div>
                <div className="met-member-v2-pack__counts">
                  <div className="met-member-v2-pack__count-block">
                    <span className="met-member-v2-pack__count-num">{pack.recommendedCount}</span>
                    <span className="met-member-v2-pack__count-label">推荐人数</span>
                  </div>
                  <div className="met-member-v2-pack__count-block">
                    <span className="met-member-v2-pack__count-num">{pack.highMatchCount}</span>
                    <span className="met-member-v2-pack__count-label">高匹配</span>
                  </div>
                </div>
                <div className="met-member-v2-pack__dims">
                  {pack.dimensions.map(dim => (
                    <div key={dim.key} className="met-member-v2-dim-row">
                      <span className="met-member-v2-dim-row__label">{dim.label}</span>
                      <div className="met-member-v2-dim-row__bar">
                        <div
                          className={[
                            'met-member-v2-dim-row__fill',
                            MATCH_LEVEL_FILL[dim.level],
                          ].join(' ')}
                        />
                      </div>
                      <span
                        className={[
                          'met-member-v2-dim-row__level',
                          dim.level === 'medium' ? 'is-medium' : '',
                          dim.level === 'low' ? 'is-low' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {MATCH_LEVEL_LABEL[dim.level]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="met-member-v2-pack__excludes">
                  {pack.excludeTags.map(tag => (
                    <span key={tag} className="met-member-v2-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="met-member-v2-pack__foot">
                  <div className="met-member-v2-pack__actions">
                    <button
                      type="button"
                      className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                      onClick={() => openSecondary('match_list')}
                    >
                      {pack.primaryActionLabel}
                    </button>
                    {pack.secondaryActionLabel ? (
                      <button
                        type="button"
                        className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                        onClick={() => openSecondary('assign_invite')}
                      >
                        {pack.secondaryActionLabel}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="met-member-v2-card met-member-v2-card--risk-graph">
          <h2 className="met-member-v2-card__title">{riskGraph.title}</h2>
          <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
            {riskGraph.subtitle}
          </p>
          <div className="met-member-v2-risk-graph">
            {riskGraph.items.map(item => (
              <div
                key={item.id}
                className={[
                  'met-member-v2-risk-bubble',
                  RISK_BUBBLE_CLASS[item.priority],
                ].join(' ')}
              >
                <div
                  className="met-member-v2-risk-bubble__orb"
                  style={{
                    ['--bubble-size' as string]: `${Math.round(64 + item.bubbleScale * 20)}px`,
                  }}
                >
                  {item.count}
                </div>
                <p className="met-member-v2-risk-bubble__title">{item.title}</p>
                <span
                  className={[
                    'met-member-v2-priority',
                    PRIORITY_CLASS[item.priority],
                  ].join(' ')}
                >
                  {item.priority}
                </span>
                <p className="met-member-v2-risk-bubble__fact">{item.fact}</p>
                <div className="met-member-v2-risk-bubble__foot">
                  <span
                    className={[
                      'met-member-v2-source-tag',
                      SOURCE_TAG_CLASS[item.suggestionSource],
                    ].join(' ')}
                  >
                    {item.suggestionSourceLabel}
                  </span>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => {
                      if (item.actionLabel === '查看名单') {
                        openSecondary('risk_list');
                      } else {
                        showToast(`${item.actionLabel}：${item.title}`);
                      }
                    }}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="met-member-v2-card met-member-v2-card--key">
          <h2 className="met-member-v2-card__title">{keyMemberEntrances.title}</h2>
          <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
            {keyMemberEntrances.subtitle}
          </p>
          <div className="met-member-v2-entrance-grid">
            {keyMemberEntrances.members.map(member => (
              <div key={member.id} className="met-member-v2-entrance">
                <div className="met-member-v2-entrance__head">
                  <h3 className="met-member-v2-entrance__name">{member.name}</h3>
                  <span className="met-member-v2-entrance__stage">{member.stageLabel}</span>
                </div>
                <p className="met-member-v2-entrance__tag">{member.mainTag}</p>
                <p className="met-member-v2-entrance__asset">{member.assetSummary}</p>
                <p className="met-member-v2-entrance__action-text">{member.recentAction}</p>
                <div className="met-member-v2-entrance__btns">
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => openDetail(member.id)}
                  >
                    {member.detailActionLabel}
                  </button>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => showToast(`${member.followActionLabel}：${member.name}`)}
                  >
                    {member.followActionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="met-member-v2-card__footer-link">
            <button
              type="button"
              className="met-member-v2-link-btn"
              onClick={() => openSecondary(keyMemberEntrances.viewAllKey)}
            >
              {keyMemberEntrances.viewAllLabel}
            </button>
          </div>
        </article>
      </div>

      {drawerDetail ? (
        <>
          <button
            type="button"
            className="met-member-v2-drawer-overlay"
            aria-label="关闭会员详情"
            onClick={closeDrawer}
          />
          <aside className="met-member-v2-drawer" role="dialog" aria-labelledby="member-v2-drawer-title">
            <div className="met-member-v2-drawer__head">
              <h2 id="member-v2-drawer-title" className="met-member-v2-drawer__title">
                会员详情
              </h2>
              <button
                type="button"
                className="met-member-v2-drawer__close"
                aria-label="关闭"
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>
            <div className="met-member-v2-drawer__body">
              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">会员概览</h3>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">姓名</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.name}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">手机</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.phoneMasked}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">S 阶段</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.stageLabel}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">负责人</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.owner}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">常去门店</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.frequentStore}</span>
                </div>
                <div className="met-member-v2-drawer__tags">
                  {drawerDetail.tagSummary.map(tag => (
                    <span key={tag} className="met-member-v2-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">资产与权益</h3>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">主卡项</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.mainCard}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">剩余点数 / 节数</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.remaining}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">有效期</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.validUntil}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">赠送权益</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.bonusBenefits}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">积分余额</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.pointsBalance}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">合同签署状态</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.contractStatus}</span>
                </div>
              </section>

              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">练习与偏好</h3>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">常约课程</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.favoriteCourses}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">常约老师</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.favoriteTeachers}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">常约时间</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.favoriteTimes}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">课程强度偏好</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.intensityPreference}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">身体注意事项</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.bodyNotes}</span>
                </div>
              </section>

              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">跟进记录</h3>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">最近一次跟进</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.lastFollowUp}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">跟进人</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.followUpOwner}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">跟进结果</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.followUpResult}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">下一步计划</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.nextPlan}</span>
                </div>
              </section>

              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">风险证据链</h3>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">触发风险</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.riskTrigger}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">事实依据</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.riskFact}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">建议来源</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.riskSourceLabel}</span>
                </div>
                <div className="met-member-v2-drawer__row">
                  <span className="met-member-v2-drawer__row-label">处理状态</span>
                  <span className="met-member-v2-drawer__row-value">{drawerDetail.riskHandleStatus}</span>
                </div>
              </section>
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-member-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default MemberV2Page;
