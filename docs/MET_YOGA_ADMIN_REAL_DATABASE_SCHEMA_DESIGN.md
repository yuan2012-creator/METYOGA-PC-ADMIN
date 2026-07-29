# MET YOGA PC 后台｜真实数据库集合设计 v1

> **定位**：微信云开发 **集合** 或关系型 **表** 的并列设计说明；命名采用 `snake_case` 集合/表名，与前端 `types.ts` 的 `camelCase` 由 BFF 映射。  
> **依据**：`types.ts` 中 P0/P1 域对象与状态枚举；与 `MET_YOGA_ADMIN_REAL_API_FIELD_MAPPING.md`、`MET_YOGA_ADMIN_CLOUD_FUNCTION_API_DESIGN.md` 对齐。

---

## 1. 数据库设计原则

- **事实源少，页面可以多**：同一 `orders` / `member_assets` 事实被 Mall、Finance、Members、Dashboard 等多处只读聚合，禁止为每个页面复制一张「宽表事实」。
- **业务对象按领域拆分，不按页面建表**：表/集合边界对齐会员、订单、教务、财务、权限等域，而非 `dashboard_*`、`mall_page_*`。
- **钱、权益、合同、签到、退款、转卡、冻结、财务分录必须保留证据链**：每笔变更可追溯到 `source_id`、`approval_id`、`operation_log_id`、操作者与前后快照（或事件溯源）。
- **前端不直接写核心事实表**：仅云函数 / 服务端在事务内写入；前端 SDK 规则上禁止对 `orders`、`payments`、`finance_ledger_entries` 等开放 `update` 权限。
- **敏感写入必须通过云函数 / 服务端事务**：跨表一致性与幂等键在云函数内完成。
- **所有敏感操作必须写 `operation_logs`**：成功与失败皆可记（失败记 `error_code`），满足审计与风控回放。
- **需要审批的操作必须有关联 `approvals` / `*_requests` 记录**：业务表上存 `approval_id` 或申请单 id，禁止「口头批过」无单改数。
- **所有金额字段必须明确单位、币种、是否含退款**：建议字段：`amount_minor`（最小货币单位整数）或 `amount`（元）+ `currency`（默认 `CNY`）+ `amount_kind`（`payable` / `refunded_net` 等语义）；退款另表，不在 `orders.total` 上混写「已扣退款」 unless 明确定义。
- **所有时间字段统一 ISO / 时间戳策略**：推荐存 UTC **毫秒时间戳** `*_at_ms` 或 ISO 8601 字符串 `*_at`（全库统一一种）；禁止同一库混用「展示用中文日期」。

---

## 2. P0 核心集合 / 表设计

### `members`

| 项 | 说明 |
|----|------|
| **用途** | 会员主档与生命周期展示。 |
| **关键字段** | `_id`、`name`、`phone_encrypted` 或 `phone_hash`+`phone_last4`、`gender`、`avatar_url`、`lifecycle_status`、`stage_s0_s6`、`risk_tag`、`primary_store_id`、`manager_staff_id`、`total_ltv_minor`、`points_balance`、`created_at`、`updated_at` |
| **状态字段** | `lifecycle_status`（对齐 `MemberLifecycleStatus`）；`stage_s0_s6` 兼容展示 |
| **时间字段** | `joined_at`、`last_visited_at`、`created_at`、`updated_at` |
| **关联字段** | `primary_store_id`、`manager_staff_id` |
| **建议索引** | `primary_store_id + lifecycle_status`；`phone_hash` 唯一（若政策允许）；`updated_at` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | 注册服务、CRM 同步、`memberCommand`（受控） |
| **风险说明** | PII 泄露；需脱敏与访问审计。 |

### `member_assets`

