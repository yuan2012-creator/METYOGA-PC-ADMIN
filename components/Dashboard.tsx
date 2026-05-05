import React, { useState } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import {
  MOCK_ALERTS,
  MOCK_ATTENDANCES,
  MOCK_BOOKINGS,
  MOCK_CONTRACTS,
  MOCK_COURSE_SESSIONS,
  MOCK_FINANCE_LEDGER_ENTRIES,
  MOCK_MEMBERS,
  MOCK_MHS_DATA,
  MOCK_ORDERS,
  MOCK_PAYMENTS,
  MOCK_REFUNDS,
  MOCK_TEAM_TASKS,
} from '../constants';
import { MEMBER_LIFECYCLE_GROUPS, getMemberLifecycleStatus } from '../utils/memberLifecycle';
import type {
  Attendance,
  FinanceLedgerEntry,
  MHSData,
  Order,
  Payment,
  Refund,
} from '../types';

type MhsDimensionKey = 'L' | 'F' | 'E' | 'S';

interface DashboardRadarItem {
  subject: string;
  A: number;
  fullMark: number;
  key: MhsDimensionKey;
}

interface DashboardSnapshotItem {
  label: string;
  value: string;
  desc: string;
  icon: string;
  tone: string;
}

interface RadarClickEvent {
  activeLabel?: string;
}

interface DashboardSummary {
  mhsScore: number;
  mhsStatusLabel: string;
  mhsStatusClass: string;
  mhsStrokeOffset: number;
  activeMemberCount: number;
  riskMemberCount: number;
  pendingOrderCount: number;
  pendingContractCount: number;
  upcomingSessionCount: number;
  activeBookingCount: number;
  consumedAttendanceCount: number;
  paidPaymentAmount: number;
  refundAmount: number;
  netCashFlow: number;
  recognizedIncomeAmount: number;
}

const MHS_DIMENSION_KEYS: MhsDimensionKey[] = ['L', 'F', 'E', 'S'];

const MHS_RADAR_SUBJECTS: Record<MhsDimensionKey, string> = {
  L: '留存 (L)',
  F: '财务 (F)',
  E: '效率 (E)',
  S: '员工 (S)',
};

const MONEY_FORMATTER = new Intl.NumberFormat('zh-CN');
const MHS_CIRCLE_LENGTH = 440;

const formatMoney = (amount: number): string => `¥${MONEY_FORMATTER.format(amount)}`;

const sumPayments = (payments: Payment[]): number => (
  payments
    .filter(payment => payment.status === 'paid' || payment.status === 'reconciled')
    .reduce((sum, payment) => sum + payment.amount, 0)
);

const sumRefunds = (refunds: Refund[]): number => (
  refunds
    .filter(refund => refund.status === 'completed' || refund.status === 'processing' || refund.status === 'approved')
    .reduce((sum, refund) => sum + refund.amount, 0)
);

const sumRecognizedIncome = (entries: FinanceLedgerEntry[]): number => (
  entries
    .filter(entry => entry.direction === 'liability_decrease')
    .reduce((sum, entry) => sum + entry.amount, 0)
);

const countConsumedAttendances = (attendances: Attendance[]): number => (
  attendances.filter(attendance => attendance.status === 'consumed').length
);

const buildRadarData = (): DashboardRadarItem[] => (
  MHS_DIMENSION_KEYS.map(key => ({
    subject: MHS_RADAR_SUBJECTS[key],
    A: MOCK_MHS_DATA[key].score,
    fullMark: 100,
    key,
  }))
);

const getMhsStatus = (score: number): Pick<DashboardSummary, 'mhsStatusLabel' | 'mhsStatusClass'> => {
  if (score >= 80) return { mhsStatusLabel: '健康状态', mhsStatusClass: 'bg-green-100 text-green-700' };
  if (score >= 60) return { mhsStatusLabel: '亚健康状态', mhsStatusClass: 'bg-yellow-100 text-yellow-800' };
  return { mhsStatusLabel: '需重点关注', mhsStatusClass: 'bg-red-100 text-red-700' };
};

