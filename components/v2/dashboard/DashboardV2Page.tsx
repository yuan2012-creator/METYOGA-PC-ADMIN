import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  type DashboardV2ViewMode,
  type StoreManagerDashboardSnapshot,
  type StoreMetricStatusLevel,
  type StoreOperatingStatusLevel,
} from './dashboardV2.viewModel';
import { getV2RoleProfile, type V2AdminRole } from '../types/roleView.types';
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

const STORE_OP_STATUS_CLASS: Record<StoreOperatingStatusLevel, string> = {
  healthy: 'met-dashboard-v2-sm-status--healthy',
  watch: 'met-dashboard-v2-sm-status--watch',
  warning: 'met-dashboard-v2-sm-status--warning',
  highRisk: 'met-dashboard-v2-sm-status--high-risk',
};

const STORE_METRIC_STATUS_CLASS: Record<StoreMetricStatusLevel, string> = {
  normal: 'met-dashboard-v2-sm-metric__status--normal',
  watch: 'met-dashboard-v2-sm-metric__status--watch',
  warning: 'met-dashboard-v2-sm-metric__status--warning',
  highRisk: 'met-dashboard-v2-sm-metric__status--high-risk',
};

const VIEW_MODE_OPTIONS: { id: DashboardV2ViewMode; label: string }[] = [
  { id: 'hq', label: '总部视角' },
  { id: 'storeManager', label: '店长视角' },
];

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

interface StoreManagerDashboardProps {
  data: StoreManagerDashboardSnapshot;
  onToast: (message: string) => void;
}