| 项 | 说明 |
|----|------|
| **用途** | 会员权益载体（次卡/时长/金额/积分等）。 |
| **关键字段** | `_id`、`member_id`、`product_id`、`product_type`、`balance_type`、`status`、`total_amount`、`remaining_amount`、`source_order_id`、`contract_id`、`effective_at`、`expiry_at`、`frozen_until`、`created_at`、`updated_at`、`idempotency_grant_key`（发放幂等） |
| **状态字段** | `status`（对齐 `MemberAssetStatus`） |
| **时间字段** | `effective_at`、`expiry_at`、`frozen_until`、`created_at`、`updated_at` |
| **关联字段** | `member_id`、`source_order_id`、`contract_id`、`product_id` |
| **建议索引** | `member_id + status`；`source_order_id`；`expiry_at`（到期任务） |
| **是否允许前端直接写入** | **否** |
| **写入来源** | 履约发放、`consumptions` 扣减、`refunds`/`asset_transfer`/`asset_freeze` 事务、`assetCommand` |
| **风险说明** | 双花、余额不一致；必须服务端扣减 + 乐观锁版本号 `version`。 |

### `products`

| 项 | 说明 |
|----|------|
| **用途** | 卡/积分课/TTC 等可售商品主数据（与前端 `CardProduct`/`PointProduct`/`TtcProduct` 映射）。 |
| **关键字段** | `_id`、`product_type`（card/point/ttc）、`name`、`status`、`price_minor`、规则 JSON（退改/有效期/范围）、`listing_store_ids[]`、`effective_version` |
| **状态字段** | `status`（active/inactive/archived 等） |
| **时间字段** | `created_at`、`updated_at`、`effective_from`、`effective_to`（可选） |
| **关联字段** | `tenant_id` / `brand_id`（可选） |
| **建议索引** | `product_type + status`；`listing_store_ids` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | `ruleConfigCommand` 或独立 `productAdminService` |
| **风险说明** | 已售订单引用旧版本；需版本快照在 `order_items` 落库。 |

### `orders`

| 项 | 说明 |
|----|------|
| **用途** | 订单头；金额汇总与状态机。 |
| **关键字段** | `_id`、`member_id`、`store_id`、`status`、`total_amount_minor`、`paid_amount_minor`、`contract_id`、`sales_staff_id`、`created_at`、`updated_at`、`version` |
| **状态字段** | `status`（`OrderStatus`） |
| **时间字段** | `created_at`、`updated_at` |
| **关联字段** | `member_id`、`store_id`、`contract_id` |
| **建议索引** | `member_id + created_at`；`store_id + status + created_at` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | `orderCommand`、收银服务 |
| **风险说明** | 随意 `closed/refunded` 导致资产与分录错乱。 |

### `order_items`

| 项 | 说明 |
|----|------|
| **用途** | 订单行；商品快照。 |
| **关键字段** | `_id`、`order_id`、`product_type`、`product_id`、`product_name_snapshot`、`quantity`、`unit_price_minor`、`total_amount_minor`、`member_asset_id`（履约后填） |
| **状态字段** | 可选 `line_status`（fulfilled/cancelled） |
| **时间字段** | `created_at` |
| **关联字段** | `order_id`、`product_id`、`member_asset_id` |
| **建议索引** | `order_id`；`product_id` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | 与 `orders` 同事务创建 |
| **风险说明** | 行金额与头不一致；服务端校验 sum(items)=header。 |

### `contracts`

| 项 | 说明 |
|----|------|
| **用途** | 合同/协议实例。 |
| **关键字段** | `_id`、`member_id`、`order_id`、`template_id`、`title`、`status`、`signed_at`、`effective_at`、`expires_at`、`pdf_url`（可选） |
| **状态字段** | `status`（`ContractStatus`） |
| **时间字段** | `sent_at`、`signed_at`、`effective_at`、`expires_at`、`created_at`、`updated_at` |
| **关联字段** | `member_id`、`order_id`、`template_id` |
| **建议索引** | `order_id`；`member_id + status` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | `contractCommand`、电子签回调 |
| **风险说明** | 未签署即 `effective`；须状态机 + 法务规则。 |

### `payments`

