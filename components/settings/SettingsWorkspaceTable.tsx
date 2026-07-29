import React, { useMemo } from 'react';
import {
  computeSettingsSegmentMiniSummary,
  filterSettingsRules,
  SETTINGS_FILTER_OPTIONS,
  SETTINGS_SEGMENT_COLUMNS,
  SETTINGS_SEGMENT_HINTS,
  SETTINGS_WORKBENCH_SEGMENTS,
  type SettingsListFilters,
  type SettingsOperationSnapshot,
  type SettingsRuleRow,
  type SettingsWorkbenchSegment,
} from './settingsOperationViewModel';
import { isSettingsEmpty } from './settingsOperationViewModel';
import { SettingsTag } from './settingsModalShared';

interface SettingsWorkspaceTableProps {
  segment: SettingsWorkbenchSegment;
  onSegmentChange: (s: SettingsWorkbenchSegment) => void;
  snapshot: SettingsOperationSnapshot;
  filters: SettingsListFilters;
  onFiltersChange: (f: SettingsListFilters) => void;
  highlightId?: string | null;
  onOpenRule: (id: string) => void;
  onViewImpact: (id: string) => void;
}

const PortChips: React.FC<{ ports: string[] }> = ({ ports }) => (
  <span className="met-settings-port-chips">
    {ports.slice(0, 3).map(p => (
      <span key={p} className="met-settings-chip met-settings-chip--neutral">
        {p}
      </span>
    ))}
    {ports.length > 3 ? <span className="met-settings-table__muted">+{ports.length - 3}</span> : null}
  </span>
);

const RuleNameCell: React.FC<{ rule: SettingsRuleRow }> = ({ rule }) => (
  <div className="met-settings-rule-cell">
    <span className="met-settings-rule-name">{rule.ruleName}</span>
    <span className="met-settings-rule-id">{rule.ruleId}</span>
  </div>
);

const getRowCells = (r: SettingsRuleRow, segment: SettingsWorkbenchSegment): string[] => {
  switch (segment) {
    case 'booking':
      return [r.displayCol1, r.displayCol2, r.displayCol3, r.displayCol4, r.displayRisk];
    case 'courses':
      return [r.displayCol1, r.displayCol2, r.displayCol3, r.displayCol4, r.displayRisk, r.status];
    case 'cardBenefits':
      return [
        r.displayCol2,
        r.applicableCourseTypes,
        r.applicableStores,
        r.displayCol3,
        r.assetImpact,
        r.displayCol4,
      ];
    case 'contract':
      return [
        r.displayCol1,
        r.applicableProducts,
        r.approvalRequired,
        r.financeImpact,
        r.assetImpact,
        r.displayCol4,
      ];
    case 'points':
      return [
        r.displayCol1,
        r.displayCol2,
        r.displayCol3,
        r.applicableStores,
        r.frontendText,
        r.displayCol4,
      ];
    case 'teacherPay':
      return [
        r.displayCol1,
        r.displayCol2,
        r.displayCol3,
        r.displayCol4,
        r.financeImpact,
        r.status,
      ];
    case 'crossStore':
      return [
        r.displayCol1,
        r.displayCol2,
        r.displayCol3,
        r.displayCol4,
        r.financeImpact,
        r.status,
      ];
    case 'notifyPerm':
      return [r.displayCol1, r.displayCol2, r.displayCol3, r.displayCol4, r.status, r.displayRisk];
    default:
      return [r.displayCol1, r.displayCol2, r.displayCol3, r.displayCol4];
  }
};

const renderCell = (
  segment: SettingsWorkbenchSegment,
  colIndex: number,
  value: string,
  r: SettingsRuleRow,
  colHeader: string,
) => {
  if (colHeader === '当前状态' || colHeader === '发布状态' || colHeader === '状态') {
    return <SettingsTag text={value} kind="status" />;
  }
  if (colHeader === '风险' || colHeader === '财务状态') {
    return isSettingsEmpty(value) ? <span className="met-settings-table__muted">—</span> : <SettingsTag text={value} kind="risk" />;
  }
  if (colHeader === '敏感等级') {
    return <SettingsTag text={r.sensitivity} kind="sensitivity" />;
  }
  if (colIndex === 4 && segment === 'booking' && colHeader === '风险') {
    return isSettingsEmpty(value) ? <span className="met-settings-table__muted">—</span> : <SettingsTag text={value} kind="risk" />;
  }
  if (segment === 'teacherPay' && colHeader === '财务状态') {
    return <SettingsTag text={value} kind="status" />;
  }
  return value;
};

const RowActions: React.FC<{
  id: string;
  onOpen: (id: string) => void;
  onImpact: (id: string) => void;
}> = ({ id, onOpen, onImpact }) => (
  <td className="met-settings-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-settings-table-btn" onClick={() => onOpen(id)}>
      查看规则
    </button>
    <button type="button" className="met-settings-table-btn" onClick={() => onImpact(id)}>
      查看影响
    </button>
  </td>
);

