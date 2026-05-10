
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
    { id: 'dashboard', label: '经营总览', icon: 'fa-chart-pie' },
    { id: 'shop', label: '门店管理', icon: 'fa-store' },
    { id: 'staff', label: '师资与团队', icon: 'fa-id-card-clip' },
    { id: 'course', label: '课程运营', icon: 'fa-calendar-check' },
    { id: 'mall', label: '产品与合同', icon: 'fa-bag-shopping' },
    { id: 'member', label: '会员经营', icon: 'fa-users' },
    { id: 'finance', label: '财务管理', icon: 'fa-wallet' },
    { id: 'marketing', label: '活动运营', icon: 'fa-bullhorn' },
    { id: 'data', label: '数据中心', icon: 'fa-chart-line' },
    { id: 'investor', label: '投资测算', icon: 'fa-briefcase' },
    { id: 'settings', label: '规则配置', icon: 'fa-gear' },
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
          <div className="flex flex-col items-center justify-center h-full met-muted animate-fadeIn">
            <div className="met-card mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <i className={`fa-solid ${navItems.find(n => n.id === activeNav)?.icon} text-2xl text-[#202020]`}></i>
            </div>
            <h3 className="text-xl font-bold text-[#202020]">{navItems.find(n => n.id === activeNav)?.label}</h3>
            <p className="mt-2 text-sm">该模块已规划，即将上线</p>
            <button
                type="button"
                className="met-secondary-button mt-6"
                onClick={() => setActiveNav('dashboard')}
            >
                返回经营总览
            </button>
          </div>
        );
    }
  };

  return (
    <div className="met-page-bg flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className="z-20 flex w-64 flex-shrink-0 flex-col border-r bg-[var(--met-sidebar)]"
        style={{ borderColor: 'var(--met-border)' }}
      >
        <div
          className="flex h-16 items-center px-6"
          style={{ borderBottom: '1px solid var(--met-border)' }}
        >
          <i className="fa-solid fa-om mr-3 text-2xl" style={{ color: 'var(--met-accent)' }} aria-hidden />
          <span className="met-brand-wordmark text-lg font-bold text-[#202020]">MET YOGA</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`mb-0.5 flex min-h-[44px] max-h-[48px] w-full items-center rounded-[15px] border border-transparent px-3.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'font-semibold text-[#1F5E3B]'
                    : 'text-[#7B7B76] hover:bg-[var(--met-nav-hover-bg)]'
                }`}
                style={
                  isActive ? { backgroundColor: 'var(--met-nav-active-bg)' } : undefined
                }
              >
                <span
                  className={`mr-3 flex w-6 shrink-0 justify-center text-[1.05rem] leading-none ${
                    isActive ? 'text-[#1F5E3B]' : ''
                  }`}
                  style={!isActive ? { color: '#7E827C' } : undefined}
                  aria-hidden
                >
                  <i className={`fa-solid ${item.icon}`} />
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className="p-4"
          style={{
            borderTop: '1px solid var(--met-border)',
            backgroundColor: 'var(--met-surface)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: 'var(--met-accent)' }}
            >
              运
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-[#202020]">运营管理员</div>
              <div className="met-muted mt-0.5 text-xs leading-snug">总部运营 · 万象城店</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex min-w-0 flex-1 flex-col bg-[var(--met-bg-page)]">
        
        {/* Header (Dynamic based on Page) */}
        {activeNav !== 'member' && activeNav !== 'shop' && activeNav !== 'staff' && activeNav !== 'course' && activeNav !== 'mall' && activeNav !== 'finance' && activeNav !== 'marketing' && activeNav !== 'data' && activeNav !== 'investor' && activeNav !== 'settings' && (
            <header
              className="sticky top-0 z-10 flex h-16 items-center justify-between border-b px-8"
              style={{
                backgroundColor: 'var(--met-surface)',
                borderColor: 'var(--met-border)',
              }}
            >
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-[#202020]">{navItems.find(n => n.id === activeNav)?.label}</h2>
                    {activeNav === 'dashboard' && (
                        <span className="met-status-tag">
                            <span className="met-status-tag__dot" aria-hidden />
                            营业中
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass met-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" aria-hidden />
                        <input
                          type="search"
                          placeholder="全局搜索…"
                          className="w-64 rounded-lg border py-2 pl-9 pr-4 text-sm text-[#202020] outline-none transition-colors"
                          style={{
                            backgroundColor: 'var(--met-bg-page)',
                            borderColor: 'var(--met-border)',
                          }}
                        />
                    </div>
                    <button type="button" className="met-muted relative hover:text-[#202020]" aria-label="通知">
                        <i className="fa-regular fa-bell text-lg" aria-hidden />
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
                    </button>
                </div>
            </header>
        )}

        {/* Dynamic Page Content */}
        <div className={`flex-1 overflow-hidden ${activeNav === 'dashboard' ? 'custom-scroll overflow-y-auto p-8' : ''}`}>
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
