import React, { useCallback, useMemo, useState } from 'react';
import {
  buildMemberOperationSnapshot,
  type ActionQueueItem,
  type FollowUpRecord,
  type MemberRecord,
  type StageCode,
} from './memberOperationViewModel';
import MemberMetricCard from './MemberMetricCard';
import MemberInsightPanel from './MemberInsightPanel';
import MemberListTable from './MemberListTable';
import MemberActionPanel from './MemberActionPanel';
import MemberDetailModal from './MemberDetailModal';
import MemberAssetDrawer from './MemberAssetDrawer';
import MemberFollowUpDrawer, { type FollowUpFormValues } from './MemberFollowUpDrawer';

const MemberOperationDashboard: React.FC = () => {
  const snapshot = useMemo(() => buildMemberOperationSnapshot(), []);
  const [members, setMembers] = useState<MemberRecord[]>(() =>
    snapshot.members.map(m => ({ ...m, followUps: [...m.followUps] })),
  );
  const [queueItems, setQueueItems] = useState<ActionQueueItem[]>(() => [...snapshot.actionQueue]);
  const [modalMemberId, setModalMemberId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpMemberId, setFollowUpMemberId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<{
    lifecycle?: string;
    risk?: string;
    stageCode?: StageCode;
    followToday?: boolean;
  }>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(c => (c === message ? null : c)), 2400);
  };

  const modalMember = useMemo(
    () => members.find(m => m.id === modalMemberId) ?? null,
    [members, modalMemberId],
  );

  const followUpMember = useMemo(
    () => members.find(m => m.id === followUpMemberId) ?? modalMember,
    [members, followUpMemberId, modalMember],
  );

  const assetContext = useMemo(() => {
    if (!selectedAssetId) return { asset: null, member: null };
    for (const m of members) {
      const a = m.assets.find(x => x.id === selectedAssetId);
      if (a) return { asset: a, member: m };
    }
    return { asset: null, member: null };
  }, [members, selectedAssetId]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (listFilter.followToday && !m.needFollowToday) return false;
      if (listFilter.lifecycle && m.lifecycleStage !== listFilter.lifecycle) return false;
      if (listFilter.stageCode && m.stageCode !== listFilter.stageCode) return false;
      if (listFilter.risk && !m.riskTags.some(r => r.type === listFilter.risk)) return false;
      return true;
    });
  }, [members, listFilter]);

  const listMembers =
    listFilter.lifecycle || listFilter.risk || listFilter.stageCode || listFilter.followToday
      ? filteredMembers
      : members;

  const todayItems = useMemo(
    () => queueItems.filter(i => i.group === 'today' && i.status !== '已完成'),
    [queueItems],
  );
  const expiringItems = useMemo(
    () => queueItems.filter(i => i.group === 'expiring' && i.status !== '已完成'),
    [queueItems],
  );
  const highBalanceItems = useMemo(
    () => queueItems.filter(i => i.group === 'highBalance' && i.status !== '已完成'),
    [queueItems],
  );
  const trialItems = useMemo(
    () => queueItems.filter(i => i.group === 'trial' && i.status !== '已完成'),
    [queueItems],
  );
  const managerItems = useMemo(
    () => queueItems.filter(i => i.group === 'manager' && i.status !== '已完成'),
    [queueItems],
  );

  const openMemberModal = (id: string) => {
    setModalMemberId(id);
    setModalOpen(true);
  };

  const closeMemberModal = () => setModalOpen(false);

  const openFollowUp = (id?: string) => {
    const mid = id ?? modalMemberId;
    if (!mid) {
      showToast('请先选择会员');
      return;
    }
    setFollowUpMemberId(mid);
    setFollowUpOpen(true);
  };

  const openAsset = (assetId?: string) => {
    const m = modalMember ?? members.find(x => x.id === modalMemberId);
    const aid = assetId ?? m?.assets[0]?.id;
    if (!aid) {
      showToast('该会员暂无资产');
      return;
    }
    setSelectedAssetId(aid);
    setAssetOpen(true);
  };

  const handleInsightAction = (key: string) => {
    if (key === 'renewal') {
      setListFilter({ stageCode: 'S5', lifecycle: '续费窗口' });
      showToast('已筛选 S5 续费窗口会员');
      return;
    }
    if (key === 'wake') {
      setListFilter({ risk: '高余额低到课', stageCode: 'S6' });
      showToast('已筛选高余额低到课会员');
      return;
    }
    if (key === 'trial') {
      setListFilter({ lifecycle: '体验未成交', stageCode: 'S2' });
      showToast('已筛选 S2 体验未成交会员');
      return;
    }
    if (key === 'manager') {
      setListFilter({ risk: '需店长介入' });
      showToast('已筛选店长介入会员');
    }
  };

  const handleMarkDone = (itemId: string) => {
    setQueueItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, status: '已完成' as const } : i)),
    );
    showToast('已标记为已处理');
  };

  const handleSaveFollowUp = useCallback((values: FollowUpFormValues) => {
    const now = new Date();
    const at = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const record: FollowUpRecord = {
      id: `fu-local-${Date.now()}`,
      at,
      operator: '当前账号',
      type: values.type,
      summary: values.content,
      nextAt: values.nextAt || undefined,
      result: values.result || '已记录',
    };
    setMembers(prev =>
      prev.map(m => (m.id === values.targetId ? { ...m, followUps: [record, ...m.followUps] } : m)),
    );
    setFollowUpOpen(false);
    showToast('跟进记录已保存');
  }, []);

  return (
    <div className="met-today-page met-member-page">
      <header className="met-member-header">
        <div className="met-member-header__left">
          <h1>会员经营</h1>
          <p>管理会员资产、维护节奏、续费机会与流失风险</p>
        </div>
        <div className="met-member-header__actions">
          <button type="button" className="met-today-header-btn" onClick={() => showToast('导出需权限审计')}>
            导出会员数据
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast('新增潜客（演示）')}>
            新增潜客
          </button>
          <button type="button" className="met-today-header-btn" onClick={() => showToast('批量分配管家（演示）')}>
            批量分配管家
          </button>
          <button type="button" className="met-ink-button" onClick={() => openFollowUp()}>
            创建跟进任务
          </button>
        </div>
      </header>

      <section className="met-member-metrics">
        {snapshot.metrics.map(item => (
          <MemberMetricCard key={item.id} item={item} />
        ))}
      </section>

      <MemberInsightPanel tips={snapshot.insights} onAction={handleInsightAction} />

      <div className="met-member-main-grid">
        <MemberListTable
            members={listMembers}
            lifecycleStages={snapshot.lifecycleStages}
            stageCodes={snapshot.stageCodes}
            highlightId={modalOpen ? modalMemberId : null}
            onOpenMember={openMemberModal}
            externalStageCode={listFilter.stageCode}
          />
        <MemberActionPanel
          todayItems={todayItems}
          expiringItems={expiringItems}
          highBalanceItems={highBalanceItems}
          trialItems={trialItems}
          managerItems={managerItems}
          onViewMember={openMemberModal}
          onAddFollowUp={openFollowUp}
          onAssign={() => showToast('分配负责人（演示）')}
          onMarkDone={handleMarkDone}
        />
      </div>

      <MemberDetailModal
        open={modalOpen}
        member={modalMember}
        onClose={closeMemberModal}
        onOpenAsset={openAsset}
        onAddFollowUp={() => openFollowUp()}
      />

      <MemberAssetDrawer
        open={assetOpen}
        asset={assetContext.asset}
        member={assetContext.member}
        onClose={() => setAssetOpen(false)}
      />

      <MemberFollowUpDrawer
        open={followUpOpen}
        member={followUpMember}
        onClose={() => setFollowUpOpen(false)}
        onSave={handleSaveFollowUp}
      />

      {toast ? (
        <div className="met-member-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default MemberOperationDashboard;
