import React, { useEffect, useState } from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import { lifecycleBadgeClass, riskBadgeClass } from './memberOperationViewModel';
import { isMeaningfulText, MemberAssetDetailSubview } from './memberModalShared';
import MemberAvatar from './MemberAvatar';
import MemberStageBadge from './MemberStageBadge';
import MemberDetailTabs, { type MemberDetailTabId } from './MemberDetailTabs';
import MemberOverviewTab from './MemberOverviewTab';
import MemberPracticeTab from './MemberPracticeTab';
import MemberCoursePrivateTab, { MemberCourseRecordsSubview } from './MemberCoursePrivateTab';
import MemberAssetsTab from './MemberAssetsTab';
import MemberFollowUpTab from './MemberFollowUpTab';
import MemberPointsConsumptionTab from './MemberPointsConsumptionTab';

interface MemberDetailModalProps {
  open: boolean;
  member: MemberRecord | null;
  onClose: () => void;
  onOpenAsset: (assetId: string) => void;
  onAddFollowUp: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  open,
  member,
  onClose,
  onAddFollowUp,
}) => {
  const [tab, setTab] = useState<MemberDetailTabId>('overview');
  const [assetDetailId, setAssetDetailId] = useState<string | null>(null);
  const [courseListOpen, setCourseListOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setTab('overview');
      setAssetDetailId(null);
      setCourseListOpen(false);
    }
  }, [open, member?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (assetDetailId) setAssetDetailId(null);
      else if (courseListOpen) setCourseListOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, assetDetailId, courseListOpen]);

  const handleClose = () => {
    setAssetDetailId(null);
    setCourseListOpen(false);
    onClose();
  };

  if (!open || !member) return null;

  const m = member;
  const riskTags = m.riskTags.filter(r => isMeaningfulText(r.type));
  const assetDetail = assetDetailId ? m.assets.find(a => a.id === assetDetailId) : null;

  return (
    <>
      <button
        type="button"
        aria-label="关闭会员详情"
        className="met-member-modal-overlay"
        onClick={handleClose}
      />
      <aside className="met-member-detail-modal" role="dialog" aria-modal aria-labelledby="member-modal-title">
        <header className="met-member-detail-header">
          <div className="met-member-detail-header__row1">
            <div className="met-member-detail-header__identity">
              <MemberAvatar text={m.avatarText} tone={m.avatarTone} size="md" />
              <div className="met-member-detail-header__identity-text">
                <h2 id="member-modal-title">{m.name}</h2>
                <p>
                  {m.phone} · {m.memberCode}
                </p>
              </div>
            </div>
            <button type="button" className="met-member-drawer__close" onClick={handleClose} aria-label="关闭">
              ×
            </button>
          </div>
          <div className="met-member-detail-header__row2">
            <MemberStageBadge code={m.stageCode} showName />
            {isMeaningfulText(m.lifecycleSubStatus) ? (
              <span className={`met-member-detail-header__badge ${lifecycleBadgeClass(m.lifecycleStage)}`}>
                {m.lifecycleSubStatus}
              </span>
            ) : null}
            {riskTags.slice(0, 1).map(r => (
              <span
                key={`${r.type}-${r.reason}`}
                className={`met-member-detail-header__badge ${riskBadgeClass(r.type)}`}
              >
                {r.type}
              </span>
            ))}
            {isMeaningfulText(m.manager) ? (
              <span className="met-member-detail-header__chip">负责人 {m.manager}</span>
            ) : null}
            {m.practiceProfile && m.teacherSyncProfile ? (
              <span className="met-member-detail-header__chip met-member-detail-header__chip--meteach">
                METeach 同源
              </span>
            ) : null}
          </div>
          <p className="met-member-detail-header__action-bar">
            <span className="met-member-detail-header__action-dot" aria-hidden />
            <span>
              <span className="met-member-detail-header__action-label">今日建议：</span>
              <strong>{m.suggestedAction}</strong>
              {isMeaningfulText(m.suggestedActionReason) ? (
                <span> · {m.suggestedActionReason}</span>
              ) : null}
              {isMeaningfulText(m.actionDueLabel) ? (
                <span>
                  {' '}
                  · <strong>{m.actionDueLabel}</strong>
                </span>
              ) : null}
            </span>
          </p>
        </header>
        <MemberDetailTabs active={tab} onChange={setTab} />
        <div className="met-member-detail-body custom-scroll">
          {tab === 'assets' && assetDetail ? (
            <MemberAssetDetailSubview asset={assetDetail} member={m} onBack={() => setAssetDetailId(null)} />
          ) : tab === 'course' && courseListOpen ? (
            <MemberCourseRecordsSubview
              key={`${m.id}-course-list`}
              member={m}
              onBack={() => setCourseListOpen(false)}
            />
          ) : (
            <>
              {tab === 'overview' && <MemberOverviewTab member={m} />}
              {tab === 'practice' && <MemberPracticeTab member={m} />}
              {tab === 'course' && (
                <MemberCoursePrivateTab member={m} onViewAllCourses={() => setCourseListOpen(true)} />
              )}
              {tab === 'assets' && (
                <MemberAssetsTab member={m} onViewAssetDetail={setAssetDetailId} />
              )}
              {tab === 'followup' && <MemberFollowUpTab member={m} onAddFollowUp={onAddFollowUp} />}
              {tab === 'points' && <MemberPointsConsumptionTab member={m} />}
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default MemberDetailModal;
