import React, { useState } from 'react';
import {
  MOCK_ALERTS,
  MOCK_MHS_DATA,
  MOCK_TEAM_TASKS,
} from '../constants';
import {
  MHS_CIRCLE_LENGTH,
  buildDashboardSummary,
  buildRadarData,
  buildSnapshotItems,
  formatDashboardMoney,
} from '../utils/dashboardSelectors';
import type { MHSData } from '../types';
import AlertPanel from './dashboard/AlertPanel';
import DashboardSnapshotCards from './dashboard/DashboardSnapshotCards';
import MhsHealthPanel from './dashboard/MhsHealthPanel';
import MhsRadarPanel from './dashboard/MhsRadarPanel';
import TeamTaskPanel from './dashboard/TeamTaskPanel';

const Dashboard: React.FC = () => {
  const [activeDimension, setActiveDimension] = useState<MHSData>(MOCK_MHS_DATA['L']);
  const radarData = buildRadarData();
  const dashboardSummary = buildDashboardSummary();
  const snapshotItems = buildSnapshotItems(dashboardSummary);

  const handleRadarDimensionSelect = (activeLabel: string) => {
    const match = radarData.find(d => d.subject === activeLabel);
    if (match) setActiveDimension(MOCK_MHS_DATA[match.key]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. MHS Overview Section */}
      <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[420px]">
        <MhsHealthPanel
          mhsScore={dashboardSummary.mhsScore}
          mhsStatusLabel={dashboardSummary.mhsStatusLabel}
          mhsStatusClass={dashboardSummary.mhsStatusClass}
          mhsStrokeOffset={dashboardSummary.mhsStrokeOffset}
          circleLength={MHS_CIRCLE_LENGTH}
          paidPaymentAmount={dashboardSummary.paidPaymentAmount}
          consumedAttendanceCount={dashboardSummary.consumedAttendanceCount}
          activeMemberCount={dashboardSummary.activeMemberCount}
          pendingContractCount={dashboardSummary.pendingContractCount}
          formatMoney={formatDashboardMoney}
        />
        <MhsRadarPanel
          radarData={radarData}
          activeDimension={activeDimension}
          onDimensionSelect={handleRadarDimensionSelect}
        />
      </div>

      <DashboardSnapshotCards items={snapshotItems} />

      {/* 2. Alerts & Team Section */}
      <div className="grid grid-cols-12 gap-6">
          <AlertPanel alerts={MOCK_ALERTS} />
          <TeamTaskPanel tasks={MOCK_TEAM_TASKS} />
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
