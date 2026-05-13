import React, { useEffect, useState } from 'react';
import {
  MOCK_ALERTS,
  MOCK_MHS_DATA,
  MOCK_TEAM_TASKS,
} from '../constants';
import type {
  DashboardFinanceReadonlySummary,
  DashboardReadonlySnapshot,
} from '../adapters/dashboardAdapter';
import {
  fetchDashboardFinanceSummary,
  fetchDashboardOperationIssues,
  fetchDashboardPartnerGovernance,
  fetchDashboardReadonlySnapshot,
  fetchDashboardStoreHealth,
  fetchDashboardSuggestions,
} from '../services/dashboardService';
import {
  MHS_CIRCLE_LENGTH,
  formatDashboardMoney,
} from '../utils/dashboardSelectors';
import type {
  DashboardStoreHealthRow,
  DashboardSuggestionRow,
  DashboardTodayIssueRow,
} from '../utils/dashboardSelectors';
import {
  buildPartnerBrandCourseAuthRows,
  buildPartnerDataQualityRows,
  buildPartnerRectificationRenewalRows,
  buildPartnerStoreDetailRows,
} from '../utils/partnerSelectors';
import type { MHSData } from '../types';
import type { PartnerAuthorizationRow } from '../utils/partnerSelectors';
import AlertPanel from './dashboard/AlertPanel';
import DashboardBusinessSuggestionsTable from './dashboard/DashboardBusinessSuggestionsTable';
import DashboardOperatingBrief from './dashboard/DashboardOperatingBrief';
import DashboardSnapshotCards from './dashboard/DashboardSnapshotCards';
import DashboardStoreHealthTable from './dashboard/DashboardStoreHealthTable';
import DashboardTodayIssuesTable from './dashboard/DashboardTodayIssuesTable';
import MhsHealthPanel from './dashboard/MhsHealthPanel';
import MhsRadarPanel from './dashboard/MhsRadarPanel';
import PartnerAuthorizationBrief from './dashboard/PartnerAuthorizationBrief';
import PartnerBrandCourseAuthTable from './dashboard/PartnerBrandCourseAuthTable';
import PartnerDataQualityTable from './dashboard/PartnerDataQualityTable';
import PartnerGovernanceDetailBanner from './dashboard/PartnerGovernanceDetailBanner';
import PartnerRectificationRenewalTable from './dashboard/PartnerRectificationRenewalTable';
import PartnerStoreDetailTable from './dashboard/PartnerStoreDetailTable';
import TeamTaskPanel from './dashboard/TeamTaskPanel';

const DASHBOARD_LOAD_ERROR = '经营总览数据加载失败，请稍后重试';

