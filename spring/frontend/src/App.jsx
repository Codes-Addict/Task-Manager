import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectBoardPage from './pages/ProjectBoardPage';
import TeamPage from './pages/TeamPage';
import { useAuthStore } from './store/useAuthStore';
import { LogOut, LayoutDashboard, Briefcase, Users } from 'lucide-react';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 p-4 rounded-xl transition-all text-lg font-medium ${
      isActive 
        ? 'bg-primary-600/20 text-primary-400' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`;

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200">
      <aside className="w-72 glass border-r-0 rounded-r-3xl m-4 hidden lg:flex flex-col shadow-2xl">
        <div className="p-8 text-3xl font-extrabold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg flex-shrink-0" />
          <span className="tracking-tight">Taskly</span>
        </div>
        
        <nav className="flex-1 px-6 space-y-3 mt-4">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-6 h-6" /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <Briefcase className="w-6 h-6" /> My Projects
          </NavLink>
          <NavLink to="/team" className={navLinkClass}>
            <Users className="w-6 h-6" /> Team
          </NavLink>
        </nav>

        <div className="p-6 mt-auto">
          <div className="glass-hover bg-slate-800/40 p-5 rounded-2xl mb-4 transition-all">
            <p className="text-base font-semibold text-white truncate">{user?.email || 'User'}</p>
            <p className="text-sm text-primary-400 uppercase tracking-widest mt-1.5 font-medium">{user?.role || 'Member'}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-4 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all font-medium text-lg"
          >
            <LogOut className="w-6 h-6" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/:projectId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectBoardPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TeamPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
