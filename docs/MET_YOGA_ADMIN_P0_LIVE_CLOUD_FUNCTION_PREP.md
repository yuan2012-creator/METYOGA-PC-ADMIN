# MET YOGA 管理后台 · P0 只读真实云函数接入准备 v1

本文档描述在**不真正连接云函数**、**不修改当前业务页面逻辑**的前提下，为 P0 只读路径从 `mock` 切换到 `live` 所需的前置约定、环境信息、变量设计与验收标准。实施代码变更前，请以本文档为对齐基线。

---

## 1. 当前 P0 只读接入状态

### 1.1 已完成的 service / adapter 底座

| 模块 | Service | Adapter |
|------|---------|---------|
| 会员经营 | `memberService` | `memberAdapter` |
| 产品与合同 | `mallService` | `mallAdapter` |
| 课程运营 | `courseService` | `courseAdapter` |
| 财务管理 | `financeService` | `financeAdapter` |
| 经营总览 | `dashboardService` | `dashboardAdapter` |

### 1.2 已完成的页面接入（只读数据经 service → adapter）

| 页面 | 接入的 Service |
|------|----------------|
| `Members` | `memberService`（列表、详情、资产等只读接口） |
| `Mall` | `mallService`（只读快照等） |
| `Courses` | `courseService`（只读快照等） |
| `Finance` | `financeService`（只读快照等） |
| `Dashboard` | `dashboardService`（只读快照、待办、门店健康、建议、财务摘要、合作治理等） |

### 1.3 运行时行为说明（截至本文档版本）

- **当前仍走 mock**：默认 `dataSource` 为 `mock`（见 `services/apiClient.ts` 中 `defaultReadonlyDataSource()`）；各页面初始化显式或隐式使用 mock 路径读取 selector / 常量构建的只读数据。
- **`dataSource: 'live'` 统一返回 `REAL_API_NOT_CONNECTED`**：各 `*Service` 在 `live` 分支返回 `readonlyLiveNotConnectedError()`，错误码为常量 `REAL_API_NOT_CONNECTED`（定义于 `apiClient`），**不发起网络请求**。
- **尚未真实调用云函数**：`apiClient` 注释与实现均约定不接真实云函数；页面与 adapter 未绑定 `wx.cloud` 或 HTTP 云网关。
- **当前无真实写入**：P0 只读路径仅查询与展示；不写数据库、不写 `localStorage` / `sessionStorage`、不通过只读 service 变更业务实体状态。

---

## 2. live 接入前必须确认的环境信息

后续负责接入的工程师/团队**必须**在写第一行 live 调用代码前确认以下信息（缺失项应列为阻塞项）：

| 序号 | 确认项 | 说明 |
|------|--------|------|
| 1 | 当前 PC 后台是否运行在浏览器环境 | 决定能否使用 `wx` 小程序 JSSDK、是否仅能走 HTTP/BFF。 |
| 2 | 是否能直接调用微信云函数 | 若不能，必须定义 BFF / HTTP 网关与鉴权方式。 |
| 3 | 是否需要通过 BFF / HTTP 网关转发云函数 | 生产常见模式；需约定 URL、方法、Header、签名。 |
| 4 | 当前登录态来源 | Cookie / Token / 微信登录态等；与云函数侧校验一致。 |
| 5 | 当前用户角色来源 | 与 `ReadonlyQueryParams.role` 及后端 RBAC 对齐。 |
| 6 | 当前门店范围来源 | 与 `storeId`、多门店过滤、数据隔离策略对齐。 |
| 7 | 云环境 ID | 与微信云开发环境或自建网关环境一致。 |
| 8 | 云函数调用方式 | `wx.cloud.callFunction` / HTTP invoke / 内部 RPC 等。 |
| 9 | 本地开发与生产环境差异 | 域名、HTTPS、跨域、mock 开关、日志级别。 |
| 10 | 是否已有云函数目录 | 函数名、入参、出参是否与本文档第 5 节顺序一致或可映射。 |
| 11 | 是否已有数据库集合 | 只读查询涉及的集合与索引是否就绪。 |
| 12 | 是否已有权限校验中间层 | 云函数内或网关层的统一鉴权、门店范围、角色校验。 |

---

## 3. 建议环境变量（设计稿，本文档不写入代码）

以下变量**仅作设计建议**；落地时在 `vite` 前缀与命名上可由项目统一调整，但语义应保留。

| 变量名 | 建议取值 | 用途 |
|--------|----------|------|
| `VITE_READONLY_DATA_SOURCE` | `mock` \| `live` | 全局或构建时默认只读数据源；与运行时覆盖策略配合。 |
| `VITE_ALLOW_MOCK_READONLY` | `true` \| `false` | 是否允许在特定环境使用 mock（生产应倾向 `false`）。 |
| `VITE_CLOUD_ENV_ID` | 字符串 | 微信云环境 ID 或等价标识（若前端需要初始化云 SDK）。 |
| `VITE_API_BASE_URL` | URL | BFF / 网关基地址（若 live 走 HTTP）。 |
| `VITE_APP_ENV` | `local` \| `test` \| `production` | 环境档位，用于组合上述开关与日志策略。 |

