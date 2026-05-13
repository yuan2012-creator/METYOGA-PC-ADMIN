# MET YOGA PC 后台｜P0 只读接口接入任务拆分 v1

> **目标**：按对象拆分任务，指导程序员**顺序**将 mock 替换为真实云函数只读查询；**本轮仅文档**，不新增代码文件。  
> **对齐**：`MET_YOGA_ADMIN_CLOUD_FUNCTION_API_DESIGN.md`（`xxxQuery`）、`MET_YOGA_ADMIN_REAL_API_FIELD_MAPPING.md`、`MET_YOGA_ADMIN_REAL_DATABASE_SCHEMA_DESIGN.md`。

---

## 1. 接入总原则

- **只读先行，不做真实写入**：P0 阶段仅调用 `xxxQuery`；禁止引入会改 `orders` / `payments` 等的 `Command`。
- **不改业务状态**：不接写接口、不在前端根据接口结果回写「伪状态」覆盖全局 store 中的事实对象（除纯 UI 筛选状态外）。
- **不改资产、订单、合同、支付、签到、耗课**：只替换**读取来源**；展示仍来自服务端返回的快照字段。
- **前端先通过 adapter / service 层接云函数**：`components` 不直接 `wx.cloud.callFunction` 散落调用；统一 `services/*Service.ts` + 薄 adapter 做参数/字段映射。
- **mock 暂时保留作为 fallback**：仅限**本地开发**或**显式开关**；策略见第 5 节。
- **每接一个真实接口，都必须有空状态、加载态、错误态**：禁止白屏与无限 loading；错误不可静默为空列表冒充「无数据」。
- **每个接口都要校验门店范围和角色权限**：请求带 `storeId` / `storeIds`；云函数内二次校验 JWT / 自定义角色与数据范围。
- **每个接口都要支持分页和时间范围**：`page`、`pageSize`、`from`、`to` 为标配；列表默认时间窗文档化。
- **先接事实源，再接聚合看板**：`Dashboard` 聚合在第三批次事实稳定后再接 `dashboardAggregate` 或等价只读聚合接口。

---

## 2. P0 接入任务拆分

### 任务 M1：`members`

| 项 | 内容 |
|----|------|
| **任务目标** | 会员列表与详情数据来自云函数只读查询，替换 `MOCK_MEMBERS` 主路径。 |
| **当前 mock 来源** | `constants` → `MOCK_MEMBERS`；`memberOpsScenarioFixtures` 合并。 |
| **当前影响模块** | `Members`、`MemberDetailModal`、部分 `Mall` / `Finance` 引用。 |
| **建议云函数** | `memberQuery` |
| **建议前端 service / adapter** | `services/memberService.ts`（+ 可选 `adapters/memberAdapter.ts`） |
| **建议返回字段** | 与 `Member` 对齐：`id`、`name`、`phone`（脱敏策略由云函数定）、`lifecycleStatus`、`stage`、`riskTag`、`joinDate`/`joinedAt`、`lastVisit`、`totalLTV`、`points`、`assets` 引用可另查 `member_assets`。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 登录用户；门店数据范围；投资人/老师按角色裁剪字段。 |
| **空状态 / 错误态** | 空：明确「无符合条件的会员」；错：Toast/Inline + 重试，不展示假列表。 |
| **验收标准** | 关闭 mock fallback（测试配置）后列表与详情可加载；分页正确；越店返回空或 403；网络失败有错误 UI。 |

### 任务 M2：`member_assets`

| 项 | 内容 |
|----|------|
| **任务目标** | 资产列表/详情只读接入，替换 `MOCK_MEMBER_ASSETS` 主路径。 |
| **当前 mock 来源** | `MOCK_MEMBER_ASSETS`、`MALL_ORDER_SCENARIO_ASSETS`。 |
| **当前影响模块** | `Mall`、`MemberDetailModal`、`FinanceClosedLoopEntry`。 |
| **建议云函数** | `memberAssetQuery` |
| **建议前端 service / adapter** | `services/memberService.ts` 或 `services/mallService.ts`（二选一主拥有者，另一 re-export） |
| **建议返回字段** | 与 `MemberAsset` 对齐：`id`、`memberId`、`name`、`status`、`sourceOrderId`、`contractId`、`productId`、`productType`、`balanceType`、`totalAmount`、`remainingAmount`、`effectiveDate`、`expiryDate` 等。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 同会员范围；财务可看关联资产只读。 |
| **空状态 / 错误态** | 无资产时与「加载失败」文案区分。 |
| **验收标准** | 按 `memberId` / `orderId` 过滤正确；状态枚举与 `types.ts` 一致；不做前端发放。 |

