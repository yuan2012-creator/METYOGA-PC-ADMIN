import React from 'react';
import type {
  StaffClosedLoopSummary,
  StaffGrowthLevelReviewDetailRow,
  StaffGrowthReviewRow,
  StaffHourIncomeEstimateRow,
  StaffPermissionAuditDetailRow,
  StaffRuleConfigDetailRow,
  StaffRulesPendingRow,
  StaffSessionHourRevenueRow,
  StaffTeacherArchiveDetailRow,
  StaffTeachingQualityRiskDetailRow,
  StaffTeachingQualityRow,
} from '../../utils/staffSelectors';
import StaffGrowthLevelReviewDetailTable from './StaffGrowthLevelReviewDetailTable';
import StaffPermissionAuditDetailTable from './StaffPermissionAuditDetailTable';
import StaffRuleConfigDetailTable from './StaffRuleConfigDetailTable';
import StaffSessionHourRevenueTable from './StaffSessionHourRevenueTable';
import StaffTeacherArchiveDetailTable from './StaffTeacherArchiveDetailTable';
import StaffTeachingQualityRiskDetailTable from './StaffTeachingQualityRiskDetailTable';

interface StaffClosedLoopPanelProps {
  summary: StaffClosedLoopSummary;
  teacherArchiveRows: StaffTeacherArchiveDetailRow[];
  sessionHourRevenueRows: StaffSessionHourRevenueRow[];
  hourIncomeRows: StaffHourIncomeEstimateRow[];
  growthLevelReviewDetailRows: StaffGrowthLevelReviewDetailRow[];
  growthRows: StaffGrowthReviewRow[];
  qualityRiskDetailRows: StaffTeachingQualityRiskDetailRow[];
  qualityRows: StaffTeachingQualityRow[];
  ruleConfigDetailRows: StaffRuleConfigDetailRow[];
  permissionAuditDetailRows: StaffPermissionAuditDetailRow[];
  rulesRows: StaffRulesPendingRow[];
}

