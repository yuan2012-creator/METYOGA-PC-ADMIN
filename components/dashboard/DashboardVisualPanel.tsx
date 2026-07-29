import React, { useMemo } from 'react';
import type { DashboardJudgmentPanel } from './dashboardOperationViewModel';

const CHART_W = 360;
const CHART_H = 88;
const PAD = { l: 12, r: 14, t: 14, b: 22 };

const TrendLineChart: React.FC<{ points: DashboardJudgmentPanel['trend'] }> = ({ points }) => {
  const { coords, linePath, areaPath } = useMemo(() => {
    const max = Math.max(...points.map(p => p.count), 1);
    const innerW = CHART_W - PAD.l - PAD.r;
    const innerH = CHART_H - PAD.t - PAD.b;
    const baseY = PAD.t + innerH;
    const mapped = points.map((p, i) => ({
      ...p,
      x: PAD.l + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW),
      y: PAD.t + (1 - p.count / max) * innerH,
      isToday: i === points.length - 1,
    }));
    const line = mapped
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');
    const area = `${line} L ${mapped[mapped.length - 1].x.toFixed(1)} ${baseY} L ${mapped[0].x.toFixed(1)} ${baseY} Z`;
    return { coords: mapped, linePath: line, areaPath: area };
  }, [points]);

  return (
    <div className="met-dashboard-trend-chart">
      <svg
        className="met-dashboard-trend-chart__svg"
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="近7日待处理趋势"
      >
        <defs>
          <linearGradient id="met-dashboard-trend-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#181512" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#181512" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map(r => {
          const y = PAD.t + r * (CHART_H - PAD.t - PAD.b);
          return (
            <line
              key={r}
              x1={PAD.l}
              x2={CHART_W - PAD.r}
              y1={y}
              y2={y}
              className="met-dashboard-trend-chart__grid"
            />
          );
        })}
        <path d={areaPath} className="met-dashboard-trend-chart__area" />
        <path d={linePath} className="met-dashboard-trend-chart__line" fill="none" />
        {coords.map(c => (
          <g key={c.dateLabel}>
            <circle
              cx={c.x}
              cy={c.y}
              r={c.isToday ? 3.6 : 2.2}
              className={`met-dashboard-trend-chart__dot${c.isToday ? ' is-today' : ''}`}
            />
            {c.isToday ? (
              <text
                x={c.x}
                y={c.y - 8}
                textAnchor="middle"
                className="met-dashboard-trend-chart__today-value"
              >
                今日 {c.count}
              </text>
            ) : null}
            <text
              x={c.x}
              y={CHART_H - 2}
              textAnchor="middle"
              className={`met-dashboard-trend-chart__label${c.isToday ? ' is-today' : ''}`}
            >
              {c.dateLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const DashboardVisualPanel: React.FC<{ judgment: DashboardJudgmentPanel }> = ({ judgment }) => (
  <article className="met-dashboard-judgment-card met-dashboard-surface">
    <header className="met-dashboard-judgment-card__head">
      <div className="met-dashboard-judgment-card__head-left">
        <h2 className="met-dashboard-judgment-card__title">今日经营判断</h2>
        <p className="met-dashboard-judgment-card__status">
          <span className="met-dashboard-judgment-card__status-dot" aria-hidden />
          {judgment.priorityCount} 项优先处理
        </p>
      </div>
      <ul className="met-dashboard-judgment-card__categories">
        {judgment.categories.map(cat => (
          <li key={cat.label}>
            <span className="met-dashboard-judgment-card__cat-label">{cat.label}</span>
            <span className="met-dashboard-judgment-card__cat-value">{cat.count}</span>
          </li>
        ))}
      </ul>
    </header>

    <div className="met-dashboard-judgment-card__chart-wrap">
      <p className="met-dashboard-judgment-card__chart-title">
        <span>近 7 日待处理趋势</span>
        <span>趋势上升 +24%</span>
      </p>
      <TrendLineChart points={judgment.trend} />
    </div>

    <p className="met-dashboard-judgment-card__footnote">
      <i className="fa-solid fa-circle-info" aria-hidden />
      {judgment.footnote}
    </p>
  </article>
);

export default DashboardVisualPanel;
