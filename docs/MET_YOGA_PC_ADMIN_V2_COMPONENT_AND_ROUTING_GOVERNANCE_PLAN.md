# MET YOGA PC 后台 V2 组件治理与路由评估文档

**用于承接 P0 一级页与 P0 二级页完成后的工程化评估，明确是否继续做 P1 mock、是否抽取通用组件、是否进入正式路由体系**  
**当前阶段：V2 一级判断层 + P0 二级处理层完成后**

**规划日期：** 2026-07-06  
**代码基准（只读）：** `App.tsx`；`components/v2/member/*`、`finance/*`、`course/*`、`staff/*`、`product-rights/*`、`layout/*`；`components/v2/styles/v2DesignTokens.css`  
**前置文档：**

- `docs/MET_YOGA_PC_ADMIN_V2_TEMPLATE_ARCHIVE.md`
- `docs/MET_YOGA_PC_ADMIN_V2_GUIDED_EXPERIENCE_AUDIT.md`
- `docs/MET_YOGA_PC_ADMIN_V2_P0_GUIDED_OPTIMIZATION_ARCHIVE.md`
- `docs/MET_YOGA_PC_ADMIN_V2_SECONDARY_PAGES_PLAN.md`
- `docs/MET_YOGA_PC_ADMIN_V2_P0_SECONDARY_PAGES_ARCHIVE.md`

---

## 1. 当前阶段判断

**MET YOGA PC 后台 V2 已完成第一批 P0 二级页面 mock 版。**

当前结构已经形成稳定三层：

| 层级 | 职责 |
|------|------|
| **一级页：判断层** | 给结论、列优先动作、提供明细入口 |
| **二级页：处理层** | 承接名单、筛选、批量处理、风险队列 |
| **抽屉：单对象详情与证据链层** | 展示完整字段、证据链、操作日志、建议动作 |

**当前不建议继续一页一页无限堆 mock 页面。**

### 原因

1. **已有 7 个二级页，重复结构已经明显** — 头部、摘要、筛选、Tab、风险区、列表 / 卡片、抽屉、toast 模式高度一致。
2. **每页独立实现** — 7 套 `*Secondary*.tsx`、7 套 `*Secondary*.viewModel.ts`、7 套 `*Secondary*.css`，维护成本随 P1 线性上升。
3. **宿主页面越来越重** — `MemberV2Page`、`ProductRightsV2Page` 等已承载多个二级视图 + 多个抽屉，`ProductRightsV2Page` 超过 1000 行。
4. **模块内部视图切换有上限** — `App.tsx` 当前用 `activeNav` state 切换一级模块，二级页再嵌套 `useState` 视图，刷新即丢失。
5. **接真实接口前需要统一边界** — 字段契约、DTO adapter、权限、分页、审批状态机尚未标准化；继续堆 mock 会放大后续改造成本。

### 下一步建议

**优先做组件治理与路由评估（本文档），而非一口气做完 P1。**

可选补充：用 Cursor 再做 **1–2 个高价值 P1 页**（线索池、操作日志）验证获客与审计闭环，但不应在组件规范确立前批量建设 P1。

---

## 2. 当前实现方式复盘

### 2.1 模块内部视图切换

#### 当前做法

- **不改 `App.tsx` 路由** — V2 一级模块通过 `activeNav` + `switch` 渲染，无 React Router / URL path。
- **不新增左侧菜单** — 左侧 9 项主导航保持不变。
- **各模块 `*V2Page.tsx` 内用 `useState` 切换二级视图：**

| 一级模块 | 宿主页面 | overview 以外的视图 key |
|----------|----------|-------------------------|
| 会员经营 | `MemberV2Page` | `memberList`、`highBalance` |
| 财务与资产 | `FinanceV2Page` | `assetChangeRequests` |
| 课程与排课 | `CourseV2Page` | `weekSchedule` |
| 师资与团队 | `StaffV2Page` | `teacherApplications` |
| 产品与权益 | `ProductRightsV2Page` | `cardConfig`、`pointsMall` |

二级页组件为独立 `*Secondary*Page.tsx`，由宿主页面条件渲染；返回按钮调用 `setPageView('overview')`。

#### 优点

| 优点 | 说明 |
|------|------|
| 原型推进快 | 无需设计路由表、权限守卫、404 |
| 一级导航稳定 | 左侧菜单与 `App.tsx` 结构不变 |
| 不破坏现有母版 | 一级页 Hero、优先动作、明细入口保持独立 |
| 截图验收方便 | 模块内闭环，走查路径短 |
| 模块内部闭环清楚 | 会员名单 ↔ 高余额名单 ↔ 会员抽屉可在同模块协调 |

#### 问题

| 问题 | 说明 |
|------|------|
| 刷新丢失二级状态 | 浏览器刷新回到一级 `overview` |
| 无法 URL 深链 | 不能复制链接直达「积分商城配置」或「退费申请列表」 |
| 跨模块跳转不自然 | 从财务风险队列跳会员名单需额外 state 传递设计 |
| 宿主页面膨胀 | 抽屉、toast、多视图逻辑堆在 `*V2Page.tsx` |
| 维护成本升高 | 每增一个二级页，宿主文件 + 入口 wiring 同步增长 |

---

### 2.2 独立 viewModel

#### 当前做法

- 每个二级页有独立 `*Secondary*.viewModel.ts`（如 `memberSecondaryMemberList.viewModel.ts`、`financeSecondaryAssetChange.viewModel.ts`）。
- mock 数据与一级页 `*V2.viewModel.ts` 隔离。
- 类型较完整：`Snapshot`、`Row`、`DrawerDetail`、`FilterOption`、`SummaryItem`、`OperationLog` 等。

