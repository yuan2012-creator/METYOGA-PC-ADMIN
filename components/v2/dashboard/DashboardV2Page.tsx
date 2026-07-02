import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronDown,
  Download,
  Link2,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildDashboardV2Snapshot,
  type DashboardV2Metric,
  type DashboardV2PriorityLevel,
  type DashboardV2Snapshot,
  type DashboardV2StoreStatusLevel,
  type DashboardV2SuggestionSource,
} from './dashboardV2.viewModel';
import './dashboardV2.css';

const PRIORITY_CLASS: Record<DashboardV2PriorityLevel, string> = {
  P0: 'met-dashboard-v2-action-item__priority--p0',
  P1: 'met-dashboard-v2-action-item__priority--p1',
  P2: 'met-dashboard-v2-action-item__priority--p2',
};

const SOURCE_TAG_CLASS: Record<DashboardV2SuggestionSource, string> = {
  system_rule: 'met-dashboard-v2-source-tag--rule',
  pending_config: 'met-dashboard-v2-source-tag--pending',
};

const STORE_STATUS_CLASS: Record<DashboardV2StoreStatusLevel, string> = {
  danger: 'met-dashboard-v2-store-status--danger',
  warning: 'met-dashboard-v2-store-status--warning',
  success: 'met-dashboard-v2-store-status--success',
  neutral: 'met-dashboard-v2-store-status--neutral',
  loss: 'met-dashboard-v2-store-status--loss',
};

const COVERAGE_TONE_CLASS: Record<'danger' | 'warning' | 'success', string> = {
  danger: 'is-danger',
  warning: 'is-warning',
  success: 'is-success',
};

const COST_SEGMENTS = [
  {
    key: 'labor',
    ratioKey: 'laborCostRatio' as const,
    amountKey: 'laborCost' as const,
    label: '人工',
    className: 'met-dashboard-v2-structure-stack__segment--labor',
  },
  {
    key: 'fixed',
    ratioKey: 'fixedCostRatio' as const,
    amountKey: 'fixedCost' as const,
    label: '固定',
    className: 'met-dashboard-v2-structure-stack__segment--fixed',
  },
  {
    key: 'operation',
    ratioKey: 'operationCostRatio' as const,
    amountKey: 'operationCost' as const,
    label: '运营',
    className: 'met-dashboard-v2-structure-stack__segment--operation',
  },
] as const;

function metricChangeClass(metric: DashboardV2Metric): string {
  if (metric.isWarning) return 'is-warning';
  if (metric.changeDirection === 'up') return 'is-up';
  if (metric.changeDirection === 'down') return 'is-down';
  return 'is-neutral';
}

interface ProfitTrendChartProps {
  points: DashboardV2Snapshot['profitTrend']['points'];
}

