# MET YOGA 管理后台 · paymentQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`paymentQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `paymentQuery`；**当前不接真实云函数**；**本轮不改** `mallService` / `financeService` / `mallAdapter` / `financeAdapter` / 页面等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| mallService / mallAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| financeService / financeAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Mall 页面 | **已接入** `mallService`（只读快照等）。 |
| Finance 页面 | **已接入** `financeService`（只读快照等）。 |
| 订单、合同、支付、会员资产 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`paymentQuery` 后端契约**（入参、出参、状态、金额与对账、权限、错误码、测试数据），通过后再进入《paymentQuery live 接入 v1》。 |

---

## 2. paymentQuery 定位

- **只读查询**：仅返回支付及对账摘要等只读数据，供 Mall 订单详情、Finance 支付相关区域等使用。  
- **不做**：支付创建、支付确认、支付状态修改、退款、对账写入、财务分录、订单状态修改、资产发放。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`paymentCommand` / `paymentCallback` / `paymentReconcileCommand` / `refundRequestCommand` / `financeLedgerCommand`**（或等价命名）；不得借 `paymentQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`paymentQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：**支付编号**、**订单编号**、**会员姓名**、**手机后四位**、**交易流水号后几位**（规则由后端定义）。 |
| `paymentId` | string \| null | 有值：**单条支付详情**。 |
| `paymentNo` | string \| null | 按支付单号精确或模糊（由后端定义）。 |
| `orderId` | string \| null | 有值：**订单关联支付记录**（列表）。 |
| `orderNo` | string \| null | 按订单号过滤。 |
| `memberId` | string \| null | 有值：**会员支付记录**（列表）。 |
| `memberName` | string \| null | 可选；与 `q` 分工由评审固定。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `paymentStatus` | string \| null | 见第 6 节 `PaymentStatus`。 |
| `paymentMethod` | string \| null | 支付方式枚举（由后端定义）。 |
| `transactionNo` | string \| null | 按流水号过滤（权限与脱敏见第 7 节）。 |
| `reconciledStatus` | string \| null | 见第 6 节 `ReconciledStatus`。 |
| `paidFrom` / `paidTo` | string \| null | 支付完成时间窗（与 `paidAt` 绑定）。 |
| `reconciledFrom` / `reconciledTo` | string \| null | 对账完成时间窗（与 `reconciledAt` 绑定）。 |
| `from` / `to` | string \| null | 通用时间范围（见 4.2）。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`paymentId` 有值**：返回**单条**支付详情；须校验门店权限。  
- **`orderId` 有值**：返回该订单**关联支付记录**（分页或全量由附录写死，默认建议分页）。  
- **`memberId` 有值**：返回该会员**支付记录**（分页）。  
- **`paymentId` / `orderId` / `memberId` 均无值**：返回**支付列表**（分页）。  
- **`q`**：语义见上表。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`createdAt`、`paidAt`、`reconciledAt` 或 `updatedAt`** 之一（或组合优先级）；禁止模糊。  
- **`storeId` / `storeIds`**：必须与后端根据**当前用户**解析的允许门店集合求交。  
- **`role`**：**不能完全相信前端**；鉴权以服务端为准。

---

## 5. 出参设计

### 5.1 统一包装

| 字段 | 说明 |
|------|------|
| `data` | 列表为数组；详情为单个对象；错误时为 `null`。 |
| `meta` | 分页、`requestId`、`total`、`hasMore` 等。 |
| `error` | 失败时非空。 |

### 5.2 列表项：每条支付至少包含

