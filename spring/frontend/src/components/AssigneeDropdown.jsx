import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, Check } from 'lucide-react';
import api from '../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AssigneeDropdown = ({ task, projectId, isOwner, members }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const assignTask = useMutation({
    mutationFn: async (userId) => {
      await api.post(`/tasks/${task.id}/assign?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      if (task.parentTaskId) {
        queryClient.invalidateQueries(['subtasks', task.parentTaskId]);
      } else {
        queryClient.invalidateQueries(['subtasks', task.id]);
      }
    }
  });

  const assignee = task.assignee;

  // Render the currently assigned user's initials, or a generic icon
  const renderAvatar = () => {
    if (assignee && assignee.email) {
      const initial = assignee.email.charAt(0).toUpperCase();
      return (
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center border-2 border-[#1e293b] text-[11px] font-bold text-white" title={assignee.email}>
          {initial}
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center border-2 border-[#1e293b]" title="Unassigned">
        <User className="w-3.5 h-3.5 text-slate-400" />
      </div>
    );
  };

  if (!isOwner) {
    return (
      <div className="flex items-center gap-2">
        {renderAvatar()}
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-1 cursor-pointer hover:bg-slate-800/50 p-1 rounded-lg transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {renderAvatar()}
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 shadow-xl rounded-xl z-20 py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 pb-2 mb-2 border-b border-slate-700/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assign To</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {members?.map(member => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => {
                      assignTask.mutate(member.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-[10px] font-bold border border-violet-500/20">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-300 truncate max-w-[100px]">{member.email.split('@')[0]}</span>
                    </div>
                    {assignee?.id === member.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssigneeDropdown;
