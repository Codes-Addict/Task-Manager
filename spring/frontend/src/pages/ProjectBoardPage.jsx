import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import ProjectBoard from '../components/ProjectBoard';
import ProjectMembersModal from '../components/ProjectMembersModal';
import { ArrowLeft, Briefcase, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectBoardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showMembersModal, setShowMembersModal] = React.useState(false);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => { 
      const { data } = await api.get(`/projects/${projectId}/members`); 
      return data; 
    }
  });

  const project = projects?.find(p => String(p.id) === String(projectId));
  const isOwner = project?.currentUserRole === 'OWNER';

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 md:p-12 border-b border-slate-800/50 bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/projects')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary-500/10 rounded-xl">
              <Briefcase className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {project?.name || 'Project Board'}
              </h1>
              <p className="text-slate-400 text-base mt-0.5 font-medium">
                {project?.description || 'Manage and track your tasks'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Avatar Group */}
          <div className="hidden lg:flex items-center -space-x-3">
            {members?.slice(0, 5).map((member, i) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-10 h-10 rounded-full bg-violet-600 border-2 border-[#0f172a] flex items-center justify-center text-xs font-bold text-white shadow-lg"
                title={member.email}
              >
                {member.email.charAt(0).toUpperCase()}
              </motion.div>
            ))}
            {members?.length > 5 && (
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0f172a] flex items-center justify-center text-xs font-bold text-slate-400">
                +{members.length - 5}
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMembersModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all border border-white/5"
            >
              <Users className="w-4.5 h-4.5 text-primary-400" />
              <span>Team</span>
            </button>
            
            {isOwner && (
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
                <Settings className="w-5.5 h-5.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      <ProjectBoard projectId={projectId} project={project} />
      
      <ProjectMembersModal 
        show={showMembersModal} 
        onClose={() => setShowMembersModal(false)}
        projectId={projectId}
        members={members}
        isLoadingMembers={isLoadingMembers}
      />
    </div>
  );
};

export default ProjectBoardPage;