const Dashboard: React.FC = () => {
  const [activeDimension, setActiveDimension] = useState<MHSData>(MOCK_MHS_DATA['L']);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [readonlySnapshot, setReadonlySnapshot] = useState<DashboardReadonlySnapshot | null>(null);
  const [operationIssueRows, setOperationIssueRows] = useState<DashboardTodayIssueRow[]>([]);
  const [storeHealthRows, setStoreHealthRows] = useState<DashboardStoreHealthRow[]>([]);
  const [suggestionRows, setSuggestionRows] = useState<DashboardSuggestionRow[]>([]);
  const [financeSummary, setFinanceSummary] = useState<DashboardFinanceReadonlySummary | null>(null);
  const [partnerGovernanceRows, setPartnerGovernanceRows] = useState<PartnerAuthorizationRow[]>([]);

  const partnerStoreDetailRows = buildPartnerStoreDetailRows();
  const partnerBrandCourseAuthRows = buildPartnerBrandCourseAuthRows();
  const partnerDataQualityRows = buildPartnerDataQualityRows();
  const partnerRectificationRenewalRows = buildPartnerRectificationRenewalRows();

  useEffect(() => {
    let cancelled = false;
    setIsDashboardLoading(true);
    setDashboardError(null);

    const load = () => {
      const snapRes = fetchDashboardReadonlySnapshot();
      const issuesRes = fetchDashboardOperationIssues();
      const healthRes = fetchDashboardStoreHealth();
      const sugRes = fetchDashboardSuggestions();
      const finRes = fetchDashboardFinanceSummary();
      const partRes = fetchDashboardPartnerGovernance();

      const batch = [snapRes, issuesRes, healthRes, sugRes, finRes, partRes] as const;
      const failed = batch.find(r => r.error != null || r.data === null);

      if (cancelled) return;

      if (failed) {
        setDashboardError(DASHBOARD_LOAD_ERROR);
        setReadonlySnapshot(null);
        setOperationIssueRows([]);
        setStoreHealthRows([]);
        setSuggestionRows([]);
        setFinanceSummary(null);
        setPartnerGovernanceRows([]);
        setIsDashboardLoading(false);
        return;
      }

      setReadonlySnapshot(snapRes.data);
      setOperationIssueRows(issuesRes.data ?? []);
      setStoreHealthRows(healthRes.data ?? []);
      setSuggestionRows(sugRes.data ?? []);
      setFinanceSummary(finRes.data);
      setPartnerGovernanceRows(partRes.data ?? []);
      setDashboardError(null);
      setIsDashboardLoading(false);
    };

    queueMicrotask(load);
    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardSummary = readonlySnapshot?.summary;
  const radarData = readonlySnapshot?.radarData ?? [];
  const snapshotItems = readonlySnapshot?.snapshotItems ?? [];
  const operatingZones = readonlySnapshot?.operatingZoneCards ?? [];

  const isDashboardEmpty =
    !isDashboardLoading &&
    !dashboardError &&
    readonlySnapshot != null &&
    operatingZones.length === 0 &&
    operationIssueRows.length === 0 &&
    storeHealthRows.length === 0 &&
    suggestionRows.length === 0 &&
    partnerGovernanceRows.length === 0;

  const handleRadarDimensionSelect = (activeLabel: string) => {
    const match = radarData.find(d => d.subject === activeLabel);
    if (match) setActiveDimension(MOCK_MHS_DATA[match.key]);
  };

  if (isDashboardLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="rounded-[18px] border border-gray-100 bg-white shadow-sm px-6 py-12 text-center text-sm text-gray-600">
          经营总览数据加载中…
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
  }

  if (dashboardError || !dashboardSummary) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="rounded-[18px] border border-rose-100 bg-rose-50/90 shadow-sm px-6 py-10 text-center text-sm text-rose-900">
          {dashboardError ?? DASHBOARD_LOAD_ERROR}
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
  }

  return (
    <div
      className="space-y-6 animate-fadeIn"
      data-dashboard-finance-readonly={financeSummary ? '1' : '0'}
    >
      {isDashboardEmpty ? (
        <div className="rounded-[18px] border border-gray-100 bg-white shadow-sm px-5 py-3 text-center text-xs text-gray-600">
          暂无可核对经营事项
        </div>
      ) : null}

      <DashboardOperatingBrief zones={operatingZones} />

      <DashboardTodayIssuesTable rows={operationIssueRows} />

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

      <DashboardStoreHealthTable rows={storeHealthRows} />

      {/* 2. Alerts & Team Section */}
      <div className="grid grid-cols-12 gap-6">
          <AlertPanel alerts={MOCK_ALERTS} />
          <TeamTaskPanel tasks={MOCK_TEAM_TASKS} />
      </div>

      <DashboardBusinessSuggestionsTable rows={suggestionRows} />

      <PartnerAuthorizationBrief rows={partnerGovernanceRows} />

      <PartnerGovernanceDetailBanner />

      <PartnerStoreDetailTable rows={partnerStoreDetailRows} />

      <PartnerBrandCourseAuthTable rows={partnerBrandCourseAuthRows} />

      <PartnerDataQualityTable rows={partnerDataQualityRows} />

      <PartnerRectificationRenewalTable rows={partnerRectificationRenewalRows} />

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
