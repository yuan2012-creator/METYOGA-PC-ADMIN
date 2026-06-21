/** 经营总览 v1.1（C 版设计令牌）— mock 数据与类型 */

export type DashboardV2PriorityLevel = 'P0' | 'P1' | 'P2';

export interface DashboardV2PageMeta {
  title: string;
  subtitle: string;
  filters: {
    storeLabel: string;
    periodLabel: string;
    exportLabel: string;
  };
}

export interface DashboardV2DiagnosisHero {
  conclusion: string;
  description: string;
  tags: string[];
  evidenceButtonLabel: string;
}

export interface DashboardV2PriorityAction {
  id: string;
  priority: DashboardV2PriorityLevel;
  title: string;
  owner: string;
  buttonLabel: string;
}

export interface DashboardV2Metric {
  id: string;
  label: string;
  value: string;
  changeLabel: string;
  changeDirection: 'up' | 'down' | 'neutral';
  note: string;
  isWarning?: boolean;
}

export interface DashboardV2RiskItem {
  id: string;
  priority: 'P0' | 'P1';
  title: string;
  fact: string;
  impact: string;
  suggestedAction: string;
  buttonLabel: string;
}

export interface DashboardV2ProfitTrendPoint {
  month: string;
  profitWan: number;
}

export interface DashboardV2ProfitTrend {
  title: string;
  subtitle: string;
  points: DashboardV2ProfitTrendPoint[];
}

export interface DashboardV2DeliveryItem {
  id: string;
  label: string;
  value: string;
  note?: string;
}

export interface DashboardV2DeliverySummary {
  title: string;
  items: DashboardV2DeliveryItem[];
}

export type DashboardV2CoverageStatus = 'ok' | 'warn' | 'risk';

export interface DashboardV2StoreComparisonRow {
  id: string;
  storeName: string;
  confirmedRevenue: string;
  cashReceived: string;
  deferredLiability: string;
  cashSafetyCoverage: string;
  coverageStatus: DashboardV2CoverageStatus;
  judgment: string;
}

export interface DashboardV2StoreComparison {
  title: string;
  columns: readonly string[];
  rows: DashboardV2StoreComparisonRow[];
}

export interface DashboardV2Snapshot {
  meta: DashboardV2PageMeta;
  diagnosis: DashboardV2DiagnosisHero;
  priorityActions: DashboardV2PriorityAction[];
  metrics: DashboardV2Metric[];
  riskQueue: DashboardV2RiskItem[];
  profitTrend: DashboardV2ProfitTrend;
  deliverySummary: DashboardV2DeliverySummary;
  storeComparison: DashboardV2StoreComparison;
}

