import React, { useMemo } from 'react';
import {
  computeMarketingSegmentMiniSummary,
  filterMarketingRows,
  getMarketingRows,
  MARKETING_FILTER_OPTIONS,
  MARKETING_SEGMENT_HINTS,
  MARKETING_WORKBENCH_SEGMENTS,
  type MarketingActivityRecord,
  type MarketingConversionRecord,
  type MarketingCostRecord,
  type MarketingCouponRecord,
  type MarketingListFilters,
  type MarketingOperationSnapshot,
  type MarketingReferralRecord,
  type MarketingReviewRecord,
  type MarketingSegment,
  type MarketingSignupRecord,
} from './marketingOperationViewModel';
import { formatMarketingCny } from './marketingFormatters';
import { MarketingTag } from './marketingModalShared';

interface MarketingWorkspaceTableProps {
  segment: MarketingSegment;
  onSegmentChange: (s: MarketingSegment) => void;
  snapshot: MarketingOperationSnapshot;
  filters: MarketingListFilters;
  onFiltersChange: (f: MarketingListFilters) => void;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
  onOpenChain: (id: string) => void;
}

const RowActions: React.FC<{
  primary: string;
  secondary?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}> = ({ primary, secondary, onPrimary, onSecondary }) => (
  <td className="met-marketing-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-marketing-table-btn" onClick={onPrimary}>
      {primary}
    </button>
    {secondary && onSecondary ? (
      <button type="button" className="met-marketing-table-btn" onClick={onSecondary}>
        {secondary}
      </button>
    ) : null}
  </td>
);

const SEGMENT_HEADERS: Record<MarketingSegment, string[]> = {
  activities: ['活动名称', '活动类型', '适用门店', '活动时间', '报名人数', '到店人数', '成交金额', '风险'],
  signups: ['报名编号', '会员 / 线索', '活动名称', '报名来源', '预约门店', '到店状态', '负责管家', '风险'],
  conversions: ['会员 / 线索', '活动名称', '到店时间', '体验课程', '负责老师', '跟进状态', '成交状态'],
  coupons: ['权益名称', '权益类型', '关联活动', '发放数量', '使用数量', '适用产品', '有效期', '风险'],
  referrals: ['推荐人', '新客', '关联活动', '新客状态', '推荐奖励', '奖励状态', '负责管家'],
  costs: ['活动名称', '成本类型', '预算金额', '实际金额', '供应方', '负责人', '凭证状态', '成本风险'],
  reviews: ['活动名称', '报名人数', '到店率', '成交人数', '成交金额', '成本', '复用建议', '状态'],
};

