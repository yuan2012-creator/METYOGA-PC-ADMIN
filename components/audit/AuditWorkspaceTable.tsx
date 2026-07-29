import React, { useMemo } from 'react';
import {
  AUDIT_FILTER_OPTIONS,
  AUDIT_SEGMENT_HINTS,
  AUDIT_WORKBENCH_SEGMENTS,
  computeAuditSegmentMiniSummary,
  filterAuditRows,
  getAuditRows,
  type AuditApprovalRecord,
  type AuditChangeRecord,
  type AuditExportRecord,
  type AuditListFilters,
  type AuditOperationLogRecord,
  type AuditOperationSnapshot,
  type AuditRiskRecord,
  type AuditRoleRecord,
  type AuditSegment,
} from './auditOperationViewModel';
import { AuditTag } from './auditModalShared';

interface AuditWorkspaceTableProps {
  segment: AuditSegment;
  onSegmentChange: (s: AuditSegment) => void;
  snapshot: AuditOperationSnapshot;
  filters: AuditListFilters;
  onFiltersChange: (f: AuditListFilters) => void;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
  onOpenChain: (id: string) => void;
  onMarkRisk?: (id: string) => void;
}

const RowActions: React.FC<{
  primary: string;
  secondary?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}> = ({ primary, secondary, onPrimary, onSecondary }) => (
  <td className="met-audit-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-audit-table-btn" onClick={onPrimary}>
      {primary}
    </button>
    {secondary && onSecondary ? (
      <button type="button" className="met-audit-table-btn" onClick={onSecondary}>
        {secondary}
      </button>
    ) : null}
  </td>
);

