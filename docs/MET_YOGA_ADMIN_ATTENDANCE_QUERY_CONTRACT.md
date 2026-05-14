# MET YOGA 管理后台 · attendanceQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`attendanceQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `attendanceQuery`；**当前不接真实云函数**；**本轮不改** `courseService` / `courseAdapter` / `Courses` 等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| courseService / courseAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Courses 页面 | **已接入** `courseService`（只读快照等）。 |
| 课程场次、预约、签到、耗课 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`attendanceQuery` 后端契约**（入参、出参、状态、签到/到课/耗课口径、权限、错误码、测试数据），通过后再进入《attendanceQuery live 接入 v1》。 |

---

## 2. attendanceQuery 定位

- **只读查询**：仅返回签到 / 到课记录及关联摘要，用于 Courses 场次签到名单、场次详情抽屉、会员到课记录等。  
- **不做**：签到、补签、改签到、取消签到、到课状态修改、耗课、资产扣减、老师课时费、财务分录。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`attendanceCommand` / `supplementAttendanceRequest` / `consumptionCommand` / `teacherPayCommand`**（或等价命名）；不得借 `attendanceQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`attendanceQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：**会员姓名**、**手机后四位**、**课程名称**、**老师姓名**。 |
| `attendanceId` | string \| null | 有值：**单条签到详情**。 |
| `bookingId` | string \| null | 有值：**该预约对应签到记录**（一条或多条，策略固定）。 |
| `courseSessionId` | string \| null | 有值：**该场次签到/到课记录**（分页）。 |
| `courseId` | string \| null | 按课程过滤。 |
| `memberId` | string \| null | 有值：**该会员签到/到课记录**（分页）。 |
| `memberName` | string \| null | 按会员名。 |
| `teacherId` | string \| null | 按老师过滤（权限见 4.2）。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `attendanceStatus` | string \| null | 见第 6 节 `AttendanceStatus`。 |
| `checkinSource` | string \| null | 见第 6 节 `CheckinSource`。 |
| `checkedInFrom` / `checkedInTo` | string \| null | **签到时间**筛选（与 `checkedInAt` 绑定）。 |
| `attendedFrom` / `attendedTo` | string \| null | **到课确认时间**筛选（与 `attendedAt` 绑定）。 |
| `consumedFrom` / `consumedTo` | string \| null | **耗课时间**筛选（与 `consumedAt` 绑定）。 |
| `from` / `to` | string \| null | 通用时间范围（见 4.2）。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`attendanceId` 有值**：返回**单条**签到详情。  
- **`courseSessionId` 有值**：返回该场次**签到/到课记录**（分页；**不建议**一次性全量）。  
- **`memberId` 有值**：返回该会员**签到/到课记录**（分页）。  
- **`bookingId` 有值**：返回该预约**对应签到记录**。  
- **四者均无值**：返回**签到列表**（分页）。  
- **`q`**：语义见上表。  
- **`checkedInFrom` / `checkedInTo`**：**签到时间**筛选。  
- **`attendedFrom` / `attendedTo`**：**到课确认时间**筛选。  
- **`consumedFrom` / `consumedTo`**：**耗课时间**筛选。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`checkedInAt`、`attendedAt`、`consumedAt`、`courseSession.startAt` 或 `updatedAt`** 之一（或组合优先级）。  
- **`storeId` / `storeIds`**：必须与后端根据**当前用户**解析的允许门店集合求交。  
- **`teacher` 角色**：**只能查看与本人相关课程场次**的签到**摘要/名单**（后端强制过滤）。  
- **`role`**：**不能完全相信前端**；鉴权以服务端为准。

---

## 5. 出参设计

### 5.1 统一包装

| 字段 | 说明 |
|------|------|
| `data` | 列表为数组；详情为单个对象；错误时为 `null`。 |
| `meta` | 分页、`requestId`、`total`、`hasMore` 等。 |
| `error` | 失败时非空。 |

