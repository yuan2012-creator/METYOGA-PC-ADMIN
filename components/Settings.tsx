
import React, { useState } from 'react';

// --- Types ---
interface TeacherLevel {
    id: number;
    name: string;
    threshold: number; // Hours
    baseGroup: number; // RMB
    basePrivate: number; // RMB
}

interface CourseItem {
    id: number;
    name: string;
    points: number;
}

interface StorePricing {
    id: number;
    name: string;
    group: CourseItem[];
    private: CourseItem[];
}

// --- New Types for Roles & Permissions ---
interface PermissionNode {
    id: string;
    name: string;
    desc?: string;
    isDangerous?: boolean; // Highlight dangerous actions like delete
}

interface PermissionModule {
    id: string;
    name: string;
    icon: string;
    nodes: PermissionNode[];
}

interface Role {
    id: string;
    name: string;
    desc: string;
    type: 'system' | 'custom'; // System roles cannot be deleted
    permissions: string[]; // List of permission IDs
    memberIds: number[]; // List of Account IDs assigned to this role
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'salary' | 'course' | 'member' | 'role'>('salary');

  // --- 9.1 Salary & Promotion State ---
  const [autoPromotion, setAutoPromotion] = useState(true);
  
  const [levels, setLevels] = useState<TeacherLevel[]>([
      { id: 1, name: 'T1 初级', threshold: 0, baseGroup: 80, basePrivate: 150 },
      { id: 2, name: 'T2 资深', threshold: 500, baseGroup: 120, basePrivate: 220 },
      { id: 3, name: 'T3 专家', threshold: 1500, baseGroup: 180, basePrivate: 300 },
  ]);

  const [commissionRules, setCommissionRules] = useState({
      trialConversion: 10, // %
      renewal: 5 // %
  });

  // Actions for Salary
  const addLevel = () => {
      const newId = Math.max(...levels.map(l => l.id)) + 1;
      setLevels([...levels, { id: newId, name: '新等级', threshold: 2000, baseGroup: 0, basePrivate: 0 }]);
  };

  const removeLevel = (id: number) => {
      if(confirm('确定删除该等级吗？')) {
          setLevels(levels.filter(l => l.id !== id));
      }
  };

