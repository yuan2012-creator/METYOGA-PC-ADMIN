import React, { useMemo } from 'react';
import {
  computePartnerSegmentMiniSummary,
  filterPartnerRows,
  getPartnerRows,
  PARTNER_FILTER_OPTIONS,
  PARTNER_SEGMENT_HINTS,
  PARTNER_WORKBENCH_SEGMENTS,
  type PartnerAuthRecord,
  type PartnerBrandRecord,
  type PartnerDataSyncRecord,
  type PartnerListFilters,
  type PartnerOperationSnapshot,
  type PartnerQualityRecord,
  type PartnerRenewalRecord,
  type PartnerSegment,
  type PartnerStoreRecord,
  type PartnerSystemAuthRecord,
} from './partnerOperationViewModel';
import { PartnerTag } from './partnerModalShared';

interface PartnerWorkspaceTableProps {
  segment: PartnerSegment;
  onSegmentChange: (s: PartnerSegment) => void;
  snapshot: PartnerOperationSnapshot;
  filters: PartnerListFilters;
  onFiltersChange: (f: PartnerListFilters) => void;
  highlightId?: string | null;
  onOpenDetail: (id: string) => void;
  onSecondary: (id: string) => void;
}

const PRIMARY: Record<PartnerSegment, string> = {
  stores: '查看门店',
  authStatus: '查看授权',
  brand: '查看规范',
  dataSync: '查看数据',
  quality: '查看质检',
  systemAuth: '查看授权',
  renewal: '查看续约',
};

const SECONDARY: Record<PartnerSegment, string> = {
  stores: '查看授权',
  authStatus: '查看合同',
  brand: '查看整改',
  dataSync: '查看异常',
  quality: '查看整改',
  systemAuth: '查看使用',
  renewal: '查看退出',
};

const SEGMENT_HEADERS: Record<PartnerSegment, string[]> = {
  stores: ['门店名称', '合作类型', '城市 / 区域', '授权状态', '授权到期', '数据状态', '质检状态', '风险'],
  authStatus: ['授权编号', '门店', '授权层级', '授权范围', '开始日期', '到期日期', '当前状态', '风险'],
  brand: ['规范项', '门店', '检查对象', '当前结果', '需整改内容', '截止时间', '状态'],
  dataSync: ['门店', '回传日期', '会员数据', '课程数据', '财务摘要', '老师课时', '回传状态', '异常原因'],
  quality: ['质检编号', '门店', '质检类型', '问题等级', '整改项', '负责人', '截止时间', '状态'],
  systemAuth: ['授权内容', '门店', '授权类型', '可用范围', '使用状态', '到期时间', '风险'],
  renewal: ['门店', '当前阶段', '到期时间', '续约意向', '风险原因', '下一步动作', '负责人', '状态'],
};

const RowActions: React.FC<{
  segment: PartnerSegment;
  onPrimary: () => void;
  onSecondary: () => void;
}> = ({ segment, onPrimary, onSecondary }) => (
  <td className="met-partner-col-actions" onClick={e => e.stopPropagation()}>
    <button type="button" className="met-partner-table-btn" onClick={onPrimary}>{PRIMARY[segment]}</button>
    <button type="button" className="met-partner-table-btn" onClick={onSecondary}>{SECONDARY[segment]}</button>
  </td>
);

