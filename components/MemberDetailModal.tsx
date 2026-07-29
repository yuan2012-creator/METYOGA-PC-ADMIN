
import React, { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, Tooltip,
} from 'recharts';
import type {
  Attendance,
  Booking,
  Contract,
  Course,
  CourseSession,
  FinanceLedgerEntry,
  Member,
  MemberAsset,
  MockCourseConsumptionRecord,
  Order,
  Payment,
  Refund,
} from '../types';
import { buildMemberBusinessRecordSummary } from '../utils/memberDetailSelectors';
import { buildMemberDetailViewModel } from '../utils/memberDetailViewModel';
import { getMemberLifecyclePresentation } from '../utils/memberPresentation';

const PLACEHOLDER_ACTION_TOAST = '功能待接入，正式版本需接入权限与操作日志';

type DetailMainTab =
  | 'overview'
  | 'assets'
  | 'bookingAttendance'
  | 'consumption'
  | 'ordersContracts'
  | 'riskFollowup';

const MAIN_TABS: Array<{ id: DetailMainTab; label: string }> = [
  { id: 'overview', label: '会员概览' },
  { id: 'assets', label: '资产权益' },
  { id: 'bookingAttendance', label: '预约到课' },
  { id: 'consumption', label: '耗课记录' },
  { id: 'ordersContracts', label: '订单合同' },
  { id: 'riskFollowup', label: '跟进与风险' },
];

interface MemberDetailModalProps {
  member: Member;
  onClose: () => void;
  consumptions: MockCourseConsumptionRecord[];
  memberAssets: MemberAsset[];
  bookings: Booking[];
  attendances: Attendance[];
  orders: Order[];
  contracts: Contract[];
  payments: Payment[];
  refunds: Refund[];
  ledgerEntries: FinanceLedgerEntry[];
  courseSessions: CourseSession[];
  courses: Course[];
  /** 详情只读拉取中（可选，不改变原有布局，仅多一行提示） */
  isMemberDetailLoading?: boolean;
  /** 详情只读拉取失败（可选） */
  memberDetailError?: string | null;
}

