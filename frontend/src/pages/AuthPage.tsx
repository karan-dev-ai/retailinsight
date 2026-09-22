import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  Store,
  Truck,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { authApi } from '../services/api';

export const AuthPage: React.FC = () => {
  const { login, quickLoginAsRole } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<Role>('ROLE_RETAILER');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(usernameOrEmail, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authApi.register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        fullName: regFullName,
        role: regRole,
        businessName: regBusinessName,
        phone: regPhone,
      });
      // After registration, auto login
      await login(regUsername, regPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-xl space-y-6 animate-in fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            RetailInsight
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Intelligent SaaS Platform for Retail Shopkeepers & Wholesalers
          </p>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Instant Demo Evaluation (1-Click Login):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => quickLoginAsRole('RETAILER')}
              className="p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <Store className="w-4 h-4 text-blue-400" />
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="font-bold text-white text-xs mt-1.5">Demo Retailer</p>
              <p className="text-[10px] text-slate-400">Shopkeeper catalog & POS</p>
            </button>

            <button
              onClick={() => quickLoginAsRole('WHOLESALER')}
              className="p-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <Truck className="w-4 h-4 text-purple-400" />
                <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="font-bold text-white text-xs mt-1.5">Demo Wholesaler</p>
              <p className="text-[10px] text-slate-400">Bulk listings & POs</p>
            </button>

            <button
              onClick={() => quickLoginAsRole('ADMIN')}
              className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="font-bold text-white text-xs mt-1.5">Demo Admin</p>
              <p className="text-[10px] text-slate-400">Platform overview</p>
            </button>
          </div>
        </div>

        {/* Login / Register Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username or Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="retailer or retailer@retailinsight.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>

              <div className="pt-2 text-center text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-blue-400 hover:text-blue-300 font-bold underline"
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('ROLE_RETAILER')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all ${
                      regRole === 'ROLE_RETAILER'
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Retailer (Shop)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('ROLE_WHOLESALER')}
                    className={`py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all ${
                      regRole === 'ROLE_WHOLESALER'
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Wholesaler</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="karanmart"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Karan Sharma"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="karan@mart.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
                  <input
                    type="text"
                    placeholder="Karan Daily Needs Mart"
                    value={regBusinessName}
                    onChange={(e) => setRegBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-98 mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration & Start'}
              </button>

              <div className="pt-2 text-center text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-blue-400 hover:text-blue-300 font-bold underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
