import React from 'react';
import type { MemberAssetRecord, MemberRecord } from './memberOperationViewModel';

export const isMeaningfulText = (value?: string | null): boolean => {
  const t = (value ?? '').trim();
  return Boolean(t && t !== '—' && t !== '--' && t !== '-' && t !== '暂无' && t !== '无');
};

/** 标准人民币展示：¥6,360 */
export const formatCny = (amount: number): string =>
  `¥${Math.round(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const MemberModalCard: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, children, className = '', action }) => (
  <section className={`met-member-info-card ${className}`}>
    {title || action ? (
      <div className="met-member-info-card__head">
        {title ? <h4 className="met-member-info-card__title">{title}</h4> : <span />}
        {action}
      </div>
    ) : null}
    {subtitle ? <p className="met-member-info-card__subtitle">{subtitle}</p> : null}
    <div className="met-member-info-card__body">{children}</div>
  </section>
);

export const MemberModalPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <section className={`met-member-info-card met-member-info-card--panel ${className}`}>
    <div className="met-member-info-card__body">{children}</div>
  </section>
);

export const MemberModalBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="met-member-detail-block">
    <h3 className="met-member-detail-block__title">{title}</h3>
    {children}
  </div>
);

export const MemberModalDl: React.FC<{
  rows: { label: string; value: React.ReactNode; emphasis?: boolean }[];
}> = ({ rows }) => (
  <div className="met-member-field-grid met-member-field-grid--compact">
    {rows.map(r => (
      <div
        key={r.label}
        className={`met-member-field-item${r.emphasis ? ' met-member-field-item--emphasis' : ''}`}
      >
        <span className="met-member-field-item__label">{r.label}</span>
        <span className="met-member-field-item__value">{r.value}</span>
      </div>
    ))}
  </div>
);

export const MemberModalGrid2: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`met-member-modal-grid-2 ${className}`}>{children}</div>;

export const MemberModalMiniStat: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
}> = ({ label, value, sub }) => (
  <div className="met-member-mini-stat">
    <span className="met-member-mini-stat__label">{label}</span>
    <span className="met-member-mini-stat__value">{value}</span>
    {sub ? <span className="met-member-mini-stat__sub">{sub}</span> : null}
  </div>
);

export const MemberModalMiniStatRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="met-member-mini-stat-row">{children}</div>
);

export const MemberModalMeteachTile: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="met-member-meteach-tile">
    <p className="met-member-meteach-tile__title">{title}</p>
    <p className="met-member-meteach-tile__body">{body}</p>
  </div>
);

export const MemberModalStatusRow: React.FC<{ items: { label: string; value: string }[] }> = ({
  items,
}) => (
  <ul className="met-member-status-row">
    {items.map(item => (
      <li key={item.label} className="met-member-status-row__item">
        <span className="met-member-status-row__label">{item.label}</span>
        <span className="met-member-status-row__value">{item.value}</span>
      </li>
    ))}
  </ul>
);

export const MemberModalServiceList: React.FC<{ items: { label: string; value: string }[] }> = ({
  items,
}) => (
  <ul className="met-member-service-list met-member-service-list--compact">
    {items.map(item => (
      <li key={item.label}>
        <span className="met-member-service-list__label">{item.label}</span>
        <span className="met-member-service-list__value">{item.value}</span>
      </li>
    ))}
  </ul>
);

interface MemberAssetDetailSubviewProps {
  asset: MemberAssetRecord;
  member: MemberRecord;
  onBack: () => void;
}

export const MemberAssetDetailSubview: React.FC<MemberAssetDetailSubviewProps> = ({
  asset,
  member,
  onBack,
}) => (
  <div className="met-member-asset-detail-subview">
    <button type="button" className="met-member-asset-detail-subview__back" onClick={onBack}>
      ← 返回资产权益
    </button>
    <header className="met-member-asset-detail-subview__head">
      <h3 className="met-member-asset-detail-subview__name">{asset.name}</h3>
      <p className="met-member-asset-detail-subview__code">资产编号 {asset.assetCode}</p>
    </header>
    <MemberModalPanel>
      <MemberModalDl
        rows={[
          { label: '会员', value: `${member.name} · ${member.memberCode}` },
          { label: '剩余权益', value: asset.remaining, emphasis: true },
          { label: '总权益', value: asset.total },
          { label: '有效期', value: asset.validUntil },
          { label: '资产状态', value: asset.status },
          { label: '适用门店', value: asset.store },
          { label: '类别', value: asset.category },
        ]}
      />
    </MemberModalPanel>
    <MemberModalPanel>
      <p className="met-member-asset-detail-subview__section-label">来源与合同</p>
      <MemberModalDl
        rows={[
          { label: '来源订单', value: asset.sourceOrder },
          { label: '合同状态', value: asset.contractStatus },
          { label: '支付摘要', value: '已支付' },
        ]}
      />
    </MemberModalPanel>
    <MemberModalPanel>
      <p className="met-member-asset-detail-subview__section-label">权益规则</p>
      <p className="met-member-info-card__text">{asset.rules ?? '适用团课/小班扣点规则以合同为准'}</p>
    </MemberModalPanel>
    <MemberModalPanel>
      <p className="met-member-asset-detail-subview__section-label">使用记录摘要</p>
      <p className="met-member-info-card__text">{asset.usageSummary ?? '近 30 天有使用记录'}</p>
    </MemberModalPanel>
    <MemberModalPanel>
      <p className="met-member-asset-detail-subview__section-label">冻结 / 转卡 / 退款记录</p>
      <p className="met-member-info-card__text">{asset.freezeTransferRefund ?? '无异常记录'}</p>
    </MemberModalPanel>
    <MemberModalPanel>
      <p className="met-member-asset-detail-subview__section-label">操作日志摘要</p>
      <ul className="met-member-bullet-list">
        <li>05-10 · 系统 · 资产生效</li>
        <li>05-12 · 管家 · 预约扣点 1 次</li>
      </ul>
    </MemberModalPanel>
    {asset.riskNote ? (
      <MemberModalPanel className="met-member-info-card--hint">
        <p className="met-member-asset-detail-subview__section-label">风险提示</p>
        <p className="met-member-info-card__text">{asset.riskNote}</p>
      </MemberModalPanel>
    ) : null}
    <p className="met-member-asset-detail-subview__readonly">
      本页只读，敏感操作需走审批流程；不支持直接改余额、延期、冻结、退款或转卡。
    </p>
  </div>
);
