import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Interconnected Molecular Hexagon Icon matching References */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(36,216,237,0.6)]"
        >
          {/* Hexagonal bond network */}
          <polygon
            points="20,4 34,12 34,28 20,36 6,28 6,12"
            stroke="url(#logo_grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Internal connectivity lines */}
          <line x1="20" y1="4" x2="20" y2="20" stroke="#24D8ED" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="34" y1="28" x2="20" y2="20" stroke="#9475FF" strokeWidth="2" strokeOpacity="0.7" />
          <line x1="6" y1="28" x2="20" y2="20" stroke="#31CAB6" strokeWidth="2" strokeOpacity="0.7" />

          {/* Atomic vertices */}
          <circle cx="20" cy="4" r="3" fill="#24D8ED" />
          <circle cx="34" cy="12" r="3" fill="#9475FF" />
          <circle cx="34" cy="28" r="3" fill="#31CAB6" />
          <circle cx="20" cy="36" r="3" fill="#24D8ED" />
          <circle cx="6" cy="28" r="3" fill="#9475FF" />
          <circle cx="6" cy="12" r="3" fill="#31CAB6" />
          <circle cx="20" cy="20" r="3.5" fill="#FFFFFF" />

          <defs>
            <linearGradient id="logo_grad" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#24D8ED" />
              <stop offset="0.5" stopColor="#9475FF" />
              <stop offset="1" stopColor="#31CAB6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`font-display font-bold text-white ${textSizes[size]}`}>
            Drug Scope
          </span>
          <span className={`font-display font-bold text-[#24D8ED] ml-1.5 ${textSizes[size]}`}>
            AI
          </span>
        </div>
      )}
    </div>
  );
};
