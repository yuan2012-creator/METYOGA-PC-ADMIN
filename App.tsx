
import React, { useState } from 'react';
import Members from './components/Members';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import StaffPage from './components/Staff'; // Renamed to avoid conflict with type 'Staff'
import Courses from './components/Courses';
import Mall from './components/Mall'; // New Component
import Finance from './components/Finance';
import Marketing from './components/Marketing';
import Data from './components/Data';
import Investor from './components/Investor';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: '首页仪表盘', icon: 'fa-chart-pie' },
    { id: 'shop', label: '店铺管理', icon: 'fa-store' },
    { id: 'staff', label: '员工管理', icon: 'fa-id-card-clip' },
    { id: 'course', label: '课程与排课', icon: 'fa-calendar-check' },
    { id: 'mall', label: '商城管理', icon: 'fa-bag-shopping' }, // New Item
    { id: 'member', label: '会员管理', icon: 'fa-users' },
    { id: 'finance', label: '财务管理', icon: 'fa-wallet' },
    { id: 'marketing', label: '营销活动', icon: 'fa-bullhorn' },
    { id: 'data', label: '数据看板', icon: 'fa-chart-line' },
    { id: 'investor', label: '投资人看板', icon: 'fa-briefcase' },
    { id: 'settings', label: '系统设置', icon: 'fa-gear' }
  ];

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />;
      case 'shop':
        return <Shop />;
      case 'staff':
        return <StaffPage />;
      case 'course':
        return <Courses />;
      case 'mall':
        return <Mall />;
      case 'member':
        return <Members />;
      case 'finance':
        return <Finance />;
      case 'marketing':
        return <Marketing />;
      case 'data':
        return <Data />;
      case 'investor':
        return <Investor />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fadeIn">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <i className={`fa-solid ${navItems.find(n => n.id === activeNav)?.icon} text-3xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{navItems.find(n => n.id === activeNav)?.label}</h3>
            <p className="mt-2 text-sm">该模块已规划，即将上线</p>
            <button 
                className="mt-6 px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-white transition"
                onClick={() => setActiveNav('dashboard')}
            >
                返回首页
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] text-[#1D1D1F] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#FBFBFD] border-r border-[#E5E5E5] flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <i className="fa-solid fa-om text-2xl mr-3"></i>
           <span className="font-bold text-lg tracking-tight">MetYoga</span>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all mb-1 ${
                activeNav === item.id 
                  ? 'bg-[#E5E5EA] text-black font-semibold' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <div className="w-6 text-center mr-3 text-lg"><i className={`fa-solid ${item.icon}`}></i></div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur">
           <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">A</div>
               <div className="flex-1 min-w-0">
                   <div className="text-sm font-bold truncate">Alexander</div>
                   <div className="text-xs text-gray-400">万象城店 · 店长</div>
               </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[#F5F5F7]">
        
        {/* Header (Dynamic based on Page) */}
        {activeNav !== 'member' && activeNav !== 'shop' && activeNav !== 'staff' && activeNav !== 'course' && activeNav !== 'mall' && activeNav !== 'finance' && activeNav !== 'marketing' && activeNav !== 'data' && activeNav !== 'investor' && activeNav !== 'settings' && (
            <header className="h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">{navItems.find(n => n.id === activeNav)?.label}</h2>
                    {activeNav === 'dashboard' && (
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 mb-0.5"></span> 营业中
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input type="text" placeholder="全局搜索..." className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-1 focus:ring-black focus:bg-white transition-all w-64" />
                    </div>
                    <button className="relative text-gray-500 hover:text-black">
                        <i className="fa-regular fa-bell text-lg"></i>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </header>
        )}

        {/* Dynamic Page Content */}
        <div className={`flex-1 overflow-hidden ${activeNav === 'dashboard' ? 'p-8 overflow-y-auto custom-scroll' : ''}`}>
             {renderContent()}
        </div>

      </main>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default App;
