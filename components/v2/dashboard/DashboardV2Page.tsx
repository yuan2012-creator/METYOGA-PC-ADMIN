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
  type DashboardV2CoverageStatus,
  type DashboardV2Metric,
  type DashboardV2PriorityLevel,
  type DashboardV2Snapshot,
} from './dashboardV2.viewModel';
import './dashboardV2.css';

const PRIORITY_CLASS: Record<DashboardV2PriorityLevel, string> = {
  P0: 'met-dashboard-v2-action-item__priority--p0',
  P1: 'met-dashboard-v2-action-item__priority--p1',
  P2: 'met-dashboard-v2-action-item__priority--p2',
};

const COVERAGE_CLASS: Record<DashboardV2CoverageStatus, string> = {
  ok: 'met-dashboard-v2-coverage--ok',
  warn: 'met-dashboard-v2-coverage--warn',
  risk: 'met-dashboard-v2-coverage--risk',
};

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
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, []);

  const { meta, diagnosis, priorityActions, metrics, riskQueue, profitTrend, deliverySummary, storeComparison } =
    snapshot;

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
                    className={`met-dashboard-v2-tag ${tag.startsWith('P0') ? 'met-dashboard-v2-tag--p0' : 'met-dashboard-v2-tag--neutral'}`}
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
                  <span className="met-dashboard-v2-hero__evidence-value">72%</span>
                </div>
                <div className="met-dashboard-v2-hero__evidence-item">
                  <span className="met-dashboard-v2-hero__evidence-label">安全线</span>
                  <span className="met-dashboard-v2-hero__evidence-value">80%</span>
                </div>
              </div>
            </div>
          </article>

          <article className="met-dashboard-v2-card met-dashboard-v2-card--actions">
            <header className="met-dashboard-v2-actions__head">
              <h2 className="met-dashboard-v2-card__title">今日优先动作</h2>
              <p className="met-dashboard-v2-card__subtitle">按优先级排序</p>
            </header>
            <ul className="met-dashboard-v2-actions__list">
              {priorityActions.map(action => (
                <li key={action.id} className="met-dashboard-v2-action-row">
                  <span className={`met-dashboard-v2-action-item__priority ${PRIORITY_CLASS[action.priority]}`}>
                    {action.priority}
                  </span>
                  <div className="met-dashboard-v2-action-row__copy">
                    <p className="met-dashboard-v2-action-row__title">{action.title}</p>
                    <p className="met-dashboard-v2-action-row__owner">{action.owner}</p>
                  </div>
                  <button
                    type="button"
                    className="met-dashboard-v2-action-row__btn"
                    onClick={() => showToast(`演示：${action.buttonLabel}`)}
                  >
                    {action.buttonLabel}
                  </button>
                </li>
              ))}
            </ul>
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
            <p className="met-dashboard-v2-card__subtitle met-dashboard-v2-card__subtitle--compact">事实 · 影响对象 · 建议动作</p>
            <div className="met-dashboard-v2-risk-list">
              {riskQueue.map(item => (
                <div key={item.id} className="met-dashboard-v2-risk-item">
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
                  <div className="met-dashboard-v2-risk-item__fields">
                    <div className="met-dashboard-v2-risk-item__field">
                      <span className="met-dashboard-v2-risk-item__label">事实</span>
                      <p className="met-dashboard-v2-risk-item__text">{item.fact}</p>
                    </div>
                    <div className="met-dashboard-v2-risk-item__meta-grid">
                      <div className="met-dashboard-v2-risk-item__field">
                        <span className="met-dashboard-v2-risk-item__label">影响对象</span>
                        <p className="met-dashboard-v2-risk-item__text">{item.impact}</p>
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
              <h2 className="met-dashboard-v2-card__title">{profitTrend.title}</h2>
              <p className="met-dashboard-v2-card__subtitle met-dashboard-v2-card__subtitle--inline">{profitTrend.subtitle}</p>
            </div>
            <ProfitTrendChart points={profitTrend.points} />
          </article>

          <article className="met-dashboard-v2-card met-dashboard-v2-card--delivery">
            <h2 className="met-dashboard-v2-card__title">{deliverySummary.title}</h2>
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
          <article className="met-dashboard-v2-card met-dashboard-v2-card--table">
            <h2 className="met-dashboard-v2-card__title">{storeComparison.title}</h2>
            <div className="met-dashboard-v2-table-wrap">
              <table className="met-dashboard-v2-table">
                <thead>
                  <tr>
                    {storeComparison.columns.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {storeComparison.rows.map(row => (
                    <tr key={row.id}>
                      <td className="met-dashboard-v2-table__store">{row.storeName}</td>
                      <td>{row.confirmedRevenue}</td>
                      <td>{row.cashReceived}</td>
                      <td>{row.deferredLiability}</td>
                      <td>
                        <span className={`met-dashboard-v2-coverage ${COVERAGE_CLASS[row.coverageStatus]}`}>
                          {row.cashSafetyCoverage}
                        </span>
                      </td>
                      <td className="met-dashboard-v2-table__judgment">{row.judgment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
