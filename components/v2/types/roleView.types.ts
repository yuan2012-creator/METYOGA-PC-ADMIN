import type { DashboardV2ViewMode } from '../dashboard/dashboardV2.viewModel';
import type { SidebarV2NavId } from '../layout/sidebarV2.config';

export type V2AdminRole = 'hqAdmin' | 'storeManager' | 'opsLead' | 'finance' | 'investor';

export interface V2RoleProfile {
  role: V2AdminRole;
  label: string;
  scopeLabel: string;
  identityTitle: string;
  identitySub: string;
  defaultNav: SidebarV2NavId;
  dashboardViewMode: DashboardV2ViewMode;
  canSwitchDashboardView: boolean;
  switchToast: string;
}

export const V2_ROLE_PROFILES: V2RoleProfile[] = [
  {
    role: 'hqAdmin',
    label: '总部管理员',
    scopeLabel: '全部门店',
    identityTitle: '总部管理员',
    identitySub: '全部门店 · 经营视角',
    defaultNav: 'dashboard-v2',
    dashboardViewMode: 'hq',
    canSwitchDashboardView: true,
    switchToast: '已切换为总部管理员视角',
  },
  {
    role: 'storeManager',
    label: '店长',
    scopeLabel: '滨江馆',
    identityTitle: '店长',
    identitySub: '滨江馆 · 门店视角',
    defaultNav: 'dashboard-v2',
    dashboardViewMode: 'storeManager',
    canSwitchDashboardView: false,
    switchToast: '已切换为店长视角',
  },
  {
    role: 'opsLead',
    label: '运营负责人',
    scopeLabel: '全部门店',
    identityTitle: '运营负责人',
    identitySub: '全部门店 · 经营视角',
    defaultNav: 'dashboard-v2',
    dashboardViewMode: 'hq',
    canSwitchDashboardView: true,
    switchToast: '已切换为运营负责人视角',
  },
  {
    role: 'finance',
    label: '财务',
    scopeLabel: '全部门店',
    identityTitle: '财务',
    identitySub: '全部门店 · 财务视角',
    defaultNav: 'finance',
    dashboardViewMode: 'hq',
    canSwitchDashboardView: false,
    switchToast: '已切换为财务视角',
  },
  {
    role: 'investor',
    label: '投资人只读',
    scopeLabel: '授权门店',
    identityTitle: '投资人只读',
    identitySub: '授权门店 · 只读视角',
    defaultNav: 'dashboard-v2',
    dashboardViewMode: 'hq',
    canSwitchDashboardView: true,
    switchToast: '已切换为投资人只读视角',
  },
];

export const V2_DEFAULT_ROLE: V2AdminRole = 'hqAdmin';

export function getV2RoleProfile(role: V2AdminRole): V2RoleProfile {
  return V2_ROLE_PROFILES.find(item => item.role === role) ?? V2_ROLE_PROFILES[0];
}
