# MET YOGA PC 后台 · P0 后端对接会议摘要 v1

> 会议前可直接转发；详情见 `docs/MET_YOGA_ADMIN_P0_BACKEND_HANDOFF_PACKAGE.md` 与九份 `*QUERY_CONTRACT.md`。

---

## 1. 当前一句话结论

MET YOGA PC 后台当前已经完成 **P0 只读前端接入底座**，前端页面仍走 **mock**，**live 模式尚未接真实云函数**；现在需要后端先确认 **云环境、登录态、角色、门店范围** 和 **九个只读 Query**。

---

## 2. 前端当前已完成

**Service / Adapter：**

- `memberService` / `memberAdapter`
- `mallService` / `mallAdapter`
- `courseService` / `courseAdapter`
- `financeService` / `financeAdapter`
- `dashboardService` / `dashboardAdapter`

**已接入页面：** Members、Mall、Courses、Finance、Dashboard

**说明：**

- 当前无真实写入  
- 当前无真实云函数调用  
- `dataSource: 'live'` 仍返回 **`REAL_API_NOT_CONNECTED`**  
- `npm run build` 持续通过  
- `git status` 干净（以当前主干/分支为准）

---

## 3. 后端本次必须确认的 6 个问题

1. PC 后台最终通过什么方式调用接口：**`wx.cloud.callFunction`** 还是 **HTTP / BFF**  
2. **云环境 ID** 是什么  
3. 当前**登录态**从哪里来  
4. 当前用户**角色**从哪里来  
5. 当前**门店范围** `storeId` / `storeIds` 从哪里来  
6. **九个 P0 Query** 是否已有，**谁负责开发**，**什么时候能联调**

---

## 4. P0 第一批只读 Query

**第一批优先：** `memberQuery`、`memberAssetQuery`

**第二批：** `orderQuery`、`contractQuery`、`paymentQuery`

**第三批：** `courseSessionQuery`、`bookingQuery`、`attendanceQuery`、`consumptionQuery`

**原则：**

- 先接**事实源**  
- **不先接** Dashboard  
- **不先接** 财务聚合  
- **不先接** 任何写入 Command  

---

## 5. 每个 Query 的统一要求

- **只读**；不写数据库；不改业务状态  
- 必须做 **角色权限校验**  
- 必须做 **门店范围校验**  
- 必须支持 **分页**  
- 必须返回 **`data` / `meta` / `error`**  
- **手机号必须脱敏**  
- **不返回** 身份证 / 住址  
- 错误码至少包含 **403 / 404 / 422 / 500**  

---

## 6. 前端禁止事项

- 不允许组件**直接调用云函数**  
- 不允许组件**直接 fetch**  
- 不允许前端**直连数据库**  
- 不允许 **live 失败后静默 fallback 到 mock**  
- 不允许 **财务 mock 和 live 混算**  
- 不允许**没有角色和门店范围**就返回真实数据  
- 不允许 P0 Query 做任何**写入**  

---

## 7. 会议需要后端给出的结果

| 事项 | 结论 | 负责人 | 时间 | 是否阻塞前端 |
| --- | --- | --- | --- | --- |
| 调用方式 | 待确认 |  |  | 是 |
| 云环境 ID | 待确认 |  |  | 是 |
| 登录态来源 | 待确认 |  |  | 是 |
| 角色来源 | 待确认 |  |  | 是 |
| 门店范围来源 | 待确认 |  |  | 是 |
| memberQuery | 待确认 |  |  | 是 |
| memberAssetQuery | 待确认 |  |  | 是 |
| orderQuery | 待确认 |  |  | 否 |
| contractQuery | 待确认 |  |  | 否 |
| paymentQuery | 待确认 |  |  | 否 |
| courseSessionQuery | 待确认 |  |  | 否 |
| bookingQuery | 待确认 |  |  | 否 |
| attendanceQuery | 待确认 |  |  | 否 |
| consumptionQuery | 待确认 |  |  | 否 |

---

## 8. 下一步

若后端确认 **调用方式、云环境、登录态、角色、门店范围**，并提供 **`memberQuery` 测试接口**，则进入：**《memberQuery live 接入 v1》**。

若**未确认**，**不改**前端 live 分支。
