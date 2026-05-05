
import React, { useState, useMemo } from 'react';
import { MOCK_STORE_INFO, MOCK_CARDS } from '../constants';
import { StoreInfo, Card } from '../types';

const Shop: React.FC = () => {
  const [subTab, setSubTab] = useState<'setup' | 'rooms' | 'cards'>('setup');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Store Data (Local state for editability)
  const [activeStore, setActiveStore] = useState<StoreInfo>(MOCK_STORE_INFO);
  const [stores] = useState([{ id: 1, name: 'MetYoga 西湖馆' }, { id: 2, name: '万象城馆' }, { id: 3, name: '城西银泰馆' }]);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  
  // Card Data
  const [cardList, setCardList] = useState<Card[]>(MOCK_CARDS);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // --- Computed ---
  const filteredRooms = useMemo(() => {
      if (searchQuery && subTab === 'rooms') {
          return activeStore.rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return activeStore.rooms;
  }, [activeStore.rooms, searchQuery, subTab]);

  // --- Actions ---
  const handleSwitchStore = (store: {id: number, name: string}) => {
      setActiveStore(prev => ({ ...prev, id: store.id, name: store.name }));
      setShowStoreMenu(false);
  };

  const saveAll = () => {
      // alert("✅ 所有店铺配置已保存并同步至小程序端");
  };

  const addHoliday = () => {
      const n = prompt("请输入假期名称 (如: 春节假期)");
      const d = prompt("请输入日期范围 (如: 2026-01-20 至 2026-01-28)");
      if (n && d) setActiveStore(prev => ({ ...prev, holidays: [...prev.holidays, { name: n, date: d }] }));
  };

  const removeHoliday = (idx: number) => {
      setActiveStore(prev => ({ ...prev, holidays: prev.holidays.filter((_, i) => i !== idx) }));
  };

  const uploadStoreImage = () => {
      // alert("✅ 模拟：系统文件选择框已弹出，图片上传成功");
      setActiveStore(prev => ({ ...prev, gallery: [...prev.gallery, 'https://images.unsplash.com/photo-1571019613454-1cb2f57a69d7?auto=format&fit=crop&q=80&w=400'] }));
  };

  const removeImage = (idx: number) => {
      if(confirm('确定要删除这张图片吗？')) {
          setActiveStore(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
      }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative">
        
        {/* Top Header / Toolbar (Custom for Shop Page) */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    店铺管理
                    <button 
                        onClick={() => alert('Gemini AI 正在分析店铺运营数据并生成优化建议...')}
                        className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI 店铺优化
                    </button>
                </h2>
                
                {/* Store Switcher */}
                <div className="relative">
                    <button 
                        onClick={() => setShowStoreMenu(!showStoreMenu)} 
                        className="flex items-center gap-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all w-56 justify-between border border-transparent hover:border-gray-300"
                    >
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-gray-400"></i> 
                            <span>{activeStore.name}</span>
                        </span>
                        <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                    </button>
                    
                    {showStoreMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowStoreMenu(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-fadeIn">
                                <div className="text-[10px] text-gray-400 px-3 py-2 uppercase font-bold">切换门店</div>
                                {stores.map(store => (
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
                {[
                    { id: 'setup', label: '装修与信息' },
                    { id: 'rooms', label: '教室配置' },
                    { id: 'cards', label: '卡项管理' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setSubTab(tab.id as any)}
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
                                        <input type="text" value={activeStore.name} onChange={e => setActiveStore({...activeStore, name: e.target.value})} className="input-apple" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">详细地址</label>
                                        <input type="text" value={activeStore.address} onChange={e => setActiveStore({...activeStore, address: e.target.value})} className="input-apple" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">联系电话</label>
                                        <input type="text" value={activeStore.phone} onChange={e => setActiveStore({...activeStore, phone: e.target.value})} className="input-apple" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">营业时间</label>
                                        <input type="text" value={activeStore.hours} onChange={e => setActiveStore({...activeStore, hours: e.target.value})} className="input-apple" />
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

                {/* --- TAB: CARDS --- */}
                {subTab === 'cards' && (
                    <div className="animate-fadeIn">
                        {!editingCard ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">卡项列表</h3>
                                        <p className="text-xs text-gray-400 mt-1">管理储值卡、期限卡及相关运营规则</p>
                                    </div>
                                    <button className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition">+ 新增卡项</button>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    {cardList.map(card => (
                                        <div 
                                            key={card.id} 
                                            onClick={() => setEditingCard(card)}
                                            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-apple cursor-pointer transition-all group relative overflow-hidden"
                                        >
                                            <div className={`absolute top-0 left-0 w-1 h-full ${card.type === 'stored_value' ? 'bg-black' : 'bg-blue-500'}`}></div>
                                            <div className="flex justify-between items-start mb-3 pl-3">
                                                <div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${card.type === 'stored_value' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {card.type === 'stored_value' ? '储值卡' : '期限卡'}
                                                    </span>
                                                    <h4 className="text-xl font-bold text-gray-900 mt-2">{card.name}</h4>
                                                    <p className="text-xs text-gray-400 mt-0.5">{card.slogan}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">¥{card.price.toLocaleString()}</div>
                                                    {card.type === 'stored_value' && <div className="text-xs text-gray-500">{card.points} 点</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="pl-3 mt-4 space-y-2">
                                                <div className="flex justify-between text-xs text-gray-500 border-b border-gray-50 pb-2">
                                                    <span>有效期</span>
                                                    <span className="font-medium text-gray-900">{card.validity} {card.validityUnit === 'month' ? '个月' : '天'}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 border-b border-gray-50 pb-2">
                                                    <span>单价</span>
                                                    <span className="font-medium text-gray-900">¥{card.unitPrice}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>开卡赠送</span>
                                                    <span className="font-medium text-green-600">+{card.openingPoints} 积分</span>
                                                </div>
                                            </div>

                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition">
                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-apple border border-gray-100 overflow-hidden">
                                <div className="border-b border-gray-200 px-8 py-4 flex justify-between items-center bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setEditingCard(null)}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
                                        >
                                            <i className="fa-solid fa-arrow-left text-sm"></i>
                                        </button>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">编辑卡项: {editingCard.name}</h3>
                                            <p className="text-xs text-gray-400">配置卡项规则与运营参数</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditingCard(null)} className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition">取消</button>
                                        <button onClick={() => {
                                            setCardList(prev => prev.map(c => c.id === editingCard.id ? editingCard : c));
                                            setEditingCard(null);
                                        }} className="px-6 py-2 rounded-lg text-xs font-bold bg-black text-white hover:opacity-80 transition shadow-lg shadow-black/10">保存变更</button>
                                    </div>
                                </div>
                                
                                <div className="p-8 grid grid-cols-12 gap-8">
                                    {/* Left Column: Basic Info */}
                                    <div className="col-span-4 space-y-6">
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            <h4 className="font-bold text-sm mb-4">基础信息</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">卡项名称</label>
                                                    <input type="text" value={editingCard.name} onChange={e => setEditingCard({...editingCard, name: e.target.value})} className="input-apple bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Slogan</label>
                                                    <input type="text" value={editingCard.slogan} onChange={e => setEditingCard({...editingCard, slogan: e.target.value})} className="input-apple bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">引导文案</label>
                                                    <input type="text" value={editingCard.guide} onChange={e => setEditingCard({...editingCard, guide: e.target.value})} className="input-apple bg-white" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">售价 (¥)</label>
                                                        <input type="number" value={editingCard.price} onChange={e => setEditingCard({...editingCard, price: Number(e.target.value)})} className="input-apple bg-white font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">点数/次数</label>
                                                        <input type="number" value={editingCard.points || ''} onChange={e => setEditingCard({...editingCard, points: Number(e.target.value)})} className="input-apple bg-white font-mono" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            <h4 className="font-bold text-sm mb-4">积分与价值</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">开卡赠送积分</label>
                                                        <div className="relative">
                                                            <input type="number" value={editingCard.openingPoints} onChange={e => setEditingCard({...editingCard, openingPoints: Number(e.target.value)})} className="input-apple bg-white pr-8 font-mono" />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">赠送上限</label>
                                                        <div className="relative">
                                                            <input type="number" value={editingCard.giftPointsLimit || 0} onChange={e => setEditingCard({...editingCard, giftPointsLimit: Number(e.target.value)})} className="input-apple bg-white pr-8 font-mono" />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">分</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">积分兑换比例 (1积分 = ?元)</label>
                                                    <input type="number" step="0.1" value={editingCard.exchangeRatio || 1} onChange={e => setEditingCard({...editingCard, exchangeRatio: Number(e.target.value)})} className="input-apple bg-white font-mono" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Rules */}
                                    <div className="col-span-8 space-y-6">
                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                                <i className="fa-solid fa-layer-group text-gray-400"></i> 适用范围与权益
                                            </h4>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">门店范围</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="scope" checked={editingCard.scope === 'all'} onChange={() => setEditingCard({...editingCard, scope: 'all'})} className="text-black focus:ring-black" />
                                                            <span className="text-xs font-medium">所有门店通用</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name="scope" checked={editingCard.scope === 'single'} onChange={() => setEditingCard({...editingCard, scope: 'single'})} className="text-black focus:ring-black" />
                                                            <span className="text-xs font-medium">仅限单店使用</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">功能权益</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['团课', '小班', '私教', '教培', '工作坊'].map(fn => (
                                                            <label key={fn} className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded border transition ${editingCard.functionScope.includes(fn) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={editingCard.functionScope.includes(fn)} 
                                                                    onChange={e => {
                                                                        const newScope = e.target.checked 
                                                                            ? [...editingCard.functionScope, fn]
                                                                            : editingCard.functionScope.filter(f => f !== fn);
                                                                        setEditingCard({...editingCard, functionScope: newScope});
                                                                    }} 
                                                                    className="hidden" 
                                                                />
                                                                <span className="text-[10px] font-bold">{fn}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                            <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
                                                <i className="fa-solid fa-gavel text-gray-400"></i> 运营规则配置
                                            </h4>
                                            
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                                {/* Validity */}
                                                <div className="col-span-2 grid grid-cols-4 gap-4 pb-6 border-b border-gray-100">
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">有效期时长</label>
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" value={editingCard.validity} onChange={e => setEditingCard({...editingCard, validity: Number(e.target.value)})} className="input-apple bg-gray-50 font-mono" />
                                                            <select 
                                                                value={editingCard.validityUnit} 
                                                                onChange={e => setEditingCard({...editingCard, validityUnit: e.target.value as any})}
                                                                className="bg-gray-50 border-none text-sm rounded-lg py-2.5 px-2 outline-none"
                                                            >
                                                                <option value="month">个月</option>
                                                                <option value="day">天</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">折算单价</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">¥</span>
                                                            <input type="number" value={editingCard.unitPrice} onChange={e => setEditingCard({...editingCard, unitPrice: Number(e.target.value)})} className="input-apple bg-gray-50 pl-6 font-mono" />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">约课范围</label>
                                                        <div className="relative">
                                                            <input type="number" value={editingCard.bookingRange} onChange={e => setEditingCard({...editingCard, bookingRange: Number(e.target.value)})} className="input-apple bg-gray-50 pr-8 font-mono" />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">天</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">开课原则</label>
                                                        <div className="relative">
                                                            <input type="number" value={editingCard.minOpenPeople} onChange={e => setEditingCard({...editingCard, minOpenPeople: Number(e.target.value)})} className="input-apple bg-gray-50 pr-8 font-mono" />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">人开班</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Cancellation Rules */}
                                                <div className="col-span-2 space-y-4 pb-6 border-b border-gray-100">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">取消处罚 (2小时内)</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                                            <span className="text-xs text-gray-600">每月免责</span>
                                                            <input type="number" value={editingCard.cancelFreeLimit} onChange={e => setEditingCard({...editingCard, cancelFreeLimit: Number(e.target.value)})} className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">次</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                                            <span className="text-xs text-gray-600">超出后每次扣</span>
                                                            <input type="number" value={editingCard.cancelPenaltyPoints} onChange={e => setEditingCard({...editingCard, cancelPenaltyPoints: Number(e.target.value)})} className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">积分</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {(editingCard.cancelFreezeThreshold1 || editingCard.cancelFreezeThreshold2) && (
                                                        <div className="flex items-center gap-4 mt-2">
                                                            {editingCard.cancelFreezeThreshold1 && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <i className="fa-solid fa-triangle-exclamation text-orange-500"></i>
                                                                    <span>当月取消 {editingCard.cancelFreezeThreshold1} 次，冻结 {editingCard.cancelFreezeDays1} 天</span>
                                                                </div>
                                                            )}
                                                            {editingCard.cancelFreezeThreshold2 && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                    <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                                                                    <span>当月取消 {editingCard.cancelFreezeThreshold2} 次，冻结 {editingCard.cancelFreezeDays2} 天</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* No Show Rules */}
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">爽约处罚</label>
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox" checked={editingCard.noShowDeductCurrent} onChange={e => setEditingCard({...editingCard, noShowDeductCurrent: e.target.checked})} className="rounded text-black focus:ring-black" />
                                                            <span className="text-xs text-gray-700">扣除当节点数</span>
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">每次冻结</span>
                                                            <input type="number" value={editingCard.noShowFreezeDays} onChange={e => setEditingCard({...editingCard, noShowFreezeDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">天</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Check In Points */}
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">上课(签到)积分</label>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">每节课得</span>
                                                            <input type="number" value={editingCard.checkInPoints} onChange={e => setEditingCard({...editingCard, checkInPoints: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">积分</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">或 课程价格</span>
                                                            <input type="number" value={editingCard.checkInPointsPercent} onChange={e => setEditingCard({...editingCard, checkInPointsPercent: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">%</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-400">(单日上限 {editingCard.checkInDailyLimit} 积分)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Leaves */}
                                                <div className="col-span-2 pt-4 border-t border-gray-100">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">请假与延期</label>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">每次请假</span>
                                                            <input type="number" value={editingCard.leaveMinDays} onChange={e => setEditingCard({...editingCard, leaveMinDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">天起</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">累计不超过</span>
                                                            <input type="number" value={editingCard.leaveMaxDays} onChange={e => setEditingCard({...editingCard, leaveMaxDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono outline-none focus:border-black" />
                                                            <span className="text-xs text-gray-600">天</span>
                                                        </div>
                                                        <label className="flex items-center gap-2 cursor-pointer ml-4">
                                                            <input type="checkbox" checked={editingCard.canExtend} onChange={e => setEditingCard({...editingCard, canExtend: e.target.checked})} className="rounded text-black focus:ring-black" />
                                                            <span className="text-xs text-gray-700">允许延期</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div>

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
