import React, { useMemo } from 'react';
import {
  DEFAULT_DASHBOARD_FILTERS,
  DASHBOARD_FILTER_OPTIONS,
  DASHBOARD_SEGMENT_HINTS,
  DASHBOARD_WORKBENCH_SEGMENTS,
  computeDashboardSegmentMiniSummary,
  filterDashboardRows,
  getDashboardRows,
  type DashboardChainRecord,
  type DashboardCourseRecord,
  type DashboardFinanceRecord,
  type DashboardListFilters,
  type DashboardMemberRecord,
  type DashboardOperationSnapshot,
  type DashboardSegment,
  type DashboardStoreRecord,
  type DashboardTeacherRecord,
  type DashboardTodoRecord,
} from './dashboardOperationViewModel';
import { dashboardStatusClass } from './dashboardFormatters';
import { DashboardTag } from './dashboardModalShared';

type WorkbenchProps = {
  variant?: 'workbench';
  segment: DashboardSegment;
  onSegmentChange: (s: DashboardSegment) => void;
  filters: DashboardListFilters;
  onFiltersChange: (f: DashboardListFilters) => void;
  onSecondary: (id: string) => void;
};

type MonitorProps = {
  variant: 'storeMonitor';
  segment?: never;
  onSegmentChange?: never;
  filters?: never;
  onFiltersChange?: never;
  onSecondary?: never;
};

type CommonProps = {
  snapshot: DashboardOperationSnapshot;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
};

type DashboardWorkspaceTableProps = CommonProps & (WorkbenchProps | MonitorProps);

const PRIMARY: Record<DashboardSegment, string> = {
  todayTodo: '查看详情',
  storeHealth: '查看门店',
  memberRisk: '查看会员',
  courseAnomaly: '查看课程',
  financeRisk: '查看财务',
  teacherExec: '查看老师',
  crossModule: '查看链路',
};

const SECONDARY: Record<DashboardSegment, string> = {
  todayTodo: '查看链路',
  storeHealth: '查看风险',
  memberRisk: '查看跟进',
  courseAnomaly: '查看链路',
  financeRisk: '查看证据链',
  teacherExec: '查看课程',
  crossModule: '标记处理',
};

const SEGMENT_HEADERS: Record<DashboardSegment, string[]> = {
  todayTodo: ['事项', '关联模块', '影响门店', '风险等级', '责任角色', '截止时间', '当前状态'],
  storeHealth: ['门店', '今日预约', '到课率', '今日净收款', '耗课收入', '风险项', '当前判断'],
  memberRisk: ['会员', '所属门店', '当前阶段', '主资产', '最近到课', '风险原因', '负责人'],
  courseAnomaly: ['课程 / 场次', '门店', '老师', '时间', '预约人数', '异常类型', '处理建议'],
  financeRisk: ['风险事项', '关联订单 / 支付', '金额', '影响口径', '财务状态', '负责人', '下一步'],
  teacherExec: ['老师', '门店', '今日课程', '到课人数', '课时费状态', '执行风险', '成长影响'],
  crossModule: ['链路事项', '起点模块', '当前卡点', '影响模块', '证据链', '责任角色', '状态'],
};

const RowActions: React.FC<{
  segment: DashboardSegment;
  onPrimary: () => void;
  onSecondary: () => void;
}> = ({ segment, onPrimary, onSecondary }) => (
  <td className="met-dashboard-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-dashboard-table-btn" onClick={onPrimary}>
      {PRIMARY[segment]}
    </button>
    <button type="button" className="met-dashboard-table-btn" onClick={onSecondary}>
      {SECONDARY[segment]}
    </button>
  </td>
);

