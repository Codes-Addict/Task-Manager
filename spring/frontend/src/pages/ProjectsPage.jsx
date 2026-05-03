import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Plus, Calendar, ArrowRight, X, FolderOpen,
  Sparkles, ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const createProject = useMutation({
    mutationFn: async (project) => {
      const { data } = await api.post('/projects', project);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
    }
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    createProject.mutate(newProject);
  };

  if (isLoading) {
    return (
      <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary-500/10 rounded-2xl">
            <Briefcase className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">My Projects</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-3xl h-[220px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
        <div className="glass p-12 rounded-3xl text-center">
          <p className="text-rose-400 text-lg font-medium">Failed to load projects. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-500/10 rounded-2xl">
            <Briefcase className="w-10 h-10 text-primary-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">My Projects</h1>
            <p className="text-slate-400 text-lg mt-1 font-medium">
              {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus className="w-5 h-5" /> New Project
        </motion.button>
      </div>

      {/* Projects Grid */}
      {projects?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-16 rounded-3xl text-center"
        >
          <div className="inline-flex p-5 bg-primary-500/10 rounded-2xl mb-6">
            <FolderOpen className="w-12 h-12 text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No projects yet</h3>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            Create your first project to start organizing and tracking your team's tasks.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/25"
          >
            <Sparkles className="w-5 h-5" /> Create Your First Project
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects?.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="glass glass-hover p-8 rounded-3xl cursor-pointer group transition-all border-l-4 border-primary-500 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                  <Briefcase className="w-6 h-6 text-primary-400" />
                </div>
                <div className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-slate-800/60">
                  <ChevronRight className="w-5 h-5 text-primary-400" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-primary-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                {project.description || 'No description provided'}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Calendar className="w-4 h-4" />
                {project.createdAt 
                  ? format(new Date(project.createdAt), 'MMM d, yyyy') 
                  : 'Recently created'}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-500/10 rounded-xl">
                    <Plus className="w-6 h-6 text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">New Project</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Marketing Campaign"
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-600"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of the project..."
                    rows={3}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-slate-600"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3.5 rounded-xl text-slate-300 font-semibold text-base hover:bg-slate-800/60 transition-all border border-slate-700/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProject.isPending}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-base transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                  >
                    {createProject.isPending ? 'Creating...' : (
                      <><Plus className="w-5 h-5" /> Create Project</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
