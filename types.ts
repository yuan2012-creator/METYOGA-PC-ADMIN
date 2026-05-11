
// Legacy compatibility: current member pages still use S0-S6 display stages.
export type Stage = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

// --- P0 Domain Scalar Conventions ---
// Monetary fields such as amount, price, unitPrice, totalAmount and paidAmount use number.
// The current frontend contract treats money as CNY yuan unless a field explicitly says points.
// P0 domain time fields use ISO string. Legacy display strings are annotated where retained.
export type MoneyAmount = number;
export type ISODateString = string;

export type MemberId = string;
export type OrderId = string;
export type ProductId = string;
export type CourseId = string;
export type CourseSessionId = string;
export type BookingId = string;
export type AttendanceId = string;
export type ContractId = string;
export type PaymentId = string;
export type RefundId = string;

export interface StageConfig {
  label: string;
  color: string;
  bgColor: string;
  desc: string;
  strategy: string;
}

// --- P0 Domain Statuses ---

export type MemberLifecycleStatus =
  | 'lead'
  | 'contacted'
  | 'trial_booked'
  | 'trial_attended'
  | 'active'
  | 'warning'
  | 'inactive'
  | 'churned'
  | 'reactivated';

export type MemberAssetStatus =
  | 'inactive'
  | 'effective'
  | 'frozen'
  | 'expired'
  | 'used_up'
  | 'transferred'
  | 'upgraded'
  | 'cancelled';

export type CourseSessionStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

/** 发布状态（可选扩展字段，与 legacy `status` 并存） */
export type CourseSessionPublishStatus = 'draft' | 'published' | 'unpublished' | 'canceled';

/** 预约开放状态（可选扩展字段） */
export type CourseSessionBookingStatus = 'not_open' | 'bookable' | 'full' | 'closed' | 'suspended';

/** 场次执行生命周期（可选扩展字段 `sessionStatus`，与 legacy `status` 并存） */
export type CourseSessionLifecycleStatus =
  | 'upcoming'
  | 'in_progress'
  | 'ended'
  | 'pending_completion'
  | 'completed'
  | 'canceled'
  | 'rescheduled'
  | 'substitute'
  | 'exception_pending';

/** 异常分类（可选扩展字段） */
export type CourseSessionExceptionStatus =
  | 'none'
  | 'booking_low'
  | 'teacher_absent'
  | 'attendance_conflict'
  | 'late_cancel'
  | 'no_show'
  | 'room_conflict'
  | 'teacher_conflict'
  | 'reschedule_pending'
  | 'substitute_pending'
  | 'cancel_pending';

/** 结算状态（可选扩展字段） */
export type CourseSessionSettlementStatus =
  | 'not_started'
  | 'pending'
  | 'consumed'
  | 'teacher_pay_generated'
  | 'revenue_confirmed'
  | 'exception_hold';

export type BookingStatus =
  | 'booked'
  | 'waitlisted'
  | 'cancelled'
  | 'late_cancelled'
  | 'no_show';

export type AttendanceStatus =
  | 'pending_checkin'
  | 'checked_in'
  | 'attended'
  | 'consumed'
  | 'absent';

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'fulfilled'
  | 'closed'
  | 'cancelled'
  | 'partially_refunded'
  | 'refunded';

export type ContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'signed'
  | 'effective'
  | 'voided'
  | 'expired'
  | 'terminated';

export type PaymentStatus =
  | 'initiated'
  | 'paid'
  | 'reconciled'
  | 'failed'
  | 'cancelled'
  | 'refunding'
  | 'refunded';

export type RefundStatus =
  | 'requested'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled';

// --- P0 Domain Objects ---

export interface TimelineEvent {
  id: string;
  type: 'class' | 'purchase' | 'follow_up' | 'system' | 'check_in' | 'operation' | 'phase_report';
  title: string;
  date: string; // Legacy compatibility: current timeline uses display text, not ISO string.
  content: string;
  staff?: string;
  amount?: number; // Legacy compatibility: display-only value that may be cash or points.
  tags?: string[];
  images?: string[]; // For phase reports (before/after photos)
}

// Legacy compatibility: member detail cards are a display shape.
// New business logic should use MemberAsset instead.
export interface MemberCard {
  name: string;
  type: 'time' | 'count' | 'value';
  balance: string; // e.g. "200 Days", "15 Counts", "¥5000"
  expiry: string; // Legacy compatibility: display date from current mock data.
  status: 'active' | 'expiring' | 'expired';
  color: string;
}

