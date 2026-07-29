import React, { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SecondaryPageHeader, SummaryMetricGrid, type SummaryMetricItem } from '../shared';
import {
  buildCardConfigSnapshot,
  getCardConfigCategoryClass,
  getCardConfigStatusClass,
  sortCardConfigRows,
  type CardConfigCategory,
  type CardConfigFilterOption,
  type CardConfigRow,
  type CardConfigStatus,
  type CardConfigSummaryItem,
} from './productRightsSecondaryCardConfig.viewModel';
import './productRightsSecondaryCardConfig.css';

export type CardConfigInitialTab = 'all' | CardConfigCategory | 'inactive';

function mapCardConfigSummaryToMetrics(items: CardConfigSummaryItem[]): SummaryMetricItem[] {
  return items.map(item => ({
    id: item.id,
    label: item.label,
    value: item.value,
    status: item.isWarning ? 'warning' : 'normal',
  }));
}

export interface ProductRightsSecondaryCardConfigPageProps {
  initialTab?: CardConfigInitialTab;
  onBack: () => void;
  onOpenDetail: (cardTypeId: string) => void;
  onOpenNewCard: () => void;
  onToast: (message: string) => void;
}

type FilterGroupKey = 'store' | 'category' | 'status' | 'contract' | 'visibility' | 'channel' | 'owner';

const FILTER_GROUPS: { key: FilterGroupKey; label: string; mockOnly?: boolean }[] = [
  { key: 'store', label: '门店适用范围', mockOnly: true },
  { key: 'category', label: '卡项分类' },
  { key: 'status', label: '卡项状态' },
  { key: 'contract', label: '合同绑定状态' },
  { key: 'visibility', label: '会员端展示状态' },
  { key: 'channel', label: '销售渠道', mockOnly: true },
  { key: 'owner', label: '负责人', mockOnly: true },
];

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  category: 'all',
  status: 'all',
  contract: 'all',
  visibility: 'all',
  channel: 'all',
  owner: 'all',
};

