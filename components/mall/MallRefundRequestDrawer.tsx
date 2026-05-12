import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  MallRefundRequestDraft,
  Member,
  MemberAsset,
  Order,
  Payment,
  Refund,
  RefundAssetHandleType,
  RefundType,
} from '../../types';
import { buildRefundRequestPreview, canOpenRefundRequest } from '../../utils/mallRefundRequest';
import {
  formatMallAssetEquitySummary,
  formatMallAssetUsedSummary,
  formatMallDateTimeDisplay,
  formatMallMoneyYuan,
  labelMallContractStatusZh,
  labelMallMemberAssetStatusZh,
  labelMallPaymentMethodZh,
  labelMallPaymentStatusZh,
  labelMallRefundAssetHandleTypeZh,
  labelMallRefundStatusZh,
  labelMallRefundTypeZh,
} from '../../utils/mallSelectors';

const REFUND_TYPE_OPTIONS: { value: RefundType; label: string }[] = [
  { value: 'full_refund', label: '全额退款' },
  { value: 'partial_refund', label: '部分退款' },
  { value: 'deposit_refund', label: '定金退款' },
  { value: 'special_refund', label: '特批退款' },
];

const ASSET_HANDLE_OPTIONS: { value: RefundAssetHandleType; label: string }[] = [
  { value: 'void_asset', label: '作废资产' },
  { value: 'reduce_balance', label: '扣减权益' },
  { value: 'freeze_asset', label: '冻结资产' },
  { value: 'keep_asset', label: '保留资产' },
  { value: 'manual_review', label: '人工复核' },
];

const briefOrderStatusZh = (status: Order['status']): string => {
  const map: Record<Order['status'], string> = {
    draft: '草稿',
    pending_payment: '待收款',
    paid: '已收款',
    fulfilled: '已履约',
    closed: '已关闭',
    cancelled: '已取消',
    partially_refunded: '部分登记退款',
    refunded: '全额登记关闭（订单）',
  };
  return map[status] ?? '暂未记录';
};

