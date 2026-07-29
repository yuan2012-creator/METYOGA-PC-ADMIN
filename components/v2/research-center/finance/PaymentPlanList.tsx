import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../researchCenterCalculations';
import type { PaymentPlanItem } from '../researchCenterFinanceModel';
import type { ResearchCenterDrawerState } from '../ResearchCenterDrawer';

interface PaymentPlanListProps {
  plans: PaymentPlanItem[];
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  onRecordPayment: (id: string) => void;
}

const PaymentPlanList: React.FC<PaymentPlanListProps> = ({
  plans,
  onOpenDrawer,
  onRecordPayment,
}) => {
  const [menuId, setMenuId] = useState<string | null>(null);

  return (
    <section className="met-rc-v2-card met-rc-v2-payment-list">
      <header className="met-rc-v2-zone__head">
        <h2 className="met-rc-v2-zone__title">付款计划列表</h2>
        <p className="met-rc-v2-zone__subtitle">按最近到期时间排序</p>
      </header>
      <div className="met-rc-v2-payment-list__table">
        <div className="met-rc-v2-payment-list__head">
          <span>付款事项</span>
          <span className="is-num">应付</span>
          <span>预计日期</span>
          <span className="is-num">已付</span>
          <span className="is-num">未付</span>
          <span>状态</span>
          <span>操作</span>
        </div>
        {plans.map(plan => {
          const unpaid = Math.max(0, plan.dueAmount - plan.paidAmount);
          const isPendingConfig = plan.status === '待配置';
          return (
            <div
              key={plan.id}
              className={['met-rc-v2-payment-list__row', isPendingConfig ? 'is-pending-config' : ''].filter(Boolean).join(' ')}
            >
              <span className="met-rc-v2-payment-list__title">
                <strong>{plan.title}</strong>
                <em>{plan.category} · {plan.owner}</em>
              </span>
              <span className="is-num">{plan.dueAmount > 0 ? formatCurrency(plan.dueAmount) : '待配置'}</span>
              <span>{plan.dueDate}</span>
              <span className="is-num">{formatCurrency(plan.paidAmount)}</span>
              <span className="is-num">{plan.dueAmount > 0 ? formatCurrency(unpaid) : '待配置'}</span>
              <span className={['met-rc-v2-payment-list__status', `is-status-${plan.status}`].join(' ')}>{plan.status}</span>
              <span className="met-rc-v2-payment-list__actions">
                {isPendingConfig ? (
                  <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm met-rc-v2-payment-list__primary" onClick={() => onOpenDrawer({ type: 'content', key: 'hardcover-plan' })}>
                    配置计划
                  </button>
                ) : (
                  <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm met-rc-v2-payment-list__primary" onClick={() => onRecordPayment(plan.id)}>
                    记录付款
                  </button>
                )}
                <div className="met-rc-v2-more">
                  <button
                    type="button"
                    className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm met-rc-v2-payment-list__more"
                    onClick={() => setMenuId(menuId === plan.id ? null : plan.id)}
                    aria-label="更多操作"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {menuId === plan.id ? (
                    <div className="met-rc-v2-more__menu">
                      <button type="button" onClick={() => { onOpenDrawer({ type: 'content', key: 'cash-plan' }); setMenuId(null); }}>查看凭证</button>
                      <button type="button" onClick={() => { onOpenDrawer({ type: 'content', key: 'hardcover-plan' }); setMenuId(null); }}>调整日期</button>
                    </div>
                  ) : null}
                </div>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PaymentPlanList;
