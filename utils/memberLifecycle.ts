import { STAGE_CONFIG } from '../constants';
import type { Member, MemberLifecycleStatus, StageConfig } from '../types';

type MemberStagePreference = 'lifecycle' | 'legacy';

export const MEMBER_LIFECYCLE_GROUPS: Record<'leads' | 'active' | 'churned', MemberLifecycleStatus[]> = {
  leads: ['lead', 'contacted', 'trial_booked'],
  active: ['trial_attended', 'active', 'warning', 'reactivated'],
  churned: ['inactive', 'churned'],
};

const STAGE_TO_LIFECYCLE: Record<Member['stage'], MemberLifecycleStatus> = {
  S0: 'lead',
  S1: 'active',
  S2: 'trial_attended',
  S3: 'active',
  S4: 'active',
  S5: 'warning',
  S6: 'churned',
};

const LIFECYCLE_TO_STAGE: Record<MemberLifecycleStatus, Member['stage']> = {
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
  member.lifecycleStatus ?? STAGE_TO_LIFECYCLE[member.stage]
);

export const getMemberStage = (
  member: Member,
  preference: MemberStagePreference = 'lifecycle'
): Member['stage'] => {
  if (preference === 'legacy') return member.stage;
  return LIFECYCLE_TO_STAGE[getMemberLifecycleStatus(member)] ?? member.stage;
};

export const getMemberStageConfig = (
  member: Member,
  preference: MemberStagePreference = 'lifecycle'
): StageConfig => STAGE_CONFIG[getMemberStage(member, preference)];

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
