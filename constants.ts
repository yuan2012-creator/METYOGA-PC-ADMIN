
import {
  Attendance,
  Booking,
  CardProduct,
  Contract,
  Course,
  CourseSession,
  FinanceLedgerEntry,
  Member,
  MemberAsset,
  MHSData,
  AlertItem,
  Order,
  Payment,
  PointProduct,
  Refund,
  StageConfig,
  Staff,
  StoreInfo,
  TeamTask,
  TtcProduct,
} from './types';

// P0 canonical card product mock.
// Legacy compatibility: MOCK_CARDS is kept below for pages still importing the old name.
// Legacy compatibility: card rows still keep noShowDeductCurrent for current card editors.
export const MOCK_CARD_PRODUCTS: CardProduct[] = [
  {
    id: 'c1', type: 'stored_value', name: '初遇卡', slogan: '初遇相逢皆有意', guide: '100天的约定\n开启新可能',
    price: 4990, points: 40, openingPoints: 87, exchangeRatio: 0.7,
    validity: 12, validityUnit: 'month', unitPrice: 125, bookingRange: 4,
    cancelFreeLimit: 999, cancelDeductPoints: 0, 
    noShowDeductCurrent: true, noShowDeductPoints: 0, noShowFreezeDays: 0,
    minOpenPeople: 2, checkInPoints: 0, checkInPointsPercent: 5, checkInDailyLimit: 0,
    scope: 'all', functionScope: ['团课', '小班', '私教', '教培', '工作坊'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 12, totalSales: 450, renewalRate: 45, avgConsumptionCycle: 8.5, status: 'active', listingVenues: ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆']
  },
  {
    id: 'c2', type: 'stored_value', name: '锦鲤卡', slogan: '锦鲤跃动皆有运', guide: '逐渐规律',
    price: 11990, points: 96, openingPoints: 300, exchangeRatio: 1,
    validity: 18, validityUnit: 'month', unitPrice: 125, bookingRange: 5,
    cancelFreeLimit: 2, cancelDeductPoints: 0,
    noShowDeductCurrent: true, noShowDeductPoints: 0, noShowFreezeDays: 0,
    minOpenPeople: 2, checkInPoints: 0, checkInPointsPercent: 5, checkInDailyLimit: 0,
    scope: 'all', functionScope: ['团课', '小班', '私教', '教培', '工作坊'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 8, totalSales: 320, renewalRate: 55, avgConsumptionCycle: 7.2, status: 'active', listingVenues: ['万象城馆', '西湖旗舰馆']
  },
  {
    id: 'c3', type: 'stored_value', name: '天选卡', slogan: '天选偶遇皆有喜', guide: '让练习成为习惯',
    price: 19990, points: 160, openingPoints: 600, exchangeRatio: 1.2,
    validity: 24, validityUnit: 'month', unitPrice: 125, bookingRange: 6,
    cancelFreeLimit: 3, cancelDeductPoints: 0,
    noShowDeductCurrent: true, noShowDeductPoints: 0, noShowFreezeDays: 0,
    minOpenPeople: 2, checkInPoints: 0, checkInPointsPercent: 5, checkInDailyLimit: 0,
    scope: 'all', functionScope: ['团课', '小班', '私教', '教培', '工作坊'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 5, totalSales: 150, renewalRate: 65, avgConsumptionCycle: 6.0, status: 'active', listingVenues: ['万象城馆']
  },
  {
    id: 'c4', type: 'stored_value', name: '硬核卡', slogan: '硬核之缘皆有得', guide: '持续投入',
    price: 39990, points: 320, openingPoints: 1500, exchangeRatio: 1.5,
    validity: 30, validityUnit: 'month', unitPrice: 125, bookingRange: 7,
    cancelFreeLimit: 4, cancelDeductPoints: 0,
    noShowDeductCurrent: true, noShowDeductPoints: 0, noShowFreezeDays: 0,
    minOpenPeople: 2, checkInPoints: 0, checkInPointsPercent: 5, checkInDailyLimit: 0,
    scope: 'all', functionScope: ['团课', '小班', '私教', '教培', '工作坊'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 2, totalSales: 80, renewalRate: 75, avgConsumptionCycle: 5.5, status: 'active', listingVenues: ['西湖旗舰馆']
  },
  {
    id: 'c5', type: 'stored_value', name: '自由点卡', slogan: '点动随心皆自在', guide: '好状态就是礼物',
    price: 1390, points: 10, openingPoints: 17, exchangeRatio: 0.5,
    validity: 2, validityUnit: 'month', unitPrice: 139, bookingRange: 3,
    cancelFreeLimit: 5, cancelDeductPoints: 0,
    noShowDeductCurrent: true, noShowDeductPoints: 0, noShowFreezeDays: 0,
    minOpenPeople: 2, checkInPoints: 0, checkInPointsPercent: 5, checkInDailyLimit: 0,
    scope: 'all', functionScope: ['团课', '小班', '私教', '教培', '工作坊'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 25, totalSales: 600, renewalRate: 30, avgConsumptionCycle: 2.0, status: 'active', listingVenues: ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆']
  },
  {
    id: 'c6', type: 'term', name: '普拉提月卡', slogan: '时光之约皆有忆', guide: '练习融入生活',
    price: 3000, openingPoints: 75, exchangeRatio: 1,
    validity: 30, validityUnit: 'day', unitPrice: 100, bookingRange: 3,
    cancelFreeLimit: 1, termCancelPenaltyType: 'freeze_days', cancelFreezeDays: 1,
    noShowDeductCurrent: false, termNoShowPenaltyType: 'freeze_days', noShowFreezeDays: 1,
    minOpenPeople: 3, checkInPoints: 5, checkInPointsPercent: 0, checkInDailyLimit: 10,
    scope: 'single', functionScope: ['小班'],
    leaveMinDays: 0, leaveMaxDays: 0, canExtend: false,
    sales30d: 15, totalSales: 200, renewalRate: 40, avgConsumptionCycle: 1.0, status: 'active', listingVenues: ['西湖旗舰馆']
  },
  {
    id: 'c7', type: 'term', name: '瑜伽月卡', slogan: '身体就是最好见证', guide: '身体就是最好见证\n给自己一个开始的勇气\n一个月的专注',
    price: 1680, openingPoints: 42, exchangeRatio: 1,
    validity: 30, validityUnit: 'day', unitPrice: 56, bookingRange: 3,
    cancelFreeLimit: 0, termCancelPenaltyType: 'freeze_days', cancelFreezeDays: 1,
    noShowDeductCurrent: false, termNoShowPenaltyType: 'freeze_days', noShowFreezeDays: 1,
    minOpenPeople: 3, checkInPoints: 5, checkInPointsPercent: 0, checkInDailyLimit: 10,
    scope: 'single', functionScope: ['团课'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 40, totalSales: 800, renewalRate: 50, avgConsumptionCycle: 1.0, status: 'active', listingVenues: ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆']
  },
  {
    id: 'c8', type: 'term', name: '瑜伽季卡', slogan: '找到你的练习步调', guide: '找到你的练习步调\n一个月的陪伴\n收获身体的线条\n三个月的坚持',
    price: 3600, openingPoints: 90, exchangeRatio: 1,
    validity: 90, validityUnit: 'day', unitPrice: 40, bookingRange: 3,
    cancelFreeLimit: 0, termCancelPenaltyType: 'freeze_days', cancelFreezeDays: 1,
    noShowDeductCurrent: false, termNoShowPenaltyType: 'freeze_days', noShowFreezeDays: 1,
    minOpenPeople: 3, checkInPoints: 5, checkInPointsPercent: 0, checkInDailyLimit: 10,
    scope: 'single', functionScope: ['团课'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 20, totalSales: 400, renewalRate: 60, avgConsumptionCycle: 3.0, status: 'active', listingVenues: ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆']
  },
  {
    id: 'c9', type: 'term', name: '瑜伽年卡', slogan: '让习惯正真扎根', guide: '让习惯正真扎根\n每年的陪伴\n身体会告诉你答案',
    price: 10800, openingPoints: 270, exchangeRatio: 1,
    validity: 365, validityUnit: 'day', unitPrice: 30, bookingRange: 3,
    cancelFreeLimit: 0, termCancelPenaltyType: 'freeze_days', cancelFreezeDays: 1,
    noShowDeductCurrent: false, termNoShowPenaltyType: 'freeze_days', noShowFreezeDays: 1,
    minOpenPeople: 3, checkInPoints: 5, checkInPointsPercent: 0, checkInDailyLimit: 10,
    scope: 'single', functionScope: ['团课'],
    leaveMinDays: 7, leaveMaxDays: 60, canExtend: true,
    sales30d: 10, totalSales: 150, renewalRate: 70, avgConsumptionCycle: 12.0, status: 'active', listingVenues: ['万象城馆', '西湖旗舰馆', '滨江宝龙馆', '城西银泰馆']
  }
];

// Legacy compatibility: Shop.tsx and Mall.tsx still import MOCK_CARDS.
export const MOCK_CARDS = MOCK_CARD_PRODUCTS;

// P0 canonical point product mock.
// Legacy compatibility: PointProduct type still accepts Mall.tsx local aliases
// such as allowPointsOnly, stock and exchangedCount, but this shared mock uses
// the canonical enablePurePoints, inventory and exchangeCount fields.
export const MOCK_POINT_PRODUCTS: PointProduct[] = [
  {
    id: 'p1', name: '普拉提私教体验课', type: 'course', cover: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400', 
    description: '单人普拉提器械体验，包含身体评估。', 
    enablePurePoints: true, purePointsPrice: 500,
    enableMixedPayment: false,
    validityDays: 30, status: 'active', venues: ['西湖旗舰馆'],
    exchangeCount: 120, inventoryUsage: 0, recentExchanges: [
      { id: 'e1', user: 'Lisa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', date: '2小时前', status: 'completed' },
      { id: 'e2', user: 'Coco', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco', date: '5小时前', status: 'completed' }
    ]
  },
  {
    id: 'p2', name: 'Lululemon 瑜伽垫', type: 'physical', cover: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a9?auto=format&fit=crop&q=80&w=400',
    description: '专业防滑瑜伽垫，5mm厚度，双面可用。', 
    enablePurePoints: true, purePointsPrice: 2000,
    enableMixedPayment: true, mixedPointsPrice: 1000, mixedCashPrice: 100,
    inventory: 50, warningInventory: 10, status: 'active', venues: ['所有场馆'],
    specs: [
        { name: '颜色', values: [{ name: '黑色', image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a9?auto=format&fit=crop&q=80&w=400' }, { name: '紫色' }] },
        { name: '厚度', values: [{ name: '3mm' }, { name: '5mm' }] }
    ],
    exchangeCount: 45, inventoryUsage: 65, recentExchanges: [
      { id: 'e3', user: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', date: '昨天', status: 'pending' }
    ]
  },
  {
    id: 'p3', name: 'Manduka 铺巾', type: 'physical', cover: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400',
    description: '吸汗防滑，轻便易携带。', 
    enablePurePoints: true, purePointsPrice: 800,
    enableMixedPayment: false,
    inventory: 100, warningInventory: 20, status: 'active', venues: ['所有场馆'],
    exchangeCount: 80, inventoryUsage: 40, recentExchanges: []
  },
  {
    id: 'p4', name: '瑜伽小班课兑换券', type: 'course', cover: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=400',
    description: '精品小班课，更细致的指导。', 
    enablePurePoints: true, purePointsPrice: 300,
    enableMixedPayment: true, mixedPointsPrice: 150, mixedCashPrice: 50,
    validityDays: 60, status: 'active', venues: ['万象城馆', '西湖旗舰馆'],
    exchangeCount: 50, inventoryUsage: 0, recentExchanges: []
  },
  {
    id: 'p5', name: '瑜伽团课兑换券', type: 'course', cover: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400',
    description: '活力团课，一起挥洒汗水。', 
    enablePurePoints: true, purePointsPrice: 100,
    enableMixedPayment: false,
    validityDays: 90, status: 'active', venues: ['所有场馆'],
    exchangeCount: 200, inventoryUsage: 0, recentExchanges: []
  },
  {
    id: 'p6', name: '私教单节体验', type: 'course', cover: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=400',
    description: '一对一私教体验，定制化训练。', 
    enablePurePoints: false,
    enableMixedPayment: true, mixedPointsPrice: 600, mixedCashPrice: 50,
    validityDays: 30, status: 'active', venues: ['滨江宝龙馆'],
    exchangeCount: 30, inventoryUsage: 0, recentExchanges: []
  },
  {
    id: 'p7', name: '瑜伽小班课兑换', type: 'course', cover: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400',
    description: '精品小班课程兑换，享受更细致的指导。',
    enablePurePoints: true, purePointsPrice: 800,
    enableMixedPayment: true, mixedPointsPrice: 400, mixedCashPrice: 80,
    validityDays: 60, status: 'active', venues: ['所有场馆'],
    exchangeCount: 15, inventoryUsage: 0, recentExchanges: []
  },
  {
    id: 'p8', name: '瑜伽私教课兑换', type: 'course', cover: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=400',
    description: '一对一私教课程兑换，专属定制方案。',
    enablePurePoints: true, purePointsPrice: 2000,
    enableMixedPayment: true, mixedPointsPrice: 1000, mixedCashPrice: 200,
    validityDays: 90, status: 'active', venues: ['所有场馆'],
    exchangeCount: 8, inventoryUsage: 0, recentExchanges: []
  }
];

// P0 canonical TTC product mock. Mall.tsx still keeps richer local demo data for now.
export const MOCK_TTC_PRODUCTS: TtcProduct[] = [
  {
    id: 'ttc1',
    name: 'RYT 200 瑜伽导师认证',
    price: 16800,
    depositAmount: 5000,
    durationDays: 30,
    status: 'active',
    cover: 'https://images.unsplash.com/photo-1599447292180-45fd84092ef4?auto=format&fit=crop&q=80&w=400',
    description: '面向进阶练习者和准老师的系统培训课程。',
    listingVenues: ['西湖旗舰馆'],
    schedules: [
      { id: 'ttc1-b1', batchName: '2026 春季周末班', startDate: '2026-05-09T09:00:00+08:00', endDate: '2026-06-07T18:00:00+08:00', enrolled: 18, max: 24, status: 'open' },
    ],
  },
];

// P0 canonical member assets. Legacy member cards are still embedded in MOCK_MEMBERS for display.
export const MOCK_MEMBER_ASSETS: MemberAsset[] = [
  {
    id: 'asset-1-card-c4',
    memberId: '1',
    name: '硬核年卡',
    status: 'effective',
    sourceOrderId: 'ord-001',
    contractId: 'contract-001',
    productId: 'c4',
    productType: 'card',
    balanceType: 'time',
    totalAmount: 760,
    remainingAmount: 320,
    effectiveDate: '2023-01-15T00:00:00+08:00',
    expiryDate: '2026-01-15T23:59:59+08:00',
    createdAt: '2023-01-15T10:20:00+08:00',
  },
  {
    id: 'asset-1-private-20',
    memberId: '1',
    name: '常规私教 20 次',
    status: 'effective',
    sourceOrderId: 'ord-002',
    productType: 'course',
    balanceType: 'count',
    totalAmount: 20,
    remainingAmount: 12,
    effectiveDate: '2026-01-01T00:00:00+08:00',
    expiryDate: '2026-12-31T23:59:59+08:00',
    createdAt: '2026-01-01T12:00:00+08:00',
  },
  {
    id: 'asset-3-card-50',
    memberId: '3',
    name: '50次次卡',
    status: 'frozen',
    sourceOrderId: 'ord-003',
    productId: 'c5',
    productType: 'card',
    balanceType: 'count',
    totalAmount: 50,
    remainingAmount: 3,
    frozenUntil: '2026-05-20T23:59:59+08:00',
    effectiveDate: '2025-01-01T00:00:00+08:00',
    expiryDate: '2026-12-31T23:59:59+08:00',
  },
  {
    id: 'asset-5-card-c8',
    memberId: '5',
    name: '瑜伽季卡',
    status: 'effective',
    sourceOrderId: 'ord-004',
    productId: 'c8',
    productType: 'card',
    balanceType: 'time',
    totalAmount: 90,
    remainingAmount: 45,
    effectiveDate: '2026-03-01T00:00:00+08:00',
    expiryDate: '2026-06-01T23:59:59+08:00',
  },
  {
    id: 'asset-4-private-expired',
    memberId: '4',
    name: '私教年卡',
    status: 'expired',
    sourceOrderId: 'ord-005',
    productType: 'course',
    balanceType: 'count',
    totalAmount: 60,
    remainingAmount: 0,
    effectiveDate: '2022-01-01T00:00:00+08:00',
    expiryDate: '2023-12-31T23:59:59+08:00',
  },
];

// P0 canonical course and schedule mocks. Courses.tsx still has local demo rows for now.
export const MOCK_COURSES: Course[] = [
  { id: 'course-flow-yoga', name: '流瑜伽', type: 'group', durationMinutes: 60, category: '瑜伽', difficulty: 'all_levels', status: 'active' },
  { id: 'course-pilates-reformer', name: '普拉提大器械', type: 'small_group', durationMinutes: 50, category: '普拉提', difficulty: 'intermediate', status: 'active' },
  { id: 'course-private-core', name: '核心稳定私教', type: 'private', durationMinutes: 60, category: '私教', difficulty: 'all_levels', status: 'active' },
  { id: 'course-ryt200', name: 'RYT 200 导师培训', type: 'ttc', durationMinutes: 360, category: '教培', difficulty: 'advanced', status: 'active' },
];

export const MOCK_COURSE_SESSIONS: CourseSession[] = [
  {
    id: 'session-20260505-1000',
    courseId: 'course-pilates-reformer',
    title: '普拉提大器械',
    status: 'completed',
    storeId: '1',
    roomId: '102',
    teacherId: '2',
    startAt: '2026-05-05T10:00:00+08:00',
    endAt: '2026-05-05T10:50:00+08:00',
    capacity: 6,
    bookedCount: 5,
  },
  {
    id: 'session-20260505-1900',
    courseId: 'course-flow-yoga',
    title: '流瑜伽',
    status: 'published',
    storeId: '1',
    roomId: '101',
    teacherId: '4',
    startAt: '2026-05-05T19:00:00+08:00',
    endAt: '2026-05-05T20:00:00+08:00',
    capacity: 12,
    bookedCount: 8,
    waitlistCount: 1,
  },
  {
    id: 'session-20260506-1100',
    courseId: 'course-private-core',
    title: '核心稳定私教',
    status: 'scheduled',
    storeId: '1',
    roomId: '201',
    teacherId: '2',
    startAt: '2026-05-06T11:00:00+08:00',
    endAt: '2026-05-06T12:00:00+08:00',
    capacity: 1,
    bookedCount: 1,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'booking-001', memberId: '1', courseSessionId: 'session-20260505-1000', status: 'booked', bookedAt: '2026-05-04T14:20:00+08:00', source: 'front_desk' },
  { id: 'booking-002', memberId: '5', courseSessionId: 'session-20260505-1900', status: 'booked', bookedAt: '2026-05-05T09:10:00+08:00', source: 'member_app' },
  { id: 'booking-003', memberId: '2', courseSessionId: 'session-20260506-1100', status: 'booked', bookedAt: '2026-05-05T10:30:00+08:00', source: 'admin' },
  { id: 'booking-004', memberId: '3', courseSessionId: 'session-20260505-1900', status: 'late_cancelled', bookedAt: '2026-05-04T18:00:00+08:00', cancelledAt: '2026-05-05T18:10:00+08:00', cancelReason: '临时加班' },
];

export const MOCK_ATTENDANCES: Attendance[] = [
  {
    id: 'attendance-001',
    memberId: '1',
    courseSessionId: 'session-20260505-1000',
    bookingId: 'booking-001',
    memberAssetId: 'asset-1-card-c4',
    status: 'consumed',
    checkedInAt: '2026-05-05T09:50:00+08:00',
    attendedAt: '2026-05-05T10:00:00+08:00',
    consumedAt: '2026-05-05T10:55:00+08:00',
  },
  {
    id: 'attendance-002',
    memberId: '5',
    courseSessionId: 'session-20260505-1900',
    bookingId: 'booking-002',
    memberAssetId: 'asset-5-card-c8',
    status: 'pending_checkin',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    memberId: '1',
    status: 'fulfilled',
    items: [
      { id: 'ord-001-item-1', orderId: 'ord-001', productType: 'card', productId: 'c4', productName: '硬核卡', quantity: 1, unitPrice: 39990, totalAmount: 39990, memberAssetId: 'asset-1-card-c4' },
    ],
    totalAmount: 39990,
    paidAmount: 39990,
    contractId: 'contract-001',
    createdAt: '2023-01-15T10:20:00+08:00',
    updatedAt: '2023-01-15T10:25:00+08:00',
    salesId: '5',
    storeId: '1',
  },
  {
    id: 'ord-006',
    memberId: '2',
    status: 'pending_payment',
    items: [
      { id: 'ord-006-item-1', orderId: 'ord-006', productType: 'ttc', productId: 'ttc1', productName: 'RYT 200 瑜伽导师认证', quantity: 1, unitPrice: 16800, totalAmount: 16800 },
    ],
    totalAmount: 16800,
    paidAmount: 5000,
    contractId: 'contract-006',
    createdAt: '2026-05-05T10:35:00+08:00',
    salesId: '1',
    storeId: '1',
  },
  {
    id: 'ord-005',
    memberId: '4',
    status: 'partially_refunded',
    items: [
      { id: 'ord-005-item-1', orderId: 'ord-005', productType: 'course', productId: 'course-private-core', productName: '私教年卡', quantity: 1, unitPrice: 56000, totalAmount: 56000, memberAssetId: 'asset-4-private-expired' },
    ],
    totalAmount: 56000,
    paidAmount: 56000,
    createdAt: '2022-01-01T11:00:00+08:00',
    updatedAt: '2023-09-03T16:00:00+08:00',
    salesId: '1',
    storeId: '1',
  },
];

export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'contract-001',
    memberId: '1',
    orderId: 'ord-001',
    status: 'effective',
    title: '硬核卡会员服务协议',
    templateId: 'template-card-standard',
    sentAt: '2023-01-15T10:21:00+08:00',
    signedAt: '2023-01-15T10:23:00+08:00',
    effectiveAt: '2023-01-15T10:25:00+08:00',
    expiresAt: '2026-01-15T23:59:59+08:00',
  },
  {
    id: 'contract-006',
    memberId: '2',
    orderId: 'ord-006',
    status: 'pending_signature',
    title: 'RYT 200 培训报名协议',
    templateId: 'template-ttc-standard',
    sentAt: '2026-05-05T10:36:00+08:00',
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    orderId: 'ord-001',
    memberId: '1',
    status: 'reconciled',
    amount: 39990,
    method: 'wechat',
    transactionNo: 'wx202301151020001',
    initiatedAt: '2023-01-15T10:20:00+08:00',
    paidAt: '2023-01-15T10:22:00+08:00',
    reconciledAt: '2023-01-16T09:00:00+08:00',
  },
  {
    id: 'pay-006-deposit',
    orderId: 'ord-006',
    memberId: '2',
    status: 'paid',
    amount: 5000,
    method: 'bank_transfer',
    transactionNo: 'bank202605051035001',
    initiatedAt: '2026-05-05T10:35:00+08:00',
    paidAt: '2026-05-05T10:40:00+08:00',
  },
];

export const MOCK_REFUNDS: Refund[] = [
  {
    id: 'refund-001',
    orderId: 'ord-005',
    memberId: '4',
    status: 'completed',
    amount: 2400,
    reason: '会员搬家，退还剩余私教课价值',
    requestedAt: '2023-09-01T12:00:00+08:00',
    approvedAt: '2023-09-02T10:00:00+08:00',
    completedAt: '2023-09-03T16:00:00+08:00',
  },
];

export const MOCK_FINANCE_LEDGER_ENTRIES: FinanceLedgerEntry[] = [
  {
    id: 'ledger-001',
    sourceType: 'payment',
    sourceId: 'pay-001',
    paymentId: 'pay-001',
    orderId: 'ord-001',
    memberId: '1',
    amount: 39990,
    direction: 'income',
    occurredAt: '2023-01-15T10:22:00+08:00',
    description: '硬核卡收款',
  },
  {
    id: 'ledger-002',
    sourceType: 'course_consumption',
    sourceId: 'attendance-001',
    orderId: 'ord-001',
    memberId: '1',
    amount: 125,
    direction: 'liability_decrease',
    occurredAt: '2026-05-05T10:55:00+08:00',
    description: '普拉提大器械消课确认',
  },
  {
    id: 'ledger-003',
    sourceType: 'refund',
    sourceId: 'refund-001',
    orderId: 'ord-005',
    memberId: '4',
    amount: 2400,
    direction: 'expense',
    occurredAt: '2023-09-03T16:00:00+08:00',
    description: '私教课退款',
  },
];

export const STAGE_CONFIG: Record<string, StageConfig> = {
  S0: { label: '线索 Lead', color: '#6B7280', bgColor: '#F3F4F6', desc: '留资未付费', strategy: '🎯 目标: 邀约首次体验，破冰建立信任' },
  S1: { label: '新会员 New', color: '#10B981', bgColor: '#D1FAE5', desc: '首购 ≤ 14天', strategy: '🎯 目标: 新手关怀，建立约课习惯' },
  S2: { label: '体验期 Trial', color: '#F59E0B', bgColor: '#FEF3C7', desc: '首购 ≤ 45天', strategy: '🎯 目标: 体验多位老师，找到真爱课' },
  S3: { label: '稳定期 Stable', color: '#3B82F6', bgColor: '#DBEAFE', desc: '近90天 ≥ 12次', strategy: '🎯 目标: 维持频次，适时扩充卡项' },
  S4: { label: '深度期 Core', color: '#8B5CF6', bgColor: '#EDE9FE', desc: '私教长期 / 高LTV', strategy: '🎯 目标: 深度身体管理，情感链接' },
  S5: { label: '休眠 Sleep', color: '#F97316', bgColor: '#FFEDD5', desc: '近30天无到店', strategy: '🎯 目标: 激活唤醒，发送回归福利' },
  S6: { label: '流失 Churn', color: '#EF4444', bgColor: '#FEE2E2', desc: '卡过期 / 90天无课', strategy: '🎯 目标: 调研流失原因，尝试召回' },
};

const MEMBER_LIFECYCLE_BY_STAGE: Record<Member['stage'], NonNullable<Member['lifecycleStatus']>> = {
  S0: 'lead',
  S1: 'active',
  S2: 'trial_attended',
  S3: 'active',
  S4: 'active',
  S5: 'warning',
  S6: 'churned',
};

const withP0MemberFields = (member: Member): Member => ({
  ...member,
  // New P0 field: canonical lifecycle status for future member workflows.
  lifecycleStatus: member.lifecycleStatus ?? MEMBER_LIFECYCLE_BY_STAGE[member.stage],
  // New P0 field: canonical member asset list.
  // Legacy compatibility: existing pages still render member.cards.
  assets: member.assets ?? MOCK_MEMBER_ASSETS.filter(asset => asset.memberId === member.id),
});

// Legacy compatibility: stage/cards/timeline display fields are retained.
// P0 canonical additions are injected through withP0MemberFields.
const MOCK_MEMBER_ROWS: Member[] = [
  // --- Active Members with Risks ---
  {
    id: '1',
    name: 'Lisa Wang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    gender: 'female',
    phone: '138****8888',
    stage: 'S4',
    age: 32,
    manager: 'Sarah',
    joinDate: '2022-03-15',
    lastVisit: '昨天',
    totalLTV: 45000,
    points: 3200,
    totalClasses: 128,
    topCourses: ['普拉提大器械', '流瑜伽', '孕产修复'],
    privateTeachers: ['Mike', 'Anna'],
    bodyTags: ['产后修复', '高频', '核心弱'],
    bodyNotes: '产后腹直肌分离 2指，腰椎L4/L5 稍微前凸。需加强核心控制，避免过度后弯。',
    riskTag: undefined,
    cards: [
      { name: '硬核年卡', type: 'time', balance: '320天', expiry: '2025-01-15', status: 'active', color: 'bg-black text-white' },
      { name: '常规私教', type: 'count', balance: '12节', expiry: '2024-06-30', status: 'active', color: 'bg-gray-800 text-white' }
    ],
    timeline: [
      { id: 't0', type: 'operation', title: '修改档案', date: '今天 09:00', content: '更新了身体评估备注：腹直肌分离改善至1指。', staff: 'Sarah' },
      { id: 't1', type: 'class', title: '完成课程：普拉提大器械', date: '昨天 10:00', content: '核心控制力增强，骨盆稳定性有提升。', staff: 'Mike教练' },
      { id: 'p1', type: 'phase_report', title: '第二阶段总结 (第20节)', date: '3天前', content: '经过10节课的强化，核心力量显著提升，肋骨外翻改善明显。', staff: 'Mike', images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=150', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=150'] },
      { id: 't2', type: 'purchase', title: '积分兑换', date: '3天前', content: '消耗 1000 积分兑换了 Lululemon 瑜伽砖。', amount: -1000 },
      { id: 't3', type: 'purchase', title: '购买：硬核年卡', date: '2023-01-15', content: '支付 ¥39,990，有效期至 2025-01-15。', amount: 39990 },
      { id: 't4', type: 'follow_up', title: '跟进记录', date: '2023-01-10', content: '会员表示最近工作压力大，想加强冥想练习。', staff: 'Sarah' }
    ]
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    gender: 'female',
    phone: '136****5678',
    stage: 'S5',
    age: 35,
    manager: 'Mike',
    joinDate: '2021-11-11',
    lastVisit: '45天前',
    totalLTV: 12800,
    points: 500,
    totalClasses: 45,
    topCourses: ['流瑜伽', '阴瑜伽'],
    privateTeachers: [],
    bodyTags: ['旧伤', '需复健'],
    bodyNotes: '膝盖半月板有旧伤，不能做剧烈跳跃动作。',
    riskTag: 'sleep',
    cards: [
      { name: '50次次卡', type: 'count', balance: '3次', expiry: '2024-12-31', status: 'expiring', color: 'bg-orange-600 text-white' }
    ],
    timeline: [
      { id: 't1', type: 'system', title: '休眠预警触发', date: '今天 08:00', content: '系统自动标记为 S5 阶段。' },
      { id: 't2', type: 'follow_up', title: '微信回访失败', date: '3天前', content: '发送了召回优惠券，未回复。', staff: 'Mike' },
      { id: 't3', type: 'class', title: '完成课程：流瑜伽', date: '45天前', content: '正常出勤。', staff: 'Anna' }
    ]
  },
  {
    id: '5',
    name: 'Sophie Zhang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    gender: 'female',
    phone: '137****4321',
    stage: 'S3',
    age: 29,
    manager: 'Mike',
    joinDate: '2023-06-01',
    lastVisit: '3天前',
    totalLTV: 8800,
    points: 880,
    totalClasses: 32,
    topCourses: ['燃脂普拉提', '空中瑜伽'],
    privateTeachers: [],
    bodyTags: ['减脂', '塑形'],
    bodyNotes: '希望能在一个月内瘦5斤，建议加强有氧和高强度普拉提。',
    riskTag: undefined,
    cards: [
      { name: '季度通卡', type: 'time', balance: '45天', expiry: '2024-08-01', status: 'active', color: 'bg-blue-600 text-white' }
    ],
    timeline: [
        { id: 't1', type: 'class', title: '完成课程：燃脂普拉提', date: '3天前 19:00', content: '状态很好，出汗量大。', staff: 'Coco' },
        { id: 't2', type: 'check_in', title: '到店签到', date: '3天前 18:45', content: '自助签到。' }
    ]
  },
  // --- New Expiring Members ---
  {
    id: '101', name: 'Linda Wu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linda', gender: 'female', phone: '139****9988',
    stage: 'S2', age: 30, manager: 'Sarah', joinDate: '2023-08-01', lastVisit: '1周前', totalLTV: 5000, points: 200, totalClasses: 12, topCourses: ['基础哈他'], privateTeachers: [],
    bodyTags: ['塑形'], bodyNotes: '暂无特殊', riskTag: 'expiry',
    cards: [{ name: '月卡', type: 'time', balance: '3天', expiry: '2023-11-28', status: 'expiring', color: 'bg-red-500 text-white' }], timeline: []
  },
  {
    id: '102', name: 'Tom Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', gender: 'male', phone: '135****1122',
    stage: 'S3', age: 35, manager: 'Mike', joinDate: '2022-05-01', lastVisit: '昨天', totalLTV: 18000, points: 1200, totalClasses: 88, topCourses: ['阿斯汤加', '力量瑜伽'], privateTeachers: ['Leo'],
    bodyTags: ['增肌'], bodyNotes: '柔韧性一般', riskTag: 'balance',
    cards: [{ name: '私教20次', type: 'count', balance: '1节', expiry: '2024-05-01', status: 'active', color: 'bg-orange-500 text-white' }], timeline: []
  },
  // --- New Sleeping Members ---
  {
    id: '103', name: 'Amy Liu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy', gender: 'female', phone: '150****3344',
    stage: 'S5', age: 26, manager: 'Eva', joinDate: '2023-01-10', lastVisit: '40天前', totalLTV: 3000, points: 100, totalClasses: 8, topCourses: ['基础哈他'], privateTeachers: [],
    bodyTags: ['初学者'], bodyNotes: '怕痛', riskTag: 'sleep', cards: [], timeline: []
  },

  // --- LEADS (S0) ---
  {
    id: '2', name: 'Kevin Zhang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin', gender: 'male', phone: '139****1234',
    stage: 'S0', leadStatus: 'following', leadProbability: 75, age: 28, manager: 'Sarah', joinDate: '2023-11-20', lastVisit: '未到店', totalLTV: 0, points: 0, totalClasses: 0, topCourses: [], privateTeachers: [],
    bodyTags: ['体态改善', '久坐族'], bodyNotes: '主要诉求是改善圆肩驼背，对私教感兴趣。', cards: [], 
    timeline: [{ id: 't1', type: 'follow_up', title: '电话沟通', date: '昨天 09:30', content: '已发送课表，预约周三体验。', staff: 'Sarah' }]
  },
  {
    id: '201', name: 'Coco Li', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CocoL', gender: 'female', phone: '186****1234',
    stage: 'S0', leadStatus: 'new', leadProbability: 40, age: 24, manager: 'Eva', joinDate: '今天', lastVisit: '未到店', totalLTV: 0, points: 0, totalClasses: 0, topCourses: [], privateTeachers: [],
    bodyTags: ['减脂'], bodyNotes: '大众点评咨询，尚未回复。', cards: [], timeline: []
  },
  {
    id: '203', name: 'Ruby Xu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruby', gender: 'female', phone: '159****8888',
    stage: 'S0', leadStatus: 'high_intent', leadProbability: 90, age: 31, manager: 'Mike', joinDate: '2天前', lastVisit: '昨天', totalLTV: 0, points: 0, totalClasses: 0, topCourses: [], privateTeachers: [],
    bodyTags: ['产后'], bodyNotes: '已体验一节普拉提，正在考虑年卡。', cards: [], timeline: []
  },
  // --- Public Pool (Mocking >3 days no contact) ---
  {
    id: '202', name: 'Jack Ma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', gender: 'male', phone: '133****9999',
    stage: 'S0', leadStatus: 'pool', leadProbability: 10, age: 40, manager: '-', joinDate: '5天前', lastVisit: '未到店', totalLTV: 0, points: 0, totalClasses: 0, topCourses: [], privateTeachers: [],
    bodyTags: [], bodyNotes: '系统自动转入：超过3天无跟进记录。', cards: [], timeline: [{id: 't0', type:'system', title:'进入公海', date:'2小时前', content:'超时未跟进'}]
  },
  {
    id: '204', name: 'Sunny Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny', gender: 'female', phone: '138****7777',
    stage: 'S0', leadStatus: 'pool', leadProbability: 20, age: 22, manager: '-', joinDate: '1周前', lastVisit: '未到店', totalLTV: 0, points: 0, totalClasses: 0, topCourses: [], privateTeachers: [],
    bodyTags: [], bodyNotes: '觉得价格贵，暂无意向，前销售已放弃。', cards: [], timeline: [{id: 't0', type:'system', title:'进入公海', date:'1天前', content:'手动放弃'}]
  },
  {
    id: '205', name: 'Robert Wu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', gender: 'male', phone: '150****5555',
    stage: 'S0', leadStatus: 'pool', leadProbability: 5, age: 35, manager: '-', joinDate: '10天前', lastVisit: '未到店', totalLTV: 0, points: 0, totalClasses: 0, topCourses: [], privateTeachers: [],
    bodyTags: [], bodyNotes: '电话一直未接通。', cards: [], timeline: []
  },

  // --- Churned ---
  {
    id: '4',
    name: 'Jessica Liu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    gender: 'female',
    phone: '158****9999',
    stage: 'S6',
    age: 40,
    manager: 'Sarah',
    joinDate: '2020-01-01',
    lastVisit: '120天前',
    totalLTV: 56000,
    points: 120,
    totalClasses: 210,
    topCourses: ['普拉提私教'],
    privateTeachers: ['Sarah'],
    bodyTags: ['VIP', '高净值'],
    bodyNotes: '之前习惯每周三次私教，对环境要求很高。',
    riskTag: 'churn',
    cards: [
      { name: '私教年卡', type: 'time', balance: '0天', expiry: '2023-12-31', status: 'expired', color: 'bg-gray-300 text-gray-500' }
    ],
    timeline: [
      { id: 't1', type: 'system', title: '流失确认', date: '30天前', content: '超过90天未续费，自动转入公海。' },
      { id: 't2', type: 'purchase', title: '退款申请', date: '90天前', content: '因搬家申请退掉剩余私教课，已处理。', amount: -2400 }
    ]
  },
];

export const MOCK_MEMBERS: Member[] = MOCK_MEMBER_ROWS.map(withP0MemberFields);

// --- Mock Data for Dashboard ---

export const MOCK_MHS_DATA: Record<string, MHSData> = {
  L: { 
    key: 'L', name: '会员与留存 (L)', score: 65, desc: '续费率低于警戒线，需重点关注老客维护。', 
    metrics: [
      { name: '会员续费率', val: '45%', score: 45, status: 'danger', tip: '低于50%，请立即启动召回计划' },
      { name: '会员流失率', val: '3%', score: 90, status: 'good', tip: '控制良好' },
      { name: '体验转化率', val: '12%', score: 30, status: 'danger', tip: '新客转化流程可能存在断点' },
      { name: '会员活跃度', val: 'High', score: 85, status: 'good' }
    ]
  },
  F: { 
    key: 'F', name: '财务与营收 (F)', score: 88, desc: '营收状况良好，现金流健康。', 
    metrics: [
      { name: '净利润率', val: '22%', score: 88, status: 'good' },
      { name: '现金流健康度', val: '优', score: 95, status: 'good' },
      { name: '月营收达成', val: '92%', score: 92, status: 'good' },
      { name: 'ROI', val: '1.5', score: 80, status: 'warning', tip: '营销投入产出比有优化空间' }
    ]
  },
  E: { 
    key: 'E', name: '运营效率 (E)', score: 72, desc: '部分时段教室空置率较高。', 
    metrics: [
      { name: '教室利用率', val: '60%', score: 60, status: 'warning', tip: '非黄金时段大量空置' },
      { name: '课程满座率', val: '75%', score: 75, status: 'good' },
      { name: '坪效', val: '¥120/㎡', score: 70, status: 'warning' },
      { name: '人均产值', val: '¥45k', score: 80, status: 'good' }
    ]
  },
  S: { 
    key: 'S', name: '员工表现 (S)', score: 90, desc: '团队非常稳定，满意度高。', 
    metrics: [
      { name: '课程满意度', val: '4.9', score: 98, status: 'good' },
      { name: '员工流失率', val: '0%', score: 100, status: 'good' },
      { name: '指标完成率', val: '85%', score: 85, status: 'good' },
      { name: '课消贡献', val: 'High', score: 90, status: 'good' }
    ]
  }
};

export const MOCK_ALERTS: AlertItem[] = [
  { id: 'a1', type: 'danger', title: '留存危机：体验转化率跌至 12%', desc: '低于理想值 (25%)。主要流失发生在体验课后24小时内。', action: '跟进近日流失的15位体验客户' },
  { id: 'a2', type: 'warning', title: '资源闲置：下周二晚间空置率预测 > 40%', desc: '空中瑜伽课程预约量不足。', action: '调整下周二晚间排课' }
];

export const MOCK_TEAM_TASKS: TeamTask[] = [
  { id: 'tk1', staff: 'Sarah', avatar: 'S', role: '销售', taskName: '任务: 新客回访', status: 'pending', progress: 60 },
  { id: 'tk2', staff: 'Mike', avatar: 'M', role: '老师', taskName: '任务: 课后反馈', status: 'done', progress: 100 }
];

// --- Mock Data for Shop & Staff ---

export const MOCK_STORE_INFO: StoreInfo = {
  id: 1, name: 'MetYoga 西湖馆', address: '杭州市西湖区北山路', phone: '0571-88886666', hours: '10:00 - 22:00', isOpen: true,
  gallery: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1549419137-023a17df302e?auto=format&fit=crop&q=80&w=400'],
  holidays: [ {name: '春节假期', date: '2026-01-20 至 2026-01-28'}, {name: '场馆维护', date: '2025-12-25'} ],
  rooms: [
      { id: '101', name: '瑜伽小班教室', capacity: 12, type: '团课', equipment: ['地暖','空中吊床','瑜伽砖'] },
      { id: '102', name: '普拉提小班教室', capacity: 6, type: '团课', equipment: ['普拉提床','魔力圈'] },
      { id: '201', name: '瑜伽私教室', capacity: 2, type: '私教', equipment: ['壁绳','辅助椅'] },
      { id: '202', name: '普拉提核心床私教室', capacity: 1, type: '私教', equipment: ['凯迪拉克','稳踏椅','梯桶'] }
  ]
};

export const MOCK_STAFF_LIST: Staff[] = [
  { 
    id: 1, name: 'Sarah', type: 'teacher', level: 'mentor', title: '教学总监', intro: '拥有8年瑜伽教学经验，专注于哈他瑜伽与流瑜伽的教学。善于通过精准的体式引导帮助学员建立身体觉知。', rating: 4.9, hourlyRate: '¥300', promotionStatus: 'none', joinDate: '2018-05-01', expYears: '8年', classHours: 2400, retention: 92, memberCount: 150, totalRevenue: '1,200,000', tags: ['哈他','流瑜伽','工作坊'], certs: ['E-RYT 500','孕产认证'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    conversionRate: 85, conversionTrend: 'up', loadFactor: 90, revenueModel: 'L2', occupancyRate: 95, newvsRenewal: { new: 30, renewal: 70 }, followUpRate: 98,
    members: [{name:'Lisa', card:'私教50次', balance:'32', lastContact:'昨天', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'}, {name:'Coco', card:'年卡', balance:'200天', lastContact:'3天前', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco'}] 
  },
  { 
    id: 3, name: 'Leo', type: 'teacher', level: 't1', title: '力量瑜伽', intro: '充满活力的年轻教练，课堂风格轻松幽默。主修阿斯汤加，擅长帮助学员突破体能瓶颈。', rating: 4.9, hourlyRate: '¥100', promotionStatus: 'pending', joinDate: '2023-03-01', expYears: '1年', classHours: 300, retention: 88, memberCount: 20, totalRevenue: '100,000', tags: ['阿斯汤加'], certs: ['RYT 200'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    conversionRate: 40, conversionTrend: 'stable', loadFactor: 30, revenueModel: 'L1', occupancyRate: 65, newvsRenewal: { new: 80, renewal: 20 }, followUpRate: 45,
    members: [{name:'Mike', card:'私教10次', balance:'2', lastContact:'今天', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'}] 
  },
  { 
    id: 6, name: 'David', type: 'teacher', level: 't1', title: '兼职教练', intro: '基础扎实，耐心细致。适合初学者入门，注重体式的正位与呼吸的配合。', rating: 4.2, hourlyRate: '¥80', promotionStatus: 'none', joinDate: '2023-01-01', expYears: '1年', classHours: 120, retention: 55, memberCount: 5, totalRevenue: '30,000', tags: ['基础瑜伽'], certs: ['RYT 200'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    conversionRate: 15, conversionTrend: 'down', loadFactor: 20, revenueModel: 'L1', occupancyRate: 45, newvsRenewal: { new: 90, renewal: 10 }, followUpRate: 30,
    members: [] 
  },
  { 
    id: 2, name: 'Mike', type: 'teacher', level: 't3', title: '普拉提专家', intro: '专注于普拉提大器械与康复训练。拥有丰富的运动解剖学知识，擅长解决腰痛与体态问题。', rating: 5.0, hourlyRate: '¥200', promotionStatus: 'none', joinDate: '2020-01-01', expYears: '5年', classHours: 1800, retention: 85, memberCount: 98, totalRevenue: '850,000', tags: ['普拉提','康复'], certs: ['Balanced Body'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    conversionRate: 72, conversionTrend: 'up', loadFactor: 85, revenueModel: 'L2', occupancyRate: 88, newvsRenewal: { new: 40, renewal: 60 }, followUpRate: 95,
    members: [] 
  },
  { 
    id: 4, name: 'Anna', type: 'teacher', level: 't2', title: '冥想疗愈', intro: '温柔治愈系老师，擅长阴瑜伽与颂钵疗愈。引导学员在静谧中放松身心，释放压力。', rating: 4.8, hourlyRate: '¥150', promotionStatus: 'none', joinDate: '2021-06-01', expYears: '3年', classHours: 800, retention: 85, memberCount: 45, totalRevenue: '320,000', tags: ['阴瑜伽'], certs: ['颂钵疗愈'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    conversionRate: 55, conversionTrend: 'stable', loadFactor: 60, revenueModel: 'L1', occupancyRate: 78, newvsRenewal: { new: 50, renewal: 50 }, followUpRate: 88,
    members: [] 
  },
  { 
    id: 5, name: 'Eva', type: 'butler', level: 'butler', title: '金牌管家', intro: '致力于为会员提供最贴心的服务，解答各类课程咨询与会籍办理问题。', rating: 5.0, hourlyRate: '-', promotionStatus: 'none', joinDate: '2019-09-01', expYears: '4年', classHours: 0, retention: 95, memberCount: 300, totalRevenue: '2,000,000', tags: ['销售','服务'], certs: [], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
    conversionRate: 90, conversionTrend: 'up', loadFactor: 95, revenueModel: 'L2', occupancyRate: 100, newvsRenewal: { new: 20, renewal: 80 }, followUpRate: 100,
    members: [{name:'VIP张总', card:'黑卡', balance:'999', lastContact:'上周', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=Vip'}] 
  },
  { 
    id: 11, name: '赵D', type: 'teacher', level: 't2', title: '流瑜伽', intro: '教学风格严谨。', rating: 4.7, hourlyRate: '¥180', promotionStatus: 'none', joinDate: '2021-01-01', expYears: '4年', classHours: 1200, retention: 82, memberCount: 60, totalRevenue: '500,000', tags: ['流瑜伽'], certs: [], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoD',
    conversionRate: 65, conversionTrend: 'stable', loadFactor: 98, revenueModel: 'L2', occupancyRate: 92, newvsRenewal: { new: 30, renewal: 70 }, followUpRate: 75,
    members: [] 
  },
  { 
    id: 12, name: '陈E', type: 'teacher', level: 't1', title: '基础瑜伽', intro: '潜力新人。', rating: 4.5, hourlyRate: '¥90', promotionStatus: 'none', joinDate: '2023-08-01', expYears: '0.5年', classHours: 200, retention: 70, memberCount: 15, totalRevenue: '50,000', tags: ['哈他'], certs: [], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenE',
    conversionRate: 35, conversionTrend: 'up', loadFactor: 40, revenueModel: 'L1', occupancyRate: 60, newvsRenewal: { new: 85, renewal: 15 }, followUpRate: 50,
    members: [] 
  }
];