### 任务 O1：`orders`

| 项 | 内容 |
|----|------|
| **任务目标** | 订单列表/详情只读接入，替换 `MOCK_ORDERS` 主路径。 |
| **当前 mock 来源** | `MOCK_ORDERS`、`MALL_ORDER_SCENARIO_ORDERS`。 |
| **当前影响模块** | `Mall`、`Finance`、`Members`（详情）。 |
| **建议云函数** | `orderQuery` |
| **建议前端 service / adapter** | `services/mallService.ts`、`services/financeService.ts`（共享 `orderService` 或单文件两段 export） |
| **建议返回字段** | `Order`：`id`、`memberId`、`status`、`items`（或分页不含 items 由详情拉）、`totalAmount`、`paidAmount`、`contractId`、`createdAt`、`storeId`。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 本店订单；财务可看授权范围。 |
| **空状态 / 错误态** | 筛选无结果 vs 接口失败区分。 |
| **验收标准** | 时间范围 + 状态过滤正确；详情 `orderId` 拉取含 `items`；金额单位与后端约定一致。 |

### 任务 O2：`order_items`

| 项 | 内容 |
|----|------|
| **任务目标** | 订单行与订单头一致；可随 `orderQuery` 详情返回或独立子集合（设计二选一，推荐详情内嵌）。 |
| **当前 mock 来源** | `Order.items` 来自 mock `Order`。 |
| **当前影响模块** | `Mall`、`Finance`。 |
| **建议云函数** | `orderQuery`（`includeItems: true`）或 `orderItemQuery`（若后端拆分表） |
| **建议前端 service / adapter** | 同上 `mallService` / `financeService` |
| **建议返回字段** | `OrderItem`：`id`、`productType`、`productId`、`productName`、`quantity`、`unitPrice`、`totalAmount`。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 随订单权限。 |
| **空状态 / 错误态** | 订单无行时展示「数据异常」占位并打日志（不应常见）。 |
| **验收标准** | `sum(items.totalAmount)` 与订单头一致（或由服务端保证一致前端校验）。 |

### 任务 C1：`contracts`

| 项 | 内容 |
|----|------|
| **任务目标** | 合同列表/详情只读接入，替换 `MOCK_CONTRACTS`。 |
| **当前 mock 来源** | `MOCK_CONTRACTS`、场景数据。 |
| **当前影响模块** | `Mall`、`Finance`。 |
| **建议云函数** | `contractQuery` |
| **建议前端 service / adapter** | `services/mallService.ts`、`services/financeService.ts` |
| **建议返回字段** | `Contract` 全字段；不返回敏感 PDF URL 给无权限角色（可选）。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 本店/本单关联；法务角色扩展。 |
| **空状态 / 错误态** | 无合同 vs 错误区分。 |
| **验收标准** | `orderId` / `memberId` 查询正确；状态枚举对齐。 |

### 任务 P1：`payments`

| 项 | 内容 |
|----|------|
| **任务目标** | 支付流水只读接入，替换 `MOCK_PAYMENTS`。 |
| **当前 mock 来源** | `MOCK_PAYMENTS`、`MALL_ORDER_SCENARIO_PAYMENTS`。 |
| **当前影响模块** | `Mall`、`Finance`。 |
| **建议云函数** | `paymentQuery` |
| **建议前端 service / adapter** | `services/financeService.ts`、`services/mallService.ts` |
| **建议返回字段** | `Payment` 全字段。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 财务/店长按策略； masking `transactionNo` 若需要。 |
| **空状态 / 错误态** | 无流水与失败区分。 |
| **验收标准** | 按 `orderId` 过滤；`reconciled` 状态展示与 mock 行为一致；**不与 mock 金额混算**（见第 5、7 节）。 |

