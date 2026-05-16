import React, { useMemo } from 'react';
import type { TodayTodoItem, TodayTodoPanelSummary } from './todayOperationViewModel';

interface TodayTodoPanelProps {
  items: TodayTodoItem[];
  summary?: TodayTodoPanelSummary;
  onAction?: (item: TodayTodoItem, action: string) => void;
}

const priorityDotClass = (priority: TodayTodoItem['priority']): string => {
  if (priority === 'high') return 'bg-[#C9A88A]';
  if (priority === 'medium') return 'bg-stone-300';
  return 'bg-stone-200';
};

const priorityLabelClass = (priority: TodayTodoItem['priority']): string => {
  if (priority === 'high') return 'border-amber-100/80 bg-amber-50/50 text-[#7A5C2E]';
  return 'border-stone-200/90 bg-stone-50 text-stone-600';
};

const sortedItems = (items: TodayTodoItem[]): TodayTodoItem[] => {
  const order = { high: 0, medium: 1, low: 2 } as const;
  return [...items].sort((a, b) => order[a.priority] - order[b.priority]);
};

const ghostBtn =
  'inline-flex h-8 items-center justify-center rounded-[12px] border border-stone-200/90 bg-white px-2.5 text-[11px] font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50';

const TodayTodoPanel: React.FC<TodayTodoPanelProps> = ({ items, summary, onAction }) => {
  const computedSummary = useMemo(() => {
    if (summary) return summary;
    return {
      total: items.length,
      highPriority: items.filter(i => i.priority === 'high').length,
    };
  }, [items, summary]);

  return (
    <aside className="met-today-surface flex h-full min-h-[420px] max-w-full flex-col overflow-hidden lg:min-h-0">
      <header className="shrink-0 border-b border-stone-100 bg-stone-50/30 px-5 py-4">
        <h3 className="text-sm font-semibold text-[#292524]">店长行动区</h3>
        <p className="mt-0.5 text-xs text-stone-500">按优先级处理今日事项</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-stone-200/80 bg-stone-50/80 px-2.5 py-1 text-xs font-medium text-stone-600">
            今日 <span className="font-semibold tabular-nums text-[#292524]">{computedSummary.total}</span>{' '}
            项待处理
          </span>
          <span className="rounded-full border border-stone-200/80 bg-[#f5f3ef] px-2.5 py-1 text-xs font-medium text-[#7A5C2E]">
            <span className="font-semibold tabular-nums">{computedSummary.highPriority}</span> 项高优先级
          </span>
        </div>
      </header>

      <ul className="custom-scroll min-h-0 flex-1 overflow-y-auto">
        {sortedItems(items).map((item, index) => (
          <li key={item.id} className={index > 0 ? 'border-t border-stone-100' : ''}>
            <article className="px-4 py-4 transition-colors hover:bg-stone-50/50">
              <div className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDotClass(item.priority)}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${priorityLabelClass(item.priority)}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug text-[#292524]">{item.summary}</p>
                  <p className="mt-1.5 text-xs text-stone-500">
                    <span className="text-stone-600">{item.owner}</span>
                    <span className="mx-1.5 text-stone-300">·</span>
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
