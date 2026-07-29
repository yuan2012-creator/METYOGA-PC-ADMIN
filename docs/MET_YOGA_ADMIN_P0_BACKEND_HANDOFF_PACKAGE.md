# MET YOGA 管理后台 · P0 后端对接资料包 v1

**读者**：后端、程序员、云函数负责人、前端接口对接人  
**性质**：P0 **只读 Query** 与 **live 接入前** 的**总入口索引**与对接约定汇总；**非**接口实现说明全文（细节以各契约文档为准）。  
**范围**：本轮**仅新增本文档**；**不修改**业务代码。

---

## 1. 资料包目的

| 要点 | 说明 |
|------|------|
| 用途 | 本资料包用于 **P0 只读真实数据接入前** 的后端对齐、评审与排期；作为从「契约文档」到「联调 / live」的**单一入口**。 |
| 前端现状 | **member / mall / course / finance / dashboard** 的只读 **service / adapter 底座**已完成。 |
| 页面现状 | **Members、Mall、Courses、Finance、Dashboard** 已接入对应 **service**（mock 路径）。 |
| 数据源 | **当前仍走 mock**；**`dataSource: 'live'` 仍返回 `REAL_API_NOT_CONNECTED`**（不发起真实请求）。 |
| 写入 | **当前不包含任何真实写入**；Query 契约范围内亦**禁止**写入。 |
| 风险提示 | **后端确认完成前，不建议前端直接接 live**（避免无鉴权、无门店范围、无测试数据的半成品联调）。 |

**相关前置文档（只读索引）**：`docs/MET_YOGA_ADMIN_P0_LIVE_CLOUD_FUNCTION_PREP.md`、`docs/MET_YOGA_ADMIN_LIVE_INTEGRATION_DEPENDENCY_CHECKLIST.md`。

---

## 2. 当前已完成前端基础

### 2.1 Service / Adapter 文件清单

| 类型 | 路径 |
|------|------|
| API 底座 | `services/apiClient.ts` |
| 只读类型 | `services/readonlyTypes.ts` |
| Service | `services/memberService.ts` |
| Service | `services/mallService.ts` |
| Service | `services/courseService.ts` |
| Service | `services/financeService.ts` |
| Service | `services/dashboardService.ts` |
| Adapter | `adapters/memberAdapter.ts` |
| Adapter | `adapters/mallAdapter.ts` |
| Adapter | `adapters/courseAdapter.ts` |
| Adapter | `adapters/financeAdapter.ts` |
| Adapter | `adapters/dashboardAdapter.ts` |

### 2.2 已接入页面

| 页面 | 对接 Service |
|------|----------------|
| `Members` | `memberService` |
| `Mall` | `mallService` |
| `Courses` | `courseService` |
| `Finance` | `financeService` |
| `Dashboard` | `dashboardService` |

---

## 3. 当前阻塞项（后端 / 云侧须闭环）

以下项**未在本仓库内具备可运行实现**，对接前须逐项确认并落档：

| # | 阻塞项 |
|---|--------|
| 1 | **云函数目录**（或等价 BFF 仓库）与部署入口 |
| 2 | **云环境 ID**（开发 / 测试 / 生产隔离） |
| 3 | **云函数调用方式**（`wx.cloud.callFunction` vs HTTP/BFF） |
| 4 | **登录态来源**（Token / Cookie / 微信体系等） |
| 5 | **角色来源**（RBAC 解析位置与与前端展示字段映射） |
| 6 | **门店范围来源**（`storeId` / `storeIds` 与总部/多店规则） |
| 7 | **后端权限校验方式**（云函数内 vs 网关统一） |
| 8 | **真实数据库集合**与字段是否与九份契约可对齐 |
| 9 | **测试云环境**、测试账号、测试门店数据 |
| 10 | **第一批只读 Query 实现**（九函数或网关路由 + 实现人 + 交付时间） |

---

## 4. P0 第一批只读 Query 清单

