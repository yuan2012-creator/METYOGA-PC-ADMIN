
import React, { useState, useMemo } from 'react';
import { MOCK_STAFF_LIST } from '../constants';
import { Staff } from '../types';
import {
  buildStaffDemoMembers,
  buildStaffMatrixData,
  buildStaffRankings,
  filterStaffDemoMembers,
  filterStaffList,
  STAFF_TABS,
  type StaffFilterType,
  type StaffTab,
} from '../utils/staffSelectors';
import StaffArchiveList from './staff/StaffArchiveList';
import StaffDecisionPanel from './staff/StaffDecisionPanel';
import StaffDetailModal from './staff/StaffDetailModal';
import StaffSchedulePanel from './staff/StaffSchedulePanel';

const StaffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StaffTab>('decision');
  const [filterType, setFilterType] = useState<StaffFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'course' | 'member' | 'income' | 'promotion'>('course');
  const [courseTimeRange, setCourseTimeRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [incomeTimeRange, setIncomeTimeRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeDecisionIdx, setActiveDecisionIdx] = useState<number | null>(null);
  
  // Member List Filtering State
  const [memberListTab, setMemberListTab] = useState<'all' | 'private' | 'followup'>('followup');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterLifecycle, setFilterLifecycle] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [activeFollowUpCategory, setActiveFollowUpCategory] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  // Pricing Settings State
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [pricingConfig, setPricingConfig] = useState({
    basic: 3.5,
    shaping: 4.0,
    therapy: 4.5,
    prenatal: 5.0,
    trial: 99,
    acceptPoints: true
  });

  const showStaffFeedback = (message: string) => {
    setToast({ id: Date.now(), message });
    window.setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 2400);
  };

  // --- Logic 1: AI Decision Cards ---
  const decisions = [
    { title: '课程质量与出勤', leads: 'David(评分4.2) / Leo(迟到1次)', action: '去排查', color: 'border-l-red-500' },
    { title: '业绩转化与续费', leads: 'Leo(转化低) / Sarah(高续费)', action: '去复盘', color: 'border-l-blue-500' },
    { title: '会员跟进与预警', leads: 'Mike(3人未跟进/2人将过期)', action: '去催办', color: 'border-l-orange-500' },
    { title: '当前空闲可用', leads: 'Anna / Chloe (当前无课)', action: '去排课', color: 'border-l-green-500' }
  ];

  // --- Logic 2: Matrix Data ---
  const matrixData = useMemo(() => {
    return buildStaffMatrixData(MOCK_STAFF_LIST);
  }, []);

  // --- Logic 3: Rankings ---
  const {
    consumptionTop,
    conversionTop,
    occupancyBottom,
    followUpBottom,
  } = useMemo(() => buildStaffRankings(MOCK_STAFF_LIST), []);

  // --- Logic 4: Filtered Staff List ---
  const filteredStaff = useMemo(() => {
    return filterStaffList(MOCK_STAFF_LIST, filterType, searchQuery);
  }, [filterType, searchQuery]);

  const mockExtendedMembers = useMemo(() => {
    return buildStaffDemoMembers(activeStaff);
  }, [activeStaff]);

  const filteredMembers = useMemo(() => {
    return filterStaffDemoMembers(mockExtendedMembers, {
      memberListTab,
      filterLifecycle,
      filterGoal,
      activeFollowUpCategory,
    });
  }, [mockExtendedMembers, memberListTab, filterLifecycle, filterGoal, activeFollowUpCategory]);

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] animate-fadeIn text-[#1D1D1F] font-sans relative">
      
      {/* --- STANDARD HEADER --- */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">师资与团队</h2>
          </div>
          <div className="flex items-center gap-4">
              <div className="relative group">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input 
                      type="text" 
                      placeholder="搜索员工..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg text-xs w-64 transition-all outline-none"
                  />
              </div>
              <button type="button" className="met-primary-button text-xs">
                  + 新增员工
              </button>
          </div>
      </div>

      {/* --- SUB NAVIGATION --- */}
      <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
              {STAFF_TABS.map(tab => (
                  <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative z-10 px-6 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${
                          activeTab === tab.id 
                          ? 'bg-white text-black shadow-sm font-bold' 
                          : 'text-gray-500 hover:text-black'
                      }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* --- CONTENT AREA (Scrollable) --- */}
      <div className="flex-1 overflow-y-auto p-8 custom-scroll">
          <div className="max-w-[1440px] mx-auto space-y-8">

            <StaffDecisionPanel
              activeTab={activeTab}
              decisions={decisions}
              matrixData={matrixData}
              conversionTop={conversionTop}
              consumptionTop={consumptionTop}
              occupancyBottom={occupancyBottom}
              followUpBottom={followUpBottom}
              activeDecisionIdx={activeDecisionIdx}
              setActiveDecisionIdx={setActiveDecisionIdx}
              setActiveStaff={setActiveStaff}
              setActiveModalTab={setActiveModalTab}
              setShowStaffModal={setShowStaffModal}
            />

            <StaffArchiveList
              activeTab={activeTab}
              filteredStaff={filteredStaff}
              filterType={filterType}
              setFilterType={setFilterType}
              setActiveStaff={setActiveStaff}
              setActiveModalTab={setActiveModalTab}
              setShowStaffModal={setShowStaffModal}
            />

            <StaffSchedulePanel activeTab={activeTab} onDemoAction={showStaffFeedback} />

          </div>
      </div>

      <StaffDetailModal
        showStaffModal={showStaffModal}
        activeStaff={activeStaff}
        activeModalTab={activeModalTab}
        setActiveModalTab={setActiveModalTab}
        setShowStaffModal={setShowStaffModal}
        setActiveStaff={setActiveStaff}
        courseTimeRange={courseTimeRange}
        setCourseTimeRange={setCourseTimeRange}
        incomeTimeRange={incomeTimeRange}
        setIncomeTimeRange={setIncomeTimeRange}
        isEditingProfile={isEditingProfile}
        setIsEditingProfile={setIsEditingProfile}
        isEditingPricing={isEditingPricing}
        setIsEditingPricing={setIsEditingPricing}
        pricingConfig={pricingConfig}
        setPricingConfig={setPricingConfig}
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
        onDemoAction={showStaffFeedback}
      />

      {toast && (
        <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
          <div className="px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 bg-white text-gray-800 border-gray-100">
            <i className="fa-solid fa-circle-info text-blue-500"></i>
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #E5E5EA; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StaffPage;
