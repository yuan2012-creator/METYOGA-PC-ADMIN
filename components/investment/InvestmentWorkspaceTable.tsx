import React, { useMemo } from 'react';
import {
  computeInvestmentSegmentMiniSummary,
  filterInvestmentRows,
  getInvestmentRows,
  INVESTMENT_FILTER_OPTIONS,
  INVESTMENT_SEGMENT_HINTS,
  INVESTMENT_WORKBENCH_SEGMENTS,
  type InvestmentBreakevenRecord,
  type InvestmentCapexRecord,
  type InvestmentCashflowRecord,
  type InvestmentFixedCostRecord,
  type InvestmentListFilters,
  type InvestmentOperationSnapshot,
  type InvestmentProjectRecord,
  type InvestmentRevenueRecord,
  type InvestmentSegment,
  type InvestmentSensitivityRecord,
} from './investmentOperationViewModel';
import { formatInvestmentCny } from './investmentFormatters';
import { InvestmentTag } from './investmentModalShared';

interface InvestmentWorkspaceTableProps {
  segment: InvestmentSegment;
  onSegmentChange: (s: InvestmentSegment) => void;
  snapshot: InvestmentOperationSnapshot;
  filters: InvestmentListFilters;
  onFiltersChange: (f: InvestmentListFilters) => void;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
  onSecondary: (id: string) => void;
}

const PRIMARY: Record<InvestmentSegment, string> = {
  projects: '查看方案',
  capex: '查看明细',
  fixedCost: '查看成本',
  revenue: '查看模型',
  breakeven: '查看公式',
  cashflow: '查看现金流',
  sensitivity: '查看影响',
};

const SECONDARY: Record<InvestmentSegment, string> = {
  projects: '查看测算',
  capex: '调整预览',
  fixedCost: '调整预览',
  revenue: '调整预览',
  breakeven: '查看建议',
  cashflow: '查看原因',
  sensitivity: '调整预览',
};

const SEGMENT_HEADERS: Record<InvestmentSegment, string[]> = {
  projects: ['项目名称', '城市 / 区域', '面积', '门店类型', '投入预算', '月成本', '预计回本', '风险'],
  capex: ['投入项', '分类', '预算金额', '已确认金额', '差异', '是否必要', '风险说明'],
  fixedCost: ['成本项', '类型', '月预算', '占比', '是否刚性', '风险说明'],
  revenue: ['收入类型', '可售产品', '单价', '月成交量', '月收入', '产能利用率', '风险'],
  breakeven: ['测算项', '当前值', '保本要求', '差距', '影响因素', '判断'],
  cashflow: ['月份', '期初现金', '本月收入', '本月支出', '净现金流', '累计现金流', '风险'],
  sensitivity: ['参数', '当前值', '调整后', '对回本周期影响', '对现金流影响', '风险等级'],
};

const RowActions: React.FC<{
  segment: InvestmentSegment;
  onPrimary: () => void;
  onSecondary: () => void;
}> = ({ segment, onPrimary, onSecondary }) => (
  <td className="met-investment-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-investment-table-btn" onClick={onPrimary}>{PRIMARY[segment]}</button>
    <button type="button" className="met-investment-table-btn" onClick={onSecondary}>{SECONDARY[segment]}</button>
  </td>
);

