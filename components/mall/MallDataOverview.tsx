import React, { useMemo, useState } from 'react';
import type { MallOverviewModule } from './mallTypes';
import type { MallClosureSummary } from '../../utils/mallSelectors';

type MallOverviewMetricStatus = 'good' | 'warning' | 'neutral';
type MallOverviewMetric = {
    id: 'exposure' | 'clicks' | 'orders' | 'fulfill';
    label: string;
    val: string;
    rate?: string;
    change?: string;
    status: MallOverviewMetricStatus;
    isFallback?: boolean;
};

type MallSpecificMetric = {
    val: string;
    change: string;
    status: MallOverviewMetricStatus;
    isFallback?: boolean;
};

type MallOverviewMetrics = {
    exposure: MallOverviewMetric;
    clicks: MallOverviewMetric;
    orders: MallOverviewMetric;
    fulfill: MallOverviewMetric;
    renewal: MallSpecificMetric;
    cycle: MallSpecificMetric;
    arpu: MallSpecificMetric;
    fillRate: MallSpecificMetric;
    pointsConsumed: MallSpecificMetric;
    mixedRatio: MallSpecificMetric;
};

type FunnelStep = {
    label: string;
    value: number;
    rate: string | null;
    isFallback?: boolean;
};

const formatRate = (current: number, previous: number): string => (
    previous > 0 ? `${((current / previous) * 100).toFixed(1)}%` : '0%'
);

const buildMallOverviewMetrics = (
    closureSummary: MallClosureSummary | undefined,
    selectedProduct: string | null
): MallOverviewMetrics => {
    const orderCount = closureSummary?.totalOrders ?? 0;
    const fulfilledCount = closureSummary?.linkedAssetCount ?? 0;
    const fallbackExposure = selectedProduct ? Math.max(orderCount * 80, 800) : Math.max(orderCount * 120, 1200);
    const fallbackClicks = selectedProduct ? Math.max(orderCount * 24, 240) : Math.max(orderCount * 36, 360);
    const scopedOrders = selectedProduct ? Math.max(Math.ceil(orderCount / 3), 1) : orderCount;
    const scopedFulfilled = selectedProduct ? Math.min(scopedOrders, Math.max(Math.ceil(fulfilledCount / 3), 0)) : fulfilledCount;

    return {
        exposure: {
            id: 'exposure',
            label: '曝光量',
            val: fallbackExposure.toLocaleString(),
            change: '估算',
            status: 'neutral',
            isFallback: true,
        },
        clicks: {
            id: 'clicks',
            label: '点击量',
            val: fallbackClicks.toLocaleString(),
            rate: formatRate(fallbackClicks, fallbackExposure),
            status: 'neutral',
            isFallback: true,
        },
        orders: {
            id: 'orders',
            label: '下单量',
            val: scopedOrders.toLocaleString(),
            rate: formatRate(scopedOrders, fallbackClicks),
            status: closureSummary ? 'good' : 'warning',
        },
        fulfill: {
            id: 'fulfill',
            label: '履约完成',
            val: scopedFulfilled.toLocaleString(),
            rate: formatRate(scopedFulfilled, scopedOrders),
            status: scopedFulfilled >= scopedOrders ? 'good' : 'warning',
        },
        renewal: { val: '-', change: '估算', status: 'neutral', isFallback: true },
        cycle: { val: '-', change: '估算', status: 'neutral', isFallback: true },
        arpu: {
            val: closureSummary ? `¥${Math.round((closureSummary.totalOrders || 1) * 1000).toLocaleString()}` : '-',
            change: closureSummary ? '订单口径估算' : '估算',
            status: closureSummary ? 'good' : 'neutral',
            isFallback: true,
        },
        fillRate: { val: '-', change: '估算', status: 'neutral', isFallback: true },
        pointsConsumed: { val: '-', change: '估算', status: 'neutral', isFallback: true },
        mixedRatio: { val: '-', change: '估算', status: 'neutral', isFallback: true },
    };
};

const buildFunnelData = (metrics: MallOverviewMetrics): FunnelStep[] => {
    const exposure = Number(metrics.exposure.val.replace(/,/g, '')) || 0;
    const clicks = Number(metrics.clicks.val.replace(/,/g, '')) || 0;
    const orders = Number(metrics.orders.val.replace(/,/g, '')) || 0;
    const fulfill = Number(metrics.fulfill.val.replace(/,/g, '')) || 0;

    return [
        { label: '曝光量', value: exposure, rate: null, isFallback: true },
        { label: '点击量', value: clicks, rate: formatRate(clicks, exposure), isFallback: true },
        { label: '下单量', value: orders, rate: formatRate(orders, clicks) },
        { label: '履约量', value: fulfill, rate: formatRate(fulfill, orders) },
    ];
};

