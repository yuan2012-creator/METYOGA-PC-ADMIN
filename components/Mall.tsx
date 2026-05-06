
import React, { useState, useMemo } from 'react';
import {
  MOCK_CARD_PRODUCTS,
  MOCK_CONTRACTS,
  MOCK_ORDERS,
  MOCK_POINT_PRODUCTS,
  MOCK_TTC_PRODUCTS,
} from '../constants';
import MallCards from './mall/MallCards';
import MallContractCreate, { createInitialContractData, type MallContractData } from './mall/MallContractCreate';
import MallOrders, { type MallOrderCategory, type MallOrderFilters } from './mall/MallOrders';
import MallPoints from './mall/MallPoints';
import MallTtc, { type MallTtcCourse, type Student, type TTCTutor, toMallTtcCourse } from './mall/MallTtc';
import type { CardProduct, Contract, Order, PointProduct } from '../types';

// --- Constants ---
const AVAILABLE_VENUES = ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆'];

// --- Types ---
type EditableMallItemType = 'card' | 'ttc_course' | 'ttc_tutor' | 'product';

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

const Mall: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'cards' | 'ttc' | 'points' | 'orders'>('cards');
  const [subView, setSubView] = useState<'list' | 'edit' | 'students' | 'contract_create'>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editType, setEditType] = useState<EditableMallItemType>('card');
  
  // Local state for toggling Card Category in Edit Mode
  const [editCardCategory, setEditCardCategory] = useState<'stored_value' | 'term'>('stored_value');
  const [pointProductTab, setPointProductTab] = useState<'course' | 'physical'>('course');
  
  // Order Management State
  const [orderTab, setOrderTab] = useState<MallOrderCategory>('cards');
  const [orderFilters, setOrderFilters] = useState<MallOrderFilters>({ date: 'all', type: 'all', status: 'all' });

  // Contract Creation State
  const [contractData, setContractData] = useState<MallContractData>(() => createInitialContractData());

  // --- Mock Data ---  // --- Mock Data ---

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

  const [ttcCourses, setTtcCourses] = useState<MallTtcCourse[]>(
      MOCK_TTC_PRODUCTS.map((product, index) => toMallTtcCourse(product, index, AVAILABLE_VENUES))
  );

  const [products, setProducts] = useState<PointProduct[]>(MOCK_POINT_PRODUCTS);

  const [students] = useState<Student[]>([
      { id: 'st1', name: 'Lisa Wang', phone: '138****8888', paymentStatus: 'paid', amount: 16800, confirmed: true, batch: '2024 春季周末班', signupDate: '2023-11-20' },
      { id: 'st2', name: 'Mike Chen', phone: '139****1234', paymentStatus: 'deposit', amount: 5000, confirmed: false, batch: '2024 春季周末班', signupDate: '2023-11-22' },
  ]);

  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [contracts] = useState<Contract[]>(MOCK_CONTRACTS);

  // --- Helpers ---
  const handleEdit = (item: any, type: EditableMallItemType) => {
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

  const handleCreate = (type: EditableMallItemType) => {
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

  const handleToggleStatus = (item: any, type: EditableMallItemType) => {
      const newStatus = item.status === 'active' ? 'inactive' : 'active';
      if (type === 'card') setCards(cards.map(c => c.id === item.id ? {...c, status: newStatus} : c));
      if (type === 'ttc_course') setTtcCourses(ttcCourses.map(c => c.id === item.id ? {...c, status: newStatus} : c));
      if (type === 'ttc_tutor') setTtcTutors(ttcTutors.map(t => t.id === item.id ? {...t, status: newStatus} : t));
      if (type === 'product') setProducts(products.map(p => p.id === item.id ? {...p, status: newStatus} : p));
  };

  const handleBack = () => { setSubView('list'); setSelectedItem(null); };
  const handleViewStudents = (item: any) => { setSelectedItem(item); setSubView('students'); };

  // --- Charts Data ---
  const salesTrendData = [ {name: 'M1', val: 40}, {name: 'M2', val: 30}, {name: 'M3', val: 55}, {name: 'M4', val: 45}, {name: 'M5', val: 60} ];
  const funnelData = [ {name: '浏览', value: 1000}, {name: '咨询', value: 400}, {name: '报名', value: 80}, {name: '全款', value: 65} ];

  // ================= RENDERERS =================

  // --- Shared Action Buttons Component ---
  const ActionButtons = ({ item, type }: { item: any, type: EditableMallItemType }) => (
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

  const renderActionButtons = (item: any, type: EditableMallItemType) => (
      <ActionButtons item={item} type={type} />
  );

  const renderMallCards = (view: 'list' | 'edit') => (
      <MallCards
          view={view}
          cards={cards}
          setCards={setCards}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          editCardCategory={editCardCategory}
          setEditCardCategory={setEditCardCategory}
          overview={<DataOverview moduleType="cards" venues={AVAILABLE_VENUES} />}
          actionButtons={renderActionButtons}
          handleBack={handleBack}
          handleCreate={handleCreate}
          salesTrendData={salesTrendData}
          availableVenues={AVAILABLE_VENUES}
      />
  );

  const renderMallTtc = (view: 'list' | 'edit' | 'students') => (
      <MallTtc
          view={view}
          ttcCourses={ttcCourses}
          ttcTutors={ttcTutors}
          editType={editType}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          students={students}
          overview={<DataOverview moduleType="ttc" venues={AVAILABLE_VENUES} />}
          actionButtons={renderActionButtons}
          handleBack={handleBack}
          handleCreate={handleCreate}
          handleViewStudents={handleViewStudents}
          availableVenues={AVAILABLE_VENUES}
          funnelData={funnelData}
      />
  );

  const renderMallPoints = (view: 'list' | 'edit') => (
      <MallPoints
          view={view}
          products={products}
          setProducts={setProducts}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          pointProductTab={pointProductTab}
          setPointProductTab={setPointProductTab}
          overview={<DataOverview moduleType="points" venues={AVAILABLE_VENUES} />}
          actionButtons={renderActionButtons}
          handleBack={handleBack}
          handleCreateProduct={() => handleCreate('product')}
          availableVenues={AVAILABLE_VENUES}
      />
  );

  const renderMallOrders = () => (
      <MallOrders
          orders={orders}
          contracts={contracts}
          orderTab={orderTab}
          setOrderTab={setOrderTab}
          orderFilters={orderFilters}
          setOrderFilters={setOrderFilters}
      />
  );

  const renderMallContractCreate = () => (
      <MallContractCreate
          contractData={contractData}
          setContractData={setContractData}
          cards={cards}
          ttcCourses={ttcCourses}
          handleBack={handleBack}
      />
  );
  
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
                        {activeModule === 'cards' && renderMallCards('list')}
                        {activeModule === 'ttc' && renderMallTtc('list')}
                        {activeModule === 'points' && renderMallPoints('list')}
                        {activeModule === 'orders' && renderMallOrders()}
                    </>
                )}
                {subView === 'edit' && activeModule === 'cards' && renderMallCards('edit')}
                {subView === 'edit' && activeModule === 'ttc' && renderMallTtc('edit')}
                {subView === 'edit' && activeModule === 'points' && renderMallPoints('edit')}
                {subView === 'students' && activeModule === 'ttc' && renderMallTtc('students')}
                {subView === 'contract_create' && renderMallContractCreate()}
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
