import type {
  Attendance,
  Booking,
  Contract,
  Course,
  CourseSession,
  Member,
  MemberAsset,
  MemberAssetStatus,
  MemberCard,
  MockCourseConsumptionRecord,
  Order,
  Payment,
  Refund,
  TimelineEvent,
} from '../types';
import { getMemberLifecycleLabel } from './memberLifecycle';
import { buildMemberListRows } from './memberListSelectors';
import { getMemberLifecyclePresentation } from './memberPresentation';

const ASSET_STATUS_LABELS: Record<MemberAssetStatus, string> = {
  inactive: '未生效',
  effective: '使用中',
  frozen: '冻结中',
  expired: '已过期',
  used_up: '已用完',
  transferred: '已转卡',
  upgraded: '已升级',
  cancelled: '已取消',
};

const BOOKING_STATUS_LABELS: Record<Booking['status'], string> = {
  booked: '已预约',
  waitlisted: '排队中',
  cancelled: '已取消',
  late_cancelled: '超时取消',
  no_show: '未到课',
};

const ATTENDANCE_STATUS_LABELS: Record<Attendance['status'], string> = {
  pending_checkin: '待签到',
  checked_in: '已签到',
  attended: '已到课',
  consumed: '已耗课',
  absent: '缺席',
};

const BOOKING_SOURCE_LABELS: Record<NonNullable<Booking['source']>, string> = {
  admin: '后台',
  front_desk: '前台',
  member_app: '会员端',
  system: '系统',
};

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  draft: '草稿',
  pending_payment: '待支付',
  paid: '已支付',
  fulfilled: '已履约',
  closed: '已关闭',
  cancelled: '已取消',
  partially_refunded: '部分退款',
  refunded: '已退款',
};

const CONTRACT_STATUS_LABELS: Record<Contract['status'], string> = {
  draft: '草稿',
  pending_signature: '待签署',
  signed: '已签署',
  effective: '已生效',
  voided: '已作废',
  expired: '已过期',
  terminated: '已终止',
};

const PRODUCT_TYPE_LABELS: Record<NonNullable<MemberAsset['productType']>, string> = {
  card: '会员卡',
  ttc: '教培项目',
  point: '积分包',
  course: '课程包',
  custom: '定制权益',
};

const REFUND_STATUS_LABELS: Record<Refund['status'], string> = {
  requested: '已申请',
  reviewing: '审核中',
  approved: '已通过',
  processing: '处理中',
  completed: '已完成',
  rejected: '已拒绝',
  cancelled: '已撤销',
};

const EFFECTIVE_PAYMENT_STATUSES: Payment['status'][] = ['paid', 'reconciled'];