| 项 | 说明 |
|----|------|
| **用途** | 支付流水。 |
| **关键字段** | `_id`、`order_id`、`member_id`、`amount_minor`、`status`、`method`、`transaction_no`、`channel_payload_ref`、`initiated_at`、`paid_at`、`reconciled_at` |
| **状态字段** | `status`（`PaymentStatus`） |
| **时间字段** | `initiated_at`、`paid_at`、`reconciled_at` |
| **关联字段** | `order_id`、`member_id` |
| **建议索引** | `order_id`；`transaction_no` 唯一（渠道内） |
| **是否允许前端直接写入** | **否** |
| **写入来源** | 支付网关回调、对账任务 |
| **风险说明** | 伪造流水；签名校验 + 渠道侧为准。 |

### `courses`

| 项 | 说明 |
|----|------|
| **用途** | 课程定义（团课/私教等）。 |
| **关键字段** | `_id`、`name`、`course_type`、`duration_minutes`、`category`、`difficulty`、`status`、`store_ids[]`（可选） |
| **状态字段** | `status`（active/inactive） |
| **时间字段** | `created_at`、`updated_at` |
| **关联字段** | — |
| **建议索引** | `course_type + status` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | 教务管理 `courseCommand`（若拆分） |
| **风险说明** | 删除已被场次引用课程；应软删或 archive。 |

### `course_sessions`

| 项 | 说明 |
|----|------|
| **用途** | 排课实例。 |
| **关键字段** | `_id`、`course_id`、`store_id`、`room_id`、`teacher_id`、`status`、`start_at`、`end_at`、`capacity`、`booked_count`、`waitlist_count`、`publish_status`、`booking_status`、`session_status`、`exception_status`、`settlement_status`、`notes` |
| **状态字段** | 主 `status`（`CourseSessionStatus`）；扩展与 `types.ts` 一致 |
| **时间字段** | `start_at`、`end_at`、`created_at`、`updated_at` |
| **关联字段** | `course_id`、`store_id`、`room_id`、`teacher_id` |
| **建议索引** | `store_id + start_at`；`teacher_id + start_at`；`status + start_at` |
| **是否允许前端直接写入** | **否** |
| **写入来源** | `courseSessionCommand`、排课同步任务 |
| **风险说明** | 并发改教室/老师；乐观锁 `version`。 |

### `bookings`

| 项 | 说明 |
|----|------|
| **用途** | 会员对场次的预约。 |
| **关键字段** | `_id`、`member_id`、`course_session_id`、`status`、`source`、`booked_at`、`cancelled_at`、`cancel_reason` |
| **状态字段** | `status`（`BookingStatus`） |
| **时间字段** | `booked_at`、`cancelled_at` |
| **关联字段** | `member_id`、`course_session_id` |
| **建议索引** | `course_session_id + status`；`member_id + course_session_id` 唯一（防重复） |
| **是否允许前端直接写入** | **否**（经 `bookingCommand`） |
| **写入来源** | `bookingCommand` |
| **风险说明** | 超卖；与 `course_sessions.capacity` 事务内校验。 |

### `attendances`

| 项 | 说明 |
|----|------|
| **用途** | 到场与签到事实。 |
| **关键字段** | `_id`、`member_id`、`course_session_id`、`booking_id`、`member_asset_id`、`status`、`checked_in_at`、`attended_at`、`consumed_at`、`notes` |
| **状态字段** | `status`（`AttendanceStatus`） |
| **时间字段** | `checked_in_at`、`attended_at`、`consumed_at`、`created_at` |
| **关联字段** | `booking_id`、`member_asset_id`、`course_session_id` |
| **建议索引** | `course_session_id + member_id` 唯一；`booking_id` |
| **是否允许前端直接写入** | **否**（经 `attendanceCommand`） |
| **写入来源** | 扫码签到、教练确认、审批通过的补签 |
| **风险说明** | 重复签到；唯一约束 + 幂等键。 |

### `consumptions`

