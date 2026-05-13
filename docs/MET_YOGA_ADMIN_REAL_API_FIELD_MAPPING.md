# MET YOGA PC 后台｜真实接口字段对照表 v1

> **依据**：当前仓库 `types.ts` 中 P0 域对象与状态字面量；`constants.ts` 中 `MOCK_*` 为前端 mock 来源。  
> **用途**：程序员接真实数据库 / BFF / 云函数前的**字段与接口契约草案**；表名 / 路径为**建议命名**，落地时以实际库表为准并对齐本表。

---

## 1. P0 核心对象字段对照

### Member（会员）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `types.ts` → `Member` |
| **mock 来源** | `MOCK_MEMBERS`；`Members` 合并 `memberOpsScenarioFixtures` |
| **建议真实表 / 集合** | `members`（或 `member_profiles` + `member_accounts` 拆分） |
| **建议只读接口** | `GET /api/v1/members` |
| **建议详情接口** | `GET /api/v1/members/{memberId}` |
| **关键字段映射** | `id`→会员主键；`name`/`phone`/`gender`/`avatar`；`lifecycleStatus`/`stage`/`leadStatus`；`joinDate`/`lastVisit`（建议后端统一 ISO）；`riskTag`；`totalLTV`/`points`/`totalClasses`；`cards`（遗留展示，建议逐步改为资产列表引用）；`timeline`/`bodyTags` 等可归子资源 |
| **必填字段** | `id`、`name`、门店或归属范围（若多店需 `storeIds` 或 `primaryStoreId`） |
| **状态字段** | `lifecycleStatus`（`MemberLifecycleStatus`）；`stage`（S0–S6 展示兼容）；`leadStatus` |
| **时间字段** | `joinDate`→建议 `joinedAt` ISO；`lastVisit`→建议 `lastVisitedAt` ISO |
| **关联字段** | 隐式通过订单/资产/预约反查；可显式 `managerId` 替代 `manager` 字符串 |
| **是否允许前端直接写入** | **否**（主档变更走服务端） |
| **写入前置条件** | 权限、脱敏策略、操作日志；敏感字段双人复核（按政策） |

---

### MemberAsset（会员资产）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `MemberAsset` |
| **mock 来源** | `MOCK_MEMBER_ASSETS`、`MALL_ORDER_SCENARIO_ASSETS`；`Mall` 内存 `setMemberAssets` 演示 |
| **建议真实表 / 集合** | `member_assets` |
| **建议只读接口** | `GET /api/v1/member-assets`；`GET /api/v1/members/{memberId}/assets` |
| **建议详情接口** | `GET /api/v1/member-assets/{assetId}` |
| **关键字段映射** | `id`、`memberId`、`name`、`status`、`sourceOrderId`、`contractId`、`productId`、`productType`、`balanceType`、`totalAmount`、`remainingAmount`、`frozenUntil`、`effectiveDate`、`expiryDate`、`createdAt`、`updatedAt`、`mallGrantRecordNote`（仅模块内说明时可映射为 `grantNote` 或弃用） |
| **必填字段** | `id`、`memberId`、`balanceType`、`status`；有余额类时 `remainingAmount` 语义必填 |
| **状态字段** | `status` → `MemberAssetStatus` |
| **时间字段** | `effectiveDate`、`expiryDate`、`frozenUntil`、`createdAt`、`updatedAt`（ISO） |
| **关联字段** | `sourceOrderId`、`contractId`、`productId` |
| **是否允许前端直接写入** | **否** |
| **写入前置条件** | 仅服务端在订单履约/退款核销/转卡过户等事务内更新；幂等键、分录联动、操作日志 |

---

### CardProduct / Product（卡项产品）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `CardProduct`（卡）；另有 `PointProduct`、`TtcProduct` 为商城其它产品线 |
| **mock 来源** | `MOCK_CARD_PRODUCTS` 等；`Mall` 内 `cards` state |
| **建议真实表 / 集合** | `products`（`product_type=card`）或独立 `card_products` |
| **建议只读接口** | `GET /api/v1/products?type=card` |
| **建议详情接口** | `GET /api/v1/products/{productId}` |
| **关键字段映射** | `id`、`type`（stored_value/term）、`name`、`price`、`validity`+`validityUnit`、`unitPrice`、`scope`/`functionScope`/`genreScope`、退改规则字段群、`status`、`listingVenues` |
| **必填字段** | `id`、`name`、`type`、`price`（或定价策略引用） |
| **状态字段** | `status`：`active` \| `inactive` |
| **时间字段** | 若后端有版本：建议 `effectiveFrom` / `effectiveTo`（当前类型无则扩展） |
| **关联字段** | 无强外键；可 `tenantId` / `brandId` |
| **是否允许前端直接写入** | **否**直写库；可 `POST/PATCH` 经 BFF 与审批 |
| **写入前置条件** | 商品运营角色、版本发布、影响已售订单的兼容性校验 |