const buildDashboardSummary = (): DashboardSummary => {
  const mhsScore = Math.round(
    MHS_DIMENSION_KEYS.reduce((sum, key) => sum + MOCK_MHS_DATA[key].score, 0) / MHS_DIMENSION_KEYS.length
  );
  const paidPaymentAmount = sumPayments(MOCK_PAYMENTS);
  const refundAmount = sumRefunds(MOCK_REFUNDS);
  const activeMemberCount = MOCK_MEMBERS.filter(member => (
    MEMBER_LIFECYCLE_GROUPS.active.includes(getMemberLifecycleStatus(member))
  )).length;
  const riskMemberCount = MOCK_MEMBERS.filter(member => Boolean(member.riskTag)).length;
  const pendingOrderCount = MOCK_ORDERS.filter((order: Order) => (
    order.status === 'draft' || order.status === 'pending_payment' || order.status === 'paid'
  )).length;
  const pendingContractCount = MOCK_CONTRACTS.filter(contract => (
    contract.status === 'draft' || contract.status === 'pending_signature' || contract.status === 'signed'
  )).length;
  const upcomingSessionCount = MOCK_COURSE_SESSIONS.filter(session => (
    session.status === 'scheduled' || session.status === 'published'
  )).length;
  const activeBookingCount = MOCK_BOOKINGS.filter(booking => (
    booking.status === 'booked' || booking.status === 'waitlisted'
  )).length;
  const consumedAttendanceCount = countConsumedAttendances(MOCK_ATTENDANCES);
  const recognizedIncomeAmount = sumRecognizedIncome(MOCK_FINANCE_LEDGER_ENTRIES);
  const { mhsStatusLabel, mhsStatusClass } = getMhsStatus(mhsScore);

  return {
    mhsScore,
    mhsStatusLabel,
    mhsStatusClass,
    mhsStrokeOffset: MHS_CIRCLE_LENGTH - (mhsScore / 100) * MHS_CIRCLE_LENGTH,
    activeMemberCount,
    riskMemberCount,
    pendingOrderCount,
    pendingContractCount,
    upcomingSessionCount,
    activeBookingCount,
    consumedAttendanceCount,
    paidPaymentAmount,
    refundAmount,
    netCashFlow: paidPaymentAmount - refundAmount,
    recognizedIncomeAmount,
  };
};

const buildSnapshotItems = (summary: DashboardSummary): DashboardSnapshotItem[] => [
  {
    label: '会员池',
    value: `${summary.activeMemberCount}人`,
    desc: `${summary.riskMemberCount} 个风险标签待跟进`,
    icon: 'fa-regular fa-user',
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    label: '商品履约',
    value: `${summary.pendingOrderCount}单`,
    desc: `${summary.pendingContractCount} 份合同待签/生效`,
    icon: 'fa-solid fa-file-signature',
    tone: 'bg-purple-50 text-purple-600',
  },
  {
    label: '今日教务',
    value: `${summary.upcomingSessionCount}场`,
    desc: `${summary.activeBookingCount} 个预约，${summary.consumedAttendanceCount} 次已消课`,
    icon: 'fa-regular fa-calendar-check',
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: '财务净额',
    value: formatMoney(summary.netCashFlow),
    desc: `已确认收入 ${formatMoney(summary.recognizedIncomeAmount)}，退款 ${formatMoney(summary.refundAmount)}`,
    icon: 'fa-solid fa-coins',
    tone: 'bg-orange-50 text-orange-600',
  },
];

