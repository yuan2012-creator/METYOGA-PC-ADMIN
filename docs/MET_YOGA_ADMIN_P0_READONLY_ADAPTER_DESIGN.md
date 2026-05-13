# MET YOGA PC 后台｜P0 只读接口前端 adapter 设计 v1

> **目标**：规定 **services + adapters + apiClient** 的职责边界，使 mock 可替换为真实云函数只读查询，且**组件层不直连云函数、不处理后端字段形态、不混用财务口径**。  
> **本轮**：仅文档；**不创建** `services/*`、`adapters/*` 源码文件。

---

## 1. 前端接入原则

- **components 不直接调用云函数**：禁止在 `components/**/*.tsx` 内写 `wx.cloud.callFunction` / `fetch` 直连 BFF；一律通过 hooks 或 props 注入的数据源，其底层来自 **service**。
- **统一通过 services 层调用接口**：所有只读数据获取以 `*Service.ts` 为唯一入口；便于 mock、重试策略、埋点与单测。
- **adapter 负责后端字段到前端类型转换**：service 拿到云函数原始 payload 后调用 adapter，再返回与 `types.ts`（或专用 DTO）对齐的结构；组件不解析 `snake_case`、不处理金额分元。
- **mock fallback 必须由统一配置控制**：单一来源（如 `getReadonlyDataSourceConfig()` 读取 `import.meta.env`），禁止组件内散落 `if (useMock)`。
- **生产环境不允许静默 fallback 到 mock**：生产构建须 `VITE_ALLOW_MOCK_READONLY=false`（或等价）；若配置错误应在启动或首次请求时 **fail fast** 或明确报错页。
- **财务金额类数据不能 mock 与真实混算**：`financeService` 在「真实模式」下禁止与 `MOCK_*` 合并数组或相加；同一图表/表格数据源必须单一。
- **每个接口必须有 loading / error / empty 状态**：service 可返回 `AsyncState` 三态，或由调用方 `useQuery` 模式统一；禁止用「空数组」掩盖 error。
- **每个 service 必须明确只读，不做写入**：P0 阶段 service 文件顶部文档注释 + ESLint（后续可加 `no-restricted-imports`）声明禁止 `Command` 调用。

---

## 2. 建议文件结构（后续新增，本轮不创建）

```
services/
  apiClient.ts           # 统一云函数 / HTTP、超时、错误、分页、mock 开关
  memberService.ts
  mallService.ts
  courseService.ts
  financeService.ts
  dashboardService.ts
adapters/
  memberAdapter.ts       # snake_case → camelCase；Member DTO
  mallAdapter.ts         # Order / Contract / Payment / MemberAsset DTO
  courseAdapter.ts       # CourseSession / Booking / Attendance / Consumption DTO
  financeAdapter.ts      # 财务只读摘要与列表 DTO（可与 mallAdapter 复用子函数）
```

**依赖方向**：`components` →（hooks 可选）→ `services/*Service` → `apiClient` → 云函数；`services` → `adapters/*` → 返回前端类型。

---

## 3. apiClient 设计

| 能力 | 说明 |
|------|------|
| **统一封装云函数调用** | 单函数 `callReadonlyQuery(name, payload)`；内部 `wx.cloud.callFunction` 或 HTTP POST 到 BFF（二选一由工程定）。 |
| **统一传入 requestId** | 每次请求生成 `crypto.randomUUID()` 或时间戳+随机串；写入日志与错误上报。 |
| **统一传入 storeId / role / timeRange** | `apiClient` 从 session 上下文（后续）或当前全局 `activeStoreId` 注入；`from`/`to` ISO；role 由鉴权层附带，不信任前端伪造 header。 |
| **统一处理错误码** | 映射云函数 `{ ok: false, code, message }` → 抛出 `ReadonlyApiError`（含 `code`），供 UI 分支。 |
| **统一处理超时** | 默认 15–30s 可配；超时视为 `NETWORK_TIMEOUT`。 |
| **统一处理分页** | 请求体带 `page`/`pageSize` 或 `cursor`；响应解析 `meta`。 |
| **统一处理 mock 开关** | `shouldUseMockReadonly()` 为真时**不发起**云函数，直接走 `getMockDataset(name)`（由各 service 注册或 apiClient 委托）。 |
| **统一返回结构** | `{ data, meta, error }`：`error` 为 `null` 表示成功；失败时 `data` 为 `null` 且 `error` 非空；**禁止**成功时省略 `meta` 导致分页 undefined。 |

---

## 4. Service 分层设计

### memberService

| 项 | 内容 |
|----|------|
| **负责** | `fetchMembers`、`fetchMemberDetail`、`fetchMemberAssets` |
| **对应云函数** | `memberQuery`、`memberAssetQuery` |
| **说明** | 入参含分页、筛选、`storeId`；返回经 `memberAdapter` 后的 `Member[]` / `Member` / `MemberAsset[]`。 |

### mallService

| 项 | 内容 |
|----|------|
| **负责** | `fetchOrders`、`fetchOrderDetail`、`fetchContracts`、`fetchPayments`、`fetchMemberAssetsByOrder` |
| **对应云函数** | `orderQuery`、`contractQuery`、`paymentQuery`、`memberAssetQuery` |
| **说明** | `fetchOrderDetail` 可 `includeItems: true`；`fetchMemberAssetsByOrder` 封装 `orderId` 过滤的资产列表。 |

### courseService

| 项 | 内容 |
|----|------|
| **负责** | `fetchCourseSessions`、`fetchSessionDetail`、`fetchBookings`、`fetchAttendances`、`fetchConsumptions` |
| **对应云函数** | `courseSessionQuery`、`bookingQuery`、`attendanceQuery`、`consumptionQuery` |
| **说明** | 时间窗与 `storeId` 必填；详情接口与列表字段子集分离。 |

