# MET YOGA 管理后台 · consumptionQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`consumptionQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `consumptionQuery`；**当前不接真实云函数**；**本轮不改** `courseService` / `financeService` / `courseAdapter` / `financeAdapter` / 页面等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| courseService / courseAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| financeService / financeAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Courses 页面 | **已接入** `courseService`（只读快照等）。 |
| Finance 页面 | **已接入** `financeService`（只读快照等）。 |
| 课程场次、预约、签到、耗课、财务摘要 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`consumptionQuery` 后端契约**（入参、出参、状态、金额与过账语义、权限、错误码、测试数据），通过后再进入《consumptionQuery live 接入 v1》。 |

---

## 2. consumptionQuery 定位

- **只读查询**：仅返回耗课事实及关联摘要，供 Courses 耗课记录、Finance 待确认收入 / 耗课核对等使用。  
- **不做**：耗课新增、修改、冲正、资产扣减、签到状态修改、课程完课、确认收入、老师课时费、财务分录。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`consumptionCommand` / `attendanceCommand` / `assetCommand` / `financeLedgerCommand` / `teacherPayCommand`**（或等价命名）；不得借 `consumptionQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`consumptionQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：**会员姓名**、**手机后四位**、**课程名称**、**老师姓名**、**资产名称**。 |
| `consumptionId` | string \| null | 有值：**单条耗课详情**。 |
| `attendanceId` | string \| null | 有值：**该签到关联耗课**。 |
| `courseSessionId` | string \| null | 有值：**该场次耗课记录**（分页）。 |
| `courseId` | string \| null | 按课程过滤。 |
| `memberId` | string \| null | 有值：**该会员耗课记录**（分页）。 |
| `memberName` | string \| null | 按会员名。 |
| `memberAssetId` | string \| null | 有值：**该资产耗课记录**（分页）。 |
| `assetName` | string \| null | 按资产名。 |
| `teacherId` | string \| null | 按老师过滤（权限见 4.2）。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `consumptionStatus` | string \| null | 见第 6 节 `ConsumptionStatus`。 |
| `balanceType` | string \| null | 见第 6 节 `BalanceType`。 |
| `consumedFrom` / `consumedTo` | string \| null | **耗课发生时间**筛选（与 `consumedAt` 绑定）。 |
| `postedFrom` / `postedTo` | string \| null | **财务确认或过账相关时间**筛选（与 `postedAt` 语义绑定，附录写死）。 |
| `from` / `to` | string \| null | 通用时间范围（见 4.2）。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`consumptionId` 有值**：返回**单条**耗课详情。  
- **`attendanceId` 有值**：返回该签到**关联耗课**（一条或多条，策略固定）。  
- **`courseSessionId` 有值**：返回该场次**耗课记录**（分页）。  
- **`memberId` 有值**：返回该会员**耗课记录**（分页）。  
- **`memberAssetId` 有值**：返回该资产**耗课记录**（分页）。  
- **五者均无值**：返回**耗课列表**（分页）。  
- **`q`**：语义见上表。  
- **`consumedFrom` / `consumedTo`**：**耗课发生时间**筛选。  
- **`postedFrom` / `postedTo`**：**财务确认或过账时间**筛选（与 `postedAt` 定义一致）。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`consumedAt`、`postedAt`、`updatedAt` 或 `courseSession.startAt`** 之一（或组合优先级）。  
- **`storeId` / `storeIds`**：必须与后端根据**当前用户**解析的允许门店集合求交。  
- **`teacher` 角色**：**只能查看与本人相关课程场次**的耗课**摘要**；**不应**看会员资产与支付等财务细节（字段白名单由后端裁剪）。  
- **`role`**：**不能完全相信前端**；鉴权以服务端为准。

---

## 5. 出参设计

### 5.1 统一包装

| 字段 | 说明 |
|------|------|
| `data` | 列表为数组；详情为单个对象；错误时为 `null`。 |
| `meta` | 分页、`requestId`、`total`、`hasMore` 等。 |
| `error` | 失败时非空。 |

### 5.2 列表项：每条耗课记录至少包含

