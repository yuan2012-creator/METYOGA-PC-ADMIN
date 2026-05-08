
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, ComposedChart, Cell, PieChart, Pie
} from 'recharts';

const Investor: React.FC = () => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast(current => (current === message ? null : current));
    }, 2400);
  };

  // --- Mock Data ---

  // 1. ROI Trend
  const roiData = [
    { period: 'Q1 23', roi: -15 },
    { period: 'Q2 23', roi: -8 },
    { period: 'Q3 23', roi: -2 },
    { period: 'Q4 23', roi: 5 },
    { period: 'Q1 24', roi: 12 },
    { period: 'Q2 24', roi: 18 },
    { period: 'Q3 24', roi: 24 }, // Current
    { period: 'Q4 24', roi: 32 }, // Forecast
  ];

  // 2. Investment Structure
  const investStructureData = [
    { name: '装修硬装', value: 800000, color: '#1D1D1F' },
    { name: '器械设备', value: 500000, color: '#4B5563' },
    { name: '押金租金', value: 400000, color: '#9CA3AF' },
    { name: '人力启动', value: 300000, color: '#E5E7EB' },
  ];

  // 3. Cash Flow Trend
  const cashFlowData = [
    { month: '5月', revenue: 420, cost: 310, net: 110 },
    { month: '6月', revenue: 450, cost: 320, net: 130 },
    { month: '7月', revenue: 480, cost: 330, net: 150 },
    { month: '8月', revenue: 410, cost: 310, net: 100 },
    { month: '9月', revenue: 520, cost: 340, net: 180 },
    { month: '10月', revenue: 580, cost: 350, net: 230 },
  ];

  // 4. Growth Trends
  const memberGrowthData = [
    { month: '5月', members: 120 }, { month: '6月', members: 145 },
    { month: '7月', members: 180 }, { month: '8月', members: 210 },
    { month: '9月', members: 255 }, { month: '10月', members: 310 },
  ];

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                投资人看板 (Investor Relations)
                <button 
                    onClick={() => showToast('Gemini AI 正在生成投资分析报告...')}
                    className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI 投资分析
                </button>
            </h2>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">数据更新至: 2023-11-25</span>
                <button
                    onClick={() => showToast('投资人月报导出演示已准备')}
                    className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:opacity-80 transition shadow-lg shadow-black/10"
                >
                    <i className="fa-solid fa-file-pdf mr-2"></i>导出月报
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* 1. Key Investment Metrics */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Investment & Recovery */}
                    <div className="col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <i className="fa-solid fa-sack-dollar"></i> 回本进度 (Payback Progress)
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">预计完全回本日期: <span className="font-bold text-black">2024年11月</span></p>
                            </div>
                            <div className="flex gap-4 text-right">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">总投资额</div>
                                    <div className="text-lg font-mono font-bold">¥2,000,000</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">已回收资金</div>
                                    <div className="text-lg font-mono font-bold text-green-600">¥1,340,000</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar with Markers */}
                        <div className="relative pt-6 pb-2">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span>当前进度 67%</span>
                                <span className="text-gray-400">目标 100%</span>
                            </div>
                            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                                <div className="h-full bg-gradient-to-r from-gray-800 to-black rounded-full relative z-10" style={{width: '67%'}}>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
                                </div>
                                {/* Scenario Markers */}
                                <div className="absolute top-0 bottom-0 w-0.5 bg-green-400 z-20" style={{left: '85%'}} title="乐观预测: 2024-09"></div>
                                <div className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20" style={{left: '55%'}} title="保守预测: 2025-02"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                                <span className="pl-[55%] relative -ml-6 text-red-400 font-medium">保守 2025/02</span>
                                <span className="pl-[23%] relative -ml-6 text-green-600 font-medium">乐观 2024/09</span>
                            </div>
                        </div>
                    </div>

                    {/* ROI & Structure */}
                    <div className="col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">投资回报率 (ROI)</h3>
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">+24% Q3</span>
                        </div>
                        <div className="flex-1 h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={roiData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="period" hide />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px'}}
                                        formatter={(value: any) => [`${value}%`, 'ROI']}
                                    />
                                    <Line type="monotone" dataKey="roi" stroke="#000" strokeWidth={2} dot={{r: 2}} activeDot={{r: 4}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-400 text-center">季度趋势 (总收益 - 总投资) / 总投资</div>
                    </div>
                </div>

                {/* 2. Cash Flow & Profitability */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Cash Flow */}
                    <div className="col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <i className="fa-solid fa-money-bill-transfer"></i> 月度现金流 (Cash Flow)
                            </h3>
                            <div className="flex gap-4 text-xs">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div> 收入</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-800"></div> 成本</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> 净现金流</span>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={cashFlowData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="revenue" barSize={12} fill="#E5E7EB" stackId="a" />
                                    <Bar dataKey="cost" barSize={12} fill="#1F2937" stackId="a" />
                                    <Line type="monotone" dataKey="net" stroke="#22c55e" strokeWidth={3} dot={{r:3}} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Profitability Metrics */}
                    <div className="col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-chart-simple"></i> 盈利能力核心指标
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">毛利率 Gross Margin</div>
                                <div className="text-2xl font-bold font-mono">65.2%</div>
                                <div className="text-[10px] text-green-600 mt-1">行业优秀水平 (60%+)</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">净利率 Net Margin</div>
                                <div className="text-2xl font-bold font-mono">28.5%</div>
                                <div className="text-[10px] text-gray-400 mt-1">环比持平</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">LTV / CAC</div>
                                <div className="text-2xl font-bold font-mono">3.8</div>
                                <div className="text-[10px] text-green-600 mt-1">获客效率极高</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">私教使用率</div>
                                <div className="text-2xl font-bold font-mono">82%</div>
                                <div className="text-[10px] text-gray-400 mt-1">核心盈利点稳固</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Growth & Risk */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Growth Chart */}
                    <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">会员增长趋势 (可复制性验证)</h3>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={memberGrowthData}>
                                    <defs>
                                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="members" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorMembers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Risk Alerts */}
                    <div className="col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">风险提示 (Risk Radar)</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-3">
                                <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                                <div>
                                    <div className="text-xs font-bold text-red-800">续费压力预测</div>
                                    <div className="text-[10px] text-red-600 mt-0.5">下月预计有 45 位年卡会员到期，当前续费意向收集仅 20%。</div>
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start gap-3">
                                <i className="fa-solid fa-arrow-trend-up text-yellow-600 mt-0.5"></i>
                                <div>
                                    <div className="text-xs font-bold text-yellow-800">成本上升提示</div>
                                    <div className="text-[10px] text-yellow-700 mt-0.5">冬季地暖电费预计上涨 15%，建议优化非高峰时段排课。</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        {toast && (
            <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
                <div className="px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 bg-white text-gray-800 border-gray-100">
                    <i className="fa-solid fa-circle-info text-purple-500"></i>
                    {toast}
                </div>
            </div>
        )}
    </div>
  );
};

export default Investor;