const StoreManagerDashboard: React.FC<StoreManagerDashboardProps> = ({ data, onToast }) => {
  const { conclusion, coreMetrics, todayActions, issueCategories, structureCards, weekActions, drillDownEntries } = data;

  return (
    <>
      <section className="met-dashboard-v2__row-sm-conclusion">
        <article className="met-dashboard-v2-card met-dashboard-v2-card--sm-conclusion">
          <div className="met-dashboard-v2-sm-conclusion__head">
            <h2 className="met-dashboard-v2-sm-conclusion__headline">{conclusion.headline}</h2>
            <span className={`met-dashboard-v2-sm-status ${STORE_OP_STATUS_CLASS[conclusion.operatingStatus]}`}>
              {conclusion.statusLabel}
            </span>
          </div>
          <p className="met-dashboard-v2-sm-conclusion__reason">{conclusion.primaryReason}</p>
          <div className="met-dashboard-v2-sm-conclusion__meta">
            <span>门店：{conclusion.storeName}</span>
            <span>周期：{conclusion.periodLabel}</span>
            <span>更新时间：{conclusion.updatedAt}</span>
          </div>
          <div className="met-dashboard-v2-sm-conclusion__sources">
            <span className="met-dashboard-v2-sm-conclusion__sources-label">系统判断来源</span>
            {conclusion.judgmentSources.map(source => (
              <span key={source} className="met-dashboard-v2-tag met-dashboard-v2-tag--rule">{source}</span>
            ))}
          </div>
          <div className="met-dashboard-v2-sm-conclusion__evidence" aria-label="关键证据">
            {conclusion.evidence.map(item => (
              <div key={item.label} className="met-dashboard-v2-sm-conclusion__evidence-item">
                <span className="met-dashboard-v2-sm-conclusion__evidence-label">{item.label}</span>
                <span className={`met-dashboard-v2-sm-conclusion__evidence-value${item.isWarning ? ' is-warning' : ''}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="met-dashboard-v2-btn met-dashboard-v2-btn--ghost met-dashboard-v2-btn--sm"
            onClick={() => onToast(conclusion.evidenceToastMessage)}
          >
            {conclusion.evidenceButtonLabel}
          </button>
        </article>
      </section>

      <section className="met-dashboard-v2__row-sm-metrics">
        {coreMetrics.map(metric => (
          <article
            key={metric.id}
            className="met-dashboard-v2-card met-dashboard-v2-card--sm-metric"
            role="button"
            tabIndex={0}
            onClick={() => onToast(metric.drillDownToast)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToast(metric.drillDownToast);
              }
            }}
          >
            <div className="met-dashboard-v2-sm-metric__head">
              <p className="met-dashboard-v2-sm-metric__label">{metric.label}</p>
              <span className={`met-dashboard-v2-sm-metric__status ${STORE_METRIC_STATUS_CLASS[metric.status]}`}>
                {metric.statusLabel}
              </span>
            </div>
            <p className={`met-dashboard-v2-sm-metric__value${metric.status === 'warning' || metric.status === 'highRisk' ? ' is-warning' : ''}`}>
              {metric.value}
            </p>
            <p className="met-dashboard-v2-sm-metric__change">{metric.changeLabel}</p>
            <p className="met-dashboard-v2-sm-metric__note">{metric.explanation}</p>
            <span className="met-dashboard-v2-sm-metric__source">{metric.sourceModule}</span>
          </article>
        ))}
      </section>

      <section className="met-dashboard-v2__row-sm-actions">
        <article className="met-dashboard-v2-card met-dashboard-v2-card--sm-queue">
          <h2 className="met-dashboard-v2-card__title">今日优先动作</h2>
          <p className="met-dashboard-v2-card__subtitle met-dashboard-v2-card__subtitle--compact">
            最多 3 条 · 按优先级处理
          </p>
          <div className="met-dashboard-v2-sm-action-list">
            {todayActions.map(action => (
              <div key={action.id} className={`met-dashboard-v2-sm-action-item met-dashboard-v2-sm-action-item--${action.priority.toLowerCase()}`}>
                <div className="met-dashboard-v2-sm-action-item__head">
                  <span className={`met-dashboard-v2-action-item__priority ${PRIORITY_CLASS[action.priority]}`}>
                    {action.priority}
                  </span>
                  <p className="met-dashboard-v2-sm-action-item__title">{action.title}</p>
                  <button
                    type="button"
                    className="met-dashboard-v2-btn met-dashboard-v2-btn--ghost met-dashboard-v2-btn--sm"
                    onClick={() => onToast(action.drillDownToast)}
                  >
                    {action.buttonLabel}
                  </button>
                </div>
                <div className="met-dashboard-v2-sm-action-item__body">
                  <p><span>影响</span>{action.impactScope}</p>
                  <p><span>来源</span>{action.sourceModules.join(' / ')}</p>
                  <p><span>负责人</span>{action.ownerRole}</p>
                  <p><span>建议动作</span>{action.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="met-dashboard-v2__zone-sm-issues">
        <header className="met-dashboard-v2-zone__head">
          <h2 className="met-dashboard-v2-zone__title">经营问题分类</h2>
          <p className="met-dashboard-v2-zone__subtitle">把门店经营问题按财务、耗课、会员、老师和获客拆开看</p>
        </header>
        <div className="met-dashboard-v2-sm-issue-grid">
          {issueCategories.map(category => (
            <article key={category.id} className={`met-dashboard-v2-card met-dashboard-v2-card--sm-issue met-dashboard-v2-sm-issue--${category.status}`}>
              <div className="met-dashboard-v2-sm-issue__head">
                <h3 className="met-dashboard-v2-sm-issue__title">{category.title}</h3>
                <span className={`met-dashboard-v2-sm-metric__status ${STORE_METRIC_STATUS_CLASS[category.status]}`}>
                  {category.statusLabel}
                </span>
              </div>
              <p className="met-dashboard-v2-sm-issue__risk">风险 {category.riskCount} 项</p>
              <p className="met-dashboard-v2-sm-issue__issue">{category.representativeIssue}</p>
              <p className="met-dashboard-v2-sm-issue__action">{category.suggestedAction}</p>
              <button
                type="button"
                className="met-dashboard-v2-btn met-dashboard-v2-btn--sm"
                onClick={() => onToast(category.drillDownToast)}
              >
                {category.entryButtonLabel}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="met-dashboard-v2__zone-sm-structure">
        <header className="met-dashboard-v2-zone__head">
          <h2 className="met-dashboard-v2-zone__title">门店经营结构</h2>
          <p className="met-dashboard-v2-zone__subtitle">从耗课、成本、现金、会员、退费、获客和师资看本店经营压力</p>
        </header>
        <div className="met-dashboard-v2-sm-structure-grid">
          {structureCards.map(card => (
            <article key={card.id} className="met-dashboard-v2-card met-dashboard-v2-card--sm-structure">
              <h3 className="met-dashboard-v2-sm-structure__title">{card.title}</h3>
              <div className="met-dashboard-v2-sm-structure__fields">
                {card.fields.map(field => (
                  <div key={field.label} className="met-dashboard-v2-sm-structure__field">
                    <span>{field.label}</span>
                    <strong className={field.isWarning ? 'is-warning' : ''}>{field.value}</strong>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="met-dashboard-v2-btn met-dashboard-v2-btn--ghost met-dashboard-v2-btn--sm"
                onClick={() => onToast(card.drillDownToast)}
              >
                {card.entryButtonLabel}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="met-dashboard-v2__zone-sm-week">
        <header className="met-dashboard-v2-zone__head">
          <h2 className="met-dashboard-v2-zone__title">本周经营动作</h2>
        </header>
        <div className="met-dashboard-v2-sm-week-list">
          {weekActions.map(action => (
            <div key={action.id} className="met-dashboard-v2-sm-week-item">
              <span className={`met-dashboard-v2-action-item__priority ${PRIORITY_CLASS[action.priority]}`}>
                {action.priority}
              </span>
              <div className="met-dashboard-v2-sm-week-item__main">
                <p className="met-dashboard-v2-sm-week-item__title">{action.title}</p>
                <p className="met-dashboard-v2-sm-week-item__meta">
                  影响：{action.impactScope} · 负责人：{action.ownerRole} · 来源：{action.sourceModule}
                </p>
                <p className="met-dashboard-v2-sm-week-item__action">{action.suggestedAction}</p>
              </div>
              <button
                type="button"
                className="met-dashboard-v2-btn met-dashboard-v2-btn--ghost met-dashboard-v2-btn--sm"
                onClick={() => onToast(action.drillDownToast)}
              >
                {action.buttonLabel}
              </button>
            </div>
          ))}
        </div>
        <div className="met-dashboard-v2-sm-drilldown">
          <h3 className="met-dashboard-v2-sm-drilldown__title">经营明细入口</h3>
          <div className="met-dashboard-v2-sm-drilldown__links">
            {drillDownEntries.map(entry => (
              <button
                key={entry.id}
                type="button"
                className="met-dashboard-v2-sm-drilldown__link"
                onClick={() => onToast(entry.drillDownToast)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const DashboardV2Page: React.FC<{
  currentRole: V2AdminRole;
  onNavigate?: (navId: string) => void;
}> = ({ currentRole, onNavigate }) => {
  const snapshot = useMemo(() => buildDashboardV2Snapshot(), []);
  const roleProfile = useMemo(() => getV2RoleProfile(currentRole), [currentRole]);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<DashboardV2ViewMode>(roleProfile.dashboardViewMode);

  useEffect(() => {
    setViewMode(roleProfile.dashboardViewMode);
  }, [roleProfile.dashboardViewMode]);

  const isStoreManagerView = currentRole === 'storeManager' || viewMode === 'storeManager';
  const canSwitchDashboardView = roleProfile.canSwitchDashboardView;

  const showToast = useCallback((message: string) => {
    if (message.includes('课程与排课') && onNavigate) {
      onNavigate('course');
      return;
    }
    if (message.includes('师资与团队') && onNavigate) {
      onNavigate('staff');
      return;
    }
    console.log('[DashboardV2]', message);
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, [onNavigate]);

  const {
    meta,
    diagnosis,
    operatingProfitSummary,
    metrics,
    riskQueue,
    profitTrend,
    deliverySummary,
    storeComparison,
    storeManagerView,
  } = snapshot;

  const headerTitle = currentRole === 'storeManager' ? '门店经营驾驶舱' : meta.title;

  const headerSubtitle = currentRole === 'storeManager'
    ? `${storeManagerView.conclusion.storeName} · ${storeManagerView.conclusion.periodLabel} · 店长视角`
    : viewMode === 'storeManager'
      ? `店长视角 · ${storeManagerView.conclusion.storeName} · ${storeManagerView.conclusion.periodLabel}`
      : meta.subtitle;

  const storeFilterLabel = currentRole === 'storeManager'
    ? storeManagerView.conclusion.storeName
    : meta.filters.storeLabel;

  return (
    <div className="met-dashboard-v2 met-v2-density-dashboard">
      <div className="met-dashboard-v2__inner">
        <header className="met-dashboard-v2__header">
          <div className="met-dashboard-v2__header-copy">
            <h1>{headerTitle}</h1>
            <p>{headerSubtitle}</p>
          </div>
          <div className="met-dashboard-v2__header-tools">
            {canSwitchDashboardView ? (
            <div className="met-dashboard-v2__view-toggle" role="tablist" aria-label="经营视角切换">
              {VIEW_MODE_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === option.id}
                  className={[
                    'met-dashboard-v2__view-toggle-btn',
                    viewMode === option.id ? 'is-active' : '',
                  ].join(' ')}
                  onClick={() => setViewMode(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            ) : null}
            <div className="met-dashboard-v2__filters">
            <button
              type="button"
              className={`met-dashboard-v2__filter-btn${currentRole === 'storeManager' ? ' is-disabled' : ''}`}
              onClick={() => {
                if (currentRole === 'storeManager') return;
                showToast('演示：切换门店筛选');
              }}
              disabled={currentRole === 'storeManager'}
            >
              {storeFilterLabel}
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
          </div>
        </header>

        {isStoreManagerView ? (
          <StoreManagerDashboard data={storeManagerView} onToast={showToast} />
        ) : (
        <>
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
        </>
        )}
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
