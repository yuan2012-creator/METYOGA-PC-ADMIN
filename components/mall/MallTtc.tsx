import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TtcProduct } from '../../types';
import type {
  MallActionButtonRenderer,
  MallActionType,
  MallEditorSetter,
  MallTtcActionItem,
  MallTtcEditorItem,
} from './mallTypes';

export interface TTCTutorExperience {
    year: string;
    title: string;
}

export interface TTCTutor {
    id: string;
    name: string;
    title: string;
    avatar: string;
    motto: string;
    resume: TTCTutorExperience[];
    gallery: string[];
    status: 'active' | 'inactive';
}

export interface TTCCoursePlanNode {
    stage: string;
    content: string;
}

export interface TTCCourseAudienceNode {
    tag: string;
    desc: string;
}

export type TTCSchedule = Omit<NonNullable<TtcProduct['schedules']>[number], 'status'> & {
    status: NonNullable<TtcProduct['schedules']>[number]['status'] | 'recruiting' | 'ended';
};

export type MallTtcCourse = Omit<TtcProduct, 'schedules' | 'status'> & {
    category: 'yoga' | 'pilates';
    earlyBirdPrice: number;
    earlyBirdDeadline: string;
    alumniPrice: number;
    intro: string;
    planNodes: TTCCoursePlanNode[];
    audienceNodes: TTCCourseAudienceNode[];
    outcomes: string;
    tutors: string[];
    schedules: TTCSchedule[];
    listingVenues: string[];
    status: 'active' | 'inactive';
    conversionRate: number;
    views: number;
    historicalSales: number[];
};

export interface Student {
    id: string;
    name: string;
    phone: string;
    paymentStatus: 'paid' | 'deposit' | 'pending' | 'refunded';
    amount: number;
    confirmed: boolean;
    batch: string;
    signupDate: string;
}

const normalizeTtcScheduleStatus = (status: TTCSchedule['status']): TTCSchedule['status'] => {
    if (status === 'open') return 'recruiting';
    if (status === 'closed') return 'ended';
    return status;
};

export const toMallTtcCourse = (
    product: TtcProduct,
    index: number,
    availableVenues: string[] = []
): MallTtcCourse => ({
    ...product,
    status: product.status === 'active' ? 'active' : 'inactive',
    category: product.name.includes('普拉提') ? 'pilates' : 'yoga',
    earlyBirdPrice: Math.max(product.price - 2000, 0),
    earlyBirdDeadline: '2026-05-01',
    alumniPrice: Math.max(product.price - 1000, 0),
    intro: product.description || '',
    planNodes: [
        { stage: '基础理论', content: '课程体系、身体基础和教学安全边界。' },
        { stage: '实操训练', content: '核心体式、序列设计和课堂带领练习。' },
    ],
    audienceNodes: [
        { tag: '进阶练习者', desc: '希望系统理解瑜伽训练方法的人群。' },
        { tag: '准老师', desc: '计划进入教学或服务会员的人群。' },
    ],
    outcomes: product.description || '完成系统学习并获得结业能力评估。',
    tutors: ['Master Sarah'],
    schedules: (product.schedules || []).map(schedule => ({
        ...schedule,
        status: normalizeTtcScheduleStatus(schedule.status),
    })),
    listingVenues: product.listingVenues || availableVenues,
    conversionRate: 12 + index * 2,
    views: 1200 + index * 600,
    historicalSales: [12, 15, 18, 14, 16],
});

interface MallTtcProps {
  view: 'list' | 'edit' | 'students';
  ttcCourses: MallTtcCourse[];
  ttcTutors: TTCTutor[];
  editType: MallActionType;
  selectedItem: MallTtcEditorItem | null;
  setSelectedItem: MallEditorSetter<MallTtcEditorItem>;
  students: Student[];
  overview: React.ReactNode;
  actionButtons: MallActionButtonRenderer<MallTtcActionItem>;
  handleBack: () => void;
  handleCreate: (type: MallActionType) => void;
  handleViewStudents: (item: MallTtcCourse) => void;
  availableVenues: string[];
  funnelData: { name: string; value: number }[];
}

