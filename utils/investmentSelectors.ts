/** 投资测算：前端演示推导；不接接口；不生成正式投资报告 */

export interface InvestmentProjectBasics {
  projectName: string;
  city: string;
  storeModel: string;
  openingMonth: string;
  seatCapacity: number;
  remark: string;
}

export interface InvestmentCapacitySnapshot {
  groupClassesPerWeek: number;
  privateSlotsPerWeek: number;
  smallClassSlotsPerWeek: number;
  ttcSeatsPerMonth: number;
}

export interface InvestmentBreakevenModel {
  basics: InvestmentProjectBasics;
  oneTimeCapex: number;
  monthlyFixedCost: number;
  capacity: InvestmentCapacitySnapshot;
  breakevenMonthlyRevenue: number;
  paybackMonthsReference: number;
  cashFlowForecast: { month: string; inflow: number; outflow: number; net: number }[];
  sensitivityScenarios: { name: string; impactNote: string }[];
}

/** 1. 项目基础信息明细 */
export interface InvestmentProjectInfoDetail {
  projectName: string;
  storeLabel: string;
  areaSqm: number;
  projectPhase: string;
  expectedOpening: string;
  calcStatusLabel: string;
  riskHints: string[];
}

/** 2. 一次性投入明细 */
export interface InvestmentCapexBreakdown {
  renovation: number;
  equipment: number;
  rentDeposit: number;
  firstRent: number;
  openingSupplies: number;
  staffPrep: number;
  other: number;
  total: number;
}

/** 3. 月固定成本明细 */
export interface InvestmentMonthlyFixedBreakdown {
  rent: number;
  propertyMgmt: number;
  basePayroll: number;
  socialBenefits: number;
  utilities: number;
  marketing: number;
  systemOps: number;
  otherFixed: number;
  total: number;
}

/** 4. 产能与收入测算明细 */
export interface InvestmentCapacityRevenueDetail {
  yogaGroupCapacityPerWeek: number;
  pilatesSmallCapacityPerWeek: number;
  privateCapacityPerWeek: number;
  ttcCapacityPerMonth: number;
  expectedOccupancyPct: number;
  expectedArpuYuan: number;
  monthlyRevenueEstimate: number;
  riskHints: string[];
}

/** 5. 保本线与回本周期明细 */
export interface InvestmentBreakevenDetail {
  monthlyFixedCost: number;
  monthlyRevenueEstimate: number;
  monthlyNetCashEstimate: number;
  breakevenRevenue: number;
  breakevenClassConsumptionPerMonth: number;
  paybackMonthsReference: number;
  sensitivityHint: string;
  riskHints: string[];
}

/** 6. 投资人月报入口（演示汇总） */
export interface InvestmentInvestorMonthlyFlash {
  monthLabel: string;
  cashIn: number;
  refund: number;
  netCollection: number;
  fixedCost: number;
  cashFlowEstimate: number;
  vsModelDeviationNote: string;
  riskHints: string[];
}

export type InvestmentFullModel = InvestmentBreakevenModel & {
  projectDetail: InvestmentProjectInfoDetail;
  capex: InvestmentCapexBreakdown;
  monthlyFixedLines: InvestmentMonthlyFixedBreakdown;
  capacityRevenue: InvestmentCapacityRevenueDetail;
  breakevenDetail: InvestmentBreakevenDetail;
  investorMonthlyFlash: InvestmentInvestorMonthlyFlash;
};

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN')}`;

const BASE_RISK = '当前为模块内测算；不代表正式投资报告；不代表真实财务预测；后续需接入真实经营数据；仅用于投资判断；测算结果需人工复核';

const buildCoreBreakeven = (): InvestmentBreakevenModel => ({
  basics: {
    projectName: 'MET YOGA 单店模型（演示）',
    city: '杭州 · 核心商圈',
    storeModel: '社区精品店 · 双教室',
    openingMonth: '2026-Q2（演示）',
    seatCapacity: 42,
    remark: '门店与客单价为占位参数；后续需接入真实经营数据',
  },
  oneTimeCapex: 2_000_000,
  monthlyFixedCost: 310_000,
  capacity: {
    groupClassesPerWeek: 48,
    privateSlotsPerWeek: 36,
    smallClassSlotsPerWeek: 18,
    ttcSeatsPerMonth: 24,
  },
  breakevenMonthlyRevenue: 520_000,
  paybackMonthsReference: 28,
  cashFlowForecast: [
    { month: 'M+1', inflow: 380_000, outflow: 410_000, net: -30_000 },
    { month: 'M+2', inflow: 420_000, outflow: 415_000, net: 5_000 },
    { month: 'M+3', inflow: 460_000, outflow: 418_000, net: 42_000 },
    { month: 'M+4', inflow: 500_000, outflow: 420_000, net: 80_000 },
    { month: 'M+5', inflow: 520_000, outflow: 422_000, net: 98_000 },
    { month: 'M+6', inflow: 540_000, outflow: 425_000, net: 115_000 },
  ],
  sensitivityScenarios: [
    { name: '客单价 -8%', impactNote: '保本线上移约 6%（模块内测算；待核对）' },
    { name: '满课率 -10pt', impactNote: '回本周期参考延长约 3–5 个月（模块内测算；不代表真实财务预测）' },
    { name: '月固定成本 +12 万', impactNote: '现金流转正点后移约 1 个月（模块内测算；待核对）' },
  ],
});

