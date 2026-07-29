import React, { useState } from 'react';
import type { AlertItem } from '../../types';

interface AlertPanelProps {
  alerts: AlertItem[];
}

type AlertPanelToast = {
  id: number;
  message: string;
};

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const [toast, setToast] = useState<AlertPanelToast | null>(null);

  const showToast = (message: string) => {
    setToast({ id: Date.now(), message });
    window.setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 2400);
  };

  return (
  <div className="col-span-8 bg-white rounded-[18px] p-6 shadow-sm border border-gray-100 relative">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-[#1D1D1F] flex items-center gap-2">
        ⚠️ 智能预警中心
        <button 
          onClick={() => showToast('正在分析门店数据并生成预警…')}
          className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
        >
          <i className="fa-solid fa-bell"></i> 经营预警（演示）
        </button>
      </h3>
      <span className="text-xs text-gray-400">系统自动生成</span>
    </div>
    <div className="space-y-4">
      {alerts.map((alertItem) => (
        <div key={alertItem.id} className={`flex items-start gap-4 p-4 rounded-xl border ${alertItem.type === 'danger' ? 'bg-red-50/50 border-red-100' : 'bg-yellow-50/50 border-yellow-100'}`}>
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border flex-shrink-0 ${alertItem.type === 'danger' ? 'text-red-500 border-red-100' : 'text-yellow-600 border-yellow-100'}`}>
            <i className={alertItem.type === 'danger' ? "fa-solid fa-arrow-trend-down" : "fa-regular fa-calendar-xmark"}></i>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">{alertItem.title}</h4>
            <p className="text-xs text-gray-500 mt-1 mb-2">{alertItem.desc}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => showToast(alertItem.type === 'danger' ? '已创建流失挽回任务演示' : '已进入排课调整演示')}
                className={`text-white text-xs px-3 py-1.5 rounded font-medium transition hover:opacity-80 ${alertItem.type === 'danger' ? 'bg-black' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'}`}
              >
                {alertItem.type === 'danger' ? '采纳并创建任务' : '调整排课'}
              </button>
              {alertItem.type === 'danger' && (
                <button
                  onClick={() => showToast('已打开高流失风险会员名单演示')}
                  className="text-xs text-gray-500 hover:text-black hover:underline"
                >
                  查看流失名单
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
    {toast && (
      <div className="absolute top-4 right-4 z-10 bg-white border border-gray-100 shadow-xl rounded-xl px-3 py-2 text-xs font-bold text-gray-800 flex items-center gap-2">
        <i className="fa-solid fa-circle-info text-purple-500"></i>
        {toast.message}
      </div>
    )}
  </div>
  );
};

export default AlertPanel;
