import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { StaffIncomePayrollPanelProps } from './StaffDetailTypes';

const StaffIncomePayrollPanel: React.FC<StaffIncomePayrollPanelProps> = ({ staffDetails, incomeTimeRange, setIncomeTimeRange }) => (

  <div className="space-y-5 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-coins text-gray-900"></i> 收入与耗课
              </h4>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setIncomeTimeRange('week')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${incomeTimeRange === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>本周</button>
                  <button onClick={() => setIncomeTimeRange('month')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${incomeTimeRange === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>本月</button>
                  <button onClick={() => setIncomeTimeRange('quarter')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${incomeTimeRange === 'quarter' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>本季</button>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
              {/* 收入与耗课 */}
              <div className="space-y-5">
                  <div className="flex items-end justify-between">
                      <div>
                          <div className="text-xs font-bold text-gray-500 mb-1">总收入</div>
                          <div className="text-3xl font-bold font-mono text-gray-900">¥{staffDetails.incomeStats[incomeTimeRange].total.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] font-bold text-gray-400 mb-1">全馆营收占比</div>
                          <div className="text-lg font-bold text-gray-900">{staffDetails.incomeStats[incomeTimeRange].percentage}%</div>
                      </div>
                  </div>
              </div>

              {/* 消课数据 */}
              <div className="space-y-5">
                  <div className="flex items-end justify-between">
                      <div>
                          <div className="text-xs font-bold text-gray-500 mb-1">总耗课</div>
                          <div className="text-3xl font-bold font-mono text-gray-900">¥{staffDetails.consumptionStats[incomeTimeRange].total.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] font-bold text-gray-400 mb-1">全馆耗课占比</div>
                          <div className="text-lg font-bold text-gray-900">{staffDetails.consumptionStats[incomeTimeRange].studioPercentage}%</div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-gray-900">趋势对比</div>
                  <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-gray-500">总收入 (¥)</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-black"></span><span className="text-gray-500">总耗课 (¥)</span></div>
                  </div>
              </div>
              <div className="h-48">
                  <Bar 
                      data={{
                          labels: ['W1', 'W2', 'W3', 'W4'],
                          datasets: [
                              {
                                  label: '底薪',
                                  data: [2000, 2000, 2000, 2000],
                                  backgroundColor: '#A7F3D0',
                                  stack: 'Income',
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              },
                              {
                                  label: '提成',
                                  data: [3000, 4000, 2000, 3000],
                                  backgroundColor: '#6EE7B7',
                                  stack: 'Income',
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              },
                              {
                                  label: '小班课时费',
                                  data: [4000, 5000, 3000, 3000],
                                  backgroundColor: '#34D399',
                                  stack: 'Income',
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              },
                              {
                                  label: '私教课时费',
                                  data: [3000, 4000, 4000, 10000],
                                  backgroundColor: '#10B981',
                                  stack: 'Income',
                                  borderRadius: { topLeft: 4, topRight: 4 },
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              },
                              {
                                  label: '工作坊耗课',
                                  data: [2000, 1000, 2000, 2000],
                                  backgroundColor: '#E5E7EB',
                                  stack: 'Consumption',
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              },
                              {
                                  label: '私教耗课',
                                  data: [5000, 6000, 4000, 5000],
                                  backgroundColor: '#9CA3AF',
                                  stack: 'Consumption',
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              },
                              {
                                  label: '小班耗课',
                                  data: [4000, 5000, 3000, 3000],
                                  backgroundColor: '#111827',
                                  stack: 'Consumption',
                                  borderRadius: { topLeft: 4, topRight: 4 },
                                  barPercentage: 0.5,
                                  categoryPercentage: 0.5,
                              }
                          ]
                      }}
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                              mode: 'index',
                              intersect: false,
                          },
                          plugins: { 
                              legend: { display: false },
                              tooltip: {
                                  enabled: true,
                                  callbacks: {
                                      label: function(context) {
                                          let label = context.dataset.label || '';
                                          if (label) {
                                              label += ': ';
                                          }
                                          if (context.parsed.y !== null) {
                                              label += '¥' + context.parsed.y.toLocaleString();
                                          }
                                          return label;
                                      }
                                  }
                              }
                          },
                          scales: {
                              y: { stacked: true, type: 'linear', position: 'left', beginAtZero: true, grid: { color: '#F3F4F6' }, border: { display: false } },
                              x: { stacked: true, grid: { display: false }, border: { display: false } }
                          }
                      }}
                  />
              </div>
          </div>
      </div>

      {/* 课时核对明细 */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-4">课时核对明细</h4>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                  <thead>
                      <tr className="border-b border-gray-100 text-gray-400">
                          <th className="pb-3 font-medium">日期</th>
                          <th className="pb-3 font-medium">类型</th>
                          <th className="pb-3 font-medium">项目</th>
                          <th className="pb-3 font-medium">课时/数量</th>
                          <th className="pb-3 font-medium text-right">金额 (¥)</th>
                      </tr>
                  </thead>
                  <tbody className="text-gray-900">
                      <tr className="border-b border-gray-50">
                          <td className="py-3">2026-03-15</td>
                          <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">私教课</span></td>
                          <td className="py-3">普拉提大器械</td>
                          <td className="py-3 font-mono">1</td>
                          <td className="py-3 text-right font-mono font-bold">450</td>
                      </tr>
                      <tr className="border-b border-gray-50">
                          <td className="py-3">2026-03-15</td>
                          <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">小班课</span></td>
                          <td className="py-3">流瑜伽进阶</td>
                          <td className="py-3 font-mono">3</td>
                          <td className="py-3 text-right font-mono font-bold">360</td>
                      </tr>
                      <tr className="border-b border-gray-50">
                          <td className="py-3">2026-03-14</td>
                          <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">销售提成</span></td>
                          <td className="py-3">年卡新签</td>
                          <td className="py-3 font-mono text-gray-400">-</td>
                          <td className="py-3 text-right font-mono font-bold">1,200</td>
                      </tr>
                      <tr className="border-b border-gray-50">
                          <td className="py-3">2026-03-12</td>
                          <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">私教课</span></td>
                          <td className="py-3">孕产康复</td>
                          <td className="py-3 font-mono">2</td>
                          <td className="py-3 text-right font-mono font-bold">1,000</td>
                      </tr>
                      <tr>
                          <td className="py-3">2026-03-10</td>
                          <td className="py-3"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">底薪</span></td>
                          <td className="py-3">基本工资</td>
                          <td className="py-3 font-mono text-gray-400">-</td>
                          <td className="py-3 text-right font-mono font-bold">8,000</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
  </div>
);

export default StaffIncomePayrollPanel;

