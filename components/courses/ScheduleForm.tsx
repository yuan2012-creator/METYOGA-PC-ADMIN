import React from 'react';
import { COURSE_TYPE_LABELS } from '../../utils/courseSelectors';
import type { CourseLibraryItem, ScheduleFormState } from '../../utils/courseSelectors';

interface ScheduleFormProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleForm: ScheduleFormState;
  setScheduleForm: React.Dispatch<React.SetStateAction<ScheduleFormState>>;
  libraryList: CourseLibraryItem[];
  confirmSchedule: () => void;
  deleteEvent: (id: string) => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  isOpen,
  setIsOpen,
  scheduleForm,
  setScheduleForm,
  libraryList,
  confirmSchedule,
  deleteEvent,
}) => {
  if (!isOpen) return null;

  return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
              <div className="bg-white w-[480px] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeInUp">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-gray-900">排课详情</h3>
                      <button onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark text-gray-400"></i></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">选择课程</label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                            value={scheduleForm.courseId}
                            onChange={(e) => {
                                const cId = e.target.value;
                                const course = libraryList.find(c => c.id === cId);
                                setScheduleForm({...scheduleForm, courseId: cId, duration: course ? course.durationMinutes : 60});
                            }}
                          >
                              <option value="">自定义课程</option>
                              {libraryList.map(c => (
                                  <option key={c.id} value={c.id}>{c.name} ({COURSE_TYPE_LABELS[c.type]})</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">授课老师</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition" 
                            placeholder="输入老师姓名"
                            value={scheduleForm.teacherName}
                            onChange={(e) => setScheduleForm({...scheduleForm, teacherName: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">开始时间</label>
                              <input 
                                type="time"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                                value={scheduleForm.startTime}
                                onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">时长 (分钟)</label>
                              <input 
                                type="number" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                                value={scheduleForm.duration}
                                onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">席位容量</label>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black transition"
                            value={scheduleForm.capacity}
                            onChange={(e) => setScheduleForm({...scheduleForm, capacity: parseInt(e.target.value)})}
                          />
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 flex gap-3">
                      {scheduleForm.id && (
                          <button onClick={() => deleteEvent(scheduleForm.id)} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition"><i className="fa-solid fa-trash-can"></i></button>
                      )}
                      <button onClick={() => setIsOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">取消</button>
                      <button onClick={confirmSchedule} className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:opacity-80 transition shadow-lg">确认保存</button>
                  </div>
              </div>
          </div>
  );
};

export default ScheduleForm;
