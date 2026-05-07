import React from 'react';
import type { DashboardSnapshotItem } from '../../utils/dashboardSelectors';

interface DashboardSnapshotCardsProps {
  items: DashboardSnapshotItem[];
}

const DashboardSnapshotCards: React.FC<DashboardSnapshotCardsProps> = ({ items }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
    {items.map((item) => (
      <div key={item.label} className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.tone}`}>
          <i className={item.icon}></i>
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-400">{item.label}</div>
          <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">{item.value}</div>
          <div className="text-xs text-gray-500 mt-1 truncate">{item.desc}</div>
        </div>
      </div>
    ))}
  </div>
);

export default DashboardSnapshotCards;
