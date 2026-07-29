# MET YOGA PC 后台｜真实数据源、权限、写入边界盘点 v1

> **用途**：接真实数据库 / 接口前的基线文档；描述**当前代码行为**，非最终产品权限定稿。  
> **盘点范围**：仓库内 `components/*`、`utils/*`、`constants.ts`、`App.tsx` 的静态检索与模块阅读（截至文档编写时）。  
> **全局结论**：未发现 `fetch` / `axios`、`localStorage` / `sessionStorage`、云函数 SDK 调用；业务数据变更均发生在 **React 内存 state** 或 **纯展示**，刷新即丢失（除非后续接入持久化）。

---

## 1. 当前各模块数据来源

### 经营总览（`Dashboard`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_ALERTS`、`MOCK_MHS_DATA`、`MOCK_TEAM_TASKS` 等（见 `Dashboard.tsx` 引用）。 |
| **selector / utils** | `utils/dashboardSelectors.ts`、`utils/partnerSelectors.ts`；财务摘要片段通过 `dashboardSelectors` 间接使用 `utils/financeSelectors`（如 `buildFinanceOverviewSummary`）。 |
| **真实接口** | 无。 |
| **真实写入** | 无服务端写入；仅 `useState` 切换 MHS 雷达维度（UI 状态）。 |
| **建议接入的真实对象** | 门店 KPI、告警事件、团队任务、MHS 维度分、支付/退款/分录汇总、合作门店主数据与合作授权治理事实表（只读聚合为主）。 |

### 今日运营（能力落在课程运营页 + 经营总览）

| 维度 | 说明 |
|------|------|
| **mock / constants** | 与课程运营同源：`MOCK_COURSE_SESSIONS`、`MOCK_BOOKINGS`、`MOCK_ATTENDANCES`、`MOCK_COURSES`、`MOCK_MEMBERS` 及 `utils/courseOpsScenarioFixtures` 合并数据。 |
| **selector / utils** | `utils/courseSelectors.ts`、`utils/courseSessionChange.ts`、`utils/courseSchedulePublish.ts`、`utils/courseSessionSettlement.ts` 等。 |
| **真实接口** | 无。 |
| **真实写入** | 无；排课/签到等为 **Courses 内 state**（见第 2 节）。 |
| **建议接入** | 当日场次、教室占用、预约名单、签到事实、异常工单、运营待办队列。 |

### 会员经营（`Members`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_MEMBERS` 及订单/合同/支付/退款/资产/预约/到课/分录等（`Members.tsx` 合并 `memberOpsScenarioFixtures`）。 |
| **selector / utils** | `utils/memberLifecycle.ts`、`utils/memberPresentation.ts`、`utils/memberListSelectors.ts`、`utils/memberOpsScenarioFixtures.ts`。 |
| **真实接口** | 无。 |
| **真实写入** | 无对会员主列表的 `setMembers`；主要为筛选、选中会员、Toast 等 UI state。 |
| **建议接入** | 会员主档、生命周期、风险标签、跟进记录、权益与资产引用（只读 + 受控写入跟进）。 |

### 课程运营（`Courses`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_COURSES`、`MOCK_COURSE_SESSIONS`、`MOCK_BOOKINGS`、`MOCK_ATTENDANCES` + 场景 fixtures。 |
| **selector / utils** | `utils/courseSelectors.ts`、`utils/courseSessionChange.ts`、`utils/courseSchedulePublish.ts`、`utils/courseSessionSettlement.ts`、`utils/courseOpsScenarioFixtures.ts`。 |
| **真实接口** | 无。 |
| **真实写入** | **有内存演示写入**：`scheduleEvents`、`bookings`、`attendances`、`libraryList`、`mockConsumptions`、`mockTeacherSessionPays`、`mockFinanceLedgerEntries` 等（见第 2 节）。 |
| **建议接入** | 课程库、场次、预约、签到/消课、代课/调课/取消审批流、教室与教练资源。 |

### 产品与合同（`Mall`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_*` 订单/合同/支付/退款/资产/卡/积分/TTC + `mallOrderScenarioFixtures`。 |
| **selector / utils** | `utils/mallSelectors.ts`、`utils/mallAssetGrant.ts`、`utils/mallRefundRequest.ts`、`utils/mallFreezeRequest.ts`、`utils/mallTransferRequest.ts` 等。 |
| **真实接口** | 无。 |
| **真实写入** | **有内存演示写入**：`orders`、`contracts`、`memberAssets`、商品编辑 state、退款/转卡**草稿**字典等；`payments` / `refunds` 当前为 **state 只读初始化**（无 `setPayments` / `setRefunds`）。 |
| **建议接入** | 商品（卡/课包/积分）、订单、合同、支付流水、退款单、会员资产、冻结/转卡审批单。 |

