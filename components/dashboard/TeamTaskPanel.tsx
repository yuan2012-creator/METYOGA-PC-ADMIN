import React from 'react';
import type { TeamTask } from '../../types';

interface TeamTaskPanelProps {
  tasks: TeamTask[];
}

const TeamTaskPanel: React.FC<TeamTaskPanelProps> = ({ tasks }) => (
  <div className="col-span-4 bg-white rounded-[18px] p-6 shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-[#1D1D1F]">团队今日状态</h3>
      <a href="#" className="text-xs text-blue-600 hover:underline">更多</a>
    </div>
    <div className="space-y-5">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">{task.avatar}</div>
            <div>
              <div className="text-sm font-bold text-[#1D1D1F]">{task.staff} <span className="text-gray-400 font-normal">({task.role})</span></div>
              <div className="text-[10px] text-gray-400">{task.taskName}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-bold ${task.status === 'done' ? 'text-green-600' : 'text-yellow-600'}`}>
              {task.status === 'done' ? '已完成' : `进行中 ${task.progress}%`}
            </div>
            <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-1 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'}`} 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TeamTaskPanel;
