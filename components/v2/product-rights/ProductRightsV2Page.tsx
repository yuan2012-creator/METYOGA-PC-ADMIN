import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildProductRightsV2Snapshot,
  getProductRightsPriorityClass,
  getProductRightsStatusClass,
  type ProductCardSummary,
  type ProductRightsConfigDomain,
  type ProductRightsDetailEntry,
  type ProductRightsPriorityAction,
  type MallProductSummary,
} from './productRightsV2.viewModel';
import ProductRightsSecondaryCardConfigPage from './ProductRightsSecondaryCardConfigPage';
import ProductRightsSecondaryPointsMallPage from './ProductRightsSecondaryPointsMallPage';
import {
  buildCardConfigSnapshot,
  getCardConfigDrawerDetail,
  type CardConfigDrawerDetail,
  type NewCardConfigDraft,
} from './productRightsSecondaryCardConfig.viewModel';
import {
  buildPointsMallSnapshot,
  getPointsMallDrawerDetail,
  type PointsMallProductDrawerDetail,
  type NewPointsMallProductDraft,
} from './productRightsSecondaryPointsMall.viewModel';
import './productRightsV2.css';
import './productRightsSecondaryCardConfig.css';
import './productRightsSecondaryPointsMall.css';

type ProductRightsPageViewMode = 'overview' | 'cardConfig' | 'pointsMall';

const NEW_CARD_STEPS = [
  '基础信息',
  '权益配置',
  '预约规则',
  '退费 / 冻结 / 转卡',
  '合同绑定',
  '会员端预览',
  '提交 mock',
] as const;

const NEW_POINTS_MALL_STEPS = [
  '基础信息',
  '积分与库存',
  '兑换规则',
  '领取 / 核销规则',
  '会员端预览',
  '提交 mock',
] as const;

function V2DrawerEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="met-v2-drawer-empty">
      <h3 className="met-v2-drawer-empty__title">暂无详情</h3>
      <p className="met-v2-drawer-empty__desc">当前记录缺少详情数据，请检查 mock 配置</p>
      <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
        关闭
      </button>
    </div>
  );
}