#### 优点

| 优点 | 说明 |
|------|------|
| 不污染一级页数据 | 一级 snapshot 保持轻量 |
| 方便 mock | 可独立扩充 12–16 条覆盖场景 |
| 便于截图验收 | 改 mock 不影响一级页展示 |

#### 问题

| 问题 | 说明 |
|------|------|
| 类型命名不统一 | 有 `MemberListRow`、`AssetChangeRequestRow`、`PointsMallProductRow`、`CardConfigRow` 等，前缀规则不一致 |
| 结构重复 | `SummaryItem`、`FilterOption`、`OperationLog`、`RuleRiskItem` 在 7 个 viewModel 中各自定义 |
| drawerDetail 模式重复 | 每个 Row 内嵌 `drawerDetail`，字段分区逻辑相似 |
| 接接口成本高 | 7 套独立类型需分别写 adapter，缺少共享 `BaseEntity`、`BaseDrawerDetail` |

**代码观察：** `V2DrawerEmpty` 在 `MemberV2Page`、`FinanceV2Page`、`StaffV2Page`、`ProductRightsV2Page` 中重复定义；`met-v2-drawer-empty` 样式已在 `v2DesignTokens.css` 存在，但组件未抽取。

---

### 2.3 独立 CSS

#### 当前做法

- 每个二级页独立 CSS，命名空间各异：

| 模块 | CSS 前缀示例 |
|------|--------------|
| 会员名单 | `met-mlc__`（member list） |
| 高余额低耗课 | `met-hblc__` |
| 资产变更申请 | `met-asset-change__` |
| 周排课 | `met-week-schedule__` |
| 老师申请 | `met-teacher-app__` |
| 卡项配置 | `met-card-config__` |
| 积分商城 | `met-points-mall__` |

- 抽屉分区复用 `met-v2-drawer-*`、`met-product-rights-v2-drawer-section` 等跨模块 class。
- 全局 token 在 `components/v2/styles/v2DesignTokens.css`。

#### 优点

| 优点 | 说明 |
|------|------|
| 页面互不影响 | Cursor 单页修改风险低 |
| 局部样式清楚 | 每页 BEM 命名自洽 |

#### 问题

| 问题 | 说明 |
|------|------|
| 样式重复 | 头部、摘要卡、chip、tab、风险卡、空状态在 7 个 CSS 中结构相似 |
| 难以统一调整 | 改摘要卡 warning 色需改 7 个文件 |
| CSS 体积持续增长 | P1 再增 7 页将再增 7 份 CSS |
| 长列表高度不一致 | 各页卡片 `min-height`、按钮区换行规则不统一 |

**当前无 `components/v2/shared/` 目录** — 共享组件与共享样式尚未建立。

---

## 3. 是否应该马上改路由？

### 明确判断

**当前阶段不建议马上重构 `App.tsx` 路由。**

### 原因

1. 当前 P0 页仍处于**高保真 mock**，无真实权限与接口。
2. `App.tsx` 当前为 `activeNav` state 切换，非 URL 路由；过早引入 React Router 需同步改造侧边栏、角色默认首页、深链守卫。
3. 过早路由化会增加复杂度（嵌套路由、query params、权限守卫、404），而收益在 mock 阶段有限。
4. **现阶段更重要的是先定组件规范** — 组件边界清晰后，路由化只是「把已有二级页挂到 path 上」。

### 但需要预留路由方案

建议分三阶段：

#### 阶段 A：当前继续保持模块内部视图（现在）

**适用于：**

- P0 mock 验收与归档；
- 少量 P1 页面继续验证（建议 ≤ 2 个）；
- 尚未接真实接口；
- 仍以截图走查为主。

**保持：** 不改 `App.tsx`、不新增左侧二级菜单。

#### 阶段 B：二级页数量超过 10 个后评估路由化

**触发条件（满足任一即评估）：**

- 二级页总数 **> 10**（当前 7 + P1 预计 7 = 14）；
- 需要 **URL 深链**（分享、书签、工单链接）；
- 需要 **刷新保留页面状态**；
- 需要 **跨模块跳转**（财务 → 会员名单、排课 → 老师申请）；
- 需要 **路由级权限控制**；
- 需要 **真实数据分页**（服务端筛选依赖 query）。

#### 阶段 C：接真实接口前进入正式路由

在阶段 C 前完成：组件抽取、DTO adapter、权限守卫设计。

**建议路由形式（评估用，本文档不实施）：**

```text
/dashboard
/today
/members                          → MemberV2Page overview
/members/list                     → 会员名单
/members/high-balance             → 高余额低耗课名单
/courses                          → CourseV2Page overview
/courses/week-schedule            → 完整周排课
/staff                            → StaffV2Page overview
/staff/applications               → 老师端申请审批
/finance                          → FinanceV2Page overview
/finance/asset-changes            → 退费 / 冻结 / 转卡申请
/product-rights                   → ProductRightsV2Page overview
/product-rights/cards             → 卡项配置
/product-rights/points-mall       → 积分商城配置
/marketing
/settings
```

**说明：本文档只做评估，不改路由。**

---

## 4. 应该优先抽取哪些通用组件？

### P0 应优先抽取组件（按优先级）

