import React, { useEffect, useRef, useState } from 'react';

export type SessionMenuAction =
  | 'detail'
  | 'edit'
  | 'reschedule'
  | 'cancel'
  | 'delete';

interface CourseSessionActionMenuProps {
  isLocalDraft: boolean;
  onAction: (action: SessionMenuAction) => void;
}

const CourseSessionActionMenu: React.FC<CourseSessionActionMenuProps> = ({
  isLocalDraft,
  onAction,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const items: { key: SessionMenuAction; label: string; danger?: boolean }[] = isLocalDraft
    ? [
        { key: 'edit', label: '编辑草稿' },
        { key: 'detail', label: '查看详情' },
        { key: 'delete', label: '删除草稿', danger: true },
      ]
    : [
        { key: 'detail', label: '查看详情' },
        { key: 'edit', label: '编辑场次' },
        { key: 'reschedule', label: '发起调课' },
        { key: 'cancel', label: '发起取消' },
      ];

  return (
    <div ref={ref} className="met-course-session-menu" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        aria-label="更多操作"
        className="met-course-session-menu__trigger"
        onClick={e => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
      >
        <i className="fa-solid fa-ellipsis text-[10px]" aria-hidden />
      </button>
      {open ? (
        <ul className="met-course-session-menu__dropdown" role="menu">
          {items.map(item => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                className={item.danger ? 'is-danger' : ''}
                onClick={e => {
                  e.stopPropagation();
                  setOpen(false);
                  onAction(item.key);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default CourseSessionActionMenu;
