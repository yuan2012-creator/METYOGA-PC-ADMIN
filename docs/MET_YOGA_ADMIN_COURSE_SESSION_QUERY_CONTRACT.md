# MET YOGA 管理后台 · courseSessionQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`courseSessionQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `courseSessionQuery`；**当前不接真实云函数**；**本轮不改** `courseService` / `courseAdapter` / `Courses` 等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| courseService / courseAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Courses 页面 | **已接入** `courseService`（只读快照等）。 |
| 课程、课程场次、预约、签到、耗课 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`courseSessionQuery` 后端契约**（入参、出参、状态、时间人数、权限、错误码、测试数据），通过后再进入《courseSessionQuery live 接入 v1》。 |

---

## 2. courseSessionQuery 定位

- **只读查询**：仅返回课程场次及关联摘要，用于 Courses 场次列表、详情抽屉、当日运营视图等。  
- **不做**：排课新增/修改、课程取消、调课、代课、完课、签到、预约、耗课、老师课时费、财务分录。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`courseSessionCommand` / `bookingCommand` / `attendanceCommand` / `consumptionCommand` / `teacherPayCommand`**（或等价命名）；不得借 `courseSessionQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`courseSessionQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：**课程名称**、**老师姓名**、**教室名称**（规则由后端定义）。 |
| `courseSessionId` | string \| null | 有值：**单个场次详情**；无值：**列表**。 |
| `courseId` | string \| null | 按课程过滤。 |
| `courseName` | string \| null | 按课程名（与 `q` 分工由评审固定）。 |
| `teacherId` | string \| null | 按老师过滤。 |
| `teacherName` | string \| null | 按老师名。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `roomId` | string \| null | 按教室过滤。 |
| `courseType` | string \| null | 课程类型。 |
| `sessionStatus` | string \| null | 见第 6 节 `CourseSessionStatus`。 |
| `publishStatus` | string \| null | 见第 6 节 `PublishStatus`。 |
| `bookingStatus` | string \| null | 见第 6 节 `BookingStatus`。 |
| `exceptionStatus` | string \| null | 见第 6 节 `ExceptionStatus`。 |
| `settlementStatus` | string \| null | 见第 6 节 `SettlementStatus`。 |
| `startFrom` / `startTo` | string \| null | **课程开始时间**筛选（与 `startAt` 绑定）。 |
| `from` / `to` | string \| null | 通用时间范围（见 4.2）。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`courseSessionId` 有值**：返回**单个**课程场次详情；须校验门店与老师权限。  
- **`courseSessionId` 无值**：返回**课程场次列表**（分页）。  
- **`q`**：语义见上表。  
- **`startFrom` / `startTo`**：用于**课程开始时间**筛选（与 `startAt` 语义一致）。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`createdAt`、`updatedAt` 或 `startAt`** 之一（或组合优先级）；禁止与 `startFrom`/`startTo` 混用而不文档化。  
- **`storeId` / `storeIds`**：必须与后端根据**当前用户**解析的允许门店集合求交。  
- **`teacher` 角色**：**只能查看与本人相关**的课程场次（由后端根据登录态解析 `teacherId` 强制过滤，**不信任**前端传 `teacherId` 扩大范围）。  
- **`role`**：**不能完全相信前端**；鉴权以服务端为准。

---

## 5. 出参设计

### 5.1 统一包装

| 字段 | 说明 |
|------|------|
| `data` | 列表为数组；详情为单个对象；错误时为 `null`。 |
| `meta` | 分页、`requestId`、`total`、`hasMore` 等。 |
| `error` | 失败时非空。 |

### 5.2 列表项：每个课程场次至少包含

