import React from 'react';
import type { StageCode } from './memberOperationViewModel';
import { stageBadgeClass } from './memberOperationViewModel';

interface MemberStageBadgeProps {
  code: StageCode;
  compact?: boolean;
  showName?: boolean;
}

const MemberStageBadge: React.FC<MemberStageBadgeProps> = ({ code, compact, showName }) => (
  <span
    className={`inline-flex items-center gap-1 rounded font-semibold ${stageBadgeClass(code)} ${
      compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
    }`}
    title={showName ? undefined : code}
  >
    {code}
    {showName ? <span className="font-normal opacity-90">{STAGE_SHORT[code]}</span> : null}
  </span>
);

const STAGE_SHORT: Record<StageCode, string> = {
  S0: '潜在线索',
  S1: '体验预约',
  S2: '体验转化',
  S3: '新会员激活',
  S4: '稳定活跃',
  S5: '价值经营',
  S6: '风险召回',
};

export default MemberStageBadge;
