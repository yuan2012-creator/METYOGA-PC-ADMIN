# MET YOGA PC 后台 V2 店长经营驾驶舱与产品权益配置补充方案

**用于补齐店长经营视角、卡项配置、积分商城与门店经营指标**  
**当前阶段：V2 母版完成后，进入二级页面规划前的产品补充方案**

---

## 1. 背景与问题

### 1.1 V2 母版已完成内容

MET YOGA PC 后台 V2 母版阶段已完成，当前具备以下能力：

| 模块 | Nav ID | 已完成能力摘要 |
|------|--------|----------------|
| 经营总览 | `dashboard-v2` | 总部 / 多店经营判断、四指标卡、风险队列、多店对比 |
| 今日运营 | `today` | 当天执行作战台、签到 / 爽约 / 待处理队列 |
| 会员经营 | `member` | S0–S6 生命周期、风险会员、跟进与匹配 |
| 课程与排课 | `course` | 周供给、排课决策、满班与补排提示 |
| 师资与团队 | `staff` | 老师供给、申请、名下会员、成长 |
| 财务与资产 | `finance` | 财务口径、预收负债、退费 / 冻结 / 转卡、证据链 |
| 活动与获客 | `marketing` | 线索转化、渠道、战役、会员承接 |
| 系统设置 | `settings` | 规则、权限、审批、合同、消息、门店参数 |
| 全局抽屉 | 跨模块 | 6 个业务模块统一抽屉壳、空状态、footer ghost 按钮 |

默认路由为 `dashboard-v2`（经营总览）；主导航固定 8 项，见 `sidebarV2.config.ts`。各模块均为 mock 母版，不接真实 API。

### 1.2 仍存在的两个产品层问题

#### 1.2.1 店长经营视角分散

店长需要知道的不只是「老师和会员」，而是**本店是否健康、今天先做什么**。具体包括：

| 关注维度 | 典型问题 |
|----------|----------|
| 现金流 | 本店现金流是否不足？ |
| 成本 | 成本是否超出预算？ |
| 耗课 | 耗课目标有没有达到？ |
| 负债 | 预收负债是否过高？ |
| 会员规模 | 总会员数是否增长？活跃会员是否稳定？ |
| 退费 / 流失 | 退费是否增加？流失是否增加？ |
| 获客 | 新客转化是否正常？ |
| 供给 | 老师供给是否够？课程满班率是否健康？ |
| 执行 | 今天 / 本周优先处理什么？ |

当前这些信息分别散落在**经营总览、会员经营、课程与排课、师资与团队、财务与资产、活动与获客、今日运营**中。店长需要自行「拼判断」，学习成本高，无法在 30 秒内得到单店经营结论。

#### 1.2.2 产品与权益配置入口不清晰

卡项、点数、预约权益、积分、积分商城、赠送权益、合同绑定等「产品与权益配置」目前被分散在**会员经营、财务与资产、系统设置**的业务区块或抽屉中，没有形成清晰、统一的配置入口。需要明确承接：

- 卡项配置（额度型 / 畅练型 / 体验卡 / 私教包 / 教培产品）
- 点数规则与耗课扣减
- 预约权益（预约窗口、取消 / 请假 / 爽约）
- 取消 / 请假 / 冻结 / 转卡 / 退费规则
- 赠送权益（触发条件、激活、过期、退费不计入）
- 积分规则（获取、扣减、过期、人工调整权限）
- 积分商城（上架、库存、兑换审批）
- 合同模板绑定
- 适用门店与上下架状态
- 会员端展示口径

系统设置中的「核心配置入口地图」尚未包含独立的「产品与权益配置」域，运营与财务难以找到统一配置面。

---

## 2. 总体判断

**当前 V2 母版不是错，而是已经完成了「业务模块完整性」。**  
8 个一级模块覆盖了会员、课程、师资、财务、获客、执行、规则等全业务链路；全局抽屉、设计 token、口径区分（实收 ≠ 确认收入、预收负债 ≠ 收入）均已母版化。

**下一步需要补的是「店长经营理解层」与「产品与权益配置聚合层」**——不是再堆模块，而是在现有框架上增加：

1. 单店经营结论与动作优先级（店长驾驶舱）
2. 卡项 / 积分 / 权益 / 合同的统一配置入口（产品与权益配置）

### 建议阶段顺序

| 阶段 | 内容 | 说明 |
|------|------|------|
| 1 | V2 母版完成 | ✅ 当前状态 |
| 2 | 店长经营驾驶舱与产品权益配置补充 | 本文档范围；mock + 入口地图 |
| 3 | 二级页面规划 | 线索池、卡项详情、权限矩阵等 |
| 4 | 真实接口字段设计 | 对接 `MET_YOGA_ADMIN_REAL_API_FIELD_MAPPING` 等契约 |
| 5 | 权限与审批流设计 | 角色矩阵、配置变更审批 |
| 6 | 三端联动接入 | PC 后台 / 会员端 / 老师端口径一致 |

---

## 3. 店长经营驾驶舱定位

| 项 | 说明 |
|----|------|
| **功能名称** | 店长经营驾驶舱 |
| **适用端口** | PC 后台 |
| **目标用户** | 店长（主）、区域负责人、总部运营；投资人可只读查看 |
| **与经营总览关系** | 经营总览 = 总部 / 多店视角；店长驾驶舱 = **单店经营视角**（建议作为经营总览内的视角切换，不新增一级菜单） |