const MallTtc: React.FC<MallTtcProps> = ({
  view,
  ttcCourses,
  ttcTutors,
  editType,
  selectedItem,
  setSelectedItem,
  students,
  overview,
  actionButtons,
  handleBack,
  handleCreate,
  handleViewStudents,
  availableVenues,
  funnelData,
}) => {
  const renderTTCList = () => (
      <div className="animate-fadeIn space-y-12">
          {overview}
          {/* Courses Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ttcCourses.map(ttc => (
                  <div key={ttc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition h-full">
                      <div className="h-40 bg-gray-200 relative overflow-hidden">
                          <img src={ttc.cover || undefined} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="" />
                          <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${ttc.status === 'active' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {ttc.status === 'active' ? '招生中' : '已结课'}
                          </div>
                          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 text-[10px] font-bold rounded text-white uppercase shadow-sm">
                              {ttc.category === 'yoga' ? 'Yoga 瑜伽' : 'Pilates 普拉提'}
                          </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-lg mb-2 text-gray-900">{ttc.name}</h3>
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{ttc.intro}</p>
                          
                          {/* Display Audience Tags */}
                          <div className="flex flex-wrap gap-1 mb-4">
                              {ttc.audienceNodes?.slice(0,3).map((a, i) => (
                                  <span key={i} className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-gray-500">{a.tag}</span>
                              ))}
                          </div>

                          <div className="space-y-2 mb-6">
                              {ttc.schedules.slice(0, 3).map(sch => (
                                  <div key={sch.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                                      <div><div className="font-bold text-gray-700">{sch.batchName}</div><div className="text-[10px] text-gray-400">{sch.startDate} 开课</div></div>
                                      <div className="text-right"><div className="font-bold">{sch.enrolled}/{sch.max}</div></div>
                                  </div>
                              ))}
                          </div>

                          <div className="mt-auto">
                              <button onClick={() => handleViewStudents(ttc)} className="w-full mb-3 bg-white border border-gray-200 text-gray-700 text-xs py-2 rounded-lg font-bold hover:bg-gray-50">查看学员名单</button>
                              {actionButtons(ttc, 'ttc_course')}
                          </div>
                      </div>
                  </div>
              ))}
              <div onClick={() => handleCreate('ttc_course')} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition min-h-[350px]">
                  <i className="fa-solid fa-plus text-3xl mb-2"></i>
                  <span className="text-sm font-bold">新建教培课程</span>
              </div>
          </div>

          {/* Tutors Section */}
          <div>
              <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">教培导师团队</h3>
                  <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {ttcTutors.map(tutor => (
                      <div key={tutor.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group hover:shadow-md transition">
                          <div className="flex flex-col items-center text-center">
                              <div className="w-20 h-20 rounded-full mb-3 p-1 border border-gray-100 bg-white shadow-sm overflow-hidden">
                                  <img src={tutor.avatar || undefined} className="w-full h-full object-cover rounded-full" alt={tutor.name} />
                              </div>
                              <h4 className="font-bold text-gray-900">{tutor.name}</h4>
                              <p className="text-xs text-black/60 font-bold mb-2">{tutor.title}</p>
                              <p className="text-[10px] text-gray-400 italic line-clamp-2 min-h-[30px]">"{tutor.motto}"</p>
                          </div>
                          {actionButtons(tutor, 'ttc_tutor')}
                      </div>
                  ))}
                  <div onClick={() => handleCreate('ttc_tutor')} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 transition min-h-[220px]">
                      <i className="fa-solid fa-user-plus text-2xl mb-2"></i>
                      <span className="text-xs font-bold">添加导师</span>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderTTCEdit = () => {
      // Determine if we are editing a Course or a Tutor
      const isTutor = editType === 'ttc_tutor';

      if (isTutor) {
          return (
              <div className="flex h-full gap-6 animate-fadeIn justify-center">
                  <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h3 className="font-bold text-lg">{selectedItem ? '编辑导师名片' : '添加导师'}</h3>
                          <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                      </div>
                      <div className="p-8 space-y-8">
                          <div className="flex gap-6 items-start">
                              <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-black hover:text-black transition">
                                  {selectedItem?.avatar ? (
                                      <img src={selectedItem.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                  ) : (
                                      <>
                                          <i className="fa-solid fa-camera text-xl mb-1"></i>
                                          <span className="text-[10px]">上传头像</span>
                                      </>
                                  )}
                              </div>
                              <div className="flex-1 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div><label className="text-xs font-bold text-gray-500 mb-1 block">导师姓名</label><input type="text" defaultValue={selectedItem?.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                                      <div><label className="text-xs font-bold text-gray-500 mb-1 block">头衔/认证 (Title)</label><input type="text" defaultValue={selectedItem?.title} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                                  </div>
                                  <div><label className="text-xs font-bold text-gray-500 mb-1 block">名言 (Motto)</label><input type="text" defaultValue={selectedItem?.motto} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" /></div>
                              </div>
                          </div>

                          {/* Dynamic Resume Builder */}
                          <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 block">个人履历 (Experience)</label>
                              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                  {(selectedItem?.resume || []).map((item: TTCTutorExperience, idx: number) => (
                                      <div key={idx} className="flex gap-3 items-start group">
                                          <input 
                                            type="text" 
                                            placeholder="年份" 
                                            defaultValue={item.year}
                                            onBlur={(e) => {
                                                const newResume = [...selectedItem.resume];
                                                newResume[idx].year = e.target.value;
                                                setSelectedItem({...selectedItem, resume: newResume});
                                            }}
                                            className="w-20 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-center outline-none focus:border-black transition"
                                          />
                                          <textarea 
                                            placeholder="经历描述..." 
                                            defaultValue={item.title}
                                            onBlur={(e) => {
                                                const newResume = [...selectedItem.resume];
                                                newResume[idx].title = e.target.value;
                                                setSelectedItem({...selectedItem, resume: newResume});
                                            }}
                                            rows={2}
                                            className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-black transition resize-none"
                                          />
                                          <button 
                                            onClick={() => {
                                                const newResume = (selectedItem.resume || []).filter((_, i: number) => i !== idx);
                                                setSelectedItem({...selectedItem, resume: newResume});
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                          >
                                              <i className="fa-solid fa-trash-can text-xs"></i>
                                          </button>
                                      </div>
                                  ))}
                                  <button 
                                    onClick={() => setSelectedItem({...selectedItem, resume: [...(selectedItem.resume || []), {year: '', title: ''}]})}
                                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-bold hover:border-black hover:text-black transition"
                                  >
                                      + 添加履历条目
                                  </button>
                              </div>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-gray-500 mb-2 block">授课瞬间 (Gallery)</label>
                              <div className="grid grid-cols-4 gap-4">
                                  {selectedItem?.gallery?.map((img: string, i: number) => (
                                      <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                                          <img src={img || undefined} className="w-full h-full object-cover" alt="" />
                                          <button className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"><i className="fa-solid fa-trash text-xs"></i></button>
                                      </div>
                                  ))}
                                  <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-black hover:text-black transition">
                                      <i className="fa-solid fa-plus text-xl"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                          <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">保存导师信息</button>
                      </div>
                  </div>
              </div>
          )
      }

      // Default: Course Edit
      return (
          <div className="flex h-full gap-6 animate-fadeIn">
              {/* Left Form */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto custom-scroll">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-lg">{selectedItem ? '编辑教培课程' : '新建教培课程'}</h3>
                      <button onClick={handleBack} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div className="p-8 space-y-8">
                      {/* Module 1: Info */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">课程基础信息</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">课程名称</label>
                                  <input type="text" defaultValue={selectedItem?.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">课程分类</label>
                                  <select defaultValue={selectedItem?.category} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition">
                                      <option value="yoga">瑜伽 (Yoga)</option>
                                      <option value="pilates">普拉提 (Pilates)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">关联导师</label>
                                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition">
                                      <option value="">请选择导师...</option>
                                      {ttcTutors.map(t => (
                                          <option key={t.id} value={t.id} selected={selectedItem?.tutors?.includes(t.name) || selectedItem?.tutors?.includes(t.id)}>{t.name}</option>
                                      ))}
                                  </select>
                              </div>
                              
                              {/* Dynamic Course Plan */}
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">课程规划 (Syllabus)</label>
                                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                      {(selectedItem?.planNodes || []).map((node: TTCCoursePlanNode, idx: number) => (
                                          <div key={idx} className="flex gap-3 items-start">
                                              <input 
                                                type="text" 
                                                placeholder="阶段/模块" 
                                                defaultValue={node.stage}
                                                onBlur={(e) => {
                                                    const newPlan = [...selectedItem.planNodes];
                                                    newPlan[idx].stage = e.target.value;
                                                    setSelectedItem({...selectedItem, planNodes: newPlan});
                                                }}
                                                className="w-32 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-black transition"
                                              />
                                              <textarea 
                                                placeholder="学习内容描述..." 
                                                defaultValue={node.content}
                                                onBlur={(e) => {
                                                    const newPlan = [...selectedItem.planNodes];
                                                    newPlan[idx].content = e.target.value;
                                                    setSelectedItem({...selectedItem, planNodes: newPlan});
                                                }}
                                                rows={2}
                                                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-black transition resize-none"
                                              />
                                              <button 
                                                onClick={() => {
                                                    const newPlan = (selectedItem.planNodes || []).filter((_, i: number) => i !== idx);
                                                    setSelectedItem({...selectedItem, planNodes: newPlan});
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                              >
                                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                              </button>
                                          </div>
                                      ))}
                                      <button 
                                        onClick={() => setSelectedItem({...selectedItem, planNodes: [...(selectedItem.planNodes || []), {stage: '', content: ''}]})}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-bold hover:border-black hover:text-black transition"
                                      >
                                          + 添加课程阶段
                                      </button>
                                  </div>
                              </div>

                              {/* Dynamic Target Audience */}
                              <div className="col-span-2">
                                  <label className="text-xs font-bold text-gray-500 mb-2 block">适合人群 (Target Audience)</label>
                                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                                      {(selectedItem?.audienceNodes || []).map((node: TTCCourseAudienceNode, idx: number) => (
                                          <div key={idx} className="flex gap-3 items-center">
                                              <input 
                                                type="text" 
                                                placeholder="人群标签 (e.g. 零基础)" 
                                                defaultValue={node.tag}
                                                onBlur={(e) => {
                                                    const newAudience = [...selectedItem.audienceNodes];
                                                    newAudience[idx].tag = e.target.value;
                                                    setSelectedItem({...selectedItem, audienceNodes: newAudience});
                                                }}
                                                className="w-40 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-black transition"
                                              />
                                              <input 
                                                type="text" 
                                                placeholder="详情解释..." 
                                                defaultValue={node.desc}
                                                onBlur={(e) => {
                                                    const newAudience = [...selectedItem.audienceNodes];
                                                    newAudience[idx].desc = e.target.value;
                                                    setSelectedItem({...selectedItem, audienceNodes: newAudience});
                                                }}
                                                className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-black transition"
                                              />
                                              <button 
                                                onClick={() => {
                                                    const newAudience = (selectedItem.audienceNodes || []).filter((_, i: number) => i !== idx);
                                                    setSelectedItem({...selectedItem, audienceNodes: newAudience});
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                              >
                                                  <i className="fa-solid fa-trash-can text-xs"></i>
                                              </button>
                                          </div>
                                      ))}
                                      <button 
                                        onClick={() => setSelectedItem({...selectedItem, audienceNodes: [...(selectedItem.audienceNodes || []), {tag: '', desc: ''}]})}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-bold hover:border-black hover:text-black transition"
                                      >
                                          + 添加人群定位
                                      </button>
                                  </div>
                              </div>

                              <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block">课程收益 (You Will Get)</label><textarea defaultValue={selectedItem?.outcomes} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition h-20 resize-none" /></div>
                          </div>
                      </div>

                      {/* Module 2: Pricing */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">定价策略</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">标准价 (¥)</label>
                                  <input type="number" defaultValue={selectedItem?.price} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">校友价 (¥)</label>
                                  <input type="number" defaultValue={selectedItem?.alumniPrice} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition font-mono" />
                              </div>
                              <div className="col-span-2 grid grid-cols-2 gap-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                  <div>
                                      <label className="text-xs font-bold text-yellow-800 mb-1 block">早鸟价 (¥)</label>
                                      <input type="number" defaultValue={selectedItem?.earlyBirdPrice} className="w-full bg-white border border-yellow-200 rounded-xl p-3 text-sm outline-none focus:border-yellow-500 transition font-mono" />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-yellow-800 mb-1 block">早鸟优惠截止日期</label>
                                      <input type="date" defaultValue={selectedItem?.earlyBirdDeadline} className="w-full bg-white border border-yellow-200 rounded-xl p-3 text-sm outline-none focus:border-yellow-500 transition font-mono" />
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Module 3: Schedule Management */}
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">排期管理 (Cohorts)</h4>
                              <button 
                                className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold hover:opacity-80"
                                onClick={() => {
                                    const newSchedule = { 
                                        id: `s_${Date.now()}`, 
                                        batchName: '新排期', 
                                        startDate: '', endDate: '', 
                                        enrolled: 0, max: 20, status: 'recruiting' 
                                    };
                                    setSelectedItem({...selectedItem, schedules: [...(selectedItem.schedules || []), newSchedule]});
                                }}
                              >
                                  + 新增排期
                              </button>
                          </div>
                          <div className="space-y-3">
                              {selectedItem?.schedules?.map((sch: TTCSchedule, idx: number) => (
                                  <div key={sch.id || idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                      <div className="flex-1 grid grid-cols-4 gap-4">
                                          <div className="col-span-4 md:col-span-1"><label className="text-[10px] font-bold text-gray-400 block mb-1">班级名称</label><input type="text" defaultValue={sch.batchName} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs font-bold" /></div>
                                          <div><label className="text-[10px] font-bold text-gray-400 block mb-1">开始日期</label><input type="date" defaultValue={sch.startDate} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs" /></div>
                                          <div><label className="text-[10px] font-bold text-gray-400 block mb-1">结束日期</label><input type="date" defaultValue={sch.endDate} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs" /></div>
                                          <div><label className="text-[10px] font-bold text-gray-400 block mb-1">名额上限</label><input type="number" defaultValue={sch.max} className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs" /></div>
                                      </div>
                                      <div className="flex flex-col gap-2 border-l border-gray-200 pl-4">
                                          <button 
                                            className="text-xs text-red-500 font-bold hover:underline"
                                            onClick={() => {
                                                const newScheds = (selectedItem.schedules || []).filter((_, i: number) => i !== idx);
                                                setSelectedItem({...selectedItem, schedules: newScheds});
                                            }}
                                          >删除</button>
                                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold text-center">招生中</span>
                                      </div>
                                  </div>
                              ))}
                              {(!selectedItem?.schedules || selectedItem?.schedules.length === 0) && (
                                  <div className="text-center text-xs text-gray-400 py-4">暂无排期，请点击上方按钮添加</div>
                              )}
                          </div>
                      </div>

                      {/* Module 4: Listing Venues (New) */}
                      <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 border-l-4 border-black pl-3">上架场馆 (Sales Channels)</h4>
                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="grid grid-cols-4 gap-4">
                                  {availableVenues.map(venue => (
                                      <label key={venue} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            checked={selectedItem?.listingVenues?.includes(venue) || false}
                                            onChange={(e) => {
                                                const current = selectedItem?.listingVenues || [];
                                                if(e.target.checked) {
                                                    setSelectedItem({...selectedItem, listingVenues: [...current, venue]});
                                                } else {
                                                    setSelectedItem({...selectedItem, listingVenues: current.filter((v:string) => v !== venue)});
                                                }
                                            }}
                                            className="w-4 h-4 rounded text-black focus:ring-0"
                                          />
                                          {venue}
                                      </label>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0">
                      <button className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg">保存课程</button>
                  </div>
              </div>

              {/* Right Data */}
              <div className="w-[360px] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                      <h3 className="font-bold text-gray-900">招生数据洞察</h3>
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
                              <div className="text-xl font-bold font-mono">5,620</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 20%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">点击量 (Clicks)</div>
                              <div className="text-xl font-bold font-mono">2,300</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 18%</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">报名量 (Signups)</div>
                              <div className="text-xl font-bold font-mono">
                                  {(selectedItem?.schedules || []).reduce((acc: number, schedule: TTCSchedule) => acc + (schedule.enrolled || 0), 0)}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold mt-1">-</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-400 mb-1">转化率 (Conv.)</div>
                              <div className="text-xl font-bold font-mono text-green-600">{selectedItem?.conversionRate || 0}%</div>
                              <div className="text-[10px] text-green-600 font-bold mt-1">↑ 2%</div>
                          </div>
                      </div>

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">当前报名进度</div>
                          <div className="h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" tick={{fontSize: 10}} width={40} />
                                      <Tooltip />
                                      <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                          {funnelData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={index === 3 ? '#000' : '#E5E7EB'} /> ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      <div>
                          <div className="text-xs font-bold text-gray-400 mb-4 uppercase">最近报名记录</div>
                          <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Student${i}`} className="w-full h-full object-cover" alt="" />
                                      </div>
                                      <div className="flex-1">
                                          <div className="text-xs font-bold text-gray-900">Student {i}</div>
                                          <div className="text-[10px] text-gray-400">{i}天前</div>
                                      </div>
                                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">已报名</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderTTCStudents = () => {
      return (
          <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-4">
                      <button onClick={handleBack} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition"><i className="fa-solid fa-arrow-left"></i></button>
                      <div>
                          <h3 className="font-bold text-lg text-gray-900">学员名单管理</h3>
                          <p className="text-xs text-gray-500 mt-0.5">当前课程: {selectedItem?.name}</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button className="bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-50">导出名单</button>
                      <button className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:opacity-80">+ 录入学员</button>
                  </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-bold">
                          <tr>
                              <th className="p-4 pl-6">学员姓名</th>
                              <th className="p-4">联系电话</th>
                              <th className="p-4">报名班期</th>
                              <th className="p-4">报名时间</th>
                              <th className="p-4">缴费状态</th>
                              <th className="p-4">实付金额</th>
                              <th className="p-4 text-right pr-6">操作</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {students.map(st => (
                              <tr key={st.id} className="hover:bg-gray-50 transition">
                                  <td className="p-4 pl-6 font-bold text-gray-900">{st.name}</td>
                                  <td className="p-4 font-mono text-gray-600">{st.phone}</td>
                                  <td className="p-4 text-gray-600">{st.batch}</td>
                                  <td className="p-4 text-gray-600">{st.signupDate}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                          st.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                                          st.paymentStatus === 'deposit' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                                      }`}>
                                          {st.paymentStatus === 'paid' ? '全款付清' : st.paymentStatus === 'deposit' ? '已付订金' : '待支付'}
                                      </span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-gray-900">¥{st.amount.toLocaleString()}</td>
                                  <td className="p-4 text-right pr-6">
                                      <button className="text-blue-600 hover:underline text-xs font-bold mr-3">编辑</button>
                                      <button className="text-red-500 hover:underline text-xs font-bold">退款</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };



  if (view === 'students') return renderTTCStudents();
  if (view === 'edit') return renderTTCEdit();
  return renderTTCList();
};

export default MallTtc;
