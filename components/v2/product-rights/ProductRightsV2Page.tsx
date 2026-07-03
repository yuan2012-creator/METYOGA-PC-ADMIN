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
    priorityActions,
    configDomains,
    cardProducts,
    pointsMallSummary,
    mallProducts,
    rightsGuardrails,
    permissionBoundaries,
    detailEntries,
  } = snapshot;

  const renderCardProduct = (card: ProductCardSummary) => (
    <article key={card.cardTypeId} className="met-product-rights-v2-card met-product-rights-v2-card--product">
      <div className="met-product-rights-v2-card__head">
        <h3 className="met-product-rights-v2-card__title">{card.cardName}</h3>
        <span className="met-product-rights-v2-card__badge">{card.statusLabel}</span>
      </div>
      <p className="met-product-rights-v2-card__type">{card.cardCategoryLabel}</p>
      <div className="met-product-rights-v2-card__hero">
        <div className="met-product-rights-v2-card__hero-item">
          <span>价格</span>
          <strong>{card.price}</strong>
        </div>
        <div className="met-product-rights-v2-card__hero-item">
          <span>点数</span>
          <strong>{card.pointsTotal}</strong>
        </div>
      </div>
      <div className="met-product-rights-v2-card__tags">
        {card.contractBindingLabel ? (
          <span className="met-product-rights-v2-card__tag">合同 {card.contractBindingLabel}</span>
        ) : null}
        <span className="met-product-rights-v2-card__tag">
          会员端 {card.visibleOnMemberApp ? '显示' : '隐藏'}
        </span>
      </div>
      <div className="met-product-rights-v2-card__fields">
        <div><span>有效期</span><strong>{card.validityDays}</strong></div>
        {card.bookingWindowDays ? (
          <div><span>预约窗口</span><strong>{card.bookingWindowDays}</strong></div>
        ) : null}
        <div><span>适用门店</span><strong>{card.applicableStores}</strong></div>
      </div>
      {card.ruleNotes?.length ? (
        <ul className="met-product-rights-v2-card__notes">
          {card.ruleNotes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );

  const renderMallProduct = (product: MallProductSummary) => (
    <article
      key={product.productId}
      className={[
        'met-product-rights-v2-card',
        'met-product-rights-v2-card--mall',
        product.shelfStatus === 'soldOut' ? 'is-sold-out' : '',
      ].join(' ')}
    >
      <div className="met-product-rights-v2-card__head">
        <h3 className="met-product-rights-v2-card__title">{product.productName}</h3>
        <span className={`met-product-rights-v2-card__badge${product.shelfStatus === 'soldOut' ? ' is-warn' : ''}`}>
          {product.shelfStatusLabel}
        </span>
      </div>
      <p className="met-product-rights-v2-card__type">{product.productTypeLabel}</p>
      <div className="met-product-rights-v2-card__hero met-product-rights-v2-card__hero--single">
        <div className="met-product-rights-v2-card__hero-item">
          <span>所需积分</span>
          <strong>{product.pointsPrice}</strong>
        </div>
      </div>
      <div className="met-product-rights-v2-card__fields">
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

        {/* 1. 产品权益健康判断 */}
        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--hero">
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--health">
            <div className="met-product-rights-v2-panel__head">
              <h2>{healthSummary.conclusion}</h2>
              <span className="met-product-rights-v2-panel__status">{healthSummary.statusLabel}</span>
            </div>
            <p className="met-product-rights-v2-panel__desc">{healthSummary.description}</p>
            <div className="met-product-rights-v2-panel__tags">
              {healthSummary.impactScopeTags.map(tag => (
                <span key={tag} className="met-product-rights-v2-tag met-product-rights-v2-tag--impact">{tag}</span>
              ))}
              <span className="met-product-rights-v2-tag met-product-rights-v2-tag--source">
                {healthSummary.suggestionSourceLabel}
              </span>
            </div>
            <p className="met-product-rights-v2-panel__meta">
              最近更新：{healthSummary.updatedAt}
            </p>
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

        {/* 2. 当前最需要处理 */}
        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--priority">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">当前最需要处理</h2>
            <p className="met-product-rights-v2-zone__subtitle">
              优先处理会影响会员展示、退费、积分与合同一致性的事项
            </p>
          </header>
          <div className="met-product-rights-v2-action-queue">
            {priorityActions.map(item => (
              <div
                key={item.id}
                className={`met-product-rights-v2-action-item met-product-rights-v2-action-item--${item.priority.toLowerCase()}`}
              >
                <span className={['met-product-rights-v2-priority', getProductRightsPriorityClass(item.priority)].join(' ')}>
                  {item.priority}
                </span>
                <div className="met-product-rights-v2-action-item__main">
                  <p className="met-product-rights-v2-action-item__title">{item.title}</p>
                  <p className="met-product-rights-v2-action-item__meta">
                    影响：{item.impactScope} · 负责人：{item.ownerRole} · 来源：{item.source}
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

        {/* 3. 核心配置分类 */}
        <section className="met-product-rights-v2-zone">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">核心配置分类</h2>
            <p className="met-product-rights-v2-zone__subtitle">
              按卡项、点数、预约、积分、商城、赠送权益和合同拆开管理
            </p>
          </header>
          <div className="met-product-rights-v2-domain-grid">
            {configDomains.map(domain => (
              <article
                key={domain.id}
                className={[
                  'met-product-rights-v2-domain',
                  getProductRightsStatusClass(domain.status),
                  domain.featured ? 'is-featured' : '',
                ].join(' ')}
              >
                <div className="met-product-rights-v2-domain__head">
                  <h3>{domain.title}</h3>
                  <span className="met-product-rights-v2-domain__status">{domain.statusLabel}</span>
                </div>
                <p className="met-product-rights-v2-domain__coverage">{domain.coverage}</p>
                <p className="met-product-rights-v2-domain__pending">{domain.pendingItem}</p>
                <p className="met-product-rights-v2-domain__impact">
                  <span>影响</span>{domain.impactModules}
                </p>
                <button
                  type="button"
                  className="met-product-rights-v2-btn met-product-rights-v2-btn--sm met-product-rights-v2-btn--ghost"
                  onClick={() => showToast(domain.actionToast)}
                >
                  {domain.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* 4. 当前在售卡项摘要 */}
        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--detail">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">当前在售卡项摘要</h2>
            <p className="met-product-rights-v2-zone__subtitle">
              只展示主要卡项，完整配置进入卡项配置二级页后建设
            </p>
          </header>
          <div className="met-product-rights-v2-product-grid">
            {cardProducts.map(renderCardProduct)}
          </div>
        </section>

        {/* 5. 积分商城摘要 */}
        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--detail">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">积分商城摘要</h2>
            <p className="met-product-rights-v2-zone__subtitle">{pointsMallSummary.disclaimer}</p>
          </header>
          <div className="met-product-rights-v2-mall-overview">
            <span>上架商品 <strong>{pointsMallSummary.onShelfCount}</strong></span>
            <span>售罄商品 <strong>{pointsMallSummary.soldOutCount}</strong></span>
            <span>低库存商品 <strong>{pointsMallSummary.lowStockCount}</strong></span>
            <span>需审批兑换 <strong>{pointsMallSummary.approvalRequiredCount}</strong></span>
            <span>本月兑换记录 <strong>{pointsMallSummary.monthlyExchangeCount}</strong></span>
          </div>
          <div className="met-product-rights-v2-product-grid met-product-rights-v2-product-grid--mall">
            {mallProducts.map(renderMallProduct)}
          </div>
        </section>

        {/* 6. 权益规则红线 + 角色权限边界 */}
        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--split">
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--guardrail">
            <h2 className="met-product-rights-v2-zone__title">权益规则红线</h2>
            <ul className="met-product-rights-v2-risk-list">
              {rightsGuardrails.map(rule => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--permission">
            <h2 className="met-product-rights-v2-zone__title">角色权限边界</h2>
            <div className="met-product-rights-v2-permission-list">
              {permissionBoundaries.map(row => (
                <div key={row.role} className="met-product-rights-v2-permission-row">
                  <span>{row.role}</span>
                  <p>{row.summary}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* 7. 后续配置入口 */}
        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--entries">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">后续配置入口</h2>
          </header>
          <div className="met-product-rights-v2-detail-entries">
            {detailEntries.map(entry => (
              <button
                key={entry.id}
                type="button"
                className="met-product-rights-v2-detail-entry"
                onClick={() => showToast(entry.actionToast)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {toast ? <div className="met-product-rights-v2-toast" role="status">{toast}</div> : null}
    </div>
  );
};

export default ProductRightsV2Page;
