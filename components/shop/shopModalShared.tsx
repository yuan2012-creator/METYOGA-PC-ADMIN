import React from 'react';
import type { ShopDetailRecord, ShopJudgment } from './shopOperationViewModel';
import { isShopEmpty } from './shopFormatters';
import { shopRiskClass, shopStatusClass } from './shopFormatters';
import { formatShopCny } from './shopFormatters';

export const ShopTag: React.FC<{ text: string; kind?: 'status' | 'risk' }> = ({ text, kind = 'status' }) => {
  if (isShopEmpty(text)) return null;
  const cls =
    kind === 'risk'
      ? `met-shop-chip--${shopRiskClass(text === '偏高' ? '高' : text)}`
      : `met-shop-chip--${shopStatusClass(text)}`;
  return <span className={`met-shop-chip ${cls}`}>{text}</span>;
};

export const ShopModalPanel: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="met-shop-info-card">
    {title ? <h4 className="met-shop-info-card__title">{title}</h4> : null}
    <div className="met-shop-info-card__body">{children}</div>
  </section>
);

export const ShopModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-shop-detail-block">
    <h3 className="met-shop-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const ShopModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode }[];
}> = ({ rows }) => {
  const visible = rows.filter(r => r.value != null && r.value !== '' && r.value !== '—');
  if (!visible.length) return null;
  return (
    <dl className="met-shop-field-grid met-shop-field-grid--2col">
      {visible.map(r => (
        <div key={r.label} className="met-shop-field-item">
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const ShopJudgmentBox: React.FC<{
  hint: ShopJudgment;
  status?: string;
  risk?: string;
}> = ({ hint, status, risk }) => (
  <section className="met-shop-judgment-box" aria-label="系统判断">
    <div className="met-shop-judgment-box__head">
      <h4 className="met-shop-judgment-box__title">系统判断</h4>
      <div className="met-shop-judgment-box__tags">
        {status ? <ShopTag text={status} /> : null}
        {risk && !isShopEmpty(risk) ? <ShopTag text={risk} kind="risk" /> : null}
      </div>
    </div>
    <p className="met-shop-judgment-box__line">{hint.summary}</p>
    <dl className="met-shop-judgment-box__meta">
      {!isShopEmpty(hint.stuck) ? (
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
    <p className="met-shop-judgment-box__note">以操作日志和门店配置为准 · 前端演示</p>
  </section>
);

export const ShopEvidenceChain: React.FC<{ steps: string[]; compact?: boolean }> = ({
  steps,
  compact,
}) => (
  <div
    className={`met-shop-impact-chain${compact ? ' met-shop-impact-chain--compact' : ''}`}
    role="list"
  >
    {steps.map((value, i) => (
      <React.Fragment key={`${value}-${i}`}>
        {i > 0 ? <span className="met-shop-impact-chain__sep" aria-hidden>→</span> : null}
        <span className="met-shop-impact-chain__chip" role="listitem">
          {value}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export const ShopRoomTable: React.FC<{ rooms: ShopDetailRecord['rooms'] }> = ({ rooms }) => (
  <table className="met-shop-mini-table">
    <thead>
      <tr>
        <th>教室</th>
        <th>类型</th>
        <th>容量</th>
        <th>今日使用率</th>
      </tr>
    </thead>
    <tbody>
      {rooms.map(r => (
        <tr key={r.name}>
          <td>{r.name}</td>
          <td>{r.type}</td>
          <td>{r.capacity}</td>
          <td>{r.usage}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const ShopCostSummary: React.FC<{ detail: ShopDetailRecord }> = ({ detail }) => (
  <ShopModalDl
    rows={[
      { label: '月租金', value: detail.rent ? formatShopCny(detail.rent) : null },
      { label: '物业费', value: detail.propertyFee ? formatShopCny(detail.propertyFee) : null },
      { label: '人工成本', value: detail.laborCost ? formatShopCny(detail.laborCost) : null },
      { label: '其他固定成本', value: detail.otherFixed ? formatShopCny(detail.otherFixed) : null },
      { label: '月固定成本', value: detail.totalFixed ? formatShopCny(detail.totalFixed) : null },
      { label: '单日保本压力', value: detail.dailyBreakEven },
      { label: '排课产能简算', value: detail.capacityEstimate },
      { label: '成本风险', value: detail.costRisk },
    ]}
  />
);
