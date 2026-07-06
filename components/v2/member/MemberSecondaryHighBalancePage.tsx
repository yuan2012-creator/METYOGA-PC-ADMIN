import React, { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SecondaryPageHeader } from '../shared';
import {
  buildHighBalanceSnapshot,
  getHighBalanceEvidenceClass,
  getHighBalanceEvidenceDotClass,
  getHighBalanceFollowUpClass,
  getHighBalanceRiskClass,
  type HighBalanceFilterOption,
  type HighBalanceMemberRow,
} from './memberSecondaryHighBalance.viewModel';
import './memberSecondaryHighBalance.css';

export interface MemberSecondaryHighBalancePageProps {
  onBackToOverview: () => void;
  onBackToMemberList: () => void;
  onOpenDetail: (memberId: string) => void;
  onToast: (message: string) => void;
}

type FilterGroupKey = 'store' | 'risk' | 'days' | 'points' | 'card' | 'owner' | 'follow';

const FILTER_GROUPS: { key: FilterGroupKey; label: string }[] = [
  { key: 'store', label: '门店' },
  { key: 'risk', label: '风险等级' },
  { key: 'days', label: '未到店天数' },
  { key: 'points', label: '剩余点数' },
  { key: 'card', label: '卡项' },
  { key: 'owner', label: '负责人' },
  { key: 'follow', label: '跟进状态' },
];

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  risk: 'all',
  days: 'all',
  points: 'all',
  card: 'all',
  owner: 'all',
  follow: 'all',
};

