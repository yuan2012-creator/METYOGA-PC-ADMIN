import React, { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SecondaryPageHeader } from '../shared';
import {
  buildTeacherApplicationsSnapshot,
  getTeacherApplicationImpactClass,
  getTeacherApplicationStatusClass,
  getTeacherApplicationTypeClass,
  sortTeacherApplications,
  type TeacherApplicationFilterOption,
  type TeacherApplicationRow,
  type TeacherApplicationType,
} from './staffSecondaryTeacherApplications.viewModel';
import './staffSecondaryTeacherApplications.css';

export type TeacherApplicationsInitialTab =
  | 'all'
  | TeacherApplicationType;

export interface StaffSecondaryTeacherApplicationsPageProps {
  initialTab?: TeacherApplicationsInitialTab;
  onBack: () => void;
  onOpenDetail: (applicationId: string) => void;
  onToast: (message: string) => void;
}

type FilterGroupKey =
  | 'store'
  | 'type'
  | 'status'
  | 'impact'
  | 'level'
  | 'approver'
  | 'course'
  | 'time';

const FILTER_GROUPS: { key: FilterGroupKey; label: string; mockOnly?: boolean }[] = [
  { key: 'store', label: '门店', mockOnly: true },
  { key: 'type', label: '申请类型' },
  { key: 'status', label: '审批状态' },
  { key: 'impact', label: '影响范围' },
  { key: 'level', label: '老师等级' },
  { key: 'approver', label: '当前审批人', mockOnly: true },
  { key: 'course', label: '课程类型', mockOnly: true },
  { key: 'time', label: '时间范围', mockOnly: true },
];

const DEFAULT_FILTERS: Record<FilterGroupKey, string> = {
  store: 'all',
  type: 'all',
  status: 'all',
  impact: 'all',
  level: 'all',
  approver: 'all',
  course: 'all',
  time: 'all',
};