### 功能目标

让店长打开后台后，**不需要理解 8 个模块的全部逻辑**，也能在 **30 秒内**知道：

1. 本店当前经营状态（健康 / 观察 / 预警 / 高风险）
2. 最大风险是什么
3. 为什么系统这样判断（证据来源）
4. 今天先做什么（≤ 5 条优先动作）
5. 本周先做什么（≤ 5 条经营动作）
6. 需要进入哪个模块处理（可点击下钻）

### 核心原则

| 原则 | 反面（禁止） |
|------|----------------|
| 先结果，后原因 | 先铺大表再让用户自己算 |
| 先动作，后明细 | 只有指标没有「下一步」 |
| 先店长能懂，再给数据证据 | 直接压总部财务口径 |
| 不做大表、不做复杂报表 | Excel 式全量导出当首页 |
| 不把总部财务口径直接压给店长 | 流水账、分录明细上首页 |
| 所有判断都能下钻到对应模块或抽屉 | 孤立结论无法追溯 |

---

## 4. 店长经营驾驶舱信息结构

页面自上而下分为 6 层信息区。所有数据首期均为 **mock**，字段命名与后续 API 对齐。

### 4.1 页面顶部：门店经营结论

**区块目标：** 一屏回答「这家店本月怎么样」。

**示例展示：**

> **滨江馆** · 本月经营状态：**观察**  
> 本月实收正常，但现金安全覆盖率低于 80%，耗课目标完成偏慢，高余额低耗课会员增加，需要优先处理交付和会员风险。

| 字段 | 类型 | 说明 |
|------|------|------|
| `storeId` / `storeName` | string | 门店 |
| `period` | enum | `today` / `week` / `month` / `quarter`；默认 `month` |
| `operatingStatus` | enum | `healthy` / `watch` / `warning` / `highRisk` |
| `statusLabel` | string | 健康 / 观察 / 预警 / 高风险 |
| `primaryReason` | string | 主要原因摘要（≤ 120 字） |
| `judgmentSources` | string[] | 系统判断来源模块，如 `财务与资产`、`会员经营` |
| `updatedAt` | datetime | 数据更新时间 |

**点击行为：** 展开「判断依据」折叠区（证据格，非明细表）；可跳转至 §4.3 对应问题分类。

### 4.2 第一屏核心指标

**区块目标：** 8 个核心指标，卡片式展示，非表格。

| # | 指标名称 | 字段 | 来源模块 |
|---|----------|------|----------|
| 1 | 本月实收 | `receivedAmount` | 财务与资产 |
| 2 | 本月确认收入 | `recognizedRevenue` | 财务与资产 |
| 3 | 经营利润 | `operatingProfit` | 财务与资产 |
| 4 | 现金安全覆盖率 | `cashSafetyCoverageRate` | 财务与资产 |
| 5 | 本月耗课目标完成率 | `consumptionCompletionRate` | 课程与排课 |
| 6 | 预收负债 | `prepaidLiability` | 财务与资产 |
| 7 | 活跃会员数 | `activeMembers` | 会员经营 |
| 8 | 本月退费 / 流失风险 | `refundRiskSummary` | 财务与资产 + 会员经营 |

**每张指标卡包含：**

| 子字段 | 说明 |
|--------|------|
| `currentValue` | 当前值（带单位：元 / % / 人） |
| `momChange` / `yoyChange` | 环比 / 同比（可选展示） |
| `status` | `normal` / `watch` / `warning` / `highRisk` |
| `shortExplanation` | 一句话解释（≤ 40 字） |
| `drillDownModule` | 点击后跳转的 Nav ID + 可选筛选参数 |

**交互：** 点击卡片 → 跳转对应模块并携带 `storeId`、`period`、相关筛选（如「高余额低耗课」）。

### 4.3 经营问题分类

**区块目标：** 将问题按 5 类归因，每类给状态 + 代表问题 + 建议动作 + 入口。

| 分类 | 字段前缀 | 默认入口模块 |
|------|----------|--------------|
| 现金与财务 | `cashFinance` | `finance` |
| 耗课与课程 | `consumptionCourse` | `course` |
| 会员与资产 | `memberAsset` | `member` |
| 老师与供给 | `teacherSupply` | `staff` |
| 获客与转化 | `acquisition` | `marketing` |

**每类展示字段：**

| 字段 | 说明 |
|------|------|
| `categoryStatus` | 该类整体状态 |
| `riskCount` | 当前风险项数量 |
| `representativeIssue` | 代表问题（1 条） |
| `suggestedAction` | 建议动作（1 条） |
| `entryModule` | 进入模块 Nav ID |
| `entryLabel` | 按钮文案，如「进入财务与资产」 |

**示例 — 现金与财务：**

| 项 | 值 |
|----|-----|
| 状态 | 观察 |
| 原因 | 现金安全覆盖率 72%，低于安全线 80% |
| 建议 | 优先处理高余额低耗课会员与退费证据链 |
| 入口 | 财务与资产 |

### 4.4 今日优先动作

**区块目标：** 当天必须处理的事项，**最多 3 条，不得超过 5 条**。

