import React, { useEffect, useMemo, useState } from 'react';
import {
  findStaffTeacher,
  type StaffCourseRecord,
  type StaffOperationSnapshot,
} from './staffOperationViewModel';
import { formatStaffCny, formatStaffPercent, formatStaffScore } from './staffFormatters';
import { staffDemoToast } from './staffDemoToast';
import StaffDetailTabs, { type StaffDetailTabId } from './StaffDetailTabs';
import {
  StaffEvidenceChain,
  StaffMeteachBoundary,
  StaffModalBlock,
  StaffModalDl,
  StaffModalPanel,
} from './staffModalShared';

interface StaffDetailModalProps {
  open: boolean;
  teacherId: string | null;
  snapshot: StaffOperationSnapshot;
  onClose: () => void;
  onToast: (message: string) => void;
  initialTab?: StaffDetailTabId;
}

type CourseSubviewFilters = {
  time: string;
  courseType: string;
  store: string;
  status: string;
};

const PAGE_SIZE = 20;

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  open,
  teacherId,
  snapshot,
  onClose,
  onToast,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<StaffDetailTabId>('overview');
  const [courseSubview, setCourseSubview] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [courseFilters, setCourseFilters] = useState<CourseSubviewFilters>({
    time: '全部',
    courseType: '全部',
    store: '全部',
    status: '全部',
  });

  const teacher = useMemo(
    () => (teacherId ? findStaffTeacher(snapshot, teacherId) : undefined),
    [teacherId, snapshot],
  );

  useEffect(() => {
    if (!open) {
      setActiveTab('overview');
      setCourseSubview(false);
      setCoursePage(1);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (courseSubview) {
        setCourseSubview(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, courseSubview, onClose]);

  const filteredCourses = useMemo(() => {
    if (!teacher) return [];
    return teacher.courseRecords.filter(c => {
      if (courseFilters.courseType !== '全部' && c.courseType !== courseFilters.courseType) return false;
      if (courseFilters.store !== '全部' && c.storeName !== courseFilters.store) return false;
      if (courseFilters.status !== '全部' && c.status !== courseFilters.status) return false;
      if (courseFilters.time === '今日' && c.date !== '2026-05-14') return false;
      if (courseFilters.time === '近7天' && !['2026-05-08', '2026-05-09', '2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-14'].includes(c.date))
        return false;
      return true;
    });
  }, [teacher, courseFilters]);

  const coursePageRows = useMemo(() => {
    const start = (coursePage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, coursePage]);

  const courseTotalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));

  if (!open || !teacher) return null;

  const t = teacher;
  const todayCourses = t.courseRecords.filter(c => c.date === '2026-05-14');
  const weekCourses = t.courseRecords.slice(0, 7);
  const chain = ['课程', '完课', '课时费', '成长', '权限'];

  const renderCourseList = (rows: StaffCourseRecord[], limit?: number) => {
    const list = limit ? rows.slice(0, limit) : rows;
    if (list.length === 0) return <p className="met-staff-empty">暂无课程记录</p>;
    return (
      <ul className="met-staff-course-list">
        {list.map(c => (
          <li key={c.id}>
            <span className="met-staff-col-nowrap">
              {c.date} {c.time}
            </span>
            <span>
              {c.courseName} · {c.courseType}
            </span>
            <span>{c.storeName}</span>
            <ChipInline text={c.status} />
          </li>
        ))}
      </ul>
    );
  };

  const renderCoursesTab = () => {
    if (courseSubview) {
      return (
        <StaffModalBlock title="全部课程记录">
          <button type="button" className="met-staff-subview-back" onClick={() => setCourseSubview(false)}>
            ← 返回课程执行
          </button>
          <div className="met-staff-subview-filters">
            <select
              value={courseFilters.time}
              onChange={e => {
                setCourseFilters(f => ({ ...f, time: e.target.value }));
                setCoursePage(1);
              }}
            >
              {['全部', '今日', '近7天'].map(o => (
                <option key={o} value={o}>
                  时间：{o}
                </option>
              ))}
            </select>
            <select
              value={courseFilters.courseType}
              onChange={e => {
                setCourseFilters(f => ({ ...f, courseType: e.target.value }));
                setCoursePage(1);
              }}
            >
              {['全部', '团课', '小班', '私教', '教培'].map(o => (
                <option key={o} value={o}>
                  类型：{o}
                </option>
              ))}
            </select>
            <select
              value={courseFilters.store}
              onChange={e => {
                setCourseFilters(f => ({ ...f, store: e.target.value }));
                setCoursePage(1);
              }}
            >
              {['全部', t.storeName].map(o => (
                <option key={o} value={o}>
                  门店：{o}
                </option>
              ))}
            </select>
            <select
              value={courseFilters.status}
              onChange={e => {
                setCourseFilters(f => ({ ...f, status: e.target.value }));
                setCoursePage(1);
              }}
            >
              {['全部', '待上课', '已完课', '异常'].map(o => (
                <option key={o} value={o}>
                  状态：{o}
                </option>
              ))}
            </select>
          </div>
          {renderCourseList(coursePageRows)}
          <div className="met-staff-pagination">
            <button
              type="button"
              className="met-member-btn-sm"
              disabled={coursePage <= 1}
              onClick={() => setCoursePage(p => p - 1)}
            >
              上一页
            </button>
            <span>
              第 {coursePage} / {courseTotalPages} 页 · 共 {filteredCourses.length} 条
            </span>
            <button
              type="button"
              className="met-member-btn-sm"
              disabled={coursePage >= courseTotalPages}
              onClick={() => setCoursePage(p => p + 1)}
            >
              下一页
            </button>
          </div>
        </StaffModalBlock>
      );
    }

    return (
      <>
        <StaffModalBlock title="今日课程">
          {renderCourseList(todayCourses, 5)}
        </StaffModalBlock>
        <StaffModalBlock title="近 7 天课程">
          {renderCourseList(weekCourses, 5)}
        </StaffModalBlock>
        <StaffModalPanel>
          <StaffModalDl
            rows={[
              { label: '近 30 天上课', value: `${t.monthlySessions} 节` },
              { label: '到课率', value: formatStaffPercent(t.attendanceRate) },
              { label: '满课率', value: formatStaffPercent(t.fillRate) },
              { label: '代课 / 取消 / 异常', value: `${t.leaveRecords.length} 项需关注` },
            ]}
          />
          <p className="met-staff-modal-note">后台不代签到、不补签；签到异常仅展示「需核对」。</p>
          <button type="button" className="met-member-btn-sm" onClick={() => setCourseSubview(true)}>
            查看全部课程记录
          </button>
        </StaffModalPanel>
      </>
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <StaffModalPanel>
              <StaffModalDl
                rows={[
                  { label: '身份与角色', value: `${t.employmentType} · ${t.roleType}` },
                  { label: '当前等级', value: `${t.teacherLevel}（收入线 ${t.incomeLevel}）` },
                  { label: '所属门店', value: t.storeName },
                  { label: '主要课程', value: t.mainCourses },
                  { label: '本月课时', value: `${t.monthlySessions} 节` },
                  { label: '当前风险', value: t.riskTags.join('、') || '—' },
                  { label: '系统建议', value: t.nextAction },
                  { label: '所属店长', value: t.managerName },
                  { label: '教务对接', value: t.academicOwner },
                  { label: '财务对接', value: t.financeOwner },
                ]}
              />
            </StaffModalPanel>
            <p className="met-staff-modal-note">{t.todaySuggestion} · 仅前端演示</p>
          </>
        );
      case 'courses':
        return renderCoursesTab();
      case 'pay':
        return (
          <>
            <StaffModalPanel>
              <StaffModalDl
                rows={[
                  { label: '本月课时费预估', value: formatStaffCny(t.monthlyEstimatedPay) },
                  { label: '团课', value: formatStaffCny(t.groupClassPay) },
                  { label: '小班', value: formatStaffCny(t.smallClassPay) },
                  { label: '私教', value: formatStaffCny(t.privateTrainingRevenue) },
                  { label: '待核金额', value: formatStaffCny(t.pendingPayAmount) },
                ]}
              />
            </StaffModalPanel>
            <StaffModalBlock title="待核 / 异常记录">
              <ul className="met-staff-pay-list">
                {t.payRecords.map(p => (
                  <li key={p.id}>
                    <span>{p.label}</span>
                    <span className="met-staff-col-amount">{formatStaffCny(p.amount)}</span>
                    <ChipInline text={p.status} />
                    <span className="met-staff-table__muted">{p.note}</span>
                  </li>
                ))}
              </ul>
            </StaffModalBlock>
            <p className="met-staff-modal-note">
              课时费以完课、签到、耗课、规则配置为准；本页仅展示预估，待财务复核。
            </p>
          </>
        );
      case 'growth':
        return (
          <>
            <StaffModalPanel>
              <StaffModalDl
                rows={[
                  { label: '当前等级', value: t.teacherLevel },
                  { label: '收入线', value: t.incomeLevel },
                  { label: '当前判断', value: t.growthJudgment },
                  { label: '下一步', value: t.growthNextStep },
                  { label: '满课率', value: formatStaffPercent(t.fillRate) },
                  { label: '私教转化', value: formatStaffPercent(t.privateConversionRate) },
                  { label: '教学质量', value: formatStaffScore(t.memberFeedbackScore) },
                ]}
              />
            </StaffModalPanel>
            <StaffModalBlock title="近 3 个月指标">
              {t.growthRecords.map(g => (
                <p key={g.period} className="met-staff-growth-line">
                  {g.period}：满课 {formatStaffPercent(g.fillRate)} · 转化{' '}
                  {formatStaffPercent(g.privateConversion)} · {g.judgment}（系统建议，需店长复核）
                </p>
              ))}
            </StaffModalBlock>
            <p className="met-staff-modal-note">不做自动定级强结论，晋级 / 保级 / 降级需店长复核。</p>
          </>
        );
      case 'leave':
        return (
          <StaffModalBlock title="请假 / 代课 / 调课">
            {t.leaveRecords.length === 0 ? (
              <p className="met-staff-empty">暂无请假代课记录</p>
            ) : (
              <ul className="met-staff-leave-list">
                {t.leaveRecords.map(l => (
                  <li key={l.id}>
                    <strong>{l.type}</strong> · {l.date} · {l.courseName} · 代课 {l.substituteName} · 影响{' '}
                    {l.affectedMembers} 人 · <ChipInline text={l.status} />
                  </li>
                ))}
              </ul>
            )}
            <p className="met-staff-modal-note">审批与标记处理均为前端演示，未写入真实数据。</p>
          </StaffModalBlock>
        );
      case 'permission':
        return (
          <>
            <StaffModalPanel>
              <StaffModalDl
                rows={[
                  { label: '后台角色', value: t.permissionProfile.backendRole },
                  { label: '后台权限', value: t.permissionProfile.backendScopes.join('、') },
                  { label: '数据范围', value: t.permissionProfile.dataScope },
                  {
                    label: '敏感权限',
                    value: t.permissionProfile.sensitiveFlags.join('、') || '—',
                  },
                  { label: 'METeach', value: t.meteachLabel },
                ]}
              />
            </StaffModalPanel>
            <StaffMeteachBoundary
              visible={t.permissionProfile.teachVisible}
              hidden={t.permissionProfile.teachHidden}
            />
            <StaffModalBlock title="最近权限变更">
              <ul className="met-staff-log-list">
                <li>2026-05-10 · 总部 · 调整后台权限范围（前端演示）</li>
                <li>2026-05-01 · 系统 · 开通 METeach 老师端视图</li>
              </ul>
            </StaffModalBlock>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <button type="button" aria-label="关闭" className="met-staff-modal-overlay" onClick={onClose} />
      <aside className="met-staff-detail-modal" role="dialog" aria-modal aria-labelledby="staff-modal-title">
        <header className="met-staff-detail-header">
          <div className="met-staff-detail-header__row1">
            <span className="met-staff-avatar">{t.avatarText}</span>
            <div className="met-staff-detail-header__identity">
              <h2 id="staff-modal-title">{t.name}</h2>
              <p className="met-staff-detail-header__sub">
                {t.phoneMasked} · {t.teacherId} · {t.storeName}
              </p>
              <div className="met-staff-detail-header__tags">
                <span className="met-staff-chip met-staff-chip--neutral">{t.teacherLevel}</span>
                <span className="met-staff-chip met-staff-chip--neutral">{t.employmentType}</span>
                <span className="met-staff-chip met-staff-chip--neutral">{t.status}</span>
                <span className="met-staff-chip met-staff-chip--ok">{t.meteachLabel}</span>
              </div>
            </div>
            <button type="button" className="met-member-drawer__close" onClick={onClose} aria-label="关闭">
              ×
            </button>
          </div>
          <div className="met-staff-detail-header__suggestion">
            <span className="met-staff-detail-header__dot" aria-hidden />
            <span>{t.todaySuggestion}</span>
          </div>
          <StaffEvidenceChain steps={chain} />
        </header>
        <StaffDetailTabs active={activeTab} onChange={tab => { setActiveTab(tab); setCourseSubview(false); }} />
        <div className="met-staff-detail-body custom-scroll">{renderTab()}</div>
      </aside>
    </>
  );
};

const ChipInline: React.FC<{ text: string }> = ({ text }) => (
  <span className={`met-staff-chip met-staff-chip--${text.includes('待') || text.includes('异常') ? 'pending' : 'ok'}`}>
    {text}
  </span>
);

export default StaffDetailModal;
