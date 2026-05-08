import type { Dispatch, SetStateAction } from 'react';
import type { Staff } from '../../../types';
import type { StaffDemoMember, StaffDetailsView } from '../../../utils/staffSelectors';

export type StaffModalTab = 'course' | 'member' | 'income' | 'promotion';
export type TimeRange = 'week' | 'month' | 'quarter' | 'all';
export type IncomeTimeRange = 'week' | 'month' | 'quarter' | 'all';
export type MemberListTab = 'all' | 'private' | 'followup';

export interface PricingConfig {
  basic: number;
  shaping: number;
  therapy: number;
  prenatal: number;
  trial: number;
  acceptPoints: boolean;
}

export interface StaffDetailPanelProps {
  staffDetails: StaffDetailsView;
}

export interface StaffProfileArchivePanelProps extends StaffDetailPanelProps {
  activeStaff: Staff;
  setActiveStaff: Dispatch<SetStateAction<Staff | null>>;
  teachingYears: string;
  isEditingProfile: boolean;
  setIsEditingProfile: (isEditing: boolean) => void;
  isEditingPricing: boolean;
  setIsEditingPricing: (isEditing: boolean) => void;
  pricingConfig: PricingConfig;
  setPricingConfig: Dispatch<SetStateAction<PricingConfig>>;
}

export interface StaffCoursePerformancePanelProps extends StaffDetailPanelProps {
  courseTimeRange: TimeRange;
  setCourseTimeRange: (range: TimeRange) => void;
}

export interface StaffMemberFollowupPanelProps extends StaffDetailPanelProps {
  mockExtendedMembers: StaffDemoMember[];
  filteredMembers: StaffDemoMember[];
  memberListTab: MemberListTab;
  setMemberListTab: (tab: MemberListTab) => void;
  showAdvancedFilter: boolean;
  setShowAdvancedFilter: (show: boolean) => void;
  filterLifecycle: string;
  setFilterLifecycle: (lifecycle: string) => void;
  filterGoal: string;
  setFilterGoal: (goal: string) => void;
  activeFollowUpCategory: string | null;
  setActiveFollowUpCategory: (category: string | null) => void;
}

export interface StaffIncomePayrollPanelProps extends StaffDetailPanelProps {
  incomeTimeRange: IncomeTimeRange;
  setIncomeTimeRange: (range: IncomeTimeRange) => void;
}

