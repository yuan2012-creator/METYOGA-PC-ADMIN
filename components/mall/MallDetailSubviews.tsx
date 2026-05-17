import React, { useMemo, useState } from 'react';
import type { MallDetailTabId } from './MallDetailTabs';
import type { MallDetailSubview } from './mallDetailNavigation';
import { formatMallCny, lookupAssetName, lookupContractNo, lookupOrderNo } from './mallFormatters';
import { mallDemoToast } from './mallDemoToast';
import {
  findMallAsset,
  findMallContract,
  findMallOrder,
  findMallRisk,
  getProductOrders,
  resolveOrderContext,
  type MallOperationSnapshot,
  type MallProductRow,
} from './mallOperationViewModel';
import {
  MallModalBlock,
  MallModalDl,
  MallModalPanel,
  MallStatCards,
  MallSubviewActions,
  MallSubviewBack,
} from './mallModalShared';

const ALL_ORDERS_PAGE = 20;

export type MallDetailNavigate = {
  tabLabel: string;
  back: () => void;
  openSubview: (sub: MallDetailSubview, tab?: MallDetailTabId) => void;
  onToast: (message: string) => void;
};

const uniqueFilterValues = (values: string[]) =>
  ['全部', ...Array.from(new Set(values.filter(Boolean)))].filter((v, i, a) => a.indexOf(v) === i);

type OrderDetailProps = {
  snapshot: MallOperationSnapshot;
  orderId?: string;
  product: MallProductRow;
  nav: MallDetailNavigate;
};

export const MallOrderDetailSubview: React.FC<OrderDetailProps> = ({
  snapshot,
  orderId,
  product,
  nav,
}) => {
  const order =
    findMallOrder(snapshot, orderId) ??
    snapshot.orders.find(o => o.productId === product.id) ??
    null;
  if (!order) {
    return <p className="met-mall-empty">未找到订单记录（演示数据）</p>;
  }
  const ctx = resolveOrderContext(snapshot, order);
  const unsigned = order.contractStatus.includes('待签');
  const assetPending = order.assetStatus.includes('待生成') || !ctx.asset?.generated;

  return (
    <div className="met-mall-subview">
      <MallSubviewBack label={nav.tabLabel} onBack={nav.back} />
      <MallStatCards
        items={[
          { label: '订单状态', value: order.orderStatus ?? '—' },
          { label: '支付状态', value: order.payStatus },
          { label: '合同状态', value: order.contractStatus },
          { label: '资产状态', value: order.assetStatus },
        ]}
      />
      <p className="met-mall-subview__title">{order.orderNo}</p>

      <MallModalBlock title="A. 订单概览">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '会员', value: order.memberName },
              { label: '产品', value: order.productName ?? product.name },
              { label: '下单时间', value: order.orderTime ?? '—' },
              { label: '订单金额', value: formatMallCny(order.amount) },
              { label: '实付金额', value: formatMallCny(order.paidAmount ?? order.amount) },
              { label: '支付方式', value: order.payMethod ?? '—' },
              { label: '支付时间', value: order.payTime ?? '—' },
              { label: '来源渠道', value: order.channel ?? '—' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="B. 合同关联">
        <MallModalPanel>
          {unsigned ? (
            <p className="met-mall-risk-hint">合同未签：需先完成补签，方可生成会员资产记录（待接入真实服务）。</p>
          ) : null}
          <MallModalDl
            rows={[
              { label: '合同编号', value: ctx.contract?.contractNo ?? '—' },
              { label: '合同模板', value: ctx.contract?.templateName ?? product.contractTemplate },
              { label: '签署状态', value: ctx.contract?.signStatus ?? order.contractStatus },
              { label: '签署时间', value: ctx.contract?.signedAt ?? '—' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="C. 资产生成">
        <MallModalPanel>
          {assetPending ? (
            <p className="met-mall-risk-hint">需先核对支付与合同状态，当前为前端演示，未生成真实资产记录。</p>
          ) : null}
          <MallModalDl
            rows={[
              { label: '是否已生成资产', value: ctx.asset?.generated ? '是' : '否' },
              { label: '资产名称', value: ctx.asset?.assetName ?? '—' },
              { label: '生成时间', value: order.assetGeneratedAt ?? ctx.asset?.generatedAt ?? '—' },
              {
                label: '未生成原因',
                value: ctx.asset?.generated
                  ? '—'
                  : ctx.asset?.pendingReason ?? product.pendingAssetReason ?? '待核对',
              },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="D. 风险与待处理">
        <MallModalPanel>
          <MallModalDl
            rows={[
              {
                label: '风险标签',
                value: order.orderRisk && order.orderRisk !== '正常' ? order.orderRisk : '—',
              },
              { label: '风险原因', value: order.riskNote && order.riskNote !== '—' ? order.riskNote : '—' },
              { label: '建议动作', value: order.suggestedAction ?? ctx.risk?.riskNote ?? '—' },
              { label: '负责人', value: order.owner ?? ctx.risk?.owner ?? '—' },
              { label: '截止时间', value: order.dueLabel ?? ctx.risk?.dueLabel ?? '—' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallSubviewActions>
        <button type="button" className="met-member-btn-sm" onClick={nav.back}>
          返回订单与支付
        </button>
        {ctx.contract ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'contractDetail', id: ctx.contract!.id }, 'contract')}
          >
            查看合同
          </button>
        ) : null}
        {ctx.asset ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'assetDetail', id: ctx.asset!.id }, 'asset')}
          >
            查看资产
          </button>
        ) : null}
        <button
          type="button"
          className="met-member-btn-sm"
          onClick={() => nav.onToast(mallDemoToast.refundApply)}
        >
          发起退款申请（待接入）
        </button>
      </MallSubviewActions>
    </div>
  );
};

