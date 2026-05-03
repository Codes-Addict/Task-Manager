import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { LayoutDashboard, CheckCircle2, Clock, AlertTriangle, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#38bdf8', '#fbbf24', '#f87171', '#4ade80'];

const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    }
  });

  if (isLoading) return <div className="p-8 text-white">Loading dashboard...</div>;

  const statusData = stats?.tasksByStatus ? Object.entries(stats.tasksByStatus).map(([name, value]) => ({ name, value })) : [];
  const priorityData = stats?.tasksByPriority ? Object.entries(stats.tasksByPriority).map(([name, value]) => ({ name, value })) : [];

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-hover glass p-8 rounded-3xl flex items-center gap-6 transition-all"
    >
      <div className={`p-5 rounded-2xl ${color} shadow-lg shadow-black/20`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-base font-medium mb-1">{label}</p>
        <h3 className="text-4xl font-extrabold text-white tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-primary-500/10 rounded-2xl">
          <LayoutDashboard className="w-10 h-10 text-primary-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Project Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
        <StatCard icon={Briefcase} label="Total Projects" value={stats?.totalProjects || 0} color="bg-blue-500" />
        <StatCard icon={Clock} label="Total Tasks" value={stats?.totalTasks || 0} color="bg-amber-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.tasksByStatus['DONE'] || 0} color="bg-emerald-500" />
        <StatCard icon={AlertTriangle} label="Blocked" value={stats?.tasksByStatus['BLOCKED'] || 0} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-3xl h-[450px]">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-10 rounded-3xl h-[450px]">
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
