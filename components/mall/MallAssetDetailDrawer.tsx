import React, { useMemo } from 'react';
import type { Contract, Member, MemberAsset, Order, Payment, Refund } from '../../types';
import {
  buildMallAssetDetailRiskMessages,
  formatMallAssetEquitySummary,
  formatMallAssetInitialSummary,
  formatMallAssetUsedSummary,
  formatMallDateTimeDisplay,
  formatMallMoneyYuan,
  getMallProductBusinessTypeLabel,
  labelMallContractStatusZh,
  labelMallContractTemplateZh,
  labelMallMemberAssetStatusZh,
  labelMallOrderStatusZh,
  labelMallPaymentMethodZh,
  labelMallPaymentStatusZh,
  labelMallRefundStatusZh,
  labelMallRefundTypeZh,
  labelMallRefundAssetHandleTypeZh,
  mallAssetExpiryWithinDaysAhead,
  mallAssetIsPastExpiryClock,
  summarizeMallHeaderPaymentStateZh,
} from '../../utils/mallSelectors';

export interface MallAssetDetailDrawerProps {
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

const SENSITIVE_OPS_NOTE =
  '退款、转卡、冻结属于敏感操作，正式版本需审批、资产处理、财务记录与操作日志。';

const venueDisplayFromStoreId = (storeId?: string): string => {
  if (!storeId) return '暂未记录';
  const map: Record<string, string> = {
    '1': '万象城馆',
    'v1': '万象城馆',
    'v2': '西湖旗舰馆',
    custom: '自定义场馆',
  };
  return map[storeId] ?? '暂未记录';
};

const labelAssetBalanceShapeZh = (bt: MemberAsset['balanceType']): string => {
  const map: Record<MemberAsset['balanceType'], string> = {
    time: '期限形态',
    count: '次数形态',
    course: '课次权益形态',
    value: '储值形态',
    points: '积分形态',
  };
  return map[bt] ?? '暂未记录';
};

const MallAssetDetailDrawer: React.FC<MallAssetDetailDrawerProps> = ({
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
    const orderPayments = order ? payments.filter(p => p.orderId === order.id) : [];
    const orderRefundsForAsset = asset.sourceOrderId
      ? refunds.filter(r => r.orderId === asset.sourceOrderId)
      : [];
    const linkedToAssetRefunds = orderRefundsForAsset.filter(
      r => r.memberAssetId === asset.id || r.assetId === asset.id
    );
    const showOrderRefundUnboundInline =
      orderRefundsForAsset.some(r => r.status === 'completed') && linkedToAssetRefunds.length === 0;
    const primaryOrderName =
      order?.items.map(i => i.productName).filter(Boolean).join('、') ?? '暂未记录';
    const risks = buildMallAssetDetailRiskMessages({
      asset,
      order,
      contract,
      refunds,
      now,
    });
    const rem = asset.remainingAmount ?? 0;
    const pastExpiry = mallAssetIsPastExpiryClock(asset.expiryDate, now);
    const nearExpiry = mallAssetExpiryWithinDaysAhead(asset.expiryDate, now, 30);
    const canReserve = asset.status === 'effective' && rem > 0 && !pastExpiry;

    return {
      asset,
      member,
      order,
      contract,
      orderPayments,
      linkedToAssetRefunds,
      orderRefundsForAsset,
      showOrderRefundUnboundInline,
      primaryOrderName,
      risks,
      rem,
      pastExpiry,
      nearExpiry,
      canReserve,
    };
  }, [assetId, memberAssets, members, orders, contracts, payments, refunds, now]);

  if (!open) return null;

