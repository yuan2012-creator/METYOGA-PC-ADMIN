import React from 'react';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import type { StaffCoursePerformancePanelProps, TimeRange } from './StaffDetailTypes';

const courseTimeRanges: TimeRange[] = ['week', 'month', 'quarter'];

const StaffCoursePerformancePanel: React.FC<StaffCoursePerformancePanelProps> = ({ staffDetails, courseTimeRange, setCourseTimeRange }) => (

  <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-purple-500"></i> 课型分布与综合评分
          </h4>
          <div className="flex items-center gap-12">
              <div className="w-32 h-32 relative shrink-0">
                  <Doughnut 
                      data={{
                          labels: ['私教课程', '小班课程', '团课课程'],
                          datasets: [{
                              data: [25, 35, 40],
                              backgroundColor: ['#1D1D1F', '#6B7280', '#E5E7EB'],
                              borderWidth: 0,
                          }]
                      }}
                      options={{ cutout: '75%', plugins: { legend: { display: false }, tooltip: {enabled: false} } }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold font-mono text-gray-900">{staffDetails.classHours}</span>
                      <span className="text-[10px] text-gray-400">总课时</span>
                  </div>
              </div>
              <div className="flex-1 space-y-3">
                  <div className="flex justify-between text-sm items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"><span className="text-gray-600 flex items-center gap-2 font-bold text-xs"><span className="w-2.5 h-2.5 rounded-full bg-black"></span>私教课程</span><span className="font-bold font-mono">25%</span></div>
                  <div className="flex justify-between text-sm items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"><span className="text-gray-600 flex items-center gap-2 font-bold text-xs"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>小班课程</span><span className="font-bold font-mono">35%</span></div>
                  <div className="flex justify-between text-sm items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"><span className="text-gray-600 flex items-center gap-2 font-bold text-xs"><span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>团课课程</span><span className="font-bold font-mono">40%</span></div>
              </div>
              <div className="w-px h-24 bg-gray-100 hidden lg:block"></div>
              <div className="shrink-0 flex flex-col items-center justify-center px-4">
                  <div className="text-[10px] text-gray-400 uppercase mb-2 font-bold">综合平均评分</div>
                  <div className="flex items-baseline gap-1">
                      <div className="text-5xl font-bold font-mono text-yellow-500">{staffDetails.rating}</div>
                  </div>
                  <div className="flex gap-1 text-yellow-500 text-xs mt-2">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star-half-stroke"></i>
                  </div>
              </div>
          </div>
      </div>

      {/* 课程表现趋势图 */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-gray-900"></i> 课程表现趋势
              </h4>
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                  {courseTimeRanges.map(range => (
                      <button 
                          key={range}
                          onClick={() => setCourseTimeRange(range)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${courseTimeRange === range ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                          {range === 'week' ? '周' : range === 'month' ? '月' : '季度'}
                      </button>
                  ))}
              </div>
          </div>
          <div className="h-64 w-full">
              <Bar 
                  data={{
                      labels: courseTimeRange === 'week' ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] : courseTimeRange === 'month' ? ['第1周', '第2周', '第3周', '第4周'] : ['一月', '二月', '三月'],
                      datasets: [
                          {
                              type: 'bar' as const,
                              label: '排课数',
                              data: courseTimeRange === 'week' ? [3, 4, 3, 5, 4, 6, 5] : courseTimeRange === 'month' ? [15, 18, 16, 20] : [60, 65, 70],
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              borderColor: 'rgba(0, 0, 0, 0.1)',
                              borderWidth: { top: 1, right: 1, bottom: 0, left: 1 },
                              borderDash: [5, 5],
                              borderRadius: 4,
                              grouped: false,
                              maxBarThickness: 16,
                              order: 2,
                              yAxisID: 'y'
                          },
                          {
                              type: 'bar' as const,
                              label: '开课数',
                              data: courseTimeRange === 'week' ? [2, 4, 3, 4, 4, 5, 5] : courseTimeRange === 'month' ? [12, 16, 15, 18] : [50, 55, 60],
                              backgroundColor: '#1D1D1F',
                              borderRadius: 4,
                              grouped: false,
                              maxBarThickness: 16,
                              order: 1,
                              yAxisID: 'y'
                          },
                          {
                              type: 'line' as const,
                              label: '开课率(%)',
                              data: courseTimeRange === 'week' ? [66, 100, 100, 80, 100, 83, 100] : courseTimeRange === 'month' ? [80, 88, 93, 90] : [83, 84, 85],
                              borderColor: '#3B82F6',
                              backgroundColor: '#3B82F6',
                              borderDash: [5, 5],
                              tension: 0.4,
                              order: 0,
                              yAxisID: 'y1'
                          }
                      ]
                  } as any}
                  options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } },
                          tooltip: {
                              mode: 'index',
                              intersect: false,
                          }
                      },
                      scales: { 
                          y: { 
                              type: 'linear',
                              display: true,
                              position: 'left',
                              beginAtZero: true, 
                              grid: { color: '#F3F4F6' } 
                          }, 
                          y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              beginAtZero: true,
                              max: 100,
                              grid: { drawOnChartArea: false },
                              ticks: {
                                  callback: function(value) {
                                      return value + '%';
                                  }
                              }
                          },
                          x: { 
                              grid: { display: false } 
                          } 
                      }
                  } as any}
              />
          </div>
      </div>

      {/* 画像与排行榜 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 上课风格画像 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col">
              <h4 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-masks-theater text-red-500"></i> 上课风格画像
              </h4>
              <div className="mb-4">
                  <span className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full font-bold border border-red-100 inline-block">
                      活力实战型教练
                  </span>
              </div>
              <div className="w-full flex-1 min-h-[280px] flex justify-center items-center">
                  <Radar 
                      data={{
                          labels: [
                              ['活力动感 85', '高于92%同类'], 
                              ['肢体辅助 60', '低于70%同类'], 
                              ['温和亲和 75', '高于80%同类'], 
                              ['动作实践 90', '高于98%同类'], 
                              ['理论讲解 50', '低于60%同类']
                          ],
                          datasets: [{
                              label: '能力值',
                              data: [85, 60, 75, 90, 50],
                              backgroundColor: 'rgba(255, 77, 79, 0.15)',
                              borderColor: '#FF4D4F',
                              pointBackgroundColor: '#fff',
                              pointBorderColor: '#FF4D4F',
                              pointHoverBackgroundColor: '#fff',
                              pointHoverBorderColor: '#FF4D4F',
                              pointBorderWidth: 2,
                              pointRadius: 5,
                              borderWidth: 2,
                          }]
                      }}
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          layout: {
                              padding: 10
                          },
                          scales: {
                              r: {
                                  angleLines: {
                                      display: true,
                                      color: '#F3F4F6',
                                      borderDash: [5, 5]
                                  },
                                  grid: {
                                      color: '#F3F4F6',
                                      circular: true,
                                      borderDash: [5, 5]
                                  },
                                  pointLabels: {
                                      font: {
                                          size: 11,
                                          weight: 'bold',
                                          family: 'Inter, sans-serif'
                                      },
                                      color: (context) => {
                                          // Make the second line lighter
                                          return context.index !== undefined ? ['#1F2937', '#9CA3AF'] : '#1F2937';
                                      },
                                      padding: 15,
                                      backdropColor: '#ffffff',
                                      backdropPadding: 6,
                                      borderRadius: 8,
                                  },
                                  ticks: {
                                      display: false,
                                      min: 0,
                                      max: 100,
                                      stepSize: 20
                                  }
                              }
                          },
                          plugins: {
                              legend: {
                                  display: false
                              },
                              tooltip: {
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  titleColor: '#1F2937',
                                  bodyColor: '#4B5563',
                                  borderColor: '#F3F4F6',
                                  borderWidth: 1,
                                  padding: 12,
                                  titleFont: { size: 14, weight: 'bold' },
                                  bodyFont: { size: 13 },
                                  displayColors: false,
                                  callbacks: {
                                      title: (context) => {
                                          const label = context[0].label as unknown as string[];
                                          return label[0];
                                      },
                                      label: function(context) {
                                          const label = context.chart.data.labels?.[context.dataIndex] as string[];
                                          return label[1];
                                      }
                                  }
                              }
                          }
                      } as any}
                  />
              </div>
          </div>

          {/* 课程排行榜 */}
          <div className="flex flex-col gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                  <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-fire text-orange-500"></i> 最受欢迎课程
                      </div>
                      <span className="text-xs font-normal text-gray-500">按满座率排序</span>
                  </h4>
                  <div className="space-y-3">
                      {staffDetails.popularCourses.map((c, i) => (
                          <div key={c} onClick={() => alert('进入课程详情页')} className="flex items-center justify-between group cursor-pointer">
                              <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-orange-100 text-orange-600' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
                                      {i+1}
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate max-w-[120px]">{c}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">累计上课 {320 - i * 45} 人</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-sm font-bold text-gray-900">{98 - i * 2}%</div>
                                  <div className="text-[10px] text-gray-400">满座率</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                  <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <i className="fa-solid fa-triangle-exclamation text-blue-500"></i> 最需关注课程
                      </div>
                      <span className="text-xs font-normal text-gray-500">按开课/取消率</span>
                  </h4>
                  <div className="space-y-3">
                      {staffDetails.attentionCourses.map((c, i) => (
                          <div key={c} onClick={() => alert('进入课程详情页')} className="flex items-center justify-between group cursor-pointer">
                              <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                                      {i+1}
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[120px]">{c}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{i === 0 ? '近期取消较多' : '开课率偏低'}</div>
                                  </div>
                              </div>
                              <div className="text-right flex gap-3">
                                  <div>
                                      <div className="text-sm font-bold text-gray-900">{i === 0 ? '65%' : '45%'}</div>
                                      <div className="text-[10px] text-gray-400">开课率</div>
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-red-500">{i === 0 ? '15%' : '8%'}</div>
                                      <div className="text-[10px] text-gray-400">取消率</div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* 历史课程与评价 */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <i className="fa-solid fa-book-open text-gray-500"></i> 历史课程与评价
          </h4>
          <div className="space-y-3">
              {staffDetails.historicalCourses.map((c, i) => (
                  <div key={i} onClick={() => alert('查看上课学员')} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 text-sm font-bold shadow-sm border border-gray-100">{i+1}</div>
                          <div>
                              <div className="text-sm font-bold text-gray-900">{c.name}</div>
                              <div className="text-[10px] text-gray-400 mt-1">最后开课: {c.date}</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-8">
                          <div className="text-xs text-gray-500 text-right"><div className="font-bold text-gray-900 text-sm">{c.count}</div> 累计节数</div>
                          <div className="text-xs font-bold text-orange-500 flex items-center gap-1.5 w-16 justify-end text-lg"><i className="fa-solid fa-star"></i> {c.rating}</div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  </div>
);

export default StaffCoursePerformancePanel;