type AllOrdersProps = {
  snapshot: MallOperationSnapshot;
  product: MallProductRow;
  nav: MallDetailNavigate;
};

export const MallAllOrdersSubview: React.FC<AllOrdersProps> = ({ snapshot, product, nav }) => {
  const allOrders = useMemo(
    () => getProductOrders(snapshot.orders, product.id, 28),
    [snapshot.orders, product.id],
  );
  const [orderStatus, setOrderStatus] = useState('全部');
  const [payStatus, setPayStatus] = useState('全部');
  const [contractStatus, setContractStatus] = useState('全部');
  const [assetStatus, setAssetStatus] = useState('全部');
  const [riskFilter, setRiskFilter] = useState('全部');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allOrders.filter(o => {
      if (orderStatus !== '全部' && (o.orderStatus ?? '') !== orderStatus) return false;
      if (payStatus !== '全部' && o.payStatus !== payStatus) return false;
      if (contractStatus !== '全部' && o.contractStatus !== contractStatus) return false;
      if (assetStatus !== '全部' && o.assetStatus !== assetStatus) return false;
      if (riskFilter === '有风险' && (!o.riskNote || o.riskNote === '—')) return false;
      if (riskFilter === '正常' && o.riskNote && o.riskNote !== '—') return false;
      return true;
    });
  }, [allOrders, orderStatus, payStatus, contractStatus, assetStatus, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ALL_ORDERS_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * ALL_ORDERS_PAGE,
    currentPage * ALL_ORDERS_PAGE,
  );

  const orderStatusOpts = uniqueFilterValues(allOrders.map(o => o.orderStatus ?? '已完成'));
  const payOpts = uniqueFilterValues(allOrders.map(o => o.payStatus));
  const contractOpts = uniqueFilterValues(allOrders.map(o => o.contractStatus));
  const assetOpts = uniqueFilterValues(allOrders.map(o => o.assetStatus));

  return (
    <div className="met-mall-subview met-mall-subview--all-orders">
      <MallSubviewBack label={nav.tabLabel} onBack={nav.back} />
      <div className="met-mall-subview__filters">
        <label className="met-mall-subview__filter">
          订单状态
          <select value={orderStatus} onChange={e => { setOrderStatus(e.target.value); setPage(1); }}>
            {orderStatusOpts.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="met-mall-subview__filter">
          支付状态
          <select value={payStatus} onChange={e => { setPayStatus(e.target.value); setPage(1); }}>
            {payOpts.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="met-mall-subview__filter">
          合同状态
          <select value={contractStatus} onChange={e => { setContractStatus(e.target.value); setPage(1); }}>
            {contractOpts.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="met-mall-subview__filter">
          资产状态
          <select value={assetStatus} onChange={e => { setAssetStatus(e.target.value); setPage(1); }}>
            {assetOpts.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="met-mall-subview__filter">
          风险
          <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}>
            <option value="全部">全部</option>
            <option value="有风险">有风险</option>
            <option value="正常">正常</option>
          </select>
        </label>
      </div>

      <ul className="met-mall-subview-order-list">
        {pageRows.map(o => (
          <li key={o.id} className="met-mall-subview-order-list__item">
            <div className="met-mall-subview-order-list__main">
              <p className="met-mall-subview-order-list__line1">
                <span>{o.orderNo}</span>
                <span>{o.memberName}</span>
                <span>{formatMallCny(o.amount)}</span>
                <span>{o.orderStatus ?? o.payStatus}</span>
              </p>
              <p className="met-mall-subview-order-list__line2">
                <span>{o.productName ?? product.name}</span>
                <span>合同 {o.contractStatus}</span>
                <span>资产 {o.assetStatus}</span>
                <span>{o.riskNote && o.riskNote !== '—' ? o.riskNote : '—'}</span>
              </p>
            </div>
            <button
              type="button"
              className="met-member-btn-sm"
              onClick={() => nav.openSubview({ type: 'orderDetail', id: o.id }, 'orders')}
            >
              查看订单
            </button>
          </li>
        ))}
      </ul>

      <p className="met-mall-subview__pager">
        共 {filtered.length} 条 · 第 {currentPage} / {totalPages} 页
      </p>
      <div className="met-mall-subview__pager-btns">
        <button
          type="button"
          className="met-member-btn-sm"
          disabled={currentPage <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          上一页
        </button>
        <button
          type="button"
          className="met-member-btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

type ContractDetailProps = {
  snapshot: MallOperationSnapshot;
  contractId?: string;
  product: MallProductRow;
  nav: MallDetailNavigate;
};

export const MallContractDetailSubview: React.FC<ContractDetailProps> = ({
  snapshot,
  contractId,
  product,
  nav,
}) => {
  const contract =
    findMallContract(snapshot, contractId) ??
    snapshot.contracts.find(c => c.productId === product.id);
  if (!contract) return <p className="met-mall-empty">未找到合同记录（演示数据）</p>;
  const order = contract.orderId
    ? findMallOrder(snapshot, contract.orderId)
    : snapshot.orders.find(o => o.productId === product.id);
  const asset = snapshot.assets.find(a => a.productId === product.id);

  return (
    <div className="met-mall-subview">
      <MallSubviewBack label={nav.tabLabel} onBack={nav.back} />
      <MallModalBlock title="A. 合同概览">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '合同编号', value: contract.contractNo },
              { label: '合同模板', value: contract.templateName },
              { label: '适用产品', value: contract.productName ?? product.name },
              { label: '会员', value: contract.memberName ?? '—' },
              { label: '签署状态', value: contract.signStatus },
              { label: '签署时间', value: contract.signedAt ?? '—' },
              { label: '合同状态', value: contract.contractStatus },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="B. 关键条款">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '有效期', value: product.validity },
              { label: '冻结规则', value: contract.freezeRule ?? '见模板' },
              { label: '转卡规则', value: contract.transferRule ?? '见模板' },
              { label: '退款规则', value: contract.refundRule ?? product.clauseSummary },
              { label: '适用门店', value: contract.stores ?? product.stores },
              { label: '适用课程', value: contract.courses ?? product.courses },
              { label: '违约 / 争议处理', value: contract.disputeSummary ?? '—' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="C. 订单与支付关联">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '订单号', value: order?.orderNo ?? '—' },
              { label: '支付状态', value: order?.payStatus ?? '—' },
              { label: '实付金额', value: formatMallCny(order?.paidAmount ?? order?.amount) },
              { label: '支付时间', value: order?.payTime ?? '—' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="D. 风险提示">
        <MallModalPanel className="met-mall-info-card--hint">
          <ul className="met-mall-risk-list">
            {(contract.riskHints ?? []).map(h => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </MallModalPanel>
      </MallModalBlock>

      <MallSubviewActions>
        <button type="button" className="met-member-btn-sm" onClick={() => nav.onToast(mallDemoToast.resignContract)}>
          补签合同（待接入）
        </button>
        {order ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'orderDetail', id: order.id }, 'orders')}
          >
            查看订单
          </button>
        ) : null}
        {asset ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'assetDetail', id: asset.id }, 'asset')}
          >
            查看资产
          </button>
        ) : null}
      </MallSubviewActions>
    </div>
  );
};

