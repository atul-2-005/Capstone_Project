import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  User,
  Wrench,
  AlertCircle,
  Sparkles,
  Building2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const { login, quickLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back to CampusConnect!");
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(role);
      toast.success(`Signed in with Demo ${role} account`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Quick login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/30 mb-4 ring-4 ring-white/10">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Campus<span className="text-indigo-400">Connect</span>
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-medium">
          Smart University Service & Facility Management Platform
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Authentication Failed</span>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                University Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student1@campusconnect.edu"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium">
                  Forgot?
                </span>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-600/20 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 mt-2 hover:translate-y-[-1px] active:scale-95"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Verifying Credentials...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Evaluation Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                1-Click Demo Evaluation
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Instant Token</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('STUDENT')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all text-emerald-800 hover:shadow-xs group text-center"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold">Student</span>
                <span className="text-[9px] text-emerald-600 font-medium">Ticket & Book</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('STAFF')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80 hover:bg-sky-100/70 transition-all text-sky-800 hover:shadow-xs group text-center"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold">Staff</span>
                <span className="text-[9px] text-sky-600 font-medium">Workboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-100/70 transition-all text-indigo-800 hover:shadow-xs group text-center"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold">Admin</span>
                <span className="text-[9px] text-indigo-600 font-medium">Control Room</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center pt-2">
            <p className="text-xs text-slate-500">
              New student to campus?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                <span>Create an account</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
