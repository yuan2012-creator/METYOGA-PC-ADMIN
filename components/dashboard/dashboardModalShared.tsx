import React from 'react';
import type { DashboardJudgment, DashboardLogItem } from './dashboardOperationViewModel';
import { isDashboardEmpty } from './dashboardFormatters';
import { dashboardRiskClass, dashboardStatusClass } from './dashboardFormatters';

export const DashboardTag: React.FC<{ text: string; kind?: 'status' | 'risk' }> = ({
  text,
  kind = 'status',
}) => {
  if (isDashboardEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-dashboard-chip--${dashboardRiskClass(text)}`
      : `met-dashboard-chip--${dashboardStatusClass(text)}`;
  return <span className={`met-dashboard-chip ${cls}`}>{text}</span>;
};

export const DashboardModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-dashboard-info-card">
    {title ? <h4 className="met-dashboard-info-card__title">{title}</h4> : null}
    <div className="met-dashboard-info-card__body">{children}</div>
  </section>
);

export const DashboardModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-dashboard-detail-block">
    <h3 className="met-dashboard-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const DashboardModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-dashboard-field-grid met-dashboard-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-dashboard-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const DashboardJudgmentBox: React.FC<{
  hint: DashboardJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-dashboard-judgment-box" aria-label="系统判断">
    <div className="met-dashboard-judgment-box__head">
      <h4 className="met-dashboard-judgment-box__title">系统判断</h4>
      <div className="met-dashboard-judgment-box__tags">
        {status ? <DashboardTag text={status} /> : null}
        {risk && !isDashboardEmpty(risk) ? <DashboardTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-dashboard-judgment-box__line">{hint.summary}</p>
    <dl className="met-dashboard-judgment-box__meta">
      {!isDashboardEmpty(hint.stuck) ? (
        <div>
          <dt>当前卡点</dt>
          <dd>{hint.stuck}</dd>
        </div>
      ) : null}
      <div>
        <dt>建议下一步</dt>
        <dd>{hint.nextStep}</dd>
      </div>
    </dl>
    <p className="met-dashboard-judgment-box__note">以订单、合同、签到、耗课、财务与操作日志为准 · 经营判断预览</p>
  </section>
);

export const DashboardEvidenceChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-dashboard-evidence-chain${compact ? ' met-dashboard-evidence-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-dashboard-evidence-chain__sep" aria-hidden>→</span> : null}
        <span className="met-dashboard-evidence-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const DashboardLogTimeline: React.FC<{ logs: DashboardLogItem[] }> = ({ logs }) => (
  <div className="met-dashboard-log-timeline">
    {logs.map(log => (
      <article key={`${log.time}-${log.action}`} className="met-dashboard-log-item">
        <div className="met-dashboard-log-item__head">
          <time>{log.time}</time>
          <span>{log.operator}</span>
        </div>
        <p className="met-dashboard-log-item__action">{log.action}</p>
        <p className="met-dashboard-log-item__note">{log.note}</p>
      </article>
    ))}
  </div>
);
