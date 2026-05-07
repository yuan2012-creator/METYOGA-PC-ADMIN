import React, { Dispatch, SetStateAction } from 'react';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartLegend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale, Filler } from 'chart.js';
import type { Staff } from '../../types';
import {
  buildStaffDetails,
  calculateTeachingYears,
  getNextStaffLevel,
  type StaffDemoMember,
} from '../../utils/staffSelectors';

ChartJS.register(ArcElement, Tooltip, ChartLegend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale, Filler);

type StaffModalTab = 'course' | 'member' | 'income' | 'promotion';
type TimeRange = 'week' | 'month' | 'quarter' | 'all';
type IncomeTimeRange = 'week' | 'month' | 'quarter' | 'all';
type MemberListTab = 'all' | 'private' | 'followup';

interface PricingConfig {
  basic: number;
  shaping: number;
  therapy: number;
  prenatal: number;
  trial: number;
  acceptPoints: boolean;
}

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

                      const renderProgressBar = (label: string, targetStr: string, currentStr: string, currentVal: number, targetVal: number, reverse: boolean = false) => {
                          let progress = 0;
                          if (reverse) {
                              progress = currentVal <= targetVal ? 100 : Math.max(0, 100 - (currentVal - targetVal) * 20);
                          } else {
                              progress = Math.min(100, (currentVal / targetVal) * 100);
                          }
                          const isMet = progress >= 100;
                          
                          return (
                              <div className="bg-gray-50 p-3 rounded-xl">
                                  <div className="flex justify-between items-end mb-2">
                                      <div className="text-[10px] text-gray-500">{label} (目标: {targetStr})</div>
                                      <div className={`text-sm font-bold ${isMet ? 'text-green-600' : 'text-gray-900'}`}>{currentStr}</div>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                                      <div className={`h-full ${isMet ? 'bg-green-500' : 'bg-black'} rounded-full`} style={{ width: `${progress}%` }}></div>
                                  </div>
                              </div>
                          );
                      };

                      return (
                          <>
                              {/* Left: Availability & Profile */}
                              <div className="w-[400px] bg-[#FAFAFA] border-r border-gray-200 overflow-y-auto custom-scroll flex flex-col">
                                  <div className="p-6 text-center border-b border-gray-100 relative shrink-0">
                                      <div className="w-20 h-20 rounded-full mx-auto mb-3 p-1 border border-gray-200 bg-white shadow-sm">
                                          <img src={staffDetails.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                      </div>
                                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{staffDetails.name}</h2>
                                      <div className="text-xs text-gray-500 mt-1.5 font-mono">{staffDetails.phone}</div>
                                      <div className="flex items-center justify-center gap-2 mt-3">
                                          <span className="px-2.5 py-1 bg-black text-white rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">{staffDetails.level}</span>
                                          <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">西湖馆</span>
                                          <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{staffDetails.revenueModel}</span>
                                      </div>
                                      <div className="mt-4 text-left">
                                          <div className="flex justify-between text-[10px] font-bold mb-2">
                                              <span className="text-gray-900">{staffDetails.level.toUpperCase()}</span>
                                              <span className="text-gray-500">职级综合达成</span>
                                              <span className="text-gray-400">{getNextStaffLevel(staffDetails.level)}</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                              <div className="h-full bg-black rounded-full" style={{ width: '88%' }}></div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="p-6 space-y-6">
                                      {/* 角色属性 */}
                                      <div>
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">基础信息</div>
                                          <div className="grid grid-cols-2 gap-3">
                                              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative group">
                                                  <div className="text-[10px] text-gray-400 mb-1 font-bold">入职时间</div>
                                                  {isEditingProfile ? (
                                                      <input 
                                                          type="date" 
                                                          value={staffDetails.joinDate}
                                                          onChange={(e) => setActiveStaff({ ...activeStaff, joinDate: e.target.value } as Staff)}
                                                          className="text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                                                      />
                                                  ) : (
                                                      <div className="text-sm font-bold text-gray-900">{staffDetails.joinDate}</div>
                                                  )}
                                              </div>
                                              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative group">
                                                  <div className="text-[10px] text-gray-400 mb-1 font-bold">教龄起点</div>
                                                  {isEditingProfile ? (
                                                      <input 
                                                          type="date" 
                                                          value={staffDetails.teachingStartDate}
                                                          onChange={(e) => setActiveStaff({ ...activeStaff, teachingStartDate: e.target.value } as Staff)}
                                                          className="text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                                                      />
                                                  ) : (
                                                      <>
                                                          <div className="text-sm font-bold text-gray-900">{teachingYears} <span className="text-xs text-gray-400 font-normal ml-1">({staffDetails.teachingStartDate})</span></div>
                                                      </>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      {/* 自我介绍 */}
                                      <div>
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">自我介绍</div>
                                          <p className="text-xs text-gray-600 leading-relaxed bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">{staffDetails.intro}</p>
                                      </div>

                                      {/* 课程偏好 */}
                                      <div>
                                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">课程偏好</div>
                                          <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                              <div>
                                                  <div className="text-xs text-gray-500 mb-2 font-bold">私教方向</div>
                                                  {isEditingProfile ? (
                                                      <input 
                                                          type="text" 
                                                          value={staffDetails.privateSpecialties.join(', ')}
                                                          onChange={(e) => setActiveStaff({ ...activeStaff, privateSpecialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as Staff)}
                                                          placeholder="用逗号分隔"
                                                          className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full outline-none focus:border-blue-500"
                                                      />
                                                  ) : (
                                                      <div className="flex flex-wrap gap-2">
                                                          {staffDetails.privateSpecialties.map(t => (
                                                              <span key={t} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700">{t}</span>
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                              <div className="border-t border-gray-50"></div>
                                              <div>
                                                  <div className="text-xs text-gray-500 mb-2 font-bold">小班/团课</div>
                                                  {isEditingProfile ? (
                                                      <input 
                                                          type="text" 
                                                          value={staffDetails.groupSpecialties.join(', ')}
                                                          onChange={(e) => setActiveStaff({ ...activeStaff, groupSpecialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as Staff)}
                                                          placeholder="用逗号分隔"
                                                          className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full outline-none focus:border-blue-500"
                                                      />
                                                  ) : (
                                                      <div className="flex flex-wrap gap-2">
                                                          {staffDetails.groupSpecialties.map(t => (
                                                              <span key={t} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700">{t}</span>
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                              <div className="border-t border-gray-50"></div>
                                              <div>
                                                  <div className="text-xs text-gray-500 mb-2 font-bold">不接待人群</div>
                                                  {isEditingProfile ? (
                                                      <input 
                                                          type="text" 
                                                          value={staffDetails.nonReceptionGroups.join(', ')}
                                                          onChange={(e) => setActiveStaff({ ...activeStaff, nonReceptionGroups: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as Staff)}
                                                          placeholder="用逗号分隔"
                                                          className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 w-full outline-none focus:border-red-500"
                                                      />
                                                  ) : (
                                                      <div className="flex flex-wrap gap-2">
                                                          {staffDetails.nonReceptionGroups.map(t => (
                                                              <span key={t} className="px-3 py-1 bg-red-50 border border-red-100 rounded-lg text-[11px] font-bold text-red-600">{t}</span>
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      {/* 私教价格与设置 */}
                                      <div>
                                          <div className="flex justify-between items-center mb-2">
                                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">私教价格与设置</div>
                                              <button onClick={() => setIsEditingPricing(!isEditingPricing)} className="text-[10px] text-blue-500 font-bold hover:text-blue-600 transition-colors">
                                                  {isEditingPricing ? '保存设置' : '店长调整'}
                                              </button>
                                          </div>
                                          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                              <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-500 font-bold">基础私教</span>
                                                  {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.basic} onChange={e => setPricingConfig({...pricingConfig, basic: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.basic} 点</span>}
                                              </div>
                                              <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-500 font-bold">塑形私教</span>
                                                  {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.shaping} onChange={e => setPricingConfig({...pricingConfig, shaping: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.shaping} 点</span>}
                                              </div>
                                              <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-500 font-bold">理疗私教</span>
                                                  {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.therapy} onChange={e => setPricingConfig({...pricingConfig, therapy: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.therapy} 点</span>}
                                              </div>
                                              <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-500 font-bold">孕产私教</span>
                                                  {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.prenatal} onChange={e => setPricingConfig({...pricingConfig, prenatal: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.prenatal} 点</span>}
                                              </div>
                                              <div className="border-t border-gray-50 pt-3 mt-3"></div>
                                              <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-500 font-bold">体验价</span>
                                                  {isEditingPricing ? <div className="flex items-center gap-1"><span className="text-gray-400">¥</span><input type="number" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.trial} onChange={e => setPricingConfig({...pricingConfig, trial: Number(e.target.value)})} /></div> : <span className="font-mono font-bold text-gray-900">¥{pricingConfig.trial}</span>}
                                              </div>
                                              <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-500 font-bold">积分+现金兑换</span>
                                                  {isEditingPricing ? (
                                                      <label className="relative inline-flex items-center cursor-pointer">
                                                          <input type="checkbox" className="sr-only peer" checked={pricingConfig.acceptPoints} onChange={e => setPricingConfig({...pricingConfig, acceptPoints: e.target.checked})} />
                                                          <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black"></div>
                                                      </label>
                                                  ) : (
                                                      <span className={`font-bold ${pricingConfig.acceptPoints ? 'text-green-500' : 'text-gray-400'}`}>{pricingConfig.acceptPoints ? '支持' : '不支持'}</span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      {/* 资质认证 */}
                                      <div>
                                          <div className="flex justify-between items-center mb-2">
                                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">资质认证</div>
                                              {isEditingProfile && (
                                                  <button onClick={() => {
                                                      const newCert = prompt('请输入证书名称');
                                                      if (newCert) {
                                                          setActiveStaff({
                                                              ...activeStaff,
                                                              certs: [...(activeStaff.certs || []), newCert],
                                                              certImages: [...(activeStaff.certImages || []), 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400']
                                                          } as Staff);
                                                      }
                                                  }} className="text-[10px] text-blue-500 hover:underline"><i className="fa-solid fa-plus"></i> 上传证书</button>
                                              )}
                                          </div>
                                          <div className="space-y-2">
                                              {staffDetails.certs.map((c, idx) => (
                                                  <div key={c} className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                                                      {isEditingProfile && (
                                                          <button onClick={() => {
                                                              const newCerts = [...(activeStaff.certs || [])];
                                                              const newImages = [...(activeStaff.certImages || [])];
                                                              newCerts.splice(idx, 1);
                                                              newImages.splice(idx, 1);
                                                              setActiveStaff({ ...activeStaff, certs: newCerts, certImages: newImages } as Staff);
                                                          }} className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-100"><i className="fa-solid fa-xmark"></i></button>
                                                      )}
                                                      <div className="flex items-center gap-3 text-xs text-gray-900 font-bold">
                                                          <div className="w-6 h-6 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 text-[10px]">
                                                              <i className="fa-solid fa-certificate"></i>
                                                          </div>
                                                          {c}
                                                      </div>
                                                      {staffDetails.certImages[idx] && (
                                                          <div className="w-full h-24 rounded-lg overflow-hidden border border-gray-100 mt-2">
                                                              <img src={staffDetails.certImages[idx]} alt="Certificate" className="w-full h-full object-cover" />
                                                          </div>
                                                      )}
                                                  </div>
                                              ))}
                                          </div>
                                      </div>

                                      {/* 课程视频 */}
                                      <div>
                                          <div className="flex justify-between items-center mb-2">
                                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">课程视频</div>
                                              {isEditingProfile && (
                                                  <button onClick={() => {
                                                      const newVideo = prompt('请输入视频标题');
                                                      if (newVideo) {
                                                          setActiveStaff({
                                                              ...activeStaff,
                                                              courseVideos: [...(activeStaff.courseVideos || []), { title: newVideo, url: '#', thumb: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400' }]
                                                          } as Staff);
                                                      }
                                                  }} className="text-[10px] text-blue-500 hover:underline"><i className="fa-solid fa-plus"></i> 上传视频</button>
                                              )}
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                              {staffDetails.courseVideos.map((v, idx) => (
                                                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-100 group cursor-pointer">
                                                      {isEditingProfile && (
                                                          <button onClick={(e) => {
                                                              e.stopPropagation();
                                                              const newVideos = [...(activeStaff.courseVideos || [])];
                                                              newVideos.splice(idx, 1);
                                                              setActiveStaff({ ...activeStaff, courseVideos: newVideos } as Staff);
                                                          }} className="absolute top-1 right-1 z-10 w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-100"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                                                      )}
                                                      <img src={v.thumb} alt={v.title} className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-500" />
                                                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                          <i className="fa-solid fa-play text-white text-xl opacity-80 group-hover:opacity-100 transition-opacity"></i>
                                                      </div>
                                                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                          <div className="text-[10px] text-white font-bold truncate">{v.title}</div>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Edit Button */}
                                  <div className="p-4 bg-white border-t border-gray-200 shrink-0 sticky bottom-0 z-10">
                                      <button 
                                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                                          className={`w-full py-3 rounded-2xl font-bold text-sm transition shadow-lg ${isEditingProfile ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'}`}>
                                          {isEditingProfile ? '保存档案修改' : '编辑全项档案'}
                                      </button>
                                  </div>
                              </div>

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
                                          {[
                                              { id: 'course', title: '课程教学', value: staffDetails.classHours, unit: 'h', icon: 'fa-regular fa-clock' },
                                              { id: 'member', title: '会员运营', value: staffDetails.memberCount, unit: '人', icon: 'fa-solid fa-user-group' },
                                              { id: 'income', title: '收入与耗课', value: parseInt(staffDetails.totalRevenue.replace(/,/g, '')) >= 10000 ? (parseInt(staffDetails.totalRevenue.replace(/,/g, '')) / 1000).toFixed(1) + 'k' : staffDetails.totalRevenue, unit: '', prefix: '¥', icon: 'fa-solid fa-wallet' },
                                              { id: 'promotion', title: '成长体系', value: staffDetails.level.toUpperCase(), unit: '', icon: 'fa-solid fa-medal' }
                                          ].map(tab => (
                                              <button 
                                                  key={tab.id}
                                                  onClick={() => setActiveModalTab(tab.id as any)}
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
                                                          <span className={`text-lg xl:text-xl font-bold font-mono truncate ${activeModalTab === tab.id ? 'text-white' : 'text-gray-900'}`}>{tab.value}</span>
                                                          {tab.unit && <span className={`text-[10px] font-bold shrink-0 ${activeModalTab === tab.id ? 'text-gray-400' : 'text-gray-500'}`}>{tab.unit}</span>}
                                                      </div>
                                                  </div>
                                              </button>
                                          ))}
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
                                      
                                      {/* 1. 课程信息 (Course Info) */}
                                      {activeModalTab === 'course' && (
                                          <div className="space-y-6 animate-fadeIn">
                                              <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                                                  <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                                      <i className="fa-solid fa-chart-pie text-purple-500"></i> 课型分布与综合评分
                                                  </h4>
                                                  <div className="flex items-center gap-12">
                                                      <div className="w-32 h-32 relative shrink-0">
                                                          <Doughnut 
                                                              data={{
                                                                  labels: ['私教课程', '小班课程', '团课课程'],
                                                                  datasets: [{
                                                                      data: [25, 35, 40],
                                                                      backgroundColor: ['#1D1D1F', '#6B7280', '#E5E7EB'],
                                                                      borderWidth: 0,
                                                                  }]
                                                              }}
                                                              options={{ cutout: '75%', plugins: { legend: { display: false }, tooltip: {enabled: false} } }}
                                                          />
                                                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                              <span className="text-2xl font-bold font-mono text-gray-900">{staffDetails.classHours}</span>
                                                              <span className="text-[10px] text-gray-400">总课时</span>
                                                          </div>
                                                      </div>
                                                      <div className="flex-1 space-y-3">
                                                          <div className="flex justify-between text-sm items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"><span className="text-gray-600 flex items-center gap-2 font-bold text-xs"><span className="w-2.5 h-2.5 rounded-full bg-black"></span>私教课程</span><span className="font-bold font-mono">25%</span></div>
                                                          <div className="flex justify-between text-sm items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"><span className="text-gray-600 flex items-center gap-2 font-bold text-xs"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>小班课程</span><span className="font-bold font-mono">35%</span></div>
                                                          <div className="flex justify-between text-sm items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"><span className="text-gray-600 flex items-center gap-2 font-bold text-xs"><span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>团课课程</span><span className="font-bold font-mono">40%</span></div>
                                                      </div>
                                                      <div className="w-px h-24 bg-gray-100 hidden lg:block"></div>
                                                      <div className="shrink-0 flex flex-col items-center justify-center px-4">
                                                          <div className="text-[10px] text-gray-400 uppercase mb-2 font-bold">综合平均评分</div>
                                                          <div className="flex items-baseline gap-1">
                                                              <div className="text-5xl font-bold font-mono text-yellow-500">{staffDetails.rating}</div>
                                                          </div>
                                                          <div className="flex gap-1 text-yellow-500 text-xs mt-2">
                                                              <i className="fa-solid fa-star"></i>
                                                              <i className="fa-solid fa-star"></i>
                                                              <i className="fa-solid fa-star"></i>
                                                              <i className="fa-solid fa-star"></i>
                                                              <i className="fa-solid fa-star-half-stroke"></i>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* 课程表现趋势图 */}
                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <div className="flex justify-between items-center mb-5">
                                                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                          <i className="fa-solid fa-chart-line text-gray-900"></i> 课程表现趋势
                                                      </h4>
                                                      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                                                          {['week', 'month', 'quarter'].map(range => (
                                                              <button 
                                                                  key={range}
                                                                  onClick={() => setCourseTimeRange(range as any)}
                                                                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${courseTimeRange === range ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                                              >
                                                                  {range === 'week' ? '周' : range === 'month' ? '月' : '季度'}
                                                              </button>
                                                          ))}
                                                      </div>
                                                  </div>
                                                  <div className="h-64 w-full">
                                                      <Bar 
                                                          data={{
                                                              labels: courseTimeRange === 'week' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] : courseTimeRange === 'month' ? ['第1周', '第2周', '第3周', '第4周'] : ['一月', '二月', '三月'],
                                                              datasets: [
                                                                  {
                                                                      type: 'bar' as const,
                                                                      label: '排课数',
                                                                      data: courseTimeRange === 'week' ? [3, 4, 3, 5, 4, 6, 5] : courseTimeRange === 'month' ? [15, 18, 16, 20] : [60, 65, 70],
                                                                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                                      borderColor: 'rgba(0, 0, 0, 0.1)',
                                                                      borderWidth: { top: 1, right: 1, bottom: 0, left: 1 },
                                                                      borderDash: [5, 5],
                                                                      borderRadius: 4,
                                                                      grouped: false,
                                                                      maxBarThickness: 16,
                                                                      order: 2,
                                                                      yAxisID: 'y'
                                                                  },
                                                                  {
                                                                      type: 'bar' as const,
                                                                      label: '开课数',
                                                                      data: courseTimeRange === 'week' ? [2, 4, 3, 4, 4, 5, 5] : courseTimeRange === 'month' ? [12, 16, 15, 18] : [50, 55, 60],
                                                                      backgroundColor: '#1D1D1F',
                                                                      borderRadius: 4,
                                                                      grouped: false,
                                                                      maxBarThickness: 16,
                                                                      order: 1,
                                                                      yAxisID: 'y'
                                                                  },
                                                                  {
                                                                      type: 'line' as const,
                                                                      label: '开课率(%)',
                                                                      data: courseTimeRange === 'week' ? [66, 100, 100, 80, 100, 83, 100] : courseTimeRange === 'month' ? [80, 88, 93, 90] : [83, 84, 85],
                                                                      borderColor: '#3B82F6',
                                                                      backgroundColor: '#3B82F6',
                                                                      borderDash: [5, 5],
                                                                      tension: 0.4,
                                                                      order: 0,
                                                                      yAxisID: 'y1'
                                                                  }
                                                              ]
                                                          }}
                                                          options={{
                                                              responsive: true,
                                                              maintainAspectRatio: false,
                                                              plugins: { 
                                                                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } },
                                                                  tooltip: {
                                                                      mode: 'index',
                                                                      intersect: false,
                                                                  }
                                                              },
                                                              scales: { 
                                                                  y: { 
                                                                      type: 'linear',
                                                                      display: true,
                                                                      position: 'left',
                                                                      beginAtZero: true, 
                                                                      grid: { color: '#F3F4F6' } 
                                                                  }, 
                                                                  y1: {
                                                                      type: 'linear',
                                                                      display: true,
                                                                      position: 'right',
                                                                      beginAtZero: true,
                                                                      max: 100,
                                                                      grid: { drawOnChartArea: false },
                                                                      ticks: {
                                                                          callback: function(value) {
                                                                              return value + '%';
                                                                          }
                                                                      }
                                                                  },
                                                                  x: { 
                                                                      grid: { display: false } 
                                                                  } 
                                                              }
                                                          }}
                                                      />
                                                  </div>
                                              </div>

                                              {/* 画像与排行榜 Grid */}
                                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                  {/* 上课风格画像 */}
                                                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col">
                                                      <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                          <i className="fa-solid fa-masks-theater text-red-500"></i> 上课风格画像
                                                      </h4>
                                                      <div className="mb-4">
                                                          <span className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full font-bold border border-red-100 inline-block">
                                                              活力实战型教练
                                                          </span>
                                                      </div>
                                                      <div className="w-full flex-1 min-h-[280px] flex justify-center items-center">
                                                          <Radar 
                                                              data={{
                                                                  labels: [
                                                                      ['活力动感 85', '高于92%同类'], 
                                                                      ['肢体辅助 60', '低于70%同类'], 
                                                                      ['温和亲和 75', '高于80%同类'], 
                                                                      ['动作实践 90', '高于98%同类'], 
                                                                      ['理论讲解 50', '低于60%同类']
                                                                  ],
                                                                  datasets: [{
                                                                      label: '能力值',
                                                                      data: [85, 60, 75, 90, 50],
                                                                      backgroundColor: 'rgba(255, 77, 79, 0.15)',
                                                                      borderColor: '#FF4D4F',
                                                                      pointBackgroundColor: '#fff',
                                                                      pointBorderColor: '#FF4D4F',
                                                                      pointHoverBackgroundColor: '#fff',
                                                                      pointHoverBorderColor: '#FF4D4F',
                                                                      pointBorderWidth: 2,
                                                                      pointRadius: 5,
                                                                      borderWidth: 2,
                                                                  }]
                                                              }}
                                                              options={{
                                                                  responsive: true,
                                                                  maintainAspectRatio: false,
                                                                  layout: {
                                                                      padding: 10
                                                                  },
                                                                  scales: {
                                                                      r: {
                                                                          angleLines: {
                                                                              display: true,
                                                                              color: '#F3F4F6',
                                                                              borderDash: [5, 5]
                                                                          },
                                                                          grid: {
                                                                              color: '#F3F4F6',
                                                                              circular: true,
                                                                              borderDash: [5, 5]
                                                                          },
                                                                          pointLabels: {
                                                                              font: {
                                                                                  size: 11,
                                                                                  weight: 'bold',
                                                                                  family: 'Inter, sans-serif'
                                                                              },
                                                                              color: (context) => {
                                                                                  // Make the second line lighter
                                                                                  return context.index !== undefined ? ['#1F2937', '#9CA3AF'] : '#1F2937';
                                                                              },
                                                                              padding: 15,
                                                                              backdropColor: '#ffffff',
                                                                              backdropPadding: 6,
                                                                              borderRadius: 8,
                                                                          },
                                                                          ticks: {
                                                                              display: false,
                                                                              min: 0,
                                                                              max: 100,
                                                                              stepSize: 20
                                                                          }
                                                                      }
                                                                  },
                                                                  plugins: {
                                                                      legend: {
                                                                          display: false
                                                                      },
                                                                      tooltip: {
                                                                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                          titleColor: '#1F2937',
                                                                          bodyColor: '#4B5563',
                                                                          borderColor: '#F3F4F6',
                                                                          borderWidth: 1,
                                                                          padding: 12,
                                                                          titleFont: { size: 14, weight: 'bold' },
                                                                          bodyFont: { size: 13 },
                                                                          displayColors: false,
                                                                          callbacks: {
                                                                              title: (context) => {
                                                                                  const label = context[0].label as unknown as string[];
                                                                                  return label[0];
                                                                              },
                                                                              label: function(context) {
                                                                                  const label = context.chart.data.labels?.[context.dataIndex] as string[];
                                                                                  return label[1];
                                                                              }
                                                                          }
                                                                      }
                                                                  }
                                                              }}
                                                          />
                                                      </div>
                                                  </div>

                                                  {/* 课程排行榜 */}
                                                  <div className="flex flex-col gap-4">
                                                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                                                          <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                                                              <div className="flex items-center gap-2">
                                                                  <i className="fa-solid fa-fire text-orange-500"></i> 最受欢迎课程
                                                              </div>
                                                              <span className="text-xs font-normal text-gray-500">按满座率排序</span>
                                                          </h4>
                                                          <div className="space-y-3">
                                                              {staffDetails.popularCourses.map((c, i) => (
                                                                  <div key={c} onClick={() => alert('进入课程详情页')} className="flex items-center justify-between group cursor-pointer">
                                                                      <div className="flex items-center gap-4">
                                                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-orange-100 text-orange-600' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
                                                                              {i+1}
                                                                          </div>
                                                                          <div>
                                                                              <div className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate max-w-[120px]">{c}</div>
                                                                              <div className="text-xs text-gray-500 mt-0.5">累计上课 {320 - i * 45} 人</div>
                                                                          </div>
                                                                      </div>
                                                                      <div className="text-right">
                                                                          <div className="text-sm font-bold text-gray-900">{98 - i * 2}%</div>
                                                                          <div className="text-[10px] text-gray-400">满座率</div>
                                                                      </div>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>
                                                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                                                          <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                                                              <div className="flex items-center gap-2">
                                                                  <i className="fa-solid fa-triangle-exclamation text-blue-500"></i> 最需关注课程
                                                              </div>
                                                              <span className="text-xs font-normal text-gray-500">按开课/取消率</span>
                                                          </h4>
                                                          <div className="space-y-3">
                                                              {staffDetails.attentionCourses.map((c, i) => (
                                                                  <div key={c} onClick={() => alert('进入课程详情页')} className="flex items-center justify-between group cursor-pointer">
                                                                      <div className="flex items-center gap-4">
                                                                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                                                                              {i+1}
                                                                          </div>
                                                                          <div>
                                                                              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">{c}</div>
                                                                              <div className="text-xs text-gray-500 mt-0.5">{i === 0 ? '近期取消较多' : '开课率偏低'}</div>
                                                                          </div>
                                                                      </div>
                                                                      <div className="text-right flex gap-3">
                                                                          <div>
                                                                              <div className="text-sm font-bold text-gray-900">{i === 0 ? '65%' : '45%'}</div>
                                                                              <div className="text-[10px] text-gray-400">开课率</div>
                                                                          </div>
                                                                          <div>
                                                                              <div className="text-sm font-bold text-red-500">{i === 0 ? '15%' : '8%'}</div>
                                                                              <div className="text-[10px] text-gray-400">取消率</div>
                                                                          </div>
                                                                      </div>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* 历史课程与评价 */}
                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                                      <i className="fa-solid fa-book-open text-gray-500"></i> 历史课程与评价
                                                  </h4>
                                                  <div className="space-y-3">
                                                      {staffDetails.historicalCourses.map((c, i) => (
                                                          <div key={i} onClick={() => alert('查看上课学员')} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                                              <div className="flex items-center gap-4">
                                                                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 text-sm font-bold shadow-sm border border-gray-100">{i+1}</div>
                                                                  <div>
                                                                      <div className="text-sm font-bold text-gray-900">{c.name}</div>
                                                                      <div className="text-[10px] text-gray-400 mt-1">最后开课: {c.date}</div>
                                                                  </div>
                                                              </div>
                                                              <div className="flex items-center gap-8">
                                                                  <div className="text-xs text-gray-500 text-right"><div className="font-bold text-gray-900 text-sm">{c.count}</div> 累计节数</div>
                                                                  <div className="text-xs font-bold text-orange-500 flex items-center gap-1.5 w-16 justify-end text-lg"><i className="fa-solid fa-star"></i> {c.rating}</div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div>
                                      )}

                                      {/* 2. 会员信息 (Member Info) */}
                                      {activeModalTab === 'member' && (
                                          <div className="space-y-5 animate-fadeIn">
                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <h4 className="text-sm font-bold text-gray-900 mb-8 flex items-center gap-2">
                                                      <i className="fa-solid fa-users text-gray-400"></i> 会员转化与结构分析
                                                  </h4>
                                                  <div className="flex items-center gap-12">
                                                      <div className="flex flex-col items-center gap-8 w-64 shrink-0">
                                                          <div className="w-48 h-48 relative">
                                                              <Doughnut 
                                                                  data={{
                                                                      labels: ['私教会员', '小班团课会员', '体验会员'],
                                                                      datasets: [{
                                                                          data: [45, 35, 20],
                                                                          backgroundColor: ['#1a1a1a', '#4b5563', '#9ca3af'],
                                                                          borderWidth: 2,
                                                                          borderColor: '#ffffff',
                                                                      }]
                                                                  }}
                                                                  options={{ cutout: '75%', plugins: { legend: { display: false }, tooltip: {enabled: false} } }}
                                                              />
                                                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">TOTAL</span>
                                                                  <span className="text-3xl font-bold font-mono text-gray-900">{staffDetails.memberCount}</span>
                                                              </div>
                                                          </div>
                                                          <div className="w-full space-y-3">
                                                              <div className="flex justify-between items-center text-sm">
                                                                  <div className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]"></span>私教会员</div>
                                                                  <div className="font-mono font-bold text-gray-900">45% <span className="text-gray-500 ml-1">({Math.round(staffDetails.memberCount * 0.45)}人)</span></div>
                                                              </div>
                                                              <div className="flex justify-between items-center text-sm">
                                                                  <div className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-[#4b5563]"></span>小班团课会员</div>
                                                                  <div className="font-mono font-bold text-gray-900">35% <span className="text-gray-500 ml-1">({Math.round(staffDetails.memberCount * 0.35)}人)</span></div>
                                                              </div>
                                                              <div className="flex justify-between items-center text-sm">
                                                                  <div className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]"></span>体验会员</div>
                                                                  <div className="font-mono font-bold text-gray-900">20% <span className="text-gray-500 ml-1">({Math.round(staffDetails.memberCount * 0.20)}人)</span></div>
                                                              </div>
                                                          </div>
                                                      </div>

                                                      <div className="w-px h-64 bg-gray-100 hidden lg:block"></div>

                                                      <div className="flex-1 flex flex-col justify-center px-4">
                                                          <h5 className="text-xs font-bold text-gray-500 mb-6 text-center uppercase tracking-widest">转化与留存漏斗</h5>
                                                          <div className="relative flex flex-col items-center w-full max-w-sm mx-auto gap-1">
                                                              {/* Layer 1 */}
                                                              <div className="w-full bg-[#1a1a1a] text-white h-12 rounded-t-xl flex justify-between items-center px-6 transition-all hover:opacity-90">
                                                                  <span className="text-sm font-bold">体验会员</span>
                                                                  <span className="font-mono font-bold text-lg">{Math.round(staffDetails.memberCount * 2.2)}<span className="text-xs text-gray-400 ml-1 font-sans">人</span></span>
                                                              </div>
                                                              
                                                              {/* Arrow 1 */}
                                                              <div className="w-full flex justify-center my-1">
                                                                  <div className="flex flex-col items-center">
                                                                      <div className="w-px h-4 bg-gray-300"></div>
                                                                      <div className="bg-red-50 border border-red-200 rounded-full px-3 py-1 text-[10px] font-bold text-red-600 shadow-sm flex items-center gap-1.5 -my-2 relative z-10">
                                                                          <i className="fa-solid fa-triangle-exclamation"></i> 体验转化率 <span className="font-mono text-xs">45%</span> <span className="text-[9px] text-red-400 font-normal">(门店均值 55%)</span>
                                                                      </div>
                                                                      <div className="w-px h-4 bg-gray-300"></div>
                                                                  </div>
                                                              </div>

                                                              {/* Layer 2 */}
                                                              <div className="w-[85%] bg-[#4b5563] text-white h-12 rounded-sm flex justify-between items-center px-6 transition-all hover:opacity-90">
                                                                  <span className="text-sm font-bold">正式会员</span>
                                                                  <span className="font-mono font-bold text-lg">{staffDetails.memberCount}<span className="text-xs text-gray-300 ml-1 font-sans">人</span></span>
                                                              </div>

                                                              {/* Arrow 2 */}
                                                              <div className="w-full flex justify-center my-1">
                                                                  <div className="flex flex-col items-center">
                                                                      <div className="w-px h-4 bg-gray-300"></div>
                                                                      <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[10px] font-bold text-gray-600 shadow-sm flex items-center gap-1.5 -my-2 relative z-10">
                                                                          会员留存率 <span className="text-black font-mono text-xs">{staffDetails.retention}%</span> <span className="text-[9px] text-gray-400 font-normal">(门店均值 {staffDetails.retention - 2}%)</span>
                                                                      </div>
                                                                      <div className="w-px h-4 bg-gray-300"></div>
                                                                  </div>
                                                              </div>

                                                              {/* Layer 3 */}
                                                              <div className="w-[70%] bg-[#e5e7eb] text-gray-800 h-12 rounded-b-xl flex justify-between items-center px-6 transition-all hover:bg-gray-200">
                                                                  <span className="text-sm font-bold">复购会员</span>
                                                                  <span className="font-mono font-bold text-lg">{Math.round(staffDetails.memberCount * staffDetails.retention / 100)}<span className="text-xs text-gray-500 ml-1 font-sans">人</span></span>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  
                                                  <div className="grid grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-100">
                                                      <div>
                                                          <div className="text-xs font-bold text-gray-500 mb-4">性别比例</div>
                                                          <div className="flex items-center gap-4">
                                                              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                                                  <div className="h-full bg-pink-400" style={{ width: '65%' }}></div>
                                                                  <div className="h-full bg-black" style={{ width: '35%' }}></div>
                                                              </div>
                                                              <div className="flex gap-4 text-xs font-bold shrink-0">
                                                                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400"></span>女 65%</div>
                                                                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-black"></span>男 35%</div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                      <div>
                                                          <div className="text-xs font-bold text-gray-500 mb-4">年龄比例</div>
                                                          <div className="flex items-end gap-1.5 h-16">
                                                              {[
                                                                  { label: '20以下', value: 5 },
                                                                  { label: '20-25', value: 25 },
                                                                  { label: '26-30', value: 35 },
                                                                  { label: '31-35', value: 20 },
                                                                  { label: '36-40', value: 10 },
                                                                  { label: '40以上', value: 5 }
                                                              ].map(age => (
                                                                  <div key={age.label} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                                                                      <div className="w-full bg-gray-50 rounded-t-md relative flex items-end justify-center h-full group-hover:bg-gray-100 transition-colors">
                                                                          <div className="w-full bg-black rounded-t-md transition-all" style={{ height: `${age.value}%` }}></div>
                                                                          <span className="absolute -top-5 text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{age.value}%</span>
                                                                      </div>
                                                                      <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap scale-90 origin-top">{age.label}</span>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* 会员跟进与列表 */}
                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <div className="flex justify-between items-center mb-6">
                                                      <h4 className="text-sm font-bold text-gray-900">会员跟进与列表</h4>
                                                      <div className="flex items-center gap-3">
                                                          <div className="text-xs text-gray-500">私教会员跟进率</div>
                                                          <div className={`text-lg font-bold font-mono ${(staffDetails.followUpRate || 0) < 90 ? 'text-red-500' : 'text-gray-900'}`}>
                                                              {staffDetails.followUpRate || 0}%
                                                          </div>
                                                          {(staffDetails.followUpRate || 0) < 90 && <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-full font-bold">需关注</span>}
                                                      </div>
                                                  </div>

                                                  <div className="grid grid-cols-5 gap-3 mb-8">
                                                      {[
                                                          { id: 'pendingRenewal', label: '待续费会员', icon: 'fa-wallet', count: mockExtendedMembers.filter(m => m.isPendingRenewal).length, color: 'text-orange-500', bg: 'bg-orange-50' },
                                                          { id: 'silent', label: '沉默会员', icon: 'fa-moon', count: mockExtendedMembers.filter(m => m.isSilent).length, color: 'text-blue-500', bg: 'bg-blue-50' },
                                                          { id: 'newPending', label: '新客待跟进', icon: 'fa-user-plus', count: mockExtendedMembers.filter(m => m.isNewPendingFollowUp).length, color: 'text-green-500', bg: 'bg-green-50' },
                                                          { id: 'summaryMissing', label: '课后总结', icon: 'fa-file-signature', count: mockExtendedMembers.filter(m => m.isSummaryMissing).length, color: 'text-purple-500', bg: 'bg-purple-50' },
                                                          { id: 'photoMissing', label: '阶段对比照', icon: 'fa-camera', count: mockExtendedMembers.filter(m => m.isPhotoMissing).length, color: 'text-pink-500', bg: 'bg-pink-50' }
                                                      ].map(item => (
                                                          <div 
                                                              key={item.id} 
                                                              onClick={() => {
                                                                  setActiveFollowUpCategory(activeFollowUpCategory === item.id ? null : item.id);
                                                                  setMemberListTab('all'); // Ensure we see the filtered results across all members
                                                              }}
                                                              className={`bg-white p-5 rounded-[20px] cursor-pointer transition-all flex flex-col items-center justify-center text-center border ${activeFollowUpCategory === item.id ? 'border-black shadow-md ring-1 ring-black scale-[1.02]' : 'border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-200 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]'}`}
                                                          >
                                                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg} ${item.color} mb-3`}>
                                                                  <i className={`fa-solid ${item.icon} text-lg`}></i>
                                                              </div>
                                                              <div className="text-[13px] font-bold text-gray-900 mb-2">{item.label}</div>
                                                              <div className="flex items-baseline mb-3">
                                                                  <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                                                                  <span className="text-xs text-gray-400 ml-1 font-medium">人</span>
                                                              </div>
                                                              {item.count > 0 ? (
                                                                  <div className="text-[10px] text-red-500 bg-red-50 px-3 py-1 rounded-full font-bold">需关注</div>
                                                              ) : (
                                                                  <div className="text-[10px] text-green-500 bg-green-50 px-3 py-1 rounded-full font-bold">良好</div>
                                                              )}
                                                          </div>
                                                      ))}
                                                  </div>

                                                  <div className="flex justify-between items-center mb-4">
                                                      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                                                          <button onClick={() => setMemberListTab('followup')} className={`relative px-4 py-1.5 rounded-md text-xs font-bold transition-all ${memberListTab === 'followup' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                                                              待跟进
                                                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                              </span>
                                                          </button>
                                                          <button onClick={() => setMemberListTab('private')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${memberListTab === 'private' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>私教会员</button>
                                                          <button onClick={() => setMemberListTab('all')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${memberListTab === 'all' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>全部会员</button>
                                                      </div>
                                                      <div className="relative">
                                                          <button onClick={() => setShowAdvancedFilter(!showAdvancedFilter)} className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${showAdvancedFilter || filterLifecycle !== 'all' || filterGoal !== 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                                                              高级筛选 <i className="fa-solid fa-filter"></i>
                                                          </button>
                                                          {showAdvancedFilter && (
                                                              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-10">
                                                                  <div className="mb-4">
                                                                      <div className="text-xs font-bold text-gray-500 mb-2">生命周期</div>
                                                                      <div className="flex flex-wrap gap-2">
                                                                          {['all', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(s => (
                                                                              <button key={s} onClick={() => setFilterLifecycle(s)} className={`px-2 py-1 text-[10px] font-bold rounded ${filterLifecycle === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'all' ? '全部' : s}</button>
                                                                          ))}
                                                                      </div>
                                                                  </div>
                                                                  <div>
                                                                      <div className="text-xs font-bold text-gray-500 mb-2">目标标签</div>
                                                                      <div className="flex flex-wrap gap-2">
                                                                          {['all', '减脂', '增肌', '塑形', '康复', '产后'].map(g => (
                                                                              <button key={g} onClick={() => setFilterGoal(g)} className={`px-2 py-1 text-[10px] font-bold rounded ${filterGoal === g ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{g === 'all' ? '全部' : g}</button>
                                                                          ))}
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                      {filteredMembers.length > 0 ? filteredMembers.map((m, i) => (
                                                          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                                              <img src={m.avatar} alt="" className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm" />
                                                              <div className="flex-1">
                                                                  <div className="flex items-center gap-2">
                                                                      <div className="text-sm font-bold text-gray-900">{m.name}</div>
                                                                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${m.type === 'private' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>{m.type === 'private' ? '私教' : '团课'}</span>
                                                                  </div>
                                                                  <div className="flex items-center gap-2 mt-1.5">
                                                                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 px-1.5 py-0.5 rounded">{m.lifecycle}</span>
                                                                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{m.goal}</span>
                                                                      {m.isPendingRenewal && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">待续费</span>}
                                                                      {m.isSilent && <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">沉默会员</span>}
                                                                      {m.isNewPendingFollowUp && <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">新客待跟进</span>}
                                                                      {m.isSummaryMissing && <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">缺总结</span>}
                                                                      {m.isPhotoMissing && <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded">缺对比照</span>}
                                                                  </div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <div className="text-[10px] text-gray-400 mb-0.5">{m.card}剩余</div>
                                                                  <div className={`text-sm font-bold font-mono ${m.balance <= 3 ? 'text-red-500' : 'text-gray-900'}`}>{m.balance}</div>
                                                              </div>
                                                          </div>
                                                      )) : (
                                                          <div className="text-center py-12 text-sm text-gray-400 bg-gray-50 rounded-xl border border-gray-100">没有找到符合条件的会员</div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      )}

                                      {/* 3. 收入信息 (Income Info) */}
                                      {activeModalTab === 'income' && (
                                          <div className="space-y-5 animate-fadeIn">
                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <div className="flex items-center justify-between mb-6">
                                                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                          <i className="fa-solid fa-coins text-gray-900"></i> 收入与耗课
                                                      </h4>
                                                      <div className="flex bg-gray-100 p-1 rounded-lg">
                                                          <button onClick={() => setIncomeTimeRange('week')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${incomeTimeRange === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>本周</button>
                                                          <button onClick={() => setIncomeTimeRange('month')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${incomeTimeRange === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>本月</button>
                                                          <button onClick={() => setIncomeTimeRange('quarter')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${incomeTimeRange === 'quarter' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>本季</button>
                                                      </div>
                                                  </div>

                                                  <div className="grid grid-cols-2 gap-8 mb-8">
                                                      {/* 收入与耗课 */}
                                                      <div className="space-y-5">
                                                          <div className="flex items-end justify-between">
                                                              <div>
                                                                  <div className="text-xs font-bold text-gray-500 mb-1">总收入</div>
                                                                  <div className="text-3xl font-bold font-mono text-gray-900">¥{staffDetails.incomeStats[incomeTimeRange].total.toLocaleString()}</div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <div className="text-[10px] font-bold text-gray-400 mb-1">全馆营收占比</div>
                                                                  <div className="text-lg font-bold text-gray-900">{staffDetails.incomeStats[incomeTimeRange].percentage}%</div>
                                                              </div>
                                                          </div>
                                                      </div>

                                                      {/* 消课数据 */}
                                                      <div className="space-y-5">
                                                          <div className="flex items-end justify-between">
                                                              <div>
                                                                  <div className="text-xs font-bold text-gray-500 mb-1">总耗课</div>
                                                                  <div className="text-3xl font-bold font-mono text-gray-900">¥{staffDetails.consumptionStats[incomeTimeRange].total.toLocaleString()}</div>
                                                              </div>
                                                              <div className="text-right">
                                                                  <div className="text-[10px] font-bold text-gray-400 mb-1">全馆耗课占比</div>
                                                                  <div className="text-lg font-bold text-gray-900">{staffDetails.consumptionStats[incomeTimeRange].studioPercentage}%</div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>

                                                  <div className="pt-6 border-t border-gray-100">
                                                      <div className="flex items-center justify-between mb-4">
                                                          <div className="text-xs font-bold text-gray-900">趋势对比</div>
                                                          <div className="flex items-center gap-4 text-xs">
                                                              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-gray-500">总收入 (¥)</span></div>
                                                              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-black"></span><span className="text-gray-500">总耗课 (¥)</span></div>
                                                          </div>
                                                      </div>
                                                      <div className="h-48">
                                                          <Bar 
                                                              data={{
                                                                  labels: ['W1', 'W2', 'W3', 'W4'],
                                                                  datasets: [
                                                                      {
                                                                          label: '底薪',
                                                                          data: [2000, 2000, 2000, 2000],
                                                                          backgroundColor: '#A7F3D0',
                                                                          stack: 'Income',
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      },
                                                                      {
                                                                          label: '提成',
                                                                          data: [3000, 4000, 2000, 3000],
                                                                          backgroundColor: '#6EE7B7',
                                                                          stack: 'Income',
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      },
                                                                      {
                                                                          label: '小班课时费',
                                                                          data: [4000, 5000, 3000, 3000],
                                                                          backgroundColor: '#34D399',
                                                                          stack: 'Income',
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      },
                                                                      {
                                                                          label: '私教课时费',
                                                                          data: [3000, 4000, 4000, 10000],
                                                                          backgroundColor: '#10B981',
                                                                          stack: 'Income',
                                                                          borderRadius: { topLeft: 4, topRight: 4 },
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      },
                                                                      {
                                                                          label: '工作坊耗课',
                                                                          data: [2000, 1000, 2000, 2000],
                                                                          backgroundColor: '#E5E7EB',
                                                                          stack: 'Consumption',
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      },
                                                                      {
                                                                          label: '私教耗课',
                                                                          data: [5000, 6000, 4000, 5000],
                                                                          backgroundColor: '#9CA3AF',
                                                                          stack: 'Consumption',
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      },
                                                                      {
                                                                          label: '小班耗课',
                                                                          data: [4000, 5000, 3000, 3000],
                                                                          backgroundColor: '#111827',
                                                                          stack: 'Consumption',
                                                                          borderRadius: { topLeft: 4, topRight: 4 },
                                                                          barPercentage: 0.5,
                                                                          categoryPercentage: 0.5,
                                                                      }
                                                                  ]
                                                              }}
                                                              options={{
                                                                  responsive: true,
                                                                  maintainAspectRatio: false,
                                                                  interaction: {
                                                                      mode: 'index',
                                                                      intersect: false,
                                                                  },
                                                                  plugins: { 
                                                                      legend: { display: false },
                                                                      tooltip: {
                                                                          enabled: true,
                                                                          callbacks: {
                                                                              label: function(context) {
                                                                                  let label = context.dataset.label || '';
                                                                                  if (label) {
                                                                                      label += ': ';
                                                                                  }
                                                                                  if (context.parsed.y !== null) {
                                                                                      label += '¥' + context.parsed.y.toLocaleString();
                                                                                  }
                                                                                  return label;
                                                                              }
                                                                          }
                                                                      }
                                                                  },
                                                                  scales: {
                                                                      y: { stacked: true, type: 'linear', position: 'left', beginAtZero: true, grid: { color: '#F3F4F6' }, border: { display: false } },
                                                                      x: { stacked: true, grid: { display: false }, border: { display: false } }
                                                                  }
                                                              }}
                                                          />
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* 课时核对明细 */}
                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <h4 className="text-sm font-bold text-gray-900 mb-4">课时核对明细</h4>
                                                  <div className="overflow-x-auto">
                                                      <table className="w-full text-left text-sm">
                                                          <thead>
                                                              <tr className="border-b border-gray-100 text-gray-400">
                                                                  <th className="pb-3 font-medium">日期</th>
                                                                  <th className="pb-3 font-medium">类型</th>
                                                                  <th className="pb-3 font-medium">项目</th>
                                                                  <th className="pb-3 font-medium">课时/数量</th>
                                                                  <th className="pb-3 font-medium text-right">金额 (¥)</th>
                                                              </tr>
                                                          </thead>
                                                          <tbody className="text-gray-900">
                                                              <tr className="border-b border-gray-50">
                                                                  <td className="py-3">2026-03-15</td>
                                                                  <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">私教课</span></td>
                                                                  <td className="py-3">普拉提大器械</td>
                                                                  <td className="py-3 font-mono">1</td>
                                                                  <td className="py-3 text-right font-mono font-bold">450</td>
                                                              </tr>
                                                              <tr className="border-b border-gray-50">
                                                                  <td className="py-3">2026-03-15</td>
                                                                  <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">小班课</span></td>
                                                                  <td className="py-3">流瑜伽进阶</td>
                                                                  <td className="py-3 font-mono">3</td>
                                                                  <td className="py-3 text-right font-mono font-bold">360</td>
                                                              </tr>
                                                              <tr className="border-b border-gray-50">
                                                                  <td className="py-3">2026-03-14</td>
                                                                  <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">销售提成</span></td>
                                                                  <td className="py-3">年卡新签</td>
                                                                  <td className="py-3 font-mono text-gray-400">-</td>
                                                                  <td className="py-3 text-right font-mono font-bold">1,200</td>
                                                              </tr>
                                                              <tr className="border-b border-gray-50">
                                                                  <td className="py-3">2026-03-12</td>
                                                                  <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">私教课</span></td>
                                                                  <td className="py-3">孕产康复</td>
                                                                  <td className="py-3 font-mono">2</td>
                                                                  <td className="py-3 text-right font-mono font-bold">1,000</td>
                                                              </tr>
                                                              <tr>
                                                                  <td className="py-3">2026-03-10</td>
                                                                  <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">底薪</span></td>
                                                                  <td className="py-3">基本工资</td>
                                                                  <td className="py-3 font-mono text-gray-400">-</td>
                                                                  <td className="py-3 text-right font-mono font-bold">8,000</td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </div>
                                              </div>
                                          </div>
                                      )}

                                      {/* 4. 晋升信息 (Promotion Info) */}
                                      {activeModalTab === 'promotion' && (
                                          <div className="space-y-6 animate-fadeIn">
                                              {/* Level Header: Growth Line */}
                                              <div className="bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
                                                  <div className="shrink-0">
                                                      <h4 className="text-xs font-bold text-gray-900">成长进度</h4>
                                                      <div className="text-[10px] text-gray-500 mt-0.5">当前等级: {staffDetails.level.toUpperCase()}</div>
                                                  </div>
                                                  
                                                  <div className="flex-1 flex items-center gap-4">
                                                      <button className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-900 hover:text-gray-600 transition-colors">
                                                          <i className="fa-solid fa-chevron-left text-[8px]"></i>
                                                          <span>{staffDetails.level.toUpperCase()}</span>
                                                      </button>
                                                      
                                                      <div className="flex-1 relative flex items-center">
                                                          <div className="w-full bg-gray-100 rounded-full h-1">
                                                              <div className="bg-black h-1 rounded-full relative" style={{ width: '75%' }}>
                                                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-black rounded-full shadow-sm"></div>
                                                              </div>
                                                          </div>
                                                      </div>

                                                      <button className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors">
                                                          <span>{getNextStaffLevel(staffDetails.level)}</span>
                                                          <i className="fa-solid fa-chevron-right text-[8px]"></i>
                                                      </button>
                                                  </div>

                                                  <div className="shrink-0 text-right">
                                                      <div className="text-lg font-bold font-mono text-gray-900 leading-none">75<span className="text-[10px] text-gray-400 ml-0.5">%</span></div>
                                                      <div className="text-[9px] text-gray-500 mt-1">距离晋升 {getNextStaffLevel(staffDetails.level)}</div>
                                                  </div>
                                              </div>

                                              {/* Cards Row */}
                                              <div className="grid grid-cols-1 gap-4">
                                                  {/* Card 2: SCC% 经营能力 (Horizontal) */}
                                                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
                                                          <i className="fa-solid fa-chart-pie text-gray-900"></i> SCC 经营能力
                                                      </h4>
                                                      
                                                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                                          {/* Half Circle Gauge */}
                                                          <div className="flex flex-col items-center justify-center shrink-0">
                                                              <div className="relative w-48 h-24 overflow-hidden">
                                                                  {/* Background Arc */}
                                                                  <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[14px] border-gray-100 border-b-transparent border-r-transparent transform -rotate-45"></div>
                                                                  {/* Progress Arc (Orange for warning, Red for danger, Green for success) */}
                                                                  <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[14px] border-orange-500 border-b-transparent border-r-transparent transform -rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(-45deg) rotate(17.9deg)' }}></div>
                                                                  
                                                                  {/* Center Text */}
                                                                  <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center justify-end pb-2">
                                                                      <div className="flex items-center gap-1.5">
                                                                          <span className="text-3xl font-bold text-gray-900">17.9%</span>
                                                                          <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded flex items-center"><i className="fa-solid fa-arrow-up text-[8px]"></i></span>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                              <div className="text-xs text-gray-500 mt-2">目标: 20% (预警状态)</div>
                                                          </div>

                                                          {/* 3 Metrics */}
                                                          <div className="flex-1 w-full space-y-4">
                                                              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                                                                  <div className="flex items-center gap-3">
                                                                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                                                                      <span className="font-medium text-gray-700">耗课金额 <span className="text-xs text-gray-400 ml-1">(50%)</span></span>
                                                                  </div>
                                                                  <span className="font-bold text-gray-900">¥12,500</span>
                                                              </div>
                                                              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                                                                  <div className="flex items-center gap-3">
                                                                      <div className="w-2.5 h-2.5 rounded-full bg-orange-300"></div>
                                                                      <span className="font-medium text-gray-700">续费贡献 <span className="text-xs text-gray-400 ml-1">(30%)</span></span>
                                                                  </div>
                                                                  <span className="font-bold text-gray-900">¥5,200</span>
                                                              </div>
                                                              <div className="flex justify-between items-center text-sm">
                                                                  <div className="flex items-center gap-3">
                                                                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                                                      <span className="font-medium text-gray-700">新客转化 <span className="text-xs text-gray-400 ml-1">(20%)</span></span>
                                                                  </div>
                                                                  <span className="font-bold text-gray-900">¥2,800</span>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* Card 3: 3 Columns Stats */}
                                              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                                                  {/* Col 1 */}
                                                  <div className="pt-4 md:pt-0 md:px-4 first:pt-0 first:px-0">
                                                      <div className="flex justify-between items-center mb-4">
                                                          <span className="text-xs font-bold text-gray-800">团体课</span>
                                                          <i className="fa-solid fa-users text-gray-900"></i>
                                                      </div>
                                                      <div className="mb-6">
                                                          <div className="text-3xl font-bold text-gray-900">42 <span className="text-lg text-gray-400 font-normal">/ 50</span></div>
                                                          <div className="text-[10px] text-gray-500">本月课量</div>
                                                      </div>
                                                      <div className="space-y-2">
                                                          <div className="flex justify-between items-center text-xs">
                                                              <span className="text-gray-600">满课率 (Occupancy)</span>
                                                              <span className="font-bold text-gray-900">78%</span>
                                                          </div>
                                                          <div className="flex justify-between items-center text-xs">
                                                              <span className="text-gray-600">主修方向</span>
                                                              <span className="font-bold text-gray-900">Flow / Reformer</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  {/* Col 2 */}
                                                  <div className="pt-4 md:pt-0 md:px-4">
                                                      <div className="flex justify-between items-center mb-4">
                                                          <span className="text-xs font-bold text-gray-800">私教课</span>
                                                          <i className="fa-regular fa-user text-gray-900"></i>
                                                      </div>
                                                      <div className="mb-6">
                                                          <div className="text-3xl font-bold text-gray-900">28</div>
                                                          <div className="text-[10px] text-gray-500">活跃会员</div>
                                                      </div>
                                                      <div className="space-y-2">
                                                          <div className="flex justify-between items-center text-xs">
                                                              <span className="text-gray-600">收入目标</span>
                                                              <span className="font-bold text-gray-900">¥18,500 / 22k</span>
                                                          </div>
                                                          <div className="flex justify-between items-center text-xs">
                                                              <span className="text-gray-600">案例积累进度</span>
                                                              <span className="font-bold text-gray-900">8 / 10 已完成</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  {/* Col 3 */}
                                                  <div className="pt-4 md:pt-0 md:px-4">
                                                      <div className="flex justify-between items-center mb-4">
                                                          <span className="text-xs font-bold text-gray-800">教学质量</span>
                                                          <i className="fa-regular fa-star text-gray-900"></i>
                                                      </div>
                                                      <div className="mb-6">
                                                          <div className="text-3xl font-bold text-gray-900">4.92</div>
                                                          <div className="text-[10px] text-gray-500">平均评分</div>
                                                      </div>
                                                      <div className="space-y-2">
                                                          <div className="flex justify-between items-center text-xs">
                                                              <span className="text-gray-600">投诉 (去年)</span>
                                                              <span className="font-bold text-gray-900">0</span>
                                                          </div>
                                                          <div className="flex justify-between items-center text-xs">
                                                              <span className="text-gray-600">留存率</span>
                                                              <span className="font-bold text-gray-900">92%</span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* Scorecard Table */}
                                              <div className="mt-8">
                                                  <div className="flex justify-between items-end mb-4">
                                                      <div>
                                                          <h3 className="text-lg font-bold text-gray-900">晋升资格记分卡</h3>
                                                          <div className="text-xs text-gray-500 mt-1">差距分析: {staffDetails.level.toUpperCase()} → {getNextStaffLevel(staffDetails.level)}</div>
                                                      </div>
                                                      <button className="text-xs font-bold text-gray-900 hover:underline flex items-center gap-1">
                                                          查看详细标准 <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                                      </button>
                                                  </div>
                                                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                                      <table className="w-full text-left text-sm">
                                                          <thead className="bg-gray-50 text-xs text-gray-500">
                                                              <tr>
                                                                  <th className="py-3 px-6 font-medium">指标类别</th>
                                                                  <th className="py-3 px-6 font-medium">{getNextStaffLevel(staffDetails.level)} 晋升标准</th>
                                                                  <th className="py-3 px-6 font-medium">当前实际值</th>
                                                                  <th className="py-3 px-6 font-medium text-center">状态</th>
                                                              </tr>
                                                          </thead>
                                                          <tbody className="divide-y divide-gray-50">
                                                              <tr className="hover:bg-gray-50 transition">
                                                                  <td className="py-4 px-6 font-medium text-gray-900">月均授课时长</td>
                                                                  <td className="py-4 px-6 text-gray-600">&gt;= 100 小时</td>
                                                                  <td className="py-4 px-6 font-medium text-gray-900">112 小时</td>
                                                                  <td className="py-4 px-6 text-center"><i className="fa-solid fa-circle-check text-green-700 text-lg"></i></td>
                                                              </tr>
                                                              <tr className="hover:bg-gray-50 transition">
                                                                  <td className="py-4 px-6 font-medium text-gray-900">经营能力 SCC% (续费)</td>
                                                                  <td className="py-4 px-6 text-gray-600">&gt;= 10%</td>
                                                                  <td className="py-4 px-6 font-medium text-gray-900">7.2%</td>
                                                                  <td className="py-4 px-6 text-center"><i className="fa-solid fa-triangle-exclamation text-red-600 text-lg"></i></td>
                                                              </tr>
                                                              <tr className="hover:bg-gray-50 transition">
                                                                  <td className="py-4 px-6 font-medium text-gray-900">活跃私教会员</td>
                                                                  <td className="py-4 px-6 text-gray-600">&gt;= 25 位</td>
                                                                  <td className="py-4 px-6 font-medium text-gray-900">28 位</td>
                                                                  <td className="py-4 px-6 text-center"><i className="fa-solid fa-circle-check text-green-700 text-lg"></i></td>
                                                              </tr>
                                                              <tr className="hover:bg-gray-50 transition">
                                                                  <td className="py-4 px-6 font-medium text-gray-900">深度案例研究</td>
                                                                  <td className="py-4 px-6 text-gray-600">10 份完成</td>
                                                                  <td className="py-4 px-6 font-medium text-gray-900">8 份完成</td>
                                                                  <td className="py-4 px-6 text-center"><i className="fa-solid fa-ellipsis text-red-600 bg-red-100 rounded-full px-1.5 py-0.5 text-sm"></i></td>
                                                              </tr>
                                                              <tr className="hover:bg-gray-50 transition">
                                                                  <td className="py-4 px-6 font-medium text-gray-900">满意率</td>
                                                                  <td className="py-4 px-6 text-gray-600">&gt;= 90%</td>
                                                                  <td className="py-4 px-6 font-medium text-gray-900">95.4%</td>
                                                                  <td className="py-4 px-6 text-center"><i className="fa-solid fa-circle-check text-green-700 text-lg"></i></td>
                                                              </tr>
                                                          </tbody>
                                                      </table>
                                                  </div>
                                              </div>

                                              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                  <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                                      <i className="fa-solid fa-clock-rotate-left text-gray-400"></i> 历史晋级记录
                                                  </h4>
                                                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                                      {staffDetails.historicalPromotions.map((promo, i) => (
                                                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-gray-200 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                                  <i className="fa-solid fa-check text-[10px]"></i>
                                                              </div>
                                                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                  <div className="flex items-center justify-between mb-1">
                                                                      <div className="font-bold text-gray-900 text-sm">{promo.from} <i className="fa-solid fa-arrow-right text-gray-300 mx-1 text-[10px]"></i> {promo.to}</div>
                                                                      <time className="font-mono text-[10px] text-gray-400">{promo.date}</time>
                                                                  </div>
                                                                  <div className="text-xs text-gray-500">{promo.reason}</div>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div>
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
