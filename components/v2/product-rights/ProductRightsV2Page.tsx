import React, { useCallback, useMemo, useState } from 'react';
import {
  buildProductRightsV2Snapshot,
  getProductRightsPriorityClass,
  getProductRightsStatusClass,
  type ProductCardSummary,
  type MallProductSummary,
} from './productRightsV2.viewModel';
import './productRightsV2.css';

const ProductRightsV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildProductRightsV2Snapshot(), []);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    console.log('[ProductRightsV2]', message);
    setToast(message);
    window.setTimeout(
      () => setToast(current => (current === message ? null : current)),
      2400,
    );
  }, []);

  const {
    meta,
    healthSummary,
    subDomains,
    cardProducts,
    mallOverview,
    mallProducts,
    riskRules,
    permissions,
    actionQueue,
  } = snapshot;

  const renderCardProduct = (card: ProductCardSummary) => (
    <article key={card.cardTypeId} className="met-product-rights-v2-card met-product-rights-v2-card--product">
      <div className="met-product-rights-v2-card__head">
        <h3 className="met-product-rights-v2-card__title">{card.cardName}</h3>
        <span className="met-product-rights-v2-card__badge">{card.statusLabel}</span>
      </div>
      <p className="met-product-rights-v2-card__type">{card.cardCategoryLabel}</p>
      <div className="met-product-rights-v2-card__fields">
        <div><span>价格</span><strong>{card.price}</strong></div>
        <div><span>点数</span><strong>{card.pointsTotal}</strong></div>
        <div><span>有效期</span><strong>{card.validityDays}</strong></div>
        {card.bookingWindowDays ? (
          <div><span>预约窗口</span><strong>{card.bookingWindowDays}</strong></div>
        ) : null}
        <div><span>适用门店</span><strong>{card.applicableStores}</strong></div>
        {card.contractBindingLabel ? (
          <div><span>合同绑定</span><strong>{card.contractBindingLabel}</strong></div>
        ) : null}
        <div>
          <span>会员端展示</span>
          <strong>{card.visibleOnMemberApp ? '显示' : '隐藏'}</strong>
        </div>
      </div>
      {card.ruleNote ? <p className="met-product-rights-v2-card__note">{card.ruleNote}</p> : null}
    </article>
  );

  const renderMallProduct = (product: MallProductSummary) => (
    <article key={product.productId} className="met-product-rights-v2-card met-product-rights-v2-card--mall">
      <div className="met-product-rights-v2-card__head">
        <h3 className="met-product-rights-v2-card__title">{product.productName}</h3>
        <span className={`met-product-rights-v2-card__badge${product.shelfStatus === 'soldOut' ? ' is-warn' : ''}`}>
          {product.shelfStatusLabel}
        </span>
      </div>
      <p className="met-product-rights-v2-card__type">{product.productTypeLabel}</p>
      <div className="met-product-rights-v2-card__fields">
        <div><span>所需积分</span><strong>{product.pointsPrice}</strong></div>
        <div><span>库存</span><strong>{product.stock}</strong></div>
        <div><span>兑换方式</span><strong>{product.deliveryMethod}</strong></div>
      </div>
      {product.riskNote ? <p className="met-product-rights-v2-card__note">{product.riskNote}</p> : null}
    </article>
  );

  return (
    <div className="met-product-rights-v2">
      <div className="met-product-rights-v2__inner">
        <header className="met-product-rights-v2__header">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
        </header>

        <section className="met-product-rights-v2-zone">
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--health">
            <div className="met-product-rights-v2-panel__head">
              <h2>{healthSummary.conclusion}</h2>
              <span className="met-product-rights-v2-panel__status">{healthSummary.statusLabel}</span>
            </div>
            <p className="met-product-rights-v2-panel__desc">{healthSummary.description}</p>
            <div className="met-product-rights-v2-evidence-grid">
              {healthSummary.metrics.map(metric => (
                <div key={metric.label} className="met-product-rights-v2-evidence-item">
                  <span className="met-product-rights-v2-evidence-item__value">{metric.value}</span>
                  <span className="met-product-rights-v2-evidence-item__label">{metric.label}</span>
                </div>
              ))}
            </div>
            <div className="met-product-rights-v2-panel__actions">
              <button
                type="button"
                className="met-product-rights-v2-btn met-product-rights-v2-btn--ghost"
                onClick={() => showToast(healthSummary.evidenceToastMessage)}
              >
                {healthSummary.evidenceButtonLabel}
              </button>
              <button
                type="button"
                className="met-product-rights-v2-btn"
                onClick={() => showToast(healthSummary.primaryActionToastMessage)}
              >
                {healthSummary.primaryActionLabel}
              </button>
            </div>
          </article>
        </section>

        <section className="met-product-rights-v2-zone">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">核心配置入口</h2>
            <p className="met-product-rights-v2-zone__subtitle">卡项、点数、预约权益、积分、商城、赠送权益与合同绑定</p>
          </header>
          <div className="met-product-rights-v2-subdomain-grid">
            {subDomains.map(domain => (
              <article
                key={domain.id}
                className={['met-product-rights-v2-subdomain', getProductRightsStatusClass(domain.status)].join(' ')}
              >
                <div className="met-product-rights-v2-subdomain__head">
                  <h3>{domain.title}</h3>
                  <span>{domain.statusLabel}</span>
                </div>
                <p className="met-product-rights-v2-subdomain__coverage">{domain.coverage}</p>
                <p className="met-product-rights-v2-subdomain__pending">待处理：{domain.pendingItem}</p>
                <p className="met-product-rights-v2-subdomain__risk">{domain.riskNote}</p>
                <button
                  type="button"
                  className="met-product-rights-v2-btn met-product-rights-v2-btn--sm"
                  onClick={() => showToast(domain.actionToast)}
                >
                  {domain.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="met-product-rights-v2-zone">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">卡项配置摘要</h2>
          </header>
          <div className="met-product-rights-v2-product-grid">
            {cardProducts.map(renderCardProduct)}
          </div>
        </section>

        <section className="met-product-rights-v2-zone">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">积分商城摘要</h2>
          </header>
          <div className="met-product-rights-v2-mall-overview">
            <span>上架商品 <strong>{mallOverview.onShelfCount}</strong></span>
            <span>售罄商品 <strong>{mallOverview.soldOutCount}</strong></span>
            <span>低库存商品 <strong>{mallOverview.lowStockCount}</strong></span>
            <span>需审批兑换 <strong>{mallOverview.approvalRequiredCount}</strong></span>
            <span>本月兑换记录 <strong>{mallOverview.monthlyExchangeCount}</strong></span>
          </div>
          <div className="met-product-rights-v2-product-grid met-product-rights-v2-product-grid--mall">
            {mallProducts.map(renderMallProduct)}
          </div>
        </section>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--split">
          <article className="met-product-rights-v2-panel">
            <h2 className="met-product-rights-v2-zone__title">权益规则与风险提示</h2>
            <ul className="met-product-rights-v2-risk-list">
              {riskRules.map(rule => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
          <article className="met-product-rights-v2-panel">
            <h2 className="met-product-rights-v2-zone__title">权限边界</h2>
            <div className="met-product-rights-v2-permission-list">
              {permissions.map(row => (
                <div key={row.role} className="met-product-rights-v2-permission-row">
                  <span>{row.role}</span>
                  <p>{row.summary}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="met-product-rights-v2-zone">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">操作队列</h2>
            <p className="met-product-rights-v2-zone__subtitle">优先处理影响会员端展示与财务口径的配置事项</p>
          </header>
          <div className="met-product-rights-v2-action-queue">
            {actionQueue.map(item => (
              <div key={item.id} className={`met-product-rights-v2-action-item met-product-rights-v2-action-item--${item.priority.toLowerCase()}`}>
                <span className={['met-product-rights-v2-priority', getProductRightsPriorityClass(item.priority)].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-product-rights-v2-action-item__main">
                  <p className="met-product-rights-v2-action-item__title">{item.title}</p>
                  <p className="met-product-rights-v2-action-item__meta">
                    影响：{item.impactScope} · 负责人：{item.ownerRole}
                  </p>
                  <p className="met-product-rights-v2-action-item__action">{item.suggestedAction}</p>
                </div>
                <button
                  type="button"
                  className="met-product-rights-v2-btn met-product-rights-v2-btn--sm met-product-rights-v2-btn--ghost"
                  onClick={() => showToast(item.actionToast)}
                >
                  {item.buttonLabel}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {toast ? <div className="met-product-rights-v2-toast" role="status">{toast}</div> : null}
    </div>
  );
};

export default ProductRightsV2Page;
