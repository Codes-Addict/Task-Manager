import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Loader2, Mail } from 'lucide-react';

const AddMemberModal = ({ show, onClose, onSubmit, isPending, isError }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CONTRIBUTOR');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit({ email, role });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}
            className="relative glass w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 rounded-xl"><UserPlus className="w-6 h-6 text-violet-400" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Add Member</h2>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">Invite a team member</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500" />
                  </div>
                  <input type="email" placeholder="colleague@example.com"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 pl-12 pr-4 text-white text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-slate-600"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole('CONTRIBUTOR')}
                    className={`py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                      role === 'CONTRIBUTOR'
                        ? 'bg-violet-500/15 text-violet-400 ring-2 ring-violet-500 ring-offset-2 ring-offset-[#1e293b]'
                        : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/50'
                    }`}>Contributor</button>
                  <button type="button" onClick={() => setRole('VIEWER')}
                    className={`py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                      role === 'VIEWER'
                        ? 'bg-sky-500/15 text-sky-400 ring-2 ring-sky-500 ring-offset-2 ring-offset-[#1e293b]'
                        : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/50'
                    }`}>Viewer</button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-slate-300 font-semibold text-base hover:bg-slate-800/60 transition-all border border-slate-700/50">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold text-base transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2">
                  {isPending ? (<><Loader2 className="w-5 h-5 animate-spin" /> Inviting...</>) : (<><UserPlus className="w-5 h-5" /> Invite Member</>)}
                </button>
              </div>
              {isError && <p className="text-rose-400 text-sm text-center font-medium mt-2">Failed to add member. Check if they are registered.</p>}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberModal;