| 项 | 说明 |
|----|------|
| **用途** | 耗课事实（扣次/扣值）；财务收入确认触发源之一。 |
| **关键字段** | `_id`、`member_id`、`member_asset_id`、`course_session_id`、`attendance_id`、`status`、`quantity`、`unit`、`amount_minor`、`consumed_at`、`idempotency_key`、`finance_ledger_entry_ids[]`（可选反查） |
| **状态字段** | 建议 `pending` / `posted` / `reversed` |
| **时间字段** | `consumed_at`、`posted_at` |
| **关联字段** | `member_id`、`member_asset_id`、`course_session_id`、`attendance_id` |
| **建议索引** | `member_asset_id + consumed_at`；`course_session_id`；`idempotency_key` 唯一 |
| **是否允许前端直接写入** | **否** |
| **写入来源** | 签到完成后的领域服务事务 |
| **风险说明** | 与资产扣减不一致；必须与 `member_assets` 同事务。 |

---

## 3. P1 敏感业务集合 / 表设计

### `refunds`

| 项 | 说明 |
|----|------|
| **用途** | 退款业务单。 |
| **关键字段** | `_id`、`order_id`、`member_id`、`payment_id`、`status`、`amount_minor`、`asset_handle_type`、`member_asset_id`、`contract_id`、`refund_no`、`requested_at`、`approved_at`、`completed_at`、`reject_reason` |
| **状态字段** | `status`（`RefundStatus`） |
| **审批字段** | `approval_id`、`requested_by`、`reviewed_by`、`processed_by` |
| **操作日志** | 每条状态迁移写 `operation_logs`；`refund_id` 关联 |
| **关联字段** | `order_id`、`payment_id`、`member_asset_id`、`approval_id` |
| **建议索引** | `order_id + status`；`status + requested_at` |
| **写入前置条件** | 申请单审批通过；支付渠道可退；资产处理策略已选 |
| **风险说明** | 重复退款；幂等 `refund_no` / 渠道退单号。 |

### `asset_freeze_records`

| 项 | 说明 |
|----|------|
| **用途** | 冻结/解冻历史。 |
| **关键字段** | `_id`、`member_asset_id`、`order_id`、`action`（freeze/unfreeze）、`status`、`freeze_reason`、`freeze_start_at`、`freeze_end_at`、`approval_id`、`requested_at`、`completed_at` |
| **状态字段** | `status`（如 requested / active / ended / cancelled） |
| **审批字段** | `approval_id` |
| **操作日志** | 全量 |
| **关联字段** | `member_asset_id`、`order_id`、`approval_id` |
| **建议索引** | `member_asset_id + created_at` |
| **写入前置条件** | `freezeRequestCommand` + 审批；无在途冲突退款 |
| **风险说明** | 与合同/订单状态矛盾；前置规则同前端 `mallFreezeRequest` 升服务端。 |

### `asset_transfer_records`

| 项 | 说明 |
|----|------|
| **用途** | 转卡过户。 |
| **关键字段** | `_id`、`from_member_id`、`to_member_id`、`from_asset_id`、`to_asset_id`（生成后）、`status`、`fee_minor`、`approval_id`、`created_at`、`completed_at` |
| **状态字段** | `status`（如 draft / pending_out / pending_in / completed / rejected） |
| **审批字段** | `approval_id`（可拆双签两张单，本文简化为单引用） |
| **操作日志** | 全量 |
| **关联字段** | `member_asset_id`、`approval_id` |
| **建议索引** | `from_member_id`、`to_member_id`、`status` |
| **写入前置条件** | 双方确认 + 审批；资产可转校验 |
| **风险说明** | 权益流失与税务归属；法务条款必填。 |

### `teachers`

| 项 | 说明 |
|----|------|
| **用途** | 老师人事与资质主档（可与 `staff` 合并建模，此处单列老师维度）。 |
| **关键字段** | `_id`、`staff_id`、`level`、`status`、`specialties[]`、`join_at` |
| **状态字段** | `employment_status` / `teaching_status` |
| **审批字段** | 升级/降级 `approval_id`（若走审批） |
| **操作日志** | 等级与资质变更 |
| **关联字段** | `staff_id`、`store_id` |
| **建议索引** | `staff_id` 唯一 |
| **写入前置条件** | 人事权限；等级变更常需审批 |
| **风险说明** | 与课酬规则不一致。 |

