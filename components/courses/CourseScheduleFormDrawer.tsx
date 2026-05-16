import React from 'react';

export interface ScheduleFormDraft {
  template: string;
  date: string;
  time: string;
  teacher: string;
  room: string;
  capacity: string;
  stores: string;
  bookingDeadline: string;
  cancelRule: string;
  isPublic: boolean;
  note: string;
}

const fields: { key: keyof ScheduleFormDraft; label: string; type?: string }[] = [
  { key: 'template', label: '课程模板' },
  { key: 'date', label: '日期', type: 'date' },
  { key: 'time', label: '时间', type: 'time' },
  { key: 'teacher', label: '老师' },
  { key: 'room', label: '教室' },
  { key: 'capacity', label: '容量' },
  { key: 'stores', label: '可预约门店' },
  { key: 'bookingDeadline', label: '预约截止时间' },
  { key: 'cancelRule', label: '取消规则' },
  { key: 'note', label: '备注' },
];

export interface ScheduleFormFieldsProps {
  draft: ScheduleFormDraft;
  validationHints: string[];
  onChange: (patch: Partial<ScheduleFormDraft>) => void;
}

export const ScheduleFormFields: React.FC<ScheduleFormFieldsProps> = ({
  draft,
  validationHints,
  onChange,
}) => (
  <>
    {validationHints.length > 0 ? (
      <ul className="space-y-1.5 rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] p-3">
        {validationHints.map(h => (
          <li key={h} className="text-xs text-[#8A6A3A]">
            · {h}
          </li>
        ))}
      </ul>
    ) : null}
    {fields.map(f => (
      <label key={f.key} className="block">
        <span className="mb-1 block text-xs font-medium text-[#565D56]">{f.label}</span>
        <input
          type={f.type ?? 'text'}
          value={String(draft[f.key] ?? '')}
          onChange={e => onChange({ [f.key]: e.target.value })}
          className="w-full rounded-lg border border-[#E1E3DD] bg-white px-3 py-2 text-sm text-[#222622] focus:border-[#C4C6C0] focus:outline-none"
        />
      </label>
    ))}
    <label className="flex items-center gap-2 text-xs text-[#565D56]">
      <input
        type="checkbox"
        checked={draft.isPublic}
        onChange={e => onChange({ isPublic: e.target.checked })}
        className="rounded border-[#C4C6C0]"
      />
      是否公开（会员端可见）
    </label>
  </>
);

interface CourseScheduleFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  draft: ScheduleFormDraft;
  validationHints: string[];
  onClose: () => void;
  onChange: (patch: Partial<ScheduleFormDraft>) => void;
  onSaveDraft: () => void;
}

/** 独立排课抽屉壳（课程运营主流程已合并至 CourseSessionDetailDrawer） */
const CourseScheduleFormDrawer: React.FC<CourseScheduleFormDrawerProps> = ({
  open,
  mode,
  draft,
  validationHints,
  onClose,
  onChange,
  onSaveDraft,
}) => {
  if (!open) return null;

  return (
    <>
      <button type="button" aria-label="关闭" className="fixed inset-0 z-40 bg-[#222622]/18" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l border-[#DDDFD8] bg-[#FCFCFA] shadow-[-8px_0_32px_rgba(34,38,34,0.08)]">
        <header className="border-b border-[#E1E3DD] px-5 py-4">
          <h2 className="text-base font-semibold text-[#222622]">
            {mode === 'create' ? '新建排课' : '编辑排课'}
          </h2>
          <p className="mt-0.5 text-xs text-[#8A908A]">保存为草稿，发布前需通过合规校验</p>
        </header>
        <div className="custom-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <ScheduleFormFields draft={draft} validationHints={validationHints} onChange={onChange} />
        </div>
        <footer className="flex gap-2 border-t border-[#E1E3DD] p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#E1E3DD] bg-white py-2 text-xs text-[#565D56]"
          >
            取消
          </button>
          <button type="button" onClick={onSaveDraft} className="met-ink-button flex-1 !text-xs">
            保存草稿
          </button>
        </footer>
      </aside>
    </>
  );
};

export default CourseScheduleFormDrawer;
