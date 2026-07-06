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
  backVariant?: 'default' | 'link';
  secondaryBackLabel?: string;
  onSecondaryBack?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionVariant?: 'primary' | 'ghost';
  headerActions?: React.ReactNode;
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
  backVariant = 'default',
  secondaryBackLabel,
  onSecondaryBack,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionVariant = 'primary',
  headerActions,
  disclaimer,
  roleView,
  updatedAt,
  className,
}) => {
  const backClassName = [
    'met-v2-secondary-header__back',
    backVariant === 'link' ? 'met-v2-secondary-header__back--link' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const showPrimaryAction = primaryActionLabel && onPrimaryAction && !headerActions;

  return (
    <header className={['met-v2-secondary-header', className].filter(Boolean).join(' ')}>
      <div className="met-v2-secondary-header__nav">
        <div className="met-v2-secondary-header__nav-left">
          <button type="button" className={backClassName} onClick={onBack}>
            <ArrowLeft size={16} aria-hidden />
            {backLabel}
          </button>
          {secondaryBackLabel && onSecondaryBack ? (
            <button
              type="button"
              className={[
                'met-v2-secondary-header__back',
                backVariant === 'link' ? 'met-v2-secondary-header__back--link' : '',
                'met-v2-secondary-header__back--secondary',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={onSecondaryBack}
            >
              {secondaryBackLabel}
            </button>
          ) : null}
        </div>
        {headerActions ? (
          <div className="met-v2-secondary-header__actions">{headerActions}</div>
        ) : showPrimaryAction ? (
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
};
