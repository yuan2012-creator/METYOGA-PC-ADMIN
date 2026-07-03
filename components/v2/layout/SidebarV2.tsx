import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  SIDEBAR_V2_NAV_ITEMS,
  type SidebarV2NavId,
} from './sidebarV2.config';
import {
  V2_ROLE_PROFILES,
  getV2RoleProfile,
  type V2AdminRole,
} from '../types/roleView.types';
import './sidebarV2.css';

export interface SidebarV2Props {
  activeNav: string;
  onNavigate: (id: SidebarV2NavId) => void;
  currentRole: V2AdminRole;
  onRoleChange: (role: V2AdminRole) => void;
}

const SidebarV2: React.FC<SidebarV2Props> = ({
  activeNav,
  onNavigate,
  currentRole,
  onRoleChange,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const identityRef = useRef<HTMLDivElement>(null);
  const roleProfile = getV2RoleProfile(currentRole);

  const closeRoleMenu = useCallback(() => setRoleMenuOpen(false), []);

  useEffect(() => {
    if (!roleMenuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!identityRef.current?.contains(event.target as Node)) {
        closeRoleMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRoleMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeRoleMenu, roleMenuOpen]);

  const handleRoleSelect = (role: V2AdminRole) => {
    if (role !== currentRole) onRoleChange(role);
    closeRoleMenu();
  };

  return (
    <aside
      className={`met-sidebar-v2${collapsed ? ' is-collapsed' : ''}`}
      aria-label="主导航"
    >
      <div className="met-sidebar-v2__head">
        <div className="met-sidebar-v2__brand">
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

      <div className="met-sidebar-v2__footer" ref={identityRef}>
        <button
          type="button"
          className={`met-sidebar-v2__identity${roleMenuOpen ? ' is-open' : ''}`}
          aria-label={`切换身份视角：${roleProfile.identityTitle} · ${roleProfile.identitySub}`}
          aria-expanded={roleMenuOpen}
          aria-haspopup="listbox"
          onClick={() => setRoleMenuOpen(value => !value)}
        >
          <span className="met-sidebar-v2__identity-dot" aria-hidden />
          <span className="met-sidebar-v2__identity-copy">
            <span className="met-sidebar-v2__identity-title">{roleProfile.identityTitle}</span>
            <span className="met-sidebar-v2__identity-sub">{roleProfile.identitySub}</span>
          </span>
          <span className="met-sidebar-v2__identity-switch" aria-hidden>
            <ArrowLeftRight size={14} strokeWidth={1.75} />
          </span>
        </button>

        {roleMenuOpen && !collapsed ? (
          <div className="met-sidebar-v2__role-menu" role="listbox" aria-label="切换角色">
            {V2_ROLE_PROFILES.map(profile => (
              <button
                key={profile.role}
                type="button"
                role="option"
                aria-selected={profile.role === currentRole}
                className={`met-sidebar-v2__role-option${profile.role === currentRole ? ' is-active' : ''}`}
                onClick={() => handleRoleSelect(profile.role)}
              >
                <span className="met-sidebar-v2__role-option-title">{profile.label}</span>
                <span className="met-sidebar-v2__role-option-sub">{profile.scopeLabel}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default SidebarV2;
