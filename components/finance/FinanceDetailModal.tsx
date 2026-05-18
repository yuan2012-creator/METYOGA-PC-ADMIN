import React, { useEffect, useMemo, useState } from 'react';
import {
  findFinanceConsumption,
  findFinanceExpense,
  findFinancePayment,
  findFinanceRefund,
  findFinanceSettlement,
  findFinanceTeacherFee,
  getFinanceJudgmentHint,
  resolveFinanceEntityTitle,
  type FinanceEntityType,
  type FinanceOperationSnapshot,
} from './financeOperationViewModel';
import { formatFinanceCny, formatFinanceDate, formatFinanceDateTime } from './financeFormatters';
import { financeDemoToast } from './financeDemoToast';
import FinanceDetailTabs, { type FinanceDetailTabId } from './FinanceDetailTabs';
import {
  FinanceEvidenceChain,
  FinanceJudgmentBox,
  FinanceModalBlock,
  FinanceModalDl,
  FinanceModalPanel,
} from './financeModalShared';

interface FinanceDetailModalProps {
  open: boolean;
  entityType: FinanceEntityType | null;
  entityId: string | null;
  snapshot: FinanceOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: FinanceDetailTabId;
}

const FinanceDetailModal: React.FC<FinanceDetailModalProps> = ({
  open,
  entityType,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<FinanceDetailTabId>('overview');

  useEffect(() => {
    if (!open) setActiveTab('overview');
    else if (initialTab) setActiveTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const header = useMemo(() => {
    if (!entityType || !entityId) return null;
    return resolveFinanceEntityTitle(snapshot, entityType, entityId);
  }, [entityType, entityId, snapshot]);

  const judgment = useMemo(() => {
    if (!entityType || !entityId) return null;
    return getFinanceJudgmentHint(entityType, snapshot, entityId);
  }, [entityType, entityId, snapshot]);

  const payment = entityType === 'payment' && entityId ? findFinancePayment(snapshot, entityId) : undefined;
  const refund = entityType === 'refund' && entityId ? findFinanceRefund(snapshot, entityId) : undefined;
  const consumption =
    entityType === 'consumption' && entityId ? findFinanceConsumption(snapshot, entityId) : undefined;
  const teacherFee =
    entityType === 'teacherFee' && entityId ? findFinanceTeacherFee(snapshot, entityId) : undefined;
  const settlement =
    entityType === 'settlement' && entityId ? findFinanceSettlement(snapshot, entityId) : undefined;
  const expense = entityType === 'expense' && entityId ? findFinanceExpense(snapshot, entityId) : undefined;

  if (!open || !entityType || !entityId || !header || !judgment) return null;

  const renderOverview = () => (
    <>
      <FinanceJudgmentBox hint={judgment} />
      {payment ? (
        <FinanceModalPanel>
          <FinanceModalDl
            rows={[
              { label: '支付编号', value: payment.payNo },
              { label: '订单号', value: payment.orderNo },
              { label: '会员', value: `${payment.memberName} ${payment.phoneMask}` },
              { label: '产品', value: payment.productName },
              { label: '实收金额', value: formatFinanceCny(payment.amount) },
              { label: '支付方式', value: payment.payMethod },
              { label: '支付时间', value: formatFinanceDateTime(payment.payTime) },
              { label: '财务状态', value: payment.financeStatus },
            ]}
          />
        </FinanceModalPanel>
      ) : null}
      {refund ? (
        <FinanceModalPanel>
          <FinanceModalDl
            rows={[
              { label: '退款编号', value: refund.refundNo },
              { label: '原订单', value: refund.orderNo },
              { label: '申请金额', value: formatFinanceCny(refund.applyAmount) },
              { label: '可退金额', value: formatFinanceCny(refund.refundableAmount) },
              { label: '资产处理', value: refund.assetAction },
              { label: '审批状态', value: refund.approvalStatus },
            ]}
          />
        </FinanceModalPanel>
      ) : null}
      {consumption ? (
        <FinanceModalPanel>
          <FinanceModalDl
            rows={[
              { label: '耗课记录号', value: consumption.recordNo },
              { label: '日期', value: formatFinanceDate(consumption.date) },
              { label: '确认收入', value: formatFinanceCny(consumption.recognizedRevenue) },
              { label: '扣点 / 次数', value: consumption.deductLabel },
              { label: '资产来源', value: consumption.assetSource },
              { label: '状态', value: consumption.status },
            ]}
          />
        </FinanceModalPanel>
      ) : null}
      {teacherFee ? (
        <FinanceModalPanel>
          <FinanceModalDl
            rows={[
              { label: '课时记录号', value: teacherFee.sessionNo },
              { label: '老师', value: teacherFee.teacherName },
              { label: '课时费', value: formatFinanceCny(teacherFee.feeAmount) },
              { label: '到课人数', value: teacherFee.attendeeCount },
              { label: '结算状态', value: teacherFee.status },
            ]}
          />
        </FinanceModalPanel>
      ) : null}
      {settlement ? (
        <FinanceModalPanel>
          <FinanceModalDl
            rows={[
              { label: '结算编号', value: settlement.settlementNo },
              { label: '消课门店', value: settlement.consumeStore },
              { label: '售卡门店', value: settlement.sellStore },
              { label: '结算金额', value: formatFinanceCny(settlement.amount) },
              { label: '结算规则', value: settlement.ruleLabel },
              { label: '状态', value: settlement.status },
            ]}
          />
        </FinanceModalPanel>
      ) : null}
      {expense ? (
        <FinanceModalPanel>
          <FinanceModalDl
            rows={[
              { label: '支出编号', value: expense.expenseNo },
              { label: '类目', value: expense.category },
              { label: '金额', value: formatFinanceCny(expense.amount) },
              { label: '付款状态', value: expense.payStatus },
              { label: '凭证状态', value: expense.voucherStatus },
            ]}
          />
        </FinanceModalPanel>
      ) : null}
    </>
  );

  const renderTab = () => {
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'orderPay') {
      if (!payment && !refund) {
        return <p className="met-finance-empty">本对象无收款订单明细（演示空态）</p>;
      }
      return (
        <FinanceModalBlock title="收款与订单">
          {payment ? (
            <FinanceModalDl
              rows={[
                { label: '订单号', value: payment.orderNo },
                { label: '实收', value: formatFinanceCny(payment.amount) },
                { label: '支付方式', value: payment.payMethod },
                { label: '支付时间', value: formatFinanceDateTime(payment.payTime) },
              ]}
            />
          ) : refund ? (
            <FinanceModalDl
              rows={[
                { label: '原订单', value: refund.orderNo },
                { label: '申请退款', value: formatFinanceCny(refund.applyAmount) },
                { label: '可退金额', value: formatFinanceCny(refund.refundableAmount) },
              ]}
            />
          ) : null}
          <p className="met-finance-modal-note">收款不等于确认收入，需核对支付与订单一致性。</p>
        </FinanceModalBlock>
      );
    }
    if (activeTab === 'contractAsset') {
      if (!payment && !refund) {
        return <p className="met-finance-empty">本对象无合同资产链路（演示空态）</p>;
      }
      return (
        <FinanceModalBlock title="合同与资产">
          {payment ? (
            <FinanceModalDl
              rows={[
                { label: '合同状态', value: payment.contractStatus },
                { label: '资产状态', value: payment.assetStatus },
              ]}
            />
          ) : (
            <FinanceModalDl
              rows={[
                { label: '资产处理', value: refund!.assetAction },
                { label: '审批状态', value: refund!.approvalStatus },
              ]}
            />
          )}
          <p className="met-finance-modal-note">不支持直接修改资产余额，需通过退款/扣减流程核对。</p>
        </FinanceModalBlock>
      );
    }
    if (activeTab === 'consumption') {
      if (!consumption && !payment) {
        return <p className="met-finance-empty">暂无耗课确认收入记录（演示空态）</p>;
      }
      if (consumption) {
        return (
          <FinanceModalBlock title="耗课确认收入">
            <FinanceModalDl
              rows={[
                { label: '课程', value: consumption.courseName },
                { label: '老师', value: consumption.teacherName },
                { label: '门店', value: consumption.storeName },
                { label: '确认收入', value: formatFinanceCny(consumption.recognizedRevenue) },
                { label: '状态', value: consumption.status },
              ]}
            />
            <p className="met-finance-modal-note">耗课后才确认收入，订单收款不等于确认收入。</p>
          </FinanceModalBlock>
        );
      }
      return (
        <p className="met-finance-empty">
          该笔收款尚未耗课，确认收入为 {formatFinanceCny(0)} · 仍属预收负债
        </p>
      );
    }
    if (activeTab === 'feeSettlement') {
      if (!teacherFee && !settlement) {
        return <p className="met-finance-empty">本对象无课时费 / 结算明细（演示空态）</p>;
      }
      return (
        <FinanceModalBlock title="课时费与跨店结算">
          {teacherFee ? (
            <FinanceModalDl
              rows={[
                { label: '老师', value: teacherFee.teacherName },
                { label: '课时费', value: formatFinanceCny(teacherFee.feeAmount) },
                { label: '到课人数', value: teacherFee.attendeeCount },
                { label: '状态', value: teacherFee.status },
              ]}
            />
          ) : settlement ? (
            <FinanceModalDl
              rows={[
                { label: '结算编号', value: settlement.settlementNo },
                { label: '消课门店', value: settlement.consumeStore },
                { label: '售卡门店', value: settlement.sellStore },
                { label: '结算金额', value: formatFinanceCny(settlement.amount) },
                { label: '状态', value: settlement.status },
              ]}
            />
          ) : null}
          <p className="met-finance-modal-note">课时费以完课与到课为准；跨店结算以门店与规则为准（前端演示）。</p>
        </FinanceModalBlock>
      );
    }
    return (
      <FinanceModalBlock title="操作记录">
        <ul className="met-finance-log-list">
          <li>{formatFinanceDateTime('2026-05-14 10:20')} · 系统 · 创建核对任务（前端演示）</li>
          <li>{formatFinanceDateTime('2026-05-14 11:00')} · 财务 · 待人工复核</li>
        </ul>
        <button
          type="button"
          className="met-member-btn-sm"
          onClick={() => onToast(financeDemoToast.markDone)}
        >
          标记处理
        </button>
      </FinanceModalBlock>
    );
  };

  return (
    <>
      <button type="button" aria-label="关闭" className="met-finance-modal-overlay" onClick={onClose} />
      <aside className="met-finance-detail-modal" role="dialog" aria-modal aria-labelledby="finance-modal-title">
        <header className="met-finance-detail-header met-finance-detail-header--evidence">
          <div className="met-finance-detail-header__row1">
            <div className="met-finance-detail-header__identity">
              <h2 id="finance-modal-title">{header.title}</h2>
              <p className="met-finance-detail-header__sub">{header.subtitle}</p>
            </div>
            <button type="button" className="met-member-drawer__close" onClick={onClose} aria-label="关闭">
              ×
            </button>
          </div>
          <div className="met-finance-detail-header__row2">
            <span className="met-finance-chip met-finance-chip--neutral">{header.status}</span>
          </div>
          <div className="met-finance-detail-header__suggestion">
            <span className="met-finance-detail-header__dot" aria-hidden />
            <span>{header.riskHint}</span>
          </div>
          {header.chain.length > 0 ? (
            <div className="met-finance-detail-header__chain">
              <FinanceEvidenceChain steps={header.chain} />
            </div>
          ) : null}
        </header>
        <FinanceDetailTabs active={activeTab} onChange={setActiveTab} />
        <div className="met-finance-detail-body custom-scroll">{renderTab()}</div>
      </aside>
    </>
  );
};

export default FinanceDetailModal;
