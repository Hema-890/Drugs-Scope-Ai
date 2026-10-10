import React from 'react';
import { BrandLogo } from './BrandLogo';
import { DatasetMode, UserProfile } from '../../types';
import {
  Bell,
  Bookmark,
  Command,
  LogOut,
  Mic,
  Search,
  Sparkles,
  User,
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../services/medicalTranslationEngine';

interface NavbarProps {
  mode: DatasetMode;
  onModeChange: (mode: DatasetMode) => void;
  user: UserProfile;
  isAuthenticated?: boolean;
  onOpenCommandPalette: () => void;
  onOpenVoiceModal: () => void;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
  activeModule: string;
  onNavigate: (moduleId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  user,
  isAuthenticated = false,
  onOpenCommandPalette,
  onOpenVoiceModal,
  onOpenAuthModal,
  onSignOut,
  activeModule,
  onNavigate
}) => {
  const isLanding = activeModule === 'landing';
  const displayName = user?.name || (isAuthenticated ? 'Researcher' : 'Guest Clinical Reviewer');
  const displayRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Investigator';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DR';

  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) as SupportedLanguage) || 'en';

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    i18n.changeLanguage(langCode);
  };

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

      {/* Center Navigation Links */}
      {isLanding || activeModule === 'molecular-lab' ? (
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide">
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
            onClick={() => onNavigate('analyze')}
            className={`py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
              (activeModule as string) === 'analyze' ? 'text-[#24D8ED] font-semibold' : 'text-[#A6B5CB] hover:text-[#24D8ED]'
            }`}
          >
            <span>Analyze Medicines</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#24D8ED]/15 text-[#24D8ED] border border-[#24D8ED]/30">
              Core
            </span>
          </button>
          <button
            onClick={() => onNavigate('interaction-review')}
            className={`py-1 transition-colors cursor-pointer ${
              (activeModule as string) === 'interaction-review' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Interaction Review
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
            onClick={() => onNavigate('literature-intel')}
            className={`py-1 transition-colors cursor-pointer ${
              (activeModule as string) === 'literature-intel' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Literature Intel
          </button>
          <button
            onClick={() => onNavigate('report-studio')}
            className={`py-1 transition-colors cursor-pointer ${
              (activeModule as string) === 'report-studio' ? 'text-white font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            Reports
          </button>
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
      <div className="flex items-center gap-3">
        {/* Quick Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111C2E]/60 border border-white/10 text-xs text-[#71839E] hover:text-white transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#71839E]" />
          <span>Search drugs, targets...</span>
          <kbd className="font-mono text-[9px] bg-white/10 px-1 py-0.2 rounded text-white/60">⌘K</kbd>
        </button>

        {/* Voice Search */}
        <button
          onClick={onOpenVoiceModal}
          title="Voice Search"
          className="p-2 rounded-lg text-[#A6B5CB] hover:text-[#24D8ED] hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Mic className="w-4 h-4" />
        </button>

        {!isLanding && (
          <>
            <button
              onClick={() => onNavigate('collaboration')}
              title="Saved Research"
              className="p-2 rounded-lg text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
          </>
        )}

        {/* Trilingual Language Selector (English, Telugu, Hindi) */}
        <div className="flex items-center bg-[#101827]/90 border border-white/10 rounded-xl p-1 gap-1">
          <Globe className="w-3.5 h-3.5 text-[#37D6E6] ml-1.5 hidden sm:block shrink-0" />
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#24D8ED] to-[#9475FF] text-[#070B14] font-bold shadow-sm'
                    : 'text-[#A6B5CB] hover:text-white hover:bg-white/5'
                }`}
                title={`Switch to ${lang.name} (${lang.nativeName})`}
              >
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>

        {/* Live Authentication Controls */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#24D8ED] to-[#9475FF] p-[1.5px] cursor-pointer">
                <div className="w-full h-full rounded-full bg-[#111C2E] flex items-center justify-center text-xs font-bold text-white tracking-wider">
                  <span>{initials}</span>
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-white leading-tight max-w-[140px] truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-[#24D8ED] font-mono leading-tight">
                  {displayRole}
                </div>
              </div>
            </div>

            <button
              onClick={onSignOut}
              title="Sign Out of Session"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-xs text-[#A6B5CB] hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <button
              onClick={onOpenAuthModal}
              className="text-xs font-semibold text-[#A6B5CB] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => onNavigate('analyze')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_15px_rgba(36,216,237,0.4)] cursor-pointer"
            >
              Analyze Medicines
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
