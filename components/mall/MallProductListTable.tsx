import React, { useMemo } from 'react';
import {
  buildEvidenceChainLabels,
  deriveAssetPendingRows,
  deriveContractPendingRows,
  deriveSensitiveOpRows,
  filterMallProducts,
  MALL_WORKBENCH_SEGMENTS,
  productTypeBadgeClass,
  type MallContractRow,
  type MallListFilters,
  type MallOperationSnapshot,
  type MallOrderRow,
  type MallProductRow,
  type MallProductStatus,
  type MallProductType,
  type MallWorkbenchSegment,
} from './mallOperationViewModel';
import { formatMallCny } from './mallFormatters';
import { MallEvidenceChain } from './mallModalShared';

interface MallProductListTableProps {
  segment: MallWorkbenchSegment;
  onSegmentChange: (segment: MallWorkbenchSegment) => void;
  snapshot: MallOperationSnapshot;
  filters: MallListFilters;
  onFiltersChange: (next: MallListFilters) => void;
  highlightId?: string | null;
  onOpenProduct: (id: string) => void;
  onOpenOrder: (productId: string, orderId: string) => void;
  onOpenContract: (productId: string, contractId?: string) => void;
  onOpenAsset: (productId: string, assetId?: string) => void;
  onOpenRisk: (productId: string, riskId: string) => void;
  onMarkDone: (id: string) => void;
}

const Btn: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button type="button" className="met-mall-table-btn" onClick={onClick}>
    {children}
  </button>
);

const RiskChip: React.FC<{ text: string }> = ({ text }) => {
  if (!text || text === '—') return <span className="met-mall-table__muted">—</span>;
  const tone = text.includes('待') || text.includes('未') ? 'pending' : 'risk';
  return <span className={`met-mall-chip met-mall-chip--${tone}`}>{text}</span>;
};

