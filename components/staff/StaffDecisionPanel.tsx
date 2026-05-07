import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, LabelList, ReferenceArea,
} from 'recharts';
import { MOCK_STAFF_LIST } from '../../constants';
import type { Staff } from '../../types';
import type { StaffMatrixItem } from '../../utils/staffSelectors';

type StaffTab = 'decision' | 'archives' | 'schedule';
type StaffModalTab = 'course' | 'member' | 'income' | 'promotion';

interface StaffDecision {
  title: string;
  leads: string;
  action: string;
  color: string;
}

interface StaffDecisionPanelProps {
  activeTab: StaffTab;
  decisions: StaffDecision[];
  matrixData: StaffMatrixItem[];
  conversionTop: Staff[];
  consumptionTop: Staff[];
  occupancyBottom: Staff[];
  followUpBottom: Staff[];
  activeDecisionIdx: number | null;
  setActiveDecisionIdx: (index: number | null) => void;
  setActiveStaff: (staff: Staff) => void;
  setActiveModalTab: (tab: StaffModalTab) => void;
  setShowStaffModal: (show: boolean) => void;
}

const StaffDecisionPanel: React.FC<StaffDecisionPanelProps> = (props) => {
  const {
    activeTab,
    decisions,
    matrixData,
    conversionTop,
    consumptionTop,
    occupancyBottom,
    followUpBottom,
    activeDecisionIdx,
    setActiveDecisionIdx,
    setActiveStaff,
    setActiveModalTab,
    setShowStaffModal,
  } = props;

  return (
    <>
            {/* TAB 1: DECISION & INSIGHTS */}
            {activeTab === 'decision' && (
                <div className="space-y-6 animate-fadeIn">
                    
                    {/* 1. Decision Cards */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pl-1 border-l-4 border-black leading-none">决策建议</h3>
                        <div className="grid grid-cols-4 gap-6">
                            {decisions.map((d, idx) => (
                                <div key={idx} onClick={() => setActiveDecisionIdx(idx)} className={`bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[120px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-pointer`}>
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${d.color.replace('border-l-', 'bg-')}`}></div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{d.title}</h4>
                                        <div className="text-sm font-bold text-gray-900 leading-snug">{d.leads}</div>
                                    </div>
                                    <button className="self-start mt-4 px-4 py-1.5 bg-gray-50 hover:bg-black hover:text-white transition rounded-full text-[10px] font-bold border border-gray-100 group-hover:border-transparent">
                                        {d.action} <i className="fa-solid fa-arrow-right ml-1 opacity-50 group-hover:opacity-100"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Charts & Rankings Row (Aligned Height) */}
                    <div className="grid grid-cols-12 gap-6 h-[720px]">
                        
                        {/* LEFT: Capability Matrix */}
                        <div className="col-span-8 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">员工能力矩阵</h3>
                                    <p className="text-xs text-gray-400 mt-1">成交率 (X) vs 负载率 (Y)</p>
                                </div>
                                <div className="flex gap-4 text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 发动机</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> 骨干</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 培养</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 调整</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" dataKey="x" name="成交率" unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} label={{ value: '体验成交率 →', position: 'insideBottomRight', offset: -10, fontSize: 11, fill: '#9CA3AF' }} />
                                        <YAxis type="number" dataKey="y" name="负载率" unit="%" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} label={{ value: '当前负载率 ↑', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9CA3AF' }} />
                                        <ZAxis type="number" range={[200, 800]} />
                                        
                                        {/* Quadrants */}
                                        <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#F0FDF4" fillOpacity={0.6} radius={[0,0,20,0]} />
                                        <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#FFFBEB" fillOpacity={0.6} radius={[0,20,0,0]} />
                                        <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#EFF6FF" fillOpacity={0.6} radius={[0,0,0,20]} />
                                        <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#FEF2F2" fillOpacity={0.6} radius={[20,0,0,0]} />
                                        
                                        <ReTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-black/90 backdrop-blur text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-white/10">
                                                        <div className="font-bold text-sm mb-1">{data.name} <span className="text-white/50 text-[10px] uppercase ml-1">{data.level}</span></div>
                                                        <div className="opacity-80 grid grid-cols-2 gap-x-4">
                                                            <span>成交: <span className="font-mono font-bold text-green-400">{data.x}%</span></span>
                                                            <span>负载: <span className="font-mono font-bold text-yellow-400">{data.y}%</span></span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Scatter name="Teachers" data={matrixData} onClick={(e) => {
                                            const staff = MOCK_STAFF_LIST.find(s => s.id === e.id);
                                            if(staff) { setActiveStaff(staff); setActiveModalTab('course'); setShowStaffModal(true); }
                                        }}>
                                            {matrixData.map((entry, index) => {
                                                let fill = '#000';
                                                if(entry.x >= 50 && entry.y < 50) fill = '#22C55E';
                                                else if(entry.x >= 50 && entry.y >= 50) fill = '#F59E0B';
                                                else if(entry.x < 50 && entry.y < 50) fill = '#3B82F6';
                                                else fill = '#EF4444';
                                                return <Cell key={`cell-${index}`} fill={fill} stroke="white" strokeWidth={3} className="cursor-pointer hover:opacity-80 transition-opacity filter drop-shadow-md" />;
                                            })}
                                            <LabelList dataKey="name" position="top" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#374151' }} offset={10} />
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                                
                                <div className="absolute top-6 right-6 text-[10px] font-bold text-yellow-700 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-yellow-100">🔥 核心骨干 Core</div>
                                <div className="absolute top-6 left-16 text-[10px] font-bold text-red-700 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-red-100">⚠️ 调整对象 Overload</div>
                                <div className="absolute bottom-12 right-6 text-[10px] font-bold text-green-700 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-green-100">🚀 业绩发动机 Engine</div>
                                <div className="absolute bottom-12 left-16 text-[10px] font-bold text-blue-700 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">🌱 培养对象 Trainee</div>
                            </div>
                        </div>

                        {/* RIGHT: Rankings Stack (Aligned Height) */}
                        <div className="col-span-4 flex flex-col h-full gap-4">
                            
                            {/* 1. Conversion Rate (Flex Grow) */}
                            <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex-1 flex flex-col justify-center min-h-0">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between shrink-0">
                                    <span>体验成交率 (Top 3)</span>
                                    <div className="text-[9px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded font-bold">转化</div>
                                </h3>
                                <div className="space-y-3 overflow-hidden">
                                    {conversionTop.map((s, idx) => (
                                        <div key={s.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${idx===0?'bg-yellow-400 text-white':idx===1?'bg-gray-300 text-white':idx===2?'bg-orange-200 text-white':'bg-gray-100 text-gray-500'}`}>{idx+1}</span>
                                                <div className="flex items-center gap-2">
                                                    <img src={s.avatar} className="w-6 h-6 rounded-full bg-gray-100 border border-gray-100" alt=""/>
                                                    <span className="text-xs font-bold text-gray-700">{s.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-24 justify-end">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-black group-hover:bg-green-500 transition-colors" style={{width: `${s.conversionRate}%`}}></div>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-black w-8 text-right">{s.conversionRate}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Consumption (Flex Grow) */}
                            <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex-1 flex flex-col justify-center min-h-0">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between shrink-0">
                                    <span>7天耗课量 (Top 3)</span>
                                    <div className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-bold">消课</div>
                                </h3>
                                <div className="space-y-3 overflow-hidden">
                                    {consumptionTop.map((s, i) => (
                                        <div key={s.id} className="group">
                                            <div className="flex justify-between text-[11px] mb-1.5">
                                                <span className="text-gray-700 font-bold flex items-center gap-2">
                                                    <span className="text-gray-400 w-3">{i+1}</span> {s.name}
                                                </span>
                                                <span className="font-mono font-bold">{s.classHours}h</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-black group-hover:bg-blue-500 transition-colors" style={{ width: `${(s.classHours/2400)*100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Occupancy Rate (Flex Grow) - CHANGED TO BOTTOM 3 */}
                            <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex-1 flex flex-col justify-center min-h-0">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between shrink-0">
                                    <span>满座率预警 (Bottom 3)</span>
                                    <div className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded font-bold animate-pulse">关注</div>
                                </h3>
                                <div className="space-y-3 overflow-hidden">
                                    {occupancyBottom.map((s, i) => (
                                        <div key={s.id} className="flex items-center justify-between p-2 rounded-lg transition group border border-transparent hover:bg-red-50/50 hover:border-red-100">
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-gray-100 text-gray-500">{i+1}</span>
                                                <span className="text-xs font-bold text-gray-700">{s.name}</span>
                                            </div>
                                            <span className={`text-sm font-mono font-bold ${s.occupancyRate < 60 ? 'text-red-500' : 'text-black'}`}>{s.occupancyRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Follow-up Rate (Flex Grow) - NEW */}
                            <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex-1 flex flex-col justify-center min-h-0">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between shrink-0">
                                    <span>未及时跟进预警 (Bottom 3)</span>
                                    <div className="text-[9px] bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded font-bold animate-pulse">催办</div>
                                </h3>
                                <div className="space-y-3 overflow-hidden">
                                    {followUpBottom.map((s, i) => (
                                        <div key={s.id} className="flex items-center justify-between p-2 rounded-lg transition group border border-transparent hover:bg-orange-50/50 hover:border-orange-100">
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-gray-100 text-gray-500">{i+1}</span>
                                                <span className="text-xs font-bold text-gray-700">{s.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-mono font-bold ${(s.followUpRate || 0) < 50 ? 'text-red-500' : 'text-orange-500'}`}>{s.followUpRate || 0}%</span>
                                                <button className="text-[10px] bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors">
                                                    去催办
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

      {/* Decision Details Modal */}
      {activeDecisionIdx !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveDecisionIdx(null)}></div>
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10 shadow-2xl animate-fadeInUp">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                          <i className={`fa-solid fa-lightbulb ${decisions[activeDecisionIdx].color.replace('border-l-', 'text-')}`}></i>
                          {decisions[activeDecisionIdx].title}
                      </h3>
                      <button onClick={() => setActiveDecisionIdx(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                          <i className="fa-solid fa-xmark"></i>
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scroll">
                      <div className="text-sm text-gray-500 mb-4">以下老师需要您的关注：</div>
                      <div className="space-y-3">
                          {MOCK_STAFF_LIST.slice(0, 3).map((staff, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer" onClick={() => {
                                  setActiveDecisionIdx(null);
                                  setActiveStaff(staff);
                                  setShowStaffModal(true);
                              }}>
                                  <div className="flex items-center gap-4">
                                      <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                      <div>
                                          <div className="font-bold text-gray-900">{staff.name} <span className="text-xs font-normal text-gray-500 ml-2">{staff.title}</span></div>
                                          <div className="text-xs text-red-500 mt-1"><i className="fa-solid fa-circle-exclamation mr-1"></i> {decisions[activeDecisionIdx].title}异常</div>
                                      </div>
                                  </div>
                                  <button className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition">查看档案</button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </>
  );
};

export default StaffDecisionPanel;