### 5.2 列表项：每条签到记录至少包含

| 字段 | 说明 |
|------|------|
| `id` | 签到记录主键。 |
| `attendanceNo` | 签到流水号（若有）。 |
| `bookingId` | 关联预约（可空）。 |
| `memberId` | 会员 ID。 |
| `memberName` | 会员展示名。 |
| `memberPhoneMasked` | **脱敏**手机号。 |
| `courseSessionId` | 场次 ID。 |
| `courseId` | 课程 ID。 |
| `courseName` | 课程名。 |
| `teacherId` | 老师 ID。 |
| `teacherName` | 老师展示名。 |
| `storeId` | 门店 ID。 |
| `storeName` | 门店名。 |
| `roomId` | 教室 ID（可空）。 |
| `roomName` | 教室名（可空）。 |
| `startAt` | 场次开始时间（冗余便于列表）。 |
| `endAt` | 场次结束时间（可空）。 |
| `attendanceStatus` | 见第 6 节。 |
| `checkinSource` | 见第 6 节。 |
| `checkedInAt` | 签到时间（可空）。 |
| `attendedAt` | 有效到课确认时间（可空）。 |
| `consumedAt` | 耗课发生时间（可空）。 |
| `memberAssetId` | 关联资产（可空）。 |
| `assetName` | 资产名称（可空）。 |
| `note` | 备注（可空）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `memberSummary` | 会员摘要（脱敏）。 |
| `bookingSummary` | 预约摘要。 |
| `courseSessionSummary` | 场次摘要。 |
| `assetSummary` | 资产摘要。 |
| `consumptionSummary` | 耗课摘要（明细以 `consumptionQuery` 为准）。 |
| `supplementSummary` | 补签摘要。 |
| `riskSummary` | 风险摘要。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

---

## 6. 状态字段口径

### 6.1 AttendanceStatus（建议）

| 值 | 含义 |
|----|------|
| `pending_checkin` | 待签到 |
| `checked_in` | 已签到 |
| `attended` | 已到课 |
| `consumed` | 已耗课 |
| `absent` | 缺席 |
| `no_show` | 爽约 |
| `late_cancelled` | 临近取消 |
| `supplemented` | 已补签 |
| `cancelled` | 已取消 |
| `unknown` | 无法识别 |

### 6.2 CheckinSource（建议）

| 值 | 含义 |
|----|------|
| `member_qr` | 会员二维码 |
| `teacher_scan` | 老师扫码 |
| `staff_admin` | 后台 / 前台操作 |
| `system` | 系统生成 |
| `supplement_request` | 补签申请 |
| `import` | 历史导入 |
| `unknown` | 无法识别 |

### 6.3 前后端边界

- **前端不得自行改签到状态**。  
- **前端不得仅根据 `bookingStatus`** 直接**判定**到课；到课以 **`attendanceStatus`** 为准。  
- **前端不得仅根据时间**判定缺席/爽约；以 **`attendanceStatus`** 及后端规则为准。  
- **前端不得仅根据 `checkedInAt`** 直接**生成**耗课；耗课以 **`consumptionCommand`** 侧及 **`consumed` 状态 / `consumedAt`** 为准。  
- **前端不得仅根据 `attendedAt`** 直接**生成**老师课时费。  
- **签到 / 到课 / 耗课状态**必须以 **`attendanceStatus`** 为准。  
- **adapter 只能兜底展示**，**不得推断**真实签到 / 到课 / 耗课状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**签到/到课记录 | — |
| 店长 | **本店或授权门店** | — |
| 运营 / 前台 | **本店**签到/到课与**必要会员摘要** | — |
| 财务 | 签到/到课与**耗课相关摘要** | 用于收入核对，非入账承诺。 |
| 老师 | **本人课程场次下**签到/到课名单 | **手机号脱敏**。 |
| 投资人 | **仅汇总** | **不应**直接调用 `attendanceQuery` 看会员签到明细。 |
| 合作门店管理员 | **本合作店**记录 | 越权 403。 |
| 手机号 | 默认 | **`memberPhoneMasked`**。 |
| P0 敏感信息 | | **身份证、住址**不进入 P0 `attendanceQuery`。 |

