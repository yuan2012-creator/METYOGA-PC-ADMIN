import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import {
  MemberModalCard,
  MemberModalDl,
  MemberModalGrid2,
  MemberModalMeteachTile,
} from './memberModalShared';

const MemberPracticeTab: React.FC<{ member: MemberRecord }> = ({ member: m }) => {
  const p = m.practiceProfile;
  const team = m.serviceTeam;
  const s = m.teacherSyncProfile;

  const butlerFlags = [
    s.suggestButlerFollowUp && '需跟进',
    s.needsLowerIntensity && '需降强度',
    s.needsAfterClassAttention && '需课后关注',
  ].filter(Boolean);

  return (
    <div className="met-member-tab-content">
      <MemberModalGrid2>
        <MemberModalCard title="练习画像">
          <MemberModalDl
            rows={[
              { label: '到课频率', value: `${p.classFrequencyLevel} · ${p.classFrequencySummary}` },
              { label: '偏好课程', value: p.preferredCourseTypes.join('、') || '—' },
              { label: '偏好时间', value: p.preferredTimeSlots.join('、') || '—' },
              { label: '偏好门店', value: p.preferredStores.join('、') || '—' },
              { label: '偏好老师', value: p.preferredTeachers.join('、') || '—' },
              { label: '练习目标', value: p.exerciseGoal },
            ]}
          />
        </MemberModalCard>
        <MemberModalCard title="身体与练习注意事项">
          <MemberModalDl
            rows={[
              { label: '身体注意', value: p.attentionNotes.join('；') || '—' },
              { label: '强度偏好', value: p.intensityPreference ?? '中等强度' },
              { label: '不适合内容', value: (p.unsuitableContent ?? []).join('、') || '—' },
              {
                label: '课后反馈需求',
                value: team.needsPostClassFeedback || s.needsAfterClassFeedback ? '需要' : '常规',
              },
            ]}
          />
        </MemberModalCard>
      </MemberModalGrid2>

      <MemberModalCard title="METeach 可见信息">
        <div className="met-member-meteach-grid">
          <MemberModalMeteachTile
            title="课前可见"
            body="练习目标、偏好课程、身体注意"
          />
          <MemberModalMeteachTile
            title="课后回填"
            body="强度反馈、课后状态、跟进建议"
          />
          <MemberModalMeteachTile
            title="管家接收"
            body={butlerFlags.length ? butlerFlags.join('、') : '常规维护节奏'}
          />
          <MemberModalMeteachTile
            title="权限边界"
            body="不显示订单、合同、退款、完整手机号"
          />
        </div>
        <p className="met-member-meteach-footnote">与 METeach 同源，仅同步练习相关信息。</p>
      </MemberModalCard>
    </div>
  );
};

export default MemberPracticeTab;