  const body = !ctx ? (
    <div className="p-8 text-center text-sm text-gray-500">未找到该资产，请返回后重试。</div>
  ) : (
    <div className="flex flex-col gap-4 p-5 pb-10 overflow-y-auto custom-scroll">
      <Section title="1. 资产概览">
        <Row label="资产名称" value={ctx.asset.name} />
        <Row
          label="资产类型"
          value={`${getMallProductBusinessTypeLabel(ctx.asset.productType)} · ${labelAssetBalanceShapeZh(ctx.asset.balanceType)}`}
        />
        <Row label="资产状态" value={labelMallMemberAssetStatusZh(ctx.asset.status)} />
        <Row label="所属会员" value={ctx.member?.name ?? '暂未记录'} />
        <Row label="初始权益" value={formatMallAssetInitialSummary(ctx.asset)} />
        <Row label="已使用权益" value={formatMallAssetUsedSummary(ctx.asset)} />
        <Row label="剩余权益" value={formatMallAssetEquitySummary(ctx.asset)} />
        <Row label="生效时间" value={formatMallDateTimeDisplay(ctx.asset.effectiveDate)} />
        <Row label="到期时间" value={formatMallDateTimeDisplay(ctx.asset.expiryDate)} />
        <Row
          label="适用门店"
          value={ctx.order ? venueDisplayFromStoreId(ctx.order.storeId) : '暂未记录'}
        />
        <Row label="适用课程类型" value={getMallProductBusinessTypeLabel(ctx.asset.productType)} />
      </Section>

      <Section title="2. 来源与合同">
        <div className="mb-3">
          <div className="text-[11px] font-bold text-gray-600 mb-2">来源订单</div>
          {!ctx.order ? (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无来源订单</p>
          ) : (
            <div className="space-y-0 rounded-lg border border-gray-100 overflow-hidden px-3 bg-gray-50/50">
              <Row label="订单编号" value={ctx.order.id} />
              <Row label="购买产品" value={ctx.primaryOrderName} />
              <Row label="订单状态" value={labelMallOrderStatusZh(ctx.order.status)} />
              <Row label="支付状态" value={summarizeMallHeaderPaymentStateZh(ctx.order, payments)} />
              <Row label="下单时间" value={formatMallDateTimeDisplay(ctx.order.createdAt)} />
            </div>
          )}
        </div>
        <div className="mb-3">
          <div className="text-[11px] font-bold text-gray-600 mb-2">关联合同</div>
          {!ctx.contract ? (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无关联合同</p>
          ) : (
            <div className="space-y-0 rounded-lg border border-gray-100 overflow-hidden px-3 bg-gray-50/50">
              <Row label="合同名称" value={ctx.contract.title?.trim() || '暂未记录'} />
              <Row label="合同状态" value={labelMallContractStatusZh(ctx.contract.status)} />
              <Row label="签署时间" value={formatMallDateTimeDisplay(ctx.contract.signedAt)} />
              <Row label="合同模板" value={labelMallContractTemplateZh(ctx.contract.templateId)} />
            </div>
          )}
        </div>
        <div>
          <div className="text-[11px] font-bold text-gray-600 mb-2">支付信息</div>
          {!ctx.order || ctx.orderPayments.length === 0 ? (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无支付记录</p>
          ) : (
            <div className="space-y-2">
              {ctx.orderPayments.map(p => (
                <div key={p.id} className="rounded-lg border border-gray-100 px-3 bg-gray-50/50">
                  <Row label="支付金额" value={formatMallMoneyYuan(p.amount)} />
                  <Row label="支付方式" value={labelMallPaymentMethodZh(p.method)} />
                  <Row label="支付时间" value={formatMallDateTimeDisplay(p.paidAt ?? p.initiatedAt)} />
                  <Row label="支付流水号" value={p.transactionNo?.trim() || '暂未记录'} />
                  <Row label="支付状态" value={labelMallPaymentStatusZh(p.status)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="3. 权益与有效期">
        <Row label="初始权益" value={formatMallAssetInitialSummary(ctx.asset)} />
        <Row label="剩余权益" value={formatMallAssetEquitySummary(ctx.asset)} />
        <Row label="已使用权益" value={formatMallAssetUsedSummary(ctx.asset)} />
        <Row
          label="有效期"
          value={`${formatMallDateTimeDisplay(ctx.asset.effectiveDate)} ～ ${formatMallDateTimeDisplay(ctx.asset.expiryDate)}`}
        />
        <Row
          label="是否即将到期"
          value={
            !ctx.asset.expiryDate?.trim()
              ? '暂未记录'
              : ctx.nearExpiry
                ? '即将到期'
                : '否'
          }
        />
        <Row
          label="是否余额不足"
          value={ctx.rem <= 0 ? '权益已用尽' : ctx.rem <= 3 ? '余额不足' : '否'}
        />
        <Row label="当前可否用于预约" value={ctx.canReserve ? '可用于预约' : '当前不可用于预约'} />
        <div className="mt-3 space-y-1.5 text-[11px] text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {ctx.rem <= 0 && <p>权益已用尽</p>}
          {ctx.rem > 0 && ctx.rem <= 3 && <p>余额不足</p>}
          {ctx.asset.expiryDate?.trim() && ctx.nearExpiry && <p>即将到期</p>}
          {!ctx.canReserve && <p>当前不可用于预约</p>}
        </div>
      </Section>

      <Section title="4. 退款 / 转卡 / 冻结记录">
        <div className="mb-3">
          <div className="text-[11px] font-bold text-gray-600 mb-2">退款记录</div>
          {ctx.linkedToAssetRefunds.length > 0 ? (
            <div className="space-y-2">
              {ctx.linkedToAssetRefunds.map(r => (
                <div key={r.id} className="rounded-lg border border-gray-100 px-3 bg-gray-50/50">
                  <Row label="退款类型" value={labelMallRefundTypeZh(r.refundType)} />
                  <Row label="退款金额" value={formatMallMoneyYuan(r.amount)} />
                  <Row label="资产处理方式" value={labelMallRefundAssetHandleTypeZh(r.assetHandleType)} />
                  <Row label="处理状态" value={labelMallRefundStatusZh(r.status)} />
                  <Row
                    label="时间"
                    value={formatMallDateTimeDisplay(r.completedAt ?? r.approvedAt ?? r.requestedAt)}
                  />
                  <Row label="原因说明" value={r.reason?.trim() || '暂未记录'} />
                </div>
              ))}
            </div>
          ) : ctx.showOrderRefundUnboundInline ? (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
              存在订单退款记录，但暂未关联具体会员资产。
            </p>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无退款记录</p>
          )}
        </div>
        <div className="mb-3">
          <div className="text-[11px] font-bold text-gray-600 mb-2">转卡记录</div>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无转卡记录</p>
        </div>
        <div className="mb-2">
          <div className="text-[11px] font-bold text-gray-600 mb-2">冻结记录</div>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无冻结记录</p>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 leading-relaxed rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
          {SENSITIVE_OPS_NOTE}
        </p>
      </Section>

      <Section title="5. 风险与待处理">
        <ul className="text-xs text-gray-800 space-y-2 list-disc pl-4">
          {ctx.risks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
        <p className="text-[10px] text-slate-600 mt-3 leading-relaxed rounded-lg border border-slate-200/80 bg-slate-50/90 px-3 py-2.5">
          {SENSITIVE_OPS_NOTE}
        </p>
      </Section>

      <Section title="6. 操作记录">
        <p className="text-xs text-gray-600 leading-relaxed">
          当前仅展示资产关键节点。正式版本需接入操作日志，记录资产生成、退款处理、转卡、冻结、解冻与人工修改记录。
        </p>
      </Section>
    </div>
  );

  const header = ctx ? (
    <div className="border-b border-gray-100 bg-white px-5 py-4 shrink-0">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black text-gray-900 truncate">{ctx.asset.name}</h2>
          <div className="text-xs text-gray-600 mt-1">
            {labelMallMemberAssetStatusZh(ctx.asset.status)} · {ctx.member?.name ?? '暂未记录'}
          </div>
          <div className="text-[11px] text-gray-500 mt-2 leading-snug">
            剩余权益摘要：{formatMallAssetEquitySummary(ctx.asset)}
          </div>
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
      <span className="text-sm font-bold text-gray-700">会员资产详情</span>
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
    <div className="fixed inset-0 z-[90] flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="关闭遮罩" />
      <aside
        className="relative h-full w-full max-w-lg bg-[#F5F5F7] shadow-2xl flex flex-col animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        {header}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{body}</div>
      </aside>
    </div>
  );
};

export default MallAssetDetailDrawer;
