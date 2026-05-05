
import React, { useState, useMemo, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
  MOCK_CARD_PRODUCTS,
  MOCK_CONTRACTS,
  MOCK_MEMBERS,
  MOCK_ORDERS,
  MOCK_POINT_PRODUCTS,
  MOCK_TTC_PRODUCTS,
} from '../constants';
import { CardProduct, Contract, Order, OrderItem, PointProduct, TtcProduct } from '../types';

// --- Constants ---
const AVAILABLE_VENUES = ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆'];

// --- Types ---

// New: Tutor Interface with Structured Resume
interface TTCTutorExperience {
    year: string;
    title: string;
}

interface TTCTutor {
    id: string;
    name: string;
    title: string; // e.g. E-RYT 500
    avatar: string;
    motto: string; // 名言
    resume: TTCTutorExperience[]; // Structured Resume
    gallery: string[]; // 授课瞬间
    status: 'active' | 'inactive';
}

// New: Course Interface with Structured Plan & Audience
interface TTCCoursePlanNode {
    stage: string;
    content: string;
}

interface TTCCourseAudienceNode {
    tag: string; // 概括性词语 e.g. "零基础人群"
    desc: string; // 解释性词语 e.g. "建立正确且安全的练习根基"
}

type TTCSchedule = NonNullable<TtcProduct['schedules']>[number] & {
    status: NonNullable<TtcProduct['schedules']>[number]['status'] | 'recruiting' | 'ended';
};

type MallTtcCourse = TtcProduct & {
    category: 'yoga' | 'pilates';
    earlyBirdPrice: number;
    earlyBirdDeadline: string; 
    alumniPrice: number;
    intro: string;
    
    // New Structured Fields
    planNodes: TTCCoursePlanNode[]; 
    audienceNodes: TTCCourseAudienceNode[];

    outcomes: string;
    tutors: string[]; // Array of Tutor IDs or Names
    schedules: TTCSchedule[];
    listingVenues: string[];
    status: 'active' | 'inactive';
    conversionRate: number;
    views: number;
    historicalSales: number[]; 
};

interface Student {
    id: string;
    name: string;
    phone: string;
    paymentStatus: 'paid' | 'deposit' | 'pending' | 'refunded';
    amount: number;
    confirmed: boolean;
    batch: string;
    signupDate: string;
}

// 3. Points Mall

// 4. Orders
type MallOrderCategory = 'cards' | 'ttc' | 'points';

interface MallOrderRow {
    id: string;
    user: string;
    phone: string;
    product: string;
    category: MallOrderCategory;
    type: string;
    amount: string;
    status: 'paid' | 'pending' | 'refunded' | 'completed' | 'deposit';
    time: string;
    details: string;
    subStatus: string;
}