const fmtInt = (n: number) => n.toLocaleString('zh-CN');
const fmtMoney = (n: number) => `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;

const FLOW_STEPS = [
  { n: 1, t: '老师档案', d: '资质、擅长课种与基础档案；不写入正式人事档案变更。' },
  { n: 2, t: '排课 / 上课记录', d: '排班与实际上课登记；与课耗事实对齐（模块内估算）。' },
  { n: 3, t: '到课与耗课', d: '到课、缺席与耗课统计；仅用于经营核对。' },
  { n: 4, t: '课时费估算', d: '模块内估算；不生成工资单；不代表已结算。' },
  { n: 5, t: '成长等级', d: '展示入口；不自动升降级；待接入成长规则。' },
  { n: 6, t: '教学质量', d: '出勤与评价摘要；不生成正式考核结果。' },
  { n: 7, t: '规则配置', d: '入口占位；尚未接入真实规则引擎。' },
  { n: 8, t: '权限审计', d: '尚未写入权限变更；操作日志与审批流待接入。' },
];

const StaffClosedLoopPanel: React.FC<StaffClosedLoopPanelProps> = ({
  summary,
  teacherArchiveRows,
  sessionHourRevenueRows,
  hourIncomeRows,
  growthLevelReviewDetailRows,
  growthRows,
  qualityRiskDetailRows,
  qualityRows,
  ruleConfigDetailRows,
  permissionAuditDetailRows,
  rulesRows,
}) => (
  <div className="space-y-8 animate-fadeIn">
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 leading-relaxed">
      <p className="font-bold text-amber-950 mb-1">师资与规则闭环入口（只读说明）</p>
      <p>
        本页串联<strong>老师档案 → 排课 / 上课记录 → 到课与耗课 → 课时费估算 → 成长等级 → 教学质量 → 规则配置 → 权限审计</strong>，
        当前均为前端 mock 与<strong>模块内估算</strong>，<strong>不生成工资单</strong>、<strong>不自动升降级</strong>、<strong>不写入权限变更</strong>、<strong>不同步财务</strong>，<strong>仅用于经营核对</strong>。
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-3">闭环主链路（展示）</h3>
      <p className="text-xs text-gray-500 mb-4">顺序表达从「人」到「课」再到「规则与权限」的依赖；后续需接入正式规则与审计能力。</p>
      <div className="flex flex-wrap gap-2 items-stretch">
        {FLOW_STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="flex-1 min-w-[108px] rounded-xl border border-gray-100 bg-gray-50/80 p-3">
              <div className="text-[10px] font-black text-gray-400 mb-1">步骤 {s.n}</div>
              <div className="text-sm font-bold text-gray-900">{s.t}</div>
              <p className="text-[11px] text-gray-600 mt-2 leading-snug">{s.d}</p>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className="hidden sm:flex items-center text-gray-300 text-lg font-bold px-0.5">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[
        { label: '老师总数', value: fmtInt(summary.teacherCount), hint: '含教学岗（展示）' },
        { label: '本月已完成课时', value: fmtInt(summary.monthCompletedLessons), hint: '模块内估算' },
        { label: '待核对课时费', value: fmtInt(summary.pendingFeeReviewCount), hint: '人维度待核对' },
        { label: '成长等级待复核', value: fmtInt(summary.growthPendingReviewCount), hint: '待复核信号' },
        { label: '教学质量待关注', value: fmtInt(summary.qualityAttentionCount), hint: '模块内估算' },
        { label: '规则 / 权限待完善', value: fmtInt(summary.rulesPermissionTodoCount), hint: '入口项计数' },
      ].map(card => (
        <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide">{card.label}</div>
          <div className="text-2xl font-bold font-mono text-gray-900 mt-1">{card.value}</div>
          <p className="text-[10px] text-gray-500 mt-2 leading-snug">{card.hint}</p>
        </div>
      ))}
    </div>

    <StaffTeacherArchiveDetailTable rows={teacherArchiveRows} />

    <StaffSessionHourRevenueTable rows={sessionHourRevenueRows} />

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-indigo-50/60">
        <h3 className="font-bold text-lg text-gray-900">老师课时与收入预估</h3>
        <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
          <li><strong>当前为模块内估算</strong>；<strong>不生成工资单</strong>；<strong>不代表已结算</strong>；后续需接入<strong>正式课时费规则</strong>；<strong>仅用于经营核对</strong>。</li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">老师</th>
              <th className="p-3">已完成课程数</th>
              <th className="p-3">课时数量</th>
              <th className="p-3">课时费估算</th>
              <th className="p-3">当前状态</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {hourIncomeRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 font-mono text-xs">{fmtInt(row.completedCourses)}</td>
                <td className="p-3 font-mono text-xs">{fmtInt(row.lessonHours)}</td>
                <td className="p-3 font-mono text-xs font-bold">{fmtMoney(row.feeEstimate)}</td>
                <td className="p-3 text-xs text-gray-800">{row.statusLabel}</td>
                <td className="p-3 pr-5 text-xs text-orange-900">
                  <ul className="list-disc pl-4 space-y-1">
                    {row.riskHints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <StaffGrowthLevelReviewDetailTable rows={growthLevelReviewDetailRows} />

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-violet-50/50">
        <h3 className="font-bold text-lg text-gray-900">成长等级与复核</h3>
        <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
          <li><strong>当前为模块内展示</strong>；<strong>不自动升降级</strong>；<strong>不生成正式考核结果</strong>；后续需接入<strong>成长规则</strong>；<strong>仅用于经营核对</strong>。</li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">老师</th>
              <th className="p-3">当前等级</th>
              <th className="p-3">目标等级 / 待复核等级</th>
              <th className="p-3">近阶段表现摘要</th>
              <th className="p-3">复核状态</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {growthRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 text-xs">{row.currentLevelLabel}</td>
                <td className="p-3 text-xs font-medium text-violet-900">{row.targetLevelLabel}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[260px] leading-snug">{row.recentPerformanceSummary}</td>
                <td className="p-3 text-xs text-gray-800">{row.reviewStatusLabel}</td>
                <td className="p-3 pr-5 text-xs text-orange-900">
                  <ul className="list-disc pl-4 space-y-1">
                    {row.riskHints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <StaffTeachingQualityRiskDetailTable rows={qualityRiskDetailRows} />

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-teal-50/50">
        <h3 className="font-bold text-lg text-gray-900">教学质量与风险</h3>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">汇总课程执行、满课 / 到课与会员侧待关注项；<strong>不生成正式考核结果</strong>；<strong>仅用于经营核对</strong>。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">老师</th>
              <th className="p-3">课程执行情况</th>
              <th className="p-3">满课 / 到课 / 缺席等摘要</th>
              <th className="p-3">会员反馈或待关注项</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {qualityRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.teacherName}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[220px] leading-snug">{row.courseExecutionSummary}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[240px] leading-snug">{row.attendanceSummary}</td>
                <td className="p-3 text-xs text-gray-700 max-w-[240px] leading-snug">{row.feedbackOrWatchSummary}</td>
                <td className="p-3 pr-5 text-xs text-orange-900">
                  <ul className="list-disc pl-4 space-y-1">
                    {row.riskHints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <StaffRuleConfigDetailTable rows={ruleConfigDetailRows} />

    <StaffPermissionAuditDetailTable rows={permissionAuditDetailRows} />

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-100/80">
        <h3 className="font-bold text-lg text-gray-900">规则与权限待接入</h3>
        <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc pl-5 leading-relaxed">
          <li><strong>当前为入口展示</strong>；<strong>尚未接入真实规则引擎</strong>；<strong>尚未写入权限变更</strong>；<strong>尚未生成正式审批记录</strong>；<strong>仅用于经营核对</strong>。</li>
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">规则 / 能力项</th>
              <th className="p-3">权限角色</th>
              <th className="p-3">操作日志</th>
              <th className="p-3">审批流</th>
              <th className="p-3">待接入说明</th>
              <th className="p-3 pr-5">风险提示</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rulesRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="p-3 pl-5 font-bold text-gray-900">{row.ruleName}</td>
                <td className="p-3 text-xs text-gray-700">{row.roleOrScope}</td>
                <td className="p-3 text-xs text-gray-600">{row.operationLogHint}</td>
                <td className="p-3 text-xs text-gray-600">{row.approvalFlowHint}</td>
                <td className="p-3 text-xs text-gray-800 max-w-[280px] leading-snug">{row.pendingIntegrationText}</td>
                <td className="p-3 pr-5 text-xs text-orange-900">
                  <ul className="list-disc pl-4 space-y-1">
                    {row.riskHints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default StaffClosedLoopPanel;
