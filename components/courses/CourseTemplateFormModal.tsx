import React, { useEffect, useState } from 'react';
import type { CourseTemplateItem, CourseTypeTag } from './courseOperationViewModel';

export interface CourseTemplateFormValues {
  name: string;
  type: CourseTypeTag;
  durationMin: string;
  defaultCapacity: string;
  defaultPoints: string;
  stores: string;
  teacherLevel: string;
  schedulable: boolean;
  description: string;
  remark: string;
}

interface CourseTemplateFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: CourseTemplateItem | null;
  onClose: () => void;
  onSave: (values: CourseTemplateFormValues) => void;
}

const TYPES: CourseTypeTag[] = ['团课', '小班', '私教', '教培'];

const emptyValues = (): CourseTemplateFormValues => ({
  name: '',
  type: '团课',
  durationMin: '60',
  defaultCapacity: '16',
  defaultPoints: '1',
  stores: '全部门店',
  teacherLevel: 'T2+',
  schedulable: true,
  description: '',
  remark: '',
});

const valuesFromTemplate = (t: CourseTemplateItem): CourseTemplateFormValues => ({
  name: t.name,
  type: t.type,
  durationMin: String(t.durationMin),
  defaultCapacity: String(t.defaultCapacity),
  defaultPoints: String(t.defaultPoints),
  stores: t.stores,
  teacherLevel: t.teacherLevel,
  schedulable: t.schedulable,
  description: t.description ?? '',
  remark: t.remark ?? '',
});

const CourseTemplateFormModal: React.FC<CourseTemplateFormModalProps> = ({
  open,
  mode,
  initial,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<CourseTemplateFormValues>(emptyValues);

  useEffect(() => {
    if (!open) return;
    setValues(initial ? valuesFromTemplate(initial) : emptyValues());
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <button type="button" aria-label="关闭" className="absolute inset-0 bg-[#222622]/18" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-[#DDDFD8] bg-[#FCFCFA] shadow-xl"
      >
        <header className="shrink-0 border-b border-[#E1E3DD] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#222622]">
            {mode === 'create' ? '新增课程模板' : '编辑课程模板'}
          </h2>
          <p className="mt-1 text-xs text-[#8A908A]">保存后仅更新本页本地模板，刷新后丢失</p>
        </header>
        <div className="custom-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-6">
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">课程名称</span>
            <input
              value={values.name}
              onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">课程类型</span>
            <select
              value={values.type}
              onChange={e => setValues(v => ({ ...v, type: e.target.value as CourseTypeTag }))}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            >
              {TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-[#565D56]">时长（分钟）</span>
              <input
                type="number"
                value={values.durationMin}
                onChange={e => setValues(v => ({ ...v, durationMin: e.target.value }))}
                className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-[#565D56]">默认容量</span>
              <input
                type="number"
                value={values.defaultCapacity}
                onChange={e => setValues(v => ({ ...v, defaultCapacity: e.target.value }))}
                className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">默认扣点</span>
            <input
              type="number"
              value={values.defaultPoints}
              onChange={e => setValues(v => ({ ...v, defaultPoints: e.target.value }))}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">适用门店</span>
            <input
              value={values.stores}
              onChange={e => setValues(v => ({ ...v, stores: e.target.value }))}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">适配老师等级</span>
            <input
              value={values.teacherLevel}
              onChange={e => setValues(v => ({ ...v, teacherLevel: e.target.value }))}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[#565D56]">
            <input
              type="checkbox"
              checked={values.schedulable}
              onChange={e => setValues(v => ({ ...v, schedulable: e.target.checked }))}
            />
            是否可排课
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">课程简介</span>
            <textarea
              value={values.description}
              onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-[#565D56]">备注</span>
            <textarea
              value={values.remark}
              onChange={e => setValues(v => ({ ...v, remark: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-[#E1E3DD] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <footer className="flex shrink-0 justify-end gap-2 border-t border-[#E1E3DD] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E1E3DD] bg-white px-4 py-2 text-xs text-[#565D56]"
          >
            取消
          </button>
          <button type="button" onClick={() => onSave(values)} className="met-ink-button !text-xs">
            保存为本地模板
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CourseTemplateFormModal;
