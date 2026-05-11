import type {
  Attendance,
  Booking,
  Contract,
  Course,
  CourseSession,
  Member,
  MemberAsset,
  MemberLifecycleStatus,
  MockCourseConsumptionRecord,
  Order,
} from '../types';
import { getMemberLifecyclePresentation } from './memberPresentation';
import { getMemberLifecycleStatus } from './memberLifecycle';

export type MemberListLifecycleTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface MemberListRow {
  memberId: string;
  name: string;
  phoneMasked: string;
  lifecycleLabel: string;
  lifecycleTone: MemberListLifecycleTone;
  mainAssetLabel: string;
  remainingLabel: string;
  expireLabel: string;
  expireRiskLabel: string;
  lastAttendanceLabel: string;
  lastConsumptionLabel: string;
  ownerLabel: string;
  teacherLabel: string;
  riskTags: string[];
  nextActionLabel: string;
}

export interface MemberListRowsInput {
  members: Member[];
  memberAssets: MemberAsset[];
  bookings: Booking[];
  attendances: Attendance[];
  consumptions: MockCourseConsumptionRecord[];
  orders: Order[];
  contracts: Contract[];
  courseSessions: CourseSession[];
  courses: Course[];
}

const MS_PER_DAY = 86400000;

const safeParseDate = (iso?: string): Date | null => {
  if (!iso || !String(iso).trim()) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysFromNow = (d: Date): number => Math.floor((d.getTime() - Date.now()) / MS_PER_DAY);

const maskPhone = (phone: string): string => {
  if (phone.includes('*')) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return phone;
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
};

const getSession = (courseSessions: CourseSession[], sessionId: string): CourseSession | undefined => (
  courseSessions.find(s => s.id === sessionId)
);

const getCourse = (courses: Course[], courseId?: string): Course | undefined => (
  courseId ? courses.find(c => c.id === courseId) : undefined
);

const getSessionTitle = (
  courseSessions: CourseSession[],
  courses: Course[],
  sessionId: string,
): string => {
  const session = getSession(courseSessions, sessionId);
  const course = getCourse(courses, session?.courseId);
  return session?.title ?? course?.name ?? '课程场次';
};

const formatListDate = (iso?: string): string => {
  const d = safeParseDate(iso);
  if (!d) return '暂未记录';
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const attendanceActivityTime = (a: Attendance): string | undefined => (
  a.consumedAt ?? a.attendedAt ?? a.checkedInAt
);

const isRealAttendance = (a: Attendance): boolean => (
  a.status === 'checked_in' || a.status === 'attended' || a.status === 'consumed'
);

const lifecycleToTone = (status: MemberLifecycleStatus): MemberListLifecycleTone => {
  if (status === 'churned' || status === 'inactive') return 'danger';
  if (status === 'warning') return 'warning';
  if (status === 'lead' || status === 'contacted' || status === 'trial_booked') return 'info';
  return 'success';
};

const primaryAssetForMember = (member: Member, assets: MemberAsset[]): MemberAsset | undefined => {
  const fromMember = member.assets?.filter(a => a.memberId === member.id) ?? [];
  const fromList = assets.filter(a => a.memberId === member.id);
  const merged = fromMember.length > 0 ? fromMember : fromList;
  if (merged.length === 0) return undefined;
  const effectiveFirst = merged.find(a => a.status === 'effective');
  return effectiveFirst ?? merged[0];
};

const formatRemaining = (asset: MemberAsset): string => {
  if (typeof asset.remainingAmount !== 'number') return '暂未记录';
  const n = asset.remainingAmount;
  switch (asset.balanceType) {
    case 'value':
      return `余 ¥${n.toLocaleString()}`;
    case 'points':
      return `余 ${n} 积分`;
    case 'time':
      return `余 ${n} 天`;
    case 'course':
      return `余 ${n} 课时`;
    default:
      return `余 ${n} 次`;
  }
};

const isLowBalance = (asset: MemberAsset): boolean => {
  if (typeof asset.remainingAmount !== 'number') return false;
  if (!['count', 'points', 'course'].includes(asset.balanceType)) return false;
  return asset.remainingAmount <= 3;
};

const buildRiskTagsCore = (input: {
  member: Member;
  asset?: MemberAsset;
  lastAttendanceMs: number | null;
  lifecycle: MemberLifecycleStatus;
}): string[] => {
  const { member, asset, lastAttendanceMs, lifecycle } = input;
  const ordered: string[] = [];

  const churnRisk = lifecycle === 'churned'
    || lifecycle === 'inactive'
    || lifecycle === 'warning'
    || member.riskTag === 'churn';
  if (churnRisk) ordered.push('流失风险');

  let soonExpire = false;
  const expiry = asset?.expiryDate ? safeParseDate(asset.expiryDate) : null;
  if (expiry) {
    const d = daysFromNow(expiry);
    if (d >= 0 && d <= 30) soonExpire = true;
  }
  if (member.riskTag === 'expiry') soonExpire = true;
  if (soonExpire) ordered.push('即将到期');

  let lowBal = false;
  if (asset && isLowBalance(asset)) lowBal = true;
  if (member.riskTag === 'balance') lowBal = true;
  if (lowBal) ordered.push('余额不足');

  let longAbsent = false;
  if (lastAttendanceMs == null) longAbsent = true;
  else if ((Date.now() - lastAttendanceMs) / MS_PER_DAY >= 30) longAbsent = true;
  if (member.riskTag === 'sleep') longAbsent = true;
  if (longAbsent) ordered.push('长期未到课');

  const needsFollow = soonExpire || lowBal || longAbsent;
  if (needsFollow && ordered.length < 3 && !ordered.includes('待跟进')) {
    ordered.push('待跟进');
  }

  return ordered.slice(0, 3);
};

const computeNextAction = (input: {
  member: Member;
  rawRiskTags: string[];
  hasPendingContract: boolean;
  hasPendingPayment: boolean;
}): string => {
  if (input.hasPendingContract) return '合同确认';
  if (input.hasPendingPayment) return '续费跟进';
  if (input.rawRiskTags.includes('即将到期') || input.rawRiskTags.includes('余额不足')) return '续费跟进';
  if (input.rawRiskTags.includes('长期未到课')) return '到课唤醒';
  if (input.rawRiskTags.includes('流失风险')) return '续费跟进';
  if ((input.member.assets?.length ?? 0) > 1) return '权益说明';
  return '查看详情';
};

export const buildMemberListRows = (input: MemberListRowsInput): MemberListRow[] => {
  const {
    members,
    memberAssets,
    bookings,
    attendances,
    consumptions,
    orders,
    contracts,
    courseSessions,
    courses,
  } = input;

  return members.map((member) => {
    const lifecycle = getMemberLifecycleStatus(member);
    const stageView = getMemberLifecyclePresentation(member);
    const asset = primaryAssetForMember(member, memberAssets);

    const mainAssetLabel = asset?.name ?? '暂无会员资产';
    const remainingLabel = asset ? formatRemaining(asset) : '暂未记录';
    let expireLabel = '暂未记录';
    let expireRiskLabel = '';
    if (asset?.expiryDate) {
      const exp = safeParseDate(asset.expiryDate);
      if (exp) {
        expireLabel = asset.expiryDate.slice(0, 10);
        const d = daysFromNow(exp);
        if (d >= 0 && d <= 30) expireRiskLabel = '近30日内到期';
      }
    }

    const memberAtts = attendances.filter(a => a.memberId === member.id);
    const real = memberAtts.filter(isRealAttendance);
    let lastAttendanceMs: number | null = null;
    real.forEach((a) => {
      const t = attendanceActivityTime(a);
      const ms = safeParseDate(t)?.getTime();
      if (ms != null && (!lastAttendanceMs || ms > lastAttendanceMs)) lastAttendanceMs = ms;
    });

    let lastAttendanceLabel = '暂无到课记录';
    if (real.length > 0 && lastAttendanceMs != null) {
      const latest = real.reduce((best, cur) => {
        const tb = safeParseDate(attendanceActivityTime(cur))?.getTime() ?? 0;
        const bb = safeParseDate(attendanceActivityTime(best))?.getTime() ?? 0;
        return tb > bb ? cur : best;
      }, real[0]);
      const title = getSessionTitle(courseSessions, courses, latest.courseSessionId);
      const when = formatListDate(attendanceActivityTime(latest));
      lastAttendanceLabel = `最近到课：${title} / ${when}`;
    } else {
      const memberBooks = bookings.filter(b => b.memberId === member.id);
      const latestBook = memberBooks.reduce<{ b: Booking; t: number } | null>((acc, b) => {
        const ms = safeParseDate(b.bookedAt)?.getTime();
        if (ms == null) return acc;
        if (!acc || ms > acc.t) return { b, t: ms };
        return acc;
      }, null);
      if (latestBook) {
        const title = getSessionTitle(courseSessions, courses, latestBook.b.courseSessionId);
        const when = formatListDate(latestBook.b.bookedAt);
        lastAttendanceLabel = `最近预约：${title} / ${when}`;
      }
    }

    let lastConsumptionLabel = '暂无耗课记录';
    const memberCons = consumptions.filter(c => c.memberId === member.id);
    if (memberCons.length > 0) {
      const latest = memberCons.reduce((best, c) => {
        const tb = safeParseDate(c.consumedAt)?.getTime() ?? 0;
        const bb = safeParseDate(best.consumedAt)?.getTime() ?? 0;
        return tb > bb ? c : best;
      });
      const title = latest.courseTitle?.trim()
        ? latest.courseTitle.trim()
        : getSessionTitle(courseSessions, courses, latest.courseSessionId);
      const when = formatListDate(latest.consumedAt);
      lastConsumptionLabel = `最近耗课：${title} / ${when}`;
    }

    const ownerLabel = member.manager?.trim() ? member.manager : '暂未分配';
    const teacherLabel = member.privateTeachers && member.privateTeachers.length > 0
      ? member.privateTeachers[0]
      : '暂未分配';

    const rawRiskTags = buildRiskTagsCore({ member, asset, lastAttendanceMs, lifecycle });
    const riskTags = rawRiskTags.length > 0 ? rawRiskTags : ['暂无明显风险'];

    const hasPendingContract = contracts.some(
      c => c.memberId === member.id && c.status === 'pending_signature',
    );
    const hasPendingPayment = orders.some(
      o => o.memberId === member.id && o.status === 'pending_payment',
    );
    const nextActionLabel = computeNextAction({
      member,
      rawRiskTags: buildRiskTagsCore({ member, asset, lastAttendanceMs, lifecycle }),
      hasPendingContract,
      hasPendingPayment,
    });

    return {
      memberId: member.id,
      name: member.name,
      phoneMasked: maskPhone(member.phone),
      lifecycleLabel: stageView.label,
      lifecycleTone: lifecycleToTone(lifecycle),
      mainAssetLabel,
      remainingLabel,
      expireLabel,
      expireRiskLabel,
      lastAttendanceLabel,
      lastConsumptionLabel,
      ownerLabel,
      teacherLabel,
      riskTags,
      nextActionLabel,
    };
  });
};