export const buildInvestmentBreakevenModel = (): InvestmentBreakevenModel => buildCoreBreakeven();

export const buildInvestmentFullModel = (): InvestmentFullModel => {
  const core = buildCoreBreakeven();
  const monthlyRevenueEstimate = 548_000;
  const monthlyNetCashEstimate = monthlyRevenueEstimate - core.monthlyFixedCost;

  const capex: InvestmentCapexBreakdown = {
    renovation: 720_000,
    equipment: 480_000,
    rentDeposit: 280_000,
    firstRent: 150_000,
    openingSupplies: 120_000,
    staffPrep: 150_000,
    other: 100_000,
    total: 2_000_000,
  };

  const monthlyFixedLines: InvestmentMonthlyFixedBreakdown = {
    rent: 120_000,
    propertyMgmt: 18_000,
    basePayroll: 90_000,
    socialBenefits: 28_000,
    utilities: 12_000,
    marketing: 22_000,
    systemOps: 12_000,
    otherFixed: 8_000,
    total: 310_000,
  };

  const projectDetail: InvestmentProjectInfoDetail = {
    projectName: core.basics.projectName,
    storeLabel: '拟开门店 · 杭州万象城片区（演示）',
    areaSqm: 380,
    projectPhase: '测算稿 / 内部评审前（模块内展示）',
    expectedOpening: core.basics.openingMonth,
    calcStatusLabel: '待核对（模块内测算）',
    riskHints: [
      BASE_RISK,
      '面积与工程量为占位：待接入真实营建测算',
    ],
  };

  const capacityRevenue: InvestmentCapacityRevenueDetail = {
    yogaGroupCapacityPerWeek: core.capacity.groupClassesPerWeek,
    pilatesSmallCapacityPerWeek: core.capacity.smallClassSlotsPerWeek,
    privateCapacityPerWeek: core.capacity.privateSlotsPerWeek,
    ttcCapacityPerMonth: core.capacity.ttcSeatsPerMonth,
    expectedOccupancyPct: 72,
    expectedArpuYuan: 168,
    monthlyRevenueEstimate,
    riskHints: [
      BASE_RISK,
      '满课率与客单价为模块内假设：需人工复核',
    ],
  };

  const breakevenDetail: InvestmentBreakevenDetail = {
    monthlyFixedCost: core.monthlyFixedCost,
    monthlyRevenueEstimate,
    monthlyNetCashEstimate,
    breakevenRevenue: core.breakevenMonthlyRevenue,
    breakevenClassConsumptionPerMonth: 1860,
    paybackMonthsReference: core.paybackMonthsReference,
    sensitivityHint: '满课率 / 客单价 / 固定成本三项联动：任一偏离将显著影响回本参考（模块内测算；待核对）',
    riskHints: [
      BASE_RISK,
      '回本周期为参考值：测算结果需人工复核',
    ],
  };

  const investorMonthlyFlash: InvestmentInvestorMonthlyFlash = {
    monthLabel: '本月（演示）',
    cashIn: 512_000,
    refund: 38_000,
    netCollection: 474_000,
    fixedCost: core.monthlyFixedCost,
    cashFlowEstimate: 162_000,
    vsModelDeviationNote: '较月收入测算偏低约 5.3%（模块内测算；待核对）',
    riskHints: [
      BASE_RISK,
      '不生成正式月报；不接真实财务流水',
    ],
  };

  return {
    ...core,
    projectDetail,
    capex,
    monthlyFixedLines,
    capacityRevenue,
    breakevenDetail,
    investorMonthlyFlash,
  };
};

export const formatInvestmentMoney = (amount: number): string => fmt(amount);
