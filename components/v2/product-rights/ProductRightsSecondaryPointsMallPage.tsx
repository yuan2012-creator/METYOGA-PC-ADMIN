import React, { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SecondaryPageHeader, SummaryMetricGrid, type SummaryMetricItem } from '../shared';
import {
  buildPointsMallSnapshot,
  getPointsMallShelfClass,
  getPointsMallTypeClass,
  sortPointsMallRows,
  type PointsMallFilterOption,
  type PointsMallProductRow,
  type PointsMallProductType,
  type PointsMallShelfStatus,
  type PointsMallStockStatus,
  type PointsMallVisibilityStatus,
  type PointsMallSummaryItem,
} from './productRightsSecondaryPointsMall.viewModel';
import './productRightsSecondaryPointsMall.css';

export type PointsMallInitialTab = 'all' | PointsMallProductType | 'inactive';

function mapPointsMallSummaryToMetrics(items: PointsMallSummaryItem[]): SummaryMetricItem[] {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    status: item.isWarning ? 'warning' : 'normal',
  }));
}

export interface ProductRightsSecondaryPointsMallPageProps {
  initialTab?: PointsMallInitialTab;
  onBack: () => void;
  onOpenDetail: (productId: string) => void;
  onOpenNewProduct: () => void;
  onToast: (message: string) => void;
}

type FilterGroupKey =
  | 'store'
  | 'type'
  | 'shelf'
  | 'stock'
  | 'approval'
  | 'visibility'
  | 'delivery'
  | 'owner';

const FILTER_GROUPS: { key: FilterGroupKey; label: string; mockOnly?: boolean }[] = [
  { key: 'store', label: '适用门店', mockOnly: true },
  { key: 'type', label: '商品类型' },
  { key: 'shelf', label: '上架状态' },
  { key: 'stock', label: '库存状态' },
  { key: 'approval', label: '兑换审批' },
  { key: 'visibility', label: '会员端展示状态' },
  { key: 'delivery', label: '领取方式', mockOnly: true },
  { key: 'owner', label: '负责人', mockOnly: true },
];

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  type: 'all',
  shelf: 'all',
  stock: 'all',
  approval: 'all',
  visibility: 'all',
  delivery: 'all',
  owner: 'all',
};

