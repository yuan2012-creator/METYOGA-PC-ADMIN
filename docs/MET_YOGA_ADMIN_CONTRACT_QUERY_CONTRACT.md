# MET YOGA 管理后台 · contractQuery 后端契约确认 v1

**读者**：前端、后端、云函数负责人  
**性质**：`contractQuery` 只读接口契约草案，用于评审与签字确认；**非**已上线接口文档。  
**范围**：仅 `contractQuery`；**当前不接真实云函数**；**本轮不改** `mallService` / `mallAdapter` / `Mall` 等业务代码。

---

## 1. 当前背景

| 事实 | 说明 |
|------|------|
| mallService / mallAdapter | **已完成** P0 只读 mock 路径与字段适配。 |
| Mall 页面 | **已接入** `mallService`（只读快照等）。 |
| 订单、合同、支付、会员资产 | **仍走 mock service**（selector / 常量构建）。 |
| `dataSource: 'live'` | **仍返回** `REAL_API_NOT_CONNECTED`，不发起网络请求。 |
| 本仓库基础设施 | **无**云函数源码目录、**无**云环境工程级配置、**无**真实登录态、**无**真实角色与门店范围来源。 |
| 本文档目的 | 供各方确认 **`contractQuery` 后端契约**（入参、出参、状态、文件与隐私、权限、错误码、测试数据），通过后再进入《contractQuery live 接入 v1》。 |

---

## 2. contractQuery 定位

- **只读查询**：仅返回合同及关联摘要，用于 Mall 合同列表、订单侧合同摘要等。  
- **不做**：合同新增、修改、作废、签署、合同模板发布。  
- **不做**：订单修改、资产发放、退款 / 冻结 / 转卡、财务分录。  
- **不写**：`OperationLog`（本接口范围内）。  
- **后续真实写入**：须另走 **`contractCommand` / `signCallback` / `approval`**（或等价命名）流程；不得借 `contractQuery` 夹带写操作。

---

## 3. 建议云函数名称与调用方式

| 项 | 约定 |
|----|------|
| 建议云函数名 | **`contractQuery`**。 |
| 调用方式 | **待确认**：浏览器是否可直连 **`wx.cloud.callFunction`**，或经 **HTTP / BFF** 网关。 |

---

## 4. 入参设计

### 4.1 建议请求体字段（JSON）

| 字段 | 类型建议 | 说明 |
|------|----------|------|
| `page` | number | 页码，从 1 开始。 |
| `pageSize` | number | 每页条数。 |
| `cursor` | string \| null | 可选；预留游标分页。 |
| `q` | string \| null | 搜索：**合同编号**、**会员姓名**、**手机后四位**、**产品名称**（规则由后端定义）。 |
| `contractId` | string \| null | 有值：**单个合同详情**。 |
| `contractNo` | string \| null | 按合同号精确或模糊（由后端定义）。 |
| `orderId` | string \| null | 有值：**订单关联合同**（一条或多条，策略固定）。 |
| `memberId` | string \| null | 有值：**会员合同列表**。 |
| `memberName` | string \| null | 可选；与 `q` 分工由评审固定。 |
| `productId` | string \| null | 按产品过滤。 |
| `productType` | string \| null | 产品类型。 |
| `storeId` | string \| null | 单店。 |
| `storeIds` | string[] \| null | 多店。 |
| `contractStatus` | string \| null | 见第 6 节。 |
| `templateId` | string \| null | 按模板过滤。 |
| `signedFrom` / `signedTo` | string \| null | 签署时间窗（与 `signedAt` 语义绑定）。 |
| `effectiveFrom` / `effectiveTo` | string \| null | 生效时间窗（与 `effectiveAt` 语义绑定）。 |
| `from` / `to` | string \| null | 通用时间范围（见 4.2）。 |
| `role` | string \| null | **仅提示/审计**；**权限以后端登录态为准**。 |
| `requestId` | string | 全链路追踪，建议必填。 |

### 4.2 行为规则

- **`contractId` 有值**：返回**单个**合同详情；须校验门店权限。  
- **`orderId` 有值**：返回该订单**关联合同**（列表或单条，须在附录写死）。  
- **`memberId` 有值**：返回该会员**合同列表**（分页）。  
- **`contractId` / `orderId` / `memberId` 均无值**：返回**合同列表**（分页）。  
- **`q`**：语义见上表。  
- **`from` / `to`**：必须在契约附录**明确**过滤字段为 **`createdAt`、`signedAt`、`effectiveAt`、`updatedAt` 或 `expiredAt`** 之一（或组合优先级）；禁止模糊。  
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

### 5.2 列表项：每个合同至少包含