| 字段 | 说明 |
|------|------|
| `id` | 耗课主键。 |
| `consumptionNo` | 耗课单号（若有）。 |
| `memberId` | 会员 ID。 |
| `memberName` | 会员展示名。 |
| `memberPhoneMasked` | **脱敏**手机号。 |
| `memberAssetId` | 资产 ID。 |
| `assetName` | 资产名称。 |
| `balanceType` | 见第 6 节。 |
| `courseSessionId` | 场次 ID。 |
| `courseId` | 课程 ID。 |
| `courseName` | 课程名。 |
| `teacherId` | 老师 ID。 |
| `teacherName` | 老师展示名。 |
| `storeId` | 门店 ID。 |
| `storeName` | 门店名。 |
| `attendanceId` | 签到 ID（可空）。 |
| `bookingId` | 预约 ID（可空）。 |
| `quantity` | 数量（与 `unit` 配合）。 |
| `unit` | 单位（次、点、元等语义由 `balanceType` 约束）。 |
| `amount` | 耗课金额或估算价值（**单位见第 8 节**）。 |
| `currency` | 币种。 |
| `consumptionStatus` | 见第 6 节。 |
| `consumedAt` | 耗课发生时间。 |
| `postedAt` | 耗课确认 / 过账准备时间（**语义见第 8 节**，可空）。 |
| `reversedAt` | 冲正时间（可空）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `memberSummary` | 会员摘要（脱敏）。 |
| `assetSummary` | 资产摘要。 |
| `courseSessionSummary` | 场次摘要。 |
| `attendanceSummary` | 签到摘要。 |
| `bookingSummary` | 预约摘要。 |
| `financeLedgerSummary` | 分录关联**摘要**（非完整账本）。 |
| `teacherPaySummary` | 老师课时费**摘要**（非发放事实）。 |
| `reverseSummary` | 冲正摘要。 |
| `riskSummary` | 风险摘要。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

---

## 6. 状态字段口径

### 6.1 ConsumptionStatus（建议）

| 值 | 含义 |
|----|------|
| `pending` | 待确认 |
| `posted` | 已确认 / 已入耗课事实 |
| `reversed` | 已冲正 |
| `cancelled` | 已取消 |
| `failed` | 生成失败 |
| `unknown` | 无法识别 |

### 6.2 BalanceType（建议）

| 值 | 含义 |
|----|------|
| `times` | 次数 |
| `points` | 点数 |
| `amount` | 金额 |
| `period` | 期限权益 |
| `unknown` | 无法识别 |

### 6.3 前后端边界

- **前端不得自行新增耗课**。  
- **前端不得自行改耗课状态**。  
- **前端不得仅根据 `checkedInAt`** 直接**生成**耗课展示为已发生事实；以 **`consumptionStatus`** 与耗课记录为准。  
- **前端不得仅根据 `consumedAt`** 直接**生成确认收入**。  
- **前端不得仅根据耗课金额**直接**生成财务分录**。  
- **前端不得仅根据耗课记录**直接**生成老师课时费**。  
- **耗课事实**必须以 **`consumptionStatus`** 为准。  
- **adapter 只能兜底展示**，**不得推断**真实耗课 / 收入 / 分录状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**耗课记录 | — |
| 店长 | **本店或授权门店** | — |
| 运营 / 前台 | **本店**耗课**摘要**与必要会员信息 | 字段白名单。 |
| 财务 | 耗课金额、资产关联、**分录关联摘要** | 非完整入账承诺。 |
| 老师 | **本人课程相关**耗课**摘要** | **不应**看完整会员资产与支付细节。 |
| 投资人 | **仅汇总** | **不应**直接调用 `consumptionQuery` 看会员耗课明细。 |
| 合作门店管理员 | **本合作店**耗课记录 | 越权 403。 |
| 手机号 | 默认 | **`memberPhoneMasked`**。 |
| P0 敏感信息 | | **身份证、住址**不进入 P0 `consumptionQuery`。 |

---

## 8. 耗课、资产、收入口径

