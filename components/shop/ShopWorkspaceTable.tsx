import React, { useMemo } from 'react';
import {
  computeShopSegmentMiniSummary,
  filterShopRows,
  getShopRows,
  SHOP_FILTER_OPTIONS,
  SHOP_SEGMENT_HINTS,
  SHOP_WORKBENCH_SEGMENTS,
  type ShopBusinessHourRecord,
  type ShopCostRecord,
  type ShopCourseTypeRecord,
  type ShopListFilters,
  type ShopOperationSnapshot,
  type ShopQualityRecord,
  type ShopRoomRecord,
  type ShopSegment,
  type ShopStaffAssignmentRecord,
  type ShopStoreRecord,
} from './shopOperationViewModel';
import { formatShopCny } from './shopFormatters';
import { ShopTag } from './shopModalShared';

interface ShopWorkspaceTableProps {
  segment: ShopSegment;
  onSegmentChange: (s: ShopSegment) => void;
  snapshot: ShopOperationSnapshot;
  filters: ShopListFilters;
  onFiltersChange: (f: ShopListFilters) => void;
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
  <td className="met-shop-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-shop-table-btn" onClick={onPrimary}>
      {primary}
    </button>
    {secondary && onSecondary ? (
      <button type="button" className="met-shop-table-btn" onClick={onSecondary}>
        {secondary}
      </button>
    ) : null}
  </td>
);

const SEGMENT_HEADERS: Record<ShopSegment, string[]> = {
  stores: ['门店名称', '门店类型', '运营状态', '所在区域', '店长', '今日课程', '今日预约', '风险'],
  rooms: ['教室名称', '所属门店', '教室类型', '容量', '可排课程', '今日使用率', '状态'],
  hours: ['门店', '日期类型', '营业时间', '最早可排课', '最晚可排课', '节假日规则', '状态'],
  staff: ['员工', '角色', '主属门店', '可跨店门店', '今日排班', '权限范围', '状态'],
  courseTypes: ['门店', '课程类型', '可用教室', '默认容量', '可排老师', '适用卡项', '状态'],
  costs: ['门店', '月租金', '物业费', '人工成本', '其他固定成本', '月固定成本', '成本风险'],
  quality: ['记录编号', '门店', '质检类型', '问题摘要', '责任人', '截止时间', '状态'],
};

