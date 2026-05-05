
export type Stage = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export interface StageConfig {
  label: string;
  color: string;
  bgColor: string;
  desc: string;
  strategy: string;
}

export interface TimelineEvent {
  id: string;
  type: 'class' | 'purchase' | 'follow_up' | 'system' | 'check_in' | 'operation' | 'phase_report';
  title: string;
  date: string;
  content: string;
  staff?: string;
  amount?: number;
  tags?: string[];
  images?: string[]; // For phase reports (before/after photos)
}

export interface MemberCard {
  name: string;
  type: 'time' | 'count' | 'value';
  balance: string; // e.g. "200 Days", "15 Counts", "¥5000"
  expiry: string;
  status: 'active' | 'expiring' | 'expired';
  color: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  gender: 'female' | 'male';
  phone: string;
  stage: Stage;
  // New field for S0 leads logic
  leadStatus?: 'new' | 'following' | 'high_intent' | 'pool'; 
  leadProbability?: number; // 0-100%
  age: number;
  manager: string;
  joinDate: string;
  lastVisit: string;
  // Assets
  totalLTV: number;
  points: number;
  totalClasses: number; // New: Cumulative classes taken
  cards: MemberCard[];
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

export interface Card {
  id: string;
  type: 'stored_value' | 'term';
  name: string;
  slogan: string;
  guide: string; // 引导购买
  price: number;
  points?: number; // For stored value
  openingPoints: number;
  giftPointsLimit?: number;
  exchangeRatio?: number; // 1 point = ? yuan
  validity: number; 
  validityUnit: 'day' | 'month';
  unitPrice: number;
  bookingRange: number; // days
  
  // Rules
  cancelFreeLimit: number; // times/month
  
  // Penalty Logic (Type specific)
  // For Stored Value: Deduct Points
  cancelDeductPoints?: number;
  noShowDeductPoints?: number;

  // For Term: Choice between Deduct Current or Freeze Days
  termCancelPenaltyType?: 'deduct_current' | 'freeze_days';
  termNoShowPenaltyType?: 'deduct_current' | 'freeze_days';
  
  cancelFreezeDays?: number;
  noShowFreezeDays?: number;
  
  minOpenPeople: number;
  
  checkInPoints: number; // Fixed points
  checkInPointsPercent: number; // Percentage
  checkInDailyLimit: number;
  
  scope: 'all' | 'single';
  functionScope: string[]; // Group, Small, Private
  
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

export interface ProductSpecValue {
  name: string;
  image?: string; // Optional image for the spec value
}

export interface ProductSpec {
  name: string; // e.g. "Color", "Size"
  values: ProductSpecValue[];
}

export interface PointProduct {
  id: string;
  name: string;
  type: 'course' | 'physical';
  cover?: string;
  description?: string;
  
  // Redemption Modes (Parallel & Optional)
  enablePurePoints: boolean;
  purePointsPrice?: number;
  
  enableMixedPayment: boolean;
  mixedPointsPrice?: number;
  mixedCashPrice?: number;

  inventory?: number; // For physical
  warningInventory?: number; // For physical
  specs?: ProductSpec[]; // New: Specifications
  validityDays?: number; // For course redemption validity
  status: 'active' | 'inactive';
  venues: string[];
  
  isClassPack?: boolean;
  classCount?: number;
  scope?: 'all' | 'single';
  functionScope?: string[];
  genreScope?: string[];
  
  // Stats
  exchangeCount: number;
  inventoryUsage: number; // Percentage 0-100
  recentExchanges: {
      id: string;
      user: string;
      avatar?: string;
      date: string;
      status: 'completed' | 'pending';
  }[];
}
