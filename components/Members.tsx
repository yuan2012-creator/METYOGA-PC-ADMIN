
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { STAGE_CONFIG, MOCK_MEMBERS } from '../constants';
import { Member } from '../types';
import MemberDetailModal from './MemberDetailModal';

const Members: React.FC = () => {
  // Fix: Removed invalid inline type annotation in destructuring to fix parsing error and define setSelectedMember correctly
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [mainTab, setMainTab] = useState<'overview' | 'leads' | 'active' | 'churned'>('overview');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [alertFilter, setAlertFilter] = useState<'expiry' | 'balance' | 'sleep' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [funnelRange, setFunnelRange] = useState<'week' | 'month'>('month');

  // --- Statistics ---
  const totalMembers = 1890;
  const todayAdded = 5;
  const todayLost = 2;

  const chartData = [
    { name: 'Active', value: 70, color: '#1D1D1F' },
    { name: 'Other', value: 30, color: '#E5E5EA' },
  ];

  // --- Mock Funnel Data ---
  const funnelMetrics = {
    month: [
      { label: '咨询客户', count: 1250, trend: 12, rate: null },
      { label: '体验客户', count: 680, trend: -3, rate: 54.4 },
      { label: '意向转化', count: 240, trend: 5, rate: 35.3 },
      { label: '成交客户', count: 108, trend: 8, rate: 45.0 }
    ],
    week: [
      { label: '咨询客户', count: 280, trend: 2, rate: null },
      { label: '体验客户', count: 145, trend: 5, rate: 51.8 },
      { label: '意向转化', count: 52, trend: -1, rate: 35.8 },
      { label: '成交客户', count: 22, trend: 15, rate: 42.3 }
    ]
  };

  const activeFunnel = funnelMetrics[funnelRange];

  // --- Filter Logic ---
  const visibleMembers = useMemo(() => {
    let filtered = MOCK_MEMBERS;
    
    if (mainTab === 'leads') filtered = filtered.filter(m => m.stage === 'S0');
    else if (mainTab === 'active') filtered = filtered.filter(m => ['S1', 'S2', 'S3', 'S4', 'S5'].includes(m.stage));
    else if (mainTab === 'churned') filtered = filtered.filter(m => m.stage === 'S6');

    if (mainTab !== 'leads' && alertFilter) {
        filtered = filtered.filter(m => m.riskTag === alertFilter);
    }

    if (filterStage !== 'all') filtered = filtered.filter(m => m.stage === filterStage);

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q));
    }

    return filtered;
  }, [mainTab, filterStage, alertFilter, searchQuery]);

  const stats = {
    expiry: MOCK_MEMBERS.filter(m => m.riskTag === 'expiry').length,
    balance: MOCK_MEMBERS.filter(m => m.riskTag === 'balance').length,
    sleep: MOCK_MEMBERS.filter(m => m.riskTag === 'sleep').length,
  };

  const FilterIcon = () => (
    <i className="fa-solid fa-filter text-[9px] opacity-20 group-hover/header:opacity-100 transition-opacity ml-1.5 cursor-pointer"></i>
  );

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] animate-fadeIn">
      
      {/* 1. TOP HEADER (Row 1 - White) */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              会员管理中心
              <button 
                  onClick={() => alert('Gemini AI 正在分析会员数据并生成洞察...')}
                  className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
              >
                  <i className="fa-solid fa-wand-magic-sparkles"></i> AI 会员洞察
              </button>
          </h1>
          <div className="flex items-center gap-4">
              <div className="relative group">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索姓名、电话..." 
                    className="pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg text-xs w-64 transition-all outline-none" 
                  />
              </div>
              <button className="bg-black text-white px-5 py-2 rounded-lg text-xs font-bold hover:opacity-80 transition shadow-lg shadow-black/10">
                  + 新增会员
              </button>
          </div>
      </header>

      {/* 2. SUB NAVIGATION (Row 2 - Gray Background) */}
      <nav className="px-8 py-4 bg-[#F5F5F7] border-b border-gray-200/50 sticky top-16 z-20 flex justify-start">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
              {[
                  { id: 'overview', label: '总览' },
                  { id: 'leads', label: '潜客公海' },
                  { id: 'active', label: '正式会员' },
                  { id: 'churned', label: '流失客户' }
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => { setMainTab(tab.id as any); setFilterStage('all'); setAlertFilter(null); }}
                    className={`relative z-10 px-6 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${
                        mainTab === tab.id 
                        ? 'bg-white text-black shadow-sm font-bold' 
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </nav>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 custom-scroll">
          <div className="max-w-[1440px] mx-auto space-y-8">
              
              {/* DASHBOARD SECTION */}
              {mainTab !== 'leads' ? (
                <div className="grid grid-cols-12 gap-6 animate-fadeIn">
                    <div className="col-span-8 grid grid-cols-3 gap-6">
                        {[
                            { id: 'expiry', label: '即将过期', count: stats.expiry, icon: 'fa-hourglass-half' },
                            { id: 'balance', label: '余额不足', count: stats.balance, icon: 'fa-wallet' },
                            { id: 'sleep', label: '沉默会员', count: stats.sleep, icon: 'fa-moon' }
                        ].map(item => (
                            <div 
                              key={item.id} 
                              onClick={() => setAlertFilter(alertFilter === item.id ? null : item.id as any)}
                              className={`p-6 bg-white rounded-[28px] border transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-40 ${alertFilter === item.id ? 'border-black ring-4 ring-black/5 shadow-xl' : 'border-transparent shadow-sm hover:shadow-md'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alertFilter === item.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <i className={`fa-solid ${item.icon} text-sm`}></i>
                                    </div>
                                    {alertFilter === item.id && <i className="fa-solid fa-circle-check text-black text-sm"></i>}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-gray-900 font-mono tracking-tighter">{item.count}</span>
                                        <span className="text-xs font-medium text-gray-300">人</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="col-span-4 bg-white rounded-[28px] p-6 shadow-sm flex items-center gap-8">
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">会员总数结构</h3>
                            <div className="text-5xl font-bold text-gray-900 font-mono tracking-tighter mb-4">{totalMembers.toLocaleString()}</div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">↑ {todayAdded} 新增</span>
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">↓ {todayLost} 减少</span>
                            </div>
                        </div>
                        <div className="w-24 h-24 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={30} outerRadius={42} paddingAngle={4} dataKey="value" stroke="none">
                                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-6 animate-fadeIn">
                    <div className="col-span-4 bg-white rounded-[32px] p-7 shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-bell text-orange-500"></i> 今日待办跟进
                        </h3>
                        <div className="space-y-4 flex-1">
                            {MOCK_MEMBERS.filter(m => m.stage === 'S0' && m.leadStatus === 'new').slice(0, 2).map(lead => (
                                <div key={lead.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl hover:bg-[#FAFAFA] transition cursor-pointer border border-transparent hover:border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <img src={lead.avatar} className="w-9 h-9 rounded-full border border-white" alt=""/>
                                        <div>
                                            <div className="text-xs font-bold text-gray-900">{lead.name}</div>
                                            <div className="text-[10px] text-gray-400">来源: 大众点评</div>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:opacity-80">去回访</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-8 bg-white rounded-[32px] p-7 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <i className="fa-solid fa-filter-circle-dollar text-gray-400"></i> 转化漏斗
                            </h3>
                            <div className="flex bg-[#F2F2F7] p-1 rounded-xl">
                                <button onClick={() => setFunnelRange('week')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${funnelRange === 'week' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>本周</button>
                                <button onClick={() => setFunnelRange('month')} className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${funnelRange === 'month' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>本月</button>
                            </div>
                        </div>
                        <div className="flex items-end h-32 px-4 gap-0 relative">
                            {activeFunnel.map((step, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="flex-1 flex flex-col items-center group relative">
                                        <div className="absolute -top-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-full">{step.label}</div>
                                        <div className={`w-full rounded-t-xl transition-all duration-700 ${idx === 0 ? 'bg-black h-24' : idx === 1 ? 'bg-gray-800 h-16' : idx === 2 ? 'bg-gray-300 h-10' : 'bg-gray-100 h-6'}`}></div>
                                        <div className="mt-3 text-center">
                                            <div className="text-sm font-bold text-gray-900 font-mono">{step.count}</div>
                                        </div>
                                    </div>
                                    {idx < activeFunnel.length - 1 && (
                                        <div className="w-12 h-full flex flex-col items-center justify-center pb-8">
                                            <div className="bg-white border border-gray-100 text-[10px] font-bold text-gray-800 px-1.5 py-0.5 rounded shadow-sm z-10">
                                                {activeFunnel[idx+1].rate}%
                                            </div>
                                            <div className="w-px flex-1 bg-gray-100 my-1"></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
              )}

              {/* MAIN LIST TABLE */}
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                      <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900">
                              {mainTab === 'leads' ? '潜客公海池' : mainTab === 'active' ? '正式会员列表' : mainTab === 'churned' ? '流失客户档案' : '全量会员档案'}
                          </span>
                          <span className="text-xs text-gray-300 font-medium font-mono">({visibleMembers.length} 记录)</span>
                      </div>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-white">
                              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                  <th className="px-8 py-5">会员名称 <FilterIcon /></th>
                                  <th className="px-4 py-5">联系电话 <FilterIcon /></th>
                                  {mainTab === 'leads' ? (
                                      <>
                                          <th className="px-4 py-5">线索来源</th>
                                          <th className="px-4 py-5">体验时间</th>
                                          <th className="px-4 py-5 text-center">意向度</th>
                                          <th className="px-4 py-5">负责人</th>
                                          <th className="px-4 py-5">状态</th>
                                      </>
                                  ) : (
                                      <>
                                          <th className="px-4 py-5 relative">
                                              所处阶段 <FilterIcon />
                                              <select className="absolute inset-0 opacity-0 cursor-pointer" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                                                  <option value="all">全部</option>
                                                  {Object.keys(STAGE_CONFIG).map(k => <option key={k} value={k}>{STAGE_CONFIG[k].label}</option>)}
                                              </select>
                                          </th>
                                          <th className="px-4 py-5">最新到店</th>
                                          <th className="px-4 py-5">卡项</th>
                                          <th className="px-4 py-5">管家</th>
                                          <th className="px-4 py-5">专属老师</th>
                                      </>
                                  )}
                                  <th className="px-4 py-5 text-center">预警</th>
                                  <th className="px-8 py-5 text-right">操作</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {visibleMembers.map(member => (
                                  <tr 
                                    key={member.id} 
                                    onClick={() => setSelectedMember(member)}
                                    className="hover:bg-[#FAFAFA] cursor-pointer transition-all duration-200 group"
                                  >
                                      <td className="px-8 py-5">
                                          <div className="flex items-center gap-3">
                                              <img src={member.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
                                              <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                                          </div>
                                      </td>
                                      <td className="px-4 py-5 text-xs text-gray-500 font-mono tracking-tighter">{member.phone}</td>
                                      
                                      {mainTab === 'leads' ? (
                                          <>
                                              <td className="px-4 py-5 text-xs text-gray-600">大众点评</td>
                                              <td className="px-4 py-5 text-xs text-gray-600">周三 14:00</td>
                                              <td className="px-4 py-5">
                                                  <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                                      <div className="h-full bg-black rounded-full" style={{ width: `${member.leadProbability}%` }}></div>
                                                  </div>
                                              </td>
                                              <td className="px-4 py-5 text-xs font-bold text-gray-900">{member.manager}</td>
                                              <td className="px-4 py-5">
                                                  <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold">待回访</span>
                                              </td>
                                          </>
                                      ) : (
                                          <>
                                              <td className="px-4 py-5">
                                                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border" style={{ color: STAGE_CONFIG[member.stage].color, backgroundColor: STAGE_CONFIG[member.stage].bgColor + '80', borderColor: STAGE_CONFIG[member.stage].color + '20' }}>
                                                      {STAGE_CONFIG[member.stage].label}
                                                  </span>
                                              </td>
                                              <td className="px-4 py-5 text-xs font-bold">{member.lastVisit}</td>
                                              <td className="px-4 py-5">
                                                  {member.cards.length > 0 ? (
                                                      <div className="max-w-[120px] truncate text-[10px] font-bold text-gray-800">
                                                          {member.cards[0].name} <span className="text-gray-400 font-normal">({member.cards[0].balance})</span>
                                                      </div>
                                                  ) : <span className="text-gray-300 text-[10px]">无持卡</span>}
                                              </td>
                                              <td className="px-4 py-5 text-xs text-gray-600">{member.manager}</td>
                                              <td className="px-4 py-5 text-xs text-gray-400">
                                                  {member.privateTeachers && member.privateTeachers.length > 0 ? (
                                                      <span className="text-gray-900 font-bold">{member.privateTeachers[0]}</span>
                                                  ) : '-'}
                                              </td>
                                          </>
                                      )}

                                      <td className="px-4 py-5 text-center">
                                          {member.riskTag === 'sleep' && <i className="fa-solid fa-moon text-gray-300"></i>}
                                          {member.riskTag === 'expiry' && <i className="fa-solid fa-hourglass-end text-red-400"></i>}
                                          {member.riskTag === 'balance' && <i className="fa-solid fa-wallet text-orange-400"></i>}
                                      </td>
                                      <td className="px-8 py-5 text-right">
                                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition"><i className="fa-regular fa-pen-to-square"></i></button>
                                              <button className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition" onClick={(e) => { e.stopPropagation(); }}><i className="fa-regular fa-trash-can"></i></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>

      {selectedMember && (
          <MemberDetailModal 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)} 
          />
      )}

      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Members;
