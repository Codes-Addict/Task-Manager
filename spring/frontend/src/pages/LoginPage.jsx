import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, formData);
      setAuth({ email: data.email, role: data.role }, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-lg p-10 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary-500/10 rounded-2xl mb-6">
            <ShieldCheck className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Team Task Manager</h1>
          <p className="text-slate-400 mt-3 text-lg">
            {isLogin ? 'Welcome back! Please login' : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="First Name"
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          )}
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-lg py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/25"
          >
            {loading ? 'Processing...' : (isLogin ? <><LogIn className="w-5 h-5" /> Login</> : <><UserPlus className="w-5 h-5" /> Register</>)}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 hover:text-white text-base font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
