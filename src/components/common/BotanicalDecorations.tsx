import React from 'react';

export const BotanicalSprig: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`pointer-events-none select-none ${className}`}
  >
    <path
      d="M60 132C58 104 60 66 64 14"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    />
    <path
      d="M61 98C46 92 31 82 22 68C37 68 51 78 61 92"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M61 72C76 66 90 56 98 42C84 42 70 52 61 66"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M62 46C50 40 39 30 33 18C45 20 55 30 62 42"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M64 14C69 8 75 5 81 4C77 12 72 18 64 21"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SketchUnderline: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 220 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`pointer-events-none select-none ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M3 10.5C48 4.2 132 3.1 217 8.4"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M18 13.5C72 9.4 146 9.1 202 12.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

export const OrganicDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-4 my-2 ${className}`} aria-hidden="true">
    <span className="h-px flex-1 bg-[#E7C7CC]" />
    <svg
      width="32"
      height="16"
      viewBox="0 0 32 16"
      fill="none"
      className="text-[#C9A66B] shrink-0"
    >
      <path
        d="M2 8C7 8 11 4 16 8C21 12 25 8 30 8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M16 8C14 4.5 16 2 18.5 1.5C19 4.5 17.8 6.8 16 8Z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </svg>
    <span className="h-px flex-1 bg-[#E7C7CC]" />
  </div>
);

export const SketchArrow: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 72 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`pointer-events-none select-none ${className}`}
  >
    <path
      d="M3 13C19 8 44 8 64 12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeDasharray="4 4"
      strokeLinecap="round"
    />
    <path
      d="M57 6.5L66 12.2L56.5 17.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
