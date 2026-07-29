# 研学中心三端数据契约（V2.0）

> 原型持久化仍走 `LocalStorageResearchCenterService`；接真实后端时只替换适配层，不重定义业务规则。  
> 金额口径：原型存储为整数「元」；远程 API 建议使用「分」，通过 `yuanToFen` / `fenToYuan` 转换。  
> 日期时间：统一 ISO-8601（`YYYY-MM-DD` / `YYYY-MM-DDTHH:mm:ss.sssZ`）。

## 1. 角色与可见范围

| 端 | 角色 | 可见范围 | 禁止项 |
|----|------|----------|--------|
| PC 后台 | 总部管理员 / 研学中心负责人 / 招生负责人 | 经营、招生、财务、班期、课表、签到、请假、补课、日志 | 财务事实不得通过测算器或手工改数字覆盖流水 |
| 老师端 | 导师 | 本人课次、课次学员、本人课酬应付 | 不可看完整利润、不可改收款/合同/其他导师课酬 |
| 会员端 | 学员 | 本人报名、合同付款、课表、签到/请假/补课、资料与考试证书状态 | 不可看其他学员、导师成本、中心利润 |

## 2. 核心对象与三端字段

关联一律使用 ID（`businessUnitId` / `cohortId` / `sessionId` / `studentId` / `leadId` / `enrollmentId`），禁止用姓名关联。

### Cohort（班期）

| 字段 | PC | 老师端 | 会员端 | 备注 |
|------|----|--------|--------|------|
| id / displayTitle / status | ✓ | ✓（本人课次所属） | ✓（本人已入班） | 状态文案见 CohortStatus |
| paidCount / totalReceipt / contributionProfit | ✓ | ✗ | ✗ | 经营敏感 |
| venue / classroom / startDate / endDate | ✓ | ✓ | ✓ | |
| lockCount / targetCount / maxCount | ✓ | ✗ | 可选目标展示 | |

### Lead / Enrollment / Receipt / Refund

| 对象 | PC | 老师端 | 会员端 |
|------|----|--------|--------|
| Lead 全字段 | ✓ | ✗ | 仅本人脱敏后基础信息 |
| Enrollment 成交价/付款状态/合同 | ✓ | ✗ | 本人可见 |
| Receipt / Refund 流水 | ✓ | ✗ | 本人可见金额与状态，经办人可脱敏 |

**脱敏规则（会员端 / 对外导出）：**

- 手机号：`138****0001`
- 微信：保留前 2 后 1
- 其他人姓名：不可见
- 导师课酬金额：老师端仅本人；会员端不可见

### TrainingSession / Attendance / Leave / Makeup / TeachingRecord

| 对象 | PC | 老师端 | 会员端 |
|------|----|--------|--------|
| Session 课表 | 全班期 | 本人授课课次 | 本人班期课表（隐藏课酬） |
| Attendance | 全员 | 本人课次可写 | 本人只读 |
| LeaveRequest / MakeupRecord | 可审批/安排 | 可协助查看 | 本人申请与进度 |
| TeachingRecord | 可查看/代录 | 本人提交 | 不可见内部评语（可另开学员反馈字段） |
| MentorPayable | 财务可见 | 本人应付 | ✗ |

## 3. 统一状态文案

状态枚举以 `components/v2/research-center/domain/enums.ts` 为准：

- LeadStage、CohortStatus、SessionStatus、AttendanceStatus、PaymentStatus、LeaveStatus、MakeupStatus、PayableStatus

旧同义状态映射：

- 新增咨询 → 新咨询；正式入班 → 已入班；完成面试 → 已面试；实缴/已缴费 → 已付清

## 4. 三端允许操作（动作码）

动作码见 `domain/permissions.ts`。

| 动作码 | PC 总部 | 中心负责人 | 招生负责人 | 老师 | 助教 | 会员 |
|--------|---------|------------|------------|------|------|------|
| research.lead.view/edit | ✓ | ✓ | ✓ | ✗ | ✗ | 本人 view |
| research.enrollment.create | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| research.receipt.record | ✓ | ✓* | ✓* | ✗ | ✗ | ✗ |
| research.refund.create | ✓ | ✓* | ✗ | ✗ | ✗ | ✗ |
| research.cohort.edit / session.edit | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| research.attendance.edit | ✓ | ✓ | ✗ | 本人课次 | 协助 | ✗ |
| research.leave.approve / makeup.manage | ✓ | ✓ | ✗ | ✗ | ✓ | 本人申请 |
| research.teaching_record.edit | ✓ | ✓ | ✗ | 本人课次 | ✗ | ✗ |
| research.finance.view/edit | ✓ | view | ✗ | ✗ | ✗ | ✗ |
| research.mentor_pay.view | ✓ | ✓ | ✗ | 本人 | ✗ | ✗ |

\* 中心/招生负责人不可直接改已确认财务流水；只能通过业务动作生成 receipt/refund。

## 5. 数据来源

| 端 | 当前原型 | 未来正式 |
|----|----------|----------|
| PC | `createResearchCenterService({ mode: 'local' })` → localStorage `met-research-center-v2.0` | `mode: 'remote'` |
| 老师端 | 未启用 | Remote + 老师权限过滤 |
| 会员端 | 未启用 | Remote + 学员本人过滤 |

业务事件名（`domain/events.ts`）用于操作日志与未来消息通知，不依赖页面组件。

## 6. 服务接口

`ResearchCenterService`（`services/ResearchCenterService.ts`）覆盖咨询、报名财务、班期课程、教学交付、应付与日志。  
页面与 hooks 不得直接调用 `localStorage`；仅 `LocalStorageResearchCenterService` 可读写持久化。
