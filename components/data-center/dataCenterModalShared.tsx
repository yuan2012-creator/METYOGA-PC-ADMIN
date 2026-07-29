import React from 'react';
import type { DataDetailRecord, DataJudgment, DataTrendPoint } from './dataCenterOperationViewModel';
import { isDataEmpty } from './dataCenterFormatters';
import { dataRiskClass, dataStatusClass } from './dataCenterFormatters';

export const DataTag: React.FC<{ text: string; kind?: 'status' | 'risk' }> = ({
  text,
  kind = 'status',
}) => {
  if (isDataEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-data-chip--${dataRiskClass(text)}`
      : `met-data-chip--${dataStatusClass(text)}`;
  return <span className={`met-data-chip ${cls}`}>{text}</span>;
};

export const DataModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-data-info-card">
    {title ? <h4 className="met-data-info-card__title">{title}</h4> : null}
    <div className="met-data-info-card__body">{children}</div>
  </section>
);

export const DataModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-data-detail-block">
    <h3 className="met-data-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const DataModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-data-field-grid met-data-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-data-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const DataJudgmentBox: React.FC<{
  hint: DataJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-data-judgment-box" aria-label="当前判断">
    <div className="met-data-judgment-box__head">
      <h4 className="met-data-judgment-box__title">当前判断</h4>
      <div className="met-data-judgment-box__tags">
        {status ? <DataTag text={status} /> : null}
        {risk && !isDataEmpty(risk) ? <DataTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-data-judgment-box__line">{hint.summary}</p>
    <dl className="met-data-judgment-box__meta">
      {!isDataEmpty(hint.deviation) ? (
        <div>
          <dt>偏差说明</dt>
          <dd>{hint.deviation}</dd>
        </div>
      ) : null}
      <div>
        <dt>系统建议</dt>
        <dd>{hint.nextStep}</dd>
      </div>
    </dl>
    <p className="met-data-judgment-box__note">以财务和业务系统真实数据为准 · 分析预览</p>
  </section>
);

export const DataAnalysisChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-data-impact-chain${compact ? ' met-data-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-data-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-data-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const DataTrendBars: React.FC<{ title: string; points: DataTrendPoint[] }> = ({
  title,
  points,
}) => {
  const max = Math.max(...points.map(p => p.value), 1);
  return (
    <div className="met-data-trend-block">
      <h5 className="met-data-trend-block__title">{title}</h5>
      <div className="met-data-trend-bars">
        {points.map(p => (
          <div key={p.label} className="met-data-trend-bar">
            <span className="met-data-trend-bar__label">{p.label}</span>
            <div className="met-data-trend-bar__track">
              <span
                className="met-data-trend-bar__fill"
                style={{ width: `${Math.round((p.value / max) * 100)}%` }}
              />
            </div>
            <span className="met-data-trend-bar__value">
              {p.value.toLocaleString('zh-CN')} {p.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DataRelatedTable: React.FC<{
  rows: DataDetailRecord['relatedItems'];
}> = ({ rows }) => (
  <table className="met-data-mini-table">
    <thead>
      <tr>
        <th>类型</th>
        <th>名称</th>
        <th>数值</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(r => (
        <tr key={`${r.type}-${r.name}`}>
          <td>{r.type}</td>
          <td>{r.name}</td>
          <td>{r.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