| 优先级 | 组件 | 复用页面 | 目标 |
|:------:|------|----------|------|
| 1 | **SecondaryPageHeader** | 7 页全部 | 统一返回、面包屑、范围、disclaimer、主按钮 |
| 2 | **SummaryMetricGrid** | 7 页全部 | 统一状态摘要数字卡 |
| 3 | **FilterChipGroup** | 7 页全部 | 统一筛选 chip 组 + 关键词 + 重置 |
| 4 | **SecondaryTabs** | P0-3、P0-5、P0-6、P0-7 | 统一类型 Tab + 描述文案 |
| 5 | **RiskNoticePanel** | 6 页（会员名单较轻量） | 风险队列 / 规则提示 / disclaimer |
| 6 | **StructuredEntityCard** | 7 页全部 | 统一列表 / 卡片行 |
| 7 | **DrawerSection** | 全部详情抽屉 | 统一抽屉分区 |
| 8 | **ActionGroup** | 7 页全部 | 卡片内操作按钮组 |
| 9 | **MockActionButton / toast helper** | 全部模块 | 统一 mock 文案与禁止词 |
| 10 | **EmptyState** | 7 页全部 | 统一空状态（含 `V2DrawerEmpty`） |

---

### 4.1 SecondaryPageHeader

| 维度 | 说明 |
|------|------|
| **当前复用** | 7 页均有：返回按钮、面包屑、title、subtitle、scope、disclaimer、主操作按钮；CSS 结构在 `met-hblc__header-nav`、`met-card-config__header-top` 等重复 |
| **组件目标** | 二级页顶部唯一入口，视觉轻量，不含一级 Hero |
| **建议 props** | `title`、`subtitle`、`breadcrumb`、`scope`、`backLabel`、`onBack`、`primaryActionLabel`、`onPrimaryAction`、`disclaimer`、`roleView`、`updatedAt` |
| **注意** | 不要把一级页 Hero 复用；必须有返回一级页；`disclaimer` 支持 warning 样式 |

---

### 4.2 SummaryMetricGrid

| 维度 | 说明 |
|------|------|
| **当前复用** | 7 页均有 5–7 个数字摘要卡；warning 态在卡项配置、积分商城、资产变更中已使用 |
| **组件目标** | 轻量数字条，可点击联动筛选（可选） |
| **建议 props** | `items: { id, label, value, hint?, status?, onClick?, active? }[]`；`status`: `normal` / `warning` / `danger` / `success` |
| **注意** | 不做经营总览 Hero；金额 / 积分 / 点数单位明确；估算类加 hint |

---

### 4.3 FilterChipGroup

| 维度 | 说明 |
|------|------|
| **当前复用** | 7 页均有 chip 筛选；部分 `mockOnly` 筛选项 toast「切换 xx 筛选（待建设）」 |
| **组件目标** | 按组渲染 chip，支持单选 / 多选，支持 mock 标记 |
| **建议 props** | `groupLabel`、`options`、`activeValue`、`onChange`、`allowMultiple`、`isMock`、`disabled` |
| **注意** | 不同页面按需组合筛选组；后续可映射 `query params`；不要堆全部筛选项 |

---

### 4.4 SecondaryTabs

| 维度 | 说明 |
|------|------|
| **当前复用** | 资产变更（退费 / 冻结 / 转卡）、老师申请（6 类）、卡项分类、积分商品类型 |
| **组件目标** | Tab 切换 + 下方类型说明文案 |
| **建议 props** | `tabs`、`activeTab`、`onTabChange`、`description`、`count`（可选角标） |
| **注意** | Tab 切换应真实过滤列表（mock 阶段前端 filter） |

---

### 4.5 RiskNoticePanel

| 维度 | 说明 |
|------|------|
| **当前复用** | 高余额名单规则说明、资产变更风险、周排课冲突条、老师申请优先队列、卡项 / 积分商城风险区 |
| **组件目标** | 展示风险项、规则红线、页面 disclaimer |
| **建议 props** | `title`、`description`、`items`、`severity`、`ctaLabel`、`onCta` |
| **注意** | 区分「风险队列」（可点击去处理）与「静态规则说明」两种模式 |

---

### 4.6 StructuredEntityCard

| 维度 | 说明 |
|------|------|
| **当前复用** | 会员卡、高余额卡、申请卡、课程场次卡、老师申请卡、卡项卡、积分商品卡 |
| **组件目标** | 统一「对象 + 状态 + 风险 + 元数据 + 建议动作 + 操作按钮」结构 |
| **建议 props** | `entityId`、`title`、`subtitle`、`statusTags`、`riskLevel`、`metaItems`、`evidenceItems`、`suggestedAction`、`actions`、`onOpenDetail`、`selectable`、`selected`、`layout`: `row` / `card` / `grid` |
| **注意** | 不做 Excel 表；高风险置顶逻辑留在 viewModel `sortXxxRows()`；warn 边框态统一 |

---

### 4.7 DrawerSection

| 维度 | 说明 |
|------|------|
| **当前复用** | 所有详情抽屉均有 6–10 个 `met-product-rights-v2-drawer-section` / `met-v2-drawer` 分区 |
| **组件目标** | 统一分区标题、键值行、warning、children 插槽 |
| **建议 props** | `title`、`rows: { label, value }[]`、`badges`、`description`、`warning`、`children` |
| **注意** | 不强制所有抽屉字段一致；按业务组合 Section |

---

### 4.8 MockActionButton / toast helper

