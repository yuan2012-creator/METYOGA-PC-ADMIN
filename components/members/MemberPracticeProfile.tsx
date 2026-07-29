import React from 'react';
import type { PracticeProfile } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

const MemberPracticeProfile: React.FC<{ profile: PracticeProfile; compact?: boolean }> = ({
  profile,
  compact,
}) => (
  <section className={compact ? '' : 'met-member-profile-block'}>
    <h3 className={blockTitle}>练习画像</h3>
    <dl className="space-y-1.5 text-[11px] text-[#565D56]">
      <div className="flex justify-between gap-2">
        <dt className="shrink-0 text-[#8A908A]">到课频率</dt>
        <dd className="text-right text-[#222622]">
          {profile.classFrequencyLevel} · {profile.classFrequencySummary}
        </dd>
      </div>
      <div>
        <dt className="text-[#8A908A]">偏好课程</dt>
        <dd className="mt-0.5">{profile.preferredCourseTypes.join('、')}</dd>
      </div>
      <div>
        <dt className="text-[#8A908A]">偏好时段</dt>
        <dd className="mt-0.5">{profile.preferredTimeSlots.join('、')}</dd>
      </div>
      <div>
        <dt className="text-[#8A908A]">主要老师</dt>
        <dd className="mt-0.5">{profile.preferredTeachers.join('、')}</dd>
      </div>
      <div>
        <dt className="text-[#8A908A]">练习目标</dt>
        <dd className="mt-0.5">{profile.exerciseGoal}</dd>
      </div>
      {profile.attentionNotes.length > 0 ? (
        <div>
          <dt className="text-[#8A908A]">注意事项</dt>
          <dd className="mt-0.5 text-[#8A6A3A]">{profile.attentionNotes.join('；')}</dd>
        </div>
      ) : null}
      {!compact && profile.habitTags.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {profile.habitTags.map(t => (
            <span
              key={t}
              className="rounded bg-[#F7F8F5] px-1.5 py-0.5 text-[9px] text-[#565D56] ring-1 ring-[#E1E3DD]"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </dl>
  </section>
);

export default MemberPracticeProfile;
