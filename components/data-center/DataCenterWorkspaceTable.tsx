import React, { useMemo } from 'react';
import {
  computeDataSegmentMiniSummary,
  DATA_FILTER_OPTIONS,
  DATA_SEGMENT_HINTS,
  DATA_WORKBENCH_SEGMENTS,
  filterDataRows,
  getDataRows,
  type DataActivityRecord,
  type DataConsumptionRecord,
  type DataCourseRecord,
  type DataFinanceRecord,
  type DataListFilters,
  type DataMemberRecord,
  type DataOperationSnapshot,
  type DataSalesRecord,
  type DataSegment,
  type DataStoreRecord,
  type DataTeacherRecord,
} from './dataCenterOperationViewModel';
import { formatDataCny } from './dataCenterFormatters';
import { DataTag } from './dataCenterModalShared';

interface DataCenterWorkspaceTableProps {
  segment: DataSegment;
  onSegmentChange: (s: DataSegment) => void;
  snapshot: DataOperationSnapshot;
  filters: DataListFilters;
  onFiltersChange: (f: DataListFilters) => void;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
  onOpenTrend: (id: string) => void;
}

const RowActions: React.FC<{
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
}> = ({ primary, secondary, onPrimary, onSecondary }) => (
  <td className="met-data-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-data-table-btn" onClick={onPrimary}>{primary}</button>
    <button type="button" className="met-data-table-btn" onClick={onSecondary}>{secondary}</button>
  </td>
);

const SEGMENT_HEADERS: Record<DataSegment, string[]> = {
  stores: ['门店', '实收', '确认收入', '到课人次', '新增会员', '续费金额', '满课率', '风险'],
  members: ['会员阶段', '人数', '占比', '本月新增', '本月流失', '续费转化', '风险说明'],
  courses: ['课程类型 / 课程名', '排课数', '预约人数', '到课人数', '满课率', '取消 / 爽约', '风险'],
  teachers: ['老师', '门店', '上课数', '到课人数', '满课率', '会员反馈', '私教转化', '风险'],
  sales: ['门店 / 管家', '销售金额', '新购金额', '续费金额', '体验转化', '客单价', '风险'],
  consumption: ['门店', '耗课点数', '耗课次数', '确认收入', '未耗权益', '高余额会员', '风险'],
  finance: ['门店', '实收', '退款', '净收', '预收负债', '确认收入', '支出', '风险'],
  activities: ['活动名称', '报名人数', '到店人数', '成交金额', '活动成本', '转化率', '复用建议'],
};

const SECONDARY_LABEL: Record<DataSegment, string> = {
  stores: '查看趋势',
  members: '查看趋势',
  courses: '查看趋势',
  teachers: '查看趋势',
  sales: '查看趋势',
  consumption: '查看趋势',
  finance: '查看趋势',
  activities: '查看复盘',
};

const PRIMARY_LABEL: Record<DataSegment, string> = {
  stores: '查看分析',
  members: '查看明细',
  courses: '查看课程',
  teachers: '查看老师',
  sales: '查看销售',
  consumption: '查看耗课',
  finance: '查看财务',
  activities: '查看活动',
};