| 维度 | 说明 |
|------|------|
| **当前复用** | 全项目 `onToast('xxx（待建设）')` 散落各处；提交审核 copy 略有差异 |
| **组件目标** | 统一 mock 操作文案、禁止真实成功态 |
| **建议** | `showMockToast(actionLabel)`、`mockActionLabels`、`forbiddenSuccessWords` 常量 |
| **注意** | 按钮可渲染为 `MockActionButton` 或 hook `useMockToast()` |

---

### 4.9 EmptyState

| 维度 | 说明 |
|------|------|
| **当前复用** | 各二级页「暂无匹配」；`V2DrawerEmpty` 在 4 个宿主页面重复 |
| **组件目标** | 统一空状态视觉与文案槽位 |
| **状态** | 无数据、筛选无结果、无权限、功能待建设、详情缺失、加载失败 mock |
| **注意** | 详情缺失 fallback 应抽取为共享 `DrawerEmptyState`，删除各页重复 `V2DrawerEmpty` |

---

## 5. 通用组件设计建议

### 5.1 SecondaryPageHeader

**用途：** 所有二级页顶部统一结构。

**适用页面：** 7 个 P0 二级页全部适用。

**建议 props：**

```typescript
interface SecondaryPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;           // "会员经营 / 会员名单"
  scope?: string;                // "滨江馆 · 本周 · 店长视角"
  backLabel: string;             // "返回会员经营"
  onBack: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  disclaimer?: string;
  roleView?: string;
  updatedAt?: string;
}
```

**注意：**

- 不要把一级页 Hero 复用到二级页；
- 二级页头部应轻量（无大面积结论卡）；
- 必须有返回一级页；
- `disclaimer` 用于业务红线（积分不折现、估算不等于可退等）。

---

### 5.2 SummaryMetricGrid

**用途：** 展示状态摘要数字卡。

**建议字段：**

```typescript
interface SummaryMetricItem {
  id: string;
  label: string;
  value: string;
  hint?: string;
  status?: 'normal' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
  active?: boolean;
}
```

**注意：**

- 不要做成经营总览 Hero；
- 点击筛选应可选（如点击「库存不足 3」过滤列表）；
- 金额、积分、点数的单位要明确；
- 估算类数字必须配 `hint` 免责。

---

### 5.3 FilterChipGroup

**用途：** 统一筛选 chip。

**建议字段：**

```typescript
interface FilterChipGroupProps {
  groupLabel: string;
  options: { id: string; label: string; value: string }[];
  activeValue: string | string[];
  onChange: (value: string) => void;
  allowMultiple?: boolean;
  isMock?: boolean;              // true 时非 all 值 toast 待建设
  disabled?: boolean;
}
```

**注意：**

- 不要把所有筛选都堆出来；
- 不同页面按需组合（会员：阶段 + 风险；财务：类型 + 证据状态）；
- 后续可接真实 `query params`；
- 配合 `FilterPanel` 容器：关键词搜索 + 重置按钮。

---

### 5.4 SecondaryTabs

**用途：** 统一类型 Tab。

**适用：** 退费 / 冻结 / 转卡、老师申请类型、卡项分类、积分商品类型。

**建议字段：**

```typescript
interface SecondaryTabsProps {
  tabs: { id: string; label: string; value: string; count?: number }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  description?: string;          // Tab 下方类型说明
}
```

---

### 5.5 RiskNoticePanel

**用途：** 展示风险规则、风险提示、业务红线、当前页面免责声明。

**适用：** 高余额低耗课、退费 / 冻结 / 转卡、完整周排课、老师端申请、卡项配置、积分商城。

**建议字段：**

```typescript
interface RiskNoticeItem {
  id: string;
  riskType: string;
  subject: string;
  impactScope: string;
  suggestedAction: string;
  ctaLabel?: string;
  onCta?: () => void;
  relatedEntityId?: string;
}

interface RiskNoticePanelProps {
  title?: string;
  description?: string;
  items: RiskNoticeItem[];
  severity?: 'info' | 'warning' | 'danger';
}
```

---

### 5.6 StructuredEntityCard

**用途：** 统一列表 / 卡片行。

**适用：** 会员、高余额会员、资产变更申请、课程场次、老师申请、卡项、积分商品。

**建议字段：** 见 §4.6。

**注意：**

- 不要做成 Excel 表；
- 每一行必须有：对象名、状态、风险、负责人 / 当前节点、建议动作；
- `layout="grid"` 用于卡项 / 积分商品；`layout="row"` 可用于申请列表；
- 高风险置顶仍由 viewModel `sortXxxRows()` 处理，组件不负责排序。

---

### 5.7 DrawerSection

**用途：** 统一右侧抽屉分区。

**建议字段：**

```typescript
interface DrawerSectionRow {
  label: string;
  value: React.ReactNode;
}

interface DrawerSectionProps {
  title: string;
  rows?: DrawerSectionRow[];
  badges?: string[];
  description?: string;
  warning?: string;
  children?: React.ReactNode;
}
```

**适用：** 所有详情抽屉（会员、申请、课程、卡项、积分商品）。

---

### 5.8 MockActionButton / toast helper

**用途：** 统一 mock 操作文案。

**建议统一格式：**

| 类型 | 格式示例 |
|------|----------|
| 普通操作 | `记录跟进（待建设）` |
| 提交审核 | `卡项配置已提交审核（待建设）` |
| 筛选 mock | `切换门店筛选（待建设）` |

**建议建立：**

```typescript
// components/v2/shared/mockActions.ts
export const MOCK_ACTION_SUFFIX = '（待建设）';
export function showMockToast(action: string): string;
export const mockActionLabels: Record<string, string>;
export const forbiddenSuccessWords: string[];
```