### 任务 CS1：`course_sessions`

| 项 | 内容 |
|----|------|
| **任务目标** | 场次日历/列表只读接入，替换 `MOCK_COURSE_SESSIONS` 主路径（含场景合并策略由 service 统一）。 |
| **当前 mock 来源** | `MOCK_COURSE_SESSIONS`、`COURSE_OPS_SCENARIO_EVENTS`。 |
| **当前影响模块** | `Courses`、`Dashboard`（统计引用）。 |
| **建议云函数** | `courseSessionQuery` |
| **建议前端 service / adapter** | `services/courseService.ts` |
| **建议返回字段** | `CourseSession` 全量含扩展状态字段。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 本店场次；老师仅本人场次。 |
| **空状态 / 错误态** | 当日无课 vs 加载失败。 |
| **验收标准** | `storeId` + `from`/`to` 窗口正确；时区与展示一致。 |

### 任务 B1：`bookings`

| 项 | 内容 |
|----|------|
| **任务目标** | 预约只读接入，替换 `MOCK_BOOKINGS` 主路径。 |
| **当前 mock 来源** | `MOCK_BOOKINGS`、`COURSE_OPS_SCENARIO_BOOKINGS`。 |
| **当前影响模块** | `Courses`、`Members`。 |
| **建议云函数** | `bookingQuery` |
| **建议前端 service / adapter** | `services/courseService.ts` |
| **建议返回字段** | `Booking` 全字段。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 场次维度 + 会员维度组合校验。 |
| **空状态 / 错误态** | 场次无预约 vs 错误。 |
| **验收标准** | `courseSessionId` 列表完整；与 `course_sessions` 联查一致。 |

### 任务 A1：`attendances`

| 项 | 内容 |
|----|------|
| **任务目标** | 签到只读接入，替换 `MOCK_ATTENDANCES`。 |
| **当前 mock 来源** | `MOCK_ATTENDANCES`、`COURSE_OPS_SCENARIO_ATTENDANCES`。 |
| **当前影响模块** | `Courses`、`Finance`（间接）。 |
| **建议云函数** | `attendanceQuery` |
| **建议前端 service / adapter** | `services/courseService.ts` |
| **建议返回字段** | `Attendance` 全字段。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 老师本场次；店长本店。 |
| **空状态 / 错误态** | 未签到列表为空 vs 错误。 |
| **验收标准** | 与 `bookings` 人数大致一致（业务规则允许例外需在文档说明）。 |

### 任务 CN1：`consumptions`

| 项 | 内容 |
|----|------|
| **任务目标** | 耗课记录只读接入；替换 `Courses` 内 `mockConsumptions` 及财务侧对耗课的只读引用（若有）。 |
| **当前 mock 来源** | 内存 `MockCourseConsumptionRecord`；无全局 `MOCK_*` 常量主表。 |
| **当前影响模块** | `Courses`、`Finance`（待确认收入叙事）。 |
| **建议云函数** | `consumptionQuery` |
| **建议前端 service / adapter** | `services/courseService.ts`、`services/financeService.ts` |
| **建议返回字段** | 对齐设计文档：`id`、`memberId`、`memberAssetId`、`courseSessionId`、`attendanceId`、`consumedAt`、`quantity`、`amount`、`status`。 |
| **是否只读** | 是 |
| **是否允许写入** | 否 |
| **权限要求** | 财务 + 教务；会员本人数据脱敏场景另议。 |
| **空状态 / 错误态** | 无耗课 vs 错误。 |
| **验收标准** | 时间范围 + `memberId`/`sessionId` 过滤；**财务页仅用真实 consumptions 或仅用 mock，二选一不混**（见第 5 节）。 |

---

## 3. 推荐接入顺序

### 第一批（主数据与人维度）

1. `members`  
2. `member_assets`

### 第二批（交易与支付事实）

3. `orders`  
4. `order_items`（随订单详情或并行）  
5. `contracts`  
6. `payments`

### 第三批（教务与耗课事实）

7. `course_sessions`  
8. `bookings`  
9. `attendances`  
10. `consumptions`

---

