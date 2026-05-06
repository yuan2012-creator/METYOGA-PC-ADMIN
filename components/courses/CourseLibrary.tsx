import React from 'react';
import type { Course } from '../../types';
import type { CourseLibraryItem } from '../Courses';

interface CourseLibraryProps {
  libraryList: CourseLibraryItem[];
  selectedCourse: CourseLibraryItem | null;
  setSelectedCourse: React.Dispatch<React.SetStateAction<CourseLibraryItem | null>>;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenDetail: (course: CourseLibraryItem) => void;
  handleDuplicate: (course: CourseLibraryItem, e: React.MouseEvent) => void;
  handleDelete: (id: string, e: React.MouseEvent) => void;
  handleSaveCourse: (updatedCourse: CourseLibraryItem) => void;
  courseTypeLabels: Record<CourseLibraryItem['type'], string>;
  courseColorTags: Record<CourseLibraryItem['type'], string>;
}

const CourseLibrary: React.FC<CourseLibraryProps> = ({
  libraryList,
  selectedCourse,
  setSelectedCourse,
  isDetailModalOpen,
  setIsDetailModalOpen,
  editMode,
  setEditMode,
  handleOpenDetail,
  handleDuplicate,
  handleDelete,
  handleSaveCourse,
  courseTypeLabels,
  courseColorTags,
}) => (
  <>
                  <div className="space-y-6 animate-fadeIn">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                              <div className="flex gap-6 text-sm">
                                  <button className="font-bold text-black border-b-2 border-black pb-1">全部课程</button>
                                  <button className="text-gray-400 hover:text-black transition">小班团课</button>
                                  <button className="text-gray-400 hover:text-black transition">私教</button>
                              </div>
                              <div className="relative">
                                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                                  <input type="text" placeholder="搜索课程..." className="pl-8 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-xs w-48 focus:bg-white focus:border-gray-300 transition outline-none" />
                              </div>
                          </div>
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                  <tr>
                                      <th className="p-4 pl-6 font-bold">课程名称</th>
                                      <th className="p-4 font-bold">类型</th>
                                      <th className="p-4 font-bold">难度 / 时长</th>
                                      <th className="p-4 font-bold">单节价格</th>
                                      <th className="p-4 font-bold">适用标签</th>
                                      <th className="p-4 font-bold text-right pr-6">操作</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                  {libraryList.map(course => (
                                      <tr key={course.id} onClick={() => handleOpenDetail(course)} className="group hover:bg-gray-50 transition cursor-pointer">
                                          <td className="p-4 pl-6 font-bold text-gray-900">
                                              <div className="flex items-center gap-2">
                                                  {course.name}
                                                  {course.rating >= 4.9 && <i className="fa-solid fa-crown text-yellow-400 text-[10px]"></i>}
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${course.colorTag}`}>
                                                  {courseTypeLabels[course.type]}
                                              </span>
                                          </td>
                                          <td className="p-4 text-gray-600">
                                              <span className="font-medium text-black">{course.levelLabel}</span> <span className="text-gray-300 mx-1">|</span> {course.durationMinutes}min
                                          </td>
                                          <td className="p-4 font-mono font-bold">¥{course.price}</td>
                                          <td className="p-4">
                                              <div className="flex gap-1 flex-wrap max-w-[150px]">
                                                  {course.suitable.slice(0, 2).map((tag, i) => (
                                                      <span key={i} className="text-[9px] border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 bg-white">{tag}</span>
                                                  ))}
                                                  {course.suitable.length > 2 && <span className="text-[9px] text-gray-400">+{course.suitable.length - 2}</span>}
                                              </div>
                                          </td>
                                          <td className="p-4 text-right pr-6" onClick={e => e.stopPropagation()}>
                                              <button 
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setEditMode(true);
                                                    setIsDetailModalOpen(true);
                                                }} 
                                                className="text-gray-400 hover:text-black mr-3 transition" title="编辑"
                                              >
                                                  <i className="fa-regular fa-pen-to-square"></i>
                                              </button>
                                              <button 
                                                onClick={(e) => handleDuplicate(course, e)} 
                                                className="text-gray-400 hover:text-blue-600 mr-3 transition" title="复制"
                                              >
                                                  <i className="fa-regular fa-copy"></i>
                                              </button>
                                              <button 
                                                onClick={(e) => handleDelete(course.id, e)} 
                                                className="text-gray-400 hover:text-red-500 transition" title="删除"
                                              >
                                                  <i className="fa-regular fa-trash-can"></i>
                                              </button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>


      {/* --- Detail/Edit Modal (For Library Courses) --- */}
      {isDetailModalOpen && selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>
              <div className="bg-white w-[900px] h-[85vh] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeInUp">
                  
                  {/* Modal Header */}
                  <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-20">
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${selectedCourse.colorTag}`}>
                              <i className="fa-solid fa-layer-group"></i>
                          </div>
                          <div>
                              {editMode ? (
                                  <input 
                                    type="text" 
                                    value={selectedCourse.name} 
                                    onChange={e => setSelectedCourse({...selectedCourse, name: e.target.value})}
                                    className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-black outline-none bg-transparent"
                                  />
                              ) : (
                                  <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h2>
                              )}
                              <p className="text-xs text-gray-500 mt-1">课程 ID: #{selectedCourse.id}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {!editMode ? (
                              <button onClick={() => setEditMode(true)} className="bg-white border border-gray-200 text-black text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition">
                                  <i className="fa-regular fa-pen-to-square mr-1"></i> 编辑
                              </button>
                          ) : (
                              <button onClick={() => handleSaveCourse(selectedCourse)} className="bg-black text-white text-xs px-4 py-2 rounded-lg font-bold hover:opacity-80 transition shadow-lg">
                                  保存修改
                              </button>
                          )}
                          <button onClick={() => setIsDetailModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                              <i className="fa-solid fa-xmark text-gray-500"></i>
                          </button>
                      </div>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scroll bg-[#FBFBFD]">
                      <div className="grid grid-cols-12 gap-8">
                          
                          {/* Left Column: Basic Info */}
                          <div className="col-span-4 space-y-6">
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">基础参数</h3>
                                  <div className="space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 mb-1.5">课程类型</label>
                                          {editMode ? (
                                              <select 
                                                value={selectedCourse.type} 
                                                onChange={e => {
                                                    const nextType = e.target.value as Course['type'];
                                                    setSelectedCourse({...selectedCourse, type: nextType, colorTag: courseColorTags[nextType]});
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition"
                                              >
                                                  <option value="group">团课</option>
                                                  <option value="small_group">小班</option>
                                                  <option value="private">私教</option>
                                                  <option value="workshop">工作坊</option>
                                                  <option value="ttc">教培</option>
                                              </select>
                                          ) : (
                                              <div className="text-sm font-medium">{courseTypeLabels[selectedCourse.type]}</div>
                                          )}
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 mb-1.5">难度等级</label>
                                          {editMode ? (
                                              <input type="text" value={selectedCourse.levelLabel} onChange={e => setSelectedCourse({...selectedCourse, levelLabel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition" />
                                          ) : (
                                              <div className="text-sm font-medium">{selectedCourse.levelLabel}</div>
                                          )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5">时长 (min)</label>
                                              {editMode ? (
                                                  <input type="number" value={selectedCourse.durationMinutes} onChange={e => setSelectedCourse({...selectedCourse, durationMinutes: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition" />
                                              ) : (
                                                  <div className="text-sm font-medium">{selectedCourse.durationMinutes}</div>
                                              )}
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5">单价 (¥)</label>
                                              {editMode ? (
                                                  <input type="number" value={selectedCourse.price} onChange={e => setSelectedCourse({...selectedCourse, price: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-black transition" />
                                              ) : (
                                                  <div className="text-sm font-bold text-black">¥{selectedCourse.price}</div>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">适用人群 / 基础</h3>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                      {selectedCourse.suitable.map((tag, idx) => (
                                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs border border-gray-200 flex items-center gap-1">
                                              {tag}
                                              {editMode && (
                                                  <i 
                                                    className="fa-solid fa-xmark cursor-pointer hover:text-red-500 ml-1"
                                                    onClick={() => setSelectedCourse({...selectedCourse, suitable: selectedCourse.suitable.filter((_, i) => i !== idx)})}
                                                  ></i>
                                              )}
                                          </span>
                                      ))}
                                  </div>
                                  {editMode && (
                                      <div className="flex gap-2">
                                          <input 
                                            type="text" 
                                            placeholder="输入标签按回车..." 
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black transition"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if(val && !selectedCourse.suitable.includes(val)) {
                                                        setSelectedCourse({...selectedCourse, suitable: [...selectedCourse.suitable, val]});
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                          />
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Right Column: Detailed Content */}
                          <div className="col-span-8 space-y-6">
                              
                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <i className="fa-solid fa-align-left text-gray-400"></i> 课程简介
                                  </h3>
                                  {editMode ? (
                                      <textarea 
                                        rows={4} 
                                        value={selectedCourse.description ?? ''}
                                        onChange={e => setSelectedCourse({...selectedCourse, description: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:border-black transition resize-none"
                                        placeholder="请输入课程的详细介绍，包括课程特色、流派渊源等..."
                                      ></textarea>
                                  ) : (
                                      <p className="text-sm text-gray-600 leading-relaxed">{selectedCourse.description || '暂无简介'}</p>
                                  )}
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <i className="fa-solid fa-bullseye text-red-400"></i> 练习目标
                                  </h3>
                                  {editMode ? (
                                      <textarea 
                                        rows={3} 
                                        value={selectedCourse.goals} 
                                        onChange={e => setSelectedCourse({...selectedCourse, goals: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:border-black transition resize-none"
                                        placeholder="列出本课程的主要练习目标，如：改善体态、增强核心..."
                                      ></textarea>
                                  ) : (
                                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-800">
                                          {selectedCourse.goals || '暂无目标设定'}
                                      </div>
                                  )}
                              </div>

                              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                      <i className="fa-solid fa-triangle-exclamation text-orange-400"></i> 注意事项 / 禁忌
                                  </h3>
                                  {editMode ? (
                                      <textarea 
                                        rows={3} 
                                        value={selectedCourse.notes} 
                                        onChange={e => setSelectedCourse({...selectedCourse, notes: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm leading-relaxed outline-none focus:border-black transition resize-none"
                                        placeholder="输入特殊人群禁忌、课前准备等..."
                                      ></textarea>
                                  ) : (
                                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800">
                                          {selectedCourse.notes || '暂无注意事项'}
                                      </div>
                                  )}
                              </div>

                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}


  </>
);

export default CourseLibrary;