const MarketingWorkspaceTable: React.FC<MarketingWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenDetail,
  onOpenChain,
}) => {
  const rows = useMemo(
    () => filterMarketingRows(getMarketingRows(snapshot, segment), segment, filters),
    [snapshot, segment, filters],
  );
  const stats = useMemo(() => computeMarketingSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderRow = (
    row:
      | MarketingActivityRecord
      | MarketingSignupRecord
      | MarketingConversionRecord
      | MarketingCouponRecord
      | MarketingReferralRecord
      | MarketingCostRecord
      | MarketingReviewRecord,
  ) => {
    const cls = rowClass(row.id);
    const open = () => onOpenDetail(row.id);
    const chain = () => onOpenChain(row.id);

    if (row.segment === 'activities') {
      const r = row as MarketingActivityRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-marketing-col-name">{r.activityName}</td>
          <td>{r.activityType}</td>
          <td>{r.stores}</td>
          <td className="met-marketing-col-nowrap">{r.activityTime}</td>
          <td className="met-marketing-col-nowrap">{r.signupCount}</td>
          <td className="met-marketing-col-nowrap">{r.arrivalCount}</td>
          <td className="met-marketing-col-amount">{formatMarketingCny(r.revenue)}</td>
          <td><MarketingTag text={r.riskLevel} kind="risk" /></td>
          <RowActions primary="查看活动" secondary="查看转化" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'signups') {
      const r = row as MarketingSignupRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-marketing-col-code">{r.signupNo}</td>
          <td>{r.memberName} · {r.phoneTail}</td>
          <td>{r.activityName}</td>
          <td>{r.source}</td>
          <td>{r.store}</td>
          <td><MarketingTag text={r.arrivalStatus} /></td>
          <td>{r.butler}</td>
          <td><MarketingTag text={r.riskLevel} kind="risk" /></td>
          <RowActions primary="查看报名" secondary="添加跟进" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'conversions') {
      const r = row as MarketingConversionRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-marketing-col-name">{r.memberName}</td>
          <td>{r.activityName}</td>
          <td className="met-marketing-col-nowrap">{r.arrivalTime}</td>
          <td>{r.trialCourse}</td>
          <td>{r.teacher}</td>
          <td><MarketingTag text={r.followStatus} /></td>
          <td><MarketingTag text={r.dealStatus} /></td>
          <RowActions primary="查看详情" secondary="分配管家" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'coupons') {
      const r = row as MarketingCouponRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-marketing-col-name">{r.benefitName}</td>
          <td>{r.benefitType}</td>
          <td>{r.activityName}</td>
          <td className="met-marketing-col-nowrap">{r.issued}</td>
          <td className="met-marketing-col-nowrap">{r.used}</td>
          <td>{r.applicableProducts}</td>
          <td className="met-marketing-col-nowrap">{r.validUntil}</td>
          <td><MarketingTag text={r.riskLevel} kind="risk" /></td>
          <RowActions primary="查看权益" secondary="查看使用" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'referrals') {
      const r = row as MarketingReferralRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td>{r.referrer}</td>
          <td>{r.newCustomer}</td>
          <td>{r.activityName}</td>
          <td><MarketingTag text={r.newStatus} /></td>
          <td>{r.reward}</td>
          <td><MarketingTag text={r.rewardStatus} /></td>
          <td>{r.butler}</td>
          <RowActions primary="查看关系" secondary="查看奖励" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'costs') {
      const r = row as MarketingCostRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-marketing-col-name">{r.activityName}</td>
          <td>{r.costType}</td>
          <td className="met-marketing-col-amount">{formatMarketingCny(r.budget)}</td>
          <td className="met-marketing-col-amount">{formatMarketingCny(r.actual)}</td>
          <td>{r.vendor}</td>
          <td>{r.owner}</td>
          <td><MarketingTag text={r.voucherStatus} /></td>
          <td><MarketingTag text={r.costRisk} kind="risk" /></td>
          <RowActions primary="查看成本" secondary="查看凭证" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    const r = row as MarketingReviewRecord;
    return (
      <tr key={r.id} className={cls} onClick={open}>
        <td className="met-marketing-col-name">{r.activityName}</td>
        <td className="met-marketing-col-nowrap">{r.signupCount}</td>
        <td>{r.arrivalRate}</td>
        <td className="met-marketing-col-nowrap">{r.dealCount}</td>
        <td className="met-marketing-col-amount">{formatMarketingCny(r.revenue)}</td>
        <td className="met-marketing-col-amount">{formatMarketingCny(r.cost)}</td>
        <td>{r.reuseAdvice}</td>
        <td><MarketingTag text={r.status} /></td>
        <RowActions primary="查看复盘" secondary="生成结论" onPrimary={open} onSecondary={chain} />
      </tr>
    );
  };

  return (
    <section className="met-marketing-list-card met-today-surface">
      <header className="met-marketing-list-card__head">
        <h2>活动转化工作台</h2>
        <p className="met-marketing-list-card__hint">{MARKETING_SEGMENT_HINTS[segment]}</p>
        <nav className="met-marketing-segments" aria-label="活动分段">
          {MARKETING_WORKBENCH_SEGMENTS.map(s => (
            <button
              key={s.id}
              type="button"
              className={segment === s.id ? 'is-active' : ''}
              onClick={() => onSegmentChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="met-marketing-filters">
          <div className="met-marketing-filters__row met-marketing-filters__row--search">
            <input
              type="search"
              className="met-marketing-filters__search"
              placeholder="搜索活动 / 会员 / 手机后四位 / 报名编号 / 权益"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-marketing-filters__row met-marketing-filters__row--options">
            <select
              value={filters.activityType}
              onChange={e => onFiltersChange({ ...filters, activityType: e.target.value })}
            >
              {MARKETING_FILTER_OPTIONS.activityTypes.map(o => (
                <option key={o} value={o}>{o === '全部' ? '活动类型' : o}</option>
              ))}
            </select>
            <select value={filters.status} onChange={e => onFiltersChange({ ...filters, status: e.target.value })}>
              {MARKETING_FILTER_OPTIONS.statuses.map(o => (
                <option key={o} value={o}>{o === '全部' ? '活动状态' : o}</option>
              ))}
            </select>
            <select value={filters.store} onChange={e => onFiltersChange({ ...filters, store: e.target.value })}>
              {MARKETING_FILTER_OPTIONS.stores.map(o => (
                <option key={o} value={o}>{o === '全部' ? '门店' : o}</option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {MARKETING_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>{o === '全部' ? '风险等级' : o}</option>
              ))}
            </select>
            {segment === 'signups' ? (
              <select
                value={filters.arrivalStatus}
                onChange={e => onFiltersChange({ ...filters, arrivalStatus: e.target.value })}
              >
                {MARKETING_FILTER_OPTIONS.arrivalStatuses.map(o => (
                  <option key={o} value={o}>{o === '全部' ? '到店状态' : o}</option>
                ))}
              </select>
            ) : null}
          </div>
        </div>
      </header>

      <div className="met-marketing-segment-summary" role="group">
        {stats.map(s => (
          <div key={s.label} className="met-marketing-segment-summary__item">
            <span className="met-marketing-segment-summary__label">{s.label}</span>
            <span className="met-marketing-segment-summary__value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="met-marketing-table-wrap custom-scroll">
        <table className="met-marketing-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-marketing-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-marketing-table__empty">
                  暂无匹配记录，请调整筛选条件
                </td>
              </tr>
            ) : (
              rows.map(r => renderRow(r))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MarketingWorkspaceTable;
