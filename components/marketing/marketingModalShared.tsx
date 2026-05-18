import React from 'react';
import type {
  MarketingConversionLineItem,
  MarketingCostLineItem,
  MarketingDetailRecord,
  MarketingJudgment,
  MarketingOperationLog,
  MarketingSignupLineItem,
} from './marketingOperationViewModel';
import { isMarketingEmpty } from './marketingFormatters';
import { formatMarketingCny, marketingRiskClass, marketingStatusClass } from './marketingFormatters';

export const MarketingTag: React.FC<{ text: string; kind?: 'status' | 'risk' }> = ({
  text,
  kind = 'status',
}) => {
  if (isMarketingEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-marketing-chip--${marketingRiskClass(text === '超标' ? '高' : text)}`
      : `met-marketing-chip--${marketingStatusClass(text)}`;
  return <span className={`met-marketing-chip ${cls}`}>{text}</span>;
};

export const MarketingModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-marketing-info-card">
    {title ? <h4 className="met-marketing-info-card__title">{title}</h4> : null}
    <div className="met-marketing-info-card__body">{children}</div>
  </section>
);

export const MarketingModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-marketing-detail-block">
    <h3 className="met-marketing-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const MarketingModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-marketing-field-grid met-marketing-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-marketing-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const MarketingJudgmentBox: React.FC<{
  hint: MarketingJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-marketing-judgment-box" aria-label="系统判断">
    <div className="met-marketing-judgment-box__head">
      <h4 className="met-marketing-judgment-box__title">系统判断</h4>
      <div className="met-marketing-judgment-box__tags">
        {status ? <MarketingTag text={status} /> : null}
        {risk && !isMarketingEmpty(risk) ? <MarketingTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-marketing-judgment-box__line">{hint.summary}</p>
    <dl className="met-marketing-judgment-box__meta">
      {!isMarketingEmpty(hint.stuck) ? (
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
    <p className="met-marketing-judgment-box__note">以活动规则和操作日志为准 · 前端演示</p>
  </section>
);

export const MarketingEvidenceChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-marketing-impact-chain${compact ? ' met-marketing-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-marketing-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-marketing-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const MarketingCostBlock: React.FC<{ detail: MarketingDetailRecord }> = ({ detail }) => (
  <MarketingModalDl
    rows={[
      { label: '预算成本', value: detail.budget ? formatMarketingCny(detail.budget) : null },
      { label: '实际成本', value: detail.actual ? formatMarketingCny(detail.actual) : null },
      { label: '成本类型', value: detail.costType },
      { label: '供应方', value: detail.vendor },
      { label: '凭证状态', value: detail.voucherStatus },
      { label: '是否超预算', value: detail.costOverBudget ? '是（前端演示判断）' : '否' },
      { label: '成本占比', value: detail.costRatio },
      { label: '成本风险', value: detail.costRisk },
      { label: '成本回收判断', value: detail.costRecoveryJudgment },
      { label: '财务核对提示', value: detail.financeHint },
    ]}
  />
);

export const MarketingSignupTable: React.FC<{ rows: MarketingSignupLineItem[] }> = ({ rows }) => (
  <table className="met-marketing-mini-table">
    <thead>
      <tr>
        <th>会员 / 线索</th>
        <th>来源</th>
        <th>预约门店</th>
        <th>到店状态</th>
        <th>负责人</th>
        <th>下一步动作</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={`${r.memberName}-${i}`}>
          <td>{r.memberName}</td>
          <td>{r.source}</td>
          <td>{r.store}</td>
          <td><MarketingTag text={r.arrivalStatus} /></td>
          <td>{r.butler}</td>
          <td>{r.nextAction}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const MarketingConversionTable: React.FC<{ rows: MarketingConversionLineItem[] }> = ({ rows }) => (
  <table className="met-marketing-mini-table">
    <thead>
      <tr>
        <th>会员</th>
        <th>体验课程</th>
        <th>体验老师</th>
        <th>管家</th>
        <th>跟进状态</th>
        <th>成交状态</th>
        <th>下一步动作</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={`${r.memberName}-${i}`}>
          <td>{r.memberName}</td>
          <td>{r.trialCourse}</td>
          <td>{r.teacher}</td>
          <td>{r.butler}</td>
          <td><MarketingTag text={r.followStatus} /></td>
          <td><MarketingTag text={r.dealStatus} /></td>
          <td>{r.nextAction}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const MarketingCostTable: React.FC<{ rows: MarketingCostLineItem[] }> = ({ rows }) => (
  <table className="met-marketing-mini-table">
    <thead>
      <tr>
        <th>成本类型</th>
        <th>预算</th>
        <th>实际</th>
        <th>供应方</th>
        <th>凭证状态</th>
        <th>超预算</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={`${r.costType}-${i}`}>
          <td>{r.costType}</td>
          <td className="met-marketing-col-amount">{formatMarketingCny(r.budget)}</td>
          <td className="met-marketing-col-amount">{formatMarketingCny(r.actual)}</td>
          <td>{r.vendor}</td>
          <td><MarketingTag text={r.voucherStatus} /></td>
          <td>{r.overBudget ? '是' : '否'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const MarketingLogTimeline: React.FC<{ logs: MarketingOperationLog[] }> = ({ logs }) => (
  <div className="met-marketing-log-timeline">
    {logs.map(log => (
      <article key={`${log.time}-${log.action}`} className="met-marketing-log-item">
        <div className="met-marketing-log-item__head">
          <time>{log.time}</time>
          <span>{log.operator}</span>
        </div>
        <p className="met-marketing-log-item__action">{log.action}</p>
        <p className="met-marketing-log-item__note">{log.note}</p>
      </article>
    ))}
  </div>
);