export interface Member {
  id: MemberId;
  name: string;
  avatar: string;
  gender: 'female' | 'male';
  phone: string;
  lifecycleStatus?: MemberLifecycleStatus;
  // Legacy compatibility: current pages and mock data still filter by S0-S6.
  stage: Stage;
  // New field for S0 leads logic
  leadStatus?: 'new' | 'following' | 'high_intent' | 'pool'; 
  leadProbability?: number; // 0-100%
  age: number;
  manager: string;
  joinDate: string; // Legacy compatibility: current mock may use date or display text.
  lastVisit: string; // Legacy compatibility: current mock uses display text such as "昨天".
  // Assets
  totalLTV: MoneyAmount;
  points: number;
  totalClasses: number; // New: Cumulative classes taken
  // Legacy compatibility: current member detail reads display cards directly.
  // New business logic should use assets.
  cards: MemberCard[];
  assets?: MemberAsset[];
  // Preferences & Relations
  topCourses: string[]; // New: Top 3 favorite courses
  privateTeachers: string[]; // New: Bound private coaches
  // Body Info
  bodyTags: string[];
  bodyNotes: string;
  // Dynamic Data
  timeline: TimelineEvent[];
  // Risk
  riskTag?: 'balance' | 'expiry' | 'sleep' | 'churn';
}

export interface MemberAsset {
  id: string;
  memberId: MemberId;
  name: string;
  status: MemberAssetStatus;
  sourceOrderId?: OrderId;
  contractId?: ContractId;
  productId?: ProductId;
  productType?: 'card' | 'ttc' | 'point' | 'course' | 'custom';
  balanceType: 'time' | 'count' | 'value' | 'points' | 'course';
  // Asset balances use the unit described by balanceType, not always money.
  totalAmount?: number;
  remainingAmount?: number;
  frozenUntil?: ISODateString;
  effectiveDate?: ISODateString;
  expiryDate?: ISODateString;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

export interface Course {
  id: CourseId;
  name: string;
  type: 'group' | 'small_group' | 'private' | 'workshop' | 'ttc';
  durationMinutes: number;
  category?: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  status?: 'active' | 'inactive';
}

export interface CourseSession {
  id: CourseSessionId;
  courseId: CourseId;
  status: CourseSessionStatus;
  title?: string;
  storeId?: string;
  roomId?: string;
  teacherId?: string;
  /** 展示用老师姓名（与排课事件 teacher 等并存，可选） */
  teacherName?: string;
  startAt: ISODateString;
  endAt: ISODateString;
  capacity: number;
  bookedCount?: number;
  waitlistCount?: number;
  notes?: string;
  publishStatus?: CourseSessionPublishStatus;
  bookingStatus?: CourseSessionBookingStatus;
  sessionStatus?: CourseSessionLifecycleStatus;
  exceptionStatus?: CourseSessionExceptionStatus;
  settlementStatus?: CourseSessionSettlementStatus;
}

export interface Booking {
  id: BookingId;
  memberId: MemberId;
  courseSessionId: CourseSessionId;
  status: BookingStatus;
  bookedAt: ISODateString;
  source?: 'admin' | 'front_desk' | 'member_app' | 'system';
  cancelledAt?: ISODateString;
  cancelReason?: string;
}

export interface Attendance {
  id: AttendanceId;
  memberId: MemberId;
  courseSessionId: CourseSessionId;
  status: AttendanceStatus;
  bookingId?: BookingId;
  memberAssetId?: string;
  checkedInAt?: ISODateString;
  attendedAt?: ISODateString;
  consumedAt?: ISODateString;
  notes?: string;
}

// --- Dashboard Types ---

export interface Metric {
  name: string;
  val: string;
  score: number;
  status: 'good' | 'warning' | 'danger';
  tip?: string;
}

export interface MHSData {
  key: string;
  name: string;
  score: number;
  desc: string;
  metrics: Metric[];
}

export interface AlertItem {
  id: string;
  type: 'danger' | 'warning';
  title: string;
  desc: string;
  action: string;
}

export interface TeamTask {
  id: string;
  staff: string;
  avatar: string; // Initials or URL
  role: string;
  taskName: string;
  status: 'done' | 'pending';
  progress: number; // 0-100
}

// --- Shop Types ---

export interface Holiday {
  name: string;
  date: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: '团课' | '私教';
  equipment: string[];
}

export interface StoreInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  gallery: string[];
  holidays: Holiday[];
  rooms: Room[];
}

