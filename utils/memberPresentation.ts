import type { Member } from '../types';
import {
  getMemberLifecycleLabel,
  getMemberLifecycleStatus,
  getMemberStage,
  getMemberStageConfig,
} from './memberLifecycle';

export interface MemberLifecyclePresentation {
  label: string;
  legacyLabel: string | null;
  color: string;
  bgColor: string;
  strategy: string;
}

export interface MemberAssetSummary {
  text: string;
  sourceLabel: string;
  isLegacy: boolean;
}

export interface MemberRiskPresentation {
  label: string;
  iconClass: string;
  textClass: string;
  cardIcon: string;
}

export const MEMBER_RISK_PRESENTATION: Record<NonNullable<Member['riskTag']>, MemberRiskPresentation> = {
  expiry: {
    label: '即将过期',
    iconClass: 'fa-solid fa-hourglass-end',
    textClass: 'text-red-400',
    cardIcon: 'fa-hourglass-half',
  },
  balance: {
    label: '余额不足',
    iconClass: 'fa-solid fa-wallet',
    textClass: 'text-orange-400',
    cardIcon: 'fa-wallet',
  },
  sleep: {
    label: '沉默会员',
    iconClass: 'fa-solid fa-moon',
    textClass: 'text-gray-300',
    cardIcon: 'fa-moon',
  },
  churn: {
    label: '流失风险',
    iconClass: 'fa-solid fa-triangle-exclamation',
    textClass: 'text-red-500',
    cardIcon: 'fa-triangle-exclamation',
  },
};

export const getMemberLifecyclePresentation = (member: Member): MemberLifecyclePresentation => {
  const lifecycleStage = getMemberStage(member);
  const legacyStage = getMemberStage(member, 'legacy');
  const stageConfig = getMemberStageConfig(member);
  const legacyStageConfig = getMemberStageConfig(member, 'legacy');

  return {
    label: getMemberLifecycleLabel(getMemberLifecycleStatus(member)),
    legacyLabel: legacyStage !== lifecycleStage ? legacyStageConfig.label : null,
    color: stageConfig.color,
    bgColor: stageConfig.bgColor,
    strategy: stageConfig.strategy,
  };
};

export const getPrimaryMemberAssetSummary = (member: Member): MemberAssetSummary | null => {
  const asset = member.assets?.[0];
  if (asset) {
    const balance = typeof asset.remainingAmount === 'number'
      ? `余${asset.remainingAmount}`
      : asset.status;

    return {
      text: `${asset.name} (${balance})`,
      sourceLabel: 'Assets',
      isLegacy: false,
    };
  }

  const card = member.cards[0];
  if (!card) return null;

  return {
    text: `${card.name} (${card.balance})`,
    sourceLabel: 'Legacy cards',
    isLegacy: true,
  };
};

export const getMemberAssetSourceLabel = (member: Member): string => {
  const primaryAsset = getPrimaryMemberAssetSummary(member);
  return primaryAsset?.sourceLabel ?? 'No assets';
};

export const getMemberRiskPresentation = (member: Member): MemberRiskPresentation | null => {
  if (!member.riskTag) return null;
  return MEMBER_RISK_PRESENTATION[member.riskTag] ?? null;
};
