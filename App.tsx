
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import StaffPage from './components/Staff'; // Renamed to avoid conflict with type 'Staff'
import Mall from './components/Mall'; // New Component
import Finance from './components/Finance';
import Marketing from './components/Marketing';
import Data from './components/Data';
import Investor from './components/Investor';
import Partner from './components/Partner';
import Settings from './components/Settings';
import Audit from './components/Audit';
import { DashboardV2Page } from './components/v2/dashboard';
import { TodayV2Page } from './components/v2/today';
import { MemberV2Page } from './components/v2/member';
import { CourseV2Page } from './components/v2/course';
import {
  ModulePlaceholder,
  SIDEBAR_V2_DEFAULT_NAV,
  SidebarV2,
  findSidebarV2NavItem,
  type SidebarV2NavId,
} from './components/v2/layout';
import { MockAdminScopeProvider } from './context/MockAdminScopeContext';
import { MOCK_ADMIN_UI_DEFAULT } from './constants/mockAdminScope';

const SCROLLABLE_NAV_IDS = new Set(['dashboard', 'dashboard-v2', 'today', 'member', 'course']);

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>(SIDEBAR_V2_DEFAULT_NAV);

  const activeNavItem = findSidebarV2NavItem(activeNav);
  const isOldDashboard = activeNav === 'dashboard';
  const shouldShowGlobalHeader = isOldDashboard;

  const contentShellClassName = [
    'met-app-shell-v2__content',
    SCROLLABLE_NAV_IDS.has(activeNav)
      ? 'met-app-shell-v2__content--scroll met-app-shell-v2__custom-scroll'
      : 'met-app-shell-v2__content--fill',
    isOldDashboard ? 'p-8' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleNavigate = (id: SidebarV2NavId) => {
    setActiveNav(id);
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />;
      case 'dashboard-v2':
        return <DashboardV2Page />;
      case 'today':
        return <TodayV2Page />;
      case 'shop':
        return <Shop />;
      case 'staff':
        return <StaffPage />;
      case 'course':
        return <CourseV2Page />;
      case 'mall':
        return <Mall />;
      case 'member':
        return <MemberV2Page />;
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
          <ModulePlaceholder
            title={activeNavItem?.label ?? '模块'}
            onBack={() => setActiveNav(SIDEBAR_V2_DEFAULT_NAV)}
          />
        );
    }
  };

  return (
    <MockAdminScopeProvider initialConfig={MOCK_ADMIN_UI_DEFAULT}>
      <div className="met-app-shell-v2">
        <SidebarV2 activeNav={activeNav} onNavigate={handleNavigate} />

        <main className="met-app-shell-v2__main">
          {shouldShowGlobalHeader ? (
            <header className="met-appshell-header">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <h2 className="met-appshell-header__title">经营总览</h2>
                <span className="met-status-tag">
                  <span className="met-status-tag__dot" aria-hidden />
                  营业中
                </span>
              </div>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <i
                    className="fa-solid fa-magnifying-glass met-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    aria-hidden
                  />
                  <input
                    type="search"
                    placeholder="全局搜索"
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
      </div>
    </MockAdminScopeProvider>
  );
};

export default App;