| 字段 | 类型 | 说明 |
|------|------|------|
| `priority` | enum | `P0` / `P1` / `P2` |
| `title` | string | 事项标题 |
| `impactScope` | string | 影响对象，如「预收负债与现金安全」 |
| `dueAt` | datetime | 截止时间（今日内 / 具体时点） |
| `ownerRole` | string | 负责人角色或姓名 |
| `sourceModules` | string[] | 来源模块 |
| `suggestedAction` | string | 建议动作 |
| `ctaLabel` | string | 按钮文案 |
| `ctaTarget` | object | `{ navId, filter?, drawerType? }` |

**示例：**

> **P0**｜跟进 12 名高余额低耗课会员  
> 影响：预收负债与现金安全  
> 来源：会员经营 / 财务与资产  
> 动作：分配老师或管家跟进  
> 按钮：`去会员经营`

### 4.5 本周经营动作

**区块目标：** 本周需推进的经营事项，**最多 5 条**。

典型事项类型：

- 补排课程（耗课缺口）
- 老师申请处理（师资与团队）
- 续费窗口会员跟进（会员经营）
- 活动线索跟进（活动与获客）
- 退费 / 冻结 / 转卡处理（财务与资产）
- 成本超支复核（财务与资产）

字段结构与 §4.4 类似，但 `dueAt` 为本周内，`priority` 可为 P1 / P2 为主。

### 4.6 经营明细入口

**区块目标：** 不直接铺明细，提供**模块入口快捷区**。

| 入口文案 | 目标模块 | 携带上下文 |
|----------|----------|------------|
| 查看会员风险 | `member` | 风险筛选 ON |
| 查看耗课目标 | `course` | 本月耗课视图 |
| 查看财务资产 | `finance` | 单店 + 本月 |
| 查看师资供给 | `staff` | 负载 / 申请待办 |
| 查看活动转化 | `marketing` | 漏斗 + 线索队列 |
| 查看今日运营 | `today` | 当日执行 |

---

## 5. 店长经营指标体系

以下指标为店长驾驶舱的数据契约草案。所有金额单位：**元（CNY）**；比率单位：**%**；人数单位：**人**。

### 5.1 收入与现金指标

| 字段 | 中文名 | 类型 | 说明 |
|------|--------|------|------|
| `receivedAmount` | 本月实收 | number | 当期实际到账现金 |
| `recognizedRevenue` | 本月确认收入 | number | 按履约 / 耗课规则确认的经营收入 |
| `operatingProfit` | 经营利润 | number | 确认收入 − 成本 |
| `prepaidLiability` | 预收负债 | number | 会员已付未履约部分 |
| `cashSafetyCoverageRate` | 现金安全覆盖率 | number | 0–100%，安全线见下 |
| `cashSafetyLine` | 安全线 | number | 默认 **80%** |
| `pendingRefundAmount` | 待退费金额 | number | 已申请未完结退费 |
| `expectedCashBalance` | 预计现金余额 | number | 考虑预收与待退后的预估 |

**解释口径（必须在 UI 与帮助文案中体现）：**

| 概念 | 正确理解 | 常见误区 |
|------|----------|----------|
| 实收金额 | 现金到账 | ≠ 确认收入 |
| 确认收入 | 已履约确认的经营收入 | ≠ 实收 |
| 预收负债 | 已收未交付义务 | **不是收入** |
| 经营利润 | 确认收入 − 成本 | ≠ 实收 − 支出 |
| 现金安全覆盖率 | 现金对义务覆盖程度 | < 80% **不应显示健康** |

### 5.2 成本指标

| 字段 | 中文名 | 类型 |
|------|--------|------|
| `totalCost` | 本月总成本 | number |
| `laborCost` | 人工成本 | number |
| `teacherFeeEstimate` | 老师课酬预估 | number（**店长视图仅显示预估总额，不显示个人明细**） |
| `rentCost` | 房租成本 | number |
| `marketingCost` | 活动 / 获客成本 | number |
| `operationCost` | 运营成本 | number |
| `costBudget` | 成本预算 | number |
| `costUsageRate` | 成本使用率 | number（%） |
| `costOverrunRisk` | 成本超支风险 | enum |

**判断规则：**

| `costUsageRate` | 状态 |
|-----------------|------|
| ≤ 80% | 正常 |
| 80%–95% | 观察 |
| 95%–105% | 预警 |
| > 105% | 高风险 |

### 5.3 耗课指标

| 字段 | 中文名 | 类型 |
|------|--------|------|
| `monthlyConsumptionTarget` | 本月耗课目标 | number（点数） |
| `consumedPoints` | 已耗课点数 | number |
| `consumptionCompletionRate` | 完成率 | number（%） |
| `remainingConsumptionPoints` | 剩余目标 | number |
| `dailyRequiredConsumption` | 日均还需耗课 | number |
| `lowAttendanceClasses` | 低满班课程数 | number |
| `refillOpportunityClasses` | 可补耗课程数 | number |
| `timeProgressRate` | 时间进度 | number（%），用于对比完成率 |

**判断规则：**

| 条件 | 系统提示 |
|------|----------|
| 完成率 < 时间进度 − 10% | 预警 |
| 可补耗空间高但未排课 | 提示进入「课程与排课」 |
| 耗课不足且 `highBalanceLowConsumptionMembers` 增加 | 联动「会员经营」 |

### 5.4 会员结构指标

