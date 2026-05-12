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

const fmt = (n: number) => `¥${n.toLocaleString('zh-CN')}`;

export const buildInvestmentBreakevenModel = (): InvestmentBreakevenModel => ({
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

export const formatInvestmentMoney = (amount: number): string => fmt(amount);
