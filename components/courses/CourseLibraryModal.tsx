import React, { useMemo, useState } from 'react';
import type { CourseTemplateItem, CourseTypeTag } from './courseOperationViewModel';
import { typeTagClass } from './courseOperationViewModel';

interface CourseLibraryModalProps {
  open: boolean;
  templates: CourseTemplateItem[];
  onClose: () => void;
  onAddTemplate: () => void;
  onEditTemplate: (id: string) => void;
  onViewDetail: (id: string) => void;
  onToggleSchedulable: (id: string) => void;
  onAddToDraft: (id: string) => void;
}

const ALL_TYPES: Array<CourseTypeTag | '全部'> = ['全部', '团课', '小班', '私教', '教培'];
type StatusFilter = 'all' | 'active' | 'disabled';

const CourseLibraryModal: React.FC<CourseLibraryModalProps> = ({
  open,
  templates,
  onClose,
  onAddTemplate,
  onEditTemplate,
  onViewDetail,
  onToggleSchedulable,
  onAddToDraft,
}) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CourseTypeTag | '全部'>('全部');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter(t => {
      if (typeFilter !== '全部' && t.type !== typeFilter) return false;
      if (statusFilter === 'active' && !t.schedulable) return false;
      if (statusFilter === 'disabled' && t.schedulable) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q);
    });
  }, [templates, query, typeFilter, statusFilter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="关闭" className="absolute inset-0 bg-[#222622]/18" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#DDDFD8] bg-[#FCFCFA] shadow-xl"
      >
        <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-[#E1E3DD] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#222622]">完整课程库</h2>
            <p className="mt-1 text-xs text-[#8A908A]">管理可用于排课的课程模板</p>
          </div>
          <button type="button" onClick={onAddTemplate} className="met-ink-button !text-xs">
            <i className="fa-solid fa-plus mr-1.5 text-[10px]" aria-hidden />
            新增课程模板
          </button>
        </header>

        <div className="shrink-0 space-y-3 border-b border-[#E1E3DD] px-6 py-3">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索课程名称"
            className="w-full rounded-lg border border-[#E1E3DD] bg-[#F7F8F5] px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  typeFilter === t
                    ? 'bg-[#2C2F32] text-white'
                    : 'border border-[#E1E3DD] bg-white text-[#565D56]'
                }`}
              >
                {t}
              </button>
            ))}
            <span className="mx-1 w-px bg-[#E1E3DD]" />
            {(
              [
                ['all', '全部状态'],
                ['active', '可排课'],
                ['disabled', '已停用'],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setStatusFilter(v)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  statusFilter === v
                    ? 'bg-[#2C2F32] text-white'
                    : 'border border-[#E1E3DD] bg-white text-[#565D56]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-scroll min-h-0 flex-1 overflow-auto">
          <table className="met-course-library-table w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#F7F8F5] text-[#8A908A]">
              <tr>
                <th className="px-4 py-2.5 font-medium">课程名称</th>
                <th className="px-3 py-2.5 font-medium">类型</th>
                <th className="px-3 py-2.5 font-medium">时长</th>
                <th className="px-3 py-2.5 font-medium">容量</th>
                <th className="px-3 py-2.5 font-medium">扣点</th>
                <th className="px-3 py-2.5 font-medium">门店</th>
                <th className="px-3 py-2.5 font-medium">老师等级</th>
                <th className="px-3 py-2.5 font-medium">状态</th>
                <th className="px-3 py-2.5 font-medium">更新</th>
                <th className="px-4 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-[#EEF0EC] hover:bg-[#F7F8F5]/80">
                  <td className="px-4 py-2.5 font-medium text-[#222622]">{t.name}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] ${typeTagClass(t.type)}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#70776F]">{t.durationMin} 分</td>
                  <td className="px-3 py-2.5 text-[#70776F]">{t.defaultCapacity}</td>
                  <td className="px-3 py-2.5 text-[#70776F]">{t.defaultPoints}</td>
                  <td className="max-w-[100px] truncate px-3 py-2.5 text-[#70776F]">{t.stores}</td>
                  <td className="px-3 py-2.5 text-[#70776F]">{t.teacherLevel}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        t.schedulable ? 'text-[#5A6B5E]' : 'text-[#9A6B63]'
                      }
                    >
                      {t.schedulable ? '可排课' : '已停用'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#9AA39A]">{t.updatedAt ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded border border-[#E1E3DD] bg-white px-2 py-0.5 text-[10px] hover:bg-[#F7F8F5]"
                        onClick={() => onViewDetail(t.id)}
                      >
                        详情
                      </button>
                      <button
                        type="button"
                        className="rounded border border-[#E1E3DD] bg-white px-2 py-0.5 text-[10px] hover:bg-[#F7F8F5]"
                        onClick={() => onEditTemplate(t.id)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="rounded border border-[#E1E3DD] bg-white px-2 py-0.5 text-[10px] hover:bg-[#F7F8F5]"
                        onClick={() => onToggleSchedulable(t.id)}
                      >
                        {t.schedulable ? '停用' : '启用'}
                      </button>
                      <button
                        type="button"
                        disabled={!t.schedulable}
                        className="rounded border border-[#E1E3DD] bg-white px-2 py-0.5 text-[10px] hover:bg-[#F7F8F5] disabled:opacity-40"
                        onClick={() => onAddToDraft(t.id)}
                      >
                        加入草稿
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="shrink-0 border-t border-[#E1E3DD] px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E1E3DD] bg-white px-4 py-2 text-xs text-[#565D56]"
          >
            关闭
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CourseLibraryModal;
