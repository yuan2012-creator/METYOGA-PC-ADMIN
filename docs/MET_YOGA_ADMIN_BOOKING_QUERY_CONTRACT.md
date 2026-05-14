# MET YOGA 管理后台 · bookingQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`bookingQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `bookingQuery`；**当前不接真实云函数**；**本轮不改** `courseService` / `courseAdapter` / `Courses` 等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| courseService / courseAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Courses 页面 | **已接入** `courseService`（只读快照等）。 |
| 课程场次、预约、签到、耗课 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`bookingQuery` 后端契约**（入参、出参、状态、人数与候补、权限、错误码、测试数据），通过后再进入《bookingQuery live 接入 v1》。 |

---

## 2. bookingQuery 定位

- **只读查询**：仅返回预约及关联摘要，用于 Courses 场次预约名单、会员预约记录、场次详情抽屉等。  
- **不做**：预约新增、预约取消、候补转正、代约、签到、耗课、课程状态修改、资产扣减、财务分录。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`bookingCommand` / `attendanceCommand` / `consumptionCommand`**（及资产/财务侧等价命令）；不得借 `bookingQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`bookingQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：**会员姓名**、**手机后四位**、**课程名称**、**老师姓名**（规则由后端定义）。 |
| `bookingId` | string \| null | 有值：**单条预约详情**。 |
| `courseSessionId` | string \| null | 有值：**该场次预约列表**。 |
| `courseId` | string \| null | 按课程过滤。 |
| `memberId` | string \| null | 有值：**该会员预约记录**（列表）。 |
| `memberName` | string \| null | 按会员名（与 `q` 分工由评审固定）。 |
| `teacherId` | string \| null | 按老师过滤（权限见 4.2）。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `bookingStatus` | string \| null | 见第 6 节 `BookingStatus`。 |
| `bookingSource` | string \| null | 见第 6 节 `BookingSource`。 |
| `bookedFrom` / `bookedTo` | string \| null | **预约创建时间**筛选（与 `bookedAt` / `createdAt` 语义绑定，附录写死）。 |
| `cancelledFrom` / `cancelledTo` | string \| null | **取消时间**筛选（与 `cancelledAt` 绑定）。 |
| `from` / `to` | string \| null | 通用时间范围（见 4.2）。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`bookingId` 有值**：返回**单条**预约详情；须校验门店与老师权限。  
- **`courseSessionId` 有值**：返回该场次**预约列表**（分页；**不建议**一次性拉全量无分页）。  
- **`memberId` 有值**：返回该会员**预约记录**（分页）。  
- **`bookingId` / `courseSessionId` / `memberId` 均无值**：返回**预约列表**（分页）。  
- **`q`**：语义见上表。  
- **`bookedFrom` / `bookedTo`**：**预约创建时间**筛选。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`bookedAt`、`cancelledAt`、`updatedAt` 或 `courseSession.startAt`** 之一（或组合优先级）；禁止语义模糊。  
- **`storeId` / `storeIds`**：必须与后端根据**当前用户**解析的允许门店集合求交。  
- **`teacher` 角色**：**只能查看与本人相关课程场次**下的预约**摘要/名单**（由后端根据登录态强制过滤，不信任前端扩大 `teacherId` / `courseSessionId` 范围）。  
- **`role`**：**不能完全相信前端**；鉴权以服务端为准。

---

## 5. 出参设计

### 5.1 统一包装

| 字段 | 说明 |
|------|------|
| `data` | 列表为数组；详情为单个对象；错误时为 `null`。 |
| `meta` | 分页、`requestId`、`total`、`hasMore` 等。 |
| `error` | 失败时非空。 |

### 5.2 列表项：每条预约至少包含

| 字段 | 说明 |
|------|------|
| `id` | 预约主键。 |
| `bookingNo` | 预约单号（若有）。 |
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
| `startAt` | 场次开始时间（冗余自场次，便于列表展示）。 |
| `endAt` | 场次结束时间（可空）。 |
| `bookingStatus` | 见第 6 节。 |
| `bookingSource` | 见第 6 节。 |
| `bookedAt` | 预约创建/确认时间。 |
| `cancelledAt` | 取消时间（可空）。 |
| `cancelReason` | 取消原因（可空）。 |
| `waitlistRank` | 候补排序（非候补可为 null/0，由契约固定）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `memberSummary` | 会员摘要（脱敏）。 |
| `courseSessionSummary` | 场次摘要。 |
| `assetSummary` | 资产/权益摘要（只读）。 |
| `attendanceSummary` | 签到/出勤摘要（只读）。 |
| `cancellationSummary` | 取消过程摘要。 |
| `waitlistSummary` | 候补队列摘要（结构由后端定义）。 |
| `riskSummary` | 风险摘要。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

---

## 6. 状态字段口径

### 6.1 BookingStatus（建议）

| 值 | 含义 |
|----|------|
| `booked` | 已预约 |
| `waitlisted` | 候补中 |
| `cancelled` | 已取消 |
| `late_cancelled` | 临近取消 |
| `no_show` | 爽约 |
| `attended` | 已到课 |
| `unknown` | 无法识别 |

