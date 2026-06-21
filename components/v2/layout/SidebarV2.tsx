import React, { useState } from 'react';
import { ArrowLeftRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  SIDEBAR_V2_NAV_ITEMS,
  type SidebarV2NavId,
} from './sidebarV2.config';
import './sidebarV2.css';

export interface SidebarV2Props {
  activeNav: string;
  onNavigate: (id: SidebarV2NavId) => void;
}

const SidebarV2: React.FC<SidebarV2Props> = ({ activeNav, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`met-sidebar-v2${collapsed ? ' is-collapsed' : ''}`}
      aria-label="主导航"
    >
      <div className="met-sidebar-v2__head">
        <div className="met-sidebar-v2__brand">
          <span className="met-sidebar-v2__brand-mark" aria-hidden>
            MET
          </span>
          <span className="met-sidebar-v2__brand-wordmark">MET YOGA</span>
        </div>
        <button
          type="button"
          className="met-sidebar-v2__collapse-btn"
          onClick={() => setCollapsed(value => !value)}
          aria-label={collapsed ? '展开侧栏' : '折叠侧栏'}
          title={collapsed ? '展开侧栏' : '折叠侧栏'}
        >
          {collapsed ? (
            <ChevronsRight size={16} strokeWidth={1.75} aria-hidden />
          ) : (
            <ChevronsLeft size={16} strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>

      <nav className="met-sidebar-v2__nav">
        {SIDEBAR_V2_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`met-sidebar-v2__nav-item${isActive ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="met-sidebar-v2__nav-icon" aria-hidden>
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className="met-sidebar-v2__nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="met-sidebar-v2__footer">
        <button
          type="button"
          className="met-sidebar-v2__identity"
          aria-label="切换身份视角：总部管理员 · 全部门店"
        >
          <span className="met-sidebar-v2__identity-dot" aria-hidden />
          <span className="met-sidebar-v2__identity-copy">
            <span className="met-sidebar-v2__identity-title">总部管理员</span>
            <span className="met-sidebar-v2__identity-sub">全部门店 · 经营视角</span>
          </span>
          <span className="met-sidebar-v2__identity-switch" aria-hidden>
            <ArrowLeftRight size={14} strokeWidth={1.75} />
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarV2;