export interface Staff {
  id: number;
  name: string;
  type: 'teacher' | 'butler';
  level: 't1' | 't2' | 't3' | 't4' | 'mentor' | 'butler';
  title: string;
  intro: string; 
  rating: number;
  hourlyRate: string;
  promotionStatus: 'none' | 'pending';
  joinDate: string;
  expYears: string;
  classHours: number;
  retention: number;
  memberCount: number;
  totalRevenue: string;
  tags: string[];
  certs: string[];
  avatar: string;
  followUpRate?: number;
  
  // New fields for detailed modal
  teachingStartDate?: string;
  privateSpecialties?: string[];
  groupSpecialties?: string[];
  nonReceptionGroups?: string[];
  certImages?: string[];
  courseVideos?: { title: string; url: string; thumb: string }[];
  
  historicalCourses?: { name: string; rating: number; count: number }[];
  popularCourses?: string[];
  attentionCourses?: string[];
  
  incomeStats?: {
    month: number;
    quarter: number;
    year: number;
    breakdown: {
      private: number;
      smallClass: number;
      sales: number;
    };
  };
  
  // Advanced Decision Metrics
  conversionRate: number; // 0-100%
  conversionTrend: 'up' | 'down' | 'stable';
  loadFactor: number; // 0-100%
  revenueModel: 'L1' | 'L2';
  occupancyRate: number; // %
  newvsRenewal: { new: number; renewal: number }; // Ratio
  
  members: { name: string; card: string; balance: string; lastContact: string; avatar: string }[];
}

export interface CardProduct {
  id: ProductId;
  type: 'stored_value' | 'term';
  name: string;
  slogan: string;
  guide: string; // 引导购买
  price: MoneyAmount;
  points?: number; // For stored value
  openingPoints: number;
  giftPointsLimit?: number;
  exchangeRatio?: number; // 1 point = ? yuan
  validity: number; 
  validityUnit: 'day' | 'month';
  unitPrice: MoneyAmount;
  bookingRange: number; // days
  
  // Rules
  cancelFreeLimit: number; // times/month
  
  // Penalty Logic (Type specific)
  // For Stored Value: Deduct Points
  cancelDeductPoints?: number;
  // Legacy compatibility: Shop.tsx still reads this older field name.
  cancelPenaltyPoints?: number;
  noShowDeductPoints?: number;
  // Legacy compatibility: current card editors still use this boolean toggle.
  noShowDeductCurrent?: boolean;

  // For Term: Choice between Deduct Current or Freeze Days
  termCancelPenaltyType?: 'deduct_current' | 'freeze_days';
  termNoShowPenaltyType?: 'deduct_current' | 'freeze_days';
  
  cancelFreezeDays?: number;
  // Legacy compatibility: Shop.tsx displays threshold-based freeze hints.
  cancelFreezeThreshold1?: number;
  cancelFreezeDays1?: number;
  cancelFreezeThreshold2?: number;
  cancelFreezeDays2?: number;
  noShowFreezeDays?: number;
  
  minOpenPeople: number;
  
  checkInPoints: number; // Fixed points
  checkInPointsPercent: number; // Percentage
  checkInDailyLimit: number;
  
  scope: 'all' | 'single';
  functionScope: string[]; // Group, Small, Private
  // Legacy compatibility: Mall.tsx has a local genre scope editor.
  genreScope?: string[];
  
  leaveMinDays: number;
  leaveMaxDays: number;
  canExtend: boolean;

  // Analytics & Status (Added for Mall component compatibility)
  sales30d?: number;
  totalSales?: number;
  renewalRate?: number;
  avgConsumptionCycle?: number;
  status?: 'active' | 'inactive';
  listingVenues?: string[];
}

// Legacy compatibility: current pages import Card.
// New code should import CardProduct.
export type Card = CardProduct;

export interface TtcProduct {
  id: ProductId;
  name: string;
  price: MoneyAmount;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  cover?: string;
  description?: string;
  depositAmount?: MoneyAmount;
  durationDays?: number;
  listingVenues?: string[];
  schedules?: {
    id: string;
    batchName: string;
    startDate: ISODateString;
    endDate: ISODateString;
    enrolled: number;
    max: number;
    status: 'open' | 'full' | 'closed';
  }[];
}

export interface ProductSpecValue {
  name: string;
  image?: string; // Optional image for the spec value
}

export interface ProductSpec {
  name: string; // e.g. "Color", "Size"
  values: ProductSpecValue[];
}

