import React from 'react';
import type { Staff } from '../../../types';
import { getNextStaffLevel } from '../../../utils/staffSelectors';
import type { StaffProfileArchivePanelProps } from './StaffDetailTypes';

type StaffProfileInputDialogKind = 'cert' | 'video';

interface StaffProfileInputDialog {
  kind: StaffProfileInputDialogKind;
  title: string;
  placeholder: string;
  confirmLabel: string;
}

const StaffProfileArchivePanel: React.FC<StaffProfileArchivePanelProps> = ({
  activeStaff,
  setActiveStaff,
  staffDetails,
  teachingYears,
  isEditingProfile,
  setIsEditingProfile,
  isEditingPricing,
  setIsEditingPricing,
  pricingConfig,
  setPricingConfig,
}) => {
  const [inputDialog, setInputDialog] = React.useState<StaffProfileInputDialog | null>(null);
  const [inputValue, setInputValue] = React.useState('');

  const openInputDialog = (dialog: StaffProfileInputDialog) => {
      setInputDialog(dialog);
      setInputValue('');
  };

  const closeInputDialog = () => {
      setInputDialog(null);
      setInputValue('');
  };

  const submitInputDialog = () => {
      if (!inputDialog) return;

      const value = inputValue.trim();
      if (!value) return;

      if (inputDialog.kind === 'cert') {
          setActiveStaff({
              ...activeStaff,
              certs: [...(activeStaff.certs || []), value],
              certImages: [...(activeStaff.certImages || []), 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400']
          } as Staff);
      }

      if (inputDialog.kind === 'video') {
          setActiveStaff({
              ...activeStaff,
              courseVideos: [...(activeStaff.courseVideos || []), { title: value, url: '#', thumb: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400' }]
          } as Staff);
      }

      closeInputDialog();
  };

  return (
  <div className="w-[400px] bg-[#FAFAFA] border-r border-gray-200 overflow-y-auto custom-scroll flex flex-col">
      <div className="p-6 text-center border-b border-gray-100 relative shrink-0">
          <div className="w-20 h-20 rounded-full mx-auto mb-3 p-1 border border-gray-200 bg-white shadow-sm">
              <img src={staffDetails.avatar} className="w-full h-full rounded-full object-cover" alt="" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{staffDetails.name}</h2>
          <div className="text-xs text-gray-500 mt-1.5 font-mono">{staffDetails.phone}</div>
          <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-2.5 py-1 bg-black text-white rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">{staffDetails.level}</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">西湖馆</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{staffDetails.revenueModel}</span>
          </div>
          <div className="mt-4 text-left">
              <div className="flex justify-between text-[10px] font-bold mb-2">
                  <span className="text-gray-900">{staffDetails.level.toUpperCase()}</span>
                  <span className="text-gray-500">职级综合达成</span>
                  <span className="text-gray-400">{getNextStaffLevel(staffDetails.level)}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: '88%' }}></div>
              </div>
          </div>
      </div>

      <div className="p-6 space-y-6">
          {/* 角色属性 */}
          <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">基础信息</div>
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative group">
                      <div className="text-[10px] text-gray-400 mb-1 font-bold">入职时间</div>
                      {isEditingProfile ? (
                          <input 
                              type="date" 
                              value={staffDetails.joinDate}
                              onChange={(e) => setActiveStaff({ ...activeStaff, joinDate: e.target.value } as Staff)}
                              className="text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                          />
                      ) : (
                          <div className="text-sm font-bold text-gray-900">{staffDetails.joinDate}</div>
                      )}
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative group">
                      <div className="text-[10px] text-gray-400 mb-1 font-bold">教龄起点</div>
                      {isEditingProfile ? (
                          <input 
                              type="date" 
                              value={staffDetails.teachingStartDate}
                              onChange={(e) => setActiveStaff({ ...activeStaff, teachingStartDate: e.target.value } as Staff)}
                              className="text-sm font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
                          />
                      ) : (
                          <>
                              <div className="text-sm font-bold text-gray-900">{teachingYears} <span className="text-xs text-gray-400 font-normal ml-1">({staffDetails.teachingStartDate})</span></div>
                          </>
                      )}
                  </div>
              </div>
          </div>

          {/* 自我介绍 */}
          <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">自我介绍</div>
              <p className="text-xs text-gray-600 leading-relaxed bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">{staffDetails.intro}</p>
          </div>

          {/* 课程偏好 */}
          <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">课程偏好</div>
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div>
                      <div className="text-xs text-gray-500 mb-2 font-bold">私教方向</div>
                      {isEditingProfile ? (
                          <input 
                              type="text" 
                              value={staffDetails.privateSpecialties.join(', ')}
                              onChange={(e) => setActiveStaff({ ...activeStaff, privateSpecialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as Staff)}
                              placeholder="用逗号分隔"
                              className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full outline-none focus:border-blue-500"
                          />
                      ) : (
                          <div className="flex flex-wrap gap-2">
                              {staffDetails.privateSpecialties.map(t => (
                                  <span key={t} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700">{t}</span>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="border-t border-gray-50"></div>
                  <div>
                      <div className="text-xs text-gray-500 mb-2 font-bold">小班/团课</div>
                      {isEditingProfile ? (
                          <input 
                              type="text" 
                              value={staffDetails.groupSpecialties.join(', ')}
                              onChange={(e) => setActiveStaff({ ...activeStaff, groupSpecialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as Staff)}
                              placeholder="用逗号分隔"
                              className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full outline-none focus:border-blue-500"
                          />
                      ) : (
                          <div className="flex flex-wrap gap-2">
                              {staffDetails.groupSpecialties.map(t => (
                                  <span key={t} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700">{t}</span>
                              ))}
                          </div>
                      )}
                  </div>
                  <div className="border-t border-gray-50"></div>
                  <div>
                      <div className="text-xs text-gray-500 mb-2 font-bold">不接待人群</div>
                      {isEditingProfile ? (
                          <input 
                              type="text" 
                              value={staffDetails.nonReceptionGroups.join(', ')}
                              onChange={(e) => setActiveStaff({ ...activeStaff, nonReceptionGroups: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } as Staff)}
                              placeholder="用逗号分隔"
                              className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 w-full outline-none focus:border-red-500"
                          />
                      ) : (
                          <div className="flex flex-wrap gap-2">
                              {staffDetails.nonReceptionGroups.map(t => (
                                  <span key={t} className="px-3 py-1 bg-red-50 border border-red-100 rounded-lg text-[11px] font-bold text-red-600">{t}</span>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* 私教价格与设置 */}
          <div>
              <div className="flex justify-between items-center mb-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">私教价格与设置</div>
                  <button onClick={() => setIsEditingPricing(!isEditingPricing)} className="text-[10px] text-blue-500 font-bold hover:text-blue-600 transition-colors">
                      {isEditingPricing ? '保存设置' : '店长调整'}
                  </button>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">基础私教</span>
                      {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.basic} onChange={e => setPricingConfig({...pricingConfig, basic: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.basic} 点</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">塑形私教</span>
                      {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.shaping} onChange={e => setPricingConfig({...pricingConfig, shaping: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.shaping} 点</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">理疗私教</span>
                      {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.therapy} onChange={e => setPricingConfig({...pricingConfig, therapy: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.therapy} 点</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">孕产私教</span>
                      {isEditingPricing ? <input type="number" step="0.5" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.prenatal} onChange={e => setPricingConfig({...pricingConfig, prenatal: Number(e.target.value)})} /> : <span className="font-mono font-bold text-gray-900">{pricingConfig.prenatal} 点</span>}
                  </div>
                  <div className="border-t border-gray-50 pt-3 mt-3"></div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">体验价</span>
                      {isEditingPricing ? <div className="flex items-center gap-1"><span className="text-gray-400">¥</span><input type="number" className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-mono outline-none focus:border-black" value={pricingConfig.trial} onChange={e => setPricingConfig({...pricingConfig, trial: Number(e.target.value)})} /></div> : <span className="font-mono font-bold text-gray-900">¥{pricingConfig.trial}</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">积分+现金兑换</span>
                      {isEditingPricing ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={pricingConfig.acceptPoints} onChange={e => setPricingConfig({...pricingConfig, acceptPoints: e.target.checked})} />
                              <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black"></div>
                          </label>
                      ) : (
                          <span className={`font-bold ${pricingConfig.acceptPoints ? 'text-green-500' : 'text-gray-400'}`}>{pricingConfig.acceptPoints ? '支持' : '不支持'}</span>
                      )}
                  </div>
              </div>
          </div>

          {/* 资质认证 */}
          <div>
              <div className="flex justify-between items-center mb-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">资质认证</div>
                  {isEditingProfile && (
                      <button onClick={() => {
                          openInputDialog({
                              kind: 'cert',
                              title: '上传证书',
                              placeholder: '请输入证书名称',
                              confirmLabel: '添加证书',
                          });
                      }} className="text-[10px] text-blue-500 hover:underline"><i className="fa-solid fa-plus"></i> 上传证书</button>
                  )}
              </div>
              <div className="space-y-2">
                  {staffDetails.certs.map((c, idx) => (
                      <div key={c} className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group">
                          {isEditingProfile && (
                              <button onClick={() => {
                                  const newCerts = [...(activeStaff.certs || [])];
                                  const newImages = [...(activeStaff.certImages || [])];
                                  newCerts.splice(idx, 1);
                                  newImages.splice(idx, 1);
                                  setActiveStaff({ ...activeStaff, certs: newCerts, certImages: newImages } as Staff);
                              }} className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-100"><i className="fa-solid fa-xmark"></i></button>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-900 font-bold">
                              <div className="w-6 h-6 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 text-[10px]">
                                  <i className="fa-solid fa-certificate"></i>
                              </div>
                              {c}
                          </div>
                          {staffDetails.certImages[idx] && (
                              <div className="w-full h-24 rounded-lg overflow-hidden border border-gray-100 mt-2">
                                  <img src={staffDetails.certImages[idx]} alt="Certificate" className="w-full h-full object-cover" />
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* 课程视频 */}
          <div>
              <div className="flex justify-between items-center mb-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">课程视频</div>
                  {isEditingProfile && (
                      <button onClick={() => {
                          openInputDialog({
                              kind: 'video',
                              title: '上传课程视频',
                              placeholder: '请输入视频标题',
                              confirmLabel: '添加视频',
                          });
                      }} className="text-[10px] text-blue-500 hover:underline"><i className="fa-solid fa-plus"></i> 上传视频</button>
                  )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                  {staffDetails.courseVideos.map((v, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-100 group cursor-pointer">
                          {isEditingProfile && (
                              <button onClick={(e) => {
                                  e.stopPropagation();
                                  const newVideos = [...(activeStaff.courseVideos || [])];
                                  newVideos.splice(idx, 1);
                                  setActiveStaff({ ...activeStaff, courseVideos: newVideos } as Staff);
                              }} className="absolute top-1 right-1 z-10 w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-100"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                          )}
                          <img src={v.thumb} alt={v.title} className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <i className="fa-solid fa-play text-white text-xl opacity-80 group-hover:opacity-100 transition-opacity"></i>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="text-[10px] text-white font-bold truncate">{v.title}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
      
      {/* Edit Button */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0 sticky bottom-0 z-10">
          <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition shadow-lg ${isEditingProfile ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'}`}>
              {isEditingProfile ? '保存档案修改' : '编辑全项档案'}
          </button>
      </div>

      {inputDialog && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeInputDialog}></div>
              <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 animate-fadeIn">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{inputDialog.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{inputDialog.placeholder}</p>
                  <input
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                          if (event.key === 'Enter') submitInputDialog();
                          if (event.key === 'Escape') closeInputDialog();
                      }}
                      placeholder={inputDialog.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-black transition mb-6"
                  />
                  <div className="flex justify-end gap-3">
                      <button onClick={closeInputDialog} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                          取消
                      </button>
                      <button
                          onClick={submitInputDialog}
                          disabled={!inputValue.trim()}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                          {inputDialog.confirmLabel}
                      </button>
                  </div>
              </div>
          </div>
      )}
  </div>


  );
};

export default StaffProfileArchivePanel;
