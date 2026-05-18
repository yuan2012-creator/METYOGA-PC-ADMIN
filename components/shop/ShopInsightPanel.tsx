import React from 'react';
import type { ShopInsight } from './shopOperationViewModel';

const ShopInsightPanel: React.FC<{
  tips: ShopInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-shop-insights">
    <h2 className="met-shop-insights__title">门店经营建议</h2>
    <div className="met-shop-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-shop-insight-card met-today-surface">
          <div className="met-shop-insight-card__main">
            <span className="met-shop-insight-card__tag">{tip.tag}</span>
            <p className="met-shop-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default ShopInsightPanel;
