import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  buildFinanceV2Snapshot,
  getCoverageToneClass,
  getEvidenceStatusClass,
  getFlowStepToneClass,
  getLiabilityBreakdownToneClass,
  getMetricToneClass,
  getMonthlyChangeToneClass,
  getPriorityClass,
  getStoreStatusClass,
  getSuggestionSourceClass,
  type AssetDetail,
  type AssetChangeQueue,
  type AssetChangeRequest,
  type AssetRiskItem,
  type FinanceDetail,
  type RevenueEvidenceTask,
  type StoreFinanceRow,
} from './financeV2.viewModel';
import './financeV2.css';

type DrawerState =
  | { type: 'asset'; id: string }
  | { type: 'store'; id: string }
  | { type: 'finance_evidence' }
  | null;

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

  const handleEvidenceTask = useCallback(
    (task: RevenueEvidenceTask) => {
      showToast(task.toastMessage);
    },
    [showToast],
  );

  const {
    meta,
    filters,
    healthSummary,
    cashSafety,
    financialStructure,
    storeFinanceHealth,
    assetRiskQueue,
    revenueRecognition,
    assetChangeQueues,
    paymentSettlement,
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
      <div className="met-finance-v2-drawer__actions">
        {detail.actions.map(action => (
          <button
            key={action.label}
            type="button"
            className="met-finance-v2-btn"
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
      <div className="met-finance-v2-drawer__actions">
        {detail.actions.map(action => (
          <button
            key={action.label}
            type="button"
            className="met-finance-v2-btn"
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
    <div key={store.id} className="met-finance-v2-store-row">
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

  const drawerTitle = drawerAsset?.title ?? drawerFinance?.title ?? '';
  const drawerSubtitle = drawerAsset?.subtitle ?? drawerFinance?.subtitle ?? '';

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
                className="met-finance-v2__filter-btn met-finance-v2__filter-btn--primary"
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

        <section className="met-finance-v2-zone met-finance-v2-zone--health">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{healthSummary.section.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{healthSummary.section.subtitle}</p>
          </header>
          <div className="met-finance-v2-health-layout">
            <div className="met-finance-v2-panel met-finance-v2-panel--conclusion">
              <h3 className="met-finance-v2-panel__title">{healthSummary.title}</h3>
              <p className="met-finance-v2-conclusion">{healthSummary.conclusion}</p>
              <p className="met-finance-v2-conclusion-desc">{healthSummary.description}</p>
              <div className="met-finance-v2-tags">
                {healthSummary.statusTags.map(tag => (
                  <span key={tag} className="met-finance-v2-tag met-finance-v2-tag--warn">{tag}</span>
                ))}
                <span className={['met-finance-v2-source-tag', getSuggestionSourceClass(healthSummary.suggestionSource)].join(' ')}>
                  {healthSummary.suggestionSourceLabel}
                </span>
              </div>
              <div className="met-finance-v2-evidence-grid">
                {healthSummary.evidence.map(ev => (
                  <div key={ev.label} className="met-finance-v2-evidence-item">
                    <span className="met-finance-v2-evidence-item__value">{ev.value}</span>
                    <span className="met-finance-v2-evidence-item__label">{ev.label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="met-finance-v2-btn"
                onClick={openFinanceEvidenceDrawer}
              >
                {healthSummary.actionLabel}
              </button>
            </div>

            <aside className="met-finance-v2-panel met-finance-v2-panel--cash">
              <h3 className="met-finance-v2-panel__title">{cashSafety.title}</h3>
              <div className="met-finance-v2-cash-grid">
                {cashSafety.metrics.map(metric => (
                  <div
                    key={metric.id}
                    className={['met-finance-v2-cash-card', getMetricToneClass(metric.tone)].join(' ')}
                  >
                    <span className="met-finance-v2-cash-card__title">{metric.title}</span>
                    <span className="met-finance-v2-cash-card__value">{metric.value}</span>
                    {metric.safeLine ? (
                      <span className="met-finance-v2-cash-card__safe">{metric.safeLine}</span>
                    ) : null}
                    {metric.description ? (
                      <span className="met-finance-v2-cash-card__desc">{metric.description}</span>
                    ) : null}
                    <span className="met-finance-v2-cash-card__status">{metric.statusLabel}</span>
                    <button
                      type="button"
                      className="met-finance-v2-btn met-finance-v2-btn--sm"
                      onClick={() => showToast(metric.toastMessage)}
                    >
                      {metric.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{financialStructure.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{financialStructure.subtitle}</p>
          </header>
          <div className="met-finance-v2-flow met-finance-v2-flow--v11">
            <div className="met-finance-v2-flow__main">
              <div className="met-finance-v2-flow__lane met-finance-v2-flow__lane--cash">
                <div className="met-finance-v2-flow__node met-finance-v2-flow__node--cash">
                  <span className="met-finance-v2-flow__node-badge">实收</span>
                  <span className="met-finance-v2-flow__node-label">{financialStructure.inflow.label}</span>
                  <span className="met-finance-v2-flow__node-value">{financialStructure.inflow.value}</span>
                </div>
                <div className="met-finance-v2-flow__connector" aria-hidden>
                  <span className="met-finance-v2-flow__connector-line" />
                  <span className="met-finance-v2-flow__connector-arrow">→</span>
                </div>
                <div className="met-finance-v2-flow__branch">
                  <div className="met-finance-v2-flow__node met-finance-v2-flow__node--revenue">
                    <span className="met-finance-v2-flow__node-badge">确认收入</span>
                    <span className="met-finance-v2-flow__node-label">{financialStructure.outcomes[0].label}</span>
                    <span className="met-finance-v2-flow__node-value">{financialStructure.outcomes[0].value}</span>
                  </div>
                  <div className="met-finance-v2-flow__node met-finance-v2-flow__node--liability-new">
                    <span className="met-finance-v2-flow__node-badge">新增负债</span>
                    <span className="met-finance-v2-flow__node-label">{financialStructure.outcomes[1].label}</span>
                    <span className="met-finance-v2-flow__node-value">{financialStructure.outcomes[1].value}</span>
                  </div>
                </div>
              </div>

              <div className="met-finance-v2-flow__lane met-finance-v2-flow__lane--profit">
                <div className="met-finance-v2-flow__node met-finance-v2-flow__node--revenue-inline">
                  <span className="met-finance-v2-flow__node-badge">确认收入</span>
                  <span className="met-finance-v2-flow__node-value">{financialStructure.confirmedRevenue.value}</span>
                </div>
                <span className="met-finance-v2-flow__minus">扣除</span>
                <div className="met-finance-v2-flow__costs">
                  {financialStructure.costItems.map(cost => (
                    <div key={cost.label} className="met-finance-v2-flow__cost">
                      <span>{cost.label}</span>
                      <strong>{cost.value}</strong>
                    </div>
                  ))}
                </div>
                <span className="met-finance-v2-flow__equals">等于</span>
                <div className="met-finance-v2-flow__node met-finance-v2-flow__node--profit">
                  <span className="met-finance-v2-flow__node-badge">经营利润</span>
                  <span className="met-finance-v2-flow__node-label">{financialStructure.operatingProfit.label}</span>
                  <span className="met-finance-v2-flow__node-value">{financialStructure.operatingProfit.value}</span>
                </div>
                <p className="met-finance-v2-flow__profit-note">经营利润从确认收入扣成本，不从实收直接计算</p>
              </div>
            </div>

            <aside className="met-finance-v2-flow__aside met-finance-v2-liability-breakdown-card">
              <h4 className="met-finance-v2-liability-breakdown-card__title">预收负债结构</h4>
              <p className="met-finance-v2-liability-breakdown-card__total">{financialStructure.prepaidLiabilityStock.value}</p>
              <p className="met-finance-v2-liability-breakdown-card__note">{financialStructure.prepaidLiabilityNote}</p>

              <div className="met-finance-v2-liability-segment-bar" aria-hidden>
                {financialStructure.prepaidLiabilityBreakdown.map(item => (
                  <span
                    key={item.label}
                    className={['met-finance-v2-liability-segment-bar__seg', getLiabilityBreakdownToneClass(item.tone)].join(' ')}
                    style={{ flex: item.amountValue }}
                    title={`${item.label} ${item.amount}`}
                  />
                ))}
              </div>

              <div className="met-finance-v2-liability-breakdown-grid">
                {financialStructure.prepaidLiabilityBreakdown.map(item => (
                  <div
                    key={item.label}
                    className={['met-finance-v2-liability-breakdown-item', getLiabilityBreakdownToneClass(item.tone)].join(' ')}
                  >
                    <div className="met-finance-v2-liability-breakdown-item__head">
                      <span className="met-finance-v2-liability-breakdown-item__label">{item.label}</span>
                      <span className="met-finance-v2-liability-breakdown-item__amount">{item.amount}</span>
                    </div>
                    <p className="met-finance-v2-liability-breakdown-item__desc">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="met-finance-v2-flow__legend">
                {financialStructure.flowSteps.map(step => (
                  <div key={step.id} className={['met-finance-v2-flow__legend-item', getFlowStepToneClass(step.tone)].join(' ')}>
                    <span className="met-finance-v2-flow__legend-dot" />
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </article>

        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{storeFinanceHealth.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{storeFinanceHealth.subtitle}</p>
          </header>
          <div className="met-finance-v2-store-matrix">
            {storeFinanceHealth.stores.map(renderStoreRow)}
          </div>
        </article>

        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{assetRiskQueue.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{assetRiskQueue.subtitle}</p>
          </header>
          <div className="met-finance-v2-risk-list">
            {assetRiskQueue.items.map(item => (
              <div key={item.id} className="met-finance-v2-risk-row">
                <span className={['met-finance-v2-priority', getPriorityClass(item.priority)].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-finance-v2-risk-row__main">
                  <p className="met-finance-v2-risk-row__title">{item.title}</p>
                  <p className="met-finance-v2-risk-row__fact">{item.fact}</p>
                  <p className="met-finance-v2-risk-row__impact">影响：{item.impact}</p>
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

        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{revenueRecognition.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{revenueRecognition.subtitle}</p>
          </header>
          <div className="met-finance-v2-revenue-layout">
            <div className="met-finance-v2-revenue-flow">
              {revenueRecognition.flowSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <span className="met-finance-v2-revenue-flow__step">{step}</span>
                  {i < revenueRecognition.flowSteps.length - 1 ? (
                    <span className="met-finance-v2-revenue-flow__arrow" aria-hidden>→</span>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
            <div className="met-finance-v2-revenue-metrics">
              {revenueRecognition.metrics.map((m, i) => (
                <div key={m.label} className="met-finance-v2-revenue-metric">
                  <span className="met-finance-v2-revenue-metric__value">{m.value}</span>
                  <span className="met-finance-v2-revenue-metric__label">{m.label}</span>
                  {i === 1 ? (
                    <span className="met-finance-v2-revenue-metric__note">按耗课确认，不等于实收</span>
                  ) : i === 0 ? (
                    <span className="met-finance-v2-revenue-metric__note">来自已完成课程</span>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="met-finance-v2-evidence-tasks">
              {revenueRecognition.tasks.map(task => (
                <div key={task.id} className="met-finance-v2-evidence-task">
                  <p className="met-finance-v2-evidence-task__title">{task.title}</p>
                  <p className="met-finance-v2-evidence-task__count">{task.count}</p>
                  <p className="met-finance-v2-evidence-task__source">来源：{task.source}</p>
                  <p className="met-finance-v2-evidence-task__impact">影响口径：{task.impactScope}</p>
                  <span className="met-finance-v2-evidence-task__status">{task.taskStatus}</span>
                  <button
                    type="button"
                    className="met-finance-v2-btn met-finance-v2-btn--sm"
                    onClick={() => handleEvidenceTask(task)}
                  >
                    {task.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">退款 / 转卡 / 冻结处理</h2>
            <p className="met-finance-v2-zone__subtitle">涉及会员资产变更的申请、审核和证据链</p>
          </header>
          <div className="met-finance-v2-change-layout">
            {assetChangeQueues.map(renderChangeQueue)}
          </div>
        </article>

        <article className="met-finance-v2-zone">
          <header className="met-finance-v2-zone__head">
            <h2 className="met-finance-v2-zone__title">{paymentSettlement.title}</h2>
            <p className="met-finance-v2-zone__subtitle">{paymentSettlement.subtitle}</p>
          </header>
          <div className="met-finance-v2-payment-grid">
            {paymentSettlement.cards.map(card => (
              <div key={card.id} className={['met-finance-v2-payment-card', getMetricToneClass(card.tone)].join(' ')}>
                <h4 className="met-finance-v2-payment-card__channel">{card.channel}</h4>
                <p className="met-finance-v2-payment-card__received">{card.received}</p>
                <p className="met-finance-v2-payment-card__detail">{card.detail}</p>
                <span className="met-finance-v2-payment-card__status">{card.status}</span>
                <span className={['met-finance-v2-payment-card__exception', card.exceptionLabel.includes('无') ? 'is-none' : 'is-alert'].join(' ')}>
                  {card.exceptionLabel}
                </span>
                {card.actionLabel ? (
                  <button
                    type="button"
                    className="met-finance-v2-btn met-finance-v2-btn--sm"
                    onClick={() => card.toastMessage && showToast(card.toastMessage)}
                  >
                    {card.actionLabel}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <p className="met-finance-v2-cross-store-rule">{paymentSettlement.crossStoreRule}</p>
          <p className="met-finance-v2-settlement-alert">{paymentSettlement.settlementAlert}</p>
        </article>
      </div>

      {drawer ? (
        <>
          <button type="button" className="met-finance-v2-drawer-overlay" aria-label="关闭详情" onClick={closeDrawer} />
          <aside className="met-finance-v2-drawer" role="dialog" aria-labelledby="finance-v2-drawer-title">
            <div className="met-finance-v2-drawer__head">
              <div>
                <h2 id="finance-v2-drawer-title" className="met-finance-v2-drawer__title">{drawerTitle}</h2>
                <p className="met-finance-v2-drawer__subtitle">{drawerSubtitle}</p>
              </div>
              <button type="button" className="met-finance-v2-drawer__close" aria-label="关闭" onClick={closeDrawer}>×</button>
            </div>
            <div className="met-finance-v2-drawer__body">
              {drawerAsset ? renderAssetDrawer(drawerAsset) : null}
              {drawerFinance ? renderFinanceDrawer(drawerFinance) : null}
            </div>
          </aside>
        </>
      ) : null}

      {toast ? <div className="met-finance-v2-toast">{toast}</div> : null}
    </div>
  );
};

export default FinanceV2Page;