| Query | 契约文档 | 影响前端模块 | 当前前端 Service | 状态 | 只读 | 允许写入 | 权限 + 门店过滤 |
|-------|----------|--------------|------------------|------|------|----------|----------------|
| `memberQuery` | `docs/MET_YOGA_ADMIN_MEMBER_QUERY_CONTRACT.md` | 会员经营 | `memberService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `memberAssetQuery` | `docs/MET_YOGA_ADMIN_MEMBER_ASSET_QUERY_CONTRACT.md` | 会员经营 | `memberService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `orderQuery` | `docs/MET_YOGA_ADMIN_ORDER_QUERY_CONTRACT.md` | 产品与合同 | `mallService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `contractQuery` | `docs/MET_YOGA_ADMIN_CONTRACT_QUERY_CONTRACT.md` | 产品与合同 | `mallService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `paymentQuery` | `docs/MET_YOGA_ADMIN_PAYMENT_QUERY_CONTRACT.md` | 产品与合同、财务 | `mallService` / `financeService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `courseSessionQuery` | `docs/MET_YOGA_ADMIN_COURSE_SESSION_QUERY_CONTRACT.md` | 课程运营 | `courseService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `bookingQuery` | `docs/MET_YOGA_ADMIN_BOOKING_QUERY_CONTRACT.md` | 课程运营 | `courseService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `attendanceQuery` | `docs/MET_YOGA_ADMIN_ATTENDANCE_QUERY_CONTRACT.md` | 课程运营 | `courseService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |
| `consumptionQuery` | `docs/MET_YOGA_ADMIN_CONSUMPTION_QUERY_CONTRACT.md` | 课程运营、财务 | `courseService` / `financeService` | 契约已完成，后端待确认 / 待开发 | 是 | **否** | **是** |

---

## 5. 九份契约文档索引

| # | 文档路径 |
|---|----------|
| 1 | `docs/MET_YOGA_ADMIN_MEMBER_QUERY_CONTRACT.md` |
| 2 | `docs/MET_YOGA_ADMIN_MEMBER_ASSET_QUERY_CONTRACT.md` |
| 3 | `docs/MET_YOGA_ADMIN_ORDER_QUERY_CONTRACT.md` |
| 4 | `docs/MET_YOGA_ADMIN_CONTRACT_QUERY_CONTRACT.md` |
| 5 | `docs/MET_YOGA_ADMIN_PAYMENT_QUERY_CONTRACT.md` |
| 6 | `docs/MET_YOGA_ADMIN_COURSE_SESSION_QUERY_CONTRACT.md` |
| 7 | `docs/MET_YOGA_ADMIN_BOOKING_QUERY_CONTRACT.md` |
| 8 | `docs/MET_YOGA_ADMIN_ATTENDANCE_QUERY_CONTRACT.md` |
| 9 | `docs/MET_YOGA_ADMIN_CONSUMPTION_QUERY_CONTRACT.md` |

**格式说明（非阻断）**：

- `memberQuery` 文档**没有**单独命名为「状态字段口径」的章节；**生命周期 / 阶段 / 风险**等已在**入参与出参**字段中覆盖。  
- 若后端评审要求**标题级完全一致**，可后续在 `memberQuery` 契约中**增补**一小节「会员状态 / 生命周期枚举」——**不是阻断项**。

---

## 6. 后端必须统一的基础约定

