export type SettingsTab = 'salary' | 'course' | 'member' | 'role';
export type CoursePricingType = 'group' | 'private';
export type RoleType = 'system' | 'custom';

export interface TeacherLevel {
    id: number;
    name: string;
    threshold: number;
    baseGroup: number;
    basePrivate: number;
}

export interface CommissionRules {
    trialConversion: number;
    renewal: number;
}

export interface CourseItem {
    id: number;
    name: string;
    points: number;
}

export interface StorePricing {
    id: number;
    name: string;
    group: CourseItem[];
    private: CourseItem[];
}

export interface MemberRules {
    pointsEarnRate: number;
    s5SleepDays: number;
    s6ChurnDays: number;
}

export interface PermissionNode {
    id: string;
    name: string;
    desc?: string;
    isDangerous?: boolean;
}

export interface PermissionModule {
    id: string;
    name: string;
    icon: string;
    nodes: PermissionNode[];
}

export interface SettingsAccount {
    id: number;
    name: string;
    role: string;
    avatar: string;
}

export interface Role {
    id: string;
    name: string;
    desc: string;
    type: RoleType;
    permissions: string[];
    memberIds: number[];
}

export const SETTINGS_TABS: Array<{ id: SettingsTab; label: string }> = [
    { id: 'salary', label: '薪酬与晋升' },
    { id: 'course', label: '课程与定价' },
    { id: 'member', label: '会员权益与积分' },
    { id: 'role', label: '角色与权限' },
];

export const INITIAL_TEACHER_LEVELS: TeacherLevel[] = [
    { id: 1, name: 'T1 初级', threshold: 0, baseGroup: 80, basePrivate: 150 },
    { id: 2, name: 'T2 资深', threshold: 500, baseGroup: 120, basePrivate: 220 },
    { id: 3, name: 'T3 专家', threshold: 1500, baseGroup: 180, basePrivate: 300 },
];

export const INITIAL_COMMISSION_RULES: CommissionRules = {
    trialConversion: 10,
    renewal: 5,
};

export const INITIAL_BASE_POINT_VALUE = 125;
export const INITIAL_ACTIVE_STORE_ID = 1;

export const INITIAL_STORE_PRICING: StorePricing[] = [
    {
        id: 1,
        name: '西湖旗舰馆',
        group: [
            { id: 1, name: '一星课程 (L1)', points: 2 },
            { id: 2, name: '二星课程 (L2)', points: 3 },
            { id: 3, name: '三星课程 (L3)', points: 4 },
        ],
        private: [
            { id: 101, name: '基础私教', points: 4 },
            { id: 102, name: '塑形普拉提', points: 4.5 },
            { id: 103, name: '孕产康复', points: 6 },
        ],
    },
    {
        id: 2,
        name: '城西银泰馆',
        group: [
            { id: 1, name: '一星课程 (L1)', points: 0.5 },
            { id: 2, name: '二星课程 (L2)', points: 1 },
            { id: 3, name: '三星课程 (L3)', points: 1.5 },
        ],
        private: [
            { id: 101, name: '基础私教', points: 3.5 },
            { id: 102, name: '特色私教', points: 4.5 },
        ],
    },
    { id: 3, name: '万象城馆', group: [], private: [] },
    { id: 4, name: '滨江宝龙馆', group: [], private: [] },
    { id: 5, name: '嘉里中心馆', group: [], private: [] },
];

export const INITIAL_MEMBER_RULES: MemberRules = {
    pointsEarnRate: 100,
    s5SleepDays: 30,
    s6ChurnDays: 90,
};

