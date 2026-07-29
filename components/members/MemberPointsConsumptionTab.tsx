import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import {
  formatCny,
  MemberModalBlock,
  MemberModalMiniStat,
  MemberModalMiniStatRow,
} from './memberModalShared';

const MemberPointsConsumptionTab: React.FC<{ member: MemberRecord }> = ({ member: m }) => {
  const pts = m.pointsProfile;
  const cons = m.consumptionProfile;

  return (
    <div className="met-member-tab-content">
      <MemberModalBlock title="积分摘要">
        {pts ? (
          <>
            <MemberModalMiniStatRow>
              <MemberModalMiniStat label="当前积分" value={pts.currentPoints} />
              <MemberModalMiniStat label="累计获得" value={pts.totalEarnedPoints} />
              <MemberModalMiniStat label="累计使用" value={pts.totalUsedPoints} />
              <MemberModalMiniStat
                label="即将过期"
                value={pts.expiringPoints > 0 ? `${pts.expiringPoints}（${pts.expiringDate}）` : '无'}
              />
            </MemberModalMiniStatRow>
            <ul className="met-member-compact-list met-member-compact-list--dense met-member-compact-list--inset">
              {pts.latestPointRecords.slice(0, 2).map(r => (
                <li key={r.id} className="met-member-compact-list__item">
                  <p className="met-member-compact-list__title">
                    {r.date} · {r.reason}
                  </p>
                  <p className="met-member-compact-list__sub">
                    {r.points > 0 ? '+' : ''}
                    {r.points} 积分
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="met-member-empty">暂无积分账户</p>
        )}
      </MemberModalBlock>

      <MemberModalBlock title="消费摘要">
        {cons ? (
          <MemberModalMiniStatRow>
            <MemberModalMiniStat label="累计支付" value={formatCny(cons.totalPaidAmount)} />
            <MemberModalMiniStat label="净支付" value={formatCny(cons.netPaidAmount)} />
            <MemberModalMiniStat
              label="退款摘要"
              value={cons.totalRefundAmount > 0 ? formatCny(cons.totalRefundAmount) : '无'}
            />
            <MemberModalMiniStat label="耗课点数" value={`${cons.totalConsumedPoints} 点`} />
          </MemberModalMiniStatRow>
        ) : (
          <p className="met-member-empty">暂无消费摘要</p>
        )}
      </MemberModalBlock>

      <MemberModalBlock title="耗课摘要">
        {cons ? (
          <>
            <MemberModalMiniStatRow>
              <MemberModalMiniStat
                label="累计耗课"
                value={`${cons.totalConsumedPoints} 点 / ${cons.totalConsumedTimes} 次`}
              />
            </MemberModalMiniStatRow>
            <ul className="met-member-compact-list met-member-compact-list--inset">
              {cons.latestConsumptionRecords.map(r => (
                <li key={r.id} className="met-member-compact-list__item">
                  <p className="met-member-compact-list__title">
                    {r.date} · {r.courseName}
                  </p>
                  <p className="met-member-compact-list__sub">
                    {r.consumedPointsOrTimes} · {r.confirmationStatus}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="met-member-empty">暂无耗课记录</p>
        )}
      </MemberModalBlock>
    </div>
  );
};

export default MemberPointsConsumptionTab;
