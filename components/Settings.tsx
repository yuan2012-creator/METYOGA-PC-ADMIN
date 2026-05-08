
import React, { useState } from 'react';
import {
    INITIAL_ACTIVE_STORE_ID,
    INITIAL_BASE_POINT_VALUE,
    INITIAL_COMMISSION_RULES,
    INITIAL_MEMBER_RULES,
    INITIAL_ROLES,
    INITIAL_STORE_PRICING,
    INITIAL_TEACHER_LEVELS,
    SETTINGS_ACCOUNTS,
    SETTINGS_PERMISSION_MODULES,
    SETTINGS_TABS,
    createCourseItem,
    createCustomRole,
    createTeacherLevel,
    type CourseItem,
    type CoursePricingType,
    type Role,
    type SettingsTab,
    type StorePricing,
    type TeacherLevel,
} from '../utils/settingsPresentation';

type SettingsToastTone = 'info' | 'success' | 'warning';

interface SettingsToast {
    id: number;
    message: string;
    tone: SettingsToastTone;
}

interface SettingsConfirmDialog {
    title: string;
    message: string;
    confirmLabel?: string;
    tone?: 'danger' | 'default';
    onConfirm: () => void;
}

interface SettingsInputDialog {
    title: string;
    message?: string;
    placeholder?: string;
    confirmLabel?: string;
    onConfirm: (value: string) => void;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('salary');
  const [toast, setToast] = useState<SettingsToast | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<SettingsConfirmDialog | null>(null);
  const [inputDialog, setInputDialog] = useState<SettingsInputDialog | null>(null);
  const [inputDialogValue, setInputDialogValue] = useState('');

  // --- 9.1 Salary & Promotion State ---
  const [autoPromotion, setAutoPromotion] = useState(true);
  const [levels, setLevels] = useState<TeacherLevel[]>(INITIAL_TEACHER_LEVELS);
  const [commissionRules, setCommissionRules] = useState(INITIAL_COMMISSION_RULES);

  const showToast = (message: string, tone: SettingsToastTone = 'info') => {
      setToast({ id: Date.now(), message, tone });
      window.setTimeout(() => {
          setToast(current => (current?.message === message ? null : current));
      }, 2400);
  };

  const openConfirmDialog = (dialog: SettingsConfirmDialog) => {
      setConfirmDialog(dialog);
  };

  const openInputDialog = (dialog: SettingsInputDialog) => {
      setInputDialog(dialog);
      setInputDialogValue('');
  };

  const closeInputDialog = () => {
      setInputDialog(null);
      setInputDialogValue('');
  };

  const submitInputDialog = () => {
      if (!inputDialog) return;
      const value = inputDialogValue.trim();
      if (!value) return;

      inputDialog.onConfirm(value);
      closeInputDialog();
  };

  // Actions for Salary
  const addLevel = () => {
      setLevels(current => [...current, createTeacherLevel(current)]);
  };

  const removeLevel = (id: number) => {
      openConfirmDialog({
          title: '删除老师等级',
          message: '确定删除该等级吗？',
          confirmLabel: '删除等级',
          tone: 'danger',
          onConfirm: () => {
              setLevels(current => current.filter(l => l.id !== id));
          },
      });
  };

