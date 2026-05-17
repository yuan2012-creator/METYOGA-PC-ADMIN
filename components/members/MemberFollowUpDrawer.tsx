import React, { useEffect, useState } from 'react';
import type { MemberRecord } from './memberOperationViewModel';

export interface FollowUpFormValues {
  targetId: string;
  type: string;
  method: string;
  content: string;
  result: string;
  nextAt: string;
  needManager: boolean;
  note: string;
}

interface MemberFollowUpDrawerProps {
  open: boolean;
  member: MemberRecord | null;
  onClose: () => void;
  onSave: (values: FollowUpFormValues) => void;
}

const emptyForm = (memberId: string): FollowUpFormValues => ({
  targetId: memberId,
  type: '日常维护',
  method: '微信',
  content: '',
  result: '',
  nextAt: '',
  needManager: false,
  note: '',
});

const MemberFollowUpDrawer: React.FC<MemberFollowUpDrawerProps> = ({
  open,
  member,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<FollowUpFormValues>(emptyForm(member?.id ?? ''));

  useEffect(() => {
    if (member) setForm(emptyForm(member.id));
  }, [member?.id, open]);

  if (!open || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, targetId: member.id });
  };

  return (
    <>
      <button type="button" aria-label="关闭" className="fixed inset-0 z-[60] bg-[#222622]/18" onClick={onClose} />
      <aside
        className="met-member-drawer fixed right-0 top-0 z-[70] flex h-full w-full max-w-[480px] flex-col border-l border-[#DDDFD8] bg-[#FCFCFA] shadow-[-8px_0_32px_rgba(34,38,34,0.08)]"
        role="dialog"
        aria-modal
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#E1E3DD] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#222622]">添加跟进</h2>
            <p className="mt-1 text-xs text-[#8A908A]">
              {member.name} · {member.phone}
            </p>
          </div>
          <button type="button" onClick={onClose} className="met-member-drawer__close">
            ×
          </button>
        </header>
        <form onSubmit={handleSubmit} className="custom-scroll flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
          <label className="met-member-form-field">
            <span>跟进对象</span>
            <input type="text" value={`${member.name}（${member.memberCode}）`} readOnly className="opacity-70" />
          </label>
          <label className="met-member-form-field">
            <span>跟进类型</span>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option>续费</option>
              <option>唤醒</option>
              <option>体验转化</option>
              <option>投诉处理</option>
              <option>日常维护</option>
              <option>私教转化</option>
              <option>课程邀约</option>
              <option>课后反馈</option>
              <option>老师协同</option>
              <option>风险复核</option>
            </select>
          </label>
          <label className="met-member-form-field">
            <span>跟进方式</span>
            <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
              <option>电话</option>
              <option>微信</option>
              <option>到店沟通</option>
              <option>课程后沟通</option>
            </select>
          </label>
          <label className="met-member-form-field">
            <span>跟进内容</span>
            <textarea
              rows={4}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="记录沟通要点与会员反馈"
              required
            />
          </label>
          <label className="met-member-form-field">
            <span>处理结果</span>
            <input
              type="text"
              value={form.result}
              onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
              placeholder="如：已邀约本周课程"
            />
          </label>
          <label className="met-member-form-field">
            <span>下次跟进时间</span>
            <input type="date" value={form.nextAt} onChange={e => setForm(f => ({ ...f, nextAt: e.target.value }))} />
          </label>
          <label className="met-member-form-field met-member-form-field--row">
            <input
              type="checkbox"
              checked={form.needManager}
              onChange={e => setForm(f => ({ ...f, needManager: e.target.checked }))}
            />
            <span>是否需要店长介入</span>
          </label>
          <label className="met-member-form-field">
            <span>备注</span>
            <textarea
              rows={2}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="附件说明（本页仅记录，不上传真实文件）"
            />
          </label>
          <div className="mt-auto flex gap-2 border-t border-[#EEF0EC] pt-4">
            <button type="button" onClick={onClose} className="met-today-header-btn flex-1">
              取消
            </button>
            <button type="submit" className="met-ink-button flex-1 !text-sm">
              保存跟进
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

export default MemberFollowUpDrawer;
