import React, { useMemo, useState } from 'react';
import { buildTodayOperationDemoSnapshot } from './todayOperationViewModel';
import type { TodayCourseDetail, TodayTodoItem } from './todayOperationViewModel';
import TodayMetricCard from './TodayMetricCard';
import TodayCourseExecutionList from './TodayCourseExecutionList';
import TodayTodoPanel from './TodayTodoPanel';
import TodayCourseDetailDrawer from './TodayCourseDetailDrawer';

const headerGhostBtn = 'met-today-header-btn';

const TodayOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildTodayOperationDemoSnapshot(), []);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeDetail: TodayCourseDetail | null = activeCourseId
    ? snapshot.courseDetailsById[activeCourseId] ?? null
    : null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  };

  const handleRefresh = () => showToast('正在刷新今日运营数据…');
  const handleExport = () => showToast('导出今日执行表功能待接入');

  const handleTodoAction = (item: TodayTodoItem, action: string) => {
    showToast(`${item.category}：${action}（演示占位）`);
  };

  const handleDrawerAction = (action: string) => {
    showToast(`${action}（演示占位）`);
  };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden animate-fadeIn"
      style={{ backgroundColor: 'var(--met-bg-page)' }}
    >
      <header className="met-today-header shrink-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="met-today-header__title-area min-w-0">
            <h1>今日运营</h1>
            <p>查看今日课程执行、预约签到、异常处理与待跟进事项</p>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center justify-end gap-3">
            <span>{snapshot.dateHeaderLabel}</span>
            <button type="button" onClick={handleRefresh} className={headerGhostBtn}>
              <i className="fa-solid fa-arrows-rotate text-[11px] opacity-70" aria-hidden />
              刷新
            </button>
            <button type="button" onClick={handleExport} className={headerGhostBtn}>
              <i className="fa-solid fa-file-export text-[11px] opacity-70" aria-hidden />
              导出今日执行表
            </button>
          </div>
        </div>
      </header>

      <div className="met-today-page__body custom-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1440px]">
          <section className="met-today-page__metrics grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {snapshot.metrics.map(metric => (
              <TodayMetricCard key={metric.id} item={metric} />
            ))}
          </section>

          <div className="met-today-page__columns flex min-h-0 flex-col lg:flex-row lg:items-stretch">
            <div className="min-w-0 flex-[1_1_68%] lg:max-w-[70%]">
              <TodayCourseExecutionList
                courses={snapshot.courses}
                onViewDetail={setActiveCourseId}
              />
            </div>
            <div className="min-w-0 flex-[1_1_32%] lg:min-w-[300px] lg:max-w-[32%]">
              <TodayTodoPanel
                items={snapshot.todos}
                summary={snapshot.todoSummary}
                onAction={handleTodoAction}
              />
            </div>
          </div>
        </div>
      </div>

      <TodayCourseDetailDrawer
        open={activeCourseId != null && activeDetail != null}
        detail={activeDetail}
        onClose={() => setActiveCourseId(null)}
        onAction={handleDrawerAction}
      />

      {toast ? (
        <div className="pointer-events-none fixed top-20 right-8 z-[70]">
          <div className="rounded-xl border border-stone-200/90 bg-white px-4 py-3 text-sm font-medium text-[#202020] shadow-[0_4px_12px_rgba(24,24,27,0.08)]">
            {toast}
          </div>
        </div>
      ) : null}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default TodayOperationDashboard;
