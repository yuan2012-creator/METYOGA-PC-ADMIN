import React from 'react';
import { lifecycleBadgeClass, riskBadgeClass, type MemberRecord } from './memberOperationViewModel';
import MemberStageBadge from './MemberStageBadge';
import MemberPracticeProfile from './MemberPracticeProfile';
import MemberCourseRecords from './MemberCourseRecords';
import MemberPrivateTrainingRecords from './MemberPrivateTrainingRecords';
import MemberPointsLedger from './MemberPointsLedger';
import MemberConsumptionRecords from './MemberConsumptionRecords';
import MemberServiceTeam from './MemberServiceTeam';
import MemberTeacherViewPanel from './MemberTeacherViewPanel';

interface MemberDetailDrawerProps {
  open: boolean;
  member: MemberRecord | null;
  onClose: () => void;
  onOpenAsset: (assetId: string) => void;
  onAddFollowUp: () => void;
}

const sectionTitle = 'text-xs font-semibold text-[#565D56] mb-2';

const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  open,
  member,
  onClose,
  onOpenAsset,
  onAddFollowUp,
}) => {
  if (!open || !member) return null;

  const m = member;
  const att = m.attendanceSummary;

  return (
    <>
      <button type="button" aria-label="关闭" className="fixed inset-0 z-40 bg-[#222622]/18" onClick={onClose} />
      <aside
        className="met-member-drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-[700px] flex-col border-l border-[#DDDFD8] bg-[#FCFCFA] shadow-[-8px_0_32px_rgba(34,38,34,0.08)]"
        role="dialog"
        aria-modal
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E1E3DD] px-6 py-4">
          <div className="min-w-0">
            <p className="text-[11px] text-[#8A908A]">会员编号 {m.memberCode}</p>
            <h2 className="mt-1 text-lg font-semibold text-[#222622]">{m.name}</h2>
            <p className="mt-1 text-xs text-[#8A908A]">{m.phone}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MemberStageBadge code={m.stageCode} showName />
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${lifecycleBadgeClass(m.lifecycleStage)}`}
              >
                {m.lifecycleSubStatus}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="met-member-drawer__close">
            ×
          </button>
        </header>
        <div className="custom-scroll min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 text-xs">
          <section>
            <h3 className={sectionTitle}>阶段信息</h3>
            <dl className="space-y-1 text-[#565D56]">
              <div>
                <dt className="text-[#8A908A]">一级阶段</dt>
                <dd>
                  {m.stageCode} {m.stageName}
                </dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">阶段原因</dt>
                <dd>{m.stageReason}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">下一阶段目标</dt>
                <dd>{m.nextStageTarget}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className={sectionTitle}>会员概览</h3>
            <dl className="grid grid-cols-2 gap-2 text-[#565D56]">
              <div>
                <dt className="text-[#8A908A]">归属门店</dt>
                <dd>{m.store}</dd>
              </div>
              <div>
                <dt className="text-[#8A908A]">负责人</dt>
                <dd>{m.manager}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[#8A908A]">风险标签</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {m.riskTags.length === 0 ? (
                    <span className="text-[#9AA39A]">暂无</span>
                  ) : (
                    m.riskTags.map(r => (
                      <span
                        key={`${r.type}-${r.reason}`}
                        className={`rounded px-1.5 py-0.5 text-[9px] ${riskBadgeClass(r.type)}`}
                        title={r.reason}
                      >
                        {r.type}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className={sectionTitle}>系统经营判断</h3>
            <p className="rounded-lg border border-[#E1E3DD] bg-[#F7F8F5] p-3 leading-relaxed text-[#565D56]">
              {m.systemJudgment}
            </p>
          </section>

          <MemberPracticeProfile profile={m.practiceProfile} />

          <section>
            <h3 className={sectionTitle}>会员资产</h3>
            {m.assets.length === 0 ? (
              <p className="text-[#9AA39A]">暂无持卡资产</p>
            ) : (
              <ul className="space-y-2">
                {m.assets.map(a => (
                  <li key={a.id} className="rounded-lg border border-[#E1E3DD] bg-[#FCFCFA] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#222622]">{a.name}</p>
                        <p className="mt-1 text-[10px] text-[#8A908A]">
                          {a.remaining} / {a.total} · 至 {a.validUntil} · {a.status}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#8A908A]">
                          订单 {a.sourceOrder} · {a.contractStatus} · {a.store}
                        </p>
                        {a.freezeTransferRefund ? (
                          <p className="mt-1 text-[10px] text-[#8A6A3A]">{a.freezeTransferRefund}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="met-member-mini-btn shrink-0"
                        onClick={() => onOpenAsset(a.id)}
                      >
                        资产详情
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <MemberCourseRecords records={m.courseRecords} limit={20} />

          <section>
            <h3 className={sectionTitle}>到课与耗课统计</h3>
            <div className="grid grid-cols-3 gap-2 text-[#565D56]">
              <div className="rounded-lg border border-[#EEF0EC] bg-[#F7F8F5] p-2 text-center">
                <p className="text-[10px] text-[#8A908A]">近30天到课</p>
                <p className="text-base font-semibold text-[#222622]">{att.checkins30d}</p>
              </div>
              <div className="rounded-lg border border-[#EEF0EC] bg-[#F7F8F5] p-2 text-center">
                <p className="text-[10px] text-[#8A908A]">近30天耗课</p>
                <p className="text-base font-semibold text-[#222622]">{att.consumption30d} 点</p>
              </div>
              <div className="rounded-lg border border-[#EEF0EC] bg-[#F7F8F5] p-2 text-center">
                <p className="text-[10px] text-[#8A908A]">爽约</p>
                <p className="text-base font-semibold text-[#222622]">{att.noShows30d}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-[10px] text-[#70776F]">
              <li>预约 {att.bookings30d} 次 · 签到 {att.checkins30d} 次 · 取消 {att.cancels30d} 次</li>
              <li>最近到店：{m.lastVisitLabel}</li>
            </ul>
          </section>

          <MemberPrivateTrainingRecords records={m.privateTrainingRecords} />
          <MemberPointsLedger profile={m.pointsProfile} />
          <MemberConsumptionRecords profile={m.consumptionProfile} />
          <MemberServiceTeam team={m.serviceTeam} showInternal />
          <MemberTeacherViewPanel member={m} />

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className={sectionTitle}>跟进记录</h3>
              <button type="button" onClick={onAddFollowUp} className="met-member-mini-btn">
                添加跟进
              </button>
            </div>
            <ul className="space-y-2">
              {m.followUps.map(fu => (
                <li key={fu.id} className="rounded-lg border border-[#EEF0EC] p-3">
                  <p className="font-medium text-[#222622]">
                    {fu.at} · {fu.operator} · {fu.type}
                  </p>
                  <p className="mt-1 text-[#70776F]">{fu.summary}</p>
                  <p className="mt-1 text-[10px] text-[#8A908A]">
                    结果：{fu.result}
                    {fu.nextAt ? ` · 下次 ${fu.nextAt}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[10px] text-[#8A908A]">
            数据导出、退款与转卡操作需权限审计，不在本页直接完成。
          </p>
        </div>
      </aside>
    </>
  );
};

export default MemberDetailDrawer;
