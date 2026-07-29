import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import { MemberModalCard, MemberModalDl } from './memberModalShared';

const MemberTeacherSyncTab: React.FC<{ member: MemberRecord }> = ({ member: m }) => {
  const s = m.teacherSyncProfile;
  const visibleRows = [
    { label: '脱敏姓名', value: s.visibleName },
    { label: '简化状态', value: s.simplifiedStageLabel },
    { label: '练习目标', value: s.visiblePracticeGoals },
    { label: '偏好课程', value: s.visibleCoursePreferences },
    { label: '偏好时间', value: s.visibleTimePreferences },
    { label: '偏好老师', value: s.visibleTeacherPreferences },
    { label: '到课频率', value: s.visibleClassFrequency },
    { label: '最近到课', value: s.visibleLastVisit },
    { label: '课程反馈', value: s.visibleRecentCourseFeedback },
    { label: '私教目标', value: s.visiblePrivateTrainingGoal },
    { label: '注意事项', value: s.visibleAttentionNotes },
    { label: '老师备注', value: s.teacherNotes },
  ];
  return (
    <div className="met-member-tab-content met-member-tab-teacher">
      <div className="met-member-modal-grid-2">
        <MemberModalCard title="老师端可见">
          <MemberModalDl rows={visibleRows} />
          <p className="met-member-info-card__note">
            同源：practiceProfile · courseRecords · privateTrainingRecords · serviceTeam
          </p>
        </MemberModalCard>
        <div className="met-member-tab-teacher__right">
          <MemberModalCard title="老师端不可见">
            <ul className="met-member-bullet-list">
              {s.hiddenFields.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </MemberModalCard>
          <MemberModalCard title="同步状态">
            <MemberModalDl
              rows={[
                { label: '最近同步', value: s.lastSyncedAt },
                { label: '来源', value: s.syncSource },
                { label: '更新人', value: s.updatedBy },
                { label: '已同步', value: `${s.syncedFieldCount} 项` },
                { label: '待确认', value: `${s.pendingConfirmFieldCount} 项` },
              ]}
            />
          </MemberModalCard>
        </div>
      </div>
      <MemberModalCard title="老师反馈回流">
        <MemberModalDl
          rows={[
            { label: '最近反馈', value: s.recentTeacherFeedback },
            { label: '建议管家', value: s.suggestButlerFollowUp ? '是' : '否' },
            { label: '建议私教', value: s.suggestPrivateTraining ? '是' : '否' },
            { label: '降低强度', value: s.needsLowerIntensity ? '是' : '否' },
            { label: '课后关注', value: s.needsAfterClassAttention ? '是' : '否' },
          ]}
        />
      </MemberModalCard>
    </div>
  );
};

export default MemberTeacherSyncTab;
