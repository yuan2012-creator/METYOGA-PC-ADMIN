import React, { Dispatch, SetStateAction } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartLegend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale, Filler } from 'chart.js';
import type { Staff } from '../../types';
import {
  buildStaffDetails,
  calculateTeachingYears,
  getNextStaffLevel,
  type StaffDemoMember,
} from '../../utils/staffSelectors';
import StaffCoursePerformancePanel from './detail/StaffCoursePerformancePanel';
import type { IncomeTimeRange, MemberListTab, PricingConfig, StaffModalTab, TimeRange } from './detail/StaffDetailTypes';
import StaffGrowthPromotionPanel from './detail/StaffGrowthPromotionPanel';
import StaffIncomePayrollPanel from './detail/StaffIncomePayrollPanel';
import StaffMemberFollowupPanel from './detail/StaffMemberFollowupPanel';
import StaffProfileArchivePanel from './detail/StaffProfileArchivePanel';

ChartJS.register(ArcElement, Tooltip, ChartLegend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale, Filler);

const staffModalTabs: Array<{
  id: StaffModalTab;
  title: string;
  unit: string;
  icon: string;
  prefix?: string;
}> = [
  { id: 'course', title: '课程教学', unit: 'h', icon: 'fa-regular fa-clock' },
  { id: 'member', title: '会员运营', unit: '人', icon: 'fa-solid fa-user-group' },
  { id: 'income', title: '收入与耗课', unit: '', prefix: '¥', icon: 'fa-solid fa-wallet' },
  { id: 'promotion', title: '成长体系', unit: '', icon: 'fa-solid fa-medal' },
];

