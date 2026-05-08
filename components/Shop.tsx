
import React, { useState, useMemo } from 'react';
import { MOCK_STORE_INFO } from '../constants';
import {
  addStoreGalleryImage,
  addStoreHoliday,
  buildInitialShopConfig,
  buildSaveShopConfigInput,
  DEMO_STORE_IMAGE_URL,
  filterStoreRooms,
  removeStoreGalleryImage,
  removeStoreHoliday,
  setStoreMenuOpen,
  SHOP_SUB_TABS,
  switchStoreConfig,
  updateStoreBasicInfo,
  type ShopConfigDraft,
  type ShopSubTab,
  type StoreOption,
} from './shop/shopConfig';

type ShopToastTone = 'info' | 'success';

interface ShopToast {
  id: number;
  message: string;
  tone: ShopToastTone;
}

interface ShopConfirmDialog {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface HolidayForm {
  name: string;
  date: string;
}

const Shop: React.FC = () => {
  const [subTab, setSubTab] = useState<ShopSubTab>('setup');
  const [searchQuery, setSearchQuery] = useState('');
  const [shopConfig, setShopConfig] = useState<ShopConfigDraft>(() => buildInitialShopConfig(MOCK_STORE_INFO));
  const [toast, setToast] = useState<ShopToast | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ShopConfirmDialog | null>(null);
  const [holidayForm, setHolidayForm] = useState<HolidayForm | null>(null);

  const { store: activeStore, storeOptions, isStoreMenuOpen } = shopConfig;

  // --- Computed ---
  const filteredRooms = useMemo(() => {
      return filterStoreRooms(activeStore.rooms, searchQuery, subTab);
  }, [activeStore.rooms, searchQuery, subTab]);

  // --- Actions ---
  const handleSwitchStore = (store: StoreOption) => {
      setShopConfig(prev => switchStoreConfig(prev, store));
  };

  const handleStoreMenuOpen = (isOpen: boolean) => {
      setShopConfig(prev => setStoreMenuOpen(prev, isOpen));
  };

  const updateStoreInfo = (updates: Parameters<typeof updateStoreBasicInfo>[1]) => {
      setShopConfig(prev => updateStoreBasicInfo(prev, updates));
  };

  const showToast = (message: string, tone: ShopToastTone = 'info') => {
      setToast({ id: Date.now(), message, tone });
      window.setTimeout(() => {
          setToast(current => (current?.message === message ? null : current));
      }, 2400);
  };

  const saveAll = () => {
      const saveInput = buildSaveShopConfigInput(shopConfig);
      void saveInput;
      showToast('所有店铺配置已保存并同步至小程序端', 'success');
  };

  const addHoliday = () => {
      setHolidayForm({ name: '', date: '' });
  };

  const submitHoliday = () => {
      if (!holidayForm?.name.trim() || !holidayForm.date.trim()) return;

      setShopConfig(prev => addStoreHoliday(prev, {
          name: holidayForm.name.trim(),
          date: holidayForm.date.trim(),
      }));
      setHolidayForm(null);
  };

  const removeHoliday = (idx: number) => {
      setShopConfig(prev => removeStoreHoliday(prev, idx));
  };

  const uploadStoreImage = () => {
      setShopConfig(prev => addStoreGalleryImage(prev, DEMO_STORE_IMAGE_URL));
      showToast('模拟图片已上传成功', 'success');
  };

  const removeImage = (idx: number) => {
      setConfirmDialog({
          title: '删除门店图片',
          message: '确定要删除这张图片吗？',
          confirmLabel: '删除图片',
          onConfirm: () => setShopConfig(prev => removeStoreGalleryImage(prev, idx)),
      });
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Top Header / Toolbar (Custom for Shop Page) */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    店铺管理
                    <button
                        onClick={() => showToast('Gemini AI 正在分析店铺运营数据并生成优化建议...', 'info')}
                        className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI 店铺优化
                    </button>
                </h2>

                {/* Store Switcher */}
                <div className="relative">
                    <button
                        onClick={() => handleStoreMenuOpen(!isStoreMenuOpen)}
                        className="flex items-center gap-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all w-56 justify-between border border-transparent hover:border-gray-300"
                    >
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-gray-400"></i> 
                            <span>{activeStore.name}</span>
                        </span>
                        <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                    </button>
                    
                    {isStoreMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => handleStoreMenuOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-fadeIn">
                                <div className="text-[10px] text-gray-400 px-3 py-2 uppercase font-bold">切换门店</div>
                                {storeOptions.map(store => (
                                    <div 
                                        key={store.id} 
                                        onClick={() => handleSwitchStore(store)} 
                                        className="px-3 py-2 text-sm hover:bg-gray-50 rounded-lg cursor-pointer flex justify-between items-center"
                                    >
                                        <span>{store.name}</span>
                                        {activeStore.id === store.id && <i className="fa-solid fa-check text-black"></i>}
                                    </div>
                                ))}
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2">
                                    <i className="fa-solid fa-plus"></i> 新增店铺
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索教室..." 
                        className="pl-8 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 rounded-lg text-xs w-64 transition-all outline-none"
                    />
                </div>
                <button 
                    onClick={saveAll}
                    className="bg-black text-white text-xs px-5 py-2 rounded-lg font-bold hover:opacity-80 shadow-lg shadow-black/10 transition"
                >
                    保存配置
                </button>
            </div>
        </div>

        {/* Sub Navigation (Unified Segmented Control) */}
        <div className="px-8 py-4 bg-[#F5F5F7]/95 backdrop-blur border-b border-gray-200/50 sticky top-16 z-10 flex justify-start">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                {SHOP_SUB_TABS.map(tab => (
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
            <div className="max-w-7xl mx-auto min-h-[500px]">

                {/* --- TAB: SETUP --- */}
                {subTab === 'setup' && (
                    <div className="grid grid-cols-12 gap-8 animate-fadeIn">
                        {/* Left: Mobile Preview */}
                        <div className="col-span-4 sticky top-4">
                            <div className="bg-white rounded-[40px] border-[8px] border-gray-900 h-[720px] overflow-hidden relative shadow-2xl mx-auto w-[360px]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-900 rounded-b-2xl z-20"></div>
                                
                                <div className="h-full overflow-y-auto no-scrollbar bg-white pb-10">
                                    <div className="h-64 bg-gray-100 relative group">
                                        <img src={activeStore.gallery[0]} className="w-full h-full object-cover" alt="Cover" />
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                                            {activeStore.gallery.map((_, idx) => (
                                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${idx === 0 ? 'bg-white' : 'bg-white/40'}`}></div>
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition">
                                            <span className="text-white text-xs font-bold drop-shadow-md">封面预览</span>
                                        </div>
                                    </div>
                                    
                                    <div className="px-5 -mt-8 relative z-10">
                                        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-50">
                                            <h2 className="text-xl font-bold text-gray-900 mb-1">{activeStore.name}</h2>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                                <i className="fa-solid fa-star text-yellow-400"></i> 5.0 · <span>{activeStore.address}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full font-bold">预约课程</span>
                                                <span className="bg-gray-100 text-gray-600 text-[10px] px-3 py-1.5 rounded-full font-bold">联系我们</span>
                                            </div>
                                        </div>
                                    </div>

                                    {activeStore.holidays.length > 0 && (
                                        <div className="px-5 mt-4">
                                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
                                                <i className="fa-solid fa-bullhorn text-orange-500 mt-0.5 text-sm"></i>
                                                <div className="text-xs text-orange-800">
                                                    <div className="font-bold mb-1">门店公告</div>
                                                    <div>{activeStore.holidays[0]?.name}: {activeStore.holidays[0]?.date}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Forms */}
                        <div className="col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl p-8 shadow-apple border border-gray-100">
                                <h3 className="font-bold text-lg mb-6 text-gray-900">门店基础信息</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">门店名称</label>
                                        <input type="text" value={activeStore.name} onChange={e => updateStoreInfo({ name: e.target.value })} className="input-apple" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">详细地址</label>
                                        <input type="text" value={activeStore.address} onChange={e => updateStoreInfo({ address: e.target.value })} className="input-apple" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">联系电话</label>
                                        <input type="text" value={activeStore.phone} onChange={e => updateStoreInfo({ phone: e.target.value })} className="input-apple" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">营业时间</label>
                                        <input type="text" value={activeStore.hours} onChange={e => updateStoreInfo({ hours: e.target.value })} className="input-apple" />
                                    </div>
                                    
                                    <div className="col-span-2 bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-sm font-bold text-gray-900">特殊营业时间 / 假期设置</label>
                                            <button className="text-xs text-blue-600 hover:text-blue-800 font-bold" onClick={addHoliday}>+ 添加假期</button>
                                        </div>
                                        {activeStore.holidays.map((h, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-2">
                                                <div className="text-xs text-gray-700">
                                                    <span className="font-bold mr-2 bg-gray-100 px-2 py-0.5 rounded">{h.name}</span> 
                                                    <span>{h.date}</span>
                                                </div>
                                                <button onClick={() => removeHoliday(idx)} className="text-gray-400 hover:text-red-500 transition"><i className="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        ))}
                                        {activeStore.holidays.length === 0 && <div className="text-center text-xs text-gray-400 py-2">暂无特殊安排</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-8 shadow-apple border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">门店相册</h3>
                                        <p className="text-xs text-gray-400 mt-1">首张图片将作为封面展示</p>
                                    </div>
                                    <button onClick={uploadStoreImage} className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition">
                                        <i className="fa-solid fa-cloud-arrow-up mr-2"></i>上传图片
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {activeStore.gallery.map((img, index) => (
                                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden cursor-move border border-gray-200 bg-gray-50">
                                            <img src={img} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="" />
                                            
                                            {index === 0 && <div className="absolute top-2 left-2 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded-md font-bold z-10 shadow-lg">封面</div>}
                                            
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-lg transform hover:scale-110 transition" onClick={() => removeImage(index)}>
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: ROOMS --- */}
                {subTab === 'rooms' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white rounded-2xl p-8 shadow-apple border border-gray-100">
                             <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">教室资源管理</h3>
                                    <p className="text-xs text-gray-400 mt-1">管理团课与私教教室的容量及设备标签</p>
                                </div>
                                <button className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition">+ 新增教室</button>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                {filteredRooms.map((room) => (
                                    <div key={room.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative group cursor-pointer hover:bg-white hover:shadow-apple transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-900 text-lg shadow-sm">{room.id}</div>
                                            <button className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-black shadow-sm flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                                                <i className="fa-solid fa-pen text-xs"></i>
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-lg mb-1 text-gray-900">{room.name}</h4>
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-xs text-gray-500">容量: <span className="font-bold text-black">{room.capacity}</span> 人</p>
                                            <span className="text-[10px] border border-gray-300 px-2 py-0.5 rounded bg-white text-gray-600 font-medium">{room.type}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {room.equipment.map(eq => (
                                                <span key={eq} className="bg-white border border-gray-200 text-gray-500 px-2 py-1 rounded text-[10px]">{eq}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

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

        {confirmDialog && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setConfirmDialog(null)}></div>
                <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 p-6 animate-fadeIn">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmDialog.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">{confirmDialog.message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                            取消
                        </button>
                        <button
                            onClick={() => {
                                confirmDialog.onConfirm();
                                setConfirmDialog(null);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition"
                        >
                            {confirmDialog.confirmLabel || '确认'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {holidayForm && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setHolidayForm(null)}></div>
                <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 animate-fadeIn">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">添加特殊营业时间</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">填写假期名称和日期范围，用于门店公告展示。</p>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">假期名称</label>
                            <input
                                autoFocus
                                type="text"
                                value={holidayForm.name}
                                onChange={(event) => setHolidayForm(current => current ? { ...current, name: event.target.value } : current)}
                                placeholder="如：春节假期"
                                className="input-apple"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">日期范围</label>
                            <input
                                type="text"
                                value={holidayForm.date}
                                onChange={(event) => setHolidayForm(current => current ? { ...current, date: event.target.value } : current)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') submitHoliday();
                                    if (event.key === 'Escape') setHolidayForm(null);
                                }}
                                placeholder="如：2026-01-20 至 2026-01-28"
                                className="input-apple"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setHolidayForm(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                            取消
                        </button>
                        <button
                            onClick={submitHoliday}
                            disabled={!holidayForm.name.trim() || !holidayForm.date.trim()}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            添加假期
                        </button>
                    </div>
                </div>
            </div>
        )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #D1D1D6; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .shadow-apple { box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .shadow-apple-hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .input-apple { width: 100%; padding: 0.75rem 1rem; background-color: #F9FAFB; border: 1px solid transparent; border-radius: 0.75rem; font-size: 0.875rem; transition: all 0.2s; outline: none; }
        .input-apple:focus { background-color: white; border-color: #D1D5DB; box-shadow: 0 0 0 4px #F3F4F6; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Shop;
