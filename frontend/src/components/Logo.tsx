import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Abstract Wave / Leaf Energy Symbol */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-tr from-vybe-navy to-vybe-teal p-0.5 shadow-md flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-vybe-navy opacity-40"></div>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 relative z-10 text-vybe-mint"
        >
          {/* Flowing Rhythm Wave */}
          <path
            d="M4 16C8 16 9 8 13 8C17 8 18 24 22 24C26 24 27 16 29 16"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gentle Leaf/Wellness Accent */}
          <circle cx="22" cy="11" r="2.5" fill="#2DD4BF" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-vybe-navy ${textSizes[size]}`}>
            VYBE
          </span>
          <span className={`font-bold tracking-wider text-vybe-teal text-xs px-1.5 py-0.5 bg-vybe-mint/60 rounded-md`}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-vybe-slate tracking-tight font-medium">
            Your Work. Your Wellness. Your Rhythm.
          </span>
        )}
      </div>
    </div>
  );
};