---

### Order（订单）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `Order`、`OrderItem` |
| **mock 来源** | `MOCK_ORDERS`、`MALL_ORDER_SCENARIO_ORDERS` |
| **建议真实表 / 集合** | `orders` + `order_items` |
| **建议只读接口** | `GET /api/v1/orders` |
| **建议详情接口** | `GET /api/v1/orders/{orderId}` |
| **关键字段映射** | `id`、`memberId`、`status`、`items[]`、`totalAmount`、`paidAmount`、`contractId`、`createdAt`、`updatedAt`、`salesId`、`storeId` |
| **必填字段** | `id`、`memberId`、`status`、`items`、`totalAmount`、`createdAt` |
| **状态字段** | `status` → `OrderStatus` |
| **时间字段** | `createdAt`、`updatedAt` |
| **关联字段** | `memberId`、`contractId`、`storeId`、`salesId` |
| **是否允许前端直接写入** | **否**；创建订单由收银/订单服务 |
| **写入前置条件** | 服务端计价、库存/名额锁、支付意图创建 |

---

### Contract（合同）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `Contract` |
| **mock 来源** | `MOCK_CONTRACTS`、场景合并 |
| **建议真实表 / 集合** | `contracts` |
| **建议只读接口** | `GET /api/v1/contracts`；`GET /api/v1/orders/{orderId}/contracts` |
| **建议详情接口** | `GET /api/v1/contracts/{contractId}` |
| **关键字段映射** | `id`、`memberId`、`status`、`orderId`、`title`、`templateId`、`sentAt`、`signedAt`、`effectiveAt`、`expiresAt` |
| **必填字段** | `id`、`memberId`、`status` |
| **状态字段** | `status` → `ContractStatus` |
| **时间字段** | `sentAt`、`signedAt`、`effectiveAt`、`expiresAt` |
| **关联字段** | `orderId`、`memberId`、`templateId` |
| **是否允许前端直接写入** | **否**；签署流走合同服务 |
| **写入前置条件** | 模板版本、电子签、与订单金额一致、审计 |

---

### Payment（支付）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `Payment` |
| **mock 来源** | `MOCK_PAYMENTS`、`MALL_ORDER_SCENARIO_PAYMENTS`（Mall 无 `setPayments`） |
| **建议真实表 / 集合** | `payments` |
| **建议只读接口** | `GET /api/v1/payments`；`GET /api/v1/orders/{orderId}/payments` |
| **建议详情接口** | `GET /api/v1/payments/{paymentId}` |
| **关键字段映射** | `id`、`orderId`、`memberId`、`status`、`amount`、`method`、`transactionNo`、`initiatedAt`、`paidAt`、`reconciledAt` |
| **必填字段** | `id`、`orderId`、`memberId`、`status`、`amount`、`initiatedAt`（或创建时间） |
| **状态字段** | `status` → `PaymentStatus` |
| **时间字段** | `initiatedAt`、`paidAt`、`reconciledAt` |
| **关联字段** | `orderId`、`memberId` |
| **是否允许前端直接写入** | **否**；渠道回调 + 支付服务 |
| **写入前置条件** | 签名校验、幂等、对账任务更新 `reconciledAt` |

---

### Course（课程）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `Course` |
| **mock 来源** | `MOCK_COURSES`；`Courses` 中 `libraryList` |
| **建议真实表 / 集合** | `courses` |
| **建议只读接口** | `GET /api/v1/courses` |
| **建议详情接口** | `GET /api/v1/courses/{courseId}` |
| **关键字段映射** | `id`、`name`、`type`、`durationMinutes`、`category`、`description`、`difficulty`、`status` |
| **必填字段** | `id`、`name`、`type`、`durationMinutes` |
| **状态字段** | `status`：`active` \| `inactive` |
| **时间字段** | 可选 `archivedAt`（扩展） |
| **关联字段** | 门店可见范围若需要：`storeIds`（扩展） |
| **是否允许前端直接写入** | **否**直写；`PATCH` 经权限与版本 |
| **写入前置条件** | 教务角色、冲突检查（已排期引用） |

---

