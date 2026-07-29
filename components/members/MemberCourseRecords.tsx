import React from 'react';
import type { CourseRecord } from './memberOperationViewModel';

const blockTitle = 'text-[11px] font-semibold text-[#565D56] mb-2';

const MemberCourseRecords: React.FC<{ records: CourseRecord[]; limit?: number }> = ({
  records,
  limit = 5,
}) => {
  const slice = records.slice(0, limit);
  return (
    <section className="met-member-profile-block">
      <h3 className={blockTitle}>课程记录</h3>
      {slice.length === 0 ? (
        <p className="text-[11px] text-[#9AA39A]">暂无课程记录</p>
      ) : (
        <ul className="space-y-2">
          {slice.map(r => (
            <li key={r.id} className="rounded-lg border border-[#EEF0EC] p-2.5 text-[10px]">
              <p className="font-medium text-[#222622]">
                {r.courseDate} · {r.courseName}
              </p>
              <p className="mt-1 text-[#70776F]">
                {r.courseType} · {r.teacherName} · {r.storeName} {r.roomName}
              </p>
              <p className="mt-0.5 text-[#8A908A]">
                {r.attendanceStatus} · 耗 {r.consumedAssetName} {r.consumedPointsOrTimes}
              </p>
              {r.teacherNote ? <p className="mt-1 text-[#565D56]">老师：{r.teacherNote}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MemberCourseRecords;
