import type { Member, MemberLifecycleStatus, StageConfig } from '../types';

type MemberStagePreference = 'lifecycle' | 'legacy';

export const MEMBER_STAGE_CONFIG: Record<Member['stage'], StageConfig> = {
  S0: { label: '线索 Lead', color: '#6B7280', bgColor: '#F3F4F6', desc: '留资未付费', strategy: '🎯 目标: 邀约首次体验，破冰建立信任' },
  S1: { label: '新会员 New', color: '#10B981', bgColor: '#D1FAE5', desc: '首购 ≤ 14天', strategy: '🎯 目标: 新手关怀，建立约课习惯' },
  S2: { label: '体验期 Trial', color: '#F59E0B', bgColor: '#FEF3C7', desc: '首购 ≤ 45天', strategy: '🎯 目标: 体验多位老师，找到真爱课' },
  S3: { label: '稳定期 Stable', color: '#3B82F6', bgColor: '#DBEAFE', desc: '近90天 ≥ 12次', strategy: '🎯 目标: 维持频次，适时扩充卡项' },
  S4: { label: '深度期 Core', color: '#8B5CF6', bgColor: '#EDE9FE', desc: '私教长期 / 高LTV', strategy: '🎯 目标: 深度身体管理，情感链接' },
  S5: { label: '休眠 Sleep', color: '#F97316', bgColor: '#FFEDD5', desc: '近30天无到店', strategy: '🎯 目标: 激活唤醒，发送回归福利' },
  S6: { label: '流失 Churn', color: '#EF4444', bgColor: '#FEE2E2', desc: '卡过期 / 90天无课', strategy: '🎯 目标: 调研流失原因，尝试召回' },
};

export const MEMBER_LIFECYCLE_GROUPS: Record<'leads' | 'active' | 'churned', MemberLifecycleStatus[]> = {
  leads: ['lead', 'contacted', 'trial_booked'],
  active: ['trial_attended', 'active', 'warning', 'reactivated'],
  churned: ['inactive', 'churned'],
};

export const MEMBER_STAGE_TO_LIFECYCLE: Record<Member['stage'], MemberLifecycleStatus> = {
  S0: 'lead',
  S1: 'active',
  S2: 'trial_attended',
  S3: 'active',
  S4: 'active',
  S5: 'warning',
  S6: 'churned',
};

export const MEMBER_LIFECYCLE_TO_STAGE: Record<MemberLifecycleStatus, Member['stage']> = {
  lead: 'S0',
  contacted: 'S0',
  trial_booked: 'S0',
  trial_attended: 'S2',
  active: 'S3',
  warning: 'S5',
  inactive: 'S5',
  churned: 'S6',
  reactivated: 'S3',
};

const MEMBER_LIFECYCLE_LABELS: Record<MemberLifecycleStatus, string> = {
  lead: '潜在线索',
  contacted: '已触达',
  trial_booked: '已约体验',
  trial_attended: '已体验',
  active: '正式会员',
  warning: '风险预警',
  inactive: '沉睡会员',
  churned: '流失会员',
  reactivated: '重新激活',
};

export const getMemberLifecycleStatus = (member: Member): MemberLifecycleStatus => (
  member.lifecycleStatus ?? MEMBER_STAGE_TO_LIFECYCLE[member.stage]
);

export const getMemberStage = (
  member: Member,
  preference: MemberStagePreference = 'lifecycle'
): Member['stage'] => {
  if (preference === 'legacy') return member.stage;
  return MEMBER_LIFECYCLE_TO_STAGE[getMemberLifecycleStatus(member)] ?? member.stage;
};

export const getMemberStageConfig = (
  member: Member,
  preference: MemberStagePreference = 'lifecycle'
): StageConfig => MEMBER_STAGE_CONFIG[getMemberStage(member, preference)];

export const getMemberStageLabel = (
  member: Member,
  preference: MemberStagePreference = 'lifecycle'
): string => getMemberStageConfig(member, preference).label;

export const getMemberLifecycleLabel = (
  memberOrStatus: Member | MemberLifecycleStatus
): string => {
  const status = typeof memberOrStatus === 'string'
    ? memberOrStatus
    : getMemberLifecycleStatus(memberOrStatus);

  return MEMBER_LIFECYCLE_LABELS[status];
};
