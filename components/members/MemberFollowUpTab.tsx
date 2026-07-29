import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import {
  MemberModalBlock,
  MemberModalCard,
  MemberModalDl,
  MemberModalPanel,
  MemberModalStatusRow,
} from './memberModalShared';

interface MemberFollowUpTabProps {
  member: MemberRecord;
  onAddFollowUp: () => void;
}

const yn = (value: boolean): string => (value ? '是' : '否');

const MemberFollowUpTab: React.FC<MemberFollowUpTabProps> = ({ member: m, onAddFollowUp }) => {
  const s = m.teacherSyncProfile;
  const team = m.serviceTeam;

  return (
    <div className="met-member-tab-content">
      <MemberModalBlock title="协同状态">
        <MemberModalStatusRow
          items={[
            {
              label: '店长介入',
              value: m.riskTags.some(r => r.type === '需店长介入') ? '需要' : '否',
            },
            { label: '老师反馈', value: team.needsPostClassFeedback ? '需要' : '否' },
            { label: '管家跟进', value: m.needFollowToday ? '今日待跟进' : '常规节奏' },
          ]}
        />
      </MemberModalBlock>

      <MemberModalBlock title="跟进记录">
        <MemberModalCard
          action={
            <button type="button" className="met-member-btn-sm met-ink-button" onClick={onAddFollowUp}>
              添加跟进
            </button>
          }
        >
          <ul className="met-member-timeline">
            {m.followUps.map(fu => (
              <li key={fu.id} className="met-member-timeline__item">
                <p className="met-member-timeline__time">
                  {fu.at} · {fu.operator} · {fu.type}
                </p>
                <p className="met-member-timeline__line">
                  {fu.summary}
                  {fu.result ? ` · ${fu.result}` : ''}
                  {fu.nextAt ? ` · 下次 ${fu.nextAt}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </MemberModalCard>
      </MemberModalBlock>

      <MemberModalBlock title="老师反馈回流">
        <MemberModalPanel>
          <MemberModalDl
            rows={[
              { label: '最近老师反馈', value: s.recentTeacherFeedback || '暂无反馈' },
              { label: '老师备注', value: s.teacherNotes || '暂无反馈' },
              { label: '是否建议管家跟进', value: yn(s.suggestButlerFollowUp) },
              { label: '是否需要课后关注', value: yn(s.needsAfterClassAttention) },
            ]}
          />
        </MemberModalPanel>
      </MemberModalBlock>
    </div>
  );
};

export default MemberFollowUpTab;