const StoreMonitorTable: React.FC<{
  snapshot: DashboardOperationSnapshot;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
}> = ({ snapshot, highlightId, onOpenDetail }) => (
  <section className="met-dashboard-monitor-card met-dashboard-surface">
    <header className="met-dashboard-monitor-card__head">
      <h2>门店健康监测表</h2>
    </header>
    <div className="met-dashboard-table-wrap">
      <table className="met-dashboard-table met-dashboard-table--monitor">
        <thead>
          <tr>
            <th>门店</th>
            <th>状态</th>
            <th>主要问题</th>
            <th className="met-dashboard-col-score">健康分</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.stitch.storeMonitor.map(row => {
            const tone = dashboardStatusClass(row.status);
            return (
              <tr
                key={row.id}
                className={`met-dashboard-table__row--${tone}${highlightId === row.id ? ' is-highlight' : ''}`}
                onClick={() => onOpenDetail(row.id)}
              >
                <td className="met-dashboard-col-name">{row.storeName}</td>
                <td>
                  <span className={`met-dashboard-status-pill is-${tone}`}>{row.status}</span>
                </td>
                <td>{row.problem}</td>
                <td className="met-dashboard-col-score">{row.healthScore}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

const DashboardWorkspaceTable: React.FC<DashboardWorkspaceTableProps> = props => {
  const isMonitor = props.variant === 'storeMonitor';
  const segment = isMonitor ? 'todayTodo' : props.segment;
  const filters = isMonitor ? DEFAULT_DASHBOARD_FILTERS : props.filters;

  const rows = useMemo(
    () =>
      isMonitor
        ? []
        : filterDashboardRows(getDashboardRows(props.snapshot, segment), filters),
    [isMonitor, props.snapshot, segment, filters],
  );
  const stats = useMemo(
    () => (isMonitor ? [] : computeDashboardSegmentMiniSummary(props.snapshot, segment)),
    [isMonitor, props.snapshot, segment],
  );

  if (isMonitor) {
    return (
      <StoreMonitorTable
        snapshot={props.snapshot}
        highlightId={props.highlightId}
        onOpenDetail={props.onOpenDetail}
      />
    );
  }

  const { onSegmentChange, snapshot, onFiltersChange, highlightId, onOpenDetail, onSecondary } =
    props;
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderRow = (row: ReturnType<typeof getDashboardRows>[number]) => {
    const cls = rowClass(row.id);
    const open = () => onOpenDetail(row.id);
    const sec = () => onSecondary(row.id);
    const actions = <RowActions segment={segment} onPrimary={open} onSecondary={sec} />;

    if (row.segment === 'todayTodo') {
      const r = row as DashboardTodoRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-dashboard-col-name">{r.item}</td>
          <td>{r.module}</td>
          <td>{r.store}</td>
          <td><DashboardTag text={r.riskLevel} kind="risk" /></td>
          <td>{r.ownerRole}</td>
          <td className="met-dashboard-col-nowrap">{r.deadline}</td>
          <td><DashboardTag text={r.status} /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'storeHealth') {
      const r = row as DashboardStoreRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-dashboard-col-name">{r.storeName}</td>
          <td>{r.todayBookings}</td>
          <td>{r.attendanceRate}</td>
          <td className="met-dashboard-col-nowrap">{r.todayNetReceipt}</td>
          <td className="met-dashboard-col-nowrap">{r.consumeRevenue}</td>
          <td>{r.riskItems}</td>
          <td>{r.judgment}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'memberRisk') {
      const r = row as DashboardMemberRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-dashboard-col-name">{r.memberName}</td>
          <td>{r.storeName}</td>
          <td>{r.stage}</td>
          <td>{r.mainAsset}</td>
          <td>{r.lastAttendance}</td>
          <td>{r.riskReason}</td>
          <td>{r.owner}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'courseAnomaly') {
      const r = row as DashboardCourseRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-dashboard-col-name">{r.courseName}</td>
          <td>{r.storeName}</td>
          <td>{r.teacher}</td>
          <td className="met-dashboard-col-nowrap">{r.time}</td>
          <td>{r.bookings}</td>
          <td><DashboardTag text={r.anomalyType} kind="risk" /></td>
          <td>{r.suggestion}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'financeRisk') {
      const r = row as DashboardFinanceRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-dashboard-col-name">{r.riskItem}</td>
          <td className="met-dashboard-col-code">{r.relatedOrder}</td>
          <td className="met-dashboard-col-nowrap">{r.amount}</td>
          <td>{r.impactScope}</td>
          <td><DashboardTag text={r.financeStatus} /></td>
          <td>{r.owner}</td>
          <td>{r.nextStep}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'teacherExec') {
      const r = row as DashboardTeacherRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-dashboard-col-name">{r.teacherName}</td>
          <td>{r.storeName}</td>
          <td>{r.todayCourses}</td>
          <td>{r.attendanceCount}</td>
          <td>{r.feeStatus}</td>
          <td>{r.execRisk}</td>
          <td>{r.growthImpact}</td>
          {actions}
        </tr>
      );
    }
    const r = row as DashboardChainRecord;
    return (
      <tr key={r.id} className={cls} onClick={open}>
        <td className="met-dashboard-col-name">{r.chainItem}</td>
        <td>{r.startModule}</td>
        <td>{r.stuckPoint}</td>
        <td>{r.impactModules}</td>
        <td>{r.evidenceChain}</td>
        <td>{r.ownerRole}</td>
        <td><DashboardTag text={r.status} /></td>
        {actions}
      </tr>
    );
  };

  return (
    <section className="met-dashboard-list-card met-dashboard-surface">
      <header className="met-dashboard-list-card__head">
        <h2>经营诊断工作台</h2>
        <p className="met-dashboard-list-card__hint">{DASHBOARD_SEGMENT_HINTS[segment]}</p>
        <nav className="met-dashboard-segments" aria-label="经营诊断分段">
          {DASHBOARD_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-dashboard-filters">
          <div className="met-dashboard-filters__row met-dashboard-filters__row--search">
            <input
              type="search"
              className="met-dashboard-filters__search"
              placeholder="搜索门店、会员、事项、模块、老师"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-dashboard-filters__row met-dashboard-filters__row--options">
            <select value={filters.store} onChange={e => onFiltersChange({ ...filters, store: e.target.value })}>
              {DASHBOARD_FILTER_OPTIONS.stores.map(o => (
                <option key={o} value={o}>{o === '全部' ? '门店' : o}</option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {DASHBOARD_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>{o === '全部' ? '风险' : o}</option>
              ))}
            </select>
            <select value={filters.module} onChange={e => onFiltersChange({ ...filters, module: e.target.value })}>
              {DASHBOARD_FILTER_OPTIONS.modules.map(o => (
                <option key={o} value={o}>{o === '全部' ? '模块' : o}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="met-dashboard-segment-summary" role="group">
        {stats.map(s => (
          <div key={s.label} className="met-dashboard-segment-summary__item">
            <span className="met-dashboard-segment-summary__label">{s.label}</span>
            <span className="met-dashboard-segment-summary__value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="met-dashboard-table-wrap custom-scroll">
        <table className="met-dashboard-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-dashboard-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-dashboard-table__empty">
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

export default DashboardWorkspaceTable;