| 字段 | 中文名 | 类型 |
|------|--------|------|
| `totalMembers` | 总会员数 | number |
| `activeMembers` | 活跃会员数 | number |
| `newMembers` | 新成交会员 | number |
| `stableMembers` | 稳定练习会员 | number |
| `lowFrequencyMembers` | 低频风险会员 | number |
| `renewalWindowMembers` | 续费窗口会员 | number |
| `sleepingMembers` | 沉睡流失会员 | number |
| `highBalanceLowConsumptionMembers` | 高余额低耗课会员 | number |

**与 S0–S6 生命周期对应：**

| 阶段 | 代码 | 含义 | 驾驶舱归类 |
|------|------|------|------------|
| S0 | 新线索 | 未成交线索 | 获客与转化 |
| S1 | 体验待转化 | 已体验未成交 | 获客与转化 |
| S2 | 新成交激活 | 新会员激活期 | 新成交会员 |
| S3 | 稳定活跃 | 稳定练习 | 稳定练习会员 |
| S4 | 低频风险 | 出勤下降 | 低频风险会员 |
| S5 | 续费窗口 | 临近到期 / 余额不足 | 续费窗口会员 |
| S6 | 沉睡流失 | 长期未活跃 / 已流失 | 沉睡流失会员 |

### 5.5 退费与流失指标

| 字段 | 中文名 | 类型 |
|------|--------|------|
| `refundRequestCount` | 退费申请数 | number |
| `refundAmount` | 退费金额 | number |
| `pendingRefundCases` | 待处理退费 | number |
| `freezeRequestCount` | 冻结申请 | number |
| `transferRequestCount` | 转卡申请 | number |
| `churnedMembers` | 已流失会员 | number |
| `churnRiskMembers` | 流失风险会员 | number |
| `churnRate` | 流失率 | number（%） |
| `refundReasonTop` | 主要退费原因 | string |

**退费原因分类（`refundReasonCategory`）：**

`courseExperience` 课程体验 · `storeDistance` 门店距离 · `timeMismatch` 时间不匹配 · `teacherChange` 老师调整 · `validityDispute` 有效期争议 · `contractRule` 合同规则 · `personal` 个人原因 · `other` 其他

### 5.6 获客与转化指标

| 字段 | 中文名 | 类型 |
|------|--------|------|
| `leads` | 线索数 | number |
| `consultations` | 咨询数 | number |
| `trialBookings` | 预约体验 | number |
| `trialArrivals` | 到店体验 | number |
| `conversions` | 成交人数 | number |
| `conversionRate` | 成交率 | number（%） |
| `biggestDropOff` | 最大断点 | string |
| `bestChannel` | 最佳渠道 | string |
| `lowEfficiencyChannel` | 低效渠道 | string |

漏斗阶段与营销模块一致：`曝光 → 咨询 → 预约体验 → 到店体验 → 成交会员 → 进入会员经营`。

### 5.7 师资供给指标

| 字段 | 中文名 | 类型 |
|------|--------|------|
| `availableTeachers` | 可用老师 | number |
| `overloadedTeachers` | 负载偏高老师 | number |
| `substituteAvailableTeachers` | 可代课老师 | number |
| `teacherRequestsPending` | 老师端待处理申请 | number |
| `teacherOwnedMemberRiskCount` | 老师名下会员风险数 | number |
| `courseCoverageRisk` | 课程覆盖风险 | boolean / string |

**隐私边界：** 不展示老师个人工资、课时费明细；仅展示供给与负载摘要。

---

## 6. 店长经营驾驶舱状态设计

整体状态 `operatingStatus` 由多指标加权判定，首期可用规则引擎 mock，后续对接真实计算服务。

### 6.1 健康（`healthy`）

**展示标签：** 健康

**条件示例（需同时满足或仅轻微偏离）：**

- `cashSafetyCoverageRate` ≥ 80%
- `consumptionCompletionRate` ≥ `timeProgressRate`（不低于时间进度）
- `costUsageRate` ≤ 80%
- `highBalanceLowConsumptionMembers` 环比未明显增加（< 5%）
- `pendingRefundCases` 在门店基线内
- `churnRate` 未超门店基线

### 6.2 观察（`watch`）

**展示标签：** 观察

**条件示例：**

- 有 **1–2 项**指标轻微偏离
- `cashSafetyCoverageRate` 70%–80%
- 耗课进度落后时间进度 **5%–10%**
- `lowFrequencyMembers` 环比增加
- `costUsageRate` 80%–95%

### 6.3 预警（`warning`）

**展示标签：** 预警

**条件示例（满足任一即可触发，需组合展示原因）：**

- `cashSafetyCoverageRate` < 70%
- `costUsageRate` > 95%
- 耗课进度落后时间进度 **> 10%**
- `refundRequestCount` 明显增加（超基线 20%）
- `highBalanceLowConsumptionMembers` 明显增加

### 6.4 高风险（`highRisk`）

**展示标签：** 高风险

**条件示例：**

- `cashSafetyCoverageRate` < 60%
- `operatingProfit` < 0（本月经营利润为负）
- `refundAmount` 明显异常（超基线或单笔集中）
- 已收未交付压力无法覆盖（负债 / 现金模型触发）
- **多项核心指标同时异常**（≥ 3 项预警条件）

**UI 要求：** 高风险态必须在结论区使用 P0 视觉层级，且第一条今日动作必须为 P0。

---

## 7. 店长经营驾驶舱与现有模块关系