### CourseSession（课程场次）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `CourseSession` |
| **mock 来源** | `MOCK_COURSE_SESSIONS` + `COURSE_OPS_SCENARIO_EVENTS`；排课 UI 映射为 `ScheduleEvent`（见 `courseSelectors`） |
| **建议真实表 / 集合** | `course_sessions` |
| **建议只读接口** | `GET /api/v1/course-sessions` |
| **建议详情接口** | `GET /api/v1/course-sessions/{sessionId}` |
| **关键字段映射** | `id`、`courseId`、`status`、`title`、`storeId`、`roomId`、`teacherId`、`teacherName`、`startAt`、`endAt`、`capacity`、`bookedCount`、`waitlistCount`、`notes`、`price`；扩展：`publishStatus`、`bookingStatus`、`sessionStatus`、`exceptionStatus`、`settlementStatus` |
| **必填字段** | `id`、`courseId`、`status`、`startAt`、`endAt`、`capacity` |
| **状态字段** | 主 `status`（`CourseSessionStatus`）；扩展见第 3 节 |
| **时间字段** | `startAt`、`endAt` |
| **关联字段** | `courseId`、`storeId`、`roomId`、`teacherId` |
| **是否允许前端直接写入** | **否**直写；发布/取消/调课走服务端状态机 |
| **写入前置条件** | 资源锁、预约人数校验、通知、日志 |

---

### Booking（预约）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `Booking` |
| **mock 来源** | `MOCK_BOOKINGS`、课程场景合并 |
| **建议真实表 / 集合** | `bookings` |
| **建议只读接口** | `GET /api/v1/bookings`；`GET /api/v1/course-sessions/{sessionId}/bookings` |
| **建议详情接口** | `GET /api/v1/bookings/{bookingId}` |
| **关键字段映射** | `id`、`memberId`、`courseSessionId`、`status`、`bookedAt`、`source`、`cancelledAt`、`cancelReason` |
| **必填字段** | `id`、`memberId`、`courseSessionId`、`status`、`bookedAt` |
| **状态字段** | `status` → `BookingStatus` |
| **时间字段** | `bookedAt`、`cancelledAt` |
| **关联字段** | `memberId`、`courseSessionId` |
| **是否允许前端直接写入** | 会员端/服务端为主；后台**代约**可走 `POST` 受控接口 |
| **写入前置条件** | 容量、会员状态、重复预约规则、日志 |

---

### Attendance（签到）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | `Attendance` |
| **mock 来源** | `MOCK_ATTENDANCES`、场景合并 |
| **建议真实表 / 集合** | `attendances` |
| **建议只读接口** | `GET /api/v1/attendances`；`GET /api/v1/course-sessions/{sessionId}/attendances` |
| **建议详情接口** | `GET /api/v1/attendances/{attendanceId}` |
| **关键字段映射** | `id`、`memberId`、`courseSessionId`、`status`、`bookingId`、`memberAssetId`、`checkedInAt`、`attendedAt`、`consumedAt`、`notes` |
| **必填字段** | `id`、`memberId`、`courseSessionId`、`status` |
| **状态字段** | `status` → `AttendanceStatus` |
| **时间字段** | `checkedInAt`、`attendedAt`、`consumedAt` |
| **关联字段** | `bookingId`、`memberAssetId`、`courseSessionId` |
| **是否允许前端直接写入** | **否**随意 PATCH；签到事实由扫码/确认接口产生 |
| **写入前置条件** | 场次状态、时间窗、防重复、`bookingId` 一致性 |

---

### Consumption（耗课记录）

| 维度 | 内容 |
|------|------|
| **前端当前类型** | 演示为 `MockCourseConsumptionRecord`（`types.ts` 标注 mock）；真实域建议收敛为 `Consumption` 与之一对一或超集 |
| **mock 来源** | `Courses` 内 `mockConsumptions` state；`completeCourseSessionMock` 等工具产出 |
| **建议真实表 / 集合** | `consumptions`（或 `class_consumptions`） |
| **建议只读接口** | `GET /api/v1/consumptions`；`GET /api/v1/members/{memberId}/consumptions` |
| **建议详情接口** | `GET /api/v1/consumptions/{consumptionId}` |
| **关键字段映射（mock → 建议正式）** | `id`；`courseSessionId`；`memberId`；`consumedAt`；`amount`（扣减价值或次数，需与 `balanceType` 对齐）；`note`；正式表建议增加：`assetId`、`quantity`、`unit`、`status`、`idempotencyKey`、`ledgerEntryIds[]` |
| **必填字段** | `id`、`memberId`、`courseSessionId`、`consumedAt`、扣减维度（次数/金额/权益单位） |
| **状态字段** | 建议正式：`pending` \| `posted` \| `reversed`（当前 mock 无则新增） |
| **时间字段** | `consumedAt`；可 `postedAt` |
| **关联字段** | `memberId`、`courseSessionId`、`memberAssetId`（与 `Attendance` 链路一致） |
| **是否允许前端直接写入** | **否** |
| **写入前置条件** | 服务端在「签到完成 + 资产扣减 + 可选分录」事务内生成；幂等、日志 |

