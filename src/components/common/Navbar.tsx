import React from 'react';
import { DatasetMode, UserProfile } from '../../types';
import {
  Activity,
  CheckCircle2,
  Command,
  Database,
  Mic,
  Moon,
  Search,
  Shield,
  Sliders,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  mode: DatasetMode;
  onModeChange: (mode: DatasetMode) => void;
  user: UserProfile;
  onOpenCommandPalette: () => void;
  onOpenVoiceModal: () => void;
  activeModule: string;
  onNavigate: (moduleId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  user,
  onOpenCommandPalette,
  onOpenVoiceModal,
  activeModule,
  onNavigate
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#101827]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          {/* Brand Symbol: Molecular geometry + Scope Lens */}
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#101827] to-[#1D2A3E] border border-[#37D6E6]/40 flex items-center justify-center shadow-lg group-hover:border-[#37D6E6] transition-all">
            <svg
              className="w-5 h-5"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="42" stroke="#37D6E6" strokeWidth="6" strokeDasharray="6 4" />
              <circle cx="34" cy="36" r="12" fill="#37D6E6" />
              <circle cx="66" cy="36" r="12" fill="#9079F7" />
              <circle cx="50" cy="68" r="12" fill="#32C8B7" />
              <line x1="34" y1="36" x2="66" y2="36" stroke="#F4F7FB" strokeWidth="4" />
              <line x1="34" y1="36" x2="50" y2="68" stroke="#F4F7FB" strokeWidth="4" />
              <line x1="66" y1="36" x2="50" y2="68" stroke="#F4F7FB" strokeWidth="4" />
              <circle cx="50" cy="50" r="22" stroke="#EFB85A" strokeWidth="3" />
            </svg>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#32C8B7] ring-2 ring-[#070B14]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base tracking-wide text-[#F4F7FB]">
                DRUG SCOPE <span className="text-[#37D6E6]">AI</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-[#37D6E6]/10 text-[#37D6E6] rounded border border-[#37D6E6]/30">
                v4.0
              </span>
            </div>
            <p className="text-[10px] text-[#A7B5C9] hidden sm:block tracking-tight font-medium">
              Autonomous Drug–Drug Adverse Interaction & Receptor Discovery
            </p>
          </div>
        </button>
      </div>

      {/* Global Quick Search & Voice Bar */}
      <div className="hidden md:flex items-center gap-2 max-w-md w-full mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex-1 flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#070B14]/80 border border-white/10 hover:border-[#37D6E6]/40 text-xs text-[#A7B5C9] transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#37D6E6] group-hover:scale-110 transition-transform" />
            <span>Search drugs, targets (CYP2C9, VKORC1), PDBs...</span>
          </div>
          <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/70">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenVoiceModal}
          title="Voice-Assisted Scientific Navigation"
          className="p-2 rounded-lg bg-[#070B14]/80 border border-white/10 hover:border-[#37D6E6]/40 hover:text-[#37D6E6] text-[#A7B5C9] transition-all"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {/* Right Controls: Dataset Mode Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Mode Selector */}
        <div className="flex items-center bg-[#070B14] p-1 rounded-lg border border-white/10 text-xs">
          {(['DEMO', 'RESEARCH', 'CLINICAL REVIEW'] as DatasetMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-2.5 py-1 rounded font-medium text-[11px] transition-all ${
                mode === m
                  ? m === 'CLINICAL REVIEW'
                    ? 'bg-[#F16D76]/20 text-[#F16D76] border border-[#F16D76]/40 font-semibold'
                    : m === 'RESEARCH'
                    ? 'bg-[#37D6E6]/20 text-[#37D6E6] border border-[#37D6E6]/40 font-semibold'
                    : 'bg-[#9079F7]/20 text-[#9079F7] border border-[#9079F7]/40 font-semibold'
                  : 'text-[#A7B5C9] hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* User Role Badge */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#37D6E6] to-[#9079F7] p-0.5">
            <div className="w-full h-full rounded-full bg-[#101827] flex items-center justify-center text-[11px] font-bold text-white">
              ER
            </div>
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-[#F4F7FB] flex items-center gap-1">
              <span>Dr. E. Reed</span>
              <CheckCircle2 className="w-3 h-3 text-[#32C8B7]" />
            </div>
            <div className="text-[10px] text-[#A7B5C9] capitalize font-mono">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