const InvestmentWorkspaceTable: React.FC<InvestmentWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenDetail,
  onSecondary,
}) => {
  const rows = useMemo(
    () => filterInvestmentRows(getInvestmentRows(snapshot, segment), segment, filters),
    [snapshot, segment, filters],
  );
  const stats = useMemo(() => computeInvestmentSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderRow = (row: ReturnType<typeof getInvestmentRows>[number]) => {
    const cls = rowClass(row.id);
    const open = () => onOpenDetail(row.id);
    const sec = () => onSecondary(row.id);
    const actions = <RowActions segment={segment} onPrimary={open} onSecondary={sec} />;

    if (row.segment === 'projects') {
      const r = row as InvestmentProjectRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-investment-col-name">{r.projectName}</td>
          <td>{r.region}</td>
          <td className="met-investment-col-nowrap">{r.area}㎡</td>
          <td>{r.storeType}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.budget)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.monthlyCost)}</td>
          <td>{r.paybackMonths}</td>
          <td><InvestmentTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'capex') {
      const r = row as InvestmentCapexRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-investment-col-name">{r.itemName}</td>
          <td>{r.category}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.budgetAmount)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.confirmedAmount)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.variance)}</td>
          <td>{r.isEssential}</td>
          <td>{r.riskNote}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'fixedCost') {
      const r = row as InvestmentFixedCostRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-investment-col-name">{r.costName}</td>
          <td>{r.costType}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.monthlyBudget)}</td>
          <td>{r.ratio}</td>
          <td>{r.isRigid}</td>
          <td>{r.riskNote}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'revenue') {
      const r = row as InvestmentRevenueRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-investment-col-name">{r.revenueType}</td>
          <td>{r.product}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.unitPrice)}</td>
          <td className="met-investment-col-nowrap">{r.monthlyVolume}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.monthlyRevenue)}</td>
          <td>{r.utilization}</td>
          <td><InvestmentTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'breakeven') {
      const r = row as InvestmentBreakevenRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-investment-col-name">{r.metricName}</td>
          <td>{r.currentValue}</td>
          <td>{r.breakevenReq}</td>
          <td>{r.gap}</td>
          <td>{r.factor}</td>
          <td><InvestmentTag text={r.judgment} /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'cashflow') {
      const r = row as InvestmentCashflowRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-investment-col-name">{r.monthLabel}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.openingCash)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.monthlyIncome)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.monthlyExpense)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.netCashflow)}</td>
          <td className="met-investment-col-amount">{formatInvestmentCny(r.cumulativeCash)}</td>
          <td><InvestmentTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    const r = row as InvestmentSensitivityRecord;
    return (
      <tr key={r.id} className={cls} onClick={open}>
        <td className="met-investment-col-name">{r.paramName}</td>
        <td>{r.currentValue}</td>
        <td>{r.adjustedValue}</td>
        <td>{r.paybackImpact}</td>
        <td>{r.cashflowImpact}</td>
        <td><InvestmentTag text={r.riskLevel} kind="risk" /></td>
        {actions}
      </tr>
    );
  };

  return (
    <section className="met-investment-list-card met-today-surface">
      <header className="met-investment-list-card__head">
        <h2>投资测算工作台</h2>
        <p className="met-investment-list-card__hint">{INVESTMENT_SEGMENT_HINTS[segment]}</p>
        <nav className="met-investment-segments" aria-label="测算分段">
          {INVESTMENT_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-investment-filters">
          <div className="met-investment-filters__row met-investment-filters__row--search">
            <input
              type="search"
              className="met-investment-filters__search"
              placeholder="搜索项目、区域、投入项、成本项、收入类型、参数"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-investment-filters__row met-investment-filters__row--options">
            <select value={filters.project} onChange={e => onFiltersChange({ ...filters, project: e.target.value })}>
              {INVESTMENT_FILTER_OPTIONS.projects.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <select value={filters.timeHorizon} onChange={e => onFiltersChange({ ...filters, timeHorizon: e.target.value })}>
              {INVESTMENT_FILTER_OPTIONS.timeHorizons.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {INVESTMENT_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>{o === '全部' ? '风险' : o}</option>
              ))}
            </select>
            <select value={filters.model} onChange={e => onFiltersChange({ ...filters, model: e.target.value })}>
              {INVESTMENT_FILTER_OPTIONS.models.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="met-investment-segment-summary" role="group">
        {stats.map(s => (
          <div key={s.label} className="met-investment-segment-summary__item">
            <span className="met-investment-segment-summary__label">{s.label}</span>
            <span className="met-investment-segment-summary__value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="met-investment-table-wrap custom-scroll">
        <table className="met-investment-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-investment-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-investment-table__empty">
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

export default InvestmentWorkspaceTable;
