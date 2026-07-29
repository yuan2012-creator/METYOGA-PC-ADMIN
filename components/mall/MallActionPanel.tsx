import React from 'react';
import type { MallActionItem } from './mallOperationViewModel';
import { MallEvidenceChain } from './mallModalShared';

interface MallActionPanelProps {
  contractItems: MallActionItem[];
  assetItems: MallActionItem[];
  riskItems: MallActionItem[];
  onViewOrder: (item: MallActionItem) => void;
  onViewContract: (item: MallActionItem) => void;
  onViewAsset: (item: MallActionItem) => void;
  onViewRisk: (item: MallActionItem) => void;
  onMarkDone: (id: string) => void;
}

const SUBGROUP_HINTS: Record<string, string> = {
  contract: '已支付但合同未签 · 合同模板缺失 · 合同签署状态异常',
  asset: '已支付+已签约资产未生成 · 生成失败 · 权益不一致',
  risk: '退款待核对 · 转卡待审批 · 冻结待审批',
};

const QueueBlock: React.FC<{
  title: string;
  hint: string;
  items: MallActionItem[];
  onViewOrder: (item: MallActionItem) => void;
  onViewContract: (item: MallActionItem) => void;
  onViewAsset: (item: MallActionItem) => void;
  onViewRisk: (item: MallActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ title, hint, items, onViewOrder, onViewContract, onViewAsset, onViewRisk, onMarkDone }) => {
  if (items.length === 0) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-mall-action-block">
      <h3 className="met-mall-action-block__title">{title}</h3>
      <p className="met-mall-action-block__hint">{hint}</p>
      {visible.map(item => (
        <article key={item.id} className="met-mall-action-item met-mall-action-item--evidence">
          <div className="met-mall-action-item__row1">
            <p className="met-mall-action-item__name">
              {item.memberName !== '—' ? item.memberName : item.productName}
              {item.memberName !== '—' ? (
                <span className="met-mall-action-item__product"> · {item.productName}</span>
              ) : null}
            </p>
            {item.subgroup ? (
              <span className="met-mall-action-item__tag">{item.subgroup}</span>
            ) : (
              <span className="met-mall-action-item__tag">{item.category}</span>
            )}
          </div>
          {item.evidenceChain && item.evidenceChain.length > 0 ? (
            <MallEvidenceChain steps={item.evidenceChain} compact />
          ) : null}
          <p className="met-mall-action-item__risk-line">
            {item.riskLine ?? item.reason}
          </p>
          <div className="met-mall-action-item__footer">
            <button type="button" className="met-member-btn-sm" onClick={() => onViewOrder(item)}>
              查看订单
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onViewContract(item)}>
              查看合同
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onViewAsset(item)}>
              查看资产
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onViewRisk(item)}>
              查看风险
            </button>
            <button type="button" className="met-member-btn-sm" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-mall-action-block__more">还有 {rest} 条待办</p> : null}
    </section>
  );
};

const MallActionPanel: React.FC<MallActionPanelProps> = ({
  contractItems,
  assetItems,
  riskItems,
  onViewOrder,
  onViewContract,
  onViewAsset,
  onViewRisk,
  onMarkDone,
}) => (
  <aside className="met-mall-action-panel met-today-surface">
    <header className="met-mall-action-panel__head">
      <h2>今日交易证据链待办</h2>
      <p>合同签署 · 资产生成 · 敏感操作待审（前端演示，未写入真实数据）</p>
    </header>
    <div className="met-mall-action-panel__scroll custom-scroll">
      <QueueBlock
        title="合同待签"
        hint={SUBGROUP_HINTS.contract}
        items={contractItems}
        onViewOrder={onViewOrder}
        onViewContract={onViewContract}
        onViewAsset={onViewAsset}
        onViewRisk={onViewRisk}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        title="资产待生成"
        hint={SUBGROUP_HINTS.asset}
        items={assetItems}
        onViewOrder={onViewOrder}
        onViewContract={onViewContract}
        onViewAsset={onViewAsset}
        onViewRisk={onViewRisk}
        onMarkDone={onMarkDone}
      />
      <QueueBlock
        title="敏感操作待审"
        hint={SUBGROUP_HINTS.risk}
        items={riskItems}
        onViewOrder={onViewOrder}
        onViewContract={onViewContract}
        onViewAsset={onViewAsset}
        onViewRisk={onViewRisk}
        onMarkDone={onMarkDone}
      />
    </div>
  </aside>
);

export default MallActionPanel;
