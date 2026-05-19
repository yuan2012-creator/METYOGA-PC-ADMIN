import React from 'react';
import type { DashboardEvidenceNode } from './dashboardOperationViewModel';

const DashboardRiskFlow: React.FC<{
  nodes?: DashboardEvidenceNode[];
  steps?: string[];
  insight?: string;
  title?: string;
  compact?: boolean;
}> = ({ nodes, steps, insight, title, compact }) => {
  if (nodes?.length) {
    return (
      <section className="met-dashboard-evidence-section">
        {title ? <h2 className="met-dashboard-evidence-section__title">{title}</h2> : null}
        <div className="met-dashboard-evidence-chain met-today-surface">
          <div className="met-dashboard-evidence-chain__track-wrap">
            <span className="met-dashboard-evidence-chain__dash" aria-hidden />
            <div className="met-dashboard-evidence-chain__track" role="list">
              {nodes.map(node => (
                <div
                  key={node.key}
                  className={`met-dashboard-evidence-chain__node${node.isAnomaly ? ' is-anomaly' : ''}`}
                  role="listitem"
                >
                  <span className="met-dashboard-evidence-chain__icon" aria-hidden>
                    <i className={node.iconClass} />
                  </span>
                  <span className="met-dashboard-evidence-chain__label">{node.label}</span>
                  <span
                    className={`met-dashboard-evidence-chain__value${node.isAnomaly ? ' is-anomaly' : ''}`}
                  >
                    {node.value}
                  </span>
                  {node.isAnomaly ? (
                    <span className="met-dashboard-evidence-chain__anomaly-dot" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          {insight ? (
            <p className="met-dashboard-evidence-chain__insight">
              <strong>发现异常：</strong>
              {insight.replace(/^发现异常[：:]\s*/, '')}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div className={`met-dashboard-risk-flow${compact ? ' met-dashboard-risk-flow--compact' : ''}`}>
      {title ? <p className="met-dashboard-risk-flow__title">{title}</p> : null}
      <div className="met-dashboard-risk-flow__track" role="list">
        {(steps ?? []).map((step, i) => (
          <React.Fragment key={`${step}-${i}`}>
            {i > 0 ? <span className="met-dashboard-risk-flow__line" aria-hidden /> : null}
            <span className="met-dashboard-risk-flow__node" role="listitem">
              {step}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DashboardRiskFlow;