function PointsMallItem({
  product,
  onOpenDetail,
  onToast,
}: {
  product: PointsMallProductRow;
  onOpenDetail: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const isWarn =
    product.shelfStatus === 'ruleRisk' ||
    product.shelfStatus === 'soldOut' ||
    product.stockStatus === 'lowStock' ||
    product.stockStatus === 'soldOut';

  return (
    <article
      className={['met-points-mall__item', isWarn ? 'met-points-mall__item--warn' : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(product.productId)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(product.productId);
      }}
    >
      <div className="met-points-mall__item-head">
        <div>
          <h3 className="met-points-mall__item-name">{product.productName}</h3>
          <span className={['met-points-mall__type', getPointsMallTypeClass(product.productType)].join(' ')}>
            {product.productTypeLabel}
          </span>
        </div>
        <span className={['met-points-mall__status', getPointsMallShelfClass(product.shelfStatus)].join(' ')}>
          {product.shelfStatusLabel}
        </span>
      </div>

      <div className="met-points-mall__hero">
        <div>
          <span>所需积分</span>
          <strong>{product.pointsPrice}</strong>
        </div>
        <div>
          <span>当前库存</span>
          <strong>{product.stock}</strong>
        </div>
      </div>

      <div className="met-points-mall__fields">
        <div><span>每人限兑</span><strong>{product.redeemLimit}</strong></div>
        <div><span>适用门店</span><strong>{product.applicableStores}</strong></div>
        <div><span>领取 / 发放</span><strong>{product.deliveryMethod}</strong></div>
        <div><span>兑换审批</span><strong>{product.redeemApprovalRequired ? '需审批' : '无需审批'}</strong></div>
        <div><span>会员端</span><strong>{product.visibilityStatusLabel}</strong></div>
        <div><span>兑换记录</span><strong>{product.exchangeRecordCount} 条</strong></div>
      </div>

      {product.riskTags.length > 0 ? (
        <div className="met-points-mall__tags">
          {product.riskTags.map(tag => (
            <span key={tag} className="met-points-mall__tag">{tag}</span>
          ))}
        </div>
      ) : null}

      <p className="met-points-mall__action">{product.riskNote}</p>
      <p className="met-points-mall__action">更新：{product.updatedBy} · {product.updatedAt}</p>

      <div className="met-points-mall__btns" onClick={stop}>
        <button type="button" className="met-points-mall__btn met-points-mall__btn--sm" onClick={() => onOpenDetail(product.productId)}>查看详情</button>
        <button type="button" className="met-points-mall__btn met-points-mall__btn--sm met-points-mall__btn--ghost" onClick={() => onToast('编辑积分商品配置（待建设）')}>编辑配置</button>
        <button type="button" className="met-points-mall__btn met-points-mall__btn--sm met-points-mall__btn--ghost" onClick={() => onToast('补库存（待建设）')}>补库存</button>
        <button type="button" className="met-points-mall__btn met-points-mall__btn--sm met-points-mall__btn--ghost" onClick={() => onToast('查看兑换记录（待建设）')}>查看兑换记录</button>
        <button type="button" className="met-points-mall__btn met-points-mall__btn--sm met-points-mall__btn--ghost" onClick={() => onOpenDetail(product.productId)}>预览会员端</button>
        <button type="button" className="met-points-mall__btn met-points-mall__btn--sm met-points-mall__btn--ghost" onClick={() => onToast('上下架操作（待建设）')}>上架 / 下架 mock</button>
      </div>
    </article>
  );
}

const ProductRightsSecondaryPointsMallPage: React.FC<ProductRightsSecondaryPointsMallPageProps> = ({
  initialTab = 'all',
  onBack,
  onOpenDetail,
  onOpenNewProduct,
  onToast,
}) => {
  const snapshot = useMemo(() => buildPointsMallSnapshot(), []);
  const summaryMetrics = useMemo(
    () => mapPointsMallSummaryToMetrics(snapshot.summaryItems),
    [snapshot.summaryItems],
  );
  const [activeTab, setActiveTab] = useState<PointsMallInitialTab>(initialTab);
  const [filters, setFilters] = useState<Record<FilterGroupKey, string>>(DEFAULT_FILTERS);
  const [keyword, setKeyword] = useState('');

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, PointsMallFilterOption[]>();
    FILTER_GROUPS.forEach(g => map.set(g.key, []));
    snapshot.filterOptions.forEach(opt => {
      const group = opt.group as FilterGroupKey;
      if (map.has(group)) map.get(group)!.push(opt);
    });
    return map;
  }, [snapshot.filterOptions]);

  const toggleFilter = useCallback(
    (group: FilterGroupKey, value: string) => {
      const groupDef = FILTER_GROUPS.find(g => g.key === group);
      if (groupDef?.mockOnly && value !== 'all') {
        onToast(`切换${groupDef.label}筛选（待建设）`);
      }
      setFilters(prev => ({ ...prev, [group]: value }));
    },
    [onToast],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setKeyword('');
    setActiveTab('all');
    onToast('已恢复默认筛选');
  }, [onToast]);

  const filteredRows = useMemo(() => {
    let rows = snapshot.rows;

    if (activeTab === 'inactive') {
      rows = rows.filter(r => r.shelfStatus === 'offShelf' || r.productType === 'archived');
    } else if (activeTab !== 'all') {
      rows = rows.filter(r => r.productType === activeTab);
    }

    if (filters.type !== 'all') {
      rows = rows.filter(r => r.productType === (filters.type as PointsMallProductType));
    }
    if (filters.shelf !== 'all') {
      rows = rows.filter(r => r.shelfStatus === (filters.shelf as PointsMallShelfStatus));
    }
    if (filters.stock !== 'all') {
      rows = rows.filter(r => r.stockStatus === (filters.stock as PointsMallStockStatus));
    }
    if (filters.approval !== 'all') {
      if (filters.approval === 'approvalRequired') {
        rows = rows.filter(r => r.redeemApprovalRequired);
      } else if (filters.approval === 'notRequired') {
        rows = rows.filter(r => !r.redeemApprovalRequired);
      }
    }
    if (filters.visibility !== 'all') {
      rows = rows.filter(r => r.visibilityStatus === (filters.visibility as PointsMallVisibilityStatus));
    }
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      rows = rows.filter(r => r.productName.toLowerCase().includes(q));
    }

    return sortPointsMallRows(rows);
  }, [snapshot.rows, activeTab, filters, keyword]);

  const tabDescription =
    activeTab === 'inactive'
      ? snapshot.typeDescriptions.inactive
      : snapshot.typeDescriptions[activeTab === 'all' ? 'all' : activeTab];

  return (
    <div className="met-points-mall met-v2-density-compact">
      <div className="met-points-mall__inner">
        <SecondaryPageHeader
          backLabel="返回产品与权益"
          onBack={onBack}
          breadcrumb={`${snapshot.meta.breadcrumbParent} / ${snapshot.meta.breadcrumbCurrent}`}
          title={snapshot.meta.title}
          subtitle={snapshot.meta.subtitle}
          scope={snapshot.meta.scopeLabel}
          description={snapshot.meta.description}
          primaryActionLabel="新增商品（待建设）"
          onPrimaryAction={onOpenNewProduct}
          disclaimer={snapshot.meta.disclaimer}
        />

        <SummaryMetricGrid items={summaryMetrics} />

        <section>
          <div className="met-points-mall__tabs">
            {snapshot.typeTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={['met-points-mall__tab', activeTab === tab.value ? 'is-active' : ''].join(' ')}
                onClick={() => setActiveTab(tab.value as PointsMallInitialTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="met-points-mall__tab-desc">{tabDescription}</p>
        </section>

        <section className="met-points-mall__filters">
          {FILTER_GROUPS.map(group => (
            <div key={group.key} className="met-points-mall__filter-group">
              <span className="met-points-mall__filter-label">{group.label}</span>
              <div className="met-points-mall__filter-chips">
                {(optionsByGroup.get(group.key) ?? []).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={['met-points-mall__chip', filters[group.key] === opt.value ? 'is-active' : ''].join(' ')}
                    onClick={() => toggleFilter(group.key, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="met-points-mall__filter-foot">
            <div className="met-points-mall__search">
              <Search size={14} aria-hidden />
              <input
                type="search"
                placeholder="搜索商品名称"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button type="button" className="met-points-mall__btn met-points-mall__btn--ghost met-points-mall__btn--sm" onClick={resetFilters}>
              重置筛选
            </button>
          </div>
        </section>

        <section className="met-points-mall__risks">
          {snapshot.ruleRisks.map(risk => (
            <div key={risk.id} className="met-points-mall__risk">
              <strong>{risk.riskType} · {risk.productName}</strong>
              <span>影响：{risk.impactScope}</span>
              <em>建议：{risk.suggestedAction}</em>
              <div className="met-points-mall__risk-foot">
                <button
                  type="button"
                  className="met-points-mall__btn met-points-mall__btn--sm"
                  onClick={() =>
                    risk.relatedProductId
                      ? onOpenDetail(risk.relatedProductId)
                      : onToast(`${risk.ctaLabel}（待建设）`)
                  }
                >
                  {risk.ctaLabel}
                </button>
              </div>
            </div>
          ))}
        </section>

        {filteredRows.length > 0 ? (
          <section className="met-points-mall__grid">
            {filteredRows.map(product => (
              <PointsMallItem key={product.productId} product={product} onOpenDetail={onOpenDetail} onToast={onToast} />
            ))}
          </section>
        ) : (
          <div className="met-points-mall__empty">
            <h3>暂无匹配商品</h3>
            <p>当前筛选条件下没有积分商品，请调整筛选或重置后重试。</p>
          </div>
        )}

        <section className="met-points-mall__exchange">
          <h2>兑换记录入口</h2>
          <div className="met-points-mall__exchange-grid">
            {snapshot.exchangeRecordEntries.map(entry => (
              <button
                key={entry.id}
                type="button"
                className="met-points-mall__exchange-card"
                onClick={() => onToast(entry.toast)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductRightsSecondaryPointsMallPage;
