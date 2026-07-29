import type { ScheduleEvent } from './courseSelectors';

export type PublishValidationResult = {
  valid: boolean;
  missingFields: string[];
  reason?: string;
};

export type PublishInvalidItem = {
  id: string;
  name: string;
  missingFields: string[];
  reason?: string;
};

export type PublishScheduleResult = {
  nextEvents: ScheduleEvent[];
  publishedCount: number;
  skippedCount: number;
  invalidCount: number;
  blockedExceptionCount: number;
  invalidItems: PublishInvalidItem[];
};

/** 当前排课是否属于「待发布草稿」（不含已上架、已取消、已完课等） */
export const isScheduleEventPublishDraft = (event: ScheduleEvent): boolean => {
  if (event.status === 'cancelled' || event.status === 'completed') return false;
  if (
    event.publishStatus === 'canceled'
    || event.publishStatus === 'published'
    || event.publishStatus === 'unpublished'
  ) {
    return false;
  }
  return event.publishStatus === 'draft' || event.status === 'draft';
};

const teacherField = (event: ScheduleEvent): string | undefined => {
  const withName = event as ScheduleEvent & { teacherName?: string };
  return withName.teacherName ?? event.teacher;
};

const durationField = (event: ScheduleEvent): number | undefined => {
  const withDm = event as ScheduleEvent & { durationMinutes?: number };
  const v = withDm.durationMinutes ?? event.duration;
  return v;
};

export const validateScheduleEventForPublish = (event: ScheduleEvent): PublishValidationResult => {
  const missingFields: string[] = [];

  const courseIdOk = !!event.courseId?.trim();
  const nameOk = !!event.name?.trim();
  if (!courseIdOk && !nameOk) {
    missingFields.push('课程名称或 courseId');
  }

  const teacher = teacherField(event);
  if (!teacher?.trim() || teacher.trim() === '待定') {
    missingFields.push('teacherName');
  }

  if (event.dayIndex == null || Number.isNaN(Number(event.dayIndex))) {
    missingFields.push('dayIndex');
  }

  if (!event.startTime?.trim()) {
    missingFields.push('startTime');
  }

  const durationVal = durationField(event);
  if (durationVal == null || !Number.isFinite(durationVal) || durationVal <= 0) {
    missingFields.push('duration');
  }

  if (!event.roomId?.trim()) {
    missingFields.push('roomId');
  }

  if (event.capacity == null || !Number.isFinite(event.capacity) || event.capacity <= 0) {
    missingFields.push('capacity');
  }

  const valid = missingFields.length === 0;
  return {
    valid,
    missingFields,
    ...(valid ? {} : { reason: '排课信息不完整' }),
  };
};

const applyPublishedFields = (event: ScheduleEvent): ScheduleEvent => ({
  ...event,
  status: 'published',
  publishStatus: 'published',
  bookingStatus: 'bookable',
  sessionStatus: 'upcoming',
  exceptionStatus: 'none',
  settlementStatus: 'not_started',
});

export const publishScheduleEvents = (events: ScheduleEvent[]): PublishScheduleResult => {
  let publishedCount = 0;
  let skippedCount = 0;
  let invalidCount = 0;
  let blockedExceptionCount = 0;
  const invalidItems: PublishInvalidItem[] = [];
  const nextEvents: ScheduleEvent[] = [];

  for (const event of events) {
    if (!isScheduleEventPublishDraft(event)) {
      skippedCount += 1;
      nextEvents.push(event);
      continue;
    }

    if (event.exceptionStatus != null && event.exceptionStatus !== 'none') {
      blockedExceptionCount += 1;
      skippedCount += 1;
      nextEvents.push(event);
      continue;
    }

    const validation = validateScheduleEventForPublish(event);
    if (!validation.valid) {
      invalidCount += 1;
      invalidItems.push({
        id: event.id,
        name: event.name ?? event.title ?? '未命名场次',
        missingFields: validation.missingFields,
        reason: validation.reason,
      });
      nextEvents.push(event);
      continue;
    }

    publishedCount += 1;
    nextEvents.push(applyPublishedFields(event));
  }

  return {
    nextEvents,
    publishedCount,
    skippedCount,
    invalidCount,
    blockedExceptionCount,
    invalidItems,
  };
};

export const getPublishToastMessage = (result: PublishScheduleResult): string => {
  const { publishedCount, invalidCount, blockedExceptionCount } = result;
  const issueTotal = invalidCount + blockedExceptionCount;

  if (publishedCount > 0 && issueTotal === 0) {
    return `已发布 ${publishedCount} 节课程，会员端展示与通知规则将在后续接入。`;
  }
  if (publishedCount > 0 && issueTotal > 0) {
    return `已发布 ${publishedCount} 节课程，${issueTotal} 节因信息不完整或存在异常未发布。`;
  }
  return '暂无可发布课程，请检查排课信息是否完整。';
};