type AssetDetailProps = {
  snapshot: MallOperationSnapshot;
  assetId?: string;
  product: MallProductRow;
  nav: MallDetailNavigate;
};

export const MallAssetDetailSubview: React.FC<AssetDetailProps> = ({
  snapshot,
  assetId,
  product,
  nav,
}) => {
  const asset =
    findMallAsset(snapshot, assetId) ?? snapshot.assets.find(a => a.productId === product.id);
  if (!asset) return <p className="met-mall-empty">未找到资产记录（演示数据）</p>;
  const order = asset.orderId
    ? findMallOrder(snapshot, asset.orderId)
    : snapshot.orders.find(o => o.orderNo === asset.sourceOrderNo);
  const contract = asset.contractId
    ? findMallContract(snapshot, asset.contractId)
    : snapshot.contracts.find(c => c.productId === product.id);
  const usage = asset.usageRecords ?? [];

  return (
    <div className="met-mall-subview">
      <MallSubviewBack label={nav.tabLabel} onBack={nav.back} />
      <MallModalBlock title="A. 资产概览">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '资产编号', value: asset.assetCode ?? '—' },
              { label: '资产名称', value: asset.assetName },
              { label: '会员', value: asset.memberName ?? '—' },
              { label: '来源产品', value: asset.productName ?? product.name },
              { label: '来源订单', value: asset.sourceOrderNo ?? order?.orderNo ?? '—' },
              { label: '总权益', value: asset.totalBenefit ?? product.benefit },
              { label: '剩余权益', value: asset.remaining },
              { label: '有效期', value: asset.validUntil },
              { label: '适用门店', value: asset.stores ?? product.stores },
              { label: '适用课程', value: asset.courses ?? product.courses },
              { label: '资产状态', value: asset.status },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="B. 权益规则">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '扣点 / 扣次', value: asset.deductRules ?? '—' },
              { label: '预约规则', value: asset.bookingRules ?? '—' },
              { label: '取消规则', value: asset.cancelRules ?? '—' },
              { label: '冻结规则', value: asset.freezeRule ?? '—' },
              { label: '转卡规则', value: asset.transferRule ?? '—' },
              { label: '退款规则', value: asset.refundRule ?? '—' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="C. 使用记录摘要">
        <MallModalPanel>
          {usage.length === 0 ? (
            <p className="met-mall-empty">暂无使用记录（演示）</p>
          ) : (
            <ul className="met-mall-usage-list">
              {usage.slice(0, 5).map((u, i) => (
                <li key={`${u.date}-${i}`} className="met-mall-usage-list__item">
                  <span>{u.date}</span>
                  <span>{u.course}</span>
                  <span>{u.deduct}</span>
                  <span>{u.status}</span>
                </li>
              ))}
            </ul>
          )}
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="D. 风险与操作限制">
        <MallModalPanel className="met-mall-info-card--hint">
          <MallModalDl
            rows={[
              { label: '是否冻结', value: asset.isFrozen ? '是' : '否' },
              { label: '是否退款中', value: asset.isRefunding ? '是' : '否' },
              { label: '是否转卡中', value: asset.isTransferring ? '是' : '否' },
              { label: '是否即将到期', value: asset.isExpiringSoon ? '是' : '否' },
              { label: '是否高余额低到课', value: asset.isLowUsage ? '是（需关注）' : '否' },
            ]}
          />
          <p className="met-mall-info-note">
            本页只读，不支持直接改余额、延期或作废；变更需后续接入会员经营服务。
          </p>
        </MallModalPanel>
      </MallModalBlock>

      <MallSubviewActions>
        <button type="button" className="met-member-btn-sm" onClick={nav.back}>
          返回会员资产
        </button>
        {order ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'orderDetail', id: order.id }, 'orders')}
          >
            查看订单
          </button>
        ) : null}
        {contract ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'contractDetail', id: contract.id }, 'contract')}
          >
            查看合同
          </button>
        ) : null}
        <button type="button" className="met-member-btn-sm" onClick={() => nav.onToast(mallDemoToast.freezeApply)}>
          冻结申请（待接入）
        </button>
        <button type="button" className="met-member-btn-sm" onClick={() => nav.onToast(mallDemoToast.transferApply)}>
          转卡申请（待接入）
        </button>
      </MallSubviewActions>
    </div>
  );
};

