import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  logoOverride?: string;
}

export const BrandMarkGlyph: React.FC<{
  logoUrl?: string;
  className?: string;
  storeName?: string;
}> = ({ logoUrl, className = 'w-7 h-7', storeName = 'varniks_atelier' }) => {
  if (logoUrl) {
    return (
      <span
        className={`${className} rounded-full overflow-hidden border border-[#C9A66B]/60 bg-[#FFF9F5] shrink-0 flex items-center justify-center shadow-xs`}
      >
        <img
          src={logoUrl}
          alt={storeName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-200 group-hover:-rotate-6`}
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="16.5" stroke="#E7C7CC" strokeWidth="1.25" fill="#FFF9F5" />
      <path
        d="M18 25.4C18 25.4 11.4 21.1 11.4 15.8C11.4 13.7 13 12.1 15 12.1C16.3 12.1 17.4 12.8 18 13.8C18.6 12.8 19.7 12.1 21 12.1C23 12.1 24.6 13.7 24.6 15.8C24.6 21.1 18 25.4 18 25.4Z"
        stroke="#6D1836"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="#E7C7CC"
        fillOpacity="0.35"
      />
      <path
        d="M23.5 10.5C24.4 9.5 25.9 9.5 26.8 10.4"
        stroke="#C9A66B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="25.8" cy="12.2" r="1.1" fill="#C9A66B" />
      <path
        d="M9.6 25.5C12.3 25.5 14.5 26.8 16.5 26.3"
        stroke="#C9A66B"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  size = 'md',
  className = '',
  logoOverride,
}) => {
  const { storeSettings } = useStore();
  const activeLogo = logoOverride !== undefined ? logoOverride : storeSettings.logoUrl;
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7';
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-[1.35rem]';

  const content = (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group ${className}`}>
      <BrandMarkGlyph
        logoUrl={activeLogo}
        className={iconSize}
        storeName={storeSettings.storeName}
      />
      <span className="relative inline-flex flex-col leading-none">
        <span
          className={`font-display font-semibold tracking-tight text-[#3E2F27] ${textSize}`}
        >
          {storeSettings.storeName || 'varniks_atelier'}
        </span>
      </span>
    </span>
  );

  if (!to) return content;

  return (
    <Link
      to={to}
      className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6D1836] rounded-sm"
      aria-label={`${storeSettings.storeName || 'varniks_atelier'} home`}
    >
      {content}
    </Link>
  );
};