const buildRankingData = (
    moduleType: MallOverviewModule,
    closureSummary: MallClosureSummary | undefined
) => {
    const baseCount = closureSummary?.totalOrders ?? 0;
    const fulfilled = closureSummary?.linkedAssetCount ?? 0;
    const fallbackRows = moduleType === 'cards'
        ? ['初遇卡', '瑜伽年卡', '私教20次', '普拉提月卡', '瑜伽季卡']
        : moduleType === 'ttc'
            ? ['RYT200', '普拉提大器械', '孕产修复', '流瑜伽工作坊', '阿斯汤加']
            : ['Lululemon瑜伽垫', '瑜伽小班课', 'Manduka铺巾', '私教体验', '运动水杯'];

    return fallbackRows.map((name, index) => {
        const estimatedSales = index === 0 ? baseCount : Math.max(baseCount - index, 0);
        const conversionBase = Math.max(estimatedSales, 1);
        const conversion = fulfilled > 0 ? formatRate(Math.max(fulfilled - index, 0), conversionBase) : null;

        return {
            id: `rank-${moduleType}-${index}`,
            name,
            val: estimatedSales.toLocaleString(),
            sub: conversion === null ? '估算排行' : `履约率 ${conversion}`,
            isFallback: true,
        };
    });
};

// --- Data Overview Component ---
const MallDataOverview = ({
    moduleType,
    venues,
    closureSummary,
    onDemoAction,
}: {
    moduleType: MallOverviewModule;
    venues: string[];
    closureSummary?: MallClosureSummary;
    onDemoAction?: (message: string) => void;
}) => {
    type RankingTab = 'sales' | 'ctr' | 'conversion' | 'stagnant';

    const [rankingTab, setRankingTab] = useState<RankingTab>('sales');
    const [selectedMetric, setSelectedMetric] = useState<MallOverviewMetric['id'] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHighIntent, setShowHighIntent] = useState(false);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [filterConditions, setFilterConditions] = useState({
        count: 'all', // all, >5, >10
        time: 'all',  // all, 1h, 24h, 7d
        member: 'all' // all, yes, no
    });
    
    const metrics = useMemo(
        () => buildMallOverviewMetrics(closureSummary, selectedProduct),
        [closureSummary, selectedProduct]
    );

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
    const funnelData = useMemo(() => buildFunnelData(metrics), [metrics]);
    const rankingData = useMemo(
        () => buildRankingData(moduleType, closureSummary),
        [moduleType, closureSummary]
    );

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 shadow-sm animate-fadeIn relative">
            {/* Header & Filters */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <i className="fa-solid fa-chart-pie"></i> 数据总览
                </h3>
                <div className="flex gap-3 items-center">
                    <button 
                        onClick={() => onDemoAction?.('智能分析仍为估算口径，后续会接入真实商城漏斗数据')}
                        className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline mr-2"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> 智能分析
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

            {closureSummary && (
                <div className="mb-5 grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 font-bold mb-1">订单记录</div>
                        <div className="text-base font-black font-mono">{closureSummary.totalOrders}</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 font-bold mb-1">已连会员资产</div>
                        <div className="text-base font-black font-mono text-green-600">{closureSummary.linkedAssetCount}</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 font-bold mb-1">已连合同</div>
                        <div className="text-base font-black font-mono text-blue-600">{closureSummary.linkedContractCount}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                        <div className="text-[10px] text-orange-500 font-bold mb-1">待补链路</div>
                        <div className="text-base font-black font-mono text-orange-600">{closureSummary.fallbackAssetCount}</div>
                    </div>
                </div>
            )}

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
                            {m.isFallback && <span className="ml-1 text-gray-400">估算</span>}
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
                    <div className="text-[10px] text-gray-400 mb-3">订单/履约来自订单-资产链路；曝光/点击为估算口径。</div>
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
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">商品表现排行</h4>
                            <div className="text-[10px] text-gray-400 pl-4 mt-1">估算排行，待接真实商品明细</div>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {([
                                {id: 'sales', label: '销量Top5'},
                                {id: 'ctr', label: '点击Top5'},
                                {id: 'conversion', label: '转化Top5'},
                                {id: 'stagnant', label: '滞销预警'}
                            ] satisfies { id: RankingTab; label: string }[]).map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setRankingTab(tab.id)}
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
                            {metrics[selectedMetric].label}名单
                            {selectedProduct && <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedProduct}</span>}
                        </h4>
                        <button onClick={() => { setSelectedMetric(null); setSearchTerm(''); setShowHighIntent(false); }} className="text-gray-400 hover:text-black">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                            名单、浏览行为与点击频次仍为估算口径；订单/履约数已按当前订单-资产链路推导。
                        </div>
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


export default MallDataOverview;