type RiskRecordProps = {
  snapshot: MallOperationSnapshot;
  riskId?: string;
  product: MallProductRow;
  nav: MallDetailNavigate;
};

export const MallRiskRecordSubview: React.FC<RiskRecordProps> = ({
  snapshot,
  riskId,
  product,
  nav,
}) => {
  const risk =
    findMallRisk(snapshot, riskId) ?? snapshot.risks.find(r => r.productId === product.id);
  if (!risk) return <p className="met-mall-empty">未找到风险记录（演示数据）</p>;

  return (
    <div className="met-mall-subview">
      <MallSubviewBack label={nav.tabLabel} onBack={nav.back} />
      <MallModalBlock title="A. 风险概览">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '风险类型', value: risk.kind },
              { label: '风险等级', value: risk.riskLevel ?? '中' },
              { label: '关联产品', value: risk.productName ?? product.name },
              { label: '关联订单', value: risk.relatedOrderNo ?? lookupOrderNo(snapshot.orders, risk.orderId) },
              {
                label: '关联合同',
                value: risk.relatedContractNo ?? lookupContractNo(snapshot.contracts, risk.contractId),
              },
              {
                label: '关联资产',
                value: risk.relatedAssetName ?? lookupAssetName(snapshot.assets, risk.assetId),
              },
              { label: '负责人', value: risk.owner ?? '—' },
              { label: '截止时间', value: risk.dueLabel ?? '—' },
              { label: '当前状态', value: risk.status ?? '待处理' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="B. 风险原因">
        <MallModalPanel>
          <MallModalDl
            rows={[
              { label: '为什么触发', value: risk.triggerReason ?? risk.summary },
              { label: '影响范围', value: risk.impactScope ?? risk.assetImpact },
              { label: '需要核对的数据', value: risk.checkData ?? '订单、合同、资产' },
            ]}
          />
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="C. 建议处理">
        <MallModalPanel>
          <ol className="met-mall-steps-list">
            {(risk.steps ?? []).map((s, i) => (
              <li key={s}>{`第 ${i + 1} 步：${s}`}</li>
            ))}
          </ol>
        </MallModalPanel>
      </MallModalBlock>

      <MallModalBlock title="D. 处理记录">
        <MallModalPanel>
          <ul className="met-mall-handle-log">
            {(risk.handleLogs ?? []).map(log => (
              <li key={`${log.at}-${log.content}`} className="met-mall-handle-log__item">
                <span>{log.at}</span>
                <span>{log.operator}</span>
                <span>{log.content}</span>
                <span>{log.result}</span>
              </li>
            ))}
          </ul>
        </MallModalPanel>
      </MallModalBlock>

      <MallSubviewActions>
        <button type="button" className="met-member-btn-sm" onClick={() => nav.onToast(mallDemoToast.markRiskDone)}>
          标记处理
        </button>
        {risk.orderId ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'orderDetail', id: risk.orderId }, 'orders')}
          >
            查看订单
          </button>
        ) : null}
        {risk.contractId ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'contractDetail', id: risk.contractId }, 'contract')}
          >
            查看合同
          </button>
        ) : null}
        {risk.assetId ? (
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => nav.openSubview({ type: 'assetDetail', id: risk.assetId }, 'asset')}
          >
            查看资产
          </button>
        ) : null}
      </MallSubviewActions>
    </div>
  );
};

export const renderMallDetailSubview = (
  subview: MallDetailSubview,
  snapshot: MallOperationSnapshot,
  product: MallProductRow,
  nav: MallDetailNavigate,
) => {
  switch (subview.type) {
    case 'orderDetail':
      return (
        <MallOrderDetailSubview
          snapshot={snapshot}
          orderId={subview.id}
          product={product}
          nav={nav}
        />
      );
    case 'allOrders':
      return <MallAllOrdersSubview snapshot={snapshot} product={product} nav={nav} />;
    case 'contractDetail':
      return (
        <MallContractDetailSubview
          snapshot={snapshot}
          contractId={subview.id}
          product={product}
          nav={nav}
        />
      );
    case 'assetDetail':
      return (
        <MallAssetDetailSubview snapshot={snapshot} assetId={subview.id} product={product} nav={nav} />
      );
    case 'riskRecord':
      return (
        <MallRiskRecordSubview snapshot={snapshot} riskId={subview.id} product={product} nav={nav} />
      );
    default:
      return null;
  }
};