店长驾驶舱**不是新增孤立模块**，而是**聚合入口 + 判断层**。数据来源于各模块已有 mock / 未来 API，驾驶舱本身不重复维护明细账本。

| 现有模块 | 与驾驶舱关系 |
|----------|--------------|
| **经营总览** | 总部视角 / 多店视角；驾驶舱作为其「店长视角」子模式 |
| **店长驾驶舱** | 单店经营视角；结论 + 动作 + 下钻 |
| **今日运营** | 当天执行；驾驶舱「今日优先动作」可跳转至此 |
| **会员经营** | 会员风险、S 阶段、跟进；耗课与余额联动 |
| **课程与排课** | 耗课目标、满班、补排 |
| **师资与团队** | 老师供给、名下会员风险 |
| **财务与资产** | 现金、负债、退费、利润、成本 |
| **活动与获客** | 线索、渠道、转化断点 |
| **系统设置** | 规则与阈值（安全线 80% 等）的配置来源 |

### 实现方案对比

#### 方案 A：在经营总览中增加视角切换（总部视角 / 店长视角）

| 维度 | 说明 |
|------|------|
| **做法** | Header 增加 `viewMode: hq | storeManager`；`storeManager` 时展示 §4 结构，隐藏多店对比 |
| **优点** | 不膨胀导航；经营总览天然承接经营判断；总部与店长共用框架与 token；可按角色默认视角 |
| **缺点** | 单文件复杂度上升；需清晰区分两套 mock 数据结构 |
| **对现有 8 模块影响** | 无；仅改 `dashboard-v2` 模块内部 |

#### 方案 B：新增一级模块「门店驾驶舱」

| 维度 | 说明 |
|------|------|
| **做法** | `sidebarV2.config.ts` 增加第 9 项 |
| **优点** | 入口显眼；与经营总览代码解耦 |
| **缺点** | 导航膨胀；与「经营总览」定位重叠；总部用户多一个空模块 |
| **对现有 8 模块影响** | 需改导航配置（当前阶段禁止） |

### 建议

**优先采用方案 A：在「经营总览」中增加「总部视角 / 店长视角」切换，不新增一级菜单。**

理由：

1. V2 母版已约定主导航仅 8 项，避免导航膨胀
2. 经营总览的定位本就是「经营判断」，店长视角是其自然延伸
3. 总部与区域负责人可在同一页面切换视角，减少重复建设
4. 后续可按角色默认进入：`storeManager` 角色默认店长视角，`hqAdmin` 默认总部视角

---

## 8. 店长驾驶舱页面结构草案

### 8.1 顶部工具栏

| 控件 | 字段 | 说明 |
|------|------|------|
| 门店选择 | `storeId` | 店长默认本店；总部 / 区域可选多店中某一店 |
| 周期选择 | `period` | 今日 / 本周 / 本月 / 本季 |
| 视角切换 | `viewMode` | `hq` 总部视角 · `storeManager` 店长视角 |
| 导出 / 分享 | — | **P2 后置**，首期 toast 占位 |

**角色权限：**

| 角色 | 门店选择 | 视角切换 | 导出 |
|------|----------|----------|------|
| 店长 | 仅本店 | 仅店长视角（或锁定） | 只读 / 后置 |
| 区域负责人 | 辖区内门店 | 可切换 | 可后置开放 |
| 总部运营 | 全部门店 | 可切换 | 可后置开放 |
| 投资人 | 授权门店 | 只读 | 只读报告 |

### 8.2 第一屏

| 区块 | 页面目标 | 主要字段 | 点击去向 |
|------|----------|----------|----------|
| 门店经营状态卡 | 30 秒结论 | §4.1 全部 | 展开证据 → §4.3 |
| 核心经营指标 | 8 指标快照 | §4.2 | 各模块 + 筛选 |
| 今日优先动作 | 当天 P0–P2 | §4.4 | 模块 / 抽屉 |

### 8.3 第二屏

| 区块 | 页面目标 | 主要字段 | 点击去向 |
|------|----------|----------|----------|
| 经营问题分类 | 五类归因 | §4.3 | 对应模块 |
| 耗课目标进度 | 交付压力 | §5.3 | `course` |
| 成本压力 | 预算使用 | §5.2 | `finance` |
| 现金安全与预收负债 | 现金风险 | §5.1 | `finance` 抽屉 |

### 8.4 第三屏

| 区块 | 页面目标 | 主要字段 | 点击去向 |
|------|----------|----------|----------|
| 会员结构 | S 阶段分布 | §5.4 | `member` |
| 退费与流失 | 风险趋势 | §5.5 | `finance` / `member` |
| 获客转化 | 漏斗摘要 | §5.6 | `marketing` |
| 师资供给 | 供给缺口 | §5.7 | `staff` |

### 8.5 第四屏

| 区块 | 页面目标 | 主要字段 | 点击去向 |
|------|----------|----------|----------|
| 本周经营动作 | 周计划 | §4.5 | 各模块 |
| 明细入口 | 快捷导航 | §4.6 | 各模块 |
| 证据链入口 | 审计追溯 | 证据类型列表 | `finance` / `settings` 抽屉 |

**布局原则：** 保持 V2 母版卡片栅格与 `v2DesignTokens`；店长视角**不引入新抽屉类型**，优先跳转已有模块抽屉。

---

## 9. 产品与权益配置定位

