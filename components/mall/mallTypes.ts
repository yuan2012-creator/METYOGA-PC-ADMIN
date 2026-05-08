import type { ReactNode } from 'react';
import type { CardProduct, PointProduct } from '../../types';
import type { MallTtcCourse, TTCTutor } from './MallTtc';

export type MallModule = 'cards' | 'ttc' | 'points' | 'orders';

export type MallSubView = 'list' | 'edit' | 'students' | 'contract_create';

export type MallActionType = 'card' | 'ttc_course' | 'ttc_tutor' | 'product';

export type MallDuplicableActionType = Exclude<MallActionType, 'ttc_tutor'>;

export type CardEditCategory = 'stored_value' | 'term';

export type PointProductTab = 'course' | 'physical';

export type MallOverviewModule = 'cards' | 'ttc' | 'points';

export type MallEditableStatus = {
  id?: string;
  name?: string;
  status?: 'active' | 'inactive' | 'draft' | 'archived';
};

export type MallCardActionItem = CardProduct;

export type MallTtcActionItem = MallTtcCourse | TTCTutor;

export type MallPointActionItem = PointProduct;

export type MallEditableItem = MallCardActionItem | MallTtcActionItem | MallPointActionItem;

export type MallDuplicableItem = CardProduct | MallTtcCourse | PointProduct;

export type MallActionButtonRenderer<T extends MallEditableStatus = MallEditableItem> = (
  item: T,
  type: MallActionType
) => ReactNode;

export type MallEditorSetter<T> = (
  value: T | null | ((prev: T | null) => T | null)
) => void;

export type MallCardEditorItem = Partial<CardProduct>;

export type MallPointEditorItem = Partial<PointProduct>;

export type MallTtcEditorItem = Partial<MallTtcCourse & TTCTutor>;

export type MallSelectedItem = MallCardEditorItem | MallTtcEditorItem | MallPointEditorItem | null;