| 字段 | 说明 |
|------|------|
| `id` | 支付主键。 |
| `paymentNo` | 支付单号。 |
| `orderId` | 关联订单（可空）。 |
| `orderNo` | 订单号展示（可空）。 |
| `memberId` | 会员 ID。 |
| `memberName` | 会员展示名。 |
| `memberPhoneMasked` | **脱敏**手机号。 |
| `primaryStoreId` | 主门店。 |
| `storeName` | 门店展示名。 |
| `paymentStatus` | 见第 6 节。 |
| `paymentMethod` | 支付方式。 |
| `amount` | 支付金额（单位见第 8 节）。 |
| `currency` | 币种。 |
| `transactionNoMasked` | **脱敏**交易流水号（默认展示）。 |
| `channel` | 支付渠道。 |
| `paidAt` | 支付完成时间（可空）。 |
| `reconciledAt` | 对账完成时间（可空）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

**可选扩展（若后端返回，须与第 8 节一致）**：`refundedAmount`（已退款金额）、`netAmount`（净支付参考）；未返回时 adapter 不自行推算。

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `orderSummary` | 订单摘要。 |
| `contractSummary` | 合同摘要。 |
| `memberAssetSummary` | 资产摘要。 |
| `refundSummary` | 退款摘要。 |
| `reconciliationSummary` | 对账摘要（结构见下）。 |
| `channelSummary` | 渠道侧摘要（不含密钥）。 |
| `riskSummary` | 风险摘要（只读）。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

### 5.4 `reconciliationSummary` 至少包含

| 字段 | 说明 |
|------|------|
| `reconciledStatus` | 见第 6 节 `ReconciledStatus`。 |
| `reconciledBy` | 对账操作人 ID 或展示名（可空，视审计策略）。 |
| `reconciledAt` | 对账时间（可空）。 |
| `differenceAmount` | 对账差异金额（单位与第 8 节一致）。 |
| `note` | 对账备注（可空）。 |

---

## 6. 状态字段口径

### 6.1 PaymentStatus（建议）

| 值 | 含义 |
|----|------|
| `initiated` | 已发起 |
| `pending` | 待支付 / 待确认 |
| `paid` | 已支付 |
| `reconciled` | 已对账 |
| `failed` | 支付失败 |
| `cancelled` | 已取消 |
| `refunding` | 退款中 |
| `partially_refunded` | 部分退款 |
| `refunded` | 已退款 |
| `unknown` | 无法识别 |

### 6.2 ReconciledStatus（建议）

| 值 | 含义 |
|----|------|
| `unreconciled` | 未对账 |
| `matched` | 已匹配 |
| `mismatch` | 金额或流水不一致 |
| `manual_review` | 需人工复核 |
| `unknown` | 无法识别 |

### 6.3 前后端边界

- **前端不得自行改支付状态**。  
- **前端不得仅根据 `amount` 判定**已收款；以 **`paymentStatus`** 为准。  
- **前端不得仅根据 `transactionNo`（或脱敏字段）判定**真实到账；以 **`paymentStatus`** 与渠道回调事实为准。  
- **前端不得根据 `orderStatus` 反推 `paymentStatus`**。  
- **支付是否完成**必须以 **`paymentStatus`** 为准。  
- **对账状态**必须以 **`reconciledStatus`**（及 `reconciliationSummary`）为准。  
- **adapter 只能兜底展示**，**不得推断**真实支付或对账状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**支付记录 | 流水号可见策略见下。 |
| 店长 | **本店或授权门店** | 同上。 |
| 财务 | 支付金额、交易流水、对账状态 | 可按角色返回**完整** `transactionNo`（若业务需要，须在契约与白名单内明确）。 |
| 销售 / 教务 | **权限范围内**订单支付**摘要** | 字段裁剪。 |
| 老师 | 默认**不应**看支付流水与金额细节 | 除非**明确授权**。 |
| 投资人 | **仅汇总** | **不应**直接调用 `paymentQuery` 拉会员支付明细。 |
| 合作门店管理员 | **本合作店**支付**摘要** | 越权 403。 |
| 手机号 | 默认 | **`memberPhoneMasked`**。 |
| `transactionNo` | 默认 | **`transactionNoMasked`**；**完整流水号**仅**财务或总部授权角色**可见（字段名或单独 `transactionNoFull` 由契约固定）。 |
| P0 敏感信息 | | **身份证、住址**不进入 P0 `paymentQuery`。 |

