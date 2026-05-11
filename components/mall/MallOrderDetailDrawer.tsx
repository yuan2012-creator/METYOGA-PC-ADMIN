import React, { useMemo } from 'react';
import type {
  CardProduct,
  Member,
  MemberAsset,
  Order,
  OrderItem,
  Payment,
  PointProduct,
  Refund,
} from '../../types';
import type { MallTtcCourse } from './MallTtc';
import {
  buildMallOrderDetailRiskMessages,
  formatMallAssetEquitySummary,
  formatMallAssetInitialSummary,
  formatMallDateTimeDisplay,
  formatMallMoneyYuan,
  getMallProductBusinessTypeLabel,
  labelMallContractStatusZh,
  labelMallMemberAssetStatusZh,
  labelMallOrderStatusZh,
  labelMallPaymentMethodZh,
  labelMallPaymentStatusZh,
  labelMallRefundStatusZh,
  mallOrderAppearsSettledForPaymentCheck,
  mallStoreLabelFromId,
  summarizeMallHeaderAssetStateZh,
  summarizeMallHeaderContractStateZh,
  summarizeMallHeaderPaymentStateZh,
} from '../../utils/mallSelectors';

export interface MallOrderDetailDrawerProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  orders: Order[];
  contracts: Contract[];
  payments: Payment[];
  refunds: Refund[];
  memberAssets: MemberAsset[];
  members: Member[];
  cardProducts: CardProduct[];
  ttcCourses: MallTtcCourse[];
  pointProducts: PointProduct[];
}

const contractTemplateLabel = (templateId?: string): string => {
  if (!templateId?.trim()) return '暂未记录';
  if (templateId === 'template-card-standard') return '标准卡项合同模板';
  if (templateId === 'template-ttc-standard') return '标准教培合同模板';
  return '暂未记录';
};

const resolveItemTypeLabel = (productType: OrderItem['productType']): string =>
  getMallProductBusinessTypeLabel(productType);

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