### `teacher_session_pays`

| 项 | 说明 |
|----|------|
| **用途** | 单节或批次课时费计提。 |
| **关键字段** | `_id`、`teacher_id`、`course_session_id`、`batch_id`、`amount_minor`、`status`、`rule_version` |
| **状态字段** | `pending` / `locked` / `paid` / `reversed` |
| **审批字段** | `batch_approval_id`（批次级） |
| **操作日志** | 生成、锁定、发放、冲正 |
| **关联字段** | `course_session_id`、`teacher_id`、`finance_ledger_entry_id`（可选） |
| **建议索引** | `batch_id`；`teacher_id + status` |
| **写入前置条件** | 场次 `settlement_status` 允许；规则版本锁定 |
| **风险说明** | 重复计提；`course_session_id + teacher_id` 幂等。 |

### `finance_ledger_entries`

| 项 | 说明 |
|----|------|
| **用途** | 会计分录事实。 |
| **关键字段** | `_id`、`source_type`、`source_id`、`direction`、`amount_minor`、`occurred_at`、`member_id`、`order_id`、`course_session_id`、`description`、`period_id`、`posted_by` |
| **状态字段** | 可选 `entry_status`（draft/posted/reversed） |
| **审批字段** | 调整类关联 `approval_id` |
| **操作日志** | 过账/冲正强制 |
| **关联字段** | `payment_id`、`refund_id`、`consumption_id`（扩展 source） |
| **建议索引** | `source_type + source_id`；`occurred_at`；`period_id` |
| **写入前置条件** | 仅 `financeLedgerCommand`；借贷平衡；期间未关账 |
| **风险说明** | 直接改金额破坏审计；禁止 UPDATE 金额，仅允许冲正分录。 |

### `rule_configs`

| 项 | 说明 |
|----|------|
| **用途** | 规则版本（会员生命周期、课包退改、排课规则等）。 |
| **关键字段** | `_id`、`rule_key`、`version`、`payload_json`、`status`、`effective_from` |
| **状态字段** | `draft` / `pending_publish` / `active` / `archived` |
| **审批字段** | `approval_id`（发布） |
| **操作日志** | 发布与回滚 |
| **关联字段** | `tenant_id` |
| **建议索引** | `rule_key + version` 唯一；`rule_key + status` |
| **写入前置条件** | 审批通过 + 生效时间到达 |
| **风险说明** | 热更新导致结算口径突变；需生效时间窗。 |

### `operation_logs`

| 项 | 说明 |
|----|------|
| **用途** | 不可抵赖的操作审计。 |
| **关键字段** | `_id`、`actor_id`、`actor_role`、`action`、`target_type`、`target_id`、`store_id`、`request_id`、`payload_summary`、`before_hash`、`after_hash`、`result`、`error_code`、`created_at` |
| **状态字段** | `result`：success / failure |
| **审批字段** | 无（可存 `approval_id` 冗余） |
| **操作日志** | 即自身 |
| **关联字段** | 弱关联任意 `target_*` |
| **建议索引** | `target_type + target_id + created_at`；`actor_id + created_at`；`request_id` 唯一 |
| **写入前置条件** | 仅服务端；禁止客户端 insert |
| **风险说明** | 日志被删；WORM 或仅追加集合策略。 |

### `approvals`