export interface PointProduct {
  id: ProductId;
  name: string;
  type: 'course' | 'physical';
  cover?: string;
  description?: string;
  
  // Redemption Modes (Parallel & Optional)
  enablePurePoints?: boolean;
  purePointsPrice?: number;
  // Legacy compatibility: Mall.tsx local point product drafts use allowPointsOnly/pointsPrice.
  allowPointsOnly?: boolean;
  pointsPrice?: number;
  
  enableMixedPayment?: boolean;
  mixedPointsPrice?: number;
  mixedCashPrice?: MoneyAmount;
  // Legacy compatibility: Mall.tsx local point product drafts use allowMixed/mixedPoints/mixedCash.
  allowMixed?: boolean;
  mixedPoints?: number;
  mixedCash?: MoneyAmount;

  inventory?: number; // For physical
  warningInventory?: number; // For physical
  // Legacy compatibility: Mall.tsx local point product drafts use stock/warningStock.
  stock?: number;
  warningStock?: number;
  specs?: ProductSpec[]; // New: Specifications
  validityDays?: number; // For course redemption validity
  status: 'active' | 'inactive';
  venues?: string[];
  // Legacy compatibility: Mall.tsx separates usage venues and listing venues.
  usageVenues?: string[];
  listingVenues?: string[];
  
  isClassPack?: boolean;
  classCount?: number;
  scope?: 'all' | 'single';
  functionScope?: string[];
  genreScope?: string[];
  
  // Stats
  exchangeCount?: number;
  // Legacy compatibility: Mall.tsx local point product drafts use exchangedCount.
  exchangedCount?: number;
  inventoryUsage?: number; // Percentage 0-100
  // Legacy compatibility: Mall.tsx local point product drafts use inventoryRate.
  inventoryRate?: number;
  recentExchanges?: {
      id: string;
      user: string;
      avatar?: string;
      // Legacy compatibility: current mock may use display text such as "昨天".
      date: string;
      status: 'completed' | 'pending';
  }[];
  // Legacy compatibility: Mall.tsx local point product drafts use recentLog.
  recentLog?: {
      user: string;
      time: string;
  }[];
}

export interface OrderItem {
  id: string;
  productType: 'card' | 'ttc' | 'point' | 'course' | 'custom';
  productId: ProductId;
  productName: string;
  quantity: number;
  unitPrice: MoneyAmount;
  totalAmount: MoneyAmount;
  orderId?: OrderId;
  memberAssetId?: string;
}

export interface Order {
  id: OrderId;
  memberId: MemberId;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: MoneyAmount;
  paidAmount?: MoneyAmount;
  contractId?: ContractId;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
  salesId?: string;
  storeId?: string;
}

export interface Contract {
  id: ContractId;
  memberId: MemberId;
  status: ContractStatus;
  orderId?: OrderId;
  title?: string;
  templateId?: string;
  sentAt?: ISODateString;
  signedAt?: ISODateString;
  effectiveAt?: ISODateString;
  expiresAt?: ISODateString;
}

export interface Payment {
  id: PaymentId;
  // Payment is owned by finance but must always bind to one Order.
  orderId: OrderId;
  memberId: MemberId;
  status: PaymentStatus;
  amount: MoneyAmount;
  method?: 'cash' | 'card' | 'wechat' | 'alipay' | 'bank_transfer' | 'other';
  transactionNo?: string;
  initiatedAt?: ISODateString;
  paidAt?: ISODateString;
  reconciledAt?: ISODateString;
}

export interface Refund {
  id: RefundId;
  orderId: OrderId;
  memberId: MemberId;
  status: RefundStatus;
  amount: MoneyAmount;
  paymentId?: PaymentId;
  reason?: string;
  requestedAt: ISODateString;
  approvedAt?: ISODateString;
  completedAt?: ISODateString;
}

export interface FinanceLedgerEntry {
  id: string;
  // Ledger entries are accounting records derived from source objects.
  // They are not Payment records and must not replace Payment lifecycle tracking.
  sourceType: 'payment' | 'refund' | 'course_consumption' | 'payroll' | 'adjustment';
  sourceId: string;
  paymentId?: PaymentId;
  amount: MoneyAmount;
  direction: 'income' | 'expense' | 'liability_increase' | 'liability_decrease';
  occurredAt: ISODateString;
  memberId?: MemberId;
  orderId?: OrderId;
  description?: string;
  createdBy?: string;
}
