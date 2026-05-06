import React from 'react';
import type { FinanceOrderFilter, FinanceTransactionRow } from '../Finance';

interface RevenueTableProps {
  orderFilter: FinanceOrderFilter;
  setOrderFilter: React.Dispatch<React.SetStateAction<FinanceOrderFilter>>;
  filteredOrders: FinanceTransactionRow[];
}

const RevenueTable: React.FC<RevenueTableProps> = ({
  orderFilter,
  setOrderFilter,
  filteredOrders,
}) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <div className="flex gap-2">
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${orderFilter==='all' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`} onClick={() => setOrderFilter('all')}>全部订单</button>
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${orderFilter==='card' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`} onClick={() => setOrderFilter('card')}>卡项/课程</button>
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${orderFilter==='refund' ? 'bg-red-600 text-white' : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'}`} onClick={() => setOrderFilter('refund')}><i className="fa-solid fa-rotate-left mr-1"></i> 退款订单</button>
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${orderFilter==='integral' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`} onClick={() => setOrderFilter('integral')}>积分兑换</button>
      </div>
      <div className="relative">
        <input type="text" placeholder="搜索订单号/会员..." className="bg-white border border-gray-200 rounded-lg text-xs py-1.5 pl-8 w-48 focus:border-black focus:ring-1 focus:ring-black outline-none transition" />
        <i className="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></i>
      </div>
    </div>
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-bold">
        <tr><th className="p-4 pl-6">订单号/时间</th><th className="p-4">客户</th><th className="p-4">类型/内容</th><th className="p-4">金额</th><th className="p-4">支付方式</th><th className="p-4">状态</th><th className="p-4 text-right pr-6">操作</th></tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {filteredOrders.map(order => (
          <tr key={order.id} className="hover:bg-gray-50 transition">
            <td className="p-4 pl-6">
              <div className={`font-mono font-bold ${order.sourceType === 'refund' ? 'text-red-600' : 'text-gray-900'}`}>{order.id}</div>
              <div className="text-xs text-gray-400">{order.date}</div>
              {order.paymentId && <div className="text-[10px] text-gray-300">Payment: {order.paymentId}</div>}
              {order.ledgerEntryId && <div className="text-[10px] text-gray-300">Ledger: {order.ledgerEntryId}</div>}
            </td>
            <td className="p-4 font-bold text-gray-900">{order.customer}</td>
            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold mr-2 ${order.statusTag}`}>{order.type}</span> <span className="text-gray-600">{order.content}</span></td>
            <td className={`p-4 font-mono font-bold ${order.sourceType === 'refund' ? 'text-red-600' : order.amount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
              {order.amount === 0 ? '0.00' : '¥' + order.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              {order.integral && <span className="text-[10px] text-gray-400 block">{order.integral} 积分</span>}
            </td>
            <td className="p-4 text-xs text-gray-500">{order.method}</td>
            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${order.statusTag}`}>{order.status}</span></td>
            <td className="p-4 text-right pr-6"><button className="text-xs text-blue-600 hover:underline font-bold">详情</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RevenueTable;
