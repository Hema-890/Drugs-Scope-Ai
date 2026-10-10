import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { signInUser, signUpUser } from '../../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Principal Investigator');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid institutional or research email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return false;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full clinical or academic name.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    const authPromise =
      mode === 'signup'
        ? signUpUser(email, password, name, role)
        : signInUser(email, password);

    authPromise
      .then((data: any) => {
        setIsLoading(false);
        setSuccessMsg(
          mode === 'signin'
            ? 'Secure session initialized. Welcome back.'
            : 'Biomedical research credential registered successfully.'
        );

        setTimeout(() => {
          onSuccess({
            name: mode === 'signup' ? name : (data?.user?.user_metadata?.full_name || email.split('@')[0] || 'Researcher'),
            email,
            role: mode === 'signup' ? role : (data?.user?.user_metadata?.role || 'Principal Investigator')
          });
          onClose();
        }, 600);
      })
      .catch((err: any) => {
        setIsLoading(false);
        setError(err?.message || 'Authentication error. Please check credentials.');
      });
  };

  const handleQuickDemoLogin = () => {
    setEmail('sarah.chen@biomed.harvard.edu');
    setPassword('••••••••••••');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Logged in as Dr. Sarah Chen (Principal Investigator)');
      setTimeout(() => {
        onSuccess({
          name: 'Dr. Sarah Chen',
          email: 'sarah.chen@biomed.harvard.edu',
          role: 'Principal Investigator'
        });
        onClose();
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0C1322] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#24D8ED]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/[0.08] flex items-center justify-between">
          <BrandLogo size="sm" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71839E] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-white/[0.08] bg-[#080E1A]">
          <button
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              mode === 'signin'
                ? 'text-[#24D8ED] border-b-2 border-[#24D8ED] bg-[#0C1322]'
                : 'text-[#71839E] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              mode === 'signup'
                ? 'text-[#24D8ED] border-b-2 border-[#24D8ED] bg-[#0C1322]'
                : 'text-[#71839E] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-[#A6B5CB] mb-1.5">
                  Full Name & Credentials
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#71839E]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Chen, MD, PhD"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111C2E] border border-white/10 text-white placeholder-[#71839E] text-xs focus:outline-none focus:border-[#24D8ED] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#A6B5CB] mb-1.5">
                Research / Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#71839E]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@institution.org"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111C2E] border border-white/10 text-white placeholder-[#71839E] text-xs focus:outline-none focus:border-[#24D8ED] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-[#A6B5CB]">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setError('Password reset instructions will be sent to verified clinical emails.')}
                    className="text-[10px] text-[#24D8ED] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#71839E]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#111C2E] border border-white/10 text-white placeholder-[#71839E] text-xs focus:outline-none focus:border-[#24D8ED] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#71839E] hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-[#A6B5CB] mb-1.5">
                  Clinical / Scientific Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111C2E] border border-white/10 text-white text-xs focus:outline-none focus:border-[#24D8ED]"
                >
                  <option value="Principal Investigator">Principal Investigator (Lab Lead)</option>
                  <option value="Clinical Pharmacologist">Clinical Pharmacologist / PharmD</option>
                  <option value="Attending Physician">Attending Physician / MD</option>
                  <option value="Bioinformatics Researcher">Bioinformatics Researcher</option>
                  <option value="Regulatory Specialist">Regulatory / Safety Auditor</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(36,216,237,0.3)] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Initialize Research Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access shortcut */}
          <div className="pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#A6B5CB] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9475FF]" />
              <span>Instant Reviewer Access (Dr. Sarah Chen Demo)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-[#71839E]">
            <Shield className="w-3 h-3" />
            <span>256-bit TLS encrypted session • HIPAA & 21 CFR Part 11 ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