| 字段 | 说明 |
|------|------|
| `id` | 场次主键。 |
| `courseId` | 课程 ID。 |
| `courseName` | 课程名。 |
| `courseType` | 类型。 |
| `courseCategory` | 分类（可空）。 |
| `teacherId` | 老师 ID。 |
| `teacherName` | 老师展示名。 |
| `storeId` | 门店 ID。 |
| `storeName` | 门店名。 |
| `roomId` | 教室 ID。 |
| `roomName` | 教室名。 |
| `startAt` | 开始时间（见第 8 节格式与时区）。 |
| `endAt` | 结束时间。 |
| `durationMinutes` | 时长（分钟）。 |
| `capacity` | 容量。 |
| `bookedCount` | 当前**有效**预约数（**不含已取消**，见第 8 节）。 |
| `waitlistCount` | **候补**人数。 |
| `checkedInCount` | **已签到**人数。 |
| `attendedCount` | **有效到课**人数。 |
| `absentCount` | **缺席**人数（见第 8 节）。 |
| `publishStatus` | 见第 6 节。 |
| `bookingStatus` | 见第 6 节。 |
| `sessionStatus` | 见第 6 节。 |
| `exceptionStatus` | 见第 6 节。 |
| `settlementStatus` | 见第 6 节。 |
| `priceSummary` | 价格/课价摘要（只读，非财务入账）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `courseSummary` | 课程摘要。 |
| `teacherSummary` | 老师摘要。 |
| `bookingSummary` | 预约摘要（结构见下）。 |
| `attendanceSummary` | 签到/出勤摘要（结构见下）。 |
| `consumptionSummary` | 耗课摘要。 |
| `teacherPaySummary` | 老师课时费摘要（只读口径，非发放事实）。 |
| `roomSummary` | 教室摘要。 |
| `cancellationSummary` | 取消摘要。 |
| `rescheduleSummary` | 调课摘要。 |
| `substituteSummary` | 代课摘要。 |
| `riskSummary` | 风险摘要。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

### 5.4 `bookingSummary` 至少包含

| 字段 | 说明 |
|------|------|
| `totalBooked` | 总预约（语义与 `bookedCount` 对齐策略须在附录写死）。 |
| `waitlistedCount` | 候补人数（可与 `waitlistCount` 对齐或细分）。 |
| `cancelledCount` | 已取消预约数。 |
| `noShowCount` | 爽约/未出席计数（定义由后端固定）。 |

### 5.5 `attendanceSummary` 至少包含

| 字段 | 说明 |
|------|------|
| `pendingCheckinCount` | 待签到人数。 |
| `checkedInCount` | 已签到人数。 |
| `attendedCount` | 有效到课人数。 |
| `consumedCount` | 已耗课人数/次数（**若返回，须来自耗课事实**，见第 8 节）。 |
| `absentCount` | 缺席人数。 |

---

## 6. 状态字段口径

### 6.1 CourseSessionStatus（建议）

| 值 | 含义 |
|----|------|
| `draft` | 草稿 |
| `scheduled` | 已排课 |
| `published` | 已发布 |
| `in_progress` | 进行中 |
| `completed` | 已完课 |
| `cancelled` | 已取消 |
| `rescheduled` | 已调课 |
| `unknown` | 无法识别 |

### 6.2 PublishStatus（建议）

| 值 | 含义 |
|----|------|
| `draft` | 草稿 |
| `published` | 已发布 |
| `unpublished` | 未发布 |
| `cancelled` | 已取消 |
| `unknown` | 无法识别 |

### 6.3 BookingStatus（建议）

| 值 | 含义 |
|----|------|
| `not_open` | 未开放预约 |
| `bookable` | 可预约 |
| `full` | 已满员 |
| `closed` | 预约截止 |
| `suspended` | 暂停预约 |
| `unknown` | 无法识别 |

### 6.4 ExceptionStatus（建议）

| 值 | 含义 |
|----|------|
| `none` | 无异常 |
| `teacher_changed` | 老师变更 |
| `room_changed` | 教室变更 |
| `low_booking` | 预约不足 |
| `over_capacity` | 超容量 |
| `attendance_abnormal` | 签到异常 |
| `cancelled` | 已取消 |
| `unknown` | 无法识别 |

### 6.5 SettlementStatus（建议）

| 值 | 含义 |
|----|------|
| `not_started` | 未开始 |
| `pending` | 待核对 |
| `estimated` | 模块内估算 |
| `ready_for_review` | 待复核 |
| `posted` | 已生成正式分录 |
| `unknown` | 无法识别 |

### 6.6 前后端边界

