import React, { useMemo } from 'react';
import type { Contract, Member, MemberAsset, Order, Payment, Refund } from '../../types';
import { buildMallFreezeRequestPreviewDto, canOpenFreezeRequest } from '../../utils/mallFreezeRequest';
import {
  formatMallAssetEquitySummary,
  formatMallDateTimeDisplay,
  formatMallSensitiveOrderDisplay,
  labelMallContractStatusZh,
  labelMallMemberAssetStatusZh,
  mallAssetExpiryWithinDaysAhead,
  mallAssetIsPastExpiryClock,
} from '../../utils/mallSelectors';

const briefOrderStatusForFreeze = (status: Order['status']): string => {
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

export interface MallFreezeRequestDrawerProps {
  open: boolean;
  assetId: string | null;
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

const MallFreezeRequestDrawer: React.FC<MallFreezeRequestDrawerProps> = ({
  open,
  assetId,
  onClose,
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
    const primaryOrderName =
      order?.items.map(i => i.productName).filter(Boolean).join('、') ?? '暂未记录';
    const gate = canOpenFreezeRequest({
      asset,
      order: order ?? null,
      contract: contract ?? null,
      payments,
      refunds,
    });
    const preview = buildMallFreezeRequestPreviewDto({
      asset,
      order,
      contract,
      refunds,
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
      primaryOrderName,
      gate,
      preview,
      nearExpiry,
      canReserveDisplay,
    };
  }, [assetId, memberAssets, members, orders, contracts, payments, refunds, now]);

  if (!open) return null;

  const body = !ctx ? (
    <div className="p-8 text-center text-sm text-gray-500">未找到资产信息，请关闭后重试。</div>
  ) : (
    <div className="flex flex-col gap-4 p-5 pb-10 overflow-y-auto custom-scroll">
      <p className="text-[11px] text-slate-600 leading-relaxed rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
        冻结申请当前仅为流程设计入口，不会修改资产状态、有效期或预约权限，也不会写入冻结登记。
      </p>

      <Section title="1. 冻结依据">
        <Row label="资产名称" value={ctx.asset.name} />
        <Row label="资产状态" value={labelMallMemberAssetStatusZh(ctx.asset.status)} />
        <Row label="来源订单" value={ctx.order ? formatMallSensitiveOrderDisplay(ctx.order) : '暂未记录'} />
        {ctx.order && (
          <>
            <Row label="订单主状态" value={briefOrderStatusForFreeze(ctx.order.status)} />
            <Row label="购买产品" value={ctx.primaryOrderName} />
          </>
        )}
        <Row
          label="合同状态"
          value={ctx.contract ? labelMallContractStatusZh(ctx.contract.status) : '暂未记录'}
        />
        <Row label="当前剩余权益" value={formatMallAssetEquitySummary(ctx.asset)} />
        <Row
          label="当前有效期"
          value={`${formatMallDateTimeDisplay(ctx.asset.effectiveDate)} ～ ${formatMallDateTimeDisplay(ctx.asset.expiryDate)}`}
        />
        <Row
          label="是否即将到期"
          value={!ctx.asset.expiryDate?.trim() ? '暂未记录' : ctx.nearExpiry ? '即将到期' : '否'}
        />
        <Row
          label="是否已有登记退回记录（订单维度）"
          value={ctx.preview.hasRefundSignal ? '有，请先核对资产状态' : '暂无'}
        />
        <Row
          label="当前是否可用于预约（仅展示）"
          value={ctx.canReserveDisplay ? '可用于预约' : '当前不可用于预约'}
        />
      </Section>

      <Section title="2. 申请信息草稿（本轮不保存、不提交）">
        <p className="text-[10px] text-gray-500 mb-3">
          以下为未来表单字段示意，本轮不保存输入、不产生业务单据。
        </p>
        <DisabledField label="冻结开始日期" placeholder="正式版本填写（占位）" />
        <DisabledField label="冻结结束日期" placeholder="正式版本填写（占位）" />
        <DisabledField label="冻结天数" placeholder="正式版本填写（占位）" />
        <DisabledField label="冻结原因" placeholder="正式版本填写（占位）" />
        <DisabledField label="是否顺延有效期" placeholder="是 / 否（占位）" />
        <DisabledField label="顺延天数" placeholder="正式版本按卡项规则计算（占位）" />
        <DisabledField label="备注说明" placeholder="内部备注（占位）" />
        <DisabledField label="附件 / 证明材料说明" placeholder="正式版本需上传与留痕（占位）" />
      </Section>

      <Section title="3. 冻结规则说明">
        <ul className="text-[11px] text-gray-700 space-y-2 list-disc pl-4 leading-relaxed">
          <li>冻结属于敏感操作，正式版本需审批、资产预约锁定、有效期处理与操作日志。</li>
          <li>如果选择顺延有效期，正式版本需根据卡项规则计算顺延天数。</li>
          <li>当前仅展示流程设计，不会修改资产状态或有效期。</li>
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
    <div className="border-b border-[var(--met-border-light)] bg-[var(--met-surface)] px-5 py-4 shrink-0">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-gray-900">冻结申请</h2>
          <div className="text-xs text-gray-800 font-medium mt-1 truncate">{ctx.asset.name}</div>
          <div className="text-xs text-gray-500 mt-1">所属会员：{ctx.member?.name ?? '暂未记录'}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-9 h-9 rounded-full border border-[var(--met-border)] text-gray-500 hover:bg-[var(--met-bg-page)] text-sm font-bold"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
    </div>
  ) : (
    <div className="border-b border-[var(--met-border-light)] bg-[var(--met-surface)] px-5 py-4 flex justify-between items-center shrink-0">
      <span className="text-sm font-bold text-gray-700">冻结申请</span>
      <button
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-full border border-[var(--met-border)] text-gray-500 hover:bg-[var(--met-bg-page)] font-bold"
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[96] flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="关闭遮罩" />
      <aside
        className="relative h-full w-full max-w-lg bg-[var(--met-bg-page)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        {header}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{body}</div>
        <div className="border-t border-[var(--met-border-light)] bg-[var(--met-surface)] px-4 py-3 shrink-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold border border-[var(--met-border)] text-gray-800 hover:bg-[var(--met-bg-page)]"
          >
            取消
          </button>
          <button
            type="button"
            disabled
            aria-disabled
            className="min-w-[88px] flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-200 text-gray-500 cursor-not-allowed border border-[var(--met-border)]"
          >
            提交申请
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 px-4 pb-3 bg-white leading-relaxed">
          提交申请功能待接入。当前仅展示冻结申请流程，不会修改资产状态、有效期或预约权限。
        </p>
      </aside>
    </div>
  );
};

export default MallFreezeRequestDrawer;
