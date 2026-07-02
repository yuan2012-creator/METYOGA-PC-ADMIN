import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildMemberV2Snapshot,
  getSecondaryEntranceLabel,
  type MemberV2AudienceMatchPreview,
  type MemberV2LifecycleStage,
  type MemberV2MatchDimension,
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

const MATCH_DOT_COUNT: Record<MemberV2MatchLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function MatchDimensionDots({ dimension }: { dimension: MemberV2MatchDimension }) {
  const filled = MATCH_DOT_COUNT[dimension.level];
  const isPositive = dimension.tone === 'positive';

  return (
    <div className="met-member-v2-dim-dots">
      <span className="met-member-v2-dim-dots__label">{dimension.label}</span>
      <span className="met-member-v2-dim-dots__matrix">
        {[1, 2, 3].map(dot => (
          <span
            key={dot}
            className={[
              'met-member-v2-dim-dots__dot',
              dot <= filled ? 'is-filled' : '',
              dot <= filled && isPositive ? 'is-positive' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </span>
      <span
        className={[
          'met-member-v2-dim-dots__level',
          dimension.level === 'high' ? 'is-high' : '',
          isPositive ? 'is-positive' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {MATCH_LEVEL_LABEL[dimension.level]}
      </span>
    </div>
  );
}

function FlowNode({
  stage,
  onSelect,
}: {
  stage: MemberV2LifecycleStage;
  onSelect: (stage: MemberV2LifecycleStage) => void;
}) {
  return (
    <button
      type="button"
      className={[
        'met-member-v2-flow-node',
        stage.zone === 'growth' ? 'met-member-v2-flow-node--growth' : 'met-member-v2-flow-node--risk',
        stage.riskVariant ? `is-${stage.riskVariant}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect(stage)}
    >
      <span className="met-member-v2-flow-node__code">{stage.code}</span>
      <span className="met-member-v2-flow-node__name">{stage.name}</span>
      <span className="met-member-v2-flow-node__count">{stage.count}</span>
      <span
        className={[
          'met-member-v2-flow-node__change',
          stage.weeklyChangeUp ? 'is-up' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        较上周 {stage.weeklyChange}
      </span>
      <span className="met-member-v2-flow-node__action">{stage.coreAction}</span>
    </button>
  );
}

const MemberV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildMemberV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerMemberId, setDrawerMemberId] = useState<string | null>(null);
  const [matchPreviewId, setMatchPreviewId] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[MemberV2]', message);
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

  const matchPreview: MemberV2AudienceMatchPreview | null = matchPreviewId
    ? snapshot.audienceMatchPreviews[matchPreviewId] ?? null
    : null;

  const closeAllDrawers = useCallback(() => {
    setDrawerMemberId(null);
    setMatchPreviewId(null);
  }, []);

  const openDetail = useCallback((memberId: string) => {
    setMatchPreviewId(null);
    setDrawerMemberId(memberId);
  }, []);

  const openMatchPreview = useCallback((packId: string) => {
    setDrawerMemberId(null);
    setMatchPreviewId(packId);
  }, []);

  const handleStageSelect = useCallback(
    (stage: MemberV2LifecycleStage) => {
      showToast(`进入 ${stage.code} ${stage.name} 会员名单 二级页（待建设）`);
    },
    [showToast],
  );

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

  const growthStages = lifecycleFlow.stages.filter(stage => stage.zone === 'growth');
  const riskStages = lifecycleFlow.stages.filter(stage => stage.zone === 'risk');

  return (
    <div className="met-member-v2">
      <div className="met-member-v2__inner">
        <header className="met-member-v2__header">
          <div className="met-member-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-member-v2__filters">
            <button
              type="button"
              className="met-member-v2__filter-btn"
              onClick={() => handleAction('切换门店筛选')}
            >
              门店：{meta.filters.storeLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn"
              onClick={() => handleAction('切换会员阶段筛选')}
            >
              会员阶段：{meta.filters.stageLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn"
              onClick={() => handleAction('切换负责人筛选')}
            >
              负责人：{meta.filters.ownerLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn"
              onClick={() => handleAction('切换风险类型筛选')}
            >
              风险类型：{meta.filters.riskLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn met-member-v2__filter-btn--link"
              onClick={() => showToast('进入会员名单二级页（待建设）')}
            >
              {meta.filters.memberListLabel}
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn met-member-v2__filter-btn--primary"
              onClick={() => handleAction('新增线索')}
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
            <div className="met-member-v2-flow-wrap">
              <div className="met-member-v2-flow-zone met-member-v2-flow-zone--growth">
                <span className="met-member-v2-flow-zone__label">成长链路 S0 → S3</span>
                <div className="met-member-v2-flow-track">
                  {growthStages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                      {index > 0 ? (
                        <span className="met-member-v2-flow-connector" aria-hidden>
                          →
                        </span>
                      ) : null}
                      <FlowNode stage={stage} onSelect={handleStageSelect} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="met-member-v2-flow-bridge">
                <span className="met-member-v2-flow-bridge__line" />
                <span className="met-member-v2-flow-bridge__label">活跃进入风险</span>
                <span className="met-member-v2-flow-bridge__line" />
              </div>
              <div className="met-member-v2-flow-zone met-member-v2-flow-zone--risk">
                <span className="met-member-v2-flow-zone__label">风险 / 经营动作 S4 → S6</span>
                <div className="met-member-v2-flow-track">
                  {riskStages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                      {index > 0 ? (
                        <span className="met-member-v2-flow-connector" aria-hidden>
                          →
                        </span>
                      ) : null}
                      <FlowNode stage={stage} onSelect={handleStageSelect} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
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
                  <span className="met-member-v2-attention-bubble__type">{item.typeLabel}</span>
                  <div className="met-member-v2-attention-bubble__ring">{item.count}</div>
                  <p className="met-member-v2-attention-bubble__label">{item.label}</p>
                  <p className="met-member-v2-attention-bubble__note">{item.note}</p>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => {
                      if (item.matchPreviewPackId && item.actionLabel === '匹配') {
                        openMatchPreview(item.matchPreviewPackId);
                        return;
                      }
                      openSecondary(item.secondaryKey);
                    }}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="met-member-v2__row-queues">
          <article className="met-member-v2-card met-member-v2-card--queue met-member-v2-card--queue-service">
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
                <div key={task.id} className="met-member-v2-top-row met-member-v2-top-row--service">
                  <div className="met-member-v2-top-row__main">
                    <div className="met-member-v2-top-row__head">
                      <span className="met-member-v2-top-row__name">{task.memberName}</span>
                      <span className="met-member-v2-top-row__stage">{task.stageCode}</span>
                      <span className="met-member-v2-top-row__tag">{task.mainTag}</span>
                    </div>
                    <p className="met-member-v2-top-row__fact">{task.triggerReason}</p>
                    <p className="met-member-v2-top-row__meta">
                      {task.owner} · 截止 {task.deadline}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => handleAction(task.actionLabel)}
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

          <article className="met-member-v2-card met-member-v2-card--queue met-member-v2-card--queue-sales">
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
                <div key={task.id} className="met-member-v2-top-row met-member-v2-top-row--sales">
                  <div className="met-member-v2-top-row__main">
                    <div className="met-member-v2-top-row__head">
                      <span className="met-member-v2-top-row__name">{task.name}</span>
                      <span className="met-member-v2-top-row__stage">{task.stageCode}</span>
                      <span className="met-member-v2-top-row__tag">{task.mainTag}</span>
                    </div>
                    <p className="met-member-v2-top-row__fact">{task.triggerReason}</p>
                    <p className="met-member-v2-top-row__meta">
                      {task.owner} · 截止 {task.deadline}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                    onClick={() => handleAction(task.actionLabel)}
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
          <div className="met-member-v2-card__head-row">
            <div>
              <h2 className="met-member-v2-card__title">{audienceMatchPacks.title}</h2>
              <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
                {audienceMatchPacks.subtitle}
              </p>
            </div>
            <span className="met-member-v2-audience-hint">点对点邀约 · 非群发</span>
          </div>
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
                    <span className="met-member-v2-pack__count-label">匹配人数</span>
                  </div>
                  <div className="met-member-v2-pack__count-block">
                    <span className="met-member-v2-pack__count-num">{pack.highMatchCount}</span>
                    <span className="met-member-v2-pack__count-label">高匹配</span>
                  </div>
                </div>
                <div className="met-member-v2-pack__dims">
                  {pack.dimensions.map(dim => (
                    <MatchDimensionDots key={dim.key} dimension={dim} />
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
                      onClick={() => {
                        if (pack.primaryActionLabel === '查看名单') {
                          openMatchPreview(pack.previewId);
                          return;
                        }
                        showToast(`${pack.primaryActionLabel}（待建设）`);
                      }}
                    >
                      {pack.primaryActionLabel}
                    </button>
                    {pack.secondaryActionLabel ? (
                      <button
                        type="button"
                        className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                        onClick={() => handleAction('分配邀约')}
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
                        showToast(`${item.actionLabel}（待建设）`);
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
                    onClick={() => handleAction(member.followActionLabel)}
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
            onClick={closeAllDrawers}
          />
          <aside className="met-member-v2-drawer" role="dialog" aria-labelledby="member-v2-drawer-title">
            <div className="met-member-v2-drawer__head">
              <div>
                <h2 id="member-v2-drawer-title" className="met-member-v2-drawer__title">
                  会员详情
                </h2>
                <p className="met-member-v2-drawer__hero">
                  {drawerDetail.name} · {drawerDetail.stageLabel}
                </p>
              </div>
              <button
                type="button"
                className="met-member-v2-drawer__close"
                aria-label="关闭"
                onClick={closeAllDrawers}
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

      {matchPreview ? (
        <>
          <button
            type="button"
            className="met-member-v2-drawer-overlay"
            aria-label="关闭匹配名单预览"
            onClick={closeAllDrawers}
          />
          <aside
            className="met-member-v2-drawer met-member-v2-drawer--match"
            role="dialog"
            aria-labelledby="member-v2-match-drawer-title"
          >
            <div className="met-member-v2-drawer__head">
              <div>
                <h2 id="member-v2-match-drawer-title" className="met-member-v2-drawer__title">
                  {matchPreview.title}
                </h2>
                <p className="met-member-v2-drawer__subtitle">{matchPreview.subtitle}</p>
              </div>
              <button
                type="button"
                className="met-member-v2-drawer__close"
                aria-label="关闭"
                onClick={closeAllDrawers}
              >
                ×
              </button>
            </div>
            <div className="met-member-v2-drawer__body">
              <div className="met-member-v2-match-stats">
                {matchPreview.stats.map(stat => (
                  <div key={stat.label} className="met-member-v2-match-stat">
                    <span className="met-member-v2-match-stat__value">{stat.value}</span>
                    <span className="met-member-v2-match-stat__label">{stat.label}</span>
                  </div>
                ))}
              </div>
              <p className="met-member-v2-match-hint">点对点邀约名单 · 非群发</p>
              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">匹配规则摘要</h3>
                <div className="met-member-v2-drawer__tags">
                  {matchPreview.ruleTags.map(tag => (
                    <span key={tag} className="met-member-v2-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">匹配会员</h3>
                {matchPreview.candidates.map(candidate => (
                  <div key={candidate.id} className="met-member-v2-candidate">
                    <div className="met-member-v2-candidate__head">
                      <h4 className="met-member-v2-candidate__name">{candidate.name}</h4>
                      <span
                        className={[
                          'met-member-v2-match-level',
                          candidate.matchLevel === '中匹配' ? 'met-member-v2-match-level--mid' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {candidate.matchLevel}
                      </span>
                    </div>
                    <p className="met-member-v2-candidate__meta">
                      {candidate.stage} · {candidate.assetSummary}
                      <br />
                      上次到店：{candidate.lastVisit} · 常去门店：{candidate.preferredStore}
                      <br />
                      建议触达：{candidate.recommendedTouch} · 触达状态：{candidate.touchStatus}
                    </p>
                    <div className="met-member-v2-candidate__reasons">
                      {candidate.matchReasons.map(reason => (
                        <span key={reason} className="met-member-v2-tag">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <div className="met-member-v2-candidate__foot">
                      <span
                        className={[
                          'met-member-v2-source-tag',
                          SOURCE_TAG_CLASS[matchPreview.suggestionSource],
                        ].join(' ')}
                      >
                        {matchPreview.suggestionSourceLabel || '系统规则建议'}
                      </span>
                      <div className="met-member-v2-candidate__btns">
                        <button
                          type="button"
                          className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                          onClick={() => handleAction('分配邀约')}
                        >
                          {candidate.primaryActionLabel}
                        </button>
                        <button
                          type="button"
                          className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                          onClick={() => handleAction('记录跟进')}
                        >
                          {candidate.secondaryActionLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
              <div className="met-member-v2-excluded">
                <p className="met-member-v2-excluded__title">{matchPreview.excludedSummary}</p>
                <ul className="met-member-v2-excluded__list">
                  {matchPreview.excludedReasons.map(reason => (
                    <li key={reason.label}>
                      {reason.label}：{reason.count} 人
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-member-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default MemberV2Page;
