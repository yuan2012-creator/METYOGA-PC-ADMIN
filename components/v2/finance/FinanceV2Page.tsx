import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildFinanceV2Snapshot,
  getCoverageToneClass,
  getEvidenceStatusClass,
  getFinanceHealthStatusClass,
  getMetricToneClass,
  getMonthlyChangeToneClass,
  getPlainLanguageTagClass,
  getPriorityClass,
  getStoreStatusClass,
  getSuggestionSourceClass,
  type AssetDetail,
  type AssetChangeQueue,
  type AssetChangeRequest,
  type AssetRiskItem,
  type FinanceDetail,
  type StoreFinanceRow,
} from './financeV2.viewModel';
import './financeV2.css';

type DrawerState =
  | { type: 'asset'; id: string }
  | { type: 'store'; id: string }
  | { type: 'finance_evidence' }
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

const FinanceV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildFinanceV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const showToast = useCallback((message: string) => {
    console.log('[FinanceV2]', message);
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

  const openAssetDrawer = useCallback((id: string) => {
    setDrawer({ type: 'asset', id });
  }, []);

  const openStoreDrawer = useCallback((id: string) => {
    setDrawer({ type: 'store', id });
  }, []);

  const openFinanceEvidenceDrawer = useCallback(() => {
    setDrawer({ type: 'finance_evidence' });
  }, []);

  const closeDrawer = useCallback(() => setDrawer(null), []);

  const drawerAsset: AssetDetail | null =
    drawer?.type === 'asset' ? snapshot.assetDetailMap[drawer.id] ?? null : null;

  const drawerFinance: FinanceDetail | null = useMemo(() => {
    if (!drawer) return null;
    if (drawer.type === 'finance_evidence') return snapshot.financeDetailMap['finance-evidence'] ?? null;
    if (drawer.type === 'store') return snapshot.financeDetailMap[`finance-${drawer.id}`] ?? null;
    return null;
  }, [drawer, snapshot.financeDetailMap]);

  const handleRiskAction = useCallback(
    (item: AssetRiskItem) => {
      showToast(item.toastMessage);
      if (item.relatedAssetId) openAssetDrawer(item.relatedAssetId);
      else if (item.relatedStoreId) openStoreDrawer(item.relatedStoreId);
    },
    [openAssetDrawer, openStoreDrawer, showToast],
  );

  const handleChangeRequest = useCallback(
    (req: AssetChangeRequest) => {
      if (req.relatedAssetId) openAssetDrawer(req.relatedAssetId);
      else showToast(`${req.actionLabel}（待建设）`);
    },
    [openAssetDrawer, showToast],
  );

  const {
    meta,
    filters,
    financeHealthSummary,
    financePriorityActions,
    financePlainLanguage,
    financeCoreMetrics,
    assetRiskQueue,
    assetChangeSummary,
    revenueEvidenceSummary,
    storeFinanceHealth,
    financeDetailEntries,
    assetChangeQueues,
  } = snapshot;

  const renderFinanceDrawer = (detail: FinanceDetail) => (
    <>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">财务指标</h3>
        {detail.metrics.map(row => (
          <div key={row.label} className="met-finance-v2-drawer__row">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">风险判断</h3>
        {detail.riskSummary.map(row => (
          <div key={row.label} className="met-finance-v2-drawer__row">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
        <ul className="met-finance-v2-drawer__list">
          {detail.suggestions.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <div className="met-finance-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
        {detail.actions.map(action => (
          <button
            key={action.label}
            type="button"
            className="met-v2-drawer-footer-btn"
            onClick={() => showToast(action.toastMessage)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderAssetDrawer = (detail: AssetDetail) => (
    <>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">资产概览</h3>
        {detail.overview.map(row => (
          <div key={row.label} className="met-finance-v2-drawer__row">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">财务口径</h3>
        {detail.financeMetrics.map(row => (
          <div key={row.label} className="met-finance-v2-drawer__row">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">合同与证据链</h3>
        {detail.contractEvidence.map(row => (
          <div key={row.label} className="met-finance-v2-drawer__row">
            <span>{row.label}</span>
            <span className={row.status === 'missing' ? 'is-warn' : ''}>{row.value}</span>
          </div>
        ))}
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">证据完整度</h3>
        <div className="met-finance-v2-evidence-tags">
          {detail.evidenceCompleteness.map(item => (
            <span
              key={item.key}
              className={['met-finance-v2-evidence-tag', getEvidenceStatusClass(item.status)].join(' ')}
            >
              {item.label}：{item.statusLabel}
            </span>
          ))}
        </div>
        <div className="met-finance-v2-drawer__row">
          <span>操作日志</span>
          <span>{detail.operationLogStatus}</span>
        </div>
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">处理建议</h3>
        <p className="met-finance-v2-drawer__suggestion">{detail.processingSuggestion.text}</p>
        <span className={['met-finance-v2-source-tag', getSuggestionSourceClass(detail.processingSuggestion.suggestionSource)].join(' ')}>
          {detail.processingSuggestion.suggestionSourceLabel}
        </span>
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">耗课与资产变更</h3>
        <ul className="met-finance-v2-drawer__list">
          {detail.activityRecords.map(rec => (
            <li key={rec.label}>{rec.label}</li>
          ))}
        </ul>
      </section>
      <section className="met-finance-v2-drawer__section">
        <h3 className="met-finance-v2-drawer__section-title">当前风险判断</h3>
        <div className="met-finance-v2-drawer__risk-tags">
          {detail.riskFlags.map(flag => (
            <span
              key={flag.label}
              className={['met-finance-v2-risk-tag', getMetricToneClass(flag.tone)].join(' ')}
            >
              {flag.label}
            </span>
          ))}
        </div>
      </section>
      <div className="met-finance-v2-drawer__actions met-v2-drawer-footer met-v2-drawer-footer--inline">
        {detail.actions.map(action => (
          <button
            key={action.label}
            type="button"
            className="met-v2-drawer-footer-btn"
            onClick={() => showToast(action.toastMessage)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </>
  );

  const renderChangeQueue = (queue: AssetChangeQueue) => (
    <div key={queue.id} className={`met-finance-v2-change-col is-${queue.type}`}>
      <div className="met-finance-v2-change-col__head">
        <h4 className="met-finance-v2-change-col__title">{queue.typeLabel}</h4>
        <p className="met-finance-v2-change-col__summary">{queue.summary.pending}</p>
        <p className="met-finance-v2-change-col__detail">{queue.summary.detail1}</p>
        <p className="met-finance-v2-change-col__detail">{queue.summary.detail2}</p>
        <p className="met-finance-v2-change-col__detail">{queue.summary.detail3}</p>
        <button
          type="button"
          className="met-finance-v2-btn met-finance-v2-btn--sm"
          onClick={() => showToast(queue.toastMessage)}
        >
          {queue.actionLabel}
        </button>
      </div>
      <div className="met-finance-v2-change-col__cards">
        {queue.requests.map(req => {
          const isIncomplete = req.completenessScore !== '4/4';
          return (
          <div
            key={req.id}
            className={['met-finance-v2-change-card', isIncomplete ? 'is-incomplete' : ''].filter(Boolean).join(' ')}
            role="button"
            tabIndex={0}
            onClick={() => handleChangeRequest(req)}
            onKeyDown={e => { if (e.key === 'Enter') handleChangeRequest(req); }}
          >
            <p className="met-finance-v2-change-card__name">{req.memberName}</p>
            <p className="met-finance-v2-change-card__meta">{req.cardName} · 剩余 {req.remainingPoints}</p>
            <p className="met-finance-v2-change-card__reason">{req.reason}</p>
            <div className="met-finance-v2-change-card__evidence">
              {req.evidenceCompleteness.map(ev => (
                <span
                  key={ev.key}
                  className={['met-finance-v2-evidence-dot', getEvidenceStatusClass(ev.status)].join(' ')}
                  title={`${ev.label}：${ev.statusLabel}`}
                >
                  {ev.label}
                </span>
              ))}
            </div>
            <p className="met-finance-v2-change-card__score">
              证据完整度：{req.completenessScore}
            </p>
            <div className="met-finance-v2-change-card__foot">
              <span className="met-finance-v2-change-card__status">{req.status}</span>
              <button
                type="button"
                className="met-finance-v2-btn met-finance-v2-btn--sm"
                onClick={e => { e.stopPropagation(); handleChangeRequest(req); }}
              >
                {req.actionLabel}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );

  const renderStoreRow = (store: StoreFinanceRow) => (
    <div
      key={store.id}
      className={[
        'met-finance-v2-store-row',
        store.coverageTone === 'warning' || store.coverageTone === 'danger' ? 'is-low-coverage' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="met-finance-v2-store-row__identity">
        <p className="met-finance-v2-store-row__name">{store.storeName}</p>
        <span className={['met-finance-v2-store-status', getStoreStatusClass(store.statusLevel)].join(' ')}>
          {store.statusLabel}
        </span>
      </div>
      <div className="met-finance-v2-store-row__metrics">
        <div className="met-finance-v2-store-metric">
          <span className="met-finance-v2-store-metric__label">确认收入</span>
          <span className="met-finance-v2-store-metric__value">{store.confirmedRevenue}</span>
        </div>
        <div className="met-finance-v2-store-metric">
          <span className="met-finance-v2-store-metric__label">实收</span>
          <span className="met-finance-v2-store-metric__value">{store.cashReceived}</span>
        </div>
        <div className="met-finance-v2-store-metric">
          <span className="met-finance-v2-store-metric__label">预收负债</span>
          <span className="met-finance-v2-store-metric__value">{store.prepaidLiability}</span>
        </div>
        <div className="met-finance-v2-store-metric">
          <span className="met-finance-v2-store-metric__label">经营利润</span>
          <span className={['met-finance-v2-store-metric__value', store.operatingProfitValue < 0 ? 'is-loss' : ''].filter(Boolean).join(' ')}>
            {store.operatingProfit}
          </span>
        </div>
        <div className="met-finance-v2-store-metric met-finance-v2-store-metric--coverage">
          <span className="met-finance-v2-store-metric__label">现金安全覆盖率</span>
          <span className={['met-finance-v2-store-metric__value', getCoverageToneClass(store.coverageTone)].join(' ')}>
            {store.cashSafetyCoverage}
          </span>
          <div className="met-finance-v2-coverage-bar">
            <div
              className={['met-finance-v2-coverage-bar__fill', getCoverageToneClass(store.coverageTone)].join(' ')}
              style={{ width: `${store.cashSafetyCoveragePercent}%` }}
            />
            <span className="met-finance-v2-coverage-bar__marker" aria-hidden />
          </div>
        </div>
      </div>
      <div className="met-finance-v2-store-row__action">
        <div className="met-finance-v2-trend-summary">
          <p className="met-finance-v2-trend-summary__line met-finance-v2-trend-coverage">
            <span className="met-finance-v2-trend-summary__label">覆盖率</span>
            <span className="met-finance-v2-trend-summary__value">
              {store.monthlyChangeSummary.coveragePercent}，
              <span className={getMonthlyChangeToneClass(store.monthlyChangeSummary.coverageTone)}>
                {store.monthlyChangeSummary.coverageChange}
              </span>
            </span>
          </p>
          <p className="met-finance-v2-trend-summary__line">
            <span className="met-finance-v2-trend-summary__label">关键变化</span>
            <span className={['met-finance-v2-trend-key-change', getMonthlyChangeToneClass(store.monthlyChangeSummary.keyChangeTone)].join(' ')}>
              {store.monthlyChangeSummary.keyChange}
            </span>
          </p>
          <p className="met-finance-v2-trend-summary__line met-finance-v2-trend-judgement">
            <span className="met-finance-v2-trend-summary__label">判断</span>
            <span>{store.monthlyChangeSummary.judgement}</span>
          </p>
        </div>
        <button
          type="button"
          className="met-finance-v2-btn met-finance-v2-btn--sm"
          onClick={() => openStoreDrawer(store.id)}
        >
          {store.actionLabel}
        </button>
      </div>
    </div>
  );

  const drawerHasContent = Boolean(drawerAsset || drawerFinance);
  const drawerTitle = drawerAsset?.title ?? drawerFinance?.title ?? '暂无详情';
  const drawerSubtitle =
    drawerAsset?.subtitle ?? drawerFinance?.subtitle ?? (drawerHasContent ? '' : '当前记录缺少详情数据');

  return (
    <div className="met-finance-v2">
      <div className="met-finance-v2__inner">
        <header className="met-finance-v2__header">
          <div className="met-finance-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-finance-v2__header-actions">
            <div className="met-finance-v2__filters">
              <button
                type="button"
                className="met-finance-v2__filter-btn"
                onClick={() => handleAction('切换门店筛选')}
              >
                门店：{filters.storeLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-finance-v2__filter-btn"
                onClick={() => handleAction('切换周期筛选')}
              >
                周期：{filters.periodLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-finance-v2__filter-btn"
                onClick={() => handleAction('切换收款类型筛选')}
              >
                收款类型：{filters.paymentTypeLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-finance-v2__filter-btn"
                onClick={() => handleAction('切换资产状态筛选')}
              >
                资产状态：{filters.assetStatusLabel}
                <ChevronDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                className="met-finance-v2__filter-btn met-finance-v2__filter-btn--ghost"
                onClick={() => showToast('进入财务规则（待建设）')}
              >
                {filters.secondaryActionLabel}
              </button>
              <button
                type="button"
                className="met-finance-v2__filter-btn met-finance-v2__filter-btn--ghost"
                onClick={() => showToast('导出财务报告（待建设）')}
              >
                {filters.primaryActionLabel}
              </button>
            </div>
            <button
              type="button"
              className="met-finance-v2__detail-link"
              onClick={() => showToast('进入收支明细二级页（待建设）')}
            >
              {filters.detailLinkLabel}
            </button>
          </div>
        </header>

        {/* 1. 财务与资产健康结论 */}
        <section className="met-finance-v2-zone met-finance-v2-zone--hero">
          <article className="met-finance-v2-panel met-finance-v2-panel--hero">
            <div className="met-finance-v2-hero__head">
              <h2 className="met-finance-v2-hero__headline">{financeHealthSummary.headline}</h2>
              <span
                className={[
                  'met-finance-v2-status',
                  getFinanceHealthStatusClass(financeHealthSummary.status),
                ].join(' ')}
              >
                {financeHealthSummary.statusLabel}
              </span>
            </div>
            <p className="met-finance-v2-hero__text">{financeHealthSummary.conclusion}</p>
            <div className="met-finance-v2-hero__tags">
              {financeHealthSummary.impactTags.map(tag => (
                <span key={tag} className="met-finance-v2-tag met-finance-v2-tag--impact">{tag}</span>
              ))}
              <span className="met-finance-v2-tag met-finance-v2-tag--source">
                {financeHealthSummary.sourceLabel}
              </span>
            </div>
            <p className="met-finance-v2-hero__meta">
              最近更新：{financeHealthSummary.updatedAt}
            </p>
            <div className="met-finance-v2-evidence-grid met-finance-v2-evidence-grid--hero">
              {financeHealthSummary.evidenceItems.map(item => (
                <div
                  key={item.label}
                  className={[
                    'met-finance-v2-evidence-item',
                    item.isWarning ? 'is-warning' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="met-finance-v2-evidence-item__value">{item.value}</span>
                  <span className="met-finance-v2-evidence-item__label">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="met-finance-v2-hero__actions">
              <button
                type="button"
                className="met-finance-v2-btn met-finance-v2-btn--ghost"
                onClick={() => showToast(financeHealthSummary.evidenceToastMessage)}
              >
                {financeHealthSummary.evidenceButtonLabel}
              </button>
            </div>
          </article>
        </section>

        {/* 2. 本周财务优先动作 */}
        <section className="met-finance-v2-zone met-finance-v2-zone--priority">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{financePriorityActions.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{financePriorityActions.subtitle}</p>
          </header>
          <div className="met-finance-v2-action-queue">
            {financePriorityActions.items.map(item => (
              <div
                key={item.id}
                className={`met-finance-v2-action-item met-finance-v2-action-item--${item.priority.toLowerCase()}`}
              >
                <span className={['met-finance-v2-priority', getPriorityClass(item.priority)].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-finance-v2-action-item__main">
                  <p className="met-finance-v2-action-item__title">{item.title}</p>
                  <p className="met-finance-v2-action-item__meta">
                    影响：{item.impact} · 负责人：{item.owner} · 来源：
                    {item.sourceModules.join(' / ')}
                  </p>
                  <p className="met-finance-v2-action-item__action">建议动作：{item.suggestedAction}</p>
                </div>
                <button
                  type="button"
                  className="met-finance-v2-btn met-finance-v2-btn--sm met-finance-v2-btn--ghost"
                  onClick={() => showToast(item.ctaToast)}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 财务口径人话解释 */}
        <section className="met-finance-v2-zone met-finance-v2-zone--plain">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{financePlainLanguage.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{financePlainLanguage.subtitle}</p>
          </header>
          <div className="met-finance-v2-plain-grid">
            {financePlainLanguage.cards.map(card => (
              <article
                key={card.id}
                className={['met-finance-v2-plain-card', getPlainLanguageTagClass(card.tag)].join(' ')}
              >
                <span className="met-finance-v2-plain-card__tag">{card.title}</span>
                <p className="met-finance-v2-plain-card__explain">{card.plainExplanation}</p>
                <p className="met-finance-v2-plain-card__value">{card.currentValue}</p>
                <p className="met-finance-v2-plain-card__note">{card.warningNote}</p>
              </article>
            ))}
          </div>
          <p className="met-finance-v2-coverage-alert">{financePlainLanguage.coverageAlert}</p>
        </section>

        {/* 4. 核心财务指标 */}
        <section className="met-finance-v2-zone met-finance-v2-zone--metrics">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{financeCoreMetrics.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{financeCoreMetrics.subtitle}</p>
          </header>
          <div className="met-finance-v2-core-metrics">
            {financeCoreMetrics.items.map(metric => (
              <button
                key={metric.id}
                type="button"
                className={['met-finance-v2-core-metric', getMetricToneClass(metric.tone)].join(' ')}
                onClick={() => showToast(metric.toastMessage)}
              >
                <div className="met-finance-v2-core-metric__head">
                  <span className="met-finance-v2-core-metric__title">{metric.title}</span>
                  <span className="met-finance-v2-core-metric__status">{metric.statusLabel}</span>
                </div>
                <p className="met-finance-v2-core-metric__value">{metric.value}</p>
                <p className="met-finance-v2-core-metric__change">{metric.changeLabel}</p>
                <p className="met-finance-v2-core-metric__explain">{metric.explanation}</p>
                <span className="met-finance-v2-core-metric__source">{metric.sourceModule}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 5. 会员资产风险队列 */}
        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{assetRiskQueue.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{assetRiskQueue.subtitle}</p>
          </header>
          <div className="met-finance-v2-risk-list">
            {assetRiskQueue.items.map(item => (
              <div key={item.id} className={['met-finance-v2-risk-row', `met-finance-v2-risk-row--${item.priority.toLowerCase()}`].join(' ')}>
                <span className={['met-finance-v2-priority', getPriorityClass(item.priority)].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-finance-v2-risk-row__main">
                  <p className="met-finance-v2-risk-row__title">{item.title}</p>
                  {item.memberMasked ? (
                    <p className="met-finance-v2-risk-row__member">{item.memberMasked}</p>
                  ) : null}
                  <p className="met-finance-v2-risk-row__fact">{item.fact}</p>
                  <p className="met-finance-v2-risk-row__impact">
                    <span className="met-finance-v2-risk-row__impact-tag">影响：{item.impact}</span>
                    {item.amountImpact ? (
                      <span className="met-finance-v2-risk-row__impact-tag">金额 / 权益：{item.amountImpact}</span>
                    ) : null}
                  </p>
                  <div className="met-finance-v2-risk-row__meta">
                    {item.riskType ? <span>风险类型：{item.riskType}</span> : null}
                    {item.assetStatus ? <span>资产状态：{item.assetStatus}</span> : null}
                    {item.evidenceCompleteness ? (
                      <span>证据完整度：{item.evidenceCompleteness}</span>
                    ) : null}
                  </div>
                  <p className="met-finance-v2-risk-row__action">{item.suggestionAction}</p>
                </div>
                <div className="met-finance-v2-risk-row__aside">
                  <span className={['met-finance-v2-source-tag', getSuggestionSourceClass(item.suggestionSource)].join(' ')}>
                    {item.suggestionSourceLabel}
                  </span>
                  <button
                    type="button"
                    className="met-finance-v2-btn met-finance-v2-btn--sm"
                    onClick={() => handleRiskAction(item)}
                  >
                    {item.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* 6. 退款 / 冻结 / 转卡处理 */}
        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{assetChangeSummary.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{assetChangeSummary.subtitle}</p>
          </header>
          <div className="met-finance-v2-change-summary">
            {assetChangeSummary.items.map(item => (
              <div key={item.id} className={`met-finance-v2-change-summary-card is-${item.type}`}>
                <h4 className="met-finance-v2-change-summary-card__title">{item.typeLabel}</h4>
                <p className="met-finance-v2-change-summary-card__pending">{item.pendingCount}</p>
                <p className="met-finance-v2-change-summary-card__amount">{item.amountSummary}</p>
                <p className="met-finance-v2-change-summary-card__risk">{item.riskNote}</p>
                <button
                  type="button"
                  className="met-finance-v2-btn met-finance-v2-btn--sm"
                  onClick={() => showToast(item.ctaToast)}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
          <div className="met-finance-v2-change-layout">
            {assetChangeQueues.map(renderChangeQueue)}
          </div>
        </article>

        {/* 7. 收入确认与耗课证据 */}
        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{revenueEvidenceSummary.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{revenueEvidenceSummary.subtitle}</p>
          </header>
          <div className="met-finance-v2-evidence-summary">
            {revenueEvidenceSummary.items.map(item => (
              <div key={item.id} className="met-finance-v2-evidence-summary-item">
                <div className="met-finance-v2-evidence-summary-item__main">
                  <p className="met-finance-v2-evidence-summary-item__type">{item.type}</p>
                  <p className="met-finance-v2-evidence-summary-item__count">{item.count}</p>
                  <p className="met-finance-v2-evidence-summary-item__impact">影响：{item.impact}</p>
                  <p className="met-finance-v2-evidence-summary-item__action">{item.suggestedAction}</p>
                </div>
                <button
                  type="button"
                  className="met-finance-v2-btn met-finance-v2-btn--sm met-finance-v2-btn--ghost"
                  onClick={() => showToast(item.ctaToast)}
                >
                  {item.ctaLabel}
                </button>
              </div>
            ))}
          </div>
        </article>

        {/* 8. 门店财务健康矩阵 */}
        <article className="met-finance-v2-zone met-finance-v2-zone--demoted">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{storeFinanceHealth.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{storeFinanceHealth.subtitle}</p>
          </header>
          {storeFinanceHealth.replayNote ? (
            <p className="met-finance-v2-replay-note">{storeFinanceHealth.replayNote}</p>
          ) : null}
          <div className="met-finance-v2-store-matrix">
            {storeFinanceHealth.stores.map(renderStoreRow)}
          </div>
        </article>

        {/* 9. 财务明细入口 */}
        <article className="met-finance-v2-zone met-finance-v2-zone--entries">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{financeDetailEntries.title}</h2>
          </header>
          <div className="met-finance-v2-detail-entries">
            {financeDetailEntries.items.map(entry => (
              <button
                key={entry.id}
                type="button"
                className="met-finance-v2-detail-entry"
                onClick={() => {
                  if (entry.label === '查看财务证据链') {
                    openFinanceEvidenceDrawer();
                    return;
                  }
                  showToast(entry.toastMessage);
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </article>
      </div>

      {drawer ? (
        <>
          <button type="button" className="met-finance-v2-drawer-overlay met-v2-drawer-overlay" aria-label="关闭详情" onClick={closeDrawer} />
          <aside className="met-finance-v2-drawer met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog" aria-labelledby="finance-v2-drawer-title">
            <div className="met-finance-v2-drawer__head met-v2-drawer-header">
              <div>
                <h2 id="finance-v2-drawer-title" className="met-finance-v2-drawer__title met-v2-drawer-title">{drawerTitle}</h2>
                {drawerSubtitle ? (
                  <p className="met-finance-v2-drawer__subtitle met-v2-drawer-subtitle">{drawerSubtitle}</p>
                ) : null}
              </div>
              <button type="button" className="met-finance-v2-drawer__close met-v2-drawer-close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-finance-v2-drawer__body met-v2-drawer-body">
              {drawerHasContent ? (
                <>
                  {drawerAsset ? renderAssetDrawer(drawerAsset) : null}
                  {drawerFinance ? renderFinanceDrawer(drawerFinance) : null}
                </>
              ) : (
                <V2DrawerEmpty onClose={closeDrawer} />
              )}
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-finance-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default FinanceV2Page;
