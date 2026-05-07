import React from 'react';

type StaffTab = 'decision' | 'archives' | 'schedule';

interface StaffSchedulePanelProps {
  activeTab: StaffTab;
}

const StaffSchedulePanel: React.FC<StaffSchedulePanelProps> = (props) => {
  const {
    activeTab,
  } = props;

  return (
    <>
            {/* TAB 3: SCHEDULE & ATTENDANCE */}
            {activeTab === 'schedule' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* 顶部：实时人力状态总览 */}
                    <div className="grid grid-cols-5 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                            <div className="text-sm font-bold text-gray-500 mb-2">在岗人数</div>
                            <div className="text-4xl font-bold font-mono text-gray-900">12</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                            <div className="text-sm font-bold text-gray-500 mb-2">空闲人数 (可排课)</div>
                            <div className="text-4xl font-bold font-mono text-blue-600">4</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gray-800"></div>
                            <div className="text-sm font-bold text-gray-500 mb-2">已排课人数</div>
                            <div className="text-4xl font-bold font-mono text-gray-900">8</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gray-300"></div>
                            <div className="text-sm font-bold text-gray-500 mb-2">未到岗人数</div>
                            <div className="text-4xl font-bold font-mono text-gray-500">3</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                            <div className="text-sm font-bold text-gray-500 mb-2">异常人数 (迟到/缺勤)</div>
                            <div className="text-4xl font-bold font-mono text-red-500">1</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* 中部：时间轴排班（核心） */}
                        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                    <i className="fa-regular fa-calendar-days text-gray-400"></i> 今日排班时间轴
                                </h3>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                    <div className="flex items-center gap-1.5"><span className="w-8 h-3 rounded border border-dashed border-green-300 bg-green-50"></span>排班时段</div>
                                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500"></span>上课中</div>
                                </div>
                            </div>
                            <div className="p-0 overflow-x-auto custom-scroll relative">
                                <div className="min-w-[800px] relative">
                                    {/* Header & Grid */}
                                    <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
                                        <div className="w-[240px] shrink-0 border-r border-gray-100 p-4 flex items-center justify-between bg-gray-50/50">
                                            <span className="text-xs font-bold text-gray-500">教培团队 (TEAM)</span>
                                            <i className="fa-solid fa-filter text-gray-400"></i>
                                        </div>
                                        <div className="flex-1 flex relative">
                                            {['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((time, i) => (
                                                <div key={time} className="flex-1 border-r border-gray-100 p-4 text-sm font-bold text-gray-400 relative">
                                                    {time}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Current Time Line (Mocked at 16:07) */}
                                    <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: '240px', width: 'calc(100% - 240px)' }}>
                                        <div className="absolute top-0 bottom-0 w-px bg-red-500" style={{ left: '41.1%' }}></div>
                                        <div className="absolute top-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full transform -translate-x-1/2" style={{ left: '41.1%' }}>
                                            16:07
                                        </div>
                                    </div>

                                    {/* Staff Rows */}
                                    <div className="bg-white">
                                        {[
                                            { 
                                                name: '林静 Anna', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna', tag: '资深瑜伽', status: 'online', progress: 4, total: 5,
                                                shift: { start: 11.5, end: 17.5 },
                                                classes: [{ start: 14, end: 15, title: '私教：张女士', room: 'VIP 1' }]
                                            },
                                            { 
                                                name: '王教练 Ben', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben', tag: '普拉提器械', status: 'online', progress: 2, total: 5,
                                                shift: { start: 13, end: 20.5 },
                                                classes: [{ start: 14.5, end: 15.5, title: '核心床团课', room: '器械房' }, { start: 18.5, end: 19.5, title: '私教：李先生', room: 'VIP 2' }]
                                            },
                                            { 
                                                name: '陈晓 Chloe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe', tag: '孕产瑜伽', status: 'busy', progress: 5, total: 5,
                                                shift: { start: 12.5, end: 16.5 },
                                                classes: [{ start: 12.5, end: 13.5, title: '修复瑜伽', room: '大教室A' }]
                                            },
                                            { 
                                                name: 'David', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', tag: '康复理疗', status: 'offline', progress: 0, total: 5,
                                                shift: { start: 16.5, end: 21.5 },
                                                classes: [{ start: 18.5, end: 19.5, title: '肩颈理疗', room: '大教室B' }]
                                            }
                                        ].map((staff, idx) => (
                                            <div key={idx} className="flex border-b border-gray-100 relative group hover:bg-gray-50/30 transition-colors">
                                                {/* Staff Info */}
                                                <div className="w-[240px] shrink-0 border-r border-gray-100 p-4 flex items-center gap-4 bg-white z-10">
                                                    <div className="relative">
                                                        <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50" />
                                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${staff.status === 'online' ? 'bg-green-500' : staff.status === 'busy' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="text-sm font-bold text-gray-900 truncate flex items-center gap-1">
                                                                {staff.name} {staff.name.includes('Anna') && <span className="text-orange-500 text-xs">🔥</span>}
                                                            </div>
                                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded truncate max-w-[60px]">{staff.tag}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${staff.progress === staff.total ? 'bg-orange-500' : 'bg-blue-400'}`} style={{ width: `${(staff.progress / staff.total) * 100}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400">{staff.progress}/{staff.total}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Timeline Grid Background */}
                                                <div className="flex-1 flex absolute top-0 bottom-0 right-0 pointer-events-none" style={{ left: '240px' }}>
                                                    {Array(10).fill(0).map((_, i) => (
                                                        <div key={i} className="flex-1 border-r border-gray-50"></div>
                                                    ))}
                                                </div>

                                                {/* Timeline Content */}
                                                <div className="flex-1 relative py-4" style={{ minHeight: '80px' }}>
                                                    {/* Shift Block */}
                                                    {staff.shift && (() => {
                                                        // Time range: 12:00 to 22:00 (10 hours)
                                                        const startOffset = Math.max(0, staff.shift.start - 12);
                                                        const duration = staff.shift.end - Math.max(12, staff.shift.start);
                                                        const left = `${(startOffset / 10) * 100}%`;
                                                        const width = `${(duration / 10) * 100}%`;
                                                        
                                                        return (
                                                            <div 
                                                                className="absolute top-4 bottom-4 rounded-xl border border-dashed border-green-200 bg-green-50/50"
                                                                style={{ left, width }}
                                                            ></div>
                                                        );
                                                    })()}

                                                    {/* Class Blocks */}
                                                    {staff.classes.map((cls, cIdx) => {
                                                        const startOffset = Math.max(0, cls.start - 12);
                                                        const duration = cls.end - Math.max(12, cls.start);
                                                        const left = `${(startOffset / 10) * 100}%`;
                                                        const width = `${(duration / 10) * 100}%`;

                                                        return (
                                                            <div 
                                                                key={cIdx}
                                                                className="absolute top-5 bottom-5 rounded-xl bg-blue-500 text-white p-2 shadow-sm flex flex-col justify-center overflow-hidden cursor-pointer hover:bg-blue-600 transition-colors z-10"
                                                                style={{ left, width }}
                                                            >
                                                                <div className="text-xs font-bold truncate">{cls.title}</div>
                                                                <div className="text-[10px] opacity-80 truncate">{cls.room}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右侧：智能调度建议 & 底部：出勤异常记录 */}
                        <div className="space-y-8 flex flex-col">
                            {/* 智能调度建议 */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                        <i className="fa-solid fa-wand-magic-sparkles text-purple-500"></i> 智能调度建议
                                    </h3>
                                    <button 
                                        onClick={() => alert('Gemini AI 正在重新生成智能调度建议...')}
                                        className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <i className="fa-solid fa-rotate-right"></i> AI 重新生成
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                                                <i className="fa-solid fa-bolt"></i>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 mb-1">晚高峰运力不足预警</div>
                                                <div className="text-xs text-gray-600 leading-relaxed">今日 18:00-20:00 预约人数激增，当前仅有 2 名教练空闲。建议临时调配 <span className="font-bold text-purple-700 cursor-pointer hover:underline">Lisa Wu</span> 或 <span className="font-bold text-purple-700 cursor-pointer hover:underline">Mike Wang</span> 支援。</div>
                                                <button className="mt-3 px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors">一键发送支援邀请</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                                                <i className="fa-solid fa-user-plus"></i>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 mb-1">Emma Liu 课表空档过长</div>
                                                <div className="text-xs text-gray-600 leading-relaxed">15:00-18:00 存在 3 小时空档，建议为其安排内部培训或体验课转化。</div>
                                                <button className="mt-3 px-4 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors">查看可排课程</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 出勤异常记录 */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                    <i className="fa-solid fa-triangle-exclamation text-red-500"></i> 出勤异常记录
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-red-100 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">Alex Chen</div>
                                                <div className="text-xs text-red-600 font-bold mt-0.5">迟到 45 分钟</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold rounded hover:bg-gray-50 transition-colors">联系员工</button>
                                            <button className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 transition-colors">记录扣罚</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


    </>
  );
};

export default StaffSchedulePanel;