---

## 8. 金额与对账字段口径

- **单位**：全链路**统一「分」或「元」**；**推荐后端以「分」返回整数**，前端统一格式化（附录**写死**一种）。  
- **必须返回** `currency`。  
- **`amount`**：支付金额。  
- **`refundedAmount`**（若返回）：须来自**退款事实**，**不由前端估算**。  
- **`netAmount`**（若返回）：须说明是否已扣减退款及税费等口径。  
- **`differenceAmount`**：对账差异金额（与 `reconciliationSummary` 一致）。  
- **`paymentQuery` 只提供支付事实**，**不代表已入账**；**财务确认收入、预收负债、正式分录**不由本接口生成。  
- **前端不得自行计算**正式财务入账口径。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限或越店** | **403** |
| `NOT_FOUND` | `paymentId` / `orderId` / `memberId` 不存在或**无可见支付记录** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**语义约定**：**403** 越店；**404** 不可见资源；**422** 参数组合不合法；**网络失败**由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`paidAt` 或 `createdAt` 倒序**（**二选一并写死**于附录）。  
- **多门店**：必须受权限限制。  
- **禁止**：支付列表**一次性全量无分页**。  
- **按交易流水搜索**：必须支持**脱敏与权限**（禁止向无权限角色泄露完整流水）。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`mallAdapter` / `financeAdapter`**（按调用入口归属）转为 **camelCase**。  
- 前端 **`Payment` 类型**（`types.ts`）**保持不变**；扩展由后续 MR 处理。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**支付相关 UI **绕过 `mallService` / `financeService`**（与当前架构一致）。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 待支付记录 |
| 2 | 已支付记录 |
| 3 | 已对账记录 |
| 4 | 对账差异记录 |
| 5 | 支付失败记录 |
| 6 | 已取消支付记录 |
| 7 | 退款中支付记录 |
| 8 | 部分退款支付记录 |
| 9 | 全额退款支付记录 |
| 10 | 一个订单一笔支付 |
| 11 | 一个订单多笔支付 |
| 12 | 一个会员多笔支付 |
| 13 | 不同门店支付记录 |
| 14 | 无权限门店支付记录 |
| 15 | 搜索无结果 |
| 16 | 分页第二页有数据 |
| 17 | `paymentId` 不存在 |
| 18 | `orderId` 不存在 |
| 19 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `paymentQuery` **成功**时 **Mall 订单详情支付信息**能加载。 |
| 3 | `paymentQuery` **成功**时 **Finance 支付相关区域**能加载。 |
| 4 | **`orderId` 查询成功**时订单**关联支付**能加载。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **不返回完整手机号**；**不返回**身份证、住址。 |
| 8 | **不向非授权角色返回完整 `transactionNo`**（仅脱敏或 `transactionNoMasked`）。 |
| 9 | **不写库**；**不改支付状态**；**不生成**支付、退款、订单状态修改、资产、财务分录。 |
| 10 | **不影响** Members / Courses / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`payments`** 集合（或实际表名）？  
- [ ] **字段**是否与本文第 5 节一致或可映射？  
- [ ] 支付金额单位是**分**还是**元**（最终定稿）？  
- [ ] **`paymentStatus`** 是否由**后端统一推导**？  
- [ ] **`reconciledStatus`** 是否已有且与本枚举对齐？  
- [ ] **`transactionNo`** 是否允许对**非财务角色**返回完整值（默认否）？  
- [ ] 支付与 **order / refund / financeLedger** 的**关联字段**是否稳定？  
- [ ] 是否已有**支付渠道回调**数据落库？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《paymentQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `mallService` / `financeService` 中支付相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：paymentQuery 契约确认草案 |