function HighBalanceRowCard({
  row,
  selected,
  onToggleSelect,
  onOpenDetail,
  onToast,
}: {
  row: HighBalanceMemberRow;
  selected: boolean;
  onToggleSelect: (memberId: string) => void;
  onOpenDetail: (memberId: string) => void;
  onToast: (message: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article
      className={[
        'met-hblc__row',
        row.riskLevel === 'P0' ? 'met-hblc__row--p0' : '',
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
      <div className="met-hblc__row-check" onClick={stop}>
        <input
          type="checkbox"
          checked={selected}
          aria-label={`选择 ${row.memberName}`}
          onChange={() => onToggleSelect(row.memberId)}
        />
      </div>

      <div className="met-hblc__row-main">
        <div className="met-hblc__row-head">
          <div className="met-hblc__row-identity">
            <h3 className="met-hblc__row-name">{row.memberName}</h3>
            <span className="met-hblc__row-phone">{row.maskedPhone}</span>
            <span className={['met-hblc__risk', getHighBalanceRiskClass(row.riskLevel)].join(' ')}>
              {row.riskLevel}
            </span>
            <span className="met-hblc__stage">{row.memberStage}</span>
          </div>
          <div className="met-hblc__row-asset">
            <span>{row.cardName}</span>
            <strong>{row.remainingPointsLabel}</strong>
            <span className="met-hblc__estimate">
              {row.remainingAmountEstimate}
              <em>{row.amountEstimateNote}</em>
            </span>
          </div>
        </div>

        <div className="met-hblc__row-metrics">
          <span className="met-hblc__metric--highlight">
            未到店 {row.daysSinceLastVisit} 天
          </span>
          <span>最近到店：{row.lastVisitDate}</span>
          <span>最近预约：{row.lastBookingDate}</span>
          <span>到期：{row.expiryDate}</span>
          <span>主教练：{row.assignedCoach}</span>
          <span>负责人：{row.assignedStaff}</span>
        </div>

        <p className="met-hblc__row-reason">风险原因：{row.riskReason}</p>

        <div className="met-hblc__row-tags">
          {row.riskTags.map(tag => (
            <span key={tag} className="met-hblc__tag">
              {tag}
            </span>
          ))}
          <span
            className={[
              'met-hblc__follow',
              getHighBalanceFollowUpClass(row.followUpStatus),
            ].join(' ')}
          >
            {row.followUpStatusLabel}
          </span>
          <span
            className={[
              'met-hblc__evidence-badge',
              getHighBalanceEvidenceClass(row.evidenceCompleteness),
            ].join(' ')}
          >
            证据 {row.evidenceCompletenessLabel}
          </span>
        </div>

        <div className="met-hblc__evidence-dots">
          {row.evidenceItems.map(item => (
            <span
              key={item.key}
              className={['met-hblc__evidence-dot', getHighBalanceEvidenceDotClass(item.status)].join(
                ' ',
              )}
              title={`${item.label}：${item.statusLabel}`}
            >
              {item.label}
            </span>
          ))}
        </div>

        <p className="met-hblc__row-action">建议动作：{row.suggestedAction}</p>
        {row.latestFollowUp ? (
          <p className="met-hblc__row-followup">最近跟进：{row.latestFollowUp}</p>
        ) : null}
      </div>

      <div className="met-hblc__row-actions" onClick={stop}>
        <button
          type="button"
          className="met-hblc__btn met-hblc__btn--sm"
          onClick={() => onOpenDetail(row.memberId)}
        >
          查看详情
        </button>
        <button
          type="button"
          className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
          onClick={() => onToast('记录跟进（待建设）')}
        >
          记录跟进
        </button>
        <button
          type="button"
          className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
          onClick={() => onToast('安排下一节课（待建设）')}
        >
          安排下一节
        </button>
        <button
          type="button"
          className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
          onClick={() => onToast('查看资产（待建设）')}
        >
          查看资产
        </button>
        <button
          type="button"
          className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
          onClick={() => onToast('标记已处理（待建设）')}
        >
          标记已处理
        </button>
      </div>
    </article>
  );
}

const MemberSecondaryHighBalancePage: React.FC<MemberSecondaryHighBalancePageProps> = ({
  onBackToOverview,
  onBackToMemberList,
  onOpenDetail,
  onToast,
}) => {
  const snapshot = useMemo(() => buildHighBalanceSnapshot(), []);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, HighBalanceFilterOption[]>();
    FILTER_GROUPS.forEach(g => map.set(g.key, []));
    snapshot.filterOptions.forEach(opt => {
      const group = opt.group as FilterGroupKey;
      if (map.has(group)) map.get(group)!.push(opt);
    });
    return map;
  }, [snapshot.filterOptions]);

  const toggleFilter = useCallback((group: FilterGroupKey, value: string) => {
    setFilters(prev => ({ ...prev, [group]: value }));
  }, []);

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

    if (filters.risk !== 'all') {
      rows = rows.filter(row => row.riskLevel === filters.risk);
    }

    if (filters.days !== 'all') {
      const minDays = Number(filters.days);
      rows = rows.filter(row => row.daysSinceLastVisit >= minDays);
    }

    if (filters.points !== 'all') {
      const minPoints = Number(filters.points);
      rows = rows.filter(row => row.remainingPoints >= minPoints);
    }

    if (filters.follow !== 'all') {
      rows = rows.filter(row => row.followUpStatus === filters.follow);
    }

    return rows;
  }, [snapshot.rows, keyword, filters.risk, filters.days, filters.points, filters.follow]);

  return (
    <div className="met-hblc">
      <div className="met-hblc__inner">
        <SecondaryPageHeader
          backLabel="返回会员经营"
          onBack={onBackToOverview}
          backVariant="link"
          secondaryBackLabel="返回会员名单"
          onSecondaryBack={onBackToMemberList}
          breadcrumb={`${snapshot.meta.breadcrumbParent} / ${snapshot.meta.breadcrumbCurrent}`}
          title={snapshot.meta.title}
          subtitle={snapshot.meta.subtitle}
          scope={snapshot.meta.scopeLabel}
          description={snapshot.meta.description}
          primaryActionLabel="批量分配跟进"
          onPrimaryAction={() => onToast(snapshot.meta.batchAssignToast)}
          primaryActionVariant="ghost"
          disclaimer={snapshot.meta.disclaimer}
        />

        <section className="met-hblc__summary">
          {snapshot.summaryItems.map(item => (
            <div
              key={item.id}
              className={[
                'met-hblc__summary-card',
                item.isWarning ? 'is-warning' : '',
                item.isDanger ? 'is-danger' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="met-hblc__summary-value">{item.value}</span>
              <span className="met-hblc__summary-label">
                {item.label}
                {item.note ? <em>（{item.note}）</em> : null}
              </span>
            </div>
          ))}
        </section>

        <div className="met-hblc__layout">
          <div className="met-hblc__main">
            <article className="met-hblc__rules">
              <h2 className="met-hblc__rules-title">{snapshot.ruleExplanation.title}</h2>
              <ul className="met-hblc__rules-list">
                {snapshot.ruleExplanation.rules.map(rule => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <div className="met-hblc__rules-reminders">
                {snapshot.ruleExplanation.reminders.map(reminder => (
                  <span key={reminder} className="met-hblc__reminder-tag">
                    {reminder}
                  </span>
                ))}
              </div>
            </article>

            <section className="met-hblc__filters">
              <div className="met-hblc__filter-groups">
                {FILTER_GROUPS.map(group => (
                  <div key={group.key} className="met-hblc__filter-group">
                    <span className="met-hblc__filter-label">{group.label}</span>
                    <div className="met-hblc__filter-options">
                      {(optionsByGroup.get(group.key) ?? []).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          className={[
                            'met-hblc__filter-chip',
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
              <div className="met-hblc__filter-foot">
                <div className="met-hblc__search">
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
                  className="met-hblc__btn met-hblc__btn--ghost met-hblc__btn--sm"
                  onClick={resetFilters}
                >
                  重置筛选
                </button>
              </div>
            </section>

            <div
              className={[
                'met-hblc__batch',
                selectedIds.size > 0 ? 'is-visible' : 'is-placeholder',
              ].join(' ')}
            >
              {selectedIds.size > 0 ? (
                <>
                  <span className="met-hblc__batch-count">已选择 {selectedIds.size} 名会员</span>
                  <button
                    type="button"
                    className="met-hblc__btn met-hblc__btn--sm"
                    onClick={() => onToast(snapshot.batchActions.assignStaffToast)}
                  >
                    批量分配管家
                  </button>
                  <button
                    type="button"
                    className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
                    onClick={() => onToast(snapshot.batchActions.markPendingToast)}
                  >
                    批量标记待跟进
                  </button>
                  <button
                    type="button"
                    className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
                    onClick={() => onToast(snapshot.batchActions.exportToast)}
                  >
                    批量导出名单
                  </button>
                  <button
                    type="button"
                    className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
                    onClick={clearSelection}
                  >
                    取消选择
                  </button>
                </>
              ) : (
                <>
                  <span className="met-hblc__batch-hint">勾选会员后可进行批量操作（mock）</span>
                  <button
                    type="button"
                    className="met-hblc__btn met-hblc__btn--sm met-hblc__btn--ghost"
                    onClick={() => onToast(snapshot.batchActions.assignStaffToast)}
                  >
                    批量分配管家
                  </button>
                </>
              )}
            </div>

            <section className="met-hblc__rows">
              {displayedRows.length === 0 ? (
                <div className="met-hblc__empty">
                  <h3>筛选无结果</h3>
                  <p>当前筛选条件下没有匹配的高余额低耗课会员，请调整筛选或重置后重试。</p>
                  <button
                    type="button"
                    className="met-hblc__btn met-hblc__btn--ghost"
                    onClick={resetFilters}
                  >
                    重置筛选
                  </button>
                </div>
              ) : (
                displayedRows.map(row => (
                  <HighBalanceRowCard
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

          <aside className="met-hblc__aside">
            <article className="met-hblc__tips">
              <h2 className="met-hblc__tips-title">本页处理建议</h2>
              <ol className="met-hblc__tips-list">
                {snapshot.handlingTips.map(tip => (
                  <li key={tip.id}>{tip.text}</li>
                ))}
              </ol>
              <button
                type="button"
                className="met-hblc__btn met-hblc__btn--ghost met-hblc__btn--sm"
                onClick={() => onToast(snapshot.meta.handlingGuideToast)}
              >
                查看处理口径
              </button>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MemberSecondaryHighBalancePage;
