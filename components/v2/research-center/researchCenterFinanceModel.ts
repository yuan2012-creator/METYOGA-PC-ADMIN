import type { CashReceiptEvent, CohortConfig } from './researchCenterV2.viewModel';
import { createInitialCashReceipts } from './researchCenterV2.viewModel';

export type FinanceTaskTab = 'profit' | 'cash' | 'recovery';

export type FinanceCaliber = 'contribution' | 'full-profit' | 'cash';

export type PaymentPlanStatus =
  | '待配置'
  | '待确认'
  | '待付款'
  | '部分支付'
  | '已支付'
  | '已逾期';

export type CostDataStatus = '已确认' | '待确认' | '未录入' | '不适用';

export type AttributionLevel = '研学中心' | '场地' | '教室' | '课程产品' | '具体班期';

export type AllocationMethod =
  | '不分摊，仅计入中心'
  | '按面积'
  | '按使用天数'
  | '按使用小时'
  | '按学员人数'
  | '按项目收入'
  | '固定比例'
  | '手工指定';

export const ATTRIBUTION_LEVEL_OPTIONS: AttributionLevel[] = [
  '研学中心',
  '场地',
  '教室',
  '课程产品',
  '具体班期',
];

export const ALLOCATION_METHOD_OPTIONS: AllocationMethod[] = [
  '不分摊，仅计入中心',
  '按面积',
  '按使用天数',
  '按使用小时',
  '按学员人数',
  '按项目收入',
  '固定比例',
  '手工指定',
];

export interface CohortBudgetSimulation {
  simCount: number;
  avgDealPrice: number;
  commissionRate: number;
  mentorDirectCost: number;
  accommodationCost: number;
  examCertCost: number;
  materialCost: number;
  otherDirectCost: number;
  allocatedFixedCost: number;
  includeRenovationAmortization: boolean;
}

export interface PaymentPlanItem {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  status: PaymentPlanStatus;
  category: string;
}

export interface RenovationPaymentNode {
  id: string;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  status: PaymentPlanStatus;
  note: string;
}

export interface FixedCostItem {
  id: string;
  name: string;
  monthlyAmount: number;
  effectiveDate: string;
  endDate: string;
  attributionLevel: AttributionLevel;
  allocationMethod: AllocationMethod;
  status: string;
  /** 2026-09-01 后新中心成本，不默认分摊到 7/27 班期 */
  newCenterCost: boolean;
}

export interface PaybackScenarioConfig {
  id: 'conservative' | 'target' | 'full';
  label: string;
  cohortsPerYear: number;
  avgStudents: number;
  avgDealPrice: number;
  avgDirectCost: number;
  monthlyFixedCost: number;
  otherCashOutflow: number;
}

export interface RenovationFinanceState {
  totalAmount: number;
  paidAmount: number;
  amortizationMonths: number;
  amortizationStartDate: string;
  cumulativeAmortized: number;
  cumulativeRecoverySurplus: number;
  paymentNodes: RenovationPaymentNode[];
}

export interface FinanceCompletenessField {
  id: string;
  label: string;
  actionLabel: string;
  actionKey: string;
  completed: boolean;
  required: boolean;
}

export interface ResearchCenterFinanceState {
  budgetByCohortId: Record<string, CohortBudgetSimulation>;
  paymentPlans: PaymentPlanItem[];
  fixedCosts: FixedCostItem[];
  renovation: RenovationFinanceState;
  paybackScenarios: PaybackScenarioConfig[];
  venue502CostEntered: boolean;
  allocationRulesConfirmed: boolean;
  currentCashBalance: number;
  cashReceipts: CashReceiptEvent[];
}

export const RENOVATION_TOTAL = 220_000;
export const RENOVATION_DEADLINE = '2026-12-31';
export const NEW_CENTER_COST_START = '2026-09-01';

export function createDefaultBudget(cohort: CohortConfig): CohortBudgetSimulation {
  return {
    simCount: cohort.paidCount,
    avgDealPrice: cohort.standardPrice,
    commissionRate: cohort.commissionRate,
    mentorDirectCost: cohort.projectDirectCost,
    accommodationCost: cohort.accommodationCost,
    examCertCost: 0,
    materialCost: 0,
    otherDirectCost: cohort.otherFixedProjectCost,
    allocatedFixedCost: 0,
    includeRenovationAmortization: false,
  };
}