const MiniSummary: React.FC<{ segment: SettingsWorkbenchSegment; snapshot: SettingsOperationSnapshot }> = ({
  segment,
  snapshot,
}) => {
  const stats = useMemo(() => computeSettingsSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  return (
    <div className="met-settings-segment-summary" role="group">
      {stats.map(s => (
        <div key={s.label} className="met-settings-segment-summary__item">
          <span className="met-settings-segment-summary__label">{s.label}</span>
          <span className="met-settings-segment-summary__value">{s.value}</span>
        </div>
      ))}
    </div>
  );
};

const SettingsWorkspaceTable: React.FC<SettingsWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenRule,
  onViewImpact,
}) => {
  const cols = SETTINGS_SEGMENT_COLUMNS[segment];
  const colHeaders = [cols.col1, cols.col2, cols.col3, cols.col4, cols.col5, cols.col6].filter(Boolean) as string[];
  const filtered = useMemo(
    () => filterSettingsRules(snapshot.rules, segment, filters),
    [snapshot.rules, segment, filters],
  );

  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');
  const nameHeader = segment === 'cardBenefits' ? '卡项 / 产品' : '规则名称';

  return (
    <section className="met-settings-list-card met-today-surface">
      <header className="met-settings-list-card__head">
        <h2>规则配置工作台</h2>
        <p className="met-settings-list-card__hint">{SETTINGS_SEGMENT_HINTS[segment]}</p>
        <nav className="met-settings-segments" aria-label="规则分段">
          {SETTINGS_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-settings-filters">
          <div className="met-settings-filters__row met-settings-filters__row--search">
            <input
              type="search"
              className="met-settings-filters__search"
              placeholder="搜索规则名 / 产品 / 课程 / 门店 / 端口 / 角色"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-settings-filters__row met-settings-filters__row--options">
            <select value={filters.status} onChange={e => onFiltersChange({ ...filters, status: e.target.value })}>
              {SETTINGS_FILTER_OPTIONS.statuses.map(o => (
                <option key={o} value={o}>
                  {o === '全部' ? '状态' : o}
                </option>
              ))}
            </select>
            <select
              value={filters.sensitivity}
              onChange={e => onFiltersChange({ ...filters, sensitivity: e.target.value })}
            >
              {SETTINGS_FILTER_OPTIONS.sensitivities.map(o => (
                <option key={o} value={o}>
                  {o === '全部' ? '敏感等级' : o}
                </option>
              ))}
            </select>
            <select value={filters.port} onChange={e => onFiltersChange({ ...filters, port: e.target.value })}>
              {SETTINGS_FILTER_OPTIONS.ports.map(o => (
                <option key={o} value={o}>
                  {o === '全部' ? '影响端口' : o}
                </option>
              ))}
            </select>
            <label className="met-settings-filter-check">
              <input
                type="checkbox"
                checked={filters.conflictOnly}
                onChange={e => onFiltersChange({ ...filters, conflictOnly: e.target.checked })}
              />
              <span>仅冲突</span>
            </label>
            <label className="met-settings-filter-check">
              <input
                type="checkbox"
                checked={filters.pendingOnly}
                onChange={e => onFiltersChange({ ...filters, pendingOnly: e.target.checked })}
              />
              <span>待审核</span>
            </label>
          </div>
        </div>
      </header>

      <MiniSummary segment={segment} snapshot={snapshot} />

      <div className="met-settings-table-wrap custom-scroll">
        <table className="met-settings-table">
          <thead>
            <tr>
              <th className="met-settings-col-name">{nameHeader}</th>
              {colHeaders.map(h => (
                <th key={h}>{h}</th>
              ))}
              <th>敏感等级</th>
              <th>影响端口</th>
              <th className="met-settings-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={colHeaders.length + 4} className="met-settings-table__empty">
                  暂无匹配规则，请调整筛选条件
                </td>
              </tr>
            ) : (
              filtered.map(r => {
                const cells = getRowCells(r, segment);
                return (
                  <tr key={r.id} className={rowClass(r.id)} onClick={() => onOpenRule(r.id)}>
                    <td className="met-settings-col-name">
                      <RuleNameCell rule={r} />
                    </td>
                    {cells.map((value, i) => (
                      <td key={`${r.id}-${i}`}>{renderCell(segment, i, value, r, colHeaders[i] ?? '')}</td>
                    ))}
                    <td>
                      <SettingsTag text={r.sensitivity} kind="sensitivity" />
                    </td>
                    <td>
                      <PortChips ports={r.affectedPorts} />
                    </td>
                    <RowActions id={r.id} onOpen={onOpenRule} onImpact={onViewImpact} />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SettingsWorkspaceTable;
