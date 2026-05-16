import React, { useMemo, useState } from 'react';
import type { CourseTemplateItem, CourseTypeTag } from './courseOperationViewModel';
import { DRAG_TEMPLATE_MIME, typeTagClass } from './courseOperationViewModel';

interface CourseLibraryPanelProps {
  templates: CourseTemplateItem[];
  onViewDetail: (id: string) => void;
  onAddToDraft: (id: string) => void;
  onOpenFullLibrary: () => void;
  onAddTemplate: () => void;
}

const ALL_TYPES: Array<CourseTypeTag | '全部'> = ['全部', '团课', '小班', '私教', '教培'];

const CourseLibraryPanel: React.FC<CourseLibraryPanelProps> = ({
  templates,
  onViewDetail,
  onAddToDraft,
  onOpenFullLibrary,
  onAddTemplate,
}) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CourseTypeTag | '全部'>('全部');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates
      .filter(t => {
        if (typeFilter !== '全部' && t.type !== typeFilter) return false;
        if (!q) return true;
        return t.name.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [templates, query, typeFilter]);

  const handleDragStart = (e: React.DragEvent, tpl: CourseTemplateItem) => {
    if (!tpl.schedulable) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DRAG_TEMPLATE_MIME, tpl.id);
    e.dataTransfer.setData('text/plain', tpl.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="met-course-library-sidebar met-today-surface">
      <div className="met-course-library-sidebar__head">
        <h2>课程库</h2>
        <p>拖拽课程到日历创建排课草稿</p>
      </div>

      <div className="met-course-library-sidebar__filters">
        <div className="met-course-library-sidebar__search-wrap">
          <i className="fa-solid fa-magnifying-glass" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索课程"
            className="met-course-library-sidebar__search"
          />
        </div>
        <div className="met-course-library-sidebar__type-filters">
          {ALL_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? 'is-active' : ''}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="met-course-library-sidebar__list custom-scroll">
        {filtered.map(tpl => (
          <li key={tpl.id}>
            <article
              draggable={tpl.schedulable}
              onDragStart={e => handleDragStart(e, tpl)}
              className={`met-course-library-sidebar__card ${tpl.schedulable ? 'is-draggable' : ''}`}
            >
              <div className="met-course-library-sidebar__card-top">
                <p className="met-course-library-sidebar__card-name">{tpl.name}</p>
                <span className={`met-course-library-sidebar__card-type ${typeTagClass(tpl.type)}`}>
                  {tpl.type}
                </span>
              </div>
              <p className="met-course-library-sidebar__card-meta">
                {tpl.durationMin} 分 · 容量 {tpl.defaultCapacity} · {tpl.teacherLevel}
              </p>
              <div className="met-course-library-sidebar__card-actions">
                <button type="button" onClick={() => onViewDetail(tpl.id)}>
                  详情
                </button>
                <button type="button" disabled={!tpl.schedulable} onClick={() => onAddToDraft(tpl.id)}>
                  加入草稿
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <footer className="met-course-library-sidebar__foot">
        <button type="button" onClick={onOpenFullLibrary} className="met-course-sidebar-btn">
          查看完整课程库
        </button>
        <button type="button" onClick={onAddTemplate} className="met-course-sidebar-btn">
          新增课程模板
        </button>
      </footer>
    </aside>
  );
};

export default CourseLibraryPanel;