export interface MallRefundRequestDrawerProps {
  open: boolean;
  orderId: string | null;
  assetId?: string | null;
  onClose: () => void;
  onSaveDraft: (draft: MallRefundRequestDraft) => void;
  existingDraft?: MallRefundRequestDraft | null;
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

const MallRefundRequestDrawer: React.FC<MallRefundRequestDrawerProps> = ({
  open,
  orderId,
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
  const ctx = useMemo(() => {
    if (!orderId) return null;
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    const asset = assetId ? memberAssets.find(a => a.id === assetId) : undefined;
    const contract =
      contracts.find(c => c.id === order.contractId) ?? contracts.find(c => c.orderId === order.id);
    const member = members.find(m => m.id === order.memberId);
    const orderPayments = payments.filter(p => p.orderId === order.id);
    const orderRefunds = refunds.filter(r => r.orderId === order.id);
    const primaryName =
      order.items.map(i => i.productName).filter(Boolean).join('、') || '暂未记录';
    const preview = buildRefundRequestPreview({
      order,
      payments,
      refunds,
      asset: asset ?? null,
    });
    const gate = canOpenRefundRequest({
      order,
      asset: asset ?? null,
      contract,
      payments,
      refunds,
      memberAssets,
    });
    return {
      order,
      asset,
      contract,
      member,
      orderPayments,
      orderRefunds,
      primaryName,
      preview,
      gate,
    };
  }, [orderId, assetId, orders, contracts, payments, refunds, memberAssets, members]);

  const [refundType, setRefundType] = useState<RefundType>('partial_refund');
  const [requestedAmountStr, setRequestedAmountStr] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [assetHandleType, setAssetHandleType] = useState<RefundAssetHandleType>('manual_review');
  const [operationNote, setOperationNote] = useState('');
  const [attachmentNote, setAttachmentNote] = useState('');
  const [draftId, setDraftId] = useState(() => `mrr-draft-${Date.now()}`);
  const lastHydratedOpenKey = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      lastHydratedOpenKey.current = null;
      return;
    }
    if (!ctx) return;
    const k = `${ctx.order.id}::${assetId?.trim() ? assetId.trim() : 'order'}`;
    if (lastHydratedOpenKey.current === k) return;
    lastHydratedOpenKey.current = k;
    const d = existingDraft;
    const cap = ctx.preview.refundableAmount;
    setDraftId(d?.id ?? `mrr-draft-${Date.now()}`);
    setRefundType(d?.refundType ?? 'partial_refund');
    setRequestedAmountStr(
      d?.requestedAmount !== undefined && !Number.isNaN(Number(d.requestedAmount))
        ? String(d.requestedAmount)
        : String(cap)
    );
    setRefundReason(d?.refundReason ?? '');
    setAssetHandleType(d?.assetHandleType ?? ctx.preview.suggestedAssetHandleType);
    setOperationNote(d?.operationNote ?? '');
    setAttachmentNote(d?.attachmentNote ?? '');
  }, [open, ctx, assetId, existingDraft]);

  const amountHints = useMemo(() => {
    if (!ctx) return [];
    const cap = ctx.preview.refundableAmount;
    const raw = requestedAmountStr.trim();
    const msgs: string[] = [];
    if (raw === '') {
      msgs.push('请填写申请退款金额。');
      return msgs;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) {
      msgs.push('请填写申请退款金额。');
      return msgs;
    }
    if (n <= 0) msgs.push('申请退款金额需大于 0。');
    if (n > cap) msgs.push('申请金额超过当前可申请退款上限，请核对。');
    return msgs;
  }, [ctx, requestedAmountStr]);

  if (!open) return null;

  const paidDisplay =
    ctx?.preview.paidAmount === undefined || Number.isNaN(ctx.preview.paidAmount)
      ? '暂未记录'
      : formatMallMoneyYuan(ctx.preview.paidAmount);
  const refundedDisplay = formatMallMoneyYuan(ctx?.preview.refundedAmount);
  const refundableDisplay = formatMallMoneyYuan(ctx?.preview.refundableAmount);

  const handleSaveClick = () => {
    if (!ctx) return;
    const raw = requestedAmountStr.trim();
    const n = raw === '' || Number.isNaN(Number(raw)) ? NaN : Number(raw);
    const requestedAmount = Number.isNaN(n) ? 0 : n;
    const draft: MallRefundRequestDraft = {
      id: draftId,
      orderId: ctx.order.id,
      assetId: assetId?.trim() || undefined,
      refundType,
      requestedAmount,
      refundReason,
      assetHandleType,
      operationNote,
      attachmentNote,
      updatedAt: new Date().toISOString(),
    };
    onSaveDraft(draft);
  };

  const body = !ctx ? (
    <div className="p-8 text-center text-sm text-gray-500">未找到订单信息，请关闭后重试。</div>
  ) : (
    <div className="flex flex-col gap-4 p-5 pb-10 overflow-y-auto custom-scroll">
      <p className="text-[11px] text-slate-600 leading-relaxed rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
        退款申请功能当前仅为流程设计入口，正式版本需接入审批、资产处理、财务记录与操作日志。
      </p>

      {existingDraft?.updatedAt && (
        <p className="text-[11px] text-amber-900 leading-relaxed rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2.5">
          已存在本模块退款申请草稿，最近保存：{formatMallDateTimeDisplay(existingDraft.updatedAt)}
        </p>
      )}

      <Section title="1. 退款依据">
        <p className="text-[11px] text-gray-600 mb-3 leading-relaxed">
          退款可能影响订单、支付、会员资产、合同与经营留痕。以下金额为前台预览口径，不用于财务确认。
        </p>
        <Row label="订单金额" value={formatMallMoneyYuan(ctx.order.totalAmount)} />
        <Row label="已支付金额" value={paidDisplay} />
        <Row label="已登记退款合计" value={refundedDisplay} />
        <Row label="可申请退款上限（预览）" value={refundableDisplay} />
        <Row
          label="合同状态"
          value={ctx.contract ? labelMallContractStatusZh(ctx.contract.status) : '暂未记录'}
        />
        <Row
          label="资产状态"
          value={
            ctx.asset ? labelMallMemberAssetStatusZh(ctx.asset.status) : '本单暂无关联权益记录（仅订单视角）'
          }
        />
        <Row
          label="剩余权益"
          value={ctx.asset ? formatMallAssetEquitySummary(ctx.asset) : '暂未记录'}
        />
        <Row
          label="已耗用权益"
          value={ctx.asset ? formatMallAssetUsedSummary(ctx.asset) : '暂未记录'}
        />
        <Row label="历史退款笔数" value={String(ctx.preview.historyRefundCount)} />
        <div className="text-[11px] font-bold text-gray-600 mt-3 mb-2">支付流水（只读）</div>
        {ctx.orderPayments.length === 0 ? (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无支付记录</p>
        ) : (
          <div className="space-y-2">
            {ctx.orderPayments.map(p => (
              <div key={p.id} className="rounded-lg border border-gray-100 px-3 bg-gray-50/50">
                <Row label="支付状态" value={labelMallPaymentStatusZh(p.status)} />
                <Row label="支付金额" value={formatMallMoneyYuan(p.amount)} />
                <Row label="支付方式" value={labelMallPaymentMethodZh(p.method)} />
                <Row label="支付时间" value={formatMallDateTimeDisplay(p.paidAt ?? p.initiatedAt)} />
              </div>
            ))}
          </div>
        )}
        <div className="text-[11px] font-bold text-gray-600 mt-3 mb-2">历史登记摘要（只读）</div>
        {ctx.orderRefunds.length === 0 ? (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无历史登记</p>
        ) : (
          <div className="space-y-2">
            {ctx.orderRefunds.map(r => (
              <div key={r.id} className="rounded-lg border border-gray-100 px-3 bg-gray-50/50 text-xs">
                <Row label="处理状态" value={labelMallRefundStatusZh(r.status)} />
                <Row label="类型" value={labelMallRefundTypeZh(r.refundType)} />
                <Row label="金额" value={formatMallMoneyYuan(r.amount)} />
                <Row label="时间" value={formatMallDateTimeDisplay(r.completedAt ?? r.requestedAt)} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="2. 申请信息草稿（本模块可保存）">
        <p className="text-[10px] text-gray-500 mb-3">
          以下内容仅保存在当前页面运行期间，不产生业务单据、不写入登记流水区。
        </p>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">退款类型</div>
          <select
            value={refundType}
            onChange={e => setRefundType(e.target.value as RefundType)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900"
          >
            {REFUND_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">
            申请退款金额（默认不超过可申请上限，可改）
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={requestedAmountStr}
            onChange={e => setRequestedAmountStr(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900"
            min={0}
          />
          {amountHints.length > 0 && (
            <ul className="mt-1.5 text-[10px] text-amber-800 space-y-0.5 list-disc pl-4">
              {amountHints.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">退款原因（建议填写）</div>
          <input
            type="text"
            value={refundReason}
            onChange={e => setRefundReason(e.target.value)}
            placeholder="与会员沟通一致的说明"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">资产处理方式</div>
          <select
            value={assetHandleType}
            onChange={e => setAssetHandleType(e.target.value as RefundAssetHandleType)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900"
          >
            {ASSET_HANDLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1">
            系统建议：{labelMallRefundAssetHandleTypeZh(ctx.preview.suggestedAssetHandleType)}（可覆盖）
          </p>
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">备注说明</div>
          <textarea
            value={operationNote}
            onChange={e => setOperationNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 resize-y min-h-[52px]"
            placeholder="内部备注、对账说明等"
          />
        </div>
        <div className="mb-1">
          <div className="text-[10px] font-bold text-gray-500 mb-1">附件 / 证明材料说明</div>
          <textarea
            value={attachmentNote}
            onChange={e => setAttachmentNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 resize-y min-h-[52px]"
            placeholder="正式版本需支持上传证明材料，当前仅记录说明"
          />
        </div>
      </Section>

      <Section title="3. 风险提示">
        <ul className="text-xs text-gray-800 space-y-2 list-disc pl-4">
          {ctx.gate.riskMessages.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>

      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-black text-gray-600 mb-2">4. 提交说明</h3>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          提交申请功能待接入，正式版本需审批、资产处理、财务记录与操作日志。
        </p>
        <Row label="订单主状态" value={briefOrderStatusZh(ctx.order.status)} />
      </section>
    </div>
  );

  const header = ctx ? (
    <div className="border-b border-gray-100 bg-white px-5 py-4 shrink-0">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-gray-900">退款申请</h2>
          <div className="text-[10px] font-mono text-gray-400 truncate mt-1">{ctx.order.id}</div>
          <div className="text-xs text-gray-700 font-medium mt-1 truncate">{ctx.primaryName}</div>
          <div className="text-xs text-gray-500 mt-1">会员：{ctx.member?.name ?? '暂未记录'}</div>
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
      <span className="text-sm font-bold text-gray-700">退款申请</span>
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
    <div className="fixed inset-0 z-[95] flex justify-end">
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
            onClick={handleSaveClick}
            disabled={!ctx}
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存草稿
          </button>
          <button
            type="button"
            disabled
            aria-disabled
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
          >
            提交申请
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 px-4 pb-3 bg-white leading-relaxed">
          「提交申请」已禁用；正式提交流程待接入。
        </p>
      </aside>
    </div>
  );
};

export default MallRefundRequestDrawer;