const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({ points }) => (
  <div className="met-dashboard-v2-chart">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={points}
        margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid stroke="#F3F3F3" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#999999', fontSize: 11 }}
          axisLine={{ stroke: '#EAEAEA' }}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fill: '#999999', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}万`}
          width={44}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #E5E5E5',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            fontSize: 12,
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`¥${value}万`, '经营利润']}
          labelFormatter={label => `${label}`}
        />
        <Line
          type="monotone"
          dataKey="profitWan"
          stroke="#006B42"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#006B42', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const DashboardV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildDashboardV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[DashboardV2]', message);
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, []);

  const {
    meta,
    diagnosis,
    operatingProfitSummary,
    metrics,
    riskQueue,
    profitTrend,
    deliverySummary,
    storeComparison,
  } = snapshot;

  return (
    <div className="met-dashboard-v2">
      <div className="met-dashboard-v2__inner">
        <header className="met-dashboard-v2__header">
          <div className="met-dashboard-v2__header-copy">
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-dashboard-v2__filters">
            <button type="button" className="met-dashboard-v2__filter-btn" onClick={() => showToast('演示：切换门店筛选')}>
              {meta.filters.storeLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button type="button" className="met-dashboard-v2__filter-btn" onClick={() => showToast('演示：切换统计周期')}>
              {meta.filters.periodLabel}
              <ChevronDown size={14} aria-hidden />
            </button>
            <button
              type="button"
              className="met-dashboard-v2__filter-btn met-dashboard-v2__filter-btn--primary"
              onClick={() => showToast('演示：导出报告预览')}
            >
              <Download size={14} aria-hidden />
              {meta.filters.exportLabel}
            </button>
          </div>
        </header>

        <section className="met-dashboard-v2__row-hero">
          <article className="met-dashboard-v2-card met-dashboard-v2-card--hero">
            <h2 className="met-dashboard-v2-card__title">经营诊断</h2>
            <div className="met-dashboard-v2-hero__body">
              <p className="met-dashboard-v2-hero__conclusion">{diagnosis.conclusion}</p>
              <p className="met-dashboard-v2-hero__desc">{diagnosis.description}</p>
              <div className="met-dashboard-v2-hero__tags">
                {diagnosis.tags.map(tag => (
                  <span
                    key={tag}
                    className={[
                      'met-dashboard-v2-tag',
                      tag.startsWith('P0')
                        ? 'met-dashboard-v2-tag--p0'
                        : tag.startsWith('P1')
                          ? 'met-dashboard-v2-tag--p1'
                          : tag.includes('系统规则')
                            ? 'met-dashboard-v2-tag--rule'
                            : tag.includes('待配置')
                              ? 'met-dashboard-v2-tag--pending'
                              : 'met-dashboard-v2-tag--neutral',
                    ].join(' ')}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="met-dashboard-v2-hero__action">
                <button
                  type="button"
                  className="met-dashboard-v2-btn met-dashboard-v2-btn--green"
                  onClick={() => showToast('演示：查看证据链')}
                >
                  <Link2 size={14} aria-hidden />
                  {diagnosis.evidenceButtonLabel}
                </button>
              </div>
              <div className="met-dashboard-v2-hero__evidence" aria-label="关键证据摘要">
                <div className="met-dashboard-v2-hero__evidence-item">
                  <span className="met-dashboard-v2-hero__evidence-label">涉及门店</span>
                  <span className="met-dashboard-v2-hero__evidence-value">滨江馆 / 西湖馆</span>
                </div>
                <div className="met-dashboard-v2-hero__evidence-item">
                  <span className="met-dashboard-v2-hero__evidence-label">当前覆盖率</span>
                  <span className="met-dashboard-v2-hero__evidence-value is-warning">72%</span>
                </div>
                <div className="met-dashboard-v2-hero__evidence-item">
                  <span className="met-dashboard-v2-hero__evidence-label">安全线</span>
                  <span className="met-dashboard-v2-hero__evidence-value">80%</span>
                </div>
              </div>
            </div>
          </article>

          <article className="met-dashboard-v2-card met-dashboard-v2-card--profit">
            <header className="met-dashboard-v2-profit__head">
              <h2 className="met-dashboard-v2-card__title">{operatingProfitSummary.title}</h2>
              <p className="met-dashboard-v2-card__subtitle">{operatingProfitSummary.subtitle}</p>
            </header>
            <div className="met-dashboard-v2-profit__body">
              <span className="met-dashboard-v2-profit__status">{operatingProfitSummary.profitStatusLabel}</span>
              <p className="met-dashboard-v2-profit__label">{operatingProfitSummary.profitLabel}</p>
              <p className="met-dashboard-v2-profit__value">{operatingProfitSummary.operatingProfit}</p>
              <div className="met-dashboard-v2-profit__stats">
                <div className="met-dashboard-v2-profit__stat">
                  <span className="met-dashboard-v2-profit__stat-label">利润率</span>
                  <span className="met-dashboard-v2-profit__stat-value">{operatingProfitSummary.operatingProfitRate}</span>
                </div>
                <div className="met-dashboard-v2-profit__stat">
                  <span className="met-dashboard-v2-profit__stat-label">环比</span>
                  <span className="met-dashboard-v2-profit__stat-value is-up">{operatingProfitSummary.operatingProfitDelta}</span>
                </div>
                <div className="met-dashboard-v2-profit__stat">
                  <span className="met-dashboard-v2-profit__stat-label">{operatingProfitSummary.belowTargetStoreLabel}</span>
                  <span className="met-dashboard-v2-profit__stat-value">{operatingProfitSummary.belowTargetStoreCount} 家</span>
                </div>
              </div>
              <p className="met-dashboard-v2-profit__footnote">{operatingProfitSummary.footnote}</p>
            </div>
          </article>
        </section>

        <section className="met-dashboard-v2__row-metrics">
          {metrics.map(metric => (
            <article key={metric.id} className="met-dashboard-v2-card met-dashboard-v2-card--metric">
              <p className="met-dashboard-v2-metric__label">{metric.label}</p>
              <p className={`met-dashboard-v2-metric__value${metric.isWarning ? ' is-warning' : ''}`}>{metric.value}</p>
              <p className={`met-dashboard-v2-metric__change ${metricChangeClass(metric)}`}>{metric.changeLabel}</p>
              <p className="met-dashboard-v2-metric__note">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="met-dashboard-v2__row-risk">
          <article className="met-dashboard-v2-card met-dashboard-v2-card--risk">
            <h2 className="met-dashboard-v2-card__title">风险处理队列</h2>
            <p className="met-dashboard-v2-card__subtitle met-dashboard-v2-card__subtitle--compact">
              事实 · 影响对象 · 建议来源 · 建议动作
            </p>
            <div className="met-dashboard-v2-risk-list">
              {riskQueue.map(item => (
                <div key={item.id} className={`met-dashboard-v2-risk-item met-dashboard-v2-risk-item--${item.priority.toLowerCase()}`}>
                  <div className="met-dashboard-v2-risk-item__head">
                    <div className="met-dashboard-v2-risk-item__title-wrap">
                      <span className={`met-dashboard-v2-action-item__priority ${PRIORITY_CLASS[item.priority]}`}>
                        {item.priority}
                      </span>
                      <p className="met-dashboard-v2-risk-item__title">{item.title}</p>
                    </div>
                    <button
                      type="button"
                      className="met-dashboard-v2-btn met-dashboard-v2-btn--ghost met-dashboard-v2-btn--sm"
                      onClick={() => showToast(`演示：${item.buttonLabel}`)}
                    >
                      {item.buttonLabel}
                    </button>
                  </div>
                  <div className="met-dashboard-v2-risk-item__body">
                    <div className="met-dashboard-v2-risk-item__col met-dashboard-v2-risk-item__col--left">
                      <div className="met-dashboard-v2-risk-item__field">
                        <span className="met-dashboard-v2-risk-item__label">事实</span>
                        <p className="met-dashboard-v2-risk-item__text">{item.fact}</p>
                      </div>
                      <div className="met-dashboard-v2-risk-item__field">
                        <span className="met-dashboard-v2-risk-item__label">影响对象</span>
                        <p className="met-dashboard-v2-risk-item__text met-dashboard-v2-risk-item__impact">{item.impact}</p>
                      </div>
                    </div>
                    <div className="met-dashboard-v2-risk-item__col met-dashboard-v2-risk-item__col--right">
                      <div className="met-dashboard-v2-risk-item__field met-dashboard-v2-risk-item__field--source">
                        <div className="met-dashboard-v2-risk-item__source-head">
                          <span className="met-dashboard-v2-risk-item__label">建议来源</span>
                          <span className={`met-dashboard-v2-source-tag ${SOURCE_TAG_CLASS[item.suggestionSource]}`}>
                            {item.suggestionSourceLabel}
                          </span>
                        </div>
                      </div>
                      <div className="met-dashboard-v2-risk-item__field">
                        <span className="met-dashboard-v2-risk-item__label">建议动作</span>
                        <p className="met-dashboard-v2-risk-item__text met-dashboard-v2-risk-item__text--action">
                          {item.suggestedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="met-dashboard-v2__row-insights">
          <article className="met-dashboard-v2-card met-dashboard-v2-card--chart">
            <div className="met-dashboard-v2-chart__head">
              <div className="met-dashboard-v2-chart__head-copy">
                <h2 className="met-dashboard-v2-card__title">{profitTrend.title}</h2>
                <p className="met-dashboard-v2-card__subtitle met-dashboard-v2-card__subtitle--inline">{profitTrend.subtitle}</p>
              </div>
              <div className="met-dashboard-v2-chart__current">
                <div className="met-dashboard-v2-chart__current-item">
                  <span className="met-dashboard-v2-chart__current-label">当前经营利润</span>
                  <span className="met-dashboard-v2-chart__current-value">{profitTrend.currentOperatingProfit}</span>
                </div>
                <div className="met-dashboard-v2-chart__current-item">
                  <span className="met-dashboard-v2-chart__current-label">环比</span>
                  <span className={`met-dashboard-v2-chart__current-delta is-${profitTrend.currentDeltaDirection}`}>
                    {profitTrend.currentOperatingProfitDelta}
                  </span>
                </div>
              </div>
            </div>
            <ProfitTrendChart points={profitTrend.points} />
          </article>

          <article className="met-dashboard-v2-card met-dashboard-v2-card--delivery">
            <div className="met-dashboard-v2-delivery__head">
              <h2 className="met-dashboard-v2-card__title">{deliverySummary.title}</h2>
              <button
                type="button"
                className="met-dashboard-v2-delivery__detail-btn"
                onClick={() => showToast('演示：查看交付明细')}
              >
                {deliverySummary.detailButtonLabel}
              </button>
            </div>
            <div className="met-dashboard-v2-delivery-grid">
              {deliverySummary.items.map(item => (
                <div key={item.id} className="met-dashboard-v2-delivery-item">
                  <p className="met-dashboard-v2-delivery-item__label">{item.label}</p>
                  <p className="met-dashboard-v2-delivery-item__value">{item.value}</p>
                  {item.note ? <p className="met-dashboard-v2-delivery-item__note">{item.note}</p> : null}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="met-dashboard-v2__row-evidence">
          <article className="met-dashboard-v2-card met-dashboard-v2-card--stores">
            <header className="met-dashboard-v2-stores__head">
              <div>
                <h2 className="met-dashboard-v2-card__title">{storeComparison.title}</h2>
                <p className="met-dashboard-v2-card__subtitle">{storeComparison.subtitle}</p>
              </div>
            </header>

            <div className="met-dashboard-v2-stores__highlights">
              {storeComparison.highlights.map(item => (
                <div key={item.id} className="met-dashboard-v2-stores__highlight">
                  <span className="met-dashboard-v2-stores__highlight-title">{item.title}</span>
                  <span className="met-dashboard-v2-stores__highlight-value">{item.value}</span>
                  {item.note ? (
                    <span className="met-dashboard-v2-stores__highlight-note">{item.note}</span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="met-dashboard-v2-store-matrix">
              {storeComparison.stores.map(store => (
                <div key={store.id} className="met-dashboard-v2-store-matrix__row">
                  <div className="met-dashboard-v2-store-matrix__identity">
                    <p className="met-dashboard-v2-store-matrix__name">{store.storeName}</p>
                    <span className={`met-dashboard-v2-store-status ${STORE_STATUS_CLASS[store.statusLevel]}`}>
                      {store.statusLabel}
                    </span>
                  </div>

                  <div className="met-dashboard-v2-store-matrix__charts">
                    <div className="met-dashboard-v2-structure-block">
                      <div className="met-dashboard-v2-structure-block__head">
                        <div className="met-dashboard-v2-structure-block__head-main">
                          <span className="met-dashboard-v2-structure-block__title">经营结构</span>
                          <span className="met-dashboard-v2-structure-block__meta">
                            确认收入 {store.confirmedRevenue}
                          </span>
                        </div>
                        {store.costStructure.isLoss ? (
                          <span className="met-dashboard-v2-structure-block__result">
                            {store.costStructure.operatingResultHeadline}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={`met-dashboard-v2-structure-stack-wrap${store.costStructure.isLoss ? ' is-loss' : ''}`}
                      >
                        {store.costStructure.isLoss ? (
                          <span
                            className="met-dashboard-v2-structure-stack__baseline"
                            style={{ left: `${store.costStructure.revenueBaselineRatio}%` }}
                            title="确认收入基准线"
                          >
                            <span className="met-dashboard-v2-structure-stack__baseline-label">确认收入线</span>
                          </span>
                        ) : null}
                        <div className="met-dashboard-v2-structure-stack" role="img" aria-label={`${store.storeName}经营结构`}>
                          {COST_SEGMENTS.map(segment => (
                            <div
                              key={segment.key}
                              className={`met-dashboard-v2-structure-stack__segment ${segment.className}`}
                              style={{ width: `${store.costStructure[segment.ratioKey]}%` }}
                              title={`${segment.label} ${store[segment.amountKey]}`}
                            >
                              <span className="met-dashboard-v2-structure-stack__label">
                                {segment.label} {store[segment.amountKey]}
                              </span>
                            </div>
                          ))}
                          {store.costStructure.isLoss ? (
                            <div
                              className="met-dashboard-v2-structure-stack__segment met-dashboard-v2-structure-stack__segment--loss"
                              style={{ width: `${store.costStructure.lossRatio}%` }}
                              title={store.costStructure.lossResultLabel}
                            >
                              <span className="met-dashboard-v2-structure-stack__loss-badge">
                                {store.costStructure.lossResultLabel}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="met-dashboard-v2-structure-stack__segment met-dashboard-v2-structure-stack__segment--profit"
                              style={{ width: `${store.costStructure.profitRatio}%` }}
                              title={`利润 ${store.operatingProfit}`}
                            >
                              <span className="met-dashboard-v2-structure-stack__label">
                                利润 {store.operatingProfit}
                              </span>
                            </div>
                          )}
                        </div>
                        {store.costStructure.structureHint ? (
                          <p className="met-dashboard-v2-structure-block__hint">{store.costStructure.structureHint}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="met-dashboard-v2-cash-block">
                      <div className="met-dashboard-v2-cash-block__head">
                        <span className="met-dashboard-v2-cash-block__title">现金安全</span>
                        <span className={`met-dashboard-v2-cash-block__value ${COVERAGE_TONE_CLASS[store.coverageTone]}`}>
                          {store.cashSafetyCoverage}
                        </span>
                        <span className="met-dashboard-v2-cash-block__safe">安全线 80%</span>
                      </div>
                      <div className="met-dashboard-v2-cash-block__track">
                        <div
                          className={`met-dashboard-v2-cash-block__fill ${COVERAGE_TONE_CLASS[store.coverageTone]}`}
                          style={{ width: `${store.cashSafetyCoveragePercent}%` }}
                        />
                        <span className="met-dashboard-v2-cash-block__marker" aria-hidden />
                      </div>
                    </div>
                  </div>

                  <div className="met-dashboard-v2-store-matrix__action">
                    <p className="met-dashboard-v2-store-matrix__judgment">{store.businessJudgement}</p>
                    <button
                      type="button"
                      className="met-dashboard-v2-store-matrix__btn"
                      onClick={() => showToast(`演示：${store.storeName} · ${store.nextActionLabel}`)}
                    >
                      {store.nextActionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>

      {toast ? (
        <div className="met-dashboard-v2-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default DashboardV2Page;
