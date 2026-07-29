import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { SIDEBAR_V2_DEFAULT_NAV } from './sidebarV2.config';

interface ModulePlaceholderProps {
  title?: string;
  onBack?: () => void;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title = '模块',
  onBack,
}) => (
  <div className="met-module-placeholder">
    <div className="met-module-placeholder__icon" aria-hidden>
      <LayoutDashboard size={28} strokeWidth={1.5} />
    </div>
    <h2 className="met-module-placeholder__title">{title}</h2>
    <p className="met-module-placeholder__desc">模块母版待建设</p>
    {onBack ? (
      <button type="button" className="met-module-placeholder__btn" onClick={onBack}>
        返回经营总览
      </button>
    ) : null}
  </div>
);

export default ModulePlaceholder;

export { SIDEBAR_V2_DEFAULT_NAV };