### 财务管理（`Finance`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_ORDERS`、`MOCK_PAYMENTS`、`MOCK_REFUNDS`、`MOCK_FINANCE_LEDGER_ENTRIES`、费用/课时/跨店等 mock。 |
| **selector / utils** | `utils/financeSelectors.ts`（大量聚合与明细 builder）。 |
| **真实接口** | 无。 |
| **真实写入** | 无 `setFinanceLedger` 等；子 Tab、日期筛选、订单筛选、Toast 为 UI state；分录数据来自常量引用。 |
| **建议接入** | 总账分录、对账状态、退款核销、预收/收入确认、费用与薪酬凭证、报表期间。 |

### 师资与团队（`Staff`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_STAFF_LIST` 等（经 `Staff.tsx` / selectors 消费）。 |
| **selector / utils** | `utils/staffSelectors.ts` 等。 |
| **真实接口** | 无。 |
| **真实写入** | 无对全局员工主数据的持久化；存在 **演示用** `pricingConfig`、弹窗与筛选等 UI state。 |
| **建议接入** | 员工档案、排班、课时与绩效事实、权限与角色（只读展示 → 受控变更）。 |

### 规则配置（`Settings`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `utils/settingsPresentation.ts` 内初始角色、定价、老师等级等。 |
| **selector / utils** | 以 `settingsPresentation` 为主。 |
| **真实接口** | 无。 |
| **真实写入** | **内存修改**：等级、佣金、会员规则、角色权限矩阵等均在 `useState` 中变更，**刷新即丢失**。 |
| **建议接入** | 配置版本、生效范围（总部/门店）、审批发布、审计日志。 |

### 投资测算（`Investor`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | 页内部分硬编码图表数据；模型来自 `buildInvestmentFullModel`（`utils/investmentSelectors.ts`）。 |
| **selector / utils** | `utils/investmentSelectors.ts`、`components/investment/InvestmentEntryPanel.tsx`。 |
| **真实接口** | 无。 |
| **真实写入** | 仅 Toast 等 UI state。 |
| **建议接入** | 项目主数据、CAPEX/OPEX 实际数、现金流实际数（只读对齐 + 测算草稿存服务端可选）。 |

### 合作授权（嵌入 `Dashboard`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | 行数据由 `utils/partnerSelectors.ts` 构建（演示叙事）。 |
| **selector / utils** | `utils/partnerSelectors.ts`。 |
| **真实接口** | 无。 |
| **真实写入** | 无。 |
| **建议接入** | 合作门店主数据、授权范围、质检与回传事实、整改与续约流程（只读聚合 + 审批流写入）。 |

### 门店管理（`Shop`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `MOCK_STORE_INFO` + `components/shop/shopConfig` 初始构建。 |
| **selector / utils** | `components/shop/shopConfig` 内纯函数与 draft 转换。 |
| **真实接口** | 无。 |
| **真实写入** | **内存草稿**：门店信息、教室、图库、假期等 `shopConfig` state；保存 Toast 提示前端草稿（未见持久化 API）。 |
| **建议接入** | 门店主数据、教室资源、营业时间、图片与假期（变更需权限 + 日志）。 |

### 活动运营（`Marketing`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | `INITIAL_MARKETING_*` 等页内初始数据。 |
| **selector / utils** | 以组件内逻辑为主。 |
| **真实接口** | 无。 |
| **真实写入** | **内存**：活动列表、创意配置、表单等 `useState`。 |
| **建议接入** | 活动主档、投放渠道、券与名额、审批与上下线。 |

### 数据中心（`Data`）

| 维度 | 说明 |
|------|------|
| **mock / constants** | 页内静态/演示数据结构。 |
| **selector / utils** | 以组件内为主。 |
| **真实接口** | 无。 |
| **真实写入** | 无业务数据；Tab、日期、Toast 等 UI state。 |
| **建议接入** | OLAP 或报表 API、导出任务队列、权限按门店/品牌隔离。 |

---

## 2. 当前写入边界

### 2.1 全仓检索结论（重点清单）