---

## 8. 签到、到课、耗课口径

- **`checked_in`**：仅代表已完成**签到动作**，**不一定**已耗课。  
- **`attended`**：代表**有效到课**事实。  
- **`consumed`**：代表已产生**耗课事实**；**耗课明细仍以 `consumptionQuery` 为准**。  
- **`absent` / `no_show`**：须以后端规则或**场次结束后的事实**为准。  
- **`supplemented`**：须来自**补签申请或审批通过**记录。  
- **`checkedInAt`**：签到时间。  
- **`attendedAt`**：有效到课确认时间。  
- **`consumedAt`**：耗课发生时间。  
- **前端不得自行计算**正式耗课、确认收入或老师课时费。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限、越店**或**老师查看非本人课程签到** | **403** |
| `NOT_FOUND` | `attendanceId` / `bookingId` / `courseSessionId` / `memberId` 不存在或**无可见记录** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**网络失败**：由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`checkedInAt` 或 `courseSession.startAt` 倒序**（**二选一并写死**于附录）。  
- **场次签到名单**：按 **`courseSessionId` 查询**，**不建议**一次性全量无分页。  
- **多门店**：必须受权限限制。  
- **禁止**：签到列表**一次性全量无分页**。  
- **今日签到**：可通过 **`courseSession.startAt`** 时间窗查询当日场次下记录。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`courseAdapter`** 转为 **camelCase**。  
- 前端 **`Attendance` 类型**（`types.ts`）**保持不变**；扩展由后续 MR 处理。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**课程相关 UI **绕过 `courseService`**。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 待签到记录 |
| 2 | 已签到记录 |
| 3 | 已到课记录 |
| 4 | 已耗课记录 |
| 5 | 缺席记录 |
| 6 | 爽约记录 |
| 7 | 临近取消记录 |
| 8 | 已补签记录 |
| 9 | 一个场次多人签到 |
| 10 | 一个会员多条签到 |
| 11 | 有预约但无签到 |
| 12 | 有签到但无耗课 |
| 13 | 有到课但未生成耗课 |
| 14 | 不同门店签到记录 |
| 15 | 老师本人课程签到记录 |
| 16 | 老师**无权限**课程签到记录 |
| 17 | 搜索无结果 |
| 18 | 分页第二页有数据 |
| 19 | `attendanceId` 不存在 |
| 20 | `bookingId` 不存在 |
| 21 | `courseSessionId` 不存在 |
| 22 | `memberId` 不存在 |
| 23 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `attendanceQuery` **成功**时 **Courses 场次签到记录**能加载。 |
| 3 | **场次详情抽屉签到名单**能显示。 |
| 4 | **`memberId` 查询成功**时会员**到课记录**能加载。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **老师**不能看到**非本人无权限**课程签到。 |
| 8 | **不返回完整会员手机号**；**不返回**身份证、住址。 |
| 9 | **不写库**；**不新增/不补签**；**不改签到状态**；**不生成**耗课、资产扣减、老师课时费、财务分录。 |
| 10 | **不影响** Members / Mall / Finance / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`attendances`** 集合（或实际表名）？  
- [ ] **字段**是否与本文第 5 节一致或可映射？  
- [ ] **`attendanceStatus`** 是否由**后端统一推导**？  
- [ ] 签到与 **booking / courseSession / member / memberAsset** 的**关联字段**是否稳定？  
- [ ] **`checked_in` / `attended` / `consumed`** 的边界由**谁定义**？  
- [ ] 补签是否**单独**有 **request / approval** 表？  
- [ ] **`no_show` / `absent`** 的规则由**谁定义**？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《attendanceQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `courseService` 中签到相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：attendanceQuery 契约确认草案 |
