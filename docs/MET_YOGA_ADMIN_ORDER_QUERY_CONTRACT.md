# MET YOGA 管理后台 · orderQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`orderQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `orderQuery`；**当前不接真实云函数**；**本轮不改** `mallService` / `mallAdapter` / `Mall` 等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| mallService / mallAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Mall 页面 | **已接入** `mallService`（只读快照等）。 |
| 订单、合同、支付、会员资产 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`orderQuery` 后端契约**（入参、出参、状态口径、金额、权限、错误码、测试数据），通过后再进入《orderQuery live 接入 v1》。 |

---

## 2. orderQuery 定位

- **只读查询**：仅返回订单及行项目等只读数据，用于 Mall 订单列表与详情抽屉。  
- **不做**：订单新增、修改、删除。  
- **不做**：确认收款、退款、合同生成、资产发放、财务分录、老师课时费。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`orderCommand` / `paymentCommand` / `refundRequestCommand` / `assetGrantCommand` / `financeCommand`**（或等价命名）及审批流；不得借 `orderQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`orderQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：支持 **订单编号**、**会员姓名**、**手机后四位**、**产品名称**（匹配规则由后端定义）。 |
| `orderId` | string \| null | 有值：**单个订单详情**；无值：**列表**。 |
| `orderNo` | string \| null | 按订单号精确或模糊（由后端定义）。 |
| `memberId` | string \| null | 按会员过滤。 |
| `memberName` | string \| null | 可选；与 `q` 分工或合并策略由评审固定。 |
| `productId` | string \| null | 按产品过滤。 |
| `productType` | string \| null | 产品类型筛选。 |
| `contractId` | string \| null | 按关联合同过滤。 |
| `paymentId` | string \| null | 按关联支付过滤。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `orderStatus` | string \| null | 见第 6 节 `OrderStatus`。 |
| `paymentStatus` | string \| null | 见第 6 节 `PaymentStatus`。 |
| `contractStatus` | string \| null | 见第 6 节 `ContractStatus`。 |
| `assetStatus` | string \| null | 订单维度**关联资产摘要**筛选（非资产主数据事实源）。 |
| `source` | string \| null | 订单来源渠道（枚举由后端定义）。 |
| `from` | string \| null | 时间范围起。 |
| `to` | string \| null | 时间范围止。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`orderId` 有值**：返回**单个**订单详情（含扩展块，见第 5 节）；须校验门店权限。  
- **`orderId` 无值**：返回**订单列表**（分页）。  
- **`q`**：语义见上表。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`createdAt`、`paidAt`、`updatedAt` 或 `completedAt`** 之一（或组合优先级）；禁止模糊。  
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

### 5.2 列表项：每个订单至少包含

| 字段 | 说明 |
|------|------|
| `id` | 订单主键。 |
| `orderNo` | 订单编号。 |
| `memberId` | 会员 ID。 |
| `memberName` | 会员展示名。 |
| `memberPhoneMasked` | **脱敏**手机号。 |
| `primaryStoreId` | 主门店。 |
| `storeName` | 门店展示名。 |
| `productId` | 主产品或代表产品 ID（若多行则契约定义取首行或汇总键）。 |
| `productName` | 产品展示名。 |
| `productType` | 产品类型。 |
| `orderStatus` | 见第 6 节。 |
| `paymentStatus` | 见第 6 节。 |
| `contractStatus` | 见第 6 节。 |
| `assetStatus` | 订单上**关联资产摘要**状态（非资产主事实源）。 |
| `originalAmount` | 原价（见第 8 节单位）。 |
| `discountAmount` | 优惠金额。 |
| `paidAmount` | 已收金额。 |
| `refundAmount` | 已退金额。 |
| `netAmount` | 净收款。 |
| `currency` | 币种（如 `CNY`）。 |
| `source` | 订单来源。 |
| `salespersonId` | 销售/经办人 ID（可空）。 |
| `salespersonName` | 展示名（可空）。 |
| `createdAt` | 创建时间。 |
| `paidAt` | 支付完成时间（可空）。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `orderItems` | 行项目数组（结构见下表）。 |
| `contractSummary` | 合同摘要。 |
| `paymentSummary` | 支付摘要。 |
| `refundSummary` | 退款摘要。 |
| `memberAssetSummary` | 资产摘要。 |
| `invoiceSummary` | 发票摘要（若有）。 |
| `riskSummary` | 风险摘要（只读）。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

### 5.4 `orderItems` 每项至少包含

| 字段 | 说明 |
|------|------|
| `id` | 行 ID。 |
| `orderId` | 所属订单。 |
| `productId` | 产品 ID。 |
| `productName` | 产品名。 |
| `productType` | 类型。 |
| `quantity` | 数量。 |
| `unitPrice` | 单价（单位与第 8 节一致）。 |
| `subtotalAmount` | 行小计。 |
| `discountAmount` | 行优惠。 |
| `paidAmount` | 行已收（若无可与订单级对齐策略）。 |
| `grantedAssetId` | 已发放资产 ID（可空）。 |
| `createdAt` | 创建时间。 |

---

## 6. 状态字段口径

### 6.1 OrderStatus（建议）

| 值 | 含义 |
|----|------|
| `draft` | 草稿 / 待确认 |
| `pending_payment` | 待支付 |
| `paid` | 已支付 |
| `partially_refunded` | 部分退款 |
| `refunded` | 已退款 |
| `cancelled` | 已取消 |
| `closed` | 已关闭 |
| `unknown` | 无法识别 |

