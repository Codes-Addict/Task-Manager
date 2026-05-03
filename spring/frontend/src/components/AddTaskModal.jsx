import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2 } from 'lucide-react';

const PRIORITY_BADGES = {
  LOW: 'bg-emerald-500/15 text-emerald-400',
  MEDIUM: 'bg-sky-500/15 text-sky-400',
  HIGH: 'bg-amber-500/15 text-amber-400',
  URGENT: 'bg-rose-500/15 text-rose-400',
};

const AddTaskModal = ({ show, onClose, onSubmit, newTask, setNewTask, isPending, isError, title = 'Add Task', subtitle = 'Task will be added to To Do' }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}
            className="relative glass w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-500/10 rounded-xl"><Plus className="w-6 h-6 text-primary-400" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">{subtitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Title</label>
                <input type="text" placeholder="e.g., Design landing page"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
                  value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Description</label>
                <textarea placeholder="Brief description..." rows={3}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-slate-600"
                  value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                    <button key={p} type="button" onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                        newTask.priority === p
                          ? `${PRIORITY_BADGES[p]} ring-2 ring-offset-2 ring-offset-[#1e293b] ${p === 'LOW' ? 'ring-emerald-500' : p === 'MEDIUM' ? 'ring-sky-500' : p === 'HIGH' ? 'ring-amber-500' : 'ring-rose-500'}`
                          : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-slate-300 font-semibold text-base hover:bg-slate-800/60 transition-all border border-slate-700/50">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-base transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2">
                  {isPending ? (<><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>) : (<><Plus className="w-5 h-5" /> Add</>)}
                </button>
              </div>
              {isError && <p className="text-rose-400 text-sm text-center font-medium mt-2">Failed to create. Please try again.</p>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