| 检查项 | 结果（当前仓库） |
|--------|------------------|
| `setOrders` / `setContracts` / `setMemberAssets` | **存在于** `components/Mall.tsx`（演示闭环、发放资产、写 closure draft 等）。 |
| `setRefunds` / `setPayments` | **未发现** setter；Mall 内 `payments`、`refunds` 为 `useState` 初始化后**未暴露更新函数**。 |
| `setFinanceLedger` | **无此命名**；课程页存在 `setMockFinanceLedgerEntries`（演示结算副作用）。 |
| `setCourses` | **无直接命名**；课程库用 `libraryList` / `scheduleEvents` 等承载。 |
| `setCourseSessions` | **无直接命名**；场次由 `scheduleEvents` 等推导/更新。 |
| `setMembers` / `setStaff` | **未发现**对全局会员/员工列表的持久化 setter（Staff 为局部 UI/定价演示 state）。 |
| `localStorage` / `sessionStorage` | **未发现**（`*.tsx` / `*.ts` 检索）。 |
| `fetch` / `axios` | **未发现**。 |
| 云函数调用 | **未发现**常见 SDK 形态。 |

### 2.2 按模块：React state / 演示写入 / 误认风险 / 后续要求

| 模块 | 是否写 React state | 是否仅演示 | 误认真实业务风险 | 后续权限 / 审批 / 日志 |
|------|-------------------|------------|------------------|-------------------------|
| 经营总览 | 仅 UI（如雷达维度） | 是 | 低 | 只读聚合为主；导出若开放需审计。 |
| 今日运营 | 见课程运营 | 是 | 中（操作按钮多） | 签到/调课/取消等按角色 + 审批 + 操作日志。 |
| 会员经营 | 筛选/弹窗 | 是 | 低 | 写跟进/标签需角色约束 + 日志。 |
| 课程运营 | **大量** | 是 | **高** | 教务写接口分读写；取消/代课/补签等强制审批流 + 幂等 + 日志。 |
| 产品与合同 | **orders/contracts/assets** 等 | 是 | **高**（发放资产、写 closure） | 订单/合同/资产写入分角色；退款/冻结/转卡 **强制审批 + 财务/会员侧联动 + 日志**。 |
| 财务管理 | 筛选/Tab | 是 | 中 | 分录与核销 **禁止**前台直写生产；仅财务角色 + 复核 + 凭证日志。 |
| 师资与团队 | UI + 演示 pricing | 是 | 中 | 人事/薪酬写分离；绩效结果需审批发布。 |
| 规则配置 | **全量内存配置** | 是 | **高** | 配置发布走版本与审批；禁止老师/前台改权限。 |
| 投资测算 | Toast | 是 | 低 | 默认全员只读；若保存方案需登录与对象级权限。 |
| 合作授权 | 无业务写 | 是 | 低 | 只读事实 + 授权变更走合同/法务系统。 |
| 门店管理 | 门店草稿 state | 是 | 中 | 店长/总部角色区分；变更日志 + 可选复核。 |
| 活动运营 | 活动/创意 state | 是 | 中 | 活动上下线审批；券与预算控制。 |
| 数据中心 | UI | 是 | 低 | 报表按数据域脱敏；导出受控。 |

---

## 3. 权限边界建议（角色 × 可见 / 操作）

> 以下为**接入真实后端时**的推荐基线；实施时需与法务/财务/人事对齐。

| 角色 | 建议可见范围 | 未来允许操作（示例） | 必须审批 | 必须操作日志 | 必须禁止（示例） |
|------|----------------|----------------------|----------|----------------|------------------|
| **总部管理员** | 全模块只读 + 配置发布 | 规则发布、跨店策略、合作授权只读转审批外链 | 规则发布、大额退款策略 | 所有写操作 | 直接改财务分录生产库 |
| **投资人** | 投资测算、脱敏经营报表 | 无写或仅保存「个人测算草稿」 | — | 查看记录 | 任意订单/资产/退款操作 |
| **店长** | 本门店经营、课程、会员、产品与合同（本店） | 本店教务调整（受策略约束）、跟进会员 | 退款、冻结、转卡、改合同关键字段 | 敏感操作全覆盖 | 改总部规则、改他店数据 |
| **运营 / 前台** | 今日运营、会员列表、预约 | 预约登记、签到（若策略允许） | 退款、转卡、改合同、改分录 | 签到与预约变更 | 财务闭环写、规则配置 |
| **财务** | 财务模块、对账相关引用只读 | 核销、分录复核、导出对账包 | 大额退款、反记账 | 全量 | 教务取消课、改老师等级 |
| **老师** | 个人课表、学员（授权范围） | 签到配合、评价查看 | — | 涉及学员数据的操作 | 退款、资产、合同、配置 |
| **合作门店管理员** | 本合作店授权治理只读 + 本店经营摘要（契约约定） | 仅数据回填上传（若产品定义） | 授权变更、摘牌 | 上传与异议 | 总部财务与其他门店数据 |

