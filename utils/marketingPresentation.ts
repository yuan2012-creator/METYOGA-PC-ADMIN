export type MarketingSubTab = 'campaigns' | 'creatives' | 'coupons';
export type MarketingCreativeType = 'banner' | 'popup' | 'push';
export type MarketingCampaignStatus = '草稿' | '进行中' | '已结束';

export interface MarketingCampaign {
  id: number;
  title: string;
  status: MarketingCampaignStatus;
  dateRange: string;
  image: string;
  views: string;
  signups: number;
  rate: string;
  funnel: {
    pv: number;
    clicks: number;
    leads: number;
    paid: number;
  };
}

export interface MarketingCreativeData {
  title: string;
  desc: string;
  image: string;
}

export interface MarketingCampaignFormState {
  title: string;
  intro: string;
  venue: string;
  startDate: string;
  endDate: string;
  maxPeople: string;
  minPeople: string;
  priceMember: string;
  priceNonMember: string;
  allowPoints: boolean;
  pointsDeductionLimit: string;
  nonMemberAllowed: boolean;
  nonMemberRegStartTime: string;
  guests: number[];
  imageLandscape: string;
  imageSquare: string;
  imageDetail: string;
}

export interface MarketingCoupon {
  name: string;
  value: string;
  condition: string;
  type: string;
  validity: string;
  claimed: number;
}

export interface MarketingCampaignSummary {
  liveCount: number;
  signupCount: number;
  revenueText: string;
  isFallbackRevenue: boolean;
}

export const MARKETING_TABS: Array<{ id: MarketingSubTab; label: string }> = [
  { id: 'campaigns', label: '活动运营' },
  { id: 'creatives', label: '推广素材 (Banner)' },
  { id: 'coupons', label: '优惠券' },
];

export const MARKETING_CREATIVE_IMAGES = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&q=80&w=600',
];

export const INITIAL_MARKETING_CREATIVE_DATA: MarketingCreativeData = {
  title: '夏日焕新 · 普拉提专题',
  desc: '限时 8 折优惠，新老会员皆可参与，感受核心力量的觉醒。',
  image: MARKETING_CREATIVE_IMAGES[2],
};

export const INITIAL_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  { id: 1, title: '夏日清凉瑜伽节', status: '进行中', dateRange: '06.01 - 06.30', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=200', views: '3.2k', signups: 120, rate: '3.8%', funnel: { pv: 3200, clicks: 1200, leads: 286, paid: 120 } },
  { id: 2, title: '新客 9.9 体验课', status: '进行中', dateRange: '长期有效', image: 'https://images.unsplash.com/photo-1544367563-12123d895e29?auto=format&fit=crop&q=80&w=200', views: '8.5k', signups: 450, rate: '5.2%', funnel: { pv: 8500, clicks: 3200, leads: 800, paid: 450 } },
  { id: 3, title: '老带新双人同行', status: '已结束', dateRange: '05.01 - 05.07', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f57a69d7?auto=format&fit=crop&q=80&w=200', views: '1.1k', signups: 40, rate: '3.6%', funnel: { pv: 1100, clicks: 400, leads: 80, paid: 40 } },
];

export const INITIAL_MARKETING_FORM_STATE: MarketingCampaignFormState = {
  title: '',
  intro: '',
  venue: '',
  startDate: '',
  endDate: '',
  maxPeople: '',
  minPeople: '',
  priceMember: '',
  priceNonMember: '',
  allowPoints: false,
  pointsDeductionLimit: '',
  nonMemberAllowed: false,
  nonMemberRegStartTime: '',
  guests: [],
  imageLandscape: '',
  imageSquare: '',
  imageDetail: '',
};

export const MARKETING_COUPONS: MarketingCoupon[] = [
  { name: '新人体验券', value: '¥9.9', condition: '仅限首单', type: '体验券', validity: '有效期 7 天', claimed: 120 },
  { name: '私教立减券', value: '¥100', condition: '满 3000 可用', type: '满减券', validity: '2024.12.31 前有效', claimed: 45 },
  { name: '全场通用折扣', value: '8.8折', condition: '无门槛', type: '折扣券', validity: '限时领取', claimed: 88 },
  { name: '生日礼遇', value: '免费课', condition: '仅限生日月', type: '兑换券', validity: '长期有效', claimed: 12 },
  { name: '周年庆大礼包', value: '¥500', condition: '年卡专用', type: '抵扣券', validity: '2024.06.30 前有效', claimed: 5 },
];

export const getMarketingActionLabel = (subTab: MarketingSubTab): string => {
  if (subTab === 'campaigns') return '创建活动';
  if (subTab === 'creatives') return '新建素材';
  return '创建优惠券';
};

export const getCampaignStatusColor = (status: MarketingCampaignStatus): string => {
  if (status === '进行中') return 'text-green-600';
  if (status === '草稿') return 'text-gray-400';
  return 'text-red-500';
};

export const getCampaignStatusDotClass = (status: MarketingCampaignStatus): string => {
  if (status === '进行中') return 'bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]';
  if (status === '草稿') return 'bg-gray-300';
  return 'bg-red-500';
};

export const buildCampaignDateRange = (startDate: string, endDate: string): string => {
  if (!startDate && !endDate) return '待设置';
  const start = startDate ? startDate.slice(5, 10).replace('-', '.') : '待定';
  const end = endDate ? endDate.slice(5, 10).replace('-', '.') : '待定';
  return `${start} - ${end}`;
};

export const buildMarketingCampaignFromForm = (
  formData: MarketingCampaignFormState,
  status: MarketingCampaignStatus
): MarketingCampaign => ({
  id: Date.now(),
  title: formData.title || '未命名活动',
  status,
  dateRange: buildCampaignDateRange(formData.startDate, formData.endDate),
  image: formData.imageSquare || 'https://via.placeholder.com/200',
  views: '0',
  signups: 0,
  rate: '0%',
  funnel: { pv: 0, clicks: 0, leads: 0, paid: 0 },
});

export const buildMarketingCampaignSummary = (campaigns: MarketingCampaign[]): MarketingCampaignSummary => {
  const liveCampaigns = campaigns.filter(campaign => campaign.status === '进行中');
  const signupCount = campaigns.reduce((sum, campaign) => sum + campaign.signups, 0);
  const fallbackRevenue = liveCampaigns.reduce((sum, campaign) => sum + campaign.funnel.paid * 1200, 0);

  return {
    liveCount: liveCampaigns.length,
    signupCount,
    revenueText: `¥ ${fallbackRevenue.toLocaleString()}`,
    isFallbackRevenue: true,
  };
};
