import React from 'react';
import type { PartnerDetailRecord, PartnerJudgment, PartnerLogItem } from './partnerOperationViewModel';
import { isPartnerEmpty } from './partnerFormatters';
import { partnerRiskClass, partnerStatusClass } from './partnerFormatters';

export const PartnerTag: React.FC<{ text: string; kind?: 'status' | 'risk' }> = ({
  text,
  kind = 'status',
}) => {
  if (isPartnerEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-partner-chip--${partnerRiskClass(text)}`
      : `met-partner-chip--${partnerStatusClass(text)}`;
  return <span className={`met-partner-chip ${cls}`}>{text}</span>;
};

export const PartnerModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-partner-info-card">
    {title ? <h4 className="met-partner-info-card__title">{title}</h4> : null}
    <div className="met-partner-info-card__body">{children}</div>
  </section>
);

export const PartnerModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-partner-detail-block">
    <h3 className="met-partner-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const PartnerModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-partner-field-grid met-partner-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-partner-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const PartnerJudgmentBox: React.FC<{
  hint: PartnerJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-partner-judgment-box" aria-label="系统判断">
    <div className="met-partner-judgment-box__head">
      <h4 className="met-partner-judgment-box__title">系统判断</h4>
      <div className="met-partner-judgment-box__tags">
        {status ? <PartnerTag text={status} /> : null}
        {risk && !isPartnerEmpty(risk) ? <PartnerTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-partner-judgment-box__line">{hint.summary}</p>
    <dl className="met-partner-judgment-box__meta">
      {!isPartnerEmpty(hint.stuck) ? (
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
    <p className="met-partner-judgment-box__note">以正式协议、授权范围和操作日志为准 · 合作治理预览</p>
  </section>
);

export const PartnerGovernanceChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-partner-impact-chain${compact ? ' met-partner-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-partner-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-partner-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const PartnerLogTimeline: React.FC<{ logs: PartnerLogItem[] }> = ({ logs }) => (
  <div className="met-partner-log-timeline">
    {logs.map(log => (
      <article key={`${log.time}-${log.action}`} className="met-partner-log-item">
        <div className="met-partner-log-item__head">
          <time>{log.time}</time>
          <span>{log.operator}</span>
        </div>
        <p className="met-partner-log-item__action">{log.action}</p>
        <p className="met-partner-log-item__note">{log.note}</p>
      </article>
    ))}
  </div>
);