### 3.1 使用原则

- **本地默认 mock**：降低联调成本，避免误连生产云环境。
- **测试环境可按模块 live**：建议通过配置或特性开关**按模块**开启，而非全局静默切换。
- **生产环境禁止静默 fallback 到 mock**：live 失败必须走错误态，不得用 mock 数据冒充真实结果。
- **财务模块不允许 mock / live 混算**：同一用户会话内，财务只读聚合的数据源必须一致；切换数据源应整页或整模块重载，不得拼接两套来源的数字。

---

## 4. apiClient 后续 live 分支设计（从 `REAL_API_NOT_CONNECTED` 到真实调用）

### 4.1 升级路径概述

当前：`executeReadonlyQuery` / 各 service 在 `dataSource === 'live'` 时直接返回 `readonlyLiveNotConnectedError()`。

后续：在**单一入口**（建议扩展 `apiClient` 或新增 `readonlyCloudClient` 模块，仍由 service 调用）内：

1. 校验环境变量与登录态；不满足则返回明确错误（非 mock 数据）。
2. 组装与下文一致的请求结构，发起云函数或 HTTP 调用。
3. 解析响应，映射为 `ReadonlyApiResult<T>`（与 `readonlyTypes.ts` 对齐）。
4. **任何失败路径均不自动 fallback 到 mock**。

### 4.2 请求入参结构（与现有只读查询对齐）

建议云函数或网关统一接收（JSON），字段与 `ReadonlyQueryParams` 及业务扩展对齐：

| 字段 | 类型 | 说明 |
|------|------|------|
| `requestId` | string | 全链路追踪；由前端生成或由网关注入。 |
| `functionName` | string | 目标查询函数名（可与 `presetReadonlyCloudCall` 对齐）。 |
| `payload` | object | 业务查询体；内含 `storeId`、`role`、`page`、`pageSize`、`from`、`to` 等。 |
| `dataSource` | `'live'` | 明确为 live 路径（网关可忽略或用于审计）。 |

页面**不**直接组装云函数原始体；由对应 `*Service` 调用 `apiClient` 封装层传入。

### 4.3 返回结构

与现有类型一致：

- `data: T | null`：成功时业务数据；失败时为 `null`。
- `meta: ReadonlyApiMeta | null`：分页与 `requestId`、`dataSource`、`storeId`、`from`、`to`、`role` 等回显。
- `error: ReadonlyApiError | null`：失败时非空，含 `code` 与 `message`。

### 4.4 错误结构

- 沿用 `ReadonlyApiError`：`code`（机器可读）、`message`（人类可读）。
- 云函数/网关业务错误建议映射为稳定 `code`（如 `FORBIDDEN`、`NOT_FOUND`、`VALIDATION_ERROR`、`UPSTREAM_ERROR`），**勿**用 mock 数据填充 `data`。

### 4.5 关键字段行为

| 字段 | 要求 |
|------|------|
| `requestId` | 每次请求唯一；日志与客服排障必备。 |
| `storeId` | 与登录态门店范围求交；越权返回 403 类错误。 |
| `role` | 与后端权限模型一致；无权限返回 403。 |
| `page` / `pageSize` | 服务端校验上下界；与 `meta.hasMore` 一致。 |
| `from` / `to` | 时间范围合法性校验；非法返回 422。 |

### 4.6 非功能要求

| 主题 | 要求 |
|------|------|
| 超时 | 定义统一超时（如 10s～30s 按模块）；超时映射为可区分 `code`，展示错误态。 |
| HTTP 403 | 无权限；`data` 为 `null`，提示用户无访问权或门店范围不足。 |
| HTTP 404 | 资源不存在；区分「空列表」与「资源 ID 无效」（若协议支持）。 |
| HTTP 422 | 参数校验失败；`message` 可含字段级说明（前端仅展示，不解析为 mock）。 |
| HTTP 500 | 服务端异常；不暴露内部栈；可提示重试。 |
| 网络失败 | DNS、断网、CORS 等；独立错误码或 message，**不**回退 mock。 |
| 不自动 fallback 到 mock | **硬约束**；与第 3 节生产策略一致。 |

---

## 5. 第一批真实云函数接入顺序

按**依赖底层实体、由少到多聚合**的原则，建议严格按以下顺序接入 **live**（函数名为建议名，可与实际仓库对齐）：

