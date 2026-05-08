import React from 'react';
import type { PointProduct, ProductSpec, ProductSpecValue } from '../../types';
import type {
  MallActionButtonRenderer,
  MallEditorSetter,
  MallPointActionItem,
  MallPointEditorItem,
  PointProductTab,
} from './mallTypes';

interface MallPointsProps {
  view: 'list' | 'edit';
  products: PointProduct[];
  setProducts: React.Dispatch<React.SetStateAction<PointProduct[]>>;
  selectedItem: MallPointEditorItem | null;
  setSelectedItem: MallEditorSetter<MallPointEditorItem>;
  pointProductTab: PointProductTab;
  setPointProductTab: React.Dispatch<React.SetStateAction<PointProductTab>>;
  overview: React.ReactNode;
  actionButtons: MallActionButtonRenderer<MallPointActionItem>;
  handleBack: () => void;
  handleCreateProduct: () => void;
  availableVenues: string[];
}

const MallPoints: React.FC<MallPointsProps> = ({
  view,
  products,
  setProducts,
  selectedItem,
  setSelectedItem,
  pointProductTab,
  setPointProductTab,
  overview,
  actionButtons,
  handleBack,
  handleCreateProduct,
  availableVenues,
}) => {
  const renderPointsList = () => {
      const filteredProducts = products.filter(p => p.type === pointProductTab);

      return (
          <div className="animate-fadeIn space-y-6">
              {overview}
              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200 pb-1">
                  <button 
                      onClick={() => setPointProductTab('course')} 
                      className={`pb-3 text-sm font-bold transition border-b-2 ${pointProductTab === 'course' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                      日常课程兑换
                  </button>
                  <button 
                      onClick={() => setPointProductTab('physical')} 
                      className={`pb-3 text-sm font-bold transition border-b-2 ${pointProductTab === 'physical' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                      实物商品兑换
                  </button>
              </div>

              {/* List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group hover:shadow-md transition flex flex-col h-full">
                          <div className="h-40 bg-gray-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                              <img src={product.cover || undefined} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="" />
                              <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold rounded-bl-lg ${product.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                  {product.status === 'active' ? '上架中' : '已下架'}
                              </div>
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                              <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-gray-500">{product.type === 'physical' ? '实物' : '权益'}</span>
                                  {product.type === 'physical' && (
                                      <span className={`text-[10px] font-bold ${product.inventory < (product.warningInventory || 0) ? 'text-red-500' : 'text-gray-400'}`}>库存: {product.inventory}</span>
                                  )}
                              </div>
                              <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                                  <div>
                                      <div className="text-sm font-bold text-orange-500 font-mono">
                                          {product.enablePurePoints && (
                                              <div>{product.purePointsPrice} 积分</div>
                                          )}
                                          {product.enableMixedPayment && (
                                              <div className="text-[10px] text-gray-500">
                                                  {product.mixedPointsPrice} 积分 + ¥{product.mixedCashPrice}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                                  <div className="text-[10px] text-gray-400">已兑 {product.exchangeCount}</div>
                              </div>
                          </div>
                          {actionButtons(product, 'product')}
                      </div>
                  ))}
                  <div onClick={handleCreateProduct} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition min-h-[320px]">
                      <i className="fa-solid fa-plus text-3xl mb-2"></i>
                      <span className="text-sm font-bold">新建{pointProductTab === 'course' ? '课程' : '商品'}</span>
                  </div>
              </div>
          </div>
      );
  };

  const renderPointsEdit = () => {
      const isPhysical = selectedItem?.type === 'physical';
      const setEditingProduct = (updates: MallPointEditorItem) => setSelectedItem({ ...selectedItem, ...updates });

      return (
          <div className="flex h-full gap-6 animate-fadeIn">
              {/* Left Form */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg">{selectedItem?.id ? '编辑积分商品' : '新建积分商品'}</h3>
                      <div className="flex gap-2">
                          <button 
                              onClick={() => setEditingProduct({ status: selectedItem.status === 'active' ? 'inactive' : 'active' })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedItem?.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                              {selectedItem?.status === 'active' ? '下架商品' : '上架商品'}
                          </button>
                          <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                  </div>
                  <div className="p-8 space-y-8">
                      {/* Module 1: Basic Info */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">基础信息 (Basic Info)</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">商品名称</label>
                                  <input type="text" defaultValue={selectedItem?.name} onBlur={e => setEditingProduct({name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                              </div>
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">商品类型</label>
                                  <select 
                                      value={selectedItem?.type} 
                                      onChange={e => setEditingProduct({type: e.target.value})}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                                  >
                                      <option value="physical">实物商品</option>
                                      <option value="course">日常课程兑换</option>
                                  </select>
                              </div>
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">封面图片 URL</label>
                                  <input type="text" defaultValue={selectedItem?.cover} onBlur={e => setEditingProduct({cover: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                              </div>
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">商品说明</label>
                                  <textarea defaultValue={selectedItem?.description} onBlur={e => setEditingProduct({description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition h-20 resize-none" />
                              </div>
                          </div>
                      </div>

                      {/* Module 2: Redemption Rules */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">兑换规则 (Redemption Rules)</h4>
                          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                              {/* Pure Points Mode */}
                              <div>
                                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedItem?.enablePurePoints} 
                                          onChange={e => setEditingProduct({enablePurePoints: e.target.checked})} 
                                          className="rounded text-black focus:ring-black" 
                                      />
                                      <span className="text-sm font-bold text-gray-900">开启纯积分兑换</span>
                                  </label>
                                  {selectedItem?.enablePurePoints && (
                                      <div className="pl-6">
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">所需积分</label>
                                          <input 
                                              type="number" 
                                              defaultValue={selectedItem?.purePointsPrice} 
                                              onBlur={e => setEditingProduct({purePointsPrice: Number(e.target.value)})} 
                                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                          />
                                      </div>
                                  )}
                              </div>

                              {/* Mixed Mode */}
                              <div className="border-t border-gray-200 pt-4">
                                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedItem?.enableMixedPayment} 
                                          onChange={e => setEditingProduct({enableMixedPayment: e.target.checked})} 
                                          className="rounded text-black focus:ring-black" 
                                      />
                                      <span className="text-sm font-bold text-gray-900">开启积分 + 现金兑换</span>
                                  </label>
                                  {selectedItem?.enableMixedPayment && (
                                      <div className="pl-6 grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="text-xs font-bold text-gray-500 mb-1 block">所需积分</label>
                                              <input 
                                                  type="number" 
                                                  defaultValue={selectedItem?.mixedPointsPrice} 
                                                  onBlur={e => setEditingProduct({mixedPointsPrice: Number(e.target.value)})} 
                                                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs font-bold text-gray-500 mb-1 block">所需现金 (¥)</label>
                                              <input 
                                                  type="number" 
                                                  defaultValue={selectedItem?.mixedCashPrice} 
                                                  onBlur={e => setEditingProduct({mixedCashPrice: Number(e.target.value)})} 
                                                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                              />
                                          </div>
                                      </div>
                                  )}
                              </div>

                              {/* Validity for Courses */}
                              {!isPhysical && (
                                  <div className="border-t border-gray-200 pt-4 space-y-4">
                                      {/* Class Pack Option */}
                                      <div>
                                          <label className="flex items-center gap-2 cursor-pointer mb-3">
                                              <input 
                                                  type="checkbox" 
                                                  checked={selectedItem?.isClassPack} 
                                                  onChange={e => setEditingProduct({isClassPack: e.target.checked})} 
                                                  className="rounded text-black focus:ring-black" 
                                              />
                                              <span className="text-sm font-bold text-gray-900">是否是次卡 (Class Pack)</span>
                                          </label>
                                          {selectedItem?.isClassPack && (
                                              <div className="pl-6">
                                                  <label className="text-xs font-bold text-gray-500 mb-1 block">次数 (Count)</label>
                                                  <input 
                                                      type="number" 
                                                      defaultValue={selectedItem?.classCount} 
                                                      onBlur={e => setEditingProduct({classCount: Number(e.target.value)})} 
                                                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                                  />
                                              </div>
                                          )}
                                      </div>

                                      <div>
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">有效期 (天)</label>
                                          <input 
                                              type="number" 
                                              defaultValue={selectedItem?.validityDays} 
                                              onBlur={e => setEditingProduct({validityDays: Number(e.target.value)})} 
                                              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" 
                                          />
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Module 3: Specifications & Inventory (Physical Only) */}
                      {isPhysical && (
                          <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">规格与库存 (Specs & Inventory)</h4>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                  {/* Inventory */}
                                  <div className="grid grid-cols-2 gap-6">
                                      <div>
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">总库存</label>
                                          <input type="number" defaultValue={selectedItem?.inventory} onBlur={e => setEditingProduct({inventory: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                                      </div>
                                      <div>
                                          <label className="text-xs font-bold text-gray-500 mb-1 block">预警库存</label>
                                          <input type="number" defaultValue={selectedItem?.warningInventory} onBlur={e => setEditingProduct({warningInventory: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                                      </div>
                                  </div>

                                  {/* Specifications */}
                                  <div className="border-t border-gray-200 pt-6 space-y-4">
                                      <div className="flex justify-between items-center">
                                          <label className="text-xs font-bold text-gray-500 block">商品规格</label>
                                          <button 
                                              onClick={() => {
                                                  const currentSpecs = selectedItem?.specs || [];
                                                  setEditingProduct({ specs: [...currentSpecs, { name: '新规格', values: [] }] });
                                              }}
                                              className="text-xs font-bold text-black hover:underline"
                                          >
                                              + 添加规格
                                          </button>
                                      </div>
                                      
                                      {(selectedItem?.specs || []).map((spec: ProductSpec, specIndex: number) => (
                                          <div key={specIndex} className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                              <div className="flex justify-between items-center">
                                                  <input 
                                                      type="text" 
                                                      value={spec.name}
                                                      onChange={(e) => {
                                                          const newSpecs = [...(selectedItem?.specs || [])];
                                                          newSpecs[specIndex].name = e.target.value;
                                                          setEditingProduct({ specs: newSpecs });
                                                      }}
                                                      className="text-sm font-bold border-b border-gray-200 focus:border-black outline-none w-32"
                                                      placeholder="规格名称 (如: 颜色)"
                                                  />
                                                  <button 
                                                      onClick={() => {
                                                          const newSpecs = [...(selectedItem?.specs || [])];
                                                          newSpecs.splice(specIndex, 1);
                                                          setEditingProduct({ specs: newSpecs });
                                                      }}
                                                      className="text-xs text-red-500 hover:text-red-700"
                                                  >
                                                      删除
                                                  </button>
                                              </div>
                                              
                                              <div className="space-y-2">
                                                  {spec.values.map((val: ProductSpecValue, valIndex: number) => (
                                                      <div key={valIndex} className="flex items-center gap-2">
                                                          <input 
                                                              type="text" 
                                                              value={val.name}
                                                              onChange={(e) => {
                                                                  const newSpecs = [...(selectedItem?.specs || [])];
                                                                  newSpecs[specIndex].values[valIndex].name = e.target.value;
                                                                  setEditingProduct({ specs: newSpecs });
                                                              }}
                                                              className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-black"
                                                              placeholder="规格值"
                                                          />
                                                          <input 
                                                              type="text" 
                                                              value={val.image || ''}
                                                              onChange={(e) => {
                                                                  const newSpecs = [...(selectedItem?.specs || [])];
                                                                  newSpecs[specIndex].values[valIndex].image = e.target.value;
                                                                  setEditingProduct({ specs: newSpecs });
                                                              }}
                                                              className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-black"
                                                              placeholder="图片URL (可选)"
                                                          />
                                                          <button 
                                                              onClick={() => {
                                                                  const newSpecs = [...(selectedItem?.specs || [])];
                                                                  newSpecs[specIndex].values.splice(valIndex, 1);
                                                                  setEditingProduct({ specs: newSpecs });
                                                              }}
                                                              className="text-gray-400 hover:text-red-500"
                                                          >
                                                              <i className="fa-solid fa-xmark"></i>
                                                          </button>
                                                      </div>
                                                  ))}
                                                  <button 
                                                      onClick={() => {
                                                          const newSpecs = [...(selectedItem?.specs || [])];
                                                          newSpecs[specIndex].values.push({ name: '', image: '' });
                                                          setEditingProduct({ specs: newSpecs });
                                                      }}
                                                      className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                                                  >
                                                      <i className="fa-solid fa-plus"></i> 添加值
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Module 4: Scope (For Courses Only) */}
                      {selectedItem?.type === 'course' && (
                          <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">适用范围 (Scope)</h4>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                                  {/* Usage Venues */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">使用场馆</label>
                                      <div className="flex gap-4">
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="product_scope" checked={selectedItem.scope === 'single'} onChange={() => setEditingProduct({scope: 'single'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">单店 (Single Store)</span>
                                          </label>
                                          <label className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="product_scope" checked={selectedItem.scope === 'all'} onChange={() => setEditingProduct({scope: 'all'})} className="text-black focus:ring-black" />
                                              <span className="text-xs font-medium">通馆 (All Stores)</span>
                                          </label>
                                      </div>
                                  </div>

                                  {/* Course Types */}
                                  <div>
                                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">课程类型</label>
                                      <div className="flex flex-wrap gap-2">
                                          {['团课', '小班', '私教', '教培工作坊'].map(fn => (
                                              <label key={fn} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${selectedItem.functionScope?.includes(fn) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={selectedItem.functionScope?.includes(fn)} 
                                                      onChange={e => {
                                                          const current = selectedItem.functionScope || [];
                                                          const newScope = e.target.checked ? [...current, fn] : current.filter((f: string) => f !== fn);
                                                          setEditingProduct({functionScope: newScope});
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
                                              <label key={genre} className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${selectedItem.genreScope?.includes(genre) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                                                  <input 
                                                      type="checkbox" 
                                                      checked={selectedItem.genreScope?.includes(genre)} 
                                                      onChange={e => {
                                                          const current = selectedItem.genreScope || [];
                                                          const newScope = e.target.checked ? [...current, genre] : current.filter((g: string) => g !== genre);
                                                          setEditingProduct({genreScope: newScope});
                                                      }} 
                                                      className="hidden" 
                                                  />
                                                  {genre}
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Module 5: Listing Venues */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">上架场馆 (Listing Venues)</h4>
                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="grid grid-cols-2 gap-4">
                                  {availableVenues.map(venue => (
                                      <label key={venue} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                          <input 
                                            type="checkbox" 
                                            checked={selectedItem?.venues?.includes(venue) || false}
                                            onChange={(e) => {
                                                const current = selectedItem?.venues || [];
                                                if(e.target.checked) {
                                                    setEditingProduct({venues: [...current, venue]});
                                                } else {
                                                    setEditingProduct({venues: current.filter((v:string) => v !== venue)});
                                                }
                                            }}
                                            className="w-4 h-4 rounded text-black focus:ring-black border-gray-300"
                                          />
                                          {venue}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                      <button 
                          onClick={() => {
                              // Save Logic
                              if (selectedItem.id) {
                                  setProducts(products.map(p => p.id === selectedItem.id ? selectedItem as PointProduct : p));
                              } else {
                                  setProducts([...products, { ...selectedItem, id: `p_${Date.now()}` } as PointProduct]);
                              }
                              setSelectedItem(null);
                              handleBack();
                          }}
                          className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
                      >
                          保存商品
                      </button>
                  </div>
              </div>

              {/* Right Sidebar: Stats */}
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
                              <div className="text-xl font-bold font-mono">2,450</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 12%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">点击量 (Clicks)</div>
                              <div className="text-xl font-bold font-mono">860</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 5%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">下单量 (Orders)</div>
                              <div className="text-xl font-bold font-mono">{selectedItem?.exchangeCount || 125}</div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">-</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">转化率 (Conv.)</div>
                              <div className="text-xl font-bold font-mono text-orange-500">14.5%</div>
                              <div className="text-[10px] text-red-500 font-bold mt-1">↓ 2%</div>
                          </div>
                      </div>

                      {isPhysical && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="flex justify-between items-center mb-2">
                                  <div className="text-xs text-gray-400">库存消耗</div>
                                  <div className="text-xs font-bold text-orange-500">{selectedItem?.inventoryUsage || 0}%</div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${selectedItem?.inventoryUsage || 0}%` }}></div>
                              </div>
                          </div>
                      )}

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">最近兑换记录</div>
                          <div className="space-y-3">
                              {(selectedItem?.recentExchanges || []).map((log: NonNullable<PointProduct['recentExchanges']>[number]) => (
                                  <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                                          <img src={log.avatar || undefined} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-gray-900">{log.user}</div>
                                          <div className="text-[10px] text-gray-400">{log.date}</div>
                                      </div>
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                          {log.status === 'completed' ? '已完成' : '处理中'}
                                      </span>
                                  </div>
                              ))}
                              {(!selectedItem?.recentExchanges || selectedItem?.recentExchanges.length === 0) && (
                                  <div className="text-center text-xs text-gray-400 py-4">暂无兑换记录</div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };



  return view === 'edit' ? renderPointsEdit() : renderPointsList();
};

export default MallPoints;
