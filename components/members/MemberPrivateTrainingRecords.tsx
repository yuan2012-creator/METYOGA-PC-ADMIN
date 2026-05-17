import React from 'react';
import type { PrivateTrainingRecord } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

const MemberPrivateTrainingRecords: React.FC<{ records: PrivateTrainingRecord[] }> = ({ records }) => (
  <section className="met-member-profile-block">
    <h3 className={blockTitle}>私教记录</h3>
    {records.length === 0 ? (
      <p className="text-[11px] leading-relaxed text-[#70776F]">
        暂无私教记录。可根据到课偏好与练习目标，判断是否适合私教转化。
      </p>
    ) : (
      <ul className="space-y-2">
        {records.map(r => (
          <li key={r.id} className="rounded-lg border border-[#EEF0EC] p-2.5 text-[10px]">
            <p className="font-medium text-[#222622]">{r.packageName}</p>
            <p className="mt-1 text-[#70776F]">
              教练 {r.coachName} · {r.completedSessions}/{r.totalSessions} 节 · 剩 {r.remainingSessions} 节
            </p>
            <p className="mt-0.5 text-[#8A908A]">
              目标：{r.trainingGoal} · {r.conversionStatus}
            </p>
            <p className="mt-1 text-[#565D56]">建议：{r.nextSuggestedAction}</p>
            <p className="mt-0.5 text-[#8A908A]">评估：{r.coachAssessment}</p>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default MemberPrivateTrainingRecords;