### 6.2 PaymentStatus（建议）

| 值 | 含义 |
|----|------|
| `unpaid` | 未支付 |
| `pending` | 待确认 |
| `paid` | 已支付 |
| `partial_refunded` | 部分退款 |
| `refunded` | 已退款 |
| `failed` | 支付失败 |
| `unknown` | 无法识别 |

### 6.3 ContractStatus（建议）

| 值 | 含义 |
|----|------|
| `none` | 暂无合同 |
| `draft` | 合同草稿 |
| `pending_sign` | 待签署 |
| `signed` | 已签署 |
| `voided` | 已作废 |
| `unknown` | 无法识别 |

### 6.4 AssetStatus 在订单中的角色

- 在订单中**仅作关联摘要**，**不作为资产事实源**；资产真相以 `memberAssetQuery` / 账本为准。

### 6.5 前后端边界

- **前端不得自行改订单状态**。  
- **前端不得仅根据 `paidAmount` 判定**真实支付完成；以 **`paymentStatus` / 后端约定**为准。  
- **前端不得仅根据 `contractId` 判定**合同已签；以 **`contractStatus`** 为准。  
- **前端不得仅根据 `grantedAssetId` 判定**资产真实发放；以 **`assetStatus` 摘要 + 资产接口**为准。  
- **后端必须返回明确状态字段**。  
- **adapter 只能兜底展示**，**不得推断**真实订单 / 支付 / 合同 / 资产状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**订单 | 手机号脱敏仍建议默认开启。 |
| 店长 | **本店或授权门店** | 同上。 |
| 财务 | 订单金额、支付、退款、核对字段 | 按字段白名单；会员隐私脱敏。 |
| 销售 / 教务 | **权限范围内**订单 | 与 RBAC 绑定。 |
| 老师 | 默认**不应**看订单金额与支付细节 | 除非有**明确授权**与白名单字段。 |
| 投资人 | **仅汇总** | **不应**直接调用 `orderQuery` 拉会员订单明细。 |
| 合作门店管理员 | **本合作店**订单 | 越权 403。 |
| 通用 | 手机号 | **`memberPhoneMasked`**，不返回完整手机号。 |
| P0 | 敏感信息 | **身份证、住址**不进入 P0 `orderQuery`。 |

---

## 8. 金额字段口径

- **单位**：全链路**统一为「分」或统一为「元」**；**推荐后端以「分」返回整数**，前端统一格式化展示（须在契约附录**写死**一种，禁止混用）。  
- **必须返回** `currency`。  
- **`originalAmount`**：订单原价。  
- **`discountAmount`**：优惠金额。  
- **`paidAmount`**：已收金额。  
- **`refundAmount`**：已退金额。  
- **`netAmount`**：净收款金额（定义式须在附录写死，例如 `paidAmount - refundAmount` 是否含税费等）。  
- **不允许前端自行计算**真实财务口径净额用于入账判断。  
- **财务确认收入、预收负债、正式分录**不由 `orderQuery` 生成；本接口**只提供订单事实**，**不代表已入账**。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限或越店** | **403** |
| `NOT_FOUND` | `orderId` 不存在或**无可见订单** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**语义约定**：**403** 越店；**404** 资源不可见；**422** 参数组合不合法；**网络失败**由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`createdAt` 或 `updatedAt` 倒序**（**二选一并写死**于附录）。  
- **多门店**：必须受权限限制。  
- **禁止**：订单列表**一次性全量无分页**。  
- **金额范围筛选**：若后续需要，由**后端**支持；**禁止**前端拉全量再过滤。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`mallAdapter`** 转为 **camelCase**。  
- 前端 **`Order` / `OrderItem`** 类型（`types.ts`）**保持不变**；扩展由后续 MR 处理。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**订单页**绕过 `mallService`**（须统一经 mall 只读 service 出口，与当前架构一致）。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 正常已支付订单 |
| 2 | 待支付订单 |
| 3 | 合同待签订单 |
| 4 | 合同已签订单 |
| 5 | 已生成资产订单 |
| 6 | 未生成资产订单 |
| 7 | 部分退款订单 |
| 8 | 全额退款订单 |
| 9 | 已取消订单 |
| 10 | 一个订单多个 `orderItems` |
| 11 | 一个会员多个订单 |
| 12 | 不同门店订单 |
| 13 | 无权限门店订单（不可见或 403） |
| 14 | 搜索无结果 |
| 15 | 分页第二页有数据 |
| 16 | `orderId` 不存在 |
| 17 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `orderQuery` **成功**时 **Mall 订单列表**能加载。 |
| 3 | **详情成功**时订单**详情抽屉**能打开。 |
| 4 | **`orderItems`** 正常展示。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **不返回完整手机号**；**不返回**身份证、住址。 |
| 8 | **不写库**；**不改订单状态**。 |
| 9 | **不生成**合同、支付、资产、退款、财务分录。 |
| 10 | **不影响** Members / Courses / Finance / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`orders`** 集合？  
- [ ] 是否存在 **`order_items`**（或实际表名）？  
- [ ] 字段是否与本文第 5 节一致或可映射？  
- [ ] 订单与 **contract / payment / memberAsset** 的**关联字段**是否稳定？  
- [ ] 订单金额单位是**分**还是**元**（最终定稿）？  
- [ ] 订单状态是否由**后端统一推导**？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《orderQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `mallService` 中订单相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：orderQuery 契约确认草案 |