| 顺序 | 云函数（建议名） | 主要只读实体 | 影响页面（优先） |
|------|------------------|--------------|------------------|
| 1 | `memberQuery` | 会员列表/详情基础字段 | `Members`；`Mall`（选人/展示）；`Dashboard`（间接指标，但**不接聚合**） |
| 2 | `memberAssetQuery` | 会员资产、卡项等 | `Members`；`Mall`（资产关联） |
| 3 | `orderQuery` | 订单 | `Mall`；`Finance` |
| 4 | `contractQuery` | 合同 | `Mall`；`Finance`（若有对账关联） |
| 5 | `paymentQuery` | 支付流水 | `Finance`；`Mall` |
| 6 | `courseSessionQuery` | 课程场次 | `Courses`；`Dashboard`（仅引用明细，**后接**） |
| 7 | `bookingQuery` | 预约 | `Courses`；`Mall`（若展示预约关联） |
| 8 | `attendanceQuery` | 签到/出勤 | `Courses`；`Finance`（课消关联时） |
| 9 | `consumptionQuery` | 课消/消费记录 | `Finance`；`Courses` |

### 5.1 与 Dashboard 的关系

- **不允许先接 Dashboard 聚合**：`Dashboard` 的 live 数据应在上述实体查询稳定后，通过**后端聚合云函数**或**明确设计的只读报表函数**提供；前端仍只调 service，不直连多个云函数拼装财务口径。
- 前 1～9 步以 **Members / Mall / Courses / Finance** 的明细与列表为主；Dashboard 仅在这些基础查询契约稳定后再接独立 `dashboardQuery` 类函数（本文档不展开函数名，避免与「先接聚合」冲突）。

---

## 6. 每个 live 接入任务的验收标准

每完成一个云函数的 live 接入（或一个页面的 live 开关），须满足：

| # | 标准 |
|---|------|
| 1 | `npm run build` 通过。 |
| 2 | **mock 模式仍可用**：`VITE_READONLY_DATA_SOURCE=mock`（或运行时 mock）下功能与接入前一致。 |
| 3 | **live 模式可通过配置开启**：不依赖改代码即可在受控环境打开 live（或按模块开关）。 |
| 4 | **live 接口失败时显示错误态**：不白屏、不静默成功。 |
| 5 | **live 接口无数据时显示空态**：与产品设计一致的空列表/空状态文案。 |
| 6 | **不静默回退 mock**：错误与空数据均不得用 mock 填充冒充。 |
| 7 | **不改业务状态**：只读路径不触发写入、不修改全局业务 store（若有）。 |
| 8 | **不写数据库**：仅查询。 |
| 9 | **不新增 Command**：不借只读接入混入写操作命令对象。 |
| 10 | **不影响其他模块**：回归未开启 live 的模块与页面。 |

---

## 7. 禁止事项

| 禁止项 | 说明 |
|--------|------|
| 不允许页面直接调用云函数 | 调用须封装在 `services/*` + `apiClient`（或专用只读客户端）内。 |
| 不允许组件内写 `wx.cloud.callFunction` | 避免分散鉴权与环境初始化。 |
| 不允许组件内写 `fetch` | HTTP 调用集中在 api 层，便于超时、重试、鉴权头与审计。 |
| 不允许前端直连数据库集合 | 仅通过云函数 / 网关。 |
| 不允许 live 失败后展示 mock 假数据 | 防误导经营与财务判断。 |
| 不允许财务页面 mock 与 live 混算 | 同会话同源；切换须整模块重载。 |
| 不允许先接 Dashboard 聚合 | 先于第 5 节基础实体查询稳定。 |
| 不允许先接写入 | P0 本阶段只读；写入另立项。 |
| 不允许跳过权限和门店范围 | 所有 live 请求必须带可校验上下文。 |

---

## 8. 下一步建议

### 8.1 建议下一文档与阶段

进入：**《P0 memberQuery live 接入设计 v1》**（或等价标题），范围限定为：

- 第一个云函数 `memberQuery` 的入参/出参、错误码、分页、与 `memberAdapter` 的字段映射表；
- 与 `memberService` 中现有 mock 路径的并行策略（开关、无混算）。

### 8.2 执行《memberQuery live 接入设计 v1》前必须先确认

1. **真实云函数调用方式**（浏览器直连 wx / HTTP BFF 等）。  
2. **云环境 ID**（与 `VITE_CLOUD_ENV_ID` 或后端配置一致）。  
3. **当前登录态和角色来源**（与云函数校验一致）。  
4. **当前门店范围来源**（与 `storeId`、多门店策略一致）。

以上四项未闭环前，**不建议**合并任何默认开启 live 的代码。

---

## 文档维护

- **版本**：v1  
- **性质**：接入准备与设计约束，非运行时代码。  
- **变更**：随云函数命名与网关协议确定后更新附录映射表即可，核心原则（不混算、不回退 mock、先实体后聚合）应长期保留。
