import React, { useState } from 'react';
import type { TodoItem } from './researchCenterV2.viewModel';

interface ResearchActionPanelProps {
  todos: TodoItem[];
  onAction: (todoId: string, actionId: string) => void;
}

const ResearchActionPanel: React.FC<ResearchActionPanelProps> = ({ todos, onAction }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <aside className="met-rc-v2-action-panel">
      <header className="met-rc-v2-action-panel__head">
        <h2 className="met-rc-v2-action-panel__title">今日待办</h2>
        <p className="met-rc-v2-action-panel__subtitle">优先处理影响开班与收款的事项</p>
      </header>
      <ul className="met-rc-v2-action-panel__list">
        {todos.map(todo => {
          const [primary, ...rest] = todo.actions;
          return (
            <li key={todo.id} className="met-rc-v2-action-panel__item">
              <p className="met-rc-v2-action-panel__item-title">{todo.title}</p>
              {todo.hint ? <p className="met-rc-v2-action-panel__item-hint">{todo.hint}</p> : null}
              <div className="met-rc-v2-action-panel__item-actions">
                {primary ? (
                  <button
                    type="button"
                    className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm"
                    onClick={() => onAction(todo.id, primary.id)}
                  >
                    {primary.label}
                  </button>
                ) : null}
                {rest.length === 1 ? (
                  <button
                    type="button"
                    className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                    onClick={() => onAction(todo.id, rest[0].id)}
                  >
                    {rest[0].label}
                  </button>
                ) : null}
                {rest.length > 1 ? (
                  <div className="met-rc-v2-more">
                    <button
                      type="button"
                      className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
                      aria-expanded={openMenuId === todo.id}
                      onClick={() => setOpenMenuId(cur => (cur === todo.id ? null : todo.id))}
                    >
                      更多
                    </button>
                    {openMenuId === todo.id ? (
                      <div className="met-rc-v2-more__menu">
                        {rest.map(action => (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => {
                              onAction(todo.id, action.id);
                              setOpenMenuId(null);
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default ResearchActionPanel;
