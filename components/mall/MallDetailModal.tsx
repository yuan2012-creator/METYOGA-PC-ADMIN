import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MallOperationSnapshot, MallProductRow } from './mallOperationViewModel';
import { getProductOrders, resolveMallModalHeader } from './mallOperationViewModel';
import { MallEvidenceChain } from './mallModalShared';
import { mallDemoToast } from './mallDemoToast';
import MallDetailTabs, { type MallDetailTabId } from './MallDetailTabs';
import type { MallDetailSubview, MallModalOpenIntent } from './mallDetailNavigation';
import { subviewBackTabLabel } from './mallDetailNavigation';
import { renderMallDetailSubview, type MallDetailNavigate } from './MallDetailSubviews';
import { MallModalDl, MallModalPanel } from './mallModalShared';

interface MallDetailModalProps {
  open: boolean;
  product: MallProductRow | null;
  snapshot: MallOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  openIntent?: MallModalOpenIntent | null;
  onConsumeIntent?: () => void;
}

const MallDetailModal: React.FC<MallDetailModalProps> = ({
  open,
  product,
  snapshot,
  onClose,
  onToast,
  openIntent,
  onConsumeIntent,
}) => {
  const [activeTab, setActiveTab] = useState<MallDetailTabId>('overview');
  const [detailSubview, setDetailSubview] = useState<MallDetailSubview | null>(null);
  const prevProductIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveTab('overview');
      setDetailSubview(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !openIntent) return;
    if (openIntent.tab) setActiveTab(openIntent.tab);
    setDetailSubview(openIntent.subview ?? null);
    onConsumeIntent?.();
  }, [open, openIntent, onConsumeIntent]);

  useEffect(() => {
    if (!open) {
      prevProductIdRef.current = null;
      return;
    }
    const pid = product?.id ?? null;
    if (prevProductIdRef.current && prevProductIdRef.current !== pid) {
      setActiveTab('overview');
      setDetailSubview(null);
    }
    prevProductIdRef.current = pid;
  }, [open, product?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (detailSubview) {
        setDetailSubview(null);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, detailSubview, onClose]);

  const openSubview = useCallback((sub: MallDetailSubview, tab?: MallDetailTabId) => {
    if (tab) setActiveTab(tab);
    setDetailSubview(sub);
  }, []);

  const backToTab = useCallback(() => setDetailSubview(null), []);

  const ordersPreview = useMemo(() => {
    if (!product) return [];
    return getProductOrders(snapshot.orders, product.id, 28).slice(0, 5);
  }, [product, snapshot.orders]);

  const allOrdersCount = useMemo(() => {
    if (!product) return 0;
    return getProductOrders(snapshot.orders, product.id, 28).length;
  }, [product, snapshot.orders]);

  const contract = useMemo(
    () => (product ? snapshot.contracts.find(c => c.productId === product.id) : undefined),
    [product, snapshot.contracts],
  );
  const asset = useMemo(
    () => (product ? snapshot.assets.find(a => a.productId === product.id) : undefined),
    [product, snapshot.assets],
  );
  const risks = useMemo(
    () => (product ? snapshot.risks.filter(r => r.productId === product.id) : []),
    [product, snapshot.risks],
  );
  const logs = useMemo(
    () => (product ? snapshot.logs.filter(l => l.productId === product.id) : []),
    [product, snapshot.logs],
  );
  const primaryRisk = risks[0];

  const modalHeader = useMemo(
    () => (product ? resolveMallModalHeader(snapshot, product, detailSubview) : null),
    [product, snapshot, detailSubview],
  );

  if (!open || !product) return null;

  const p = product;
  const nav: MallDetailNavigate = {
    tabLabel: subviewBackTabLabel(activeTab),
    back: backToTab,
    openSubview,
    onToast,
  };

  const handleLogLink = (linkType?: string, linkId?: string) => {
    if (!linkType || !linkId) return;
    if (linkType === 'order') openSubview({ type: 'orderDetail', id: linkId }, 'orders');
    if (linkType === 'contract') openSubview({ type: 'contractDetail', id: linkId }, 'contract');
    if (linkType === 'asset') openSubview({ type: 'assetDetail', id: linkId }, 'asset');
    if (linkType === 'risk') openSubview({ type: 'riskRecord', id: linkId }, 'risk');
  };

  return (
    <>
      <button type="button" aria-label="关闭" className="met-mall-modal-overlay" onClick={onClose} />
      <aside className="met-mall-detail-modal" role="dialog" aria-modal aria-labelledby="mall-modal-title">
        <header className="met-mall-detail-header met-mall-detail-header--evidence">
          <div className="met-mall-detail-header__row1">
            <div className="met-mall-detail-header__identity">
              <h2 id="mall-modal-title">{modalHeader?.title ?? p.name}</h2>
              <p className="met-mall-detail-header__sub">
                {modalHeader?.subtitle ?? '仅展示草稿 / 预览 · 待接入真实服务'}
              </p>
            </div>
            <button type="button" className="met-member-drawer__close" onClick={onClose} aria-label="关闭">
              ×
            </button>
          </div>
          {modalHeader?.chain ? (
            <div className="met-mall-detail-header__chain-wrap">
              <span className="met-mall-detail-header__chain-label">证据链</span>
              <MallEvidenceChain steps={modalHeader.chain} />
            </div>
          ) : null}
          {modalHeader?.riskHint ? (
            <p className="met-mall-detail-header__risk">
              <span className="met-mall-detail-header__dot" aria-hidden />
              <span>{modalHeader.riskHint}</span>
            </p>
          ) : (
            <p className="met-mall-detail-header__risk met-mall-detail-header__risk--muted">
              当前无额外风险提示 · 前端演示
            </p>
          )}
        </header>
        <MallDetailTabs active={activeTab} onChange={setActiveTab} />
        <div className="met-mall-detail-body custom-scroll">
          {detailSubview ? (
            <div className="met-mall-tab-content met-mall-tab-content--subview">
              {renderMallDetailSubview(detailSubview, snapshot, p, nav)}
            </div>
          ) : (
            <div className="met-mall-tab-content">
              {activeTab === 'overview' && (
                <>
                  <MallModalPanel>
                    <MallModalDl
                      rows={[
                        { label: '产品名称', value: p.name },
                        { label: '类型', value: p.type },
                        { label: '售价', value: p.price },
                        { label: '权益', value: p.benefit },
                        { label: '有效期', value: p.validity },
                        { label: '适用门店', value: p.stores },
                        { label: '适用课程', value: p.courses },
                        { label: '是否线上售卖', value: p.onlineSale },
                        { label: '当前状态', value: p.status },
                        { label: '配置完整度', value: p.configCompleteness },
                      ]}
                    />
                  </MallModalPanel>
                  <div className="met-mall-tab-actions">
                    <button
                      type="button"
                      className="met-member-btn-sm"
                      onClick={() => openSubview({ type: 'allOrders' }, 'orders')}
                    >
                      查看关联订单
                    </button>
                    {contract ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'contractDetail', id: contract.id }, 'contract')}
                      >
                        查看合同模板
                      </button>
                    ) : null}
                    {asset ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'assetDetail', id: asset.id }, 'asset')}
                      >
                        查看资产
                      </button>
                    ) : null}
                  </div>
                </>
              )}

              {activeTab === 'contract' && (
                <>
                  <MallModalPanel>
                    {(p.contractBind === '未绑定' || p.contractSignStatus.includes('待')) && (
                      <p className="met-mall-risk-hint">
                        {p.contractBind === '未绑定'
                          ? '未绑定合同模板，售卖前需完成绑定与条款确认。'
                          : '订单已支付但合同未签，建议先完成补签（待接入真实服务）。'}
                      </p>
                    )}
                    <MallModalDl
                      rows={[
                        { label: '合同模板', value: p.contractTemplate },
                        { label: '合同状态', value: contract?.contractStatus ?? p.contractBind },
                        { label: '签署状态', value: p.contractSignStatus },
                        { label: '合同编号', value: contract?.contractNo ?? '—' },
                        { label: '有效期', value: p.validity },
                        { label: '冻结', value: contract?.freezeRule ?? '见合同模板' },
                        { label: '转卡', value: contract?.transferRule ?? '需审批' },
                        { label: '退款', value: contract?.refundRule ?? '按模板' },
                        { label: '适用范围', value: `${p.stores} · ${p.courses}` },
                      ]}
                    />
                  </MallModalPanel>
                  <div className="met-mall-tab-actions">
                    {contract ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'contractDetail', id: contract.id }, 'contract')}
                      >
                        查看合同详情
                      </button>
                    ) : null}
                    {ordersPreview[0] ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() =>
                          openSubview({ type: 'orderDetail', id: ordersPreview[0].id }, 'orders')
                        }
                      >
                        查看订单
                      </button>
                    ) : null}
                  </div>
                </>
              )}

              {activeTab === 'orders' && (
                <>
                  {ordersPreview.length === 0 ? (
                    <p className="met-mall-empty">暂无关联订单</p>
                  ) : (
                    <ul className="met-mall-order-list">
                      {ordersPreview.map(o => (
                        <li key={o.id} className="met-mall-order-list__item">
                          <p className="met-mall-order-list__title">
                            {o.orderNo} · {o.memberName}
                          </p>
                          <p className="met-mall-order-list__sub">
                            {o.amount} · 支付 {o.payStatus} · 合同 {o.contractStatus} · 资产{' '}
                            {o.assetStatus}
                          </p>
                          {o.riskNote && o.riskNote !== '—' ? (
                            <p className="met-mall-order-list__risk">风险：{o.riskNote}</p>
                          ) : null}
                          <button
                            type="button"
                            className="met-member-btn-sm met-mall-order-list__btn"
                            onClick={() => openSubview({ type: 'orderDetail', id: o.id }, 'orders')}
                          >
                            查看订单
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {allOrdersCount > 5 ? (
                    <button
                      type="button"
                      className="met-mall-course-all-btn"
                      onClick={() => openSubview({ type: 'allOrders' }, 'orders')}
                    >
                      查看全部订单记录
                    </button>
                  ) : null}
                  <div className="met-mall-tab-actions">
                    {contract ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'contractDetail', id: contract.id }, 'contract')}
                      >
                        查看合同
                      </button>
                    ) : null}
                    {asset ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'assetDetail', id: asset.id }, 'asset')}
                      >
                        查看资产
                      </button>
                    ) : null}
                  </div>
                </>
              )}

              {activeTab === 'asset' && (
                <>
                  <MallModalPanel>
                    <MallModalDl
                      rows={[
                        { label: '是否已生成', value: asset?.generated ? '是' : '否' },
                        { label: '资产名称', value: asset?.assetName ?? '—' },
                        { label: '剩余点数/次数', value: asset?.remaining ?? '—' },
                        { label: '有效期', value: asset?.validUntil ?? '—' },
                        { label: '资产状态', value: asset?.status ?? p.assetGen },
                        {
                          label: '生成来源',
                          value: asset?.sourceOrderNo ? `订单 ${asset.sourceOrderNo}` : '—',
                        },
                        {
                          label: '未生成原因',
                          value: asset?.generated
                            ? '—'
                            : asset?.pendingReason ?? p.pendingAssetReason ?? '待核对',
                        },
                      ]}
                    />
                    {!asset?.generated ? (
                      <p className="met-mall-info-note">
                        本页仅预览资产记录，待生成资产需后续接入会员经营服务，当前为前端演示。
                      </p>
                    ) : null}
                  </MallModalPanel>
                  <div className="met-mall-tab-actions">
                    {asset ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'assetDetail', id: asset.id }, 'asset')}
                      >
                        查看资产详情
                      </button>
                    ) : null}
                    {ordersPreview[0] ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() =>
                          openSubview({ type: 'orderDetail', id: ordersPreview[0].id }, 'orders')
                        }
                      >
                        查看来源订单
                      </button>
                    ) : null}
                    {contract ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'contractDetail', id: contract.id }, 'contract')}
                      >
                        查看合同
                      </button>
                    ) : null}
                  </div>
                </>
              )}

              {activeTab === 'risk' && (
                <>
                  <MallModalPanel className="met-mall-info-card--hint">
                    <p className="met-mall-readonly-tag">只读展示 · 敏感操作需走审批流程</p>
                    <MallModalDl
                      rows={[
                        { label: '退款申请', value: primaryRisk?.refundStatus ?? '无' },
                        { label: '转卡记录', value: primaryRisk?.transferStatus ?? '无' },
                        { label: '冻结记录', value: primaryRisk?.freezeStatus ?? '无' },
                        { label: '对资产影响', value: primaryRisk?.assetImpact ?? '—' },
                        { label: '风险提示', value: primaryRisk?.riskNote ?? '当前无额外风险' },
                      ]}
                    />
                    {risks.length > 0 ? (
                      <ul className="met-mall-risk-list">
                        {risks.map(r => (
                          <li key={r.id}>
                            <button
                              type="button"
                              className="met-mall-link-btn"
                              onClick={() => openSubview({ type: 'riskRecord', id: r.id }, 'risk')}
                            >
                              {r.kind} · {r.memberName} — {r.summary}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </MallModalPanel>
                  <div className="met-mall-tab-actions">
                    {primaryRisk ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'riskRecord', id: primaryRisk.id }, 'risk')}
                      >
                        查看风险记录
                      </button>
                    ) : null}
                    {ordersPreview[0] ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() =>
                          openSubview({ type: 'orderDetail', id: ordersPreview[0].id }, 'orders')
                        }
                      >
                        查看订单
                      </button>
                    ) : null}
                    {asset ? (
                      <button
                        type="button"
                        className="met-member-btn-sm"
                        onClick={() => openSubview({ type: 'assetDetail', id: asset.id }, 'asset')}
                      >
                        查看资产
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="met-member-btn-sm"
                      onClick={() => onToast(mallDemoToast.applyPending)}
                    >
                      发起申请（待接入）
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'logs' && (
                <MallModalPanel>
                  {logs.length === 0 ? (
                    <p className="met-mall-empty">暂无操作记录</p>
                  ) : (
                    <ul className="met-mall-log-list">
                      {logs.map(l => (
                        <li key={l.id} className="met-mall-log-list__item">
                          <span className="met-mall-log-list__time">{l.at}</span>
                          <span className="met-mall-log-list__who">{l.operator}</span>
                          {l.linkType && l.linkId ? (
                            <button
                              type="button"
                              className="met-mall-link-btn met-mall-log-list__action"
                              onClick={() => handleLogLink(l.linkType, l.linkId)}
                            >
                              {l.action}
                            </button>
                          ) : (
                            <span className="met-mall-log-list__action">{l.action}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="met-mall-info-note">
                    涉及订单、合同、资产的操作均留痕，正式版本需接入操作日志服务。
                  </p>
                </MallModalPanel>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default MallDetailModal;