const PartnerWorkspaceTable: React.FC<PartnerWorkspaceTableProps> = ({
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
    () => filterPartnerRows(getPartnerRows(snapshot, segment), filters),
    [snapshot, segment, filters],
  );
  const stats = useMemo(() => computePartnerSegmentMiniSummary(snapshot, segment), [snapshot, segment]);
  const rowClass = (id: string) => (highlightId === id ? ' is-highlight' : '');

  const renderRow = (row: ReturnType<typeof getPartnerRows>[number]) => {
    const cls = rowClass(row.id);
    const open = () => onOpenDetail(row.id);
    const sec = () => onSecondary(row.id);
    const actions = <RowActions segment={segment} onPrimary={open} onSecondary={sec} />;

    if (row.segment === 'stores') {
      const r = row as PartnerStoreRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-partner-col-name">{r.storeName}</td>
          <td>{r.coopType}</td>
          <td>{r.region}</td>
          <td><PartnerTag text={r.authStatus} /></td>
          <td className="met-partner-col-nowrap">{r.authExpiry}</td>
          <td><PartnerTag text={r.dataStatus} /></td>
          <td><PartnerTag text={r.qualityStatus} /></td>
          <td><PartnerTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'authStatus') {
      const r = row as PartnerAuthRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-partner-col-code">{r.authNo}</td>
          <td className="met-partner-col-name">{r.storeName}</td>
          <td>{r.authLevel}</td>
          <td>{r.authScope}</td>
          <td className="met-partner-col-nowrap">{r.startDate}</td>
          <td className="met-partner-col-nowrap">{r.expiryDate}</td>
          <td><PartnerTag text={r.currentStatus} /></td>
          <td><PartnerTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'brand') {
      const r = row as PartnerBrandRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td>{r.ruleItem}</td>
          <td className="met-partner-col-name">{r.storeName}</td>
          <td>{r.checkTarget}</td>
          <td><PartnerTag text={r.currentResult} /></td>
          <td>{r.fixContent}</td>
          <td className="met-partner-col-nowrap">{r.deadline}</td>
          <td><PartnerTag text={r.status} /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'dataSync') {
      const r = row as PartnerDataSyncRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-partner-col-name">{r.storeName}</td>
          <td className="met-partner-col-nowrap">{r.syncDate}</td>
          <td>{r.memberData}</td>
          <td>{r.courseData}</td>
          <td>{r.financeSummary}</td>
          <td>{r.teacherHours}</td>
          <td><PartnerTag text={r.syncStatus} /></td>
          <td>{r.anomalyReason}</td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'quality') {
      const r = row as PartnerQualityRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-partner-col-code">{r.qualityNo}</td>
          <td className="met-partner-col-name">{r.storeName}</td>
          <td>{r.qualityType}</td>
          <td><PartnerTag text={r.issueLevel} kind="risk" /></td>
          <td>{r.fixItem}</td>
          <td>{r.owner}</td>
          <td className="met-partner-col-nowrap">{r.deadline}</td>
          <td><PartnerTag text={r.status} /></td>
          {actions}
        </tr>
      );
    }
    if (row.segment === 'systemAuth') {
      const r = row as PartnerSystemAuthRecord;
      return (
        <tr key={r.id} className={cls} onClick={open}>
          <td className="met-partner-col-name">{r.authContent}</td>
          <td>{r.storeName}</td>
          <td>{r.authType}</td>
          <td>{r.usableScope}</td>
          <td><PartnerTag text={r.useStatus} /></td>
          <td className="met-partner-col-nowrap">{r.expiryTime}</td>
          <td><PartnerTag text={r.riskLevel} kind="risk" /></td>
          {actions}
        </tr>
      );
    }
    const r = row as PartnerRenewalRecord;
    return (
      <tr key={r.id} className={cls} onClick={open}>
        <td className="met-partner-col-name">{r.storeName}</td>
        <td>{r.currentPhase}</td>
        <td className="met-partner-col-nowrap">{r.expiryTime}</td>
        <td>{r.renewalIntent}</td>
        <td>{r.riskReason}</td>
        <td>{r.nextAction}</td>
        <td>{r.owner}</td>
        <td><PartnerTag text={r.status} /></td>
        {actions}
      </tr>
    );
  };

  return (
    <section className="met-partner-list-card met-today-surface">
      <header className="met-partner-list-card__head">
        <h2>合作门店治理工作台</h2>
        <p className="met-partner-list-card__hint">{PARTNER_SEGMENT_HINTS[segment]}</p>
        <nav className="met-partner-segments" aria-label="合作治理分段">
          {PARTNER_WORKBENCH_SEGMENTS.map(s => (
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
        <div className="met-partner-filters">
          <div className="met-partner-filters__row met-partner-filters__row--search">
            <input
              type="search"
              className="met-partner-filters__search"
              placeholder="搜索门店、城市、授权编号、合作类型、质检编号、规范项"
              value={filters.query}
              onChange={e => onFiltersChange({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="met-partner-filters__row met-partner-filters__row--options">
            <select value={filters.coopType} onChange={e => onFiltersChange({ ...filters, coopType: e.target.value })}>
              {PARTNER_FILTER_OPTIONS.coopTypes.map(o => (
                <option key={o} value={o}>{o === '全部' ? '合作类型' : o}</option>
              ))}
            </select>
            <select value={filters.authStatus} onChange={e => onFiltersChange({ ...filters, authStatus: e.target.value })}>
              {PARTNER_FILTER_OPTIONS.authStatuses.map(o => (
                <option key={o} value={o}>{o === '全部' ? '授权状态' : o}</option>
              ))}
            </select>
            <select value={filters.risk} onChange={e => onFiltersChange({ ...filters, risk: e.target.value })}>
              {PARTNER_FILTER_OPTIONS.risks.map(o => (
                <option key={o} value={o}>{o === '全部' ? '风险' : o}</option>
              ))}
            </select>
            <select value={filters.region} onChange={e => onFiltersChange({ ...filters, region: e.target.value })}>
              {PARTNER_FILTER_OPTIONS.regions.map(o => (
                <option key={o} value={o}>{o === '全部' ? '区域' : o}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="met-partner-segment-summary" role="group">
        {stats.map(s => (
          <div key={s.label} className="met-partner-segment-summary__item">
            <span className="met-partner-segment-summary__label">{s.label}</span>
            <span className="met-partner-segment-summary__value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="met-partner-table-wrap custom-scroll">
        <table className="met-partner-table">
          <thead>
            <tr>
              {SEGMENT_HEADERS[segment].map(h => (
                <th key={h}>{h}</th>
              ))}
              <th className="met-partner-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={SEGMENT_HEADERS[segment].length + 1} className="met-partner-table__empty">
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

export default PartnerWorkspaceTable;
