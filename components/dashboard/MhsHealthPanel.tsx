import React from 'react';

interface MhsHealthPanelProps {
  mhsScore: number;
  mhsStatusLabel: string;
  mhsStatusClass: string;
  mhsStrokeOffset: number;
  circleLength: number;
  paidPaymentAmount: number;
  consumedAttendanceCount: number;
  activeMemberCount: number;
  pendingContractCount: number;
  formatMoney: (amount: number) => string;
}

const MhsHealthPanel: React.FC<MhsHealthPanelProps> = ({
  mhsScore,
  mhsStatusLabel,
  mhsStatusClass,
  mhsStrokeOffset,
  circleLength,
  paidPaymentAmount,
  consumedAttendanceCount,
  activeMemberCount,
  pendingContractCount,
  formatMoney,
}) => (
  <div className="w-full lg:w-1/4 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50">
    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">MHS 门店健康指数</div>
    <div className="relative mb-4 w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" stroke="#F3F4F6" strokeWidth="12" fill="none"/>
        <circle cx="80" cy="80" r="70" stroke="#000" strokeWidth="12" fill="none" strokeDasharray={circleLength} strokeDashoffset={mhsStrokeOffset} strokeLinecap="round"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tighter text-[#1D1D1F]">{mhsScore}</span>
        <span className="text-xs text-gray-400 mt-1">分</span>
      </div>
    </div>
    <div className={`px-3 py-1 text-xs font-bold rounded-full mb-6 ${mhsStatusClass}`}>
      {mhsStatusLabel}
    </div>
    <div className="w-full grid grid-cols-2 gap-4 text-center">
      <div><div className="text-xs text-gray-400">近期收款</div><div className="font-bold text-[#1D1D1F]">{formatMoney(paidPaymentAmount)}</div></div>
      <div><div className="text-xs text-gray-400">已消课</div><div className="font-bold text-[#1D1D1F]">{consumedAttendanceCount}节</div></div>
      <div><div className="text-xs text-gray-400">活跃会员</div><div className="font-bold text-[#1D1D1F]">{activeMemberCount}人</div></div>
      <div><div className="text-xs text-gray-400">待签合同</div><div className="font-bold text-[#1D1D1F]">{pendingContractCount}份</div></div>
    </div>
  </div>
);

export default MhsHealthPanel;
