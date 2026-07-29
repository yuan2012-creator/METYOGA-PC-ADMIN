import React from 'react';
import type { MemberAvatarTone } from './memberAvatarUtils';

interface MemberAvatarProps {
  text: string;
  tone: MemberAvatarTone;
  size?: 'sm' | 'md';
  className?: string;
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ text, tone, size = 'sm', className = '' }) => (
  <span
    className={`met-member-avatar met-member-avatar--${size} met-member-avatar--${tone}${className ? ` ${className}` : ''}`}
    aria-hidden
  >
    {text}
  </span>
);

export default MemberAvatar;
