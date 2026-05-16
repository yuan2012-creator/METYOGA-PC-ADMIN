import React, { useEffect } from 'react';
import type { TodayCourseDetail } from './todayOperationViewModel';

interface TodayCourseDetailDrawerProps {
  open: boolean;
  detail: TodayCourseDetail | null;
  onClose: () => void;
  onAction?: (action: string) => void;
}

const sectionCardClass =
  'rounded-[12px] border border-stone-100/90 bg-white p-4';
const sectionTitleClass = 'mb-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]';

const ghostBtn =
  'inline-flex h-9 flex-1 items-center justify-center rounded-[12px] border border-stone-200/90 bg-white px-3 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50';

const TodayCourseDetailDrawer: React.FC<TodayCourseDetailDrawerProps> = ({
  open,
  detail,
  onClose,
  onAction,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !detail) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal aria-label="课程详情">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/12 backdrop-blur-[1px]"
        aria-label="关闭"
        onClick={onClose}
      />
      <div
        className="relative flex h-full w-full max-w-[680px] flex-col border-l border-stone-200/80 bg-white shadow-[-4px_0_24px_rgba(24,24,27,0.06)]"
      >
        <header
          className="shrink-0 border-b bg-white px-7 py-6"
          style={{ borderColor: 'var(--met-border)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#71717a]">{detail.dateLabel}</p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#202020]">{detail.name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#52525b]">
                <span className="font-mono text-[#3F3F46]">
                  {detail.timeStart} — {detail.timeEnd}
                </span>
                <span className="text-stone-300">·</span>
                <span className="rounded-md border border-stone-200/90 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-600">
                  {detail.type}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
              aria-label="关闭抽屉"
            >
              <i className="fa-solid fa-xmark text-sm" aria-hidden />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: '老师', value: detail.teacher },
              { label: '教室', value: detail.room },
              { label: '预约 / 容量', value: `${detail.booked}/${detail.capacity}` },
              { label: '已签到', value: String(detail.checkedIn) },
            ].map(cell => (
              <div
                key={cell.label}
                className="rounded-[12px] border border-stone-100/90 bg-white px-3 py-2.5"
              >
                <p className="text-[10px] font-medium text-[#a1a1aa]">{cell.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#202020]">{cell.value}</p>
              </div>
            ))}
          </div>
          {detail.exceptionCount > 0 ? (
            <p className="mt-3 text-xs text-[#8B4A42]">
              异常与待处理 <span className="font-semibold tabular-nums">{detail.exceptionCount}</span> 项
            </p>
          ) : null}
        </header>

        <div className="custom-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-7 py-5">
          <section className={sectionCardClass}>
            <h3 className={sectionTitleClass}>预约名单摘要</h3>
            {detail.bookings.length === 0 ? (
              <p className="text-xs text-[#71717a]">暂无预约记录</p>
            ) : (
              <ul className="space-y-2.5 text-xs">
                {detail.bookings.map((b, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-3 border-b border-stone-50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-[#202020]">{b.memberName}</span>
                    <span className="text-[#71717a]">{b.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={sectionCardClass}>
            <h3 className={sectionTitleClass}>签到记录摘要</h3>
            {detail.attendances.length === 0 ? (
              <p className="text-xs text-[#71717a]">暂无签到记录</p>
            ) : (
              <ul className="space-y-2.5 text-xs">
                {detail.attendances.map((a, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="font-medium text-[#202020]">{a.memberName}</span>
                    <span className="text-right text-[#71717a]">
                      {a.status}
                      {a.checkedAt ? ` · ${a.checkedAt}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={sectionCardClass}>
            <h3 className={sectionTitleClass}>异常与待处理</h3>
            {detail.exceptions.length === 0 && detail.pendingItems.length === 0 ? (
              <p className="text-xs text-[#71717a]">暂无异常或待处理项</p>
            ) : (
              <ul className="space-y-3 text-xs">
                {[...detail.exceptions, ...detail.pendingItems].map((ex, i) => (
                  <li key={i} className="rounded-lg border border-amber-100/60 bg-amber-50/30 px-3 py-2">
                    <p className="font-semibold text-[#202020]">{ex.title}</p>
                    <p className="mt-1 leading-relaxed text-[#71717a]">{ex.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={sectionCardClass}>
            <h3 className={sectionTitleClass}>操作日志摘要</h3>
            {detail.opsLogs.length === 0 ? (
              <p className="text-xs text-[#71717a]">暂无操作记录</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {detail.opsLogs.map((log, i) => (
                  <li key={i} className="flex gap-3 text-[#71717a]">
                    <span className="shrink-0 font-mono text-[10px] text-[#a1a1aa]">{log.at}</span>
                    <span>
                      <span className="font-medium text-[#52525b]">{log.actor}</span>
                      <span className="mx-1 text-stone-300">·</span>
                      {log.action}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer
          className="shrink-0 border-t bg-white px-7 py-4 shadow-[0_-4px_16px_rgba(24,24,27,0.04)]"
          style={{ borderColor: 'var(--met-border)' }}
        >
          <div className="flex flex-col gap-2">
            <button type="button" className={`${ghostBtn} w-full`} onClick={() => onAction?.('查看签到记录')}>
              查看签到记录
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={ghostBtn} onClick={() => onAction?.('登记异常')}>
                登记异常
              </button>
              <button type="button" className={ghostBtn} onClick={() => onAction?.('发起补签审核')}>
                发起补签审核
              </button>
            </div>
            <button
              type="button"
              className="met-ink-button !h-10 w-full !text-xs"
              onClick={() => onAction?.('查看耗课与课时预览')}
            >
              查看耗课与课时预览
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TodayCourseDetailDrawer;