const safeParse = (iso?: string): Date | null => {
  if (!iso || !String(iso).trim()) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (iso?: string): string => {
  const d = safeParse(iso);
  if (!d) return '暂未记录';
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getSession = (sessions: CourseSession[], id: string) => sessions.find(s => s.id === id);
const getCourse = (courses: Course[], id?: string) => (id ? courses.find(c => c.id === id) : undefined);

const sessionTitle = (sessions: CourseSession[], courses: Course[], sessionId: string): string => {
  const s = getSession(sessions, sessionId);
  const c = getCourse(courses, s?.courseId);
  return s?.title ?? c?.name ?? '课程场次';
};

const orderPaidTotal = (orderId: string, payments: Payment[]): number => (
  payments
    .filter(p => p.orderId === orderId && EFFECTIVE_PAYMENT_STATUSES.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0)
);

const buildOrderLinksDisplay = (
  order: Order,
  contracts: Contract[],
  memberAssets: MemberAsset[],
): string => {
  const parts: string[] = [];
  const products = order.items.map(i => i.productName).filter(Boolean).join('、');
  if (products) parts.push(`订单产品：${products}`);
  if (order.contractId) {
    const ct = contracts.find(c => c.id === order.contractId);
    if (ct?.title?.trim()) parts.push(`关联合同：${ct.title.trim()}`);
    else parts.push('关联合同：暂未记录');
  }
  const assetNames = new Set<string>();
  for (const it of order.items) {
    if (!it.memberAssetId) continue;
    const a = memberAssets.find(x => x.id === it.memberAssetId);
    if (a?.name?.trim()) assetNames.add(a.name.trim());
  }
  if (assetNames.size > 0) parts.push(`关联资产：${[...assetNames].join('、')}`);
  return parts.length > 0 ? parts.join('；') : '暂未记录';
};

const formatAssetBalance = (asset: MemberAsset): string => {
  if (typeof asset.remainingAmount !== 'number') return ASSET_STATUS_LABELS[asset.status];
  const amount = asset.remainingAmount;
  switch (asset.balanceType) {
    case 'value':
      return `余 ¥${amount.toLocaleString()}`;
    case 'points':
      return `余 ${amount} 积分`;
    case 'time':
      return `余 ${amount} 天`;
    case 'course':
      return `余 ${amount} 课时`;
    case 'count':
    default:
      return `余 ${amount} 次`;
  }
};

const formatCardBalance = (card: MemberCard): string => card.balance;

const assetsPool = (member: Member, memberAssets: MemberAsset[]): MemberAsset[] => {
  const fromMember = member.assets?.filter(a => a.memberId === member.id) ?? [];
  const fromList = memberAssets.filter(a => a.memberId === member.id);
  if (fromMember.length > 0) return fromMember;
  if (fromList.length > 0) return fromList;
  return [];
};

const attendanceTime = (a: Attendance): string | undefined => (
  a.consumedAt ?? a.attendedAt ?? a.checkedInAt
);

export interface MemberDetailOverviewVM {
  name: string;
  phoneMasked: string;
  lifecycleLabel: string;
  memberSegmentLabel: string;
  memberSourceLabel: string;
  ownerLabel: string;
  teacherLabel: string;
  lastAttendanceLine: string;
  lastConsumptionLine: string;
  mainAssetLabel: string;
  riskTags: string[];
  nextActionLabel: string;
}

export interface MemberDetailAssetRowVM {
  id: string;
  name: string;
  remainingDisplay: string;
  expiryDisplay: string;
  statusLabel: string;
  orderRef: string;
  contractRef: string;
  applicabilityDisplay: string;
}

export interface MemberDetailBookingAttendanceRowVM {
  id: string;
  courseName: string;
  sessionStartDisplay: string;
  teacherName: string;
  bookingStatusDisplay: string;
  attendanceStatusDisplay: string;
  checkInOrArrivalDisplay: string;
  sourceLine: string;
}

export interface MemberDetailConsumptionRowVM {
  id: string;
  courseName: string;
  consumedAtDisplay: string;
  deductDisplay: string;
  sourceDisplay: string;
  statusDisplay: string;
}

export interface MemberDetailOrderRowVM {
  id: string;
  orderLabel: string;
  productSummary: string;
  payAmountDisplay: string;
  payStatusDisplay: string;
  contractNameDisplay: string;
  contractStatusDisplay: string;
  signedAtDisplay: string;
  linksDisplay: string;
}

export interface MemberDetailContractRowVM {
  id: string;
  titleDisplay: string;
  statusDisplay: string;
  signedAtDisplay: string;
  orderRef: string;
}

export interface MemberDetailRefundRowVM {
  id: string;
  amountDisplay: string;
  statusDisplay: string;
  timeDisplay: string;
  reasonDisplay: string;
}

export interface MemberDetailFollowItemVM {
  id: string;
  dateDisplay: string;
  title: string;
  content: string;
  staffDisplay: string;
}

export interface MemberDetailRiskAndFollowupVM {
  riskTags: string[];
  riskReasonLines: string[];
  nextActionLabel: string;
  ownerLabel: string;
  followUps: MemberDetailFollowItemVM[];
  pendingLines: string[];
  strategyHint: string;
}

export interface MemberDetailViewModel {
  overview: MemberDetailOverviewVM;
  assets: MemberDetailAssetRowVM[];
  bookingAttendanceRows: MemberDetailBookingAttendanceRowVM[];
  consumptionRows: MemberDetailConsumptionRowVM[];
  orderRows: MemberDetailOrderRowVM[];
  contractRows: MemberDetailContractRowVM[];
  refundRows: MemberDetailRefundRowVM[];
  riskAndFollowup: MemberDetailRiskAndFollowupVM;
}

export interface BuildMemberDetailViewModelInput {
  member: Member;
  memberAssets: MemberAsset[];
  bookings: Booking[];
  attendances: Attendance[];
  consumptions: MockCourseConsumptionRecord[];
  orders: Order[];
  contracts: Contract[];
  payments: Payment[];
  refunds: Refund[];
  courseSessions: CourseSession[];
  courses: Course[];
}

const riskReasonForTag = (tag: string): string | null => {
  switch (tag) {
    case '流失风险':
      return '生命周期或经营信号提示存在流失或沉睡可能，需要重点回访。';
    case '即将到期':
      return '会员卡或权益临近有效期，建议提前沟通续费或升级方案。';
    case '余额不足':
      return '剩余次数、课时或积分偏低，建议安排续费或加购。';
    case '长期未到课':
      return '近期缺少到课记录，建议唤醒约课并了解原因。';
    case '待跟进':
      return '存在待处理的续费、合同或回访事项，请安排专人跟进。';
    case '暂无明显风险':
      return null;
    default:
      return null;
  }
};

const buildRiskReasonLines = (tags: string[]): string[] => {
  const lines: string[] = [];
  for (const t of tags) {
    const line = riskReasonForTag(t);
    if (line && !lines.includes(line)) lines.push(line);
  }
  return lines;
};

export const buildMemberDetailViewModel = (input: BuildMemberDetailViewModelInput): MemberDetailViewModel => {
  const {
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
  } = input;

  const listRow = buildMemberListRows({
    members: [member],
    memberAssets,
    bookings,
    attendances,
    consumptions,
    orders,
    contracts,
    courseSessions,
    courses,
  })[0];

  const ownerLabel = listRow?.ownerLabel ?? '暂未分配';
  const teacherLabel = listRow?.teacherLabel ?? '暂未分配';

  const overview: MemberDetailOverviewVM = {
    name: member.name,
    phoneMasked: listRow?.phoneMasked ?? member.phone,
    lifecycleLabel: listRow?.lifecycleLabel ?? getMemberLifecyclePresentation(member).label,
    memberSegmentLabel: getMemberLifecycleLabel(member),
    memberSourceLabel: '暂未记录',
    ownerLabel,
    teacherLabel,
    lastAttendanceLine: listRow?.lastAttendanceLabel ?? '暂无到课记录',
    lastConsumptionLine: listRow?.lastConsumptionLabel ?? '暂无耗课记录',
    mainAssetLabel: listRow?.mainAssetLabel ?? '暂无会员资产',
    riskTags: listRow?.riskTags ?? ['暂无明显风险'],
    nextActionLabel: listRow?.nextActionLabel ?? '查看详情',
  };

  const pool = assetsPool(member, memberAssets);
  let assets: MemberDetailAssetRowVM[] = pool.map((asset) => ({
    id: asset.id,
    name: asset.name,
    remainingDisplay: formatAssetBalance(asset),
    expiryDisplay: asset.expiryDate ? `${asset.expiryDate.slice(0, 10)} 到期` : '暂未记录',
    statusLabel: ASSET_STATUS_LABELS[asset.status],
    orderRef: asset.sourceOrderId ?? '暂未记录',
    contractRef: asset.contractId ?? '暂未记录',
    applicabilityDisplay: asset.productType
      ? `适用类型：${PRODUCT_TYPE_LABELS[asset.productType]}`
      : '暂未记录',
  }));

  if (assets.length === 0 && member.cards.length > 0) {
    assets = member.cards.map((card, idx) => ({
      id: `card-${idx}-${card.name}`,
      name: card.name,
      remainingDisplay: formatCardBalance(card),
      expiryDisplay: `${card.expiry} 到期`,
      statusLabel: card.status === 'active' ? '使用中' : card.status === 'expiring' ? '即将过期' : '已过期',
      orderRef: '暂未记录',
      contractRef: '暂未记录',
      applicabilityDisplay: '暂未记录',
    }));
  }

  const memberBookings = bookings.filter(b => b.memberId === member.id);
  const memberAttendances = attendances.filter(a => a.memberId === member.id);
  const bookingById = new Map(memberBookings.map(b => [b.id, b]));
  const bookingIdsWithAttendance = new Set(
    memberAttendances.map(a => a.bookingId).filter(Boolean) as string[],
  );

  const toBaRow = (
    sessionId: string,
    booking: Booking | undefined,
    att: Attendance | undefined,
  ): MemberDetailBookingAttendanceRowVM => {
    const session = getSession(courseSessions, sessionId);
    const courseName = sessionTitle(courseSessions, courses, sessionId);
    const startIso = session?.startAt;
    const teacherName = session?.teacherName?.trim() ? session.teacherName : '暂未记录';
    const bookingStatus = booking ? BOOKING_STATUS_LABELS[booking.status] : '暂未记录';
    const attendanceStatus = att ? ATTENDANCE_STATUS_LABELS[att.status] : '暂无到课记录';
    let checkInOrArrival = '暂未记录';
    if (att) {
      const t = attendanceTime(att);
      checkInOrArrival = t ? formatDateTime(t) : '暂未记录';
    }
    let sourceLine = '暂未记录';
    if (booking?.source) {
      sourceLine = BOOKING_SOURCE_LABELS[booking.source] ?? '暂未记录';
    }

    return {
      id: att?.id ?? booking?.id ?? `ba-${sessionId}`,
      courseName,
      sessionStartDisplay: startIso ? formatDateTime(startIso) : '暂未记录',
      teacherName,
      bookingStatusDisplay: bookingStatus,
      attendanceStatusDisplay: attendanceStatus,
      checkInOrArrivalDisplay: checkInOrArrival,
      sourceLine,
    };
  };

  const baWithSort: { row: MemberDetailBookingAttendanceRowVM; sortKey: number }[] = [];
  for (const att of memberAttendances) {
    const book = att.bookingId ? bookingById.get(att.bookingId) : undefined;
    const session = getSession(courseSessions, att.courseSessionId);
    const sk = safeParse(session?.startAt ?? attendanceTime(att) ?? book?.bookedAt)?.getTime() ?? 0;
    baWithSort.push({ row: toBaRow(att.courseSessionId, book, att), sortKey: sk });
  }
  for (const book of memberBookings) {
    if (bookingIdsWithAttendance.has(book.id)) continue;
    const session = getSession(courseSessions, book.courseSessionId);
    const sk = safeParse(session?.startAt ?? book.bookedAt)?.getTime() ?? 0;
    baWithSort.push({ row: toBaRow(book.courseSessionId, book, undefined), sortKey: sk });
  }
  baWithSort.sort((a, b) => b.sortKey - a.sortKey);
  const bookingAttendanceRows = baWithSort.map(x => x.row);

  const consumptionRows: MemberDetailConsumptionRowVM[] = consumptions
    .filter(c => c.memberId === member.id)
    .slice()
    .sort((a, b) => {
      const ta = safeParse(a.consumedAt)?.getTime() ?? 0;
      const tb = safeParse(b.consumedAt)?.getTime() ?? 0;
      return tb - ta;
    })
    .map((c) => {
      const title = c.courseTitle?.trim()
        ? c.courseTitle.trim()
        : sessionTitle(courseSessions, courses, c.courseSessionId);
      const amt = typeof c.amount === 'number' ? `扣减 ${c.amount}` : '暂未记录';
      return {
        id: c.id,
        courseName: title,
        consumedAtDisplay: formatDateTime(c.consumedAt),
        deductDisplay: amt,
        sourceDisplay: '课程场次',
        statusDisplay: '耗课已登记',
      };
    });

  const memberOrders = orders.filter(o => o.memberId === member.id);
  const orderRows: MemberDetailOrderRowVM[] = memberOrders.map((order) => {
    const paid = orderPaidTotal(order.id, payments) || order.paidAmount || order.totalAmount;
    const contract = order.contractId
      ? contracts.find(c => c.id === order.contractId)
      : undefined;
    const productSummary = order.items.map(i => i.productName).join('、') || '暂未记录';
    const payStatus = paid >= order.totalAmount
      ? '已支付'
      : (ORDER_STATUS_LABELS[order.status] ?? '暂未识别');
    return {
      id: order.id,
      orderLabel: order.id,
      productSummary,
      payAmountDisplay: `¥${paid.toLocaleString()}`,
      payStatusDisplay: payStatus,
      contractNameDisplay: contract?.title ?? '暂未记录',
      contractStatusDisplay: contract
        ? (CONTRACT_STATUS_LABELS[contract.status] ?? '暂未识别')
        : '暂未记录',
      signedAtDisplay: contract?.signedAt ? formatDateTime(contract.signedAt) : '暂未记录',
      linksDisplay: buildOrderLinksDisplay(order, contracts, memberAssets),
    };
  });

  const contractRows: MemberDetailContractRowVM[] = contracts
    .filter(c => c.memberId === member.id)
    .map((c) => ({
      id: c.id,
      titleDisplay: c.title?.trim() ? c.title.trim() : '暂未记录',
      statusDisplay: CONTRACT_STATUS_LABELS[c.status] ?? '暂未识别',
      signedAtDisplay: c.signedAt ? formatDateTime(c.signedAt) : '暂未记录',
      orderRef: (() => {
        if (!c.orderId) return '暂未记录';
        const linked = orders.find(o => o.id === c.orderId);
        const names = linked?.items.map(i => i.productName).filter(Boolean).join('、');
        return names || '暂未记录';
      })(),
    }));

  const refundRows: MemberDetailRefundRowVM[] = refunds
    .filter(r => r.memberId === member.id)
    .map((r) => ({
      id: r.id,
      amountDisplay: `¥${r.amount.toLocaleString()}`,
      statusDisplay: REFUND_STATUS_LABELS[r.status] ?? '暂未识别',
      timeDisplay: formatDateTime(r.completedAt ?? r.approvedAt ?? r.requestedAt),
      reasonDisplay: r.reason?.trim() ? r.reason : '暂未记录',
    }));

  const followUps: MemberDetailFollowItemVM[] = member.timeline
    .filter((e: TimelineEvent) => e.type === 'follow_up')
    .map((e: TimelineEvent) => ({
      id: e.id,
      dateDisplay: e.date,
      title: e.title,
      content: e.content,
      staffDisplay: e.staff ?? '暂未记录',
    }));

  const pendingLines: string[] = [];
  const hasPendingContract = contracts.some(
    c => c.memberId === member.id && c.status === 'pending_signature',
  );
  const hasPendingPayment = memberOrders.some(o => o.status === 'pending_payment');
  if (hasPendingContract) pendingLines.push('存在待签署合同，请及时跟进签署进度。');
  if (hasPendingPayment) pendingLines.push('存在待支付订单，请确认收款与对账。');

  const lifecyclePresentation = getMemberLifecyclePresentation(member);
  const baseReasons = buildRiskReasonLines(overview.riskTags);
  const riskReasonLines = baseReasons.length > 0
    ? baseReasons
    : (overview.riskTags.length === 1 && overview.riskTags[0] === '暂无明显风险'
      ? []
      : ['请关注该会员的到课、资产与续费情况。']);

  const riskAndFollowup: MemberDetailRiskAndFollowupVM = {
    riskTags: overview.riskTags,
    riskReasonLines,
    nextActionLabel: overview.nextActionLabel,
    ownerLabel,
    followUps,
    pendingLines,
    strategyHint: lifecyclePresentation.strategy,
  };

  return {
    overview,
    assets,
    bookingAttendanceRows,
    consumptionRows,
    orderRows,
    contractRows,
    refundRows,
    riskAndFollowup,
  };
};
