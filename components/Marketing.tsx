
import React, { useState } from 'react';
import { MOCK_STAFF_LIST, MOCK_STORE_INFO } from '../constants';
import {
  INITIAL_MARKETING_CAMPAIGNS,
  INITIAL_MARKETING_CREATIVE_DATA,
  INITIAL_MARKETING_FORM_STATE,
  MARKETING_COUPONS,
  MARKETING_CREATIVE_IMAGES,
  MARKETING_TABS,
  buildMarketingCampaignFromForm,
  buildMarketingCampaignSummary,
  getCampaignStatusColor,
  getCampaignStatusDotClass,
  getMarketingActionLabel,
  type MarketingCampaign,
  type MarketingCampaignStatus,
  type MarketingCreativeType,
  type MarketingSubTab,
} from '../utils/marketingPresentation';

type MarketingToastTone = 'info' | 'success';

interface MarketingToast {
  id: number;
  message: string;
  tone: MarketingToastTone;
}

const Marketing: React.FC = () => {
  const [subTab, setSubTab] = useState<MarketingSubTab>('campaigns');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<MarketingToast | null>(null);
  
  // --- Creative State ---
  const [creativeType, setCreativeType] = useState<MarketingCreativeType>('banner');
  const [creativeData, setCreativeData] = useState(INITIAL_MARKETING_CREATIVE_DATA);

  // --- Campaign State ---
  const [campaignList, setCampaignList] = useState<MarketingCampaign[]>(INITIAL_MARKETING_CAMPAIGNS);
  const [activeCampaign, setActiveCampaign] = useState(campaignList[0]);

  // --- New Campaign Form State ---
  const [formData, setFormData] = useState(INITIAL_MARKETING_FORM_STATE);
  const campaignSummary = buildMarketingCampaignSummary(campaignList);

  // --- Helpers ---
  const showToast = (message: string, tone: MarketingToastTone = 'info') => {
    setToast({ id: Date.now(), message, tone });
    window.setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 2400);
  };

  const handleCreateAction = () => {
    if(subTab === 'coupons') showToast('优惠券配置仍为 demo 入口，真实券批次/发放规则待后续接入', 'info');
    else {
        setFormData(INITIAL_MARKETING_FORM_STATE);
        setShowModal(true);
    }
  };

  const handleSaveCampaign = (status: MarketingCampaignStatus) => {
      const newCamp = buildMarketingCampaignFromForm(formData, status);
      setCampaignList([newCamp, ...campaignList]);
      setActiveCampaign(newCamp);
      setShowModal(false);
      showToast(status === '草稿' ? '活动已保存为前端草稿，后端持久化待后续接入' : '活动已进入前端上架演示，真实发布待后续接入', 'success');
  };

  const toggleGuest = (id: number) => {
      if (formData.guests.includes(id)) {
          setFormData({ ...formData, guests: formData.guests.filter(g => g !== id) });
      } else {
          setFormData({ ...formData, guests: [...formData.guests, id] });
      }
  };

  const changeImage = () => {
    const curr = creativeData.image;
    let next = MARKETING_CREATIVE_IMAGES[0];
    if(curr === MARKETING_CREATIVE_IMAGES[0]) next = MARKETING_CREATIVE_IMAGES[1];
    else if(curr === MARKETING_CREATIVE_IMAGES[1]) next = MARKETING_CREATIVE_IMAGES[2];
    setCreativeData({...creativeData, image: next});
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">营销与增长中心</h2>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleCreateAction}
                    className="bg-black text-white text-xs px-5 py-2 rounded-lg font-bold hover:opacity-80 shadow-lg shadow-black/10 transition flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> <span>{getMarketingActionLabel(subTab)}</span>
                </button>
            </div>
        </div>

        {/* Sub Navigation (Unified Segmented Control) */}
        <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                {MARKETING_TABS.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`relative z-10 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${
                            subTab === tab.id 
                            ? 'bg-white text-black shadow-sm font-bold' 
                            : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- TAB: CAMPAIGNS --- */}
                {subTab === 'campaigns' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-2">进行中的活动</div>
                                <div className="text-3xl font-bold text-gray-900">{campaignSummary.liveCount} <span className="text-sm font-normal text-green-600 ml-2">Live</span></div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-2">本月活动报名</div>
                                <div className="text-3xl font-bold text-gray-900">{campaignSummary.signupCount} <span className="text-sm font-normal text-gray-400 ml-2">人次</span></div>
                            </div>
                            <div className="bg-black text-white rounded-2xl p-6 shadow-lg shadow-black/20">
                                <div className="text-xs text-white/60 font-bold uppercase mb-2">营销带来的营收</div>
                                <div className="text-3xl font-bold">{campaignSummary.revenueText}</div>
                                {campaignSummary.isFallbackRevenue && <div className="text-[10px] text-white/50 mt-2">fallback：按活动核销人数估算</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-8 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">活动列表</h3>
                                {campaignList.map(camp => (
                                    <div 
                                        key={camp.id} 
                                        onClick={() => setActiveCampaign(camp)}
                                        className={`bg-white rounded-2xl p-0 flex group cursor-pointer border transition overflow-hidden ${activeCampaign.id === camp.id ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <div className="w-32 bg-gray-200 relative overflow-hidden">
                                            <img src={camp.image} className={`w-full h-full object-cover transition duration-500 ${camp.status === '草稿' ? 'grayscale opacity-50' : 'group-hover:scale-105'}`} alt="" />
                                            {camp.status === '草稿' && <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-500 text-xs bg-white/50 backdrop-blur-sm">未发布</div>}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-lg text-gray-900">{camp.title}</h4>
                                                    <div className={`flex items-center text-xs font-bold ${getCampaignStatusColor(camp.status)}`}>
                                                        <span className={`w-2 h-2 rounded-full mr-1.5 ${getCampaignStatusDotClass(camp.status)}`}></span>
                                                        {camp.status}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{camp.dateRange}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-4">
                                                <div className="text-xs text-gray-500 flex gap-4">
                                                    <span>浏览 <b className="text-black">{camp.views}</b></span>
                                                    <span>报名 <b className="text-black">{camp.signups}</b></span>
                                                    <span>转化率 <b className="text-black">{camp.rate}</b></span>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            showToast(`已打开「${camp.title}」编辑演示`, 'info');
                                                        }}
                                                        className="text-xs border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 bg-white"
                                                    >
                                                        编辑
                                                    </button>
                                                    <button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            showToast(`已进入「${camp.title}」下架确认演示`, 'info');
                                                        }}
                                                        className="text-xs border border-gray-200 px-3 py-1.5 rounded hover:text-red-600 hover:border-red-200 bg-white"
                                                    >
                                                        下架
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="col-span-4">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full sticky top-4">
                                    <div className="mb-6">
                                        <h3 className="font-bold text-lg text-gray-900">转化漏斗追踪</h3>
                                        <p className="text-xs text-gray-400 mt-1">当前分析: <span className="text-black font-bold">{activeCampaign.title}</span></p>
                                    </div>

                                    {activeCampaign.status === '草稿' ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-xs border-2 border-dashed border-gray-100 rounded-xl">
                                            <i className="fa-regular fa-file-lines text-2xl mb-2"></i>
                                            活动暂未发布，无数据
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <div className="relative p-3 bg-gray-50 rounded-lg flex justify-between items-center mb-2">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-gray-200 rounded-lg z-0" style={{width: '100%'}}></div>
                                                    <span className="text-xs font-medium z-10 relative">活动曝光 (PV)</span>
                                                    <span className="text-sm font-bold z-10 relative">{activeCampaign.funnel.pv}</span>
                                                </div>
                                                <div className="flex justify-center"><i className="fa-solid fa-arrow-down text-gray-300 text-xs"></i></div>
                                                
                                                <div className="relative p-3 bg-gray-50 rounded-lg flex justify-between items-center mb-2">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-gray-200 rounded-lg z-0" style={{width: '60%'}}></div>
                                                    <span className="text-xs font-medium z-10 relative">点击查看</span>
                                                    <span className="text-sm font-bold z-10 relative">{activeCampaign.funnel.clicks}</span>
                                                </div>
                                                <div className="flex justify-center"><i className="fa-solid fa-arrow-down text-gray-300 text-xs"></i></div>

                                                <div className="relative p-3 bg-gray-50 rounded-lg flex justify-between items-center mb-2">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-gray-200 rounded-lg z-0" style={{width: '35%'}}></div>
                                                    <span className="text-xs font-medium z-10 relative">报名/领取</span>
                                                    <span className="text-sm font-bold z-10 relative">{activeCampaign.funnel.leads}</span>
                                                </div>
                                                <div className="flex justify-center"><i className="fa-solid fa-arrow-down text-gray-300 text-xs"></i></div>

                                                <div className="relative p-3 bg-green-50 border-2 border-green-100 rounded-lg flex justify-between items-center">
                                                    <div className="absolute left-0 top-0 bottom-0 bg-green-200 rounded-md z-0" style={{width: '20%'}}></div>
                                                    <span className="text-xs font-bold text-green-800 z-10 relative">最终付费/核销</span>
                                                    <span className="text-sm font-bold text-green-800 z-10 relative">{activeCampaign.funnel.paid}</span>
                                                </div>
                                            </div>

                                            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="text-xs font-bold text-gray-400 mb-2">智能洞察</div>
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    该活动从 <span className="font-bold">点击</span> 到 <span className="font-bold">报名</span> 的流失率较高 (45%)。建议优化活动落地页的报名表单，减少填写项。
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: CREATIVES --- */}
                {subTab === 'creatives' && (
                    <div className="grid grid-cols-12 gap-8 animate-fadeIn">
                        
                        <div className="col-span-4 sticky top-4">
                            <div className="bg-white rounded-[3rem] border-8 border-gray-900 h-[680px] overflow-hidden relative shadow-2xl mx-auto w-[340px]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                                
                                <div className="h-full bg-gray-100 relative overflow-y-auto no-scrollbar">
                                    <div className="h-20 bg-white flex items-end pb-2 px-4 font-bold text-sm shadow-sm sticky top-0 z-10">MetYoga</div>
                                    
                                    <div className="p-4 space-y-4">
                                        {creativeType === 'banner' && (
                                            <div className="w-full aspect-[3/1] bg-gray-300 rounded-lg overflow-hidden relative shadow-md transition-all duration-300">
                                                <img src={creativeData.image} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">{creativeData.title}</div>
                                            </div>
                                        )}

                                        {creativeType === 'popup' && (
                                            <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center p-8 backdrop-blur-sm">
                                                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-xs animate-[bounce_1s_ease-out]">
                                                    <div className="h-32 bg-gray-200">
                                                        <img src={creativeData.image} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="p-5 text-center">
                                                        <h3 className="font-bold text-lg mb-1">{creativeData.title}</h3>
                                                        <p className="text-xs text-gray-500 mb-4">{creativeData.desc}</p>
                                                        <button
                                                            onClick={() => showToast('已打开活动弹窗跳转演示', 'info')}
                                                            className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold"
                                                        >
                                                            立即查看
                                                        </button>
                                                    </div>
                                                    <div className="p-3 border-t text-center text-gray-400 text-xs">关闭</div>
                                                </div>
                                            </div>
                                        )}

                                        {creativeType === 'push' && (
                                            <div className="absolute top-14 left-2 right-2 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-200 z-40 flex gap-3 items-start">
                                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white"><i className="fa-solid fa-spa"></i></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="font-bold text-xs text-gray-900">MetYoga</span>
                                                        <span className="text-[10px] text-gray-400">现在</span>
                                                    </div>
                                                    <div className="font-bold text-xs text-gray-800">{creativeData.title}</div>
                                                    <div className="text-xs text-gray-500 leading-tight">{creativeData.desc}</div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="h-24 bg-white rounded-xl shadow-sm"></div>
                                        <div className="h-24 bg-white rounded-xl shadow-sm"></div>
                                        <div className="h-24 bg-white rounded-xl shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center mt-4 text-xs text-gray-400 font-medium">C端样式实时预览</div>
                        </div>

                        <div className="col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                
                                <div className="flex gap-4 mb-8">
                                    <div onClick={() => setCreativeType('banner')} className={`flex-1 p-4 border rounded-xl cursor-pointer transition text-center ${creativeType==='banner' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <i className="fa-regular fa-image text-2xl mb-2"></i>
                                        <div className="text-xs font-bold">横幅 Banner</div>
                                    </div>
                                    <div onClick={() => setCreativeType('popup')} className={`flex-1 p-4 border rounded-xl cursor-pointer transition text-center ${creativeType==='popup' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <i className="fa-regular fa-window-maximize text-2xl mb-2"></i>
                                        <div className="text-xs font-bold">活动弹窗</div>
                                    </div>
                                    <div onClick={() => setCreativeType('push')} className={`flex-1 p-4 border rounded-xl cursor-pointer transition text-center ${creativeType==='push' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <i className="fa-regular fa-bell text-2xl mb-2"></i>
                                        <div className="text-xs font-bold">推送通知</div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">标题文案</label>
                                        <input 
                                            type="text" 
                                            value={creativeData.title}
                                            onChange={(e) => setCreativeData({...creativeData, title: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none"
                                        />
                                    </div>
                                    
                                    {creativeType !== 'banner' && (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase">详细描述</label>
                                            <button 
                                                onClick={() => setCreativeData({...creativeData, desc: '【Gemini AI生成】限时8折！普拉提核心床小班课，专业导师带你唤醒深层肌肉，重塑优雅体态。名额有限，先到先得！'})}
                                                className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline"
                                            >
                                                <i className="fa-solid fa-wand-magic-sparkles"></i> AI 智能生成文案
                                            </button>
                                        </div>
                                        <textarea 
                                            value={creativeData.desc}
                                            onChange={(e) => setCreativeData({...creativeData, desc: e.target.value})}
                                            rows={3} 
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none resize-none"
                                        ></textarea>
                                    </div>
                                    )}

                                    {creativeType !== 'push' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">图片素材</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                                    <img src={creativeData.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <button onClick={changeImage} className="text-xs bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">更换图片</button>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">跳转链接 / 关联活动</label>
                                        <div className="relative">
                                            <select className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none appearance-none">
                                                <option>关联到：夏日清凉瑜伽节</option>
                                                <option>关联到：新客 9.9 体验课</option>
                                                <option>自定义 H5 链接</option>
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                                    <button
                                        onClick={() => showToast('推广素材已保存并发布到演示环境', 'success')}
                                        className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition shadow-lg"
                                    >
                                        保存并发布
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: COUPONS --- */}
                {subTab === 'coupons' && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <button onClick={() => showToast('已筛选全部优惠券，当前仍为前端列表过滤演示', 'info')} className="px-4 py-2 bg-black text-white rounded-full text-xs font-medium">全部 (5)</button>
                                <button onClick={() => showToast('已筛选发放中优惠券', 'info')} className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-full text-xs font-medium hover:bg-gray-50">发放中</button>
                                <button onClick={() => showToast('已筛选已结束优惠券', 'info')} className="px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-full text-xs font-medium hover:bg-gray-50">已结束</button>
                            </div>
                            <button className="bg-white border border-gray-200 text-black text-xs px-4 py-2 rounded-lg font-medium hover:bg-gray-50" onClick={() => showToast('已打开优惠券配置演示入口', 'info')}>+ 新建优惠券</button>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {MARKETING_COUPONS.map((c, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-[#1D1D1F] to-[#434343] text-white rounded-xl p-6 relative shadow-lg transition hover:-translate-y-1 group coupon-mask">
                                    <div
                                        onClick={() => showToast(`已打开「${c.name}」更多操作演示`, 'info')}
                                        className="absolute top-3 right-3 opacity-50 group-hover:opacity-100 transition cursor-pointer text-white"
                                    >
                                        <i className="fa-solid fa-ellipsis"></i>
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-2xl font-bold">{c.value}</div>
                                            <div className="text-xs opacity-80 mt-1">{c.condition}</div>
                                        </div>
                                        <div className="text-[10px] border border-white/30 px-2 py-1 rounded">{c.type}</div>
                                    </div>
                                    <div className="border-t border-white/20 pt-4 mt-2">
                                        <div className="text-sm font-bold mb-1">{c.name}</div>
                                        <div className="flex justify-between items-center text-[10px] opacity-60">
                                            <span>{c.validity}</span>
                                            <span>已领: {c.claimed}</span>
                                        </div>
                                    </div>
                                    <div 
                                        className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur text-center py-2 text-xs font-bold cursor-pointer hover:bg-white/20 transition opacity-0 group-hover:opacity-100" 
                                        onClick={() => showToast(`已打开发放窗口：将 [${c.name}] 发送给指定会员群组`, 'success')}
                                    >
                                        <i className="fa-regular fa-paper-plane mr-1"></i> 定向发放
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* Enhanced Campaign Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
                <div className="bg-white w-[800px] max-h-[85vh] rounded-3xl shadow-2xl z-10 flex flex-col animate-fadeInUp overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <h3 className="text-xl font-bold text-gray-900">新建营销活动</h3>
                        <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition">
                            <i className="fa-solid fa-xmark text-gray-500"></i>
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scroll bg-[#FBFBFD]">
                        <div className="space-y-8">
                            
                            {/* Section 1: Basic Info */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fa-regular fa-pen-to-square text-gray-400"></i> 基础信息
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">活动名称</label>
                                        <input 
                                            type="text" 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none" 
                                            placeholder="请输入活动名称" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">活动介绍</label>
                                        <textarea 
                                            value={formData.intro}
                                            onChange={e => setFormData({...formData, intro: e.target.value})}
                                            rows={3}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none resize-none" 
                                            placeholder="请输入活动详情、亮点等..." 
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">活动地点 (场馆)</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.venue} 
                                                onChange={e => setFormData({...formData, venue: e.target.value})}
                                                className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none appearance-none"
                                            >
                                                <option value="">请选择举办场馆</option>
                                                <option value="met_yoga_xihu">{MOCK_STORE_INFO.name}</option>
                                                {MOCK_STORE_INFO.rooms.map(room => (
                                                    <option key={room.id} value={room.id}>{room.name} ({room.type})</option>
                                                ))}
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Time & Capacity */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fa-regular fa-clock text-gray-400"></i> 时间与名额
                                </h4>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">开始时间</label>
                                        <input 
                                            type="datetime-local" 
                                            value={formData.startDate}
                                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">结束时间</label>
                                        <input 
                                            type="datetime-local" 
                                            value={formData.endDate}
                                            onChange={e => setFormData({...formData, endDate: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">名额上限 (人)</label>
                                        <input 
                                            type="number" 
                                            value={formData.maxPeople}
                                            onChange={e => setFormData({...formData, maxPeople: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none" 
                                            placeholder="例: 20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">最低开班人数</label>
                                        <input 
                                            type="number" 
                                            value={formData.minPeople}
                                            onChange={e => setFormData({...formData, minPeople: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none" 
                                            placeholder="例: 5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Pricing & Participation */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-tag text-gray-400"></i> 活动定价与参与权限
                                </h4>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">会员价 (¥)</label>
                                        <input 
                                            type="number" 
                                            value={formData.priceMember}
                                            onChange={e => setFormData({...formData, priceMember: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none" 
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">非会员价 (¥)</label>
                                        <input 
                                            type="number" 
                                            value={formData.priceNonMember}
                                            onChange={e => setFormData({...formData, priceNonMember: e.target.value})}
                                            className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm outline-none" 
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Points Deduction Row */}
                                    <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setFormData({...formData, allowPoints: !formData.allowPoints})}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.allowPoints ? 'bg-black border-black text-white' : 'bg-white border-gray-300'}`}>
                                                    {formData.allowPoints && <i className="fa-solid fa-check text-xs"></i>}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">允许会员使用积分抵扣</span>
                                            </div>
                                            {formData.allowPoints && (
                                                <div className="flex items-center gap-2 animate-fadeIn">
                                                    <span className="text-[10px] font-bold text-gray-400">抵扣额度 (¥)</span>
                                                    <input 
                                                        type="number" 
                                                        value={formData.pointsDeductionLimit}
                                                        onChange={e => setFormData({...formData, pointsDeductionLimit: e.target.value})}
                                                        placeholder="限额"
                                                        className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-black transition"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Non-Member Participation Row */}
                                    <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setFormData({...formData, nonMemberAllowed: !formData.nonMemberAllowed})}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.nonMemberAllowed ? 'bg-black border-black text-white' : 'bg-white border-gray-300'}`}>
                                                    {formData.nonMemberAllowed && <i className="fa-solid fa-check text-xs"></i>}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">允许非会员报名参加</span>
                                            </div>
                                            {formData.nonMemberAllowed && (
                                                <div className="flex items-center gap-2 animate-fadeIn">
                                                    <span className="text-[10px] font-bold text-gray-400">开放时间</span>
                                                    <input 
                                                        type="datetime-local" 
                                                        value={formData.nonMemberRegStartTime}
                                                        onChange={e => setFormData({...formData, nonMemberRegStartTime: e.target.value})}
                                                        className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold outline-none focus:border-black transition"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Guests */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fa-regular fa-user text-gray-400"></i> 活动嘉宾 / 老师
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.guests.map(id => {
                                        const staff = MOCK_STAFF_LIST.find(s => s.id === id);
                                        return staff ? (
                                            <div key={id} className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-xs">
                                                <img src={staff.avatar} className="w-4 h-4 rounded-full" alt=""/>
                                                <span>{staff.name}</span>
                                                <i className="fa-solid fa-xmark cursor-pointer hover:text-gray-300" onClick={() => toggleGuest(id)}></i>
                                            </div>
                                        ) : null;
                                    })}
                                    {formData.guests.length === 0 && <span className="text-xs text-gray-400 py-1.5">暂无已选嘉宾</span>}
                                </div>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-black rounded-xl text-sm transition outline-none appearance-none"
                                        onChange={(e) => {
                                            if(e.target.value) toggleGuest(parseInt(e.target.value));
                                            e.target.value = "";
                                        }}
                                    >
                                        <option value="">+ 添加嘉宾 (搜索/选择)</option>
                                        {MOCK_STAFF_LIST.filter(s => !formData.guests.includes(s.id)).map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name} - {staff.title}</option>
                                        ))}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none"></i>
                                </div>
                            </div>

                            {/* Section 5: Visuals */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i className="fa-regular fa-image text-gray-400"></i> 活动视觉图
                                </h4>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">活动横图 (列表/Banner)</label>
                                        <div
                                            onClick={() => showToast('已打开活动横图上传演示', 'info')}
                                            className="aspect-[2/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition cursor-pointer group"
                                        >
                                            <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2 group-hover:scale-110 transition"></i>
                                            <span className="text-xs font-bold">点击上传 16:9</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">活动方图 (分享)</label>
                                        <div
                                            onClick={() => showToast('已打开活动方图上传演示', 'info')}
                                            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition cursor-pointer group"
                                        >
                                            <i className="fa-solid fa-cloud-arrow-up text-2xl mb-2 group-hover:scale-110 transition"></i>
                                            <span className="text-xs font-bold">点击上传 1:1</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">活动详情长图</label>
                                    <div
                                        onClick={() => showToast('已打开活动详情图上传演示', 'info')}
                                        className="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition cursor-pointer group"
                                    >
                                        <span className="text-xs font-bold flex items-center gap-2"><i className="fa-solid fa-plus"></i> 添加详情页图片</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
                        <button 
                            onClick={() => handleSaveCampaign('草稿')}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                        >
                            保存到草稿
                        </button>
                        <button 
                            onClick={() => handleSaveCampaign('进行中')}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-black text-white hover:opacity-90 transition shadow-lg"
                        >
                            上架活动
                        </button>
                    </div>
                </div>
            </div>
        )}

        {toast && (
            <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
                <div className={`px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
                    toast.tone === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-white text-gray-800 border-gray-100'
                }`}>
                    <i className={`fa-solid ${toast.tone === 'success' ? 'fa-circle-check' : 'fa-circle-info'}`}></i>
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-2 text-current opacity-50 hover:opacity-100">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        
        .coupon-mask {
            mask-image: radial-gradient(circle at 0 50%, transparent 10px, black 11px), radial-gradient(circle at 100% 50%, transparent 10px, black 11px);
            mask-position: -10px, 10px; 
            mask-size: 100% 100%; 
            mask-repeat: no-repeat;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeInUp {
            animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Marketing;