| 主题 | 约定 |
|------|------|
| 返回结构 | 与前端 `ReadonlyApiResult` 对齐：**`data` / `meta` / `error`**。 |
| 分页 | **`page` / `pageSize`**；可选 **`cursor`**（与契约一致）。 |
| `pageSize` | **最大建议 100**（服务端强制截断）。 |
| `requestId` | **必填**；全链路追踪，回显于 `meta`。 |
| 门店 | **`storeId` / `storeIds`** 与登录态可访问范围**求交**；越权 **403**。 |
| `role` | **后端以登录态为准**；**不信任**前端单独传参授权。 |
| 错误码 | **`VALIDATION_ERROR`、`UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`BUSINESS_RULE`、`INTERNAL_ERROR`**（语义与各契约 HTTP 建议一致）。 |
| 手机号 | **统一脱敏**；默认不返回完整号码。 |
| 敏感信息 | **统一不返回身份证 / 住址**（P0 Query）。 |
| 金额 | **统一单位**；**建议后端以「分」返回整数**，前端格式化（与各契约金额附录对齐）。 |
| 时间 | **统一格式**（如 ISO8601 / RFC3339）与**时区策略**（附录写死，禁止模糊）。 |

---

## 7. 前端 live 接入顺序建议

### 7.1 第一批（会员域）

1. `memberQuery`  
2. `memberAssetQuery`

### 7.2 第二批（交易域：订单 / 合同 / 支付）

3. `orderQuery`  
4. `contractQuery`  
5. `paymentQuery`

### 7.3 第三批（课程域：场次 / 预约 / 签到 / 耗课）

6. `courseSessionQuery`  
7. `bookingQuery`  
8. `attendanceQuery`  
9. `consumptionQuery`

### 7.4 顺序原则

- **不建议先接 `Dashboard` 聚合**（应在事实源 Query 稳定后再接独立聚合接口）。  
- **不建议先接 Finance 侧复杂聚合**（先事实表 Query，再报表）。  
- **不建议先接写入 Command**（退款、冻结、转卡、补签、分录等）。  
- **先接事实源，再接聚合看板**。

---

## 8. 后端交付每个 Query 前必须给前端的信息

每个 Query 交付联调包时，至少包含：

| # | 交付物 |
|---|--------|
| 1 | **云函数名称**（或 HTTP 路由名） |
| 2 | **调用方式**（直连 wx / BFF URL / 鉴权头） |
| 3 | **入参 schema**（JSON Schema 或等价 OpenAPI 片段） |
| 4 | **出参 schema**（含 `data` 元素结构与 `meta`） |
| 5 | **错误码示例**（含 `code` + `message` + 建议 HTTP 状态） |
| 6 | **权限规则**（角色 × 资源 × 操作：只读） |
| 7 | **门店过滤规则**（单店 / 多店 / 总部） |
| 8 | **测试数据说明**（覆盖契约第「测试数据」节场景子集） |
| 9 | **测试账号 / 角色** |
| 10 | **测试 `storeId`（及多店场景若有）** |
| 11 | **空数据样本** |
| 12 | **403 样本**（越权 / 无门店权限） |
| 13 | **404 样本**（资源不存在或无权视为不存在） |
| 14 | **422 样本**（参数非法或组合不合法） |
| 15 | **分页第二页样本**（`hasMore` / `total` 一致） |

---

## 9. 禁止事项

| # | 禁止项 |
|---|--------|
| 1 | **不允许**前端 `components` **直接调用云函数**。 |
| 2 | **不允许**前端 `components` **直接 `fetch` / `axios`**。 |
| 3 | **不允许**前端**直连数据库集合**。 |
| 4 | **不允许** `live` 失败后**静默 fallback 到 mock**。 |
| 5 | **不允许**财务 **mock 与 live 混算**。 |
| 6 | **不允许**没有**角色与门店范围**就返回真实敏感数据。 |
| 7 | **不允许** P0 **Query 做任何写入**（增删改、状态变更、扣款、扣课、分录）。 |
| 8 | **不允许** Query **生成 `OperationLog`**（日志写入走独立命令与审计管道）。 |
| 9 | **不允许** Query **修改**订单 / 合同 / 资产 / 支付 / 课程 / 签到 / 耗课**状态**。 |
| 10 | **不允许**在 P0 阶段先接 **退款 / 冻结 / 转卡 / 补签 / 财务分录** 等**写入**能力。 |

---

## 10. P0 验收标准（live 接入阶段对照）

| # | 标准 |
|---|------|
| 1 | **`npm run build` 通过**。 |
| 2 | **mock 模式仍可用**。 |
| 3 | **live 模式可按模块开启**（配置或特性开关）。 |
| 4 | **live 失败**展示**错误态**；**live 无数据**展示**空态**。 |
| 5 | **不静默 fallback 到 mock**。 |
| 6 | **越店**返回 **403** 或等价安全策略（无数据泄露）。 |
| 7 | **非授权角色**不可见敏感字段。 |
| 8 | **手机号脱敏**；**不返回身份证 / 住址**（P0）。 |
| 9 | **不写数据库**（只读路径）。 |
| 10 | **不影响**未开启 live 的其它模块行为。 |
| 11 | 合并前 **`git status` 干净**（无无关未提交变更）。 |

---

## 11. 下一步建议

**下一步进入**：《**P0 后端对接会议问题清单 v1**》

**会议目的**：

- 把 **云环境**、**登录态**、**角色**、**门店范围**、**九个 Query 是否已有**、**谁开发**、**何时提供测试环境** 等事项**一次性确认并留痕**；输出责任人与截止日期，再排 `apiClient` live 与各 `*Service` 分支实现。

---

## 修订记录

| 版本 | 说明 |
|------|------|
| v1 | 首版：P0 后端对接资料包总入口 |
