import type { MockCourseConsumptionRecord } from '../types';

/**
 * 会员经营列表验收用耗课样本（与 MOCK_MEMBERS 中 memberId 对齐，不写入 constants）。
 * 日期相对门店演示时间轴（约 2026-05）编排，便于「最近耗课」列验收。
 */
export const MEMBER_OPS_SCENARIO_CONSUMPTIONS: MockCourseConsumptionRecord[] = [
  {
    id: 'mops-cons-lisa-1',
    courseSessionId: 'session-20260505-1000',
    memberId: '1',
    memberName: 'Lisa Wang',
    courseTitle: '普拉提大器械',
    consumedAt: '2026-05-09T11:00:00+08:00',
    amount: 1,
  },
  {
    id: 'mops-cons-lisa-2',
    courseSessionId: 'session-20260506-1100',
    memberId: '1',
    memberName: 'Lisa Wang',
    courseTitle: '核心稳定私教',
    consumedAt: '2026-05-06T12:05:00+08:00',
    amount: 1,
  },
  {
    id: 'mops-cons-sophie-1',
    courseSessionId: 'session-20260505-1900',
    memberId: '5',
    memberName: 'Sophie Zhang',
    courseTitle: '流瑜伽',
    consumedAt: '2026-04-22T20:05:00+08:00',
    amount: 1,
  },
  {
    id: 'mops-cons-linda-1',
    courseSessionId: 'session-20260505-1000',
    memberId: '101',
    memberName: 'Linda Wu',
    courseTitle: '普拉提大器械',
    consumedAt: '2026-04-14T10:55:00+08:00',
    amount: 1,
  },
  {
    id: 'mops-cons-tom-1',
    courseSessionId: 'session-20260505-1900',
    memberId: '102',
    memberName: 'Tom Chen',
    courseTitle: '流瑜伽',
    consumedAt: '2026-04-18T19:30:00+08:00',
    amount: 1,
  },
  {
    id: 'mops-cons-jessica-1',
    courseSessionId: 'session-20260505-1000',
    memberId: '4',
    memberName: 'Jessica Liu',
    courseTitle: '普拉提大器械',
    consumedAt: '2025-10-18T10:50:00+08:00',
    amount: 1,
  },
];
