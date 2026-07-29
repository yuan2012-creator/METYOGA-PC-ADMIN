import React from 'react';
import type { AuditDetailRecord, AuditJudgment } from './auditOperationViewModel';
import { isAuditEmpty } from './auditFormatters';
import { auditRiskClass, auditStatusClass } from './auditFormatters';

export const AuditTag: React.FC<{
  text: string;
  kind?: 'status' | 'risk';
}> = ({ text, kind = 'status' }) => {
  if (isAuditEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-audit-chip--${auditRiskClass(text)}`
      : `met-audit-chip--${auditStatusClass(text)}`;
  return <span className={`met-audit-chip ${cls}`}>{text}</span>;
};

export const AuditModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-audit-info-card">
    {title ? <h4 className="met-audit-info-card__title">{title}</h4> : null}
    <div className="met-audit-info-card__body">{children}</div>
  </section>
);

export const AuditModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-audit-detail-block">
    <h3 className="met-audit-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const AuditModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-audit-field-grid met-audit-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-audit-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const AuditJudgmentBox: React.FC<{
  hint: AuditJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-audit-judgment-box" aria-label="系统判断">
    <div className="met-audit-judgment-box__head">
      <h4 className="met-audit-judgment-box__title">系统判断</h4>
      <div className="met-audit-judgment-box__tags">
        {status ? <AuditTag text={status} /> : null}
        {risk && !isAuditEmpty(risk) ? <AuditTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-audit-judgment-box__line">{hint.summary}</p>
    <dl className="met-audit-judgment-box__meta">
      {!isAuditEmpty(hint.stuck) ? (
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
    <p className="met-audit-judgment-box__note">以操作日志和审批记录为准 · 前端演示</p>
  </section>
);

export const AuditEvidenceChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-audit-impact-chain${compact ? ' met-audit-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-audit-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-audit-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const AuditImpactGrid: React.FC<{ detail: AuditDetailRecord }> = ({ detail }) => {
  const items = [
    { label: '影响会员权益', value: detail.impactAsset },
    { label: '影响财务', value: detail.impactFinance },
    { label: '影响合同', value: detail.impactContract },
    { label: '影响老师收入', value: detail.impactTeacherIncome },
  ];
  return (
    <div className="met-audit-impact-grid">
      {items.map(item => (
        <div key={item.label} className={`met-audit-impact-grid__item${item.value ? ' is-on' : ''}`}>
          <span className="met-audit-impact-grid__label">{item.label}</span>
          <span className="met-audit-impact-grid__value">{item.value ? '是' : '否'}</span>
        </div>
      ))}
    </div>
  );
};

export const AuditLogTimeline: React.FC<{ items: AuditDetailRecord['logTimeline'] }> = ({ items }) => (
  <div className="met-audit-log-timeline">
    {items.length === 0 ? (
      <p className="met-audit-detail-tip">暂无关联日志，待接入真实审计服务</p>
    ) : (
      items.map((item, i) => (
        <article key={`${item.at}-${i}`} className="met-audit-log-item">
          <div className="met-audit-log-item__head">
            <time>{item.at}</time>
            <span>{item.by}</span>
          </div>
          <p className="met-audit-log-item__action">{item.action}</p>
          <p className="met-audit-log-item__meta">
            {item.target} · {item.device}
          </p>
          {item.note ? <p className="met-audit-log-item__note">{item.note}</p> : null}
        </article>
      ))
    )}
  </div>
);
