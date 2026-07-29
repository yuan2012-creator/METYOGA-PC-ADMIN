import React from 'react';
import type { InvestmentDetailRecord, InvestmentJudgment } from './investmentOperationViewModel';
import { isInvestmentEmpty } from './investmentFormatters';
import { investmentRiskClass, investmentStatusClass } from './investmentFormatters';

export const InvestmentTag: React.FC<{ text: string; kind?: 'status' | 'risk' }> = ({
  text,
  kind = 'status',
}) => {
  if (isInvestmentEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-investment-chip--${investmentRiskClass(text)}`
      : `met-investment-chip--${investmentStatusClass(text)}`;
  return <span className={`met-investment-chip ${cls}`}>{text}</span>;
};

export const InvestmentModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-investment-info-card">
    {title ? <h4 className="met-investment-info-card__title">{title}</h4> : null}
    <div className="met-investment-info-card__body">{children}</div>
  </section>
);

export const InvestmentModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-investment-detail-block">
    <h3 className="met-investment-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const InvestmentModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-investment-field-grid met-investment-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-investment-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const InvestmentJudgmentBox: React.FC<{
  hint: InvestmentJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-investment-judgment-box" aria-label="当前判断">
    <div className="met-investment-judgment-box__head">
      <h4 className="met-investment-judgment-box__title">当前判断</h4>
      <div className="met-investment-judgment-box__tags">
        {status ? <InvestmentTag text={status} /> : null}
        {risk && !isInvestmentEmpty(risk) ? <InvestmentTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-investment-judgment-box__line">{hint.summary}</p>
    <dl className="met-investment-judgment-box__meta">
      {!isInvestmentEmpty(hint.stuck) ? (
        <div>
          <dt>当前卡点</dt>
          <dd>{hint.stuck}</dd>
        </div>
      ) : null}
      <div>
        <dt>系统建议</dt>
        <dd>{hint.nextStep}</dd>
      </div>
    </dl>
    <p className="met-investment-judgment-box__note">本测算不构成投资承诺 · 测算预览</p>
  </section>
);

export const InvestmentCalcChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-investment-impact-chain${compact ? ' met-investment-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-investment-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-investment-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const InvestmentStructureTable: React.FC<{
  rows: InvestmentDetailRecord['capexStructure'];
}> = ({ rows }) => (
  <table className="met-investment-mini-table">
    <thead>
      <tr>
        <th>项目</th>
        <th>金额</th>
        <th>占比</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(r => (
        <tr key={r.label}>
          <td>{r.label}</td>
          <td>{r.amount}</td>
          <td>{r.ratio}</td>
          <td>{r.note}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
