import React from 'react';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ 
  className = 'w-12 h-12',
  showText = true 
}) => {
  return (
    <div className="flex items-center gap-3">
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" className="fill-primary/10" />
        <path
          d="M65 35H35C32.2386 35 30 37.2386 30 40V60C30 62.7614 32.2386 65 35 65H65C67.7614 65 70 62.7614 70 60V40C70 37.2386 67.7614 35 65 35Z"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 55C53.3137 55 56 52.3137 56 49C56 45.6863 53.3137 43 50 43C46.6863 43 44 45.6863 44 49C44 52.3137 46.6863 55 50 55Z"
          className="fill-primary"
        />
        <path
          d="M35 35L50 25L65 35"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
          Make Money Move
        </span>
      )}
    </div>
  );
};
