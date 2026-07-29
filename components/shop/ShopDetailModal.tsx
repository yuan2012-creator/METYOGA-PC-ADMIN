import React, { useEffect, useMemo, useState } from 'react';
import { findShopDetail, type ShopOperationSnapshot } from './shopOperationViewModel';
import { SHOP_PREVIEW_TOAST } from './shopDemoToast';
import ShopDetailTabs, { type ShopDetailTabId } from './ShopDetailTabs';
import {
  ShopCostSummary,
  ShopEvidenceChain,
  ShopJudgmentBox,
  ShopModalBlock,
  ShopModalDl,
  ShopModalPanel,
  ShopRoomTable,
  ShopTag,
} from './shopModalShared';

interface ShopDetailModalProps {
  open: boolean;
  entityId: string | null;
  snapshot: ShopOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: ShopDetailTabId;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  open,
  entityId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<ShopDetailTabId>('overview');

  const detail = useMemo(
    () => (entityId ? findShopDetail(snapshot, entityId) : undefined),
    [entityId, snapshot],
  );

  useEffect(() => {
    if (!open) setActiveTab('overview');
    else if (initialTab) setActiveTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !detail) return null;

  const renderOverview = () => (
    <>
      <ShopJudgmentBox hint={detail.judgment} status={detail.status} risk={detail.riskLevel} />
      <ShopModalPanel title="门店基础信息">
        <ShopModalDl
          rows={[
            { label: '门店名称', value: detail.storeName },
            { label: '门店类型', value: detail.storeType },
            { label: '运营状态', value: detail.status },
            { label: '所在区域', value: detail.region },
            { label: '店长', value: detail.manager },
          ]}
        />
      </ShopModalPanel>
      <ShopModalPanel title="今日经营简表">
        <ShopModalDl
          rows={[
            { label: '今日课程', value: `${detail.todayCourses} 节` },
            { label: '今日预约', value: `${detail.todayBookings} 人次` },
            { label: '预计到课', value: `${detail.todayAttendance} 人次` },
            { label: '当前风险', value: detail.currentRisks.filter(r => r !== '—').join(' / ') || '无' },
          ]}
        />
      </ShopModalPanel>
    </>
  );

  const renderCapacity = () => (
    <>
      <ShopModalPanel title="教室容量">
        <ShopRoomTable rooms={detail.rooms} />
      </ShopModalPanel>
      <ShopModalDl
        rows={[
          { label: '晚高峰使用率', value: detail.peakUsage },
          { label: '容量风险提示', value: detail.capacityRisk },
          { label: '排课产能简算', value: detail.capacityEstimate },
        ]}
      />
    </>
  );

  const renderSchedule = () => (
    <ShopModalPanel title="营业与排课">
      <ShopModalDl
        rows={[
          { label: '营业时间', value: detail.businessHours },
          { label: '可排课时间范围', value: detail.classWindow },
          { label: '节假日规则', value: detail.holidayRules },
          { label: '特殊闭馆记录', value: detail.closureNotes },
          { label: '对预约/取消/通知影响', value: detail.scheduleImpact },
        ]}
      />
    </ShopModalPanel>
  );

  const renderStaff = () => (
    <>
      <ShopModalPanel title="员工归属">
        <ShopModalDl
          rows={detail.staffSummary.map(s => ({
            label: s.role,
            value: `${s.count} 人`,
          }))}
        />
        <ShopModalDl
          rows={[
            { label: '跨店权限', value: detail.crossStorePerm },
          ]}
        />
      </ShopModalPanel>
      <ShopModalBlock title="权限边界说明">
        <ul className="met-shop-detail-list">
          {detail.permissionBoundaries.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </ShopModalBlock>
    </>
  );

  const renderCost = () => (
    <ShopModalPanel title="成本与测算">
      <ShopCostSummary detail={detail} />
    </ShopModalPanel>
  );

  const renderQuality = () => (
    <>
      <ShopModalPanel title="质检记录">
        {detail.qualityRecords.length > 0 ? (
          <table className="met-shop-mini-table">
            <thead>
              <tr>
                <th>编号</th>
                <th>类型</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {detail.qualityRecords.map(q => (
                <tr key={q.no}>
                  <td>{q.no}</td>
                  <td>{q.type}</td>
                  <td>{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="met-shop-detail-tip">暂无质检记录</p>
        )}
        <ShopModalDl
          rows={[
            { label: '责任人', value: detail.qualityOwner },
            { label: '截止时间', value: detail.qualityDeadline },
            { label: '风险等级', value: detail.riskLevel },
          ]}
        />
      </ShopModalPanel>
      <ShopModalBlock title="处理建议">
        <ul className="met-shop-detail-list">
          {detail.handleSteps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </ShopModalBlock>
      <ShopModalBlock title="操作日志">
        <ul className="met-shop-detail-list">
          {detail.operationLogs.map(log => (
            <li key={log}>{log}</li>
          ))}
        </ul>
      </ShopModalBlock>
    </>
  );

  const tabBody = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'capacity':
        return renderCapacity();
      case 'schedule':
        return renderSchedule();
      case 'staff':
        return renderStaff();
      case 'cost':
        return renderCost();
      case 'quality':
        return renderQuality();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="met-shop-detail-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="met-shop-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-detail-title"
        onClick={e => e.stopPropagation()}
      >
        <header className="met-shop-detail-header">
          <div className="met-shop-detail-header__main">
            <h2 id="shop-detail-title">{detail.title}</h2>
            <p className="met-shop-detail-header__meta">{detail.subtitle}</p>
            <div className="met-shop-detail-header__chips">
              <ShopTag text={detail.storeType} />
              <ShopTag text={detail.status} />
              <ShopTag text={detail.riskLevel} kind="risk" />
              {detail.affectsScheduling ? (
                <span className="met-shop-detail-chip">影响排课</span>
              ) : (
                <span className="met-shop-detail-chip">筹备中</span>
              )}
            </div>
            <p className="met-shop-detail-header__suggest">
              <span className="met-shop-detail-header__suggest-label">今日建议</span>
              {detail.todaySuggestion}
            </p>
          </div>
          <button type="button" className="met-shop-detail-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <ShopDetailTabs active={activeTab} onChange={setActiveTab} />

        <div className="met-shop-detail-body custom-scroll">
          <ShopModalBlock title="证据链">
            <ShopEvidenceChain steps={detail.evidenceChain} />
          </ShopModalBlock>
          {tabBody()}
        </div>

        <footer className="met-shop-detail-footer">
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`保存配置预览 · ${SHOP_PREVIEW_TOAST}`)}
          >
            保存配置预览
          </button>
          <button
            type="button"
            className="met-today-header-btn"
            onClick={() => onToast(`提交复核预览 · ${SHOP_PREVIEW_TOAST}`)}
          >
            提交复核预览
          </button>
          <button
            type="button"
            className="met-ink-button"
            onClick={() => onToast(`门店规则检查预览 · ${SHOP_PREVIEW_TOAST}`)}
          >
            门店规则检查预览
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default ShopDetailModal;
