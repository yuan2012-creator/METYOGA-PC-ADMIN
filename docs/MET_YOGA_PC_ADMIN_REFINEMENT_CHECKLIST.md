# MET YOGA PC 后台｜全盘功能蓝图收口与精修清单

> 本文档用于蓝图阶段收口后的后续精修跟踪；**不继续新增大功能**为前提，优先 IA、文案边界、口径一致性与工程可维护性。

---

## 1. 当前已完成阶段

- **第一阶段：课程运营闭环**
- **第二阶段：会员经营闭环**
- **第三阶段：产品与合同闭环**
- **第四阶段：财务闭环入口**
- **第五阶段：师资与规则闭环入口**
- **第六阶段：经营总览 / 投资测算 / 合作授权入口**

---

## 2. 当前已覆盖一级模块

- 经营总览
- 今日运营
- 会员经营
- 课程运营
- 产品与合同
- 财务管理
- 师资与团队
- 规则配置
- 投资测算
- 合作授权
- 门店管理
- 活动运营
- 数据中心

> **说明（与侧栏对齐）**：侧栏一级导航以 `App.tsx` 中 `navItems` 为准；其中「今日运营」与「合作授权」当前主要为**能力覆盖**（如今日课程执行面板、经营总览内合作授权治理区块），是否升级为**独立一级入口**见第 3 节精修项。

---

## 3. 当前不阻断但需后续精修的问题

- **今日运营是否独立一级入口**（现多落在课程运营 + 经营总览「今日待办」等组合心智）。
- **合作授权是否独立一级入口**（现落在经营总览子区块）。
- **会员经营是否需要补显性的闭环入口**（与财务「闭环入口」叙事对齐程度）。
- **Mall 资产状态文案「已发放」是否改为「模块内已生成资产记录」**（或等价表述，避免误读为真实发放完成）。
- **财务、经营总览、产品与合同金额口径是否统一**（展示用语、小数位、「演示 / 待核对 / 模块内」前缀策略）。
- **表格空状态是否统一**（占位文案、操作引导、视觉样式）。
- **裸技术 id 是否统一收口**（列表/详情中订单号、合同号、会员 id 等展示策略）。
- **风险提示口径是否统一**（风险等级、颜色、与「仅用于经营/授权判断」类声明的搭配）。
- **mock / 模块内估算 / 待接入真实服务文案是否统一**（grep 巡检 + 组件顶部 disclosure 模板）。
- **大型 selector 文件是否后续拆分**（按域或按页面边界拆包，控制单文件行数）。
- **重复 formatMoney / 表格壳 / 状态标签是否后续抽公共组件**（小步抽取，避免大范围重构）。

---

## 4. 当前未提交改动归类

以下为先执行 `git status` 的**原始输出**（便于对照工作区；后续提交前请重新执行一次核对）。

```text
On branch cursor-restart-admin-ui
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   components/Courses.tsx
	modified:   components/Mall.tsx
	modified:   components/courses/CourseSessionOpsDrawer.tsx
	modified:   components/mall/MallAssetDetailDrawer.tsx
	modified:   components/mall/MallFreezeRequestDrawer.tsx
	modified:   components/mall/MallRefundRequestDrawer.tsx
	modified:   utils/mallFreezeRequest.ts
	modified:   utils/mallSelectors.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	components/mall/MallTransferRequestDrawer.tsx
	utils/mallTransferRequest.ts

no changes added to commit (use "git add" and/or "git commit -a")
```

### 归类表（建议）

| 归类 | 路径 | 建议 |
|------|------|------|
| 产品与合同 / Mall | `components/Mall.tsx` | 单独 PR：订单 / 资产 / 抽屉联动 |
| 产品与合同 / Mall | `components/mall/MallAssetDetailDrawer.tsx` | 同上域 |
| 产品与合同 / Mall | `components/mall/MallFreezeRequestDrawer.tsx` | 冻结请求（演示或草稿流） |
| 产品与合同 / Mall | `components/mall/MallRefundRequestDrawer.tsx` | 退款请求（演示或草稿流） |
| 产品与合同 / Mall | `components/mall/MallTransferRequestDrawer.tsx` | **未跟踪**；转卡请求，与 Mall PR 同批纳入 |
| 产品与合同 / Mall | `utils/mallSelectors.ts` | 与文案「已发放」精修可同 PR |
| 产品与合同 / Mall | `utils/mallFreezeRequest.ts` | 冻结校验 / 草稿工具 |
| 产品与合同 / Mall | `utils/mallTransferRequest.ts` | **未跟踪**；转卡草稿键位等 |
| 课程运营 | `components/Courses.tsx` | 可与 `CourseSessionOpsDrawer` 同 PR 或独立小 PR |
| 课程运营 | `components/courses/CourseSessionOpsDrawer.tsx` | 场次运营抽屉微调 |

---

## 文档版本

| 版本 | 说明 |
|------|------|
| v1（重生成） | 按全盘蓝图收口结构重写；含 `git status` 快照与归类表 |
