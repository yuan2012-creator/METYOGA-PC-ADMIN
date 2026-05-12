import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Contract, MallTransferRequestDraft, Member, MemberAsset, Order, Payment, Refund } from '../../types';
import { buildMallTransferRequestPreviewDto, canOpenTransferRequest } from '../../utils/mallTransferRequest';
import {
  formatMallAssetEquitySummary,
  formatMallDateTimeDisplay,
  formatMallSensitiveOrderDisplay,
  mallAssetExpiryWithinDaysAhead,
  mallAssetIsPastExpiryClock,
} from '../../utils/mallSelectors';

const briefOrderStatusForTransfer = (status: Order['status']): string => {
  const map: Record<Order['status'], string> = {
    draft: '草稿',
    pending_payment: '待收款',
    paid: '已收款',
    fulfilled: '已履约',
    closed: '已关闭',
    cancelled: '已取消',
    partially_refunded: '部分登记退回',
    refunded: '全额登记关闭（订单）',
  };
  return map[status] ?? '暂未记录';
};

export interface MallTransferRequestDrawerProps {
  open: boolean;
  assetId: string | null;
  onClose: () => void;
  onSaveDraft: (draft: MallTransferRequestDraft) => void;
  existingDraft?: MallTransferRequestDraft | null;
  orders: Order[];
  contracts: Contract[];
  payments: Payment[];
  refunds: Refund[];
  memberAssets: MemberAsset[];
  members: Member[];
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <h3 className="text-xs font-black text-gray-600 mb-3">{title}</h3>
    {children}
  </section>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 text-xs border-b border-gray-50 last:border-0">
    <span className="text-gray-500 shrink-0">{label}</span>
    <span className="text-right text-gray-900 font-medium break-words">{value}</span>
  </div>
);

