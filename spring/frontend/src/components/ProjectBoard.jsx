import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ChevronUp, ChevronDown, Tag, ListTodo, Plus, Loader2, AlertCircle, ClipboardList, Sparkles } from 'lucide-react';
import SubTaskCard, { MiniPhaseStepper, MiniBlockedIndicator } from './SubTaskCard';
import AddTaskModal from './AddTaskModal';
import AssigneeDropdown from './AssigneeDropdown';
import { useAuthStore } from '../store/useAuthStore';

const PRIORITY_COLORS = { LOW: 'border-emerald-500', MEDIUM: 'border-primary-500', HIGH: 'border-amber-500', URGENT: 'border-rose-500' };
const PRIORITY_BADGES = { LOW: 'bg-emerald-500/15 text-emerald-400', MEDIUM: 'bg-sky-500/15 text-sky-400', HIGH: 'bg-amber-500/15 text-amber-400', URGENT: 'bg-rose-500/15 text-rose-400' };
const COLUMN_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done', BLOCKED: 'Blocked' };
const COLUMN_COLORS = { TODO: 'bg-sky-500', IN_PROGRESS: 'bg-amber-500', DONE: 'bg-emerald-500', BLOCKED: 'bg-rose-500' };
const PHASES = ['PLANNING', 'DESIGNING', 'EXECUTION', 'COMPLETED'];
const PHASE_LABELS = { PLANNING: 'Planning', DESIGNING: 'Designing', EXECUTION: 'Execution', COMPLETED: 'Done' };

// ─── Full-size Phase Stepper (for parent tasks) ─────────────
const PhaseStepper = ({ task, onPhaseChange, onBlock, canComplete }) => {
  const idx = PHASES.indexOf(task.phase || 'PLANNING');
  return (
    <div className="pt-4 border-t border-slate-700/50">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Phase Progress</p>
      <div className="relative mb-3">
        <div className="h-1.5 bg-slate-700/60 rounded-full" />
        <motion.div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
          initial={false} animate={{ width: `${(idx / (PHASES.length - 1)) * 100}%` }} transition={{ duration: 0.4 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {PHASES.map((p, i) => (
            <div key={p} className={`w-4 h-4 rounded-full border-2 transition-all ${
              i === idx ? 'bg-primary-400 border-primary-400 ring-4 ring-primary-500/20 scale-125'
              : i < idx ? 'bg-primary-500 border-primary-500' : 'bg-slate-800 border-slate-600'
            }`} title={PHASE_LABELS[p]} />
          ))}
        </div>
      </div>
      <div className="flex justify-between mb-4">
        {PHASES.map((p, i) => (
          <span key={p} className={`text-[10px] font-bold uppercase tracking-wider ${i === idx ? 'text-primary-400' : i < idx ? 'text-slate-400' : 'text-slate-600'}`}>{PHASE_LABELS[p]}</span>
        ))}
      </div>
      <div className="flex gap-2">
        {idx < PHASES.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); const next = PHASES[idx + 1]; if (next === 'COMPLETED' && !canComplete) { alert('Complete all subtasks first!'); return; } onPhaseChange(next); }}
            className={`flex-1 text-xs py-2 rounded-lg font-semibold border transition-all flex items-center justify-center gap-1.5 ${
              PHASES[idx + 1] === 'COMPLETED' && !canComplete
                ? 'border-slate-700 text-slate-600 cursor-not-allowed' : 'border-primary-500/30 text-primary-400 hover:bg-primary-500/10'
            }`}>
            → {PHASE_LABELS[PHASES[idx + 1]]}
            {PHASES[idx + 1] === 'COMPLETED' && !canComplete && <span className="text-[9px]">(subtasks pending)</span>}
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onBlock(); }}
          className="flex-1 text-xs py-2 rounded-lg font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" /> Block
        </button>
      </div>
    </div>
  );
};

