import React from 'react';

export const MallModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-mall-detail-block">
    <h3 className="met-mall-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const MallModalPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <section className={`met-mall-info-card ${className}`}>
    <div className="met-mall-info-card__body">{children}</div>
  </section>
);

export const MallModalDl: React.FC<{ rows: { label: string; value: React.ReactNode }[] }> = ({ rows }) => (
  <dl className="met-mall-field-grid met-mall-field-grid--2col">
    {rows.map(r => (
      <div key={r.label} className="met-mall-field-item">
        <dt>{r.label}</dt>
        <dd>{r.value}</dd>
      </div>
    ))}
  </dl>
);

export const MallSubviewBack: React.FC<{ label: string; onBack: () => void }> = ({ label, onBack }) => (
  <button type="button" className="met-mall-subview-back" onClick={onBack}>
    ← 返回 {label}
  </button>
);

export const MallStatCards: React.FC<{ items: { label: string; value: React.ReactNode }[] }> = ({
  items,
}) => (
  <div className="met-mall-stat-cards">
    {items.map(item => (
      <div key={item.label} className="met-mall-stat-card">
        <span className="met-mall-stat-card__label">{item.label}</span>
        <span className="met-mall-stat-card__value">{item.value}</span>
      </div>
    ))}
  </div>
);

export const MallSubviewActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="met-mall-subview-actions">{children}</div>
);

export type EvidenceChainStep = {
  key: string;
  value: string;
  tone?: 'ok' | 'pending' | 'risk' | 'muted';
};

export const MallEvidenceChain: React.FC<{
  steps: EvidenceChainStep[] | string[];
  compact?: boolean;
}> = ({ steps, compact }) => {
  const normalized: EvidenceChainStep[] =
    typeof steps[0] === 'string'
      ? (steps as string[]).map((value, i) => ({ key: String(i), value }))
      : (steps as EvidenceChainStep[]);

  return (
    <div
      className={`met-mall-evidence-chain${compact ? ' met-mall-evidence-chain--compact' : ''}`}
      role="list"
    >
      {normalized.map((step, i) => (
        <React.Fragment key={`${step.key}-${i}`}>
          {i > 0 ? <span className="met-mall-evidence-chain__sep" aria-hidden>→</span> : null}
          <span
            className={`met-mall-evidence-chain__chip${step.tone ? ` is-${step.tone}` : ''}`}
            role="listitem"
          >
            {!compact && step.key ? (
              <span className="met-mall-evidence-chain__chip-key">{step.key}</span>
            ) : null}
            <span className="met-mall-evidence-chain__chip-val">{step.value}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