export const SETTINGS_PERMISSION_MODULES: PermissionModule[] = [
    {
        id: 'dashboard',
        name: '首页与数据',
        icon: 'fa-chart-pie',
        nodes: [
            { id: 'view_dashboard', name: '查看首页概览' },
            { id: 'view_data_bi', name: '查看详细BI数据' },
            { id: 'view_investor', name: '查看投资人看板', isDangerous: true },
        ],
    },
    {
        id: 'member',
        name: '会员管理',
        icon: 'fa-users',
        nodes: [
            { id: 'view_member_list', name: '查看会员列表 (脱敏)' },
            { id: 'view_member_detail', name: '查看完整档案 (含联系方式)', isDangerous: true },
            { id: 'edit_member', name: '编辑会员信息' },
            { id: 'export_member', name: '导出会员数据', isDangerous: true },
        ],
    },
    {
        id: 'finance',
        name: '财务中心',
        icon: 'fa-wallet',
        nodes: [
            { id: 'view_revenue', name: '查看营收报表' },
            { id: 'manage_refund', name: '处理退款申请', isDangerous: true },
            { id: 'manage_salary', name: '查看/发放薪资', isDangerous: true },
        ],
    },
    {
        id: 'operation',
        name: '教务运营',
        icon: 'fa-calendar-check',
        nodes: [
            { id: 'manage_schedule', name: '排课与发布' },
            { id: 'check_in', name: '签到消课' },
            { id: 'manage_staff', name: '员工档案管理' },
        ],
    },
];

export const SETTINGS_ACCOUNTS: SettingsAccount[] = [
    { id: 1, name: 'Alexander', role: '总管理员', avatar: 'A' },
    { id: 2, name: 'Sarah', role: '教学总监', avatar: 'S' },
    { id: 3, name: 'Eva', role: '运营管家', avatar: 'E' },
    { id: 4, name: 'Mike', role: '全职老师', avatar: 'M' },
    { id: 5, name: 'Finance01', role: '财务专员', avatar: 'F' },
];

export const INITIAL_ROLES: Role[] = [
    {
        id: 'admin',
        name: '总管理员 (Admin)',
        desc: '拥有系统最高权限，可管理所有模块与配置。',
        type: 'system',
        permissions: ['all'],
        memberIds: [1],
    },
    {
        id: 'manager',
        name: '店长 (Store Manager)',
        desc: '负责单店全面运营，拥有除敏感财务外的管理权限。',
        type: 'custom',
        permissions: [
            'view_dashboard',
            'view_member_list',
            'view_member_detail',
            'edit_member',
            'view_revenue',
            'manage_schedule',
            'check_in',
            'manage_staff',
        ],
        memberIds: [],
    },
    {
        id: 'butler',
        name: '运营管家 (Butler)',
        desc: '负责前台接待、会员维护与日常排课协助。',
        type: 'custom',
        permissions: ['view_member_list', 'edit_member', 'check_in', 'manage_schedule'],
        memberIds: [3],
    },
    {
        id: 'teacher',
        name: '老师/教练 (Teacher)',
        desc: '仅可查看课表、签到以及查看关联学员信息。',
        type: 'custom',
        permissions: ['check_in'],
        memberIds: [2, 4],
    },
    {
        id: 'finance',
        name: '财务 (Finance)',
        desc: '负责账目核对、薪酬计算与退款审核。',
        type: 'custom',
        permissions: ['view_revenue', 'manage_refund', 'manage_salary', 'view_data_bi'],
        memberIds: [5],
    },
];

export const createTeacherLevel = (levels: TeacherLevel[]): TeacherLevel => ({
    id: Math.max(0, ...levels.map(level => level.id)) + 1,
    name: '新等级',
    threshold: 2000,
    baseGroup: 0,
    basePrivate: 0,
});

export const createCourseItem = (items: CourseItem[], type: CoursePricingType): CourseItem => ({
    id: items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : type === 'group' ? 1 : 101,
    name: type === 'group' ? '新团课类型' : '新私教类型',
    points: 0,
});

export const createCustomRole = (name: string): Role => ({
    id: `role_${Date.now()}`,
    name,
    desc: '新创建的角色，请配置权限。',
    type: 'custom',
    permissions: [],
    memberIds: [],
});