const Dashboard: React.FC = () => {
  const [activeDimension, setActiveDimension] = useState<MHSData>(MOCK_MHS_DATA['L']);
  const radarData = buildRadarData();
  const dashboardSummary = buildDashboardSummary();
  const snapshotItems = buildSnapshotItems(dashboardSummary);

  const handleRadarClick = (e: RadarClickEvent) => {
    if (e && e.activeLabel) {
      const match = radarData.find(d => d.subject === e.activeLabel);
      if (match) setActiveDimension(MOCK_MHS_DATA[match.key]);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. MHS Overview Section */}
      <div className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[420px]">
        
        {/* Left: Health Score */}
        <div className="w-full lg:w-1/4 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col justify-center items-center bg-gradient-to-b from-white to-gray-50">
            <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">MHS 门店健康指数</div>
            <div className="relative mb-4 w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" stroke="#F3F4F6" strokeWidth="12" fill="none"/>
                    <circle cx="80" cy="80" r="70" stroke="#000" strokeWidth="12" fill="none" strokeDasharray={MHS_CIRCLE_LENGTH} strokeDashoffset={dashboardSummary.mhsStrokeOffset} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold tracking-tighter text-[#1D1D1F]">{dashboardSummary.mhsScore}</span>
                    <span className="text-xs text-gray-400 mt-1">分</span>
                </div>
            </div>
            <div className={`px-3 py-1 text-xs font-bold rounded-full mb-6 ${dashboardSummary.mhsStatusClass}`}>
                {dashboardSummary.mhsStatusLabel}
            </div>
            <div className="w-full grid grid-cols-2 gap-4 text-center">
                <div><div className="text-xs text-gray-400">近期收款</div><div className="font-bold text-[#1D1D1F]">{formatMoney(dashboardSummary.paidPaymentAmount)}</div></div>
                <div><div className="text-xs text-gray-400">已消课</div><div className="font-bold text-[#1D1D1F]">{dashboardSummary.consumedAttendanceCount}节</div></div>
                <div><div className="text-xs text-gray-400">活跃会员</div><div className="font-bold text-[#1D1D1F]">{dashboardSummary.activeMemberCount}人</div></div>
                <div><div className="text-xs text-gray-400">待签合同</div><div className="font-bold text-[#1D1D1F]">{dashboardSummary.pendingContractCount}份</div></div>
            </div>
        </div>

        {/* Center: Radar Chart */}
        <div className="w-full lg:w-1/3 p-4 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="absolute top-6 left-6 text-sm font-bold text-gray-800">维度诊断</div>
            <div className="absolute top-6 right-6 text-xs text-gray-400 flex items-center gap-1 cursor-pointer hover:text-black">
                点击维度查看详情 <i className="fa-solid fa-hand-pointer text-[10px]"></i>
            </div>
            <div className="h-64 w-full cursor-pointer">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid gridType="polygon" stroke="#E5E5E5" />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#1D1D1F', fontSize: 11, fontWeight: 'bold' }} 
                            onClick={(e) => handleRadarClick({ activeLabel: e.value })}
                            cursor="pointer"
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="MHS"
                            dataKey="A"
                            stroke="#000"
                            strokeWidth={2}
                            fill="#000"
                            fillOpacity={0.05}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right: Dimension Details */}
        <div className="w-full lg:w-5/12 p-8 bg-white flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[#1D1D1F]">{activeDimension.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded text-white font-bold ${getScoreColorClass(activeDimension.score)}`}>
                            {activeDimension.score}分
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">{activeDimension.desc}</p>
                </div>
                <button className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">查看报表</button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scroll">
                {activeDimension.metrics.map((metric, idx) => (
                    <div key={idx} className="group">
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-600">{metric.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-[#1D1D1F]">{metric.val}</span>
                                <div className={`w-2 h-2 rounded-full ${
                                    metric.status === 'good' ? 'bg-green-500' : 
                                    metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
                                }`}></div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    metric.status === 'good' ? 'bg-black' : 
                                    metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
                                }`}
                                style={{ width: `${metric.score}%` }}
                            ></div>
                        </div>
                        {metric.status !== 'good' && metric.tip && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-600 flex items-start gap-1.5">
                                <i className="fa-solid fa-lightbulb text-yellow-500 mt-0.5"></i>
                                <span>{metric.tip}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {snapshotItems.map((item) => (
              <div key={item.label} className="bg-white rounded-[18px] p-5 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.tone}`}>
                      <i className={item.icon}></i>
                  </div>
                  <div className="min-w-0">
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">{item.value}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{item.desc}</div>
                  </div>
              </div>
          ))}
      </div>

      {/* 2. Alerts & Team Section */}
      <div className="grid grid-cols-12 gap-6">
          
          {/* Alerts */}
          <div className="col-span-8 bg-white rounded-[18px] p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-[#1D1D1F] flex items-center gap-2">
                      ⚠️ 智能预警中心
                      <button 
                          onClick={() => alert('Gemini AI 正在分析门店数据并生成预警...')}
                          className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                      >
                          <i className="fa-solid fa-wand-magic-sparkles"></i> AI 预警分析
                      </button>
                  </h3>
                  <span className="text-xs text-gray-400">系统自动生成</span>
              </div>
              <div className="space-y-4">
                  {MOCK_ALERTS.map((alert) => (
                      <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-xl border ${alert.type === 'danger' ? 'bg-red-50/50 border-red-100' : 'bg-yellow-50/50 border-yellow-100'}`}>
                          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border flex-shrink-0 ${alert.type === 'danger' ? 'text-red-500 border-red-100' : 'text-yellow-600 border-yellow-100'}`}>
                              <i className={alert.type === 'danger' ? "fa-solid fa-arrow-trend-down" : "fa-regular fa-calendar-xmark"}></i>
                          </div>
                          <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-900">{alert.title}</h4>
                              <p className="text-xs text-gray-500 mt-1 mb-2">{alert.desc}</p>
                              <div className="flex items-center gap-3">
                                  <button className={`text-white text-xs px-3 py-1.5 rounded font-medium transition hover:opacity-80 ${alert.type === 'danger' ? 'bg-black' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'}`}>
                                      {alert.type === 'danger' ? '采纳并创建任务' : '调整排课'}
                                  </button>
                                  {alert.type === 'danger' && <a href="#" className="text-xs text-gray-500 hover:text-black hover:underline">查看流失名单</a>}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Team Status */}
          <div className="col-span-4 bg-white rounded-[18px] p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-[#1D1D1F]">团队今日状态</h3>
                  <a href="#" className="text-xs text-blue-600 hover:underline">更多</a>
              </div>
              <div className="space-y-5">
                  {MOCK_TEAM_TASKS.map((task) => (
                      <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">{task.avatar}</div>
                              <div>
                                  <div className="text-sm font-bold text-[#1D1D1F]">{task.staff} <span className="text-gray-400 font-normal">({task.role})</span></div>
                                  <div className="text-[10px] text-gray-400">{task.taskName}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-xs font-bold ${task.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {task.status === 'done' ? '已完成' : `进行中 ${task.progress}%`}
                              </div>
                              <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-1 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