export function createInitialPaymentPlans(): PaymentPlanItem[] {
  return [
    { id: 'pay-rent', title: '租金', owner: '财务', dueDate: '2026-07-25', dueAmount: 11863, paidAmount: 0, status: '待确认', category: '固定成本' },
    { id: 'pay-property', title: '物业费', owner: '财务', dueDate: '2026-07-25', dueAmount: 1690, paidAmount: 0, status: '待确认', category: '固定成本' },
    { id: 'pay-keke', title: '科科底薪', owner: '人力', dueDate: '2026-07-28', dueAmount: 4000, paidAmount: 0, status: '待付款', category: '人力' },
    { id: 'pay-fangfang', title: '芳芳底薪', owner: '人力', dueDate: '2026-07-28', dueAmount: 4000, paidAmount: 0, status: '待付款', category: '人力' },
    { id: 'pay-ruilin', title: '锐霖底薪', owner: '人力', dueDate: '2026-07-28', dueAmount: 1500, paidAmount: 0, status: '待付款', category: '人力' },
    { id: 'pay-hq', title: '总部公共人员分摊', owner: '财务', dueDate: '2026-07-30', dueAmount: 8000, paidAmount: 0, status: '待确认', category: '分摊' },
    { id: 'pay-teacher', title: '导师课酬', owner: '教培', dueDate: '2026-07-27', dueAmount: 6000, paidAmount: 2000, status: '部分支付', category: '教学' },
    { id: 'pay-hotel', title: '大鹏住宿', owner: '教培', dueDate: '2026-08-05', dueAmount: 3200, paidAmount: 0, status: '待付款', category: '教学' },
    { id: 'pay-hardcover', title: '硬装付款', owner: '工程', dueDate: '2026-09-15', dueAmount: 0, paidAmount: 0, status: '待配置', category: '装修' },
  ];
}

export function createInitialFixedCosts(): FixedCostItem[] {
  return [
    { id: 'fc-rent', name: '租金', monthlyAmount: 11863, effectiveDate: '2026-09-01', endDate: '', attributionLevel: '场地', allocationMethod: '按使用天数', status: '待确认', newCenterCost: true },
    { id: 'fc-property', name: '物业费', monthlyAmount: 1690, effectiveDate: '2026-09-01', endDate: '', attributionLevel: '场地', allocationMethod: '按使用天数', status: '待确认', newCenterCost: true },
    { id: 'fc-keke', name: '科科底薪', monthlyAmount: 4000, effectiveDate: '2026-09-01', endDate: '', attributionLevel: '研学中心', allocationMethod: '按项目收入', status: '已确认', newCenterCost: true },
    { id: 'fc-fangfang', name: '芳芳底薪', monthlyAmount: 4000, effectiveDate: '2026-09-01', endDate: '', attributionLevel: '研学中心', allocationMethod: '按项目收入', status: '已确认', newCenterCost: true },
    { id: 'fc-ruilin', name: '锐霖底薪', monthlyAmount: 1500, effectiveDate: '2026-09-01', endDate: '', attributionLevel: '研学中心', allocationMethod: '按项目收入', status: '已确认', newCenterCost: true },
    { id: 'fc-hq', name: '财务、出纳、线上运营、程序员均摊', monthlyAmount: 8000, effectiveDate: '2026-09-01', endDate: '', attributionLevel: '研学中心', allocationMethod: '固定比例', status: '待确认', newCenterCost: true },
  ];
}

export function createInitialRenovationState(): RenovationFinanceState {
  return {
    totalAmount: RENOVATION_TOTAL,
    paidAmount: 0,
    amortizationMonths: 12,
    amortizationStartDate: '2026-09-01',
    cumulativeAmortized: 0,
    cumulativeRecoverySurplus: 0,
    paymentNodes: [],
  };
}

export function createInitialPaybackScenarios(): PaybackScenarioConfig[] {
  return [
    { id: 'conservative', label: '保守', cohortsPerYear: 2, avgStudents: 7, avgDealPrice: 12800, avgDirectCost: 44000, monthlyFixedCost: 0, otherCashOutflow: 12000 },
    { id: 'target', label: '目标', cohortsPerYear: 3, avgStudents: 10, avgDealPrice: 12800, avgDirectCost: 44000, monthlyFixedCost: 0, otherCashOutflow: 18000 },
    { id: 'full', label: '满班', cohortsPerYear: 4, avgStudents: 12, avgDealPrice: 12800, avgDirectCost: 44000, monthlyFixedCost: 0, otherCashOutflow: 24000 },
  ];
}

export function createInitialFinanceState(cohort: CohortConfig): ResearchCenterFinanceState {
  return {
    budgetByCohortId: { [cohort.id]: createDefaultBudget(cohort) },
    paymentPlans: createInitialPaymentPlans(),
    fixedCosts: createInitialFixedCosts(),
    renovation: createInitialRenovationState(),
    paybackScenarios: createInitialPaybackScenarios(),
    venue502CostEntered: false,
    allocationRulesConfirmed: false,
    currentCashBalance: 186_400,
    cashReceipts: createInitialCashReceipts(),
  };
}
