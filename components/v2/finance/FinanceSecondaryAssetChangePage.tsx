import React, { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SecondaryPageHeader } from '../shared';
import {
  buildAssetChangeSnapshot,
  getAssetChangeEvidenceClass,
  getAssetChangeEvidenceDotClass,
  getAssetChangeStatusClass,
  getAssetChangeTypeClass,
  type AssetChangeFilterOption,
  type AssetChangeRequestRow,
} from './financeSecondaryAssetChange.viewModel';
import './financeSecondaryAssetChange.css';

export interface FinanceSecondaryAssetChangePageProps {
  onBack: () => void;
  onOpenDetail: (requestId: string) => void;
  onToast: (message: string) => void;
}

type FilterGroupKey = 'store' | 'status' | 'evidence' | 'node' | 'owner' | 'time';
type TypeTabValue = 'all' | 'refund' | 'freeze' | 'transfer';

const FILTER_GROUPS: { key: FilterGroupKey; label: string; mockOnly?: boolean }[] = [
  { key: 'store', label: '门店', mockOnly: true },
  { key: 'status', label: '申请状态' },
  { key: 'evidence', label: '证据状态' },
  { key: 'node', label: '当前节点', mockOnly: true },
  { key: 'owner', label: '负责人', mockOnly: true },
  { key: 'time', label: '时间范围', mockOnly: true },
];

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  status: 'all',
  evidence: 'all',
  node: 'all',
  owner: 'all',
  time: 'all',
};