type MemberDetailToast = {
  id: number;
  message: string;
  tone: 'info' | 'success';
};

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  consumptions,
  memberAssets,
  bookings,
  attendances,
  orders,
  contracts,
  payments,
  refunds,
  ledgerEntries,
  courseSessions,
  courses,
  isMemberDetailLoading,
  memberDetailError,
}) => {
  const [activeTab, setActiveTab] = useState<DetailMainTab>('overview');
  const [toast, setToast] = useState<MemberDetailToast | null>(null);

  const vm = useMemo(
    () => buildMemberDetailViewModel({
      member,
      memberAssets,
      bookings,
      attendances,
      consumptions,
      orders,
      contracts,
      payments,
      refunds,
      courseSessions,
      courses,
    }),
    [
      member,
      memberAssets,
      bookings,
      attendances,
      consumptions,
      orders,
      contracts,
      payments,
      refunds,
      courseSessions,
      courses,
    ],
  );

  const recordInput = useMemo(
    () => ({
      member,
      bookings,
      attendances,
      courseSessions,
      courses,
      orders,
      payments,
      refunds,
      ledgerEntries,
    }),
    [member, bookings, attendances, courseSessions, courses, orders, payments, refunds, ledgerEntries],
  );

  const businessRecordSummary = useMemo(
    () => buildMemberBusinessRecordSummary(recordInput),
    [recordInput],
  );

  const stageView = getMemberLifecyclePresentation(member);

  const preferenceData = member.topCourses && member.topCourses.length > 0
    ? member.topCourses.map((c, i) => ({ name: c, value: 40 - i * 10 }))
    : [{ name: '暂无偏好数据', value: 100 }];

  const PREF_COLORS = ['#1D1D1F', '#6E6E73', '#AEAEB2', '#E5E5EA'];

  const frequencyData = [
    { week: '第1周', count: 1 },
    { week: '第2周', count: 3 },
    { week: '第3周', count: 2 },
    { week: '第4周', count: 4 },
  ];

  const showToast = (message: string, tone: MemberDetailToast['tone'] = 'info') => {
    setToast({ id: Date.now(), message, tone });
    window.setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 2400);
  };

  const { overview, assets, bookingAttendanceRows, consumptionRows, orderRows, contractRows, refundRows, riskAndFollowup } = vm;

  const fieldCell = (label: string, value: string) => (
    <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 text-xs font-bold text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex h-[85vh] w-[1100px] max-w-[96vw] flex-col overflow-hidden rounded-3xl bg-[#F5F5F7] shadow-2xl animate-fadeInUp">
        <div className="z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={member.avatar}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full border border-gray-200 object-cover shadow-sm"
            />
            <div className="min-w-0">
              {isMemberDetailLoading ? (
                <p className="mb-1 text-[11px] font-medium text-gray-500">会员详情加载中…</p>
              ) : null}
              {memberDetailError ? (
                <p className="mb-1 text-[11px] font-medium text-rose-700">{memberDetailError}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-gray-900">{overview.name}</h2>
                <span className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                  {member.gender === 'female' ? <i className="fa-solid fa-venus text-pink-400" /> : <i className="fa-solid fa-mars text-blue-400" />}
                  {member.age}
                  岁
                </span>
                <span
                  className="rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: stageView.color,
                    borderColor: `${stageView.color}40`,
                    backgroundColor: stageView.bgColor,
                  }}
                >
                  {overview.lifecycleLabel}
                </span>
                {overview.riskTags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-md border border-gray-200/90 bg-gray-50/90 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-gray-400">
                <i className="fa-solid fa-phone mr-1" />
                {overview.phoneMasked}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => showToast(PLACEHOLDER_ACTION_TOAST)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              编辑档案
            </button>
            <button
              type="button"
              onClick={() => showToast(PLACEHOLDER_ACTION_TOAST)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              联系会员
            </button>
            <button
              type="button"
              onClick={() => showToast(PLACEHOLDER_ACTION_TOAST)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              新增跟进
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              aria-label="关闭"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-gray-200 bg-white px-4">
          <div className="flex gap-1 overflow-x-auto pb-0 pt-2">
            {MAIN_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative shrink-0 whitespace-nowrap px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === tab.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gray-900" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="custom-scroll flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {fieldCell('会员姓名', overview.name)}
                {fieldCell('手机号', overview.phoneMasked)}
                {fieldCell('生命周期', overview.lifecycleLabel)}
                {fieldCell('会员类型', overview.memberSegmentLabel)}
                {fieldCell('来源', overview.memberSourceLabel)}
                {fieldCell('负责人 / 管家', overview.ownerLabel)}
                {fieldCell('专属老师', overview.teacherLabel)}
                {fieldCell('最近到课 / 预约', overview.lastAttendanceLine)}
                {fieldCell('最近耗课', overview.lastConsumptionLine)}
                {fieldCell('当前主资产', overview.mainAssetLabel)}
                {fieldCell('风险标签', overview.riskTags.join('、'))}
                {fieldCell('下一步动作建议', overview.nextActionLabel)}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h4 className="mb-2 text-sm font-bold text-gray-900">上课偏好</h4>
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={preferenceData}
                            innerRadius={28}
                            outerRadius={40}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {preferenceData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PREF_COLORS[index % PREF_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      {member.topCourses && member.topCourses.length > 0 ? (
                        member.topCourses.map((c, i) => (
                          <div key={c} className="flex items-center justify-between text-xs">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PREF_COLORS[i] }} />
                              <span className="truncate text-gray-600">{c}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">暂未记录</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">近期练习频率</h4>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                      <span className="font-mono text-xl">
                        {businessRecordSummary.hasCourseDomainData
                          ? businessRecordSummary.completedClassCount
                          : member.totalClasses}
                      </span>
                      <span className="font-normal text-gray-400">
                        {businessRecordSummary.hasCourseDomainData ? '到课节数' : '累计节数'}
                      </span>
                    </div>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={frequencyData}>
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <Tooltip
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{
                            borderRadius: 8,
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            fontSize: 10,
                          }}
                        />
                        <Bar dataKey="count" fill="#1D1D1F" radius={[4, 4, 4, 4]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-4">
              {assets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-400">
                  暂无会员资产
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      <tr>
                        <th className="px-4 py-3">卡项 / 资产名称</th>
                        <th className="px-4 py-3">剩余</th>
                        <th className="px-4 py-3">有效期</th>
                        <th className="px-4 py-3">资产状态</th>
                        <th className="px-4 py-3">关联订单</th>
                        <th className="px-4 py-3">关联合同</th>
                        <th className="px-4 py-3">适用说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {assets.map(a => (
                        <tr key={a.id} className="text-gray-800">
                          <td className="px-4 py-3 font-bold">{a.name}</td>
                          <td className="px-4 py-3 font-mono">{a.remainingDisplay}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{a.expiryDisplay}</td>
                          <td className="px-4 py-3">{a.statusLabel}</td>
                          <td className="px-4 py-3 font-mono text-[11px]">{a.orderRef}</td>
                          <td className="px-4 py-3 font-mono text-[11px]">{a.contractRef}</td>
                          <td className="px-4 py-3 text-gray-500">{a.applicabilityDisplay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-gray-400">
                改余额、赠送点数、冻结、转卡、退费等操作功能待接入，正式版本需审批与操作日志。
              </p>
            </div>
          )}

          {activeTab === 'bookingAttendance' && (
            <div>
              {bookingAttendanceRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-400">
                  暂无预约与到课记录
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      <tr>
                        <th className="px-4 py-3">课程名称</th>
                        <th className="px-4 py-3">上课时间</th>
                        <th className="px-4 py-3">老师</th>
                        <th className="px-4 py-3">预约状态</th>
                        <th className="px-4 py-3">到课状态</th>
                        <th className="px-4 py-3">签到 / 到课时间</th>
                        <th className="px-4 py-3">来源</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookingAttendanceRows.map(row => (
                        <tr key={row.id}>
                          <td className="px-4 py-3 font-bold text-gray-900">{row.courseName}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{row.sessionStartDisplay}</td>
                          <td className="px-4 py-3">{row.teacherName}</td>
                          <td className="px-4 py-3">{row.bookingStatusDisplay}</td>
                          <td className="px-4 py-3">{row.attendanceStatusDisplay}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{row.checkInOrArrivalDisplay}</td>
                          <td className="px-4 py-3 text-gray-500">{row.sourceLine}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-[11px] text-gray-400">补签、代约等功能待接入，正式版本需审批与操作日志。</p>
            </div>
          )}

          {activeTab === 'consumption' && (
            <div>
              {consumptionRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-400">
                  暂无耗课记录
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      <tr>
                        <th className="px-4 py-3">课程名称</th>
                        <th className="px-4 py-3">耗课时间</th>
                        <th className="px-4 py-3">扣减</th>
                        <th className="px-4 py-3">来源</th>
                        <th className="px-4 py-3">状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {consumptionRows.map(row => (
                        <tr key={row.id}>
                          <td className="px-4 py-3 font-bold text-gray-900">{row.courseName}</td>
                          <td className="px-4 py-3 font-mono text-gray-600">{row.consumedAtDisplay}</td>
                          <td className="px-4 py-3">{row.deductDisplay}</td>
                          <td className="px-4 py-3">{row.sourceDisplay}</td>
                          <td className="px-4 py-3">{row.statusDisplay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ordersContracts' && (
            <div className="space-y-8">
              <section>
                <h4 className="mb-3 text-sm font-bold text-gray-900">订单</h4>
                {orderRows.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-xs text-gray-400">
                    暂无订单记录
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        <tr>
                          <th className="px-4 py-3">订单编号</th>
                          <th className="px-4 py-3">购买产品</th>
                          <th className="px-4 py-3">支付金额</th>
                          <th className="px-4 py-3">支付状态</th>
                          <th className="px-4 py-3">合同名称</th>
                          <th className="px-4 py-3">合同状态</th>
                          <th className="px-4 py-3">签署时间</th>
                          <th className="px-4 py-3">关联信息</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orderRows.map(o => (
                          <tr key={o.id}>
                            <td className="px-4 py-3 font-mono font-bold">{o.orderLabel}</td>
                            <td className="max-w-[180px] px-4 py-3 text-gray-700">{o.productSummary}</td>
                            <td className="px-4 py-3 font-mono">{o.payAmountDisplay}</td>
                            <td className="px-4 py-3">{o.payStatusDisplay}</td>
                            <td className="px-4 py-3">{o.contractNameDisplay}</td>
                            <td className="px-4 py-3">{o.contractStatusDisplay}</td>
                            <td className="px-4 py-3 font-mono text-gray-600">{o.signedAtDisplay}</td>
                            <td className="max-w-[160px] px-4 py-3 text-[10px] text-gray-500">{o.linksDisplay}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h4 className="mb-3 text-sm font-bold text-gray-900">合同</h4>
                {contractRows.length === 0 ? (
                  <p className="text-xs text-gray-400">暂无独立合同记录</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        <tr>
                          <th className="px-4 py-3">合同名称</th>
                          <th className="px-4 py-3">合同状态</th>
                          <th className="px-4 py-3">签署时间</th>
                          <th className="px-4 py-3">关联订单</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {contractRows.map(c => (
                          <tr key={c.id}>
                            <td className="px-4 py-3 font-bold">{c.titleDisplay}</td>
                            <td className="px-4 py-3">{c.statusDisplay}</td>
                            <td className="px-4 py-3 font-mono text-gray-600">{c.signedAtDisplay}</td>
                            <td className="px-4 py-3 font-mono text-[11px]">{c.orderRef}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h4 className="mb-3 text-sm font-bold text-gray-900">退款记录</h4>
                {refundRows.length === 0 ? (
                  <p className="text-xs text-gray-400">暂无退款记录</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        <tr>
                          <th className="px-4 py-3">金额</th>
                          <th className="px-4 py-3">状态</th>
                          <th className="px-4 py-3">时间</th>
                          <th className="px-4 py-3">说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {refundRows.map(r => (
                          <tr key={r.id}>
                            <td className="px-4 py-3 font-mono font-bold">{r.amountDisplay}</td>
                            <td className="px-4 py-3">{r.statusDisplay}</td>
                            <td className="px-4 py-3 font-mono text-gray-600">{r.timeDisplay}</td>
                            <td className="px-4 py-3 text-gray-600">{r.reasonDisplay}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <p className="text-[11px] text-gray-400">
                创建合同、修改合同、发起退款等功能待接入，正式版本需审批与操作日志。
              </p>
            </div>
          )}

          {activeTab === 'riskFollowup' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-gray-900">风险标签</h4>
                {riskAndFollowup.riskTags.length === 1 && riskAndFollowup.riskTags[0] === '暂无明显风险' ? (
                  <p className="text-sm text-gray-400">暂无明显风险</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {riskAndFollowup.riskTags.map(tag => (
                      <span key={tag} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-gray-900">风险原因</h4>
                {riskAndFollowup.riskReasonLines.length === 0 ? (
                  <p className="text-sm text-gray-400">暂无明显风险</p>
                ) : (
                  <ul className="list-inside list-disc space-y-2 text-xs leading-relaxed text-gray-600">
                    {riskAndFollowup.riskReasonLines.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {fieldCell('下一步动作建议', riskAndFollowup.nextActionLabel)}
                {fieldCell('负责人', riskAndFollowup.ownerLabel)}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-2 text-sm font-bold text-gray-900">经营指引</h4>
                <p className="text-xs leading-relaxed text-gray-600">{riskAndFollowup.strategyHint}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-gray-900">待跟进事项</h4>
                {riskAndFollowup.pendingLines.length === 0 ? (
                  <p className="text-xs text-gray-400">暂未记录</p>
                ) : (
                  <ul className="space-y-2 text-xs text-gray-700">
                    {riskAndFollowup.pendingLines.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gray-300">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-3 text-sm font-bold text-gray-900">最近跟进记录</h4>
                {riskAndFollowup.followUps.length === 0 ? (
                  <p className="text-xs text-gray-400">暂未记录</p>
                ) : (
                  <div className="space-y-3">
                    {riskAndFollowup.followUps.map(f => (
                      <div key={f.id} className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-3">
                        <div className="flex justify-between gap-2 text-[10px] text-gray-400">
                          <span className="font-mono">{f.dateDisplay}</span>
                          <span>{f.staffDisplay}</span>
                        </div>
                        <div className="mt-1 text-xs font-bold text-gray-900">{f.title}</div>
                        <div className="mt-1 text-xs text-gray-600">{f.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400">
                任务创建、短信、外呼等触达功能待接入，正式版本需接入权限与操作日志。
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed top-20 right-8 z-[80] animate-fadeInUp">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold shadow-xl ${
              toast.tone === 'success'
                ? 'border-green-100 bg-green-50 text-green-700'
                : 'border-gray-100 bg-white text-gray-800'
            }`}
          >
            <i className={`fa-solid ${toast.tone === 'success' ? 'fa-circle-check' : 'fa-circle-info'}`} />
            {toast.message}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MemberDetailModal;
