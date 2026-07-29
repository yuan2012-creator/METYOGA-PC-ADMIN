import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildCashPlanSummary,
  buildCashTimeline,
  buildConfirmedCashEvents,
  type CashTimelineDay,
} from '../researchCenterFinanceCalculations';
import { formatCurrency } from '../researchCenterCalculations';
import type { ResearchCenterFinanceState } from '../researchCenterFinanceModel';
import type { ResearchCenterDrawerState } from '../ResearchCenterDrawer';
import PaymentPlanList from './PaymentPlanList';

interface CashPlanPanelProps {
  financeState: ResearchCenterFinanceState;
  mentorPayables?: import('../researchCenterV2.viewModel').MentorPayableItem[];
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  onRecordPayment: (id: string) => void;
}

interface CashBalanceChartProps {
  timeline: CashTimelineDay[];
}

const CHART_HEIGHT = 300;

const CashBalanceChart: React.FC<CashBalanceChartProps> = ({ timeline }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chart = useMemo(() => {
    if (!timeline.length || width < 120) return null;
    const balances = timeline.map(d => d.balance);
    const minB = Math.min(0, ...balances);
    const maxB = Math.max(...balances, 1);
    const range = maxB - minB || 1;
    const W = width;
    const H = CHART_HEIGHT;
    const pad = { top: 28, right: 20, bottom: 36, left: 56 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;
    const y = (v: number) => pad.top + (1 - (v - minB) / range) * innerH;
    const x = (i: number) => pad.left + (i / Math.max(timeline.length - 1, 1)) * innerW;
    const zeroY = y(0);
    const points = timeline.map((d, i) => `${x(i)},${y(d.balance)}`).join(' ');
    const areaPoints = `${x(0)},${zeroY} ${points} ${x(timeline.length - 1)},${zeroY}`;
    const minIdx = balances.indexOf(Math.min(...balances));
    const yTicks = [minB, minB + range * 0.5, maxB];

    return { W, H, pad, innerW, innerH, y, x, zeroY, points, areaPoints, minIdx, yTicks, balances };
  }, [timeline, width]);

  const hoverDay = hoverIdx !== null ? timeline[hoverIdx] : null;

  return (
    <div className="met-rc-v2-cash-trend" ref={wrapRef}>
      {!chart ? (
        <div className="met-rc-v2-cash-trend__placeholder" style={{ height: CHART_HEIGHT }} aria-hidden />
      ) : (
        <svg
          viewBox={`0 0 ${chart.W} ${chart.H}`}
          width="100%"
          height={chart.H}
          preserveAspectRatio="xMidYMid meet"
          className="met-rc-v2-cash-trend__svg"
          role="img"
          aria-label="现金余额趋势"
        >
          {chart.yTicks.map(tick => (
            <g key={tick}>
              <line
                x1={chart.pad.left}
                x2={chart.W - chart.pad.right}
                y1={chart.y(tick)}
                y2={chart.y(tick)}
                className="met-rc-v2-cash-trend__grid"
              />
              <text x={chart.pad.left - 8} y={chart.y(tick) + 4} textAnchor="end" className="met-rc-v2-cash-trend__ylabel">
                {Math.abs(tick) >= 10000 ? `${Math.round(tick / 10000)}万` : Math.round(tick)}
              </text>
            </g>
          ))}
          {chart.zeroY >= chart.pad.top && chart.zeroY <= chart.H - chart.pad.bottom ? (
            <>
              <line
                x1={chart.pad.left}
                x2={chart.W - chart.pad.right}
                y1={chart.zeroY}
                y2={chart.zeroY}
                className="met-rc-v2-cash-trend__zero"
              />
              <rect
                x={chart.pad.left}
                y={chart.zeroY}
                width={chart.innerW}
                height={Math.max(0, chart.H - chart.pad.bottom - chart.zeroY)}
                className="met-rc-v2-cash-trend__risk"
              />
            </>
          ) : null}
          <polyline points={chart.areaPoints} className="met-rc-v2-cash-trend__area" />
          <polyline points={chart.points} className="met-rc-v2-cash-trend__line" fill="none" />
          {timeline.map((day, i) => (
            <circle
              key={day.date}
              cx={chart.x(i)}
              cy={chart.y(day.balance)}
              r={hoverIdx === i ? 5 : 3.5}
              className={[
                'met-rc-v2-cash-trend__dot',
                day.risk === 'danger' ? 'is-danger' : '',
                hoverIdx === i ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          ))}
          {chart.minIdx >= 0 ? (
            <g>
              <circle
                cx={chart.x(chart.minIdx)}
                cy={chart.y(chart.balances[chart.minIdx])}
                r={7}
                className="met-rc-v2-cash-trend__min-ring"
              />
              <text
                x={chart.x(chart.minIdx)}
                y={chart.y(chart.balances[chart.minIdx]) - 12}
                textAnchor="middle"
                className="met-rc-v2-cash-trend__min-label"
              >
                最低
              </text>
            </g>
          ) : null}
          {timeline.map((day, i) => (
            <text
              key={`${day.date}-x`}
              x={chart.x(i)}
              y={chart.H - 10}
              textAnchor="middle"
              className="met-rc-v2-cash-trend__xlabel"
            >
              {day.label}
            </text>
          ))}
        </svg>
      )}
      {hoverDay ? (
        <div className="met-rc-v2-cash-trend__tooltip">
          <strong>{hoverDay.label}</strong>
          <span>收款 {formatCurrency(hoverDay.expectedInflow + hoverDay.confirmedInflow)}</span>
          <span>付款 {formatCurrency(hoverDay.expectedOutflow + hoverDay.confirmedOutflow)}</span>
          <span>当日余额 {formatCurrency(hoverDay.balance)}</span>
        </div>
      ) : (
        <p className="met-rc-v2-cash-trend__hint">悬停节点可查看收款、付款与当日余额</p>
      )}
    </div>
  );
};

const CashPlanPanel: React.FC<CashPlanPanelProps> = ({
  financeState,
  mentorPayables = [],
  onOpenDrawer,
  onRecordPayment,
}) => {
  const [horizon, setHorizon] = useState<30 | 60 | 90>(60);
  const summary30 = useMemo(() => buildCashPlanSummary(financeState, 30), [financeState]);
  const timeline = useMemo(() => buildCashTimeline(financeState, horizon), [financeState, horizon]);
  const confirmed = useMemo(() => buildConfirmedCashEvents(financeState), [financeState]);
  const incomplete = summary30.inflow30 === null;

  const sortedPlans = useMemo(
    () => [...financeState.paymentPlans].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [financeState.paymentPlans],
  );

  return (
    <div className="met-rc-v2-cash-plan">
      {incomplete ? (
        <p className="met-rc-v2-cash-plan__warn">
          硬装付款节点尚未配置，因此未来收款、付款及最低余额预测暂不可计算。
        </p>
      ) : null}

      <div className="met-rc-v2-finance-key-results met-rc-v2-finance-key-results--cash">
        <article className="met-rc-v2-finance-key-results__item">
          <span className="met-rc-v2-finance-key-results__label">当前可用现金</span>
          <strong>{formatCurrency(summary30.currentCash)}</strong>
          <p>账上可动用余额</p>
        </article>
        <article className="met-rc-v2-finance-key-results__item">
          <span className="met-rc-v2-finance-key-results__label">未来30天预计收款</span>
          <strong>{summary30.inflow30 !== null ? formatCurrency(summary30.inflow30) : '待配置后计算'}</strong>
          {summary30.inflow30 !== null ? <p>含预计与已确认收款</p> : null}
        </article>
        <article className="met-rc-v2-finance-key-results__item">
          <span className="met-rc-v2-finance-key-results__label">未来30天预计付款</span>
          <strong>{summary30.outflow30 !== null ? formatCurrency(summary30.outflow30) : '待配置后计算'}</strong>
          {summary30.outflow30 !== null ? <p>含待付与已确认付款</p> : null}
        </article>
        <article className="met-rc-v2-finance-key-results__item">
          <span className="met-rc-v2-finance-key-results__label">最低现金余额</span>
          <strong className={summary30.minBalance30 !== null && summary30.minBalance30 < 0 ? 'is-danger' : ''}>
            {summary30.minBalance30 !== null ? formatCurrency(summary30.minBalance30) : '待配置后计算'}
          </strong>
          {summary30.minBalance30 !== null ? <p>按付款计划滚动测算</p> : null}
        </article>
      </div>

      {incomplete ? (
        <section className="met-rc-v2-card met-rc-v2-cash-incomplete">
          <header className="met-rc-v2-cash-incomplete__head">
            <div>
              <h2 className="met-rc-v2-zone__title">现金预测尚未完整</h2>
              <p className="met-rc-v2-zone__subtitle">
                硬装付款节点尚未配置，目前只能展示已经确认的收付款事件，暂不能可靠计算未来最低现金余额。
              </p>
            </div>
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
              onClick={() => onOpenDrawer({ type: 'content', key: 'hardcover-plan' })}
            >
              配置硬装付款计划
            </button>
          </header>

          <div className="met-rc-v2-cash-incomplete__stats">
            <div>
              <span>当前可用现金</span>
              <strong>{formatCurrency(summary30.currentCash)}</strong>
            </div>
            <div>
              <span>已确认未来收款</span>
              <strong>
                {formatCurrency(confirmed.confirmedInflowTotal)}
                <em>{confirmed.confirmedInflowCount}笔</em>
              </strong>
            </div>
            <div>
              <span>已确认未来付款</span>
              <strong>
                {formatCurrency(confirmed.confirmedOutflowTotal)}
                <em>{confirmed.confirmedOutflowCount}笔</em>
              </strong>
            </div>
          </div>

          <div className="met-rc-v2-cash-incomplete__events">
            <h3>已确认现金事件</h3>
            <ul>
              {confirmed.events.map((ev, idx) => (
                <li key={`${ev.date}-${ev.title}-${idx}`}>
                  <span>{ev.label}</span>
                  <span>{ev.title}</span>
                  <span className={ev.amount >= 0 ? 'is-in' : 'is-out'}>
                    {ev.amount >= 0 ? '+' : ''}{formatCurrency(ev.amount)}
                  </span>
                  <span>余额 {formatCurrency(ev.balanceAfter)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="met-rc-v2-card met-rc-v2-cash-timeline">
          <header className="met-rc-v2-zone__head met-rc-v2-cash-timeline__head">
            <h2 className="met-rc-v2-zone__title">现金余额趋势</h2>
            <div className="met-rc-v2-cash-timeline__tabs">
              {([30, 60, 90] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  className={['met-rc-v2-cash-timeline__tab', horizon === d ? 'is-active' : ''].join(' ')}
                  onClick={() => setHorizon(d)}
                >
                  {d}天
                </button>
              ))}
            </div>
          </header>
          <CashBalanceChart timeline={timeline} />
        </section>
      )}

      {mentorPayables.length > 0 ? (
        <section className="met-rc-v2-card" data-testid="rc-mentor-payables">
          <header className="met-rc-v2-zone__head">
            <h2 className="met-rc-v2-zone__title">导师课酬应付</h2>
            <p className="met-rc-v2-zone__subtitle">由课次计酬派生，同一课次不重复累计</p>
          </header>
          <ul className="met-rc-v2-payment-list">
            {mentorPayables.map(item => (
              <li key={item.id} className="met-rc-v2-payment-list__item">
                <div>
                  <strong>{item.teacher}</strong>
                  <span>{item.sessionLabel}</span>
                </div>
                <div>
                  <span>应付 {formatCurrency(item.dueAmount)}</span>
                  <span>已付 {formatCurrency(item.paidAmount)}</span>
                  <span>预计 {item.dueDate}</span>
                  <span className="met-rc-v2-payment-list__status">{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PaymentPlanList
        plans={sortedPlans}
        onOpenDrawer={onOpenDrawer}
        onRecordPayment={onRecordPayment}
      />
    </div>
  );
};

export default CashPlanPanel;
