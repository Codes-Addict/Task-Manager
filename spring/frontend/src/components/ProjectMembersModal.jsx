import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Briefcase, CheckCircle2, Circle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

const ProjectMembersModal = ({ show, onClose, projectId, members, isLoadingMembers }) => {
  const { data: allTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['all-tasks', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/project/${projectId}/all`);
      return data;
    },
    enabled: show,
  });

  const isLoading = isLoadingMembers || isLoadingTasks;

  const getMemberTasks = (memberId) => {
    return allTasks?.filter(t => t.assignee?.id === memberId) || [];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case 'BLOCKED': return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Circle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/10 rounded-2xl">
                  <Users className="w-7 h-7 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Team Members</h2>
                  <p className="text-slate-400 text-sm font-medium mt-0.5">Project assignments and progress</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                  <p className="text-slate-400 font-medium">Loading assignments...</p>
                </div>
              )}

              {!isLoading && (!members || members.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Users className="w-16 h-16 text-slate-800 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">No members found</h3>
                  <p className="text-slate-500 max-w-xs">There are no members assigned to this project yet.</p>
                </div>
              )}

              {!isLoading && members?.map(member => {
                const memberTasks = getMemberTasks(member.id);
                const doneCount = memberTasks.filter(t => t.status === 'DONE').length;
                const totalCount = memberTasks.length;
                const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

                return (
                  <div key={member.id} className="group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-violet-900/20">
                          {member.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{member.email.split('@')[0]}</h3>
                          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{member.email}</p>
                        </div>
                      </div>

                      {totalCount > 0 && (
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                              <span className="text-sm font-bold text-primary-400">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                              />
                            </div>
                          </div>
                          <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Tasks</p>
                            <p className="text-white font-bold">{doneCount}/{totalCount}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-0 md:pl-16">
                      {memberTasks.length > 0 ? (
                        memberTasks.map(task => (
                          <div key={task.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-200 truncate">{task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {task.parentTaskId ? (
                                    <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                      <Briefcase className="w-2.5 h-2.5" /> Subtask
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-primary-400 uppercase tracking-widest">Task</span>
                                  )}
                                  <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                    task.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' :
                                    task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-sky-500/20 text-sky-400'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-4 text-center border border-dashed border-white/10 rounded-2xl">
                          <p className="text-slate-600 text-xs font-medium italic">No tasks assigned yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectMembersModal;
