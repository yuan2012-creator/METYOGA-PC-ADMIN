import React from 'react';
import type {
  CourseOpsSummary,
  OpsFilter,
  OpsScheduleItem,
} from '../../utils/courseSelectors';

interface TodayOpsPanelProps {
  opsFilter: OpsFilter;
  setOpsFilter: React.Dispatch<React.SetStateAction<OpsFilter>>;
  filteredOpsSchedule: OpsScheduleItem[];
  opsSummary: CourseOpsSummary;
  aiGuidance: string;
  onSubstitute: (sessionId: string) => void;
  onCheckIn: (sessionId: string) => void;
}

const TodayOpsPanel: React.FC<TodayOpsPanelProps> = ({
  opsFilter,
  setOpsFilter,
  filteredOpsSchedule,
  opsSummary,
  aiGuidance,
  onSubstitute,
  onCheckIn,
}) => (
  <>
                      {/* SECTION 1: TODAY'S OPERATIONS & LIVE STATUS */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center mb-6">
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                      <i className="fa-solid fa-calendar-day text-black"></i> 今日课程执行面板
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-1">2026年05月05日 · 星期二</p>
                              </div>
                              <div className="flex gap-3">
                                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition text-gray-700">
                                      <i className="fa-solid fa-qrcode"></i> 扫码消课
                                  </button>
                                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition text-gray-700">
                                      <i className="fa-solid fa-clipboard-check"></i> 批量补签
                                  </button>
                              </div>
                          </div>

                          {/* Filter Toggle */}
                          <div className="flex gap-2 mb-4">
                              <button 
                                  onClick={() => setOpsFilter('all')}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${opsFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                  全部课程
                              </button>
                              <button 
                                  onClick={() => setOpsFilter('group')}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${opsFilter === 'group' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                  团课/小班
                              </button>
                              <button 
                                  onClick={() => setOpsFilter('private')}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${opsFilter === 'private' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                  私教预约
                              </button>
                          </div>

                          {/* Course Timeline (Horizontal) */}
                          <div className="relative mt-8 pb-4 overflow-x-auto custom-scroll">
                              {/* Horizontal Line */}
                              <div className="absolute top-[6px] left-0 right-0 h-0.5 bg-gray-200 min-w-max"></div>
                              
                              <div className="flex gap-8 min-w-max px-2">
                                  {filteredOpsSchedule.map((cls, index) => {
                                      const emptySpots = cls.capacity - cls.enrolled;
                                      const isPast = cls.state === 'finished';
                                      const isOngoing = cls.state === 'ongoing';
                                      
                                      return (
                                      <div key={cls.id} className="relative w-72 flex-shrink-0 pt-6">
                                          {/* Timeline Node */}
                                          <div className={`absolute left-0 top-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isPast ? 'bg-gray-300' : isOngoing ? 'bg-green-500 ring-4 ring-green-100' : 'bg-black'}`}></div>
                                          
                                          <div className="mb-3 flex items-center gap-2">
                                              <span className={`text-lg font-bold font-mono ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>{cls.time.split(' - ')[0]}</span>
                                              <span className="text-sm text-gray-400 font-mono">- {cls.time.split(' - ')[1]}</span>
                                          </div>

                                          <div className={`border ${cls.abnormal ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-[#FAFAFA]'} rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition relative group h-full`}>
                                              <div className="flex justify-between items-start mb-3">
                                                  <div>
                                                      <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                          {cls.name}
                                                          <span className="text-[10px] font-normal bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{cls.type}</span>
                                                      </div>
                                                      <div className="text-xs text-gray-500 mt-1">{cls.room}</div>
                                                  </div>
                                                  <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                      isOngoing ? 'bg-green-100 text-green-700' : isPast ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-600'
                                                  }`}>
                                                      {isOngoing ? '进行中' : isPast ? '已结束' : '未开始'}
                                                  </div>
                                              </div>
                                              
                                              <div className="flex flex-col gap-2 mb-4">
                                                  <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                                          <i className="fa-solid fa-user text-gray-400"></i> {cls.teacher}
                                                      </div>
                                                      {cls.status === 'full' ? (
                                                          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">满员</span>
                                                      ) : (
                                                          <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 animate-pulse">
                                                              空位 {emptySpots} 人 - 需拉新
                                                          </span>
                                                      )}
                                                  </div>
                                                  {cls.abnormal && (
                                                      <div className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1.5">
                                                          <i className="fa-solid fa-triangle-exclamation"></i> 异常: {cls.abnormalReason}
                                                      </div>
                                                  )}
                                              </div>

                                              <div className="flex justify-between items-end border-t border-gray-200 pt-3 mt-auto">
                                                  <div className="text-xs">
                                                      <div className="text-gray-400">实到/预约</div>
                                                      <div className="font-bold text-lg font-mono text-gray-900">{cls.signed} <span className="text-gray-400 text-xs font-normal">/ {cls.enrolled}</span></div>
                                                  </div>
                                                  <div className="flex gap-2">
                                                      <button className="bg-white border border-gray-200 hover:border-black text-gray-600 hover:text-black text-xs px-3 py-1.5 rounded transition" onClick={() => onSubstitute(cls.id)}>代课</button>
                                                      <button className="bg-black text-white text-xs px-4 py-1.5 rounded hover:opacity-80 transition shadow-sm" onClick={() => onCheckIn(cls.id)}>签到</button>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                      )})}
                                      
                                      {/* Add New Check-in Slot (Placeholder) */}
                                      <div className="relative w-32 flex-shrink-0 pt-6">
                                          <div className="absolute left-0 top-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-200"></div>
                                          <div className="h-full min-h-[120px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition">
                                              <i className="fa-solid fa-plus text-xl mb-2"></i>
                                              <span className="text-xs font-bold">临时加课</span>
                                          </div>
                                      </div>
                                  </div>
                          </div>

                          {/* 今日运营小结 & 智能指导 (Compact Bottom Bar) */}
                          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                      <i className="fa-solid fa-chart-pie text-gray-400"></i>
                                      <span>今日总课: <strong className="text-gray-900">{opsSummary.totalCourses}</strong> 节 <span className="text-xs text-gray-400">(团{opsSummary.groupClass}/小{opsSummary.smallClass}/私{opsSummary.privateClass})</span></span>
                                  </div>
                                  <div className="hidden lg:block w-px h-4 bg-gray-200"></div>
                                  <div>上课人数: <strong className="text-gray-900">{opsSummary.totalEnrolled}</strong></div>
                                  <div className="hidden lg:block w-px h-4 bg-gray-200"></div>
                                  <div>空位: <strong className="text-orange-500">{opsSummary.totalEmptySpots}</strong></div>
                                  <div className="hidden lg:block w-px h-4 bg-gray-200"></div>
                                  <div>预计耗课: <strong className="text-gray-900">{opsSummary.totalEnrolled}</strong> 节</div>
                              </div>
                              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 flex-1 lg:max-w-md">
                                  <i className="fa-solid fa-wand-magic-sparkles text-black"></i>
                                  <span className="text-xs text-gray-700 font-medium leading-relaxed">{aiGuidance}</span>
                                  <button className="ml-auto text-xs bg-black text-white px-3 py-1.5 rounded hover:opacity-80 transition whitespace-nowrap shadow-sm">去处理</button>
                              </div>
                          </div>
                      </div>


  </>
);

export default TodayOpsPanel;