| 项 | 说明 |
|----|------|
| **功能名称** | 产品与权益配置 |
| **适用端口** | PC 后台 → **系统设置**子域 |
| **目标用户** | 总部管理员、运营负责人、财务（查看）；店长只读或提交调整申请 |
| **功能目标** | 统一管理卡项、点数、预约权益、积分规则、积分商城、赠送权益、合同绑定、适用门店 |

**不建议初期做成一级菜单**，应先作为**系统设置中的核心入口**（与规则、权限、审批、合同并列）。

---

## 10. 产品与权益配置内容结构

以下 7 个子模块首期以**入口卡片 + 摘要抽屉**承接，完整二级页为 P1–P2。

### 10.1 卡项配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `cardTypeId` | string | 卡项 ID |
| `cardName` | string | 卡项名称 |
| `cardCategory` | enum | `quota` 额度型 / `unlimited` 畅练型 / `trial` 体验卡 / `private` 私教包 / `ttc` 教培产品 |
| `price` | number | 售价（元） |
| `pointsTotal` | number | 包含点数 / 次数 |
| `validityDays` | number | 有效天数 |
| `bookingWindowDays` | number | 可预约窗口（天） |
| `applicableStores` | string[] | 适用门店 ID 列表 |
| `applicableCourses` | string[] | 适用课程类型 |
| `transferAllowed` | boolean | 是否允许转卡 |
| `freezeAllowed` | boolean | 是否允许冻结 |
| `refundRuleId` | string | 关联退费规则 |
| `contractTemplateId` | string | 关联合同模板 |
| `status` | enum | `draft` / `active` / `inactive` / `archived` |
| `visibleOnMemberApp` | boolean | 会员端是否展示 |
| `salesChannel` | string[] | 销售渠道 |
| `createdBy` | string | 创建人 |
| `updatedAt` | datetime | 更新时间 |

**列表展示：** 卡项名称、类别、价格、状态、适用门店数、会员端可见；**不做无边栏大表**，用卡片 + 筛选。

### 10.2 点数与耗课规则

| 字段 | 类型 | 说明 |
|------|------|------|
| `courseType` | string | 课程类型 |
| `defaultPointCost` | number | 默认扣点 |
| `teacherLevelMultiplier` | object | 老师等级倍率 |
| `classCapacityRule` | object | 满班 / 开班人数规则 |
| `minOpenClassCount` | number | 最低开班人数 |
| `cancelDeductRule` | object | 取消扣点规则 |
| `noShowDeductRule` | object | 爽约扣点规则 |
| `makeUpRule` | object | 补课规则 |
| `crossStoreSettlementRule` | object | 跨店耗课结算规则 |

**联动：** 课程与排课（扣点展示）、今日运营（签到 / 爽约）、财务与资产（确认收入）。

### 10.3 预约与权益规则

| 字段 | 类型 | 说明 |
|------|------|------|
| `bookingWindow` | number | 预约窗口（小时 / 天） |
| `cancelDeadline` | number | 取消截止时间 |
| `lateCancelRule` | object | 临期取消规则 |
| `noShowRule` | object | 爽约规则 |
| `leaveRequestAllowed` | boolean | 是否允许请假 |
| `freezeMaxDays` | number | 冻结最长天数 |
| `transferFeeRule` | object | 转卡手续费规则 |
| `refundServiceFeeRule` | object | 退费服务费规则 |
| `giftBenefitActivationRule` | object | 赠送权益激活规则 |
| `giftBenefitExpiryRule` | object | 赠送权益过期规则 |

### 10.4 积分规则

| 字段 | 类型 | 说明 |
|------|------|------|
| `pointsEarnRule` | enum | 获取规则类型 |
| `pointsEarnRatio` | number | 消费积分比例 |
| `fixedPointsPerClass` | number | 每节课固定积分 |
| `openingCardBonusPoints` | number | 开卡赠送积分 |
| `expiryRule` | object | 过期规则 |
| `refundDeductRule` | object | 退费时积分扣回 |
| `transferDeductRule` | object | 转卡时积分处理 |
| `manualAdjustPermission` | string[] | 可人工调整的角色 |
| `visibleOnMemberApp` | boolean | 会员端展示口径 |

**口径：** 积分**不是现金**，不可与实收 / 确认收入混排。

### 10.5 积分商城配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `productId` | string | 商品 ID |
| `productName` | string | 商品名称 |
| `productType` | enum | `physical` 实物 / `course` 课程权益 / `merch` 周边 / `service` 服务权益 |
| `pointsPrice` | number | 兑换所需积分 |
| `stock` | number | 库存 |
| `redeemLimit` | number | 每人限兑 |
| `applicableStores` | string[] | 适用门店 |
| `shelfStatus` | enum | `draft` / `onShelf` / `offShelf` / `soldOut` |
| `redeemApprovalRequired` | boolean | 兑换是否需审批 |
| `deliveryMethod` | enum | 自提 / 邮寄 / 自动发放权益 |
| `exchangeRecord` | link | 兑换记录入口 |
| `riskNote` | string | 风险说明 |

### 10.6 赠送权益配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `giftBenefitName` | string | 权益名称 |
| `triggerCondition` | object | 触发条件（开卡 / 活动 / 人工） |
| `benefitType` | enum | 点数 / 课程 / 周边 / 服务 |
| `benefitValue` | number | 权益值 |
| `activationRule` | object | 激活规则 |
| `expiryDays` | number | 有效天数 |
| `refundIncluded` | boolean | **默认 false**：退费时是否计入可退金额 |
| `transferIncluded` | boolean | **默认 false**：转卡时是否转移 |
| `useAfterMainCardOnly` | boolean | 是否主卡用完后再用 |
| `status` | enum | `draft` / `active` / `inactive` |

