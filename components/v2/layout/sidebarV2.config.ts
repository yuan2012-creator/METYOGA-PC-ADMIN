import type { LucideIcon } from 'lucide-react';
import {
  CalendarCheck,
  CalendarDays,
  Gift,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Settings,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react';

/** V2 主导航 id（经营总览沿用 dashboard-v2，界面文案为「经营总览」） */
export type SidebarV2NavId =
  | 'dashboard-v2'
  | 'today'
  | 'member'
  | 'course'
  | 'staff'
  | 'finance'
  | 'product-rights'
  | 'marketing'
  | 'research-center'
  | 'settings';

export interface SidebarV2NavItem {
  id: SidebarV2NavId;
  label: string;
  icon: LucideIcon;
}

export const SIDEBAR_V2_NAV_ITEMS: SidebarV2NavItem[] = [
  { id: 'dashboard-v2', label: '经营总览', icon: LayoutDashboard },
  { id: 'today', label: '今日运营', icon: CalendarCheck },
  { id: 'member', label: '会员经营', icon: UserRound },
  { id: 'course', label: '课程与排课', icon: CalendarDays },
  { id: 'staff', label: '师资与团队', icon: UsersRound },
  { id: 'finance', label: '财务与资产', icon: WalletCards },
  { id: 'product-rights', label: '产品与权益', icon: Gift },
  { id: 'marketing', label: '活动与获客', icon: Megaphone },
  { id: 'research-center', label: '研学中心', icon: GraduationCap },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export const SIDEBAR_V2_DEFAULT_NAV: SidebarV2NavId = 'dashboard-v2';

export function findSidebarV2NavItem(id: string): SidebarV2NavItem | undefined {
  return SIDEBAR_V2_NAV_ITEMS.find(item => item.id === id);
}