| 项 | 说明 |
|----|------|
| **用途** | 通用审批头。 |
| **关键字段** | `_id`、`subject_type`（refund/freeze/transfer/contract/rule/permission…）、`subject_id`、`status`、`current_step`、`payload_ref`、`requested_by`、`completed_at` |
| **状态字段** | `pending` / `approved` / `rejected` / `cancelled` |
| **审批字段** | `steps[]`：{ `role`, `approver_id`, `decided_at`, `decision` } |
| **操作日志** | 每步决策写 `operation_logs` |
| **关联字段** | `subject_id` 多态 |
| **建议索引** | `subject_type + subject_id`；`status + created_at` |
| **写入前置条件** | 由 `Command` 创建；审批服务更新 |
| **风险说明** | 越权审批；绑定组织与金额阈值。 |

### `roles`

| 项 | 说明 |
|----|------|
| **用途** | 角色定义。 |
| **关键字段** | `_id`、`name`、`desc`、`scope`（hq/store/partner）、`created_at` |
| **状态字段** | `active` / `archived` |
| **审批字段** | 新建/删除角色 `approval_id` |
| **操作日志** | 是 |
| **关联字段** | — |
| **建议索引** | `name + scope` 唯一 |
| **写入前置条件** | 超级管理员 + 审批（按政策） |
| **风险说明** | 锁死全员；禁止删系统内置角色。 |

### `permissions`

| 项 | 说明 |
|----|------|
| **用途** | 权限点定义 + 角色绑定（可拆 `role_permissions` 关联表）。 |
| **关键字段** | `_id`、`key`（如 `refund.approve`）、`description`；关联表：`role_id`、`permission_key`、`granted` |
| **状态字段** | — |
| **审批字段** | 变更包 `approval_id` |
| **操作日志** | 是 |
| **关联字段** | `role_id` |
| **建议索引** | `role_id + permission_key` 唯一 |
| **写入前置条件** | `permissionCommand` + 双人复核 |
| **风险说明** | 垂直越权；变更后强制重新拉取 token 权限缓存。 |

---

## 4. P2 扩展集合 / 表设计

### `investment_projects`

| 项 | 说明 |
|----|------|
| **用途** | 投资项目与测算参数。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`name`、`store_id`、`capex_json`、`opex_json`、`assumptions_version` |
| **关联字段** | `store_id` |
| **风险说明** | 与真实财务混淆；展示须打「测算」水印。 |

### `partner_stores`

| 项 | 说明 |
|----|------|
| **用途** | 合作门店主数据。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`name`、`region`、`auth_status`、`service_tier` |
| **关联字段** | `contract_id`（合作框架协议） |
| **风险说明** | 区域与竞对敏感。 |

### `partner_quality_checks`

| 项 | 说明 |
|----|------|
| **用途** | 质检记录。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`partner_store_id`、`check_at`、`score`、`issues_json` |
| **关联字段** | `partner_store_id` |
| **风险说明** | 法律纠纷证据；不可随意删除。 |

### `marketing_activities`

| 项 | 说明 |
|----|------|
| **用途** | 活动排期与规则。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`title`、`start_at`、`end_at`、`status`、`budget_minor` |
| **关联字段** | `store_ids[]` |
| **风险说明** | 与定价、券叠加套利。 |

### `coupons`

| 项 | 说明 |
|----|------|
| **用途** | 券模板与实例（可拆 `coupon_instances`）。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`code`、`discount_rule_json`、`valid_from`、`valid_to` |
| **关联字段** | `activity_id` |
| **风险说明** | 伪造券码；服务端校验 + 核销流水。 |

### `points_records`

| 项 | 说明 |
|----|------|
| **用途** | 积分流水。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`member_id`、`delta`、`reason`、`ref_type`、`ref_id`、`created_at` |
| **关联字段** | `member_id`、`order_id`（可选） |
| **风险说明** | 积分货币化合规；审计。 |

### `gift_redemptions`

| 项 | 说明 |
|----|------|
| **用途** | 礼品/实物履约。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`member_id`、`product_id`、`status`、`shipped_at` |
| **关联字段** | `order_id` |
| **风险说明** | 库存与物流纠纷。 |

### `data_reports`

