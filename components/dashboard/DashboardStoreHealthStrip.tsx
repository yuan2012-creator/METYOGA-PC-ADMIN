import React from 'react';
import type { DashboardStoreHealthItem } from './dashboardOperationViewModel';

const STATUS_LABEL: Record<DashboardStoreHealthItem['status'], string> = {
  stable: '稳定',
  attention: '关注',
  risk: '风险',
};

const STATUS_CLASS: Record<DashboardStoreHealthItem['status'], string> = {
  stable: 'is-stable',
  attention: 'is-attention',
  risk: 'is-risk',
};

const DashboardStoreHealthStrip: React.FC<{
  items: DashboardStoreHealthItem[];
  onStoreClick: (storeName: string) => void;
}> = ({ items, onStoreClick }) => (
  <aside className="met-dashboard-store-health met-dashboard-surface">
    <header className="met-dashboard-store-health__head">
      <div>
        <h2>五馆风险热度</h2>
        <p>只看需总部关注的强弱和趋势</p>
      </div>
    </header>
    <ul className="met-dashboard-store-health__list">
      {items.map(item => {
        const fillPct = Math.min(100, 22 + item.issueCount * 14);
        return (
          <li key={item.storeName}>
            <button
              type="button"
              className="met-dashboard-store-health-item"
              onClick={() => onStoreClick(item.storeName)}
            >
              <div className="met-dashboard-store-health-item__left">
                <span className="met-dashboard-store-health-item__name">{item.storeName}</span>
                <span
                  className={`met-dashboard-store-health-item__status ${STATUS_CLASS[item.status]}`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
              <div className="met-dashboard-store-health-item__center">
                <p className="met-dashboard-store-health-item__hint">{item.suggestion}</p>
                <div className="met-dashboard-store-health-item__bar" aria-hidden>
                  <span
                    className={`met-dashboard-store-health-item__bar-fill ${STATUS_CLASS[item.status]}`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
              <span className="met-dashboard-store-health-item__issue">{item.issueCount} 项</span>
            </button>
          </li>
        );
      })}
    </ul>
  </aside>
);

export default DashboardStoreHealthStrip;