### 6.2 BookingSource（建议）

| 值 | 含义 |
|----|------|
| `member_miniapp` | 会员小程序 |
| `staff_admin` | 后台 / 前台操作 |
| `teacher_app` | 老师端 |
| `system` | 系统生成 |
| `import` | 历史导入 |
| `unknown` | 无法识别 |

### 6.3 前后端边界

- **前端不得自行改预约状态**。  
- **前端不得仅根据时间**判定爽约；以 **`bookingStatus`** 及后端规则为准。  
- **前端不得仅根据签到状态**直接**修改**预约状态展示逻辑以外的业务状态（展示仍以后端 `bookingStatus` 为准）。  
- **前端不得仅根据候补顺序**直接**转正**预约；转正由 **`bookingCommand`** 等完成。  
- **预约是否有效**必须以 **`bookingStatus`** 为准。  
- **adapter 只能兜底展示**，**不得推断**真实预约状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**预约 | — |
| 店长 | **本店或授权门店** | — |
| 运营 / 前台 | **本店**预约与**必要会员摘要** | — |
| 财务 | 一般不直接看预约明细 | **除非**用于耗课/收入核对且经授权字段白名单。 |
| 老师 | **本人课程场次下**预约名单 | **手机号脱敏**。 |
| 投资人 | **仅汇总** | **不应**直接调用 `bookingQuery` 看会员预约明细。 |
| 合作门店管理员 | **本合作店**预约 | 越权 403。 |
| 手机号 | 默认 | **`memberPhoneMasked`**。 |
| P0 敏感信息 | | **身份证、住址**不进入 P0 `bookingQuery`。 |

---

## 8. 预约人数与候补口径

- **`booked`**：仅代表当前**有效**预约（与列表筛选语义一致）。  
- **`cancelled`**：**不计入**有效预约人数。  
- **`late_cancelled`**：是否计入爽约/统计口径由**后端规则**决定并在附录写死。  
- **`waitlisted`**：**不占**正式名额。  
- **`waitlistRank`**：必须以后端返回为准，前端不自行重排。  
- **`no_show`**：必须由**后端规则**或**签到事实**产生，**不由前端自行判断**。  
- **前端不得自行修改** `bookedCount` / `waitlistCount`（若响应中含聚合字段，仅展示；聚合由后端计算）。  
- **课程容量校验**不在 `bookingQuery` 中完成；本接口**只读返回**已有结果。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限、越店**或**老师查看非本人课程预约** | **403** |
| `NOT_FOUND` | `bookingId` / `courseSessionId` / `memberId` 不存在或**无可见预约** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**网络失败**：由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`bookedAt` 或 `courseSession.startAt` 倒序**（**二选一并写死**于附录）。  
- **场次预约名单**：按 **`courseSessionId` 查询**，**不建议**一次性拉全量无分页。  
- **多门店**：必须受权限限制。  
- **禁止**：预约列表**一次性全量无分页**。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`courseAdapter`** 转为 **camelCase**。  
- 前端 **`Booking` 类型**（`types.ts`）**保持不变**；扩展由后续 MR 处理。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**课程相关 UI **绕过 `courseService`**。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 正常已预约 |
| 2 | 候补中预约 |
| 3 | 已取消预约 |
| 4 | 临近取消预约 |
| 5 | 爽约预约 |
| 6 | 已到课预约 |
| 7 | 一个场次多人预约 |
| 8 | 一个会员多条预约 |
| 9 | 有候补排序预约 |
| 10 | 不同门店预约 |
| 11 | 老师本人课程预约 |
| 12 | 老师**无权限**课程预约（403 或不可见） |
| 13 | 搜索无结果 |
| 14 | 分页第二页有数据 |
| 15 | `bookingId` 不存在 |
| 16 | `courseSessionId` 不存在 |
| 17 | `memberId` 不存在 |
| 18 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `bookingQuery` **成功**时 **Courses 场次预约名单**能加载。 |
| 3 | `bookingQuery` **成功**时 **会员预约记录**能加载。 |
| 4 | **`courseSessionId` 查询成功**时场次详情**抽屉预约名单**能显示。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **老师**不能看到**非本人无权限**课程预约。 |
| 8 | **不返回完整会员手机号**；**不返回**身份证、住址。 |
| 9 | **不写库**；**不新增/不取消预约**；**不改预约状态**；**不生成**签到、耗课、财务分录。 |
| 10 | **不影响** Members / Mall / Finance / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`bookings`** 集合（或实际表名）？  
- [ ] **字段**是否与本文第 5 节一致或可映射？  
- [ ] **`bookingStatus`** 是否由**后端统一推导**？  
- [ ] 预约与 **courseSession / member / asset** 的**关联字段**是否稳定？  
- [ ] **候补排序**是否已有后端字段（与 `waitlistRank` 一致）？  
- [ ] **`late_cancelled` / `no_show`** 的规则由**谁定义**（产品/风控/后端）？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《bookingQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `courseService` 中预约相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：bookingQuery 契约确认草案 |
