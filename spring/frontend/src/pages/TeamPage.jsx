import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { motion } from 'framer-motion';
import { Users, Briefcase, Crown, UserCircle, ArrowRight, UserPlus, Shield } from 'lucide-react';
import AddMemberModal from '../components/AddMemberModal';

const TeamPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await api.post(`/projects/${selectedProjectId}/members?email=${email}&role=${role}`);
    },
    onSuccess: () => {
      setShowAddMemberModal(false);
      setSelectedProjectId(null);
      // Optional: show a success toast here if you had a toast system
    }
  });

  const handleAddMember = (data) => {
    addMemberMutation.mutate(data);
  };

  const openAddMember = (projectId) => {
    setSelectedProjectId(projectId);
    setShowAddMemberModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-violet-500/10 rounded-2xl">
            <Users className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Team</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-3xl h-[200px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const ownedProjects = projects?.filter(p => p.currentUserRole === 'OWNER') || [];

  return (
    <>
      <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-violet-500/10 rounded-2xl">
            <Users className="w-10 h-10 text-violet-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Team</h1>
            <p className="text-slate-400 text-lg mt-1 font-medium">
              Manage members for your projects
            </p>
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div whileHover={{ y: -4 }} className="glass glass-hover p-7 rounded-2xl flex items-center gap-5">
            <div className="p-4 rounded-xl bg-violet-500/15 shadow-lg shadow-black/10">
              <Briefcase className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-0.5">Total Projects</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{projects?.length || 0}</h3>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="glass glass-hover p-7 rounded-2xl flex items-center gap-5">
            <div className="p-4 rounded-xl bg-amber-500/15 shadow-lg shadow-black/10">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-0.5">Projects Owned</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{ownedProjects.length}</h3>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="glass glass-hover p-7 rounded-2xl flex items-center gap-5">
            <div className="p-4 rounded-xl bg-emerald-500/15 shadow-lg shadow-black/10">
              <UserCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-0.5">Your Default Role</p>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Member</h3>
            </div>
          </motion.div>
        </div>

        {/* Projects with Team Info */}
        {projects?.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-16 rounded-3xl text-center">
            <div className="inline-flex p-5 bg-violet-500/10 rounded-2xl mb-6">
              <Users className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No teams yet</h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Create a project to start building your team.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-300 uppercase tracking-wider mb-2">Your Projects</h2>
            {projects?.map((project, index) => {
              const isOwner = project.currentUserRole === 'OWNER';
              
              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
                  className="glass glass-hover p-7 rounded-2xl transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                        <Briefcase className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-primary-300 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Dynamic Role Badge */}
                      <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider ${
                        isOwner ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {isOwner ? <Crown className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {project.currentUserRole || 'Member'}
                      </div>

                      {/* Add Member Button - Only visible if OWNER */}
                      {isOwner && (
                        <button onClick={() => openAddMember(project.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 font-semibold text-sm rounded-xl transition-all border border-violet-500/30">
                          <UserPlus className="w-4 h-4" /> Add Member
                        </button>
                      )}

                      <button onClick={() => navigate(`/projects/${project.id}`)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all ml-2 border border-transparent hover:border-primary-500/30">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AddMemberModal 
        show={showAddMemberModal} 
        onClose={() => setShowAddMemberModal(false)}
        onSubmit={handleAddMember}
        isPending={addMemberMutation.isPending}
        isError={addMemberMutation.isError}
      />
    </>
  );
};

export default TeamPage;
