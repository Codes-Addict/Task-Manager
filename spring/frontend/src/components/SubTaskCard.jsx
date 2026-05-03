import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Lock, Unlock } from 'lucide-react';
import AssigneeDropdown from './AssigneeDropdown';

const PHASES = ['PLANNING', 'DESIGNING', 'EXECUTION', 'COMPLETED'];
const PHASE_LABELS = { PLANNING: 'Planning', DESIGNING: 'Designing', EXECUTION: 'Execution', COMPLETED: 'Done' };
const PRIORITY_BADGES = {
  LOW: 'bg-emerald-500/15 text-emerald-400',
  MEDIUM: 'bg-sky-500/15 text-sky-400',
  HIGH: 'bg-amber-500/15 text-amber-400',
  URGENT: 'bg-rose-500/15 text-rose-400',
};

export const MiniPhaseStepper = ({ task, onPhaseChange, onBlock, disabled }) => {
  const idx = PHASES.indexOf(task.phase || 'PLANNING');
  return (
    <div className="mt-2">
      <div className="relative mb-1.5">
        <div className="h-1 bg-slate-700/60 rounded-full" />
        <motion.div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
          initial={false} animate={{ width: `${(idx / (PHASES.length - 1)) * 100}%` }} transition={{ duration: 0.3 }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {PHASES.map((p, i) => (
            <div key={p} className={`w-2.5 h-2.5 rounded-full border-[1.5px] transition-all ${
              i === idx ? 'bg-primary-400 border-primary-400 scale-125' : i < idx ? 'bg-primary-500 border-primary-500' : 'bg-slate-800 border-slate-600'
            }`} title={PHASE_LABELS[p]} />
          ))}
        </div>
      </div>
      <div className="flex justify-between mb-2">
        {PHASES.map((p, i) => (
          <span key={p} className={`text-[8px] font-bold uppercase tracking-wider ${i === idx ? 'text-primary-400' : i < idx ? 'text-slate-500' : 'text-slate-700'}`}>
            {PHASE_LABELS[p]}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-1.5">
          {idx < PHASES.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); onPhaseChange(PHASES[idx + 1]); }}
              className="flex-1 text-[10px] py-1.5 rounded-md font-semibold border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 transition-all">
              → {PHASE_LABELS[PHASES[idx + 1]]}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onBlock(); }}
            className="flex-1 text-[10px] py-1.5 rounded-md font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Block
          </button>
        </div>
      )}
    </div>
  );
};

export const MiniBlockedIndicator = ({ task, onUnblock }) => {
  const idx = PHASES.indexOf(task.blockedAtPhase || 'PLANNING');
  return (
    <div className="mt-2">
      <p className="text-[8px] text-rose-400/70 uppercase tracking-widest font-bold mb-1">
        Blocked at: <span className="text-rose-400">{PHASE_LABELS[task.blockedAtPhase || 'PLANNING']}</span>
      </p>
      <div className="relative mb-2 opacity-40">
        <div className="h-1 bg-slate-700/60 rounded-full" />
        <div className="absolute top-0 left-0 h-1 bg-rose-500/60 rounded-full" style={{ width: `${(idx / (PHASES.length - 1)) * 100}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {PHASES.map((p, i) => (
            <div key={p} className={`w-2.5 h-2.5 rounded-full border-[1.5px] ${i <= idx ? 'bg-rose-500/60 border-rose-500/60' : 'bg-slate-800 border-slate-700'}`} />
          ))}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onUnblock(); }}
        className="w-full text-[10px] py-1.5 rounded-md font-semibold border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-all flex items-center justify-center gap-1">
        <Unlock className="w-2.5 h-2.5" /> Unblock
      </button>
    </div>
  );
};

const SubTaskCard = ({ subtask, projectId, isOwner, canEdit, members, onStatusChange, onPhaseChange }) => {
  const st = subtask.status;
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 transition-all ${st === 'DONE' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <h5 className="text-sm font-semibold text-white truncate flex-1 pr-2">{subtask.title}</h5>
        <AssigneeDropdown task={subtask} projectId={projectId} isOwner={isOwner} members={members} />
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${PRIORITY_BADGES[subtask.priority] || PRIORITY_BADGES.MEDIUM}`}>
          {subtask.priority}
        </span>
      </div>

      {st === 'TODO' && canEdit && (
        <div className="flex gap-1.5 mt-2">
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(subtask.id, 'IN_PROGRESS'); }}
            className="flex-1 text-[10px] py-1.5 rounded-md font-semibold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10">▶ Start</button>
          <button onClick={(e) => { e.stopPropagation(); onStatusChange(subtask.id, 'BLOCKED'); }}
            className="flex-1 text-[10px] py-1.5 rounded-md font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10">⛔ Block</button>
        </div>
      )}

      {st === 'IN_PROGRESS' && canEdit && (
        <MiniPhaseStepper task={subtask}
          onPhaseChange={(phase) => onPhaseChange(subtask.id, phase)}
          onBlock={() => onStatusChange(subtask.id, 'BLOCKED')} disabled={false} />
      )}

      {st === 'BLOCKED' && canEdit && (
        <MiniBlockedIndicator task={subtask}
          onUnblock={() => onStatusChange(subtask.id, 'IN_PROGRESS')} />
      )}

      {st === 'DONE' && (
        <p className="text-[10px] text-emerald-500/60 font-semibold text-center mt-1">✓ Done</p>
      )}
    </motion.div>
  );
};

export default SubTaskCard;
