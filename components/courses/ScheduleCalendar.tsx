import React from 'react';
import {
  COURSE_TYPE_LABELS,
  getCalendarEventStyle,
  isEventFull,
} from '../../utils/courseSelectors';
import type { CourseLibraryItem, Room, ScheduleEvent } from '../../utils/courseSelectors';

interface ScheduleCalendarProps {
  libraryList: CourseLibraryItem[];
  rooms: Room[];
  activeRoomId: string;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string>>;
  weekDays: string[];
  hoursArray: number[];
  hourHeight: number;
  scheduleEvents: ScheduleEvent[];
  draggedEventId: string | null;
  handleCourseDragStart: (e: React.DragEvent, course: CourseLibraryItem) => void;
  handleEventDragStart: (e: React.DragEvent, event: ScheduleEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, dayIndex: number) => void;
  handleGridClick: (e: React.MouseEvent, dayIndex: number) => void;
  openEditModal: (event: ScheduleEvent) => void;
  onRegenerateAi: () => void;
  isLibraryManagementOpen?: boolean;
  onToggleLibraryManagement?: () => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  libraryList,
  rooms,
  activeRoomId,
  setActiveRoomId,
  weekDays,
  hoursArray,
  hourHeight,
  scheduleEvents,
  draggedEventId,
  handleCourseDragStart,
  handleEventDragStart,
  handleDragOver,
  handleDrop,
  handleGridClick,
  openEditModal,
  onRegenerateAi,
  isLibraryManagementOpen = false,
  onToggleLibraryManagement,
}) => (
  <>
                      {/* SECTION 2: SMART SCHEDULING GUIDANCE (Moved here for better visibility) */}
                      <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                  <i className="fa-solid fa-wand-magic-sparkles text-black"></i> 智能排课指导
                              </h3>
                              <div className="flex items-center gap-4">
                                  <button 
                                      type="button"
                                      onClick={onRegenerateAi}
                                      className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline"
                                  >
                                      <i className="fa-solid fa-rotate-right"></i> 重新计算
                                  </button>
                                  <button type="button" className="met-secondary-button !px-3 !py-1.5 text-xs text-gray-600">查看建议 <i className="fa-solid fa-arrow-right ml-1"></i></button>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Suggestion 1 */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">空闲预警</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                      <span className="font-bold text-gray-900">周二晚间</span> 普拉提教室空置率预测 <span className="text-red-500 font-bold">60%</span>。
                                  </p>
                                  <button type="button" className="met-secondary-button mt-3 !px-3 !py-1.5 text-xs">推荐补排</button>
                              </div>
                              {/* Suggestion 2 */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">爆款推荐</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                      <span className="font-bold text-gray-900">Sarah</span> 的哈他瑜伽上周满员，建议本周增加 1 节排期。
                                  </p>
                                  <button type="button" className="met-secondary-button mt-3 !px-3 !py-1.5 text-xs">去排课</button>
                              </div>
                              {/* Suggestion 3 */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group hover:border-gray-200 transition">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-400"></div>
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">课程优化</span>
                                  </div>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                      [晨间唤醒] 连续3周取消率 &gt; 20%，建议调整时段或下架。
                                  </p>
                                  <button type="button" className="met-secondary-button mt-3 !px-3 !py-1.5 text-xs text-gray-600">查看详情</button>
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-6 h-[720px] items-start">
                          
                          {/* SECTION 3: COURSE LIBRARY SIDEBAR */}
                          <div className="w-64 flex flex-col h-full sticky top-0">
                              {/* Course Library (Source for D&D) */}
                              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                  <div className="border-b border-gray-100 bg-gray-50/90 p-4">
                                      <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                  <i className="fa-solid fa-book-open text-gray-400" aria-hidden /> 课程库
                                              </h3>
                                              <p className="mt-1 text-[11px] leading-snug text-gray-500">拖拽课程到日历生成排课</p>
                                          </div>
                                          {onToggleLibraryManagement ? (
                                              <button
                                                  type="button"
                                                  onClick={onToggleLibraryManagement}
                                                  className="met-secondary-button shrink-0 !h-8 !min-h-0 !px-2.5 !py-0 !text-[11px] whitespace-nowrap"
                                              >
                                                  {isLibraryManagementOpen ? '收起' : '管理课程库'}
                                              </button>
                                          ) : null}
                                      </div>
                                      <input
                                          type="text"
                                          placeholder="搜索课程..."
                                          className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-[#1f5e3b]/40 focus:ring-1 focus:ring-[#1f5e3b]/15"
                                      />
                                  </div>
                                  <div className="custom-scroll flex-1 space-y-2 overflow-y-auto p-3">
                                      {libraryList.map(course => (
                                          <div
                                              key={course.id}
                                              draggable
                                              onDragStart={e => handleCourseDragStart(e, course)}
                                              className="group cursor-move rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50/70 active:cursor-grabbing"
                                          >
                                              <div className="mb-1.5 font-bold text-sm leading-snug text-gray-900">{course.name}</div>
                                              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-600">
                                                  <span className={`rounded px-1.5 py-0.5 font-semibold ${course.colorTag}`}>
                                                      {COURSE_TYPE_LABELS[course.type]}
                                                  </span>
                                                  <span className="tabular-nums text-gray-500">{course.durationMinutes} 分钟</span>
                                              </div>
                                              <div className="text-[10px] text-gray-500">难度 · {course.levelLabel}</div>
                                              <div className="mt-2 flex items-center gap-1 border-t border-gray-100 pt-2 text-[10px] text-gray-400">
                                                  <i className="fa-solid fa-grip-vertical" aria-hidden /> 拖拽至日历排课
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* SECTION 3: WEEKLY CALENDAR (Target for D&D) */}
                          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                              
                              {/* Calendar Toolbar */}
                              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
                                  <div className="flex items-center gap-4">
                                      <div className="flex bg-gray-100 p-1 rounded-lg">
                                          {rooms.map(room => (
                                              <button 
                                                  key={room.id}
                                                  onClick={() => setActiveRoomId(room.id)}
                                                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${activeRoomId === room.id ? 'bg-white font-bold text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                              >
                                                  <i className={`fa-solid ${room.icon} text-[10px]`}></i>
                                                  {room.name.split(' ')[0]}
                                              </button>
                                          ))}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-500">
                                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                          容量: {rooms.find(r => r.id === activeRoomId)?.capacity}人
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                                          <button className="px-3 py-1 text-xs hover:bg-gray-50 text-gray-600"><i className="fa-solid fa-chevron-left"></i></button>
                                          <span className="px-3 py-1 text-xs font-bold border-x border-gray-100 flex items-center min-w-[100px] justify-center">05.04 - 05.10</span>
                                          <button className="px-3 py-1 text-xs hover:bg-gray-50 text-gray-600"><i className="fa-solid fa-chevron-right"></i></button>
                                      </div>
                                      <button
                                          type="button"
                                          className="rounded-lg border border-[#1f5e3b]/35 bg-white px-3 py-2 text-xs font-semibold text-[#1f5e3b] transition hover:bg-[#1f5e3b]/[0.06]"
                                      >
                                          <i className="fa-solid fa-check mr-1" aria-hidden /> 发布课表
                                      </button>
                                  </div>
                              </div>

                              {/* Calendar Grid */}
                              <div className="flex-1 flex flex-col overflow-hidden">
                                  {/* Week Header */}
                                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 ml-12 pr-2 flex-shrink-0">
                                      {weekDays.map(day => (
                                          <div key={day} className="py-3 text-center text-xs font-bold text-gray-700 border-l border-gray-100">
                                              {day}
                                          </div>
                                      ))}
                                  </div>
                                  
                                  {/* Scrollable Body */}
                                  <div className="flex-1 overflow-y-auto custom-scroll relative bg-white">
                                      <div className="flex relative" style={{ height: `${hoursArray.length * hourHeight}px` }}>
                                          
                                          {/* Time Axis */}
                                          <div className="w-12 flex-shrink-0 bg-white border-r border-gray-100 z-10 sticky left-0">
                                              {hoursArray.map(hour => (
                                                  <div key={hour} className="text-[10px] text-gray-400 font-bold text-right pr-2 relative" style={{ height: `${hourHeight}px` }}>
                                                      <span className="relative -top-2">{hour}:00</span>
                                                  </div>
                                              ))}
                                          </div>

                                          {/* Columns */}
                                          <div className="flex-1 grid grid-cols-7 relative">
                                              {/* Horizontal Guides */}
                                              <div className="absolute inset-0 z-0 pointer-events-none">
                                                  {hoursArray.map((_, i) => (
                                                      <div key={i} className="border-b border-gray-100 w-full" style={{ height: `${hourHeight}px` }}></div>
                                                  ))}
                                              </div>

                                              {/* Day Columns */}
                                              {weekDays.map((_, dayIdx) => (
                                                  <div 
                                                      key={dayIdx} 
                                                      className="border-l border-gray-100 relative h-full group"
                                                      onDragOver={handleDragOver}
                                                      onDrop={(e) => handleDrop(e, dayIdx)}
                                                      onClick={(e) => handleGridClick(e, dayIdx)}
                                                  >
                                                      {/* Hover Effect */}
                                                      <div className="absolute inset-0 bg-green-50/30 opacity-0 group-hover:opacity-100 pointer-events-none transition"></div>

                                                      {/* Events */}
                                                      {scheduleEvents
                                                          .filter(evt => evt.dayIndex === dayIdx && evt.roomId === activeRoomId)
                                                          .map(evt => (
                                                              <div
                                                                  key={evt.id}
                                                                  draggable
                                                                  onDragStart={(e) => handleEventDragStart(e, evt)}
                                                                  onClick={(e) => { e.stopPropagation(); openEditModal(evt); }}
                                                                  className={`absolute left-1 right-1 rounded-lg px-2 py-1.5 text-xs border cursor-move shadow-sm hover:shadow-md transition-all z-10 flex flex-col justify-between overflow-hidden ${evt.color}`}
                                                                  style={{
                                                                      ...getCalendarEventStyle(evt.startTime, evt.duration, hoursArray[0] ?? 8, hourHeight),
                                                                      opacity: draggedEventId === evt.id ? 0.5 : 1
                                                                  }}
                                                              >
                                                                  <div>
                                                                      <div className="font-bold truncate">{evt.name}</div>
                                                                      <div className="opacity-80 truncate text-[10px]">{evt.startTime} - {evt.teacher}</div>
                                                                  </div>
                                                                  {isEventFull(evt) && (
                                                                      <div className="text-[9px] bg-red-500 text-white px-1 rounded w-fit self-end font-bold">FULL</div>
                                                                  )}
                                                              </div>
                                                          ))
                                                      }
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

  </>
);

export default ScheduleCalendar;
