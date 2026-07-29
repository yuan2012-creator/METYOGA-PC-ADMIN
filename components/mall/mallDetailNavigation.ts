import type { MallDetailTabId } from './MallDetailTabs';

export type MallDetailSubviewType =
  | 'orderDetail'
  | 'allOrders'
  | 'contractDetail'
  | 'assetDetail'
  | 'riskRecord';

export type MallDetailSubview = {
  type: MallDetailSubviewType;
  id?: string;
};

export type MallModalOpenIntent = {
  productId: string;
  tab?: MallDetailTabId;
  subview?: MallDetailSubview | null;
};

export const TAB_LABELS: Record<MallDetailTabId, string> = {
  overview: '产品配置',
  contract: '合同条款',
  orders: '订单支付',
  asset: '会员资产',
  risk: '敏感操作',
  logs: '操作日志',
};

export const subviewBackTabLabel = (tab: MallDetailTabId): string => TAB_LABELS[tab];
