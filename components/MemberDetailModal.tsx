
import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, Tooltip 
} from 'recharts';
import { Member, TimelineEvent } from '../types';
import { STAGE_CONFIG } from '../constants';

interface MemberDetailModalProps {
  member: Member;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'class' | 'follow' | 'order' | 'phase'>('all');
  const stageInfo = STAGE_CONFIG[member.stage];

  // --- Mock Data for Charts ---
  const preferenceData = member.topCourses && member.topCourses.length > 0 
    ? member.topCourses.map((c, i) => ({ name: c, value: 40 - i * 10 })) 
    : [{ name: '暂无数据', value: 100 }];
  
  const PREF_COLORS = ['#1D1D1F', '#6E6E73', '#AEAEB2', '#E5E5EA'];

  const frequencyData = [
      { week: 'W1', count: 1 },
      { week: 'W2', count: 3 },
      { week: 'W3', count: 2 },
      { week: 'W4', count: 4 }, // Current
  ];

  // --- Helpers ---
  const getTimelineIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'class': return <i className="fa-solid fa-person-running text-gray-900"></i>;
      case 'purchase': return <i className="fa-solid fa-bag-shopping text-gray-900"></i>;
      case 'follow_up': return <i className="fa-regular fa-comment-dots text-gray-900"></i>;
      case 'check_in': return <i className="fa-solid fa-location-dot text-gray-900"></i>;
      case 'phase_report': return <i className="fa-solid fa-trophy text-yellow-500"></i>;
      default: return <i className="fa-solid fa-circle text-gray-300"></i>;
    }
  };

  const filteredTimeline = member.timeline.filter(t => {
      if (t.type === 'operation' || t.type === 'system') return false; 
      if (activeTab === 'all') return true;
      if (activeTab === 'class') return t.type === 'class' || t.type === 'check_in';
      if (activeTab === 'follow') return t.type === 'follow_up';
      if (activeTab === 'order') return t.type === 'purchase';
      if (activeTab === 'phase') return t.type === 'phase_report';
      return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-[1100px] h-[85vh] bg-[#F5F5F7] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fadeInUp">
        
        {/* --- Header --- */}
        <div className="h-20 bg-white px-8 flex items-center justify-between border-b border-gray-200 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-xs font-bold text-gray-600">
                            {member.gender === 'female' ? <i className="fa-solid fa-venus text-pink-400"></i> : <i className="fa-solid fa-mars text-blue-400"></i>}
                            <span>{member.age}岁</span>
                        </div>
                        <span 
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider"
                            style={{ 
                                color: stageInfo.color, 
                                borderColor: stageInfo.color + '40',
                                backgroundColor: stageInfo.bgColor
                            }}
                        >
                            {stageInfo.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-mono">
                        <span><i className="fa-solid fa-phone mr-1"></i>{member.phone}</span>
                        <span className="text-gray-300">|</span>
                        <span><i className="fa-solid fa-location-dot mr-1"></i>杭州·西湖馆</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => alert('Gemini AI 正在生成会员深度洞察报告...')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition shadow-sm flex items-center gap-2"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI 洞察
                </button>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition text-gray-700 shadow-sm">
                    编辑档案
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition text-gray-500">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        {/* --- Body --- */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* LEFT COLUMN: Profile, Ops & Assets */}
            <div className="w-[360px] bg-[#FAFAFA] border-r border-gray-200 overflow-y-auto custom-scroll p-6 flex flex-col gap-6">
                
                {/* 1. Basic Info */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">专属管家</div>
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gray-100 text-[10px] flex items-center justify-center text-gray-500 font-bold">{member.manager[0]}</div>
                                {member.manager}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">绑定教练</div>
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                {member.privateTeachers && member.privateTeachers.length > 0 ? (
                                    <>
                                        <div className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">{member.privateTeachers[0][0]}</div>
                                        {member.privateTeachers[0]}
                                        {member.privateTeachers.length > 1 && <span className="text-xs text-gray-400">+{member.privateTeachers.length - 1}</span>}
                                    </>
                                ) : <span className="text-gray-400 text-xs font-normal">未绑定</span>}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">入会时间</div>
                            <div className="text-sm font-bold text-gray-900">{member.joinDate}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">最近到店</div>
                            <div className="text-sm font-bold text-gray-900">{member.lastVisit}</div>
                        </div>
                    </div>
                </div>

                {/* 2. Tags & Operations */}
                <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {member.bodyTags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm">{tag}</span>
                        ))}
                        <button className="px-2 py-1 border border-dashed border-gray-300 rounded-lg text-[10px] text-gray-400 hover:border-gray-400 transition">+</button>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        <button className="flex flex-col items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition group shadow-sm">
                            <i className="fa-brands fa-weixin text-lg text-green-600 mb-1 group-hover:scale-110 transition"></i>
                            <span className="text-[10px] font-medium text-gray-500">微信</span>
                        </button>
                        <button className="flex flex-col items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition group shadow-sm">
                            <i className="fa-solid fa-phone text-lg text-black mb-1 group-hover:scale-110 transition"></i>
                            <span className="text-[10px] font-medium text-gray-500">电话</span>
                        </button>
                        <button className="flex flex-col items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition group shadow-sm">
                            <i className="fa-solid fa-calendar-check text-lg text-black mb-1 group-hover:scale-110 transition"></i>
                            <span className="text-[10px] font-medium text-gray-500">预约</span>
                        </button>
                        <button className="flex flex-col items-center justify-center py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition group shadow-sm">
                            <i className="fa-solid fa-ticket text-lg text-orange-500 mb-1 group-hover:scale-110 transition"></i>
                            <span className="text-[10px] font-medium text-gray-500">发券</span>
                        </button>
                    </div>

                    {/* Strategy Text */}
                    <div className="flex items-start gap-2 px-1">
                        <i className="fa-solid fa-lightbulb text-yellow-500 text-xs mt-0.5"></i>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                            <span className="text-gray-900 font-bold">运营指引：</span> {stageInfo.strategy}
                        </p>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-200"></div>

                {/* 3. Assets (Moved from Right) */}
                <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-wallet text-gray-400"></i> 资产中心
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                         <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                             <div className="text-[10px] text-gray-400 mb-1">累计消费 (LTV)</div>
                             <div className="text-sm font-bold font-mono">¥{member.totalLTV.toLocaleString()}</div>
                         </div>
                         <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                             <div className="text-[10px] text-gray-400 mb-1">剩余积分</div>
                             <div className="text-sm font-bold font-mono text-black">{member.points}</div>
                         </div>
                    </div>

                    <div className="space-y-3">
                        {member.cards.map((card, idx) => (
                            <div key={idx} className={`relative p-4 rounded-xl overflow-hidden shadow-sm ${card.color} min-h-[80px] flex flex-col justify-between transition hover:shadow-md`}>
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="font-bold text-xs tracking-wide opacity-90">{card.name}</div>
                                    {card.status === 'active' && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] backdrop-blur-md font-medium">使用中</span>}
                                    {card.status === 'expiring' && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">即将过期</span>}
                                </div>
                                <div className="flex justify-between items-end relative z-10 mt-2">
                                    <div className="text-[9px] opacity-70">MetYoga</div>
                                    <div className="text-right">
                                        <div className="text-base font-bold">{card.balance}</div>
                                        <div className="text-[9px] opacity-80 font-mono">{card.expiry} 到期</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {member.cards.length === 0 && (
                            <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 bg-gray-50">
                                暂无有效会员卡
                            </div>
                         )}
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: Data & Timeline */}
            <div className="flex-1 bg-white p-8 overflow-y-auto custom-scroll flex flex-col gap-8">
                
                {/* 1. Visualizations */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Preference */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-900">上课偏好 (Top 3)</h4>
                        </div>
                        <div className="flex-1 flex items-center gap-6">
                            <div className="w-24 h-24 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={preferenceData} innerRadius={28} outerRadius={40} paddingAngle={5} dataKey="value" stroke="none">
                                            {preferenceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PREF_COLORS[index % PREF_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2">
                                {member.topCourses && member.topCourses.length > 0 ? member.topCourses.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: PREF_COLORS[i]}}></div>
                                            <span className="text-gray-600">{c}</span>
                                        </div>
                                    </div>
                                )) : <span className="text-xs text-gray-400">暂无数据</span>}
                            </div>
                        </div>
                    </div>

                    {/* Frequency */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-900">近期练习频率 (周)</h4>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                <span className="text-xl font-mono">{member.totalClasses}</span> <span className="text-gray-400 font-normal">累计</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={frequencyData}>
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '10px'}} />
                                    <Bar dataKey="count" fill="#1D1D1F" radius={[4, 4, 4, 4]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 2. Timeline */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-sm font-bold text-gray-900">全景动态追踪</h3>
                        <div className="flex gap-4">
                            {[
                                {id: 'all', label: '全部'},
                                {id: 'class', label: '上课'},
                                {id: 'phase', label: '成果'},
                                {id: 'order', label: '购买'},
                                {id: 'follow', label: '跟进'},
                            ].map((tab) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`text-xs font-medium transition-all relative ${
                                        activeTab === tab.id 
                                        ? 'text-black font-bold' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black rounded-full"></span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-gray-200">
                        {filteredTimeline.length > 0 ? filteredTimeline.map((event) => (
                            <div key={event.id} className="relative group">
                                <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center z-10 shadow-sm text-xs">
                                    {getTimelineIcon(event.type)}
                                </div>
                                
                                <div className="flex justify-between items-start mb-1">
                                    <div className="text-sm font-bold text-gray-900">{event.title}</div>
                                    <div className="text-xs text-gray-400 font-mono">{event.date}</div>
                                </div>
                                
                                <div className="text-xs text-gray-600 leading-relaxed bg-[#FAFAFA] p-3 rounded-xl border border-gray-100 group-hover:bg-white group-hover:shadow-sm group-hover:border-gray-200 transition">
                                    {event.content}
                                    
                                    {/* Images for Phase Report */}
                                    {event.type === 'phase_report' && event.images && (
                                        <div className="mt-3 flex gap-2">
                                            {event.images.map((img, i) => (
                                                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={img} className="w-full h-full object-cover" alt="Result" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer Info */}
                                    {(event.staff || event.amount) && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3">
                                            {event.staff && <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">{event.staff}</span>}
                                            {event.amount && <span className={`text-[10px] font-mono font-bold ${event.amount > 0 ? 'text-black' : 'text-green-600'}`}>{event.amount > 0 ? `+¥${event.amount}` : `-¥${Math.abs(event.amount)}`}</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-400 py-4">暂无相关记录</div>
                        )}
                        
                        <div className="pt-4 text-center">
                            <span className="text-[10px] text-gray-300">End of Timeline</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp {
            animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default MemberDetailModal;
