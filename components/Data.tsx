
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line, ComposedChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const Data: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'revenue' | 'member' | 'course' | 'training'>('overview');
  const [dateRange, setDateRange] = useState('本月');

  // --- Mock Data ---
  
  // 1. Overview / Revenue Trends
  const revenueTrendData = [
    { name: 'W1', revenue: 45000, target: 40000, profit: 12000 },
    { name: 'W2', revenue: 52000, target: 40000, profit: 15000 },
    { name: 'W3', revenue: 38000, target: 40000, profit: 8000 },
    { name: 'W4', revenue: 65000, target: 45000, profit: 22000 },
  ];

  // Daily Revenue for Finance Tab
  const dailyRevenueData = [
    { day: '1', value: 12000 }, { day: '5', value: 15000 }, { day: '10', value: 8000 },
    { day: '15', value: 22000 }, { day: '20', value: 18000 }, { day: '25', value: 35000 }, { day: '30', value: 28000 },
  ];

  // Revenue Composition
  const revenueSourceData = [
    { name: '期限卡 (年/季)', value: 45, amount: 206190, color: '#000000' },
    { name: '私教包 (PT)', value: 35, amount: 160370, color: '#4B5563' },
    { name: '次卡 (Class Pack)', value: 15, amount: 68730, color: '#9CA3AF' },
    { name: '零售周边', value: 5, amount: 22910, color: '#E5E7EB' },
  ];

  // 2. Member Persona Data
  const memberAgeData = [
    { name: '18-25岁', value: 15, fill: '#E5E7EB' },
    { name: '26-35岁', value: 45, fill: '#000000' }, // Core demographic
    { name: '36-45岁', value: 30, fill: '#4B5563' },
    { name: '46岁+', value: 10, fill: '#9CA3AF' },
  ];

  const memberGenderData = [
    { name: '女性 Female', value: 85, fill: '#000000' },
    { name: '男性 Male', value: 15, fill: '#9CA3AF' },
  ];

  const memberActiveTimeData = [
    { time: '07:00', visits: 12 }, { time: '09:00', visits: 35 },
    { time: '11:00', visits: 20 }, { time: '13:00', visits: 45 },
    { time: '15:00', visits: 15 }, { time: '17:00', visits: 25 },
    { time: '19:00', visits: 85 }, { time: '21:00', visits: 30 },
  ];

  // Detailed Funnel Data
  const funnelSteps = [
    { id: 1, name: '线索获取 (Leads)', count: 1200, width: '100%', color: 'bg-gray-200', nextConversion: 60 },
    { id: 2, name: '到店体验 (Visit)', count: 720, width: '75%', color: 'bg-gray-300', nextConversion: 35 }, // Problem area
    { id: 3, name: '付费转化 (Deal)', count: 252, width: '40%', color: 'bg-gray-600', nextConversion: 70 },
    { id: 4, name: '复购留存 (Active)', count: 176, width: '25%', color: 'bg-black', nextConversion: null },
  ];

  // 3. Course Data
  const courseTypeData = [
    { name: '团课 Group', value: 120, attendance: 980, revenue: 150000 },
    { name: '私教 Private', value: 80, attendance: 80, revenue: 280000 },
  ];

  const popularCourses = [
    { name: '普拉提大器械', type: '团课', occupancy: '98%', rating: 4.9 },
    { name: '流瑜伽 Flow', type: '团课', occupancy: '92%', rating: 4.8 },
    { name: '空中瑜伽', type: '团课', occupancy: '88%', rating: 4.7 },
    { name: '脊柱理疗', type: '团课', occupancy: '85%', rating: 4.9 },
    { name: '晨间唤醒', type: '团课', occupancy: '60%', rating: 4.5 },
  ];

  const topTeachers = [
    { name: 'Mike', type: '私教', hours: 120, revenue: '¥96k', rating: 5.0 },
    { name: 'Sarah', type: '私教', hours: 105, revenue: '¥84k', rating: 4.9 },
    { name: 'Anna', type: '私教', hours: 88, revenue: '¥70k', rating: 4.8 },
  ];

  // Heatmap Data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const occupancyHeatmapData = [
    { time: '10:00', days: [30, 40, 35, 50, 45, 85, 90] },
    { time: '12:00', days: [60, 55, 65, 60, 70, 80, 75] }, // Lunch break
    { time: '14:00', days: [20, 25, 20, 30, 25, 60, 65] }, // Afternoon slump
    { time: '16:00', days: [25, 30, 25, 35, 30, 55, 60] },
    { time: '18:00', days: [75, 80, 70, 85, 80, 60, 55] }, // After work
    { time: '19:00', days: [95, 90, 92, 98, 85, 50, 45] }, // Prime time
    { time: '20:00', days: [80, 75, 78, 80, 60, 40, 35] },
  ];

  const getHeatmapColor = (value: number) => {
      if (value >= 90) return 'bg-black text-white';
      if (value >= 75) return 'bg-gray-800 text-white';
      if (value >= 60) return 'bg-gray-500 text-white';
      if (value >= 40) return 'bg-gray-300 text-gray-800';
      return 'bg-gray-100 text-gray-400';
  };

  // 4. Training (TTC) Data
  const trainingProjectData = [
    { name: 'RYT 200', revenue: 180000, students: 12, profitMargin: 0.6 },
    { name: '普拉提大器械', revenue: 90000, students: 8, profitMargin: 0.55 },
    { name: '孕产工作坊', revenue: 45000, students: 15, profitMargin: 0.7 },
    { name: '倒立后弯', revenue: 20000, students: 20, profitMargin: 0.8 },
  ];

  const trainingTrendData = [
    { month: '8月', revenue: 120000 },
    { month: '9月', revenue: 150000 },
    { month: '10月', revenue: 280000 }, // RYT intake
    { month: '11月', revenue: 180000 },
  ];

  // --- Components ---

  const InsightCard = ({ title, status, desc, action }: { title: string, status: 'good' | 'warning' | 'bad', desc: string, action?: string }) => (
    <div className={`p-4 rounded-xl border-l-4 flex flex-col gap-2 ${
      status === 'good' ? 'bg-green-50 border-green-500' : 
      status === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'
    }`}>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <i className={`fa-solid ${status === 'good' ? 'fa-circle-check text-green-600' : status === 'warning' ? 'fa-triangle-exclamation text-yellow-600' : 'fa-circle-xmark text-red-600'}`}></i>
                <h4 className={`text-sm font-bold ${status === 'good' ? 'text-green-800' : status === 'warning' ? 'text-yellow-800' : 'text-red-800'}`}>{title}</h4>
            </div>
            {action && <button className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm hover:bg-gray-50 transition">{action}</button>}
        </div>
        <p className="text-xs text-gray-600 leading-relaxed ml-6">{desc}</p>
    </div>
  );

  const KPICard = ({ label, value, sub, trend, inverse = false, icon }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            {trend && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    (trend > 0 && !inverse) || (trend < 0 && inverse) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div className="text-3xl font-bold text-gray-900 font-mono tracking-tight relative z-10">{value}</div>
        <div className="text-xs text-gray-400 mt-1 relative z-10">{sub}</div>
        {icon && (
            <div className="absolute -bottom-4 -right-4 text-gray-50 text-7xl group-hover:text-gray-100 transition-colors z-0">
                <i className={`fa-solid ${icon}`}></i>
            </div>
        )}
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">经营数据智能中台</h2>
                <span className="px-2 py-0.5 bg-black text-white text-[10px] rounded font-bold">PRO</span>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => alert('Gemini AI 正在生成深度经营分析报告...')}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition shadow-sm"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI 深度分析
                </button>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['本周', '本月', '本季', '全年'].map(r => (
                        <button 
                            key={r} 
                            onClick={() => setDateRange(r)}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition ${dateRange === r ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition">
                    <i className="fa-solid fa-download text-xs"></i>
                </button>
            </div>
        </div>

        {/* Sub Navigation (Unified Segmented Control) */}
        <div className="px-8 py-4 bg-[#F5F5F7] sticky top-16 z-10 border-b border-gray-200/50 flex justify-start">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                {[
                    { id: 'overview', label: '全店总览', icon: 'fa-chart-pie' },
                    { id: 'revenue', label: '财务分析', icon: 'fa-chart-line' },
                    { id: 'member', label: '会员分析', icon: 'fa-users-viewfinder' },
                    { id: 'course', label: '课程分析', icon: 'fa-chart-simple' },
                    { id: 'training', label: '教培中心', icon: 'fa-graduation-cap' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id as any)}
                        className={`relative z-10 flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${
                            currentTab === tab.id 
                            ? 'bg-white text-black shadow-sm font-bold' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* --- TAB: OVERVIEW --- */}
                {currentTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* 1. North Star & Diagnostics */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl text-black pointer-events-none"><i className="fa-solid fa-bullseye"></i></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">本月北极星指标 (GMV)</h3>
                                        <div className="flex items-end gap-3 mt-2">
                                            <span className="text-4xl font-bold font-mono text-gray-900">¥458,200</span>
                                            <span className="text-sm font-medium text-gray-500 mb-1">/ 目标 ¥540,000</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12.5% YoY</div>
                                    </div>
                                </div>
                                <div className="mt-6 relative z-10">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span>进度 84.8%</span>
                                        <span className="text-gray-400">剩余 5 天</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-black rounded-full" style={{width: '84.8%'}}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-span-4 space-y-3">
                                <InsightCard 
                                    title="营收表现优异" 
                                    status="good" 
                                    desc="本月教培业务收入同比增长 40%，有效拉动了整体毛利率提升。" 
                                />
                                <InsightCard 
                                    title="周二晚间空置预警" 
                                    status="warning" 
                                    desc="下周二晚间 19:00 - 21:00 团课预约率仅 30%，建议发起闪购活动。" 
                                    action="一键排期促销"
                                />
                            </div>
                        </div>

                        {/* 2. Key Metrics Grid */}
                        <div className="grid grid-cols-4 gap-6">
                            <KPICard label="净利润 Net Profit" value="¥135k" sub="净利率 29.5%" trend={5.2} icon="fa-piggy-bank" />
                            <KPICard label="活跃会员 Active" value="850" sub="近30天到店" trend={8.1} icon="fa-users" />
                            <KPICard label="平均满座率 Occupancy" value="75%" sub="团课业务" trend={-2.4} inverse={true} icon="fa-chair" />
                            <KPICard label="客单价 ARPU" value="¥2,800" sub="含私教包" trend={1.5} icon="fa-receipt" />
                        </div>

                        {/* 3. Main Trend Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">营收与利润趋势 (周度)</h3>
                                <div className="flex gap-4 text-xs">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-black"></div> 营收</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div> 净利润</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-dashed border-gray-400"></div> 目标线</span>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={revenueTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                            itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                                        />
                                        <Area type="monotone" dataKey="revenue" fill="url(#colorRev)" stroke="#000" strokeWidth={3} />
                                        <Bar dataKey="profit" barSize={20} fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                                        <Line type="monotone" dataKey="target" stroke="#9CA3AF" strokeDasharray="5 5" dot={false} />
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: REVENUE (Detailed Managerial Analysis) --- */}
                {currentTab === 'revenue' && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        {/* 1. Finance KPIs for Managers */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">今日营收 Today</div>
                                <div className="text-3xl font-bold text-gray-900 font-mono">¥12,800</div>
                                <div className="text-xs text-green-600 mt-1 font-bold">+5% vs 昨日</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">本月营收 MTD</div>
                                <div className="text-3xl font-bold text-gray-900 font-mono">¥458,200</div>
                                <div className="text-xs text-gray-400 mt-1">目标达成 84%</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">收支比 Ratio</div>
                                <div className="text-3xl font-bold text-gray-900 font-mono">1 : 0.4</div>
                                <div className="text-xs text-gray-400 mt-1">支出占比 40% (正常)</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">客单价 ATV</div>
                                <div className="text-3xl font-bold text-gray-900 font-mono">¥3,200</div>
                                <div className="text-xs text-green-600 mt-1 font-bold">+150 vs 上月</div>
                            </div>
                        </div>

                        {/* 2. Revenue Composition & Strategy */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-900">收入构成与波动 (Revenue Mix)</h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailyRevenueData}>
                                            <defs>
                                                <linearGradient id="colorRevenueDaily" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="value" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueDaily)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-4">卡项贡献占比</h3>
                                <div className="flex-1 relative">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie 
                                                data={revenueSourceData} 
                                                innerRadius={50} 
                                                outerRadius={70} 
                                                paddingAngle={2} 
                                                dataKey="value"
                                            >
                                                {revenueSourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                                        <span className="text-xl font-bold font-mono">100%</span>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {revenueSourceData.map((item) => (
                                        <div key={item.name} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                                <span className="text-gray-500">{item.name}</span>
                                            </div>
                                            <span className="font-bold font-mono">{item.value}% (¥{item.amount.toLocaleString()})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. Actionable Insights */}
                        <div className="grid grid-cols-2 gap-6">
                            <InsightCard 
                                title="私教包业绩滞后" 
                                status="warning" 
                                desc="本月私教包收入占比 (35%) 低于季度平均 (45%)。建议针对 S3 稳定期会员推送私教体验课。" 
                                action="创建私教促销"
                            />
                            <InsightCard 
                                title="期限卡现金流健康" 
                                status="good" 
                                desc="年度金卡销售火爆，提供了充足的预收现金流，足以覆盖未来3个月的固定运营成本。" 
                            />
                        </div>
                    </div>
                )}

                {/* --- TAB: MEMBER (Enhanced with Funnel) --- */}
                {currentTab === 'member' && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        {/* 1. Member KPIs */}
                        <div className="grid grid-cols-4 gap-6">
                            <KPICard label="会员总数 Total" value="1,890" sub="人" trend={12} icon="fa-address-card" />
                            <KPICard label="活跃占比 Active Rate" value="45%" sub="850人 近30天到店" trend={2.5} icon="fa-person-running" />
                            <KPICard label="沉睡占比 Dormant" value="11%" sub="205人 >60天未到" trend={-1.2} inverse={true} icon="fa-bed" />
                            <KPICard label="月均到店 Frequency" value="7.2" sub="次/月" trend={0.5} icon="fa-shoe-prints" />
                        </div>

                        {/* 2. Funnel Analysis */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6">会员生命周期漏斗 (Lifecycle Funnel)</h3>
                                <div className="flex flex-col items-center gap-2">
                                    {funnelSteps.map((step) => (
                                        <div key={step.id} className="w-full flex flex-col items-center relative group">
                                            {/* Bar */}
                                            <div 
                                                className={`h-12 flex items-center justify-between px-4 rounded-lg text-white font-bold text-sm shadow-sm transition-all duration-300 relative z-10 ${step.color}`}
                                                style={{ width: step.width }}
                                            >
                                                <span>{step.name}</span>
                                                <span className="font-mono text-lg">{step.count}</span>
                                            </div>
                                            
                                            {/* Connector / Conversion Rate */}
                                            {step.nextConversion !== null && (
                                                <div className="h-8 border-l-2 border-dashed border-gray-300 flex items-center justify-center relative">
                                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                        step.nextConversion < 40 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-gray-500 border-gray-200'
                                                    }`}>
                                                        转化率 {step.nextConversion}%
                                                        {step.nextConversion < 40 && <i className="fa-solid fa-triangle-exclamation ml-1"></i>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-4 space-y-4">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col justify-center">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">漏斗诊断 (Diagnostics)</div>
                                    
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-4">
                                        <div className="flex items-center gap-2 mb-2 text-red-800 font-bold text-sm">
                                            <i className="fa-solid fa-circle-exclamation"></i> 瓶颈：体验 转 成交
                                        </div>
                                        <p className="text-xs text-red-700 leading-relaxed">
                                            转化率仅 35% (行业标准 50%)。流失主要发生在体验课后24小时内。
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-xs font-bold text-gray-900">建议行动：</div>
                                        <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-left px-3 flex justify-between items-center">
                                            <span>1. 优化体验课SOP (话术)</span>
                                            <i className="fa-solid fa-chevron-right text-gray-300"></i>
                                        </button>
                                        <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-left px-3 flex justify-between items-center">
                                            <span>2. 发送 "新客首单" 限时优惠券</span>
                                            <i className="fa-solid fa-chevron-right text-gray-300"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Member Persona (Renamed from Member Analysis) */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <i className="fa-solid fa-id-badge text-gray-400"></i> 会员分析 (Analysis)
                                </h3>
                                <div className="grid grid-cols-2 gap-4 h-48">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-xs font-bold text-gray-400">性别</span>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={memberGenderData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                                                    {memberGenderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="text-center text-xs text-gray-500 -mt-2">女性 85%</div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-xs font-bold text-gray-400">年龄</span>
                                        </div>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={memberAgeData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                                                    {memberAgeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="text-center text-xs text-gray-500 -mt-2">核心: 26-35岁</div>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed border border-gray-100">
                                    <span className="font-bold text-black">💡 营销建议：</span> 主力人群为 <span className="font-bold">26-35岁职场女性</span>，建议在 <span className="font-bold">小红书</span> 投放 "肩颈放松"、"体态矫正" 类内容。
                                </div>
                            </div>

                            <div className="col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <i className="fa-solid fa-clock text-gray-400"></i> 会员活跃时段 (Active Hours)
                                </h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={memberActiveTimeData}>
                                            <defs>
                                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="visits" stroke="#000" fillOpacity={1} fill="url(#colorVisits)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <div className="flex-1 bg-yellow-50 p-2 rounded-lg border border-yellow-100 flex items-center gap-2">
                                        <i className="fa-solid fa-sun text-yellow-500"></i>
                                        <div>
                                            <div className="text-[10px] text-yellow-800 font-bold">早高峰</div>
                                            <div className="text-xs font-bold text-black">09:00 - 10:00</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center gap-2">
                                        <i className="fa-solid fa-moon text-blue-500"></i>
                                        <div>
                                            <div className="text-[10px] text-blue-800 font-bold">晚高峰 (最热)</div>
                                            <div className="text-xs font-bold text-black">19:00 - 21:00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: COURSE (Enhanced) --- */}
                {currentTab === 'course' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* 1. Course KPIs */}
                        <div className="grid grid-cols-4 gap-6">
                            <KPICard label="本月开课 Total Classes" value="320" sub="节" trend={5} icon="fa-calendar-days" />
                            <KPICard label="总到课 Attendance" value="1,850" sub="人次" trend={8.2} icon="fa-users" />
                            <KPICard label="团课平均上座率" value="78%" sub="目标 75%" trend={3.0} icon="fa-chair" />
                            <KPICard label="私教消课量" value="450" sub="节" trend={12} icon="fa-dumbbell" />
                        </div>

                        {/* Occupancy Heatmap */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <i className="fa-solid fa-fire text-gray-400"></i> 小班团课上座率热力图 (Occupancy Heatmap)
                                </h3>
                                <div className="flex gap-2 text-xs items-center">
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 rounded"></span> &lt;40%</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 rounded"></span> 40-60%</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-500 rounded"></span> 60-75%</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-800 rounded"></span> 75-90%</div>
                                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-black rounded"></span> &gt;90%</div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px]">
                                    {/* Header */}
                                    <div className="grid grid-cols-8 gap-2 mb-2">
                                        <div className="text-center text-xs font-bold text-gray-400">Time</div>
                                        {weekDays.map(day => (
                                            <div key={day} className="text-center text-xs font-bold text-gray-900">{day}</div>
                                        ))}
                                    </div>
                                    {/* Rows */}
                                    {occupancyHeatmapData.map((row, idx) => (
                                        <div key={idx} className="grid grid-cols-8 gap-2 mb-2">
                                            <div className="flex items-center justify-center text-xs font-mono font-bold text-gray-500">{row.time}</div>
                                            {row.days.map((val, dIdx) => (
                                                <div 
                                                    key={dIdx} 
                                                    className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold transition hover:scale-105 cursor-default ${getHeatmapColor(val)}`}
                                                    title={`上座率: ${val}%`}
                                                >
                                                    {val}%
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Course Type Breakdown */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6">产能分布：团课 vs 私教</h3>
                                <div className="space-y-6">
                                    {courseTypeData.map((type) => (
                                        <div key={type.name}>
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="font-bold text-sm text-gray-900">{type.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    <span className="font-bold text-black mr-3">{type.attendance} 人次</span>
                                                    <span className="font-mono">¥{type.revenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-100">
                                                <div className="bg-black" style={{width: `${(type.value / (courseTypeData[0].value + courseTypeData[1].value)) * 100}%`}}></div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1">开课数量占比</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">最受欢迎课程 Top 5</h3>
                                    <button className="text-xs text-gray-500 hover:text-black">查看全部</button>
                                </div>
                                <div className="space-y-3">
                                    {popularCourses.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>{i+1}</div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{c.name}</div>
                                                    <div className="text-[10px] text-gray-500">{c.type}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">{c.occupancy}</div>
                                                <div className="text-[10px] text-gray-400">上座率</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. Teacher Ranking */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">私教明星榜 (Top Teachers)</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {topTeachers.map((t, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-gray-200 hover:border-black transition group cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">TOP {i+1}</div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:bg-black group-hover:text-white transition">
                                                {t.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{t.name}</div>
                                                <div className="text-xs text-gray-500">{t.type}教练</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-3">
                                            <div>
                                                <div className="text-[10px] text-gray-400">课时</div>
                                                <div className="font-bold text-sm">{t.hours}h</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400">营收</div>
                                                <div className="font-bold text-sm text-green-600">{t.revenue}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400">评分</div>
                                                <div className="font-bold text-sm text-yellow-500">{t.rating}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: TRAINING (New & Expanded) --- */}
                {currentTab === 'training' && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        {/* 1. TTC Headers */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="col-span-3 bg-black text-white p-8 rounded-2xl shadow-xl flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">教培中心总营收 (TTC Revenue)</div>
                                    <div className="text-4xl font-bold font-mono">¥635,000</div>
                                    <div className="text-sm text-gray-400 mt-2">本年度累计 · 同比增长 <span className="text-green-400">+45%</span></div>
                                </div>
                                <div className="h-16 w-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trainingTrendData}>
                                            <Line type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={3} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-2">累计培养学员</div>
                                <div className="text-4xl font-bold text-gray-900">128 <span className="text-base font-normal text-gray-400">人</span></div>
                                <div className="text-xs text-green-600 mt-2 font-bold bg-green-50 w-fit px-2 py-1 rounded">就业率 85%</div>
                            </div>
                        </div>

                        {/* 2. Project Analysis */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6">各教培项目表现 (Project Performance)</h3>
                                <div className="space-y-4">
                                    {trainingProjectData.map((proj) => (
                                        <div key={proj.name} className="flex items-center gap-4">
                                            <div className="w-32 text-sm font-bold text-gray-900">{proj.name}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-500">营收贡献</span>
                                                    <span className="font-mono font-bold">¥{proj.revenue.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-black rounded-full" style={{width: `${(proj.revenue/200000)*100}%`}}></div>
                                                </div>
                                            </div>
                                            <div className="w-24 text-right">
                                                <div className="text-xs text-gray-400">利润率</div>
                                                <div className={`font-bold text-sm ${proj.profitMargin > 0.6 ? 'text-green-600' : 'text-gray-900'}`}>{(proj.profitMargin * 100).toFixed(0)}%</div>
                                            </div>
                                            <div className="w-24 text-right">
                                                <div className="text-xs text-gray-400">学员</div>
                                                <div className="font-bold text-sm">{proj.students}人</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">招生漏斗 (Funnel)</h3>
                                <div className="space-y-3 relative">
                                    {/* Simplified Funnel Visual */}
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center relative z-30 mx-0">
                                        <div className="text-xs text-gray-500">咨询线索</div>
                                        <div className="font-bold text-lg">450</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-center relative z-20 mx-4">
                                        <div className="text-xs text-gray-500">参加说明会</div>
                                        <div className="font-bold text-lg">120</div>
                                    </div>
                                    <div className="p-3 bg-black text-white border border-black rounded-lg text-center relative z-10 mx-8 shadow-lg">
                                        <div className="text-xs text-gray-400">缴费报名</div>
                                        <div className="font-bold text-lg">45</div>
                                    </div>
                                </div>
                                <div className="mt-6 text-center text-xs text-gray-400">
                                    转化率: <span className="text-black font-bold">10%</span> (行业平均 8%)
                                </div>
                            </div>
                        </div>

                        {/* 3. Upcoming Cohorts */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">即将开班 (Upcoming Cohorts)</h3>
                                <button className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold">新增排期</button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-32 hover:border-black transition cursor-pointer">
                                    <div>
                                        <div className="text-xs text-blue-600 font-bold mb-1">2024 春季班</div>
                                        <div className="font-bold text-lg">RYT 200 周末班</div>
                                        <div className="text-xs text-gray-500 mt-1">3月15日 开课</div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-blue-500 w-3/4"></div>
                                    </div>
                                    <div className="text-[10px] text-right text-gray-400 mt-1">已报 12 / 限 16</div>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-32 hover:border-black transition cursor-pointer">
                                    <div>
                                        <div className="text-xs text-purple-600 font-bold mb-1">进阶工作坊</div>
                                        <div className="font-bold text-lg">孕产修复专题</div>
                                        <div className="text-xs text-gray-500 mt-1">4月5日 开课</div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-purple-500 w-1/2"></div>
                                    </div>
                                    <div className="text-[10px] text-right text-gray-400 mt-1">已报 10 / 限 20</div>
                                </div>
                                <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center h-32 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition cursor-pointer">
                                    <i className="fa-solid fa-plus text-2xl mb-2"></i>
                                    <span className="text-xs font-bold">规划新班次</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Data;
