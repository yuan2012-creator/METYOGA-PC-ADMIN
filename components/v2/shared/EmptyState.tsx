import React from 'react';
import './emptyState.css';

export type EmptyStateVariant =
  | 'no-data'
  | 'no-results'
  | 'no-permission'
  | 'coming-soon'
  | 'detail-missing'
  | 'load-error';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export interface DrawerEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
  closeLabel?: string;
}

const DEFAULT_DRAWER_TITLE = '暂无详情';
const DEFAULT_DRAWER_DESCRIPTION =
  '请选择一条记录查看详情，或返回上一级页面重新选择。';

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => (
  <div
    className={['met-v2-empty-state', variant ? `met-v2-empty-state--${variant}` : '', className]
      .filter(Boolean)
      .join(' ')}
    role="status"
  >
    <h3 className="met-v2-empty-state__title">{title}</h3>
    {description ? <p className="met-v2-empty-state__description">{description}</p> : null}
    {actionLabel && onAction ? (
      <button type="button" className="met-v2-empty-state__action" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null}
  </div>
);

export const DrawerEmptyState: React.FC<DrawerEmptyStateProps> = ({
  title = DEFAULT_DRAWER_TITLE,
  description = DEFAULT_DRAWER_DESCRIPTION,
  className,
  onClose,
  closeLabel = '关闭',
}) => (
  <div className={['met-v2-drawer-empty', className].filter(Boolean).join(' ')} role="status">
    <h3 className="met-v2-drawer-empty__title">{title}</h3>
    <p className="met-v2-drawer-empty__desc">{description}</p>
    {onClose ? (
      <button type="button" className="met-v2-drawer-footer-btn" onClick={onClose}>
        {closeLabel}
      </button>
    ) : null}
  </div>
);
