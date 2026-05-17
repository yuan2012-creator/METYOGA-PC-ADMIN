import React from 'react';
import type { MemberRecord } from './memberOperationViewModel';
import {
  MemberModalBlock,
  MemberModalDl,
  MemberModalGrid2,
  MemberModalMiniStat,
  MemberModalMiniStatRow,
  MemberModalPanel,
  MemberModalServiceList,
} from './memberModalShared';
import MemberStageBadge from './MemberStageBadge';

const MemberOverviewTab: React.FC<{ member: MemberRecord }> = ({ member: m }) => {
  const riskLabel = m.riskTags.length ? m.riskTags.map(r => r.type).join('、') : '暂无';

  return (
    <div className="met-member-tab-content">
      <MemberModalBlock title="当前判断">
        <MemberModalGrid2 className="met-member-judgment-grid">
          <MemberModalPanel>
            <MemberModalDl
              rows={[
                { label: 'S 阶段', value: <MemberStageBadge code={m.stageCode} showName /> },
                { label: '当前状态', value: m.lifecycleSubStatus },
                { label: '阶段原因', value: m.stageReason, emphasis: true },
                { label: '下一步目标', value: m.nextStageTarget, emphasis: true },
              ]}
            />
          </MemberModalPanel>
          <MemberModalPanel>
            <p className="met-member-info-card__judgment met-member-info-card__judgment--compact">
              {m.systemJudgment}
            </p>
            <MemberModalDl
              rows={[
                { label: '系统建议', value: m.suggestedAction, emphasis: true },
                { label: '负责人', value: m.manager, emphasis: true },
                { label: '截止时间', value: m.actionDueLabel, emphasis: true },
              ]}
            />
          </MemberModalPanel>
        </MemberModalGrid2>
      </MemberModalBlock>

      <MemberModalBlock title="关键数据">
        <MemberModalMiniStatRow>
          <MemberModalMiniStat label="主资产" value={m.primaryAsset} sub="当前主卡" />
          <MemberModalMiniStat label="剩余权益" value={m.remainingLabel} sub="可约扣点" />
          <MemberModalMiniStat label="最近到课" value={m.lastVisitLabel} sub="活跃度" />
          <MemberModalMiniStat label="当前风险" value={riskLabel} sub="经营关注" />
        </MemberModalMiniStatRow>
      </MemberModalBlock>

      <MemberModalBlock title="服务关系">
        <MemberModalServiceList
          items={[
            { label: '管家', value: m.serviceTeam.ownerButler },
            { label: '店长', value: m.serviceTeam.storeManager },
            { label: '主要老师', value: m.serviceTeam.mainTeachers.join('、') || '—' },
            { label: '私教老师', value: m.serviceTeam.privateCoach ?? '暂无' },
          ]}
        />
      </MemberModalBlock>
    </div>
  );
};

export default MemberOverviewTab;