- **`consumption`**：代表**耗课事实**，**不等于**正式**财务收入**。  
- **`amount`**：耗课金额或估算价值；**单位**须在全链路**统一为「分」或「元」**（附录**写死**一种）。  
- **`quantity` / `unit`**：用于次数、点数、期限权益等不同权益类型（与 `balanceType` 一致）。  
- **`posted`**：仅代表耗课事实在业务上**已确认**；**不代表**已生成**正式财务分录**（若已关联，走 `financeLedgerSummary` 等摘要字段，具体语义见附录）。  
- **`reversed`**：必须有**冲正来源与原因**（可在 `reverseSummary` 中摘要展示）。  
- **`consumedAt`**：耗课发生时间。  
- **`postedAt`**：耗课**确认时间**或**入账准备时间**等，**具体语义须后端确认**并在附录写死。  
- **资产扣减**：须由**后端事务**完成，**不由前端计算**。  
- **财务确认收入、预收负债、正式分录**：由 **`financeLedgerCommand`** 或财务域服务处理；**不由** `consumptionQuery` 写入。  
- **前端不得自行计算**正式收入、预收负债或老师课时费。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限、越店**或**老师查看非本人课程耗课** | **403** |
| `NOT_FOUND` | `consumptionId` / `attendanceId` / `courseSessionId` / `memberId` / `memberAssetId` 不存在或**无可见记录** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**网络失败**：由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`consumedAt` 或 `postedAt` 倒序**（**二选一并写死**于附录）。  
- **场次耗课**：按 **`courseSessionId`** 查询。  
- **会员耗课**：按 **`memberId`** 查询。  
- **资产耗课**：按 **`memberAssetId`** 查询。  
- **多门店**：必须受权限限制。  
- **禁止**：耗课列表**一次性全量无分页**。  
- **财务核对**：可通过 **`consumedFrom` / `consumedTo`** 时间窗查询。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`courseAdapter` / `financeAdapter`**（按调用入口归属）转为 **camelCase**。  
- 前端 **`Consumption`** 类型应作为正式类型；**`MockCourseConsumptionRecord`** 等 mock 命名应在后续 MR 中**收敛**为正式 **`Consumption`**（本契约不修改代码，仅约定方向）。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**课程页或财务页**绕过 `courseService` / `financeService`**。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 待确认耗课 |
| 2 | 已确认耗课 |
| 3 | 已冲正耗课 |
| 4 | 取消耗课 |
| 5 | 生成失败耗课 |
| 6 | 次数型耗课 |
| 7 | 点数型耗课 |
| 8 | 金额型耗课 |
| 9 | 期限权益耗课 |
| 10 | 一个场次多条耗课 |
| 11 | 一个会员多条耗课 |
| 12 | 一个资产多条耗课 |
| 13 | 有签到但无耗课 |
| 14 | 有耗课但无财务分录 |
| 15 | 有耗课且已关联**分录摘要** |
| 16 | 不同门店耗课记录 |
| 17 | 老师本人课程耗课 |
| 18 | 老师**无权限**课程耗课 |
| 19 | 搜索无结果 |
| 20 | 分页第二页有数据 |
| 21 | `consumptionId` 不存在 |
| 22 | `attendanceId` 不存在 |
| 23 | `memberAssetId` 不存在 |
| 24 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `consumptionQuery` **成功**时 **Courses 耗课记录**能加载。 |
| 3 | **Finance** 侧**待确认收入 / 耗课核对**能加载（若 UI 绑定本接口）。 |
| 4 | **`courseSessionId` / `memberId` / `memberAssetId`** 查询成功时对应列表/详情能显示。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **老师**不能看到**非本人无权限**课程耗课。 |
| 8 | **不返回完整会员手机号**；**不返回**身份证、住址。 |
| 9 | **不写库**；**不新增/不改耗课状态**；**不扣减资产**；**不生成**确认收入、老师课时费、财务分录。 |
| 10 | **不影响** Members / Mall / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`consumptions`** 集合（或实际表名）？  
- [ ] **字段**是否与本文第 5 节一致或可映射？  
- [ ] **`consumptionStatus`** 是否由**后端统一推导**？  
- [ ] 耗课与 **attendance / courseSession / memberAsset** 的**关联字段**是否稳定？  
- [ ] **`amount`** 单位是**分**还是**元**（最终定稿）？  
- [ ] **`posted`** 的业务语义是**耗课确认**还是**财务过账准备**？  
- [ ] **冲正**是否有单独 **reverse** 表或字段集？  
- [ ] 耗课是否由**签到自动**生成（规则归属）？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《consumptionQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `courseService` / `financeService` 中耗课相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：consumptionQuery 契约确认草案 |
