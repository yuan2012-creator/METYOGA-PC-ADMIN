import React from 'react';
import type { PointsProfile } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

const MemberPointsLedger: React.FC<{ profile?: PointsProfile; summaryOnly?: boolean }> = ({
  profile,
  summaryOnly,
}) => {
  if (!profile) {
    return (
      <section className="met-member-profile-block">
        <h3 className={blockTitle}>积分</h3>
        <p className="text-[11px] text-[#9AA39A]">暂无积分账户</p>
      </section>
    );
  }
  return (
    <section className="met-member-profile-block">
      <h3 className={blockTitle}>{summaryOnly ? '积分摘要' : '积分明细'}</h3>
      <dl className="grid grid-cols-2 gap-2 text-[11px] mb-2">
        <div>
          <dt className="text-[#8A908A]">当前积分</dt>
          <dd className="font-semibold text-[#222622]">{profile.currentPoints}</dd>
        </div>
        <div>
          <dt className="text-[#8A908A]">累计获得</dt>
          <dd>{profile.totalEarnedPoints}</dd>
        </div>
        {profile.expiringPoints > 0 ? (
          <div className="col-span-2">
            <dt className="text-[#8A908A]">即将过期</dt>
            <dd className="text-[#8A6A3A]">
              {profile.expiringPoints} 分 · {profile.expiringDate}
            </dd>
          </div>
        ) : null}
      </dl>
      {!summaryOnly && (
        <ul className="space-y-1.5">
          {profile.latestPointRecords.map(r => (
            <li key={r.id} className="flex justify-between text-[10px] text-[#70776F]">
              <span>
                {r.date} · {r.type} · {r.reason}
              </span>
              <span className={r.points > 0 ? 'text-[#4A5C4F]' : 'text-[#8A6A3A]'}>
                {r.points > 0 ? '+' : ''}
                {r.points}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[9px] text-[#9AA39A]">积分调整需权限审计，本页不提供调整入口</p>
    </section>
  );
};

export default MemberPointsLedger;
