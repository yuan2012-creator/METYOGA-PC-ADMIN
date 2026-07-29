import React from 'react';
import type { ServiceTeam } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

const MemberServiceTeam: React.FC<{ team: ServiceTeam; showInternal?: boolean }> = ({
  team,
  showInternal,
}) => (
  <section className="met-member-profile-block">
    <h3 className={blockTitle}>服务团队</h3>
    <dl className="space-y-1.5 text-[11px] text-[#565D56]">
      <div className="flex justify-between">
        <dt className="text-[#8A908A]">管家</dt>
        <dd>{team.ownerButler}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-[#8A908A]">店长</dt>
        <dd>{team.storeManager}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-[#8A908A]">主要老师</dt>
        <dd>{team.mainTeachers.join('、')}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-[#8A908A]">私教老师</dt>
        <dd>{team.privateCoach ?? '暂无'}</dd>
      </div>
      <div>
        <dt className="text-[#8A908A]">老师端可见备注</dt>
        <dd className="mt-0.5 rounded border border-[#E1E3DD] bg-[#F7F8F5] p-2 text-[#565D56]">
          {team.teacherVisibleNotes}
        </dd>
      </div>
      {showInternal ? (
        <div>
          <dt className="text-[#8A908A]">内部交接</dt>
          <dd className="mt-0.5 text-[#8A908A]">{team.handoverNotes}</dd>
        </div>
      ) : null}
    </dl>
  </section>
);

export default MemberServiceTeam;