const DataCenterWorkspaceTable: React.FC<DataCenterWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenDetail,
  onOpenTrend,
}) => {
  const rows = useMemo(
    () => filterDataRows(getDataRows(snapshot, segment), segment, filters),
    [snapshot, segment, filters],
  );
  const stats = useMemo(() => computeDataSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderRow = (row: ReturnType<typeof getDataRows>[number]) => {
    const cls = rowClass(row.id);
    const open = () => onOpenDetail(row.id);
    const trend = () => onOpenTrend(row.id);
    const actions = (
      <RowActions
        primary={PRIMARY_LABEL[segment]}
        secondary={SECONDARY_LABEL[segment]}
        onPrimary={open}
        onSecondary={trend}
      />
    );

    if (row.segment === 'stores') {
      const r = row as DataStoreRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.storeName}</td>
          <td className="met-data-col-amount">{formatDataCny(r.revenue)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.confirmedRevenue)}</td>
          <td className="met-data-col-nowrap">{r.attendance}</td>
          <td className="met-data-col-nowrap">{r.newMembers}</td>
          <td className="met-data-col-amount">{formatDataCny(r.renewalAmount)}</td>
          <td>{r.fillRate}</td>
          <td><DataTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'members') {
      const r = row as DataMemberRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.stage}</td>
          <td className="met-data-col-nowrap">{r.count}</td>
          <td>{r.ratio}</td>
          <td className="met-data-col-nowrap">{r.newThisMonth}</td>
          <td className="met-data-col-nowrap">{r.churnThisMonth}</td>
          <td>{r.renewalRate}</td>
          <td>{r.riskNote}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'courses') {
      const r = row as DataCourseRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.courseType} / {r.courseName}</td>
          <td className="met-data-col-nowrap">{r.scheduleCount}</td>
          <td className="met-data-col-nowrap">{r.bookings}</td>
          <td className="met-data-col-nowrap">{r.attendance}</td>
          <td>{r.fillRate}</td>
          <td>{r.cancelNoShow}</td>
          <td><DataTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'teachers') {
      const r = row as DataTeacherRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.teacherName}</td>
          <td>{r.store}</td>
          <td className="met-data-col-nowrap">{r.classCount}</td>
          <td className="met-data-col-nowrap">{r.attendance}</td>
          <td>{r.fillRate}</td>
          <td>{r.feedback}</td>
          <td>{r.ptConversion}</td>
          <td><DataTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'sales') {
      const r = row as DataSalesRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.store} / {r.storeButler}</td>
          <td className="met-data-col-amount">{formatDataCny(r.salesAmount)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.newPurchase)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.renewalAmount)}</td>
          <td>{r.trialConversion}</td>
          <td className="met-data-col-amount">{formatDataCny(r.avgOrder)}</td>
          <td><DataTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'consumption') {
      const r = row as DataConsumptionRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.store}</td>
          <td className="met-data-col-nowrap">{r.consumePoints}</td>
          <td className="met-data-col-nowrap">{r.consumeTimes}</td>
          <td className="met-data-col-amount">{formatDataCny(r.confirmedRevenue)}</td>
          <td>{r.unusedBenefit}</td>
          <td className="met-data-col-nowrap">{r.highBalanceMembers}</td>
          <td><DataTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'finance') {
      const r = row as DataFinanceRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-data-col-name">{r.store}</td>
          <td className="met-data-col-amount">{formatDataCny(r.revenue)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.refund)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.netRevenue)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.prepaidLiability)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.confirmedRevenue)}</td>
          <td className="met-data-col-amount">{formatDataCny(r.expense)}</td>
          <td><DataTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    const r = row as DataActivityRecord;
    return (
      <tr key={r.id} className={cls} onClick={open}>
        <td className="met-data-col-name">{r.activityName}</td>
        <td className="met-data-col-nowrap">{r.signups}</td>
        <td className="met-data-col-nowrap">{r.arrivals}</td>
        <td className="met-data-col-amount">{formatDataCny(r.dealAmount)}</td>
        <td className="met-data-col-amount">{formatDataCny(r.activityCost)}</td>
        <td>{r.conversionRate}</td>
        <td>{r.reuseAdvice}</td>
        {actions}
      </tr>
    );
  };

  return (
    <section className="met-data-list-card met-today-surface">
      <header className="met-data-list-card__head">
        <h2>数据分析工作台</h2>
        <p className="met-data-list-card__hint">{DATA_SEGMENT_HINTS[segment]}</p>
        <nav className="met-data-segments" aria-label="分析分段">
          {DATA_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-data-filters">
          <div className="met-data-filters__row met-data-filters__row--search">
            <input
              type="search"
              className="met-data-filters__search"
              placeholder="搜索门店、老师、课程、活动、会员阶段、管家"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-data-filters__row met-data-filters__row--options">
            <select value={filters.timeRange} onChange={e => onFiltersChange({ ...filters, timeRange: e.target.value })}>
              {DATA_FILTER_OPTIONS.timeRanges.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <select value={filters.store} onChange={e => onFiltersChange({ ...filters, store: e.target.value })}>
              {DATA_FILTER_OPTIONS.stores.map(o => (
                <option key={o} value={o}>{o === '全部' ? '门店' : o}</option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {DATA_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>{o === '全部' ? '风险' : o}</option>
              ))}
            </select>
            <select value={filters.metricType} onChange={e => onFiltersChange({ ...filters, metricType: e.target.value })}>
              {DATA_FILTER_OPTIONS.metricTypes.map(o => (
                <option key={o} value={o}>{o === '全部' ? '指标类型' : o}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="met-data-segment-summary" role="group">
        {stats.map(s => (
          <div key={s.label} className="met-data-segment-summary__item">
            <span className="met-data-segment-summary__label">{s.label}</span>
            <span className="met-data-segment-summary__value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="met-data-table-wrap custom-scroll">
        <table className="met-data-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-data-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-data-table__empty">
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

export default DataCenterWorkspaceTable;