**禁止出现：** `退款成功`、`已上架`、`排课成功`、`兑换成功` 等（见 §15）。

---

### 5.9 EmptyState

**用途：** 统一空状态。

**建议 props：**

```typescript
interface EmptyStateProps {
  variant: 'no-data' | 'no-results' | 'no-permission' | 'coming-soon' | 'detail-missing' | 'load-error';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**状态包括：** 无数据、筛选无结果、无权限、功能待建设、详情缺失、加载失败 mock。

---

## 6. 样式治理建议

### 6.1 当前问题

- 每个二级页有独立 CSS（7 份，命名空间不统一）；
- 卡片、筛选、摘要、抽屉分区样式重复；
- `V2DrawerEmpty` 组件重复但样式已在 `v2DesignTokens.css`；
- 长列表卡片高度、按钮换行不一致。

### 6.2 建立二级页公共样式文件

**建议路径（二选一）：**

- `components/v2/shared/secondaryPage.css`
- 或 `components/v2/styles/v2SecondaryPatterns.css`

**建议 class 体系：**

```css
.met-v2-secondary-page          /* 页面根容器 */
.met-v2-secondary-header        /* 对应 SecondaryPageHeader */
.met-v2-summary-grid            /* 对应 SummaryMetricGrid */
.met-v2-filter-panel            /* 筛选区容器 */
.met-v2-chip-group              /* 对应 FilterChipGroup */
.met-v2-secondary-tabs          /* 对应 SecondaryTabs */
.met-v2-entity-card             /* 对应 StructuredEntityCard */
.met-v2-risk-panel              /* 对应 RiskNoticePanel */
.met-v2-drawer-section          /* 对应 DrawerSection（可与现有合并） */
.met-v2-action-bar              /* 批量操作 / 卡片按钮区 */
.met-v2-empty-state             /* 对应 EmptyState */
```

**迁移策略：** 新组件先用公共 class；旧页面逐页替换前缀，**每次只迁一个二级页**，build + 截图对比。

### 6.3 保留模块局部 CSS

模块 CSS 只保留：

- 特殊布局（如 7 日周排课时间轴）；
- 业务专属标签色（卡项分类、积分商品类型）；
- 页面独有视觉（课程场次状态条）；
- 一级页样式（不动）。

### 6.4 不建议现在立刻重构 CSS

**明确：当前不建议让 Cursor 大规模重构 CSS。**

应先完成本文档化 → Codex 按 §10 执行顺序分阶段抽取 → 每阶段 build + 截图对比，避免破坏已验收的 7 个 P0 页。

---

## 7. viewModel 与类型命名治理建议

### 7.1 当前命名问题

| 问题 | 示例 |
|------|------|
| 前缀不统一 | `MemberListRow` vs `AssetChangeRequestRow` vs `PointsMallProductRow` |
| Snapshot 构建函数命名不一 | `buildMemberListSnapshot` vs `buildPointsMallSnapshot`（尚可） |
| FilterOption 重复定义 | 7 个文件各自 `XxxFilterOption` |
| OperationLog 重复定义 | 字段相同但类型名不同 |
| drawerDetail 内嵌 Row | 增加列表序列化体积，接 API 时需拆分 |

### 7.2 建议统一命名规范

#### 页面级

| 类型 | 命名模式 | 示例 |
|------|----------|------|
| 页面 snapshot | `XxxSecondarySnapshot` | `MemberListSecondarySnapshot` |
| 摘要项 | `XxxSecondarySummaryItem` | 或共享 `SecondarySummaryItem` |
| 筛选组 | `XxxSecondaryFilterGroup` | 或共享 `SecondaryFilterGroup` |
| Tab | `XxxSecondaryTab` | 或共享 `SecondaryTab` |
| 风险项 | `XxxSecondaryRiskItem` | 或共享 `SecondaryRiskItem` |
| 构建函数 | `buildXxxSecondarySnapshot()` | 固定前缀 `build` + `Secondary` |

#### 列表对象

| 类型 | 命名模式 |
|------|----------|
| 列表行 | `XxxRow` 或 `XxxEntity` |
| 排序函数 | `sortXxxRows(rows)` |

#### 抽屉详情

| 类型 | 命名模式 |
|------|----------|
| 抽屉详情 | `XxxDrawerDetail` |
| 抽屉分区 | `XxxDrawerSection`（可选，或用组件 props） |
| 操作日志 | `OperationLogEntry`（**共享**） |
| 时间线 | `TimelineItem`（**共享**） |
| 证据项 | `EvidenceItem`（**共享**） |

#### 状态枚举

| 类型 | 命名模式 |
|------|----------|
| 业务状态 | `XxxStatus` |
| 风险等级 | `RiskLevel`（共享：`P0` / `P1` / `P2` / `normal`） |
| 证据状态 | `EvidenceStatus`（共享） |
| 审批状态 | `ApprovalStatus`（按业务扩展） |

### 7.3 分层原则

```
API Response (DTO)
    ↓ adapter
ViewModel (前端展示层)
    ↓ props
React Components
```

- **不要每个页面随意命名** — 新增 P1 页前先查共享类型是否可复用。
- **viewModel 是展示层，不是 DTO** — 接接口时写 `adapters/xxxAdapter.ts`，页面不直接依赖后端字段名。
- **mock 数据** 保留在 `buildXxxSecondarySnapshot()`，与 adapter 输出结构对齐，便于切换。

### 7.4 建议新增共享类型文件

```text
components/v2/shared/types/
  secondaryCommon.types.ts    # SummaryItem, FilterOption, RiskItem, OperationLog, EvidenceItem, RiskLevel
  drawerCommon.types.ts         # DrawerSectionRow, TimelineItem
  mockAction.types.ts           # MockActionLabel, ForbiddenSuccessWord