| 字段 | 说明 |
|------|------|
| `id` | 合同主键。 |
| `contractNo` | 合同编号。 |
| `title` | 合同标题。 |
| `memberId` | 会员 ID。 |
| `memberName` | 会员展示名。 |
| `memberPhoneMasked` | **脱敏**手机号。 |
| `orderId` | 关联订单（可空）。 |
| `orderNo` | 订单号展示（可空）。 |
| `productId` | 关联产品。 |
| `productName` | 产品名。 |
| `productType` | 产品类型。 |
| `primaryStoreId` | 主门店。 |
| `storeName` | 门店展示名。 |
| `templateId` | 模板 ID。 |
| `templateName` | 模板名。 |
| `contractStatus` | 见第 6 节。 |
| `sentAt` | 发出时间（可空）。 |
| `signedAt` | 签署时间（可空）。 |
| `effectiveAt` | 生效时间（可空）。 |
| `expiredAt` | 到期时间（可空）。 |
| `voidedAt` | 作废时间（可空）。 |
| `createdAt` | 创建时间。 |
| `updatedAt` | 最近更新时间。 |

### 5.3 详情在列表字段基础上可增加

| 字段 | 说明 |
|------|------|
| `orderSummary` | 订单摘要。 |
| `productSummary` | 产品摘要。 |
| `memberAssetSummary` | 资产摘要。 |
| `paymentSummary` | 支付摘要。 |
| `refundSummary` | 退款摘要。 |
| `importantTerms` | 重要条款摘要（结构见下）。 |
| `signatureSummary` | 签署方摘要（非原图）。 |
| `fileSummary` | 文件摘要（结构见下）。 |
| `riskSummary` | 风险摘要（只读）。 |
| `operationSummary` | 操作/审计摘要（非写日志接口）。 |

### 5.4 `importantTerms` 至少包含

| 字段 | 说明 |
|------|------|
| `refundRuleSummary` | 退款规则摘要。 |
| `freezeRuleSummary` | 冻结规则摘要。 |
| `transferRuleSummary` | 转卡规则摘要。 |
| `cancellationRuleSummary` | 解约/取消规则摘要。 |
| `validityRuleSummary` | 有效期规则摘要。 |

### 5.5 `fileSummary` 至少包含

| 字段 | 说明 |
|------|------|
| `fileId` | 文件 ID（推荐主键式访问）。 |
| `fileName` | 文件名。 |
| `fileUrl` 或 `secureFileUrl` | **二选一或并存**由契约固定；须满足第 8 节权限与有效期。 |
| `fileStatus` | 文件状态（枚举由后端定义）。 |
| `generatedAt` | 生成时间。 |

---

## 6. 状态字段口径（ContractStatus）

| 值 | 含义 |
|----|------|
| `draft` | 合同草稿 |
| `pending_signature` | 待签署 |
| `signed` | 已签署 |
| `effective` | 已生效 |
| `voided` | 已作废 |
| `expired` | 已过期 |
| `terminated` | 已终止 |
| `unknown` | 无法识别 |

### 6.1 前后端边界

- **前端不得自行改合同状态**。  
- **前端不得仅根据 `signedAt` 判定**合同真实生效；以 **`contractStatus`** 为准。  
- **前端不得仅根据 `orderId` 判定**合同有效。  
- **前端不得仅根据 `fileUrl` / `secureFileUrl` 判定**合同已签；签署与生效以 **`contractStatus`** 及后端规则为准。  
- **合同是否生效必须以后端 `contractStatus` 为准**。  
- **adapter 只能兜底展示**，**不得推断**真实合同状态。

---

## 7. 权限与脱敏

| 角色 / 场景 | 数据范围 | 说明 |
|-------------|----------|------|
| 总部管理员 | **全部门店**合同 | 文件 URL 须权限控制（见第 8 节）。 |
| 店长 | **本店或授权门店** | 同上。 |
| 财务 | 合同金额关联、订单与支付**摘要** | 会员隐私脱敏。 |
| 销售 / 教务 | **权限范围内**合同 | 与 RBAC 绑定。 |
| 老师 | 默认**不应**看合同详情与金额条款 | 除非**明确授权**与白名单。 |
| 投资人 | **仅汇总** | **不应**直接调用 `contractQuery` 拉会员合同明细。 |
| 合作门店管理员 | **本合作店**合同 | 越权 403。 |
| 手机号 | 默认 | **`memberPhoneMasked`**，不返回完整手机号。 |
| P0 敏感信息 | | **身份证、住址**不进入 P0 `contractQuery`。 |
| 合同文件 URL | | **必须有权限控制**；**不允许**长期有效的**公开直链**作为默认交付方式。 |

---

## 8. 合同文件与隐私字段口径

- **P0 默认不返回完整身份证号**。  
- **P0 默认不返回住址**。  
- **P0 默认不返回手写签名原图**，除非具备**法务授权**与单独字段策略。  
- 合同 PDF / 文件链接须为 **短期有效 `secureUrl`** 或 **`fileId` + 受控下载接口**（由后端二选一并文档化）。  
- **文件下载必须走权限校验**（鉴权、门店范围、合同归属）。  
- **后续导出合同**须生成 **`ExportTask` / `OperationLog`**（不在本只读接口内实现，此处为约束）。  
- **前端不应缓存**合同隐私文件（浏览器缓存策略与响应头由后端指导）。