---

## 2. 接口规范（建议）

### 列表接口分页

| 参数 | 类型 | 说明 |
|------|------|------|
| `page` | int，默认 1 | 页码 |
| `pageSize` | int，默认 20，最大 100 | 每页条数 |
| `cursor` | string，可选 | 与 `page` 二选一的大列表游标 |

### 搜索

| 参数 | 说明 |
|------|------|
| `q` | 通用关键词（会员姓名/手机后四位/订单尾号等，由 BFF 定义） |
| `memberId`、`orderId`、`courseSessionId` 等 | 精确过滤 |

### 门店过滤

| 参数 | 说明 |
|------|------|
| `storeId` | 单店；总部多店可传多次或 `storeIds`（逗号分隔，上限由服务端限制） |

### 状态过滤

| 参数 | 说明 |
|------|------|
| `status` | 各资源主状态枚举；多值 `statusIn=a,b` |

### 时间范围

| 参数 | 说明 |
|------|------|
| `from`、`to` | ISO 8601 日期或时间；语义为 `createdAt` 或业务时间由接口文档标明 |

### 返回结构建议

```json
{
  "data": [ /* 资源对象 */ ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1250,
    "hasMore": true
  }
}
```

单条：`{ "data": { /* object */ } }`

### 错误码建议（示例）

| HTTP | code | 说明 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 参数非法 |
| 401 | `UNAUTHORIZED` | 未登录 |
| 403 | `FORBIDDEN` | 无权限或越店 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 409 | `CONFLICT` | 状态冲突、幂等重放 |
| 422 | `BUSINESS_RULE` | 业务规则不满足（如容量满） |
| 500 | `INTERNAL_ERROR` | 服务器错误（不暴露内部栈） |

---

## 3. 状态字段统一建议

以下与 `types.ts` **对齐**；若后端命名 snake_case，由 BFF 做 camelCase 映射。

### 订单状态 `OrderStatus`

`draft` | `pending_payment` | `paid` | `fulfilled` | `closed` | `cancelled` | `partially_refunded` | `refunded`

### 合同状态 `ContractStatus`

`draft` | `pending_signature` | `signed` | `effective` | `voided` | `expired` | `terminated`

### 支付状态 `PaymentStatus`

`initiated` | `paid` | `reconciled` | `failed` | `cancelled` | `refunding` | `refunded`

### 资产状态 `MemberAssetStatus`

`inactive` | `effective` | `frozen` | `expired` | `used_up` | `transferred` | `upgraded` | `cancelled`

### 课程场次主状态 `CourseSessionStatus`

`draft` | `scheduled` | `published` | `in_progress` | `completed` | `cancelled` | `rescheduled`

**扩展（可选，与主状态并存）**

- `publishStatus`：`draft` \| `published` \| `unpublished` \| `canceled`  
- `bookingStatus`：`not_open` \| `bookable` \| `full` \| `closed` \| `suspended`  
- `sessionStatus`（生命周期）：`upcoming` \| `in_progress` \| `ended` \| …  
- `exceptionStatus`、`settlementStatus`：见 `types.ts`

### 预约状态 `BookingStatus`

`booked` | `waitlisted` | `cancelled` | `late_cancelled` | `no_show`

### 签到状态 `AttendanceStatus`

`pending_checkin` | `checked_in` | `attended` | `consumed` | `absent`

### 耗课状态（建议正式表扩展）

当前 mock 无独立枚举；建议：`pending` | `posted` | `reversed`（与财务冲正一致）

---

## 4. 写接口边界

以下操作**不得**由前端或低权限服务**直接写业务事实表**；应通过 **API 意图 + 服务端事务 + 权限 + 审批（如需要）+ 操作日志**：

- 退款  
- 冻结  
- 转卡  
- 补签  
- 改签到  
- 改合同  
- 改资产  
- 改支付  
- 改财务分录  
- 改老师等级  
- 改员工权限  
- 导出数据（走异步任务与审批，禁止直连导出生产库）

只读接口可先全量开放给授权角色；写接口按模块分批上线，且与 `OperationLog` 关联。

---

## 5. 下一步建议

进入 **`云函数接口拆分设计 v1`**，建议按域拆分：

- `members`、`member-assets`、`products`、`orders`、`contracts`、`payments`  
- `courses`、`course-sessions`、`bookings`、`attendances`、`consumptions`  

每域明确：触发器 vs HTTP 可调用、冷启动与超时、与数据库事务边界、与消息队列（通知）的异步边界。

---

## 文档版本

| 版本 | 说明 |
|------|------|
| v1 | 首版：P0 字段对照、接口规范、状态统一、写边界、下一步 |