```

---

## 8. 未来接口契约建议

接真实接口前需要准备以下内容（本文档定义契约方向，不实施）。

### 8.1 通用字段

所有二级页列表对象建议具备：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 业务主键 |
| `storeId` | string | 门店 ID |
| `storeName` | string | 门店名称 |
| `createdAt` | ISO string | 创建时间 |
| `updatedAt` | ISO string | 更新时间 |
| `ownerId` | string? | 负责人 ID |
| `ownerName` | string? | 负责人姓名 |
| `status` | enum | 业务状态 |
| `riskLevel` | enum? | P0 / P1 / P2 / normal |
| `tags` | string[] | 展示标签 |
| `suggestedAction` | string | 建议下一动作 |
| `operationLogs` | OperationLogEntry[] | 最近操作（列表可截断） |

### 8.2 分页与筛选

列表接口建议统一 query：

| 参数 | 说明 |
|------|------|
| `page` | 页码，从 1 开始 |
| `pageSize` | 20 / 50 |
| `keyword` | 名称 / 单号搜索 |
| `storeId` | 门店 |
| `status` | 状态 |
| `riskLevel` | 风险等级 |
| `ownerId` | 负责人 |
| `dateRange` | `start` / `end` |
| `sortBy` | 排序字段 |
| `sortDirection` | `asc` / `desc` |

响应建议：`{ items, total, page, pageSize, summary? }` — `summary` 可驱动 `SummaryMetricGrid`。

### 8.3 权限与脱敏

接口或 BFF 层返回权限元数据：

| 字段 | 说明 |
|------|------|
| `role` | 当前用户角色 |
| `dataScope` | `allStores` / `singleStore` / `self` |
| `fieldMasking` | 字段脱敏规则（如手机号中间 4 位） |
| `canView` | 是否可见该对象 |
| `canEdit` | 是否可编辑 |
| `canApprove` | 是否可审批 |
| `canExport` | 是否可导出 |
| `canAssign` | 是否可分配负责人 |

**前端：** 无权限时渲染 `EmptyState variant="no-permission"`，不隐藏路由入口（由路由守卫处理）。

### 8.4 操作日志

所有写入动作（未来）需记录：

| 字段 | 说明 |
|------|------|
| `operatorId` | 操作者 ID |
| `operatorName` | 操作者姓名 |
| `action` | 动作类型 |
| `objectType` | 对象类型 |
| `objectId` | 对象 ID |
| `beforeState` | 变更前状态 JSON |
| `afterState` | 变更后状态 JSON |
| `note` | 备注 |
| `createdAt` | 操作时间 |

mock 阶段：`OperationLogEntry` 展示占位，不写库。

### 8.5 审批状态机

适用于：退费 / 冻结 / 转卡、老师端申请、卡项配置、积分商城配置、合同模板绑定。

**必须单独设计后端状态机**，不能只靠前端按钮切换状态。

建议共有节点：

```text
draft → submitted → evidencePending → pendingReview → approved / rejected → completedMock
```

前端只展示状态 + 可用操作（由 `canApprove` 等控制），不本地篡改终态。

---

## 9. 路由评估建议

### 9.1 当前暂不改路由

**原因总结：**

1. `App.tsx` 使用 `activeNav` state，无 URL 体系；改造需引入路由库 + 改造 `SidebarV2` + 角色默认导航。
2. mock 阶段无深链刚需，截图验收不依赖 URL。
3. 组件规范未确立时改路由，会同时面对「路由重构 + 组件抽取」双线风险。
4. 7 个二级页已验证 IA，路由化是工程化步骤而非产品验证步骤。

### 9.2 未来路由建议

**一级路由（与左侧导航对齐）：**

```text
/dashboard              # 经营总览 dashboard-v2
/today                  # 今日运营
/members                # 会员经营 overview
/members/list
/members/high-balance
/courses                # 课程与排课 overview
/courses/week-schedule
/staff                  # 师资与团队 overview
/staff/applications
/finance                # 财务与资产 overview
/finance/asset-changes
/product-rights         # 产品与权益 overview
/product-rights/cards
/product-rights/points-mall
/marketing              # 活动与获客
/settings               # 系统设置
```

**实现建议（阶段 C）：**

- 一级路由对应现有 `*V2Page.tsx`，内部用 `<Routes>` 或继续 state + `useParams` 同步；
- 或扁平化：每个二级页独立 route component，一级页只作 layout wrapper；
- query params 承载筛选：`/members/list?stage=S3&risk=P0&store=binjiang`。

### 9.3 路由与权限关系

| 原则 | 说明 |
|------|------|
| 路由 ≠ 权限 | 路由控制「能否进入页面」；权限控制「看到什么数据、能点什么按钮」 |
| 投资人 | 不应进入会员名单、排课处理、老师申请、资产变更等**处理页** |
| 老师 | 仅可见自己的课程 / 申请 / 名下会员必要信息 |
| 财务 | 可进资产变更；**不能**操作排课 |
| 店长 | 可处理会员 / 排课 / 申请；**不能**改卡项价格和退费规则 |
| 总部 / 运营 | 产品权益配置；审批权限按状态机 |

**mock 阶段：** 路由守卫可先写死角色表；接真实权限后替换为接口返回的 `allowedRoutes`。

### 9.4 路由切换时机

| 时机 | 建议 |
|------|------|
| P1 做完 1–2 个后 | 评估是否引入嵌套路由（约 9–10 个二级页时） |
| 准备接真实接口前 | **必须**有 URL + query，便于服务端分页筛选 |
| 准备让外部用户长期使用 | 需要书签、刷新、分享链接 |
| 二级页 > 10 个 | 强烈建议路由化，否则宿主文件不可维护 |

---

## 10. 组件治理执行顺序

### 阶段 1：文档与组件边界确认 ✅

- 本文档完成；
- 与 `MET_YOGA_PC_ADMIN_V2_P0_SECONDARY_PAGES_ARCHIVE.md` 对齐；
- 产品 / 开发确认不再无限堆 mock。

### 阶段 2：抽取只读基础组件

**优先顺序：**

1. `SecondaryPageHeader`
2. `SummaryMetricGrid`
3. `FilterChipGroup` + `FilterPanel`（搜索 + 重置容器）
4. `SecondaryTabs`
5. `RiskNoticePanel`
6. `DrawerSection`
7. `EmptyState` + `DrawerEmptyState`（替换重复 `V2DrawerEmpty`）

**目录建议：**

```text
components/v2/shared/
  SecondaryPageHeader.tsx
  SummaryMetricGrid.tsx
  FilterChipGroup.tsx
  SecondaryTabs.tsx
  RiskNoticePanel.tsx
  DrawerSection.tsx
  EmptyState.tsx
  secondaryPage.css
  types/secondaryCommon.types.ts
  index.ts