  const updateLevel = <K extends keyof TeacherLevel>(id: number, field: K, value: TeacherLevel[K]) => {
      setLevels(current => current.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // --- 9.2 Course & Pricing State ---
  const [basePointValue, setBasePointValue] = useState(INITIAL_BASE_POINT_VALUE);
  const [activeStoreId, setActiveStoreId] = useState(INITIAL_ACTIVE_STORE_ID);
  const [storePricing, setStorePricing] = useState<StorePricing[]>(INITIAL_STORE_PRICING);

  const currentStore = storePricing.find(s => s.id === activeStoreId) || storePricing[0];

  // Actions for Course Pricing
  const addCourseItem = (type: CoursePricingType) => {
      const updatedStores = storePricing.map(store => {
          if (store.id === activeStoreId) {
              const list = store[type];
              return { ...store, [type]: [...list, createCourseItem(list, type)] };
          }
          return store;
      });
      setStorePricing(updatedStores);
  };

  const removeCourseItem = (type: CoursePricingType, itemId: number) => {
      const updatedStores = storePricing.map(store => {
          if (store.id === activeStoreId) {
              return { ...store, [type]: store[type].filter(i => i.id !== itemId) };
          }
          return store;
      });
      setStorePricing(updatedStores);
  };

  const updateCourseItem = <K extends keyof CourseItem>(type: CoursePricingType, itemId: number, field: K, value: CourseItem[K]) => {
      const updatedStores = storePricing.map(store => {
          if (store.id === activeStoreId) {
              const updatedList = store[type].map(item => item.id === itemId ? { ...item, [field]: value } : item);
              return { ...store, [type]: updatedList } as StorePricing;
          }
          return store;
      });
      setStorePricing(updatedStores);
  };

  // 9.3 Member Rules (Mock)
  const [memberRules, setMemberRules] = useState(INITIAL_MEMBER_RULES);

  // 9.4 Role & Permissions (New)
  const permissionModules = SETTINGS_PERMISSION_MODULES;
  const accounts = SETTINGS_ACCOUNTS;
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);

  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const activeRole = roles.find(r => r.id === activeRoleId);

  const togglePermission = (permId: string) => {
      if (!activeRole || activeRole.type === 'system') return; // Admin permissions locked
      
      const hasPerm = activeRole.permissions.includes(permId);
      const newPerms = hasPerm 
          ? activeRole.permissions.filter(p => p !== permId)
          : [...activeRole.permissions, permId];
      
      setRoles(roles.map(r => r.id === activeRoleId ? { ...r, permissions: newPerms } : r));
  };

  const toggleRoleMember = (accountId: number) => {
      if (!activeRole) return;
      if (activeRole.type === 'system' && activeRole.memberIds.length <= 1 && activeRole.memberIds.includes(accountId)) {
          showToast('系统至少需要保留一位总管理员', 'warning');
          return;
      }

      // Remove from other roles first (assuming 1 user = 1 role for simplicity in this UI)
      const updatedRoles = roles.map(r => ({
          ...r,
          memberIds: r.memberIds.filter(id => id !== accountId)
      }));

      // Add to current role if not already there
      const isCurrentlyInRole = activeRole.memberIds.includes(accountId);
      
      if (!isCurrentlyInRole) {
          const targetRoleIndex = updatedRoles.findIndex(r => r.id === activeRoleId);
          if(targetRoleIndex >= 0) updatedRoles[targetRoleIndex].memberIds.push(accountId);
      }

      setRoles(updatedRoles);
  };

  const addNewRole = () => {
      openInputDialog({
          title: '新增角色',
          message: '请输入新角色名称',
          placeholder: '例如：门店运营主管',
          confirmLabel: '创建角色',
          onConfirm: (name) => {
              const newRole = createCustomRole(name);
              setRoles(current => [...current, newRole]);
              setActiveRoleId(newRole.id);
          },
      });
  };

  const deleteRole = (roleId: string) => {
      openConfirmDialog({
          title: '删除角色',
          message: '确定删除该角色吗？关联的员工将失去权限。',
          confirmLabel: '删除角色',
          tone: 'danger',
          onConfirm: () => {
              setRoles(current => current.filter(r => r.id !== roleId));
              if(activeRoleId === roleId) setActiveRoleId(null);
          },
      });
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-[#F5F5F7]">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    系统设置
                    <button 
                        onClick={() => showToast('Gemini AI 正在分析系统配置并生成优化建议...', 'info')}
                        className="text-[10px] text-purple-600 font-bold flex items-center gap-1 hover:underline ml-2 bg-purple-50 px-2 py-1 rounded-full border border-purple-100"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI 配置优化
                    </button>
                </h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">V 2.2.0</span>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-xs text-gray-500 hover:text-black font-medium transition">重置更改</button>
                <button 
                    className="bg-black text-white text-xs px-5 py-2 rounded-lg font-bold hover:opacity-80 transition shadow-lg shadow-black/10"
                    onClick={() => showToast('配置已在前端演示态生效，真实后台保存与同步待接口接入', 'success')}
                >
                    保存配置
                </button>
            </div>
        </div>

        {/* Sub Nav */}
        <div className="px-8 py-4 bg-[#F5F5F7] sticky top-16 z-10 border-b border-gray-200/50 flex justify-start">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                {SETTINGS_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative z-10 px-4 py-2 text-[13px] font-medium text-center rounded-lg transition-all duration-200 ${
                            activeTab === tab.id
                            ? 'bg-white text-black shadow-sm font-bold'
                            : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
            <div className="max-w-6xl mx-auto space-y-8 min-h-[600px]">

                {/* --- 9.1 Salary & Promotion --- */}
                {activeTab === 'salary' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* ... Existing Salary Code ... */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">9.1.1 老师等级与自动晋升</h3>
                                    <p className="text-sm text-gray-500">系统将根据累计上课时长自动更新老师等级，并调整基础课时费。</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-600">启用自动晋升</span>
                                    <div 
                                        onClick={() => setAutoPromotion(!autoPromotion)}
                                        className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${autoPromotion ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${autoPromotion ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-3">等级名称</div>
                                    <div className="col-span-3">晋升门槛 (累计课时)</div>
                                    <div className="col-span-2">基础课时费 (团课)</div>
                                    <div className="col-span-2">基础课时费 (私教)</div>
                                    <div className="col-span-2 text-right">操作</div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {levels.map((lvl, index) => (
                                        <div key={lvl.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center bg-white hover:bg-gray-50/80 transition group">
                                            <div className="col-span-3 flex items-center gap-3">
                                                <span className={`flex-shrink-0 w-10 h-6 flex items-center justify-center rounded text-[10px] font-bold uppercase ${
                                                    index === 0 ? 'bg-gray-100 text-gray-500' : 
                                                    index === 1 ? 'bg-blue-50 text-blue-600' : 
                                                    index === 2 ? 'bg-purple-50 text-purple-600' : 'bg-black text-white'
                                                }`}>LV{index + 1}</span>
                                                <input type="text" value={lvl.name} onChange={(e) => updateLevel(lvl.id, 'name', e.target.value)} className="w-full font-bold text-gray-900 bg-transparent outline-none focus:text-black" />
                                            </div>
                                            <div className="col-span-3">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-32 group-hover:bg-white group-hover:border group-hover:border-gray-200 transition">
                                                    <span className="text-gray-400 text-xs">{index === 0 ? '' : '>'}</span>
                                                    <input type="number" value={lvl.threshold} disabled={index === 0} onChange={(e) => updateLevel(lvl.id, 'threshold', parseInt(e.target.value))} className="w-full bg-transparent font-bold text-gray-900 text-sm outline-none text-center disabled:text-gray-400" />
                                                    <span className="text-gray-400 text-xs">h</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-24 group-hover:bg-white group-hover:border group-hover:border-gray-200 transition"><span className="text-gray-400 text-xs">¥</span><input type="number" value={lvl.baseGroup} onChange={(e) => updateLevel(lvl.id, 'baseGroup', parseInt(e.target.value))} className="w-full bg-transparent font-bold text-gray-900 text-sm outline-none" /></div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-24 group-hover:bg-white group-hover:border group-hover:border-gray-200 transition"><span className="text-gray-400 text-xs">¥</span><input type="number" value={lvl.basePrivate} onChange={(e) => updateLevel(lvl.id, 'basePrivate', parseInt(e.target.value))} className="w-full bg-transparent font-bold text-gray-900 text-sm outline-none" /></div>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                {index === 0 ? <i className="fa-solid fa-lock text-gray-300 mr-4"></i> : <button onClick={() => removeLevel(lvl.id)} className="text-gray-400 hover:text-red-500 transition text-sm font-medium">删除</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div onClick={addLevel} className="py-4 text-center text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-50 cursor-pointer transition border-t border-gray-100">+ 添加新等级</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-8">9.1.2 销售提成规则</h3>
                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-600 mb-4">体验课转化提成 (私教)</h4>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                                        <span className="text-sm text-gray-900 font-medium">每转化一单，提成销售额的</span>
                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-32">
                                            <input type="number" value={commissionRules.trialConversion} onChange={e => setCommissionRules({...commissionRules, trialConversion: Number(e.target.value)})} className="w-full text-center font-bold text-xl text-green-600 outline-none bg-transparent" />
                                            <span className="text-sm font-bold text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-600 mb-4">会员续费提成</h4>
                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                                        <span className="text-sm text-gray-900 font-medium">每成功续费，提成销售额的</span>
                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-32">
                                            <input type="number" value={commissionRules.renewal} onChange={e => setCommissionRules({...commissionRules, renewal: Number(e.target.value)})} className="w-full text-center font-bold text-xl text-black outline-none bg-transparent" />
                                            <span className="text-sm font-bold text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 9.2 Course & Pricing --- */}
                {activeTab === 'course' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* ... Existing Course Code ... */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
                            <div><h3 className="font-bold text-lg text-gray-900">点数基准汇率</h3><p className="text-xs text-gray-500 mt-0.5">所有课程价格将基于此汇率与点数自动折算。</p></div>
                            <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200"><span className="text-sm font-bold text-gray-600">1 点数 (Point) = </span><div className="flex items-center"><span className="text-sm text-gray-900 font-bold mr-1">¥</span><input type="number" value={basePointValue} onChange={(e) => setBasePointValue(Number(e.target.value))} className="w-20 bg-transparent border-b-2 border-black font-mono text-2xl font-bold text-center outline-none focus:border-green-500 transition" /></div></div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 p-2 overflow-x-auto no-scrollbar"><div className="flex gap-2">{storePricing.map(store => (<button key={store.id} onClick={() => setActiveStoreId(store.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 flex items-center gap-2 ${activeStoreId === store.id ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}><i className={`fa-solid ${activeStoreId === store.id ? 'fa-location-dot text-green-600' : 'fa-building'}`}></i>{store.name}</button>))}</div></div>
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8"><div><h3 className="font-bold text-lg text-gray-900">{currentStore.name} · 课程点数配置</h3><p className="text-xs text-gray-500 mt-1">自定义该门店的课程类型及点数消耗。</p></div><span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded">当前汇率: 1点 = ¥{basePointValue}</span></div>
                                <div className="grid grid-cols-2 gap-12">
                                    <div>
                                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100"><h4 className="text-sm font-bold text-gray-900">小班团课</h4><button onClick={() => addCourseItem('group')} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition">+ 添加课程</button></div>
                                        <div className="space-y-2">
                                            {currentStore.group.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200 transition">
                                                    <input type="text" value={item.name} onChange={(e) => updateCourseItem('group', item.id, 'name', e.target.value)} className="bg-transparent font-medium text-sm text-gray-700 w-32 outline-none border-b border-transparent focus:border-black transition" />
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center bg-white rounded-lg px-2 py-1 border border-gray-200 group-hover:border-gray-300 transition"><input type="number" step="0.5" value={item.points} onChange={(e) => updateCourseItem('group', item.id, 'points', Number(e.target.value))} className="w-10 bg-transparent text-center font-bold text-sm outline-none" /><span className="text-xs text-gray-400 font-medium">点</span></div>
                                                        <div className="w-16 text-right text-xs text-gray-400 font-mono">¥{(item.points * basePointValue).toLocaleString()}</div>
                                                        <button onClick={() => removeCourseItem('group', item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100"><h4 className="text-sm font-bold text-gray-900">私教课程</h4><button onClick={() => addCourseItem('private')} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition">+ 添加类型</button></div>
                                        <div className="space-y-2">
                                            {currentStore.private.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200 transition">
                                                    <input type="text" value={item.name} onChange={(e) => updateCourseItem('private', item.id, 'name', e.target.value)} className="bg-transparent font-medium text-sm text-gray-700 w-32 outline-none border-b border-transparent focus:border-black transition" />
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center bg-white rounded-lg px-2 py-1 border border-gray-200 group-hover:border-gray-300 transition"><input type="number" step="0.5" value={item.points} onChange={(e) => updateCourseItem('private', item.id, 'points', Number(e.target.value))} className="w-10 bg-transparent text-center font-bold text-sm outline-none" /><span className="text-xs text-gray-400 font-medium">点</span></div>
                                                        <div className="w-16 text-right text-xs text-gray-400 font-mono">¥{(item.points * basePointValue).toLocaleString()}</div>
                                                        <button onClick={() => removeCourseItem('private', item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 9.3 Member Rules --- */}
                {activeTab === 'member' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* ... Existing Member Rules Code ... */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <h3 className="font-bold text-lg text-gray-900 mb-8">会员生命周期流转规则</h3>
                            <div className="flex items-center justify-between relative z-10"><div className="absolute left-0 right-0 top-6 h-1 bg-gray-100 -z-10"></div>{['S0 潜客', 'S1 新客', 'S3 稳定', 'S5 休眠', 'S6 流失'].map((stage, i) => (<div key={i} className="flex flex-col items-center gap-4 bg-white px-2"><div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-bold ${i === 3 || i === 4 ? 'border-red-100 bg-red-50 text-red-600' : 'border-black bg-white text-black'}`}>{stage.split(' ')[0]}</div><span className="text-xs font-bold text-gray-600">{stage.split(' ')[1]}</span></div>))}</div>
                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200"><h4 className="font-bold text-sm text-gray-900 mb-3"><i className="fa-solid fa-bed text-orange-500 mr-2"></i> 自动转入休眠 (S5)</h4><div className="flex items-center gap-3"><span className="text-xs text-gray-600">连续未到店天数 &gt;</span><input type="number" value={memberRules.s5SleepDays} onChange={(e) => setMemberRules({...memberRules, s5SleepDays: parseInt(e.target.value)})} className="w-20 bg-white border border-gray-300 rounded px-3 py-1 text-center font-bold text-sm" /><span className="text-xs text-gray-600">天</span></div></div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200"><h4 className="font-bold text-sm text-gray-900 mb-3"><i className="fa-solid fa-user-xmark text-red-500 mr-2"></i> 判定为流失 (S6)</h4><div className="flex items-center gap-3"><span className="text-xs text-gray-600">会员卡过期或无课天数 &gt;</span><input type="number" value={memberRules.s6ChurnDays} onChange={(e) => setMemberRules({...memberRules, s6ChurnDays: parseInt(e.target.value)})} className="w-20 bg-white border border-gray-300 rounded px-3 py-1 text-center font-bold text-sm" /><span className="text-xs text-gray-600">天</span></div></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 9.4 Role & Permissions (Card Layout) --- */}
                {activeTab === 'role' && (
                    <div className="space-y-6 animate-fadeIn">
                        
                        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">角色与权限管理</h3>
                                <p className="text-sm text-gray-500 mt-1">点击角色卡片，配置该角色的详细权限与人员分配。</p>
                            </div>
                            <button 
                                onClick={addNewRole}
                                className="bg-black text-white text-xs px-5 py-2.5 rounded-xl font-bold hover:opacity-80 transition flex items-center gap-2 shadow-lg shadow-black/10"
                            >
                                <i className="fa-solid fa-plus"></i> 新增角色
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map(role => (
                                <div 
                                    key={role.id}
                                    onClick={() => setActiveRoleId(role.id)}
                                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${role.type === 'system' ? 'bg-gray-100 text-gray-600' : 'bg-black text-white'}`}>
                                            <i className={`fa-solid ${role.type === 'system' ? 'fa-shield-halved' : 'fa-user-tag'}`}></i>
                                        </div>
                                        {role.type === 'system' && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">System</span>}
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{role.name}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed mb-6">{role.desc}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="flex -space-x-2 pl-1">
                                            {role.memberIds.map((mid, idx) => {
                                                const m = accounts.find(a => a.id === mid);
                                                if (idx > 3) return null;
                                                return m ? (
                                                    <div key={mid} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm" title={m.name}>
                                                        {m.avatar}
                                                    </div>
                                                ) : null;
                                            })}
                                            {role.memberIds.length > 4 && (
                                                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500 shadow-sm">
                                                    +{role.memberIds.length - 4}
                                                </div>
                                            )}
                                            {role.memberIds.length === 0 && <span className="text-[10px] text-gray-400 self-center ml-2">暂无人员</span>}
                                        </div>
                                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                                            配置 <i className="fa-solid fa-arrow-right"></i>
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Quick Add Placeholder */}
                            <div 
                                onClick={addNewRole}
                                className="rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition min-h-[220px]"
                            >
                                <i className="fa-solid fa-plus text-3xl text-gray-300 mb-3"></i>
                                <span className="text-sm font-bold text-gray-400">创建新角色</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
        
        {/* --- Role Detail Modal --- */}
        {activeTab === 'role' && activeRoleId && activeRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveRoleId(null)}></div>
                <div className="bg-white w-[1000px] h-[85vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeInUp relative">
                    
                    {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white z-10">
                        <div className="flex-1 mr-8">
                            <div className="flex items-center gap-3 mb-2">
                                <input 
                                    type="text" 
                                    value={activeRole.name}
                                    onChange={(e) => setRoles(roles.map(r => r.id === activeRoleId ? { ...r, name: e.target.value } : r))}
                                    disabled={activeRole.type === 'system'}
                                    className={`text-2xl font-bold text-gray-900 bg-transparent outline-none w-full ${activeRole.type === 'system' ? 'cursor-default' : 'hover:bg-gray-50 border-b border-transparent focus:border-black transition'}`}
                                />
                                {activeRole.type === 'system' && <span className="text-[10px] bg-black text-white px-2 py-1 rounded font-bold whitespace-nowrap">系统默认</span>}
                            </div>
                            <input 
                                type="text" 
                                value={activeRole.desc}
                                onChange={(e) => setRoles(roles.map(r => r.id === activeRoleId ? { ...r, desc: e.target.value } : r))}
                                className="text-sm text-gray-500 bg-transparent outline-none w-full hover:bg-gray-50 rounded px-1 transition"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            {activeRole.type !== 'system' && (
                                <button onClick={() => deleteRole(activeRole.id)} className="text-gray-400 hover:text-red-500 transition px-2">
                                    <i className="fa-regular fa-trash-can text-lg"></i>
                                </button>
                            )}
                            <button onClick={() => setActiveRoleId(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                                <i className="fa-solid fa-xmark text-gray-500"></i>
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scroll bg-[#FBFBFD]">
                        <div className="grid grid-cols-12 gap-8">
                            
                            {/* Left: Members */}
                            <div className="col-span-4 space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <i className="fa-solid fa-user-group text-gray-400"></i> 分配人员
                                    </h4>
                                    <div className="space-y-3">
                                        {accounts.map(account => {
                                            const isActive = activeRole.memberIds.includes(account.id);
                                            return (
                                                <div 
                                                    key={account.id}
                                                    onClick={() => toggleRoleMember(account.id)}
                                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition select-none ${
                                                        isActive 
                                                        ? 'bg-black text-white border-black shadow-md' 
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'}`}>
                                                            {account.avatar}
                                                        </div>
                                                        <span className="text-sm font-bold">{account.name}</span>
                                                    </div>
                                                    {isActive && <i className="fa-solid fa-check text-sm"></i>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 p-3 bg-gray-50 rounded-xl text-[10px] text-gray-500 leading-relaxed border border-gray-100">
                                        提示: 一个员工可以拥有多个角色，其权限将取并集。
                                    </div>
                                </div>
                            </div>

                            {/* Right: Permissions */}
                            <div className="col-span-8 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <i className="fa-solid fa-lock text-gray-400"></i> 权限配置
                                    </h4>
                                    {activeRole.type === 'system' && <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded font-bold">系统角色权限不可修改</span>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    {permissionModules.map(module => (
                                        <div key={module.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600">
                                                    <i className={`fa-solid ${module.icon}`}></i>
                                                </div>
                                                <span className="font-bold text-gray-900 text-sm">{module.name}</span>
                                            </div>
                                            <div className="space-y-3">
                                                {module.nodes.map(node => {
                                                    const isEnabled = activeRole.permissions.includes('all') || activeRole.permissions.includes(node.id);
                                                    const isDisabled = activeRole.type === 'system';

                                                    return (
                                                        <div key={node.id} className="flex justify-between items-center group">
                                                            <div className="flex flex-col">
                                                                <span className={`text-xs font-medium ${node.isDangerous ? 'text-red-600' : 'text-gray-700'}`}>
                                                                    {node.name} {node.isDangerous && <i className="fa-solid fa-triangle-exclamation text-[10px] ml-1"></i>}
                                                                </span>
                                                            </div>
                                                            
                                                            <div 
                                                                onClick={() => !isDisabled && togglePermission(node.id)}
                                                                className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                                                                    isEnabled ? 'bg-green-500' : 'bg-gray-200'
                                                                } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                            >
                                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${isEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )}

        {toast && (
            <div className="fixed top-20 right-8 z-[70] animate-fadeIn">
                <div className={`px-4 py-3 rounded-xl shadow-xl border text-sm font-bold flex items-center gap-3 ${
                    toast.tone === 'success'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : toast.tone === 'warning'
                    ? 'bg-orange-50 text-orange-700 border-orange-100'
                    : 'bg-white text-gray-800 border-gray-100'
                }`}>
                    <i className={`fa-solid ${
                        toast.tone === 'success'
                        ? 'fa-circle-check'
                        : toast.tone === 'warning'
                        ? 'fa-triangle-exclamation'
                        : 'fa-circle-info'
                    }`}></i>
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                        confirmDialog.tone === 'danger'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                        <i className={`fa-solid ${confirmDialog.tone === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-question'}`}></i>
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
                            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                                confirmDialog.tone === 'danger'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-black hover:bg-gray-800'
                            }`}
                        >
                            {confirmDialog.confirmLabel || '确认'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {inputDialog && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeInputDialog}></div>
                <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 animate-fadeIn">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{inputDialog.title}</h3>
                    {inputDialog.message && <p className="text-sm text-gray-500 leading-relaxed mb-4">{inputDialog.message}</p>}
                    <input
                        autoFocus
                        type="text"
                        value={inputDialogValue}
                        onChange={(event) => setInputDialogValue(event.target.value)}
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
                            disabled={!inputDialogValue.trim()}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                            {inputDialog.confirmLabel || '确认'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* CSS for custom toggle switch is no longer needed since I used a custom div implementation, but keeping structure clean */}
    </div>
  );
}
export default Settings;
