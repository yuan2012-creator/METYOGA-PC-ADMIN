import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import {
  buildMemberListSnapshot,
  getMemberListActiveStatusClass,
  getMemberListFollowUpClass,
  getMemberListRiskClass,
  getMemberListStageClass,
  type MemberListFilterOption,
  type MemberListRow,
} from './memberSecondaryMemberList.viewModel';
import './memberSecondaryMemberList.css';

export interface MemberSecondaryMemberListPageProps {
  onBack: () => void;
  onOpenDetail: (memberId: string) => void;
  onOpenHighBalance: () => void;
  onToast: (message: string) => void;
}

type FilterGroupKey = 'store' | 'stage' | 'active' | 'risk' | 'owner' | 'card';

const FILTER_GROUPS: { key: FilterGroupKey; label: string }[] = [
  { key: 'store', label: '门店' },
  { key: 'stage', label: '会员阶段' },
  { key: 'active', label: '活跃状态' },
  { key: 'risk', label: '风险标签' },
  { key: 'owner', label: '负责人' },
  { key: 'card', label: '卡项' },
];

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  stage: 'all',
  active: 'all',
  risk: 'all',
  owner: 'all',
  card: 'all',
};

function MemberListRowCard({
  row,
  selected,
  onToggleSelect,
  onOpenDetail,
  onToast,
}: {
  row: MemberListRow;
  selected: boolean;
  onToggleSelect: (memberId: string) => void;
  onOpenDetail: (memberId: string) => void;
  onToast: (message: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article
      className={[
        'met-member-list__row',
        row.riskLevel === 'P0' ? 'met-member-list__row--p0' : '',
        selected ? 'is-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(row.memberId)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(row.memberId);
      }}
    >
      <div className="met-member-list__row-check" onClick={stop}>
        <input
          type="checkbox"
          checked={selected}
          aria-label={`选择 ${row.memberName}`}
          onChange={() => onToggleSelect(row.memberId)}
        />
      </div>

      <div className="met-member-list__row-main">
        <div className="met-member-list__row-head">
          <div className="met-member-list__row-identity">
            <h3 className="met-member-list__row-name">{row.memberName}</h3>
            <span className="met-member-list__row-phone">{row.maskedPhone}</span>
            <span
              className={[
                'met-member-list__stage',
                getMemberListStageClass(row.memberStage),
              ].join(' ')}
            >
              {row.memberStageLabel}
            </span>
            <span
              className={[
                'met-member-list__status',
                getMemberListActiveStatusClass(row.activeStatus),
              ].join(' ')}
            >
              {row.activeStatusLabel}
            </span>
            <span
              className={['met-member-list__risk', getMemberListRiskClass(row.riskLevel)].join(' ')}
            >
              {row.riskLevel === 'normal' ? '正常' : row.riskLevel}
            </span>
          </div>
          <div className="met-member-list__row-asset">
            <span>{row.cardName}</span>
            <strong>{row.remainingPointsLabel}</strong>
            <span>到期 {row.expiryDate}</span>
          </div>
        </div>

        <div className="met-member-list__row-metrics">
          <span>最后到店：{row.lastVisitDate}</span>
          <span>下次预约：{row.nextBookingDate}</span>
          <span>主教练：{row.assignedCoach}</span>
          <span>负责人：{row.assignedStaff}</span>
          <span>积分：{row.pointsBalanceLabel}</span>
        </div>

        <div className="met-member-list__row-tags">
          {row.riskTags.map(tag => (
            <span key={tag} className="met-member-list__tag">
              {tag}
            </span>
          ))}
          <span
            className={[
              'met-member-list__follow',
              getMemberListFollowUpClass(row.followUpStatus),
            ].join(' ')}
          >
            {row.followUpStatusLabel}
          </span>
        </div>

        <p className="met-member-list__row-action">
          建议动作：{row.suggestedAction}
        </p>
        {row.latestFollowUp ? (
          <p className="met-member-list__row-followup">最近跟进：{row.latestFollowUp}</p>
        ) : null}
      </div>

      <div className="met-member-list__row-actions" onClick={stop}>
        <button
          type="button"
          className="met-member-list__btn met-member-list__btn--sm"
          onClick={() => onOpenDetail(row.memberId)}
        >
          查看详情
        </button>
        <button
          type="button"
          className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
          onClick={() => onToast('记录跟进（待建设）')}
        >
          记录跟进
        </button>
        <button
          type="button"
          className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
          onClick={() => onToast('约下一节课（待建设）')}
        >
          约下一节
        </button>
        <button
          type="button"
          className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
          onClick={() => onToast('标记已处理（待建设）')}
        >
          标记已处理
        </button>
      </div>
    </article>
  );
}

const MemberSecondaryMemberListPage: React.FC<MemberSecondaryMemberListPageProps> = ({
  onBack,
  onOpenDetail,
  onOpenHighBalance,
  onToast,
}) => {
  const snapshot = useMemo(() => buildMemberListSnapshot(), []);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, MemberListFilterOption[]>();
    FILTER_GROUPS.forEach(g => map.set(g.key, []));
    snapshot.filterOptions.forEach(opt => {
      const group = opt.group as FilterGroupKey;
      if (map.has(group)) map.get(group)!.push(opt);
    });
    return map;
  }, [snapshot.filterOptions]);

  const handleSummaryClick = useCallback(
    (itemId: string) => {
      if (itemId === 'sum-hblc') {
        onOpenHighBalance();
      }
    },
    [onOpenHighBalance],
  );

  const toggleFilter = useCallback(
    (group: FilterGroupKey, value: string) => {
      if (group === 'active' && value === 'highBalanceLowConsumption') {
        onOpenHighBalance();
        return;
      }
      setFilters(prev => ({ ...prev, [group]: value }));
    },
    [onOpenHighBalance],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setKeyword('');
    onToast('已恢复默认筛选');
  }, [onToast]);

  const toggleSelect = useCallback((memberId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const displayedRows = useMemo(() => {
    let rows = snapshot.rows;

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      rows = rows.filter(
        row =>
          row.memberName.toLowerCase().includes(q) ||
          row.maskedPhone.includes(q) ||
          row.assignedStaff.includes(q),
      );
    }

    if (filters.stage !== 'all') {
      rows = rows.filter(row => row.memberStage === filters.stage);
    }
    if (filters.active !== 'all') {
      rows = rows.filter(row => row.activeStatus === filters.active);
    }
    if (filters.risk !== 'all') {
      rows = rows.filter(row => row.riskLevel === filters.risk);
    }

    return rows;
  }, [snapshot.rows, keyword, filters.stage, filters.active, filters.risk]);

  const showEmpty = displayedRows.length === 0;

  return (
    <div className="met-member-list">
      <div className="met-member-list__inner">
        <header className="met-member-list__header">
          <div className="met-member-list__header-top">
            <button type="button" className="met-member-list__back" onClick={onBack}>
              <ArrowLeft size={16} aria-hidden />
              返回会员经营
            </button>
            <button
              type="button"
              className="met-member-list__btn met-member-list__btn--ghost"
              onClick={() => onToast(snapshot.meta.exportToast)}
            >
              导出名单
            </button>
          </div>
          <p className="met-member-list__breadcrumb">
            {snapshot.meta.breadcrumbParent} / {snapshot.meta.breadcrumbCurrent}
          </p>
          <h1 className="met-member-list__title">{snapshot.meta.title}</h1>
          <p className="met-member-list__subtitle">{snapshot.meta.subtitle}</p>
          <p className="met-member-list__scope">{snapshot.meta.scopeLabel}</p>
          <p className="met-member-list__desc">{snapshot.meta.description}</p>
          <button
            type="button"
            className="met-member-list__btn met-member-list__btn--ghost met-member-list__btn--sm met-member-list__hblc-entry"
            onClick={onOpenHighBalance}
          >
            查看高余额低耗课名单
          </button>
        </header>

        <section className="met-member-list__summary">
          {snapshot.summaryItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={[
                'met-member-list__summary-card',
                item.isWarning ? 'is-warning' : '',
                item.isDanger ? 'is-danger' : '',
                item.id === 'sum-hblc' ? 'is-clickable' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSummaryClick(item.id)}
            >
              <span className="met-member-list__summary-value">{item.value}</span>
              <span className="met-member-list__summary-label">{item.label}</span>
            </button>
          ))}
        </section>

        <section className="met-member-list__filters">
          <div className="met-member-list__filter-groups">
            {FILTER_GROUPS.map(group => (
              <div key={group.key} className="met-member-list__filter-group">
                <span className="met-member-list__filter-label">{group.label}</span>
                <div className="met-member-list__filter-options">
                  {(optionsByGroup.get(group.key) ?? []).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      className={[
                        'met-member-list__filter-chip',
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
          <div className="met-member-list__filter-foot">
            <div className="met-member-list__search">
              <Search size={14} aria-hidden />
              <input
                type="search"
                placeholder="搜索会员姓名、手机号或负责人"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="met-member-list__btn met-member-list__btn--ghost met-member-list__btn--sm"
              onClick={resetFilters}
            >
              重置筛选
            </button>
          </div>
        </section>

        <div
          className={[
            'met-member-list__batch',
            selectedIds.size > 0 ? 'is-visible' : 'is-placeholder',
          ].join(' ')}
        >
          {selectedIds.size > 0 ? (
            <>
              <span className="met-member-list__batch-count">已选择 {selectedIds.size} 名会员</span>
              <button
                type="button"
                className="met-member-list__btn met-member-list__btn--sm"
                onClick={() => onToast(snapshot.batchActions.assignOwnerToast)}
              >
                批量分配负责人
              </button>
              <button
                type="button"
                className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
                onClick={() => onToast(snapshot.batchActions.markFollowedToast)}
              >
                批量标记已跟进
              </button>
              <button
                type="button"
                className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
                onClick={clearSelection}
              >
                取消选择
              </button>
            </>
          ) : (
            <>
              <span className="met-member-list__batch-hint">勾选会员后可进行批量操作（mock）</span>
              <button
                type="button"
                className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
                onClick={() => onToast(snapshot.batchActions.assignOwnerToast)}
              >
                批量分配负责人
              </button>
              <button
                type="button"
                className="met-member-list__btn met-member-list__btn--sm met-member-list__btn--ghost"
                onClick={() => onToast(snapshot.batchActions.markFollowedToast)}
              >
                批量标记已跟进
              </button>
            </>
          )}
        </div>

        <section className="met-member-list__rows">
          {showEmpty ? (
            <div className="met-member-list__empty">
              <h3>筛选无结果</h3>
              <p>当前筛选条件下没有匹配的会员，请调整筛选或重置后重试。</p>
              <button
                type="button"
                className="met-member-list__btn met-member-list__btn--ghost"
                onClick={resetFilters}
              >
                重置筛选
              </button>
            </div>
          ) : (
            displayedRows.map(row => (
              <MemberListRowCard
                key={row.memberId}
                row={row}
                selected={selectedIds.has(row.memberId)}
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

export default MemberSecondaryMemberListPage;