```

**执行规则：** 每次只抽 1 个组件族 → 选 1 个二级页试点替换 → `npm run build` → 截图对比 → 再推广到其他 6 页。

### 阶段 3：抽取结构化列表 / 卡片

1. `StructuredEntityCard`
2. `ActionGroup`
3. `BatchActionBar`
4. `EvidenceTagList`
5. `OperationLogList`
6. `TimelineList`

### 阶段 4：统一 mock action

1. `mockActions.ts` — `showMockToast`、`mockActionLabels`
2. `forbiddenSuccessWords` — CI 或 lint 检查（可选）
3. `MockActionButton` 组件
4. 统一提交审核 copy

### 阶段 5：评估路由化

1. 选定路由库（React Router 等）；
2. 明确 path 表（§9.2）；
3. 明确返回路径与 breadcrumb 生成规则；
4. query params 与筛选映射；
5. 路由级权限守卫；
6. 一级模块入口保持兼容（左侧导航不变）。

### 阶段 6：接口契约与 adapter

1. 定义 OpenAPI / DTO 草案；
2. 实现 `adapters/*Adapter.ts`；
3. 替换 `buildXxxSecondarySnapshot` 为 `fetchXxxSecondary` + fallback mock；
4. 接入分页、筛选、权限、操作日志；
5. 审批对接后端状态机。

---

## 11. P1 页面是否继续做？

### 路线 A：继续做 1–2 个高价值 P1 页面

**建议只做：**

| 顺序 | P1 页面 | 价值 |
|:----:|---------|------|
| 1 | **线索池** | 补齐获客上游，会员经营闭环向上延伸 |
| 2 | **操作日志** | 全局审计底层，后续所有写入动作可挂接 |

**原因：**

- 线索池补全「获客 → 会员」链路；
- 操作日志是真实系统必备，mock 版可验证全局审计 IA；
- 这两个对后续真实系统**架构价值最高**。

**不建议**现在一口气做完全部 P1（活动详情、合同模板、财务证据链、老师档案、排课规则等 5 个）。

**若做 P1：** 仍用模块内部视图；**必须先复用阶段 2 已抽取的共享组件**，禁止再复制第 8 套完整 CSS。

### 路线 B：先进入 Codex 组件治理

**适合：**

- 准备工程化落地；
- 担心重复样式与宿主膨胀；
- 准备接接口；
- 希望后续页面更稳定。

### 推荐判断

| 目标 | 建议 |
|------|------|
| 继续看完整产品体验 | 用 Cursor 做**线索池** 1 页；使用共享组件 |
| 准备 Codex / 开发接手 | **先做组件治理（路线 B）**，再 P1 |
| 两者兼顾 | 阶段 2 抽完 Header + Summary + Filter 后，Cursor 做线索池；Codex 并行抽卡片与抽屉 |
| **不建议** | 在无共享组件情况下继续无限堆页面 |

---

## 12. Codex 执行建议

> **给 Codex 的方向说明（可直接复制为任务描述）：**

Codex **不要重做页面，不要改业务结构**。

Codex **应做：**

1. 读取当前 P0 一级页和 P0 二级页实现；
2. **保留**现有视觉层级与业务 IA（判断层 → 处理层 → 抽屉层）；
3. 按 §10 阶段 2–4 **抽取通用二级页组件**到 `components/v2/shared/`；
4. 建立 `v2SecondaryPatterns.css`，**逐页迁移**前缀，不大规模一次性替换；
5. **保留 mock 数据**与 viewModel 结构，只调整 props 对接；
6. **不修改**一级页入口逻辑、左侧导航、`App.tsx`（阶段 5 前）；
7. **不接真实接口**；
8. **每次只抽一个组件族**，build 通过后截图对比；
9. 统一 `OperationLogEntry`、`EvidenceItem`、`RiskLevel` 等共享类型；
10. 删除各宿主页面重复的 `V2DrawerEmpty`，改为共享 `EmptyState`；
11. **不允许**回退成表格后台、Excel 大表、CRM 风格。

Codex **不应做：**

- 改 Hero 结论逻辑；
- 改业务红线文案；
- 引入真实成功态；
- 一次性重构全部 7 页 CSS；
- 未评审情况下改 `App.tsx` 路由。

---

## 13. Cursor 执行建议

Cursor **后续适合：**

- 在共享组件就绪后，继续做**线索池** mock（单页）；
- 局部调整页面文案与 disclaimer；
- 补充一级页 → 二级页入口；
- 修复明显视觉错位；
- 按截图验收清单微调；
- 输出验收文档。

Cursor **不适合：**

- 大规模组件重构（易漏页、破坏已验收视觉）；
- 同时改路由 + 组件 + mock 数据；
- 一次性迁移 7 页 CSS；
- 接真实接口。

---

## 14. 风险与注意事项

| # | 风险 | 处理建议 |
|:-:|------|----------|
| 1 | **过早路由化** | 阶段 A 保持模块内视图；组件规范 + adapter 就绪后再路由化 |
| 2 | **继续堆 mock 页面** | P1 限 1–2 页；新页必须用共享组件 |
| 3 | **大规模 CSS 重构** | 逐页迁移；每页 build + 截图；保留模块局部 CSS |
| 4 | **组件抽取破坏视觉** | 先抽只读展示组件；不改变 DOM 层级与间距 token |
| 5 | **接口字段不统一** | 先定 §8 通用字段 + 共享类型，再写 adapter |
| 6 | **权限后补** | 路由化时预留 `canView` / `canEdit`；角色表先文档化 |
| 7 | **审批状态机后补** | 前端不本地改终态；mock 只展示状态标签 |
| 8 | **业务红线丢失** | 组件抽取时保留 `disclaimer` / `RiskNoticePanel` 槽位；禁止词进 `forbiddenSuccessWords` |

---

## 15. 禁止回退规则

以下规则在组件治理与路由化过程中**不得回退**：

### 结构与导航

- 不要把一级页改回报表 / 数字墙
- 不要把二级页改成 Excel 大表
- 不要新增左侧二级菜单

### 会员域

- 不要把会员名单做成电话销售 CRM
- 不要把高余额低耗课写成退费金额表

### 财务域

- 不要把退费 / 冻结 / 转卡做成真实退款系统（mock 阶段）

### 课程域

- 不要把完整周排课做成传统排课 CRUD

### 师资域

- 不要把老师端申请做成员工审批通讯录

### 产品权益域

- 不要把卡项配置做成电商商品后台
- 不要把积分商城做成电商后台

### 通用红线

- 不要出现 AI 推荐
- 不要自动群发
- 不要暴露敏感信息（完整手机号、身份证、住址、银行卡）
- 不要显示老师工资或课时费
- 不要把积分当现金
- 不要把赠送权益计入退费
- 不要混淆实收、确认收入、预收负债、经营利润

### 禁止出现的真实成功态文案

- 退款成功
- 排课成功
- 已上架
- 已发布会员端
- 已通知会员
- 已同步老师端
- 库存更新成功
- 兑换成功
- 商品创建成功
- 已到账
- 审批已通过（须为「已通过 mock」或「待建设」）

---

## 16. 完成检查

| 检查项 | 状态 |
|--------|:----:|
| 只新增 / 更新 `docs/MET_YOGA_PC_ADMIN_V2_COMPONENT_AND_ROUTING_GOVERNANCE_PLAN.md` | ✅ |
| 不修改任何页面代码（`components/*`） | ✅ |
| 不修改 CSS | ✅ |
| 不修改 viewModel | ✅ |
| 不修改 `App.tsx` | ✅ |
| 不修改导航（`sidebarV2.config.ts`） | ✅ |
| 不修改角色逻辑（`roleView.types.ts`） | ✅ |

---

## 附录 A：当前代码重复点速查

| 重复点 | 出现位置 | 治理目标 |
|--------|----------|----------|
| `V2DrawerEmpty` 函数组件 | Member / Finance / Staff / ProductRights 宿主页 | `EmptyState` / `DrawerEmptyState` |
| 二级页头部结构 | 7 个 `*Secondary*Page.tsx` | `SecondaryPageHeader` |
| 摘要数字卡 grid | 7 个 `*Secondary*.css` | `SummaryMetricGrid` + `.met-v2-summary-grid` |
| chip 筛选 | 7 个二级页 | `FilterChipGroup` |
| toast `（待建设）` | 全模块散落 | `mockActions.ts` |
| `OperationLog` 类型 | 多个 viewModel | `OperationLogEntry` 共享类型 |
| 抽屉 section  markup | 各 `*V2Page.tsx` 抽屉 | `DrawerSection` |

## 附录 B：相关文档阅读顺序

1. `MET_YOGA_PC_ADMIN_V2_TEMPLATE_ARCHIVE.md` — 一级母版
2. `MET_YOGA_PC_ADMIN_V2_P0_SECONDARY_PAGES_ARCHIVE.md` — P0 二级页验收
3. **本文档** — 组件治理与路由评估
4. `MET_YOGA_PC_ADMIN_V2_SECONDARY_PAGES_PLAN.md` — P1/P2 页面 backlog

---

*本文档为工程化规划，不包含代码变更。组件抽取与路由实施应另开任务，按 §10 阶段顺序执行，每阶段独立验收。*
