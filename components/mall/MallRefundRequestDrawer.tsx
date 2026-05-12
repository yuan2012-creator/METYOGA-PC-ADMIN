import React, { useMemo } from 'react';
import type { Member, MemberAsset, Order, Payment, Refund } from '../../types';
import { buildRefundRequestPreview, canOpenRefundRequest } from '../../utils/mallRefundRequest';
import {
  formatMallAssetEquitySummary,
  formatMallAssetUsedSummary,
  formatMallDateTimeDisplay,
  formatMallMoneyYuan,
  labelMallContractStatusZh,
  labelMallMemberAssetStatusZh,
  labelMallOrderStatusZh,
  labelMallPaymentMethodZh,
  labelMallPaymentStatusZh,
  labelMallRefundAssetHandleTypeZh,
  labelMallRefundStatusZh,
  labelMallRefundTypeZh,
} from '../../utils/mallSelectors';

export interface MallRefundRequestDrawerProps {
  open: boolean;
  orderId: string | null;
  assetId?: string | null;
  onClose: () => void;
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

const DisabledField: React.FC<{ label: string; placeholder: string }> = ({ label, placeholder }) => (
  <div className="mb-3">
    <div className="text-[10px] font-bold text-gray-500 mb-1">{label}</div>
    <input
      type="text"
      readOnly
      disabled
      value={placeholder}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 cursor-not-allowed"
    />
  </div>
);

const MallRefundRequestDrawer: React.FC<MallRefundRequestDrawerProps> = ({
  open,
  orderId,
  assetId,
  onClose,
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

  if (!open) return null;

  const paidDisplay =
    ctx?.preview.paidAmount === undefined || Number.isNaN(ctx.preview.paidAmount)
      ? '暂未记录'
      : formatMallMoneyYuan(ctx.preview.paidAmount);
  const refundedDisplay = formatMallMoneyYuan(ctx?.preview.refundedAmount);
  const refundableDisplay = formatMallMoneyYuan(ctx?.preview.refundableAmount);

  const body = !ctx ? (
    <div className="p-8 text-center text-sm text-gray-500">未找到订单信息，请关闭后重试。</div>
  ) : (
    <div className="flex flex-col gap-4 p-5 pb-10 overflow-y-auto custom-scroll">
      <p className="text-[11px] text-slate-600 leading-relaxed rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
        退款申请功能当前仅为流程设计入口，正式版本需接入审批、资产处理、财务记录与操作日志。
      </p>

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

      <Section title="2. 申请信息草稿（不落库）">
        <p className="text-[10px] text-gray-500 mb-3">
          以下为未来表单字段示意，本轮不保存输入、不产生业务单据。
        </p>
        <DisabledField label="退款类型" placeholder="全额退款 / 部分退款 / 定金退款 / 特批退款（示意）" />
        <DisabledField label="申请退款金额" placeholder="不超过可申请上限（示意）" />
        <DisabledField label="退款原因" placeholder="与会员沟通一致的说明（示意）" />
        <Row
          label="建议资产处理方式（预览）"
          value={labelMallRefundAssetHandleTypeZh(ctx.preview.suggestedAssetHandleType)}
        />
        <DisabledField label="备注说明" placeholder="内部备注、附件索引等（示意）" />
        <DisabledField label="附件 / 证明材料" placeholder="正式版本需上传与留痕（占位）" />
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
          下方「提交申请」已禁用。正式版本需接入审批、资产处理、财务记录与操作日志后方可提交。
        </p>
        <Row label="订单主状态" value={labelMallOrderStatusZh(ctx.order.status)} />
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
        <div className="border-t border-gray-100 bg-white px-5 py-4 shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-800 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled
            aria-disabled
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-200"
          >
            提交申请
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 px-5 pb-3 bg-white">
          提交入口已禁用；正式提交流程待接入。
        </p>
      </aside>
    </div>
  );
};

export default MallRefundRequestDrawer;