const ShopWorkspaceTable: React.FC<ShopWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenDetail,
  onOpenChain,
}) => {
  const rows = useMemo(() => filterShopRows(getShopRows(snapshot, segment), filters), [snapshot, segment, filters]);
  const stats = useMemo(() => computeShopSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderRow = (row: ShopStoreRecord | ShopRoomRecord | ShopBusinessHourRecord | ShopStaffAssignmentRecord | ShopCourseTypeRecord | ShopCostRecord | ShopQualityRecord) => {
    const cls = rowClass(row.id);
    const open = () => onOpenDetail(row.id);
    const chain = () => onOpenChain(row.id);

    if (row.segment === 'stores') {
      const r = row as ShopStoreRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-shop-col-name">{r.storeName}</td>
          <td>{r.storeType}</td>
          <td><ShopTag text={r.status} /></td>
          <td>{r.region}</td>
          <td>{r.manager}</td>
          <td className="met-shop-col-nowrap">{r.todayCourses}</td>
          <td className="met-shop-col-nowrap">{r.todayBookings}</td>
          <td><ShopTag text={r.riskLevel} kind="risk" /></td>
          <RowActions primary="查看门店" secondary="查看经营" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'rooms') {
      const r = row as ShopRoomRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-shop-col-name">{r.roomName}</td>
          <td>{r.storeName}</td>
          <td>{r.roomType}</td>
          <td className="met-shop-col-nowrap">{r.capacity}</td>
          <td>{r.courseTypes}</td>
          <td className="met-shop-col-nowrap">{r.todayUsage}</td>
          <td><ShopTag text={r.status} /></td>
          <RowActions primary="查看教室" secondary="查看排课" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'hours') {
      const r = row as ShopBusinessHourRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td>{r.storeName}</td>
          <td>{r.dayType}</td>
          <td className="met-shop-col-nowrap">{r.businessHours}</td>
          <td>{r.earliestClass}</td>
          <td>{r.latestClass}</td>
          <td>{r.holidayRule}</td>
          <td><ShopTag text={r.status} /></td>
          <RowActions primary="查看规则" secondary="查看影响" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'staff') {
      const r = row as ShopStaffAssignmentRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-shop-col-name">{r.staffName}</td>
          <td>{r.role}</td>
          <td>{r.primaryStore}</td>
          <td>{r.crossStores}</td>
          <td>{r.todayShift}</td>
          <td>{r.permScope}</td>
          <td><ShopTag text={r.status} /></td>
          <RowActions primary="查看员工" secondary="查看权限" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'courseTypes') {
      const r = row as ShopCourseTypeRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td>{r.storeName}</td>
          <td>{r.courseType}</td>
          <td>{r.availableRooms}</td>
          <td className="met-shop-col-nowrap">{r.defaultCapacity}</td>
          <td>{r.teachers}</td>
          <td>{r.applicableCards}</td>
          <td><ShopTag text={r.status} /></td>
          <RowActions primary="查看配置" secondary="查看课表" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    if (row.segment === 'costs') {
      const r = row as ShopCostRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-shop-col-name">{r.storeName}</td>
          <td className="met-shop-col-amount">{formatShopCny(r.rent)}</td>
          <td className="met-shop-col-amount">{formatShopCny(r.propertyFee)}</td>
          <td className="met-shop-col-amount">{formatShopCny(r.laborCost)}</td>
          <td className="met-shop-col-amount">{formatShopCny(r.otherFixed)}</td>
          <td className="met-shop-col-amount">{formatShopCny(r.totalFixed)}</td>
          <td><ShopTag text={r.costRisk} kind="risk" /></td>
          <RowActions primary="查看成本" secondary="查看测算" onPrimary={open} onSecondary={chain} />
        </tr>
      );
    }
    const r = row as ShopQualityRecord;
    return (
      <tr key={r.id} className={cls} onClick={open}>
        <td className="met-shop-col-code">{r.recordNo}</td>
        <td>{r.storeName}</td>
        <td>{r.qualityType}</td>
        <td>{r.issueSummary}</td>
        <td>{r.owner}</td>
        <td className="met-shop-col-nowrap">{r.deadline}</td>
        <td><ShopTag text={r.status} /></td>
        <RowActions primary="查看记录" secondary="标记处理" onPrimary={open} onSecondary={chain} />
      </tr>
    );
  };

  return (
    <section className="met-shop-list-card met-today-surface">
      <header className="met-shop-list-card__head">
        <h2>门店经营工作台</h2>
        <p className="met-shop-list-card__hint">{SHOP_SEGMENT_HINTS[segment]}</p>
        <nav className="met-shop-segments" aria-label="门店分段">
          {SHOP_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-shop-filters">
          <div className="met-shop-filters__row met-shop-filters__row--search">
            <input
              type="search"
              className="met-shop-filters__search"
              placeholder="搜索门店 / 教室 / 员工 / 区域 / 质检编号"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-shop-filters__row met-shop-filters__row--options">
            <select value={filters.status} onChange={e => onFiltersChange({ ...filters, status: e.target.value })}>
              {SHOP_FILTER_OPTIONS.statuses.map(o => (
                <option key={o} value={o}>{o === '全部' ? '状态' : o}</option>
              ))}
            </select>
            <select value={filters.storeType} onChange={e => onFiltersChange({ ...filters, storeType: e.target.value })}>
              {SHOP_FILTER_OPTIONS.storeTypes.map(o => (
                <option key={o} value={o}>{o === '全部' ? '门店类型' : o}</option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {SHOP_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>{o === '全部' ? '风险等级' : o}</option>
              ))}
            </select>
            <select value={filters.region} onChange={e => onFiltersChange({ ...filters, region: e.target.value })}>
              {SHOP_FILTER_OPTIONS.regions.map(o => (
                <option key={o} value={o}>{o === '全部' ? '区域' : o}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="met-shop-segment-summary" role="group">
        {stats.map(s => (
          <div key={s.label} className="met-shop-segment-summary__item">
            <span className="met-shop-segment-summary__label">{s.label}</span>
            <span className="met-shop-segment-summary__value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="met-shop-table-wrap custom-scroll">
        <table className="met-shop-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-shop-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-shop-table__empty">
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

export default ShopWorkspaceTable;
