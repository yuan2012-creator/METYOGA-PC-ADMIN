import React from 'react';
import { PARTNER_GOVERNANCE_DISCLAIMER_LINES } from '../../utils/partnerSelectors';

const PartnerGovernanceDetailBanner: React.FC = () => (
  <div className="rounded-[18px] border border-slate-300/90 bg-slate-100/90 px-5 py-4 shadow-sm">
    <h2 className="text-base font-bold text-slate-900">合作授权治理明细（第六阶段）</h2>
    <ul className="mt-2 text-xs text-slate-800 space-y-1 list-disc pl-5 leading-relaxed">
      {PARTNER_GOVERNANCE_DISCLAIMER_LINES.map(line => (
        <li key={line}><strong>{line}</strong></li>
      ))}
    </ul>
  </div>
);

export default PartnerGovernanceDetailBanner;