## 4. 前端接入方式建议（本轮不创建文件）

建议新增（后续迭代中落地）：

| 文件 | 职责 |
|------|------|
| `services/apiClient.ts` | 统一 `callFunction` / HTTP baseURL、超时、错误码解析、`storeId` 注入、requestId。 |
| `services/memberService.ts` | `memberQuery`、`memberAssetQuery` 封装。 |
| `services/mallService.ts` | `orderQuery`、`contractQuery`、`paymentQuery`、资产查询（或复用 member）。 |
| `services/courseService.ts` | `courseSessionQuery`、`bookingQuery`、`attendanceQuery`、`consumptionQuery`。 |
| `services/financeService.ts` | 只读财务列表用到的 `paymentQuery`、`orderQuery`、`consumptionQuery` 组合。 |
| `services/dashboardService.ts` | 后期 `xxxAggregate`；P0 可先占位导出类型，不接真实库。 |

**原则**：`components` 仅依赖 service 返回的 **DTO**；adapter 负责 `snake_case` ↔ `camelCase` 与日期格式。

---

## 5. mock fallback 策略

- **本地开发默认可继续使用 mock**：`VITE_USE_MOCK=true` 或等价环境变量时，`service` 直接返回 `constants` 数据。  
- **接口失败时是否 fallback**：**按模块配置**；默认 **财务模块不允许 fallback**（避免假金额）；会员/课程列表可配置「仅开发环境 fallback」。  
- **生产环境不应静默 fallback 到 mock**：生产构建应强制 `USE_MOCK=false`；失败必须错误态。  
- **接口失败时**：展示错误提示 + 重试；**禁止**用空 mock 列表冒充成功。  
- **mock 与真实数据不能混在同一财务口径里**：同一页面区块内「实付/实收/净额」须同源；要么全真实要么全 mock + 明显「演示」横幅（过渡方案仅用于非生产演示环境）。

---

## 6. 每个模块第一轮真实接入建议

| 模块 | 第一轮建议 |
|------|------------|
| **会员经营** | `members` + `member_assets` 只读；列表/详情走 service。 |
| **产品与合同** | `orders` + `order_items` + `contracts` + `payments` + `member_assets`；订单抽屉与列表同源。 |
| **课程运营** | `course_sessions` + `bookings` + `attendances`；日历与今日面板同源。 |
| **财务管理** | 只读 `payments` + `consumptions` + `orders`（不接触分录写入）；与 mock 二选一。 |
| **经营总览** | **暂不**直查全库聚合；待前三批稳定后接 `dashboardAggregate` 或由 BFF 聚合。 |
| **师资与团队** | 不接写入；待 `course_sessions` 与老师主数据就绪后再只读接课表/课时相关。 |
| **投资测算 / 合作授权 / 活动运营 / 数据中心** | **继续 mock**；不纳入本 P0 只读任务包。 |

---

## 7. 风险提示

- **不能为了页面快而直接从前端查所有集合**：禁止无分页、无时间窗拉全表；大列表必须服务端 limit + cursor/page。  
- **不能让前端直接写数据库**：云开发安全规则须 deny client write on 核心集合。  
- **不能在财务页面混用 mock 金额和真实金额**：见第 5 节；违者视为验收不通过。  
- **不能用会员手机号作为主键**：主键为稳定 `member_id`；手机可变更。  
- **不能把合同 / 支付 / 资产状态在前端自行推断为真实状态**：状态以服务端字段为准；前端仅映射展示文案。  
- **不能让经营总览先于事实源接入**：避免「漂亮但错误」的高管驾驶舱。  

---

## 8. 下一步建议

进入 **`P0 只读接口前端 adapter 设计 v1`**：

- 定义各 `xxxQuery` 的 **TypeScript 请求/响应 DTO**（可与 `types.ts` 渐进对齐）  
- 约定 `apiClient` 错误类型与 **不重试** 的 4xx 行为  
- 明确各模块 **feature flag** 与 mock 切换矩阵  

---

## 文档版本

| 版本 | 说明 |
|------|------|
| v1 | 首版：原则、10 对象任务、三批顺序、service 建议、fallback、模块建议、风险、下一步 |