const MallTransferRequestDrawer: React.FC<MallTransferRequestDrawerProps> = ({
  open,
  assetId,
  onClose,
  onSaveDraft,
  existingDraft,
  orders,
  contracts,
  payments,
  refunds,
  memberAssets,
  members,
}) => {
  const now = useMemo(() => new Date(), []);

  const ctx = useMemo(() => {
    if (!assetId) return null;
    const asset = memberAssets.find(a => a.id === assetId);
    if (!asset) return null;
    const member = members.find(m => m.id === asset.memberId);
    const order = asset.sourceOrderId ? orders.find(o => o.id === asset.sourceOrderId) : undefined;
    const contract =
      contracts.find(c => c.id === asset.contractId) ??
      (order ? contracts.find(c => c.id === order.contractId || c.orderId === order.id) : undefined);
    const gate = canOpenTransferRequest({
      asset,
      order: order ?? null,
      contract: contract ?? null,
      payments,
      refunds,
    });
    const preview = buildMallTransferRequestPreviewDto({
      asset,
      order,
      contract,
      refunds,
      memberName: member?.name,
    });
    const pastExpiry = mallAssetIsPastExpiryClock(asset.expiryDate, now);
    const nearExpiry = mallAssetExpiryWithinDaysAhead(asset.expiryDate, now, 30);
    const rem = asset.remainingAmount ?? 0;
    const canReserveDisplay = asset.status === 'effective' && rem > 0 && !pastExpiry;

    return {
      asset,
      member,
      order,
      contract,
      gate,
      preview,
      nearExpiry,
      canReserveDisplay,
    };
  }, [assetId, memberAssets, members, orders, contracts, payments, refunds, now]);

  const [draftId, setDraftId] = useState(() => `mtr-draft-${Date.now()}`);
  const [toMemberRef, setToMemberRef] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [syncContractReassign, setSyncContractReassign] = useState<'' | 'yes' | 'no'>('');
  const [feeSummary, setFeeSummary] = useState('');
  const [remark, setRemark] = useState('');
  const [attachmentNote, setAttachmentNote] = useState('');
  const lastHydratedOpenKey = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      lastHydratedOpenKey.current = null;
      return;
    }
    if (!ctx || !assetId?.trim()) return;
    const k = assetId.trim();
    if (lastHydratedOpenKey.current === k) return;
    lastHydratedOpenKey.current = k;
    const d = existingDraft?.assetId === assetId ? existingDraft : undefined;
    setDraftId(d?.id ?? `mtr-draft-${Date.now()}`);
    setToMemberRef(d?.toMemberRef ?? '');
    setTransferReason(d?.transferReason ?? '');
    setSyncContractReassign(d?.syncContractReassign ?? '');
    setFeeSummary(d?.feeSummary ?? '');
    setRemark(d?.remark ?? '');
    setAttachmentNote(d?.attachmentNote ?? '');
  }, [open, ctx, assetId, existingDraft]);

  const handleSaveDraft = () => {
    if (!ctx || !assetId?.trim()) return;
    const draft: MallTransferRequestDraft = {
      id: draftId,
      assetId: assetId.trim(),
      toMemberRef: toMemberRef.trim(),
      transferReason: transferReason.trim(),
      syncContractReassign,
      feeSummary: feeSummary.trim(),
      remark: remark.trim(),
      attachmentNote: attachmentNote.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSaveDraft(draft);
  };

  if (!open) return null;

  const body = !ctx ? (
    <div className="p-8 text-center text-sm text-gray-500">未找到资产信息，请关闭后重试。</div>
  ) : (
    <div className="flex flex-col gap-4 p-5 pb-10 overflow-y-auto custom-scroll">
      <p className="text-[11px] text-slate-600 leading-relaxed rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
        转卡申请当前仅为流程设计入口，不会修改资产归属、权益余额、合同或财务数据，也不会写入转卡登记。
      </p>

      {existingDraft?.updatedAt && (
        <p className="text-[11px] text-amber-900 leading-relaxed rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2.5">
          已存在本模块转卡申请草稿，最近保存：{formatMallDateTimeDisplay(existingDraft.updatedAt)}
        </p>
      )}

      <Section title="1. 转卡依据">
        <Row label="资产名称" value={ctx.preview.assetName ?? ctx.asset.name} />
        <Row label="资产状态" value={ctx.preview.assetStatusText ?? '暂未记录'} />
        <Row label="所属会员" value={ctx.preview.memberName ?? ctx.member?.name ?? '暂未记录'} />
        <Row
          label="来源订单"
          value={ctx.order ? formatMallSensitiveOrderDisplay(ctx.order) : '暂未记录'}
        />
        {ctx.order && (
          <>
            <Row label="订单主状态" value={briefOrderStatusForTransfer(ctx.order.status)} />
            <Row label="来源订单摘要" value={ctx.preview.sourceOrderSummary ?? '暂未记录'} />
          </>
        )}
        <Row label="合同与标题摘要" value={ctx.preview.contractSummary ?? '暂未记录'} />
        <Row label="当前剩余权益" value={ctx.preview.remainingSummary ?? formatMallAssetEquitySummary(ctx.asset)} />
        <Row label="当前有效期" value={ctx.preview.validUntilText ?? '暂未记录'} />
        <Row
          label="是否即将到期"
          value={!ctx.asset.expiryDate?.trim() ? '暂未记录' : ctx.nearExpiry ? '即将到期' : '否'}
        />
        <Row label="退款背景摘要（订单维度）" value={ctx.preview.refundSummary ?? '暂未记录'} />
        <Row
          label="当前是否可用于预约（仅展示）"
          value={ctx.canReserveDisplay ? '可用于预约' : '当前不可用于预约'}
        />
      </Section>

      <Section title="2. 申请信息草稿（本模块可保存）">
        <p className="text-[10px] text-gray-500 mb-3">
          以下内容仅保存在当前页面运行期间，不产生业务单据、不写入转卡登记。
        </p>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">接收会员（编号 / 姓名）</div>
          <input
            type="text"
            value={toMemberRef}
            onChange={e => setToMemberRef(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900"
            placeholder="登记用说明，非系统绑定"
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">转卡原因</div>
          <textarea
            value={transferReason}
            onChange={e => setTransferReason(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 resize-y min-h-[52px]"
            placeholder="请简述转卡原因"
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">是否同步调整合同归属</div>
          <select
            value={syncContractReassign}
            onChange={e => setSyncContractReassign(e.target.value as '' | 'yes' | 'no')}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900"
          >
            <option value="">请先选择</option>
            <option value="yes">是</option>
            <option value="no">否</option>
          </select>
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">手续费 / 差价说明</div>
          <input
            type="text"
            value={feeSummary}
            onChange={e => setFeeSummary(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900"
            placeholder="可选"
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">备注说明</div>
          <textarea
            value={remark}
            onChange={e => setRemark(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 resize-y min-h-[52px]"
            placeholder="内部备注"
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">附件 / 证明材料说明</div>
          <textarea
            value={attachmentNote}
            onChange={e => setAttachmentNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 resize-y min-h-[52px]"
            placeholder="正式版本需上传与留痕（此处仅文字说明）"
          />
        </div>
      </Section>

      <Section title="3. 转卡规则说明">
        <ul className="text-[11px] text-gray-700 space-y-2 list-disc pl-4 leading-relaxed">
          {(ctx.preview.transferRuleSummary ?? []).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="4. 风险提示">
        <ul className="text-xs text-gray-800 space-y-2 list-disc pl-4">
          {ctx.gate.riskMessages.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>
    </div>
  );

  const header = ctx ? (
    <div className="border-b border-gray-100 bg-white px-5 py-4 shrink-0">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-gray-900">转卡申请</h2>
          <div className="text-xs text-gray-800 font-medium mt-1 truncate">{ctx.asset.name}</div>
          <div className="text-xs text-gray-500 mt-1">所属会员：{ctx.member?.name ?? '暂未记录'}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-bold"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
    </div>
  ) : (
    <div className="border-b border-gray-100 bg-white px-5 py-4 flex justify-between items-center shrink-0">
      <span className="text-sm font-bold text-gray-700">转卡申请</span>
      <button
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold"
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[97] flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="关闭遮罩" />
      <aside
        className="relative h-full w-full max-w-lg bg-[#F5F5F7] shadow-2xl flex flex-col animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        {header}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{body}</div>
        <div className="border-t border-gray-100 bg-white px-4 py-3 shrink-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-800 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!ctx}
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存草稿
          </button>
          <button
            type="button"
            disabled
            aria-disabled
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
          >
            提交转卡申请
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 px-4 pb-3 bg-white leading-relaxed">
          转卡申请暂未接入正式提交。当前仅展示转卡申请流程，不会修改资产归属、权益余额、合同或财务数据。
        </p>
      </aside>
    </div>
  );
};

export default MallTransferRequestDrawer;
