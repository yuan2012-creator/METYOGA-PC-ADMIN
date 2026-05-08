import type {
  Attendance,
  Booking,
  Course,
  CourseSession,
  FinanceLedgerEntry,
  Member,
  Order,
  Payment,
  Refund,
  TimelineEvent,
} from '../types';

export type MemberDetailTimelineSourceType =
  | 'legacy_timeline'
  | 'order'
  | 'booking'
  | 'attendance'
  | 'refund';

export type MemberDetailTimelineItem = TimelineEvent & {
  sourceType: MemberDetailTimelineSourceType;
  sourceId: string;
  occurredAt?: string;
};

export interface MemberDetailBusinessRecordSlot {
  id: 'course' | 'consumption';
  title: string;
  description: string;
  iconClass: string;
  toneClass: string;
  metrics: { label: string; value: string }[];
}

export interface MemberDetailRecordInput {
  member: Member;
  bookings: Booking[];
  attendances: Attendance[];
  courseSessions: CourseSession[];
  courses: Course[];
  orders: Order[];
  payments: Payment[];
  refunds: Refund[];
  ledgerEntries: FinanceLedgerEntry[];
}

export interface MemberBusinessRecordSummary {
  courseRecordText: string;
  courseSourceLabel: string;
  consumptionRecordText: string;
  consumptionSourceLabel: string;
  completedClassCount: number;
  bookingCount: number;
  orderCount: number;
  paidTotal: number;
  refundTotal: number;
  recognizedCourseIncome: number;
  hasCourseDomainData: boolean;
  hasConsumptionDomainData: boolean;
}

const COURSE_ATTENDANCE_STATUSES: Attendance['status'][] = ['checked_in', 'attended', 'consumed'];
const EFFECTIVE_PAYMENT_STATUSES: Payment['status'][] = ['paid', 'reconciled'];
const COMPLETED_REFUND_STATUSES: Refund['status'][] = ['completed'];

const formatDateTime = (iso?: string): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getSession = (courseSessions: CourseSession[], sessionId: string): CourseSession | undefined => (
  courseSessions.find(session => session.id === sessionId)
);

const getCourse = (courses: Course[], courseId?: string): Course | undefined => (
  courseId ? courses.find(course => course.id === courseId) : undefined
);

const getSessionTitle = (
  courseSessions: CourseSession[],
  courses: Course[],
  sessionId: string
): string => {
  const session = getSession(courseSessions, sessionId);
  const course = getCourse(courses, session?.courseId);
  return session?.title ?? course?.name ?? '课程场次';
};

const getAttendanceTime = (attendance: Attendance): string | undefined => (
  attendance.consumedAt ?? attendance.attendedAt ?? attendance.checkedInAt
);

const getOrderPaymentTotal = (orderId: string, payments: Payment[]): number => (
  payments
    .filter(payment => payment.orderId === orderId && EFFECTIVE_PAYMENT_STATUSES.includes(payment.status))
    .reduce((sum, payment) => sum + payment.amount, 0)
);

const toAttendanceTimeline = (
  attendance: Attendance,
  courseSessions: CourseSession[],
  courses: Course[]
): MemberDetailTimelineItem => {
  const title = getSessionTitle(courseSessions, courses, attendance.courseSessionId);
  const eventTime = getAttendanceTime(attendance);

  return {
    id: `attendance-${attendance.id}`,
    type: attendance.status === 'checked_in' ? 'check_in' : 'class',
    title: attendance.status === 'consumed' ? `完成课程：${title}` : `到课记录：${title}`,
    date: formatDateTime(eventTime),
    occurredAt: eventTime,
    content: attendance.memberAssetId
      ? `已关联会员资产 ${attendance.memberAssetId}，状态：${attendance.status}。`
      : `课程到课状态：${attendance.status}。`,
    sourceType: 'attendance',
    sourceId: attendance.id,
  };
};