function CardDetailDrawer({
  detail,
  onClose,
  onToast,
  onEdit,
}: {
  detail: CardConfigDrawerDetail;
  onClose: () => void;
  onToast: (message: string) => void;
  onEdit: () => void;
}) {
  return (
    <>
      <button type="button" className="met-v2-drawer-overlay" aria-label="关闭卡项详情" onClick={onClose} />
      <aside className="met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog">
        <div className="met-v2-drawer-header">
          <div>
            <h2 className="met-v2-drawer-title">{detail.drawerTitle}</h2>
            <p className="met-v2-drawer-subtitle">{detail.cardName} · {detail.statusLabel}</p>
          </div>
          <button type="button" className="met-v2-drawer-close" aria-label="关闭" onClick={onClose}>×</button>
        </div>
        <div className="met-v2-drawer-body">
          <section className="met-product-rights-v2-drawer-section">
            <h3>卡项概览</h3>
            <div className="met-product-rights-v2-drawer-row"><span>卡项 ID</span><span>{detail.cardTypeId}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>卡项名称</span><span>{detail.cardName}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>卡项分类</span><span>{detail.cardCategoryLabel}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>当前状态</span><span>{detail.statusLabel}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>售价</span><span>{detail.price}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>总权益</span><span>{detail.pointsTotal}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>有效期</span><span>{detail.validityDays}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>适用门店</span><span>{detail.applicableStores}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>销售渠道</span><span>{detail.salesChannel}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>创建人</span><span>{detail.createdBy}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>更新时间</span><span>{detail.updatedAt}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>权益规则</h3>
            <div className="met-product-rights-v2-drawer-row"><span>可用课程类型</span><span>{detail.applicableCourses}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>扣点规则</span><span>{detail.pointDeductionRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>是否通馆</span><span>{detail.crossStoreAllowed ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>跨店结算</span><span>{detail.crossStoreSettlement ? '支持' : '不支持'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>含赠送权益</span><span>{detail.giftBenefitIncluded ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>赠送权益说明</span><span>{detail.giftBenefitNote}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>主权益关系</span><span>{detail.giftBenefitRelation}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>预约与取消规则</h3>
            <div className="met-product-rights-v2-drawer-row"><span>预约窗口</span><span>{detail.bookingWindow}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>取消时限</span><span>{detail.cancelDeadline}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>爽约规则</span><span>{detail.noShowRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>请假规则</span><span>{detail.leaveRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>最低开班</span><span>{detail.minClassRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>候补规则</span><span>{detail.waitlistRule}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>退费 / 冻结 / 转卡规则</h3>
            <div className="met-product-rights-v2-drawer-row"><span>支持退费</span><span>{detail.refundSupported ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>退费规则 ID</span><span>{detail.refundRuleId}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>退费规则</span><span>{detail.refundRuleSummary}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>手续费规则</span><span>{detail.serviceFeeRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>赠送权益计入退费</span><span>{detail.giftBenefitInRefund}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>积分是否折现</span><span>{detail.pointsCashOut}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>支持冻结</span><span>{detail.freezeAllowed ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>冻结条件</span><span>{detail.freezeCondition}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>支持转卡</span><span>{detail.transferAllowed ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>转卡手续费</span><span>{detail.transferFeeRule}</span></div>
            <p className="met-card-config__disclaimer" style={{ marginTop: 8 }}>店长不可直接修改价格与退费规则，需提交调整申请 mock。</p>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>合同绑定</h3>
            <div className="met-product-rights-v2-drawer-row"><span>合同模板 ID</span><span>{detail.contractTemplateId || '—'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>合同模板名称</span><span>{detail.contractTemplateName}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>版本号</span><span>{detail.contractVersion}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>绑定状态</span><span>{detail.contractBindingStatusLabel}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>关键条款</span><span>{detail.keyClauses}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>会员端签署</span><span>{detail.memberSignStatus}</span></div>
            <p className="met-card-config-drawer__risk">{detail.contractRiskNote}</p>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>会员端展示预览</h3>
            <div className="met-card-config-drawer__preview">
              <p className="met-card-config-drawer__preview-title">只读预览</p>
              <div className="met-product-rights-v2-drawer-row"><span>卡项名称</span><span>{detail.previewName}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>售价</span><span>{detail.previewPrice}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>权益说明</span><span>{detail.previewBenefit}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>有效期</span><span>{detail.previewValidity}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>预约窗口</span><span>{detail.previewBookingWindow}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>适用课程</span><span>{detail.previewCourses}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>重要条款</span><span>{detail.previewClauseHint}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>会员端展示</span><span>{detail.visibleOnMemberApp ? '展示' : '隐藏'}</span></div>
            </div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>积分与赠送权益</h3>
            <div className="met-product-rights-v2-drawer-row"><span>开卡积分</span><span>{detail.openingPointsReward}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>消课积分</span><span>{detail.consumptionPointsRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>积分扣回规则</span><span>{detail.pointsDeductOnRefund}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>赠送权益激活</span><span>{detail.giftActivationRule}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>赠送权益有效期</span><span>{detail.giftValidity}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>赠送权益退费</span><span>{detail.giftRefundNote}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>操作日志</h3>
            {detail.operationLogs.map(log => (
              <div key={log.id} className="met-card-config-drawer__log-item">
                <strong>{log.operator}</strong> · {log.time} · {log.action}
                <br />
                {log.note}
              </div>
            ))}
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>风险提示</h3>
            <p className="met-card-config-drawer__risk">{detail.riskReminder}</p>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>建议动作</h3>
            <p>{detail.suggestedAction}</p>
          </section>

          <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('编辑卡项配置（待建设）')}>编辑配置</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('绑定合同模板（待建设）')}>绑定合同</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={onEdit}>新增 / 编辑 mock</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('提交审核（待建设）')}>提交审核</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NewCardDrawer({
  draft,
  disclaimer,
  submitToast,
  saveDraftToast,
  onClose,
  onToast,
}: {
  draft: NewCardConfigDraft;
  disclaimer: string;
  submitToast: string;
  saveDraftToast: string;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [step, setStep] = useState(0);

  return (
    <>
      <button type="button" className="met-v2-drawer-overlay" aria-label="关闭新增卡项" onClick={onClose} />
      <aside className="met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog">
        <div className="met-v2-drawer-header">
          <div>
            <h2 className="met-v2-drawer-title">新增 / 编辑卡项</h2>
            <p className="met-new-card-drawer__disclaimer">{disclaimer}</p>
          </div>
          <button type="button" className="met-v2-drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="met-v2-drawer-body">
          <div className="met-new-card-drawer__steps">
            {NEW_CARD_STEPS.map((label, i) => (
              <button key={label} type="button" className={['met-new-card-drawer__step', step === i ? 'is-active' : ''].join(' ')} onClick={() => setStep(i)}>
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 1：基础信息</h3>
              <div className="met-new-card-drawer__row"><span>卡项名称</span><span>{draft.cardName}</span></div>
              <div className="met-new-card-drawer__row"><span>卡项分类</span><span>{draft.cardCategory}</span></div>
              <div className="met-new-card-drawer__row"><span>售价</span><span>{draft.price}</span></div>
              <div className="met-new-card-drawer__row"><span>销售渠道</span><span>{draft.salesChannel}</span></div>
              <div className="met-new-card-drawer__row"><span>适用门店</span><span>{draft.applicableStores}</span></div>
              <div className="met-new-card-drawer__row"><span>会员端展示</span><span>{draft.visibleOnMemberApp ? '展示' : '隐藏'}</span></div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 2：权益配置</h3>
              <div className="met-new-card-drawer__row"><span>总点数 / 次数</span><span>{draft.pointsTotal}</span></div>
              <div className="met-new-card-drawer__row"><span>有效期</span><span>{draft.validityDays}</span></div>
              <div className="met-new-card-drawer__row"><span>可用课程类型</span><span>{draft.applicableCourses}</span></div>
              <div className="met-new-card-drawer__row"><span>扣点规则</span><span>{draft.pointDeductionRule}</span></div>
              <div className="met-new-card-drawer__row"><span>是否通馆</span><span>{draft.crossStoreAllowed ? '是' : '否'}</span></div>
              <div className="met-new-card-drawer__row"><span>跨店结算</span><span>{draft.crossStoreSettlement ? '支持' : '不支持'}</span></div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 3：预约规则</h3>
              <div className="met-new-card-drawer__row"><span>预约窗口</span><span>{draft.bookingWindow}</span></div>
              <div className="met-new-card-drawer__row"><span>取消时限</span><span>{draft.cancelDeadline}</span></div>
              <div className="met-new-card-drawer__row"><span>爽约规则</span><span>{draft.noShowRule}</span></div>
              <div className="met-new-card-drawer__row"><span>请假规则</span><span>{draft.leaveRule}</span></div>
              <div className="met-new-card-drawer__row"><span>候补规则</span><span>{draft.waitlistRule}</span></div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 4：退费 / 冻结 / 转卡规则</h3>
              <div className="met-new-card-drawer__row"><span>退费规则</span><span>{draft.refundRule}</span></div>
              <div className="met-new-card-drawer__row"><span>冻结规则</span><span>{draft.freezeRule}</span></div>
              <div className="met-new-card-drawer__row"><span>转卡规则</span><span>{draft.transferRule}</span></div>
              <div className="met-new-card-drawer__row"><span>手续费规则</span><span>{draft.serviceFeeRule}</span></div>
              <div className="met-new-card-drawer__row"><span>积分扣回</span><span>{draft.pointsDeduct}</span></div>
              <div className="met-new-card-drawer__row"><span>赠送权益处理</span><span>{draft.giftBenefitHandling}</span></div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 5：合同绑定</h3>
              <div className="met-new-card-drawer__row"><span>合同模板</span><span>{draft.contractTemplate}</span></div>
              <div className="met-new-card-drawer__row"><span>合同版本</span><span>{draft.contractVersion}</span></div>
              <div className="met-new-card-drawer__row"><span>关键条款</span><span>{draft.keyClauses}</span></div>
              <div className="met-new-card-drawer__row"><span>重点条款外显</span><span>{draft.clauseHighlight}</span></div>
              <div className="met-new-card-drawer__row"><span>无合同发布</span><span>不允许</span></div>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 6：会员端预览</h3>
              <div className="met-new-card-drawer__preview">
                <div className="met-new-card-drawer__row"><span>卡项名称</span><span>{draft.cardName}</span></div>
                <div className="met-new-card-drawer__row"><span>售价</span><span>{draft.price}</span></div>
                <div className="met-new-card-drawer__row"><span>权益</span><span>{draft.pointsTotal} · {draft.applicableCourses}</span></div>
                <div className="met-new-card-drawer__row"><span>有效期</span><span>{draft.validityDays}</span></div>
                <div className="met-new-card-drawer__row"><span>预约窗口</span><span>{draft.bookingWindow}</span></div>
                <div className="met-new-card-drawer__row"><span>重要条款</span><span>{draft.clauseHighlight}</span></div>
              </div>
            </section>
          ) : null}

          {step === 6 ? (
            <section className="met-new-card-drawer__section">
              <h3 className="met-new-card-drawer__section-title">步骤 7：提交 mock</h3>
              <p className="met-new-card-drawer__disclaimer">提交后仅进入审核 mock 流程，不会真实创建卡项，也不会发布到会员端。</p>
            </section>
          ) : null}

          <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
            <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>取消</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast(saveDraftToast)}>保存草稿（待建设）</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => { onToast(submitToast); onClose(); }}>提交审核（待建设）</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function PointsMallProductDetailDrawer({
  detail,
  onClose,
  onToast,
  onEdit,
}: {
  detail: PointsMallProductDrawerDetail;
  onClose: () => void;
  onToast: (message: string) => void;
  onEdit: () => void;
}) {
  return (
    <>
      <button type="button" className="met-v2-drawer-overlay" aria-label="关闭积分商品详情" onClick={onClose} />
      <aside className="met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog">
        <div className="met-v2-drawer-header">
          <div>
            <h2 className="met-v2-drawer-title">{detail.drawerTitle}</h2>
            <p className="met-v2-drawer-subtitle">{detail.productName} · {detail.shelfStatusLabel}</p>
          </div>
          <button type="button" className="met-v2-drawer-close" aria-label="关闭" onClick={onClose}>×</button>
        </div>
        <div className="met-v2-drawer-body">
          <section className="met-product-rights-v2-drawer-section">
            <h3>商品概览</h3>
            <div className="met-product-rights-v2-drawer-row"><span>商品 ID</span><span>{detail.productId}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>商品名称</span><span>{detail.productName}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>商品类型</span><span>{detail.productTypeLabel}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>当前状态</span><span>{detail.shelfStatusLabel}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>所需积分</span><span>{detail.pointsPrice}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>当前库存</span><span>{detail.stock}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>适用门店</span><span>{detail.applicableStores}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>领取方式</span><span>{detail.deliveryMethod}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>会员端是否展示</span><span>{detail.visibleOnMemberApp ? '展示' : '隐藏'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>创建人</span><span>{detail.createdBy}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>更新时间</span><span>{detail.updatedAt}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>积分与库存规则</h3>
            <div className="met-product-rights-v2-drawer-row"><span>兑换所需积分</span><span>{detail.pointsPrice}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>库存数量</span><span>{detail.stock}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>库存预警线</span><span>{detail.stockWarningLine}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>每人限兑</span><span>{detail.redeemLimit}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>每月限兑</span><span>{detail.monthlyRedeemLimit}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>是否允许重复兑换</span><span>{detail.allowRepeatRedeem ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>积分扣减方式</span><span>{detail.pointsDeductionMethod}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>积分退回规则</span><span>{detail.pointsRefundRule}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>兑换规则</h3>
            <div className="met-product-rights-v2-drawer-row"><span>适用会员</span><span>{detail.applicableMembers}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>兑换有效期</span><span>{detail.redeemValidity}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>是否需要审批</span><span>{detail.redeemApprovalRequired ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>是否需要到店领取</span><span>{detail.requiresPickup ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>是否需要预约</span><span>{detail.requiresReservation ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>兑换后核销方式</span><span>{detail.redeemMethod}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>过期处理</span><span>{detail.expiryHandling}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>适用门店与领取方式</h3>
            <div className="met-product-rights-v2-drawer-row"><span>适用门店</span><span>{detail.applicableStores}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>领取门店</span><span>{detail.pickupStores}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>领取方式</span><span>{detail.deliveryMethod}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>是否支持跨店领取</span><span>{detail.crossStorePickup ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>领取说明</span><span>{detail.pickupNote}</span></div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>审批与核销</h3>
            <div className="met-product-rights-v2-drawer-row"><span>是否需审批</span><span>{detail.redeemApprovalRequired ? '是' : '否'}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>审批人</span><span>{detail.approver}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>核销人</span><span>{detail.writeOffBy}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>核销方式</span><span>{detail.writeOffMethod}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>核销记录</span><span>{detail.writeOffRecordSummary}</span></div>
            <p className="met-card-config-drawer__risk">{detail.approvalRiskNote}</p>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>会员端展示预览</h3>
            <div className="met-card-config-drawer__preview">
              <p className="met-card-config-drawer__preview-title">只读预览</p>
              <div className="met-product-rights-v2-drawer-row"><span>商品名称</span><span>{detail.previewName}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>所需积分</span><span>{detail.previewPoints}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>商品说明</span><span>{detail.previewDescription}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>库存状态</span><span>{detail.previewStockStatus}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>兑换限制</span><span>{detail.previewRedeemLimit}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>适用门店</span><span>{detail.previewStores}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>领取方式</span><span>{detail.previewDelivery}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>重要提示</span><span>{detail.previewImportantNote}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否展示在会员端</span><span>{detail.visibleOnMemberApp ? '展示' : '隐藏'}</span></div>
            </div>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>兑换记录摘要</h3>
            <div className="met-product-rights-v2-drawer-row"><span>累计兑换数</span><span>{detail.totalExchangeCount}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>本月兑换数</span><span>{detail.monthlyExchangeCount}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>待核销数</span><span>{detail.pendingWriteOffCount}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>已核销数</span><span>{detail.writtenOffCount}</span></div>
            <div className="met-product-rights-v2-drawer-row"><span>异常兑换数</span><span>{detail.abnormalExchangeCount}</span></div>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('查看兑换记录（待建设）')}>查看兑换记录</button>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>操作日志</h3>
            {detail.operationLogs.map(log => (
              <div key={log.id} className="met-card-config-drawer__log-item">
                <strong>{log.operator}</strong> · {log.time} · {log.action}
                <br />
                {log.note}
              </div>
            ))}
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>风险提示</h3>
            <p className="met-card-config-drawer__risk">{detail.riskReminder}</p>
          </section>

          <section className="met-product-rights-v2-drawer-section">
            <h3>建议动作</h3>
            <p>{detail.suggestedAction}</p>
          </section>

          <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('编辑积分商品配置（待建设）')}>编辑配置</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('补库存（待建设）')}>补库存</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={onEdit}>新增 / 编辑 mock</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast('上下架操作（待建设）')}>上架 / 下架 mock</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NewPointsMallProductDrawer({
  draft,
  disclaimer,
  submitToast,
  saveDraftToast,
  onClose,
  onToast,
}: {
  draft: NewPointsMallProductDraft;
  disclaimer: string;
  submitToast: string;
  saveDraftToast: string;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [step, setStep] = useState(0);

  return (
    <>
      <button type="button" className="met-v2-drawer-overlay" aria-label="关闭新增积分商品" onClick={onClose} />
      <aside className="met-v2-drawer-panel met-v2-drawer-panel--md" role="dialog">
        <div className="met-v2-drawer-header">
          <div>
            <h2 className="met-v2-drawer-title">新增 / 编辑积分商品</h2>
            <p className="met-new-points-mall-drawer__disclaimer">{disclaimer}</p>
          </div>
          <button type="button" className="met-v2-drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="met-v2-drawer-body">
          <div className="met-new-points-mall-drawer__steps">
            {NEW_POINTS_MALL_STEPS.map((label, i) => (
              <button key={label} type="button" className={['met-new-points-mall-drawer__step', step === i ? 'is-active' : ''].join(' ')} onClick={() => setStep(i)}>
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 ? (
            <section>
              <h3 className="met-new-points-mall-drawer__section-title">步骤 1：基础信息</h3>
              <div className="met-product-rights-v2-drawer-row"><span>商品名称</span><span>{draft.productName}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>商品类型</span><span>{draft.productType}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>商品说明</span><span>{draft.description}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>适用门店</span><span>{draft.applicableStores}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否会员端展示</span><span>{draft.visibleOnMemberApp ? '展示' : '隐藏'}</span></div>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h3 className="met-new-points-mall-drawer__section-title">步骤 2：积分与库存</h3>
              <div className="met-product-rights-v2-drawer-row"><span>所需积分</span><span>{draft.pointsPrice}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>库存数量</span><span>{draft.stock}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>库存预警线</span><span>{draft.stockWarningLine}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>每人限兑</span><span>{draft.redeemLimit}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>每月限兑</span><span>{draft.monthlyRedeemLimit}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否允许重复兑换</span><span>{draft.allowRepeatRedeem ? '是' : '否'}</span></div>
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h3 className="met-new-points-mall-drawer__section-title">步骤 3：兑换规则</h3>
              <div className="met-product-rights-v2-drawer-row"><span>适用会员范围</span><span>{draft.applicableMembers}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>兑换有效期</span><span>{draft.redeemValidity}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否需要审批</span><span>{draft.approvalRequired ? '是' : '否'}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否需要预约</span><span>{draft.requiresReservation ? '是' : '否'}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否需要到店领取</span><span>{draft.requiresPickup ? '是' : '否'}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>过期处理</span><span>{draft.expiryHandling}</span></div>
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h3 className="met-new-points-mall-drawer__section-title">步骤 4：领取 / 核销规则</h3>
              <div className="met-product-rights-v2-drawer-row"><span>领取方式</span><span>{draft.deliveryMethod}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>核销方式</span><span>{draft.writeOffMethod}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>核销人</span><span>{draft.writeOffBy}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>是否支持跨店领取</span><span>{draft.crossStorePickup ? '是' : '否'}</span></div>
              <div className="met-product-rights-v2-drawer-row"><span>领取说明</span><span>{draft.pickupNote}</span></div>
            </section>
          ) : null}

          {step === 4 ? (
            <section>
              <h3 className="met-new-points-mall-drawer__section-title">步骤 5：会员端预览</h3>
              <div className="met-new-points-mall-drawer__preview">
                <strong>{draft.productName}</strong>
                <p>{draft.pointsPrice} · {draft.productType}</p>
                <p>{draft.description}</p>
                <p>库存：{draft.stock} · 限兑：{draft.redeemLimit}</p>
                <p>{draft.pickupNote}</p>
                <p>积分不可折现 · 兑换后不退积分</p>
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section>
              <h3 className="met-new-points-mall-drawer__section-title">步骤 6：提交 mock</h3>
              <p className="met-new-points-mall-drawer__disclaimer">提交后仅进入审核 mock 流程，不会真实创建商品，也不会发布到会员端。</p>
            </section>
          ) : null}

          <div className="met-v2-drawer-footer met-v2-drawer-footer--inline">
            <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>取消</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => onToast(saveDraftToast)}>保存草稿（待建设）</button>
            <button type="button" className="met-v2-drawer-footer-btn" onClick={() => { onToast(submitToast); onClose(); }}>提交审核（待建设）</button>
          </div>
        </div>
      </aside>
    </>
  );
}

const ProductRightsV2Page: React.FC = () => {
  const snapshot = useMemo(() => buildProductRightsV2Snapshot(), []);
  const cardConfigSnapshot = useMemo(() => buildCardConfigSnapshot(), []);
  const pointsMallSnapshot = useMemo(() => buildPointsMallSnapshot(), []);
  const [pageView, setPageView] = useState<ProductRightsPageViewMode>('overview');
  const [pendingNewCard, setPendingNewCard] = useState(false);
  const [pendingNewProduct, setPendingNewProduct] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [cardDrawerId, setCardDrawerId] = useState<string | null>(null);
  const [mallDrawerId, setMallDrawerId] = useState<string | null>(null);
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);

  const showToast = useCallback((message: string) => {
    console.log('[ProductRightsV2]', message);
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? null : current)), 2400);
  }, []);

  const openCardConfig = useCallback((openNewCard = false) => {
    setPendingNewCard(openNewCard);
    setPageView('cardConfig');
  }, []);

  const openPointsMall = useCallback((openNewProduct = false) => {
    setPendingNewProduct(openNewProduct);
    setPageView('pointsMall');
  }, []);

  const backToOverview = useCallback(() => {
    setPageView('overview');
    setPendingNewCard(false);
    setPendingNewProduct(false);
    setCardDrawerId(null);
    setMallDrawerId(null);
    setNewCardOpen(false);
    setNewProductOpen(false);
  }, []);

  const openCardDrawer = useCallback((cardTypeId: string) => {
    setNewCardOpen(false);
    setCardDrawerId(cardTypeId);
  }, []);

  const closeCardDrawer = useCallback(() => setCardDrawerId(null), []);

  const openNewCardDrawer = useCallback(() => {
    setCardDrawerId(null);
    setNewCardOpen(true);
  }, []);

  const closeNewCardDrawer = useCallback(() => setNewCardOpen(false), []);

  const openMallDrawer = useCallback((productId: string) => {
    setNewProductOpen(false);
    setMallDrawerId(productId);
  }, []);

  const closeMallDrawer = useCallback(() => setMallDrawerId(null), []);

  const openNewProductDrawer = useCallback(() => {
    setMallDrawerId(null);
    setNewProductOpen(true);
  }, []);

  const closeNewProductDrawer = useCallback(() => setNewProductOpen(false), []);

  useEffect(() => {
    if (pageView === 'cardConfig' && pendingNewCard) {
      setNewCardOpen(true);
      setPendingNewCard(false);
    }
  }, [pageView, pendingNewCard]);

  useEffect(() => {
    if (pageView === 'pointsMall' && pendingNewProduct) {
      setNewProductOpen(true);
      setPendingNewProduct(false);
    }
  }, [pageView, pendingNewProduct]);

  const cardDrawerDetail = useMemo(() => {
    if (!cardDrawerId) return null;
    return getCardConfigDrawerDetail(cardConfigSnapshot.rows, cardDrawerId);
  }, [cardDrawerId, cardConfigSnapshot.rows]);

  const mallDrawerDetail = useMemo(() => {
    if (!mallDrawerId) return null;
    return getPointsMallDrawerDetail(pointsMallSnapshot.rows, mallDrawerId);
  }, [mallDrawerId, pointsMallSnapshot.rows]);

  const handlePriorityAction = useCallback(
    (item: ProductRightsPriorityAction) => {
      if (item.opensCardConfig) {
        openCardConfig();
        return;
      }
      if (item.opensPointsMall) {
        openPointsMall();
        return;
      }
      showToast(item.actionToast);
    },
    [openCardConfig, openPointsMall, showToast],
  );

  const handleConfigDomain = useCallback(
    (domain: ProductRightsConfigDomain) => {
      if (domain.opensCardConfig) {
        openCardConfig();
        return;
      }
      if (domain.opensPointsMall) {
        openPointsMall();
        return;
      }
      showToast(domain.actionToast);
    },
    [openCardConfig, openPointsMall, showToast],
  );

  const handleDetailEntry = useCallback(
    (entry: ProductRightsDetailEntry) => {
      if (entry.opensCardConfig) {
        openCardConfig();
        return;
      }
      if (entry.opensPointsMall) {
        openPointsMall();
        return;
      }
      showToast(entry.actionToast);
    },
    [openCardConfig, openPointsMall, showToast],
  );

  const {
    meta,
    healthSummary,
    priorityActions,
    configDomains,
    cardProducts,
    cardProductsViewAllLabel,
    pointsMallViewAllLabel,
    pointsMallSummary,
    mallProducts,
    rightsGuardrails,
    permissionBoundaries,
    detailEntries,
  } = snapshot;

  const renderCardProduct = (card: ProductCardSummary) => (
    <article
      key={card.cardTypeId}
      className="met-product-rights-v2-card met-product-rights-v2-card--product met-product-rights-v2-card--clickable"
      role="button"
      tabIndex={0}
      onClick={() => openCardConfig()}
      onKeyDown={e => { if (e.key === 'Enter') openCardConfig(); }}
    >
      <div className="met-product-rights-v2-card__head">
        <h3 className="met-product-rights-v2-card__title">{card.cardName}</h3>
        <span className="met-product-rights-v2-card__badge">{card.statusLabel}</span>
      </div>
      <p className="met-product-rights-v2-card__type">{card.cardCategoryLabel}</p>
      <div className="met-product-rights-v2-card__hero">
        <div className="met-product-rights-v2-card__hero-item">
          <span>价格</span>
          <strong>{card.price}</strong>
        </div>
        <div className="met-product-rights-v2-card__hero-item">
          <span>点数</span>
          <strong>{card.pointsTotal}</strong>
        </div>
      </div>
      <div className="met-product-rights-v2-card__tags">
        {card.contractBindingLabel ? (
          <span className="met-product-rights-v2-card__tag">合同 {card.contractBindingLabel}</span>
        ) : null}
        <span className="met-product-rights-v2-card__tag">
          会员端 {card.visibleOnMemberApp ? '显示' : '隐藏'}
        </span>
      </div>
      <div className="met-product-rights-v2-card__fields">
        <div><span>有效期</span><strong>{card.validityDays}</strong></div>
        {card.bookingWindowDays ? (
          <div><span>预约窗口</span><strong>{card.bookingWindowDays}</strong></div>
        ) : null}
        <div><span>适用门店</span><strong>{card.applicableStores}</strong></div>
      </div>
      {card.ruleNotes?.length ? (
        <ul className="met-product-rights-v2-card__notes">
          {card.ruleNotes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );

  const renderMallProduct = (product: MallProductSummary) => (
    <article
      key={product.productId}
      className={[
        'met-product-rights-v2-card',
        'met-product-rights-v2-card--mall',
        'met-product-rights-v2-card--clickable',
        product.shelfStatus === 'soldOut' ? 'is-sold-out' : '',
      ].join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => openPointsMall()}
      onKeyDown={e => { if (e.key === 'Enter') openPointsMall(); }}
    >
      <div className="met-product-rights-v2-card__head">
        <h3 className="met-product-rights-v2-card__title">{product.productName}</h3>
        <span className={`met-product-rights-v2-card__badge${product.shelfStatus === 'soldOut' ? ' is-warn' : ''}`}>
          {product.shelfStatusLabel}
        </span>
      </div>
      <p className="met-product-rights-v2-card__type">{product.productTypeLabel}</p>
      <div className="met-product-rights-v2-card__hero met-product-rights-v2-card__hero--single">
        <div className="met-product-rights-v2-card__hero-item">
          <span>所需积分</span>
          <strong>{product.pointsPrice}</strong>
        </div>
      </div>
      <div className="met-product-rights-v2-card__fields">
        <div><span>库存</span><strong>{product.stock}</strong></div>
        <div><span>兑换方式</span><strong>{product.deliveryMethod}</strong></div>
      </div>
      {product.riskNote ? <p className="met-product-rights-v2-card__note">{product.riskNote}</p> : null}
    </article>
  );

  return (
    <div className="met-product-rights-v2">
      {pageView === 'cardConfig' ? (
        <ProductRightsSecondaryCardConfigPage
          onBack={backToOverview}
          onOpenDetail={openCardDrawer}
          onOpenNewCard={openNewCardDrawer}
          onToast={showToast}
        />
      ) : pageView === 'pointsMall' ? (
        <ProductRightsSecondaryPointsMallPage
          onBack={backToOverview}
          onOpenDetail={openMallDrawer}
          onOpenNewProduct={openNewProductDrawer}
          onToast={showToast}
        />
      ) : (
      <div className="met-product-rights-v2__inner">
        <header className="met-product-rights-v2__header">
          <div>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>
          <div className="met-product-rights-v2__header-actions">
            <button
              type="button"
              className="met-product-rights-v2-btn met-product-rights-v2-btn--ghost met-product-rights-v2__detail-link"
              onClick={() => openCardConfig()}
            >
              {healthSummary.cardConfigListLabel}
            </button>
            <button
              type="button"
              className="met-product-rights-v2-btn met-product-rights-v2-btn--ghost met-product-rights-v2__detail-link"
              onClick={() => openPointsMall()}
            >
              {healthSummary.pointsMallConfigListLabel}
            </button>
          </div>
        </header>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--hero">
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--health">
            <div className="met-product-rights-v2-panel__head">
              <h2>{healthSummary.conclusion}</h2>
              <span className="met-product-rights-v2-panel__status">{healthSummary.statusLabel}</span>
            </div>
            <p className="met-product-rights-v2-panel__desc">{healthSummary.description}</p>
            <div className="met-product-rights-v2-panel__tags">
              {healthSummary.impactScopeTags.map(tag => (
                <span key={tag} className="met-product-rights-v2-tag met-product-rights-v2-tag--impact">{tag}</span>
              ))}
              <span className="met-product-rights-v2-tag met-product-rights-v2-tag--source">
                {healthSummary.suggestionSourceLabel}
              </span>
            </div>
            <p className="met-product-rights-v2-panel__meta">最近更新：{healthSummary.updatedAt}</p>
            <div className="met-product-rights-v2-evidence-grid">
              {healthSummary.metrics.map(metric => (
                <div key={metric.label} className="met-product-rights-v2-evidence-item">
                  <span className="met-product-rights-v2-evidence-item__value">{metric.value}</span>
                  <span className="met-product-rights-v2-evidence-item__label">{metric.label}</span>
                </div>
              ))}
            </div>
            <div className="met-product-rights-v2-panel__actions">
              <button type="button" className="met-product-rights-v2-btn met-product-rights-v2-btn--ghost" onClick={() => showToast(healthSummary.evidenceToastMessage)}>
                {healthSummary.evidenceButtonLabel}
              </button>
              <button
                type="button"
                className="met-product-rights-v2-btn"
                onClick={() => openCardConfig(Boolean(healthSummary.openNewCardOnPrimary))}
              >
                {healthSummary.primaryActionLabel}
              </button>
            </div>
          </article>
        </section>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--priority">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">当前最需要处理</h2>
            <p className="met-product-rights-v2-zone__subtitle">优先处理会影响会员展示、退费、积分与合同一致性的事项</p>
          </header>
          <div className="met-product-rights-v2-action-queue">
            {priorityActions.map(item => (
              <div key={item.id} className={`met-product-rights-v2-action-item met-product-rights-v2-action-item--${item.priority.toLowerCase()}`}>
                <span className={['met-product-rights-v2-priority', getProductRightsPriorityClass(item.priority)].join(' ')}>{item.priority}</span>
                <div className="met-product-rights-v2-action-item__main">
                  <p className="met-product-rights-v2-action-item__title">{item.title}</p>
                  <p className="met-product-rights-v2-action-item__meta">影响：{item.impactScope} · 负责人：{item.ownerRole} · 来源：{item.source}</p>
                  <p className="met-product-rights-v2-action-item__action">{item.suggestedAction}</p>
                </div>
                <button type="button" className="met-product-rights-v2-btn met-product-rights-v2-btn--sm met-product-rights-v2-btn--ghost" onClick={() => handlePriorityAction(item)}>
                  {item.buttonLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="met-product-rights-v2-zone">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">核心配置分类</h2>
            <p className="met-product-rights-v2-zone__subtitle">按卡项、点数、预约、积分、商城、赠送权益和合同拆开管理</p>
          </header>
          <div className="met-product-rights-v2-domain-grid">
            {configDomains.map(domain => (
              <article key={domain.id} className={['met-product-rights-v2-domain', getProductRightsStatusClass(domain.status), domain.featured ? 'is-featured' : ''].join(' ')}>
                <div className="met-product-rights-v2-domain__head">
                  <h3>{domain.title}</h3>
                  <span className="met-product-rights-v2-domain__status">{domain.statusLabel}</span>
                </div>
                <p className="met-product-rights-v2-domain__coverage">{domain.coverage}</p>
                <p className="met-product-rights-v2-domain__pending">{domain.pendingItem}</p>
                <p className="met-product-rights-v2-domain__impact"><span>影响</span>{domain.impactModules}</p>
                <button type="button" className="met-product-rights-v2-btn met-product-rights-v2-btn--sm met-product-rights-v2-btn--ghost" onClick={() => handleConfigDomain(domain)}>
                  {domain.actionLabel}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--detail">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">当前在售卡项摘要</h2>
            <p className="met-product-rights-v2-zone__subtitle">只展示主要卡项，完整配置进入卡项配置二级页</p>
          </header>
          <div className="met-product-rights-v2-product-grid">
            {cardProducts.map(renderCardProduct)}
          </div>
          <div className="met-product-rights-v2-zone__foot">
            <button type="button" className="met-product-rights-v2-btn met-product-rights-v2-btn--ghost met-product-rights-v2__detail-link" onClick={() => openCardConfig()}>
              {cardProductsViewAllLabel}
            </button>
          </div>
        </section>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--detail">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">积分商城摘要</h2>
            <p className="met-product-rights-v2-zone__subtitle">{pointsMallSummary.disclaimer}</p>
          </header>
          <div className="met-product-rights-v2-mall-overview">
            <span>上架商品 <strong>{pointsMallSummary.onShelfCount}</strong></span>
            <span>售罄商品 <strong>{pointsMallSummary.soldOutCount}</strong></span>
            <span>低库存商品 <strong>{pointsMallSummary.lowStockCount}</strong></span>
            <span>需审批兑换 <strong>{pointsMallSummary.approvalRequiredCount}</strong></span>
            <span>本月兑换记录 <strong>{pointsMallSummary.monthlyExchangeCount}</strong></span>
          </div>
          <div className="met-product-rights-v2-product-grid met-product-rights-v2-product-grid--mall">
            {mallProducts.map(renderMallProduct)}
          </div>
          <div className="met-product-rights-v2-zone__foot">
            <button type="button" className="met-product-rights-v2-btn met-product-rights-v2-btn--ghost met-product-rights-v2__detail-link" onClick={() => openPointsMall()}>
              {pointsMallViewAllLabel}
            </button>
          </div>
        </section>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--split">
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--guardrail">
            <h2 className="met-product-rights-v2-zone__title">权益规则红线</h2>
            <ul className="met-product-rights-v2-risk-list">
              {rightsGuardrails.map(rule => (
                <li key={rule}>
                  {rule.includes('卡项') ? (
                    <button type="button" className="met-product-rights-v2-guardrail-link" onClick={() => openCardConfig()}>
                      {rule}
                    </button>
                  ) : rule.includes('积分') || rule.includes('赠送权益') ? (
                    <button type="button" className="met-product-rights-v2-guardrail-link" onClick={() => openPointsMall()}>
                      {rule}
                    </button>
                  ) : (
                    rule
                  )}
                </li>
              ))}
            </ul>
          </article>
          <article className="met-product-rights-v2-panel met-product-rights-v2-panel--permission">
            <h2 className="met-product-rights-v2-zone__title">角色权限边界</h2>
            <div className="met-product-rights-v2-permission-list">
              {permissionBoundaries.map(row => (
                <div key={row.role} className="met-product-rights-v2-permission-row">
                  <span>{row.role}</span>
                  <p>{row.summary}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="met-product-rights-v2-zone met-product-rights-v2-zone--entries">
          <header className="met-product-rights-v2-zone__head">
            <h2 className="met-product-rights-v2-zone__title">后续配置入口</h2>
          </header>
          <div className="met-product-rights-v2-detail-entries">
            {detailEntries.map(entry => (
              <button
                key={entry.id}
                type="button"
                className={['met-product-rights-v2-detail-entry', entry.opensCardConfig || entry.opensPointsMall ? 'met-product-rights-v2-detail-entry--accent' : ''].filter(Boolean).join(' ')}
                onClick={() => handleDetailEntry(entry)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </section>
      </div>
      )}

      {cardDrawerId ? (
        cardDrawerDetail ? (
          <CardDetailDrawer detail={cardDrawerDetail} onClose={closeCardDrawer} onToast={showToast} onEdit={openNewCardDrawer} />
        ) : (
          <>
            <button type="button" className="met-v2-drawer-overlay" onClick={closeCardDrawer} />
            <aside className="met-v2-drawer-panel met-v2-drawer-panel--md"><div className="met-v2-drawer-body"><V2DrawerEmpty onClose={closeCardDrawer} /></div></aside>
          </>
        )
      ) : null}

      {newCardOpen ? (
        <NewCardDrawer
          draft={cardConfigSnapshot.newCardDraft}
          disclaimer={cardConfigSnapshot.meta.newCardDisclaimer}
          submitToast={cardConfigSnapshot.meta.submitToast}
          saveDraftToast={cardConfigSnapshot.meta.saveDraftToast}
          onClose={closeNewCardDrawer}
          onToast={showToast}
        />
      ) : null}

      {mallDrawerId ? (
        mallDrawerDetail ? (
          <PointsMallProductDetailDrawer detail={mallDrawerDetail} onClose={closeMallDrawer} onToast={showToast} onEdit={openNewProductDrawer} />
        ) : (
          <>
            <button type="button" className="met-v2-drawer-overlay" onClick={closeMallDrawer} />
            <aside className="met-v2-drawer-panel met-v2-drawer-panel--md"><div className="met-v2-drawer-body"><V2DrawerEmpty onClose={closeMallDrawer} /></div></aside>
          </>
        )
      ) : null}

      {newProductOpen ? (
        <NewPointsMallProductDrawer
          draft={pointsMallSnapshot.newProductDraft}
          disclaimer={pointsMallSnapshot.meta.newProductDisclaimer}
          submitToast={pointsMallSnapshot.meta.submitToast}
          saveDraftToast={pointsMallSnapshot.meta.saveDraftToast}
          onClose={closeNewProductDrawer}
          onToast={showToast}
        />
      ) : null}

      {toast ? <div className="met-product-rights-v2-toast" role="status">{toast}</div> : null}
    </div>
  );
};

export default ProductRightsV2Page;
