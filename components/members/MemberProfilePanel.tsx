import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import { lifecycleBadgeClass, riskBadgeClass } from './memberOperationViewModel';
import MemberStageBadge from './MemberStageBadge';
import MemberPracticeProfile from './MemberPracticeProfile';
import MemberCourseRecords from './MemberCourseRecords';
import MemberPrivateTrainingRecords from './MemberPrivateTrainingRecords';
import MemberPointsLedger from './MemberPointsLedger';
import MemberConsumptionRecords from './MemberConsumptionRecords';
import MemberServiceTeam from './MemberServiceTeam';

interface MemberProfilePanelProps {
  member: MemberRecord;
  onBackToQueue: () => void;
  onAddFollowUp: () => void;
  onOpenAsset: () => void;
  onOpenFullArchive: () => void;
  onCreateTask: () => void;
}

const MemberProfilePanel: React.FC<MemberProfilePanelProps> = ({
  member: m,
  onBackToQueue,
  onAddFollowUp,
  onOpenAsset,
  onOpenFullArchive,
  onCreateTask,
}) => (
  <aside className="met-member-profile met-today-surface">
    <div className="met-member-profile__toolbar">
      <button type="button" className="met-member-back-btn" onClick={onBackToQueue}>
        ← 返回今日行动区
      </button>
    </div>
    <div className="custom-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <header className="met-member-profile__head">
        <h2 className="text-lg font-semibold text-[#222622]">{m.name}</h2>
        <p className="text-xs text-[#8A908A]">
          {m.phone} · {m.memberCode}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <MemberStageBadge code={m.stageCode} showName />
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${lifecycleBadgeClass(m.lifecycleStage)}`}
          >
            {m.lifecycleSubStatus}
          </span>
          {m.riskTags.map(r => (
            <span
              key={`${r.type}-${r.reason}`}
              className={`rounded px-1 py-0.5 text-[9px] ${riskBadgeClass(r.type)}`}
            >
              {r.type}
            </span>
          ))}
        </div>
        <dl className="mt-3 space-y-1 text-[10px] text-[#70776F]">
          <div>
            <span className="text-[#8A908A]">阶段原因：</span>
            {m.stageReason}
          </div>
          <div>
            <span className="text-[#8A908A]">下一阶段：</span>
            {m.nextStageTarget}
          </div>
        </dl>
      </header>

      <section className="met-member-profile-block mt-4 rounded-lg border border-[#E1E3DD] bg-[#F7F8F5] p-3">
        <h3 className="text-[11px] font-semibold text-[#222622] mb-2">系统经营判断</h3>
        <p className="text-[11px] leading-relaxed text-[#565D56]">{m.systemJudgment}</p>
        <p className="mt-2 text-[10px] text-[#8A908A]">
          建议动作：<strong className="text-[#222622]">{m.suggestedAction}</strong> · {m.manager} ·{' '}
          {m.actionDueLabel}
        </p>
      </section>

      <MemberPracticeProfile profile={m.practiceProfile} />

      <section className="met-member-profile-block">
        <h3 className="text-[11px] font-semibold text-[#565D56] mb-2">当前资产</h3>
        <p className="text-[11px] font-medium text-[#222622]">{m.primaryAsset}</p>
        <p className="text-[10px] text-[#70776F]">
          {m.remainingLabel} · 至 {m.expireLabel}
        </p>
        {m.assets[0] ? (
          <button type="button" className="met-member-mini-btn mt-2" onClick={onOpenAsset}>
            查看资产详情
          </button>
        ) : null}
      </section>

      <MemberCourseRecords records={m.courseRecords} limit={5} />
      <MemberPrivateTrainingRecords records={m.privateTrainingRecords} />

      <section className="met-member-profile-block">
        <h3 className="text-[11px] font-semibold text-[#565D56] mb-2">积分与消费</h3>
        <MemberPointsLedger profile={m.pointsProfile} summaryOnly />
        <div className="mt-3">
          <MemberConsumptionRecords profile={m.consumptionProfile} summaryOnly />
        </div>
      </section>

      <section className="met-member-profile-block">
        <h3 className="text-[11px] font-semibold text-[#565D56] mb-2">跟进记录</h3>
        {m.followUps.length === 0 ? (
          <p className="text-[11px] text-[#9AA39A]">暂无跟进</p>
        ) : (
          <ul className="space-y-2">
            {m.followUps.slice(0, 3).map(fu => (
              <li key={fu.id} className="text-[10px] text-[#70776F]">
                {fu.at} · {fu.operator} · {fu.type} — {fu.summary}
              </li>
            ))}
          </ul>
        )}
      </section>

      <MemberServiceTeam team={m.serviceTeam} showInternal />

      <div className="met-member-profile__actions mt-4 flex flex-col gap-2">
        <button type="button" onClick={onAddFollowUp} className="met-ink-button !text-xs">
          添加跟进
        </button>
        <button type="button" onClick={onOpenAsset} className="met-member-sidebar-btn">
          查看资产详情
        </button>
        <button type="button" onClick={onOpenFullArchive} className="met-member-sidebar-btn">
          查看完整档案
        </button>
        <button type="button" onClick={onCreateTask} className="met-member-sidebar-btn">
          创建任务
        </button>
      </div>
    </div>
  </aside>
);

export default MemberProfilePanel;