const toBookingTimeline = (
  booking: Booking,
  courseSessions: CourseSession[],
  courses: Course[]
): MemberDetailTimelineItem => {
  const title = getSessionTitle(courseSessions, courses, booking.courseSessionId);
  const isCancelled = booking.status === 'cancelled' || booking.status === 'late_cancelled';

  return {
    id: `booking-${booking.id}`,
    type: 'class',
    title: isCancelled ? `取消预约：${title}` : `预约课程：${title}`,
    date: formatDateTime(booking.cancelledAt ?? booking.bookedAt),
    occurredAt: booking.cancelledAt ?? booking.bookedAt,
    content: isCancelled
      ? `预约状态：${booking.status}${booking.cancelReason ? `，原因：${booking.cancelReason}` : ''}。`
      : `预约来源：${booking.source ?? 'unknown'}，状态：${booking.status}。`,
    sourceType: 'booking',
    sourceId: booking.id,
  };
};

const toOrderTimeline = (order: Order, payments: Payment[]): MemberDetailTimelineItem => {
  const paidAmount = getOrderPaymentTotal(order.id, payments) || order.paidAmount || order.totalAmount;
  const itemNames = order.items.map(item => item.productName).join(' / ');

  return {
    id: `order-${order.id}`,
    type: 'purchase',
    title: `购买：${itemNames || order.id}`,
    date: formatDateTime(order.createdAt),
    occurredAt: order.createdAt,
    content: `订单状态：${order.status}，支付金额 ¥${paidAmount.toLocaleString()}。`,
    amount: paidAmount,
    sourceType: 'order',
    sourceId: order.id,
  };
};

const toRefundTimeline = (refund: Refund): MemberDetailTimelineItem => ({
  id: `refund-${refund.id}`,
  type: 'purchase',
  title: '退款记录',
  date: formatDateTime(refund.completedAt ?? refund.approvedAt ?? refund.requestedAt),
  occurredAt: refund.completedAt ?? refund.approvedAt ?? refund.requestedAt,
  content: `${refund.reason ?? '订单退款'}，状态：${refund.status}。`,
  amount: -refund.amount,
  sourceType: 'refund',
  sourceId: refund.id,
});

const toLegacyTimeline = (event: TimelineEvent): MemberDetailTimelineItem => ({
  ...event,
  sourceType: 'legacy_timeline',
  sourceId: event.id,
});

export const buildMemberDetailTimelineItems = ({
  member,
  bookings,
  attendances,
  courseSessions,
  courses,
  orders,
  payments,
  refunds,
}: MemberDetailRecordInput): MemberDetailTimelineItem[] => {
  const memberAttendances = attendances.filter(attendance => attendance.memberId === member.id);
  const attendanceBookingIds = new Set(memberAttendances.map(attendance => attendance.bookingId).filter(Boolean));
  const memberBookings = bookings.filter(booking => (
    booking.memberId === member.id && !attendanceBookingIds.has(booking.id)
  ));
  const memberOrders = orders.filter(order => order.memberId === member.id);
  const memberRefunds = refunds.filter(refund => refund.memberId === member.id);

  const domainTimeline = [
    ...memberAttendances.map(attendance => toAttendanceTimeline(attendance, courseSessions, courses)),
    ...memberBookings.map(booking => toBookingTimeline(booking, courseSessions, courses)),
    ...memberOrders.map(order => toOrderTimeline(order, payments)),
    ...memberRefunds.map(toRefundTimeline),
  ];

  const legacyTimeline = member.timeline.map(toLegacyTimeline);
  const legacyFallback = domainTimeline.length > 0
    ? legacyTimeline.filter(event => event.type === 'follow_up' || event.type === 'phase_report' || event.type === 'operation' || event.type === 'system')
    : legacyTimeline;

  return [...domainTimeline, ...legacyFallback].sort((a, b) => {
    const aTime = new Date(a.occurredAt ?? a.date).getTime();
    const bTime = new Date(b.occurredAt ?? b.date).getTime();
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
    return bTime - aTime;
  });
};