| 项 | 说明 |
|----|------|
| **用途** | 物化报表或 OLAP 快照元数据。 |
| **可否后置** | 是 |
| **关键字段** | `_id`、`report_key`、`period`、`snapshot_at`、`storage_ref` |
| **关联字段** | — |
| **风险说明** | 快照与实时事实不一致；需标注 `as_of`。 |

### `export_tasks`

| 项 | 说明 |
|----|------|
| **用途** | 异步导出任务。 |
| **可否后置** | 否（一旦开放导出即应有）；可与 P1 并行小表 |
| **关键字段** | `_id`、`requested_by`、`filters_json`、`status`、`file_url`、`expires_at`、`approval_id` |
| **关联字段** | `approval_id` |
| **风险说明** | PII 批量泄露；必须审批 + 短链过期 + 日志。 |

---

## 5. 核心关联关系

- **Member → MemberAsset**：`member_assets.member_id` → `members._id`  
- **Member → Order**：`orders.member_id`  
- **Order → OrderItem**：`order_items.order_id`  
- **Order → Contract**：`contracts.order_id`；`orders.contract_id` 冗余可选  
- **Order → Payment**：`payments.order_id`  
- **Order → MemberAsset**：`member_assets.source_order_id`；发放幂等键  
- **Course → CourseSession**：`course_sessions.course_id`  
- **CourseSession → Booking**：`bookings.course_session_id`  
- **Booking → Attendance**：`attendances.booking_id`（可选强制）  
- **Attendance → Consumption**：`consumptions.attendance_id`  
- **Consumption → MemberAsset**：`consumptions.member_asset_id`（扣减）  
- **Consumption → FinanceLedgerEntry**：分录 `source_type=course_consumption` + `source_id=consumption._id`  
- **Refund → Order / Payment / MemberAsset**：`refunds.order_id`、`payment_id`、`member_asset_id`  
- **AssetFreezeRecord → MemberAsset**：`asset_freeze_records.member_asset_id`  
- **AssetTransferRecord → MemberAsset / fromMember / toMember**：`from_member_id`、`to_member_id`、`from_asset_id`  
- **Teacher → CourseSession**：`course_sessions.teacher_id`  
- **CourseSession → TeacherSessionPay**：`teacher_session_pays.course_session_id`  
- **Approval → Refund / Freeze / Transfer / Contract / Permission**：`approvals.subject_type` + `subject_id`  
- **OperationLog → 所有敏感操作**：`operation_logs.target_type` + `target_id` + `request_id`  

---

## 6. 状态机边界

> **共性**：状态迁移仅允许**合法边**；由对应 `xxxCommand` 或审批消费者执行；**禁止**客户端任意 PATCH。除特别说明外**均须写 `operation_logs`**。审批类在首次进入 `pending` 与终态均记日志。

### `OrderStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | 订单服务 / 授权 `orderCommand` 角色 |
| **云函数** | `orderCommand`、退款完成回调写 `partially_refunded`/`refunded` |
| **是否需要审批** | 关单、改价、逆向：是 |
| **是否必须写日志** | 是 |

### `ContractStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | 电子签服务、`contractCommand` |
| **云函数** | `contractCommand`、签章回调 |
| **是否需要审批** | `voided`/`terminated`：是 |
| **是否必须写日志** | 是 |

### `PaymentStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | 支付网关回调、对账任务 |
| **云函数** | 内部 `paymentReconcileWorker`（非前端） |
| **是否需要审批** | 人工标记对账一般内控；调账：是 |
| **是否必须写日志** | 是 |

### `MemberAssetStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | 资产域服务（发放、耗课、退款核销、冻结事务） |
| **云函数** | `assetCommand`、关联 `refund`/`consumption`/`freeze` 消费者 |
| **是否需要审批** | 非 effective 的逆向：是 |
| **是否必须写日志** | 是 |

### `CourseSessionStatus`（及扩展 publish/booking/session/settlement）

| 项 | 说明 |
|----|------|
| **允许谁改** | 教务角色经 `courseSessionCommand` |
| **云函数** | `courseSessionCommand` |
| **是否需要审批** | 取消/改期按规则 |
| **是否必须写日志** | 是 |

