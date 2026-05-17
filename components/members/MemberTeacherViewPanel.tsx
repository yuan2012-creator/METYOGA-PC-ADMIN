import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

/** 老师端可见信息（PC 后台对照展示） */
const MemberTeacherViewPanel: React.FC<{ member: MemberRecord }> = ({ member }) => {
  const m = member;
  const p = m.practiceProfile;
  const team = m.serviceTeam;
  const lastCourse = m.courseRecords[0];

  return (
    <section className="met-member-profile-block met-member-teacher-view">
      <h3 className={blockTitle}>老师端可见信息</h3>
      <p className="mb-2 text-[10px] text-[#8A908A]">以下为老师端应看到的内容，不含订单金额与内部经营判断</p>
      <dl className="space-y-1.5 text-[11px] text-[#565D56]">
        <div className="flex justify-between">
          <dt className="text-[#8A908A]">会员</dt>
          <dd>{m.name}（脱敏展示）</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#8A908A]">练习目标</dt>
          <dd>{p.exerciseGoal}</dd>
        </div>
        <div>
          <dt className="text-[#8A908A]">偏好课程</dt>
          <dd className="mt-0.5">{p.preferredCourseTypes.join('、')}</dd>
        </div>
        <div>
          <dt className="text-[#8A908A]">注意事项</dt>
          <dd className="mt-0.5 text-[#8A6A3A]">{p.attentionNotes.join('；')}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#8A908A]">最近到课</dt>
          <dd>{m.lastVisitLabel}</dd>
        </div>
        {lastCourse?.feedbackNote ? (
          <div>
            <dt className="text-[#8A908A]">最近课程反馈</dt>
            <dd className="mt-0.5">{lastCourse.feedbackNote}</dd>
          </div>
        ) : null}
        {m.privateTrainingRecords[0] ? (
          <div>
            <dt className="text-[#8A908A]">私教目标</dt>
            <dd className="mt-0.5">{m.privateTrainingRecords[0].trainingGoal}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[#8A908A]">老师备注</dt>
          <dd className="mt-0.5">{team.teacherVisibleNotes}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#8A908A]">课后反馈</dt>
          <dd>{team.needsPostClassFeedback ? '需要' : '常规即可'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#8A908A]">强度注意</dt>
          <dd>{team.avoidHighIntensity ? '避免强度过高' : '按常规强度'}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[9px] text-[#9AA39A]">
        老师端不展示：订单金额、合同详情、退款、完整手机号、身份证/地址、内部经营判断、高敏感风险标签
      </p>
    </section>
  );
};

export default MemberTeacherViewPanel;
