# MET YOGA 管理后台 · memberAssetQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`memberAssetQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `memberAssetQuery`；**当前不接真实云函数**；**本轮不改** `memberService` / `memberAdapter` / `Members` 等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| memberService / memberAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Members 页面 | **已接入** `memberService`（含资产等仍由 service 统一出口）。 |
| memberAsset 数据 | **仍走 mock service**（selector / 常量构建，非真实云库）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`memberAssetQuery` 后端契约**（入参、出参、状态口径、权限、错误码、测试数据），通过后再进入《memberAssetQuery live 接入 v1》。 |

---

## 2. memberAssetQuery 定位

- **只读查询**：仅返回会员资产维度只读数据，用于列表、详情及与订单等关联展示。  
- **不做**：资产新增、修改、删除。  
- **不做**：冻结、转卡、退款、资产作废。  
- **不写**：订单、合同、支付、财务分录（本接口范围内）。  
- **后续真实写入**：须另走 **`assetCommand` / `freezeRequestCommand` / `transferRequestCommand` / `refundRequestCommand`**（或等价命名）及审批流；不得借 `memberAssetQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`memberAssetQuery`**（HTTP 网关可与云函数名映射）。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或统一经 **HTTP / BFF** 调用。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `assetId` | string \| null | 有值：**单个资产详情**。 |
| `memberId` | string \| null | 有值：**该会员资产列表**（可与分页组合）。 |
| `orderId` | string \| null | 有值：**该订单关联资产**（一条或多条）。 |
| `contractId` | string \| null | 可选；按合同过滤关联资产。 |
| `productId` | string \| null | 可选；按产品过滤。 |
| `storeId` | string \| null | 单店过滤。 |
| `storeIds` | string[] \| null | 多店过滤。 |
| `assetStatus` | string \| null | 按第 6 节枚举筛选。 |
| `assetType` | string \| null | 卡/次课/储值等类型（枚举由后端定义）。 |
| `expiringBefore` | string \| null | 筛选在指定时间**之前**到期的资产（临期，语义固定为「到期日 ≤ 该时间点」或等价，须在附录写死）。 |
| `from` | string \| null | 时间范围起。 |
| `to` | string \| null | 时间范围止。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`assetId` 有值**：返回**单个**资产详情（或 404）；须校验资产所属门店在**当前用户权限**内。  
- **`memberId` 有值**：返回该会员下**资产列表**（分页）。  
- **`orderId` 有值**：返回该订单**关联资产**（一条或多条）。  
- **`assetId` / `memberId` / `orderId` 均无值**：返回**资产列表**（全局或默认门店范围下，**仍须分页**，见第 9 节）。  
- **`storeId` / `storeIds`**：必须与后端根据**当前用户**解析的允许门店集合求交。  
- **`role`**：**不能完全相信前端**；鉴权以服务端为准。  
- **`from` / `to`**：必须在契约附录**明确**过滤的是 **`createdAt`、`activatedAt`、`expiredAt` 还是 `updatedAt`**（或组合规则）；禁止语义模糊。

---

## 5. 出参设计

### 5.1 统一包装

| 字段 | 说明 |
|------|------|
| `data` | 列表为数组；详情为单个对象；错误时为 `null`。 |
| `meta` | 分页、`requestId`、`total`、`hasMore` 等与只读 meta 可映射。 |
| `error` | 失败时非空。 |

### 5.2 列表项：每个资产至少包含

| 字段 | 说明 |
|------|------|
| `id` | 资产主键。 |
| `memberId` | 所属会员。 |
| `memberName` | 展示名（可脱敏策略与会员主数据一致）。 |
| `assetNo` | 资产编号。 |
| `assetName` | 资产名称/卡名。 |
| `assetType` | 类型枚举。 |
| `assetStatus` | 状态枚举（见第 6 节）。 |
| `productId` | 关联产品。 |
| `productName` | 产品展示名。 |
| `orderId` | 关联订单（可空）。 |
| `contractId` | 关联合同（可空）。 |
| `primaryStoreId` | 主归属门店。 |
| `availableStoreIds` | 可用门店列表（若无多店则为单元素或空数组，由契约固定）。 |
| `totalQuota` | 总配额（节数/金额口径由附录写死）。 |
| `remainingQuota` | 剩余。 |
| `usedQuota` | 已用。 |
| `frozenQuota` | 冻结中配额。 |
| `activatedAt` | 生效时间。 |
| `expiredAt` | 到期时间。 |
| `frozenUntil` | 冻结截止（可空）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `rightsSummary` | 权益摘要（只读）。 |
| `sourceOrderSummary` | 来源订单摘要。 |
| `contractSummary` | 合同摘要。 |
| `paymentSummary` | 支付摘要（不含完整卡号等敏感信息）。 |
| `refundSummary` | 退款/作废摘要。 |
| `freezeSummary` | 冻结摘要。 |
| `transferSummary` | 转出摘要。 |
| `bookingSummary` | 预约关联摘要。 |
| `consumptionSummary` | 课消摘要。 |
| `operationSummary` | 操作/审计摘要（非写接口）。 |

---

## 6. 状态字段口径（assetStatus）

| 值 | 含义 |
|----|------|
| `effective` | 可用 |
| `pending` | 待生效 / 待确认 |
| `frozen` | 冻结中 |
| `expired` | 已过期 |
| `refunded` | 已退款 / 已作废（若业务区分退款与作废，可在契约附录拆分为两值；本表为 P0 合并占位） |
| `transferred` | 已转出 |
| `voided` | 已作废 |
| `unknown` | 无法识别（兜底，应极少出现） |

### 6.1 前后端边界

- **前端不得自行改资产状态**（仅展示）。  
- **前端不得仅根据日期自行判定**真实作废/失效；以 **`assetStatus`** 及后端约定字段为准。  
- **后端必须返回明确 `assetStatus`**（由业务规则与账本推导）。  
- **adapter 只能兜底展示**（缺字段补默认文案或占位），**不得推断真实资产状态**（不根据日期把 unknown 改成 expired 等）。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 脱敏与其它 |
|-------------|----------|------------|
| 总部管理员 | **全部门店**资产（RBAC 内） | 手机号默认不在本接口返回；若带会员联系方式须脱敏。 |
| 店长 | **本店或授权门店** | 同上。 |
| 财务 | 资产及与订单/支付**必要关联** | **会员隐私脱敏**；支付明细字段白名单。 |
| 老师 | **与自己相关会员**的必要资产**摘要** | **不得**看完整财务细节（字段白名单由后端裁剪）。 |
| 投资人 | **仅汇总** | **不应**直接调用 `memberAssetQuery` 拉明细；网关可 403。 |
| 合作门店管理员 | **本合作店**资产 | 越权 403。 |
| 通用 | 手机号 | **默认不返回**；必要时仅 `phoneMasked` 类字段。 |
| P0 | 敏感信息 | **身份证、住址等**不进入 P0 `memberAssetQuery`。 |

---

## 8. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限或越店** | **403** |
| `NOT_FOUND` | `assetId` / `memberId` / `orderId` **不存在**或**无可见资产**（策略二选一须文档固定） | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**语义约定**：

- **403**：无权限或越店；不得返回他店资产。  
- **404**：资源不存在或无权视为不存在。  
- **422**：参数**组合**不合法（如互斥条件同时传入且未定义优先级）。  
- **网络失败**：由 **`apiClient` 统一处理**，不混入上述后端 `code`。

---

## 9. 分页与筛选

- **第一版**：**`page` + `pageSize`**。  
- **`cursor`**：后续大列表优化。  
- **`pageSize` 最大值**：建议 **100**，后端强制截断。  
- **默认排序**：按 **`updatedAt` 或 `expiredAt` 倒序**（**二选一并写死**于附录）。  
- **`expiringBefore`**：用于**临期资产**筛选（与 `expiredAt` 语义绑定）。  
- **多门店**：必须受权限限制。  
- **禁止**：资产列表**一次性全量无分页**返回（除非后端明确上限且仍返回 `meta.total` 与截断策略——不推荐，第一版应强制分页）。

---

## 10. 与前端现有类型映射

- 后端 **snake_case** 由 **`memberAdapter`**（及与资产在 Mall 侧复用的 **`mallAdapter`** 中相关映射，若有）统一转为 **camelCase**。  
- 前端 **`MemberAsset` 类型**（`types.ts`）**保持不变**；新增字段由后续 MR 扩展类型与 adapter。  
- **缺失字段**：**adapter 兜底**（安全默认值），避免 UI 崩溃。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**在组件内根据后端**原始字段**拼业务规则（规则以后端 `assetStatus` 与契约为准）。

---

## 11. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 正常有效资产 |
| 2 | 即将过期资产 |
| 3 | 已过期资产 |
| 4 | 冻结中资产 |
| 5 | 已退款 / 作废资产 |
| 6 | 已转出资产 |
| 7 | 一个会员多张资产 |
| 8 | 一个订单关联一张资产 |
| 9 | 一个订单关联多张资产 |
| 10 | 无资产会员 |
| 11 | 不同门店资产 |
| 12 | 无权限门店资产（应不可见或 403） |
| 13 | `assetId` 不存在 |
| 14 | `memberId` 不存在 |
| 15 | 越店访问 **403** |

---

## 12. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 模式仍可用**。 |
| 2 | **live 可通过配置开启**。 |
| 3 | `memberAssetQuery` **成功**时，**会员详情资产区**能加载。 |
| 4 | **`orderId` 查询成功**时，**订单关联资产**能加载。 |
| 5 | **空数据**空态；**失败**错误态。 |
| 6 | **越店**不返回数据（403 或等价）。 |
| 7 | **不返回完整手机号**；**不返回**身份证、住址。 |
| 8 | **不写数据库**；**不改资产状态**。 |
| 9 | **不生成**冻结 / 转卡 / 退款记录。 |
| 10 | **不影响** Members / Mall / Courses / Finance / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 13. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`member_assets`**（或实际集合名）？  
- [ ] 集合**字段**是否与本文第 5 节一致或可映射？  
- [ ] **资产状态**是否由**后端统一推导**（单一事实来源）？  
- [ ] 资产与 **order / contract / payment** 的**关联字段**是否稳定、可索引？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 14. 下一步建议

- 若**第 13 节**已全部确认且第 4～9 节评审无争议：进入 **《memberAssetQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `memberService` 中资产相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：memberAssetQuery 契约确认草案 |