### `BookingStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | `bookingCommand`、超时任务（no_show） |
| **云函数** | `bookingCommand`、定时器 |
| **是否需要审批** | 一般否；特殊取消可配置 |
| **是否必须写日志** | 是 |

### `AttendanceStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | `attendanceCommand`；补签需审批后子流程 |
| **云函数** | `attendanceCommand` |
| **是否需要审批** | 补签/改签到：是 |
| **是否必须写日志** | 是 |

### `ConsumptionStatus`（建议枚举）

| 项 | 说明 |
|----|------|
| **允许谁改** | 耗课领域服务、`financeLedgerCommand` 冲正链 |
| **云函数** | 签到完成事务内、`financeLedgerCommand` |
| **是否需要审批** | `reversed`：是 |
| **是否必须写日志** | 是 |

### `RefundStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | 退款服务、`refundRequestCommand` 审批通过后处理器 |
| **云函数** | `refundRequestCommand`、渠道回调 |
| **是否需要审批** | 是（全流程） |
| **是否必须写日志** | 是 |

### `AssetFreezeStatus`（记录表内）

| 项 | 说明 |
|----|------|
| **允许谁改** | `freezeRequestCommand` 审批通过后 |
| **云函数** | `freezeRequestCommand` |
| **是否需要审批** | 是 |
| **是否必须写日志** | 是 |

### `AssetTransferStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | `transferRequestCommand` 双签/总部通过后 |
| **云函数** | `transferRequestCommand` |
| **是否需要审批** | 是 |
| **是否必须写日志** | 是 |

### `ApprovalStatus`

| 项 | 说明 |
|----|------|
| **允许谁改** | 审批服务、审批人角色 |
| **云函数** | `approvalDecisionCommand`（可独立） |
| **是否需要审批** | 自指：审批链配置需更高权限 |
| **是否必须写日志** | 是 |

---

## 7. 数据安全与审计

- **手机号 / 身份信息脱敏**：库内加密或哈希 + 展示后四位；详情接口按角色返回完整度。  
- **投资人只看汇总不看隐私**：视图层或独立 `investment_aggregate` 集合，无 `members.phone`。  
- **老师只看自己相关数据**：`teacher_id` + `course_session_id` 强制过滤；禁止 list 全会员。  
- **合作门店只能看本店数据**：`partner_store_id` / `store_id` 硬过滤；跨店返回 403。  
- **财务数据按角色开放**：分录、支付流水仅财务/高管；店长可见本店汇总口径。  
- **导出必须生成 `export_tasks`**：禁止同步大 CSV 直连接口无记录。  
- **导出必须写 `operation_logs`**：`action=export.requested|export.completed`。  
- **敏感数据读取也建议记录 `access_logs`（或轻量 `operation_logs`）**：如批量会员导出、单会员全量详情、分录明细下载；字段含 `actor_id`、`resource`、`record_count`、`query_hash`。  

---

## 8. 下一步建议

进入 **`P0 只读接口接入任务拆分 v1`**：按云函数 `memberQuery`、`memberAssetQuery`、`orderQuery`、`contractQuery`、`paymentQuery`、`courseSessionQuery`、`bookingQuery`、`attendanceQuery`、`consumptionQuery`（及可选 `productQuery`、`courseQuery`）拆成**可交付任务**（Mock 替换顺序、验收用例、权限矩阵、分页契约）。

**优先从以下集合只读接入开始**（与真实库表一一对应）：

1. `members`  
2. `member_assets`  
3. `orders`（含 `order_items`）  
4. `contracts`  
5. `payments`  
6. `course_sessions`  
7. `bookings`  
8. `attendances`  
9. `consumptions`  

完成后再接 `products` 与写路径类 `Command`。

---

## 文档版本

| 版本 | 说明 |
|------|------|
| v1 | 首版：原则、P0/P1/P2 表、关联、状态机、安全审计、下一步 |
