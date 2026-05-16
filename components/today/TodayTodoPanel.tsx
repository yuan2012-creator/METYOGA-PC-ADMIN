import React, { useMemo } from 'react';
import type { TodayTodoItem, TodayTodoPanelSummary } from './todayOperationViewModel';

interface TodayTodoPanelProps {
  items: TodayTodoItem[];
  summary?: TodayTodoPanelSummary;
  onAction?: (item: TodayTodoItem, action: string) => void;
}

const priorityDotClass = (priority: TodayTodoItem['priority']): string => {
  if (priority === 'high') return 'bg-[#B58D5B]';
  if (priority === 'medium') return 'bg-[#C4C6C0]';
  return 'bg-[#D5D7D2]';
};

const priorityLabelClass = (priority: TodayTodoItem['priority']): string => {
  if (priority === 'high') return 'border-[#E8DFD0] bg-[#FAF6F0] text-[#8A6A3A]';
  return 'border-[#E1E3DD] bg-[#F7F8F5] text-[#7A817A]';
};

const sortedItems = (items: TodayTodoItem[]): TodayTodoItem[] => {
  const order = { high: 0, medium: 1, low: 2 } as const;
  return [...items].sort((a, b) => order[a.priority] - order[b.priority]);
};

const ghostBtn =
  'inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#DADDD5] bg-[#FCFCFA] px-2.5 text-xs font-medium text-[#333833] transition-colors hover:border-[#C8CCC4] hover:bg-[#F0F1ED]';

const TodayTodoPanel: React.FC<TodayTodoPanelProps> = ({ items, summary, onAction }) => {
  const computedSummary = useMemo(() => {
    if (summary) return summary;
    return {
      total: items.length,
      highPriority: items.filter(i => i.priority === 'high').length,
    };
  }, [items, summary]);

  return (
    <aside className="met-today-surface flex h-full min-h-[420px] max-w-full flex-col overflow-hidden rounded-2xl lg:min-h-0">
      <header className="shrink-0 border-b border-[#DDDFD8] bg-[#F7F8F5] px-5 py-4">
        <h3 className="text-base text-[#222622]" style={{ fontWeight: 650 }}>
          店长行动区
        </h3>
        <p className="mt-0.5 text-xs text-[#737A73]">按优先级处理今日事项</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#E1E3DD] bg-[#F7F8F5] px-2.5 py-1 text-xs font-medium text-[#565D56]">
            今日 <span className="font-semibold tabular-nums text-[#222622]">{computedSummary.total}</span>{' '}
            项待处理
          </span>
          <span className="rounded-full border border-[#E1E3DD] bg-[#F7F8F5] px-2.5 py-1 text-xs font-medium text-[#8A6A3A]">
            <span className="font-semibold tabular-nums">{computedSummary.highPriority}</span> 项高优先级
          </span>
        </div>
      </header>

      <ul className="custom-scroll min-h-0 flex-1 overflow-y-auto">
        {sortedItems(items).map((item, index) => (
          <li key={item.id} className={index > 0 ? 'border-t border-[#DDDFD8]' : ''}>
            <article className="px-4 py-[18px] transition-colors hover:bg-[#F7F8F5]">
              <div className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDotClass(item.priority)}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${priorityLabelClass(item.priority)}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#222622]" style={{ fontWeight: 650 }}>
                    {item.summary}
                  </p>
                  <p className="mt-1.5 text-xs text-[#7A817A]">
                    <span>{item.owner}</span>
                    <span className="mx-1.5 text-[#D5D7D2]">·</span>
                    {item.timeOrPriority}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className={ghostBtn} onClick={() => onAction?.(item, item.primaryAction)}>
                      {item.primaryAction}
                    </button>
                    {item.secondaryAction ? (
                      <button
                        type="button"
                        className={ghostBtn}
                        onClick={() => onAction?.(item, item.secondaryAction!)}
                      >
                        {item.secondaryAction}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TodayTodoPanel;
