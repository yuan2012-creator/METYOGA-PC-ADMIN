import React from 'react';
import { ArrowLeft } from 'lucide-react';
import './secondaryPageHeader.css';

export interface SecondaryPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  scope?: string;
  description?: string;
  backLabel: string;
  onBack: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionVariant?: 'primary' | 'ghost';
  disclaimer?: string;
  roleView?: string;
  updatedAt?: string;
  className?: string;
}

export const SecondaryPageHeader: React.FC<SecondaryPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  scope,
  description,
  backLabel,
  onBack,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionVariant = 'primary',
  disclaimer,
  roleView,
  updatedAt,
  className,
}) => (
  <header className={['met-v2-secondary-header', className].filter(Boolean).join(' ')}>
    <div className="met-v2-secondary-header__nav">
      <button type="button" className="met-v2-secondary-header__back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden />
        {backLabel}
      </button>
      {primaryActionLabel && onPrimaryAction ? (
        <div className="met-v2-secondary-header__actions">
          <button
            type="button"
            className={[
              'met-v2-secondary-header__primary',
              primaryActionVariant === 'ghost' ? 'met-v2-secondary-header__primary--ghost' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </button>
        </div>
      ) : null}
    </div>

    {breadcrumb ? <p className="met-v2-secondary-header__breadcrumb">{breadcrumb}</p> : null}

    <div className="met-v2-secondary-header__main">
      <div className="met-v2-secondary-header__copy">
        <h1 className="met-v2-secondary-header__title">{title}</h1>
        {subtitle ? <p className="met-v2-secondary-header__subtitle">{subtitle}</p> : null}
        {scope ? <p className="met-v2-secondary-header__scope">{scope}</p> : null}
        {roleView ? <p className="met-v2-secondary-header__role">{roleView}</p> : null}
        {description ? <p className="met-v2-secondary-header__description">{description}</p> : null}
        {updatedAt ? <p className="met-v2-secondary-header__updated">最近更新：{updatedAt}</p> : null}
      </div>
    </div>

    {disclaimer ? <p className="met-v2-secondary-header__disclaimer">{disclaimer}</p> : null}
  </header>
);