// --- Data Overview Component ---
const DataOverview = ({ moduleType, venues }: { moduleType: 'cards' | 'ttc' | 'points', venues: string[] }) => {
    const [rankingTab, setRankingTab] = useState<'sales' | 'ctr' | 'conversion' | 'stagnant'>('sales');
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHighIntent, setShowHighIntent] = useState(false);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [filterConditions, setFilterConditions] = useState({
        count: 'all', // all, >5, >10
        time: 'all',  // all, 1h, 24h, 7d
        member: 'all' // all, yes, no
    });
    
    // Dynamic Metrics based on selection
    const metrics = useMemo(() => {
        if (selectedProduct) {
             return {
                exposure: { id: 'exposure', label: '曝光量', val: '5,000', change: '', status: 'neutral' },
                clicks: { id: 'clicks', label: '点击量', val: '2,000', rate: '40%', status: 'good' },
                orders: { id: 'orders', label: '下单量', val: '400', rate: '20%', status: 'good' },
                fulfill: { id: 'fulfill', label: '履约完成', val: '380', rate: '95%', status: 'good' },
                // Specifics (Hidden or Placeholder for product view)
                renewal: { val: '-', change: '-', status: 'neutral' }, 
                cycle: { val: '-', change: '-', status: 'neutral' }, 
                arpu: { val: '-', change: '-', status: 'neutral' }, 
                fillRate: { val: '-', change: '-', status: 'neutral' }, 
                pointsConsumed: { val: '-', change: '-', status: 'neutral' }, 
                mixedRatio: { val: '-', change: '-', status: 'neutral' }, 
            };
        }
        return {
            exposure: { id: 'exposure', label: '曝光量', val: '128,930', change: '+12%', status: 'good' },
            clicks: { id: 'clicks', label: '点击量', val: '32,450', rate: '25.1%', status: 'good' },
            orders: { id: 'orders', label: '下单量', val: '4,520', rate: '13.9%', status: 'warning' },
            fulfill: { id: 'fulfill', label: '履约完成', val: '4,100', rate: '90.7%', status: 'good' },
            // Specifics
            renewal: { val: '68%', change: '+5%', status: 'good' }, // Cards
            cycle: { val: '8.5天', change: '-0.5', status: 'good' }, // Cards
            arpu: { val: '¥8,500', change: '+2%', status: 'good' }, // Cards
            fillRate: { val: '85%', change: '+10%', status: 'good' }, // TTC
            pointsConsumed: { val: '450W', change: '+15%', status: 'good' }, // Points
            mixedRatio: { val: '40%', change: '-2%', status: 'neutral' }, // Points
        };
    }, [selectedProduct, moduleType]);

    // Mock User List Generator
    const getUserList = () => {
        if (!selectedMetric) return [];
        
        // Base Mock Data
        let list = [
            { name: 'Alice', phone: '138****1234', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', time: '10 mins ago', count: 12, action: 'Viewed', isMember: true },
            { name: 'Bob', phone: '139****5678', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', time: '15 mins ago', count: 3, action: 'Viewed', isMember: false },
            { name: 'Charlie', phone: '137****9012', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', time: '20 mins ago', count: 8, action: 'Viewed', isMember: true },
            { name: 'David', phone: '150****3456', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', time: '5 mins ago', count: 15, action: 'Clicked', isMember: true },
            { name: 'Eva', phone: '151****7890', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva', time: '12 mins ago', count: 6, action: 'Clicked', isMember: false },
            { name: 'Frank', phone: '152****2345', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank', time: '1 hour ago', count: 1, action: 'Ordered', isMember: true },
            { name: 'Grace', phone: '153****6789', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace', time: '2 hours ago', count: 1, action: 'Completed', isMember: true },
            { name: 'Helen', phone: '155****1111', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Helen', time: '3 hours ago', count: 2, action: 'Viewed', isMember: false },
            { name: 'Ian', phone: '156****2222', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ian', time: '4 hours ago', count: 9, action: 'Viewed', isMember: true },
            { name: 'Jack', phone: '157****3333', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', time: '5 hours ago', count: 4, action: 'Viewed', isMember: false },
            { name: 'Kelly', phone: '158****4444', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kelly', time: '6 hours ago', count: 11, action: 'Viewed', isMember: true },
        ];

        // Filter by Metric Type (Mocking)
        if (selectedMetric === 'clicks') list = list.filter(u => u.action === 'Clicked' || u.count > 5);
        if (selectedMetric === 'orders') list = list.filter(u => u.action === 'Ordered');
        if (selectedMetric === 'fulfill') list = list.filter(u => u.action === 'Completed');

        // Filter by Product (Mocking)
        if (selectedProduct) {
             list = list.filter((_, i) => i % 2 === 0); // Just show subset
        }

        // Search
        if (searchTerm) {
            list = list.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone.includes(searchTerm));
        }

        // Advanced Filters
        if (filterConditions.count !== 'all') {
            const min = filterConditions.count === '>5' ? 5 : 10;
            list = list.filter(u => u.count > min);
        }
        if (filterConditions.time !== 'all') {
            // Mock time filtering logic
            if (filterConditions.time === '1h') list = list.filter(u => u.time.includes('min') || u.time.includes('1 hour'));
            // ... simple mock
        }
        if (filterConditions.member !== 'all') {
            const isMember = filterConditions.member === 'yes';
            list = list.filter(u => u.isMember === isMember);
        }

        return list;
    };

    const userList = getUserList();

    // Funnel Data - Dynamic based on selectedProduct
    const getFunnelData = () => {
        if (selectedProduct) {
            // Mock specific data for a product
            return [
                { label: '曝光量', value: 5000, rate: null },
                { label: '点击量', value: 2000, rate: '40%' }, // 2000/5000
                { label: '下单量', value: 400, rate: '20%' },   // 400/2000
                { label: '履约量', value: 380, rate: '95%' },   // 380/400
            ];
        }
        // General Data
        return [
            { label: '曝光量', value: 128930, rate: null },
            { label: '点击量', value: 32450, rate: '25.1%' },
            { label: '下单量', value: 4520, rate: '13.9%' },
            { label: '履约量', value: 4100, rate: '90.7%' },
        ];
    };

    const funnelData = getFunnelData();

    const rankingData = [
        { id: 'p1', name: moduleType === 'cards' ? '初遇卡' : moduleType === 'ttc' ? 'RYT200' : 'Lululemon瑜伽垫', val: '1,204', sub: '转化率 15%' },
        { id: 'p2', name: moduleType === 'cards' ? '瑜伽年卡' : moduleType === 'ttc' ? '普拉提大器械' : '瑜伽小班课', val: '985', sub: '转化率 12%' },
        { id: 'p3', name: moduleType === 'cards' ? '私教20次' : moduleType === 'ttc' ? '孕产修复' : 'Manduka铺巾', val: '856', sub: '转化率 18%' },
        { id: 'p4', name: moduleType === 'cards' ? '普拉提月卡' : moduleType === 'ttc' ? '流瑜伽工作坊' : '私教体验', val: '654', sub: '转化率 8%' },
        { id: 'p5', name: moduleType === 'cards' ? '瑜伽季卡' : moduleType === 'ttc' ? '阿斯汤加' : '运动水杯', val: '432', sub: '转化率 10%' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 shadow-sm animate-fadeIn relative">
            {/* Header & Filters */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-solid fa-chart-pie"></i> 数据总览
                </h3>
                <div className="flex gap-3 items-center">
                    <button 
                        onClick={() => alert('Gemini AI 正在分析商城数据...')}
                        className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline mr-2"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI 深度分析
                    </button>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-black transition">
                        <option>今日</option>
                        <option>近7天</option>
                        <option>近30天</option>
                        <option>自定义</option>
                    </select>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-black transition">
                        <option>所有场馆</option>
                        {venues.map(v => <option key={v}>{v}</option>)}
                    </select>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-black transition">
                        <option>全部分类</option>
                        <option>分类A</option>
                        <option>分类B</option>
                    </select>
                </div>
            </div>

            {/* Row 1: Metric Cards */}
            <div className={`grid gap-4 mb-8 ${moduleType === 'cards' ? 'grid-cols-7' : moduleType === 'ttc' ? 'grid-cols-5' : 'grid-cols-6'}`}>
                {/* Standard Metrics - Clickable */}
                {[metrics.exposure, metrics.clicks, metrics.orders, metrics.fulfill].map((m) => (
                    <div 
                        key={m.id}
                        onClick={() => setSelectedMetric(m.id)}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100 cursor-pointer hover:border-black hover:shadow-md transition group"
                    >
                        <div className="text-xs text-gray-400 mb-1 group-hover:text-black transition">{m.label}</div>
                        <div className="text-lg font-bold font-mono">{m.val}</div>
                        <div className={`text-[10px] font-bold mt-1 ${m.status === 'good' ? 'text-green-600' : m.status === 'warning' ? 'text-orange-500' : 'text-gray-500'}`}>
                            {m.change ? `环比 ${m.change}` : m.rate ? `${m.label === '点击量' ? '点击率' : m.label === '下单量' ? '转化率' : '履约率'} ${m.rate}` : ''}
                        </div>
                    </div>
                ))}

                {/* Module Specifics - Non-clickable for now */}
                {moduleType === 'cards' && (
                    <>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-xs text-blue-400 mb-1">续费率</div>
                            <div className="text-lg font-bold font-mono text-blue-700">{metrics.renewal.val}</div>
                            <div className="text-[10px] text-blue-600 font-bold mt-1">{metrics.renewal.change}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-xs text-blue-400 mb-1">平均消课</div>
                            <div className="text-lg font-bold font-mono text-blue-700">{metrics.cycle.val}</div>
                            <div className="text-[10px] text-blue-600 font-bold mt-1">{metrics.cycle.change}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-xs text-blue-400 mb-1">客单价</div>
                            <div className="text-lg font-bold font-mono text-blue-700">{metrics.arpu.val}</div>
                            <div className="text-[10px] text-blue-600 font-bold mt-1">{metrics.arpu.change}</div>
                        </div>
                    </>
                )}

                {moduleType === 'ttc' && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="text-xs text-purple-400 mb-1">名额填充率</div>
                        <div className="text-lg font-bold font-mono text-purple-700">{metrics.fillRate.val}</div>
                        <div className="text-[10px] text-purple-600 font-bold mt-1">{metrics.fillRate.change}</div>
                    </div>
                )}

                {moduleType === 'points' && (
                    <>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <div className="text-xs text-orange-400 mb-1">积分消耗</div>
                            <div className="text-lg font-bold font-mono text-orange-700">{metrics.pointsConsumed.val}</div>
                            <div className="text-[10px] text-orange-600 font-bold mt-1">{metrics.pointsConsumed.change}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <div className="text-xs text-orange-400 mb-1">积分+现金比</div>
                            <div className="text-lg font-bold font-mono text-orange-700">{metrics.mixedRatio.val}</div>
                            <div className="text-[10px] text-orange-600 font-bold mt-1">{metrics.mixedRatio.change}</div>
                        </div>
                    </>
                )}
            </div>

            {/* Row 2: Funnel & Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Enhanced Funnel Chart */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-l-4 border-black pl-3 flex justify-between items-center">
                        <span>全链路转化漏斗 {selectedProduct && <span className="text-xs font-normal text-gray-500 ml-2">({selectedProduct})</span>}</span>
                        {selectedProduct && <button onClick={() => setSelectedProduct(null)} className="text-[10px] text-gray-400 hover:text-black">重置</button>}
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 h-[320px] flex flex-col justify-center">
                        {funnelData.map((step, index) => (
                            <React.Fragment key={index}>
                                {/* Bar Row */}
                                <div className="flex items-center gap-4">
                                    <div className="w-24 text-xs font-bold text-gray-600 text-right">{step.label}</div>
                                    <div className="flex-1 h-8 bg-gray-200 rounded-r-lg relative overflow-hidden">
                                        <div 
                                            className="h-full bg-black rounded-r-lg transition-all duration-500" 
                                            style={{ width: `${(step.value / funnelData[0].value) * 100}%`, opacity: 1 - (index * 0.2) }}
                                        ></div>
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">{step.value.toLocaleString()}</span>
                                    </div>
                                </div>
                                {/* Connector Row (Rate) */}
                                {index < funnelData.length - 1 && (
                                    <div className="flex items-center gap-4 my-1">
                                        <div className="w-24"></div>
                                        <div className="flex-1 pl-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-0.5 h-4 bg-gray-300"></div>
                                                <div className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                                    转化率 {funnelData[index + 1].rate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right: Ranking */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">商品表现排行</h4>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {[
                                {id: 'sales', label: '销量Top5'},
                                {id: 'ctr', label: '点击Top5'},
                                {id: 'conversion', label: '转化Top5'},
                                {id: 'stagnant', label: '滞销预警'}
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setRankingTab(tab.id as any)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${rankingTab === tab.id ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        {rankingData.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedProduct(item.name)}
                                className={`flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition cursor-pointer ${selectedProduct === item.name ? 'bg-gray-50 border-l-4 border-l-black' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                        <div className="text-[10px] text-gray-400">{item.sub}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold font-mono">{item.val}</div>
                                    <div className="text-[10px] text-gray-400">单</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User List Modal */}
            {selectedMetric && (
                <div className="absolute top-0 right-0 w-[420px] h-full bg-white shadow-xl border-l border-gray-100 rounded-r-2xl z-10 animate-slideInRight p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {metrics[selectedMetric as keyof typeof metrics]?.label}名单
                            {selectedProduct && <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedProduct}</span>}
                        </h4>
                        <button onClick={() => { setSelectedMetric(null); setSearchTerm(''); setShowHighIntent(false); }} className="text-gray-400 hover:text-black">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                <input 
                                    type="text" 
                                    placeholder="搜索姓名或手机号" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-black transition"
                                />
                            </div>
                            <button 
                                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                                className={`px-3 py-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${showAdvancedFilter ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <i className="fa-solid fa-filter"></i> 筛选
                            </button>
                        </div>

                        {/* Advanced Filter Panel */}
                        {showAdvancedFilter && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-3 animate-fadeIn">
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 mb-1.5">点击频次</div>
                                    <div className="flex gap-2">
                                        {['all', '>5', '>10'].map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => setFilterConditions({...filterConditions, count: opt})}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${filterConditions.count === opt ? 'bg-white border-black text-black shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {opt === 'all' ? '全部' : opt + '次'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 mb-1.5">最近时间</div>
                                    <div className="flex gap-2">
                                        {['all', '1h', '24h', '7d'].map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => setFilterConditions({...filterConditions, time: opt})}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${filterConditions.time === opt ? 'bg-white border-black text-black shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {opt === 'all' ? '全部' : opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 mb-1.5">会员身份</div>
                                    <div className="flex gap-2">
                                        {['all', 'yes', 'no'].map(opt => (
                                            <button 
                                                key={opt}
                                                onClick={() => setFilterConditions({...filterConditions, member: opt})}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${filterConditions.member === opt ? 'bg-white border-black text-black shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {opt === 'all' ? '全部' : opt === 'yes' ? '会员' : '非会员'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scroll space-y-2">
                        {userList.map((user, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-black transition group">
                                <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt="" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-bold text-gray-900 truncate">{user.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono truncate">{user.phone}</div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className="text-[10px] text-gray-500">
                                            <i className="fa-regular fa-clock mr-1"></i>{user.time}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            <i className="fa-solid fa-arrow-pointer mr-1"></i>{user.count}次
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {user.isMember ? (
                                        <span className="text-[10px] font-bold text-black bg-white border border-gray-200 px-2 py-1 rounded">
                                            <i className="fa-solid fa-crown text-yellow-500 mr-1"></i>会员
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            非会员
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {userList.length === 0 && (
                            <div className="text-center text-gray-400 text-xs py-8">暂无数据</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const MOCK_VENUES_LIST = [
    {
        id: 'v1',
        name: 'MetYoga 万象城店',
        company: '杭州迈特瑜伽健身有限公司',
        code: '91330100XXXXXXX',
        address: '杭州市上城区万象城',
        phone: '0571-88888888',
        accountName: '杭州迈特瑜伽健身有限公司',
        accountBank: '招商银行杭州分行',
        accountNo: '123456789012345'
    },
    {
        id: 'v2',
        name: 'MetYoga 西湖旗舰店',
        company: '杭州迈特瑜伽健身有限公司西湖分公司',
        code: '91330100YYYYYYY',
        address: '杭州市西湖区湖滨银泰',
        phone: '0571-88888889',
        accountName: '杭州迈特瑜伽健身有限公司西湖分公司',
        accountBank: '招商银行杭州西湖支行',
        accountNo: '987654321098765'
    }
];

const normalizeTtcScheduleStatus = (status: TTCSchedule['status']): TTCSchedule['status'] => {
    if (status === 'open') return 'recruiting';
    if (status === 'closed') return 'ended';
    return status;
};

const toMallTtcCourse = (product: TtcProduct, index: number): MallTtcCourse => ({
    ...product,
    status: product.status === 'active' ? 'active' : 'inactive',
    category: product.name.includes('普拉提') ? 'pilates' : 'yoga',
    earlyBirdPrice: Math.max(product.price - 2000, 0),
    earlyBirdDeadline: '2026-05-01',
    alumniPrice: Math.max(product.price - 1000, 0),
    intro: product.description || '',
    planNodes: [
        { stage: '基础理论', content: '课程体系、身体基础和教学安全边界。' },
        { stage: '实操训练', content: '核心体式、序列设计和课堂带领练习。' },
    ],
    audienceNodes: [
        { tag: '进阶练习者', desc: '希望系统理解瑜伽训练方法的人群。' },
        { tag: '准老师', desc: '计划进入教学或服务会员的人群。' },
    ],
    outcomes: product.description || '完成系统学习并获得结业能力评估。',
    tutors: ['Master Sarah'],
    schedules: (product.schedules || []).map(schedule => ({
        ...schedule,
        status: normalizeTtcScheduleStatus(schedule.status),
    })),
    listingVenues: product.listingVenues || AVAILABLE_VENUES,
    conversionRate: 12 + index * 2,
    views: 1200 + index * 600,
    historicalSales: [12, 15, 18, 14, 16],
});

const getOrderPrimaryItem = (order: Order): OrderItem | undefined => order.items[0];

const getOrderCategory = (item?: OrderItem): MallOrderCategory => {
    if (item?.productType === 'ttc') return 'ttc';
    if (item?.productType === 'point') return 'points';
    return 'cards';
};

const getOrderDisplayStatus = (order: Order): MallOrderRow['status'] => {
    if (order.status === 'pending_payment') return order.paidAmount ? 'deposit' : 'pending';
    if (order.status === 'refunded' || order.status === 'partially_refunded') return 'refunded';
    if (order.status === 'fulfilled' || order.status === 'closed' || order.status === 'paid') return 'paid';
    return 'pending';
};

const getOrderTypeLabel = (item?: OrderItem): string => {
    if (!item) return '未知';
    if (item.productType === 'card') return '会员卡项';
    if (item.productType === 'ttc') return '教培';
    if (item.productType === 'point') return '积分商品';
    if (item.productType === 'course') return '课程权益';
    return '自定义';
};

const getContractDisplay = (contract?: Contract): { details: string; subStatus: string } => {
    if (!contract) return { details: '未绑定合同', subStatus: 'inactive' };
    if (contract.status === 'effective') return { details: '合同生效', subStatus: 'active' };
    if (contract.status === 'signed') return { details: '已签合同', subStatus: 'signed' };
    if (contract.status === 'pending_signature') return { details: '待签署', subStatus: 'pending' };
    return { details: '合同异常', subStatus: contract.status };
};

const toMallOrderRow = (order: Order, contracts: Contract[]): MallOrderRow => {
    const item = getOrderPrimaryItem(order);
    const member = MOCK_MEMBERS.find(m => m.id === order.memberId);
    const contract = contracts.find(c => c.id === order.contractId || c.orderId === order.id);
    const contractDisplay = getContractDisplay(contract);

    return {
        id: order.id,
        user: member?.name || order.memberId,
        phone: member?.phone || '-',
        product: item?.productName || '未知商品',
        category: getOrderCategory(item),
        type: getOrderTypeLabel(item),
        amount: `¥${(order.paidAmount ?? order.totalAmount).toLocaleString()}`,
        status: getOrderDisplayStatus(order),
        time: order.createdAt.replace('T', ' ').slice(0, 16),
        details: contractDisplay.details,
        subStatus: contractDisplay.subStatus,
    };
};

const Mall: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'cards' | 'ttc' | 'points' | 'orders'>('cards');
  const [subView, setSubView] = useState<'list' | 'edit' | 'students' | 'contract_create'>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editType, setEditType] = useState<'card' | 'ttc_course' | 'ttc_tutor' | 'product'>('card');
  
  // Local state for toggling Card Category in Edit Mode
  const [editCardCategory, setEditCardCategory] = useState<'stored_value' | 'term'>('stored_value');
  const [pointProductTab, setPointProductTab] = useState<'course' | 'physical'>('course');
  
  // Order Management State
  const [orderTab, setOrderTab] = useState<'cards' | 'ttc' | 'points'>('cards');
  const [orderFilters, setOrderFilters] = useState({ date: 'all', type: 'all', status: 'all' });

  // Contract Creation State
  const [contractData, setContractData] = useState({
    memberId: '',
    productId: '',
    productType: 'card' as 'card' | 'ttc',
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    contractNo: `CON-${Date.now().toString().slice(-8)}`,
    
    // Party A
    partyAVenueId: 'v1',
    partyACompany: '杭州迈特瑜伽健身有限公司',
    partyAVenue: 'MetYoga 万象城店',
    partyACode: '91330100XXXXXXX',
    partyAAddress: '杭州市上城区万象城',
    partyAPhone: '0571-88888888',

    // Party B extras
    idType: '',
    idNumber: '',
    address: '',

    // Contract details
    memberType: '新购',
    cardCategory: '额度型会籍',
    cardSubCategory: '初遇会籍（Spark）',
    ttcCourseName: 'RYT200 瑜伽教培',
    ttcBatch: '2026年春季班',
    ttcPaymentType: '全款',
    ttcLeaveCount: 3,
    quotaPoints: '',
    quotaCount: '',
    usageScope: '全城通馆',
    singleVenueName: '',
    usageTime: '全时段卡',
    totalDuration: '',
    bonusRights: '',
    activationMethod: '首次使用开卡',
    activationDate: '',
    packageDiscount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '微信',
    
    // Party A Account
    accountName: '杭州迈特瑜伽健身有限公司',
    accountBank: '招商银行杭州分行',
    accountNo: '123456789012345'
  });

  // Refs for auto-scrolling preview
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
      partyA: useRef<HTMLDivElement>(null),
      partyB: useRef<HTMLDivElement>(null),
      courseDetails: useRef<HTMLDivElement>(null),
      payment: useRef<HTMLDivElement>(null),
      leave: useRef<HTMLDivElement>(null),
      signatures: useRef<HTMLDivElement>(null),
  };

  const handleFocus = (sectionName: keyof typeof sectionRefs) => {
      const element = sectionRefs[sectionName].current;
      const container = previewContainerRef.current;
      
      if (element && container) {
          // Calculate the element's position relative to the container's viewport
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          // Calculate the relative top position by adding current scroll and the difference in tops
          const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
          
          // Center the element in the container
          const scrollTop = relativeTop - (containerRect.height / 2) + (elementRect.height / 2);
          
          container.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
          });
      }
  };

  // --- Mock Data ---

  const [cards, setCards] = useState<CardProduct[]>(MOCK_CARD_PRODUCTS);

  const [ttcTutors, setTtcTutors] = useState<TTCTutor[]>([
      {
          id: 'tutor1', name: 'Master Sarah', title: 'E-RYT 500 认证导师', status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          motto: '瑜伽不是关于触碰脚趾，而是关于我们在路上的收获。',
          resume: [
              { year: '2006', title: '取得 Yoga Alliance 全美瑜伽联盟 E-RYT 500 最高级别认证，开启系统化教学之路。' },
              { year: '2010', title: '赴印度瑞诗凯诗进修哈他瑜伽传统精髓。' },
              { year: '2019', title: '创立 MET YOGA 品牌，并获得 DNS 临床康复认证（A），正式确立“正念觉知与现代运动解剖相融合”的科学教学根基。' }
          ],
          gallery: ['https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400']
      },
      {
          id: 'tutor2', name: 'Dr. Anna', title: '普拉提康复专家', status: 'active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
          motto: '控制身体，就是控制人生。',
          resume: [
              { year: '2015', title: '获得物理治疗学博士学位，专注于运动康复领域。' },
              { year: '2018', title: '完成 STOTT PILATES 全场馆器械认证。' }
          ],
          gallery: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400']
      }
  ]);

  const [ttcCourses, setTtcCourses] = useState<MallTtcCourse[]>(MOCK_TTC_PRODUCTS.map(toMallTtcCourse));

  const [products, setProducts] = useState<PointProduct[]>(MOCK_POINT_PRODUCTS);

  const [students] = useState<Student[]>([
      { id: 'st1', name: 'Lisa Wang', phone: '138****8888', paymentStatus: 'paid', amount: 16800, confirmed: true, batch: '2024 春季周末班', signupDate: '2023-11-20' },
      { id: 'st2', name: 'Mike Chen', phone: '139****1234', paymentStatus: 'deposit', amount: 5000, confirmed: false, batch: '2024 春季周末班', signupDate: '2023-11-22' },
  ]);

  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [contracts] = useState<Contract[]>(MOCK_CONTRACTS);

  // --- Helpers ---
  const handleEdit = (item: any, type: 'card' | 'ttc_course' | 'ttc_tutor' | 'product') => { 
      const deepCopy = JSON.parse(JSON.stringify(item));
      // Init new fields if undefined (for data migration safety)
      if (type === 'ttc_tutor' && !deepCopy.resume) deepCopy.resume = [];
      if (type === 'ttc_course' && !deepCopy.planNodes) deepCopy.planNodes = [];
      if (type === 'ttc_course' && !deepCopy.audienceNodes) deepCopy.audienceNodes = [];
      if (!deepCopy.listingVenues && type !== 'ttc_tutor') deepCopy.listingVenues = [];
      
      setSelectedItem(deepCopy); 
      setEditType(type);
      if (type === 'card') setEditCardCategory(item.type || 'stored_value');
      setSubView('edit'); 
  };

  const handleCreate = (type: 'card' | 'ttc_course' | 'ttc_tutor' | 'product') => { 
      // Set empty structure for new items
      const newItem = type === 'ttc_tutor' ? { resume: [], gallery: [] } 
        : type === 'ttc_course' ? { planNodes: [], audienceNodes: [], schedules: [] }
        : type === 'card' ? { 
            type: 'stored_value', name: '', slogan: '', guide: '', price: 0, 
            validity: 12, validityUnit: 'month', unitPrice: 0, bookingRange: 0,
            cancelFreeLimit: 0, cancelDeductPoints: 0, noShowDeductCurrent: false, noShowFreezeDays: 0,
            minOpenPeople: 0, checkInPoints: 0, checkInPointsPercent: 0, checkInDailyLimit: 0,
            scope: 'all', functionScope: [], leaveMinDays: 0, leaveMaxDays: 0, canExtend: false
        }
        : type === 'product' ? {
            type: pointProductTab, // Use current tab as default type
            name: '', cover: '', description: '',
            enablePurePoints: true, purePointsPrice: 0,
            enableMixedPayment: false, mixedPointsPrice: 0, mixedCashPrice: 0,
            status: 'active', venues: [],
            exchangeCount: 0, inventoryUsage: 0, recentExchanges: []
        }
        : null;

      setSelectedItem(newItem); 
      setEditType(type);
      if (type === 'card') setEditCardCategory('stored_value'); 
      setSubView('edit'); 
  };

  const handleDuplicate = (item: any, type: 'card' | 'ttc_course' | 'product') => {
      const newItem = JSON.parse(JSON.stringify(item));
      newItem.id = `${type.split('_')[0]}_copy_${Date.now()}`;
      newItem.name = `${item.name} (复制)`;
      newItem.status = 'inactive'; // Default to inactive after copy
      
      if (type === 'card') setCards([newItem, ...cards]);
      if (type === 'ttc_course') setTtcCourses([newItem, ...ttcCourses]);
      if (type === 'product') setProducts([newItem, ...products]);
  };

  const handleToggleStatus = (item: any, type: 'card' | 'ttc_course' | 'ttc_tutor' | 'product') => {
      const newStatus = item.status === 'active' ? 'inactive' : 'active';
      if (type === 'card') setCards(cards.map(c => c.id === item.id ? {...c, status: newStatus} : c));
      if (type === 'ttc_course') setTtcCourses(ttcCourses.map(c => c.id === item.id ? {...c, status: newStatus} : c));
      if (type === 'ttc_tutor') setTtcTutors(ttcTutors.map(t => t.id === item.id ? {...t, status: newStatus} : t));
      if (type === 'product') setProducts(products.map(p => p.id === item.id ? {...p, status: newStatus} : p));
  };

  const handleBack = () => { setSubView('list'); setSelectedItem(null); };
  const handleViewStudents = (item: any) => { setSelectedItem(item); setSubView('students'); };

  const renderContractCreate = () => {
    const selectedMember = MOCK_MEMBERS.find(m => m.id === contractData.memberId);
    const selectedProduct = contractData.productType === 'card' 
        ? cards.find(c => c.id === contractData.productId)
        : ttcCourses.find(c => c.id === contractData.productId);

    return (
        <div className="animate-fadeIn flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">发起电子合同</h3>
                        <p className="text-xs text-gray-500">填写合同信息并预览签署效果</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition">保存草稿</button>
                    <button className="px-6 py-2 bg-black text-white rounded-xl text-sm font-bold hover:opacity-80 transition shadow-lg shadow-black/10">发送给会员签署</button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Left: Form */}
                <div className="w-1/2 bg-white rounded-2xl border border-gray-100 p-8 overflow-y-auto custom-scroll shadow-sm">
                    <div className="space-y-8">
                        {/* Section 1: Party A */}
                        <section onFocus={() => handleFocus('partyA')}>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</span>
                                甲方（提供方）信息
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 relative">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5">选择场馆</label>
                                    <select 
                                        value={contractData.partyAVenueId}
                                        onChange={(e) => {
                                            const venueId = e.target.value;
                                            if (venueId === 'custom') {
                                                setContractData({...contractData, partyAVenueId: 'custom', partyACompany: '', partyAVenue: '', partyACode: '', partyAAddress: '', partyAPhone: '', accountName: '', accountBank: '', accountNo: ''});
                                            } else {
                                                const venue = MOCK_VENUES_LIST.find(v => v.id === venueId);
                                                if (venue) {
                                                    setContractData({
                                                        ...contractData, 
                                                        partyAVenueId: venueId,
                                                        partyACompany: venue.company,
                                                        partyAVenue: venue.name,
                                                        partyACode: venue.code,
                                                        partyAAddress: venue.address,
                                                        partyAPhone: venue.phone,
                                                        accountName: venue.accountName,
                                                        accountBank: venue.accountBank,
                                                        accountNo: venue.accountNo
                                                    });
                                                }
                                            }
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition appearance-none"
                                    >
                                        {MOCK_VENUES_LIST.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                        <option value="custom">自定义输入...</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-[38px] text-gray-400 pointer-events-none"></i>
                                </div>
                                
                                {contractData.partyAVenueId === 'custom' && (
                                    <>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">公司全称</label>
                                            <input type="text" value={contractData.partyACompany} onChange={e => setContractData({...contractData, partyACompany: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">场馆简称</label>
                                            <input type="text" value={contractData.partyAVenue} onChange={e => setContractData({...contractData, partyAVenue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">统一社会信用代码</label>
                                            <input type="text" value={contractData.partyACode} onChange={e => setContractData({...contractData, partyACode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">场馆地址</label>
                                            <input type="text" value={contractData.partyAAddress} onChange={e => setContractData({...contractData, partyAAddress: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">场馆电话</label>
                                            <input type="text" value={contractData.partyAPhone} onChange={e => setContractData({...contractData, partyAPhone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        
                                        {/* Account Info */}
                                        <div className="col-span-2 mt-4">
                                            <h5 className="text-xs font-bold text-gray-700 mb-2">收款账户信息</h5>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">账户名称</label>
                                            <input type="text" value={contractData.accountName} onChange={e => setContractData({...contractData, accountName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">开户银行</label>
                                            <input type="text" value={contractData.accountBank} onChange={e => setContractData({...contractData, accountBank: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">银行账号</label>
                                            <input type="text" value={contractData.accountNo} onChange={e => setContractData({...contractData, accountNo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Section 2: Member Selection */}
                        <section onFocus={() => handleFocus('partyB')}>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span>
                                乙方（会员方）信息
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 relative">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5">选择现有会员</label>
                                    <select 
                                        value={contractData.memberId}
                                        onChange={(e) => setContractData({...contractData, memberId: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition appearance-none"
                                    >
                                        <option value="">请选择会员...</option>
                                        {MOCK_MEMBERS.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-[38px] text-gray-400 pointer-events-none"></i>
                                </div>
                                <div className="col-span-2">
                                    <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-xs flex items-start gap-3">
                                        <i className="fa-solid fa-circle-info mt-0.5"></i>
                                        <p>会员的证件类型、证件号码、联系地址及确认的联系电话将由会员在收到合同后，于线上签署环节自行填写并确认，无需在此处录入。</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Product & Contract Details */}
                        <section onFocus={() => handleFocus('courseDetails')}>
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">3</span>
                                {contractData.productType === 'card' ? '会员购买及账户信息' : '教培服务内容'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100">
                                        当前合同类型：<span className="font-bold text-black">{contractData.productType === 'card' ? '会员卡服务合同' : '教培课程服务合同'}</span>
                                    </div>
                                </div>

                                {contractData.productType === 'card' ? (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">会员类型</label>
                                            <select value={contractData.memberType} onChange={e => setContractData({...contractData, memberType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>新购</option><option>续费</option><option>升级</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">会员卡种大类</label>
                                            <select value={contractData.cardCategory} onChange={e => setContractData({...contractData, cardCategory: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>额度型会籍</option><option>畅练型会籍</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">具体卡种</label>
                                            <select value={contractData.cardSubCategory} onChange={e => setContractData({...contractData, cardSubCategory: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                {contractData.cardCategory === '额度型会籍' ? (
                                                    <><option>初遇会籍（Spark）</option><option>锦鲤会籍（Flow）</option><option>天选会籍（Prime）</option><option>硬核会籍（Core）</option><option>自由会籍（Flex）</option></>
                                                ) : (
                                                    <><option>普拉提月卡（Pilates 30）</option><option>瑜伽月卡（Yoga 30）</option><option>瑜伽季卡（Yoga 90）</option><option>瑜伽年卡（Yoga 365）</option></>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程配额 (点数)</label>
                                            <input type="number" value={contractData.quotaPoints} onChange={e => setContractData({...contractData, quotaPoints: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程配额 (次数)</label>
                                            <input type="number" value={contractData.quotaCount} onChange={e => setContractData({...contractData, quotaCount: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">使用范围</label>
                                            <select value={contractData.usageScope} onChange={e => setContractData({...contractData, usageScope: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>全城通馆</option><option>签约单馆</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">使用时段</label>
                                            <select value={contractData.usageTime} onChange={e => setContractData({...contractData, usageTime: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>全时段卡</option><option>非高峰卡</option><option>周末全时段卡</option>
                                            </select>
                                        </div>
                                        {contractData.usageScope === '签约单馆' && (
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5">签约单馆名称</label>
                                                <input type="text" value={contractData.singleVenueName} onChange={e => setContractData({...contractData, singleVenueName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">生效日期</label>
                                            <input type="date" value={contractData.startDate} onChange={e => setContractData({...contractData, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">失效日期</label>
                                            <input type="date" value={contractData.endDate} onChange={e => setContractData({...contractData, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">总时长描述 (如: 365天)</label>
                                            <input type="text" value={contractData.totalDuration} onChange={e => setContractData({...contractData, totalDuration: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">开卡方式</label>
                                            <select value={contractData.activationMethod} onChange={e => setContractData({...contractData, activationMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>首次使用开卡</option><option>指定日期开卡</option>
                                            </select>
                                        </div>
                                        {contractData.activationMethod === '指定日期开卡' && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5">指定开卡日期</label>
                                                <input type="date" value={contractData.activationDate} onChange={e => setContractData({...contractData, activationDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                            </div>
                                        )}

                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">赠送权益</label>
                                            <input type="text" value={contractData.bonusRights} onChange={e => setContractData({...contractData, bonusRights: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>

                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">打包产品折价 (元)</label>
                                            <input type="number" value={contractData.packageDiscount} onChange={e => setContractData({...contractData, packageDiscount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">合同金额 (元)</label>
                                            <input type="number" value={contractData.amount} onChange={e => setContractData({...contractData, amount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>

                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付日期</label>
                                            <input type="date" value={contractData.paymentDate} onChange={e => setContractData({...contractData, paymentDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付方式</label>
                                            <select value={contractData.paymentMethod} onChange={e => setContractData({...contractData, paymentMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option>微信</option><option>支付宝</option><option>银行卡</option><option>现金</option><option>其他</option>
                                            </select>
                                        </div>
                                        
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">其他会籍/补充约定</label>
                                            <textarea rows={2} value={contractData.notes} onChange={e => setContractData({...contractData, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition resize-none"></textarea>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程名称</label>
                                            <input type="text" value={contractData.ttcCourseName} onChange={e => setContractData({...contractData, ttcCourseName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" placeholder="例如：RYT200 培训课程" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程预计开始时间</label>
                                            <input type="date" value={contractData.startDate} onChange={e => setContractData({...contractData, startDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">课程预计结束时间</label>
                                            <input type="date" value={contractData.endDate} onChange={e => setContractData({...contractData, endDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">授课地点</label>
                                            <input type="text" value={contractData.partyAAddress} onChange={e => setContractData({...contractData, partyAAddress: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">培训费用合计 (元)</label>
                                            <input type="number" value={contractData.amount} onChange={e => setContractData({...contractData, amount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">付款阶段</label>
                                            <select value={contractData.ttcPaymentType} onChange={e => setContractData({...contractData, ttcPaymentType: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option value="全款">全款</option>
                                                <option value="定金">定金</option>
                                                <option value="尾款">尾款</option>
                                            </select>
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付日期</label>
                                            <input type="date" value={contractData.paymentDate} onChange={e => setContractData({...contractData, paymentDate: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                        <div onFocus={() => handleFocus('payment')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">支付渠道</label>
                                            <select value={contractData.paymentMethod} onChange={e => setContractData({...contractData, paymentMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition">
                                                <option value="支付宝">支付宝</option>
                                                <option value="微信">微信</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2" onFocus={() => handleFocus('leave')}>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5">请假次数</label>
                                            <input type="number" value={contractData.ttcLeaveCount} onChange={e => setContractData({...contractData, ttcLeaveCount: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right: Preview */}
                <div ref={previewContainerRef} className="w-1/2 bg-gray-200 rounded-2xl p-8 overflow-y-auto custom-scroll flex flex-col items-center">
                    <div className="bg-white shadow-2xl p-12 flex flex-col relative text-sm leading-relaxed text-gray-800 shrink-0" style={{ width: '100%', maxWidth: '794px', minHeight: '1123px' }}>
                        <h2 className="text-2xl font-bold text-center mb-8 tracking-widest">{contractData.productType === 'card' ? '会员服务合同' : '教培服务合同'}</h2>
                        
                        <div className="text-right mb-8">
                            <span className="font-bold">合同编号：</span>【 {contractData.contractNo} 】
                        </div>

                        <div className="space-y-6">
                            {contractData.productType === 'card' ? (
                                <>
                                    {/* Party A */}
                                    <div ref={sectionRefs.partyA}>
                                        <h3 className="font-bold text-base mb-2">甲方（提供方）：</h3>
                                        <div className="grid grid-cols-[120px_1fr] gap-y-2 pl-4">
                                            <span>公司全称：</span><span className="border-b border-gray-300">{contractData.partyACompany}</span>
                                            <span>场馆简称：</span><span className="border-b border-gray-300">{contractData.partyAVenue}</span>
                                            <span>统一社会信用代码：</span><span className="border-b border-gray-300">{contractData.partyACode}</span>
                                            <span>场馆地址：</span><span className="border-b border-gray-300">{contractData.partyAAddress}</span>
                                            <span>场馆电话：</span><span className="border-b border-gray-300">{contractData.partyAPhone}</span>
                                        </div>
                                    </div>

                                    {/* Party B */}
                                    <div ref={sectionRefs.partyB}>
                                        <h3 className="font-bold text-base mb-2">乙方（会员方）：</h3>
                                        <div className="grid grid-cols-[120px_1fr] gap-y-2 pl-4">
                                            <span>姓名／微信昵称：</span><span className="border-b border-gray-300">{selectedMember?.name || '________________'}</span>
                                            <span>性    别：</span><span className="border-b border-gray-300">{selectedMember ? (selectedMember.gender === 'female' ? '女' : '男') : '________________'}</span>
                                            <span>证件类型：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员填写...</span>
                                            <span>证件号码：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员填写...</span>
                                            <span>联系地址：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员填写...</span>
                                            <span>联系电话：</span><span className="border-b border-gray-300 text-gray-400 italic">待会员确认填写...</span>
                                        </div>
                                    </div>

                                    <p className="indent-8">
                                        依据《中华人民共和国民法典》《中华人民共和国消费者权益保护法》等相关法律法规规定，体育健身服务经营者（以下简称甲方）、消费者（指本合同会员姓名一栏的会员，以下简称乙方）双方在自愿、平等的基础上，就甲方向乙方提供会员健身服务，乙方接受会员服务达成如下约定，适用于线上（小程序）与线下（前台）双渠道操作，具有同等法律效力。
                                    </p>

                                    {/* Section 1 */}
                                    <div ref={sectionRefs.courseDetails}>
                                        <h3 className="font-bold text-base mb-2">一、会员购买及账户信息</h3>
                                        <div className="space-y-2 pl-4">
                                            <p>1.服务内容：甲方提供MET YOGA场馆通用的团课、小班课、私教课等服务；具体课程类型、扣点/扣课规则及适用范围以本合同约定及甲方小程序公示为准。</p>
                                            <p>2.会员类型： {contractData.memberType === '新购' ? '☑' : '□'} 新购 &emsp; {contractData.memberType === '续费' ? '☑' : '□'} 续费 &emsp; {contractData.memberType === '升级' ? '☑' : '□'} 升级</p>
                                            
                                            <p>3.会员卡种：</p>
                                            <div className="pl-4 space-y-1">
                                                <p>3.1.额度型会籍（期限+配额）： {contractData.cardSubCategory === '初遇会籍（Spark）' ? '☑' : '□'} 初遇会籍（Spark）&emsp; {contractData.cardSubCategory === '锦鲤会籍（Flow）' ? '☑' : '□'} 锦鲤会籍（Flow）&emsp; {contractData.cardSubCategory === '天选会籍（Prime）' ? '☑' : '□'} 天选会籍（Prime）&emsp; {contractData.cardSubCategory === '硬核会籍（Core）' ? '☑' : '□'} 硬核会籍（Core）&emsp; {contractData.cardSubCategory === '自由会籍（Flex）' ? '☑' : '□'} 自由会籍（Flex）</p>
                                                <p>3.2.畅练型会籍： {contractData.cardSubCategory === '普拉提月卡（Pilates 30）' ? '☑' : '□'} 普拉提月卡（Pilates 30）&emsp; {contractData.cardSubCategory === '瑜伽月卡（Yoga 30）' ? '☑' : '□'} 瑜伽月卡（Yoga 30）&emsp; {contractData.cardSubCategory === '瑜伽季卡（Yoga 90）' ? '☑' : '□'} 瑜伽季卡（Yoga 90）&emsp; {contractData.cardSubCategory === '瑜伽年卡（Yoga 365）' ? '☑' : '□'} 瑜伽年卡（Yoga 365）</p>
                                                <p>3.3.课程配额：点数 <span className="underline px-2">{contractData.quotaPoints || '___'}</span> 点 / 次数 <span className="underline px-2">{contractData.quotaCount || '___'}</span> 次（团课/小班/私教/工作坊等，以系统核销为准）。</p>
                                                <p>3.4.使用范围（重要）：</p>
                                                <div className="pl-4">
                                                    <p>{contractData.usageScope === '签约单馆' ? '☑' : '□'} 3.4.1. 签约单馆：仅限以下签约场馆使用：<span className="underline px-2">{contractData.singleVenueName || '___'}</span> 馆；</p>
                                                    <p>{contractData.usageScope === '全城通馆' ? '☑' : '□'} 3.4.2. 全城通馆：适用于甲方在营全部场馆（以甲方公示为准）。</p>
                                                    <p>单馆会籍不因门店增减自动变更适用范围；如需变更，按本合同转卡/变更规则办理。</p>
                                                </div>
                                                <p>3.5.其他会籍/补充约定：<span className="underline px-2">{contractData.notes || '________________________________________________'}</span>。</p>
                                            </div>
                                            <p>4.使用时段： {contractData.usageTime === '全时段卡' ? '☑' : '□'} 全时段卡 &emsp; {contractData.usageTime === '非高峰卡' ? '☑' : '□'} 非高峰卡(使用时间段14:00 - 16:00) &emsp; {contractData.usageTime === '周末全时段卡' ? '☑' : '□'} 周末全时段卡</p>
                                            <p>5.会籍期限（权益期）： <span className="underline px-2">{contractData.startDate || '____年__月__日'}</span> 至 <span className="underline px-2">{contractData.endDate || '____年__月__日'}</span>，共计 <span className="underline px-2">{contractData.totalDuration || '____'}</span>。</p>
                                            <p>6.赠送权益： <span className="underline px-2">{contractData.bonusRights || '________________'}</span> （赠送权益随主会籍规则激活，使用期限与限制以甲方公示及本合同相关条款为准）。</p>
                                            <p>7.开卡方式： {contractData.activationMethod === '首次使用开卡' ? '☑' : '□'} 首次使用开卡 &emsp; {contractData.activationMethod === '指定日期开卡' ? '☑' : '□'} 指定日期开卡（<span className="underline px-2">{contractData.activationDate || '____年__月__日'}</span>）</p>
                                            <p>8.打包产品：折价人民币 <span className="underline px-2">{contractData.packageDiscount || '___'}</span> 元</p>
                                            <p>9.合同金额：人民币 <span className="underline px-2">{contractData.amount || '___'}</span> 元</p>
                                            <p>10.支付日期： <span className="underline px-2">{contractData.paymentDate || '____年__月__日'}</span></p>
                                            <p>11.支付方式： {contractData.paymentMethod === '微信' ? '☑' : '□'} 微信 &emsp; {contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 &emsp; {contractData.paymentMethod === '银行卡' ? '☑' : '□'} 银行卡(POS刷卡/转账) &emsp; {contractData.paymentMethod === '现金' ? '☑' : '□'} 现金 &emsp; {contractData.paymentMethod === '其他' ? '☑' : '□'} 其他</p>
                                            <p>12.甲方账户信息：</p>
                                            <div className="pl-4">
                                                <p>12.1.账户名称： {contractData.accountName}</p>
                                                <p>12.2.开户银行： {contractData.accountBank}</p>
                                                <p>12.3.银行账号： {contractData.accountNo}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rest of the contract text (truncated for UI preview to save space, but keeping structure) */}
                                    <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-center italic mb-2">-- 以下为通用条款，实际签署时将完整展示 --</p>
                                        <p>二、定义与基础...</p>
                                        <p>三、赠送会籍使用规则...</p>
                                        <p>四、冷静期与退费...</p>
                                        <p>五、预约、取消、爽约与迟到规则...</p>
                                        <p>六、会籍暂停（请假/冻结）与转卡...</p>
                                        <p>七、上课安全与行为规范...</p>
                                        <p>八、甲方的权利与义务...</p>
                                        <p>九、乙方的权利与义务...</p>
                                        <p>十、违约责任...</p>
                                        <p>十一、合同的解除与终止...</p>
                                        <p>十二、不可抗力...</p>
                                        <p>十三、争议解决...</p>
                                        <p>十四、附则...</p>
                                    </div>

                                    {/* Signatures */}
                                    <div ref={sectionRefs.signatures} className="mt-12 pt-8 border-t border-gray-200">
                                        <p className="mb-6">本页为签署页。乙方确认：甲方已采取合理方式（如加粗、下划线、特殊字体等）提请本人注意免除或限制其责任、涉及本人重大利益的条款，并已应本人要求对相关条款进行了说明。本人已充分理解本合同全部内容，自愿签署。</p>
                                        
                                        <div className="mb-8 space-y-2 font-bold">
                                            <p>【重要条款特别提示（请勾选）】</p>
                                            <p>☑ 乙方已知悉：本合同为固定期限服务合约；会籍期限届满后会籍权益到期失效。</p>
                                            <p>☑ 乙方已知悉：额度型会籍到期后剩余点数进入冻结状态（不清零、不兑现），可按本合同约定续费/付费激活，超过90天未激活的，权益永久作废。</p>
                                            <p>☑ 乙方已知悉：非冷静期退费需承担可退余额20% 的退费服务费（封顶人民币2,000元），并按本合同余额公式结算。</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <div className="font-bold">甲方（盖章）:</div>
                                                <div className="font-bold">法定代表人/授权代表（签字）:</div>
                                                <div className="relative h-24">
                                                    <div className="absolute top-0 left-0 w-24 h-24 border-4 border-red-500/30 rounded-full flex items-center justify-center text-red-500/30 font-bold text-[10px] rotate-12">
                                                        MetYoga 合同专用章
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">日期：{new Date().toLocaleDateString()}</div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="font-bold">乙方（签字）:</div>
                                                <div className="h-24 border-b border-gray-200 flex items-end pb-2">
                                                    <span className="text-gray-300 text-xs italic">待会员在线签署...</span>
                                                </div>
                                                <div className="text-xs text-gray-400">日期：____年__月__日</div>
                                            </div>
                                        </div>
                                        <div className="mt-8 text-center text-gray-500">
                                            本合同签订于 浙江省 杭州市
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div ref={sectionRefs.partyB}>
                                        <div className="grid grid-cols-[80px_1fr_80px_1fr] gap-y-2">
                                            <span className="font-bold">甲方姓名：</span><span className="border-b border-gray-300">{selectedMember?.name || '________________'}</span>
                                            <span className="font-bold">性&emsp;&emsp;别：</span><span className="border-b border-gray-300">{selectedMember ? (selectedMember.gender === 'female' ? '女' : '男') : '________________'}</span>
                                            <span className="font-bold">出生日期：</span><span className="border-b border-gray-300 text-gray-400 italic">待填写...</span>
                                            <span className="font-bold">证件号码：</span><span className="border-b border-gray-300 text-gray-400 italic">待填写...</span>
                                            <span className="font-bold">手机号码：</span><span className="border-b border-gray-300 text-gray-400 italic">待填写...</span>
                                        </div>
                                    </div>

                                    <div ref={sectionRefs.partyA}>
                                        <div className="grid grid-cols-[140px_1fr] gap-y-2">
                                            <span className="font-bold">乙&emsp;&emsp;方：</span><span className="border-b border-gray-300">{contractData.partyACompany || '杭州茶瑜梵逅健康管理有限公司 （Met Yoga）'}</span>
                                            <span className="font-bold">统一社会信用代码：</span><span className="border-b border-gray-300">{contractData.partyACode || '91330101MA2J244726'}</span>
                                            <span className="font-bold">地&emsp;&emsp;址：</span><span className="border-b border-gray-300">{contractData.partyAAddress || '浙江省杭州市西湖风景名胜区四眼井 101 号'}</span>
                                            <span className="font-bold">联系电话：</span><span className="border-b border-gray-300">{contractData.partyAPhone || '19157979531'}</span>
                                        </div>
                                    </div>

                                    <p className="indent-8 mt-4">
                                        根据《中华人民共和国民法典》等法律、法规规定，甲乙双方在平等、友好协商一致的基础上， 就甲方自愿成为乙方学员由乙方提供 【瑜伽】教育培训服务 等事宜达成如下协议：
                                    </p>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-base">第一条 甲乙双方要求</h3>
                                        <div className="pl-4 space-y-2">
                                            <p className="font-bold">（一）学员资格确定</p>
                                            <p>1. 甲方是年满 18 周岁的具有完全民事行为能力人，具有良好身体状况，可以正常接受乙方提供的教培服务内容。</p>
                                            <p>2. 甲方应详细填写报名表中所列内容， 并保证填写信息的真实性、准确性及合法性。乙方依据甲方填写的信息确认甲方学员身份及享有的学员服务。如因甲方未正确填写而导致未能及时享受课程服务，由甲方承担相应责任，与乙方无关。</p>
                                            <p>3. 符合本协议条件并且办理学员登记后方可取得 Met Yoga 学员资格。</p>
                                            <p>即便存在前述约定， 乙方仍可按照实际情况最终确定甲方是否可以成为乙方学员（无论在协议开始履行前，还是协议履行中）。乙方依据本条款行使权利，不作为乙方违约。</p>
                                            
                                            <p className="font-bold mt-4">（二） 甲方健康保证</p>
                                            <p>甲方清楚了解本协议服务对身体状况的要求， 并保证身体状况良好， 无严重身体缺陷， 伤残或疾病， 可以无障碍履行本协议各项内容； 不存在任何无法使用乙方之全部设施及服务之情况。在本协议履行过程中， 甲方有任何健康或医护方面问题， 应立即自行停止相应培训， 并向医生问询就诊。康复后， 方可使用乙方设施及服务。</p>
                                            
                                            <p className="font-bold mt-4">（三） 乙方教培增值服务</p>
                                            <p>乙方为全美瑜伽联盟认证学校与由国家体育总局社会体育指导中心授权的五星级健身瑜伽场馆。学员培训期满后， 通过考核的， 可取得全美瑜伽联盟 RYT200 教练资格证书、国家体育总局颁发的三段段位证书。</p>
                                        </div>

                                        <div ref={sectionRefs.courseDetails}>
                                            <h3 className="font-bold text-base mt-6">第二条 教培服务内容</h3>
                                            <div className="pl-4 space-y-2">
                                                <p className="font-bold">（一）课程信息详情</p>
                                                <p>1. 课程名称： <span className="underline px-2">{contractData.ttcCourseName || 'RYT200 培训课程'}</span></p>
                                                <p>2. 课程预计开始时间： <span className="underline px-2">{contractData.startDate || '____年__月__日'}</span> 课程预计结束时间： <span className="underline px-2">{contractData.endDate || '____年__月__日'}</span></p>
                                                <p className="text-gray-500 text-xs">具体以甲方预报后经乙方确定开班的课期为准。因受人数及老师等资源限制， 学员课程在开班后不予调整。</p>
                                                <p>3. 授课地点： <span className="underline px-2">{contractData.partyAAddress || '浙江省杭州市西湖风景名胜区四眼井 101 号'}</span></p>
                                                
                                                <div ref={sectionRefs.payment}>
                                                    <p className="font-bold mt-4">（二）培训收费</p>
                                                    <p>1. 培训费用合计：人民币 <span className="underline px-2">{contractData.amount || '______'}</span> 元</p>
                                                    <p>2. 经甲乙双方协商，甲方采取以下方式付款：</p>
                                                    <div className="pl-4">
                                                        <p>{contractData.ttcPaymentType === '全款' ? '☑' : '□'} 全款： 支付日期： <span className="underline px-2">{contractData.ttcPaymentType === '全款' && contractData.paymentDate ? contractData.paymentDate : '____年__月__日'}</span>； {contractData.ttcPaymentType === '全款' && contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 {contractData.ttcPaymentType === '全款' && contractData.paymentMethod === '微信' ? '☑' : '□'} 微信</p>
                                                        <p>{contractData.ttcPaymentType === '定金' ? '☑' : '□'} 定金： 支付日期： <span className="underline px-2">{contractData.ttcPaymentType === '定金' && contractData.paymentDate ? contractData.paymentDate : '____年__月__日'}</span>； {contractData.ttcPaymentType === '定金' && contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 {contractData.ttcPaymentType === '定金' && contractData.paymentMethod === '微信' ? '☑' : '□'} 微信</p>
                                                        <p>{contractData.ttcPaymentType === '尾款' ? '☑' : '□'} 尾款： 支付日期： <span className="underline px-2">{contractData.ttcPaymentType === '尾款' && contractData.paymentDate ? contractData.paymentDate : '____年__月__日'}</span>； {contractData.ttcPaymentType === '尾款' && contractData.paymentMethod === '支付宝' ? '☑' : '□'} 支付宝 {contractData.ttcPaymentType === '尾款' && contractData.paymentMethod === '微信' ? '☑' : '□'} 微信</p>
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-2">注意： 费用一经支付将不予退款。甲方对本课程的报名名额将保留至尾款支付到期付款日。如有特殊情况，在课程开始前 甲方提交退学的书面通知，可以退还所付的所有款项减去全款的 20 ％ 。 因课程学员人数及老师等资源已经确定， 在课程开始第 1 周以内 甲方要求退学， 将扣除全款的 30 ％；对于在第 1 周后但在课程的前 50%之内退学的，将扣除全款的 60%；对于完成课程的 50% 以上退学的， 将不予退款。</p>
                                                </div>

                                                <div ref={sectionRefs.leave}>
                                                    <p className="font-bold mt-4">（三）请假及课程报停</p>
                                                    <p>1. 在同一期课程内，甲方享有【 <span className="underline px-2">{contractData.ttcLeaveCount || '3'}</span> 】次请假，累计不超过 24 小时并由乙方提供补课的机会。 超出前述次数的，甲方必须以每小时 100 元安排补课才能从该课程毕业。</p>
                                                    <p>2. 如甲方因出国等原因暂时无法继续参加后期课程，可申请一次报停， 报停应以书面形式提前办理并取得乙方同意方可生效。报停后甲方可以恢复课程时应向乙方提出申请， 等待至乙方有同类课程到达甲方停课时程度时经乙方通知甲方后由甲方插入后期课程。</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100 mt-6">
                                            <p className="text-center italic mb-2">-- 以下为通用条款，实际签署时将完整展示 --</p>
                                            <p>第三条 双方权利义务...</p>
                                            <p>第四条 培训服务转让...</p>
                                            <p>第五条 违约责任...</p>
                                            <p>第六条 特别约定...</p>
                                            <p>第七条 通知...</p>
                                            <p>第八条 争议解决...</p>
                                            <p>第九条 不可抗力...</p>
                                            <p>第十条 补充协议...</p>
                                            <p>第十一条 有效期限...</p>
                                            <p>第十二条 生效条件...</p>
                                        </div>

                                        {/* Signatures */}
                                        <div ref={sectionRefs.signatures} className="mt-12 pt-8 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-12">
                                                <div className="space-y-4">
                                                    <div className="font-bold">甲方（签字或盖章）:</div>
                                                    <div className="h-24 border-b border-gray-200 flex items-end pb-2">
                                                        <span className="text-gray-300 text-xs italic">待学员在线签署...</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">日期：____年__月__日</div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="font-bold">乙方（签章）:</div>
                                                    <div className="relative h-24">
                                                        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-red-500/30 rounded-full flex items-center justify-center text-red-500/30 font-bold text-[10px] rotate-12">
                                                            MetYoga 合同专用章
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400">日期：{new Date().toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg] select-none overflow-hidden">
                            <div className="text-8xl font-black whitespace-nowrap">MetYoga PRO</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  // --- Charts Data ---
  const salesTrendData = [ {name: 'M1', val: 40}, {name: 'M2', val: 30}, {name: 'M3', val: 55}, {name: 'M4', val: 45}, {name: 'M5', val: 60} ];
  const funnelData = [ {name: '浏览', value: 1000}, {name: '咨询', value: 400}, {name: '报名', value: 80}, {name: '全款', value: 65} ];

  // ================= RENDERERS =================

  // --- Shared Action Buttons Component ---
  const ActionButtons = ({ item, type }: { item: any, type: 'card' | 'ttc_course' | 'ttc_tutor' | 'product' }) => (
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
          <button 
            onClick={(e) => { e.stopPropagation(); handleEdit(item, type); }} 
            className="flex-1 bg-black text-white text-xs py-2 rounded-lg font-bold hover:opacity-80 transition shadow-lg"
          >
              编辑
          </button>
          {type !== 'ttc_tutor' && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDuplicate(item, type as any); }} 
                className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs py-2 rounded-lg font-bold hover:bg-gray-50 hover:text-black transition"
              >
                  复制
              </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(item, type); }} 
            className={`flex-1 border text-xs py-2 rounded-lg font-bold transition ${
                item.status === 'active' 
                ? 'bg-white border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200' 
                : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
            }`}
          >
              {item.status === 'active' ? '下架' : '上架'}
          </button>
      </div>
  );

  // ---------------- MODULE 1: MEMBER CARDS ----------------
  const renderCardList = () => (
      <div className="animate-fadeIn">
          <DataOverview moduleType="cards" venues={AVAILABLE_VENUES} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {cards.map(card => (
              <div key={card.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden flex flex-col h-[280px]">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${card.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {card.status === 'active' ? '上架中' : '已下架'}
                  </div>
                  <div className="mb-auto">
                      <div className="flex gap-2 mb-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${card.type === 'stored_value' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-orange-200 text-orange-600 bg-orange-50'}`}>
                              {card.type === 'stored_value' ? '储值' : '期限'}
                          </span>
                          {card.scope === 'all' ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">权益通用</span> : <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">单店权益</span>}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{card.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 italic">{card.slogan}</p>
                      <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed bg-gray-50 p-2 rounded whitespace-pre-line">{card.guide}</p>
                  </div>
                  <div className="pt-2 flex justify-between items-end">
                      <div>
                          <div className="text-xl font-bold font-mono">¥{card.price.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400">
                              {card.type === 'stored_value' ? `${card.points} 点 · ${card.validity} ${card.validityUnit === 'month' ? '个月' : '天'}` : `${card.validity} ${card.validityUnit === 'month' ? '个月' : '天'}有效`}
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] text-gray-400">30天销量</div>
                          <div className="text-sm font-bold">{card.sales30d || 0}</div>
                      </div>
                  </div>
                  <ActionButtons item={card} type="card" />
              </div>
          ))}
          <div onClick={() => handleCreate('card')} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition h-[280px]">
              <i className="fa-solid fa-plus text-3xl mb-2"></i>
              <span className="text-sm font-bold">新建卡项</span>
          </div>
      </div>
      </div>
  );

  const renderCardEdit = () => {
      const isStored = editCardCategory === 'stored_value';
      const editingCard = selectedItem as CardProduct;
      const setEditingCard = (updates: Partial<CardProduct>) => setSelectedItem({ ...selectedItem, ...updates });

      return (
          <div className="flex h-full gap-6 animate-fadeIn">
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg">{selectedItem?.id ? '编辑卡项' : '新建卡项'}</h3>
                      <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div className="p-8 space-y-8">
                      {/* Mode Selection */}
                      <div className="p-1 bg-gray-100 rounded-xl inline-flex">
                          <button onClick={() => { setEditCardCategory('stored_value'); setEditingCard({ type: 'stored_value' }); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${isStored ? 'bg-white shadow text-black' : 'text-gray-500'}`}>储值模式 (Stored)</button>
                          <button onClick={() => { setEditCardCategory('term'); setEditingCard({ type: 'term' }); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${!isStored ? 'bg-white shadow text-black' : 'text-gray-500'}`}>期限/次卡模式 (Term)</button>
                      </div>
                      
                      {/* Marketing Info */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">营销展示 (Marketing)</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block">卡项名称</label><input type="text" defaultValue={editingCard.name} onBlur={e => setEditingCard({name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                              <div className="col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block">Slogan (副标题)</label><input type="text" defaultValue={editingCard.slogan} onBlur={e => setEditingCard({slogan: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                              <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">引导购买文案</label><textarea defaultValue={editingCard.guide} onBlur={e => setEditingCard({guide: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition resize-none h-20" /></div>
                          </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">价格与价值 (Pricing)</h4>
                          <div className="grid grid-cols-3 gap-6">
                              <div><label className="text-xs font-bold text-gray-500 mb-1 block">售卖价格 (¥)</label><input type="number" defaultValue={editingCard.price} onBlur={e => setEditingCard({price: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" /></div>
                              <div className="relative">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">有效期</label>
                                  <div className="flex gap-2">
                                      <input type="number" defaultValue={editingCard.validity} onBlur={e => setEditingCard({validity: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                                      <select defaultValue={editingCard.validityUnit} onChange={e => setEditingCard({validityUnit: e.target.value as any})} className="bg-gray-50 border border-gray-200 rounded-xl px-2 text-xs outline-none">
                                          <option value="month">月</option>
                                          <option value="day">天</option>
                                      </select>
                                  </div>
                              </div>
                              {isStored && <div className="relative"><label className="text-xs font-bold text-gray-500 mb-1 block">包含点数 (Points)</label><input type="number" defaultValue={editingCard.points} onBlur={e => setEditingCard({points: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" /></div>}
                          </div>
                      </div>

                      {/* Operational Rules */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">运营规则配置 (Rules)</h4>
                          
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-6">
                              {/* Row 1: Points & Scope */}
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">开卡赠送</label>
                                      <div className="flex items-center gap-2">
                                          <input type="number" placeholder="赠送积分" defaultValue={editingCard.openingPoints} onBlur={e => setEditingCard({openingPoints: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono" />
                                          <span className="text-xs text-gray-500 font-bold">积分 (固定值)</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">积分兑换比例</label>
                                      <input type="number" step="0.1" defaultValue={editingCard.exchangeRatio} onBlur={e => setEditingCard({exchangeRatio: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono" />
                                  </div>
                              </div>

                              {/* Row 2: Cancellation */}
                              <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">取消处罚 (2小时内)</label>
                                  <div className="flex flex-wrap gap-6 items-start">
                                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 h-10">
                                          <span className="text-xs text-gray-600">免责</span>
                                          <input type="number" defaultValue={editingCard.cancelFreeLimit} onBlur={e => setEditingCard({cancelFreeLimit: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                          <span className="text-xs text-gray-600">次/月</span>
                                      </div>
                                      
                                      {isStored ? (
                                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 h-10">
                                              <span className="text-xs text-gray-600">扣除</span>
                                              <input type="number" defaultValue={editingCard.cancelDeductPoints} onBlur={e => setEditingCard({cancelDeductPoints: Number(e.target.value)})} className="w-16 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">积分</span>
                                          </div>
                                      ) : (
                                          <div className="flex gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="termCancel" checked={editingCard.termCancelPenaltyType === 'deduct_current'} onChange={() => setEditingCard({termCancelPenaltyType: 'deduct_current'})} className="text-black focus:ring-black" />
                                                  <span className="text-xs text-gray-700">扣除当节课程</span>
                                              </label>
                                              <div className="flex items-center gap-2">
                                                  <label className="flex items-center gap-2 cursor-pointer">
                                                      <input type="radio" name="termCancel" checked={editingCard.termCancelPenaltyType === 'freeze_days'} onChange={() => setEditingCard({termCancelPenaltyType: 'freeze_days'})} className="text-black focus:ring-black" />
                                                      <span className="text-xs text-gray-700">冻结天数</span>
                                                  </label>
                                                  {editingCard.termCancelPenaltyType === 'freeze_days' && (
                                                      <div className="flex items-center gap-1 ml-1">
                                                          <input type="number" defaultValue={editingCard.cancelFreezeDays} onBlur={e => setEditingCard({cancelFreezeDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-xs font-mono" />
                                                          <span className="text-[10px] text-gray-400">天</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              {/* Row 3: No Show */}
                              <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">爽约处罚</label>
                                  <div className="flex flex-wrap gap-6 items-start">
                                      {isStored ? (
                                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 h-10">
                                              <span className="text-xs text-gray-600">扣除</span>
                                              <input type="number" defaultValue={editingCard.noShowDeductPoints} onBlur={e => setEditingCard({noShowDeductPoints: Number(e.target.value)})} className="w-16 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">积分</span>
                                          </div>
                                      ) : (
                                          <div className="flex gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="termNoShow" checked={editingCard.termNoShowPenaltyType === 'deduct_current'} onChange={() => setEditingCard({termNoShowPenaltyType: 'deduct_current'})} className="text-black focus:ring-black" />
                                                  <span className="text-xs text-gray-700">扣除当节课程</span>
                                              </label>
                                              <div className="flex items-center gap-2">
                                                  <label className="flex items-center gap-2 cursor-pointer">
                                                      <input type="radio" name="termNoShow" checked={editingCard.termNoShowPenaltyType === 'freeze_days'} onChange={() => setEditingCard({termNoShowPenaltyType: 'freeze_days'})} className="text-black focus:ring-black" />
                                                      <span className="text-xs text-gray-700">冻结天数</span>
                                                  </label>
                                                  {editingCard.termNoShowPenaltyType === 'freeze_days' && (
                                                      <div className="flex items-center gap-1 ml-1">
                                                          <input type="number" defaultValue={editingCard.noShowFreezeDays} onBlur={e => setEditingCard({noShowFreezeDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-xs font-mono" />
                                                          <span className="text-[10px] text-gray-400">天</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              {/* Row 4: Check In & Scope */}
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">上课签到积分</label>
                                      <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-600">每节</span>
                                              <input type="number" defaultValue={editingCard.checkInPoints} onBlur={e => setEditingCard({checkInPoints: Number(e.target.value)})} className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">分 或</span>
                                              <input type="number" defaultValue={editingCard.checkInPointsPercent} onBlur={e => setEditingCard({checkInPointsPercent: Number(e.target.value)})} className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">%</span>
                                          </div>
                                          <div className="text-xs text-gray-400">单日上限 {editingCard.checkInDailyLimit} 积分</div>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">请假规则</label>
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs text-gray-600">每次</span>
                                          <input type="number" defaultValue={editingCard.leaveMinDays} onBlur={e => setEditingCard({leaveMinDays: Number(e.target.value)})} className="w-10 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                          <span className="text-xs text-gray-600">天起</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-600">累计</span>
                                          <input type="number" defaultValue={editingCard.leaveMaxDays} onBlur={e => setEditingCard({leaveMaxDays: Number(e.target.value)})} className="w-10 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                          <span className="text-xs text-gray-600">天</span>
                                          <label className="flex items-center gap-1 cursor-pointer ml-2">
                                              <input type="checkbox" checked={editingCard.canExtend} onChange={e => setEditingCard({canExtend: e.target.checked})} className="rounded text-black focus:ring-black" />
                                              <span className="text-xs text-gray-600">可延期</span>
                                          </label>
                                      </div>
                                  </div>
                              </div>

                              {/* Row 5: Scope */}
                              <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">适用范围 (Scope)</h4>
                                  
                                  {/* Usage Venues */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">使用场馆</label>
                                      <div className="flex gap-4">
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="scope" checked={editingCard.scope === 'single'} onChange={() => setEditingCard({scope: 'single'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">单店 (Single Store)</span>
                                          </label>
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="scope" checked={editingCard.scope === 'all'} onChange={() => setEditingCard({scope: 'all'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">通馆 (All Stores)</span>
                                          </label>
                                      </div>
                                  </div>

                                  {/* Course Types */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程类型</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['团课', '小班', '私教', '教培工作坊'].map(fn => (
                                              <label key={fn} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${editingCard.functionScope?.includes(fn) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={editingCard.functionScope?.includes(fn)} 
                                                      onChange={e => {
                                                          const current = editingCard.functionScope || [];
                                                          const newScope = e.target.checked ? [...current, fn] : current.filter(f => f !== fn);
                                                          setEditingCard({functionScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {fn}
                                              </label>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Course Genres */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程流派</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['瑜伽', '普拉提'].map(genre => (
                                              <label key={genre} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${editingCard.genreScope?.includes(genre) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={editingCard.genreScope?.includes(genre)} 
                                                      onChange={e => {
                                                          const current = editingCard.genreScope || [];
                                                          const newScope = e.target.checked ? [...current, genre] : current.filter(g => g !== genre);
                                                          setEditingCard({genreScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {genre}
                                              </label>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Listing Venues (Moved out of Scope) */}
                              </div>

                              {/* Row 6: Listing Venues */}
                              <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">上架场馆 (Listing Venues)</h4>
                                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                      <div className="flex flex-wrap gap-2">
                                          {['城西馆', '万象馆', '西湖馆', '滨江馆'].map(venue => (
                                              <label key={venue} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${editingCard.listingVenues?.includes(venue) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={editingCard.listingVenues?.includes(venue)} 
                                                      onChange={e => {
                                                          const current = editingCard.listingVenues || [];
                                                          const newScope = e.target.checked ? [...current, venue] : current.filter(v => v !== venue);
                                                          setEditingCard({listingVenues: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {venue}
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                      <button onClick={() => {
                          // Save Logic
                          if (selectedItem.id) {
                              setCards(cards.map(c => c.id === selectedItem.id ? selectedItem : c));
                          } else {
                              setCards([...cards, { ...selectedItem, id: `c_${Date.now()}`, status: 'active' }]);
                          }
                          setSelectedItem(null);
                          setSubView('list');
                      }} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 shadow-lg">保存配置</button>
                  </div>
              </div>
              <div className="w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                      <h3 className="font-bold text-gray-900">数据表现</h3>
                      {/* Filters */}
                      <div className="flex gap-2">
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="today">今日</option>
                              <option value="7d">近7天</option>
                              <option value="30d">近30天</option>
                              <option value="custom">自定义</option>
                          </select>
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="all">所有场馆</option>
                              {AVAILABLE_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scroll">
                      {/* New Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">曝光量 (Exposure)</div>
                              <div className="text-xl font-bold font-mono">3,240</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 8%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">点击量 (Clicks)</div>
                              <div className="text-xl font-bold font-mono">1,150</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 15%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">下单量 (Orders)</div>
                              <div className="text-xl font-bold font-mono">{selectedItem?.totalSales || 45}</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">+{selectedItem?.sales30d || 0}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">转化率 (Conv.)</div>
                              <div className="text-xl font-bold font-mono text-orange-500">12.8%</div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">stable</div>
                          </div>
                      </div>

                      <div className="h-40 w-full">
                          <div className="text-xs font-bold text-gray-400 mb-2 uppercase">销售趋势</div>
                          <ResponsiveContainer width="100%" height="100%"><AreaChart data={salesTrendData}><Area type="monotone" dataKey="val" stroke="#000" fill="#f3f4f6" /></AreaChart></ResponsiveContainer>
                      </div>

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">最近购买记录</div>
                          <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-gray-900">User {i}</div>
                                          <div className="text-[10px] text-gray-400">{i * 2}小时前</div>
                                      </div>
                                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-green-100 text-green-700">已支付</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  // ---------------- MODULE 2: TTC (RESEARCH CENTER) ----------------
  const renderTTCList = () => (
      <div className="animate-fadeIn space-y-12">
          <DataOverview moduleType="ttc" venues={AVAILABLE_VENUES} />
          {/* Courses Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ttcCourses.map(ttc => (
                  <div key={ttc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition h-full">
                      <div className="h-40 bg-gray-200 relative overflow-hidden">
                          <img src={ttc.cover || undefined} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="" />
                          <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${ttc.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {ttc.status === 'active' ? '招生中' : '已结课'}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 text-[10px] font-bold rounded text-white uppercase shadow-sm">
                              {ttc.category === 'yoga' ? 'Yoga 瑜伽' : 'Pilates 普拉提'}
                          </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-lg mb-2 text-gray-900">{ttc.name}</h3>
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{ttc.intro}</p>
                          
                          {/* Display Audience Tags */}
                          <div className="flex flex-wrap gap-1 mb-4">
                              {ttc.audienceNodes?.slice(0,3).map((a, i) => (
                                  <span key={i} className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-gray-500">{a.tag}</span>
                              ))}
                          </div>

                          <div className="space-y-2 mb-6">
                              {ttc.schedules.slice(0, 3).map(sch => (
                                  <div key={sch.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                                      <div><div className="font-bold text-gray-700">{sch.batchName}</div><div className="text-[10px] text-gray-400">{sch.startDate} 开课</div></div>
                                      <div className="text-right"><div className="font-bold">{sch.enrolled}/{sch.max}</div></div>
                                  </div>
                              ))}
                          </div>

                          <div className="mt-auto">
                              <button onClick={() => handleViewStudents(ttc)} className="w-full mb-3 bg-white border border-gray-200 text-gray-700 text-xs py-2 rounded-lg font-bold hover:bg-gray-50">查看学员名单</button>
                              <ActionButtons item={ttc} type="ttc_course" />
                          </div>
                      </div>
                  </div>
              ))}
              <div onClick={() => handleCreate('ttc_course')} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition min-h-[350px]">
                  <i className="fa-solid fa-plus text-3xl mb-2"></i>
                  <span className="text-sm font-bold">新建教培课程</span>
              </div>
          </div>

          {/* Tutors Section */}
          <div>
              <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">教培导师团队</h3>
                  <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ttcTutors.map(tutor => (
                      <div key={tutor.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group hover:shadow-md transition">
                          <div className="flex flex-col items-center text-center">
                              <div className="w-20 h-20 rounded-full mb-3 p-1 border border-gray-100 bg-white shadow-sm overflow-hidden">
                                  <img src={tutor.avatar || undefined} className="w-full h-full object-cover rounded-full" alt={tutor.name} />
                              </div>
                              <h4 className="font-bold text-gray-900">{tutor.name}</h4>
                              <p className="text-xs text-black/60 font-bold mb-2">{tutor.title}</p>
                              <p className="text-[10px] text-gray-400 italic line-clamp-2 min-h-[30px]">"{tutor.motto}"</p>
                          </div>
                          <ActionButtons item={tutor} type="ttc_tutor" />
                      </div>
                  ))}
                  <div onClick={() => handleCreate('ttc_tutor')} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition min-h-[220px]">
                      <i className="fa-solid fa-user-plus text-2xl mb-2"></i>
                      <span className="text-xs font-bold">添加导师</span>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderTTCEdit = () => {
      // Determine if we are editing a Course or a Tutor
      const isTutor = editType === 'ttc_tutor';

      if (isTutor) {
          return (
              <div className="flex h-full gap-6 animate-fadeIn justify-center">
                  <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h3 className="font-bold text-lg">{selectedItem ? '编辑导师名片' : '添加导师'}</h3>
                          <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                      <div className="p-8 space-y-8">
                          <div className="flex gap-6 items-start">
                              <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-black hover:text-black transition">
                                  {selectedItem?.avatar ? (
                                      <img src={selectedItem.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                  ) : (
                                      <>
                                          <i className="fa-solid fa-camera text-xl mb-1"></i>
                                          <span className="text-[10px]">上传头像</span>
                                      </>
                                  )}
                              </div>
                              <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div><label className="text-xs font-bold text-gray-500 mb-1 block">导师姓名</label><input type="text" defaultValue={selectedItem?.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                                      <div><label className="text-xs font-bold text-gray-500 mb-1 block">头衔/认证 (Title)</label><input type="text" defaultValue={selectedItem?.title} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                                  </div>
                                  <div><label className="text-xs font-bold text-gray-500 mb-1 block">名言 (Motto)</label><input type="text" defaultValue={selectedItem?.motto} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                              </div>
                          </div>

                          {/* Dynamic Resume Builder */}
                          <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 block">个人履历 (Experience)</label>
                              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                  {(selectedItem?.resume || []).map((item: TTCTutorExperience, idx: number) => (
                                      <div key={idx} className="flex gap-3 items-start group">
                                          <input 
                                            type="text" 
                                            placeholder="年份" 
                                            defaultValue={item.year}
                                            onBlur={(e) => {
                                                const newResume = [...selectedItem.resume];
                                                newResume[idx].year = e.target.value;
                                                setSelectedItem({...selectedItem, resume: newResume});
                                            }}
                                            className="w-20 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-center outline-none focus:border-black transition"
                                          />
                                          <textarea 
                                            placeholder="经历描述..." 
                                            defaultValue={item.title}
                                            onBlur={(e) => {
                                                const newResume = [...selectedItem.resume];
                                                newResume[idx].title = e.target.value;
                                                setSelectedItem({...selectedItem, resume: newResume});
                                            }}
                                            rows={2}
                                            className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-black transition resize-none"
                                          />
                                          <button 
                                            onClick={() => {
                                                const newResume = selectedItem.resume.filter((_:any, i:number) => i !== idx);
                                                setSelectedItem({...selectedItem, resume: newResume});
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                          >
                                              <i className="fa-solid fa-trash-can text-xs"></i>
                                          </button>
                                      </div>
                                  ))}
                                  <button 
                                    onClick={() => setSelectedItem({...selectedItem, resume: [...(selectedItem.resume || []), {year: '', title: ''}]})}
                                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-bold hover:border-black hover:text-black transition"
                                  >
                                      + 添加履历条目
                                  </button>
                              </div>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-gray-500 mb-2 block">授课瞬间 (Gallery)</label>
                              <div className="grid grid-cols-4 gap-4">
                                  {selectedItem?.gallery?.map((img: string, i: number) => (
                                      <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                                          <img src={img || undefined} className="w-full h-full object-cover" alt="" />
                                          <button className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"><i className="fa-solid fa-trash text-xs"></i></button>
                                      </div>
                                  ))}
                                  <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-black hover:text-black transition">
                                      <i className="fa-solid fa-plus text-xl"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                          <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">保存导师信息</button>
                      </div>
                  </div>
              </div>
          )
      }

      // Default: Course Edit
      return (
          <div className="flex h-full gap-6 animate-fadeIn">
              {/* Left Form */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg">{selectedItem ? '编辑教培课程' : '新建教培课程'}</h3>
                      <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div className="p-8 space-y-8">
                      {/* Module 1: Info */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">课程基础信息</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">课程名称</label>
                                  <input type="text" defaultValue={selectedItem?.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">课程分类</label>
                                  <select defaultValue={selectedItem?.category} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition">
                                      <option value="yoga">瑜伽 (Yoga)</option>
                                      <option value="pilates">普拉提 (Pilates)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">关联导师</label>
                                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition">
                                      <option value="">请选择导师...</option>
                                      {ttcTutors.map(t => (
                                          <option key={t.id} value={t.id} selected={selectedItem?.tutors?.includes(t.name) || selectedItem?.tutors?.includes(t.id)}>{t.name}</option>
                                      ))}
                                  </select>
                              </div>
                              
                              {/* Dynamic Course Plan */}
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">课程规划 (Syllabus)</label>
                                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                      {(selectedItem?.planNodes || []).map((node: TTCCoursePlanNode, idx: number) => (
                                          <div key={idx} className="flex gap-3 items-start">
                                              <input 
                                                type="text" 
                                                placeholder="阶段/模块" 
                                                defaultValue={node.stage}
                                                onBlur={(e) => {
                                                    const newPlan = [...selectedItem.planNodes];
                                                    newPlan[idx].stage = e.target.value;
                                                    setSelectedItem({...selectedItem, planNodes: newPlan});
                                                }}
                                                className="w-32 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-black transition"
                                              />
                                              <textarea 
                                                placeholder="学习内容描述..." 
                                                defaultValue={node.content}
                                                onBlur={(e) => {
                                                    const newPlan = [...selectedItem.planNodes];
                                                    newPlan[idx].content = e.target.value;
                                                    setSelectedItem({...selectedItem, planNodes: newPlan});
                                                }}
                                                rows={2}
                                                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-black transition resize-none"
                                              />
                                              <button 
                                                onClick={() => {
                                                    const newPlan = selectedItem.planNodes.filter((_:any, i:number) => i !== idx);
                                                    setSelectedItem({...selectedItem, planNodes: newPlan});
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                              >
                                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                              </button>
                                          </div>
                                      ))}
                                      <button 
                                        onClick={() => setSelectedItem({...selectedItem, planNodes: [...(selectedItem.planNodes || []), {stage: '', content: ''}]})}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-bold hover:border-black hover:text-black transition"
                                      >
                                          + 添加课程阶段
                                      </button>
                                  </div>
                              </div>

                              {/* Dynamic Target Audience */}
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">适合人群 (Target Audience)</label>
                                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                      {(selectedItem?.audienceNodes || []).map((node: TTCCourseAudienceNode, idx: number) => (
                                          <div key={idx} className="flex gap-3 items-center">
                                              <input 
                                                type="text" 
                                                placeholder="人群标签 (e.g. 零基础)" 
                                                defaultValue={node.tag}
                                                onBlur={(e) => {
                                                    const newAudience = [...selectedItem.audienceNodes];
                                                    newAudience[idx].tag = e.target.value;
                                                    setSelectedItem({...selectedItem, audienceNodes: newAudience});
                                                }}
                                                className="w-40 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-black transition"
                                              />
                                              <input 
                                                type="text" 
                                                placeholder="详情解释..." 
                                                defaultValue={node.desc}
                                                onBlur={(e) => {
                                                    const newAudience = [...selectedItem.audienceNodes];
                                                    newAudience[idx].desc = e.target.value;
                                                    setSelectedItem({...selectedItem, audienceNodes: newAudience});
                                                }}
                                                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-black transition"
                                              />
                                              <button 
                                                onClick={() => {
                                                    const newAudience = selectedItem.audienceNodes.filter((_:any, i:number) => i !== idx);
                                                    setSelectedItem({...selectedItem, audienceNodes: newAudience});
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                              >
                                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                              </button>
                                          </div>
                                      ))}
                                      <button 
                                        onClick={() => setSelectedItem({...selectedItem, audienceNodes: [...(selectedItem.audienceNodes || []), {tag: '', desc: ''}]})}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-bold hover:border-black hover:text-black transition"
                                      >
                                          + 添加人群定位
                                      </button>
                                  </div>
                              </div>

                              <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">课程收益 (You Will Get)</label><textarea defaultValue={selectedItem?.outcomes} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition h-20 resize-none" /></div>
                          </div>
                      </div>

                      {/* Module 2: Pricing */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">定价策略</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">标准价 (¥)</label>
                                  <input type="number" defaultValue={selectedItem?.price} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">校友价 (¥)</label>
                                  <input type="number" defaultValue={selectedItem?.alumniPrice} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                              </div>
                              <div className="col-span-2 grid grid-cols-2 gap-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                  <div>
                                      <label className="text-xs font-bold text-yellow-800 mb-1 block">早鸟价 (¥)</label>
                                      <input type="number" defaultValue={selectedItem?.earlyBirdPrice} className="w-full bg-white border border-yellow-200 rounded-xl p-3 text-sm outline-none focus:border-yellow-500 transition font-mono" />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-yellow-800 mb-1 block">早鸟优惠截止日期</label>
                                      <input type="date" defaultValue={selectedItem?.earlyBirdDeadline} className="w-full bg-white border border-yellow-200 rounded-xl p-3 text-sm outline-none focus:border-yellow-500 transition font-mono" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Module 3: Schedule Management */}
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">排期管理 (Cohorts)</h4>
                              <button 
                                className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-80"
                                onClick={() => {
                                    const newSchedule = { 
                                        id: `s_${Date.now()}`, 
                                        batchName: '新排期', 
                                        startDate: '', endDate: '', 
                                        enrolled: 0, max: 20, status: 'recruiting' 
                                    };
                                    setSelectedItem({...selectedItem, schedules: [...(selectedItem.schedules || []), newSchedule]});
                                }}
                              >
                                  + 新增排期
                              </button>
                          </div>
                          <div className="space-y-3">
                              {selectedItem?.schedules?.map((sch: TTCSchedule, idx: number) => (
                                  <div key={sch.id || idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                      <div className="flex-1 grid grid-cols-4 gap-4">
                                          <div className="col-span-4 md:col-span-1"><label className="text-[10px] font-bold text-gray-400 block mb-1">班级名称</label><input type="text" defaultValue={sch.batchName} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold" /></div>
                                          <div><label className="text-[10px] font-bold text-gray-400 block mb-1">开始日期</label><input type="date" defaultValue={sch.startDate} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs" /></div>
                                          <div><label className="text-[10px] font-bold text-gray-400 block mb-1">结束日期</label><input type="date" defaultValue={sch.endDate} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs" /></div>
                                          <div><label className="text-[10px] font-bold text-gray-400 block mb-1">名额上限</label><input type="number" defaultValue={sch.max} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs" /></div>
                                      </div>
                                      <div className="flex flex-col gap-2 border-l border-gray-200 pl-4">
                                          <button 
                                            className="text-xs text-red-500 font-bold hover:underline"
                                            onClick={() => {
                                                const newScheds = selectedItem.schedules.filter((_:any, i:number) => i !== idx);
                                                setSelectedItem({...selectedItem, schedules: newScheds});
                                            }}
                                          >删除</button>
                                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold text-center">招生中</span>
                                      </div>
                                  </div>
                              ))}
                              {(!selectedItem?.schedules || selectedItem?.schedules.length === 0) && (
                                  <div className="text-center text-xs text-gray-400 py-4">暂无排期，请点击上方按钮添加</div>
                              )}
                          </div>
                      </div>

                      {/* Module 4: Listing Venues (New) */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">上架场馆 (Sales Channels)</h4>
                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="grid grid-cols-4 gap-4">
                                  {AVAILABLE_VENUES.map(venue => (
                                      <label key={venue} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            checked={selectedItem?.listingVenues?.includes(venue) || false}
                                            onChange={(e) => {
                                                const current = selectedItem?.listingVenues || [];
                                                if(e.target.checked) {
                                                    setSelectedItem({...selectedItem, listingVenues: [...current, venue]});
                                                } else {
                                                    setSelectedItem({...selectedItem, listingVenues: current.filter((v:string) => v !== venue)});
                                                }
                                            }}
                                            className="w-4 h-4 rounded text-black focus:ring-0"
                                          />
                                          {venue}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                      <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">保存课程</button>
                  </div>
              </div>

              {/* Right Data */}
              <div className="w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                      <h3 className="font-bold text-gray-900">招生数据洞察</h3>
                      {/* Filters */}
                      <div className="flex gap-2">
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="today">今日</option>
                              <option value="7d">近7天</option>
                              <option value="30d">近30天</option>
                              <option value="custom">自定义</option>
                          </select>
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="all">所有场馆</option>
                              {AVAILABLE_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scroll">
                      {/* New Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">曝光量 (Exposure)</div>
                              <div className="text-xl font-bold font-mono">5,620</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 20%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">点击量 (Clicks)</div>
                              <div className="text-xl font-bold font-mono">2,300</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 18%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">报名量 (Signups)</div>
                              <div className="text-xl font-bold font-mono">
                                  {(selectedItem?.schedules || []).reduce((acc:number, s:any) => acc + (s.enrolled || 0), 0)}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">-</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">转化率 (Conv.)</div>
                              <div className="text-xl font-bold font-mono text-green-600">{selectedItem?.conversionRate || 0}%</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 2%</div>
                          </div>
                      </div>

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">当前报名进度</div>
                          <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" tick={{fontSize: 10}} width={40} />
                                      <Tooltip />
                                      <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                          {funnelData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={index === 3 ? '#000' : '#E5E7EB'} /> ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">最近报名记录</div>
                          <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Student${i}`} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-gray-900">Student {i}</div>
                                          <div className="text-[10px] text-gray-400">{i}天前</div>
                                      </div>
                                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">已报名</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderPointsList = () => {
      const filteredProducts = products.filter(p => p.type === pointProductTab);

      return (
          <div className="animate-fadeIn space-y-6">
              <DataOverview moduleType="points" venues={AVAILABLE_VENUES} />
              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200 pb-1">
                  <button 
                      onClick={() => setPointProductTab('course')} 
                      className={`pb-3 text-sm font-bold transition border-b-2 ${pointProductTab === 'course' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                      日常课程兑换
                  </button>
                  <button 
                      onClick={() => setPointProductTab('physical')} 
                      className={`pb-3 text-sm font-bold transition border-b-2 ${pointProductTab === 'physical' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                      实物商品兑换
                  </button>
              </div>

              {/* List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group hover:shadow-md transition flex flex-col h-full">
                          <div className="h-40 bg-gray-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                              <img src={product.cover || undefined} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="" />
                              <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold rounded-bl-lg ${product.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  {product.status === 'active' ? '上架中' : '已下架'}
                              </div>
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                              <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500">{product.type === 'physical' ? '实物' : '权益'}</span>
                                  {product.type === 'physical' && (
                                      <span className={`text-[10px] font-bold ${product.inventory < (product.warningInventory || 0) ? 'text-red-500' : 'text-gray-400'}`}>库存: {product.inventory}</span>
                                  )}
                              </div>
                              <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                                  <div>
                                      <div className="text-sm font-bold text-orange-500 font-mono">
                                          {product.enablePurePoints && (
                                              <div>{product.purePointsPrice} 积分</div>
                                          )}
                                          {product.enableMixedPayment && (
                                              <div className="text-[10px] text-gray-500">
                                                  {product.mixedPointsPrice} 积分 + ¥{product.mixedCashPrice}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                                  <div className="text-[10px] text-gray-400">已兑 {product.exchangeCount}</div>
                              </div>
                          </div>
                          <ActionButtons item={product} type="product" />
                      </div>
                  ))}
                  <div onClick={() => { setEditType('product'); setSelectedItem({ type: pointProductTab, status: 'active', venues: [], enablePurePoints: true, purePointsPrice: 0, enableMixedPayment: false, mixedPointsPrice: 0, mixedCashPrice: 0, inventory: 0, exchangeCount: 0, inventoryUsage: 0, recentExchanges: [] }); setSubView('edit'); }} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition min-h-[320px]">
                      <i className="fa-solid fa-plus text-3xl mb-2"></i>
                      <span className="text-sm font-bold">新建{pointProductTab === 'course' ? '课程' : '商品'}</span>
                  </div>
              </div>
          </div>
      );
  };

  const renderPointsEdit = () => {
      const isPhysical = selectedItem?.type === 'physical';
      const setEditingProduct = (updates: any) => setSelectedItem({ ...selectedItem, ...updates });

      return (
          <div className="flex h-full gap-6 animate-fadeIn">
              {/* Left Form */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg">{selectedItem?.id ? '编辑积分商品' : '新建积分商品'}</h3>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setEditingProduct({ status: selectedItem.status === 'active' ? 'inactive' : 'active' })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedItem?.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                              {selectedItem?.status === 'active' ? '下架商品' : '上架商品'}
                          </button>
                          <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                  </div>
                  <div className="p-8 space-y-8">
                      {/* Module 1: Basic Info */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">基础信息 (Basic Info)</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">商品名称</label>
                                  <input type="text" defaultValue={selectedItem?.name} onBlur={e => setEditingProduct({name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                              </div>
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">商品类型</label>
                                  <select 
                                      value={selectedItem?.type} 
                                      onChange={e => setEditingProduct({type: e.target.value})}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                                  >
                                      <option value="physical">实物商品</option>
                                      <option value="course">日常课程兑换</option>
                                  </select>
                              </div>
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">封面图片 URL</label>
                                  <input type="text" defaultValue={selectedItem?.cover} onBlur={e => setEditingProduct({cover: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                              </div>
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">商品说明</label>
                                  <textarea defaultValue={selectedItem?.description} onBlur={e => setEditingProduct({description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition h-20 resize-none" />
                              </div>
                          </div>
                      </div>

                      {/* Module 2: Redemption Rules */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">兑换规则 (Redemption Rules)</h4>
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                              {/* Pure Points Mode */}
                              <div>
                                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedItem?.enablePurePoints} 
                                          onChange={e => setEditingProduct({enablePurePoints: e.target.checked})} 
                                          className="rounded text-black focus:ring-black" 
                                      />
                                      <span className="text-sm font-bold text-gray-900">开启纯积分兑换</span>
                                  </label>
                                  {selectedItem?.enablePurePoints && (
                                      <div className="pl-6">
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">所需积分</label>
                                          <input 
                                              type="number" 
                                              defaultValue={selectedItem?.purePointsPrice} 
                                              onBlur={e => setEditingProduct({purePointsPrice: Number(e.target.value)})} 
                                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                          />
                                      </div>
                                  )}
                              </div>

                              {/* Mixed Mode */}
                              <div className="border-t border-gray-200 pt-4">
                                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedItem?.enableMixedPayment} 
                                          onChange={e => setEditingProduct({enableMixedPayment: e.target.checked})} 
                                          className="rounded text-black focus:ring-black" 
                                      />
                                      <span className="text-sm font-bold text-gray-900">开启积分 + 现金兑换</span>
                                  </label>
                                  {selectedItem?.enableMixedPayment && (
                                      <div className="pl-6 grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="text-xs font-bold text-gray-500 mb-1 block">所需积分</label>
                                              <input 
                                                  type="number" 
                                                  defaultValue={selectedItem?.mixedPointsPrice} 
                                                  onBlur={e => setEditingProduct({mixedPointsPrice: Number(e.target.value)})} 
                                                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs font-bold text-gray-500 mb-1 block">所需现金 (¥)</label>
                                              <input 
                                                  type="number" 
                                                  defaultValue={selectedItem?.mixedCashPrice} 
                                                  onBlur={e => setEditingProduct({mixedCashPrice: Number(e.target.value)})} 
                                                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                              />
                                          </div>
                                      </div>
                                  )}
                              </div>

                              {/* Validity for Courses */}
                              {!isPhysical && (
                                  <div className="border-t border-gray-200 pt-4 space-y-4">
                                      {/* Class Pack Option */}
                                      <div>
                                          <label className="flex items-center gap-2 cursor-pointer mb-3">
                                              <input 
                                                  type="checkbox" 
                                                  checked={selectedItem?.isClassPack} 
                                                  onChange={e => setEditingProduct({isClassPack: e.target.checked})} 
                                                  className="rounded text-black focus:ring-black" 
                                              />
                                              <span className="text-sm font-bold text-gray-900">是否是次卡 (Class Pack)</span>
                                          </label>
                                          {selectedItem?.isClassPack && (
                                              <div className="pl-6">
                                                  <label className="text-xs font-bold text-gray-500 mb-1 block">次数 (Count)</label>
                                                  <input 
                                                      type="number" 
                                                      defaultValue={selectedItem?.classCount} 
                                                      onBlur={e => setEditingProduct({classCount: Number(e.target.value)})} 
                                                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                                  />
                                              </div>
                                          )}
                                      </div>

                                      <div>
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">有效期 (天)</label>
                                          <input 
                                              type="number" 
                                              defaultValue={selectedItem?.validityDays} 
                                              onBlur={e => setEditingProduct({validityDays: Number(e.target.value)})} 
                                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                          />
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Module 3: Specifications & Inventory (Physical Only) */}
                      {isPhysical && (
                          <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">规格与库存 (Specs & Inventory)</h4>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                  {/* Inventory */}
                                  <div className="grid grid-cols-2 gap-6">
                                      <div>
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">总库存</label>
                                          <input type="number" defaultValue={selectedItem?.inventory} onBlur={e => setEditingProduct({inventory: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                                      </div>
                                      <div>
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">预警库存</label>
                                          <input type="number" defaultValue={selectedItem?.warningInventory} onBlur={e => setEditingProduct({warningInventory: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                                      </div>
                                  </div>

                                  {/* Specifications */}
                                  <div className="border-t border-gray-200 pt-6 space-y-4">
                                      <div className="flex justify-between items-center">
                                          <label className="text-xs font-bold text-gray-500 block">商品规格</label>
                                          <button 
                                              onClick={() => {
                                                  const currentSpecs = selectedItem?.specs || [];
                                                  setEditingProduct({ specs: [...currentSpecs, { name: '新规格', values: [] }] });
                                              }}
                                              className="text-xs font-bold text-black hover:underline"
                                          >
                                              + 添加规格
                                          </button>
                                      </div>
                                      
                                      {(selectedItem?.specs || []).map((spec: any, specIndex: number) => (
                                          <div key={specIndex} className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                              <div className="flex justify-between items-center">
                                                  <input 
                                                      type="text" 
                                                      value={spec.name}
                                                      onChange={(e) => {
                                                          const newSpecs = [...(selectedItem?.specs || [])];
                                                          newSpecs[specIndex].name = e.target.value;
                                                          setEditingProduct({ specs: newSpecs });
                                                      }}
                                                      className="text-sm font-bold border-b border-gray-200 focus:border-black outline-none w-32"
                                                      placeholder="规格名称 (如: 颜色)"
                                                  />
                                                  <button 
                                                      onClick={() => {
                                                          const newSpecs = [...(selectedItem?.specs || [])];
                                                          newSpecs.splice(specIndex, 1);
                                                          setEditingProduct({ specs: newSpecs });
                                                      }}
                                                      className="text-xs text-red-500 hover:text-red-700"
                                                  >
                                                      删除
                                                  </button>
                                              </div>
                                              
                                              <div className="space-y-2">
                                                  {spec.values.map((val: any, valIndex: number) => (
                                                      <div key={valIndex} className="flex items-center gap-2">
                                                          <input 
                                                              type="text" 
                                                              value={val.name}
                                                              onChange={(e) => {
                                                                  const newSpecs = [...(selectedItem?.specs || [])];
                                                                  newSpecs[specIndex].values[valIndex].name = e.target.value;
                                                                  setEditingProduct({ specs: newSpecs });
                                                              }}
                                                              className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-black"
                                                              placeholder="规格值"
                                                          />
                                                          <input 
                                                              type="text" 
                                                              value={val.image || ''}
                                                              onChange={(e) => {
                                                                  const newSpecs = [...(selectedItem?.specs || [])];
                                                                  newSpecs[specIndex].values[valIndex].image = e.target.value;
                                                                  setEditingProduct({ specs: newSpecs });
                                                              }}
                                                              className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-black"
                                                              placeholder="图片URL (可选)"
                                                          />
                                                          <button 
                                                              onClick={() => {
                                                                  const newSpecs = [...(selectedItem?.specs || [])];
                                                                  newSpecs[specIndex].values.splice(valIndex, 1);
                                                                  setEditingProduct({ specs: newSpecs });
                                                              }}
                                                              className="text-gray-400 hover:text-red-500"
                                                          >
                                                              <i className="fa-solid fa-xmark"></i>
                                                          </button>
                                                      </div>
                                                  ))}
                                                  <button 
                                                      onClick={() => {
                                                          const newSpecs = [...(selectedItem?.specs || [])];
                                                          newSpecs[specIndex].values.push({ name: '', image: '' });
                                                          setEditingProduct({ specs: newSpecs });
                                                      }}
                                                      className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                                                  >
                                                      <i className="fa-solid fa-plus"></i> 添加值
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Module 4: Scope (For Courses Only) */}
                      {selectedItem?.type === 'course' && (
                          <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">适用范围 (Scope)</h4>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                  {/* Usage Venues */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">使用场馆</label>
                                      <div className="flex gap-4">
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="product_scope" checked={selectedItem.scope === 'single'} onChange={() => setEditingProduct({scope: 'single'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">单店 (Single Store)</span>
                                          </label>
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="product_scope" checked={selectedItem.scope === 'all'} onChange={() => setEditingProduct({scope: 'all'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">通馆 (All Stores)</span>
                                          </label>
                                      </div>
                                  </div>

                                  {/* Course Types */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程类型</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['团课', '小班', '私教', '教培工作坊'].map(fn => (
                                              <label key={fn} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${selectedItem.functionScope?.includes(fn) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={selectedItem.functionScope?.includes(fn)} 
                                                      onChange={e => {
                                                          const current = selectedItem.functionScope || [];
                                                          const newScope = e.target.checked ? [...current, fn] : current.filter((f:any) => f !== fn);
                                                          setEditingProduct({functionScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {fn}
                                              </label>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Course Genres */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程流派</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['瑜伽', '普拉提'].map(genre => (
                                              <label key={genre} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${selectedItem.genreScope?.includes(genre) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={selectedItem.genreScope?.includes(genre)} 
                                                      onChange={e => {
                                                          const current = selectedItem.genreScope || [];
                                                          const newScope = e.target.checked ? [...current, genre] : current.filter((g:any) => g !== genre);
                                                          setEditingProduct({genreScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {genre}
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Module 5: Listing Venues */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">上架场馆 (Listing Venues)</h4>
                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="grid grid-cols-2 gap-4">
                                  {AVAILABLE_VENUES.map(venue => (
                                      <label key={venue} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                          <input 
                                            type="checkbox" 
                                            checked={selectedItem?.venues?.includes(venue) || false}
                                            onChange={(e) => {
                                                const current = selectedItem?.venues || [];
                                                if(e.target.checked) {
                                                    setEditingProduct({venues: [...current, venue]});
                                                } else {
                                                    setEditingProduct({venues: current.filter((v:string) => v !== venue)});
                                                }
                                            }}
                                            className="w-4 h-4 rounded text-black focus:ring-black border-gray-300"
                                          />
                                          {venue}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                      <button 
                          onClick={() => {
                              // Save Logic
                              if (selectedItem.id) {
                                  setProducts(products.map(p => p.id === selectedItem.id ? selectedItem : p));
                              } else {
                                  setProducts([...products, { ...selectedItem, id: `p_${Date.now()}` }]);
                              }
                              setSelectedItem(null);
                              setSubView('list');
                          }}
                          className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
                      >
                          保存商品
                      </button>
                  </div>
              </div>

              {/* Right Sidebar: Stats */}
              <div className="w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                      <h3 className="font-bold text-gray-900">数据表现</h3>
                      {/* Filters */}
                      <div className="flex gap-2">
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="today">今日</option>
                              <option value="7d">近7天</option>
                              <option value="30d">近30天</option>
                              <option value="custom">自定义</option>
                          </select>
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="all">所有场馆</option>
                              {AVAILABLE_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scroll">
                      {/* New Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">曝光量 (Exposure)</div>
                              <div className="text-xl font-bold font-mono">2,450</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 12%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">点击量 (Clicks)</div>
                              <div className="text-xl font-bold font-mono">860</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 5%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">下单量 (Orders)</div>
                              <div className="text-xl font-bold font-mono">{selectedItem?.exchangeCount || 125}</div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">-</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">转化率 (Conv.)</div>
                              <div className="text-xl font-bold font-mono text-orange-500">14.5%</div>
                              <div className="text-[10px] text-red-500 font-bold mt-1">↓ 2%</div>
                          </div>
                      </div>

                      {isPhysical && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex justify-between items-center mb-2">
                                  <div className="text-xs text-gray-400">库存消耗</div>
                                  <div className="text-xs font-bold text-orange-500">{selectedItem?.inventoryUsage || 0}%</div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${selectedItem?.inventoryUsage || 0}%` }}></div>
                              </div>
                          </div>
                      )}

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">最近兑换记录</div>
                          <div className="space-y-3">
                              {(selectedItem?.recentExchanges || []).map((log: any) => (
                                  <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                                          <img src={log.avatar || undefined} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-gray-900">{log.user}</div>
                                          <div className="text-[10px] text-gray-400">{log.date}</div>
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                          {log.status === 'completed' ? '已完成' : '处理中'}
                                      </span>
                                  </div>
                              ))}
                              {(!selectedItem?.recentExchanges || selectedItem?.recentExchanges.length === 0) && (
                                  <div className="text-center text-xs text-gray-400 py-4">暂无兑换记录</div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderTTCStudents = () => {
      return (
          <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-4">
                      <button onClick={handleBack} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"><i className="fa-solid fa-arrow-left"></i></button>
                      <div>
                          <h3 className="font-bold text-lg text-gray-900">学员名单管理</h3>
                          <p className="text-xs text-gray-500 mt-0.5">当前课程: {selectedItem?.name}</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button className="bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-50">导出名单</button>
                      <button className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:opacity-80">+ 录入学员</button>
                  </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-bold">
                          <tr>
                              <th className="p-4 pl-6">学员姓名</th>
                              <th className="p-4">联系电话</th>
                              <th className="p-4">报名班期</th>
                              <th className="p-4">报名时间</th>
                              <th className="p-4">缴费状态</th>
                              <th className="p-4">实付金额</th>
                              <th className="p-4 text-right pr-6">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {students.map(st => (
                              <tr key={st.id} className="hover:bg-gray-50 transition">
                                  <td className="p-4 pl-6 font-bold text-gray-900">{st.name}</td>
                                  <td className="p-4 font-mono text-gray-600">{st.phone}</td>
                                  <td className="p-4 text-gray-600">{st.batch}</td>
                                  <td className="p-4 text-gray-600">{st.signupDate}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          st.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                                          st.paymentStatus === 'deposit' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                                      }`}>
                                          {st.paymentStatus === 'paid' ? '全款付清' : st.paymentStatus === 'deposit' ? '已付订金' : '待支付'}
                                      </span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-gray-900">¥{st.amount.toLocaleString()}</td>
                                  <td className="p-4 text-right pr-6">
                                      <button className="text-blue-600 hover:underline text-xs font-bold mr-3">编辑</button>
                                      <button className="text-red-500 hover:underline text-xs font-bold">退款</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const renderOrders = () => {
      const detailedOrders = orders.map(order => toMallOrderRow(order, contracts));
      const filteredOrders = detailedOrders.filter(order => {
          const statusMatched = orderFilters.status === 'all' || order.status === orderFilters.status;
          return order.category === orderTab && statusMatched;
      });

      return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn flex flex-col h-full">
              <div className="p-5 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">销售与订单管理</h3>
                      <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">导出数据</button>
                      </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex gap-1 bg-gray-200/50 p-1 rounded-lg self-start">
                      {[ { id: 'cards', label: '会员卡项' }, { id: 'ttc', label: '研学中心' }, { id: 'points', label: '积分商品' } ].map(tab => (
                          <button 
                              key={tab.id} 
                              onClick={() => setOrderTab(tab.id as any)} 
                              className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${orderTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                          >
                              {tab.label}
                          </button>
                      ))}
                  </div>

                  {/* Filters */}
                  <div className="flex gap-3">
                      <select 
                          value={orderFilters.date}
                          onChange={(e) => setOrderFilters({...orderFilters, date: e.target.value})}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black transition w-32"
                      >
                          <option value="all">全部日期</option>
                          <option value="today">今日</option>
                          <option value="7d">近7天</option>
                      </select>
                      <select 
                          value={orderFilters.type}
                          onChange={(e) => setOrderFilters({...orderFilters, type: e.target.value})}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black transition w-32"
                      >
                          <option value="all">全部类型</option>
                          <option value="type1">类型1</option>
                          <option value="type2">类型2</option>
                      </select>
                      <select 
                          value={orderFilters.status}
                          onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black transition w-32"
                      >
                          <option value="all">全部状态</option>
                          <option value="paid">已支付</option>
                          <option value="pending">待支付</option>
                      </select>
                  </div>
              </div>

              <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-bold sticky top-0 z-10">
                          <tr>
                              <th className="p-4 pl-6">订单号</th>
                              <th className="p-4">用户信息</th>
                              <th className="p-4">商品内容</th>
                              <th className="p-4">
                                  {orderTab === 'cards' ? '卡项详情' : orderTab === 'ttc' ? '教培详情' : '兑换详情'}
                              </th>
                              <th className="p-4">实付金额</th>
                              <th className="p-4">支付状态</th>
                              <th className="p-4">下单时间</th>
                              <th className="p-4 text-right pr-6">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {filteredOrders.map(order => (
                              <tr key={order.id} className="hover:bg-gray-50 transition">
                                  <td className="p-4 pl-6 font-mono text-xs text-gray-500">{order.id}</td>
                                  <td className="p-4">
                                      <div className="font-bold text-gray-900">{order.user}</div>
                                      <div className="text-xs text-gray-400 font-mono mt-0.5">{order.phone}</div>
                                  </td>
                                  <td className="p-4">
                                      <div className="text-gray-900 font-medium">{order.product}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{order.type}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                          order.subStatus === 'active' || order.subStatus === 'signed' || order.subStatus === 'shipped' ? 'bg-green-50 text-green-700 border-green-100' : 
                                          order.subStatus === 'attended' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                                      }`}>
                                          {order.details}
                                      </span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-gray-900">{order.amount}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          order.status === 'paid' || order.status === 'completed' ? 'text-green-600 bg-green-50' : 
                                          order.status === 'pending' || order.status === 'deposit' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
                                      }`}>
                                          {order.status === 'paid' ? '已支付' : order.status === 'deposit' ? '已付定金' : order.status === 'completed' ? '已完成' : '待支付'}
                                      </span>
                                  </td>
                                  <td className="p-4 text-xs text-gray-400 font-mono">{order.time}</td>
                                  <td className="p-4 text-right pr-6">
                                      <button className="text-black hover:underline text-xs font-bold">查看</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-12">暂无订单数据</div>
                  )}
              </div>
          </div>
      );
  };
  
  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-[#F5F5F7]">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4"><h2 className="text-xl font-bold text-gray-900">商城管理中心</h2></div>
            {subView === 'list' && (
                <div className="flex items-center gap-4">
                    <div className="relative"><i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i><input type="text" placeholder={`搜索${activeModule === 'cards' ? '卡项' : activeModule === 'ttc' ? '课程' : '商品'}...`} className="pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg text-xs w-64 transition-all outline-none" /></div>
                    
                    {(activeModule === 'cards' || activeModule === 'ttc') && (
                        <div className="relative group">
                            <button className="bg-white border border-gray-200 text-gray-900 text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
                                <i className="fa-solid fa-file-signature text-orange-500"></i> 合同管理
                                <i className="fa-solid fa-chevron-down text-gray-400 ml-1 text-[10px]"></i>
                            </button>
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                <button 
                                    onClick={() => {
                                        setContractData({...contractData, productType: activeModule === 'ttc' ? 'ttc' : 'card'});
                                        setSubView('contract_create');
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-pen-nib w-4 text-center"></i> 在线发起
                                </button>
                                <button 
                                    onClick={() => document.getElementById('contract-upload')?.click()}
                                    className="w-full text-left px-4 py-3 text-xs text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition flex items-center gap-2 border-t border-gray-50"
                                >
                                    <i className="fa-solid fa-upload w-4 text-center"></i> 上传文件
                                </button>
                            </div>
                            <input 
                                type="file" 
                                id="contract-upload" 
                                className="hidden" 
                                accept=".pdf,.doc,.docx" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        alert('标准合同上传成功！');
                                    }
                                }} 
                            />
                        </div>
                    )}

                    {activeModule !== 'orders' && (<button onClick={() => handleCreate(activeModule === 'cards' ? 'card' : activeModule === 'ttc' ? 'ttc_course' : 'product')} className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:opacity-80 transition shadow-lg shadow-black/10">+ 新建{activeModule === 'cards' ? '卡项' : activeModule === 'ttc' ? '课程' : '商品'}</button>)}
                </div>
            )}
        </div>

        {/* Sub Nav */}
        {subView === 'list' && (
            <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                    {[ { id: 'cards', label: '会员卡项 (Cards)' }, { id: 'ttc', label: '研学中心 (TTC)' }, { id: 'points', label: '积分商品 (Points)' }, { id: 'orders', label: '销售与订单 (Orders)' } ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveModule(tab.id as any)} className={`relative z-10 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${activeModule === tab.id ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-500 hover:text-black'}`}>{tab.label}</button>
                    ))}
                </div>
            </div>
        )}

        {/* Content */}
        <div className={`flex-1 p-8 custom-scroll ${subView === 'contract_create' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
            <div className={`max-w-[1440px] mx-auto w-full ${subView === 'contract_create' ? 'flex-1 flex flex-col min-h-0' : 'min-h-[500px]'}`}>
                {subView === 'list' && (
                    <>
                        {activeModule === 'cards' && renderCardList()}
                        {activeModule === 'ttc' && renderTTCList()}
                        {activeModule === 'points' && renderPointsList()}
                        {activeModule === 'orders' && renderOrders()}
                    </>
                )}
                {subView === 'edit' && activeModule === 'cards' && renderCardEdit()}
                {subView === 'edit' && activeModule === 'ttc' && renderTTCEdit()}
                {subView === 'edit' && activeModule === 'points' && renderPointsEdit()}
                {subView === 'students' && activeModule === 'ttc' && renderTTCStudents()}
                {subView === 'contract_create' && renderContractCreate()}
            </div>
        </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Mall;
