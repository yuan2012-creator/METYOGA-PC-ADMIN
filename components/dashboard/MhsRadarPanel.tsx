import React from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import type { MHSData } from '../../types';
import type { DashboardRadarItem } from '../Dashboard';

interface MhsRadarPanelProps {
  radarData: DashboardRadarItem[];
  activeDimension: MHSData;
  onDimensionSelect: (label: string) => void;
}

const getScoreColorClass = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const MhsRadarPanel: React.FC<MhsRadarPanelProps> = ({
  radarData,
  activeDimension,
  onDimensionSelect,
}) => (
  <>
    <div className="w-full lg:w-1/3 p-4 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-100">
      <div className="absolute top-6 left-6 text-sm font-bold text-gray-800">维度诊断</div>
      <div className="absolute top-6 right-6 text-xs text-gray-400 flex items-center gap-1 cursor-pointer hover:text-black">
        点击维度查看详情 <i className="fa-solid fa-hand-pointer text-[10px]"></i>
      </div>
      <div className="h-64 w-full cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid gridType="polygon" stroke="#E5E5E5" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#1D1D1F', fontSize: 11, fontWeight: 'bold' }} 
              onClick={(e) => onDimensionSelect(String(e.value))}
              cursor="pointer"
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="MHS"
              dataKey="A"
              stroke="#000"
              strokeWidth={2}
              fill="#000"
              fillOpacity={0.05}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="w-full lg:w-5/12 p-8 bg-white flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-[#1D1D1F]">{activeDimension.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded text-white font-bold ${getScoreColorClass(activeDimension.score)}`}>
              {activeDimension.score}分
            </span>
          </div>
          <p className="text-xs text-gray-500">{activeDimension.desc}</p>
        </div>
        <button className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">查看报表</button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scroll">
        {activeDimension.metrics.map((metric, idx) => (
          <div key={idx} className="group">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-[#1D1D1F]">{metric.val}</span>
                <div className={`w-2 h-2 rounded-full ${
                  metric.status === 'good' ? 'bg-green-500' : 
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
                }`}></div>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  metric.status === 'good' ? 'bg-black' : 
                  metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
                }`}
                style={{ width: `${metric.score}%` }}
              ></div>
            </div>
            {metric.status !== 'good' && metric.tip && (
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded text-gray-600 flex items-start gap-1.5">
                <i className="fa-solid fa-lightbulb text-yellow-500 mt-0.5"></i>
                <span>{metric.tip}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </>
);

export default MhsRadarPanel;
