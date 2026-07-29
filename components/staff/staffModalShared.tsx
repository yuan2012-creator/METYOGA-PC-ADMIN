import React from 'react';

export const StaffModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-staff-detail-block">
    <h3 className="met-staff-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const StaffModalPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="met-staff-info-card">
    <div className="met-staff-info-card__body">{children}</div>
  </section>
);

export const StaffModalDl: React.FC<{ rows: { label: string; value: React.ReactNode }[] }> = ({ rows }) => (
  <dl className="met-staff-field-grid met-staff-field-grid--2col">
    {rows.map(r => (
      <div key={r.label} className="met-staff-field-item">
        <dt>{r.label}</dt>
        <dd>{r.value}</dd>
      </div>
    ))}
  </dl>
);

export const StaffEvidenceChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-staff-evidence-chain${compact ? ' met-staff-evidence-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-staff-evidence-chain__sep" aria-hidden>→</span> : null}
        <span className="met-staff-evidence-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const StaffMeteachBoundary: React.FC<{
  visible: string[];
  hidden: string[];
}> = ({ visible, hidden }) => (
  <div className="met-staff-meteach-boundary">
    <div>
      <h4>老师端 METeach 可见</h4>
      <ul>
        {visible.map(v => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
    <div>
      <h4>老师端不可见</h4>
      <ul>
        {hidden.map(v => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  </div>
);
