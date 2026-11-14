import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-[1.35rem]';

  const content = (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group ${className}`}>
      {/* Custom artist pencil nib + botanical leaf mark */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSize} text-[#C86D51] shrink-0 transition-transform duration-200 group-hover:-rotate-6`}
        aria-hidden="true"
      >
        <circle cx="18" cy="18" r="16.5" stroke="#EAE3D5" strokeWidth="1.2" fill="#FAF7F2" />
        {/* Drawing nib / pencil */}
        <path
          d="M11.5 24.5L13.8 18.2L22.6 9.4C23.5 8.5 25 8.5 25.9 9.4L26.6 10.1C27.5 11 27.5 12.5 26.6 13.4L17.8 22.2L11.5 24.5Z"
          stroke="#2B2623"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M20.8 11.2L24.8 15.2" stroke="#C86D51" strokeWidth="1.5" strokeLinecap="round" />
        {/* Delicate botanical sprig */}
        <path
          d="M9.5 26.5C12.2 26.5 14.5 27.8 16.5 27.2"
          stroke="#7A9178"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M10.5 16.5C9 14.2 9.5 11.4 11.8 10.2C12.8 12.5 12.2 14.8 10.5 16.5Z"
          stroke="#7A9178"
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative inline-flex flex-col leading-none">
        <span
          className={`font-display font-semibold tracking-tight text-[#2B2623] ${textSize}`}
        >
          varniks_atelier
        </span>
      </span>
    </span>
  );

  if (!to) return content;

  return (
    <Link
      to={to}
      className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C86D51] rounded-sm"
      aria-label="varniks_atelier home"
    >
      {content}
    </Link>
  );
};