  const updateLevel = (id: number, field: keyof TeacherLevel, value: any) => {
      setLevels(levels.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  // --- 9.2 Course & Pricing State ---
  const [basePointValue, setBasePointValue] = useState(125); // 1 Point = 125 RMB
  const [activeStoreId, setActiveStoreId] = useState(1);
  
  const [storePricing, setStorePricing] = useState<StorePricing[]>([
      {
          id: 1, name: '西湖旗舰馆', 
          group: [
              { id: 1, name: '一星课程 (L1)', points: 2 },
              { id: 2, name: '二星课程 (L2)', points: 3 },
              { id: 3, name: '三星课程 (L3)', points: 4 }
          ],
          private: [
              { id: 101, name: '基础私教', points: 4 },
              { id: 102, name: '塑形普拉提', points: 4.5 },
              { id: 103, name: '孕产康复', points: 6 }
          ]
      },
      {
          id: 2, name: '城西银泰馆', 
          group: [
              { id: 1, name: '一星课程 (L1)', points: 0.5 },
              { id: 2, name: '二星课程 (L2)', points: 1 },
              { id: 3, name: '三星课程 (L3)', points: 1.5 }
          ],
          private: [
              { id: 101, name: '基础私教', points: 3.5 },
              { id: 102, name: '特色私教', points: 4.5 }
          ]
      },
      { id: 3, name: '万象城馆', group: [], private: [] }, // Simplified for mock
      { id: 4, name: '滨江宝龙馆', group: [], private: [] },
      { id: 5, name: '嘉里中心馆', group: [], private: [] }
  ]);

  const currentStore = storePricing.find(s => s.id === activeStoreId) || storePricing[0];

  // Actions for Course Pricing
  const addCourseItem = (type: 'group' | 'private') => {
      const updatedStores = storePricing.map(store => {
          if (store.id === activeStoreId) {
              const list = store[type];
              const newId = list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : (type === 'group' ? 1 : 101);
              const newItem = { id: newId, name: type === 'group' ? '新团课类型' : '新私教类型', points: 0 };
              return { ...store, [type]: [...list, newItem] };
          }
          return store;
      });
      setStorePricing(updatedStores);
  };

  const removeCourseItem = (type: 'group' | 'private', itemId: number) => {
      const updatedStores = storePricing.map(store => {
          if (store.id === activeStoreId) {
              return { ...store, [type]: store[type].filter(i => i.id !== itemId) };
          }
          return store;
      });
      setStorePricing(updatedStores);
  };

  const updateCourseItem = (type: 'group' | 'private', itemId: number, field: 'name' | 'points', value: any) => {
      const updatedStores = storePricing.map(store => {
          if (store.id === activeStoreId) {
              const updatedList = store[type].map(item => item.id === itemId ? { ...item, [field]: value } : item);
              return { ...store, [type]: updatedList };
          }
          return store;
      });
      setStorePricing(updatedStores);
  };

  // 9.3 Member Rules (Mock)
  const [memberRules, setMemberRules] = useState({ pointsEarnRate: 100, s5SleepDays: 30, s6ChurnDays: 90 });

  // 9.4 Role & Permissions (New)
  
  // Define System Capabilities (Permissions)
  const permissionModules: PermissionModule[] = [
      {
          id: 'dashboard', name: '首页与数据', icon: 'fa-chart-pie',
          nodes: [
              { id: 'view_dashboard', name: '查看首页概览' },
              { id: 'view_data_bi', name: '查看详细BI数据' },
              { id: 'view_investor', name: '查看投资人看板', isDangerous: true },
          ]
      },
      {
          id: 'member', name: '会员管理', icon: 'fa-users',
          nodes: [
              { id: 'view_member_list', name: '查看会员列表 (脱敏)' },
              { id: 'view_member_detail', name: '查看完整档案 (含联系方式)', isDangerous: true },
              { id: 'edit_member', name: '编辑会员信息' },
              { id: 'export_member', name: '导出会员数据', isDangerous: true },
          ]
      },
      {
          id: 'finance', name: '财务中心', icon: 'fa-wallet',
          nodes: [
              { id: 'view_revenue', name: '查看营收报表' },
              { id: 'manage_refund', name: '处理退款申请', isDangerous: true },
              { id: 'manage_salary', name: '查看/发放薪资', isDangerous: true },
          ]
      },
      {
          id: 'operation', name: '教务运营', icon: 'fa-calendar-check',
          nodes: [
              { id: 'manage_schedule', name: '排课与发布' },
              { id: 'check_in', name: '签到消课' },
              { id: 'manage_staff', name: '员工档案管理' },
          ]
      }
  ];

  const [accounts] = useState([
      { id: 1, name: 'Alexander', role: '总管理员', avatar: 'A' },
      { id: 2, name: 'Sarah', role: '教学总监', avatar: 'S' },
      { id: 3, name: 'Eva', role: '运营管家', avatar: 'E' },
      { id: 4, name: 'Mike', role: '全职老师', avatar: 'M' },
      { id: 5, name: 'Finance01', role: '财务专员', avatar: 'F' },
  ]);

  const [roles, setRoles] = useState<Role[]>([
      { 
          id: 'admin', name: '总管理员 (Admin)', desc: '拥有系统最高权限，可管理所有模块与配置。', type: 'system', 
          permissions: ['all'], memberIds: [1] 
      },
      { 
          id: 'manager', name: '店长 (Store Manager)', desc: '负责单店全面运营，拥有除敏感财务外的管理权限。', type: 'custom', 
          permissions: ['view_dashboard', 'view_member_list', 'view_member_detail', 'edit_member', 'view_revenue', 'manage_schedule', 'check_in', 'manage_staff'], 
          memberIds: [] 
      },
      { 
          id: 'butler', name: '运营管家 (Butler)', desc: '负责前台接待、会员维护与日常排课协助。', type: 'custom', 
          permissions: ['view_member_list', 'edit_member', 'check_in', 'manage_schedule'], 
          memberIds: [3] 
      },
      { 
          id: 'teacher', name: '老师/教练 (Teacher)', desc: '仅可查看课表、签到以及查看关联学员信息。', type: 'custom', 
          permissions: ['check_in'], 
          memberIds: [2, 4] 
      },
      { 
          id: 'finance', name: '财务 (Finance)', desc: '负责账目核对、薪酬计算与退款审核。', type: 'custom', 
          permissions: ['view_revenue', 'manage_refund', 'manage_salary', 'view_data_bi'], 
          memberIds: [5] 
      },
  ]);

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
          alert("系统至少需要保留一位总管理员");
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
      const name = prompt("请输入新角色名称");
      if (name) {
          const newId = `role_${Date.now()}`;
          const newRole: Role = { id: newId, name, desc: '新创建的角色，请配置权限。', type: 'custom', permissions: [], memberIds: [] };
          setRoles([...roles, newRole]);
          setActiveRoleId(newId);
      }
  };

  const deleteRole = (roleId: string) => {
      if(confirm('确定删除该角色吗？关联的员工将失去权限。')) {
          setRoles(roles.filter(r => r.id !== roleId));
          if(activeRoleId === roleId) setActiveRoleId(null);
      }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn relative bg-[#F5F5F7]">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    系统设置
                    <button 
                        onClick={() => alert('Gemini AI 正在分析系统配置并生成优化建议...')}
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
                    onClick={() => alert('规则已生效并同步至全系统')}
                >
                    保存配置
                </button>
            </div>
        </div>

        {/* Sub Nav */}
        <div className="px-8 py-4 bg-[#F5F5F7] sticky top-16 z-10 border-b border-gray-200/50 flex justify-start">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex relative">
                {[
                    { id: 'salary', label: '薪酬与晋升' },
                    { id: 'course', label: '课程与定价' },
                    { id: 'member', label: '会员权益与积分' },
                    { id: 'role', label: '角色与权限' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
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
                                                        <div className="flex items-center bg-white rounded-lg px-2 py-1 border border-gray-200 group-hover:border-gray-300 transition"><input type="number" step="0.5" value={item.points} onChange={(e) => updateCourseItem('group', item.id, 'points', e.target.value)} className="w-10 bg-transparent text-center font-bold text-sm outline-none" /><span className="text-xs text-gray-400 font-medium">点</span></div>
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
                                                        <div className="flex items-center bg-white rounded-lg px-2 py-1 border border-gray-200 group-hover:border-gray-300 transition"><input type="number" step="0.5" value={item.points} onChange={(e) => updateCourseItem('private', item.id, 'points', e.target.value)} className="w-10 bg-transparent text-center font-bold text-sm outline-none" /><span className="text-xs text-gray-400 font-medium">点</span></div>
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

        {/* CSS for custom toggle switch is no longer needed since I used a custom div implementation, but keeping structure clean */}
    </div>
  );
}
export default Settings;
