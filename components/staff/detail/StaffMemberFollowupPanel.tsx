import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { StaffMemberFollowupPanelProps } from './StaffDetailTypes';

const lifecycleFilters = ['all', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const goalFilters = ['all', '减脂', '增肌', '塑形', '康复', '产后'];

const StaffMemberFollowupPanel: React.FC<StaffMemberFollowupPanelProps> = ({
  staffDetails,
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
}) => (

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
                                  {lifecycleFilters.map(s => (
                                      <button key={s} onClick={() => setFilterLifecycle(s)} className={`px-2 py-1 text-[10px] font-bold rounded ${filterLifecycle === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'all' ? '全部' : s}</button>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <div className="text-xs font-bold text-gray-500 mb-2">目标标签</div>
                              <div className="flex flex-wrap gap-2">
                                  {goalFilters.map(g => (
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
);

export default StaffMemberFollowupPanel;
