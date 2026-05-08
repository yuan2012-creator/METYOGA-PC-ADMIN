import React from 'react';
import { getNextStaffLevel } from '../../../utils/staffSelectors';
import type { StaffDetailPanelProps } from './StaffDetailTypes';

const StaffGrowthPromotionPanel: React.FC<StaffDetailPanelProps> = ({ staffDetails }) => (

  <div className="space-y-6 animate-fadeIn">
      {/* Level Header: Growth Line */}
      <div className="bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="shrink-0">
              <h4 className="text-xs font-bold text-gray-900">成长进度</h4>
              <div className="text-[10px] text-gray-500 mt-0.5">当前等级: {staffDetails.level.toUpperCase()}</div>
          </div>
          
          <div className="flex-1 flex items-center gap-4">
              <button className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-900 hover:text-gray-600 transition-colors">
                  <i className="fa-solid fa-chevron-left text-[8px]"></i>
                  <span>{staffDetails.level.toUpperCase()}</span>
              </button>
              
              <div className="flex-1 relative flex items-center">
                  <div className="w-full bg-gray-100 rounded-full h-1">
                      <div className="bg-black h-1 rounded-full relative" style={{ width: '75%' }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-black rounded-full shadow-sm"></div>
                      </div>
                  </div>
              </div>

              <button className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors">
                  <span>{getNextStaffLevel(staffDetails.level)}</span>
                  <i className="fa-solid fa-chevron-right text-[8px]"></i>
              </button>
          </div>

          <div className="shrink-0 text-right">
              <div className="text-lg font-bold font-mono text-gray-900 leading-none">75<span className="text-[10px] text-gray-400 ml-0.5">%</span></div>
              <div className="text-[9px] text-gray-500 mt-1">距离晋升 {getNextStaffLevel(staffDetails.level)}</div>
          </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 gap-4">
          {/* Card 2: SCC% 经营能力 (Horizontal) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <i className="fa-solid fa-chart-pie text-gray-900"></i> SCC 经营能力
              </h4>
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Half Circle Gauge */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="relative w-48 h-24 overflow-hidden">
                          {/* Background Arc */}
                          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[14px] border-gray-100 border-b-transparent border-r-transparent transform -rotate-45"></div>
                          {/* Progress Arc (Orange for warning, Red for danger, Green for success) */}
                          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[14px] border-orange-500 border-b-transparent border-r-transparent transform -rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(-45deg) rotate(17.9deg)' }}></div>
                          
                          {/* Center Text */}
                          <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center justify-end pb-2">
                              <div className="flex items-center gap-1.5">
                                  <span className="text-3xl font-bold text-gray-900">17.9%</span>
                                  <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded flex items-center"><i className="fa-solid fa-arrow-up text-[8px]"></i></span>
                              </div>
                          </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">目标: 20% (预警状态)</div>
                  </div>

                  {/* 3 Metrics */}
                  <div className="flex-1 w-full space-y-4">
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                          <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                              <span className="font-medium text-gray-700">耗课金额 <span className="text-xs text-gray-400 ml-1">(50%)</span></span>
                          </div>
                          <span className="font-bold text-gray-900">¥12,500</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                          <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-300"></div>
                              <span className="font-medium text-gray-700">续费贡献 <span className="text-xs text-gray-400 ml-1">(30%)</span></span>
                          </div>
                          <span className="font-bold text-gray-900">¥5,200</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                              <span className="font-medium text-gray-700">新客转化 <span className="text-xs text-gray-400 ml-1">(20%)</span></span>
                          </div>
                          <span className="font-bold text-gray-900">¥2,800</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Card 3: 3 Columns Stats */}
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Col 1 */}
          <div className="pt-4 md:pt-0 md:px-4 first:pt-0 first:px-0">
              <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-800">团体课</span>
                  <i className="fa-solid fa-users text-gray-900"></i>
              </div>
              <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">42 <span className="text-lg text-gray-400 font-normal">/ 50</span></div>
                  <div className="text-[10px] text-gray-500">本月课量</div>
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">满课率 (Occupancy)</span>
                      <span className="font-bold text-gray-900">78%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">主修方向</span>
                      <span className="font-bold text-gray-900">Flow / Reformer</span>
                  </div>
              </div>
          </div>
          {/* Col 2 */}
          <div className="pt-4 md:pt-0 md:px-4">
              <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-800">私教课</span>
                  <i className="fa-regular fa-user text-gray-900"></i>
              </div>
              <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">28</div>
                  <div className="text-[10px] text-gray-500">活跃会员</div>
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">收入目标</span>
                      <span className="font-bold text-gray-900">¥18,500 / 22k</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">案例积累进度</span>
                      <span className="font-bold text-gray-900">8 / 10 已完成</span>
                  </div>
              </div>
          </div>
          {/* Col 3 */}
          <div className="pt-4 md:pt-0 md:px-4">
              <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-800">教学质量</span>
                  <i className="fa-regular fa-star text-gray-900"></i>
              </div>
              <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900">4.92</div>
                  <div className="text-[10px] text-gray-500">平均评分</div>
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">投诉 (去年)</span>
                      <span className="font-bold text-gray-900">0</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">留存率</span>
                      <span className="font-bold text-gray-900">92%</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Scorecard Table */}
      <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
              <div>
                  <h3 className="text-lg font-bold text-gray-900">晋升资格记分卡</h3>
                  <div className="text-xs text-gray-500 mt-1">差距分析: {staffDetails.level.toUpperCase()} → {getNextStaffLevel(staffDetails.level)}</div>
              </div>
              <button className="text-xs font-bold text-gray-900 hover:underline flex items-center gap-1">
                  查看详细标准 <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                          <th className="py-3 px-6 font-medium">指标类别</th>
                          <th className="py-3 px-6 font-medium">{getNextStaffLevel(staffDetails.level)} 晋升标准</th>
                          <th className="py-3 px-6 font-medium">当前实际值</th>
                          <th className="py-3 px-6 font-medium text-center">状态</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-medium text-gray-900">月均授课时长</td>
                          <td className="py-4 px-6 text-gray-600">&gt;= 100 小时</td>
                          <td className="py-4 px-6 font-medium text-gray-900">112 小时</td>
                          <td className="py-4 px-6 text-center"><i className="fa-solid fa-circle-check text-green-700 text-lg"></i></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-medium text-gray-900">经营能力 SCC% (续费)</td>
                          <td className="py-4 px-6 text-gray-600">&gt;= 10%</td>
                          <td className="py-4 px-6 font-medium text-gray-900">7.2%</td>
                          <td className="py-4 px-6 text-center"><i className="fa-solid fa-triangle-exclamation text-red-600 text-lg"></i></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-medium text-gray-900">活跃私教会员</td>
                          <td className="py-4 px-6 text-gray-600">&gt;= 25 位</td>
                          <td className="py-4 px-6 font-medium text-gray-900">28 位</td>
                          <td className="py-4 px-6 text-center"><i className="fa-solid fa-circle-check text-green-700 text-lg"></i></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-medium text-gray-900">深度案例研究</td>
                          <td className="py-4 px-6 text-gray-600">10 份完成</td>
                          <td className="py-4 px-6 font-medium text-gray-900">8 份完成</td>
                          <td className="py-4 px-6 text-center"><i className="fa-solid fa-ellipsis text-red-600 bg-red-100 rounded-full px-1.5 py-0.5 text-sm"></i></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition">
                          <td className="py-4 px-6 font-medium text-gray-900">满意率</td>
                          <td className="py-4 px-6 text-gray-600">&gt;= 90%</td>
                          <td className="py-4 px-6 font-medium text-gray-900">95.4%</td>
                          <td className="py-4 px-6 text-center"><i className="fa-solid fa-circle-check text-green-700 text-lg"></i></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-gray-400"></i> 历史晋级记录
          </h4>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {staffDetails.historicalPromotions.map((promo, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-gray-200 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <i className="fa-solid fa-check text-[10px]"></i>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-gray-900 text-sm">{promo.from} <i className="fa-solid fa-arrow-right text-gray-300 mx-1 text-[10px]"></i> {promo.to}</div>
                              <time className="font-mono text-[10px] text-gray-400">{promo.date}</time>
                          </div>
                          <div className="text-xs text-gray-500">{promo.reason}</div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  </div>
);

export default StaffGrowthPromotionPanel;