function CardConfigItem({
  card,
  onOpenDetail,
  onToast,
}: {
  card: CardConfigRow;
  onOpenDetail: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const isWarn = card.status === 'contractMissing' || card.status === 'ruleRisk';

  return (
    <article
      className={['met-card-config__item', isWarn ? 'met-card-config__item--warn' : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(card.cardTypeId)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(card.cardTypeId);
      }}
    >
      <div className="met-card-config__item-head">
        <div>
          <h3 className="met-card-config__item-name">{card.cardName}</h3>
          <span className={['met-card-config__cat', getCardConfigCategoryClass(card.cardCategory)].join(' ')}>
            {card.cardCategoryLabel}
          </span>
        </div>
        <span className={['met-card-config__status', getCardConfigStatusClass(card.status)].join(' ')}>
          {card.statusLabel}
        </span>
      </div>

      <div className="met-card-config__hero">
        <div>
          <span>售价</span>
          <strong>{card.price}</strong>
        </div>
        <div>
          <span>总{card.benefitUnit}</span>
          <strong>{card.pointsTotal}</strong>
        </div>
      </div>

      <div className="met-card-config__fields">
        <div><span>有效期</span><strong>{card.validityDays}</strong></div>
        <div><span>预约窗口</span><strong>{card.bookingWindowDays}</strong></div>
        <div><span>适用门店</span><strong>{card.applicableStores}</strong></div>
        <div><span>适用课程</span><strong>{card.applicableCourses}</strong></div>
        <div><span>退费规则</span><strong>{card.refundRuleSummary}</strong></div>
        <div><span>冻结 / 转卡</span><strong>{card.freezeAllowed ? '可冻结' : '不可冻结'} · {card.transferAllowed ? '可转卡' : '不可转卡'}</strong></div>
        <div><span>合同绑定</span><strong>{card.contractBindingStatusLabel}</strong></div>
        <div><span>会员端</span><strong>{card.memberAppVisibilityLabel}</strong></div>
      </div>

      {card.riskTags.length > 0 ? (
        <div className="met-card-config__tags">
          {card.riskTags.map(tag => (
            <span key={tag} className="met-card-config__tag">{tag}</span>
          ))}
        </div>
      ) : null}

      <p className="met-card-config__action">{card.suggestedAction}</p>
      <p className="met-card-config__action">更新：{card.createdBy} · {card.updatedAt}</p>

      <div className="met-card-config__btns" onClick={stop}>
        <button type="button" className="met-card-config__btn met-card-config__btn--sm" onClick={() => onOpenDetail(card.cardTypeId)}>查看详情</button>
        <button type="button" className="met-card-config__btn met-card-config__btn--sm met-card-config__btn--ghost" onClick={() => onToast('编辑卡项配置（待建设）')}>编辑配置</button>
        <button type="button" className="met-card-config__btn met-card-config__btn--sm met-card-config__btn--ghost" onClick={() => onToast('绑定合同模板（待建设）')}>绑定合同</button>
        <button type="button" className="met-card-config__btn met-card-config__btn--sm met-card-config__btn--ghost" onClick={() => onOpenDetail(card.cardTypeId)}>预览会员端</button>
        <button type="button" className="met-card-config__btn met-card-config__btn--sm met-card-config__btn--ghost" onClick={() => onToast('提交审核（待建设）')}>提交审核</button>
        <button type="button" className="met-card-config__btn met-card-config__btn--sm met-card-config__btn--ghost" onClick={() => onToast('上下架操作（待建设）')}>上架 / 下架 mock</button>
      </div>
    </article>
  );
}

const ProductRightsSecondaryCardConfigPage: React.FC<ProductRightsSecondaryCardConfigPageProps> = ({
  initialTab = 'all',
  onBack,
  onOpenDetail,
  onOpenNewCard,
  onToast,
}) => {
  const snapshot = useMemo(() => buildCardConfigSnapshot(), []);
  const summaryMetrics = useMemo(
    () => mapCardConfigSummaryToMetrics(snapshot.summaryItems),
    [snapshot.summaryItems],
  );
  const [activeTab, setActiveTab] = useState<CardConfigInitialTab>(initialTab);
  const [filters, setFilters] = useState<Record<FilterGroupKey, string>>(DEFAULT_FILTERS);
  const [keyword, setKeyword] = useState('');

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, CardConfigFilterOption[]>();
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
      rows = rows.filter(r => r.status === 'inactive' || r.status === 'archived');
    } else if (activeTab !== 'all') {
      rows = rows.filter(r => r.cardCategory === activeTab);
    }

    if (filters.category !== 'all') {
      rows = rows.filter(r => r.cardCategory === filters.category);
    }
    if (filters.status !== 'all') {
      rows = rows.filter(r => r.status === (filters.status as CardConfigStatus));
    }
    if (filters.contract !== 'all') {
      rows = rows.filter(r => r.contractBindingStatus === filters.contract);
    }
    if (filters.visibility !== 'all') {
      rows = rows.filter(r => r.memberAppVisibilityStatus === filters.visibility);
    }
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      rows = rows.filter(r => r.cardName.toLowerCase().includes(q));
    }

    return sortCardConfigRows(rows);
  }, [snapshot.rows, activeTab, filters, keyword]);

  const tabDescription =
    activeTab === 'inactive'
      ? snapshot.categoryDescriptions.inactive
      : snapshot.categoryDescriptions[activeTab === 'all' ? 'all' : activeTab];

  return (
    <div className="met-card-config met-v2-density-compact">
      <div className="met-card-config__inner">
        <SecondaryPageHeader
          backLabel="返回产品与权益"
          onBack={onBack}
          breadcrumb={`${snapshot.meta.breadcrumbParent} / ${snapshot.meta.breadcrumbCurrent}`}
          title={snapshot.meta.title}
          subtitle={snapshot.meta.subtitle}
          scope={snapshot.meta.scopeLabel}
          description={snapshot.meta.description}
          primaryActionLabel="新增卡项（待建设）"
          onPrimaryAction={onOpenNewCard}
          disclaimer={snapshot.meta.disclaimer}
        />

        <SummaryMetricGrid
          items={summaryMetrics}
          className="met-card-config__summary-grid"
          compact
        />

        <section>
          <div className="met-card-config__tabs">
            {snapshot.categoryTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={['met-card-config__tab', activeTab === tab.value ? 'is-active' : ''].join(' ')}
                onClick={() => setActiveTab(tab.value as CardConfigInitialTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="met-card-config__tab-desc">{tabDescription}</p>
        </section>

        <section className="met-card-config__filters">
          {FILTER_GROUPS.map(group => (
            <div key={group.key} className="met-card-config__filter-group">
              <span className="met-card-config__filter-label">{group.label}</span>
              <div className="met-card-config__filter-chips">
                {(optionsByGroup.get(group.key) ?? []).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={['met-card-config__chip', filters[group.key] === opt.value ? 'is-active' : ''].join(' ')}
                    onClick={() => toggleFilter(group.key, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="met-card-config__filter-foot">
            <div className="met-card-config__search">
              <Search size={14} aria-hidden />
              <input
                type="search"
                placeholder="搜索卡项名称"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button type="button" className="met-card-config__btn met-card-config__btn--ghost met-card-config__btn--sm" onClick={resetFilters}>
              重置筛选
            </button>
          </div>
        </section>

        <section className="met-card-config__risks">
          {snapshot.ruleRisks.map(risk => (
            <div key={risk.id} className="met-card-config__risk">
              <strong>{risk.riskType} · {risk.cardName}</strong>
              <span>影响：{risk.impactScope}</span>
              <em>建议：{risk.suggestedAction}</em>
              <div className="met-card-config__risk-foot">
                <button
                  type="button"
                  className="met-card-config__btn met-card-config__btn--sm"
                  onClick={() =>
                    risk.relatedCardTypeId
                      ? onOpenDetail(risk.relatedCardTypeId)
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
          <section className="met-card-config__grid">
            {filteredRows.map(card => (
              <CardConfigItem key={card.cardTypeId} card={card} onOpenDetail={onOpenDetail} onToast={onToast} />
            ))}
          </section>
        ) : (
          <div className="met-card-config__empty">
            <h3>暂无匹配卡项</h3>
            <p>当前筛选条件下没有卡项，请调整筛选或重置后重试。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRightsSecondaryCardConfigPage;
