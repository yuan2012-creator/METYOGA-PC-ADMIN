
import React, { useState } from 'react';
import Members from './components/Members';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import StaffPage from './components/Staff'; // Renamed to avoid conflict with type 'Staff'
import Courses from './components/Courses';
import TodayOperation from './components/TodayOperation';
import Mall from './components/Mall'; // New Component
import Finance from './components/Finance';
import Marketing from './components/Marketing';
import Data from './components/Data';
import Investor from './components/Investor';
import Partner from './components/Partner';
import Settings from './components/Settings';
import Audit from './components/Audit';
import MockSidebarIdentityCard from './components/MockSidebarIdentityCard';
import { SidebarBrandMark, SidebarNavIcon, type SidebarNavIconName } from './components/ui/SidebarNavIcon';
import { MockAdminScopeProvider } from './context/MockAdminScopeContext';
import { MOCK_ADMIN_UI_DEFAULT } from './constants/mockAdminScope';

type NavItem = {
  id: string;
  label: string;
  iconName: SidebarNavIconName;
};

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '经营总览', iconName: 'dashboard' },
    { id: 'today', label: '今日运营', iconName: 'today' },
    { id: 'member', label: '会员经营', iconName: 'members' },
    { id: 'course', label: '课程运营', iconName: 'courses' },
    { id: 'staff', label: '师资与团队', iconName: 'staff' },
    { id: 'mall', label: '产品与合同', iconName: 'products' },
    { id: 'finance', label: '财务管理', iconName: 'finance' },
    { id: 'shop', label: '门店管理', iconName: 'stores' },
    { id: 'marketing', label: '活动运营', iconName: 'marketing' },
    { id: 'settings', label: '规则配置', iconName: 'rules' },
    { id: 'data', label: '数据中心', iconName: 'data' },
    { id: 'investor', label: '投资测算', iconName: 'investment' },
    { id: 'partner', label: '合作与授权', iconName: 'partner' },
    { id: 'permission-audit', label: '权限审计', iconName: 'audit' },
  ];

  const activeNavItem = navItems.find(n => n.id === activeNav);
  const isDashboard = activeNav === 'dashboard';
  /** 仅经营总览使用 App 级顶栏（搜索 / 通知）；今日运营使用页内顶栏并与品牌区对齐。 */
  const shouldShowGlobalHeader = isDashboard;

  const mainShellClassName =
    'relative flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--met-bg-page)]';

  const contentShellClassName = isDashboard
    ? 'custom-scroll min-h-0 flex-1 overflow-y-auto p-8'
    : 'min-h-0 min-w-0 flex-1 overflow-hidden';

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />;
      case 'today':
        return (
          <div className="met-today-page h-full min-h-0 min-w-0">
            <TodayOperation />
          </div>
        );
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
      case 'partner':
        return <Partner />;
      case 'settings':
        return <Settings />;
      case 'permission-audit':
        return <Audit />;
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center met-muted animate-fadeIn">
            <div className="met-card mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              {activeNavItem ? (
                <SidebarNavIcon name={activeNavItem.iconName} className="h-8 w-8 text-[#292524]" />
              ) : null}
            </div>
            <h3 className="text-xl font-bold text-[#202020]">{activeNavItem?.label}</h3>
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
    <MockAdminScopeProvider initialConfig={MOCK_ADMIN_UI_DEFAULT}>
      <div className="met-app-shell flex h-screen overflow-hidden font-sans">
        <aside className="met-sidebar z-20 flex w-[236px] flex-shrink-0 flex-col border-r border-[var(--met-border-shell)]">
          <div className="met-sidebar-brand">
            <span className="met-sidebar-brand-icon" aria-hidden>
              <SidebarBrandMark />
            </span>
            <span className="met-sidebar-brand-wordmark met-brand-wordmark">MET YOGA</span>
          </div>

          <nav className="met-sidebar-nav">
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={`met-sidebar-nav-item${isActive ? ' met-sidebar-nav-item--active' : ''}`}
                >
                  <span className="met-sidebar-nav-icon" aria-hidden>
                    <SidebarNavIcon name={item.iconName} />
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="met-sidebar-footer">
            <MockSidebarIdentityCard />
          </div>
        </aside>

        <main className={mainShellClassName}>
          {shouldShowGlobalHeader ? (
            <header className="met-appshell-header">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <h2 className="met-appshell-header__title">{activeNavItem?.label}</h2>
                {isDashboard ? (
                  <span className="met-status-tag">
                    <span className="met-status-tag__dot" aria-hidden />
                    营业中
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <i
                    className="fa-solid fa-magnifying-glass met-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    aria-hidden
                  />
                  <input
                    type="search"
                    placeholder="全局搜索…"
                    className="w-64 rounded-lg border border-[var(--met-border)] bg-[var(--met-bg-page)] py-2 pl-9 pr-4 text-sm text-[#202020] outline-none transition-colors"
                  />
                </div>
                <button type="button" className="met-muted relative hover:text-[#202020]" aria-label="通知">
                  <i className="fa-regular fa-bell text-lg" aria-hidden />
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" aria-hidden />
                </button>
              </div>
            </header>
          ) : null}

          <div className={contentShellClassName}>{renderContent()}</div>
        </main>

        <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      </div>
    </MockAdminScopeProvider>
  );
};

export default App;