### 10.7 合同与条款绑定

| 字段 | 类型 | 说明 |
|------|------|------|
| `contractTemplateId` | string | 合同模板 ID |
| `keyTerms` | string[] | 关键条款摘要 |
| `cardBinding` | string[] | 绑定卡项 ID |
| `refundTerms` | text | 退费条款 |
| `freezeTerms` | text | 冻结条款 |
| `transferTerms` | text | 转卡条款 |
| `pointsTerms` | text | 积分条款 |
| `giftBenefitTerms` | text | 赠送权益条款 |
| `memberAppVisible` | boolean | 会员端可见 |
| `signRequired` | boolean | 是否必须签署 |

---

## 11. 产品与权益配置权限设计

### 11.1 角色定义

| 角色 | 代码 | 说明 |
|------|------|------|
| 总部管理员 | `hqAdmin` | 全量配置权 |
| 运营负责人 | `opsLead` | 业务规则编辑与提交审核 |
| 财务 | `finance` | 价格、退款、结算、积分影响查看 |
| 店长 | `storeManager` | 本店只读 + 申请调整 |
| 前台 / 管家 | `frontDesk` | 可售卡项与会员权益查看 |
| 老师 | `teacher` | 课程消耗相关必要信息 |

### 11.2 权限矩阵

| 能力 | 总部管理员 | 运营负责人 | 财务 | 店长 | 前台 / 管家 | 老师 |
|------|:----------:|:----------:|:----:|:----:|:-----------:|:----:|
| 创建 / 编辑卡项 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 上下架 / 归档卡项 | ✅ | 提交审核 | ❌ | ❌ | ❌ | ❌ |
| 修改价格 | ✅ | 提交审核 | 查看 | ❌ | ❌ | ❌ |
| 编辑点数 / 耗课规则 | ✅ | ✅ | 查看 | ❌ | ❌ | 查看摘要 |
| 编辑预约 / 权益规则 | ✅ | ✅ | ❌ | 申请 | ❌ | 查看摘要 |
| 编辑退费 / 冻结 / 转卡规则 | ✅ | 提交审核 | 查看 + 复核 | ❌ | ❌ | ❌ |
| 积分规则 | ✅ | ✅ | 查看影响 | 只读 | 只读 | ❌ |
| 积分商城配置 | ✅ | ✅ | 查看 | 本店只读 | 只读 | ❌ |
| 赠送权益配置 | ✅ | ✅ | 查看 | 只读 | 只读 | ❌ |
| 合同模板绑定 | ✅ | 查看 | 查看 | 只读 | ❌ | ❌ |
| 查看全部适用门店 | ✅ | ✅ | ✅ | 本店 | 本店 | ❌ |
| 提交调整申请 | — | — | — | ✅ | ❌ | ❌ |
| 查看可售卡项 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 查看会员权益 | ✅ | ✅ | ✅ | ✅ | ✅ | 必要范围 |

### 11.3 审批建议（P2）

配置变更涉及价格、退费规则、合同条款时，须走**审批流**（系统设置已有审批占位）：`draft → pendingApproval → active`。

---

## 12. 产品与权益配置与现有模块关系

| 模块 | 关系 |
|------|------|
| **系统设置** | **配置入口宿主**；入口地图增加「产品与权益配置」域 |
| **会员端** | 展示可售卡项、权益状态、积分商城（只读消费） |
| **会员经营** | 查看会员资产、积分余额、权益状态、S 阶段 |
| **财务与资产** | 预收负债、退费、冻结、转卡、积分财务影响计算 |
| **今日运营** | 签到、爽约、扣点执行（规则来源） |
| **课程与排课** | 课程点数消耗、满班规则 |
| **活动与获客** | 活动产品、体验卡、渠道专属卡项 |
| **合同** | 签署、版本、证据链（settings 合同抽屉延伸） |

**原则：** 业务页只展示**配置结果**（会员有什么卡、多少点），不负责改规则；所有规则变更归产品与权益配置。

---

## 13. 是否需要新增一级菜单

### 13.1 店长驾驶舱

| 项 | 结论 |
|----|------|
| **是否新增一级菜单** | **否** |
| **建议** | 在「经营总览」中增加「店长视角」 |
| **理由** | 避免导航膨胀；经营总览天然承接经营判断；总部与店长共用框架；可按角色默认视角 |

### 13.2 产品与权益配置

| 项 | 结论 |
|----|------|
| **是否新增一级菜单** | **否** |
| **建议** | 放入「系统设置」作为核心入口 |
| **理由** | 卡项、积分、合同、权益本质是规则配置；不应让店长随意修改；总部统一配置利于连锁复制；业务页只展示结果 |

**当前阶段约束：** 保持 `sidebarV2.config.ts` 8 项不变，直至二级页面与权限成熟后再评估是否独立入口。

---

## 14. 后续开发优先级

### P0（下一阶段首选，仍保持 mock）