---

## 9. 错误码

| code | 含义 | HTTP 建议 |
|------|------|-----------|
| `VALIDATION_ERROR` | 参数非法 | **422** |
| `UNAUTHORIZED` | 未登录 / Token 无效 | **401** |
| `FORBIDDEN` | **无权限或越店** | **403** |
| `NOT_FOUND` | `contractId` / `orderId` / `memberId` 不存在或**无可见合同** | **404** |
| `BUSINESS_RULE` | 业务规则不满足 | **422** |
| `INTERNAL_ERROR` | 服务端异常 | **500** |

**语义约定**：**403** 越店；**404** 不可见资源；**422** 参数组合不合法；**网络失败**由 **`apiClient` 统一处理**。

---

## 10. 分页与筛选

- **第一版**：`page` + `pageSize`；**`cursor`** 后续优化。  
- **`pageSize` 最大**：建议 **100**。  
- **默认排序**：按 **`updatedAt` 或 `signedAt` 倒序**（**二选一并写死**于附录）。  
- **多门店**：必须受权限限制。  
- **禁止**：合同列表**一次性全量无分页**。  
- **列表接口**：**不返回**合同文件**完整内容**；仅 **摘要**（`fileSummary` 等）；详情亦避免内嵌大段 PDF Base64。

---

## 11. 与前端现有类型映射

- 后端 **snake_case** 由 **`mallAdapter`** 转为 **camelCase**。  
- 前端 **`Contract` 类型**（`types.ts`）**保持不变**；扩展由后续 MR 处理。  
- **缺失字段**：**adapter 兜底**。  
- **不允许**组件直接处理 **snake_case**。  
- **不允许**组件直接调用云函数。  
- **不允许**组件根据**原始字段**拼业务规则。  
- **不允许**合同相关 UI **绕过 `mallService`**。

---

## 12. 测试数据要求（后端准备）

| # | 场景 |
|---|------|
| 1 | 合同草稿 |
| 2 | 待签署合同 |
| 3 | 已签署合同 |
| 4 | 已生效合同 |
| 5 | 已作废合同 |
| 6 | 已过期合同 |
| 7 | 已终止合同 |
| 8 | 一个订单一个合同 |
| 9 | 一个会员多个合同 |
| 10 | 合同有关联订单 |
| 11 | 合同有关联资产 |
| 12 | 合同有关联支付 |
| 13 | 合同无文件 |
| 14 | 合同文件**无权限**访问（应 403 或无 `secureUrl`） |
| 15 | 不同门店合同 |
| 16 | 无权限门店合同 |
| 17 | 搜索无结果 |
| 18 | 分页第二页有数据 |
| 19 | `contractId` 不存在 |
| 20 | 越店访问 **403** |

---

## 13. 验收标准（live 接入完成后对照）

| # | 标准 |
|---|------|
| 1 | **mock 仍可用**；**live 可配置开启**。 |
| 2 | `contractQuery` **成功**时 **Mall 合同相关区域**能加载。 |
| 3 | **详情成功**时订单详情 / **合同摘要**能显示。 |
| 4 | **`orderId` 查询成功**时订单**关联合同**能加载。 |
| 5 | **空态** / **错误态**正确。 |
| 6 | **越店**不返回数据。 |
| 7 | **不返回完整手机号**；**不返回**身份证、住址。 |
| 8 | **不返回长期有效公开合同文件 URL**（须短期或受控下载）。 |
| 9 | **不写库**；**不改合同状态**；**不生成**合同/作废/签署状态/资产/财务分录。 |
| 10 | **不影响** Members / Courses / Finance / Dashboard / Staff 未接入路径。 |
| 11 | **`npm run build` 通过**。 |

---

## 14. 待确认问题（人工勾选）

- [ ] 真实云函数在**哪个仓库**？  
- [ ] **云环境 ID**？  
- [ ] **PC 后台**如何获得**登录态**？  
- [ ] **当前角色**如何判断？  
- [ ] **当前门店范围**如何判断？  
- [ ] 是否存在 **`contracts`** 集合（或实际表名）？  
- [ ] **字段**是否与本文第 5 节一致或可映射？  
- [ ] **合同状态**是否由**后端统一推导**？  
- [ ] 合同文件是 **`fileId`** 还是 **`secureUrl`**（或组合）？  
- [ ] **合同文件链接有效期**多久？  
- [ ] 合同与 **order / memberAsset / payment** 的**关联字段**是否稳定？  
- [ ] 是否已有**合同模板版本管理**？  
- [ ] 是否已有**测试云环境**？  
- [ ] 第一版是否优先 **HTTP / BFF** 而非 `wx.cloud`？

---

## 15. 下一步建议

- 若**第 14 节**已全部确认且第 4～10 节评审无争议：进入 **《contractQuery live 接入 v1》**。  
- 若**未确认**：**先不要修改**前端 `live` 分支与 `mallService` 中合同相关真实调用代码。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：contractQuery 契约确认草案 |
