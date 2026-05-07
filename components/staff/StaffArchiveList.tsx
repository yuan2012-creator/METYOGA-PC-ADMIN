import React from 'react';
import type { Staff } from '../../types';
import type { StaffFilterType } from '../../utils/staffSelectors';

type StaffTab = 'decision' | 'archives' | 'schedule';
type StaffModalTab = 'course' | 'member' | 'income' | 'promotion';

interface StaffArchiveListProps {
  activeTab: StaffTab;
  filteredStaff: Staff[];
  filterType: StaffFilterType;
  setFilterType: (filterType: StaffFilterType) => void;
  setActiveStaff: (staff: Staff) => void;
  setActiveModalTab: (tab: StaffModalTab) => void;
  setShowStaffModal: (show: boolean) => void;
}

const StaffArchiveList: React.FC<StaffArchiveListProps> = (props) => {
  const {
    activeTab,
    filteredStaff,
    filterType,
    setFilterType,
    setActiveStaff,
    setActiveModalTab,
    setShowStaffModal,
  } = props;

  return (
    <>
            {/* TAB 2: STAFF ARCHIVES (CARDS) */}
            {activeTab === 'archives' && (
                <div className="animate-fadeIn space-y-6">
                    {/* Promotion Banner */}
                    {filteredStaff.some(s => s.promotionStatus === 'pending') && (
                        <div className="bg-white rounded-2xl p-6 flex items-center justify-between border-l-4 border-red-500 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xl">
                                    <i className="fa-solid fa-medal"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">晋升申请待办</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        有 <span className="text-red-500 font-bold">{filteredStaff.filter(s => s.promotionStatus === 'pending').length}</span> 位老师符合晋升标准，请及时审核。
                                    </p>
                                </div>
                            </div>
                            <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition">
                                立即处理
                            </button>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {['all', 'leads', 'adjust', 'new', 'part_time'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => setFilterType(type as any)} 
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                        filterType === type 
                                        ? 'bg-black text-white border-black shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                                >
                                    {type === 'all' ? '全部' : type === 'leads' ? '适合接体验' : type === 'adjust' ? '需调整' : type === 'new' ? '新老师' : '兼职 (Part-Time)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStaff.map(s => (
                            <div key={s.id} onClick={() => { setActiveStaff(s); setActiveModalTab('course'); setShowStaffModal(true); }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer relative">
                                {/* Top Badges */}
                                <div className="flex justify-between items-start mb-2">
                                    {s.promotionStatus === 'pending' ? (
                                        <span className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>申请晋升
                                        </span>
                                    ) : <div></div>}
                                    
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider ${
                                        s.level === 'mentor' ? 'bg-black text-white' : 
                                        s.level === 't3' ? 'bg-gray-900 text-white' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {s.level === 'mentor' ? 'MASTER' : s.level.toUpperCase()}
                                    </span>
                                </div>

                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-gray-50 mx-auto mb-3 border-4 border-gray-50 overflow-hidden">
                                    <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Name & Rating */}
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-gray-900">{s.name}</span>
                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <i className="fa-solid fa-star"></i> {s.rating}
                                    </span>
                                </div>

                                {/* Title */}
                                <div className="text-xs text-gray-500 text-center mb-4">{s.title}</div>

                                {/* Tags */}
                                <div className="flex justify-center flex-wrap gap-2 mb-6 min-h-[24px]">
                                    {s.tags.map(t => (
                                        <span key={t} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded font-medium">{t}</span>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-50 mb-4"></div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-y-4 text-center">
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-1">会员</div>
                                        <div className="text-base font-bold text-gray-900">{s.memberCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-1">课时</div>
                                        <div className="text-base font-bold text-gray-900">{s.classHours}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-1">耗课</div>
                                        <div className="text-base font-bold text-gray-900">{Math.floor(s.classHours * 0.85)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-1">成交率</div>
                                        <div className="text-base font-bold text-gray-900">{s.conversionRate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-1">满座率</div>
                                        <div className="text-base font-bold text-gray-900">{s.occupancyRate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-400 mb-1">跟进率</div>
                                        <div className={`text-base font-bold ${(s.followUpRate || 0) < 50 ? 'text-red-500' : 'text-gray-900'}`}>
                                            {s.followUpRate || 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredStaff.length === 0 && (
                        <div className="text-center py-20 text-gray-400 text-sm">没有找到符合条件的员工</div>
                    )}
                </div>
            )}


    </>
  );
};

export default StaffArchiveList;