export function buildDashboardV2Snapshot(): DashboardV2Snapshot {
  return {
    meta: {
      title: '经营总览',
      subtitle: '总部经营视角 · 2026年6月',
      filters: {
        storeLabel: '全部门店',
        periodLabel: '本月',
        exportLabel: '导出报告',
      },
    },
    diagnosis: {
      conclusion: '本月确认收入改善，但现金安全覆盖率降至 72%',
      description:
        '已收未交付压力仍高于安全线，需优先处理滨江馆与西湖馆的预收负债压力。',
      tags: ['P0 现金安全', '系统规则建议'],
      evidenceButtonLabel: '查看证据链',
    },
    priorityActions: [
      {
        id: 'pa-1',
        priority: 'P0',
        title: '滨江馆预收负债复核与交付排期',
        owner: '财务总监 · 林敏',
        buttonLabel: '立即处理',
      },
      {
        id: 'pa-2',
        priority: 'P1',
        title: '西湖馆高余额会员耗课跟进清单',
        owner: '会员运营 · 周航',
        buttonLabel: '分配任务',
      },
      {
        id: 'pa-3',
        priority: 'P1',
        title: '周末高峰时段师资加课评估',
        owner: '教务主管 · 陈悦',
        buttonLabel: '查看排课',
      },
    ],
    metrics: [
      {
        id: 'm-confirmed',
        label: '确认收入',
        value: '¥231万',
        changeLabel: '环比 +6.2%',
        changeDirection: 'up',
        note: '按耗课确认，不等于实收',
      },
      {
        id: 'm-cash',
        label: '实收金额',
        value: '¥286万',
        changeLabel: '环比 +3.8%',
        changeDirection: 'up',
        note: '包含新购、续费、补款',
      },
      {
        id: 'm-deferred',
        label: '预收负债',
        value: '¥418万',
        changeLabel: '环比 +9.4%',
        changeDirection: 'up',
        note: '已收款但尚未交付课程',
      },
      {
        id: 'm-coverage',
        label: '现金安全覆盖率',
        value: '72%',
        changeLabel: '低于安全线 80%',
        changeDirection: 'down',
        note: '需关注可用现金对预收责任的覆盖',
        isWarning: true,
      },
    ],
    riskQueue: [
      {
        id: 'rq-1',
        priority: 'P0',
        title: '现金安全覆盖率偏低',
        fact: '全品牌可用现金对预收负债覆盖率为 72%，连续 2 周低于 80% 安全线。',
        impact: '滨江馆、西湖馆',
        suggestedAction: '启动预收负债专项复核，优先安排高余额会员耗课与交付。',
        buttonLabel: '查看详情',
      },
      {
        id: 'rq-2',
        priority: 'P1',
        title: '高余额低耗课会员增加',
        fact: '余额 ≥ ¥8,000 且 30 天耗课 ≤ 2 次的会员本周新增 18 人。',
        impact: '会员续费与预收结构',
        suggestedAction: '推送专属跟进任务至门店顾问，本周内完成首轮触达。',
        buttonLabel: '生成清单',
      },
      {
        id: 'rq-3',
        priority: 'P1',
        title: '部分老师课时负载过高',
        fact: '5 位老师本周排课量超过个人上限 115%，其中 2 位集中在晚高峰。',
        impact: '课程交付质量与师资稳定性',
        suggestedAction: '评估加课或调班方案，避免连续高负载导致取消率上升。',
        buttonLabel: '调整排课',
      },
    ],
    profitTrend: {
      title: '经营利润趋势',
      subtitle: '近 12 个月 · 口径：确认收入 − 成本',
      points: [
        { month: '7月', profitWan: 42 },
        { month: '8月', profitWan: 45 },
        { month: '9月', profitWan: 41 },
        { month: '10月', profitWan: 48 },
        { month: '11月', profitWan: 52 },
        { month: '12月', profitWan: 55 },
        { month: '1月', profitWan: 49 },
        { month: '2月', profitWan: 44 },
        { month: '3月', profitWan: 50 },
        { month: '4月', profitWan: 53 },
        { month: '5月', profitWan: 56 },
        { month: '6月', profitWan: 54 },
      ],
    },
    deliverySummary: {
      title: '课程交付摘要',
      items: [
        { id: 'd-1', label: '本月耗课点数', value: '12,480 点', note: '较上月 +4.1%' },
        { id: 'd-2', label: '满课率', value: '78.6%' },
        { id: 'd-3', label: '低预约课程数', value: '23 节', note: '需关注周末早课' },
        { id: 'd-4', label: '满员未加课提醒', value: '6 节', note: '建议 48h 内评估加课' },
      ],
    },
    storeComparison: {
      title: '多店经营对比',
      columns: ['门店', '确认收入', '实收金额', '预收负债', '现金安全覆盖率', '经营判断'],
      rows: [
        {
          id: 's-bj',
          storeName: '滨江馆',
          confirmedRevenue: '¥68万',
          cashReceived: '¥82万',
          deferredLiability: '¥126万',
          cashSafetyCoverage: '68%',
          coverageStatus: 'risk',
          judgment: '预收压力偏高，优先交付',
        },
        {
          id: 's-xh',
          storeName: '西湖馆',
          confirmedRevenue: '¥61万',
          cashReceived: '¥74万',
          deferredLiability: '¥118万',
          cashSafetyCoverage: '71%',
          coverageStatus: 'warn',
          judgment: '耗课跟进需加强',
        },
        {
          id: 's-cb',
          storeName: '城北馆',
          confirmedRevenue: '¥54万',
          cashReceived: '¥66万',
          deferredLiability: '¥89万',
          cashSafetyCoverage: '84%',
          coverageStatus: 'ok',
          judgment: '经营稳健',
        },
        {
          id: 's-yt',
          storeName: '银泰馆',
          confirmedRevenue: '¥48万',
          cashReceived: '¥64万',
          deferredLiability: '¥85万',
          cashSafetyCoverage: '79%',
          coverageStatus: 'warn',
          judgment: '接近安全线，持续观察',
        },
      ],
    },
  };
}
