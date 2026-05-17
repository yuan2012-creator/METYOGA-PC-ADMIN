import type { StageCode } from './memberOperationViewModel';

export type MemberAvatarTone = 'sage' | 'sand' | 'mist' | 'latte' | 'neutral';

const STAGE_TONE: Record<StageCode, MemberAvatarTone> = {
  S0: 'neutral',
  S1: 'mist',
  S2: 'sand',
  S3: 'sage',
  S4: 'latte',
  S5: 'sand',
  S6: 'mist',
};

const FALLBACK_TONES: MemberAvatarTone[] = ['sage', 'sand', 'mist', 'latte', 'neutral'];

export const getAvatarInitial = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed[0];
};

export const getAvatarTone = (stageCode: StageCode, index: number): MemberAvatarTone =>
  STAGE_TONE[stageCode] ?? FALLBACK_TONES[index % FALLBACK_TONES.length];

export const buildMemberAvatar = (
  name: string,
  stageCode: StageCode,
  index: number,
): { avatarText: string; avatarTone: MemberAvatarTone } => ({
  avatarText: getAvatarInitial(name),
  avatarTone: getAvatarTone(stageCode, index),
});