const MallProductListTable: React.FC<MallProductListTableProps> = ({
  segment,
  onSegmentChange,
  snapshot,
  filters,
  onFiltersChange,
  highlightId,
  onOpenProduct,
  onOpenOrder,
  onOpenContract,
  onOpenAsset,
  onOpenRisk,
  onMarkDone,
}) => {
  const { products, orders, contracts } = snapshot;

  const filteredProducts = useMemo(
    () => filterMallProducts(products, orders, contracts, filters),
    [products, orders, contracts, filters],
  );

  const contractPending = useMemo(() => deriveContractPendingRows(snapshot), [snapshot]);
  const assetPending = useMemo(() => deriveAssetPendingRows(snapshot), [snapshot]);
  const sensitiveOps = useMemo(() => deriveSensitiveOpRows(snapshot), [snapshot]);

  const filteredOrders = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return orders.filter(o => {
      if (q) {
        const hay = `${o.orderNo}${o.memberName}${o.productName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.risk !== 'all') {
        const p = products.find(pr => pr.id === o.productId);
        if (p && p.orderRisk !== filters.risk) return false;
      }
      return true;
    });
  }, [orders, products, filters.query, filters.risk]);

  const set = (patch: Partial<MallListFilters>) => onFiltersChange({ ...filters, ...patch });

  const segmentHint: Record<MallWorkbenchSegment, string> = {
    products: '管理卖什么、规则是否完整、是否可售',
    orders: '核对谁买了、支付/合同/资产链路是否一致',
    contracts: '处理已支付未签、模板缺失、签署异常',
    assets: '核对支付与合同后是否生成会员资产',
    sensitive: '退款 / 转卡 / 冻结等敏感操作待审',
  };

  const footCount =
    segment === 'products'
      ? filteredProducts.length
      : segment === 'orders'
        ? filteredOrders.length
        : segment === 'contracts'
          ? contractPending.length
          : segment === 'assets'
            ? assetPending.length
            : sensitiveOps.length;

  const footLabel =
    segment === 'products'
      ? '个产品'
      : segment === 'orders'
        ? '笔订单'
        : segment === 'contracts'
          ? '条待签'
          : segment === 'assets'
            ? '条待生成'
            : '条待审';

  return (
    <section className="met-mall-list-card met-mall-workbench met-today-surface">
      <header className="met-mall-workbench__head">
        <div className="met-mall-workbench__title-row">
          <h2>产品与交易工作台</h2>
          <p>{segmentHint[segment]}</p>
        </div>
        <nav className="met-mall-segments" aria-label="工作台分段">
          {MALL_WORKBENCH_SEGMENTS.map(s => (
            <button
              key={s.id}
              type="button"
              className={segment === s.id ? 'is-active' : undefined}
              onClick={() => onSegmentChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="met-mall-list-card__search">
          <input
            type="search"
            placeholder={
              segment === 'products'
                ? '搜索产品名 / 合同模板'
                : '搜索订单号 / 会员名 / 合同编号 / 产品名'
            }
            value={filters.query}
            onChange={e => set({ query: e.target.value })}
          />
        </div>
        {segment === 'products' ? (
          <div className="met-mall-list-card__filters">
            <select value={filters.type} onChange={e => set({ type: e.target.value })}>
              <option value="all">全部类型</option>
              {(['卡项', '私教', '教培', '体验', '积分商品'] as MallProductType[]).map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={filters.status} onChange={e => set({ status: e.target.value })}>
              <option value="all">售卖状态</option>
              {(['在售', '停售', '草稿', '待补规则'] as MallProductStatus[]).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={filters.contract} onChange={e => set({ contract: e.target.value })}>
              <option value="all">合同绑定</option>
              <option value="已绑定">已绑定</option>
              <option value="未绑定">未绑定</option>
              <option value="模板待确认">模板待确认</option>
            </select>
          </div>
        ) : segment === 'orders' ? (
          <div className="met-mall-list-card__filters">
            <select value={filters.risk} onChange={e => set({ risk: e.target.value })}>
              <option value="all">全部风险</option>
              <option value="正常">正常</option>
              <option value="待签">待签</option>
              <option value="待退款">待退款</option>
              <option value="资产异常">资产异常</option>
            </select>
          </div>
        ) : null}
      </header>

      <div className="met-mall-list-card__table-wrap custom-scroll">
        {segment === 'products' && (
          <ProductsTable
            rows={filteredProducts}
            contracts={contracts}
            highlightId={highlightId}
            onOpenProduct={onOpenProduct}
            onOpenContract={onOpenContract}
            onOpenOrder={onOpenOrder}
            orders={orders}
          />
        )}
        {segment === 'orders' && (
          <OrdersTable
            rows={filteredOrders}
            onOpenOrder={onOpenOrder}
            onOpenContract={onOpenContract}
            onOpenAsset={onOpenAsset}
          />
        )}
        {segment === 'contracts' && (
          <ContractsTable
            rows={contractPending}
            onOpenContract={onOpenContract}
            onOpenOrder={onOpenOrder}
            onMarkDone={onMarkDone}
          />
        )}
        {segment === 'assets' && (
          <AssetsTable
            rows={assetPending}
            onOpenAsset={onOpenAsset}
            onOpenOrder={onOpenOrder}
            onOpenContract={onOpenContract}
          />
        )}
        {segment === 'sensitive' && (
          <SensitiveTable
            rows={sensitiveOps}
            onOpenRisk={onOpenRisk}
            onOpenOrder={onOpenOrder}
            onOpenAsset={onOpenAsset}
            onMarkDone={onMarkDone}
          />
        )}
        {footCount === 0 ? (
          <div className="met-mall-list-empty">
            <p className="met-mall-list-empty__title">当前分段暂无记录</p>
            <p className="met-mall-list-empty__desc">请切换其他分段或清空筛选（前端演示数据）。</p>
          </div>
        ) : null}
      </div>
      <footer className="met-mall-list-card__foot">
        共 {footCount} {footLabel}
      </footer>
    </section>
  );
};

const ProductsTable: React.FC<{
  rows: MallProductRow[];
  orders: MallOrderRow[];
  contracts: MallContractRow[];
  highlightId?: string | null;
  onOpenProduct: (id: string) => void;
  onOpenContract: (productId: string, contractId?: string) => void;
  onOpenOrder: (productId: string, orderId: string) => void;
}> = ({ rows, orders, contracts, highlightId, onOpenProduct, onOpenContract, onOpenOrder }) => {
  if (rows.length === 0) return null;
  return (
    <table className="met-mall-table met-mall-table--dense">
      <thead>
        <tr>
          <th>产品 / 类型</th>
          <th>售价与权益</th>
          <th>有效期 / 适用范围</th>
          <th>合同模板</th>
          <th>售卖状态</th>
          <th>配置完整度</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(p => {
          const contract = contracts.find(c => c.productId === p.id);
          const order = orders.find(o => o.productId === p.id);
          return (
            <tr key={p.id} className={highlightId === p.id ? 'is-selected' : undefined}>
              <td>
                <p className="met-mall-table__name">{p.name}</p>
                <span className={`met-mall-table__badge ${productTypeBadgeClass(p.type)}`}>{p.type}</span>
              </td>
              <td>
                <p className="met-mall-table__primary">{p.priceBenefit}</p>
              </td>
              <td>
                <p className="met-mall-table__primary">{p.validity}</p>
                <p className="met-mall-table__sub">
                  {p.stores} · {p.courses}
                </p>
              </td>
              <td>
                <p className="met-mall-table__primary">{p.contractTemplate}</p>
                <p className="met-mall-table__sub">{p.contractBind}</p>
              </td>
              <td>
                <span className="met-mall-chip met-mall-chip--neutral">{p.status}</span>
              </td>
              <td>
                <span
                  className={`met-mall-chip${p.configCompleteness.includes('完整') ? '' : ' met-mall-chip--pending'}`}
                >
                  {p.configCompleteness}
                </span>
              </td>
              <td className="met-mall-table__ops">
                <Btn onClick={e => { e.stopPropagation(); onOpenProduct(p.id); }}>查看产品</Btn>
                <Btn
                  onClick={e => {
                    e.stopPropagation();
                    onOpenContract(p.id, contract?.id);
                  }}
                >
                  查看合同模板
                </Btn>
                {order ? (
                  <Btn
                    onClick={e => {
                      e.stopPropagation();
                      onOpenOrder(p.id, order.id);
                    }}
                  >
                    查看关联订单
                  </Btn>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const OrdersTable: React.FC<{
  rows: MallOrderRow[];
  onOpenOrder: (productId: string, orderId: string) => void;
  onOpenContract: (productId: string, contractId?: string) => void;
  onOpenAsset: (productId: string, assetId?: string) => void;
}> = ({ rows, onOpenOrder, onOpenContract, onOpenAsset }) => {
  if (rows.length === 0) return null;
  return (
    <table className="met-mall-table met-mall-table--dense">
      <thead>
        <tr>
          <th>订单号</th>
          <th>会员</th>
          <th>产品</th>
          <th>实付金额</th>
          <th>支付状态</th>
          <th>合同状态</th>
          <th>资产状态</th>
          <th>链路</th>
          <th>风险</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(o => (
          <tr key={o.id}>
            <td>
              <p className="met-mall-table__name">{o.orderNo}</p>
            </td>
            <td>{o.memberName}</td>
            <td>{o.productName ?? '—'}</td>
            <td className="met-mall-col-amount">{formatMallCny(o.paidAmount ?? o.amount)}</td>
            <td>
              <span className="met-mall-chip met-mall-chip--neutral">{o.payStatus}</span>
            </td>
            <td>
              <span className="met-mall-chip met-mall-chip--pending">{o.contractStatus}</span>
            </td>
            <td>
              <span className="met-mall-chip met-mall-chip--neutral">{o.assetStatus}</span>
            </td>
            <td className="met-mall-table__chain-cell">
              <MallEvidenceChain steps={buildEvidenceChainLabels(o)} compact />
            </td>
            <td>
              <RiskChip text={o.riskNote && o.riskNote !== '—' ? o.riskNote : '—'} />
            </td>
            <td className="met-mall-table__ops">
              <Btn onClick={e => { e.stopPropagation(); onOpenOrder(o.productId, o.id); }}>查看订单</Btn>
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenContract(o.productId, o.contractId);
                }}
              >
                查看合同
              </Btn>
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenAsset(o.productId, o.assetId);
                }}
              >
                查看资产
              </Btn>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ContractsTable: React.FC<{
  rows: ReturnType<typeof deriveContractPendingRows>;
  onOpenContract: (productId: string, contractId?: string) => void;
  onOpenOrder: (productId: string, orderId: string) => void;
  onMarkDone: (id: string) => void;
}> = ({ rows, onOpenContract, onOpenOrder, onMarkDone }) => {
  if (rows.length === 0) return null;
  return (
    <table className="met-mall-table met-mall-table--dense">
      <thead>
        <tr>
          <th>合同编号</th>
          <th>会员</th>
          <th>关联产品</th>
          <th>来源订单</th>
          <th>签署状态</th>
          <th>合同模板</th>
          <th>待处理原因</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>
              <p className="met-mall-table__name">{r.contractNo}</p>
            </td>
            <td>{r.memberName}</td>
            <td>{r.productName}</td>
            <td>{r.orderNo}</td>
            <td>
              <span className="met-mall-chip met-mall-chip--pending">{r.signStatus}</span>
            </td>
            <td>{r.templateName}</td>
            <td>
              <RiskChip text={r.pendingReason} />
            </td>
            <td className="met-mall-table__ops">
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenContract(r.productId, r.contractId);
                }}
              >
                查看合同
              </Btn>
              {r.orderId ? (
                <Btn
                  onClick={e => {
                    e.stopPropagation();
                    onOpenOrder(r.productId, r.orderId);
                  }}
                >
                  查看订单
                </Btn>
              ) : null}
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onMarkDone(r.id);
                }}
              >
                标记处理
              </Btn>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const AssetsTable: React.FC<{
  rows: ReturnType<typeof deriveAssetPendingRows>;
  onOpenAsset: (productId: string, assetId?: string) => void;
  onOpenOrder: (productId: string, orderId: string) => void;
  onOpenContract: (productId: string, contractId?: string) => void;
}> = ({ rows, onOpenAsset, onOpenOrder, onOpenContract }) => {
  if (rows.length === 0) return null;
  return (
    <table className="met-mall-table met-mall-table--dense">
      <thead>
        <tr>
          <th>资产状态</th>
          <th>会员</th>
          <th>产品</th>
          <th>来源订单</th>
          <th>合同状态</th>
          <th>剩余权益</th>
          <th>生成异常原因</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>
              <span className="met-mall-chip met-mall-chip--pending">{r.assetStatus}</span>
            </td>
            <td>{r.memberName}</td>
            <td>{r.productName}</td>
            <td>{r.orderNo}</td>
            <td>{r.contractStatus}</td>
            <td>{r.remaining}</td>
            <td>
              <RiskChip text={r.pendingReason} />
            </td>
            <td className="met-mall-table__ops">
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenAsset(r.productId, r.assetId);
                }}
              >
                查看资产
              </Btn>
              {r.orderId ? (
                <Btn
                  onClick={e => {
                    e.stopPropagation();
                    onOpenOrder(r.productId, r.orderId);
                  }}
                >
                  查看订单
                </Btn>
              ) : null}
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenContract(r.productId, r.contractId);
                }}
              >
                查看合同
              </Btn>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SensitiveTable: React.FC<{
  rows: ReturnType<typeof deriveSensitiveOpRows>;
  onOpenRisk: (productId: string, riskId: string) => void;
  onOpenOrder: (productId: string, orderId: string) => void;
  onOpenAsset: (productId: string, assetId?: string) => void;
  onMarkDone: (id: string) => void;
}> = ({ rows, onOpenRisk, onOpenOrder, onOpenAsset, onMarkDone }) => {
  if (rows.length === 0) return null;
  return (
    <table className="met-mall-table met-mall-table--dense">
      <thead>
        <tr>
          <th>类型</th>
          <th>会员</th>
          <th>产品</th>
          <th>关联订单</th>
          <th>关联资产</th>
          <th>当前状态</th>
          <th>风险原因</th>
          <th>负责人</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>
              <span className="met-mall-chip met-mall-chip--risk">{r.kind}</span>
            </td>
            <td>{r.memberName}</td>
            <td>{r.productName}</td>
            <td>{r.orderNo}</td>
            <td>{r.assetName}</td>
            <td>{r.status}</td>
            <td>
              <RiskChip text={r.riskReason} />
            </td>
            <td>{r.owner}</td>
            <td className="met-mall-table__ops">
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenRisk(r.productId, r.riskId);
                }}
              >
                查看风险
              </Btn>
              {r.orderId ? (
                <Btn
                  onClick={e => {
                    e.stopPropagation();
                    onOpenOrder(r.productId, r.orderId);
                  }}
                >
                  查看订单
                </Btn>
              ) : null}
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onOpenAsset(r.productId, r.assetId);
                }}
              >
                查看资产
              </Btn>
              <Btn
                onClick={e => {
                  e.stopPropagation();
                  onMarkDone(r.id);
                }}
              >
                标记处理
              </Btn>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MallProductListTable;