const MallOrderDetailDrawer: React.FC<MallOrderDetailDrawerProps> = ({
  open,
  orderId,
  onClose,
  orders,
  contracts,
  payments,
  refunds,
  memberAssets,
  members,
  cardProducts,
  ttcCourses,
  pointProducts,
}) => {
  const productCatalog = useMemo(() => {
    const map = new Map<string, string>();
    cardProducts.forEach(p => map.set(p.id, p.name));
    ttcCourses.forEach(c => map.set(c.id, c.name));
    pointProducts.forEach(p => map.set(p.id, p.name));
    return map;
  }, [cardProducts, ttcCourses, pointProducts]);

  const ctx = useMemo(() => {
    if (!orderId) return null;
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;
    const member = members.find(m => m.id === order.memberId);
    const contract =
      contracts.find(c => c.id === order.contractId) ?? contracts.find(c => c.orderId === order.id);
    const orderPayments = payments.filter(p => p.orderId === order.id);
    const orderRefunds = refunds.filter(r => r.orderId === order.id);
    const orderAssets = memberAssets.filter(a => a.sourceOrderId === order.id);
    const primaryName =
      order.items.map(i => i.productName).filter(Boolean).join('、') || '暂未记录';
    const risks = buildMallOrderDetailRiskMessages({
      order,
      contract,
      payments,
      refunds,
      assets: memberAssets,
    });
    return {
      order,
      member,
      contract,
      orderPayments,
      orderRefunds,
      orderAssets,
      primaryName,
      risks,
    };
  }, [orderId, orders, contracts, payments, refunds, memberAssets, members, productCatalog]);

  if (!open) return null;

  const body = !ctx ? (
    <div className="p-8 text-center text-sm text-gray-500">未找到该订单，请返回列表重试。</div>
  ) : (
    <div className="flex flex-col gap-4 p-5 pb-10 overflow-y-auto custom-scroll">
      <Section title="1. 订单概览">
        <Row label="订单编号" value={ctx.order.id} />
        <Row label="订单名称" value={ctx.primaryName} />
        <Row label="会员姓名" value={ctx.member?.name ?? '暂未记录'} />
        <Row label="手机号" value={ctx.member?.phone ?? '暂未记录'} />
        <Row label="购买产品" value={ctx.primaryName} />
        <Row
          label="产品类型"
          value={
            ctx.order.items[0]
              ? resolveItemTypeLabel(ctx.order.items[0].productType)
              : '暂未记录'
          }
        />
        {ctx.order.items.length > 1 && (
          <div className="text-xs text-gray-600 mt-2 pl-1 border-l-2 border-gray-200 space-y-1">
            {ctx.order.items.map((item, idx) => (
              <div key={item.id || idx}>
                明细 {idx + 1}：{item.productName || productCatalog.get(item.productId) || '暂未记录'}（
                {resolveItemTypeLabel(item.productType)}）
              </div>
            ))}
          </div>
        )}
        <Row label="订单主状态" value={labelMallOrderStatusZh(ctx.order.status)} />
        <Row label="订单金额" value={formatMallMoneyYuan(ctx.order.totalAmount)} />
        <Row label="优惠金额" value="暂未记录" />
        <Row label="应付金额" value={formatMallMoneyYuan(ctx.order.totalAmount)} />
        <Row label="已付金额" value={formatMallMoneyYuan(ctx.order.paidAmount)} />
        <Row label="下单时间" value={formatMallDateTimeDisplay(ctx.order.createdAt)} />
        <Row label="所属门店" value={mallStoreLabelFromId(ctx.order.storeId) ?? '暂未记录'} />
        <Row label="销售负责人" value="暂未记录" />
      </Section>

      <Section title="2. 合同与支付">
        <div className="mb-3">
          <div className="text-[11px] font-bold text-gray-600 mb-2">合同</div>
          {!ctx.contract ? (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无关联合同</p>
          ) : (
            <div className="space-y-0 rounded-lg border border-gray-100 overflow-hidden px-3 bg-gray-50/50">
              <Row label="合同名称" value={ctx.contract.title?.trim() || '暂未记录'} />
              <Row label="合同状态" value={labelMallContractStatusZh(ctx.contract.status)} />
              <Row label="签署时间" value={formatMallDateTimeDisplay(ctx.contract.signedAt)} />
              <Row label="合同模板" value={contractTemplateLabel(ctx.contract.templateId)} />
              <Row label="关联订单" value="与本订单一致" />
            </div>
          )}
        </div>
        <div>
          <div className="text-[11px] font-bold text-gray-600 mb-2">支付</div>
          {ctx.orderPayments.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无支付记录</p>
              {mallOrderAppearsSettledForPaymentCheck(ctx.order) && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  订单显示已支付，但暂无支付记录。
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {ctx.orderPayments.map(p => (
                <div key={p.id} className="rounded-lg border border-gray-100 px-3 bg-gray-50/50">
                  <Row label="支付状态" value={labelMallPaymentStatusZh(p.status)} />
                  <Row label="支付金额" value={formatMallMoneyYuan(p.amount)} />
                  <Row label="支付方式" value={labelMallPaymentMethodZh(p.method)} />
                  <Row label="支付时间" value={formatMallDateTimeDisplay(p.paidAt ?? p.initiatedAt)} />
                  <Row label="支付流水号" value={p.transactionNo?.trim() || '暂未记录'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="3. 会员资产">
        {ctx.orderAssets.length === 0 ? (
          <>
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-2">暂无关联会员资产</p>
            {ctx.contract &&
            (ctx.contract.status === 'signed' || ctx.contract.status === 'effective') &&
            mallOrderAppearsSettledForPaymentCheck(ctx.order) && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                订单与合同已完成，但暂无会员资产发放记录。
              </p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {ctx.orderAssets.map(asset => (
              <div key={asset.id} className="rounded-lg border border-gray-100 p-3 bg-gray-50/50 space-y-0">
                <Row label="是否已发放" value={asset.status === 'effective' ? '是' : '已登记（未生效）'} />
                <Row label="资产名称" value={asset.name} />
                <Row label="资产状态" value={labelMallMemberAssetStatusZh(asset.status)} />
                <Row label="初始权益" value={formatMallAssetInitialSummary(asset)} />
                <Row label="剩余权益" value={formatMallAssetEquitySummary(asset)} />
                <Row label="有效期" value={`${formatMallDateTimeDisplay(asset.effectiveDate)} ～ ${formatMallDateTimeDisplay(asset.expiryDate)}`} />
                <Row
                  label="来源订单"
                  value={asset.sourceOrderId === ctx.order.id ? '与本订单一致' : '暂未记录'}
                />
                <Row
                  label="关联合同"
                  value={
                    asset.contractId
                      ? contracts.find(c => c.id === asset.contractId)?.title?.trim() || '暂未记录'
                      : '暂未记录'
                  }
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="4. 退款记录">
        {ctx.orderRefunds.length === 0 ? (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">暂无退款记录</p>
        ) : (
          <div className="space-y-2">
            {ctx.orderRefunds.map(r => (
              <div key={r.id} className="rounded-lg border border-gray-100 px-3 bg-gray-50/50">
                <Row label="退款状态" value={labelMallRefundStatusZh(r.status)} />
                <Row label="退款金额" value={formatMallMoneyYuan(r.amount)} />
                <Row label="退款时间" value={formatMallDateTimeDisplay(r.completedAt ?? r.approvedAt ?? r.requestedAt)} />
                <Row label="退款原因" value={r.reason?.trim() || '暂未记录'} />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="5. 风险与待处理">
        <ul className="text-xs text-gray-800 space-y-2 list-disc pl-4">
          {ctx.risks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="6. 操作记录">
        <p className="text-xs text-gray-600 leading-relaxed">
          当前仅展示订单关键节点。正式版本需接入操作日志，记录创建订单、生成合同、支付确认、资产发放、退款与修改记录。
        </p>
      </Section>
    </div>
  );

  const header = ctx ? (
    <div className="border-b border-gray-100 bg-white px-5 py-4 shrink-0">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono text-gray-400 truncate">{ctx.order.id}</div>
          <h2 className="text-base font-black text-gray-900 truncate mt-1">{ctx.primaryName}</h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
              订单：{labelMallOrderStatusZh(ctx.order.status)}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800">
              支付：{summarizeMallHeaderPaymentStateZh(ctx.order, payments)}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-800">
              合同：{summarizeMallHeaderContractStateZh(ctx.contract)}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-800">
              资产：{summarizeMallHeaderAssetStateZh(ctx.order, memberAssets)}
            </span>
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
      <span className="text-sm font-bold text-gray-700">订单详情</span>
      <button type="button" onClick={onClose} className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold" aria-label="关闭">
        ×
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
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

export default MallOrderDetailDrawer;
