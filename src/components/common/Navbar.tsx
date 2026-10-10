import React from 'react';
import { BrandLogo } from './BrandLogo';
import { DatasetMode, UserProfile } from '../../types';
import {
  Bell,
  Bookmark,
  Command,
  Mic,
  Search,
  Sparkles,
  User
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
  const isLanding = activeModule === 'landing';

  return (
    <header className="sticky top-0 z-40 w-full h-[68px] bg-[#070B14]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Brand Wordmark & Logo */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="focus:outline-none cursor-pointer hover:opacity-95 transition-opacity"
        >
          <BrandLogo size="md" />
        </button>
      </div>

      {/* Center Navigation Links (Matching Image 1 & 3) */}
      {isLanding || activeModule === 'molecular-lab' ? (
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onNavigate('landing')}
            className={`relative py-1 transition-colors cursor-pointer ${
              activeModule === 'landing' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Home
            {activeModule === 'landing' && (
              <span className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#24D8ED] shadow-[0_0_8px_#24D8ED]" />
            )}
          </button>
          <button
            onClick={() => onNavigate('medicine-explorer')}
            className={`py-1 transition-colors cursor-pointer ${
              (activeModule as string) === 'medicine-explorer' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Drug Intelligence
          </button>
          <button
            onClick={() => onNavigate('interaction-review')}
            className={`py-1 transition-colors cursor-pointer ${
              (activeModule as string) === 'interaction-review' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Interaction Analysis
          </button>
          <button
            onClick={() => onNavigate('molecular-lab')}
            className={`relative py-1 transition-colors cursor-pointer ${
              activeModule === 'molecular-lab' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            3D Molecular Lab
            {activeModule === 'molecular-lab' && (
              <span className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#24D8ED] shadow-[0_0_8px_#24D8ED]" />
            )}
          </button>
          <button
            onClick={() => onNavigate('command-center')}
            className={`py-1 transition-colors cursor-pointer ${
              (activeModule as string) === 'command-center' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Research Hub
          </button>
          <span className="py-1 text-[#71839E] cursor-not-allowed">
            Pricing
          </span>
        </nav>
      ) : (
        /* Workspace Wide Global Search Bar (Matching Image 2) */
        <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-4 py-2 rounded-full bg-[#111C2E]/80 border border-white/10 hover:border-[#24D8ED]/40 text-xs text-[#71839E] hover:text-[#A6B5CB] transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-[#71839E] group-hover:text-[#24D8ED] transition-colors" />
              <span className="truncate">
                Search drugs, targets, diseases, pathways, or ask a research question...
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="font-mono text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-[#A6B5CB] border border-white/5">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {isLanding || activeModule === 'molecular-lab' ? (
          /* Public Header Actions (Matching Reference Images 1 & 3) */
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111C2E]/60 border border-white/10 text-xs text-[#71839E] hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-[#71839E]" />
              <span>Search drugs, targets...</span>
              <kbd className="font-mono text-[9px] bg-white/10 px-1 py-0.2 rounded text-white/60">⌘K</kbd>
            </button>

            <button
              onClick={onOpenVoiceModal}
              title="Voice Search"
              className="p-2 rounded-full text-[#A6B5CB] hover:text-[#24D8ED] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('command-center')}
              className="text-xs font-semibold text-[#A6B5CB] hover:text-white transition-colors px-3 py-1.5 cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => onNavigate('command-center')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_15px_rgba(36,216,237,0.4)] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        ) : (
          /* Workspace Controls */
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenVoiceModal}
              title="Voice Search"
              className="p-2 rounded-lg text-[#A6B5CB] hover:text-[#24D8ED] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('collaboration')}
              title="Saved Research"
              className="p-2 rounded-lg text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('pharmacovigilance')}
              title="Notifications"
              className="p-2 rounded-lg text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#24D8ED] ring-2 ring-[#070B14]" />
            </button>

            {/* Profile Avatar (Dr. Sarah Chen, Principal Investigator) */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#24D8ED] to-[#9475FF] p-[1.5px] cursor-pointer">
                <div className="w-full h-full rounded-full bg-[#111C2E] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1594824813583-0570a256df29?w=100&auto=format&fit=crop&q=80"
                    alt="Dr. Sarah Chen"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span>SC</span>
                </div>
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">Dr. Sarah Chen</div>
                <div className="text-[10px] text-[#71839E] font-medium">Principal Investigator</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
