import React from 'react';
import {
  COURSE_STATUS_LABEL,
  statusBadgeClass,
  type CourseSessionDetail,
} from './courseOperationViewModel';
import { ScheduleFormFields, type ScheduleFormDraft } from './CourseScheduleFormDrawer';

export type CourseDrawerViewMode = 'detail' | 'edit';

interface CourseSessionDetailDrawerProps {
  open: boolean;
  viewMode: CourseDrawerViewMode;
  detail: CourseSessionDetail | null;
  formDraft: ScheduleFormDraft;
  formMode: 'create' | 'edit';
  validationHints: string[];
  onClose: () => void;
  onAction: (action: string) => void;
  onFormChange: (patch: Partial<ScheduleFormDraft>) => void;
  onSaveDraft: () => void;
  onBackToDetail: () => void;
  isLocalDraft?: boolean;
  onDeleteDraft?: () => void;
}

const sectionTitle = 'text-xs font-semibold text-[#565D56] mb-2';

const CourseSessionDetailDrawer: React.FC<CourseSessionDetailDrawerProps> = ({
  open,
  viewMode,
  detail,
  formDraft,
  formMode,
  validationHints,
  onClose,
  onAction,
  onFormChange,
  onSaveDraft,
  onBackToDetail,
  isLocalDraft = false,
  onDeleteDraft,
}) => {
  if (!open) return null;

  const isEdit = viewMode === 'edit';
  const canBackToDetail = isEdit && detail != null;

  return (
    <>
      <button
        type="button"
        aria-label="关闭"
        className="fixed inset-0 z-40 bg-[#222622]/18"
        onClick={onClose}
      />
      <aside
        className="met-course-drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-[700px] flex-col border-l border-[#DDDFD8] bg-[#FCFCFA] shadow-[-8px_0_32px_rgba(34,38,34,0.08)]"
        role="dialog"
        aria-modal
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E1E3DD] px-6 py-4">
          <div className="min-w-0">
            {isEdit ? (
              <>
                <h2 className="text-lg font-semibold text-[#222622]">
                  {formMode === 'create' ? '新建排课' : '编辑排课'}
                </h2>
                <p className="mt-1 text-xs text-[#8A908A]">保存为草稿，发布前需通过合规校验</p>
              </>
            ) : detail ? (
              <>
                <p className="text-[11px] text-[#8A908A]">场次编号 {detail.sessionCode}</p>
                <h2 className="mt-1 text-lg font-semibold text-[#222622]">{detail.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded border border-[#E1E3DD] bg-[#F7F8F5] px-2 py-0.5 text-[10px] text-[#565D56]">
                    {detail.type}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(detail.status)}`}
                  >
                    {COURSE_STATUS_LABEL[detail.status]}
                  </span>
                </div>
              </>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E1E3DD] p-2 text-[#565D56] hover:bg-[#F7F8F5]"
          >
            <i className="fa-solid fa-xmark" aria-hidden />
          </button>
        </header>

        {isEdit ? (
          <>
            <div className="custom-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              <ScheduleFormFields
                draft={formDraft}
                validationHints={validationHints}
                onChange={onFormChange}
              />
            </div>
            <footer className="flex shrink-0 flex-wrap gap-2 border-t border-[#E1E3DD] px-6 py-4">
              {canBackToDetail ? (
                <button
                  type="button"
                  onClick={onBackToDetail}
                  className="rounded-lg border border-[#E1E3DD] bg-white px-4 py-2 text-xs text-[#565D56] hover:bg-[#F7F8F5]"
                >
                  返回详情
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#E1E3DD] bg-white px-4 py-2 text-xs text-[#565D56] hover:bg-[#F7F8F5]"
                >
                  取消
                </button>
              )}
              {isLocalDraft && onDeleteDraft ? (
                <button
                  type="button"
                  onClick={onDeleteDraft}
                  className="rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] px-4 py-2 text-xs text-[#8A6A3A]"
                >
                  删除草稿
                </button>
              ) : null}
              <button type="button" onClick={onSaveDraft} className="met-ink-button ml-auto !text-xs">
                保存草稿
              </button>
            </footer>
          </>
        ) : detail ? (
          <>
            <div className="custom-scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section>
                <h3 className={sectionTitle}>场次概览</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-[#8A908A]">日期</dt>
                    <dd className="text-[#222622]">{detail.dateLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A908A]">时间</dt>
                    <dd className="text-[#222622]">
                      {detail.timeStart} – {detail.timeEnd}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8A908A]">老师</dt>
                    <dd className="text-[#222622]">{detail.teacher}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A908A]">教室</dt>
                    <dd className="text-[#222622]">{detail.room}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A908A]">容量</dt>
                    <dd className="text-[#222622]">{detail.capacity}</dd>
                  </div>
                </dl>
                {detail.abnormalHint ? (
                  <p className="mt-2 rounded-lg bg-[#FAF6F0] px-3 py-2 text-xs text-[#8A6A3A]">
                    {detail.abnormalHint}
                  </p>
                ) : null}
              </section>

              <section>
                <h3 className={sectionTitle}>预约与签到摘要</h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[
                    ['预约', detail.booked],
                    ['已签到', detail.checkedIn],
                    ['请假', detail.leaveCount],
                    ['取消', detail.cancelCount],
                    ['爽约', detail.noShowCount],
                    ['候补', detail.waitlistCount],
                  ].map(([label, val]) => (
                    <div
                      key={String(label)}
                      className="rounded-lg border border-[#E1E3DD] bg-[#F7F8F5] px-2 py-2 text-center"
                    >
                      <p className="text-[10px] text-[#8A908A]">{label}</p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#222622]">{val}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className={sectionTitle}>会员名单摘要</h3>
                <div className="overflow-hidden rounded-lg border border-[#E1E3DD]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F8F5] text-[#8A908A]">
                      <tr>
                        <th className="px-3 py-2 font-medium">会员</th>
                        <th className="px-3 py-2 font-medium">使用资产</th>
                        <th className="px-3 py-2 font-medium">到课状态</th>
                        <th className="px-3 py-2 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.members.map(m => (
                        <tr key={m.memberName} className="border-t border-[#E1E3DD]">
                          <td className="px-3 py-2 text-[#222622]">{m.memberName}</td>
                          <td className="px-3 py-2 text-[#70776F]">{m.asset}</td>
                          <td className="px-3 py-2">
                            {m.attendanceStatus}
                            {m.note ? (
                              <span className="mt-0.5 block text-[10px] text-[#8A6A3A]">{m.note}</span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => onAction('member-detail')}
                              className="text-[10px] text-[#565D56] underline-offset-2 hover:underline"
                            >
                              查看
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className={sectionTitle}>耗课与收入预览</h3>
                <dl className="space-y-2 rounded-lg border border-[#E1E3DD] p-3 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">预计耗课</dt>
                    <dd className="font-medium tabular-nums text-[#222622]">
                      {detail.expectedConsumption} 点
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">实际耗课</dt>
                    <dd className="tabular-nums text-[#222622]">{detail.actualConsumption} 点</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">预计确认收入</dt>
                    <dd className="text-[#222622]">{detail.expectedRevenue}</dd>
                  </div>
                  {detail.blockReason ? (
                    <p className="rounded bg-[#FAF4F0] px-2 py-1.5 text-[#9A6B63]">
                      异常阻断：{detail.blockReason}
                    </p>
                  ) : null}
                </dl>
              </section>

              <section>
                <h3 className={sectionTitle}>老师课时预览</h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">授课老师</dt>
                    <dd className="text-[#222622]">{detail.teacher}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">老师等级</dt>
                    <dd className="text-[#222622]">{detail.teacherLevel}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">课时费规则</dt>
                    <dd className="text-[#222622]">{detail.payRule}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">预计课时费</dt>
                    <dd className="text-[#222622]">{detail.expectedPay}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#8A908A]">是否代课</dt>
                    <dd className="text-[#222622]">{detail.isSubstitute ? '是' : '否'}</dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className={sectionTitle}>异常与操作日志</h3>
                <ul className="space-y-2">
                  {detail.logs.map((log, i) => (
                    <li
                      key={`${log.at}-${i}`}
                      className="flex gap-3 rounded-lg border border-[#E1E3DD] bg-white px-3 py-2 text-xs"
                    >
                      <span className="shrink-0 tabular-nums text-[#8A908A]">{log.at}</span>
                      <span className="text-[#70776F]">{log.actor}</span>
                      <span className="text-[#222622]">{log.action}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <footer className="flex shrink-0 flex-wrap gap-2 border-t border-[#E1E3DD] px-6 py-4">
              {[
                ['查看预约名单', 'bookings'],
                ['编辑场次', 'edit'],
                ['发起调课', 'reschedule'],
                ['发起取消', 'cancel'],
                ['查看耗课与课时预览', 'consumption'],
              ].map(([label, action]) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onAction(action)}
                  className={
                    action === 'bookings'
                      ? 'met-ink-button !text-xs'
                      : 'rounded-lg border border-[#E1E3DD] bg-white px-3 py-2 text-xs text-[#565D56] hover:bg-[#F7F8F5]'
                  }
                >
                  {label}
                </button>
              ))}
            </footer>
          </>
        ) : null}
      </aside>
    </>
  );
};

export default CourseSessionDetailDrawer;
