import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import { MemberModalBlock, MemberModalDl, MemberModalPanel } from './memberModalShared';

interface MemberAssetsTabProps {
  member: MemberRecord;
  onViewAssetDetail: (assetId: string) => void;
}

const MemberAssetsTab: React.FC<MemberAssetsTabProps> = ({ member: m, onViewAssetDetail }) => {
  const primary = m.assets[0];
  const riskItems = m.riskTags.filter(r =>
    ['快到期', '即将耗尽', '退款风险', '冻结', '转卡'].some(k => r.type.includes(k)),
  );

  return (
    <div className="met-member-tab-content met-member-tab-content--assets">
      {primary ? (
        <article className="met-member-asset-hero">
          <div className="met-member-asset-hero__main">
            <p className="met-member-asset-hero__name">{primary.name}</p>
            <p className="met-member-asset-hero__meta">
              剩余 {primary.remaining} / 总 {primary.total} · 到期 {primary.validUntil}
            </p>
            <p className="met-member-asset-hero__meta">
              {primary.status} · {primary.store}
            </p>
          </div>
          <button
            type="button"
            className="met-member-btn-sm met-ink-button"
            onClick={() => onViewAssetDetail(primary.id)}
          >
            查看资产详情
          </button>
        </article>
      ) : (
        <p className="met-member-empty">暂无持卡资产</p>
      )}

      {m.assets.length > 1 ? (
        <ul className="met-member-asset-list met-member-asset-list--secondary">
          {m.assets.slice(1).map(a => (
            <li key={a.id} className="met-member-asset-list__item">
              <div className="met-member-asset-list__main">
                <p className="met-member-asset-list__name">{a.name}</p>
                <p className="met-member-asset-list__meta">
                  {a.remaining} / {a.total} · {a.validUntil} · {a.status}
                </p>
              </div>
              <button
                type="button"
                className="met-member-btn-sm"
                onClick={() => onViewAssetDetail(a.id)}
              >
                查看资产详情
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {primary ? (
        <MemberModalBlock title="来源与合同">
          <MemberModalPanel>
            <MemberModalDl
              rows={[
                { label: '订单号', value: primary.sourceOrder },
                { label: '合同状态', value: primary.contractStatus },
                { label: '支付状态', value: '已支付' },
                { label: '资产生成状态', value: '已生成' },
              ]}
            />
          </MemberModalPanel>
        </MemberModalBlock>
      ) : null}

      <MemberModalBlock title="资产风险">
        <MemberModalPanel className="met-member-info-card--hint">
          {riskItems.length > 0 ? (
            <ul className="met-member-risk-list">
              {riskItems.map(r => (
                <li key={r.type}>
                  {r.type}：{r.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="met-member-empty">暂无异常记录</p>
          )}
          <p className="met-member-info-card__note">本页只读，不支持直接改余额、延期或审批操作</p>
        </MemberModalPanel>
      </MemberModalBlock>
    </div>
  );
};

export default MemberAssetsTab;