### financeService

| 项 | 内容 |
|----|------|
| **负责** | `fetchPayments`、`fetchOrders`、`fetchConsumptions`、`fetchFinanceReadonlySummary` |
| **对应云函数** | `paymentQuery`、`orderQuery`、`consumptionQuery`；`fetchFinanceReadonlySummary` 可为 BFF **只读聚合**（若暂无独立云函数，则文档约定后续 `financeAggregateQuery`） |
| **说明** | **默认禁止 mock fallback**；摘要与列表同一数据源策略。 |

### dashboardService

| 项 | 内容 |
|----|------|
| **负责** | P0 **暂不直连真实库**；占位 `fetchDashboardReadonlySnapshot`（后续接 `dashboardAggregate`）。 |
| **说明** | 事实源未稳定前，继续消费现有 selector + mock，但 UI 须保留「模块内演示 / 待接入真实数据」提示；接入聚合后改为单一 `dashboardAggregate` 响应。 |

---

## 5. Adapter 字段转换规则

- **后端 `snake_case` 转前端 `camelCase`**：在 adapter 出口统一；禁止组件 `row.member_id`。
- **金额字段统一转换**：若后端为「分」整数，adapter 转为元 `number` 或与现有 `MoneyAmount` 约定一致；**不在组件内** `/100`。
- **时间字段统一转换**：后端 ISO / 毫秒 → 前端 `ISODateString` 或展示用 `formatXxx()` 仅在 adapter 或单一 `formatters.ts`（非组件内拼接）。
- **状态字段统一映射**：adapter 输出 `OrderStatus` 等枚举值；中文标签由 **单一字典**（如 `labels/orderStatusZh.ts`）映射，**禁止**组件内 `status === 'paid' ? '已收款' : ...` 散落硬编码。
- **手机号 / 身份信息脱敏由后端优先**：adapter 保留后端已脱敏字段；前端仅做二次截断（如列表再掩码）且不得依赖完整手机号作为主键。
- **缺失字段必须有安全兜底**：adapter 对可选字段用 `??` 默认；列表行关键缺失时打 `console.warn` + 占位 `"—"`，**不允许**解构 undefined 导致白屏。
- **不允许在 adapter 内发起副作用**：无 `fetch`、无 `setState`、无写缓存；纯函数。

---

## 6. Mock fallback 策略

| 环境 / 模块 | 策略 |
|-------------|------|
| **本地开发** | 可 `VITE_READONLY_DATA_SOURCE=mock` 全量 mock。 |
| **测试环境** | 可按模块 `READONLY_MOCK_MODULES=member,course` 白名单 mock。 |
| **生产环境** | **禁止静默 fallback**；`READONLY_DATA_SOURCE=live`；失败展示错误态。 |
| **接口失败** | 显示错误态 + 重试；**不**展示旧 mock 冒充成功。 |
| **财务模块** | **默认禁止 fallback**；与 `financeService` 注释一致。 |
| **经营总览** | 事实源未稳定前可继续 mock + selector；必须标明「模块内演示 / 待接入真实数据」；不接 `live` 与 mock 混算。 |

---

## 7. 模块接入顺序

1. **第一步**：`memberService` + `memberAdapter`（会员列表/详情/资产只读）。  
2. **第二步**：`mallService` + `mallAdapter`（订单/合同/支付/按订单资产）。  
3. **第三步**：`courseService` + `courseAdapter`（场次/预约/签到/耗课）。  
4. **第四步**：`financeService` + `financeAdapter`（支付/订单/耗课/只读摘要，无混算）。  
5. **第五步**：`dashboardService` 接 `dashboardAggregate`（或等价只读聚合），替换总览数据源。  

---

## 8. 验收标准（每个模块接入时必须满足）

- `npm run build` 通过。  
- 列表能加载（真实或受控 mock）。  
- 详情能加载。  
- **空状态**正确（无数据 ≠ 错误）。  
- **错误态**正确（网络/403/422 可区分文案或统一「加载失败」+ 重试）。  
- **分页**正确（`meta` 驱动下一页/无更多）。  
- **门店过滤**正确（越店无数据或报错，不串数据）。  
- **mock 开关可控**（环境变量 + 模块白名单可测）。  
- **生产环境不 fallback**（构建校验或运行时断言）。  
- **不新增真实写入**（无 `Command`、无 `setDoc` 封装）。  
- **不改业务状态**（无全局订单/资产本地覆盖生产意图）。  

---

## 9. 风险提示

- **不允许组件直接调用云函数**。  
- **不允许前端直接查所有集合**（无分页/无时间窗的全表拉取）。  
- **不允许接口失败后展示旧 mock 假装成功**。  
- **不允许财务页一半真实一半 mock**。  
- **不允许在 adapter 里偷偷改业务状态**（纯函数）。  
- **不允许在 service 层做敏感写入**（P0 只读）。  
- **不允许把手机号当主键**。  
- **不允许前端自行推断合同 / 支付 / 资产真实状态**（以后端/adapter 输出枚举为准）。  

---

## 10. 下一步建议

进入 **`P0 memberService / memberAdapter 只读接入 v1`**：

- 落地 `services/apiClient.ts` 与 `services/memberService.ts`、`adapters/memberAdapter.ts`  
- `Members` / `MemberDetailModal` 数据入口改为 service（**最小改动面**）  
- 验收第 8 节清单后，再进入 `mallService`  

---

## 文档版本

| 版本 | 说明 |
|------|------|
| v1 | 首版：原则、目录、apiClient、分层、adapter 规则、fallback、顺序、验收、风险、下一步 |
