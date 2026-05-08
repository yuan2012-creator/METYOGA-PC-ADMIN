import React from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { CardProduct } from '../../types';
import type {
  CardEditCategory,
  MallActionButtonRenderer,
  MallCardActionItem,
  MallCardEditorItem,
  MallEditorSetter,
  MallActionType,
} from './mallTypes';

interface MallCardsProps {
  view: 'list' | 'edit';
  cards: CardProduct[];
  setCards: React.Dispatch<React.SetStateAction<CardProduct[]>>;
  selectedItem: MallCardEditorItem | null;
  setSelectedItem: MallEditorSetter<MallCardEditorItem>;
  editCardCategory: CardEditCategory;
  setEditCardCategory: React.Dispatch<React.SetStateAction<CardEditCategory>>;
  overview: React.ReactNode;
  actionButtons: MallActionButtonRenderer<MallCardActionItem>;
  handleBack: () => void;
  handleCreate: (type: MallActionType) => void;
  salesTrendData: { name: string; val: number }[];
  availableVenues: string[];
}

const MallCards: React.FC<MallCardsProps> = ({
  view,
  cards,
  setCards,
  selectedItem,
  setSelectedItem,
  editCardCategory,
  setEditCardCategory,
  overview,
  actionButtons,
  handleBack,
  handleCreate,
  salesTrendData,
  availableVenues,
}) => {
  const renderCardList = () => (
      <div className="animate-fadeIn">
          {overview}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {cards.map(card => (
              <div key={card.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group relative overflow-hidden flex flex-col h-[280px]">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${card.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {card.status === 'active' ? '上架中' : '已下架'}
                  </div>
                  <div className="mb-auto">
                      <div className="flex gap-2 mb-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${card.type === 'stored_value' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-orange-200 text-orange-600 bg-orange-50'}`}>
                              {card.type === 'stored_value' ? '储值' : '期限'}
                          </span>
                          {card.scope === 'all' ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">权益通用</span> : <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">单店权益</span>}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{card.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 italic">{card.slogan}</p>
                      <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed bg-gray-50 p-2 rounded whitespace-pre-line">{card.guide}</p>
                  </div>
                  <div className="pt-2 flex justify-between items-end">
                      <div>
                          <div className="text-xl font-bold font-mono">¥{card.price.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400">
                              {card.type === 'stored_value' ? `${card.points} 点 · ${card.validity} ${card.validityUnit === 'month' ? '个月' : '天'}` : `${card.validity} ${card.validityUnit === 'month' ? '个月' : '天'}有效`}
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] text-gray-400">30天销量</div>
                          <div className="text-sm font-bold">{card.sales30d || 0}</div>
                      </div>
                  </div>
                  {actionButtons(card, 'card')}
              </div>
          ))}
          <div onClick={() => handleCreate('card')} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition h-[280px]">
              <i className="fa-solid fa-plus text-3xl mb-2"></i>
              <span className="text-sm font-bold">新建卡项</span>
          </div>
      </div>
      </div>
  );

  const renderCardEdit = () => {
      const isStored = editCardCategory === 'stored_value';
      const editingCard = selectedItem as MallCardEditorItem;
      const setEditingCard = (updates: Partial<CardProduct>) => setSelectedItem({ ...selectedItem, ...updates });

      return (
          <div className="flex h-full gap-6 animate-fadeIn">
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg">{selectedItem?.id ? '编辑卡项' : '新建卡项'}</h3>
                      <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div className="p-8 space-y-8">
                      {/* Mode Selection */}
                      <div className="p-1 bg-gray-100 rounded-xl inline-flex">
                          <button onClick={() => { setEditCardCategory('stored_value'); setEditingCard({ type: 'stored_value' }); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${isStored ? 'bg-white shadow text-black' : 'text-gray-500'}`}>储值模式 (Stored)</button>
                          <button onClick={() => { setEditCardCategory('term'); setEditingCard({ type: 'term' }); }} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${!isStored ? 'bg-white shadow text-black' : 'text-gray-500'}`}>期限/次卡模式 (Term)</button>
                      </div>
                      
                      {/* Marketing Info */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">营销展示 (Marketing)</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block">卡项名称</label><input type="text" defaultValue={editingCard.name} onBlur={e => setEditingCard({name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                              <div className="col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block">Slogan (副标题)</label><input type="text" defaultValue={editingCard.slogan} onBlur={e => setEditingCard({slogan: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                              <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">引导购买文案</label><textarea defaultValue={editingCard.guide} onBlur={e => setEditingCard({guide: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition resize-none h-20" /></div>
                          </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">价格与价值 (Pricing)</h4>
                          <div className="grid grid-cols-3 gap-6">
                              <div><label className="text-xs font-bold text-gray-500 mb-1 block">售卖价格 (¥)</label><input type="number" defaultValue={editingCard.price} onBlur={e => setEditingCard({price: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" /></div>
                              <div className="relative">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">有效期</label>
                                  <div className="flex gap-2">
                                      <input type="number" defaultValue={editingCard.validity} onBlur={e => setEditingCard({validity: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                                      <select defaultValue={editingCard.validityUnit} onChange={e => setEditingCard({validityUnit: e.target.value as CardProduct['validityUnit']})} className="bg-gray-50 border border-gray-200 rounded-xl px-2 text-xs outline-none">
                                          <option value="month">月</option>
                                          <option value="day">天</option>
                                      </select>
                                  </div>
                              </div>
                              {isStored && <div className="relative"><label className="text-xs font-bold text-gray-500 mb-1 block">包含点数 (Points)</label><input type="number" defaultValue={editingCard.points} onBlur={e => setEditingCard({points: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" /></div>}
                          </div>
                      </div>

                      {/* Operational Rules */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">运营规则配置 (Rules)</h4>
                          
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-6">
                              {/* Row 1: Points & Scope */}
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">开卡赠送</label>
                                      <div className="flex items-center gap-2">
                                          <input type="number" placeholder="赠送积分" defaultValue={editingCard.openingPoints} onBlur={e => setEditingCard({openingPoints: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono" />
                                          <span className="text-xs text-gray-500 font-bold">积分 (固定值)</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">积分兑换比例</label>
                                      <input type="number" step="0.1" defaultValue={editingCard.exchangeRatio} onBlur={e => setEditingCard({exchangeRatio: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-mono" />
                                  </div>
                              </div>

                              {/* Row 2: Cancellation */}
                              <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">取消处罚 (2小时内)</label>
                                  <div className="flex flex-wrap gap-6 items-start">
                                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 h-10">
                                          <span className="text-xs text-gray-600">免责</span>
                                          <input type="number" defaultValue={editingCard.cancelFreeLimit} onBlur={e => setEditingCard({cancelFreeLimit: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                          <span className="text-xs text-gray-600">次/月</span>
                                      </div>
                                      
                                      {isStored ? (
                                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 h-10">
                                              <span className="text-xs text-gray-600">扣除</span>
                                              <input type="number" defaultValue={editingCard.cancelDeductPoints} onBlur={e => setEditingCard({cancelDeductPoints: Number(e.target.value)})} className="w-16 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">积分</span>
                                          </div>
                                      ) : (
                                          <div className="flex gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="termCancel" checked={editingCard.termCancelPenaltyType === 'deduct_current'} onChange={() => setEditingCard({termCancelPenaltyType: 'deduct_current'})} className="text-black focus:ring-black" />
                                                  <span className="text-xs text-gray-700">扣除当节课程</span>
                                              </label>
                                              <div className="flex items-center gap-2">
                                                  <label className="flex items-center gap-2 cursor-pointer">
                                                      <input type="radio" name="termCancel" checked={editingCard.termCancelPenaltyType === 'freeze_days'} onChange={() => setEditingCard({termCancelPenaltyType: 'freeze_days'})} className="text-black focus:ring-black" />
                                                      <span className="text-xs text-gray-700">冻结天数</span>
                                                  </label>
                                                  {editingCard.termCancelPenaltyType === 'freeze_days' && (
                                                      <div className="flex items-center gap-1 ml-1">
                                                          <input type="number" defaultValue={editingCard.cancelFreezeDays} onBlur={e => setEditingCard({cancelFreezeDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-xs font-mono" />
                                                          <span className="text-[10px] text-gray-400">天</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              {/* Row 3: No Show */}
                              <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">爽约处罚</label>
                                  <div className="flex flex-wrap gap-6 items-start">
                                      {isStored ? (
                                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 h-10">
                                              <span className="text-xs text-gray-600">扣除</span>
                                              <input type="number" defaultValue={editingCard.noShowDeductPoints} onBlur={e => setEditingCard({noShowDeductPoints: Number(e.target.value)})} className="w-16 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">积分</span>
                                          </div>
                                      ) : (
                                          <div className="flex gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input type="radio" name="termNoShow" checked={editingCard.termNoShowPenaltyType === 'deduct_current'} onChange={() => setEditingCard({termNoShowPenaltyType: 'deduct_current'})} className="text-black focus:ring-black" />
                                                  <span className="text-xs text-gray-700">扣除当节课程</span>
                                              </label>
                                              <div className="flex items-center gap-2">
                                                  <label className="flex items-center gap-2 cursor-pointer">
                                                      <input type="radio" name="termNoShow" checked={editingCard.termNoShowPenaltyType === 'freeze_days'} onChange={() => setEditingCard({termNoShowPenaltyType: 'freeze_days'})} className="text-black focus:ring-black" />
                                                      <span className="text-xs text-gray-700">冻结天数</span>
                                                  </label>
                                                  {editingCard.termNoShowPenaltyType === 'freeze_days' && (
                                                      <div className="flex items-center gap-1 ml-1">
                                                          <input type="number" defaultValue={editingCard.noShowFreezeDays} onBlur={e => setEditingCard({noShowFreezeDays: Number(e.target.value)})} className="w-12 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-center text-xs font-mono" />
                                                          <span className="text-[10px] text-gray-400">天</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              {/* Row 4: Check In & Scope */}
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">上课签到积分</label>
                                      <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-600">每节</span>
                                              <input type="number" defaultValue={editingCard.checkInPoints} onBlur={e => setEditingCard({checkInPoints: Number(e.target.value)})} className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">分 或</span>
                                              <input type="number" defaultValue={editingCard.checkInPointsPercent} onBlur={e => setEditingCard({checkInPointsPercent: Number(e.target.value)})} className="w-12 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                              <span className="text-xs text-gray-600">%</span>
                                          </div>
                                          <div className="text-xs text-gray-400">单日上限 {editingCard.checkInDailyLimit} 积分</div>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">请假规则</label>
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className="text-xs text-gray-600">每次</span>
                                          <input type="number" defaultValue={editingCard.leaveMinDays} onBlur={e => setEditingCard({leaveMinDays: Number(e.target.value)})} className="w-10 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                          <span className="text-xs text-gray-600">天起</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-600">累计</span>
                                          <input type="number" defaultValue={editingCard.leaveMaxDays} onBlur={e => setEditingCard({leaveMaxDays: Number(e.target.value)})} className="w-10 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-sm font-mono" />
                                          <span className="text-xs text-gray-600">天</span>
                                          <label className="flex items-center gap-1 cursor-pointer ml-2">
                                              <input type="checkbox" checked={editingCard.canExtend} onChange={e => setEditingCard({canExtend: e.target.checked})} className="rounded text-black focus:ring-black" />
                                              <span className="text-xs text-gray-600">可延期</span>
                                          </label>
                                      </div>
                                  </div>
                              </div>

                              {/* Row 5: Scope */}
                              <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">适用范围 (Scope)</h4>
                                  
                                  {/* Usage Venues */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">使用场馆</label>
                                      <div className="flex gap-4">
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="scope" checked={editingCard.scope === 'single'} onChange={() => setEditingCard({scope: 'single'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">单店 (Single Store)</span>
                                          </label>
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="scope" checked={editingCard.scope === 'all'} onChange={() => setEditingCard({scope: 'all'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">通馆 (All Stores)</span>
                                          </label>
                                      </div>
                                  </div>

                                  {/* Course Types */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程类型</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['团课', '小班', '私教', '教培工作坊'].map(fn => (
                                              <label key={fn} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${editingCard.functionScope?.includes(fn) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={editingCard.functionScope?.includes(fn)} 
                                                      onChange={e => {
                                                          const current = editingCard.functionScope || [];
                                                          const newScope = e.target.checked ? [...current, fn] : current.filter(f => f !== fn);
                                                          setEditingCard({functionScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {fn}
                                              </label>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Course Genres */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程流派</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['瑜伽', '普拉提'].map(genre => (
                                              <label key={genre} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${editingCard.genreScope?.includes(genre) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={editingCard.genreScope?.includes(genre)} 
                                                      onChange={e => {
                                                          const current = editingCard.genreScope || [];
                                                          const newScope = e.target.checked ? [...current, genre] : current.filter(g => g !== genre);
                                                          setEditingCard({genreScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {genre}
                                              </label>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Listing Venues (Moved out of Scope) */}
                              </div>

                              {/* Row 6: Listing Venues */}
                              <div className="space-y-4">
                                  <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">上架场馆 (Listing Venues)</h4>
                                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                      <div className="flex flex-wrap gap-2">
                                          {['城西馆', '万象馆', '西湖馆', '滨江馆'].map(venue => (
                                              <label key={venue} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${editingCard.listingVenues?.includes(venue) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={editingCard.listingVenues?.includes(venue)} 
                                                      onChange={e => {
                                                          const current = editingCard.listingVenues || [];
                                                          const newScope = e.target.checked ? [...current, venue] : current.filter(v => v !== venue);
                                                          setEditingCard({listingVenues: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {venue}
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                      <button onClick={() => {
                          // Save Logic
                          if (selectedItem.id) {
                              setCards(cards.map(c => c.id === selectedItem.id ? selectedItem as CardProduct : c));
                          } else {
                              setCards([...cards, { ...selectedItem, id: `c_${Date.now()}`, status: 'active' } as CardProduct]);
                          }
                          setSelectedItem(null);
                          handleBack();
                      }} className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 shadow-lg">保存配置</button>
                  </div>
              </div>
              <div className="w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                      <h3 className="font-bold text-gray-900">数据表现</h3>
                      {/* Filters */}
                      <div className="flex gap-2">
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="today">今日</option>
                              <option value="7d">近7天</option>
                              <option value="30d">近30天</option>
                              <option value="custom">自定义</option>
                          </select>
                          <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-black transition flex-1">
                              <option value="all">所有场馆</option>
                              {availableVenues.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scroll">
                      {/* New Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">曝光量 (Exposure)</div>
                              <div className="text-xl font-bold font-mono">3,240</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 8%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">点击量 (Clicks)</div>
                              <div className="text-xl font-bold font-mono">1,150</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 15%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">下单量 (Orders)</div>
                              <div className="text-xl font-bold font-mono">{selectedItem?.totalSales || 45}</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">+{selectedItem?.sales30d || 0}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">转化率 (Conv.)</div>
                              <div className="text-xl font-bold font-mono text-orange-500">12.8%</div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">stable</div>
                          </div>
                      </div>

                      <div className="h-40 w-full">
                          <div className="text-xs font-bold text-gray-400 mb-2 uppercase">销售趋势</div>
                          <ResponsiveContainer width="100%" height="100%"><AreaChart data={salesTrendData}><Area type="monotone" dataKey="val" stroke="#000" fill="#f3f4f6" /></AreaChart></ResponsiveContainer>
                      </div>

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">最近购买记录</div>
                          <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-gray-900">User {i}</div>
                                          <div className="text-[10px] text-gray-400">{i * 2}小时前</div>
                                      </div>
                                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-green-100 text-green-700">已支付</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };



  return view === 'edit' ? renderCardEdit() : renderCardList();
};

export default MallCards;