interface StaffDetailModalProps {
  showStaffModal: boolean;
  activeStaff: Staff | null;
  activeModalTab: StaffModalTab;
  setActiveModalTab: (tab: StaffModalTab) => void;
  setShowStaffModal: (show: boolean) => void;
  setActiveStaff: Dispatch<SetStateAction<Staff | null>>;
  courseTimeRange: TimeRange;
  setCourseTimeRange: (range: TimeRange) => void;
  incomeTimeRange: IncomeTimeRange;
  setIncomeTimeRange: (range: IncomeTimeRange) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (isEditing: boolean) => void;
  isEditingPricing: boolean;
  setIsEditingPricing: (isEditing: boolean) => void;
  pricingConfig: PricingConfig;
  setPricingConfig: Dispatch<SetStateAction<PricingConfig>>;
  mockExtendedMembers: StaffDemoMember[];
  filteredMembers: StaffDemoMember[];
  memberListTab: MemberListTab;
  setMemberListTab: (tab: MemberListTab) => void;
  showAdvancedFilter: boolean;
  setShowAdvancedFilter: (show: boolean) => void;
  filterLifecycle: string;
  setFilterLifecycle: (lifecycle: string) => void;
  filterGoal: string;
  setFilterGoal: (goal: string) => void;
  activeFollowUpCategory: string | null;
  setActiveFollowUpCategory: (category: string | null) => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = (props) => {
  const {
    showStaffModal,
    activeStaff,
    activeModalTab,
    setActiveModalTab,
    setShowStaffModal,
    setActiveStaff,
    courseTimeRange,
    setCourseTimeRange,
    incomeTimeRange,
    setIncomeTimeRange,
    isEditingProfile,
    setIsEditingProfile,
    isEditingPricing,
    setIsEditingPricing,
    pricingConfig,
    setPricingConfig,
    mockExtendedMembers,
    filteredMembers,
    memberListTab,
    setMemberListTab,
    showAdvancedFilter,
    setShowAdvancedFilter,
    filterLifecycle,
    setFilterLifecycle,
    filterGoal,
    setFilterGoal,
    activeFollowUpCategory,
    setActiveFollowUpCategory,
  } = props;

  return (
    <>
      {/* --- STAFF DETAIL MODAL --- */}
      {showStaffModal && activeStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 sm:p-12">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity" onClick={() => { setShowStaffModal(false); setIsEditingProfile(false); }}></div>
              <div className="bg-white w-full max-w-[1200px] h-[85vh] rounded-[32px] shadow-2xl z-10 flex overflow-hidden animate-fadeInUp">
                  
                  {(() => {
                      const staffDetails = buildStaffDetails(activeStaff);
                      const teachingYears = calculateTeachingYears(staffDetails.teachingStartDate);

                      return (
                          <>
                              <StaffProfileArchivePanel
                                  activeStaff={activeStaff}
                                  setActiveStaff={setActiveStaff}
                                  staffDetails={staffDetails}
                                  teachingYears={teachingYears}
                                  isEditingProfile={isEditingProfile}
                                  setIsEditingProfile={setIsEditingProfile}
                                  isEditingPricing={isEditingPricing}
                                  setIsEditingPricing={setIsEditingPricing}
                                  pricingConfig={pricingConfig}
                                  setPricingConfig={setPricingConfig}
                              />

                              {/* Right: Data Panorama */}
                              <div className="flex-1 bg-white flex flex-col overflow-hidden">
                                  <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                                      <h3 className="font-bold text-gray-900 text-lg">员工全景看板</h3>
                                      <button onClick={() => { setShowStaffModal(false); setIsEditingProfile(false); }} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition">
                                          <i className="fa-solid fa-xmark"></i>
                                      </button>
                                  </div>

                                  {/* 4 Large Buttons (Tabs) - Fixed */}
                                  <div className="px-6 py-3 bg-white border-b border-gray-100 shrink-0 z-10">
                                      <div className="grid grid-cols-4 gap-3">
                                          {staffModalTabs.map(tab => {
                                              const tabValue = tab.id === 'course'
                                                  ? staffDetails.classHours
                                                  : tab.id === 'member'
                                                      ? staffDetails.memberCount
                                                      : tab.id === 'income'
                                                          ? parseInt(staffDetails.totalRevenue.replace(/,/g, '')) >= 10000
                                                              ? (parseInt(staffDetails.totalRevenue.replace(/,/g, '')) / 1000).toFixed(1) + 'k'
                                                              : staffDetails.totalRevenue
                                                          : staffDetails.level.toUpperCase();

                                              return (
                                              <button 
                                                  key={tab.id}
                                                  onClick={() => setActiveModalTab(tab.id)}
                                                  className={`relative p-3 rounded-xl border transition-all duration-300 flex flex-col items-start justify-between h-20 overflow-hidden ${
                                                      activeModalTab === tab.id 
                                                      ? 'bg-black text-white border-black shadow-md scale-[1.02]' 
                                                      : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                                  }`}
                                              >
                                                  {tab.id === 'promotion' && staffDetails.promotionStatus === 'pending' && (
                                                      <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                      </span>
                                                  )}
                                                  <div className="flex items-center gap-1.5 mb-1 shrink-0">
                                                      <i className={`${tab.icon} ${activeModalTab === tab.id ? 'text-gray-300' : 'text-gray-400'} text-sm`}></i>
                                                      <span className={`text-xs font-bold ${activeModalTab === tab.id ? 'text-gray-300' : 'text-gray-500'}`}>{tab.title}</span>
                                                  </div>
                                                  <div className="text-left w-full overflow-hidden">
                                                      <div className="flex items-baseline gap-1 w-full overflow-hidden">
                                                          {tab.prefix && <span className={`text-sm font-bold shrink-0 ${activeModalTab === tab.id ? 'text-white' : 'text-gray-900'}`}>{tab.prefix}</span>}
                                                          <span className={`text-lg xl:text-xl font-bold font-mono truncate ${activeModalTab === tab.id ? 'text-white' : 'text-gray-900'}`}>{tabValue}</span>
                                                          {tab.unit && <span className={`text-[10px] font-bold shrink-0 ${activeModalTab === tab.id ? 'text-gray-400' : 'text-gray-500'}`}>{tab.unit}</span>}
                                                      </div>
                                                  </div>
                                              </button>
                                          );
                                          })}
                                      </div>
                                      
                                      {/* 晋升操作 - Moved here */}
                                      {staffDetails.promotionStatus === 'pending' && (
                                          <div className="mt-4 p-4 bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-800">
                                              <div>
                                                  <div className="flex items-center gap-3">
                                                      <span className="relative flex h-3 w-3">
                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                      </span>
                                                      <div className="text-sm font-bold text-white">待审批的晋升申请</div>
                                                  </div>
                                                  <div className="text-xs text-gray-400 mt-1">该员工各项指标均已达标，已提交晋升申请，请尽快处理。</div>
                                              </div>
                                              <div className="flex gap-3 w-full md:w-auto">
                                                  <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all border border-gray-700">
                                                      驳回
                                                  </button>
                                                  <button className="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-gray-100 shadow-md transition-all">
                                                      同意晋升至 {getNextStaffLevel(staffDetails.level)}
                                                  </button>
                                              </div>
                                          </div>
                                      )}
                                  </div>

                                  <div className="flex-1 overflow-y-auto p-6 custom-scroll bg-[#FAFAFA] flex flex-col gap-6">
                                      
                                      {activeModalTab === 'course' && (
                                          <StaffCoursePerformancePanel
                                              staffDetails={staffDetails}
                                              courseTimeRange={courseTimeRange}
                                              setCourseTimeRange={setCourseTimeRange}
                                          />
                                      )}

                                      {activeModalTab === 'member' && (
                                          <StaffMemberFollowupPanel
                                              staffDetails={staffDetails}
                                              mockExtendedMembers={mockExtendedMembers}
                                              filteredMembers={filteredMembers}
                                              memberListTab={memberListTab}
                                              setMemberListTab={setMemberListTab}
                                              showAdvancedFilter={showAdvancedFilter}
                                              setShowAdvancedFilter={setShowAdvancedFilter}
                                              filterLifecycle={filterLifecycle}
                                              setFilterLifecycle={setFilterLifecycle}
                                              filterGoal={filterGoal}
                                              setFilterGoal={setFilterGoal}
                                              activeFollowUpCategory={activeFollowUpCategory}
                                              setActiveFollowUpCategory={setActiveFollowUpCategory}
                                          />
                                      )}

                                      {activeModalTab === 'income' && (
                                          <StaffIncomePayrollPanel
                                              staffDetails={staffDetails}
                                              incomeTimeRange={incomeTimeRange}
                                              setIncomeTimeRange={setIncomeTimeRange}
                                          />
                                      )}

                                      {activeModalTab === 'promotion' && (
                                          <StaffGrowthPromotionPanel staffDetails={staffDetails} />
                                      )}

                                  </div>
                              </div>
                          </>
                      );
                  })()}
              </div>
          </div>
      )}


    </>
  );
};

export default StaffDetailModal;