function ApplicationRowCard({
  row,
  selected,
  onToggleSelect,
  onOpenDetail,
  onToast,
}: {
  row: TeacherApplicationRow;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article
      className={[
        'met-teacher-app__row',
        getTeacherApplicationImpactClass(row.impactLevel),
        selected ? 'is-selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(row.applicationId)}
      onKeyDown={e => {
        if (e.key === 'Enter') onOpenDetail(row.applicationId);
      }}
    >
      <div className="met-teacher-app__row-check" onClick={stop}>
        <input
          type="checkbox"
          checked={selected}
          aria-label={`选择申请 ${row.applicationId}`}
          onChange={() => onToggleSelect(row.applicationId)}
        />
      </div>

      <div className="met-teacher-app__row-main">
        <div className="met-teacher-app__row-head">
          <div className="met-teacher-app__row-identity">
            <span className="met-teacher-app__app-id">{row.applicationId}</span>
            <span
              className={[
                'met-teacher-app__type',
                getTeacherApplicationTypeClass(row.applicationType),
              ].join(' ')}
            >
              {row.applicationTypeLabel}
            </span>
            <h3 className="met-teacher-app__teacher-name">{row.teacherName}</h3>
            <span>{row.teacherLevel}</span>
            <span>{row.store}</span>
          </div>
          <div className="met-teacher-app__row-status">
            <span
              className={[
                'met-teacher-app__status',
                getTeacherApplicationStatusClass(row.approvalStatus),
              ].join(' ')}
            >
              {row.approvalStatusLabel}
            </span>
            <span className="met-teacher-app__label">审批人：{row.currentApprover}</span>
          </div>
        </div>

        <div className="met-teacher-app__row-body">
          <div className="met-teacher-app__row-col">
            <span className="met-teacher-app__label">涉及课程</span>
            <span>{row.relatedCourse}</span>
            <span>{row.courseType}</span>
          </div>
          <div className="met-teacher-app__row-col">
            <span className="met-teacher-app__label">涉及时间</span>
            <span>{row.relatedTime}</span>
            {row.bookedCount > 0 ? <span>已预约 {row.bookedCount} 人</span> : null}
          </div>
          <div className="met-teacher-app__row-col">
            <span className="met-teacher-app__label">影响范围</span>
            <span>{row.impactScope}</span>
            <span>{row.materialStatusLabel}</span>
          </div>
          <div className="met-teacher-app__row-col met-teacher-app__row-col--wide">
            <span className="met-teacher-app__label">申请原因</span>
            <span>{row.reason}</span>
            <span>附件：{row.evidenceFiles}</span>
          </div>
        </div>

        <div className="met-teacher-app__row-foot">
          <span className="met-teacher-app__suggested">{row.suggestedAction}</span>
          <div className="met-teacher-app__row-btns" onClick={stop}>
            <button
              type="button"
              className="met-teacher-app__btn met-teacher-app__btn--sm"
              onClick={() => onOpenDetail(row.applicationId)}
            >
              查看详情
            </button>
            <button
              type="button"
              className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
              onClick={() => onToast('通过申请（待建设）')}
            >
              通过 mock
            </button>
            <button
              type="button"
              className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
              onClick={() => onToast('驳回申请（待建设）')}
            >
              驳回 mock
            </button>
            <button
              type="button"
              className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
              onClick={() => onToast('要求补充材料（待建设）')}
            >
              要求补充材料
            </button>
          </div>
        </div>
      </div>

      <div className="met-teacher-app__row-btns" onClick={stop}>
        <button
          type="button"
          className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
          onClick={() => onToast('查看涉及课程（待建设）')}
        >
          查看涉及课程
        </button>
        <button
          type="button"
          className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
          onClick={() => onToast('查看老师档案（待建设）')}
        >
          查看老师档案
        </button>
      </div>
    </article>
  );
}

const StaffSecondaryTeacherApplicationsPage: React.FC<
  StaffSecondaryTeacherApplicationsPageProps
> = ({ initialTab = 'all', onBack, onOpenDetail, onToast }) => {
  const snapshot = useMemo(() => buildTeacherApplicationsSnapshot(), []);
  const [activeTab, setActiveTab] = useState<TeacherApplicationsInitialTab>(initialTab);
  const [filters, setFilters] = useState<Record<FilterGroupKey, string>>(DEFAULT_FILTERS);
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const optionsByGroup = useMemo(() => {
    const map = new Map<FilterGroupKey, TeacherApplicationFilterOption[]>();
    FILTER_GROUPS.forEach(g => map.set(g.key, []));
    snapshot.filterOptions.forEach(opt => {
      const group = opt.group as FilterGroupKey;
      if (map.has(group)) map.get(group)!.push(opt);
    });
    return map;
  }, [snapshot.filterOptions]);

  const toggleFilter = useCallback(
    (group: FilterGroupKey, value: string) => {
      const groupDef = FILTER_GROUPS.find(g => g.key === group);
      if (groupDef?.mockOnly && value !== 'all') {
        onToast(`切换${groupDef.label}筛选（待建设）`);
      }
      setFilters(prev => ({ ...prev, [group]: value }));
    },
    [onToast],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setKeyword('');
    setActiveTab('all');
    onToast('已恢复默认筛选');
  }, [onToast]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const filteredRows = useMemo(() => {
    let rows = snapshot.rows;

    if (activeTab !== 'all') {
      rows = rows.filter(r => r.applicationType === activeTab);
    }
    if (filters.type !== 'all') {
      rows = rows.filter(r => r.applicationType === filters.type);
    }
    if (filters.status !== 'all') {
      rows = rows.filter(r => r.approvalStatus === filters.status);
    }
    if (filters.impact !== 'all') {
      rows = rows.filter(r => r.impactLevel === filters.impact);
    }
    if (filters.level !== 'all') {
      rows = rows.filter(r => r.teacherLevel === filters.level);
    }
    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      rows = rows.filter(
        r =>
          r.teacherName.toLowerCase().includes(q) ||
          r.applicationId.toLowerCase().includes(q) ||
          r.relatedCourse.toLowerCase().includes(q),
      );
    }

    return sortTeacherApplications(rows);
  }, [snapshot.rows, activeTab, filters, keyword]);

  const typeDescription =
    snapshot.typeDescriptions[activeTab === 'all' ? 'all' : activeTab];

  return (
    <div className="met-teacher-app">
      <div className="met-teacher-app__inner">
        <SecondaryPageHeader
          backLabel="返回师资与团队"
          onBack={onBack}
          breadcrumb={`${snapshot.meta.breadcrumbParent} / ${snapshot.meta.breadcrumbCurrent}`}
          title={snapshot.meta.title}
          subtitle={snapshot.meta.subtitle}
          scope={snapshot.meta.scopeLabel}
          description={snapshot.meta.description}
          primaryActionLabel="审批规则（待建设）"
          onPrimaryAction={() => onToast(snapshot.meta.rulesToast)}
          primaryActionVariant="ghost"
          disclaimer={snapshot.meta.disclaimer}
        />

        <section className="met-teacher-app__summary">
          {snapshot.summaryItems.map(item => (
            <div
              key={item.id}
              className={[
                'met-teacher-app__summary-card',
                item.isWarning ? 'is-warning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="met-teacher-app__summary-value">{item.value}</span>
              <span className="met-teacher-app__summary-label">{item.label}</span>
            </div>
          ))}
        </section>

        <section>
          <div className="met-teacher-app__type-tabs">
            {snapshot.typeTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={[
                  'met-teacher-app__type-tab',
                  activeTab === tab.value ? 'is-active' : '',
                ].join(' ')}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="met-teacher-app__type-desc">{typeDescription}</p>
        </section>

        <section className="met-teacher-app__filters">
          <div className="met-teacher-app__filter-groups">
            {FILTER_GROUPS.map(group => (
              <div key={group.key} className="met-teacher-app__filter-group">
                <span className="met-teacher-app__filter-label">{group.label}</span>
                <div className="met-teacher-app__filter-options">
                  {(optionsByGroup.get(group.key) ?? []).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      className={[
                        'met-teacher-app__filter-chip',
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
          <div className="met-teacher-app__filter-foot">
            <div className="met-teacher-app__search">
              <Search size={14} aria-hidden />
              <input
                type="search"
                placeholder="搜索老师姓名、申请单号或课程名称"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="met-teacher-app__btn met-teacher-app__btn--ghost met-teacher-app__btn--sm"
              onClick={resetFilters}
            >
              重置筛选
            </button>
          </div>
        </section>

        <section className="met-teacher-app__risk-queue">
          {snapshot.riskQueue.map(item => (
            <div
              key={item.id}
              className={[
                'met-teacher-app__risk-item',
                item.priority === 'P0' ? 'met-teacher-app__risk-item--p0' : 'met-teacher-app__risk-item--p1',
              ].join(' ')}
            >
              <div className="met-teacher-app__risk-main">
                <strong>
                  <span className="met-teacher-app__risk-priority">{item.priority}</span>
                  {item.title}
                </strong>
                {item.bookedLabel ? <span>{item.bookedLabel}</span> : null}
                <span>影响：{item.impact}</span>
                <em>建议：{item.suggestedAction}</em>
              </div>
              <button
                type="button"
                className="met-teacher-app__btn met-teacher-app__btn--sm"
                onClick={() =>
                  item.relatedApplicationId
                    ? onOpenDetail(item.relatedApplicationId)
                    : onToast(`${item.ctaLabel}（待建设）`)
                }
              >
                {item.ctaLabel}
              </button>
            </div>
          ))}
        </section>

        {filteredRows.length > 0 ? (
          <section className="met-teacher-app__list">
            {filteredRows.map(row => (
              <ApplicationRowCard
                key={row.applicationId}
                row={row}
                selected={selectedIds.includes(row.applicationId)}
                onToggleSelect={toggleSelect}
                onOpenDetail={onOpenDetail}
                onToast={onToast}
              />
            ))}
          </section>
        ) : (
          <div className="met-teacher-app__empty">
            <h3>暂无匹配申请</h3>
            <p>当前筛选条件下没有申请记录，请调整筛选或重置后重试。</p>
          </div>
        )}

        <div className="met-teacher-app__batch">
          <span>
            {selectedIds.length > 0
              ? `已选择 ${selectedIds.length} 条申请`
              : snapshot.batchPlaceholder}
          </span>
          {selectedIds.length > 0 ? (
            <div className="met-teacher-app__batch-btns">
              <button
                type="button"
                className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
                onClick={() => onToast('批量分配审批人（待建设）')}
              >
                批量分配审批人（待建设）
              </button>
              <button
                type="button"
                className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
                onClick={() => onToast('批量要求补充材料（待建设）')}
              >
                批量要求补充材料（待建设）
              </button>
              <button
                type="button"
                className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
                onClick={() => onToast('批量导出申请（待建设）')}
              >
                批量导出申请（待建设）
              </button>
              <button
                type="button"
                className="met-teacher-app__btn met-teacher-app__btn--sm met-teacher-app__btn--ghost"
                onClick={() => setSelectedIds([])}
              >
                取消选择
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StaffSecondaryTeacherApplicationsPage;