const MiniSummary: React.FC<{ segment: AuditSegment; snapshot: AuditOperationSnapshot }> = ({
  segment,
  snapshot,
}) => {
  const stats = useMemo(() => computeAuditSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  return (
    <div className="met-audit-segment-summary" role="group">
      {stats.map(s => (
        <div key={s.label} className="met-audit-segment-summary__item">
          <span className="met-audit-segment-summary__label">{s.label}</span>
          <span className="met-audit-segment-summary__value">{s.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderRoleRow = (
  r: AuditRoleRecord,
  cls: string,
  onOpen: () => void,
  onMembers: () => void,
) => (
  <tr key={r.id} className={cls} onClick={onOpen}>
    <td className="met-audit-col-name">{r.roleName}</td>
    <td>{r.scope}</td>
    <td className="met-audit-col-nowrap">{r.memberCount}</td>
    <td>{r.visibleModules}</td>
    <td>{r.sensitivePerms}</td>
    <td>{r.dataScope}</td>
    <td>
      <AuditTag text={r.status} />
    </td>
    <RowActions primary="查看角色" secondary="查看成员" onPrimary={onOpen} onSecondary={onMembers} />
  </tr>
);

const renderApprovalRow = (r: AuditApprovalRecord, cls: string, onOpen: () => void, onChain: () => void) => (
  <tr key={r.id} className={cls} onClick={onOpen}>
    <td className="met-audit-col-code">{r.approvalNo}</td>
    <td>{r.opType}</td>
    <td>{r.applicant}</td>
    <td>{r.relatedObject}</td>
    <td>{r.currentNode}</td>
    <td>
      <AuditTag text={r.riskLevel} kind="risk" />
    </td>
    <td>
      <AuditTag text={r.status} />
    </td>
    <RowActions primary="查看审批" secondary="查看证据链" onPrimary={onOpen} onSecondary={onChain} />
  </tr>
);

const renderLogRow = (r: AuditOperationLogRecord, cls: string, onOpen: () => void) => (
  <tr key={r.id} className={cls} onClick={onOpen}>
    <td className="met-audit-col-nowrap">{r.at}</td>
    <td>{r.operator}</td>
    <td>{r.role}</td>
    <td>{r.module}</td>
    <td>{r.action}</td>
    <td>{r.relatedObject}</td>
    <td className="met-audit-col-nowrap">{r.device}</td>
    <td>
      <AuditTag text={r.riskLevel} kind="risk" />
    </td>
    <RowActions primary="查看日志" onPrimary={onOpen} />
  </tr>
);

const renderExportRow = (r: AuditExportRecord, cls: string, onOpen: () => void, onChain: () => void) => (
  <tr key={r.id} className={cls} onClick={onOpen}>
    <td className="met-audit-col-code">{r.exportNo}</td>
    <td>{r.exporter}</td>
    <td>{r.dataType}</td>
    <td>{r.exportRange}</td>
    <td className="met-audit-col-nowrap">{r.rowCount}</td>
    <td>
      <AuditTag text={r.approvalStatus} />
    </td>
    <td>{r.purpose}</td>
    <RowActions primary="查看记录" secondary="查看审批" onPrimary={onOpen} onSecondary={onChain} />
  </tr>
);

const renderChangeRow = (r: AuditChangeRecord, cls: string, onOpen: () => void, onChain: () => void) => (
  <tr key={r.id} className={cls} onClick={onOpen}>
    <td className="met-audit-col-code">{r.changeNo}</td>
    <td>{r.memberName}</td>
    <td>{r.changeTarget}</td>
    <td>{r.changeType}</td>
    <td>{r.oldSummary}</td>
    <td>{r.newSummary}</td>
    <td>
      <AuditTag text={r.approvalStatus} />
    </td>
    <RowActions primary="查看变更" secondary="查看证据链" onPrimary={onOpen} onSecondary={onChain} />
  </tr>
);

const renderRiskRow = (r: AuditRiskRecord, cls: string, onOpen: () => void, onMark: () => void) => (
  <tr key={r.id} className={cls} onClick={onOpen}>
    <td>{r.riskType}</td>
    <td>{r.subject}</td>
    <td>{r.impactScope}</td>
    <td>{r.riskReason}</td>
    <td>{r.suggestedAction}</td>
    <td>
      <AuditTag text={r.riskLevel} kind="risk" />
    </td>
    <td>
      <AuditTag text={r.status} />
    </td>
    <RowActions primary="查看风险" secondary="标记处理" onPrimary={onOpen} onSecondary={onMark} />
  </tr>
);

const SEGMENT_HEADERS: Record<AuditSegment, string[]> = {
  roles: ['角色名称', '适用范围', '成员数', '可见模块', '敏感权限', '数据权限', '状态'],
  approvals: ['审批单号', '操作类型', '申请人', '关联对象', '当前节点', '风险等级', '状态'],
  logs: ['时间', '操作人', '角色', '操作模块', '操作动作', '关联对象', 'IP / 设备', '风险'],
  exports: ['导出编号', '导出人', '数据类型', '导出范围', '条数', '审批状态', '用途说明'],
  changes: ['变更编号', '会员', '变更对象', '变更类型', '原值摘要', '新值摘要', '审批状态'],
  risks: ['风险类型', '角色 / 人员', '影响范围', '风险原因', '建议动作', '风险等级', '状态'],
};

const AuditWorkspaceTable: React.FC<AuditWorkspaceTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenDetail,
  onOpenChain,
  onMarkRisk,
}) => {
  const rows = useMemo(() => {
    const all = getAuditRows(snapshot, segment);
    return filterAuditRows(all, segment, filters);
  }, [snapshot, segment, filters]);

  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderBody = () => {
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-audit-table__empty">
            暂无匹配记录，请调整筛选条件
          </td>
        </tr>
      );
    }
    return rows.map(row => {
      const cls = rowClass(row.id);
      if (row.segment === 'roles') {
        return renderRoleRow(row, cls, () => onOpenDetail(row.id), () => onOpenDetail(row.id));
      }
      if (row.segment === 'approvals') {
        return renderApprovalRow(row, cls, () => onOpenDetail(row.id), () => onOpenChain(row.id));
      }
      if (row.segment === 'logs') {
        return renderLogRow(row, cls, () => onOpenDetail(row.id));
      }
      if (row.segment === 'exports') {
        return renderExportRow(row, cls, () => onOpenDetail(row.id), () => onOpenChain(row.id));
      }
      if (row.segment === 'changes') {
        return renderChangeRow(row, cls, () => onOpenDetail(row.id), () => onOpenChain(row.id));
      }
      return renderRiskRow(row, cls, () => onOpenDetail(row.id), () => onMarkRisk?.(row.id));
    });
  };

  return (
    <section className="met-audit-list-card met-today-surface">
      <header className="met-audit-list-card__head">
        <h2>权限审计工作台</h2>
        <p className="met-audit-list-card__hint">{AUDIT_SEGMENT_HINTS[segment]}</p>
        <nav className="met-audit-segments" aria-label="审计分段">
          {AUDIT_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-audit-filters">
          <div className="met-audit-filters__row met-audit-filters__row--search">
            <input
              type="search"
              className="met-audit-filters__search"
              placeholder="搜索角色 / 人员 / 审批单号 / 对象 / 模块"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-audit-filters__row met-audit-filters__row--options">
            <select value={filters.status} onChange={e => onFiltersChange({ ...filters, status: e.target.value })}>
              {AUDIT_FILTER_OPTIONS.statuses.map(o => (
                <option key={o} value={o}>
                  {o === '全部' ? '状态' : o}
                </option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {AUDIT_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>
                  {o === '全部' ? '风险等级' : o}
                </option>
              ))}
            </select>
            <select value={filters.scope} onChange={e => onFiltersChange({ ...filters, scope: e.target.value })}>
              {AUDIT_FILTER_OPTIONS.scopes.map(o => (
                <option key={o} value={o}>
                  {o === '全部' ? '范围' : o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <MiniSummary segment={segment} snapshot={snapshot} />

      <div className="met-audit-table-wrap custom-scroll">
        <table className="met-audit-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-audit-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </section>
  );
};

export default AuditWorkspaceTable;