| # | 任务 | 改动范围 | 交付物 |
|---|------|----------|--------|
| 1 | 经营总览增加「总部视角 / 店长视角」切换 | `components/v2/dashboard/*` | Header 切换 + 店长视角母版区块 |
| 2 | 系统设置入口地图增加「产品与权益配置」 | `components/v2/settings/*` | 入口卡片 + 跳转抽屉类型 |

### P1（二级页面规划期）

| # | 任务 | 交付物 |
|---|------|--------|
| 1 | 店长驾驶舱指标 mock 与完整页面结构 | `dashboardV2.viewModel.ts` 扩展 `storeManagerView` |
| 2 | 产品与权益配置摘要抽屉 | `settings` 新 drawerType `productRights` |
| 3 | 卡项配置二级页信息架构 | IA 文档 + 列表 / 详情线框 |
| 4 | 积分商城配置二级页信息架构 | 同上 |

### P2（接口与生产化）

| # | 任务 |
|---|------|
| 1 | 真实接口字段（对齐 `MET_YOGA_ADMIN_REAL_API_FIELD_MAPPING`） |
| 2 | 权限审批（配置变更 workflow） |
| 3 | 会员端展示联动 |
| 4 | 财务口径联动（预收、积分、赠送权益） |
| 5 | 操作日志与审计导出 |

---

## 15. 给 Cursor 的后续执行建议

**下一步不应直接大改全部页面。** 建议按以下顺序小步迭代：

1. **经营总览**增加 `viewMode` 切换 UI（总部 / 店长），默认仍 HQ；不改 `App.tsx` 路由
2. **店长视角**只做母版 mock：§4.1 结论 + §4.2 八指标 + §4.4 今日动作；第二屏后可分批
3. **系统设置**「核心配置入口地图」增加一张 **产品与权益配置** 卡片（与规则、合同并列）
4. **产品与权益配置**先用**抽屉**承接 7 个子域摘要（名称、状态、待补齐项），不建设完整二级页
5. **不接真实接口**；扩展 viewModel 时仅增 mock 字段，不改其他模块 viewModel
6. **不改变现有 8 模块导航**；不修改 `sidebarV2.config.ts` 除非产品单独立项
7. 店长视角的下钻统一用 `onNavigate(navId, context)` 模式，与母版 toast 占位兼容
8. 复用 `v2DesignTokens` 与全局抽屉壳；新产品权益抽屉类型遵循 `met-v2-drawer-*` 规范

**建议新增 mock 类型（供开发参考）：**

```typescript
// dashboardV2.viewModel.ts — 仅作后续参考，本轮不实现
type StoreManagerDashboardSnapshot = {
  conclusion: StoreOperatingConclusion;
  coreMetrics: StoreCoreMetric[];
  issueCategories: StoreIssueCategory[];
  todayActions: StorePriorityAction[];
  weekActions: StorePriorityAction[];
  drillDownEntries: DrillDownEntry[];
};
```

```typescript
// settingsV2.viewModel.ts — 仅作后续参考，本轮不实现
type ProductRightsConfigSummary = {
  cardProducts: { active: number; draft: number; inactive: number };
  pointRules: { configured: boolean; lastUpdated: string };
  bookingRules: { configured: boolean; pendingItems: number };
  pointsMall: { onShelf: number; soldOut: number };
  giftBenefits: { active: number };
  contractBindings: { bound: number; missing: number };
};
```

---

## 16. 禁止事项

后续开发**明确禁止**以下做法：

| # | 禁止项 | 原因 |
|---|--------|------|
| 1 | 新增过多一级菜单 | 导航膨胀，违背 V2 8 模块约定 |
| 2 | 把店长驾驶舱做成总部经营总览复制版 | 店长需要单店结论与动作，不是多店对比 |
| 3 | 把卡项配置做成普通无边栏大表 | 不符合 V2 卡片 + 抽屉交互母版 |
| 4 | 让店长直接改价格、退费规则、合同 | 连锁风险与合规 |
| 5 | 混淆实收、确认收入、预收负债、经营利润 | 财务口径错误 |
| 6 | 把积分当现金 | 合规与会计风险 |
| 7 | 把赠送权益计入退费 | `refundIncluded` 默认 false |
| 8 | 出现 AI 推荐 | 产品边界 |
| 9 | 自动群发 | 产品边界（仅可在权限禁止项中说明） |
| 10 | 暴露会员敏感信息（身份证、完整手机号等） | 隐私合规 |
| 11 | 显示老师工资或课时费明细 | 店长视图仅供给摘要 |
| 12 | 在本阶段修改路由 / `App.tsx` / 其他 7 个业务模块 | 范围控制 |

---

## 附录 A：文档修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-06-21 | 初版：店长驾驶舱 + 产品与权益配置补充方案 |

---

## 附录 B：相关文档索引

| 文档 | 用途 |
|------|------|
| `docs/MET_YOGA_PC_ADMIN_V2_TEMPLATE_ARCHIVE.md` | V2 母版归档与 8 模块边界 |
| `docs/MET_YOGA_ADMIN_REAL_API_FIELD_MAPPING.md` | 真实 API 字段映射 |
| `docs/MET_YOGA_ADMIN_REAL_DATABASE_SCHEMA_DESIGN.md` | 库表与权益账本设计 |
| `docs/MET_YOGA_ADMIN_DATA_PERMISSION_WRITE_BOUNDARY.md` | 数据权限与写入边界 |

---

*本文档仅作产品规划，不触发任何代码变更。实施前须与产品、财务、运营确认口径与权限。*
