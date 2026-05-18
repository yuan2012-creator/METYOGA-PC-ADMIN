import React from 'react';
import type { FinanceJudgmentHint } from './financeOperationViewModel';

export const FinanceModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-finance-detail-block">
    <h3 className="met-finance-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const FinanceModalPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <section className={`met-finance-info-card ${className}`}>
    <div className="met-finance-info-card__body">{children}</div>
  </section>
);

export const FinanceModalDl: React.FC<{ rows: { label: string; value: React.ReactNode }[] }> = ({
  rows,
}) => (
  <dl className="met-finance-field-grid met-finance-field-grid--2col">
    {rows.map(r => (
      <div key={r.label} className="met-finance-field-item">
        <dt>{r.label}</dt>
        <dd>{r.value}</dd>
      </div>
    ))}
  </dl>
);

export const FinanceJudgmentBox: React.FC<{ hint: FinanceJudgmentHint }> = ({ hint }) => (
  <section className="met-finance-judgment-box" aria-label="财务判断提示">
    <h4 className="met-finance-judgment-box__title">财务判断提示</h4>
    <p className="met-finance-judgment-box__principle">{hint.principle}</p>
    <dl className="met-finance-judgment-box__meta">
      <div>
        <dt>当前卡点</dt>
        <dd>{hint.stuck}</dd>
      </div>
      <div>
        <dt>建议下一步</dt>
        <dd>{hint.nextStep}</dd>
      </div>
    </dl>
    <p className="met-finance-judgment-box__note">仅作经营测算 · 以银行流水与财务入账为准</p>
  </section>
);

export const FinanceEvidenceChain: React.FC<{
  steps: string[];
  compact?: boolean;
}> = ({ steps, compact }) => (
  <div
    className={`met-finance-evidence-chain${compact ? ' met-finance-evidence-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-finance-evidence-chain__sep" aria-hidden>→</span> : null}
        <span className="met-finance-evidence-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);