export const buildMemberBusinessRecordSummary = ({
  member,
  bookings,
  attendances,
  orders,
  payments,
  refunds,
  ledgerEntries,
}: MemberDetailRecordInput): MemberBusinessRecordSummary => {
  const memberBookings = bookings.filter(booking => booking.memberId === member.id);
  const memberAttendances = attendances.filter(attendance => attendance.memberId === member.id);
  const completedAttendances = memberAttendances.filter(attendance => COURSE_ATTENDANCE_STATUSES.includes(attendance.status));
  const memberOrders = orders.filter(order => order.memberId === member.id);
  const memberPayments = payments.filter(payment => payment.memberId === member.id && EFFECTIVE_PAYMENT_STATUSES.includes(payment.status));
  const memberRefunds = refunds.filter(refund => refund.memberId === member.id && COMPLETED_REFUND_STATUSES.includes(refund.status));
  const memberLedgerEntries = ledgerEntries.filter(entry => entry.memberId === member.id);
  const recognizedCourseIncome = memberLedgerEntries
    .filter(entry => entry.sourceType === 'course_consumption' && entry.direction === 'liability_decrease')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const paidTotal = memberPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const refundTotal = memberRefunds.reduce((sum, refund) => sum + refund.amount, 0);
  const hasCourseDomainData = memberBookings.length > 0 || memberAttendances.length > 0;
  const hasConsumptionDomainData = memberOrders.length > 0 || memberPayments.length > 0 || memberRefunds.length > 0;

  return {
    courseRecordText: hasCourseDomainData
      ? `${completedAttendances.length} 到课 / ${memberBookings.length} 预约`
      : `${member.totalClasses} 累计课程`,
    courseSourceLabel: hasCourseDomainData
      ? 'Booking / Attendance'
      : 'Fallback: member.totalClasses',
    consumptionRecordText: hasConsumptionDomainData
      ? `¥${paidTotal.toLocaleString()} / ${memberOrders.length} 单`
      : `¥${member.totalLTV.toLocaleString()} LTV`,
    consumptionSourceLabel: hasConsumptionDomainData
      ? (refundTotal > 0 ? `Refund ¥${refundTotal.toLocaleString()}` : `Ledger ¥${recognizedCourseIncome.toLocaleString()}`)
      : 'Fallback: member.totalLTV',
    completedClassCount: completedAttendances.length,
    bookingCount: memberBookings.length,
    orderCount: memberOrders.length,
    paidTotal,
    refundTotal,
    recognizedCourseIncome,
    hasCourseDomainData,
    hasConsumptionDomainData,
  };
};

export const buildMemberDetailBusinessRecordSlots = (
  input: MemberDetailRecordInput
): MemberDetailBusinessRecordSlot[] => {
  const { member } = input;
  const summary = buildMemberBusinessRecordSummary(input);

  return [
    {
      id: 'course',
      title: '课程记录',
      description: summary.hasCourseDomainData
        ? '来自 Booking / Attendance / CourseSession'
        : 'Fallback：当前会员累计课程字段',
      iconClass: 'fa-solid fa-calendar-check',
      toneClass: 'bg-gray-900 text-white',
      metrics: [
        { label: summary.hasCourseDomainData ? '已到课/消课' : '累计上课', value: `${summary.hasCourseDomainData ? summary.completedClassCount : member.totalClasses} 节` },
        { label: '预约记录', value: `${summary.bookingCount} 条` },
      ],
    },
    {
      id: 'consumption',
      title: '消费记录',
      description: summary.hasConsumptionDomainData
        ? '来自 Order / Payment / Refund / Ledger'
        : 'Fallback：当前会员 LTV 与积分字段',
      iconClass: 'fa-solid fa-receipt',
      toneClass: 'bg-white text-gray-900 border border-gray-200',
      metrics: [
        { label: summary.hasConsumptionDomainData ? '实收金额' : '累计消费', value: `¥${(summary.hasConsumptionDomainData ? summary.paidTotal : member.totalLTV).toLocaleString()}` },
        { label: summary.refundTotal > 0 ? '退款/确认收入' : '订单/确认收入', value: summary.refundTotal > 0 ? `¥${summary.refundTotal.toLocaleString()} / ¥${summary.recognizedCourseIncome.toLocaleString()}` : `${summary.orderCount} 单 / ¥${summary.recognizedCourseIncome.toLocaleString()}` },
      ],
    },
  ];
};

export const getMemberDetailTimelineSourceLabel = (sourceType: MemberDetailTimelineSourceType): string => {
  switch (sourceType) {
    case 'legacy_timeline':
      return 'Legacy timeline fallback';
    case 'order':
      return '订单';
    case 'booking':
      return '预约';
    case 'attendance':
      return '签到/到课';
    case 'refund':
      return '退款';
    default:
      return '业务记录';
  }
};