- **前端不得自行改课程场次状态**。  
- **前端不得仅根据当前时间**判定真实完课；以 **`sessionStatus`** 等为准。  
- **前端不得仅根据预约人数**判定是否开课；以 **`bookingStatus` / `sessionStatus`** 为准。  
- **前端不得仅根据 `checkedInCount` 生成耗课**；耗课以 **`consumptionCommand`** 侧事实及本接口 **`consumedCount`（若返回）** 为准。  
- **后端必须返回明确状态字段**。  
- **adapter 只能兜底展示**，**不得推断**真实课程 / 预约 / 签到 / 结算状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**课程场次 | — |
| 店长 | **本店或授权门店** | — |
| 运营 / 前台 | **本店**场次、预约与签到**摘要** | 字段白名单。 |
| 财务 | 场次与耗课/课时费**相关摘要** | 非入账承诺。 |
| 老师 | **本人**场次及**必要会员摘要** | **不得**看非本人无权限场次。 |
| 投资人 | **仅汇总** | **不应**直接调用 `courseSessionQuery` 看会员明细。 |
| 合作门店管理员 | **本合作店**场次 | 越权 403。 |
| 会员手机号 | | **不在本接口返回完整值**（若需展示会员则用脱敏字段或仅人数统计）。 |
| P0 敏感信息 | | **身份证、住址**不进入 P0 `courseSessionQuery`。 |

---

## 8. 时间与人数口径

- **`startAt` / `endAt`**：必须为**统一时间格式**（如 RFC3339 / ISO8601）；**后端必须明确时区策略**（UTC 存库 + 偏移，或门店本地时区，附录写死）。  
- **`bookedCount`**：当前**有效**预约数，**不含已取消**。  
- **`waitlistCount`**：**候补**人数。  
- **`checkedInCount`**：**已签到**人数。  
- **`attendedCount`**：**有效到课**人数。  
- **`consumedCount`**（若在 `attendanceSummary` 或列表中返回）：须来自**耗课事实**，**不由前端估算**。  
- **`absentCount`**：须以后端**签到/缺席事实**为准。  
- **前端不得自行计算**正式耗课、确认收入或老师课时费。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限、越店**或**老师查看非本人课程** | **403** |
| `NOT_FOUND` | `courseSessionId` 不存在或**无可见场次** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**网络失败**：由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`startAt` 倒序或升序**（**必须在接口文档中明确一种**）。  
- **课程日历 / 当日运营**：必须支持 **`startFrom` / `startTo`** 时间窗（可覆盖「今日」查询）。  
- **多门店**：必须受权限限制。  
- **禁止**：场次列表**一次性全量无分页**。  
- **今日运营**：可通过 **`startFrom`/`startTo`** 限定当日时间窗查询场次。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`courseAdapter`** 转为 **camelCase**。  
- 前端 **`CourseSession` 类型**（`types.ts`）**保持不变**；扩展由后续 MR 处理。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**课程相关 UI **绕过 `courseService`**。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 草稿课程场次 |
| 2 | 已发布课程场次 |
| 3 | 可预约课程场次 |
| 4 | 已满员课程场次 |
| 5 | 预约截止课程场次 |
| 6 | 进行中课程场次 |
| 7 | 已完课课程场次 |
| 8 | 已取消课程场次 |
| 9 | 已调课课程场次 |
| 10 | 老师变更课程场次 |
| 11 | 教室变更课程场次 |
| 12 | 预约不足课程场次 |
| 13 | 有预约但无签到 |
| 14 | 有签到但无耗课 |
| 15 | 不同门店课程场次 |
| 16 | 老师本人课程场次 |
| 17 | 老师**无权限**场次（403 或不可见） |
| 18 | 搜索无结果 |
| 19 | 分页第二页有数据 |
| 20 | `courseSessionId` 不存在 |
| 21 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `courseSessionQuery` **成功**时 **Courses 场次列表**能加载。 |
| 3 | **详情成功**时课程场次**抽屉**能打开。 |
| 4 | **今日课程执行**能读取**当日**场次（时间窗）。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **老师**不能看到**非本人无权限**课程。 |
| 8 | **不返回完整会员手机号**；**不返回**身份证、住址。 |
| 9 | **不写库**；**不改课程状态**；**不生成**预约、签到、耗课、老师课时费、财务分录。 |
| 10 | **不影响** Members / Mall / Finance / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`course_sessions`** 集合（或实际表名）？  
- [ ] **字段**是否与本文第 5 节一致或可映射？  
- [ ] **场次状态**是否由**后端统一推导**？  
- [ ] **`startAt` / `endAt` 时区策略**是什么？  
- [ ] 场次与 **course / teacher / room** 的**关联字段**是否稳定？  
- [ ] **booking / attendance / consumption** 摘要是否由 **`courseSessionQuery`** 一并返回，还是拆到独立查询？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《courseSessionQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `courseService` 中场次相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：courseSessionQuery 契约确认草案 |
