import React from 'react';
import type { ConsumptionProfile } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

const MemberConsumptionRecords: React.FC<{ profile?: ConsumptionProfile; summaryOnly?: boolean }> = ({
  profile,
  summaryOnly,
}) => {
  if (!profile) {
    return (
      <section className="met-member-profile-block">
        <h3 className={blockTitle}>消费与耗课</h3>
        <p className="text-[11px] text-[#9AA39A]">暂无消费记录</p>
      </section>
    );
  }
  return (
    <section className="met-member-profile-block">
      <h3 className={blockTitle}>{summaryOnly ? '消费与耗课摘要' : '订单与耗课'}</h3>
      <dl className="grid grid-cols-2 gap-2 text-[11px] mb-2">
        <div>
          <dt className="text-[#8A908A]">累计消费</dt>
          <dd className="font-semibold text-[#222622]">¥{profile.netPaidAmount.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-[#8A908A]">累计耗课</dt>
          <dd>
            {profile.totalConsumedPoints} 点 / {profile.totalConsumedTimes} 次
          </dd>
        </div>
      </dl>
      {profile.hasUnconfirmedConsumption ? (
        <p className="mb-2 rounded border border-[#E8DFD0] bg-[#FAF6F0] px-2 py-1 text-[10px] text-[#8A6A3A]">
          存在待确认耗课记录
        </p>
      ) : null}
      {!summaryOnly && (
        <>
          <p className="mb-1 text-[10px] font-medium text-[#565D56]">最近订单</p>
          <ul className="mb-3 space-y-1.5">
            {profile.latestOrders.map(o => (
              <li key={o.orderNo} className="text-[10px] text-[#70776F]">
                {o.orderNo} · {o.productName} · ¥{o.paidAmount} · {o.paymentStatus}
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mb-1 text-[10px] font-medium text-[#565D56]">最近耗课</p>
      <ul className="space-y-1.5">
        {profile.latestConsumptionRecords.map(r => (
          <li key={r.id} className="text-[10px] text-[#70776F]">
            {r.date} · {r.courseName} · {r.assetName} {r.consumedPointsOrTimes} · {r.confirmationStatus}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MemberConsumptionRecords;
