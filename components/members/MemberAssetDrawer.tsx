import React from 'react';
import type { MemberAssetRecord, MemberRecord } from './memberOperationViewModel';

interface MemberAssetDrawerProps {
  open: boolean;
  asset: MemberAssetRecord | null;
  member: MemberRecord | null;
  onClose: () => void;
}

const sectionTitle = 'text-xs font-semibold text-[#565D56] mb-2';

const MemberAssetDrawer: React.FC<MemberAssetDrawerProps> = ({ open, asset, member, onClose }) => {
  if (!open || !asset || !member) return null;

  return (
    <>
      <button type="button" aria-label="关闭" className="fixed inset-0 z-[80] bg-[#222622]/18" onClick={onClose} />
      <aside
        className="met-member-drawer fixed right-0 top-0 z-[90] flex h-full w-full max-w-[700px] flex-col border-l border-[#DDDFD8] bg-[#FCFCFA] shadow-[-8px_0_32px_rgba(34,38,34,0.08)]"
        role="dialog"
        aria-modal
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E1E3DD] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] text-[#8A908A]">资产编号 {asset.assetCode}</p>
            <h2 className="mt-1 text-lg font-semibold text-[#222622]">{asset.name}</h2>
            <p className="mt-1 text-xs text-[#8A908A]">
              {member.name} · {member.phone}
            </p>
          </div>
          <button type="button" onClick={onClose} className="met-member-drawer__close">
            ×
          </button>
        </header>
        <div className="custom-scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 text-xs">
          <section>
            <h3 className={sectionTitle}>资产概览</h3>
            <dl className="grid grid-cols-2 gap-2 text-[#565D56]">
              <div>
                <dt className="text-[#8A908A]">剩余权益</dt>
                <dd className="font-medium text-[#222622]">{asset.remaining}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">总权益</dt>
                <dd>{asset.total}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">有效期</dt>
                <dd>{asset.validUntil}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">适用门店</dt>
                <dd>{asset.store}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">资产状态</dt>
                <dd>{asset.status}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">类别</dt>
                <dd>{asset.category}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3 className={sectionTitle}>来源订单</h3>
            <p className="text-[#565D56]">{asset.sourceOrder}</p>
            <p className="mt-1 text-[10px] text-[#8A908A]">合同状态：{asset.contractStatus}</p>
          </section>
          <section>
            <h3 className={sectionTitle}>关联合同</h3>
            <p className="rounded-lg border border-[#E1E3DD] bg-[#F7F8F5] p-3 text-[#70776F]">
              合同详情需权限查看。本页仅展示签署与支付状态摘要。
            </p>
          </section>
          <section>
            <h3 className={sectionTitle}>权益规则</h3>
            <p className="text-[#565D56]">{asset.rules ?? '适用团课/小班扣点规则以合同为准'}</p>
          </section>
          <section>
            <h3 className={sectionTitle}>使用记录</h3>
            <p className="text-[#565D56]">{asset.usageSummary ?? '近 30 天有使用记录'}</p>
          </section>
          <section>
            <h3 className={sectionTitle}>冻结 / 转卡 / 退款记录</h3>
            <p className="text-[#565D56]">{asset.freezeTransferRefund ?? '无异常记录'}</p>
            <p className="mt-2 text-[10px] text-[#8A908A]">
              冻结、转卡、退款需走审批流程，不在会员经营页直接操作。
            </p>
          </section>
          {asset.riskNote ? (
            <section>
              <h3 className={sectionTitle}>风险提示</h3>
              <p className="rounded-lg border border-[#E8DFD0] bg-[#FAF6F0] p-3 text-[#8A6A3A]">{asset.riskNote}</p>
            </section>
          ) : null}
          <section>
            <h3 className={sectionTitle}>操作日志</h3>
            <ul className="space-y-2 text-[#70776F]">
              <li>05-10 · 系统 · 资产生效</li>
              <li>05-12 · 管家 · 预约扣点 1 次</li>
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
};

export default MemberAssetDrawer;