function RequestRowCard({
  row,
  selected,
  onToggleSelect,
  onOpenDetail,
  onToast,
}: {
  row: AssetChangeRequestRow;
  selected: boolean;
  onToggleSelect: (requestId: string) => void;
  onOpenDetail: (requestId: string) => void;
  onToast: (message: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const isUrgent =
    row.approvalStatus === 'evidencePending' || row.approvalStatus === 'pendingReview';

  return (
    <article
      className={[
        'met-asset-change__row',
        isUrgent ? 'met-asset-change__row--urgent' : '',
        selected ? 'is-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(row.requestId)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(row.requestId);
      }}
    >
      <div className="met-asset-change__row-check" onClick={stop}>
        <input
          type="checkbox"
          checked={selected}
          aria-label={`选择申请 ${row.requestId}`}
          onChange={() => onToggleSelect(row.requestId)}
        />
      </div>

      <div className="met-asset-change__row-main">
        <div className="met-asset-change__row-head">
          <div className="met-asset-change__row-identity">
            <span className="met-asset-change__request-id">{row.requestId}</span>
            <span className={['met-asset-change__type', getAssetChangeTypeClass(row.requestType)].join(' ')}>
              {row.requestTypeLabel}
            </span>
            <h3 className="met-asset-change__member-name">{row.memberName}</h3>
            <span className="met-asset-change__phone">{row.maskedPhone}</span>
          </div>
          <div className="met-asset-change__row-status">
            <span className={['met-asset-change__approval', getAssetChangeStatusClass(row.approvalStatus)].join(' ')}>
              {row.approvalStatusLabel}
            </span>
            <span className={['met-asset-change__evidence-badge', getAssetChangeEvidenceClass(row.evidenceStatus)].join(' ')}>
              {row.evidenceCompleteness}
            </span>
          </div>
        </div>

        <div className="met-asset-change__row-body">
          <div className="met-asset-change__row-col">
            <span className="met-asset-change__label">卡项</span>
            <span>{row.cardName}</span>
            <strong>{row.remainingPointsLabel}</strong>
          </div>
          <div className="met-asset-change__row-col">
            <span className="met-asset-change__label">金额估算</span>
            <span>{row.amountEstimate}</span>
            <em>{row.amountEstimateNote}</em>
          </div>
          <div className="met-asset-change__row-col">
            <span className="met-asset-change__label">赠送权益</span>
            <span className="met-asset-change__gift-no">不计入</span>
            <span className="met-asset-change__points-deduct">{row.pointsDeductStatusLabel}</span>
          </div>
          <div className="met-asset-change__row-col met-asset-change__row-col--wide">
            <span className="met-asset-change__label">申请原因</span>
            <span>{row.requestReason}</span>
          </div>
        </div>

        <div className="met-asset-change__evidence-dots">
          {row.evidenceItems.map(item => (
            <span
              key={item.key}
              className={['met-asset-change__evidence-dot', getAssetChangeEvidenceDotClass(item.status)].join(' ')}
              title={`${item.label}：${item.statusLabel}`}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="met-asset-change__row-meta">
          <span>当前节点：{row.currentNode}</span>
          <span>处理人：{row.owner}</span>
          <span>申请：{row.createdAt}</span>
          <span>更新：{row.updatedAt}</span>
        </div>

        <p className="met-asset-change__suggested">{row.suggestedAction}</p>
      </div>

      <div className="met-asset-change__row-actions" onClick={stop}>
        <button
          type="button"
          className="met-asset-change__btn met-asset-change__btn--sm"
          onClick={() => onOpenDetail(row.requestId)}
        >
          查看详情
        </button>
        <button
          type="button"
          className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
          onClick={() => onToast('补充证据（待建设）')}
        >
          补充证据
        </button>
        <button
          type="button"
          className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
          onClick={() => onToast('提交复核（待建设）')}
        >
          提交复核
        </button>
        <button
          type="button"
          className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
          onClick={() => onToast('标记已处理（待建设）')}
        >
          标记已处理
        </button>
        <button
          type="button"
          className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
          onClick={() => onToast('查看会员（待建设）')}
        >
          查看会员
        </button>
      </div>
    </article>
  );
}

const FinanceSecondaryAssetChangePage: React.FC<FinanceSecondaryAssetChangePageProps> = ({
  onBack,
  onOpenDetail,
  onToast,
}) => {
  const snapshot = useMemo(() => buildAssetChangeSnapshot(), []);
  const [activeTab, setActiveTab] = useState<TypeTabValue>('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, AssetChangeFilterOption[]>();
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

  const toggleSelect = useCallback((requestId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(requestId)) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const displayedRows = useMemo(() => {
    let rows = snapshot.rows;

    if (activeTab !== 'all') {
      rows = rows.filter(row => row.requestType === activeTab);
    }
    if (filters.status !== 'all') {
      rows = rows.filter(row => row.approvalStatus === filters.status);
    }
    if (filters.evidence !== 'all') {
      rows = rows.filter(row => row.evidenceStatus === filters.evidence);
    }
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      rows = rows.filter(
        row =>
          row.memberName.toLowerCase().includes(q) ||
          row.maskedPhone.includes(q) ||
          row.requestId.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [snapshot.rows, activeTab, filters.status, filters.evidence, keyword]);

  const typeDescription = snapshot.typeDescriptions[activeTab];

  return (
    <div className="met-asset-change">
      <div className="met-asset-change__inner">
        <SecondaryPageHeader
          backLabel="返回财务与资产"
          onBack={onBack}
          breadcrumb={`${snapshot.meta.breadcrumbParent} / ${snapshot.meta.breadcrumbCurrent}`}
          title={snapshot.meta.title}
          subtitle={snapshot.meta.subtitle}
          scope={snapshot.meta.scopeLabel}
          description={snapshot.meta.description}
          primaryActionLabel="新增申请"
          onPrimaryAction={() => onToast(snapshot.meta.createToast)}
          disclaimer={snapshot.meta.disclaimer}
        />

        <section className="met-asset-change__summary">
          {snapshot.summaryItems.map(item => (
            <div
              key={item.id}
              className={[
                'met-asset-change__summary-card',
                item.isWarning ? 'is-warning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="met-asset-change__summary-value">{item.value}</span>
              <span className="met-asset-change__summary-label">{item.label}</span>
            </div>
          ))}
        </section>

        <section className="met-asset-change__tabs">
          <div className="met-asset-change__tab-list">
            {snapshot.typeTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={['met-asset-change__tab', activeTab === tab.value ? 'is-active' : ''].join(' ')}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="met-asset-change__tab-desc">{typeDescription}</p>
        </section>

        <section className="met-asset-change__filters">
          <div className="met-asset-change__filter-groups">
            {FILTER_GROUPS.map(group => (
              <div key={group.key} className="met-asset-change__filter-group">
                <span className="met-asset-change__filter-label">{group.label}</span>
                <div className="met-asset-change__filter-options">
                  {(optionsByGroup.get(group.key) ?? []).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      className={[
                        'met-asset-change__filter-chip',
                        filters[group.key] === opt.value ? 'is-active' : '',
                      ].join(' ')}
                      onClick={() => toggleFilter(group.key, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="met-asset-change__filter-foot">
            <div className="met-asset-change__search">
              <Search size={14} aria-hidden />
              <input
                type="search"
                placeholder="搜索会员姓名、手机号或申请单号"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="met-asset-change__btn met-asset-change__btn--ghost met-asset-change__btn--sm"
              onClick={resetFilters}
            >
              重置筛选
            </button>
          </div>
        </section>

        <div
          className={[
            'met-asset-change__batch',
            selectedIds.size > 0 ? 'is-visible' : 'is-placeholder',
          ].join(' ')}
        >
          {selectedIds.size > 0 ? (
            <>
              <span className="met-asset-change__batch-count">已选择 {selectedIds.size} 条申请</span>
              <button
                type="button"
                className="met-asset-change__btn met-asset-change__btn--sm"
                onClick={() => onToast(snapshot.batchActions.assignOwnerToast)}
              >
                批量分配处理人
              </button>
              <button
                type="button"
                className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
                onClick={() => onToast(snapshot.batchActions.markEvidencePendingToast)}
              >
                批量标记证据待补
              </button>
              <button
                type="button"
                className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
                onClick={() => onToast(snapshot.batchActions.exportToast)}
              >
                批量导出申请
              </button>
              <button
                type="button"
                className="met-asset-change__btn met-asset-change__btn--sm met-asset-change__btn--ghost"
                onClick={clearSelection}
              >
                取消选择
              </button>
            </>
          ) : (
            <span className="met-asset-change__batch-placeholder">勾选申请后可批量操作</span>
          )}
        </div>

        <section className="met-asset-change__list">
          {displayedRows.length === 0 ? (
            <div className="met-asset-change__empty">
              <h3>暂无匹配申请</h3>
              <p>当前筛选条件下没有资产变更申请，请调整筛选或重置后重试。</p>
            </div>
          ) : (
            displayedRows.map(row => (
              <RequestRowCard
                key={row.requestId}
                row={row}
                selected={selectedIds.has(row.requestId)}
                onToggleSelect={toggleSelect}
                onOpenDetail={onOpenDetail}
                onToast={onToast}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default FinanceSecondaryAssetChangePage;
