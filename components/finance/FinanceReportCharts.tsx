import React from 'react';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import type { Order } from '../../types';
import type { FinancePendingItem } from '../Finance';

interface FinanceReportChartsProps {
  orders: Order[];
  pendingItems: FinancePendingItem[];
  productTypeLabels: Record<Order['items'][number]['productType'], string>;
  endingDeferredRevenue: number;
  refundTotal: number;
}

const FinanceReportCharts: React.FC<FinanceReportChartsProps> = ({
  orders,
  pendingItems,
  productTypeLabels,
  endingDeferredRevenue,
  refundTotal,
}) => {
  // Transitional report mock: the chart shape stays demo-first until ledger reports are split out.
  const cashFlowData: ChartData<'line'> = {
    labels: ['1日', '5日', '10日', '15日', '20日', '25日'],
    datasets: [
      {
        label: '总营收 (现金流入)',
        data: [120, 190, 150, 250, 220, 300],
        borderColor: '#000',
        backgroundColor: 'rgba(0,0,0,0.05)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: '净现金流',
        data: [50, 90, 80, 150, 110, 120],
        borderColor: '#4ADE80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  };

  const cashFlowOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 6 } },
      tooltip: { 
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: { 
        beginAtZero: false, 
        grid: { display: true, color: '#f3f4f6' }, 
        ticks: { callback: (value) => '¥' + value + 'k', font: { size: 10 } },
        border: { display: false }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 10 } },
        border: { display: false }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const incomeByProductType = orders.reduce<Record<Order['items'][number]['productType'], number>>((totals, order) => {
    const paidAmount = order.paidAmount ?? order.totalAmount;
    order.items.forEach(item => {
      const itemRatio = order.totalAmount > 0 ? item.totalAmount / order.totalAmount : 0;
      totals[item.productType] += paidAmount * itemRatio;
    });
    return totals;
  }, { card: 0, ttc: 0, point: 0, course: 0, custom: 0 });
  const incomePieEntries = Object.entries(incomeByProductType)
    .filter((entry): entry is [Order['items'][number]['productType'], number] => entry[1] > 0);

  const incomePieData: ChartData<'doughnut'> = {
    labels: incomePieEntries.map(([type, amount]) => `${productTypeLabels[type]} ¥${amount.toLocaleString()}`),
    datasets: [{
      data: incomePieEntries.map(([, amount]) => amount),
      backgroundColor: ['#000000', '#4ADE80', '#60A5FA', '#FBBF24'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const incomePieOptions: ChartOptions<'doughnut'> = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center text-gray-900"><i className="fa-solid fa-chart-line mr-2 text-gray-400"></i> 营收与净现金流趋势</h3>
            <div className="text-sm text-gray-500">用于风险控制和流动性分析</div>
          </div>
          <div className="h-64 w-full">
            <Line data={cashFlowData} options={cashFlowOptions} />
          </div>
        </div>
        <div className="col-span-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">待处理事项 <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-2">{pendingItems.length}</span></h3>
          <div className="space-y-3">
            {pendingItems.length > 0 ? pendingItems.map(item => (
              <div key={item.id} className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition ${item.tone === 'refund' ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm ${item.tone === 'refund' ? 'text-red-500' : 'text-blue-500'}`}><i className={`fa-solid ${item.tone === 'refund' ? 'fa-rotate-left' : 'fa-file-invoice-dollar'}`}></i></div>
                  <div><div className="text-sm font-bold text-gray-900">{item.title}</div><div className="text-[10px] text-gray-500">{item.description}</div></div>
                </div>
                <button className={`text-xs hover:underline font-medium ${item.tone === 'refund' ? 'text-red-600' : 'text-blue-600'}`}>{item.actionLabel}</button>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">暂无待处理事项</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center">
          <h3 className="font-bold text-lg w-full mb-2 text-gray-900">收入结构 (卡项)</h3>
          <div className="h-48 w-full flex justify-center relative">
            <Doughnut 
              data={incomePieData} 
              options={incomePieOptions}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xs text-gray-400 font-bold uppercase">Total</div>
              <div className="text-xl font-bold font-mono">100%</div>
            </div>
          </div>
        </div>
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-900">关键财务指标明细</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-100 text-xs uppercase font-bold">
              <tr><th className="py-2">指标</th><th>金额/数值</th><th>占比/趋势</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-3 font-bold text-gray-900">预收账款 (期末)</td>
                <td className="font-mono text-gray-900">¥{endingDeferredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="text-gray-500 text-xs">负债项</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-gray-900">当月退款总额</td>
                <td className="font-mono text-red-600">-¥{refundTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="text-red-500 text-xs">来自退款单</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-gray-900">课时费支出总额</td>
                <td className="font-mono text-gray-900">¥45,000.00</td>
                <td className="text-blue-600 text-xs">过渡报表 mock</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FinanceReportCharts;