**页面级粗粒度**

- **默认只读**：经营总览、数据中心、投资测算、合作授权明细、财务大部分分析页。  
- **未来允许操作**：课程运营、产品与合同、门店管理、活动运营、会员跟进（受角色约束）。  
- **必须审批**：退款、冻结、转卡、补签/改签到、改合同关键条款、反记账/冲正、规则发布、批量导出。  
- **必须操作日志**：所有产生**对外法律效力或资金影响**的动作，及权限与角色变更。  
- **必须禁止普通角色**：直接写入会计分录、修改支付事实、绕过审批改资产余额、改系统级角色权限。

---

## 4. 敏感操作清单

| 操作 | 当前状态 | 是否真实写入 | 未来接入要求 | 审批 | 日志 | 通知 |
|------|-----------|--------------|--------------|------|------|------|
| **退款** | Mall 抽屉草稿 + 文案约束；**未** `setRefunds` | 否（内存草稿） | 对接退款服务、状态机、与财务/资产核销 | 是 | 是 | 是（会员/财务/店长按策略） |
| **冻结** | 抽屉 + `mallFreezeRequest` 门槛；**未**改 `memberAssets.status` | 否 | 对接冻结单与资产状态流转 | 是 | 是 | 视策略 |
| **转卡** | 抽屉草稿 + `mallTransferRequest`；**未**改资产归属 | 否 | 对接转卡审批、双店确认、资产过户 | 是 | 是 | 是 |
| **补签 / 改签到** | Courses 内演示签到/消课 | 否（内存） | 对接签到事实、防重复、时间窗策略 | 视规则 | 是 | 可选 |
| **取消课程** | 演示取消场次 | 否（内存） | 对接取消原因、候补、违约金策略 | 视规则 | 是 | 是（已预约会员） |
| **调课** | 演示改期/移动 | 否 | 对接资源冲突检测与会员通知 | 视规则 | 是 | 是 |
| **代课** | 演示替换教练 | 否 | 对接教练资质与课酬规则 | 可选 | 是 | 可选 |
| **改合同** | Mall 合同创建/编辑 UI（内存） | 否 | 对接合同版本、电子签、法务归档 | 是 | 是 | 视策略 |
| **改资产** | 发放资产 `setMemberAssets`（演示） | 否（非持久化） | 对接资产台账、幂等、审计 | 是 | 是 | 视策略 |
| **改支付** | 无 setter | 否 | 仅后端/支付渠道回调写入 | 是 | 是 | 是 |
| **改财务分录** | 无前端写入 | 否 | 仅财务系统或会计引擎 | 是 | 是 | 视策略 |
| **改老师等级** | Settings 内存 | 否 | 对接人事规则与生效版本 | 是 | 是 | 可选 |
| **改员工权限** | Settings 内存 | 否 | 对接 IAM、RBAC/ABAC | 是 | 是 | 是 |
| **导出数据** | Data 等演示导出 Toast | 否 | 导出任务、水印、脱敏、下载令牌 | 视敏感度 | 是 | 可选 |

---

## 5. 下一步建议：进入《真实数据源接入优先级设计 v1》

建议在下一阶段文档中按以下顺序规划接口与主数据落地（**优先级**：P0 先跑通交易与课耗闭环，P1 补财务与人事治理，P2 增强分析与战略模块）。

### P0（核心交易与课耗事实）

- 会员  
- 会员资产  
- 订单  
- 合同  
- 支付  
- 课程场次  
- 预约  
- 签到  
- 耗课  

### P1（资金、激励与治理）

- 退款  
- 财务分录  
- 老师课时费  
- 规则配置  
- 操作日志  
- 权限角色  

### P2（分析、战略与运营扩展）

- 投资测算  
- 合作授权  
- 活动运营  
- 数据中心  
- 导出报表  

---

## 文档版本

| 版本 | 说明 |
|------|------|
| v1 | 首版：数据来源、写入边界、权限建议、敏感操作清单、下一阶段优先级入口 |
