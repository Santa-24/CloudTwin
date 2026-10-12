'use client';

import React, { useState } from 'react';
import { 
  Cloud, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignup: (email: string, pass: string, name: string) => Promise<void>;
  onGuestDemo: () => Promise<void>;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onSignup,
  onGuestDemo,
  onLogout
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (mode === 'signup') {
        await onSignup(email, password, fullName);
        setSuccessMsg('Account registered successfully! Welcome to CloudTwin.');
        setTimeout(() => onClose(), 800);
      } else if (mode === 'forgot') {
        setSuccessMsg(`Recovery instructions dispatched to ${email}. Check your inbox.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await onGuestDemo();
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to establish guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If Already Logged In: Show Profile View */}
        {currentUser ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold border border-amber-300 shadow-lg shadow-amber-500/20">
              {currentUser.full_name ? currentUser.full_name.slice(0, 2).toUpperCase() : 'CT'}
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-xl font-bold text-slate-900">{currentUser.full_name}</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono uppercase font-semibold">
                {currentUser.role} • {currentUser.tier} tier
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 text-left space-y-2">
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="text-slate-900 font-semibold">{currentUser.company || 'Enterprise'}</span>
              </div>
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="text-emerald-700 font-semibold">AWS RDS PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span>Auth Provider:</span>
                <span className="text-amber-700 font-semibold">JWT Session Active</span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
            >
              Sign Out from CloudTwin
            </button>
          </div>
        ) : (
          /* Login / Signup / Forgot Form */
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-xs">
                  <Cloud className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">AWS CloudTwin IAM & SSO</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {mode === 'login' ? 'Sign In to CloudTwin' : mode === 'signup' ? 'Create Architect Account' : 'Reset Master Password'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Access your digital twins, chaos simulations, and team cloud workspaces.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error / Success Alerts */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      required
                      type="text"
                      placeholder="Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    required
                    type="email"
                    placeholder="architect@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    {mode === 'login' && (
                      <span 
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-amber-700 hover:underline cursor-pointer font-medium"
                      >
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : mode === 'signup' ? 'Create Architect Account' : 'Send Reset Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Demo Bypass Button */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-400 uppercase font-bold">OR INSTANT DEMO</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Launch Instant Guest Demo Session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
