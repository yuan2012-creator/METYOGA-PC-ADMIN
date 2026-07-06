import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildMemberV2Snapshot,
  getMemberOperationStatusClass,
  type MemberV2AudienceMatchPreview,
  type MemberV2LifecycleStage,
  type MemberV2MemberDetail,
  type MemberV2RiskPriority,
  type MemberV2SuggestionSource,
} from './memberV2.viewModel';
import MemberSecondaryMemberListPage from './MemberSecondaryMemberListPage';
import MemberSecondaryHighBalancePage from './MemberSecondaryHighBalancePage';
import { DrawerEmptyState } from '../shared';
import './memberV2.css';

type MemberV2ViewMode = 'overview' | 'memberList' | 'highBalance';

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
  const [viewMode, setViewMode] = useState<MemberV2ViewMode>('overview');
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

  const openMemberList = useCallback(() => {
    setViewMode('memberList');
  }, []);

  const openHighBalance = useCallback(() => {
    setViewMode('highBalance');
  }, []);

  const backToOverview = useCallback(() => {
    setViewMode('overview');
  }, []);

  const openSecondary = useCallback(
    (key: string) => {
      if (key === 'member_list' || key === 'risk_list') {
        openMemberList();
        return;
      }
      if (key === 'high_balance_list') {
        openHighBalance();
        return;
      }
      const entrance = snapshot.secondaryEntrances.find(item => item.key === key);
      showToast(`进入 ${entrance?.label ?? key} 二级页（待建设）`);
    },
    [openHighBalance, openMemberList, showToast, snapshot.secondaryEntrances],
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

  const handleStageSelect = useCallback(() => {
    openMemberList();
  }, [openMemberList]);

  const {
    meta,
    memberOperationSummary,
    memberPriorityActions,
    serviceSalesQueues,
    lifecycleFlow,
    audienceMatchPacks,
    riskGraph,
    keyMemberEntrances,
  } = snapshot;

  const growthStages = lifecycleFlow.stages.filter(stage => stage.zone === 'growth');
  const riskStages = lifecycleFlow.stages.filter(stage => stage.zone === 'risk');

  return (
    <div className="met-member-v2">
      {viewMode === 'memberList' ? (
        <MemberSecondaryMemberListPage
          onBack={backToOverview}
          onOpenDetail={openDetail}
          onOpenHighBalance={openHighBalance}
          onToast={showToast}
        />
      ) : viewMode === 'highBalance' ? (
        <MemberSecondaryHighBalancePage
          onBackToOverview={backToOverview}
          onBackToMemberList={openMemberList}
          onOpenDetail={openDetail}
          onToast={showToast}
        />
      ) : (
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
              onClick={openMemberList}
            >
              {meta.filters.memberListLabel}
            </button>
            <button
              type="button"
              className="met-member-v2__filter-btn met-member-v2__filter-btn--link"
              onClick={openHighBalance}
            >
              {meta.filters.highBalanceListLabel}
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

        {/* 1. 会员经营结论 */}
        <section className="met-member-v2__zone met-member-v2__zone--hero">
          <article className="met-member-v2-card met-member-v2-card--conclusion">
            <div className="met-member-v2-conclusion__head">
              <h2 className="met-member-v2-conclusion__headline">{memberOperationSummary.headline}</h2>
              <span
                className={[
                  'met-member-v2-status',
                  getMemberOperationStatusClass(memberOperationSummary.status),
                ].join(' ')}
              >
                {memberOperationSummary.statusLabel}
              </span>
            </div>
            <p className="met-member-v2-conclusion__text">{memberOperationSummary.conclusion}</p>
            <div className="met-member-v2-conclusion__tags">
              {memberOperationSummary.impactTags.map(tag => (
                <span key={tag} className="met-member-v2-conclusion__tag met-member-v2-conclusion__tag--impact">
                  {tag}
                </span>
              ))}
              <span className="met-member-v2-conclusion__tag met-member-v2-conclusion__tag--source">
                {memberOperationSummary.sourceLabel}
              </span>
            </div>
            <p className="met-member-v2-conclusion__meta">
              最近更新：{memberOperationSummary.updatedAt}
            </p>
            <div className="met-member-v2-evidence-grid">
              {memberOperationSummary.evidenceItems.map(item => (
                <button
                  key={item.label}
                  type="button"
                  className={[
                    'met-member-v2-evidence-item',
                    item.isWarning ? 'is-warning' : '',
                    item.label.includes('高余额低耗课') ? 'is-clickable' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (item.label.includes('高余额低耗课')) {
                      openHighBalance();
                    }
                  }}
                >
                  <span className="met-member-v2-evidence-item__value">{item.value}</span>
                  <span className="met-member-v2-evidence-item__label">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="met-member-v2-conclusion__actions">
              <button
                type="button"
                className="met-member-v2-btn met-member-v2-btn--ghost"
                onClick={() => showToast(memberOperationSummary.evidenceToastMessage)}
              >
                {memberOperationSummary.evidenceButtonLabel}
              </button>
            </div>
          </article>
        </section>

        {/* 2. 今日会员优先动作 */}
        <section className="met-member-v2__zone met-member-v2__zone--priority">
          <header className="met-member-v2-zone__head">
            <h2 className="met-member-v2-zone__title">{memberPriorityActions.title}</h2>
            <p className="met-member-v2-zone__subtitle">{memberPriorityActions.subtitle}</p>
          </header>
          <div className="met-member-v2-action-queue">
            {memberPriorityActions.items.map(item => (
              <div
                key={item.id}
                className={`met-member-v2-action-item met-member-v2-action-item--${item.priority.toLowerCase()}`}
              >
                <span className={['met-member-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-member-v2-action-item__main">
                  <p className="met-member-v2-action-item__title">{item.title}</p>
                  <p className="met-member-v2-action-item__meta">
                    影响：{item.impact} · 负责人：{item.owner} · 来源：
                    {item.sourceModules.join(' / ')}
                  </p>
                  <p className="met-member-v2-action-item__action">建议动作：{item.suggestedAction}</p>
                </div>
                <button
                  type="button"
                  className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                  onClick={() => {
                    if (item.opensHighBalance) {
                      openHighBalance();
                      return;
                    }
                    if (item.opensMemberList) {
                      openMemberList();
                      return;
                    }
                    showToast(item.ctaToast);
                  }}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 服务与销售队列 */}
        <section className="met-member-v2__zone met-member-v2__zone--queues">
          <header className="met-member-v2-zone__head">
            <h2 className="met-member-v2-zone__title">{serviceSalesQueues.title}</h2>
            <p className="met-member-v2-zone__subtitle">{serviceSalesQueues.subtitle}</p>
          </header>
          <div className="met-member-v2__row-queues">
            <article className="met-member-v2-card met-member-v2-card--queue met-member-v2-card--queue-service">
              <h3 className="met-member-v2-card__title met-member-v2-card__title--sub">{serviceSalesQueues.serviceTitle}</h3>
              <div className="met-member-v2-queue-summary">
                {serviceSalesQueues.serviceItems.map(item => (
                  <div
                    key={item.id}
                    className={`met-member-v2-queue-item met-member-v2-queue-item--${item.priority.toLowerCase()}`}
                  >
                    <div className="met-member-v2-queue-item__main">
                      <div className="met-member-v2-queue-item__head">
                        <span className={['met-member-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                          {item.priority}
                        </span>
                        <span className="met-member-v2-queue-item__title">{item.title}</span>
                        <span className="met-member-v2-queue-item__count">{item.count} 人</span>
                      </div>
                      <p className="met-member-v2-queue-item__members">
                        代表会员：{item.representativeMembers}
                      </p>
                      <p className="met-member-v2-queue-item__action">{item.suggestedAction}</p>
                    </div>
                    <button
                      type="button"
                      className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                      onClick={() => {
                        if (item.opensHighBalance) {
                          openHighBalance();
                          return;
                        }
                        showToast(item.ctaToast);
                      }}
                    >
                      {item.ctaLabel}
                    </button>
                  </div>
                ))}
              </div>
              <div className="met-member-v2-card__footer-link">
                <button
                  type="button"
                  className="met-member-v2-link-btn"
                  onClick={() => openSecondary(serviceSalesQueues.serviceViewAllKey)}
                >
                  {serviceSalesQueues.serviceViewAllLabel}
                </button>
              </div>
            </article>

            <article className="met-member-v2-card met-member-v2-card--queue met-member-v2-card--queue-sales">
              <h3 className="met-member-v2-card__title met-member-v2-card__title--sub">{serviceSalesQueues.salesTitle}</h3>
              <div className="met-member-v2-queue-summary">
                {serviceSalesQueues.salesItems.map(item => (
                  <div
                    key={item.id}
                    className={`met-member-v2-queue-item met-member-v2-queue-item--${item.priority.toLowerCase()}`}
                  >
                    <div className="met-member-v2-queue-item__main">
                      <div className="met-member-v2-queue-item__head">
                        <span className={['met-member-v2-priority', PRIORITY_CLASS[item.priority]].join(' ')}>
                          {item.priority}
                        </span>
                        <span className="met-member-v2-queue-item__title">{item.title}</span>
                        <span className="met-member-v2-queue-item__count">{item.count} 人</span>
                      </div>
                      <p className="met-member-v2-queue-item__members">
                        代表会员：{item.representativeMembers}
                      </p>
                      <p className="met-member-v2-queue-item__action">{item.suggestedAction}</p>
                    </div>
                    <button
                      type="button"
                      className="met-member-v2-btn met-member-v2-btn--ghost met-member-v2-btn--sm"
                      onClick={() => {
                        if (item.opensHighBalance) {
                          openHighBalance();
                          return;
                        }
                        showToast(item.ctaToast);
                      }}
                    >
                      {item.ctaLabel}
                    </button>
                  </div>
                ))}
              </div>
              <div className="met-member-v2-card__footer-link">
                <button
                  type="button"
                  className="met-member-v2-link-btn"
                  onClick={() => openSecondary(serviceSalesQueues.salesViewAllKey)}
                >
                  {serviceSalesQueues.salesViewAllLabel}
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* 4. 会员生命周期分布 */}
        <section className="met-member-v2__zone met-member-v2__zone--lifecycle">
          <article className="met-member-v2-card met-member-v2-card--flow">
            <h2 className="met-member-v2-card__title">{lifecycleFlow.title}</h2>
            <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
              {lifecycleFlow.subtitle}
            </p>
            {lifecycleFlow.riskFocusNote ? (
              <p className="met-member-v2-lifecycle-note">{lifecycleFlow.riskFocusNote}</p>
            ) : null}
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
        </section>

        {/* 5. 精准人群匹配 */}
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
                </div>
                <div className="met-member-v2-pack__fields">
                  <div className="met-member-v2-pack__field">
                    <span>适合动作</span>
                    <strong>{pack.scene}</strong>
                  </div>
                </div>
                <div className="met-member-v2-pack__excludes">
                  <span className="met-member-v2-pack__exclude-label">排除规则</span>
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

        {/* 6. 会员风险图谱 */}
        <article className="met-member-v2-card met-member-v2-card--risk-graph">
          <h2 className="met-member-v2-card__title">{riskGraph.title}</h2>
          <p className="met-member-v2-card__subtitle met-member-v2-card__subtitle--compact">
            {riskGraph.subtitle}
          </p>
          {riskGraph.replayNote ? (
            <p className="met-member-v2-risk-replay-note">{riskGraph.replayNote}</p>
          ) : null}
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
                      if (item.opensHighBalance) {
                        openHighBalance();
                        return;
                      }
                      if (item.actionLabel === '查看名单') {
                        openSecondary('risk_list');
                        return;
                      }
                      showToast(`${item.actionLabel}（待建设）`);
                    }}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* 7. 重点会员 */}
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
      )}

      {drawerMemberId ? (
        <>
          <button
            type="button"
            className="met-member-v2-drawer-overlay met-v2-drawer-overlay"
            aria-label="关闭会员详情"
            onClick={closeAllDrawers}
          />
          <aside className="met-member-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--sm" role="dialog" aria-labelledby="member-v2-drawer-title">
            <div className="met-member-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2 id="member-v2-drawer-title" className="met-member-v2-drawer__title met-v2-drawer-title">
                  会员详情
                </h2>
                {drawerDetail ? (
                  <p className="met-member-v2-drawer__hero met-v2-drawer-subtitle">
                    {drawerDetail.name} · {drawerDetail.stageLabel}
                  </p>
                ) : (
                  <p className="met-member-v2-drawer__hero met-v2-drawer-subtitle">当前记录缺少详情数据</p>
                )}
              </div>
              <button
                type="button"
                className="met-member-v2-drawer__close met-v2-drawer-close"
                aria-label="关闭"
                onClick={closeAllDrawers}
              >
                ×
              </button>
            </div>
            <div className="met-member-v2-drawer__body met-v2-drawer-body">
              {drawerDetail ? (
                <>
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
                {drawerDetail.evidenceChain ? (
                  <>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">购买记录</span>
                      <span className="met-member-v2-drawer__row-value">
                        {drawerDetail.evidenceChain.purchaseSummary}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">耗课记录</span>
                      <span className="met-member-v2-drawer__row-value">
                        {drawerDetail.evidenceChain.consumptionSummary}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">签到记录</span>
                      <span className="met-member-v2-drawer__row-value">
                        {drawerDetail.evidenceChain.checkinSummary}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">合同与赠送权益</span>
                      <span className="met-member-v2-drawer__row-value">
                        {drawerDetail.evidenceChain.contractNote}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">积分流水</span>
                      <span className="met-member-v2-drawer__row-value">
                        {drawerDetail.evidenceChain.pointsFlowSummary}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">最近沟通</span>
                      <span className="met-member-v2-drawer__row-value">
                        {drawerDetail.evidenceChain.communicationSummary}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">金额估算说明</span>
                      <span className="met-member-v2-drawer__row-value met-member-v2-drawer__row-value--note">
                        {drawerDetail.evidenceChain.amountEstimateNote}
                      </span>
                    </div>
                    <div className="met-member-v2-drawer__row">
                      <span className="met-member-v2-drawer__row-label">建议下一动作</span>
                      <span className="met-member-v2-drawer__row-value">{drawerDetail.nextPlan}</span>
                    </div>
                  </>
                ) : null}
              </section>
                </>
              ) : (
                <DrawerEmptyState
                  description="当前记录缺少详情数据，请检查 mock 配置"
                  onClose={closeAllDrawers}
                />
              )}
            </div>
            {drawerDetail ? (
              <div className="met-v2-drawer-footer">
                <button type="button" className="met-v2-drawer-footer-btn" onClick={() => handleAction('记录跟进')}>
                  记录跟进
                </button>
                <button type="button" className="met-v2-drawer-footer-btn" onClick={() => handleAction('分配邀约')}>
                  分配邀约
                </button>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}

      {matchPreviewId ? (
        <>
          <button
            type="button"
            className="met-member-v2-drawer-overlay met-v2-drawer-overlay"
            aria-label="关闭匹配名单预览"
            onClick={closeAllDrawers}
          />
          <aside
            className="met-member-v2-drawer met-member-v2-drawer--match met-v2-drawer-panel met-v2-drawer-panel--md"
            role="dialog"
            aria-labelledby="member-v2-match-drawer-title"
          >
            <div className="met-member-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2 id="member-v2-match-drawer-title" className="met-member-v2-drawer__title met-v2-drawer-title">
                  {matchPreview?.title ?? '暂无详情'}
                </h2>
                {matchPreview?.subtitle ? (
                  <p className="met-member-v2-drawer__subtitle met-v2-drawer-subtitle">{matchPreview.subtitle}</p>
                ) : (
                  <p className="met-member-v2-drawer__subtitle met-v2-drawer-subtitle">当前记录缺少详情数据</p>
                )}
              </div>
              <button
                type="button"
                className="met-member-v2-drawer__close met-v2-drawer-close"
                aria-label="关闭"
                onClick={closeAllDrawers}
              >
                ×
              </button>
            </div>
            <div className="met-member-v2-drawer__body met-v2-drawer-body">
              {matchPreview ? (
                <>
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
              <section className="met-member-v2-drawer__section">
                <h3 className="met-member-v2-drawer__section-title">已排除会员</h3>
                <p className="met-member-v2-excluded__title">{matchPreview.excludedSummary}</p>
                <ul className="met-member-v2-excluded__list">
                  {matchPreview.excludedReasons.map(reason => (
                    <li key={reason.label}>
                      {reason.label}：{reason.count} 人
                    </li>
                  ))}
                </ul>
              </section>
                </>
              ) : (
                <DrawerEmptyState
                  description="当前记录缺少详情数据，请检查 mock 配置"
                  onClose={closeAllDrawers}
                />
              )}
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-member-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default MemberV2Page;