const BlockedIndicator = ({ task, onUnblock }) => {
  const idx = PHASES.indexOf(task.blockedAtPhase || 'PLANNING');
  return (
    <div className="pt-4 border-t border-slate-700/50">
      <p className="text-[10px] text-rose-400/60 uppercase tracking-widest font-bold mb-3">Blocked at: <span className="text-rose-400">{PHASE_LABELS[task.blockedAtPhase || 'PLANNING']}</span></p>
      <div className="relative mb-3 opacity-50">
        <div className="h-1.5 bg-slate-700/60 rounded-full" />
        <div className="absolute top-0 left-0 h-1.5 bg-rose-500/60 rounded-full" style={{ width: `${(idx / (PHASES.length - 1)) * 100}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {PHASES.map((p, i) => <div key={p} className={`w-4 h-4 rounded-full border-2 ${i <= idx ? 'bg-rose-500/60 border-rose-500/60' : 'bg-slate-800 border-slate-700'}`} />)}
        </div>
      </div>
      <div className="flex justify-between mb-4 opacity-50">
        {PHASES.map(p => <span key={p} className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{PHASE_LABELS[p]}</span>)}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onUnblock(); }}
        className="w-full text-xs py-2.5 rounded-lg font-semibold border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-all flex items-center justify-center gap-1.5">
        <Unlock className="w-3.5 h-3.5" /> Unblock → Resume {PHASE_LABELS[task.blockedAtPhase || 'PLANNING']}
      </button>
    </div>
  );
};

// ─── Expandable Task Card ───────────────────────────────────
const TaskCard = ({ task, col, projectId, isOwner, canEdit, members }) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [newSubTask, setNewSubTask] = useState({ title: '', description: '', priority: 'MEDIUM' });

  const { data: subTasks } = useQuery({
    queryKey: ['subtasks', task.id],
    queryFn: async () => { const { data } = await api.get(`/tasks/${task.id}/subtasks`); return data; },
    enabled: expanded,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries(['tasks', projectId]);
    queryClient.invalidateQueries(['subtasks', task.id]);
    queryClient.invalidateQueries(['dashboard-stats']);
  };

  const updateStatus = useMutation({ mutationFn: async ({ taskId, status }) => { await api.patch(`/tasks/${taskId}/status?status=${status}`); }, onSuccess: invalidateAll,
    onError: (err) => { const msg = err?.response?.data?.error; if (msg) alert(msg); }
  });
  const updatePhase = useMutation({ mutationFn: async ({ taskId, phase }) => { await api.patch(`/tasks/${taskId}/phase?phase=${phase}`); }, onSuccess: invalidateAll,
    onError: (err) => { const msg = err?.response?.data?.error; if (msg) alert(msg); }
  });
  const createSubTask = useMutation({
    mutationFn: async (data) => { const { data: res } = await api.post(`/tasks/${task.id}/subtasks`, data); return res; },
    onSuccess: () => { invalidateAll(); setShowSubTaskModal(false); setNewSubTask({ title: '', description: '', priority: 'MEDIUM' }); }
  });

  const handleAddSubTask = (e) => { e.preventDefault(); if (!newSubTask.title.trim()) return; createSubTask.mutate({ title: newSubTask.title, description: newSubTask.description, priority: newSubTask.priority, status: 'TODO' }); };

  const subTaskCount = task.subTaskCount || 0;
  const subTaskDone = task.subTaskDoneCount || 0;
  const canComplete = subTaskCount === 0 || subTaskDone === subTaskCount;

  return (
    <>
      <motion.div layoutId={String(task.id)} key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`glass glass-hover p-6 rounded-2xl shadow-xl border-l-4 ${PRIORITY_COLORS[task.priority] || 'border-primary-500'} transition-all`}>
        {/* Header - clickable to expand */}
        <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-white font-bold text-lg tracking-tight flex-1">{task.title}</h4>
            {subTaskCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-2 flex-shrink-0 ${subTaskDone === subTaskCount ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {subTaskDone}/{subTaskCount}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4">{task.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AssigneeDropdown task={task} projectId={projectId} isOwner={isOwner} members={members} />
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM}`}>
              <Tag className="w-3.5 h-3.5" />{task.priority}
            </div>
          </div>
        </div>

        {/* Status actions for TODO */}
        {col === 'TODO' && canEdit && (
          <div className="pt-3 border-t border-slate-700/50 mt-3">
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ taskId: task.id, status: 'IN_PROGRESS' }); }}
                className="flex-1 text-xs py-2.5 rounded-lg font-semibold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10">▶ Start Progress</button>
              <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ taskId: task.id, status: 'BLOCKED' }); }}
                className="flex-1 text-xs py-2.5 rounded-lg font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10">⛔ Block</button>
            </div>
          </div>
        )}
        {col === 'IN_PROGRESS' && canEdit && (
          <PhaseStepper task={task} canComplete={canComplete}
            onPhaseChange={(phase) => updatePhase.mutate({ taskId: task.id, phase })}
            onBlock={() => updateStatus.mutate({ taskId: task.id, status: 'BLOCKED' })} />
        )}
        {col === 'BLOCKED' && canEdit && <BlockedIndicator task={task} onUnblock={() => updateStatus.mutate({ taskId: task.id, status: 'IN_PROGRESS' })} />}
        {col === 'DONE' && <div className="pt-3 border-t border-slate-700/50"><p className="text-xs text-emerald-500/60 font-semibold text-center py-1">✓ Completed</p></div>}

        {/* Expanded subtasks area */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden">
              <div className="mt-4 pt-4 border-t border-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subtasks</span>
                    {subTaskCount > 0 && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">{subTaskDone}/{subTaskCount}</span>}
                  </div>
                  {canEdit && (
                    <button onClick={(e) => { e.stopPropagation(); setShowSubTaskModal(true); }}
                      className="text-[10px] font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-all">
                      <Plus className="w-3 h-3" /> Add Subtask
                    </button>
                  )}
                </div>

                {subTasks && subTasks.length > 0 ? (
                  <div className="space-y-2">
                    {subTasks.map(st => (
                      <SubTaskCard key={st.id} subtask={st} projectId={projectId} isOwner={isOwner} canEdit={canEdit} members={members}
                        onStatusChange={(id, status) => updateStatus.mutate({ taskId: id, status })}
                        onPhaseChange={(id, phase) => updatePhase.mutate({ taskId: id, phase })} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 text-center py-4 italic">No subtasks yet</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Subtask Modal */}
      <AddTaskModal show={showSubTaskModal} onClose={() => setShowSubTaskModal(false)} onSubmit={handleAddSubTask}
        newTask={newSubTask} setNewTask={setNewSubTask} isPending={createSubTask.isPending} isError={createSubTask.isError}
        title="Add Subtask" subtitle={`Adding subtask to "${task.title}"`} />
    </>
  );
};

// ─── Main Board ─────────────────────────────────────────────
const ProjectBoard = ({ projectId, project }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [filterMode, setFilterMode] = useState('ALL');

  const isOwner = project?.currentUserRole === 'OWNER';
  const canEdit = project?.currentUserRole === 'OWNER' || project?.currentUserRole === 'CONTRIBUTOR';

  const { data: members } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => { const { data } = await api.get(`/projects/${projectId}/members`); return data; }
  });

  const { data: rawTasks, isLoading, error } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => { const { data } = await api.get(`/tasks/project/${projectId}`); return data; }
  });

  const createTask = useMutation({
    mutationFn: async (taskData) => { const { data } = await api.post(`/tasks/project/${projectId}`, taskData); return data; },
    onSuccess: () => { queryClient.invalidateQueries(['tasks', projectId]); queryClient.invalidateQueries(['dashboard-stats']); setShowAddTaskModal(false); setNewTask({ title: '', description: '', priority: 'MEDIUM' }); }
  });

  const handleAddTask = (e) => { e.preventDefault(); if (!newTask.title.trim()) return; createTask.mutate({ title: newTask.title, description: newTask.description, priority: newTask.priority, status: 'TODO' }); };

  if (isLoading) return (<div className="flex items-center justify-center h-[60vh]"><div className="flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 text-primary-400 animate-spin" /><p className="text-slate-400 text-lg font-medium">Loading board...</p></div></div>);
  if (error) return (<div className="flex items-center justify-center h-[60vh]"><div className="glass p-10 rounded-3xl text-center max-w-md"><AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" /><p className="text-rose-400 text-lg font-medium mb-2">Failed to load tasks</p></div></div>);

  const tasks = filterMode === 'MY_TASKS' 
    ? rawTasks?.filter(t => t.assignee?.id === user?.id) 
    : rawTasks;

  const hasTasks = tasks && tasks.length > 0;
  const allColumns = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];
  const visibleColumns = hasTasks ? allColumns.filter(col => col === 'TODO' || tasks.some(t => t.status === col)) : [];

  if (!hasTasks) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="inline-flex p-6 bg-primary-500/10 rounded-3xl mb-8"><ClipboardList className="w-16 h-16 text-primary-400" /></div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">No tasks yet</h2>
            <p className="text-slate-400 text-lg mb-8">{canEdit ? 'Add your first task to get started.' : 'No tasks have been added to this project yet.'}</p>
            {canEdit && (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/25">
                <Sparkles className="w-5 h-5" /> Add Your First Task
              </motion.button>
            )}
          </motion.div>
        </div>
        {canEdit && <AddTaskModal show={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} onSubmit={handleAddTask}
          newTask={newTask} setNewTask={setNewTask} isPending={createTask.isPending} isError={createTask.isError} />}
      </>
    );
  }

  return (
    <>
      <div className="p-8 md:p-12 overflow-x-auto h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <ClipboardList className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">{tasks?.length || 0} task{tasks?.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="h-6 w-px bg-slate-700/50" />
            
            {/* Filter Toggle */}
            <div className="flex items-center bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
              <button 
                onClick={() => setFilterMode('ALL')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  filterMode === 'ALL' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                All Tasks
              </button>
              <button 
                onClick={() => setFilterMode('MY_TASKS')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  filterMode === 'MY_TASKS' 
                    ? 'bg-violet-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                My Tasks
              </button>
            </div>
          </div>
          {canEdit && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25">
              <Plus className="w-4 h-4" /> Add Task
            </motion.button>
          )}
        </div>
        <div className="flex gap-8 h-full min-w-max">
          {visibleColumns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="w-[400px] flex flex-col gap-5">
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${COLUMN_COLORS[col]}`} />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{COLUMN_LABELS[col]}</h3>
                  </div>
                  <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{columnTasks.length}</span>
                </div>
                <div className="flex flex-col gap-4 min-h-[400px]">
                  {columnTasks.map(task => <TaskCard key={task.id} task={task} col={col} projectId={projectId} isOwner={isOwner} canEdit={canEdit} members={members} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {canEdit && <AddTaskModal show={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} onSubmit={handleAddTask}
        newTask={newTask} setNewTask={setNewTask} isPending={createTask.isPending} isError={createTask.isError} />}
    </>
  );
};

export default ProjectBoard;
