import React from 'react';
import type { Contract, Member, Order } from '../../types';
import { buildMallOrderRows, type MallAssetSourceLink } from '../../utils/mallSelectors';

export type MallOrderCategory = 'cards' | 'ttc' | 'points';

export interface MallOrderFilters {
    date: string;
    type: string;
    status: string;
}

interface MallOrdersProps {
  orders: Order[];
  contracts: Contract[];
  members: Member[];
  assetSourceLinks: MallAssetSourceLink[];
  orderTab: MallOrderCategory;
  setOrderTab: React.Dispatch<React.SetStateAction<MallOrderCategory>>;
  orderFilters: MallOrderFilters;
  setOrderFilters: React.Dispatch<React.SetStateAction<MallOrderFilters>>;
  onDemoAction: (message: string) => void;
  onOpenOrderDetail: (orderId: string) => void;
  onOpenAssetDetail?: (assetId: string) => void;
}

const MallOrders: React.FC<MallOrdersProps> = ({
  orders,
  contracts,
  members,
  assetSourceLinks,
  orderTab,
  setOrderTab,
  orderFilters,
  setOrderFilters,
  onDemoAction,
  onOpenOrderDetail,
  onOpenAssetDetail,
}) => {
  const renderOrders = () => {
      const detailedOrders = buildMallOrderRows({ orders, contracts, members, assetSourceLinks });
      const filteredOrders = detailedOrders.filter(order => {
          const statusMatched = orderFilters.status === 'all' || order.status === orderFilters.status;
          const typeMatched = orderFilters.type === 'all' || order.productType === orderFilters.type;
          return order.category === orderTab && statusMatched && typeMatched;
      });

      return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn flex flex-col h-full">
              <div className="p-5 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-900">销售与订单管理</h3>
                      <div className="flex gap-2">
                          <button
                              onClick={() => onDemoAction('订单导出已接入站内反馈，完整导出能力仍为后续接口接入')}
                              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50"
                          >
                              导出数据
                          </button>
                      </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 bg-gray-200/50 p-1 rounded-lg self-start">
                      {[ { id: 'cards', label: '会员卡项' }, { id: 'ttc', label: '研学中心' }, { id: 'points', label: '积分商品' } ].map(tab => (
                          <button
                              key={tab.id}
                              onClick={() => setOrderTab(tab.id as MallOrderCategory)}
                              className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${orderTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                          >
                              {tab.label}
                          </button>
                      ))}
                  </div>

                  {/* Filters */}
                  <div className="flex gap-3">
                      <select
                          value={orderFilters.date}
                          onChange={(e) => setOrderFilters({...orderFilters, date: e.target.value})}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black transition w-32"
                      >
                          <option value="all">全部日期</option>
                          <option value="today">今日</option>
                          <option value="7d">近7天</option>
                      </select>
                      <select
                          value={orderFilters.type}
                          onChange={(e) => setOrderFilters({...orderFilters, type: e.target.value})}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black transition w-32"
                      >
                          <option value="all">全部类型</option>
                          <option value="card">会员卡项</option>
                          <option value="ttc">教培</option>
                          <option value="point">积分商品</option>
                          <option value="course">课程权益</option>
                      </select>
                      <select
                          value={orderFilters.status}
                          onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black transition w-32"
                      >
                          <option value="all">全部状态</option>
                          <option value="paid">已支付</option>
                          <option value="pending">待支付</option>
                          <option value="deposit">已付定金</option>
                          <option value="refunded">已退款</option>
                          <option value="cancelled">已取消</option>
                          <option value="closed">已关闭</option>
                      </select>
                  </div>
              </div>

              <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-bold sticky top-0 z-10">
                          <tr>
                              <th className="p-4 pl-6">订单号</th>
                              <th className="p-4">用户信息</th>
                              <th className="p-4">商品内容</th>
                              <th className="p-4">
                                  {orderTab === 'cards' ? '卡项详情' : orderTab === 'ttc' ? '教培详情' : '兑换详情'}
                              </th>
                              <th className="p-4">实付金额</th>
                              <th className="p-4">支付状态</th>
                              <th className="p-4">下单时间</th>
                              <th className="p-4 text-right pr-6">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {filteredOrders.map(order => (
                              <tr
                                  key={order.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => onOpenOrderDetail(order.id)}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          onOpenOrderDetail(order.id);
                                      }
                                  }}
                                  className="hover:bg-gray-50 transition cursor-pointer"
                              >
                                  <td className="p-4 pl-6 font-mono text-xs text-gray-500">{order.id}</td>
                                  <td className="p-4">
                                      <div className="font-bold text-gray-900">{order.user}</div>
                                      <div className="text-xs text-gray-400 font-mono mt-0.5">{order.phone}</div>
                                  </td>
                                  <td className="p-4">
                                      <div className="text-gray-900 font-medium">{order.product}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{order.type}</div>
                                  </td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                          order.subStatus === 'active' || order.subStatus === 'signed' || order.subStatus === 'shipped' ? 'bg-green-50 text-green-700 border-green-100' :
                                          order.subStatus === 'attended' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                                      }`}>
                                          {order.details}
                                      </span>
                                      <div className={`text-[10px] mt-1 ${order.hasAssetSource ? 'text-gray-400' : 'text-orange-500'}`}>
                                          {order.sourceSummary}
                                      </div>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-gray-900">{order.amount}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          order.status === 'paid' || order.status === 'completed' ? 'text-green-600 bg-green-50' :
                                          order.status === 'pending' || order.status === 'deposit' ? 'text-orange-600 bg-orange-50' :
                                          order.status === 'refunded' ? 'text-red-600 bg-red-50' :
                                          order.status === 'cancelled' || order.status === 'closed' ? 'text-gray-600 bg-gray-100' :
                                          'text-red-600 bg-red-50'
                                      }`}>
                                          {order.status === 'paid'
                                              ? '已支付'
                                              : order.status === 'deposit'
                                                ? '已付定金'
                                                : order.status === 'completed'
                                                  ? '已完成'
                                                  : order.status === 'refunded'
                                                    ? '已退款'
                                                    : order.status === 'cancelled'
                                                      ? '已取消'
                                                      : order.status === 'closed'
                                                        ? '已关闭'
                                                        : '待支付'}
                                      </span>
                                  </td>
                                  <td className="p-4 text-xs text-gray-400 font-mono">{order.time}</td>
                                  <td className="p-4 text-right pr-6">
                                      {order.linkedAssetId && onOpenAssetDetail ? (
                                          <button
                                              type="button"
                                              onClick={e => {
                                                  e.stopPropagation();
                                                  onOpenAssetDetail(order.linkedAssetId);
                                              }}
                                              className="text-gray-600 hover:underline text-xs font-bold mr-3"
                                          >
                                              查看资产
                                          </button>
                                      ) : null}
                                      <button
                                          type="button"
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              onOpenOrderDetail(order.id);
                                          }}
                                          className="text-black hover:underline text-xs font-bold"
                                      >
                                          查看
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-12">暂无订单数据</div>
                  )}
              </div>
          </div>
      );
  };

  return renderOrders();
};

export default MallOrders;
