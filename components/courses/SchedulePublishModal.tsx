import React from 'react';
import type { PublishPreview } from './courseOperationViewModel';

interface SchedulePublishModalProps {
  open: boolean;
  preview: PublishPreview;
  onClose: () => void;
  onDefer: () => void;
  onBackEdit: () => void;
  onPublishCompliant: () => void;
}

const SchedulePublishModal: React.FC<SchedulePublishModalProps> = ({
  open,
  preview,
  onClose,
  onDefer,
  onBackEdit,
  onPublishCompliant,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="关闭" className="absolute inset-0 bg-[#222622]/25" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 w-full max-w-lg rounded-2xl border border-[#DDDFD8] bg-[#FCFCFA] p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-[#222622]">发布本周课表</h2>
        <p className="mt-1 text-xs text-[#8A908A]">确认发布范围与合规场次后再上线会员端</p>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#8A908A]">发布范围</dt>
            <dd className="text-right font-medium text-[#222622]">{preview.scope}</dd>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#E1E3DD] bg-[#F7F8F5] p-3 text-center">
            <div>
              <p className="text-[10px] text-[#8A908A]">草稿总场次</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#222622]">{preview.draftTotal}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8A908A]">可发布场次</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#3D5248]">{preview.publishable}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8A908A]">被拦截场次</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#8A6A3A]">{preview.blocked}</p>
            </div>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#565D56]">拦截原因</dt>
            <ul className="mt-2 space-y-1.5">
              {preview.blockReasons.map(reason => (
                <li key={reason} className="flex gap-2 text-xs text-[#70776F]">
                  <span className="text-[#9A6B63]">·</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <dt className="text-xs text-[#8A908A]">影响会员端范围</dt>
            <dd className="mt-1 text-xs text-[#222622]">{preview.memberScope}</dd>
          </div>
          <div className="rounded-lg border border-[#E1E3DD] bg-white px-3 py-2 text-xs text-[#70776F]">
            {preview.afterNote}
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onDefer}
            className="rounded-lg border border-[#E1E3DD] bg-white px-4 py-2 text-xs text-[#565D56] hover:bg-[#F7F8F5]"
          >
            暂缓发布
          </button>
          <button
            type="button"
            onClick={onBackEdit}
            className="rounded-lg border border-[#E1E3DD] bg-white px-4 py-2 text-xs text-[#565D56] hover:bg-[#F7F8F5]"
          >
            返回修改
          </button>
          <button type="button" onClick={onPublishCompliant} className="met-ink-button !text-xs">
            仅发布合规场次
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePublishModal;
