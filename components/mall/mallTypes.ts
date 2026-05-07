export type MallModule = 'cards' | 'ttc' | 'points' | 'orders';

export type MallSubView = 'list' | 'edit' | 'students' | 'contract_create';

export type MallActionType = 'card' | 'ttc_course' | 'ttc_tutor' | 'product';

export type MallDuplicableActionType = Exclude<MallActionType, 'ttc_tutor'>;

export type CardEditCategory = 'stored_value' | 'term';

export type PointProductTab = 'course' | 'physical';

export type MallOverviewModule = 'cards' | 'ttc' | 'points';
